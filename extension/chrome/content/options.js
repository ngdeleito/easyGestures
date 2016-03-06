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


/* global eGActions, eGPrefs */

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
  label.setAttribute("value",
    document.getElementById("easyGesturesNStrings").getString(actionName));
  label.setAttribute("style", "font-weight: bold;");
  hbox.appendChild(label);
  
  return hbox;
}

function createTooltipRowForAction(actionName) {
  var row = document.createElement("row");
  row.setAttribute("align", "center");
  
  var label = document.createElement("label");
  label.setAttribute("value", document.getElementById("easyGesturesNStrings")
                                      .getString("customizations.tooltip"));
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
    label.setAttribute("value", document.getElementById("easyGesturesNStrings")
                                        .getString("customizations.URL"));
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
      document.getElementById("easyGesturesNStrings")
              .getString("customizations.useFavicon"));
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
      document.getElementById("easyGesturesNStrings")
              .getString("customizations.openInPrivateWindow"));
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
    label.setAttribute("value", document.getElementById("easyGesturesNStrings")
                                        .getString("customizations.code"));
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
      document.getElementById("easyGesturesNStrings")
              .getString("customizations.changeIcon"));
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

////

var eG_prefs = Components.classes["@mozilla.org/preferences-service;1"]
                         .getService(Components.interfaces.nsIPrefService)
                         .getBranch("extensions.easygestures.");
var eG_actionsPopupList;

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
  if (event.keyCode == 13 && event.target.nodeName == "textbox") {
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
    itemNode.setAttribute("label", eGActions[currentAction].getXULLabel());
    itemNode.style.paddingRight = "20px";
    imageNode.setAttribute("class", "eG_" + currentAction);
    
    subItemNode.setAttribute("value", eGActions[currentAction].getXULLabel());
    popupNode.appendChild(itemNode);
    
    currentAction = eGActions[currentAction].nextAction;
  }
  
  return popupNode;
}

function attachMenupopup(menulist) {
  if (menulist.firstChild !== null) {
    return;
  }
  
  var clonedMenupopup = eG_actionsPopupList.cloneNode(true);
  menulist.appendChild(clonedMenupopup);
  clonedMenupopup.boxObject.firstChild.setAttribute("style", "overflow-x:hidden;"); // boxObject does not exist before menupopup is shown
  
  if (clonedMenupopup.parentNode.id.search("Sector2") == -1 ||
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
  fp.appendFilter("Preferences (*.ege)", "*.ege");
  var ret = fp.show();
  if (ret == Components.interfaces.nsIFilePicker.returnOK || ret == Components.interfaces.nsIFilePicker.returnReplace ) {
    //create file
    var file = Components.classes["@mozilla.org/file/local;1"]
                         .createInstance(Components.interfaces.nsILocalFile);
    var filePath = fp.file.path;
    if (filePath.substring(filePath.length-4,filePath.length)!=".ege") {
      filePath = filePath + ".ege";
    }
    file.initWithPath(filePath);
    if (!file.exists()) {
      file.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 420);
    }
    
    //write to file
    var outputStream = Components
                     .classes[ "@mozilla.org/network/file-output-stream;1"]
                     .createInstance(Components.interfaces.nsIFileOutputStream);
    outputStream.init(file, 0x04 | 0x08, 420, 0);
    
    var converterOutputStream = Components
                .classes["@mozilla.org/intl/converter-output-stream;1"]
                .createInstance(Components.interfaces.nsIConverterOutputStream);
    converterOutputStream.init(outputStream, "UTF-8", 0, 0x0000);
    
    var prefCount = {value:0};
    var prefArray = eG_prefs.getChildList("", prefCount);
    if (!prefArray || (prefCount.value <= 0)) {
      alert("Export aborted !");
      converterOutputStream.close();
      outputStream.close();
      return;
    }
    
    Components.utils.import("resource://gre/modules/AddonManager.jsm");
    AddonManager.getAddonByID("easyGesturesN@ngdeleito.eu",
    function(addon) {
      var version = addon.version;
      // add description at the begining of the file
      var d = new Date();
      var dateStr = d.toString();
      converterOutputStream.writeString("//eG " + version + " (" + dateStr +
        ")//\n");
      
      converterOutputStream.writeString(eGPrefs.exportPrefsToString());
      converterOutputStream.close();
      outputStream.close();
    });
  }
}

function importPrefs() {
  var fp = Components.classes["@mozilla.org/filepicker;1"]
                     .createInstance(Components.interfaces.nsIFilePicker);
  fp.init(window, "easyGestures N", Components.interfaces.nsIFilePicker.modeOpen);
  fp.appendFilter("Preferences (*.ege)","*.ege");
  
  var ret = fp.show();
  if (ret == Components.interfaces.nsIFilePicker.returnOK) {
    var file = Components.classes["@mozilla.org/file/local;1"]
                         .createInstance(Components.interfaces.nsILocalFile);
    var filePath = fp.file.path;
    if (filePath.substring(filePath.length-4,filePath.length)!=".ege") {
      alert("This type of file can't be imported !");
      return;
    }
    file.initWithPath(filePath);
    
    // read from file
    var inputStream = Components
                      .classes["@mozilla.org/network/file-input-stream;1"]
                      .createInstance(Components.interfaces.nsIFileInputStream);
    inputStream.init(file, 0x01, 444, 0);
    
    var converterInputStream = Components
                 .classes["@mozilla.org/intl/converter-input-stream;1"]
                 .createInstance(Components.interfaces.nsIConverterInputStream);
    converterInputStream.init(inputStream, "UTF-8", 1024, 0xFFFD);
    
    if (converterInputStream instanceof Components.interfaces.nsIUnicharLineInputStream) {
      var line = {};
      var cont = converterInputStream.readLine(line); // read first line containing description
      do {
        cont = converterInputStream.readLine(line); // read pref name
        var pref = line.value;
        
        cont = converterInputStream.readLine(line); // read pref type
        var type = JSON.parse(line.value);
        
        cont = converterInputStream.readLine(line); // read pref value
        var value = Components.classes["@mozilla.org/supports-string;1"]
                       .createInstance(Components.interfaces.nsISupportsString);
        value.data = line.value;
        
        try {
          switch (type) {
            case Components.interfaces.nsIPrefBranch.PREF_STRING:
              eG_prefs.setComplexValue(pref, Components.interfaces.nsISupportsString, value);
              break;
            
            case Components.interfaces.nsIPrefBranch.PREF_INT:
              eG_prefs.setIntPref(pref, JSON.parse(value.data));
              break;
            
            case Components.interfaces.nsIPrefBranch.PREF_BOOL:
              eG_prefs.setBoolPref(pref, JSON.parse(value.data));
              break;
          }
        }
        catch (ex) {
          alert("Exception: "+ ex.toString());
          break;
        }
      } while (cont);
    }
    converterInputStream.close();
    inputStream.close();
  }
}

function toggleDisabledStatusOnElementsById(ids, disabled) {
  ids.forEach(function(id) {
    document.getElementById(id).disabled = !disabled;
  });
}

function setBehaviorTooltipsDisabledStatus(disabled) {
  toggleDisabledStatusOnElementsById(["BehaviorTooltipsLabel",
    "BehaviorTooltipsTextbox", "BehaviorTooltipsUnit"], disabled);
}

function setBehaviorLinksDisabledStatus(disabled) {
  toggleDisabledStatusOnElementsById(["BehaviorLinksLabel",
    "BehaviorLinksTextbox", "BehaviorLinksUnit", "BehaviorLinksRadiogroup"],
    disabled);
}

function setBehaviorAutoscrollingDisabledStatus(disabled) {
  toggleDisabledStatusOnElementsById(["BehaviorAutoscrollingLabel",
    "BehaviorAutoscrollingTextbox", "BehaviorAutoscrollingUnit"], disabled);
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
  
  eG_actionsPopupList = createActionsPopupList();
  createActions();
  createLoadURLActions();
  createRunScriptActions();
  
  ["showButton", "showAltButton", "preventOpenKey", "contextKey"].forEach(
    function (element) {
      var menulist = document.getElementById(element + "Menulist");
      menulist.value = eG_prefs.getIntPref("activation." + element);
      if (menulist.selectedIndex == -1) {
        menulist.selectedIndex = menulist.itemCount - 1;
      }
      updateLabelAndTextboxFor(menulist);
    }
  );
  
  setBehaviorTooltipsDisabledStatus(eGPrefs.areTooltipsOn());
  setBehaviorLinksDisabledStatus(eGPrefs.isHandleLinksOn());
  setBehaviorAutoscrollingDisabledStatus(eGPrefs.isAutoscrollingOn());
  
  initializeDailyReadingsTree();
  
  updateUI();
  window.setCursor("auto");
}

function saveAllPreferences(element) {
  // we retrieve the associated prefwindow element
  while (element.tagName !== "prefwindow") {
    element = element.parentNode;
  }
  
  // we save the preferences of each preference pane
  for (var i=0; i < element.preferencePanes.length; ++i) {
    element.preferencePanes[i].writePreferences();
  }
}

function readActionsGroupPreference(name) {
  var preference = document.getElementById(name + "Menu");
  var actionNames = preference.value.split("/");
  
  actionNames.forEach(function(value, index) {
    var element = document.getElementById(name + "Sector" + index);
    element.setAttribute("actionName", value);
    element.setAttribute("label", eGActions[value].getXULLabel());
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

function resetOnDuplicatedKeys(menulist, textbox) {
  var showKey = document.getElementById("showKeyRadiogroup").value;
  var preventOpenKey = document.getElementById("preventOpenKeyCode").value;
  var contextKey = document.getElementById("customContextKeyCode").value;
  
  if ((showKey !== "0" && (showKey === preventOpenKey || showKey === contextKey)) ||
      (preventOpenKey !== "0" && (preventOpenKey === contextKey))) {
    menulist.value = "0";
    textbox.value = "0";
    alert(document.getElementById("easyGesturesNStrings")
                  .getString("activation.duplicateKey"));
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
  var shouldBeDisabled = menulist.selectedIndex != menulist.itemCount - 1;
  
  label.disabled = shouldBeDisabled;
  textbox.disabled = shouldBeDisabled;
  if (shouldBeDisabled) {
    textbox.value = menulist.value;
  }
}

function updateUI() {
  //***************************************************
  // enabling/disabling alternative boxes
  //***************************************************
  var boxes = new Array("main","extra");
  for (var i=0; i<2; i++) {
    for (var sector=0; sector<10; sector++) {
      if (boxes[i].search("extra")!=-1 && sector>4) {
        continue;
      }
      document.getElementById(boxes[i] + "Alt1Sector" + sector).disabled =
        !document.getElementById(boxes[i] + "Alternative1Checkbox").checked;
      document.getElementById(boxes[i] + "Alt2Sector" + sector).disabled =
        !document.getElementById(boxes[i] + "Alternative2Checkbox").checked;
    }
  }
  
  //***************************************************
  // checking if menu is standard or large
  //***************************************************
  var menuIsLarge = (document.getElementById("menuType").selectedItem.value == "true");
  
  document.getElementById("mainSector5").hidden = !menuIsLarge;
  document.getElementById("mainSector9").hidden = !menuIsLarge;
  document.getElementById("mainAlt1Sector5").hidden = !menuIsLarge;
  document.getElementById("mainAlt1Sector9").hidden = !menuIsLarge;
  document.getElementById("mainAlt2Sector5").hidden = !menuIsLarge;
  document.getElementById("mainAlt2Sector9").hidden = !menuIsLarge;
  
  document.getElementById("contextLinkSector5").hidden = !menuIsLarge;
  document.getElementById("contextLinkSector9").hidden = !menuIsLarge;
  document.getElementById("contextImageSector5").hidden = !menuIsLarge;
  document.getElementById("contextImageSector9").hidden = !menuIsLarge;
  document.getElementById("contextSelectionSector5").hidden = !menuIsLarge;
  document.getElementById("contextSelectionSector9").hidden = !menuIsLarge;
  document.getElementById("contextTextboxSector5").hidden = !menuIsLarge;
  document.getElementById("contextTextboxSector9").hidden = !menuIsLarge;
}
