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

function setLabels() {
  for (var i=1; i <= 20; i++) {
    // loadURLScript 1 to 20
    document.getElementById("loadURLScript_Label" + i).value =
      (document.getElementById("loadURLScript_type"+i).selectedItem==document.getElementById("Script"+i))? customizationsLabels.urlscriptCode : customizationsLabels.urlscriptHost;
  }
}

function addEventListenerToLoadURLScriptName(element, actionNumber) {
  element.addEventListener("change", function(event) {
    updateOtherLabels("loadURLScript" + actionNumber, this.value);
    fireChangeEventOnLoadURLScript(actionNumber);
  }, false);
}

function addEventListenerToLoadURLScriptType(element, actionNumber) {
  element.addEventListener("command", function(event) {
    updateUI();
    fireChangeEventOnLoadURLScript(actionNumber);
  }, false);
}

function addEventListenerToLoadURLScriptHost(element, actionNumber) {
  element.addEventListener("change", function(event) {
    if (document.getElementById("loadURLScript_faviconCheck" + actionNumber).checked) {
      retrieveFavicon(this.value, actionNumber);
    }
    fireChangeEventOnLoadURLScript(actionNumber);
  }, false);
}

function addEventListenerToLoadURLScriptCode(element, actionNumber) {
  element.addEventListener("change", function(event) {
    fireChangeEventOnLoadURLScript(actionNumber);
  }, false);
}

function addEventListenerToLoadURLScriptFavicon(element, actionNumber) {
  element.addEventListener("command", function(event) {
    if (this.checked) {
      let faviconURL = document.getElementById("loadURLScript_host" + actionNumber).value;
      retrieveFavicon(faviconURL, actionNumber);
      document.getElementById("loadURLScript_newIconCheck" + actionNumber).checked = false;
    }
    updateUI();
    fireChangeEventOnLoadURLScript(actionNumber);
  }, false);
}

function addEventListenerToLoadURLScriptNewIcon(element, actionNumber) {
  element.addEventListener("command", function(event) {
    if (this.checked) {
      document.getElementById("loadURLScript_faviconCheck" + actionNumber).checked = false;
    }
    updateUI();
    fireChangeEventOnLoadURLScript(actionNumber);
  }, false);
}

function addEventListenerToNewIconImage(element, actionNumber) {
  element.addEventListener("click", function(event) {
    if (document.getElementById("loadURLScript_newIconCheck" + actionNumber).checked) {
      retrieveCustomIconFile(actionNumber);
      fireChangeEventOnLoadURLScript(actionNumber);
    }
  }, false);
}

function createLoadURLScriptForCustomization() {
  for (var i=1; i <= 20; i++) {
    // loadURLScript 1 to 20
    var groupbox = document.getElementById("gr_loadURLScript" + i);
    
    // empty groupbox if needed first
    if (groupbox.hasChildNodes()) {
      while (groupbox.lastChild !== null) {
        groupbox.removeChild(groupbox.lastChild);
      }
    }
    
    //////////////////////////////////////////////////////////
    // header
    //////////////////////////////////////////////////////////
    
    var titleNode = document.createElement("hbox");
    titleNode.setAttribute("align", "center");
    
    var image = document.createElement("image");
    image.setAttribute("id", "loadURLScriptImg");
    image.setAttribute("class", "small_loadURLScript" + i);
    titleNode.appendChild(image);
    
    var label = document.createElement("label");
    label.setAttribute("value", customizationsLabels.urlscriptURL + "/" + customizationsLabels.urlscriptScript + " " + i);
    label.setAttribute("style", "font-weight: bold;");
    titleNode.appendChild(label);
    
    var hbox = document.createElement("hbox");
    hbox.setAttribute("id", "loadURLScriptDisplay" + i);
    hbox.setAttribute("align", "center");
    titleNode.appendChild(hbox);
    
    label = document.createElement("label");
    label.setAttribute("value", " - ");
    hbox.appendChild(label);
    
    image = document.createElement("image");
    image.setAttribute("id", "loadURLScript_newIcon" + i);
    image.setAttribute("src", "");
    image.setAttribute("maxwidth", "20");
    image.setAttribute("maxheight", "20");
    hbox.appendChild(image);
    
    groupbox.appendChild(titleNode);
    
    var separator = document.createElement("separator");
    separator.setAttribute("class", "thin");
    groupbox.appendChild(separator);
    
    //////////////////////////////////////////////////////////
    // options
    //////////////////////////////////////////////////////////
    
    hbox = document.createElement("hbox");
    hbox.setAttribute("flex", "1");
    groupbox.appendChild(hbox);
    
    var vbox = document.createElement("vbox");
    hbox.appendChild(vbox);
    
    var spacer = document.createElement("spacer");
    spacer.setAttribute("height", "3");
    vbox.appendChild(spacer);
    
    label = document.createElement("label");
    label.setAttribute("value", customizationsLabels.urlscriptName);
    vbox.appendChild(label);
    
    spacer = document.createElement("spacer");
    spacer.setAttribute("height", "10");
    vbox.appendChild(spacer);
    
    label = document.createElement("label");
    label.setAttribute("id", "loadURLScript_Label" + i);
    label.setAttribute("value", "");
    vbox.appendChild(label);
    
    vbox = document.createElement("vbox");
    vbox.setAttribute("flex", "1");
    hbox.appendChild(vbox);
    
    hbox = document.createElement("hbox");
    vbox.appendChild(hbox);
    
    var textbox = document.createElement("textbox");
    textbox.setAttribute("id", "loadURLScript_name" + i);
    addEventListenerToLoadURLScriptName(textbox, i);
    textbox.setAttribute("size", "21");
    textbox.setAttribute("maxlength", "20");
    hbox.appendChild(textbox);
    
    var radiogroup = document.createElement("radiogroup");
    radiogroup.setAttribute("id", "loadURLScript_type" + i);
    radiogroup.setAttribute("orient", "horizontal");
    addEventListenerToLoadURLScriptType(radiogroup, i);
    hbox.appendChild(radiogroup);
    
    var radio = document.createElement("radio");
    radio.setAttribute("id", "URL" + i);
    radio.setAttribute("label", customizationsLabels.urlscriptURL);
    radiogroup.appendChild(radio);
    
    radio = document.createElement("radio");
    radio.setAttribute("id", "Script" + i);
    radio.setAttribute("label", customizationsLabels.urlscriptScript);
    radiogroup.appendChild(radio);
    
    var stack = document.createElement("stack");
    vbox.appendChild(stack);
    
    textbox = document.createElement("textbox");
    textbox.setAttribute("id", "loadURLScript_host" + i);
    textbox.setAttribute("size", "30");
    addEventListenerToLoadURLScriptHost(textbox, i);
    stack.appendChild(textbox);
    
    textbox = document.createElement("textbox");
    textbox.setAttribute("id", "loadURLScript_code" + i);
    textbox.setAttribute("size", "30");
    textbox.setAttribute("multiline", "true");
    textbox.setAttribute("rows", "6");
    addEventListenerToLoadURLScriptCode(textbox, i);
    stack.appendChild(textbox);
    
    separator = document.createElement("separator");
    separator.setAttribute("class", "thin");
    vbox.appendChild(separator);
    
    hbox = document.createElement("hbox");
    hbox.setAttribute("align", "center");
    vbox.appendChild(hbox);
    
    var checkbox = document.createElement("checkbox");
    checkbox.setAttribute("id", "loadURLScript_faviconCheck" + i);
    checkbox.setAttribute("label", customizationsLabels.urlscriptIcon);
    addEventListenerToLoadURLScriptFavicon(checkbox, i);
    hbox.appendChild(checkbox);
    
    checkbox = document.createElement("checkbox");
    checkbox.setAttribute("id", "loadURLScript_newIconCheck" + i);
    checkbox.setAttribute("label", customizationsLabels.changeIcon);
    addEventListenerToLoadURLScriptNewIcon(checkbox, i);
    hbox.appendChild(checkbox);
    
    image = document.createElement("image");
    image.setAttribute("src", "chrome://easygestures/content/browse.png");
    addEventListenerToNewIconImage(image, i);
    hbox.appendChild(image);
    
    readLoadURLScriptPreference(i);
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
  menulist.addEventListener("command", function(event) {
    updateUI();
    updateOtherLabels(this.getAttribute("actionName"), this.label);
    fireChangeEventOnActionsGroup(name);
  }, false);
  menulist.addEventListener("mousedown", function(event) {
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
    
    // sector 0
    box.appendChild(createActionsMenulistWithSectorID(boxes[i], "Sector0"));
    
    // sectors 9 and 1
    var hbox = document.createElement("hbox");
    hbox.setAttribute("pack", "center");
    
    hbox.appendChild(createActionsMenulistWithSectorID(boxes[i], "Sector9"));
    
    var spacer = document.createElement("spacer");
    spacer.setAttribute("height", "0");
    spacer.setAttribute("width", "11px");
    hbox.appendChild(spacer);
    
    hbox.appendChild(createActionsMenulistWithSectorID(boxes[i], "Sector1"));
    box.appendChild(hbox);
    
    // sectors 8,7 and 2,3
    hbox = document.createElement("hbox");
    hbox.setAttribute("pack", "center");
    box.appendChild(hbox);
    
    var vbox = document.createElement("vbox");
    vbox.setAttribute("pack", "center");
    hbox.appendChild(vbox);
    
    vbox.appendChild(createActionsMenulistWithSectorID(boxes[i], "Sector8"));
    
    if (!boxes[i].startsWith("extra")) {
      vbox.appendChild(createActionsMenulistWithSectorID(boxes[i], "Sector7"));
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
    
    vbox.appendChild(createActionsMenulistWithSectorID(boxes[i], "Sector2"));
    
    if (!boxes[i].startsWith("extra")) {
      vbox.appendChild(createActionsMenulistWithSectorID(boxes[i], "Sector3"));
    }
    
    if (!boxes[i].startsWith("extra")) {
      // sectors 6 and 4
      hbox = document.createElement("hbox");
      hbox.setAttribute("pack", "center");
      
      hbox.appendChild(createActionsMenulistWithSectorID(boxes[i], "Sector6"));
      
      spacer = document.createElement("spacer");
      spacer.setAttribute("height", "0");
      spacer.setAttribute("width", "11px");
      hbox.appendChild(spacer);
      
      hbox.appendChild(createActionsMenulistWithSectorID(boxes[i], "Sector4"));
      box.appendChild(hbox);
      
      // sector 5
      box.appendChild(createActionsMenulistWithSectorID(boxes[i], "Sector5"));
    }
    
    readActionsGroupPreference(boxes[i]);
  }
}

////

var eG_prefs = Components.classes["@mozilla.org/preferences-service;1"]
                         .getService(Components.interfaces.nsIPrefService)
                         .getBranch("extensions.easygestures.");
var eG_actionsPopupList;

function retrieveFavicon(url, actionNumber) {
  if (url !== "") {
    if (url.match(/\:\/\//i) === null) {
      url = "http://" + url;
    }
    
    var faviconService = Components
                           .classes["@mozilla.org/browser/favicon-service;1"]
                           .getService(Components.interfaces.mozIAsyncFavicons);
    var ios = Components.classes["@mozilla.org/network/io-service;1"]
                        .getService(Components.interfaces.nsIIOService);
    var uri = ios.newURI(url, null, null).prePath;
    
    faviconService.getFaviconURLForPage(ios.newURI(uri, null, null), function(aURI) {
      if (aURI !== null && aURI.spec !== "") {
        document.getElementById("loadURLScript_newIcon" + actionNumber).src = aURI.spec;
      }
      else {
        document.getElementById("loadURLScript_newIcon" + actionNumber).src = "";
        document.getElementById("loadURLScriptDisplay" + actionNumber).collapsed = true;
        document.getElementById("loadURLScript_faviconCheck" + actionNumber).checked = false;
      }
    });
  }
}

function retrieveCustomIconFile(actionNumber) {
  var fp = Components.classes["@mozilla.org/filepicker;1"]
                     .createInstance(Components.interfaces.nsIFilePicker);
  fp.init(window, null, Components.interfaces.nsIFilePicker.modeOpen);
  fp.appendFilters(Components.interfaces.nsIFilePicker.filterImages);
  
  var returnValue = fp.show();
  if (returnValue == Components.interfaces.nsIFilePicker.returnOK) {
    var img = document.getElementById("loadURLScript_newIcon" + actionNumber);
    img.src = "file://" + fp.file.path;
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
  
  for (var i=0; i<eG_PopupImages.length; i++) {
    var itemNode;
    if (i==1 || i==2 || i==14 || i==21 || i==27 || i==37 || i==71 || i==85) {
      itemNode = document.createElement("menuseparator");
      popupNode.appendChild(itemNode);
    }
    
    itemNode = document.createElement("menuitem");
    var imageNode = document.createElement("image");
    var subItemNode = document.createElement("label");
    
    itemNode.appendChild(imageNode);
    itemNode.appendChild(subItemNode);
    
    itemNode.setAttribute("actionName", eG_PopupImages[i]);
    // for some reason addEventListener does not work on the next line
    itemNode.setAttribute("oncommand", "actionClick(this); updateUI();");
    itemNode.setAttribute("crop", "end");
    itemNode.setAttribute("label", eGActions[eG_PopupImages[i]].getXULLabel());
    itemNode.style.paddingRight = "20px";
    imageNode.setAttribute("class", "small_" + eG_PopupImages[i]);
    
    subItemNode.setAttribute("value", eGActions[eG_PopupImages[i]].getXULLabel());
    popupNode.appendChild(itemNode);
  }
  
  return popupNode;
}

function actionClick(item) {
  var actionName = item.getAttribute("actionName");
  item.parentNode.parentNode.setAttribute("actionName", actionName);
  if (actionName === "empty") {
    item.parentNode.parentNode.setAttribute("label", "");
  }
  
  if (item.firstChild.getAttribute("class").search("loadURLScript") != -1) {
    var n = item.firstChild.getAttribute("class").replace(/([^0-9])+/g,"");
    var label = document.getElementById("loadURLScript_name" + n).value;
    if (label === "") {
      label = eGActions[actionName].getXULLabel();
    }
    item.parentNode.parentNode.setAttribute("label", label);
  }
}

function attachMenupopup(menulist) {
  if (menulist.firstChild !== null) {
    return;
  }
  
  var clonedMenupopup = eG_actionsPopupList.cloneNode(true);
  menulist.appendChild(clonedMenupopup);
  clonedMenupopup.boxObject.firstChild.setAttribute("style", "overflow-x:hidden;"); // boxObject does not exist before menupopup is shown
  
  if (clonedMenupopup.parentNode.id.search("Sector0") == -1) {
    // remove more action
    clonedMenupopup.removeChild(clonedMenupopup.childNodes[1]);
    clonedMenupopup.removeChild(clonedMenupopup.childNodes[1]);
  }
}

function browse(textboxid) {
  var fp = Components.classes["@mozilla.org/filepicker;1"]
                     .createInstance(Components.interfaces.nsIFilePicker);
  fp.init(window, 'easyGestures N', Components.interfaces.nsIFilePicker.modeOpen);
  //fp.appendFilter("Applications(*.exe,*.bat)","*.exe;*.bat");
  fp.appendFilters(Components.interfaces.nsIFilePicker.filterAll);
  
  var ret = fp.show();
  if (ret == Components.interfaces.nsIFilePicker.returnOK) {
    var textbox = document.getElementById(textboxid);
    textbox.value = fp.file.path;
  }
}

function exportPrefs() {
  var fp = Components.classes["@mozilla.org/filepicker;1"]
                     .createInstance(Components.interfaces.nsIFilePicker);
  fp.init(window, 'easyGestures N', Components.interfaces.nsIFilePicker.modeSave);
  fp.appendFilter("Preferences (*.ege)", "*.ege");
  var ret = fp.show();
  if (ret == Components.interfaces.nsIFilePicker.returnOK || ret == Components.interfaces.nsIFilePicker.returnReplace ) {
    //create file
    var file = Components.classes["@mozilla.org/file/local;1"]
                         .createInstance(Components.interfaces.nsILocalFile);
    var filePath = fp.file.path;
    if (filePath.substring(filePath.length-4,filePath.length)!=".ege")
      filePath = filePath + ".ege";
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
  fp.init(window, 'easyGestures N', Components.interfaces.nsIFilePicker.modeOpen);
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

function initMenuDialog() {
  window.setCursor('wait');
  
  eG_actionsPopupList = createActionsPopupList();
  createActions();
  createLoadURLScriptForCustomization();
  
  ["showButton", "showAltButton", "suppressKey", "contextKey"].forEach(
    function (element, index, array) {
      var menulist = document.getElementById(element + "Menulist");
      menulist.value = eG_prefs.getIntPref("activation." + element);
      if (menulist.selectedIndex == -1) {
        menulist.selectedIndex = menulist.itemCount - 1;
      }
      updateLabelAndTextboxFor(menulist);
    });
  
  updateUI();
  window.setCursor('auto');
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
  
  var indexes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  if (name.startsWith("extra")) {
    indexes = [0, 1, 2, 8, 9];
  }
  
  indexes.forEach(function(value) {
    var element = document.getElementById(name + "Sector" + value);
    element.setAttribute("actionName", actionNames[value]);
    element.setAttribute("label", eGActions[actionNames[value]].getXULLabel());
  });
}

function preparePreferenceValueForNormalMenu(name) {
  var result = [];
  
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(function(value) {
    result.push(document.getElementById(name + "Sector" + value).getAttribute("actionName"));
  });
  return result.join("/");
}

function preparePreferenceValueForExtraMenu(name) {
  var result = [];
  
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(function(value) {
    if (value >= 3 && value <= 7) {
      result.push("empty");
    }
    else {
      result.push(document.getElementById(name + "Sector" + value).getAttribute("actionName"));
    }
  });
  return result.join("/");
}

function readLoadURLScriptPreference(number) {
  var preference = document.getElementById("loadURLScript" + number);
  var string = preference.value.split("\u2022");
  
  document.getElementById("loadURLScript_name" + number).value = string[0];
  if (string[2] === "true") {
    document.getElementById("loadURLScript_code" + number).value = string[1];
  }
  else {
    document.getElementById("loadURLScript_host" + number).value = string[1];
  }
  document.getElementById("loadURLScript_type" + number).selectedItem =
    document.getElementById((string[2] === "true" ? "Script" : "URL") + number);
  document.getElementById("loadURLScript_newIcon" + number).src = string[3];
  document.getElementById("loadURLScript_faviconCheck" + number).checked =
    string[4] === "true";
  document.getElementById("loadURLScript_newIconCheck" + number).checked =
    string[5] === "true";
}

function preparePreferenceValueForLoadURLScript(number) {
  var string = Components.classes["@mozilla.org/supports-string;1"]
                       .createInstance(Components.interfaces.nsISupportsString);
  string.data = document.getElementById("loadURLScript_name" + number).value +
    "\u2022" + (document.getElementById("URL" + number).selected ?
                 document.getElementById("loadURLScript_host" + number).value
               : document.getElementById("loadURLScript_code" + number).value) +
    "\u2022" + document.getElementById("Script" + number).selected +
    "\u2022" + document.getElementById("loadURLScript_newIcon" + number).src +
    "\u2022" + document.getElementById("loadURLScript_faviconCheck" + number).checked +
    "\u2022" + document.getElementById("loadURLScript_newIconCheck" + number).checked;
  return string;
}

function resetOnDuplicatedKeys(menulist, textbox) {
  var contextKeyCode = document.getElementById("customContextKeyCode").value;
  var supprKeyCode = document.getElementById("customSupprKeyCode").value;
  
  if ((contextKeyCode == supprKeyCode) && contextKeyCode !== 0) {
    menulist.value = 0;
    textbox.value = 0;
    alert(eG_duplicateKeyMessage);
  }
}

function fireChangeEventOnActionsGroup(name) {
  var element = document.getElementById("gr_" + name);
  fireChangeEventOn(element);
}

function fireChangeEventOnLoadURLScript(number) {
  var element = document.getElementById("gr_loadURLScript" + number);
  fireChangeEventOn(element);
}

function fireChangeEventOn(element) {
  // firing a change event triggers XUL's preferences system to change the
  // value of the preference
  var event = document.createEvent('Event');
  event.initEvent('change', true, false);
  element.dispatchEvent(event);
}

function updateOtherLabels(actionName, label) {
  var groupboxes = new Array(
    "main", "mainAlt1", "mainAlt2", "extra", "extraAlt1", "extraAlt2",
    "contextLink", "contextImage", "contextSelection", "contextTextbox"
  );
  
  for (var i=0; i<groupboxes.length; i++) {
    for (var sector=0; sector<10; sector++) {
      if (groupboxes[i].search("extra")!=-1 && sector>2 && sector<8)
        continue;
      
      var element = document.getElementById(groupboxes[i] + "Sector" + sector);
      if (element.getAttribute("actionName") == actionName) {
        element.setAttribute("label", label);
      }
    }
  }
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
  // disabling tooltip sub-options
  //***************************************************
  var checking = document.getElementById("showTooltipsCheckbox").checked;
  document.getElementById("tooltipsDelayLabel").disabled = !checking;
  document.getElementById("tooltipsDelayValue").disabled = !checking;
  document.getElementById("tooltipsDelayUnit").disabled = !checking;
  
  //***************************************************
  // enabling/disabling alternative boxes
  //***************************************************
  var boxes = new Array("main","extra");
  for (var i=0; i<2; i++) {
    for (var sector=0; sector<10; sector++) {
      if (boxes[i].search("extra")!=-1 && sector>2 && sector<8)
        continue;
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
  
  document.getElementById("mainSector3").hidden = !menuIsLarge;
  document.getElementById("mainSector7").hidden = !menuIsLarge;
  document.getElementById("mainAlt1Sector3").hidden = !menuIsLarge;
  document.getElementById("mainAlt1Sector7").hidden = !menuIsLarge;
  document.getElementById("mainAlt2Sector3").hidden = !menuIsLarge;
  document.getElementById("mainAlt2Sector7").hidden = !menuIsLarge;
  
  document.getElementById("contextLinkSector3").hidden = !menuIsLarge;
  document.getElementById("contextLinkSector7").hidden = !menuIsLarge;
  document.getElementById("contextImageSector3").hidden = !menuIsLarge;
  document.getElementById("contextImageSector7").hidden = !menuIsLarge;
  document.getElementById("contextSelectionSector3").hidden = !menuIsLarge;
  document.getElementById("contextSelectionSector7").hidden = !menuIsLarge;
  document.getElementById("contextTextboxSector3").hidden = !menuIsLarge;
  document.getElementById("contextTextboxSector7").hidden = !menuIsLarge;
  
  //***************************************************
  
  document.getElementById("showAfterDelayDelayLabel").disabled = !document.getElementById("showAfterDelayCheckbox").checked;
  document.getElementById("showAfterDelayDelayTextbox").disabled = !document.getElementById("showAfterDelayCheckbox").checked;
  
  //***************************************************
  // disabling autoscrolling sub-options
  //***************************************************
  
  checking = document.getElementById("autoscrollingOnCheckbox").checked;
  document.getElementById("autoscrollingDelayLabel").disabled = !checking;
  document.getElementById("autoscrollingDelayValue").disabled = !checking;
  document.getElementById("autoscrollingDelayUnit").disabled = !checking;
  
  //***************************************************
  // displaying correct label for Load URL/Script
  //***************************************************
  
  setLabels();
  
  //***************************************************
  // displaying correct textarea for Load URL/Script
  //***************************************************
  
  for (i=1; i<=20; i++) { // loadURLScript 1 to 20
    var collapse = ((document.getElementById('loadURLScript_type'+i).selectedItem == document.getElementById('URL'+i) ) ? true:false);
    document.getElementById('loadURLScript_code'+i).collapsed = collapse;
    document.getElementById('loadURLScript_host'+i).collapsed = !collapse;
  }
  
  //***************************************************
  // Hiding/unhidding favicon check box for loadURLScript actions
  //***************************************************
  
  for (i=1; i<=20; i++) { // loadURLScript 1 to 20
    var  checkbox = document.getElementById('loadURLScript_faviconCheck'+i);
    if (document.getElementById('Script'+i).selected) {
      checkbox.checked = false;
      checkbox.collapsed = true;
    }
    else
      checkbox.collapsed = false;
  }
  
  //***************************************************
  // Hiding New Icon
  //***************************************************
  
  for (i=1; i<=20; i++) { // loadURLScript 1 to 20
    document.getElementById('loadURLScriptDisplay'+i).collapsed = !document.getElementById('loadURLScript_faviconCheck'+i).checked && !document.getElementById('loadURLScript_newIconCheck'+i).checked;
  }
}