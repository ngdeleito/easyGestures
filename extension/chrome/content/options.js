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


/* exported optionsLoadHandler, optionsHashChangeHandler, optionsUnloadHandler,
            importPrefs, exportPrefs, resetPrefs, updateTextInputElement,
            openOptionsDailyReadings, initializeDailyReadingsTree,
            fireChangeEventOn, preparePreferenceValueForDailyReadings,
            resetStats */
/* global Components, Services, document, eGActions, eGStrings, eGPrefs, window,
          eGUtils, alert, confirm, PlacesUIUtils */

Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("chrome://easygestures/content/eGActions.jsm");
Components.utils.import("chrome://easygestures/content/eGPrefs.jsm");
Components.utils.import("chrome://easygestures/content/eGStrings.jsm");
Components.utils.import("chrome://easygestures/content/eGUtils.jsm");

const DEFAULT_FAVICON_URL = "chrome://easygestures/content/defaultFavicon.svg";

var prefsObserver = {
  register: function() {
    this._branch = Services.prefs.getBranch("extensions.easygestures.");
    this._branch.addObserver("general.startupTips", this, false);
    this._branch.addObserver("activation.", this, false);
    this._branch.addObserver("behavior.", this, false);
    this._branch.addObserver("menus.", this, false);
    this._branch.addObserver("customizations.", this, false);
  },
  
  unregister: function() {
    this._branch.removeObserver("general.startupTips", this);
    this._branch.removeObserver("activation.", this);
    this._branch.removeObserver("behavior.", this);
    this._branch.removeObserver("menus.", this);
    this._branch.removeObserver("customizations.", this);
  },
  
  observe: function(aSubject, aTopic, aData) {
    if (aData === "customizations.dailyReadingsFolderID") {
      return ;
    }
    var prefControl =
          document.querySelector("[data-preference='" + aData + "']");
    initializePreferenceControl(prefControl);
    setPreferenceControlsDisabledStatus();
  }
};

function createActionsSelect() {
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
  
  return select;
}

function createActionsMenulistWithSectorID(name, sectorNumber) {
  var select = createActionsSelect();
  select.id = name + sectorNumber;
  
  if (sectorNumber !== "Sector2" || name.startsWith("extra")) {
    // remove showExtraMenu action
    select.removeChild(select.childNodes[1]);
  }
  
  return select;
}

function createActions() {
  var boxes = new Array(
    "main", "mainAlt1", "mainAlt2", "extra", "extraAlt1", "extraAlt2",
    "contextLink", "contextImage", "contextSelection", "contextTextbox"
  );
  
  for (var i=0; i < boxes.length; i++) {
    var box = document.getElementById("gr_" + boxes[i]);
    
    // sector 2
    let row1 = document.createElement("div");
    row1.className = "row1";
    row1.appendChild(createActionsMenulistWithSectorID(boxes[i], "Sector2"));
    box.appendChild(row1);
    
    // sectors 3 and 1
    let row2 = document.createElement("div");
    row2.className = "row2";
    row2.appendChild(createActionsMenulistWithSectorID(boxes[i], "Sector3"));
    row2.appendChild(createActionsMenulistWithSectorID(boxes[i], "Sector1"));
    box.appendChild(row2);
    
    // sectors 4,5 and 0,9
    let row3 = document.createElement("div");
    row3.className = "row3";
    box.appendChild(row3);
    
    var vbox = document.createElement("div");
    vbox.appendChild(createActionsMenulistWithSectorID(boxes[i], "Sector4"));
    if (!boxes[i].startsWith("extra")) {
      vbox.appendChild(createActionsMenulistWithSectorID(boxes[i], "Sector5"));
    }
    row3.appendChild(vbox);
    
    var image = document.createElement("img");
    image.setAttribute("id", boxes[i]+"Image");
    if (!boxes[i].startsWith("extra")) {
      image.setAttribute("src", "mainMenu.png");
    }
    else {
      image.setAttribute("src", "extraMenu.png");
    }
    image.setAttribute("width", "41");
    image.setAttribute("height", "41");
    row3.appendChild(image);
    
    vbox = document.createElement("div");
    vbox.appendChild(createActionsMenulistWithSectorID(boxes[i], "Sector0"));
    if (!boxes[i].startsWith("extra")) {
      vbox.appendChild(createActionsMenulistWithSectorID(boxes[i], "Sector9"));
    }
    row3.appendChild(vbox);
    
    if (!boxes[i].startsWith("extra")) {
      // sectors 6 and 8
      let row2 = document.createElement("div");
      row2.className = "row2";
      row2.appendChild(createActionsMenulistWithSectorID(boxes[i], "Sector6"));
      row2.appendChild(createActionsMenulistWithSectorID(boxes[i], "Sector8"));
      box.appendChild(row2);
      
      // sector 7
      let row1 = document.createElement("div");
      row1.className = "row1";
      row1.appendChild(createActionsMenulistWithSectorID(boxes[i], "Sector7"));
      box.appendChild(row1);
    }
  }
}

function createHeaderForAction(actionName) {
  var h1 = document.createElement("h1");
  
  var span = document.createElement("span");
  span.className = "eG_" + actionName;
  h1.appendChild(span);
  
  span = document.createElement("span");
  span.textContent = eGStrings.getString(actionName);
  h1.appendChild(span);
  
  return h1;
}

function createTooltipRowForAction(actionName) {
  var tr = document.createElement("tr");
  
  var th = document.createElement("th");
  th.textContent = eGStrings.getString("customizations.tooltip");
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
    th.textContent = eGStrings.getString("customizations.URL");
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
    label.textContent = eGStrings.getString("customizations.useFavicon");
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
      eGStrings.getString("customizations.openInPrivateWindow");
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
    th.textContent = eGStrings.getString("customizations.code");
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
    input.id = actionName + "_newIconCheckbox";
    input.type = "checkbox";
    td.appendChild(input);
    var label = document.createElement("label");
    label.htmlFor = input.id;
    label.textContent = eGStrings.getString("customizations.changeIcon");
    td.appendChild(label);
    var img = document.createElement("img");
    img.id = actionName + "_newIcon";
    img.src = DEFAULT_FAVICON_URL;
    td.appendChild(img);
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
    if (url.match(/\:\/\//i) === null) {
      url = "http://" + url;
    }
    var faviconService = Components
                           .classes["@mozilla.org/browser/favicon-service;1"]
                           .getService(Components.interfaces.mozIAsyncFavicons);
    faviconService.getFaviconURLForPage(Services.io.newURI(url, null, null), function(aURI) {
      document.getElementById(actionName + "_favicon").src =
        aURI !== null ? aURI.spec : DEFAULT_FAVICON_URL;
    });
  }
}

function readLoadURLPreference(actionName) {
  var prefValue = eGPrefs.getLoadURLOrRunScriptPrefValue(actionName);
  
  document.getElementById(actionName + "_tooltip").value = prefValue[0];
  document.getElementById(actionName + "_URL").value = prefValue[1];
  var isFaviconEnabled = prefValue[2] === "true";
  document.getElementById(actionName + "_faviconCheckbox").checked =
    isFaviconEnabled;
  if (isFaviconEnabled) {
    addFavicon(prefValue[1], actionName);
  }
  else {
    document.getElementById(actionName + "_favicon").src = DEFAULT_FAVICON_URL;
  }
  document.getElementById(actionName + "_openInPrivateWindowCheckbox").checked =
    prefValue[3] === "true";
}

function readRunScriptPreference(actionName) {
  var prefValue = eGPrefs.getLoadURLOrRunScriptPrefValue(actionName);
  
  document.getElementById(actionName + "_tooltip").value = prefValue[0];
  document.getElementById(actionName + "_code").value = prefValue[1];
  var isIconEnabled = prefValue[2] !== "";
  document.getElementById(actionName + "_newIconCheckbox").checked =
    isIconEnabled;
  document.getElementById(actionName + "_newIcon").src =
    isIconEnabled ? prefValue[2] : DEFAULT_FAVICON_URL;
}

function initializePreferenceControl(control) {
  function initializeSelectWithTextInputControl(control) {
    var prefValue = eGPrefs.getIntPref(control.dataset.preference);
    var aSelectElement = control.firstElementChild;
    var aLabelElement = aSelectElement.nextElementSibling;
    var aTextInputElement = aLabelElement.nextElementSibling;
    aSelectElement.selectedIndex = prefValue < 3 ? prefValue : 3;
    aTextInputElement.value = prefValue;
    var shouldBeDisabled = prefValue < 3;
    aLabelElement.classList.toggle("disabled", shouldBeDisabled);
    aTextInputElement.disabled = shouldBeDisabled;
  }
  
  function initializeIntRadiogroupWithResetOnDuplicatedKeysControl(control) {
    var prefValue = eGPrefs.getIntPref(control.dataset.preference);
    control.querySelector("input[value='" + prefValue + "']").checked = true;
  }
  
  function initializeBoolRadiogroupControl(control) {
    var prefValue = eGPrefs.getBoolPref(control.dataset.preference);
    var childIndexToSet = prefValue ? 1 : 0;
    control.getElementsByTagName("input")[childIndexToSet].checked = true;
  }
  
  function initializeMenuControl(control) {
    var prefValue = eGPrefs.getMenuPrefAsArray(control.dataset.preference);
    var menuPrefix = control.dataset.preference.replace("menus.", "");
    prefValue.forEach(function(value, index) {
      document.getElementById(menuPrefix + "Sector" + index)
              .querySelector("[value=" + value + "]").selected = true;
    });
  }
  
  function initializeSelectControl(control) {
    var prefValue = eGPrefs.getCharPref(control.dataset.preference);
    control.querySelector("[value=" + prefValue + "]").selected = true;
  }
  
  function initializeStringRadiogroup(control) {
    var prefValue = eGPrefs.getCharPref(control.dataset.preference);
    control.querySelector("[value=" + prefValue + "]").checked = true;
  }
  
  switch (control.dataset.preferenceType) {
    case "checkboxInput":
      control.checked = eGPrefs.getBoolPref(control.dataset.preference);
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
      control.value = eGPrefs.getIntPref(control.dataset.preference);
      break;
    case "menu":
      initializeMenuControl(control);
      break;
    case "select":
      initializeSelectControl(control);
      break;
    case "loadURL":
      readLoadURLPreference(control.id);
      break;
    case "runScript":
      readRunScriptPreference(control.id);
      break;
    case "stringRadiogroup":
      initializeStringRadiogroup(control);
      break;
  }
}

function preparePreferenceValueForLoadURL(actionName) {
  var string = Components.classes["@mozilla.org/supports-string;1"]
                       .createInstance(Components.interfaces.nsISupportsString);
  string.data = document.getElementById(actionName + "_tooltip").value +
    "\u2022" + document.getElementById(actionName + "_URL").value +
    "\u2022" + document.getElementById(actionName + "_faviconCheckbox").checked +
    "\u2022" +
    document.getElementById(actionName + "_openInPrivateWindowCheckbox").checked;
  return string;
}

function addEventListenerToLoadURLTooltip(aPrefName, element, actionName) {
  element.addEventListener("change", function() {
    eGPrefs.setLoadURLOrRunScriptPrefValue(aPrefName,
      preparePreferenceValueForLoadURL(actionName));
  }, false);
}

function addEventListenerToLoadURLURL(aPrefName, element, actionName) {
  element.addEventListener("change", function() {
    if (document.getElementById(actionName + "_faviconCheckbox").checked) {
      addFavicon(this.value, actionName);
    }
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
    eGPrefs.setLoadURLOrRunScriptPrefValue(aPrefName,
      preparePreferenceValueForLoadURL(actionName));
  }, false);
}

function addEventListenerToLoadURLOpenInPrivateWindow(aPrefName, element, actionName) {
  element.addEventListener("change", function() {
    eGPrefs.setLoadURLOrRunScriptPrefValue(aPrefName,
      preparePreferenceValueForLoadURL(actionName));
  });
}

function preparePreferenceValueForRunScript(actionName) {
  var string = Components.classes["@mozilla.org/supports-string;1"]
                       .createInstance(Components.interfaces.nsISupportsString);
  string.data = document.getElementById(actionName + "_tooltip").value +
    "\u2022" + document.getElementById(actionName + "_code").value + "\u2022";
  var iconURL = document.getElementById(actionName + "_newIcon").src;
  string.data += iconURL === DEFAULT_FAVICON_URL ? "" : iconURL;
  return string;
}

function addEventListenerToRunScriptTooltip(aPrefName, element, actionName) {
  element.addEventListener("change", function() {
    eGPrefs.setLoadURLOrRunScriptPrefValue(aPrefName,
      preparePreferenceValueForRunScript(actionName));
  }, false);
}

function addEventListenerToRunScriptCode(aPrefName, element, actionName) {
  element.addEventListener("change", function() {
    eGPrefs.setLoadURLOrRunScriptPrefValue(aPrefName,
      preparePreferenceValueForRunScript(actionName));
  }, false);
}

function retrieveCustomIconFile(actionName) {
  var fp = Components.classes["@mozilla.org/filepicker;1"]
                     .createInstance(Components.interfaces.nsIFilePicker);
  fp.init(window, null, Components.interfaces.nsIFilePicker.modeOpen);
  fp.appendFilters(Components.interfaces.nsIFilePicker.filterImages);
  
  var returnValue = fp.show();
  var returnedOK = returnValue === Components.interfaces.nsIFilePicker.returnOK;
  if (returnedOK) {
    document.getElementById(actionName + "_newIcon").src = "file://" +
      fp.file.path;
  }
  return returnedOK;
}

function addEventListenerToRunScriptNewIcon(aPrefName, element, actionName) {
  element.addEventListener("change", function() {
    if (this.checked) {
      this.checked = retrieveCustomIconFile(actionName);
    }
    else {
      document.getElementById(actionName + "_newIcon").src =
        DEFAULT_FAVICON_URL;
    }
    eGPrefs.setLoadURLOrRunScriptPrefValue(aPrefName,
      preparePreferenceValueForRunScript(actionName));
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
        eGPrefs.setIntPref(control.dataset.preference,
                           aSelectElement.selectedIndex);
      }
      else {
        aTextInputElement.focus();
      }
    }, true);
    aTextInputElement.addEventListener("change", function(anEvent) {
      eGPrefs.setIntPref(control.dataset.preference, anEvent.target.value);
    }, true);
  }
  
  function addOnchangeListenerToIntRadiogroupWithResetOnDuplicatedKeysControl(control) {
    function onchangeHandler(anEvent) {
      writeOrResetPrefOnDuplicatedKeys(anEvent, control.dataset.preference);
    }
    
    var radioElements = control.getElementsByTagName("input");
    for (let i = 0; i < radioElements.length; ++i) {
      radioElements[i].addEventListener("change", onchangeHandler, true);
    }
  }
  
  function addOnchangeListenerToBoolRadiogroupControl(control) {
    function onchangeHandler(anEvent) {
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
      var menuName = control.dataset.preference.replace("menus.", "");
      var menuIndexes = menuName.startsWith("extra") ?
                          [0, 1, 2, 3, 4] : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
      var prefValueAsArray = menuIndexes.map(function(value) {
        return document.getElementById(menuName + "Sector" + value).value;
      });
      
      eGPrefs.setMenuPref(control.dataset.preference, prefValueAsArray);
    }
    
    var selectElements = control.getElementsByTagName("select");
    for (let i = 0; i < selectElements.length; ++i) {
      selectElements[i].addEventListener("change", onchangeHandler, true);
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
      document.getElementById(control.id + "_newIconCheckbox"), control.id);
  }
  
  function addOnchangeListenerToStringRadiogroupControl(control) {
    function onchangeHandler(anEvent) {
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
        eGPrefs.setIntPref(control.dataset.preference, control.value);
      }, true);
      break;
    case "menu":
      addOnchangeListenerToMenuControl(control);
      break;
    case "select":
      control.addEventListener("change", function() {
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
  }
}

function setMenuType(menuTypeIsStandard) {
  ["mainSector5", "mainSector9", "mainAlt1Sector5", "mainAlt1Sector9",
   "mainAlt2Sector5", "mainAlt2Sector9", "contextLinkSector5",
   "contextLinkSector9", "contextImageSector5", "contextImageSector9",
   "contextSelectionSector5", "contextSelectionSector9",
   "contextTextboxSector5", "contextTextboxSector9"].forEach(function(id) {
    document.getElementById(id).style.display =
      menuTypeIsStandard ? "none" : "block";
  });
}

function toggleDisabledStatusOnElementsById(ids, shouldBeDisabled) {
  ids.forEach(function(id) {
    document.getElementById(id).classList.toggle("disabled", shouldBeDisabled);
  });
  document.getElementById(ids[1]).readOnly = shouldBeDisabled;
}

function setDisabledStatusForTooltipsActivationDelay(shouldBeDisabled) {
  toggleDisabledStatusOnElementsById(["tooltipsActivationDelayLabel",
    "tooltipsActivationDelayInput", "tooltipsActivationDelayUnit"],
    shouldBeDisabled);
}

function setDisabledStatusForOpenLinksMaximumDelay(shouldBeDisabled) {
  toggleDisabledStatusOnElementsById(["openLinksMaximumDelayLabel",
    "openLinksMaximumDelayInput", "openLinksMaximumDelayUnit",
    "openLinksThroughPieMenuCenterConfiguration"], shouldBeDisabled);
  var radioElements =
        document.getElementById("openLinksThroughPieMenuCenterConfiguration")
                .getElementsByTagName("input");
  radioElements[0].disabled = shouldBeDisabled;
  radioElements[1].disabled = shouldBeDisabled;
}

function setDisabledStatusForAutoscrollingActivationDelay(shouldBeDisabled) {
  toggleDisabledStatusOnElementsById(["autoscrollingActivationDelayLabel",
    "autoscrollingActivationDelayInput", "autoscrollingActivationDelayUnit"],
    shouldBeDisabled);
}

function setDisabledStatusForMainMenu(menu, disabled) {
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(function(sector) {
    document.getElementById("main" + menu + "Sector" + sector).disabled =
      !disabled;
  });
}

function setDisabledStatusForExtraMenu(menu, disabled) {
  [0, 1, 2, 3, 4].forEach(function(sector) {
    document.getElementById("extra" + menu + "Sector" + sector).disabled =
      !disabled;
  });
}

function setPreferenceControlsDisabledStatus() {
  setMenuType(eGPrefs.isLargeMenuOff());
  setDisabledStatusForTooltipsActivationDelay(!eGPrefs.areTooltipsOn());
  setDisabledStatusForOpenLinksMaximumDelay(!eGPrefs.isHandleLinksOn());
  setDisabledStatusForAutoscrollingActivationDelay(!eGPrefs.isAutoscrollingOn());
  setDisabledStatusForMainMenu("Alt1", eGPrefs.isMainAlt1MenuEnabled());
  setDisabledStatusForMainMenu("Alt2", eGPrefs.isMainAlt2MenuEnabled());
  setDisabledStatusForExtraMenu("Alt1", eGPrefs.isExtraAlt1MenuEnabled());
  setDisabledStatusForExtraMenu("Alt2", eGPrefs.isExtraAlt2MenuEnabled());
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

function optionsLoadHandler() {
  document.body.style.cursor = "wait";
  prefsObserver.register();
  
  eGUtils.setDocumentTitle(document, "preferences");
  var elements = document.querySelectorAll("[data-l10n]");
  for (let i=0; i < elements.length; ++i) {
    elements[i].textContent = eGStrings.getString(elements[i].dataset.l10n);
  }
  
  createActions();
  createLoadURLActions();
  createRunScriptActions();
  
  initializePaneAndTabs(document.location.hash);
  loadPreferences(false);
  
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
  prefsObserver.unregister();
}

function importPrefs() {
  var fp = Components.classes["@mozilla.org/filepicker;1"]
                     .createInstance(Components.interfaces.nsIFilePicker);
  fp.init(window, "easyGestures N", Components.interfaces.nsIFilePicker.modeOpen);
  fp.appendFilters(Components.interfaces.nsIFilePicker.filterAll);
  var returnValue = fp.show();
  if (returnValue === Components.interfaces.nsIFilePicker.returnOK) {
    var inputStream = Components
                      .classes["@mozilla.org/network/file-input-stream;1"]
                      .createInstance(Components.interfaces.nsIFileInputStream);
    inputStream.init(fp.file, 0x01, 444, 0);
    
    var converterInputStream = Components
                 .classes["@mozilla.org/intl/converter-input-stream;1"]
                 .createInstance(Components.interfaces.nsIConverterInputStream);
    converterInputStream.init(inputStream, "UTF-8", 0, 0xFFFD);
    var content = {};
    var aString = "";
    while (converterInputStream.readString(4096, content) !== 0) {
      aString += content.value;
    }
    
    try {
      eGPrefs.importPrefsFromString(aString);
      loadPreferences(true);
    }
    catch (exception) {
      let nonImportedPreferences = "";
      if (exception.prefs !== undefined) {
        nonImportedPreferences += " " + exception.prefs;
      }
      alert(eGStrings.getString("general.prefs.import." + exception.code) +
            nonImportedPreferences);
    }
    converterInputStream.close();
    inputStream.close();
  }
}

function exportPrefs() {
  var fp = Components.classes["@mozilla.org/filepicker;1"]
                     .createInstance(Components.interfaces.nsIFilePicker);
  fp.init(window, "easyGestures N", Components.interfaces.nsIFilePicker.modeSave);
  fp.appendFilters(Components.interfaces.nsIFilePicker.filterAll);
  fp.defaultString = "easyGesturesNPreferences-" + (new Date()).toISOString() +
                     ".json";
  var returnValue = fp.show();
  if (returnValue === Components.interfaces.nsIFilePicker.returnOK ||
      returnValue === Components.interfaces.nsIFilePicker.returnReplace) {
    var outputStream = Components
                     .classes[ "@mozilla.org/network/file-output-stream;1"]
                     .createInstance(Components.interfaces.nsIFileOutputStream);
    outputStream.init(fp.file, 0x04 | 0x08, 420, 0);
    
    var converterOutputStream = Components
                .classes["@mozilla.org/intl/converter-output-stream;1"]
                .createInstance(Components.interfaces.nsIConverterOutputStream);
    converterOutputStream.init(outputStream, "UTF-8", 0, 0x0000);
    converterOutputStream.writeString(eGPrefs.exportPrefsToString());
    converterOutputStream.close();
    outputStream.close();
  }
}

function resetPrefs() {
  if (confirm(eGStrings.getString("general.prefs.reset"))) {
    eGPrefs.setDefaultSettings();
    loadPreferences(true);
  }
}

function writeOrResetPrefOnDuplicatedKeys(anEvent, aPrefName) {
  var showKey = document
        .querySelectorAll("[name='showKeyRadiogroup']:checked")[0].value;
  var preventOpenKey = document
        .querySelectorAll("[name='preventOpenKeyRadiogroup']:checked")[0].value;
  var contextKey = document
        .querySelectorAll("[name='contextualMenuKeyRadiogroup']:checked")[0]
        .value;
  
  if ((showKey !== "0" &&
       (showKey === preventOpenKey || showKey === contextKey)) ||
      (preventOpenKey !== "0" && (preventOpenKey === contextKey))) {
    let currentValue = eGPrefs.getIntPref(aPrefName);
    anEvent.target.parentElement.parentElement
           .querySelector("[value='" + currentValue + "']").checked = true;
    alert(eGStrings.getString("activation.duplicateKey"));
  }
  else {
    eGPrefs.setIntPref(aPrefName, anEvent.target.value);
  }
}

function updateTextInputElement(aTextInputElement, anEvent) {
  anEvent.preventDefault();
  if (aTextInputElement.parentElement.firstElementChild.selectedIndex < 3) {
    return ;
  }
  
  aTextInputElement.value = anEvent.button;
  aTextInputElement.dispatchEvent(new window.Event("change"));
}

function openOptionsDailyReadings() {
  var openWindows = Services.wm.getEnumerator(null);
  var found = false;
  var openWindow;
  
  while (openWindows.hasMoreElements() && !found) {
    openWindow = openWindows.getNext();
    found = openWindow.location.href ===
              "chrome://easygestures/content/options.xul";
  }
  if (found) {
    openWindow.focus();
  }
  else {
    openWindow.openDialog("chrome://easygestures/content/options.xul", "", "");
  }
}

function initializeDailyReadingsTree() {
  eGUtils.setDocumentTitle(document, "customizations.dailyReadings");
  document.getElementById("dailyReadingsFolderSelectionLabel").value =
    eGStrings.getString("customizations.dailyReadings.folderSelection");
  
  var historyService = Components.classes["@mozilla.org/browser/nav-history-service;1"]
                                 .getService(Components.interfaces.nsINavHistoryService);
  var query = historyService.getNewQuery();
  query.setFolders([PlacesUIUtils.allBookmarksFolderId], 1);
  var options = historyService.getNewQueryOptions();
  options.excludeItems = true;
  
  var tree = document.getElementById("dailyReadingsTree");
  tree.load([query], options);
  tree.selectItems([eGPrefs.getDailyReadingsFolderID()]);
}

function fireChangeEventOn(element) {
  // firing a change event triggers XUL's preferences system to change the
  // value of the preference
  var event = document.createEvent("Event");
  event.initEvent("change", true, false);
  element.dispatchEvent(event);
}

function preparePreferenceValueForDailyReadings(aTreeElement) {
  var currentTreeIndex = aTreeElement.view.selection.currentIndex;
  if (currentTreeIndex === -1) {
    // just return when there is no selection yet
    return undefined;
  }
  else {
    return aTreeElement.view.nodeForTreeIndex(currentTreeIndex).itemId;
  }
}

function resetStats() {
  if (confirm(eGStrings.getString("general.stats.reset"))) {
    eGPrefs.initializeStats();
  }
}
