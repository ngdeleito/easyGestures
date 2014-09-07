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

The Original Code is easyGestures N.

The Initial Developer of the Original Code is ngdeleito.

Contributor(s):
  Jens Tinz, his portions are Copyright (C) 2002. All Rights Reserved.
  Ons Besbes.

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


// This file provides the following hierarchy of Actions and the eGActions
// object, containing the actions available in easyGestures N

// Action
//  ^
//  |-- EmptyAction
//  |-- ExtraMenuAction
//  |-- ReloadAction
//  |-- LoadURLScriptAction
//  |-- DisableableAction
//       ^
//       |-- CanGoBackDisableableAction
//       |-- CanGoForwardDisableableAction
//       |-- OtherTabsExistDisableableAction
//       |-- DisableableCommandAction

/* exported eGActions */

function Action(name, action, startsNewGroup, nextAction) {
  this._name = name;
  this.run = action;
  
  this.isDisabled = function() {
    return false;
  };
  
  // startsNewGroup and nextAction are used in options.js to display a sorted
  // list of available actions
  this.startsNewGroup = startsNewGroup;
  this.nextAction = nextAction;
  
  this.getLabel = function() {
    return eGc.localizing.getString(this._name);
  };
  
  this.getXULLabel = function() {
    return document.getElementById("easyGesturesNStrings").getString(this._name);
  };
  
  this.isExtraMenuAction = false;
  
  this.displayStateOn = function() {};
  
  // helper functions
  
  this._getRootURL = function(url) {
    // this should work correcly with http://jolt.co.uk or gouv.qc.ca domains.
    var tld = Components.classes["@mozilla.org/network/effective-tld-service;1"]
                        .getService(Components.interfaces.nsIEffectiveTLDService);
    var uri = Services.io.newURI(url, null, null);
    var rootURL;
    try {
      rootURL = uri.scheme + "://" + tld.getBaseDomainFromHost(uri.host) + "/";
    }
    catch (ex) { // do something when NS_ERROR_HOST_IS_IP_ADDRES or other exception is thrown
      rootURL = url;
    }
    return rootURL;
  };
  
  this._readClipboard = function() {
    var clipb = Components.classes["@mozilla.org/widget/clipboard;1"]
                          .createInstance(Components.interfaces.nsIClipboard);
    var transf = Components.classes["@mozilla.org/widget/transferable;1"]
                           .createInstance(Components.interfaces.nsITransferable);
    
    transf.addDataFlavor("text/unicode");
    clipb.getData(transf, clipb.kGlobalClipboard);
    
    var str = {};
    var strLength = {};
    
    transf.getTransferData("text/unicode", str, strLength);
    
    if (str) {
      if (Components.interfaces.nsISupportsWString) {
        str = str.value.QueryInterface(Components.interfaces.nsISupportsWString);
      }
      else if (Components.interfaces.nsISupportsString) {
        str = str.value.QueryInterface(Components.interfaces.nsISupportsString);
      }
      else {
        str = null;
      }
    }
    if (str) {
      return str;
    }
    else {
      return "";
    }
  };
  
  this._getFileForSavingData = function(filter, defaultName) {
    const nsIFilePicker = Components.interfaces.nsIFilePicker;
    var fp = Components.classes["@mozilla.org/filepicker;1"]
                       .createInstance(nsIFilePicker);
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    
    fp.init(window, null, nsIFilePicker.modeSave);
    fp.appendFilters(filter);
    fp.defaultString = defaultName;
    var returnValue = fp.show();
    if (returnValue == nsIFilePicker.returnOK || returnValue == nsIFilePicker.returnReplace) {
      return fp.file;
    }
    else {
      return null;
    }
  };
  
  this._saveContentFromLink = function(link, filter) {
    var uri = Services.io.newURI(link, null, null);
    var file = this._getFileForSavingData(
                 filter,
                 uri.path.substring(uri.path.lastIndexOf("/") + 1));
    
    if (file !== null) {
      var wbp = Components.classes['@mozilla.org/embedding/browser/nsWebBrowserPersist;1']
                          .createInstance(Components.interfaces.nsIWebBrowserPersist);
      // don't save gzipped
      wbp.persistFlags &= ~Components.interfaces.nsIWebBrowserPersist.PERSIST_FLAGS_NO_CONVERSION;
      var window = Services.wm.getMostRecentWindow("navigator:browser");
      var privacyContext = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                                 .getInterface(Components.interfaces.nsIWebNavigation)
                                 .QueryInterface(Components.interfaces.nsILoadContext);
      wbp.saveURI(uri, null, null, null, null, file, privacyContext);
    }
  };
}

function EmptyAction() {
  Action.call(this, "empty", function() {}, false, "more");
  
  this.getXULLabel = function() {
    return document.getElementById("easyGesturesNStrings").getString("emptyActionName");
  };
}
EmptyAction.prototype = new Action();

function ExtraMenuAction() {
  Action.call(this, "more", function() {
    eGm.showExtraMenu();
  }, true, "back");
  
  this.getXULLabel = function() {
    return document.getElementById("easyGesturesNStrings").getString("extraMenuActionName");
  };
  
  this.isExtraMenuAction = true;
}
ExtraMenuAction.prototype = new Action();

function ReloadAction() {
  Action.call(this, "reload", function() { // reload or stop
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    var gBrowser = window.gBrowser;
    
    if (!eGc.loading) {
      gBrowser.reload();
    }
    else {
      gBrowser.stop();
    }
  }, false, "homepage");
  
  this.getXULLabel = function() {
    return document.getElementById("easyGesturesNStrings").getString("reloadActionName");
  };
  
  this.displayStateOn = function(anHTMLElement) {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    var stop_bcaster = window.document.getElementById("Browser:Stop");
    eGc.loading = !stop_bcaster.hasAttribute("disabled");
    anHTMLElement.classList.toggle("stop", eGc.loading);
    anHTMLElement.classList.toggle("reload", !eGc.loading);
  };
}

function LoadURLScriptAction(number, startsNewGroup, nextAction) {
  Action.call(this, "loadURLScript", function() {
    var prefValue = eGPrefs.getLoadURLScriptPref(this._number);
    var codetext = prefValue[1];
    var isScript = prefValue[2];
    var string = eGc.selection;
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    
    if (codetext !== "") {
      if (string !== "") {
        codetext = codetext.replace("%s", string);
      }
      var curURL = eGc.doc.URL; // get current URL
      if (curURL !== "") {
        codetext = codetext.replace("%u", curURL);
      }
    }
    
    if (isScript === "true") {
      var sandbox = Components.utils.Sandbox(window);
      sandbox.window = window;
      Components.utils.evalInSandbox(codetext, sandbox);
    }
    else {
      var gBrowser = window.gBrowser;
      
      switch (eGm.loadURLin) {
        case "curTab":
          gBrowser.loadURI(codetext);
          break;
        case "newTab":
          gBrowser.selectedTab = gBrowser.addTab(codetext);
          break;
        case "newWindow":
          window.open(codetext);
          break;
      }
    }
    return false; // avoid JavaScript Error
  }, startsNewGroup, nextAction);
  
  this._number = number;
  
  this.getLabel = function() {
    var prefValue = eGPrefs.getLoadURLScriptPref(this._number);
    var label = prefValue[0];
    if (label !== "") {
      // if this action has already a label given by the user, then use it
      return label;
    }
    // otherwise use the default label
    return eGc.localizing.getString(this._name) + " " + number;
  };
  
  this.getXULLabel = function() {
    return document.getElementById("easyGesturesNStrings").getString(this._name + this._number);
  };
}
LoadURLScriptAction.prototype = new Action();

function DisableableAction(name, action, isDisabled, startsNewGroup, nextAction) {
  Action.call(this, name, action, startsNewGroup, nextAction);
  
  this.isDisabled = isDisabled;
  
  this.displayStateOn = function(anHTMLElement) {
    anHTMLElement.setAttribute("grayed", this.isDisabled().toString());
  };
}
DisableableAction.prototype = new Action();

function CanGoBackDisableableAction(name, action, startsNewGroup, nextAction) {
  DisableableAction.call(this, name, action, function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    return !window.gBrowser.canGoBack;
  }, startsNewGroup, nextAction);
}
CanGoBackDisableableAction.prototype = new DisableableAction();

function CanGoForwardDisableableAction(name, action, startsNewGroup, nextAction) {
  DisableableAction.call(this, name, action, function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    return !window.gBrowser.canGoForward;
  }, startsNewGroup, nextAction);
}
CanGoForwardDisableableAction.prototype = new DisableableAction();

function OtherTabsExistDisableableAction(name, action, startsNewGroup, nextAction) {
  DisableableAction.call(this, name, action, function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    return window.gBrowser.mTabContainer.childNodes.length <= 1;
  }, startsNewGroup, nextAction);
}
OtherTabsExistDisableableAction.prototype = new DisableableAction();

function CanGoUpDisableableAction(name, action, startsNewGroup, nextAction) {
  DisableableAction.call(this, name, action, function() {
    var url = eGc.doc.URL;
    return this._getRootURL(url) == url.replace("www.", "");
  }, startsNewGroup, nextAction);
}
CanGoUpDisableableAction.prototype = new DisableableAction();

function DisableableCommandAction(name, startsNewGroup, nextAction) {
  DisableableAction.call(this, name, function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.goDoCommand("cmd_" + name);
  }, function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    var controller = window.document.commandDispatcher
                                    .getControllerForCommand("cmd_" + name);
    return controller === null || !controller.isCommandEnabled("cmd_" + name);
  }, startsNewGroup, nextAction);
}
DisableableCommandAction.prototype = new DisableableAction();


var eGActions = {
  empty : new EmptyAction(),
  
  more : new ExtraMenuAction(),
  
  back : new CanGoBackDisableableAction("back", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.gBrowser.goBack();
  }, true, "backSite"),
  
  backSite : new CanGoBackDisableableAction("backSite", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    var gBrowser = window.gBrowser;
    var index = gBrowser.sessionHistory.index - 1;
    var url = eGc.doc.URL;
    var backurl = (gBrowser.sessionHistory.getEntryAtIndex(index, false)).URI.spec;
    
    while ((this._getRootURL(url).replace("www.", "") == this._getRootURL(backurl).replace("www.", "")) && index > 0) {
      index -= 1;
      url = backurl;
      backurl = gBrowser.sessionHistory.getEntryAtIndex(index, false).URI.spec;
    }
    gBrowser.gotoIndex(index);
  }, false, "firstPage"),
  
  firstPage : new CanGoBackDisableableAction("firstPage", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.gBrowser.gotoIndex(0);
  }, false, "forward"),
  
  forward : new CanGoForwardDisableableAction("forward", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.gBrowser.goForward();
  }, false, "forwardSite"),
  
  forwardSite : new CanGoForwardDisableableAction("forwardSite", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    var gBrowser = window.gBrowser;
    var index = gBrowser.sessionHistory.index + 1;
    var url = eGc.doc.URL;
    var forwardurl = (gBrowser.sessionHistory.getEntryAtIndex(index, false)).URI.spec;
    
    while (this._getRootURL(url).replace("www.", "") == this._getRootURL(forwardurl).replace("www.", "") && index < gBrowser.sessionHistory.count - 1) {
      index += 1;
      url = forwardurl;
      forwardurl = gBrowser.sessionHistory.getEntryAtIndex(index, false).URI.spec;
    }
    gBrowser.gotoIndex(index);
  }, false, "lastPage"),
  
  lastPage : new CanGoForwardDisableableAction("lastPage", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.gBrowser.gotoIndex(window.gBrowser.sessionHistory.count - 1);
  }, false, "reload"),
  
  reload : new ReloadAction(),
  
  homepage : new Action("homepage", function() {
    var homepage = Services.prefs.getCharPref("browser.startup.homepage");
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.gBrowser.loadTabs(homepage.split("|"), true, false);
  }, false, "pageTop"),
  
  pageTop : new DisableableAction("pageTop", function() {
    var frame = eGc.evtMouseDown.originalTarget.ownerDocument.defaultView;
    frame.scroll(0, 0);
  }, function() {
    return eGc.evtMouseDown.originalTarget.ownerDocument.defaultView.scrollY === 0;
  }, true, "pageBottom"),
  
  pageBottom : new DisableableAction("pageBottom", function() {
    var frame = eGc.evtMouseDown.originalTarget.ownerDocument.defaultView;
    frame.scroll(0, frame.scrollMaxY);
  }, function() {
    var frame = eGc.evtMouseDown.originalTarget.ownerDocument.defaultView;
    return frame.scrollY === frame.scrollMaxY;
  }, false, "autoscrolling"),
  
  autoscrolling : new Action("autoscrolling", function() {
    var evt = eGc.evtMouseDown;
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.document.getElementById("content").mCurrentBrowser.startScroll(evt);
  }, false, "zoomIn"),
  
  zoomIn : new Action("zoomIn", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    if (eGc.image === null) {
      window.ZoomManager.useFullZoom = false; //zoom text only because eG's actions images look ugly when scaled
      window.ZoomManager.enlarge();
    }
    else {
      // double image size only
      var width;
      var height;
      
      if (eGc.image.style.width === "") {
        width = eGc.image.width * 2 + "px";
      }
      else {
        width = parseInt(eGc.image.style.width, 10) * 2 + "px";
      }
      
      if (eGc.image.style.height === "") {
        height = eGc.image.height * 2 + "px";
      }
      else {
        height = parseInt(eGc.image.style.height, 10) * 2 + "px";
      }
      
      eGc.image.style.width = width;
      eGc.image.style.height = height;
    }
  }, false, "zoomOut"),
  
  zoomOut : new Action("zoomOut", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    if (eGc.image === null) {
      window.ZoomManager.useFullZoom = false; //zoom text only because eG's actions images look ugly when scaled
      window.ZoomManager.reduce();
    }
    else {
      // halve image size only
      var width;
      var height;
      
      if (eGc.image.style.width === "") {
        width = eGc.image.width * 0.5 + "px";
      }
      else {
        width = parseInt(eGc.image.style.width, 10) * 0.5 + "px";
      }
      
      if (eGc.image.style.height === "") {
        height = eGc.image.height * 0.5 + "px";
      }
      else {
        height = parseInt(eGc.image.style.height, 10) * 0.5 + "px";
      }
      
      eGc.image.style.width = width;
      eGc.image.style.height = height;
    }
  }, false, "zoomReset"),
  
  zoomReset : new Action("zoomReset", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.ZoomManager.reset();
  }, false, "fullscreen"),
  
  fullscreen : new Action("fullscreen", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.fullScreen = !window.fullScreen;
  }, false, "toggleFindBar"),
  
  toggleFindBar : new Action("toggleFindBar", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    if (window.gFindBar.hidden) {
      window.gFindBar.onFindCommand(eGc.selection);
    }
    else {
      window.gFindBar.close();
    }
  }, false, "savePageAs"),
  
  savePageAs : new Action("savePageAs", function() {
    var document = eGc.doc;
    var file = this._getFileForSavingData(
                 Components.interfaces.nsIFilePicker.filterHTML,
                 document.title);
    
    if (file !== null) {
      var wbp = Components.classes['@mozilla.org/embedding/browser/nsWebBrowserPersist;1']
                          .createInstance(Components.interfaces.nsIWebBrowserPersist);
      // don't save gzipped
      wbp.persistFlags &= ~Components.interfaces.nsIWebBrowserPersist.PERSIST_FLAGS_NO_CONVERSION;
      wbp.saveDocument(document, file, null, null, null, null);
    }
  }, false, "printPage"),
  
  printPage : new Action("printPage", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.PrintUtils.print();
  }, false, "viewPageSource"),
  
  viewPageSource : new Action("viewPageSource", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.BrowserViewSourceOfDocument(eGc.doc);
  }, false, "viewPageInfo"),
  
  viewPageInfo : new Action("viewPageInfo", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.BrowserPageInfo(eGc.doc, null);
  }, false, "newTab"),
  
  newTab : new Action("newTab", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    var gBrowser = window.gBrowser;
    gBrowser.selectedTab = gBrowser.addTab();
    window.gURLBar.focus();
  }, true, "duplicateTab"),
  
  duplicateTab : new Action("duplicateTab", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    var gBrowser = window.gBrowser;
    var ss = Components.classes["@mozilla.org/browser/sessionstore;1"]
                       .getService(Components.interfaces.nsISessionStore);
    gBrowser.selectedTab = ss.duplicateTab(window, gBrowser.selectedTab);
  }, false, "closeTab"),
  
  closeTab : new DisableableAction("closeTab", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.gBrowser.removeCurrentTab();
  }, function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    return window.gBrowser.selectedTab.pinned;
  }, false, "closeOtherTabs"),
  
  closeOtherTabs : new DisableableAction("closeOtherTabs", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    var gBrowser = window.gBrowser;
    gBrowser.removeAllTabsBut(gBrowser.selectedTab);
  }, function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    var gBrowser = window.gBrowser;
    var numberOfTabs = gBrowser.tabs.length;
    var numberOfPinnedTabs = 0;
    for (let i=0; i < numberOfTabs; ++i) {
      if (gBrowser.tabs[i].pinned) {
        ++numberOfPinnedTabs;
      }
    }
    return numberOfTabs - numberOfPinnedTabs < 2;
  }, false, "undoCloseTab"),
  
  undoCloseTab : new DisableableAction("undoCloseTab", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    Components.classes["@mozilla.org/browser/sessionstore;1"]
              .getService(Components.interfaces.nsISessionStore)
              .undoCloseTab(window, 0);
  }, function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    return Components.classes["@mozilla.org/browser/sessionstore;1"]
                     .getService(Components.interfaces.nsISessionStore)
                     .getClosedTabCount(window) <= 0;
  }, false, "prevTab"),
  
  prevTab : new OtherTabsExistDisableableAction("prevTab", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.gBrowser.tabContainer.advanceSelectedTab(-1, true);
  }, false, "nextTab"),
  
  nextTab : new OtherTabsExistDisableableAction("nextTab", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.gBrowser.tabContainer.advanceSelectedTab(1, true);
  }, false, "newWindow"),
  
  newWindow : new Action("newWindow", function() {
    var url = "";
    if (Services.prefs.getIntPref("browser.startup.page") == 1) {
      url = Services.prefs.getCharPref("browser.startup.homepage");
      if (url.split('|')[1]) {
        url = "about:blank";
      }
    }
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.open(url);
  }, true, "newBlankWindow"),
  
  newBlankWindow : new Action("newBlankWindow", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.open("about:blank");
  }, false, "newPrivateWindow"),
  
  newPrivateWindow : new Action("newPrivateWindow", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.OpenBrowserWindow({private: true});
  }, false, "duplicateWindow"),
  
  duplicateWindow : new Action("duplicateWindow", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    var gBrowser = window.gBrowser;
    var newWindow;
    
    for (let i = 0; i < gBrowser.browsers.length; i++) {
      let url = gBrowser.browsers[i].currentURI.spec;
      if (i === 0) {
        window.open(url);
        newWindow = Services.wm.getMostRecentWindow("navigator:browser");
      }
      else {
        newWindow.gBrowser.addTab(url);
      }
    }
  }, false, "minimizeWindow"),
  
  minimizeWindow : new Action("minimizeWindow", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.minimize();
  }, false, "closeOtherWindows"),
  
  closeOtherWindows : new DisableableAction("closeOtherWindows", function() {
    var currentWindow = Services.wm.getMostRecentWindow("navigator:browser");
    var openWindows = Services.wm.getEnumerator("navigator:browser");
    
    while (openWindows.hasMoreElements()) {
      let window = openWindows.getNext();
      if (window != currentWindow) {
        window.close();
      }
    }
  }, function() {
    var winEnum = Services.wm.getZOrderDOMWindowEnumerator("navigator:browser", false);
    if (winEnum.hasMoreElements()) {
      winEnum.getNext(); //first window
    }
    return !winEnum.hasMoreElements();
  }, false, "up"),
  
  up : new CanGoUpDisableableAction("up", function() {
    var url = eGc.doc.URL;
    // removing any trailing "/"
    url = url.replace(/\/$/, "");
    // creating a nsIURI and removing the last "/"-separated item from its path
    var uri = Services.io.newURI(url, null, null);
    var path = uri.path.split("/");
    path.pop();
    var upurl = uri.prePath + path.join("/");
    
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.gBrowser.loadURI(upurl);
  }, true, "root"),
  
  root : new CanGoUpDisableableAction("root", function() {
    var url = eGc.doc.URL;
    var rootURL = this._getRootURL(url);
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.gBrowser.loadURI(rootURL);
  }, false, "showOnlyThisFrame"),
  
  showOnlyThisFrame : new Action("showOnlyThisFrame", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.loadURI(eGc.frame_doc.location.href);
  }, false, "focusLocationBar"),
  
  focusLocationBar : new Action("focusLocationBar", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.gURLBar.focus();
  }, false, "searchWeb"),
  
  searchWeb : new Action("searchWeb", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.BrowserSearch.searchBar.value = eGc.selection;
    window.BrowserSearch.webSearch();
  }, false, "quit"),
  
  quit : new Action("quit", function() {
    Services.startup.quit(Components.interfaces.nsIAppStartup.eForceQuit);
  }, false, "restart"),
  
  restart : new Action("restart", function() {
    Services.startup.quit(Components.interfaces.nsIAppStartup.eAttemptQuit |
                          Components.interfaces.nsIAppStartup.eRestart);
  }, false, "openLink"),
  
  openLink : new Action("openLink", function() {
    var link = eGc.link;
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    var gBrowser = window.gBrowser;
    var url;
    if (link === null) {
      url = this._readClipboard();
    }
    else {
      url = link.href;
    }
    
    switch (eGm.openLink) {
      case "curTab":
        gBrowser.loadURI(url);
        break;
      case "newTab":
        gBrowser.addTab(url);
        break;
      case "newWindow":
        window.open(url);
        break;
    }
  }, true, "openLinkNewWindow"),
  
  openLinkNewWindow : new Action("openLinkNewWindow", function() {
    var link = eGc.link;
    var url;
    if (link === null) {
      url = this._readClipboard();
    }
    else {
      url = link.href;
    }
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.open(url);
  }, false, "openLinkInNewPrivateWindow"),
  
  openLinkInNewPrivateWindow : new Action("openLinkInNewPrivateWindow", function() {
    var link = eGc.link;
    var url;
    if (link === null) {
      url = this._readClipboard();
    }
    else {
      url = link.href;
    }
    
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.open(url, "_blank", "toolbar,location,personalbar,resizable,scrollbars,private");
  }, false, "copyLink"),
  
  copyLink : new DisableableAction("copyLink", function() {
    Components.classes["@mozilla.org/widget/clipboardhelper;1"]
              .getService(Components.interfaces.nsIClipboardHelper)
              .copyString(eGc.link.href);
  }, function() {
    return eGc.link === null;
  }, false, "saveLinkAs"),
  
  saveLinkAs : new Action("saveLinkAs", function() {
    this._saveContentFromLink(eGc.link, Components.interfaces.nsIFilePicker.filterHTML);
  }, false, "dailyReadings"),
  
  dailyReadings : new Action("dailyReadings", function() {
    function _checkDailyReadingsFolder() {
      var dailyReadingsFolderNode = null;
      var folderName = "@easyGestures";
      var historyService = Components.classes["@mozilla.org/browser/nav-history-service;1"]
                                     .getService(Components.interfaces.nsINavHistoryService);
      var bookmarksService = Components.classes["@mozilla.org/browser/nav-bookmarks-service;1"]
                                     .getService(Components.interfaces.nsINavBookmarksService);
      
      try {
        // check if dailyReadings folder already exists in toolbarFolder
        var options = historyService.getNewQueryOptions();
        var query = historyService.getNewQuery();
        options.excludeItems = false;
        query.setFolders([bookmarksService.toolbarFolder], 1);
        //query.setFolders([bookmarksService.placesRoot], 1);
        var result = historyService.executeQuery(query, options);
        
        result.root.containerOpen = true;
        for (var i = 0; i < result.root.childCount; i++) {
          // iterate over the immediate children of this folder
          if (result.root.getChild(i).itemId == eGm.dailyReadingsFolderURI && eGm.dailyReadingsFolderURI !== "" || result.root.getChild(i).title == folderName) {
            dailyReadingsFolderNode = result.root.getChild(i);
            if (eGm.dailyReadingsFolderURI === "") {
              // update value if no value found
              eGm.dailyReadingsFolderURI = result.root.getChild(i).itemId;
              eGPrefs.setDailyReadingsFolderPref(eGm.dailyReadingsFolderURI);
            }
            break;
          }
        }
        result.root.containerOpen = false; // close a container after using it!
      }
      catch (ex) {
        alert("Exception: "+ ex.toString());
        return false;
      }
      
      if (eGm.dailyReadingsFolderURI === "" || dailyReadingsFolderNode === null) {
        var menuFolder = bookmarksService.toolbarFolder;
        var newFolderId = bookmarksService.createFolder(menuFolder, folderName, -1);
        
        eGm.dailyReadingsFolderURI = newFolderId;
        eGPrefs.setDailyReadingsFolderPref(newFolderId);
        
        Services.prompt.alert(null, "", eGc.localizing.getString("dailyReadingsCreate"));
      }
      return dailyReadingsFolderNode;
    }
    
    var dailyReadingsFolderNode = _checkDailyReadingsFolder();
    
    if (dailyReadingsFolderNode !== null) {
      dailyReadingsFolderNode.QueryInterface(Components.interfaces.nsINavHistoryContainerResultNode);
      dailyReadingsFolderNode.containerOpen = true;
      var uris = [];
      for (let i=0; i < dailyReadingsFolderNode.childCount; ++i) {
        uris.push(dailyReadingsFolderNode.getChild(i).uri);
      }
      dailyReadingsFolderNode.containerOpen = false;
      var window = Services.wm.getMostRecentWindow("navigator:browser");
      window.gBrowser.loadTabs(uris, true, false);
    }
  }, true, "bookmarkPage"),
  
  bookmarkPage : new Action("bookmarkPage", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.PlacesCommandHook.bookmarkPage(window.gBrowser.selectedBrowser, window.PlacesUtils.unfiledBookmarksFolderId, true);
    // var url = eGc.doc.URL, name = eGc.doc.title, doc = eGc.doc;
    // PlacesUIUtils.showMinimalAddBookmarkUI(PlacesUtils._uri(url), name, PlacesUtils.getDescriptionFromDocument(doc));   // classic UI
  }, false, "bookmarkThisLink"),
  
  bookmarkThisLink : new Action("bookmarkThisLink", function() {
    var url = eGc.link;
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.PlacesCommandHook.bookmarkLink(window.PlacesUtils.unfiledBookmarksFolderId, url.href, url.text);
    //PlacesUIUtils.showMinimalAddBookmarkUI(PlacesUtils._uri(url), url.text);    // classic UI
  }, false, "bookmarkOpenTabs"),
  
  bookmarkOpenTabs : new Action("bookmarkOpenTabs", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.PlacesCommandHook.bookmarkCurrentPages();
    //PlacesUIUtils.showMinimalAddMultiBookmarkUI(PlacesCommandHook._getUniqueTabInfo());
  }, false, "bookmarks"),
  
  bookmarks : new Action("bookmarks", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.toggleSidebar("viewBookmarksSidebar");
  }, false, "bookmarksToolbar"),
  
  bookmarksToolbar : new Action("bookmarksToolbar", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    var document = window.document;
    var tb = document.getElementById("PersonalToolbar");
    if (tb.hasAttribute("collapsed")) {
      tb.removeAttribute("collapsed");
    }
    else {
      tb.setAttribute("collapsed", true);
    }
    // make it persistent
    document.persist("PersonalToolbar", 'collapsed');
  }, false, "history"),
  
  history : new Action("history", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.toggleSidebar("viewHistorySidebar");
  }, false, "loadURLScript1"),
  
  loadURLScript1 : new LoadURLScriptAction(1, true, "loadURLScript2"),
  
  loadURLScript2 : new LoadURLScriptAction(2, false, "loadURLScript3"),
  
  loadURLScript3 : new LoadURLScriptAction(3, false, "loadURLScript4"),
  
  loadURLScript4 : new LoadURLScriptAction(4, false, "loadURLScript5"),
  
  loadURLScript5 : new LoadURLScriptAction(5, false, "loadURLScript6"),
  
  loadURLScript6 : new LoadURLScriptAction(6, false, "loadURLScript7"),
  
  loadURLScript7 : new LoadURLScriptAction(7, false, "loadURLScript8"),
  
  loadURLScript8 : new LoadURLScriptAction(8, false, "loadURLScript9"),
  
  loadURLScript9 : new LoadURLScriptAction(9, false, "loadURLScript10"),
  
  loadURLScript10 : new LoadURLScriptAction(10, false, "loadURLScript11"),
  
  loadURLScript11 : new LoadURLScriptAction(11, false, "loadURLScript12"),
  
  loadURLScript12 : new LoadURLScriptAction(12, false, "loadURLScript13"),
  
  loadURLScript13 : new LoadURLScriptAction(13, false, "loadURLScript14"),
  
  loadURLScript14 : new LoadURLScriptAction(14, false, "loadURLScript15"),
  
  loadURLScript15 : new LoadURLScriptAction(15, false, "loadURLScript16"),
  
  loadURLScript16 : new LoadURLScriptAction(16, false, "loadURLScript17"),
  
  loadURLScript17 : new LoadURLScriptAction(17, false, "loadURLScript18"),
  
  loadURLScript18 : new LoadURLScriptAction(18, false, "loadURLScript19"),
  
  loadURLScript19 : new LoadURLScriptAction(19, false, "loadURLScript20"),
  
  loadURLScript20 : new LoadURLScriptAction(20, false, "copyImageLocation"),
  
  copyImageLocation : new DisableableAction("copyImageLocation", function() {
    Components.classes["@mozilla.org/widget/clipboardhelper;1"]
              .getService(Components.interfaces.nsIClipboardHelper)
              .copyString(eGc.image.src);
  }, function() {
    return eGc.image.src === null;
  }, true, "copyImage"),
  
  copyImage : new Action("copyImage", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.document.popupNode = eGc.image;
    window.goDoCommand('cmd_copyImageContents');
  }, false, "saveImageAs"),
  
  saveImageAs : new Action("saveImageAs", function() {
    this._saveContentFromLink(eGc.image.src, Components.interfaces.nsIFilePicker.filterImages);
  }, false, "hideImages"),
  
  hideImages : new Action("hideImages", function() {
    if (eGc.image !== null) {
      eGc.image.style.display = "none";
    }
    else {
      var imgs = eGc.doc.getElementsByTagName("img");
      for (var i=0; i < imgs.length; i++) {
        imgs[i].style.display = "none";
      }
    }
  }, false, "cut"),
  
  cut : new DisableableCommandAction("cut", true, "copy"),
  
  copy : new DisableableCommandAction("copy", false, "paste"),
  
  paste : new DisableableCommandAction("paste", false, "undo"),
  
  undo : new DisableableCommandAction("undo", false, "selectAll"),
  
  selectAll : new DisableableCommandAction("selectAll", false,
    "markVisitedLinks"),
  
  markVisitedLinks : new Action("markVisitedLinks", function() {
    var styleElement = eGc.doc.createElement("style");
    eGc.doc.getElementsByTagName("head")[0].appendChild(styleElement);
    var styleSheet = eGc.doc.styleSheets[eGc.doc.styleSheets.length - 1];
    styleSheet.insertRule(":link, :link img { outline: dashed medium white !important; }", 0);
    styleSheet.insertRule(":visited, :visited img { outline-color: red !important; }", 1);
  }, true, null)
};
