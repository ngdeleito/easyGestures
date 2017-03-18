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


/* global window, browser, document, eGActions, alert, confirm */

const DEFAULT_FAVICON_URL = "defaultFavicon.svg";

window.addEventListener("load", optionsLoadHandler);
window.addEventListener("hashchange", optionsHashChangeHandler);
window.addEventListener("unload", optionsUnloadHandler);

// var prefsObserver = {
//   register: function() {
//     this._branch = Services.prefs.getBranch("extensions.easygestures.");
//     this._branch.addObserver("general.startupTips", this, false);
//     this._branch.addObserver("activation.", this, false);
//     this._branch.addObserver("behavior.", this, false);
//     this._branch.addObserver("menus.", this, false);
//     this._branch.addObserver("customizations.", this, false);
//   },
//
//   unregister: function() {
//     this._branch.removeObserver("general.startupTips", this);
//     this._branch.removeObserver("activation.", this);
//     this._branch.removeObserver("behavior.", this);
//     this._branch.removeObserver("menus.", this);
//     this._branch.removeObserver("customizations.", this);
//   },
//
//   observe: function(aSubject, aTopic, aData) {
//     var prefControl =
//           document.querySelector("[data-preference='" + aData + "']");
//     initializePreferenceControl(prefControl);
//     setPreferenceControlsDisabledStatus();
//   }
// };

var eventListenersArray = [
  ["displayTipsButton", "click", displayTips],
  ["importPrefsButton", "click", importPrefs],
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
  browser.tabs.query({}).then(tabs => {
    let tipsTab = tabs.find(tab => {
      return tab.url === browser.extension.getURL("/tips/tips.html");
    });
    if (tipsTab === undefined) {
      browser.tabs.create({
        active: true,
        url: "/tips/tips.html"
      });
    }
    else {
      browser.tabs.update(tipsTab.id, {
        active: true
      });
    }
  });
}

function preventDefault(anEvent) {
  anEvent.preventDefault();
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
    eGActions[currentAction].getLocalizedActionName().then(response => {
      option.label = response.response;
      // setting the text attribute is needed since the label attribute is
      // currently ignored by Firefox
      // (https://bugzilla.mozilla.org/show_bug.cgi?id=1205213)
      option.text = response.response;
    });
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
  browser.runtime.sendMessage({
    "messageName": "query_eGPrefs",
    "methodName": "isLargeMenuOff"
  }).then(aMessage => {
    menuControlElement.classList.toggle("large", !aMessage.response);
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
  browser.runtime.sendMessage({
    messageName: "query_eGStrings",
    methodName: "getString",
    parameter: actionName
  }).then(aMessage => {
    span.textContent = aMessage.response;
  });
  h1.appendChild(span);
  
  return h1;
}

function createTooltipRowForAction(actionName) {
  var tr = document.createElement("tr");
  
  var th = document.createElement("th");
  browser.runtime.sendMessage({
    messageName: "query_eGStrings",
    methodName: "getString",
    parameter: "customizations.tooltip"
  }).then(aMessage => {
    th.textContent = aMessage.response;
  });
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

function createLoadURLActions(URLString, useFaviconString, openInPrivateWindowString) {
  for (var i=1; i <= 10; ++i) {
    var actionName = "loadURL" + i;
    var container = document.getElementById(actionName);
    container.parentElement.insertBefore(createHeaderForAction(actionName),
                                         container);
    
    var table = document.createElement("table");
    table.appendChild(createTooltipRowForAction(actionName));
    
    var tr = document.createElement("tr");
    var th = document.createElement("th");
    th.textContent = URLString;
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
    label.textContent = useFaviconString;
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
    label.textContent = openInPrivateWindowString;
    td.appendChild(label);
    tr.appendChild(td);
    table.appendChild(tr);
    
    container.appendChild(table);
  }
}

function createRunScriptActions(codeString, useCustomIconString) {
  for (var i=1; i <= 10; ++i) {
    var actionName = "runScript" + i;
    var container = document.getElementById(actionName);
    container.parentElement.insertBefore(createHeaderForAction(actionName),
                                         container);
    
    var table = document.createElement("table");
    table.appendChild(createTooltipRowForAction(actionName));
    
    var tr = document.createElement("tr");
    var th = document.createElement("th");
    th.textContent = codeString;
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
    tr.appendChild(document.createElement("th"));
    td = document.createElement("td");
    input = document.createElement("input");
    input.id = actionName + "_customIconCheckbox";
    input.type = "checkbox";
    td.appendChild(input);
    var label = document.createElement("label");
    label.htmlFor = input.id;
    label.textContent = useCustomIconString;
    td.appendChild(label);
    var span = document.createElement("span");
    span.id = actionName + "_customIconURL";
    td.appendChild(span);
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
    browser.runtime.sendMessage({
      messageName: "query_eGPrefs",
      methodName: "getIntPref",
      parameter: control.dataset.preference
    }).then(aMessage => {
      var prefValue = aMessage.response;
      var aSelectElement = control.firstElementChild;
      var aLabelElement = aSelectElement.nextElementSibling;
      var aTextInputElement = aLabelElement.nextElementSibling;
      aSelectElement.selectedIndex = prefValue < 3 ? prefValue : 3;
      aTextInputElement.value = prefValue;
      var shouldBeDisabled = prefValue < 3;
      aLabelElement.classList.toggle("disabled", shouldBeDisabled);
      aTextInputElement.disabled = shouldBeDisabled;
    });
  }
  
  function initializeIntRadiogroupWithResetOnDuplicatedKeysControl(control) {
    browser.runtime.sendMessage({
      messageName: "query_eGPrefs",
      methodName: "getIntPref",
      parameter: control.dataset.preference
    }).then(aMessage => {
      var prefValue = aMessage.response;
      control.querySelector("input[value='" + prefValue + "']").checked = true;
    });
  }
  
  function initializeBoolRadiogroupControl(control) {
    browser.runtime.sendMessage({
      messageName: "query_eGPrefs",
      methodName: "getBoolPref",
      parameter: control.dataset.preference
    }).then(aMessage => {
      var prefValue = aMessage.response;
      var childIndexToSet = prefValue ? 1 : 0;
      control.getElementsByTagName("input")[childIndexToSet].checked = true;
    });
  }
  
  function initializeMenuControl(control) {
    browser.runtime.sendMessage({
      messageName: "query_eGPrefs",
      methodName: "getMenuPrefAsArray",
      parameter: control.dataset.preference
    }).then(aMessage => {
      var prefValue = aMessage.response;
      prefValue.forEach(function(value, index) {
        control.firstElementChild.childNodes[index].dataset.action = value;
        control.lastElementChild.childNodes[index]
               .querySelector("[value=" + value + "]").selected = true;
      });
    });
  }
  
  function initializeSelectControl(control) {
    browser.runtime.sendMessage({
      messageName: "query_eGPrefs",
      methodName: "getCharPref",
      parameter: control.dataset.preference
    }).then(aMessage => {
      var prefValue = aMessage.response;
      control.querySelector("[value=" + prefValue + "]").selected = true;
    });
  }
  
  function initializeLoadURLPreference(actionName) {
    browser.runtime.sendMessage({
      messageName: "query_eGPrefs",
      methodName: "getLoadURLOrRunScriptPrefValue",
      parameter: actionName
    }).then(aMessage => {
      var prefValue = aMessage.response;
      
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
    browser.runtime.sendMessage({
      messageName: "query_eGPrefs",
      methodName: "getLoadURLOrRunScriptPrefValue",
      parameter: actionName
    }).then(aMessage => {
      var prefValue = aMessage.response;
      
      document.getElementById(actionName + "_tooltip").value = prefValue[0];
      document.getElementById(actionName + "_code").value = prefValue[1];
      document.getElementById(actionName + "_customIconCheckbox").checked =
        prefValue[2] !== "";
      document.getElementById(actionName + "_customIconURL").textContent =
        prefValue[2];
    });
  }
  
  function initializeStringRadiogroup(control) {
    browser.runtime.sendMessage({
      messageName: "query_eGPrefs",
      methodName: "getCharPref",
      parameter: control.dataset.preference
    }).then(aMessage => {
      var prefValue = aMessage.response;
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
    browser.runtime.sendMessage({
      messageName: "query_eGPrefs",
      methodName: "getDailyReadingsFolderName",
    }).then(aMessage => {
      control.value = aMessage.response;
    });
  }
  
  switch (control.dataset.preferenceType) {
    case "checkboxInput":
      browser.runtime.sendMessage({
        messageName: "query_eGPrefs",
        methodName: "getBoolPref",
        parameter: control.dataset.preference
      }).then(aMessage => {
        control.checked = aMessage.response;
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
      browser.runtime.sendMessage({
        messageName: "query_eGPrefs",
        methodName: "getIntPref",
        parameter: control.dataset.preference
      }).then(aMessage => {
        control.value = aMessage.response;
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

function addEventListenerToLoadURLTooltip(aPrefName, element, actionName) {
  element.addEventListener("change", function() {
    browser.runtime.sendMessage({
      messageName: "query_eGPrefs",
      methodName: "setLoadURLOrRunScriptPrefValue",
      parameter: aPrefName,
      parameter2: preparePreferenceValueForLoadURL(actionName)
    });
  }, false);
}

function addEventListenerToLoadURLURL(aPrefName, element, actionName) {
  element.addEventListener("change", function() {
    if (document.getElementById(actionName + "_faviconCheckbox").checked) {
      addFavicon(this.value, actionName);
    }
    browser.runtime.sendMessage({
      messageName: "query_eGPrefs",
      methodName: "setLoadURLOrRunScriptPrefValue",
      parameter: aPrefName,
      parameter2: preparePreferenceValueForLoadURL(actionName)
    });
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
    browser.runtime.sendMessage({
      messageName: "query_eGPrefs",
      methodName: "setLoadURLOrRunScriptPrefValue",
      parameter: aPrefName,
      parameter2: preparePreferenceValueForLoadURL(actionName)
    });
  }, false);
}

function addEventListenerToLoadURLOpenInPrivateWindow(aPrefName, element, actionName) {
  element.addEventListener("change", function() {
    browser.runtime.sendMessage({
      messageName: "query_eGPrefs",
      methodName: "setLoadURLOrRunScriptPrefValue",
      parameter: aPrefName,
      parameter2: preparePreferenceValueForLoadURL(actionName)
    });
  });
}

function preparePreferenceValueForRunScript(actionName) {
  return [document.getElementById(actionName + "_tooltip").value,
          document.getElementById(actionName + "_code").value,
          document.getElementById(actionName + "_customIconURL").textContent];
}

function addEventListenerToRunScriptTooltip(aPrefName, element, actionName) {
  element.addEventListener("change", function() {
    browser.runtime.sendMessage({
      messageName: "query_eGPrefs",
      methodName: "setLoadURLOrRunScriptPrefValue",
      parameter: aPrefName,
      parameter2: preparePreferenceValueForRunScript(actionName)
    });
  }, false);
}

function addEventListenerToRunScriptCode(aPrefName, element, actionName) {
  element.addEventListener("change", function() {
    browser.runtime.sendMessage({
      messageName: "query_eGPrefs",
      methodName: "setLoadURLOrRunScriptPrefValue",
      parameter: aPrefName,
      parameter2: preparePreferenceValueForRunScript(actionName)
    });
  }, false);
}

function addEventListenerToRunScriptNewIcon(aPrefName, element, actionName) {
  element.addEventListener("change", function() {
    if (this.checked) {
      browser.runtime.sendMessage({
        messageName: "retrieveCustomIconFile"
      }).then(aMessage => {
        if (aMessage.returnedOK) {
          document.getElementById(actionName + "_customIconURL").textContent =
            "file://" + aMessage.path;
        }
        this.checked = aMessage.returnedOK;
        browser.runtime.sendMessage({
          messageName: "query_eGPrefs",
          methodName: "setLoadURLOrRunScriptPrefValue",
          parameter: aPrefName,
          parameter2: preparePreferenceValueForRunScript(actionName)
        });
      });
    }
    else {
      document.getElementById(actionName + "_customIconURL").textContent = "";
      browser.runtime.sendMessage({
        messageName: "query_eGPrefs",
        methodName: "setLoadURLOrRunScriptPrefValue",
        parameter: aPrefName,
        parameter2: preparePreferenceValueForRunScript(actionName)
      });
    }
  }, false);
}

function addOnchangeListenerToPreferenceControl(control) {
  function addOnchangeListenerToSelectWithTextInputControl(control) {
    var aSelectElement = control.firstElementChild;
    var aTextInputElement = control.lastElementChild;
    aSelectElement.addEventListener("change", function() {
      let shouldBeDisabled = aSelectElement.selectedIndex < 3;
      let aLabelElement = aSelectElement.nextElementSibling;
      aLabelElement.classList.toggle("disabled", shouldBeDisabled);
      aTextInputElement.disabled = shouldBeDisabled;
      
      if (shouldBeDisabled) {
        aTextInputElement.value = aSelectElement.selectedIndex;
        browser.runtime.sendMessage({
          messageName: "query_eGPrefs",
          methodName: "setIntPref",
          parameter: control.dataset.preference,
          parameter2: aSelectElement.selectedIndex
        });
      }
      else {
        aTextInputElement.focus();
      }
    }, true);
    aTextInputElement.addEventListener("change", function(anEvent) {
      browser.runtime.sendMessage({
        messageName: "query_eGPrefs",
        methodName: "setIntPref",
        parameter: control.dataset.preference,
        parameter2: anEvent.target.value
      });
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
        browser.runtime.sendMessage({
          messageName: "query_eGPrefs",
          methodName: "getIntPref",
          parameter: control.dataset.preference
        }).then(aMessage => {
          let currentValue = aMessage.response;
          anEvent.target.parentElement.parentElement
                 .querySelector("[value='" + currentValue + "']").checked = true;
          browser.runtime.sendMessage({
            messageName: "query_eGStrings",
            methodName: "getString",
            parameter: "activation.duplicateKey"
          }).then(aMessage => {
            alert(aMessage.response);
          });
        });
      }
      else {
        browser.runtime.sendMessage({
          messageName: "query_eGPrefs",
          methodName: "setIntPref",
          parameter: control.dataset.preference,
          parameter2: anEvent.target.value
        });
      }
    }
    
    var radioElements = control.getElementsByTagName("input");
    for (let i = 0; i < radioElements.length; ++i) {
      radioElements[i].addEventListener("change", onchangeHandler, true);
    }
  }
  
  function addOnchangeListenerToBoolRadiogroupControl(control) {
    function onchangeHandler(anEvent) {
      browser.runtime.sendMessage({
        messageName: "query_eGPrefs",
        methodName: "setBoolPref",
        parameter: control.dataset.preference,
        parameter2: anEvent.target.value === "true"
      });
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
        prefValueAsArray.push(selectElements.childNodes[i].value);
      }
      browser.runtime.sendMessage({
        messageName: "query_eGPrefs",
        methodName: "setMenuPref",
        parameter: control.dataset.preference,
        parameter2: prefValueAsArray
      });
    }
    
    var selectElements = control.lastElementChild;
    for (let i = 0; i < selectElements.childNodes.length; ++i) {
      selectElements.childNodes[i]
                    .addEventListener("change", onchangeHandler, true);
    }
  }
  
  function addOnchangeListenerToLoadURLControl(control) {
    addEventListenerToLoadURLTooltip(control.dataset.preference,
      document.getElementById(control.id + "_tooltip"), control.id);
    addEventListenerToLoadURLURL(control.dataset.preference,
      document.getElementById(control.id + "_URL"), control.id);
    addEventListenerToLoadURLFavicon(control.dataset.preference,
      document.getElementById(control.id + "_faviconCheckbox"), control.id);
    addEventListenerToLoadURLOpenInPrivateWindow(control.dataset.preference,
      document.getElementById(control.id + "_openInPrivateWindowCheckbox"),
      control.id);
  }
  
  function addOnchangeListenerToRunScriptControl(control) {
    addEventListenerToRunScriptTooltip(control.dataset.preference,
      document.getElementById(control.id + "_tooltip"), control.id);
    addEventListenerToRunScriptCode(control.dataset.preference,
      document.getElementById(control.id + "_code"), control.id);
    addEventListenerToRunScriptNewIcon(control.dataset.preference,
      document.getElementById(control.id + "_customIconCheckbox"), control.id);
  }
  
  function addOnchangeListenerToStringRadiogroupControl(control) {
    function onchangeHandler(anEvent) {
      browser.runtime.sendMessage({
        messageName: "query_eGPrefs",
        methodName: "setCharPref",
        parameter: control.dataset.preference,
        parameter2: anEvent.target.value
      });
    }
    
    var radioElements = control.getElementsByTagName("input");
    for (let i = 0; i < radioElements.length; ++i) {
      radioElements[i].addEventListener("change", onchangeHandler, true);
    }
  }
  
  switch (control.dataset.preferenceType) {
    case "checkboxInput":
      control.addEventListener("change", function() {
        browser.runtime.sendMessage({
          messageName: "query_eGPrefs",
          methodName: "toggleBoolPref",
          parameter: control.dataset.preference,
        });
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
        browser.runtime.sendMessage({
          messageName: "query_eGPrefs",
          methodName: "setIntPref",
          parameter: control.dataset.preference,
          parameter2: control.value
        });
      }, true);
      break;
    case "menu":
      addOnchangeListenerToMenuControl(control);
      break;
    case "select":
      control.addEventListener("change", function() {
        browser.runtime.sendMessage({
          messageName: "query_eGPrefs",
          methodName: "setCharPref",
          parameter: control.dataset.preference,
          parameter2: control.value
        });
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
        browser.runtime.sendMessage({
          messageName: "query_eGPrefs",
          methodName: "setDailyReadingsFolderName",
          parameter: control.value
        });
      }, true);
      break;
  }
}

function setMenuType(anEvent) {
  browser.runtime.sendMessage({
    messageName: "query_eGPrefs",
    methodName: "isLargeMenuOff",
  }).then(aMessage => {
    var menuTypeIsStandard = anEvent === undefined ? aMessage.response :
                                                     !anEvent.target.value;
    ["main", "mainAlt1", "mainAlt2", "extra", "extraAlt1", "extraAlt2",
     "contextLink", "contextImage", "contextSelection", "contextTextbox"]
      .forEach(function(menuName) {
      document.getElementById("menuControl_" + menuName).classList
              .toggle("large", !menuTypeIsStandard);
    });
    ["mainMenuLabel", "extraMenuLabel", "primaryMainMenu", "primaryExtraMenu",
     "alt1MainMenu", "alt1ExtraMenu", "alt2MainMenu", "alt2ExtraMenu",
     "allMenusMainMenu", "allMenusExtraMenu"].forEach(function(id) {
       document.getElementById(id).classList.toggle("large", !menuTypeIsStandard);
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
  browser.runtime.sendMessage({
    messageName: "query_eGPrefs",
    methodName: "areTooltipsOn",
  }).then(aMessage => {
    var shouldBeDisabled = anEvent === undefined ? !aMessage.response :
                                                   !anEvent.target.checked;
    toggleDisabledStatusOnElementsById(["tooltipsActivationDelayLabel",
      "tooltipsActivationDelayInput", "tooltipsActivationDelayUnit"],
      shouldBeDisabled);
  });
}

function setDisabledStatusForOpenLinksMaximumDelay(anEvent) {
  browser.runtime.sendMessage({
    messageName: "query_eGPrefs",
    methodName: "isHandleLinksOn",
  }).then(aMessage => {
    var shouldBeDisabled = anEvent === undefined ? !aMessage.response :
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
  browser.runtime.sendMessage({
    messageName: "query_eGPrefs",
    methodName: "isAutoscrollingOn",
  }).then(aMessage => {
    var shouldBeDisabled = anEvent === undefined ? !aMessage.response :
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
  browser.runtime.sendMessage({
    messageName: "query_eGPrefs",
    methodName: "isMainAlt1MenuEnabled",
  }).then(aMessage => {
    var enabled = anEvent === undefined ? aMessage.response :
                                          anEvent.target.checked;
    setDisabledStatusForMenu("mainAlt1", enabled);
  });
}

function setDisabledStatusForMainAlt2Menu(anEvent) {
  browser.runtime.sendMessage({
    messageName: "query_eGPrefs",
    methodName: "isMainAlt2MenuEnabled",
  }).then(aMessage => {
    var enabled = anEvent === undefined ? aMessage.response :
                                          anEvent.target.checked;
    setDisabledStatusForMenu("mainAlt2", enabled);
  });
}

function setDisabledStatusForExtraAlt1Menu(anEvent) {
  browser.runtime.sendMessage({
    messageName: "query_eGPrefs",
    methodName: "isExtraAlt1MenuEnabled",
  }).then(aMessage => {
    var enabled = anEvent === undefined ? aMessage.response :
                                          anEvent.target.checked;
    setDisabledStatusForMenu("extraAlt1", enabled);
  });
}

function setDisabledStatusForExtraAlt2Menu(anEvent) {
  browser.runtime.sendMessage({
    messageName: "query_eGPrefs",
    methodName: "isExtraAlt2MenuEnabled",
  }).then(aMessage => {
    var enabled = anEvent === undefined ? aMessage.response :
                                          anEvent.target.checked;
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

function initializeClicksByAction() {
  browser.runtime.sendMessage({
    messageName: "query_eGPrefs",
    methodName: "getStatsActionsPref",
  }).then(aMessage => {
    var statsActions = aMessage.response;
    var totalClicks = 0;
    for (let action in statsActions) {
      totalClicks += statsActions[action];
    }
    totalClicks = totalClicks === 0 ? 1 : totalClicks - statsActions.empty;
    
    var container = document.getElementById("stats_clicksByAction");
    
    browser.runtime.sendMessage({
      messageName: "query_eGStrings",
      methodName: "getString",
      parameter: "stats.clicks"
    }).then(aMessage => {
      // we start at the action that follows the "showExtraMenu" action
      var currentAction = eGActions.showExtraMenu.nextAction;
      while (currentAction !== null) {
        let clicksForAction = statsActions[currentAction];
        let count = Math.round(clicksForAction / totalClicks * 1000) / 10;
        if (count > 1) {
          count = Math.round(count);
        }
        
        let div = document.createElement("div");
        eGActions[currentAction].getLocalizedActionName().then(response => {
          div.title = response.response + ": " +
                        clicksForAction + " " + aMessage.response;
        });
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
    container.className = "menu";
    container.classList.toggle("extra", isExtraMenu);
    browser.runtime.sendMessage({
      messageName: "query_eGPrefs",
      methodName: "isLargeMenuOff"
    }).then(aMessage => {
      container.classList.toggle("large", !aMessage.response);
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
  container.className = "menu";
  container.classList.toggle("extra", isExtraMenu);
  browser.runtime.sendMessage({
    messageName: "query_eGPrefs",
    methodName: "isLargeMenuOff"
  }).then(aMessage => {
    container.classList.toggle("large", !aMessage.response);
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
  browser.runtime.sendMessage({
    messageName: "query_eGPrefs",
    methodName: "getStatsMainMenuPref"
  }).then(aMessage => {
    var statsMainArray = aMessage.response;
    initializeClicksByDirectionForMenuLayouts(statsMainArray, false);
    initializeClicksByDirectionTotals(statsMainArray, false);
  });
  
  browser.runtime.sendMessage({
    messageName: "query_eGPrefs",
    methodName: "getStatsExtraMenuPref"
  }).then(aMessage => {
    var statsExtraArray = aMessage.response;
    initializeClicksByDirectionForMenuLayouts(statsExtraArray, true);
    initializeClicksByDirectionTotals(statsExtraArray, true);
  });
}

function loadStats() {
  browser.runtime.sendMessage({
    messageName: "query_eGPrefs",
    methodName: "getStatsLastResetPref",
  }).then(aMessage => {
    document.getElementById("statsLastReset").textContent = aMessage.response;
  });
  
  initializeClicksByAction();
  initializeClicksByDirection();
}

function optionsLoadHandler() {
  document.body.style.cursor = "wait";
  // prefsObserver.register();
  addEventListeners();
  
  browser.runtime.sendMessage({
    messageName: "query_eGStrings",
    methodName: "getString",
    parameter: "preferences"
  }).then(aMessage => {
    document.title = aMessage.response + " " + document.title;
  });
  var elementsToLocalize = document.querySelectorAll("[data-l10n]");
  var stringIDs = [];
  for (let i=0; i < elementsToLocalize.length; i++) {
    stringIDs.push(elementsToLocalize[i].dataset.l10n);
  }
  browser.runtime.sendMessage({
    messageName: "getLocalizedStrings",
    stringIDs: stringIDs
  }).then(aMessage => {
    for (let i=0; i < elementsToLocalize.length; ++i) {
      elementsToLocalize[i].textContent = aMessage.response[i];
    }
  });
  
  createRegularMenuControls();
  createExtraMenuControls();
  browser.runtime.sendMessage({
    messageName: "getLocalizedStrings",
    stringIDs: ["customizations.URL", "customizations.useFavicon",
                "customizations.openInPrivateWindow", "customizations.code",
                "customizations.useCustomIcon"]
  }).then(aMessage => {
    createLoadURLActions(aMessage.response[0], aMessage.response[1],
                         aMessage.response[2]);
    createRunScriptActions(aMessage.response[3], aMessage.response[4]);
    
    initializePaneAndTabs(document.location.hash);
    loadPreferences(false);
    
    loadStats();
    
    window.setTimeout(function() { window.scrollTo(0, 0); });
    document.body.style.cursor = "auto";
  });
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
  // prefsObserver.unregister();
}

function importPrefs() {
  browser.runtime.sendMessage({
    messageName: "importPrefs"
  }).then(aMessage => {
    if (aMessage.prefsString !== undefined) {
      browser.runtime.sendMessage({
        messageName: "importPrefsFromString",
        prefsString: aMessage.prefsString
      }).then(aMessage => {
        if (aMessage.code === undefined) {
          loadPreferences(true);
        }
        else {
          let nonImportedPreferences = "";
          if (aMessage.prefs !== undefined) {
            nonImportedPreferences += " " + aMessage.prefs;
          }
          browser.runtime.sendMessage({
            messageName: "query_eGStrings",
            methodName: "getString",
            parameter: "general.prefs.import." + aMessage.code
          }).then(aMessage => {
            alert(aMessage.response + nonImportedPreferences);
          });
        }
      });
    }
  });
}

function exportPrefs() {
  browser.runtime.sendMessage({
    messageName: "exportPrefs"
  });
}

function resetPrefs() {
  browser.runtime.sendMessage({
    messageName: "query_eGStrings",
    methodName: "getString",
    parameter: "general.prefs.reset.confirm"
  }).then(aMessage => {
    if (confirm(aMessage.response)) {
      browser.runtime.sendMessage({
        messageName: "query_eGPrefs",
        methodName: "setDefaultSettings"
      }).then(() => {
        loadPreferences(true);
      });
    }
  });
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
  browser.runtime.sendMessage({
    messageName: "query_eGStrings",
    methodName: "getString",
    parameter: "stats.reset.confirm"
  }).then(aMessage => {
    if (confirm(aMessage.response)) {
      browser.runtime.sendMessage({
        messageName: "query_eGPrefs",
        methodName: "initializeStats"
      });
    }
  });
}
