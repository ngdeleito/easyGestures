/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

/* global window, browser, document, alert, FileReader, Blob, URL, confirm */

import { eGUtils } from "../background/eGUtils.js";
import { eGPrefs } from "../background/eGPrefs.js";
import { eGActions } from "../background/eGActions.js";

let prefChanged = false;

window.addEventListener("load", optionsLoadHandler);
window.addEventListener("hashchange", optionsHashChangeHandler);
window.addEventListener("unload", optionsUnloadHandler);

let eventListenersArray = [
  ["displayTipsButton", "click", displayTips],
  ["importPrefsFilePicker", "change", importPrefs],
  ["importPrefsButton", "click", triggerImportPrefsFilePicker],
  ["exportPrefsButton", "click", exportPrefs],
  ["resetPrefsButton", "click", resetPrefs],
  ["showButtonInput", "mousedown", updateTextInputElement],
  ["showButtonInput", "contextmenu", preventDefault],
  ["showAltButtonInput", "mousedown", updateTextInputElement],
  ["showAltButtonInput", "contextmenu", preventDefault],
  ["classicTheme", "change", setTheme],
  ["darkTheme", "change", setTheme],
  ["standardMenuType", "change", setMenuType],
  ["largeMenuType", "change", setMenuType],
  ["activateTooltips", "change", setDisabledStatusForTooltipsActivationDelay],
  ["activateOpenLinksThroughPieMenuCenter", "change",
    setDisabledStatusForOpenLinksMaximumDelay],
  ["resetMenusButton", "click", resetMenus],
  ["enableMainAlt1Menu", "change", setDisabledStatusForMainAlt1Menu],
  ["enableMainAlt2Menu", "change", setDisabledStatusForMainAlt2Menu],
  ["enableExtraAlt1Menu", "change", setDisabledStatusForExtraAlt1Menu],
  ["enableExtraAlt2Menu", "change", setDisabledStatusForExtraAlt2Menu],
  ["resetUsageButton", "click", resetUsage]
];

let optionalPermissions = {
  "<all_urls>": "origins",
  "bookmarks": "permissions",
  "browserSettings": "permissions",
  "clipboardRead": "permissions",
  "clipboardWrite": "permissions",
  "downloads": "permissions",
  "find": "permissions",
  "sessions": "permissions",
  "tabs": "permissions"
};

function displayTips() {
  eGUtils.showOrOpenTab("/tips/tips.html", "");
}

function preventDefault(anEvent) {
  anEvent.preventDefault();
}

function handleStorageChange(changes) {
  for (let change in changes) {
    let prefix = change.split(".")[0];
    if (prefix === "usage") {
      loadUsageData();
    }
    else if (prefix !== "general" || change === "general.startupTips") {
      if (!prefChanged) {
        // a preference has been updated in another tab, so we update the
        // corresponding preference control
        let prefControl = document.querySelector(`[data-preference="${change}"]`);
        initializePreferenceControl(prefControl);
        setPreferenceControlsDisabledStatus();
      }
      prefChanged = false;
    }
  }
}

function addEventListeners() {
  eventListenersArray.forEach(listener => {
    document.getElementById(listener[0])
            .addEventListener(listener[1], listener[2]);
  });
}

function removeEventListeners() {
  eventListenersArray.forEach(listener => {
    document.getElementById(listener[0])
            .removeEventListener(listener[1], listener[2]);
  });
}

function getPermissionsObjectFor(permission) {
  let permissionsObject = {};
  permissionsObject[optionalPermissions[permission]] = [permission];
  return permissionsObject;
}

function requestPermission(anEvent) {
  prefChanged = true;
  browser.permissions.request(getPermissionsObjectFor(anEvent.target.value))
                     .then(hasBeenGranted => {
    anEvent.target.disabled = hasBeenGranted;
    anEvent.target.nextElementSibling.disabled = !hasBeenGranted;
  });
}

function removePermission(anEvent) {
  prefChanged = true;
  browser.permissions.remove(getPermissionsObjectFor(anEvent.target.value))
                     .then(hasBeenRemoved => {
    anEvent.target.disabled = hasBeenRemoved;
    anEvent.target.previousElementSibling.disabled = !hasBeenRemoved;
  });
}

function handlePermissionChange(aPermissionsObject, isPermissionAdded) {
  function updatePermission(permission, isPermissionAdded) {
    let permissionElement = document.getElementById(`optionalPermissions:${permission}`);
    let requestButton = permissionElement.lastElementChild.firstElementChild;
    requestButton.disabled = isPermissionAdded;
    let removeButton = permissionElement.lastElementChild.lastElementChild;
    removeButton.disabled = !isPermissionAdded;
  }
  
  if (!prefChanged) {
    aPermissionsObject.permissions.forEach(permission => {
      updatePermission(permission, isPermissionAdded);
    });
    aPermissionsObject.origins.forEach(permission => {
      updatePermission(permission, isPermissionAdded);
    });
  }
  prefChanged = false;
}

function handlePermissionAdded(aPermissionsObject) {
  handlePermissionChange(aPermissionsObject, true);
}

function handlePermissionRemoved(aPermissionsObject) {
  handlePermissionChange(aPermissionsObject, false);
}

function createOptionalPermissionControls() {
  browser.permissions.getAll().then(aPermissionsObject => {
    Object.entries(optionalPermissions).forEach(([permission, type]) => {
      let isPermissionGranted = aPermissionsObject[type].includes(permission);
      let permissionElement = document.getElementById(`optionalPermissions:${permission}`);
      
      let div = document.createElement("div");
      permissionElement.appendChild(div);
      
      let requestButton = document.createElement("button");
      requestButton.type = "button";
      requestButton.disabled = isPermissionGranted;
      requestButton.setAttribute("value", permission);
      requestButton.textContent = browser.i18n.getMessage("general.optionalPermissions.request");
      requestButton.addEventListener("click", requestPermission);
      div.appendChild(requestButton);
      
      div.appendChild(document.createTextNode("\n"));
      
      let removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.disabled = !isPermissionGranted;
      removeButton.setAttribute("value", permission);
      removeButton.textContent = browser.i18n.getMessage("general.optionalPermissions.remove");
      removeButton.addEventListener("click", removePermission);
      div.appendChild(removeButton);
    });
  });
  browser.permissions.onAdded.addListener(handlePermissionAdded);
  browser.permissions.onRemoved.addListener(handlePermissionRemoved);
}

function removeOptionalPermissionEventListeners() {
  Object.keys(optionalPermissions).forEach(permission => {
    let permissionElement = document.getElementById(`optionalPermissions:${permission}`);
    let div = permissionElement.lastElementChild;
    div.firstElementChild.removeEventListener("click", requestPermission);
    div.lastElementChild.removeEventListener("click", removePermission);
  });
  browser.permissions.onAdded.removeListener(handlePermissionAdded);
  browser.permissions.onRemoved.removeListener(handlePermissionRemoved);
}

function createActionsSelect(sectorNumber, isExtraMenu) {
  let div = document.createElement("div");
  let select = document.createElement("select");
  let currentOptgroup = document.createElement("optgroup");
  div.appendChild(select);
  select.appendChild(currentOptgroup);
  
  let currentAction = "empty"; // the EmptyAction is the first action
  while (currentAction !== null) {
    if (eGActions[currentAction].startsNewGroup) {
      currentOptgroup = document.createElement("optgroup");
      select.appendChild(currentOptgroup);
    }
    
    let option = document.createElement("option");
    option.setAttribute("value", currentAction);
    option.setAttribute("label", eGActions[currentAction].getLocalizedActionName());
    currentOptgroup.appendChild(option);
    
    currentAction = eGActions[currentAction].nextAction;
  }
  
  if (sectorNumber !== 2 || isExtraMenu) {
    // remove showExtraMenu action
    select.removeChild(select.childNodes[1]);
  }
  
  return div;
}

function createMenuControl(menuName, isExtraMenu) {
  let menuControlElement = document.getElementById(`menuControl_${menuName}`);
  menuControlElement.className = "menu";
  menuControlElement.classList.toggle("extra", isExtraMenu);
  eGPrefs.isLargeMenuOn().then(prefValue => {
    menuControlElement.classList.toggle("large", prefValue);
  });
  
  let actionElements = document.createElement("div");
  menuControlElement.appendChild(actionElements);
  let selectElements = document.createElement("div");
  menuControlElement.appendChild(selectElements);
  
  let numberOfItems = isExtraMenu ? 5 : 10;
  for (let i = 0; i < numberOfItems; ++i) {
    let action = document.createElement("div");
    action.className = `menuIcon sector${i}`;
    actionElements.appendChild(action);
    
    let select = createActionsSelect(i, isExtraMenu);
    select.className = `menuSelect sector${i}`;
    selectElements.appendChild(select);
  }
}

function createRegularMenuControls() {
  ["main", "mainAlt1", "mainAlt2", "contextLink", "contextImage",
   "contextSelection", "contextTextbox"]
    .forEach(menuName => createMenuControl(menuName, false));
}

function createExtraMenuControls() {
  ["extra", "extraAlt1", "extraAlt2"]
    .forEach(menuName => createMenuControl(menuName, true));
}

function createHeaderForAction(actionName) {
  let h1 = document.createElement("h1");
  
  let span = document.createElement("span");
  span.className = `actionIcon ${actionName}`;
  h1.appendChild(span);
  
  span = document.createElement("span");
  span.textContent = browser.i18n.getMessage(actionName);
  h1.appendChild(span);
  
  return h1;
}

function createTooltipRowForAction(actionName) {
  let tr = document.createElement("tr");
  
  let th = document.createElement("th");
  th.textContent = browser.i18n.getMessage("customizations.tooltip");
  tr.appendChild(th);
  
  let td = document.createElement("td");
  let input = document.createElement("input");
  input.id = `${actionName}_tooltip`;
  input.type = "text";
  input.size = 20;
  input.maxLength = 20;
  td.appendChild(input);
  tr.appendChild(td);
  
  return tr;
}

function createLoadURLActions() {
  for (let i=1; i <= 10; ++i) {
    let actionName = `loadURL${i}`;
    let container = document.getElementById(actionName);
    container.parentElement.insertBefore(createHeaderForAction(actionName),
                                         container);
    
    let table = document.createElement("table");
    table.appendChild(createTooltipRowForAction(actionName));
    
    let tr = document.createElement("tr");
    let th = document.createElement("th");
    th.textContent = browser.i18n.getMessage("customizations.URL");
    tr.appendChild(th);
    let td = document.createElement("td");
    let input = document.createElement("input");
    input.id = `${actionName}_URL`;
    input.type = "url";
    input.size = "50";
    td.appendChild(input);
    tr.appendChild(td);
    table.appendChild(tr);
    
    tr = document.createElement("tr");
    tr.appendChild(document.createElement("th"));
    td = document.createElement("td");
    input = document.createElement("input");
    input.id = `${actionName}_openInPrivateWindowCheckbox`;
    input.type = "checkbox";
    td.appendChild(input);
    let label = document.createElement("label");
    label.htmlFor = input.id;
    label.textContent =
      browser.i18n.getMessage("customizations.openInPrivateWindow");
    td.appendChild(label);
    tr.appendChild(td);
    table.appendChild(tr);
    
    container.appendChild(table);
  }
}

function createRunScriptActions() {
  for (let i=1; i <= 10; ++i) {
    let actionName = `runScript${i}`;
    let container = document.getElementById(actionName);
    container.parentElement.insertBefore(createHeaderForAction(actionName),
                                         container);
    
    let table = document.createElement("table");
    table.appendChild(createTooltipRowForAction(actionName));
    
    let tr = document.createElement("tr");
    let th = document.createElement("th");
    th.textContent = browser.i18n.getMessage("customizations.code");
    tr.appendChild(th);
    let td = document.createElement("td");
    let input = document.createElement("textarea");
    input.id = `${actionName}_code`;
    input.cols = "50";
    input.rows = "7";
    td.appendChild(input);
    tr.appendChild(td);
    table.appendChild(tr);
    
    container.appendChild(table);
  }
}

function initializePaneAndTabs(hash) {
  function selectTab(hash) {
    document.getElementById(`${hash}_label`).className = "selectedTabLabel";
    document.getElementById(hash).classList.add("selected");
  }
  
  function selectSubtabs(anElement) {
    let container = anElement;
    let finished = false;
    while (!finished) {
      let tabboxes = container.getElementsByClassName("tabbox");
      if (tabboxes.length > 0) {
        let tabbox = tabboxes[0];
        if (tabbox.getElementsByClassName("selectedTabLabel").length === 0) {
          selectTab(tabbox.firstElementChild.hash.substr(1));
        }
        container =
          document.getElementById(tabbox.firstElementChild.hash.substr(1));
      }
      else {
        finished = true;
      }
    }
  }
  
  document.location.hash = hash === "" ? "#general" : hash;
  
  let locationHash = document.location.hash.substr(1);
  let locationHashArray = locationHash.split("_");
  document.getElementById(`${locationHashArray[0]}_label`).className =
    "selectedPaneLabel";
  let selectedPane = document.getElementById(locationHashArray[0]);
  selectedPane.classList.add("selected");
  
  switch (locationHashArray.length) {
    case 1:
      selectSubtabs(selectedPane);
      break;
    case 2:
      selectTab(locationHash);
      selectSubtabs(document.getElementById(locationHash));
      break;
    case 3:
      selectTab(`${locationHashArray[0]}_${locationHashArray[1]}`);
      selectTab(locationHash);
      break;
  }
}

function setDisabledStatusForSelectWithTextInputControl(control) {
  let aSelectElement = control.firstElementChild;
  let aLabelElement = aSelectElement.nextElementSibling;
  let aTextInputElement = aLabelElement.nextElementSibling;
  let shouldBeDisabled = aSelectElement.selectedIndex < 3;
  aLabelElement.classList.toggle("disabled", shouldBeDisabled);
  aTextInputElement.disabled = shouldBeDisabled;
}

function initializePreferenceControl(control) {
  function initializeSelectWithTextInputControl(control) {
    eGPrefs.getPref(control.dataset.preference).then(prefValue => {
      let aSelectElement = control.firstElementChild;
      let aTextInputElement = control.lastElementChild;
      aSelectElement.selectedIndex = prefValue < 3 ? prefValue : 3;
      aTextInputElement.value = prefValue;
      setDisabledStatusForSelectWithTextInputControl(control);
    });
  }
  
  function initializeIntRadiogroupWithResetOnDuplicatedKeysControl(control) {
    eGPrefs.getPref(control.dataset.preference).then(prefValue => {
      control.querySelector(`input[value="${prefValue}"]`).checked = true;
    });
  }
  
  function initializeBoolRadiogroupControl(control) {
    eGPrefs.getPref(control.dataset.preference).then(prefValue => {
      let childIndexToSet = prefValue ? 1 : 0;
      control.getElementsByTagName("input")[childIndexToSet].checked = true;
    });
  }
  
  function initializeMenuControl(control) {
    eGPrefs.getPref(control.dataset.preference).then(prefValue => {
      prefValue.forEach((value, index) => {
        control.firstElementChild.childNodes[index].dataset.action = value;
        control.lastElementChild.childNodes[index]
               .querySelector(`[value=${value}]`).selected = true;
      });
    });
  }
  
  function initializeSelectControl(control) {
    eGPrefs.getPref(control.dataset.preference).then(prefValue => {
      control.querySelector(`[value=${prefValue}]`).selected = true;
    });
  }
  
  function initializeLoadURLPreference(actionName) {
    eGPrefs.getLoadURLOrRunScriptPrefValue(actionName).then(prefValue => {
      document.getElementById(`${actionName}_tooltip`).value = prefValue[0];
      document.getElementById(`${actionName}_URL`).value = prefValue[1];
      document.getElementById(`${actionName}_openInPrivateWindowCheckbox`)
              .checked = prefValue[2];
    });
  }
  
  function initializeRunScriptPreference(actionName) {
    eGPrefs.getLoadURLOrRunScriptPrefValue(actionName).then(prefValue => {
      document.getElementById(`${actionName}_tooltip`).value = prefValue[0];
      document.getElementById(`${actionName}_code`).value = prefValue[1];
    });
  }
  
  function initializeStringRadiogroup(control) {
    eGPrefs.getPref(control.dataset.preference).then(prefValue => {
      control.querySelector(`[value=${prefValue}]`).checked = true;
    });
  }
  
  function initializeDailyReadingsControl(control) {
    // we first check that the "bookmarks" permission is granted
    if (browser.bookmarks !== undefined) {
      browser.bookmarks.getTree().then(bookmarkItems => {
        function collectFolders(item) {
          if (item.url !== undefined) {
            return [];
          }
          else {
            let result = [item.title];
            if (item.children !== undefined) {
              for (let subitem of item.children) {
                result = result.concat(collectFolders(subitem));
              }
            }
            return result;
          }
        }
        
        collectFolders(bookmarkItems[0]).forEach(bookmarkFolder => {
          let option = document.createElement("option");
          option.value = bookmarkFolder;
          document.getElementById("bookmarkFolders").appendChild(option);
        });
      });
    }
    eGPrefs.getDailyReadingsFolderName().then(prefValue => {
      control.value = prefValue;
    });
  }
  
  switch (control.dataset.preferenceType) {
    case "checkboxInput":
      eGPrefs.getPref(control.dataset.preference).then(prefValue => {
        control.checked = prefValue;
      });
      break;
    case "selectWithTextInput":
      initializeSelectWithTextInputControl(control);
      break;
    case "intRadiogroupWithResetOnDuplicatedKeys":
      initializeIntRadiogroupWithResetOnDuplicatedKeysControl(control);
      break;
    case "boolRadiogroup":
      initializeBoolRadiogroupControl(control);
      break;
    case "numberInput":
      eGPrefs.getPref(control.dataset.preference).then(prefValue => {
        control.value = prefValue;
      });
      break;
    case "menu":
      initializeMenuControl(control);
      break;
    case "select":
      initializeSelectControl(control);
      break;
    case "loadURL":
      initializeLoadURLPreference(control.id);
      break;
    case "runScript":
      initializeRunScriptPreference(control.id);
      break;
    case "stringRadiogroup":
      initializeStringRadiogroup(control);
      break;
    case "dailyReadingsInput":
      initializeDailyReadingsControl(control);
      break;
  }
}

function preparePreferenceValueForLoadURL(actionName) {
  return [document.getElementById(`${actionName}_tooltip`).value,
          document.getElementById(`${actionName}_URL`).value,
          document.getElementById(`${actionName}_openInPrivateWindowCheckbox`)
                  .checked];
}

function addEventListenerToLoadURLComponent(aPrefName, element, actionName) {
  element.addEventListener("change", () => {
    prefChanged = true;
    eGPrefs.setPref(aPrefName, preparePreferenceValueForLoadURL(actionName));
  }, false);
}

function addEventListenerToLoadURLURL(aPrefName, element, actionName) {
  element.addEventListener("change", () => {
    prefChanged = true;
    eGPrefs.setPref(aPrefName, preparePreferenceValueForLoadURL(actionName));
  }, false);
}

function preparePreferenceValueForRunScript(actionName) {
  return [document.getElementById(`${actionName}_tooltip`).value,
          document.getElementById(`${actionName}_code`).value];
}

function addEventListenerToRunScriptComponent(aPrefName, element, actionName) {
  element.addEventListener("change", () => {
    prefChanged = true;
    eGPrefs.setPref(aPrefName, preparePreferenceValueForRunScript(actionName));
  }, false);
}

function addOnchangeListenerToPreferenceControl(control) {
  function addOnchangeListenerToSelectWithTextInputControl(control) {
    let aSelectElement = control.firstElementChild;
    let aLabelElement = aSelectElement.nextElementSibling;
    let aTextInputElement = aLabelElement.nextElementSibling;
    aSelectElement.addEventListener("change", () => {
      setDisabledStatusForSelectWithTextInputControl(control);
      
      if (aSelectElement.selectedIndex < 3) {
        aTextInputElement.value = aSelectElement.selectedIndex;
        prefChanged = true;
        eGPrefs.setPref(control.dataset.preference,
                        aSelectElement.selectedIndex);
      }
      else {
        aTextInputElement.focus();
      }
    }, true);
    aTextInputElement.addEventListener("change", anEvent => {
      let prefValue = Number(anEvent.target.value);
      prefChanged = true;
      eGPrefs.setPref(control.dataset.preference, prefValue);
      aSelectElement.selectedIndex = prefValue < 3 ? prefValue : 3;
      setDisabledStatusForSelectWithTextInputControl(control);
    }, true);
  }
  
  function addOnchangeListenerToIntRadiogroupWithResetOnDuplicatedKeysControl(control) {
    function onchangeHandler(anEvent) {
      let showKey = document
            .querySelectorAll("[name='showKeyRadiogroup']:checked")[0].value;
      let preventOpenKey = document
            .querySelectorAll("[name='preventOpenKeyRadiogroup']:checked")[0]
            .value;
      let contextKey = document
            .querySelectorAll("[name='contextualMenuKeyRadiogroup']:checked")[0]
            .value;
      
      if ((showKey !== "0" &&
           (showKey === preventOpenKey || showKey === contextKey)) ||
          (preventOpenKey !== "0" && (preventOpenKey === contextKey))) {
        eGPrefs.getPref(control.dataset.preference).then(currentValue => {
          anEvent.target.parentElement.parentElement
                 .querySelector(`[value="${currentValue}"]`).checked = true;
          alert(browser.i18n.getMessage("activation.duplicateKey"));
        });
      }
      else {
        prefChanged = true;
        eGPrefs.setPref(control.dataset.preference,
                        Number(anEvent.target.value));
      }
    }
    
    let radioElements = control.getElementsByTagName("input");
    for (let i = 0; i < radioElements.length; ++i) {
      radioElements[i].addEventListener("change", onchangeHandler, true);
    }
  }
  
  function addOnchangeListenerToBoolRadiogroupControl(control) {
    function onchangeHandler(anEvent) {
      prefChanged = true;
      eGPrefs.setPref(control.dataset.preference,
                      anEvent.target.value === "true");
    }
    
    let radioElements = control.getElementsByTagName("input");
    for (let i = 0; i < radioElements.length; ++i) {
      radioElements[i].addEventListener("change", onchangeHandler, true);
    }
  }
  
  function addOnchangeListenerToMenuControl(control) {
    function onchangeHandler() {
      let selectElements = control.lastElementChild;
      let prefValueAsArray = [];
      for (let i = 0; i < selectElements.childNodes.length; ++i) {
        let value = selectElements.childNodes[i].firstElementChild.value;
        control.firstElementChild.childNodes[i].dataset.action = value;
        prefValueAsArray.push(value);
      }
      prefChanged = true;
      eGPrefs.setPref(control.dataset.preference, prefValueAsArray);
    }
    
    let selectElements = control.lastElementChild;
    for (let i = 0; i < selectElements.childNodes.length; ++i) {
      selectElements.childNodes[i]
                    .firstElementChild
                    .addEventListener("change", onchangeHandler, true);
    }
  }
  
  function addOnchangeListenerToLoadURLControl(control) {
    addEventListenerToLoadURLComponent(control.dataset.preference,
      document.getElementById(`${control.id}_tooltip`), control.id);
    addEventListenerToLoadURLURL(control.dataset.preference,
      document.getElementById(`${control.id}_URL`), control.id);
    addEventListenerToLoadURLComponent(control.dataset.preference,
      document.getElementById(`${control.id}_openInPrivateWindowCheckbox`),
      control.id);
  }
  
  function addOnchangeListenerToRunScriptControl(control) {
    addEventListenerToRunScriptComponent(control.dataset.preference,
      document.getElementById(`${control.id}_tooltip`), control.id);
    addEventListenerToRunScriptComponent(control.dataset.preference,
      document.getElementById(`${control.id}_code`), control.id);
  }
  
  function addOnchangeListenerToStringRadiogroupControl(control) {
    function onchangeHandler(anEvent) {
      prefChanged = true;
      eGPrefs.setPref(control.dataset.preference, anEvent.target.value);
    }
    
    let radioElements = control.getElementsByTagName("input");
    for (let i = 0; i < radioElements.length; ++i) {
      radioElements[i].addEventListener("change", onchangeHandler, true);
    }
  }
  
  switch (control.dataset.preferenceType) {
    case "checkboxInput":
      control.addEventListener("change", () => {
        prefChanged = true;
        eGPrefs.toggleBoolPref(control.dataset.preference);
      }, true);
      break;
    case "selectWithTextInput":
      addOnchangeListenerToSelectWithTextInputControl(control);
      break;
    case "intRadiogroupWithResetOnDuplicatedKeys":
      addOnchangeListenerToIntRadiogroupWithResetOnDuplicatedKeysControl(control);
      break;
    case "boolRadiogroup":
      addOnchangeListenerToBoolRadiogroupControl(control);
      break;
    case "numberInput":
      control.addEventListener("change", () => {
        prefChanged = true;
        eGPrefs.setPref(control.dataset.preference, Number(control.value));
      }, true);
      break;
    case "menu":
      addOnchangeListenerToMenuControl(control);
      break;
    case "select":
      control.addEventListener("change", () => {
        prefChanged = true;
        eGPrefs.setPref(control.dataset.preference, control.value);
      }, true);
      break;
    case "loadURL":
      addOnchangeListenerToLoadURLControl(control);
      break;
    case "runScript":
      addOnchangeListenerToRunScriptControl(control);
      break;
    case "stringRadiogroup":
      addOnchangeListenerToStringRadiogroupControl(control);
      break;
    case "dailyReadingsInput":
      control.addEventListener("change", () => {
        prefChanged = true;
        eGPrefs.setDailyReadingsFolderName(control.value);
      }, true);
      break;
  }
}

function setTheme(anEvent) {
  eGPrefs.isDarkThemeOn().then(prefValue => {
    let themeIsDark = anEvent === undefined ? prefValue :
                                              JSON.parse(anEvent.target.value);
    document.body.classList.toggle("darkTheme", themeIsDark);
  });
}

function setMenuType(anEvent) {
  eGPrefs.isLargeMenuOn().then(prefValue => {
    let menuTypeIsLarge = anEvent === undefined ?
                            prefValue : JSON.parse(anEvent.target.value);
    ["main", "mainAlt1", "mainAlt2", "extra", "extraAlt1", "extraAlt2",
     "contextLink", "contextImage", "contextSelection", "contextTextbox"]
      .forEach(menuName => {
        document.getElementById(`menuControl_${menuName}`).classList
                .toggle("large", menuTypeIsLarge);
    });
    ["mainMenuLabel", "extraMenuLabel", "primaryMainMenu", "primaryExtraMenu",
     "alt1MainMenu", "alt1ExtraMenu", "alt2MainMenu", "alt2ExtraMenu",
     "allMenusMainMenu", "allMenusExtraMenu"]
      .forEach(id => {
        document.getElementById(id).classList.toggle("large", menuTypeIsLarge);
    });
  });
}

function toggleDisabledStatusOnElementsById(ids, shouldBeDisabled) {
  ids.forEach(id => {
    document.getElementById(id).classList.toggle("disabled", shouldBeDisabled);
  });
  document.getElementById(ids[1]).readOnly = shouldBeDisabled;
}

function setDisabledStatusForTooltipsActivationDelay(anEvent) {
  eGPrefs.areTooltipsOn().then(prefValue => {
    let shouldBeDisabled = anEvent === undefined ? !prefValue :
                                                   !anEvent.target.checked;
    toggleDisabledStatusOnElementsById(["tooltipsActivationDelayLabel",
      "tooltipsActivationDelayInput", "tooltipsActivationDelayUnit"],
      shouldBeDisabled);
  });
}

function setDisabledStatusForOpenLinksMaximumDelay(anEvent) {
  eGPrefs.isHandleLinksOn().then(prefValue => {
    let shouldBeDisabled = anEvent === undefined ? !prefValue :
                                                   !anEvent.target.checked;
    toggleDisabledStatusOnElementsById(["openLinksMaximumDelayLabel",
      "openLinksMaximumDelayInput", "openLinksMaximumDelayUnit",
      "openLinksThroughPieMenuCenterConfiguration"], shouldBeDisabled);
    let radioElements =
          document.getElementById("openLinksThroughPieMenuCenterConfiguration")
                  .getElementsByTagName("input");
    radioElements[0].disabled = shouldBeDisabled;
    radioElements[1].disabled = shouldBeDisabled;
  });
}

function resetMenus() {
  if (confirm(browser.i18n.getMessage("menus.reset.confirm"))) {
    eGPrefs.setDefaultMenus();
  }
}

function setDisabledStatusForMenu(menuName, enabled) {
  let selectElements = document.getElementById(`menuControl_${menuName}`)
                               .lastElementChild;
  for (let i = 0; i < selectElements.childNodes.length; ++i) {
    selectElements.childNodes[i].firstElementChild.disabled = !enabled;
  }
}

function setDisabledStatusForMainAlt1Menu(anEvent) {
  eGPrefs.isMainAlt1MenuEnabled().then(prefValue => {
    let enabled = anEvent === undefined ? prefValue : anEvent.target.checked;
    setDisabledStatusForMenu("mainAlt1", enabled);
  });
}

function setDisabledStatusForMainAlt2Menu(anEvent) {
  eGPrefs.isMainAlt2MenuEnabled().then(prefValue => {
    let enabled = anEvent === undefined ? prefValue : anEvent.target.checked;
    setDisabledStatusForMenu("mainAlt2", enabled);
  });
}

function setDisabledStatusForExtraAlt1Menu(anEvent) {
  eGPrefs.isExtraAlt1MenuEnabled().then(prefValue => {
    let enabled = anEvent === undefined ? prefValue : anEvent.target.checked;
    setDisabledStatusForMenu("extraAlt1", enabled);
  });
}

function setDisabledStatusForExtraAlt2Menu(anEvent) {
  eGPrefs.isExtraAlt2MenuEnabled().then(prefValue => {
    let enabled = anEvent === undefined ? prefValue : anEvent.target.checked;
    setDisabledStatusForMenu("extraAlt2", enabled);
  });
}

function setPreferenceControlsDisabledStatus() {
  setMenuType();
  setDisabledStatusForTooltipsActivationDelay();
  setDisabledStatusForOpenLinksMaximumDelay();
  setDisabledStatusForMainAlt1Menu();
  setDisabledStatusForMainAlt2Menu();
  setDisabledStatusForExtraAlt1Menu();
  setDisabledStatusForExtraAlt2Menu();
}

function loadPreferences() {
  let prefControls = document.querySelectorAll("[data-preference]");
  for (let i=0; i < prefControls.length; ++i) {
    initializePreferenceControl(prefControls[i]);
    addOnchangeListenerToPreferenceControl(prefControls[i]);
  }
  setTheme();
  setPreferenceControlsDisabledStatus();
}

function removeChildNodes(node) {
  while (node.hasChildNodes()) {
    node.removeChild(node.firstChild);
  }
}

function initializeClicksByAction() {
  eGPrefs.getUsageActionsPref().then(usageActions => {
    let totalClicks = 0;
    for (let action in usageActions) {
      totalClicks += usageActions[action];
    }
    totalClicks = totalClicks === 0 ? 1 : totalClicks - usageActions.empty;
    
    let container = document.getElementById("usage_clicksByAction");
    removeChildNodes(container);
    
    // we start at the action that follows the "showExtraMenu" action
    let currentAction = eGActions.showExtraMenu.nextAction;
    while (currentAction !== null) {
      let clicksForAction = usageActions[currentAction];
      let count = Math.round(clicksForAction / totalClicks * 1000) / 10;
      if (count > 1) {
        count = Math.round(count);
      }
      
      let div = document.createElement("div");
      div.setAttribute("title",
                       `${eGActions[currentAction].getLocalizedActionName()}` +
                       `: ${clicksForAction} ` +
                       `${browser.i18n.getMessage("usage.clicks")}`);
      container.appendChild(div);
      
      let span = document.createElement("span");
      span.className = `actionIcon ${currentAction}`;
      div.appendChild(span);
      
      let img = document.createElement("span");
      img.style.width = `${count / 2}px`;
      div.appendChild(img);
      
      span = document.createElement("span");
      span.textContent = clicksForAction > 0 ?
                           (count > 0.1 ? `${count}%` : "<0.1%") : "–";
      div.appendChild(span);
      
      currentAction = eGActions[currentAction].nextAction;
    }
  });
}

function initializeClicksByDirectionForMenuLayouts(usageArray, isExtraMenu) {
  let numberOfActions = isExtraMenu ? 5 : 10;
  let usages = [0, 0, 0, 0];
  
  for (let i = 0; i < numberOfActions; ++i) {
    let usage = usageArray[0 * numberOfActions + i];
    usages[0] += usage;
    usages[3] += usage;
    usage = usageArray[1 * numberOfActions + i];
    usages[1] += usage;
    usages[3] += usage;
    usage = usageArray[2 * numberOfActions + i];
    usages[2] += usage;
    usages[3] += usage;
  }
  
  ["primary", "alt1", "alt2"].forEach((menuPrefix, layoutIndex) => {
    let container = document.getElementById(menuPrefix +
                                            (isExtraMenu ? "Extra" : "Main") +
                                            "Menu");
    removeChildNodes(container);
    container.className = "menu";
    container.classList.toggle("extra", isExtraMenu);
    eGPrefs.isLargeMenuOn().then(prefValue => {
      container.classList.toggle("large", prefValue);
    });
    for (let i = 0; i < numberOfActions; ++i) {
      let usageElement = document.createElement("div");
      usageElement.className = `menuIcon sector${i}`;
      let clicks = usageArray[layoutIndex * numberOfActions + i];
      let totalUsage = usages[layoutIndex] === 0 ? 1 : usages[layoutIndex];
      usageElement.textContent = `${Math.round(clicks * 100 / totalUsage)}%`;
      container.appendChild(usageElement);
    }
    
    let total = document.createElement("div");
    total.className = "total";
    total.textContent = `${Math.round(usages[layoutIndex] * 100 /
                                      (usages[3] === 0 ? 1 : usages[3]))}%`;
    container.appendChild(total);
  });
}

function initializeClicksByDirectionTotals(usageArray, isExtraMenu) {
  let numberOfActions = isExtraMenu ? 5 : 10;
  let usages = [];
  let total = 0;
  for (let i = 0; i < numberOfActions; ++i) {
    let usage = usageArray[0 * numberOfActions + i] +
                usageArray[1 * numberOfActions + i] +
                usageArray[2 * numberOfActions + i];
    usages.push(usage);
    total += usage;
  }
  
  let container = document.getElementById(`allMenus` +
                                          `${isExtraMenu ? "Extra" : "Main"}` +
                                          `Menu`);
  removeChildNodes(container);
  container.className = "menu";
  container.classList.toggle("extra", isExtraMenu);
  eGPrefs.isLargeMenuOn().then(prefValue => {
    container.classList.toggle("large", prefValue);
  });
  for (let i = 0; i < numberOfActions; ++i) {
    let usageElement = document.createElement("div");
    usageElement.className = `menuIcon sector${i}`;
    usageElement.textContent = `${Math.round(usages[i] * 100 /
                                             (total === 0 ? 1 : total))}%`;
    container.appendChild(usageElement);
  }
}

function initializeClicksByDirection() {
  eGPrefs.getUsageMainMenuPref().then(usageMainArray => {
    initializeClicksByDirectionForMenuLayouts(usageMainArray, false);
    initializeClicksByDirectionTotals(usageMainArray, false);
  });
  
  eGPrefs.getUsageExtraMenuPref().then(usageExtraArray => {
    initializeClicksByDirectionForMenuLayouts(usageExtraArray, true);
    initializeClicksByDirectionTotals(usageExtraArray, true);
  });
}

function loadUsageData() {
  eGPrefs.getUsageLastResetPref().then(prefValue => {
    document.getElementById("usageLastReset").textContent = prefValue;
  });
  
  initializeClicksByAction();
  initializeClicksByDirection();
}

function optionsLoadHandler() {
  document.body.style.cursor = "wait";
  browser.storage.local.onChanged.addListener(handleStorageChange);
  addEventListeners();
  
  eGUtils.setDocumentTitle(document, "preferences");
  eGUtils.setDocumentLocalizedStrings(document);
  
  createOptionalPermissionControls();
  createRegularMenuControls();
  createExtraMenuControls();
  createLoadURLActions();
  createRunScriptActions();
  
  initializePaneAndTabs(document.location.hash);
  loadPreferences();
  
  loadUsageData();
  
  window.setTimeout(() => window.scrollTo(0, 0));
  document.body.style.cursor = "auto";
}

function unselectCurrentPane() {
  let selectedPaneLabelElement =
        document.getElementsByClassName("selectedPaneLabel")[0];
  if (selectedPaneLabelElement !== undefined) {
    selectedPaneLabelElement.removeAttribute("class");
    document.getElementById(selectedPaneLabelElement.hash.substr(1))
            .classList.remove("selected");
  }
}

function unselectCurrentTab(oldHash) {
  function unselectTab(aTabLabel) {
    aTabLabel.removeAttribute("class");
    document.getElementById(aTabLabel.hash.substr(1)).classList
            .remove("selected");
  }
  
  function unselectSubTabs(hash) {
    let container = document.getElementById(hash);
    let finished = false;
    while (!finished) {
      let tabboxes = container.getElementsByClassName("tabbox");
      if (tabboxes.length > 0) {
        let tabLabel =
              tabboxes[0].getElementsByClassName("selectedTabLabel")[0];
        unselectTab(tabLabel);
        container = document.getElementById(tabLabel.hash.substr(1));
      }
      else {
        finished = true;
      }
    }
  }
  
  let oldHashArray = oldHash.split("_");
  switch (oldHashArray.length) {
    case 1:
      unselectSubTabs(oldHash);
      break;
    case 2:
      unselectSubTabs(oldHash);
      unselectTab(document.getElementById(`${oldHash}_label`));
      break;
    case 3:
      unselectSubTabs(`${oldHashArray[0]}_${oldHashArray[1]}`);
      unselectTab(document.getElementById(`${oldHashArray[0]}_` +
                                          `${oldHashArray[1]}_label`));
      break;
  }
}

function optionsHashChangeHandler(anEvent) {
  unselectCurrentPane();
  if (anEvent.oldURL.split("#")[1] !== undefined) {
    unselectCurrentTab(anEvent.oldURL.split("#")[1]);
  }
  initializePaneAndTabs(document.location.hash);
  window.scrollTo(0, 0);
}

function optionsUnloadHandler() {
  window.removeEventListener("load", optionsLoadHandler);
  window.removeEventListener("hashchange", optionsHashChangeHandler);
  window.removeEventListener("unload", optionsUnloadHandler);
  
  removeOptionalPermissionEventListeners();
  removeEventListeners();
  browser.storage.local.onChanged.removeListener(handleStorageChange);
}

function importPrefs(anEvent) {
  let fileReader = new FileReader();
  fileReader.onload = anEvent => {
    try {
      eGPrefs.importPrefsFromString(anEvent.target.result).then(result => {
        if (result !== undefined) {
          alert(browser.i18n.getMessage(`general.prefs.import.${result.code}`) +
                ` ${result.prefs}`);
        }
      });
    }
    catch (exception) {
      alert(browser.i18n.getMessage(`general.prefs.import.${exception.code}`));
    }
  };
  fileReader.readAsText(anEvent.target.files[0]);
}

function triggerImportPrefsFilePicker() {
  let filePicker = document.getElementById("importPrefsFilePicker");
  filePicker.showPicker();
}

function exportPrefs() {
  eGPrefs.exportPrefsToString().then(prefsAsString => {
    let aBlob = new Blob([prefsAsString]);
    let blobURL = URL.createObjectURL(aBlob);
    browser.downloads.download({
      url: blobURL,
      filename: `easyGesturesNPreferences-` +
                `${(new Date()).toISOString().replace(/:/g, "-")}.json`,
      saveAs: true
    }).then((downloadID) => {
      browser.downloads.onChanged.addListener(function downloadListener(download) {
        if (downloadID === download.id && download.state !== undefined &&
            download.state.current === "complete") {
          URL.revokeObjectURL(blobURL);
          browser.downloads.onChanged.removeListener(downloadListener);
        }
      });
    }).catch(() => URL.revokeObjectURL(blobURL));
  });
}

function resetPrefs() {
  if (confirm(browser.i18n.getMessage("general.prefs.reset.confirm"))) {
    eGPrefs.setDefaultSettings();
  }
}

function updateTextInputElement(anEvent) {
  let aTextInputElement = anEvent.target;
  anEvent.preventDefault();
  if (aTextInputElement.parentElement.firstElementChild.selectedIndex < 3) {
    return ;
  }
  
  aTextInputElement.value = anEvent.button;
  aTextInputElement.dispatchEvent(new window.Event("change"));
}

function resetUsage() {
  if (confirm(browser.i18n.getMessage("usage.reset.confirm"))) {
    eGPrefs.initializeUsageData();
  }
}
