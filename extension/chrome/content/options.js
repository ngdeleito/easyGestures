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

/* exported preventCloseOnEnter, exportPrefs, importPrefs, initMenuDialog,
            saveAllPreferences, preparePreferenceValueForNormalMenu,
            preparePreferenceValueForExtraMenu,
            preparePreferenceValueForLoadURL,
            preparePreferenceValueForRunScript,
            preparePreferenceValueForDailyReadings, resetOnDuplicatedKeys */
/* global Components, document, window, Services, eGActions, eGPrefs, eGStrings,
          PlacesUIUtils, alert */

Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("chrome://easygestures/content/eGActions.jsm");
Components.utils.import("chrome://easygestures/content/eGPrefs.jsm");
Components.utils.import("chrome://easygestures/content/eGStrings.jsm");
Components.utils.import("chrome://easygestures/content/eGUtils.jsm");

function addEventListenerToTooltip(element, actionName) {
  element.addEventListener("change", function() {
    fireChangeEventOnElementWithID(actionName);
  }, false);
}

function addEventListenerToLoadURLURL(element, actionName) {
  element.addEventListener("change", function() {
    if (document.getElementById(actionName + "_faviconCheckbox").checked) {
      addFavicon(this.value, actionName);
    }
    fireChangeEventOnElementWithID(actionName);
  }, false);
}

function addEventListenerToLoadURLFavicon(element, actionName) {
  element.addEventListener("command", function() {
    if (this.checked) {
      addFavicon(document.getElementById(actionName + "_URL").value,
                      actionName);
    }
    else {
      document.getElementById(actionName + "_favicon").src = "";
    }
    fireChangeEventOnElementWithID(actionName);
  }, false);
}

function addEventListenerToLoadURLOpenInPrivateWindow(element, actionName) {
  element.addEventListener("command", function() {
    fireChangeEventOnElementWithID(actionName);
  });
}

function addEventListenerToRunScriptCode(element, actionName) {
  element.addEventListener("change", function() {
    fireChangeEventOnElementWithID(actionName);
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

function addEventListenerToRunScriptNewIcon(element, actionName) {
  element.addEventListener("command", function() {
    if (this.checked) {
      this.checked = retrieveCustomIconFile(actionName);
    }
    else {
      document.getElementById(actionName + "_newIcon").src = "";
    }
    fireChangeEventOnElementWithID(actionName);
  }, false);
}

function createHeaderForAction(actionName) {
  var hbox = document.createElement("hbox");
  hbox.setAttribute("align", "center");
  
  var image = document.createElement("image");
  image.setAttribute("class", "eG_" + actionName);
  hbox.appendChild(image);
  
  var label = document.createElement("label");
  label.setAttribute("value", eGStrings.getString(actionName));
  label.setAttribute("style", "font-weight: bold;");
  hbox.appendChild(label);
  
  return hbox;
}

function createTooltipRowForAction(actionName) {
  var row = document.createElement("row");
  row.setAttribute("align", "center");
  
  var label = document.createElement("label");
  label.setAttribute("value", eGStrings.getString("customizations.tooltip"));
  row.appendChild(label);
  
  var textbox = document.createElement("textbox");
  textbox.setAttribute("id", actionName + "_tooltip");
  textbox.setAttribute("maxlength", "20");
  textbox.setAttribute("maxwidth", "220");
  addEventListenerToTooltip(textbox, actionName);
  row.appendChild(textbox);
  
  return row;
}

function createLoadURLActions() {
  for (var i=1; i <= 10; ++i) {
    var actionName = "loadURL" + i;
    var vbox = document.getElementById(actionName);
    while (vbox.firstChild !== null) {
      vbox.removeChild(vbox.firstChild);
    }
    
    vbox.appendChild(createHeaderForAction(actionName));
    
    var separator = document.createElement("separator");
    separator.setAttribute("class", "thin");
    vbox.appendChild(separator);
    
    var grid = document.createElement("grid");
    var columns = document.createElement("columns");
    columns.appendChild(document.createElement("column"));
    columns.appendChild(document.createElement("column"));
    grid.appendChild(columns);
    
    var rows = document.createElement("rows");
    rows.appendChild(createTooltipRowForAction(actionName));
    
    var row = document.createElement("row");
    row.setAttribute("align", "center");
    
    var label = document.createElement("label");
    label.setAttribute("value", eGStrings.getString("customizations.URL"));
    row.appendChild(label);
    
    var textbox = document.createElement("textbox");
    textbox.setAttribute("id", actionName + "_URL");
    textbox.setAttribute("size", "50");
    addEventListenerToLoadURLURL(textbox, actionName);
    row.appendChild(textbox);
    rows.appendChild(row);
    
    row = document.createElement("row");
    row.setAttribute("align", "center");
    
    row.appendChild(document.createElement("hbox"));
    
    var hbox = document.createElement("hbox");
    hbox.setAttribute("align", "center");
    
    var checkbox = document.createElement("checkbox");
    checkbox.setAttribute("id", actionName + "_faviconCheckbox");
    checkbox.setAttribute("label",
      eGStrings.getString("customizations.useFavicon"));
    addEventListenerToLoadURLFavicon(checkbox, actionName);
    hbox.appendChild(checkbox);
    
    separator = document.createElement("separator");
    separator.setAttribute("orient", "vertical");
    separator.setAttribute("class", "thin");
    hbox.appendChild(separator);
    
    var image = document.createElement("image");
    image.setAttribute("id", actionName + "_favicon");
    image.setAttribute("src", "");
    image.setAttribute("maxwidth", "20");
    image.setAttribute("maxheight", "20");
    hbox.appendChild(image);
    row.appendChild(hbox);
    rows.appendChild(row);
    
    row = document.createElement("row");
    row.setAttribute("align", "center");
    
    row.appendChild(document.createElement("hbox"));
    
    hbox = document.createElement("hbox");
    
    checkbox = document.createElement("checkbox");
    checkbox.setAttribute("id", actionName + "_openInPrivateWindowCheckbox");
    checkbox.setAttribute("label",
      eGStrings.getString("customizations.openInPrivateWindow"));
    addEventListenerToLoadURLOpenInPrivateWindow(checkbox, actionName);
    hbox.appendChild(checkbox);
    
    row.appendChild(hbox);
    rows.appendChild(row);
    grid.appendChild(rows);
    vbox.appendChild(grid);
    
    readLoadURLPreference(actionName);
  }
}

function createRunScriptActions() {
  for (var i=1; i <= 10; ++i) {
    var actionName = "runScript" + i;
    var vbox = document.getElementById(actionName);
    while (vbox.firstChild !== null) {
      vbox.removeChild(vbox.firstChild);
    }
    
    vbox.appendChild(createHeaderForAction(actionName));
    
    var separator = document.createElement("separator");
    separator.setAttribute("class", "thin");
    vbox.appendChild(separator);
    
    var grid = document.createElement("grid");
    var columns = document.createElement("columns");
    columns.appendChild(document.createElement("column"));
    columns.appendChild(document.createElement("column"));
    grid.appendChild(columns);
    
    var rows = document.createElement("rows");
    rows.appendChild(createTooltipRowForAction(actionName));
    
    var row = document.createElement("row");
    row.setAttribute("align", "baseline");
    
    var label = document.createElement("label");
    label.setAttribute("value", eGStrings.getString("customizations.code"));
    row.appendChild(label);
    
    var textbox = document.createElement("textbox");
    textbox.setAttribute("id", actionName + "_code");
    textbox.setAttribute("multiline", "true");
    textbox.setAttribute("cols", "50");
    textbox.setAttribute("rows", "7");
    addEventListenerToRunScriptCode(textbox, actionName);
    row.appendChild(textbox);
    rows.appendChild(row);
    
    row = document.createElement("row");
    row.setAttribute("align", "center");
    
    row.appendChild(document.createElement("hbox"));
    
    var hbox = document.createElement("hbox");
    hbox.setAttribute("align", "center");
    
    var checkbox = document.createElement("checkbox");
    checkbox.setAttribute("id", actionName + "_newIconCheckbox");
    checkbox.setAttribute("label",
      eGStrings.getString("customizations.changeIcon"));
    addEventListenerToRunScriptNewIcon(checkbox, actionName);
    hbox.appendChild(checkbox);
    
    separator = document.createElement("separator");
    separator.setAttribute("orient", "vertical");
    separator.setAttribute("class", "thin");
    hbox.appendChild(separator);
    
    var image = document.createElement("image");
    image.setAttribute("id", actionName + "_newIcon");
    image.setAttribute("src", "");
    image.setAttribute("maxwidth", "20");
    image.setAttribute("maxheight", "20");
    hbox.appendChild(image);
    
    row.appendChild(hbox);
    rows.appendChild(row);
    grid.appendChild(rows);
    vbox.appendChild(grid);
    
    readRunScriptPreference(actionName);
  }
}

function createActionsMenulistWithSectorID(name, sectorNumber) {
  var hbox = document.createElement("hbox");
  hbox.setAttribute("pack", "center");
  
  var menulist = document.createElement("menulist");
  menulist.setAttribute("id", name + sectorNumber);
  menulist.setAttribute("editable", "false");
  menulist.setAttribute("width", "150");
  menulist.setAttribute("crop", "end");
  menulist.setAttribute("sizetopopup", "false");
  menulist.setAttribute("actionName", "");
  menulist.addEventListener("command", function() {
    this.setAttribute("actionName", this.selectedItem.getAttribute("actionName"));
    fireChangeEventOnActionsGroup(name);
  }, false);
  menulist.addEventListener("mousedown", function() {
    attachMenupopup(this);
  }, false);

  hbox.appendChild(menulist);
  return hbox;
}

function createActions() {
  var boxes = new Array(
    "main", "mainAlt1", "mainAlt2", "extra", "extraAlt1", "extraAlt2",
    "contextLink", "contextImage", "contextSelection", "contextTextbox"
  );
  
  for (var i=0; i < boxes.length; i++) {
    var box = document.getElementById("gr_" + boxes[i]);
    
    // empty box if needed first
    if (box.hasChildNodes()) {
      while (box.lastChild !== null) {
        box.removeChild(box.lastChild);
      }
    }
    
    // sector 2
    box.appendChild(createActionsMenulistWithSectorID(boxes[i], "Sector2"));
    
    // sectors 3 and 1
    var hbox = document.createElement("hbox");
    hbox.setAttribute("pack", "center");
    
    hbox.appendChild(createActionsMenulistWithSectorID(boxes[i], "Sector3"));
    
    var spacer = document.createElement("spacer");
    spacer.setAttribute("height", "0");
    spacer.setAttribute("width", "11px");
    hbox.appendChild(spacer);
    
    hbox.appendChild(createActionsMenulistWithSectorID(boxes[i], "Sector1"));
    box.appendChild(hbox);
    
    // sectors 4,5 and 0,9
    hbox = document.createElement("hbox");
    hbox.setAttribute("pack", "center");
    box.appendChild(hbox);
    
    var vbox = document.createElement("vbox");
    vbox.setAttribute("pack", "center");
    hbox.appendChild(vbox);
    
    vbox.appendChild(createActionsMenulistWithSectorID(boxes[i], "Sector4"));
    
    if (!boxes[i].startsWith("extra")) {
      vbox.appendChild(createActionsMenulistWithSectorID(boxes[i], "Sector5"));
    }
    
    ///////////////////////////////
    vbox = document.createElement("vbox");
    hbox.appendChild(vbox);
    
    spacer = document.createElement("spacer");
    spacer.setAttribute("flex", "1");
    vbox.appendChild(spacer);
    
    var image = document.createElement("image");
    image.setAttribute("id", boxes[i]+"Image");
    if (!boxes[i].startsWith("extra")) {
      image.setAttribute("src", "mainMenu.png");
    }
    else {
      image.setAttribute("src", "extraMenu.png");
    }
    image.setAttribute("width", "41");
    image.setAttribute("height", "41");
    vbox.appendChild(image);
    
    spacer = document.createElement("spacer");
    spacer.setAttribute("flex", "1");
    vbox.appendChild(spacer);
    ///////////////////////////////
    
    vbox = document.createElement("vbox");
    vbox.setAttribute("pack", "center");
    hbox.appendChild(vbox);
    
    vbox.appendChild(createActionsMenulistWithSectorID(boxes[i], "Sector0"));
    
    if (!boxes[i].startsWith("extra")) {
      vbox.appendChild(createActionsMenulistWithSectorID(boxes[i], "Sector9"));
    }
    
    if (!boxes[i].startsWith("extra")) {
      // sectors 6 and 8
      hbox = document.createElement("hbox");
      hbox.setAttribute("pack", "center");
      
      hbox.appendChild(createActionsMenulistWithSectorID(boxes[i], "Sector6"));
      
      spacer = document.createElement("spacer");
      spacer.setAttribute("height", "0");
      spacer.setAttribute("width", "11px");
      hbox.appendChild(spacer);
      
      hbox.appendChild(createActionsMenulistWithSectorID(boxes[i], "Sector8"));
      box.appendChild(hbox);
      
      // sector 7
      box.appendChild(createActionsMenulistWithSectorID(boxes[i], "Sector7"));
    }
    
    readActionsGroupPreference(boxes[i]);
  }
}

function addFavicon(url, actionName) {
  if (url === "") {
    document.getElementById(actionName + "_favicon").src = "";
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
        aURI !== null ? aURI.spec : "";
    });
  }
}

function preventCloseOnEnter(event) {
  if (event.keyCode === 13 && event.target.nodeName === "textbox") {
    if (!event.target.hasAttribute("multiline")) {
      event.preventDefault();
      event.target.parentNode.focus();
    }
  }
}

function createActionsPopupList() {
  var popupNode = document.createElement("menupopup");
  popupNode.setAttribute("maxheight", "500px");
  
  var currentAction = "empty"; // the EmptyAction is the first action
  while (currentAction !== null) {
    let itemNode;
    if (eGActions[currentAction].startsNewGroup) {
      itemNode = document.createElement("menuseparator");
      popupNode.appendChild(itemNode);
    }
    
    itemNode = document.createElement("menuitem");
    var imageNode = document.createElement("image");
    var subItemNode = document.createElement("label");
    
    itemNode.appendChild(imageNode);
    itemNode.appendChild(subItemNode);
    
    itemNode.setAttribute("actionName", currentAction);
    itemNode.setAttribute("crop", "end");
    itemNode.setAttribute("label",
      eGActions[currentAction].getLocalizedActionName());
    itemNode.style.paddingRight = "20px";
    imageNode.setAttribute("class", "eG_" + currentAction);
    
    subItemNode.setAttribute("value",
      eGActions[currentAction].getLocalizedActionName());
    popupNode.appendChild(itemNode);
    
    currentAction = eGActions[currentAction].nextAction;
  }
  
  return popupNode;
}

function attachMenupopup(menulist) {
  if (menulist.firstChild !== null) {
    return;
  }
  
  var clonedMenupopup = createActionsPopupList();
  menulist.appendChild(clonedMenupopup);
  clonedMenupopup.boxObject.firstChild.setAttribute("style", "overflow-x:hidden;"); // boxObject does not exist before menupopup is shown
  
  if (!clonedMenupopup.parentNode.id.endsWith("Sector2") ||
      menulist.id.startsWith("extra")) {
    // remove showExtraMenu action
    clonedMenupopup.removeChild(clonedMenupopup.childNodes[1]);
    clonedMenupopup.removeChild(clonedMenupopup.childNodes[1]);
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

function setMenuType(menuTypeIsStandard) {
  ["mainSector5", "mainSector9", "mainAlt1Sector5", "mainAlt1Sector9",
   "mainAlt2Sector5", "mainAlt2Sector9", "contextLinkSector5",
   "contextLinkSector9", "contextImageSector5", "contextImageSector9",
   "contextSelectionSector5", "contextSelectionSector9",
   "contextTextboxSector5", "contextTextboxSector9"].forEach(function(id) {
    document.getElementById(id).hidden = menuTypeIsStandard;
  });
}

function toggleDisabledStatusOnElementsById(ids, disabled) {
  ids.forEach(function(id) {
    document.getElementById(id).disabled = !disabled;
  });
}

function setDisabledStatusForTooltipsActivationDelay(disabled) {
  toggleDisabledStatusOnElementsById(["tooltipsActivationDelayLabel",
    "tooltipsActivationDelayInput", "tooltipsActivationDelayUnit"], disabled);
}

function setDisabledStatusForOpenLinksMaximumDelay(disabled) {
  toggleDisabledStatusOnElementsById(["openLinksMaximumDelayLabel",
    "openLinksMaximumDelayInput", "openLinksMaximumDelayUnit",
    "openLinksThroughPieMenuCenterConfiguration"], disabled);
}

function setDisabledStatusForAutoscrollingActivationDelay(disabled) {
  toggleDisabledStatusOnElementsById(["autoscrollingActivationDelayLabel",
    "autoscrollingActivationDelayInput", "autoscrollingActivationDelayUnit"],
    disabled);
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

function initializeDailyReadingsTree() {
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

function initMenuDialog() {
  window.setCursor("wait");
  
  document.title = eGStrings.getString("preferences") + " " + document.title;
  document.getAnonymousElementByAttribute(document.documentElement, "pane",
    "generalPane").label = eGStrings.getString("general");
  document.getElementById("startupTipsCheckbox").label =
    eGStrings.getString("general.startupTips");
  document.getElementById("managePreferencesLabel").value =
    eGStrings.getString("general.prefs.manage");
  document.getElementById("importPreferences").label =
    eGStrings.getString("general.prefs.import");
  document.getElementById("exportPreferences").label =
    eGStrings.getString("general.prefs.export");
  document.getElementById("resetPreferences").label =
    eGStrings.getString("general.prefs.reset");
  document.getElementById("statisticsLabel").value =
    eGStrings.getString("stats");
  document.getElementById("displayStatistics").label =
    eGStrings.getString("general.stats.display");
  document.getElementById("resetStatistics").label =
    eGStrings.getString("general.stats.reset");
  
  document.getAnonymousElementByAttribute(document.documentElement, "pane",
    "activationPane").label = eGStrings.getString("activation");
  document.getElementById("openWithLabel").value =
    eGStrings.getString("activation.open.with");
  document.getElementById("openWithLeftButton").label =
    document.getElementById("openAltMenuWithLeftButton").label =
    eGStrings.getString("activation.open.with.button.left");
  document.getElementById("openWithMiddleButton").label =
    document.getElementById("openAltMenuWithMiddleButton").label =
    eGStrings.getString("activation.open.with.button.middle");
  document.getElementById("openWithRightButton").label =
    document.getElementById("openAltMenuWithRightButton").label =
    eGStrings.getString("activation.open.with.button.right");
  document.getElementById("openWithCustomButton").label =
    document.getElementById("openAltMenuWithCustomButton").label =
    eGStrings.getString("activation.open.with.button.custom");
  document.getElementById("openWithButtonCodeLabel").value =
    document.getElementById("openAltMenuWithButtonCodeLabel").value =
    eGStrings.getString("activation.open.with.buttoncode");
  document.getElementById("andLabel").value =
    eGStrings.getString("activation.open.with.and");
  document.getElementById("openWithShiftKey").label =
    eGStrings.getString("activation.shiftKey");
  document.getElementById("openWithCtrlKey").label =
    document.getElementById("preventOpenWithCtrlKey").label =
    document.getElementById("contextualMenuWithCtrlKey").label =
    eGStrings.getString("activation.ctrlKey");
  document.getElementById("openWithNoneOfTheseKeys").label =
    document.getElementById("preventOpenWithNoneOfTheseKeys").label =
    document.getElementById("contextualMenuWithNoneOfTheseKeys").label =
    eGStrings.getString("activation.noKey");
  document.getElementById("openAltMenuLabel").value =
    eGStrings.getString("activation.openAltMenu");
  document.getElementById("openAltMenuWithAltKeyLabel").value =
    eGStrings.getString("activation.openAltMenu.altKey");
  document.getElementById("preventOpenLabel").value =
    eGStrings.getString("activation.preventOpen");
  document.getElementById("preventOpenWithAltKey").label =
    document.getElementById("contextualMenuWithAltKey").label =
    eGStrings.getString("activation.altKey");
  document.getElementById("contextualMenuLabel").value =
    eGStrings.getString("activation.contextualMenu");
  document.getElementById("contextualMenuShowAuto").label =
    eGStrings.getString("activation.contextualMenu.showAuto");
  
  document.getAnonymousElementByAttribute(document.documentElement, "pane",
    "behaviorPane").label = eGStrings.getString("behavior");
  document.getElementById("menuTypeLabel").value =
    eGStrings.getString("behavior.menuType");
  document.getElementById("standardMenuType").label =
    eGStrings.getString("behavior.menuType.standard");
  document.getElementById("largeMenuType").label =
    eGStrings.getString("behavior.menuType.large");
  document.getElementById("displayLabel").value =
    eGStrings.getString("behavior.display");
  document.getElementById("smallIconsCheckbox").label =
    eGStrings.getString("behavior.display.smallIcons");
  document.getElementById("opacityLabel").value =
    eGStrings.getString("behavior.display.opacity");
  document.getElementById("tooltipsLabel").value =
    eGStrings.getString("behavior.tooltips");
  document.getElementById("activateTooltips").label =
    eGStrings.getString("behavior.tooltips.activate");
  document.getElementById("tooltipsActivationDelayLabel").value =
    eGStrings.getString("behavior.tooltips.delay");
  document.getElementById("movePieMenuLabel").value =
    eGStrings.getString("behavior.move");
  document.getElementById("moveWithShiftKey").label =
    eGStrings.getString("behavior.move.shiftKey");
  document.getElementById("moveWithMenuEdge").label =
    eGStrings.getString("behavior.move.menuEdge");
  document.getElementById("openLinksThroughPieMenuCenterLabel").value =
    eGStrings.getString("behavior.links");
  document.getElementById("activateOpenLinksThroughPieMenuCenter").label =
    eGStrings.getString("behavior.links.activate");
  document.getElementById("openLinksMaximumDelayLabel").value =
    eGStrings.getString("behavior.links.delay");
  document.getElementById("openLinksWithOpenLinkAction").label =
    eGStrings.getString("behavior.links.openLinkAction");
  document.getElementById("configureActionLabel").value =
    eGStrings.getString("behavior.links.configureAction");
  document.getElementById("openLinksWithBrowserBehavior").label =
    eGStrings.getString("behavior.links.browser");
  document.getElementById("autoscrollingLabel").value =
    eGStrings.getString("behavior.autoscrolling");
  document.getElementById("activateAutoscrolling").label =
    eGStrings.getString("behavior.autoscrolling.activate");
  document.getElementById("autoscrollingActivationDelayLabel").value =
    eGStrings.getString("behavior.autoscrolling.delay");
  
  document.getAnonymousElementByAttribute(document.documentElement, "pane",
    "menusPane").label = eGStrings.getString("menus");
  document.getElementById("mainMenuTabLabel").label =
    eGStrings.getString("menus.main");
  document.getElementById("extraMenuTabLabel").label =
    eGStrings.getString("menus.extra");
  document.getElementById("contextualMenusTabLabel").label =
    eGStrings.getString("menus.contextual");
  document.getElementById("mainPrimaryMenuTabLabel").label =
    document.getElementById("extraPrimaryMenuTabLabel").label =
    eGStrings.getString("menus.primary");
  document.getElementById("mainAlt1MenuTabLabel").label =
    document.getElementById("extraAlt1MenuTabLabel").label =
    eGStrings.getString("menus.alternative1");
  document.getElementById("mainAlt2MenuTabLabel").label =
    document.getElementById("extraAlt2MenuTabLabel").label =
    eGStrings.getString("menus.alternative2");
  document.getElementById("enableMainPrimaryMenu").label =
    document.getElementById("enableMainAlt1Menu").label =
    document.getElementById("enableMainAlt2Menu").label =
    document.getElementById("enableExtraPrimaryMenu").label =
    document.getElementById("enableExtraAlt1Menu").label =
    document.getElementById("enableExtraAlt2Menu").label =
    eGStrings.getString("menus.enabled");
  document.getElementById("extraMenuInfoLabel").value =
    eGStrings.getString("menus.extra.info");
  document.getElementById("contextualLinkMenuTabLabel").label =
    eGStrings.getString("menus.contextual.link");
  document.getElementById("contextualImageMenuTabLabel").label =
    eGStrings.getString("menus.contextual.image");
  document.getElementById("contextualSelectionMenuTabLabel").label =
    eGStrings.getString("menus.contextual.selection");
  document.getElementById("contextualTextboxMenuTabLabel").label =
    eGStrings.getString("menus.contextual.textbox");
  
  document.getAnonymousElementByAttribute(document.documentElement, "pane",
    "customizationsPane").label = eGStrings.getString("customizations");
  document.getElementById("customizationsForLoadURLActionsTabLabel").label =
    eGStrings.getString("customizations.loadURLActions");
  document.getElementById("customizationsForRunScriptActionsTabLabel").label =
    eGStrings.getString("customizations.runScriptActions");
  document.getElementById("customizationsForOtherActionsTabLabel").label =
    eGStrings.getString("customizations.otherActions");
  document.getElementById("loadURLInfoActionsLabel").textContent =
    document.getElementById("runScriptInfoActionsLabel").textContent =
    document.getElementById("otherActionsInfoActionsLabel").textContent =
    eGStrings.getString("customizations.infoActions");
  document.getElementById("loadURLInfoPlaceholdersLabel").textContent =
    document.getElementById("runScriptInfoPlaceholdersLabel").textContent =
    eGStrings.getString("customizations.infoPlaceholders");
  document.getElementById("loadURLActionsLoadLabel").value =
    eGStrings.getString("customizations.loadURLActions.load");
  document.getElementById("loadURLActionsInCurrentTabLabel").label =
    eGStrings.getString("customizations.loadURLActions.currentTab");
  document.getElementById("loadURLActionsInNewTabLabel").label =
    eGStrings.getString("customizations.loadURLActions.newTab");
  document.getElementById("loadURLActionsInNewWindowLabel").label =
    eGStrings.getString("customizations.loadURLActions.newWindow");
  document.getElementById("customizeOpenLinkActionLabel").value =
    eGStrings.getString("customizations.openLink");
  document.getElementById("openLinkActionInCurrentTab").label =
    eGStrings.getString("customizations.openLink.currentTab");
  document.getElementById("openLinkActionInNewTab").label =
    eGStrings.getString("customizations.openLink.newTab");
  document.getElementById("openLinkActionInNewWindow").label =
    eGStrings.getString("customizations.openLink.newWindow");
  document.getElementById("customizeDailyReadingsActionLabel").value =
    eGStrings.getString("customizations.dailyReadings");
  document.getElementById("dailyReadingsFolderSelectionLabel").value =
    eGStrings.getString("customizations.dailyReadings.folderSelection");
  
  createActions();
  createLoadURLActions();
  createRunScriptActions();
  
  [["showButtonMenulist", eGPrefs.getShowButtonPref()],
   ["showAltButtonMenulist", eGPrefs.getShowAltButtonPref()]].forEach(
    function ([id, prefValue]) {
      var menulist = document.getElementById(id);
      menulist.value = prefValue;
      if (menulist.selectedIndex === -1) {
        menulist.selectedIndex = menulist.itemCount - 1;
      }
      updateLabelAndTextboxFor(menulist);
    }
  );
  
  setMenuType(eGPrefs.isLargeMenuOff());
  setDisabledStatusForTooltipsActivationDelay(eGPrefs.areTooltipsOn());
  setDisabledStatusForOpenLinksMaximumDelay(eGPrefs.isHandleLinksOn());
  setDisabledStatusForAutoscrollingActivationDelay(eGPrefs.isAutoscrollingOn());
  
  setDisabledStatusForMainMenu("Alt1", eGPrefs.isMainAlt1MenuEnabled());
  setDisabledStatusForMainMenu("Alt2", eGPrefs.isMainAlt2MenuEnabled());
  setDisabledStatusForExtraMenu("Alt1", eGPrefs.isExtraAlt1MenuEnabled());
  setDisabledStatusForExtraMenu("Alt2", eGPrefs.isExtraAlt2MenuEnabled());
  
  initializeDailyReadingsTree();
  
  window.setCursor("auto");
}

function saveAllPreferences() {
  // saving the preferences of each preference pane
  var prefwindow = document.getElementById("eG_optionsWindow");
  for (var i=0; i < prefwindow.preferencePanes.length; ++i) {
    prefwindow.preferencePanes[i].writePreferences();
  }
}

function readActionsGroupPreference(name) {
  var preference = document.getElementById(name + "Menu");
  var actionNames = preference.value.split("/");
  
  actionNames.forEach(function(value, index) {
    var element = document.getElementById(name + "Sector" + index);
    element.setAttribute("actionName", value);
    element.setAttribute("label", eGActions[value].getLocalizedActionName());
  });
}

function preparePreferenceValueForNormalMenu(name) {
  var result = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(function(value) {
    return document.getElementById(name + "Sector" + value).getAttribute("actionName");
  });
  return result.join("/");
}

function preparePreferenceValueForExtraMenu(name) {
  var result = [0, 1, 2, 3, 4].map(function(value) {
    return document.getElementById(name + "Sector" + value).getAttribute("actionName");
  });
  return result.join("/");
}

function readLoadURLPreference(actionName) {
  var preference = document.getElementById(actionName + "Pref");
  var string = preference.value.split("\u2022");
  
  document.getElementById(actionName + "_tooltip").value = string[0];
  document.getElementById(actionName + "_URL").value = string[1];
  var isFaviconEnabled = string[2] === "true";
  document.getElementById(actionName + "_faviconCheckbox").checked =
    isFaviconEnabled;
  if (isFaviconEnabled) {
    addFavicon(string[1], actionName);
  }
  document.getElementById(actionName + "_openInPrivateWindowCheckbox").checked =
    string[3] === "true";
}

function preparePreferenceValueForLoadURL(number) {
  var actionName = "loadURL" + number;
  var string = Components.classes["@mozilla.org/supports-string;1"]
                       .createInstance(Components.interfaces.nsISupportsString);
  string.data = document.getElementById(actionName + "_tooltip").value +
    "\u2022" + document.getElementById(actionName + "_URL").value +
    "\u2022" + document.getElementById(actionName + "_faviconCheckbox").checked +
    "\u2022" + 
    document.getElementById(actionName + "_openInPrivateWindowCheckbox").checked;
  return string;
}

function readRunScriptPreference(actionName) {
  var preference = document.getElementById(actionName + "Pref");
  var string = preference.value.split("\u2022");
  
  document.getElementById(actionName + "_tooltip").value = string[0];
  document.getElementById(actionName + "_code").value = string[1];
  document.getElementById(actionName + "_newIconCheckbox").checked =
   string[2] !== "";
  document.getElementById(actionName + "_newIcon").src = string[2];
}

function preparePreferenceValueForRunScript(number) {
  var actionName = "runScript" + number;
  var string = Components.classes["@mozilla.org/supports-string;1"]
                       .createInstance(Components.interfaces.nsISupportsString);
  string.data = document.getElementById(actionName + "_tooltip").value +
    "\u2022" + document.getElementById(actionName + "_code").value +
    "\u2022" + document.getElementById(actionName + "_newIcon").src;
  return string;
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

function resetOnDuplicatedKeys(aRadiogroup) {
  var showKey = document.getElementById("showKeyRadiogroup").value;
  var preventOpenKey = document.getElementById("preventOpenKeyRadiogroup").value;
  var contextKey = document.getElementById("contextKeyRadiogroup").value;
  
  if ((showKey !== "0" && (showKey === preventOpenKey || showKey === contextKey)) ||
      (preventOpenKey !== "0" && (preventOpenKey === contextKey))) {
    aRadiogroup.value = "0";
    alert(eGStrings.getString("activation.duplicateKey"));
  }
}

function fireChangeEventOnActionsGroup(name) {
  var element = document.getElementById("gr_" + name);
  fireChangeEventOn(element);
}

function fireChangeEventOnElementWithID(id) {
  var element = document.getElementById(id);
  fireChangeEventOn(element);
}

function fireChangeEventOn(element) {
  // firing a change event triggers XUL's preferences system to change the
  // value of the preference
  var event = document.createEvent("Event");
  event.initEvent("change", true, false);
  element.dispatchEvent(event);
}

function updateLabelAndTextboxFor(menulist) {
  var label = menulist.nextElementSibling;
  var textbox = label.nextElementSibling;
  var shouldBeDisabled = menulist.selectedIndex !== menulist.itemCount - 1;
  
  label.disabled = shouldBeDisabled;
  textbox.disabled = shouldBeDisabled;
  if (shouldBeDisabled) {
    textbox.value = menulist.value;
  }
}
