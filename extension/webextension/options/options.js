/***** BEGIN LICENSE BLOCK *****
Version: MPL 1.1/GPL 2.0/LGPL 2.1

The contents of this file are subject to the Mozilla Public License Version 
1.1 (the "License"); you may not use this file except in compliance with 
the License. You may obtain a copy of the License at 
http://www.mozilla.org/MPL/

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
for the specific language governing rights and limitations under the
License.

The Original Code is easyGestures.

The Initial Developer of the Original Code is Ons Besbes.

Contributor(s): ngdeleito

Alternatively, the contents of this file may be used under the terms of
either the GNU General Public License Version 2 or later (the "GPL"), or
the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
in which case the provisions of the GPL or the LGPL are applicable instead
of those above. If you wish to allow use of your version of this file only
under the terms of either the GPL or the LGPL, and not to allow others to
use your version of this file under the terms of the MPL, indicate your
decision by deleting the provisions above and replace them with the notice
and other provisions required by the GPL or the LGPL. If you do not delete
the provisions above, a recipient may use your version of this file under
the terms of any one of the MPL, the GPL or the LGPL.

***** END LICENSE BLOCK *****/


/* global window, eGUtils, eGPrefs, browser, document, eGActions, alert,
          FileReader, Blob, URL, confirm */

const DEFAULT_FAVICON_URL = "defaultFavicon.svg";

var prefChanged = false;

window.addEventListener("load", optionsLoadHandler);
window.addEventListener("hashchange", optionsHashChangeHandler);
window.addEventListener("unload", optionsUnloadHandler);

var eventListenersArray = [
  ["displayTipsButton", "click", displayTips],
  ["importPrefsFilePicker", "change", importPrefs],
  ["importPrefsButton", "click", triggerImportPrefsFilePicker],
  ["exportPrefsButton", "click", exportPrefs],
  ["resetPrefsButton", "click", resetPrefs],
  ["showButtonInput", "mousedown", updateTextInputElement],
  ["showButtonInput", "contextmenu", preventDefault],
  ["showAltButtonInput", "mousedown", updateTextInputElement],
  ["showAltButtonInput", "contextmenu", preventDefault],
  ["standardMenuType", "change", setMenuType],
  ["largeMenuType", "change", setMenuType],
  ["activateTooltips", "change", setDisabledStatusForTooltipsActivationDelay],
  ["activateOpenLinksThroughPieMenuCenter", "change",
    setDisabledStatusForOpenLinksMaximumDelay],
  ["activateAutoscrolling", "change",
    setDisabledStatusForAutoscrollingActivationDelay],
  ["enableMainAlt1Menu", "change", setDisabledStatusForMainAlt1Menu],
  ["enableMainAlt2Menu", "change", setDisabledStatusForMainAlt2Menu],
  ["enableExtraAlt1Menu", "change", setDisabledStatusForExtraAlt1Menu],
  ["enableExtraAlt2Menu", "change", setDisabledStatusForExtraAlt2Menu],
  ["resetStatsButton", "click", resetStats]
];

function displayTips() {
  eGUtils.showOrOpenTab("/tips/tips.html", "", true);
}

function preventDefault(anEvent) {
  anEvent.preventDefault();
}

function handleStorageChange(changes) {
  for (let change in changes) {
    let prefix = change.split(".")[0];
    if (prefix === "stats") {
      initializeClicksByAction();
      initializeClicksByDirection();
    }
    else if (prefix !== "general" || change === "general.startupTips") {
      if (!prefChanged) {
        // a preference has been updated in another tab, so we update the
        // corresponding preference control
        let prefControl = document.querySelector("[data-preference='" + change +
                                                 "']");
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

function createActionsSelect(sectorNumber, isExtraMenu) {
  var select = document.createElement("select");
  var currentOptgroup = document.createElement("optgroup");
  select.appendChild(currentOptgroup);
  
  var currentAction = "empty"; // the EmptyAction is the first action
  while (currentAction !== null) {
    if (eGActions[currentAction].startsNewGroup) {
      currentOptgroup = document.createElement("optgroup");
      select.appendChild(currentOptgroup);
    }
    
    let option = document.createElement("option");
    option.className = "eGOptions_" + currentAction;
    option.value = currentAction;
    option.label = eGActions[currentAction].getLocalizedActionName();
    // setting the text attribute is needed since the label attribute is
    // currently ignored by Firefox
    // (https://bugzilla.mozilla.org/show_bug.cgi?id=1205213)
    option.text = eGActions[currentAction].getLocalizedActionName();
    currentOptgroup.appendChild(option);
    
    currentAction = eGActions[currentAction].nextAction;
  }
  
  if (sectorNumber !== 2 || isExtraMenu) {
    // remove showExtraMenu action
    select.removeChild(select.childNodes[1]);
  }
  
  return select;
}

function createMenuControl(menuName, isExtraMenu) {
  var menuControlElement = document.getElementById("menuControl_" + menuName);
  menuControlElement.className = "menu";
  menuControlElement.classList.toggle("extra", isExtraMenu);
  eGPrefs.isLargeMenuOn().then(prefValue => {
    menuControlElement.classList.toggle("large", prefValue);
  });
  
  var actionElements = document.createElement("div");
  menuControlElement.appendChild(actionElements);
  var selectElements = document.createElement("div");
  menuControlElement.appendChild(selectElements);
  
  var numberOfItems = isExtraMenu ? 5 : 10;
  for (let i = 0; i < numberOfItems; ++i) {
    let action = document.createElement("div");
    action.className = "sector" + i;
    actionElements.appendChild(action);
    
    let select = createActionsSelect(i, isExtraMenu);
    select.className = "sector" + i;
    selectElements.appendChild(select);
  }
}

function createRegularMenuControls() {
  ["main", "mainAlt1", "mainAlt2", "contextLink", "contextImage",
   "contextSelection", "contextTextbox"].forEach(function(menuName) {
     createMenuControl(menuName, false);
  });
}

function createExtraMenuControls() {
  ["extra", "extraAlt1", "extraAlt2"].forEach(function(menuName) {
    createMenuControl(menuName, true);
  });
}

function createHeaderForAction(actionName) {
  var h1 = document.createElement("h1");
  
  var span = document.createElement("span");
  span.className = "eG_" + actionName;
  h1.appendChild(span);
  
  span = document.createElement("span");
  span.textContent = browser.i18n.getMessage(actionName);
  h1.appendChild(span);
  
  return h1;
}

function createTooltipRowForAction(actionName) {
  var tr = document.createElement("tr");
  
  var th = document.createElement("th");
  th.textContent = browser.i18n.getMessage("customizations.tooltip");
  tr.appendChild(th);
  
  var td = document.createElement("td");
  var input = document.createElement("input");
  input.id = actionName + "_tooltip";
  input.type = "text";
  input.size = 20;
  input.maxLength = 20;
  td.appendChild(input);
  tr.appendChild(td);
  
  return tr;
}

function createLoadURLActions() {
  for (var i=1; i <= 10; ++i) {
    var actionName = "loadURL" + i;
    var container = document.getElementById(actionName);
    container.parentElement.insertBefore(createHeaderForAction(actionName),
                                         container);
    
    var table = document.createElement("table");
    table.appendChild(createTooltipRowForAction(actionName));
    
    var tr = document.createElement("tr");
    var th = document.createElement("th");
    th.textContent = browser.i18n.getMessage("customizations.URL");
    tr.appendChild(th);
    var td = document.createElement("td");
    var input = document.createElement("input");
    input.id = actionName + "_URL";
    input.type = "url";
    input.size = "50";
    td.appendChild(input);
    tr.appendChild(td);
    table.appendChild(tr);
    
    tr = document.createElement("tr");
    tr.appendChild(document.createElement("th"));
    td = document.createElement("td");
    input = document.createElement("input");
    input.id = actionName + "_faviconCheckbox";
    input.type = "checkbox";
    td.appendChild(input);
    var label = document.createElement("label");
    label.htmlFor = input.id;
    label.textContent = browser.i18n.getMessage("customizations.useFavicon");
    td.appendChild(label);
    var img = document.createElement("img");
    img.id = actionName + "_favicon";
    img.src = DEFAULT_FAVICON_URL;
    td.appendChild(img);
    tr.appendChild(td);
    table.appendChild(tr);
    
    tr = document.createElement("tr");
    tr.appendChild(document.createElement("th"));
    td = document.createElement("td");
    input = document.createElement("input");
    input.id = actionName + "_openInPrivateWindowCheckbox";
    input.type = "checkbox";
    td.appendChild(input);
    label = document.createElement("label");
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
  for (var i=1; i <= 10; ++i) {
    var actionName = "runScript" + i;
    var container = document.getElementById(actionName);
    container.parentElement.insertBefore(createHeaderForAction(actionName),
                                         container);
    
    var table = document.createElement("table");
    table.appendChild(createTooltipRowForAction(actionName));
    
    var tr = document.createElement("tr");
    var th = document.createElement("th");
    th.textContent = browser.i18n.getMessage("customizations.code");
    tr.appendChild(th);
    var td = document.createElement("td");
    var input = document.createElement("textarea");
    input.id = actionName + "_code";
    input.cols = "50";
    input.rows = "7";
    td.appendChild(input);
    tr.appendChild(td);
    table.appendChild(tr);
    
    tr = document.createElement("tr");
    th = document.createElement("th");
    th.textContent = browser.i18n.getMessage("customizations.customIconURL");
    tr.appendChild(th);
    td = document.createElement("td");
    input = document.createElement("input");
    input.id = actionName + "_customIconURL";
    input.type = "url";
    td.appendChild(input);
    tr.appendChild(td);
    table.appendChild(tr);
    
    container.appendChild(table);
  }
}

function initializePaneAndTabs(hash) {
  function selectTab(hash) {
    document.getElementById(hash + "_label").className = "selectedTabLabel";
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
  
  var locationHash = document.location.hash.substr(1);
  var locationHashArray = locationHash.split("_");
  document.getElementById(locationHashArray[0] + "_label").className =
    "selectedPaneLabel";
  var selectedPane = document.getElementById(locationHashArray[0]);
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
      selectTab(locationHashArray[0] + "_" + locationHashArray[1]);
      selectTab(locationHash);
      break;
  }
}

function setDisabledStatusForSelectWithTextInputControl(control) {
  var aSelectElement = control.firstElementChild;
  var aLabelElement = aSelectElement.nextElementSibling;
  var aTextInputElement = aLabelElement.nextElementSibling;
  var shouldBeDisabled = aSelectElement.selectedIndex < 3;
  aLabelElement.classList.toggle("disabled", shouldBeDisabled);
  aTextInputElement.disabled = shouldBeDisabled;
}

function addFavicon(url, actionName) {
  if (url === "") {
    document.getElementById(actionName + "_favicon").src = DEFAULT_FAVICON_URL;
  }
  else {
    browser.runtime.sendMessage({
      messageName: "retrieveAndAddFavicon",
      aURL: url
    }).then(aMessage => {
      document.getElementById(actionName + "_favicon").src =
        aMessage.aURL !== "" ? aMessage.aURL : DEFAULT_FAVICON_URL;
    });
  }
}

function initializePreferenceControl(control) {
  function initializeSelectWithTextInputControl(control) {
    eGPrefs.getPref(control.dataset.preference).then(prefValue => {
      var aSelectElement = control.firstElementChild;
      var aTextInputElement = control.lastElementChild;
      aSelectElement.selectedIndex = prefValue < 3 ? prefValue : 3;
      aTextInputElement.value = prefValue;
      setDisabledStatusForSelectWithTextInputControl(control);
    });
  }
  
  function initializeIntRadiogroupWithResetOnDuplicatedKeysControl(control) {
    eGPrefs.getPref(control.dataset.preference).then(prefValue => {
      control.querySelector("input[value='" + prefValue + "']").checked = true;
    });
  }
  
  function initializeBoolRadiogroupControl(control) {
    eGPrefs.getPref(control.dataset.preference).then(prefValue => {
      var childIndexToSet = prefValue ? 1 : 0;
      control.getElementsByTagName("input")[childIndexToSet].checked = true;
    });
  }
  
  function initializeMenuControl(control) {
    eGPrefs.getMenuPrefAsArray(control.dataset.preference).then(prefValue => {
      prefValue.forEach(function(value, index) {
        control.firstElementChild.childNodes[index].dataset.action = value;
        control.lastElementChild.childNodes[index]
               .querySelector("[value=" + value + "]").selected = true;
      });
    });
  }
  
  function initializeSelectControl(control) {
    eGPrefs.getPref(control.dataset.preference).then(prefValue => {
      control.querySelector("[value=" + prefValue + "]").selected = true;
    });
  }
  
  function initializeLoadURLPreference(actionName) {
    eGPrefs.getLoadURLOrRunScriptPrefValue(actionName).then(prefValue => {
      document.getElementById(actionName + "_tooltip").value = prefValue[0];
      document.getElementById(actionName + "_URL").value = prefValue[1];
      var isFaviconEnabled = prefValue[2] === "true";
      document.getElementById(actionName + "_faviconCheckbox").checked =
        isFaviconEnabled;
      if (isFaviconEnabled) {
        addFavicon(prefValue[1], actionName);
      }
      else {
        document.getElementById(actionName + "_favicon").src =
          DEFAULT_FAVICON_URL;
      }
      document.getElementById(actionName + "_openInPrivateWindowCheckbox")
              .checked = prefValue[3] === "true";
    });
  }
  
  function initializeRunScriptPreference(actionName) {
    eGPrefs.getLoadURLOrRunScriptPrefValue(actionName).then(prefValue => {
      document.getElementById(actionName + "_tooltip").value = prefValue[0];
      document.getElementById(actionName + "_code").value = prefValue[1];
      document.getElementById(actionName + "_customIconURL").value =
        prefValue[2];
    });
  }
  
  function initializeStringRadiogroup(control) {
    eGPrefs.getPref(control.dataset.preference).then(prefValue => {
      control.querySelector("[value=" + prefValue + "]").checked = true;
    });
  }
  
  function initializeDailyReadingsControl(control) {
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
  return [document.getElementById(actionName + "_tooltip").value,
          document.getElementById(actionName + "_URL").value,
          document.getElementById(actionName + "_faviconCheckbox").checked,
          document.getElementById(actionName + "_openInPrivateWindowCheckbox")
                  .checked];
}

function addEventListenerToLoadURLComponent(aPrefName, element, actionName) {
  element.addEventListener("change", function() {
    prefChanged = true;
    eGPrefs.setLoadURLOrRunScriptPrefValue(aPrefName,
      preparePreferenceValueForLoadURL(actionName));
  }, false);
}

function addEventListenerToLoadURLURL(aPrefName, element, actionName) {
  element.addEventListener("change", function() {
    if (document.getElementById(actionName + "_faviconCheckbox").checked) {
      addFavicon(this.value, actionName);
    }
    prefChanged = true;
    eGPrefs.setLoadURLOrRunScriptPrefValue(aPrefName,
      preparePreferenceValueForLoadURL(actionName));
  }, false);
}

function addEventListenerToLoadURLFavicon(aPrefName, element, actionName) {
  element.addEventListener("change", function() {
    if (this.checked) {
      addFavicon(document.getElementById(actionName + "_URL").value,
                 actionName);
    }
    else {
      document.getElementById(actionName + "_favicon").src =
        DEFAULT_FAVICON_URL;
    }
    prefChanged = true;
    eGPrefs.setLoadURLOrRunScriptPrefValue(aPrefName,
      preparePreferenceValueForLoadURL(actionName));
  }, false);
}

function preparePreferenceValueForRunScript(actionName) {
  return [document.getElementById(actionName + "_tooltip").value,
          document.getElementById(actionName + "_code").value,
          document.getElementById(actionName + "_customIconURL").value];
}

function addEventListenerToRunScriptComponent(aPrefName, element, actionName) {
  element.addEventListener("change", function() {
    prefChanged = true;
    eGPrefs.setLoadURLOrRunScriptPrefValue(aPrefName,
      preparePreferenceValueForRunScript(actionName));
  }, false);
}

function addOnchangeListenerToPreferenceControl(control) {
  function addOnchangeListenerToSelectWithTextInputControl(control) {
    var aSelectElement = control.firstElementChild;
    var aLabelElement = aSelectElement.nextElementSibling;
    var aTextInputElement = aLabelElement.nextElementSibling;
    aSelectElement.addEventListener("change", function() {
      setDisabledStatusForSelectWithTextInputControl(control);
      
      if (aSelectElement.selectedIndex < 3) {
        aTextInputElement.value = aSelectElement.selectedIndex;
        prefChanged = true;
        eGPrefs.setIntPref(control.dataset.preference,
                           aSelectElement.selectedIndex);
      }
      else {
        aTextInputElement.focus();
      }
    }, true);
    aTextInputElement.addEventListener("change", function(anEvent) {
      let prefValue = anEvent.target.value;
      prefChanged = true;
      eGPrefs.setIntPref(control.dataset.preference, prefValue);
      aSelectElement.selectedIndex = prefValue < 3 ? prefValue : 3;
      setDisabledStatusForSelectWithTextInputControl(control);
    }, true);
  }
  
  function addOnchangeListenerToIntRadiogroupWithResetOnDuplicatedKeysControl(control) {
    function onchangeHandler(anEvent) {
      var showKey = document
            .querySelectorAll("[name='showKeyRadiogroup']:checked")[0].value;
      var preventOpenKey = document
            .querySelectorAll("[name='preventOpenKeyRadiogroup']:checked")[0]
            .value;
      var contextKey = document
            .querySelectorAll("[name='contextualMenuKeyRadiogroup']:checked")[0]
            .value;
      
      if ((showKey !== "0" &&
           (showKey === preventOpenKey || showKey === contextKey)) ||
          (preventOpenKey !== "0" && (preventOpenKey === contextKey))) {
        eGPrefs.getPref(control.dataset.preference).then(currentValue => {
          anEvent.target.parentElement.parentElement
                 .querySelector("[value='" + currentValue + "']").checked = true;
          alert(browser.i18n.getMessage("activation.duplicateKey"));
        });
      }
      else {
        prefChanged = true;
        eGPrefs.setIntPref(control.dataset.preference, anEvent.target.value);
      }
    }
    
    var radioElements = control.getElementsByTagName("input");
    for (let i = 0; i < radioElements.length; ++i) {
      radioElements[i].addEventListener("change", onchangeHandler, true);
    }
  }
  
  function addOnchangeListenerToBoolRadiogroupControl(control) {
    function onchangeHandler(anEvent) {
      prefChanged = true;
      eGPrefs.setBoolPref(control.dataset.preference,
                          anEvent.target.value === "true");
    }
    
    var radioElements = control.getElementsByTagName("input");
    for (let i = 0; i < radioElements.length; ++i) {
      radioElements[i].addEventListener("change", onchangeHandler, true);
    }
  }
  
  function addOnchangeListenerToMenuControl(control) {
    function onchangeHandler() {
      var selectElements = control.lastElementChild;
      var prefValueAsArray = [];
      for (let i = 0; i < selectElements.childNodes.length; ++i) {
        let value = selectElements.childNodes[i].value;
        control.firstElementChild.childNodes[i].dataset.action = value;
        prefValueAsArray.push(value);
      }
      prefChanged = true;
      eGPrefs.setMenuPref(control.dataset.preference, prefValueAsArray);
    }
    
    var selectElements = control.lastElementChild;
    for (let i = 0; i < selectElements.childNodes.length; ++i) {
      selectElements.childNodes[i]
                    .addEventListener("change", onchangeHandler, true);
    }
  }
  
  function addOnchangeListenerToLoadURLControl(control) {
    addEventListenerToLoadURLComponent(control.dataset.preference,
      document.getElementById(control.id + "_tooltip"), control.id);
    addEventListenerToLoadURLURL(control.dataset.preference,
      document.getElementById(control.id + "_URL"), control.id);
    addEventListenerToLoadURLFavicon(control.dataset.preference,
      document.getElementById(control.id + "_faviconCheckbox"), control.id);
    addEventListenerToLoadURLComponent(control.dataset.preference,
      document.getElementById(control.id + "_openInPrivateWindowCheckbox"),
      control.id);
  }
  
  function addOnchangeListenerToRunScriptControl(control) {
    addEventListenerToRunScriptComponent(control.dataset.preference,
      document.getElementById(control.id + "_tooltip"), control.id);
    addEventListenerToRunScriptComponent(control.dataset.preference,
      document.getElementById(control.id + "_code"), control.id);
    addEventListenerToRunScriptComponent(control.dataset.preference,
      document.getElementById(control.id + "_customIconURL"), control.id);
  }
  
  function addOnchangeListenerToStringRadiogroupControl(control) {
    function onchangeHandler(anEvent) {
      prefChanged = true;
      eGPrefs.setCharPref(control.dataset.preference, anEvent.target.value);
    }
    
    var radioElements = control.getElementsByTagName("input");
    for (let i = 0; i < radioElements.length; ++i) {
      radioElements[i].addEventListener("change", onchangeHandler, true);
    }
  }
  
  switch (control.dataset.preferenceType) {
    case "checkboxInput":
      control.addEventListener("change", function() {
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
      control.addEventListener("change", function() {
        prefChanged = true;
        eGPrefs.setIntPref(control.dataset.preference, control.value);
      }, true);
      break;
    case "menu":
      addOnchangeListenerToMenuControl(control);
      break;
    case "select":
      control.addEventListener("change", function() {
        prefChanged = true;
        eGPrefs.setCharPref(control.dataset.preference, control.value);
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
      control.addEventListener("change", function() {
        prefChanged = true;
        eGPrefs.setDailyReadingsFolderName(control.value);
      }, true);
      break;
  }
}

function setMenuType(anEvent) {
  eGPrefs.isLargeMenuOn().then(prefValue => {
    var menuTypeIsLarge = anEvent === undefined ?
                            prefValue : JSON.parse(anEvent.target.value);
    ["main", "mainAlt1", "mainAlt2", "extra", "extraAlt1", "extraAlt2",
     "contextLink", "contextImage", "contextSelection", "contextTextbox"]
      .forEach(function(menuName) {
      document.getElementById("menuControl_" + menuName).classList
              .toggle("large", menuTypeIsLarge);
    });
    ["mainMenuLabel", "extraMenuLabel", "primaryMainMenu", "primaryExtraMenu",
     "alt1MainMenu", "alt1ExtraMenu", "alt2MainMenu", "alt2ExtraMenu",
     "allMenusMainMenu", "allMenusExtraMenu"].forEach(function(id) {
       document.getElementById(id).classList.toggle("large", menuTypeIsLarge);
    });
  });
}

function toggleDisabledStatusOnElementsById(ids, shouldBeDisabled) {
  ids.forEach(function(id) {
    document.getElementById(id).classList.toggle("disabled", shouldBeDisabled);
  });
  document.getElementById(ids[1]).readOnly = shouldBeDisabled;
}

function setDisabledStatusForTooltipsActivationDelay(anEvent) {
  eGPrefs.areTooltipsOn().then(prefValue => {
    var shouldBeDisabled = anEvent === undefined ? !prefValue :
                                                   !anEvent.target.checked;
    toggleDisabledStatusOnElementsById(["tooltipsActivationDelayLabel",
      "tooltipsActivationDelayInput", "tooltipsActivationDelayUnit"],
      shouldBeDisabled);
  });
}

function setDisabledStatusForOpenLinksMaximumDelay(anEvent) {
  eGPrefs.isHandleLinksOn().then(prefValue => {
    var shouldBeDisabled = anEvent === undefined ? !prefValue :
                                                   !anEvent.target.checked;
    toggleDisabledStatusOnElementsById(["openLinksMaximumDelayLabel",
      "openLinksMaximumDelayInput", "openLinksMaximumDelayUnit",
      "openLinksThroughPieMenuCenterConfiguration"], shouldBeDisabled);
    var radioElements =
          document.getElementById("openLinksThroughPieMenuCenterConfiguration")
                  .getElementsByTagName("input");
    radioElements[0].disabled = shouldBeDisabled;
    radioElements[1].disabled = shouldBeDisabled;
  });
}

function setDisabledStatusForAutoscrollingActivationDelay(anEvent) {
  eGPrefs.isAutoscrollingOn().then(prefValue => {
    var shouldBeDisabled = anEvent === undefined ? !prefValue :
                                                   !anEvent.target.checked;
    toggleDisabledStatusOnElementsById(["autoscrollingActivationDelayLabel",
      "autoscrollingActivationDelayInput", "autoscrollingActivationDelayUnit"],
      shouldBeDisabled);
  });
}

function setDisabledStatusForMenu(menuName, enabled) {
  var selectElements = document.getElementById("menuControl_" + menuName)
                               .lastElementChild;
  for (let i = 0; i < selectElements.childNodes.length; ++i) {
    selectElements.childNodes[i].disabled = !enabled;
  }
}

function setDisabledStatusForMainAlt1Menu(anEvent) {
  eGPrefs.isMainAlt1MenuEnabled().then(prefValue => {
    var enabled = anEvent === undefined ? prefValue : anEvent.target.checked;
    setDisabledStatusForMenu("mainAlt1", enabled);
  });
}

function setDisabledStatusForMainAlt2Menu(anEvent) {
  eGPrefs.isMainAlt2MenuEnabled().then(prefValue => {
    var enabled = anEvent === undefined ? prefValue : anEvent.target.checked;
    setDisabledStatusForMenu("mainAlt2", enabled);
  });
}

function setDisabledStatusForExtraAlt1Menu(anEvent) {
  eGPrefs.isExtraAlt1MenuEnabled().then(prefValue => {
    var enabled = anEvent === undefined ? prefValue : anEvent.target.checked;
    setDisabledStatusForMenu("extraAlt1", enabled);
  });
}

function setDisabledStatusForExtraAlt2Menu(anEvent) {
  eGPrefs.isExtraAlt2MenuEnabled().then(prefValue => {
    var enabled = anEvent === undefined ? prefValue : anEvent.target.checked;
    setDisabledStatusForMenu("extraAlt2", enabled);
  });
}

function setPreferenceControlsDisabledStatus() {
  setMenuType();
  setDisabledStatusForTooltipsActivationDelay();
  setDisabledStatusForOpenLinksMaximumDelay();
  setDisabledStatusForAutoscrollingActivationDelay();
  setDisabledStatusForMainAlt1Menu();
  setDisabledStatusForMainAlt2Menu();
  setDisabledStatusForExtraAlt1Menu();
  setDisabledStatusForExtraAlt2Menu();
}

function loadPreferences(isReload) {
  var prefControls = document.querySelectorAll("[data-preference]");
  for (let i=0; i < prefControls.length; ++i) {
    initializePreferenceControl(prefControls[i]);
    if (!isReload) {
      addOnchangeListenerToPreferenceControl(prefControls[i]);
    }
  }
  setPreferenceControlsDisabledStatus();
}

function removeChildNodes(node) {
  while (node.hasChildNodes()) {
    node.removeChild(node.firstChild);
  }
}

function initializeClicksByAction() {
  eGPrefs.getStatsActionsPref().then(statsActions => {
    var totalClicks = 0;
    for (let action in statsActions) {
      totalClicks += statsActions[action];
    }
    totalClicks = totalClicks === 0 ? 1 : totalClicks - statsActions.empty;
    
    var container = document.getElementById("stats_clicksByAction");
    removeChildNodes(container);
    
    // we start at the action that follows the "showExtraMenu" action
    var currentAction = eGActions.showExtraMenu.nextAction;
    while (currentAction !== null) {
      let clicksForAction = statsActions[currentAction];
      let count = Math.round(clicksForAction / totalClicks * 1000) / 10;
      if (count > 1) {
        count = Math.round(count);
      }
      
      let div = document.createElement("div");
      div.title = eGActions[currentAction].getLocalizedActionName() + ": " +
                  clicksForAction + " " +
                  browser.i18n.getMessage("stats.clicks");
      container.appendChild(div);
      
      let span = document.createElement("span");
      span.className = "eG_" + currentAction;
      div.appendChild(span);
      
      let img = document.createElement("span");
      img.style.width = count / 2 + "px";
      div.appendChild(img);
      
      span = document.createElement("span");
      span.textContent = clicksForAction > 0 ?
                           (count > 0.1 ? count + "%" : "<0.1%") : "–";
      div.appendChild(span);
      
      currentAction = eGActions[currentAction].nextAction;
    }
  });
}

function initializeClicksByDirectionForMenuLayouts(statsArray, isExtraMenu) {
  var numberOfActions = isExtraMenu ? 5 : 10;
  var usages = [0, 0, 0, 0];
  
  for (let i = 0; i < numberOfActions; ++i) {
    let usage = statsArray[0 * numberOfActions + i];
    usages[0] += usage;
    usages[3] += usage;
    usage = statsArray[1 * numberOfActions + i];
    usages[1] += usage;
    usages[3] += usage;
    usage = statsArray[2 * numberOfActions + i];
    usages[2] += usage;
    usages[3] += usage;
  }
  
  ["primary", "alt1", "alt2"].forEach((menuPrefix, layoutIndex) => {
    var container = document.getElementById(menuPrefix +
                                            (isExtraMenu ? "Extra" : "Main") +
                                            "Menu");
    removeChildNodes(container);
    container.className = "menu";
    container.classList.toggle("extra", isExtraMenu);
    eGPrefs.isLargeMenuOn().then(prefValue => {
      container.classList.toggle("large", prefValue);
    });
    for (let i = 0; i < numberOfActions; ++i) {
      let stat = document.createElement("div");
      stat.className = "sector" + i;
      let clicks = statsArray[layoutIndex * numberOfActions + i];
      let totalUsage = usages[layoutIndex] === 0 ? 1 : usages[layoutIndex];
      stat.textContent = Math.round(clicks * 100 / totalUsage) + "%";
      container.appendChild(stat);
    }
    
    var total = document.createElement("div");
    total.className = "total";
    total.textContent = Math.round(usages[layoutIndex] * 100 /
                                   (usages[3] === 0 ? 1 : usages[3])) + "%";
    container.appendChild(total);
  });
}

function initializeClicksByDirectionTotals(statsArray, isExtraMenu) {
  var numberOfActions = isExtraMenu ? 5 : 10;
  var usages = [];
  var total = 0;
  for (let i = 0; i < numberOfActions; ++i) {
    let usage = statsArray[0 * numberOfActions + i] +
                statsArray[1 * numberOfActions + i] +
                statsArray[2 * numberOfActions + i];
    usages.push(usage);
    total += usage;
  }
  
  var container = document.getElementById("allMenus" +
                                         (isExtraMenu ? "Extra" : "Main") +
                                         "Menu");
  removeChildNodes(container);
  container.className = "menu";
  container.classList.toggle("extra", isExtraMenu);
  eGPrefs.isLargeMenuOn().then(prefValue => {
    container.classList.toggle("large", prefValue);
  });
  for (let i = 0; i < numberOfActions; ++i) {
   let stat = document.createElement("div");
   stat.className = "sector" + i;
   stat.textContent = Math.round(usages[i] * 100 / (total === 0 ? 1 : total)) +
                        "%";
   container.appendChild(stat);
  }
}

function initializeClicksByDirection() {
  eGPrefs.getStatsMainMenuPref().then(statsMainArray => {
    initializeClicksByDirectionForMenuLayouts(statsMainArray, false);
    initializeClicksByDirectionTotals(statsMainArray, false);
  });
  
  eGPrefs.getStatsExtraMenuPref().then(statsExtraArray => {
    initializeClicksByDirectionForMenuLayouts(statsExtraArray, true);
    initializeClicksByDirectionTotals(statsExtraArray, true);
  });
}

function loadStats() {
  eGPrefs.getStatsLastResetPref().then(prefValue => {
    document.getElementById("statsLastReset").textContent = prefValue;
  });
  
  initializeClicksByAction();
  initializeClicksByDirection();
}

function optionsLoadHandler() {
  document.body.style.cursor = "wait";
  browser.storage.onChanged.addListener(handleStorageChange);
  addEventListeners();
  
  eGUtils.setDocumentTitle(document, "preferences");
  eGUtils.setDocumentLocalizedStrings(document);
  
  createRegularMenuControls();
  createExtraMenuControls();
  createLoadURLActions();
  createRunScriptActions();
  
  initializePaneAndTabs(document.location.hash);
  loadPreferences(false);
  
  loadStats();
  
  window.setTimeout(function() { window.scrollTo(0, 0); });
  document.body.style.cursor = "auto";
}

function unselectCurrentPane() {
  var selectedPaneLabelElement =
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
  
  var oldHashArray = oldHash.split("_");
  switch (oldHashArray.length) {
    case 1:
      unselectSubTabs(oldHash);
      break;
    case 2:
      unselectSubTabs(oldHash);
      unselectTab(document.getElementById(oldHash + "_label"));
      break;
    case 3:
      unselectSubTabs(oldHashArray[0] + "_" + oldHashArray[1]);
      unselectTab(document.getElementById(oldHashArray[0] + "_" +
                  oldHashArray[1] + "_label"));
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
  
  removeEventListeners();
  browser.storage.onChanged.removeListener(handleStorageChange);
}

function importPrefs(anEvent) {
  var fileReader = new FileReader();
  fileReader.onload = function(anEvent) {
    try {
      eGPrefs.importPrefsFromString(anEvent.target.result).then(result => {
        if (result !== undefined) {
          alert(browser.i18n.getMessage("general.prefs.import." + result.code) +
                " " + result.prefs);
        }
        loadPreferences(true);
      });
    }
    catch (exception) {
      alert(browser.i18n.getMessage("general.prefs.import." + exception.code));
    }
  };
  fileReader.readAsText(anEvent.target.files[0]);
}

function triggerImportPrefsFilePicker() {
  var filePicker = document.getElementById("importPrefsFilePicker");
  filePicker.click();
}

function exportPrefs() {
  eGPrefs.exportPrefsToString().then(prefsAsString => {
    let aBlob = new Blob([prefsAsString]);
    let blobURL = URL.createObjectURL(aBlob);
    browser.downloads.download({
      url: blobURL,
      filename: "easyGesturesNPreferences-" + (new Date()).toISOString() +
                ".json",
      saveAs: true
    }).then((downloadID) => {
      browser.downloads.onChanged.addListener(function downloadListener(download) {
        if (downloadID === download.id &&
            download.state.current === "complete") {
          URL.revokeObjectURL(blobURL);
          browser.downloads.onChanged.removeListener(downloadListener);
        }
      });
    }).catch(() => {
      URL.revokeObjectURL(blobURL);
    });
  });
}

function resetPrefs() {
  if (confirm(browser.i18n.getMessage("general.prefs.reset.confirm"))) {
    eGPrefs.setDefaultSettings().then(() => {
      loadPreferences(true);
    });
  }
}

function updateTextInputElement(anEvent) {
  var aTextInputElement = anEvent.target;
  anEvent.preventDefault();
  if (aTextInputElement.parentElement.firstElementChild.selectedIndex < 3) {
    return ;
  }
  
  aTextInputElement.value = anEvent.button;
  aTextInputElement.dispatchEvent(new window.Event("change"));
}

function resetStats() {
  if (confirm(browser.i18n.getMessage("stats.reset.confirm"))) {
    eGPrefs.initializeStats();
  }
}
