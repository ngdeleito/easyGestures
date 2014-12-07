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
//  |-- ShowExtraMenuAction
//  |-- ReloadAction
//  |-- LoadURLAction
//  |-- RunScriptAction
//  |-- DisableableAction
//       ^
//       |-- CanGoBackDisableableAction
//       |-- CanGoForwardDisableableAction
//       |-- OtherTabsExistDisableableAction
//       |-- CanGoUpDisableableAction
//       |-- LinkExistsDisableableAction
//       |-- DailyReadingsDisableableAction
//       |-- ImageExistsDisableableAction
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
      var wbp = Components.classes["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"]
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

function EmptyAction(startsNewGroup, nextAction) {
  Action.call(this, "empty", function() {}, startsNewGroup, nextAction);
  
  this.getXULLabel = function() {
    return document.getElementById("easyGesturesNStrings").getString("emptyActionName");
  };
}
EmptyAction.prototype = new Action();

function ShowExtraMenuAction(startsNewGroup, nextAction) {
  Action.call(this, "showExtraMenu", function() {
    eGm.showExtraMenu();
  }, startsNewGroup, nextAction);
  
  this.getXULLabel = function() {
    return document.getElementById("easyGesturesNStrings").getString("extraMenuActionName");
  };
  
  this.isExtraMenuAction = true;
}
ShowExtraMenuAction.prototype = new Action();

function ReloadAction(startsNewGroup, nextAction) {
  Action.call(this, "reload", function() { // reload or stop
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    var gBrowser = window.gBrowser;
    
    if (!eGc.loading) {
      gBrowser.reload();
    }
    else {
      gBrowser.stop();
    }
  }, startsNewGroup, nextAction);
  
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
ReloadAction.prototype = new Action();

function NumberedAction(namePrefix, number, action, startsNewGroup, nextAction) {
  Action.call(this, namePrefix + number, function() {
    var content = eGPrefs.getLoadURLOrRunScriptPrefValue(this._name)[1];
    
    content = content.replace("%s", eGc.selection);
    content = content.replace("%u", eGc.doc.URL);
    
    action(content, Services.wm.getMostRecentWindow("navigator:browser"));
  }, startsNewGroup, nextAction);
  
  this._number = number;
  
  this.getLabel = function() {
    var prefValue = eGPrefs.getLoadURLOrRunScriptPrefValue(this._name);
    var label = prefValue[0];
    if (label !== "") {
      // if this action has already a label given by the user, then use it
      return label;
    }
    // otherwise use the default label
    return eGc.localizing.getString(this._name);
  };
}
NumberedAction.prototype = new Action();

function LoadURLAction(number, startsNewGroup, nextAction) {
  NumberedAction.call(this, "loadURL", number, function(URL, window) {
    var gBrowser = window.gBrowser;
    
    switch (eGm.loadURLin) {
      case "curTab":
        gBrowser.loadURI(URL);
        break;
      case "newTab":
        gBrowser.selectedTab = gBrowser.addTab(URL);
        break;
      case "newWindow":
        window.open(URL);
        break;
    }
  }, startsNewGroup, nextAction);
}
LoadURLAction.prototype = new NumberedAction();

function RunScriptAction(number, startsNewGroup, nextAction) {
  NumberedAction.call(this, "runScript", number, function(script, window) {
    var sandbox = Components.utils.Sandbox(window);
    sandbox.window = window;
    Components.utils.evalInSandbox(script, sandbox);
  }, startsNewGroup, nextAction);
}
RunScriptAction.prototype = new NumberedAction();

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

function LinkExistsDisableableAction(name, action, startsNewGroup, nextAction) {
  DisableableAction.call(this, name, action, function() {
    return eGc.link === null;
  }, startsNewGroup, nextAction);
}
LinkExistsDisableableAction.prototype = new DisableableAction();

function DailyReadingsDisableableAction(startsNewGroup, nextAction) {
  var uris;
  
  function initializeURIsArrayWithContentsOfDailyReadingsFolder() {
    function pushURIsContainedInFolder(resultNode) {
      resultNode.containerOpen = true;
      for (let i=0; i < resultNode.childCount; ++i) {
        if (resultNode.getChild(i).type === 6) {
          // the current child is a folder
          let node = resultNode.getChild(i).QueryInterface(
            Components.interfaces.nsINavHistoryContainerResultNode);
          pushURIsContainedInFolder(node);
        }
        else if (resultNode.getChild(i).type === 0) {
          // the current child is a bookmark (i.e. no folder, no separator)
          uris.push(resultNode.getChild(i).uri);
        }
      }
      resultNode.containerOpen = false;
    }
    
    var historyService =
      Components.classes["@mozilla.org/browser/nav-history-service;1"]
                .getService(Components.interfaces.nsINavHistoryService);
    var query = historyService.getNewQuery();
    query.setFolders([eGPrefs.getDailyReadingsFolderID()], 1);
    var options = historyService.getNewQueryOptions();
    var results = historyService.executeQuery(query, options);
    
    uris = [];
    pushURIsContainedInFolder(results.root);
  }
  
  DisableableAction.call(this, "dailyReadings", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.gBrowser.loadTabs(uris, true, false);
  }, function() {
    var folderID = eGPrefs.getDailyReadingsFolderID();
    initializeURIsArrayWithContentsOfDailyReadingsFolder();
    return folderID === -1 || uris.length === 0;
  }, startsNewGroup, nextAction);
}
DailyReadingsDisableableAction.prototype = new DisableableAction();

function ImageExistsDisableableAction(name, action, startsNewGroup, nextAction) {
  DisableableAction.call(this, name, action, function() {
    return eGc.image === null;
  }, startsNewGroup, nextAction);
}
ImageExistsDisableableAction.prototype = new DisableableAction();

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
  empty : new EmptyAction(false, "showExtraMenu"),
  
  showExtraMenu : new ShowExtraMenuAction(true, "back"),
  
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
  
  reload : new ReloadAction(false, "homepage"),
  
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
  }, false, "toggleFullscreen"),
  
  toggleFullscreen : new Action("toggleFullscreen", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.fullScreen = !window.fullScreen;
  }, false, "toggleFindBar"),
  
  toggleFindBar : new Action("toggleFindBar", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    if (window.gFindBar.hidden) {
      window.gFindBar.onFindCommand();
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
      var wbp = Components.classes["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"]
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
    gBrowser.selectedTab = gBrowser.addTab("about:newtab");
    window.gURLBar.focus();
  }, true, "newBlankTab"),
  
  newBlankTab : new Action("newBlankTab", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    var gBrowser = window.gBrowser;
    gBrowser.selectedTab = gBrowser.addTab("about:blank");
    window.gURLBar.focus();
  }, false, "duplicateTab"),
  
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
                     .getClosedTabCount(window) === 0;
  }, false, "prevTab"),
  
  prevTab : new OtherTabsExistDisableableAction("prevTab", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.gBrowser.tabContainer.advanceSelectedTab(-1, true);
  }, false, "nextTab"),
  
  nextTab : new OtherTabsExistDisableableAction("nextTab", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.gBrowser.tabContainer.advanceSelectedTab(1, true);
  }, false, "pinUnpinTab"),
  
  pinUnpinTab : new Action("pinUnpinTab", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    var gBrowser = window.gBrowser;
    if (gBrowser.selectedTab.pinned) {
      gBrowser.unpinTab(gBrowser.selectedTab);
    }
    else {
      gBrowser.pinTab(gBrowser.selectedTab);
    }
  }, false, "newWindow"),
  
  newWindow : new Action("newWindow", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.open("about:blank");
    if (Services.prefs.getIntPref("browser.startup.page") !== 0) {
      window = Services.wm.getMostRecentWindow("navigator:browser");
      let homepage = Services.prefs.getCharPref("browser.startup.homepage");
      window.gBrowser.loadTabs(homepage.split("|"), true, true);
    }
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
    var tabs = window.gBrowser.tabs;
    window.open();
    var newWindow = Services.wm.getMostRecentWindow("navigator:browser");
    var ss = Components.classes["@mozilla.org/browser/sessionstore;1"]
                       .getService(Components.interfaces.nsISessionStore);
    
    for (let i = 0; i < tabs.length; ++i) {
      newWindow.gBrowser.selectedTab = ss.duplicateTab(newWindow, tabs[i]);
    }
    newWindow.gBrowser.removeTab(newWindow.gBrowser.tabs[0]);
  }, false, "minimizeWindow"),
  
  minimizeWindow : new Action("minimizeWindow", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.minimize();
  }, false, "closeWindow"),
  
  closeWindow : new Action("closeWindow", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.close();
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
  }, false, "undoCloseWindow"),
  
  undoCloseWindow : new DisableableAction("undoCloseWindow", function() {
    var ss = Components.classes["@mozilla.org/browser/sessionstore;1"]
                       .getService(Components.interfaces.nsISessionStore);
    ss.undoCloseWindow(0);
  }, function() {
    var ss = Components.classes["@mozilla.org/browser/sessionstore;1"]
                       .getService(Components.interfaces.nsISessionStore);
    return ss.getClosedWindowCount() === 0;
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
  
  openLink : new LinkExistsDisableableAction("openLink", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    var gBrowser = window.gBrowser;
    var url = eGc.link.href;
    
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
  }, true, "openLinkInNewWindow"),
  
  openLinkInNewWindow : new LinkExistsDisableableAction("openLinkInNewWindow", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.open(eGc.link.href);
  }, false, "openLinkInNewPrivateWindow"),
  
  openLinkInNewPrivateWindow : new LinkExistsDisableableAction("openLinkInNewPrivateWindow", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.open(eGc.link.href, "_blank",
                "toolbar,location,personalbar,resizable,scrollbars,private");
  }, false, "copyLink"),
  
  copyLink : new LinkExistsDisableableAction("copyLink", function() {
    Components.classes["@mozilla.org/widget/clipboardhelper;1"]
              .getService(Components.interfaces.nsIClipboardHelper)
              .copyString(eGc.link.href);
  }, false, "saveLinkAs"),
  
  saveLinkAs : new LinkExistsDisableableAction("saveLinkAs", function() {
    this._saveContentFromLink(eGc.link, Components.interfaces.nsIFilePicker.filterHTML);
  }, false, "dailyReadings"),
  
  dailyReadings : new DailyReadingsDisableableAction(true, "bookmarkThisPage"),
  
  // useful links:
  // http://mxr.mozilla.org/mozilla-central/source/browser/components/places/
  // http://mxr.mozilla.org/mozilla-central/source/browser/base/content/browser-places.js
  bookmarkThisPage : new Action("bookmarkThisPage", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    var bookmarksService =
          Components.classes["@mozilla.org/browser/nav-bookmarks-service;1"]
                    .getService(Components.interfaces.nsINavBookmarksService);
    var uri = Services.io.newURI(eGc.doc.URL, null, null);
    if (bookmarksService.isBookmarked(uri)) {
      window.PlacesCommandHook.bookmarkCurrentPage(true,
          window.PlacesUtils.unfiledBookmarksFolderId);
    }
    else {
      bookmarksService.insertBookmark(bookmarksService.unfiledBookmarksFolder,
        uri, bookmarksService.DEFAULT_INDEX, eGc.doc.title);
    }
  }, false, "bookmarkThisLink"),
  
  bookmarkThisLink : new LinkExistsDisableableAction("bookmarkThisLink", function() {
    var url = eGc.link;
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.PlacesCommandHook.bookmarkLink(null, url, url.text);
  }, false, "bookmarkOpenTabs"),
  
  bookmarkOpenTabs : new Action("bookmarkOpenTabs", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.PlacesCommandHook.bookmarkCurrentPages();
  }, false, "showBookmarks"),
  
  showBookmarks : new Action("showBookmarks", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.PlacesCommandHook.showPlacesOrganizer("AllBookmarks");
  }, false, "toggleBookmarksSidebar"),
  
  toggleBookmarksSidebar : new Action("toggleBookmarksSidebar", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.toggleSidebar("viewBookmarksSidebar");
  }, false, "toggleBookmarksToolbar"),
  
  toggleBookmarksToolbar : new Action("toggleBookmarksToolbar", function() {
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
    document.persist("PersonalToolbar", "collapsed");
  }, false, "showHistory"),
  
  showHistory : new Action("showHistory", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.PlacesCommandHook.showPlacesOrganizer("History");
  }, false, "toggleHistorySidebar"),
  
  toggleHistorySidebar : new Action("toggleHistorySidebar", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.toggleSidebar("viewHistorySidebar");
  }, false, "showDownloads"),
  
  showDownloads : new Action("showDownloads", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.PlacesCommandHook.showPlacesOrganizer("Downloads");
  }, false, "loadURL1"),
  
  loadURL1 : new LoadURLAction(1, true, "loadURL2"),
  
  loadURL2 : new LoadURLAction(2, false, "loadURL3"),
  
  loadURL3 : new LoadURLAction(3, false, "loadURL4"),
  
  loadURL4 : new LoadURLAction(4, false, "loadURL5"),
  
  loadURL5 : new LoadURLAction(5, false, "loadURL6"),
  
  loadURL6 : new LoadURLAction(6, false, "loadURL7"),
  
  loadURL7 : new LoadURLAction(7, false, "loadURL8"),
  
  loadURL8 : new LoadURLAction(8, false, "loadURL9"),
  
  loadURL9 : new LoadURLAction(9, false, "loadURL10"),
  
  loadURL10 : new LoadURLAction(10, false, "runScript1"),
  
  runScript1 : new RunScriptAction(1, true, "runScript2"),
  
  runScript2 : new RunScriptAction(2, false, "runScript3"),
  
  runScript3 : new RunScriptAction(3, false, "runScript4"),
  
  runScript4 : new RunScriptAction(4, false, "runScript5"),
  
  runScript5 : new RunScriptAction(5, false, "runScript6"),
  
  runScript6 : new RunScriptAction(6, false, "runScript7"),
  
  runScript7 : new RunScriptAction(7, false, "runScript8"),
  
  runScript8 : new RunScriptAction(8, false, "runScript9"),
  
  runScript9 : new RunScriptAction(9, false, "runScript10"),
  
  runScript10 : new RunScriptAction(10, false, "copyImageLocation"),
  
  
  
  copyImageLocation : new ImageExistsDisableableAction("copyImageLocation",
    function() {
    Components.classes["@mozilla.org/widget/clipboardhelper;1"]
              .getService(Components.interfaces.nsIClipboardHelper)
              .copyString(eGc.image.src);
  }, true, "copyImage"),
  
  copyImage : new ImageExistsDisableableAction("copyImage", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.document.popupNode = eGc.image;
    window.goDoCommand("cmd_copyImageContents");
  }, false, "saveImageAs"),
  
  saveImageAs : new ImageExistsDisableableAction("saveImageAs", function() {
    this._saveContentFromLink(eGc.image.src,
                              Components.interfaces.nsIFilePicker.filterImages);
  }, false, "hideImages"),
  
  hideImages : new DisableableAction("hideImages", function() {
    var images = eGc.doc.querySelectorAll("img:not([id^='eG_'])");
    for (var i=0; i < images.length; ++i) {
      images[i].style.display = "none";
    }
  }, function() {
    return eGc.doc.querySelectorAll("img:not([id^='eG_'])").length === 0;
  }, false, "cut"),
  
  cut : new DisableableCommandAction("cut", true, "copy"),
  
  copy : new DisableableCommandAction("copy", false, "paste"),
  
  paste : new DisableableCommandAction("paste", false, "undo"),
  
  undo : new DisableableCommandAction("undo", false, "redo"),
  
  redo : new DisableableCommandAction("redo", false, "selectAll"),
  
  selectAll : new DisableableCommandAction("selectAll", false, null)
};
