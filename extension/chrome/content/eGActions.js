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
//  |-- DisableableAction
//       ^
//       |-- CanGoBackDisableableAction
//       |-- CanGoForwardDisableableAction
//       |-- OtherTabsExistDisableableAction
//       |-- CanGoUpDisableableAction
//       |-- LinkExistsDisableableAction
//       |-- DailyReadingsDisableableAction
//       |-- NumberedAction
//       |    ^
//       |    |-- LoadURLAction
//       |    |-- RunScriptAction
//       |-- ImageExistsDisableableAction
//       |-- DisableableCommandAction

/* exported eGActions */
/* global eGm, eGPrefs, eGStrings, Downloads */

function Action(name, action, startsNewGroup, nextAction) {
  this._name = name;
  this.run = function() {
    eGm.close();
    action.call(this);
  };
  
  // startsNewGroup and nextAction are used in options.js to display a sorted
  // list of available actions
  this.startsNewGroup = startsNewGroup;
  this.nextAction = nextAction;
  
  this.isExtraMenuAction = false;
}
Action.prototype = {
  constructor: Action,
  
  isDisabled: function() {
    return false;
  },
  
  getLabel: function() {
    return eGStrings.getString(this._name);
  },
  
  getXULLabel: function() {
    return document.getElementById("easyGesturesNStrings").getString(this._name);
  },
  
  setActionStatusOn: function() {},
  
  // helper functions
  
  _getRootURL: function(url) {
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
  },
  
  _sendPerformActionMessage: function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.gBrowser.selectedBrowser.messageManager.sendAsyncMessage("easyGesturesN@ngdeleito.eu:action:" + this._name);
  },
  
  _getFileForSavingData: function(filter, defaultName) {
    const nsIFilePicker = Components.interfaces.nsIFilePicker;
    var fp = Components.classes["@mozilla.org/filepicker;1"]
                       .createInstance(nsIFilePicker);
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    
    fp.init(window, null, nsIFilePicker.modeSave);
    fp.appendFilters(filter);
    fp.defaultString = defaultName;
    var returnValue = fp.show();
    if (returnValue === nsIFilePicker.returnOK || returnValue === nsIFilePicker.returnReplace) {
      return fp.file;
    }
    else {
      return null;
    }
  },
  
  _saveContentFromLink: function(link, filter) {
    var uri = Services.io.newURI(link, null, null);
    var file = this._getFileForSavingData(
                 filter,
                 uri.path.substring(uri.path.lastIndexOf("/") + 1));
    
    if (file !== null) {
      Components.utils.import("resource://gre/modules/Downloads.jsm");
      Downloads.fetch(uri, file);
    }
  },
  
  _openInPrivateWindow: function(URL, window) {
    window.open(URL, "_blank",
                "toolbar,location,personalbar,resizable,scrollbars,private");
  },
  
  _showOrOpenTab: function(aURL) {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    var gBrowser = window.gBrowser;
    var i;
    var found = false;
    
    for (i = 0; i < gBrowser.tabs.length && !found; i++) {
      let browser = gBrowser.getBrowserForTab(gBrowser.tabs[i]);
      found = browser.currentURI.spec === aURL;
    }
    if (found) {
      gBrowser.selectedTab = gBrowser.tabs[--i];
    }
    else {
      gBrowser.selectedTab = gBrowser.addTab(aURL);
    }
  }
};

function EmptyAction(startsNewGroup, nextAction) {
  Action.call(this, "empty", function() {}, startsNewGroup, nextAction);
}
EmptyAction.prototype = Object.create(Action.prototype);
EmptyAction.prototype.constructor = EmptyAction;
EmptyAction.prototype.getXULLabel = function() {
  return document.getElementById("easyGesturesNStrings").getString("emptyActionName");
};

function ShowExtraMenuAction(startsNewGroup, nextAction) {
  Action.call(this, "showExtraMenu", null, startsNewGroup, nextAction);
  
  this.run = function() {
    eGm.showExtraMenu();
  };
  
  this.isExtraMenuAction = true;
}
ShowExtraMenuAction.prototype = Object.create(Action.prototype);
ShowExtraMenuAction.prototype.constructor = ShowExtraMenuAction;
ShowExtraMenuAction.prototype.getXULLabel = function() {
  return document.getElementById("easyGesturesNStrings").getString("extraMenuActionName");
};

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
}
ReloadAction.prototype = Object.create(Action.prototype);
ReloadAction.prototype.constructor = ReloadAction;
ReloadAction.prototype.getXULLabel = function() {
  return document.getElementById("easyGesturesNStrings").getString("reloadActionName");
};
ReloadAction.prototype.setActionStatusOn = function(layoutName, actionSector) {
  var window = Services.wm.getMostRecentWindow("navigator:browser");
  var browserMM = window.gBrowser.selectedBrowser.messageManager;
  var stop_bcaster = window.document.getElementById("Browser:Stop");
  eGc.loading = !stop_bcaster.hasAttribute("disabled");
  browserMM.sendAsyncMessage("easyGesturesN@ngdeleito.eu:setReloadActionStatus", {
    layoutName: layoutName,
    actionSector: actionSector,
    status: eGc.loading
  });
};

function DisableableAction(name, action, isDisabled, startsNewGroup, nextAction) {
  Action.call(this, name, action, startsNewGroup, nextAction);
  
  this.isDisabled = isDisabled;
}
DisableableAction.prototype = Object.create(Action.prototype);
DisableableAction.prototype.constructor = DisableableAction;
DisableableAction.prototype.setActionStatusOn = function(layoutName, actionSector) {
  var window = Services.wm.getMostRecentWindow("navigator:browser");
  var browserMM = window.gBrowser.selectedBrowser.messageManager;
  browserMM.sendAsyncMessage("easyGesturesN@ngdeleito.eu:setActionStatus", {
    layoutName: layoutName,
    actionSector: actionSector,
    status: this.isDisabled()
  });
};

function CanGoBackDisableableAction(name, action, startsNewGroup, nextAction) {
  DisableableAction.call(this, name, action, function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    return !window.gBrowser.canGoBack;
  }, startsNewGroup, nextAction);
}
CanGoBackDisableableAction.prototype = Object.create(DisableableAction.prototype);
CanGoBackDisableableAction.prototype.constructor = CanGoBackDisableableAction;

function CanGoForwardDisableableAction(name, action, startsNewGroup, nextAction) {
  DisableableAction.call(this, name, action, function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    return !window.gBrowser.canGoForward;
  }, startsNewGroup, nextAction);
}
CanGoForwardDisableableAction.prototype = Object.create(DisableableAction.prototype);
CanGoForwardDisableableAction.prototype.constructor = CanGoForwardDisableableAction;

function OtherTabsExistDisableableAction(name, action, startsNewGroup, nextAction) {
  DisableableAction.call(this, name, action, function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    return window.gBrowser.mTabContainer.childNodes.length <= 1;
  }, startsNewGroup, nextAction);
}
OtherTabsExistDisableableAction.prototype = Object.create(DisableableAction.prototype);
OtherTabsExistDisableableAction.prototype.constructor = OtherTabsExistDisableableAction;

function CanGoUpDisableableAction(name, action, startsNewGroup, nextAction) {
  DisableableAction.call(this, name, action, function() {
    var url = eGc.topmostDocumentURL;
    return this._getRootURL(url) === url.replace("www.", "");
  }, startsNewGroup, nextAction);
}
CanGoUpDisableableAction.prototype = Object.create(DisableableAction.prototype);
CanGoUpDisableableAction.prototype.constructor = CanGoUpDisableableAction;

function LinkExistsDisableableAction(name, action, startsNewGroup, nextAction) {
  DisableableAction.call(this, name, action, function() {
    return !eGm.anchorElementExists;
  }, startsNewGroup, nextAction);
}
LinkExistsDisableableAction.prototype = Object.create(DisableableAction.prototype);
LinkExistsDisableableAction.prototype.constructor = LinkExistsDisableableAction;

function DailyReadingsDisableableAction(startsNewGroup, nextAction) {
  DisableableAction.call(this, "dailyReadings", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.gBrowser.loadTabs(this.uris, true, false);
  }, function() {
    var folderID = eGPrefs.getDailyReadingsFolderID();
    this.initializeURIsArrayWithContentsOfDailyReadingsFolder();
    return folderID === -1 || this.uris.length === 0;
  }, startsNewGroup, nextAction);
}
DailyReadingsDisableableAction.prototype = Object.create(DisableableAction.prototype);
DailyReadingsDisableableAction.prototype.constructor = DailyReadingsDisableableAction;
DailyReadingsDisableableAction.prototype.initializeURIsArrayWithContentsOfDailyReadingsFolder = function() {
  function pushURIsContainedInFolder(resultNode, that) {
    resultNode.containerOpen = true;
    for (let i=0; i < resultNode.childCount; ++i) {
      if (resultNode.getChild(i).type === 6) {
        // the current child is a folder
        let node = resultNode.getChild(i).QueryInterface(
          Components.interfaces.nsINavHistoryContainerResultNode);
        pushURIsContainedInFolder(node, that);
      }
      else if (resultNode.getChild(i).type === 0) {
        // the current child is a bookmark (i.e. no folder, no separator)
        that.uris.push(resultNode.getChild(i).uri);
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
  
  this.uris = [];
  pushURIsContainedInFolder(results.root, this);
};

function NumberedAction(namePrefix, number, action, startsNewGroup, nextAction) {
  DisableableAction.call(this, namePrefix + number, function() {
    var prefValue = eGPrefs.getLoadURLOrRunScriptPrefValue(this._name);
    var content = prefValue[1];
    
    content = content.replace("%s", eGm.selection);
    content = content.replace("%u", eGc.topmostDocumentURL);
    
    action.call(this, content,
      Services.wm.getMostRecentWindow("navigator:browser"),
      3 in prefValue ? prefValue[3] : undefined);
  }, function() {
    return eGPrefs.getLoadURLOrRunScriptPrefValue(this._name)[1] === "";
  }, startsNewGroup, nextAction);
  
  this._number = number;
}
NumberedAction.prototype = Object.create(DisableableAction.prototype);
NumberedAction.prototype.constructor = NumberedAction;
NumberedAction.prototype.getLabel = function() {
  var prefValue = eGPrefs.getLoadURLOrRunScriptPrefValue(this._name);
  var label = prefValue[0];
  if (label !== "") {
    // if this action has already a label given by the user, then use it
    return label;
  }
  // otherwise use the default label
  return eGStrings.getString(this._name);
};

function LoadURLAction(number, startsNewGroup, nextAction) {
  NumberedAction.call(this, "loadURL", number,
    function(URL, window, openInPrivateWindow) {
      var gBrowser = window.gBrowser;
      
      if (openInPrivateWindow === "true") {
        this._openInPrivateWindow(URL, window);
      }
      else {
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
      }
    }, startsNewGroup, nextAction);
}
LoadURLAction.prototype = Object.create(NumberedAction.prototype);
LoadURLAction.prototype.constructor = LoadURLAction;

function RunScriptAction(number, startsNewGroup, nextAction) {
  NumberedAction.call(this, "runScript", number, function(script, window) {
    var sandbox = Components.utils.Sandbox(window);
    sandbox.window = window;
    Components.utils.evalInSandbox(script, sandbox);
  }, startsNewGroup, nextAction);
}
RunScriptAction.prototype = Object.create(NumberedAction.prototype);
RunScriptAction.prototype.constructor = RunScriptAction;

function ImageExistsDisableableAction(name, action, startsNewGroup, nextAction) {
  DisableableAction.call(this, name, action, function() {
    return eGm.imageElementDoesntExist;
  }, startsNewGroup, nextAction);
}
ImageExistsDisableableAction.prototype = Object.create(DisableableAction.prototype);
ImageExistsDisableableAction.prototype.constructor = ImageExistsDisableableAction;

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
DisableableCommandAction.prototype = Object.create(DisableableAction.prototype);
DisableableCommandAction.prototype.constructor = DisableableCommandAction;


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
    var url = eGc.topmostDocumentURL;
    var backurl = (gBrowser.sessionHistory.getEntryAtIndex(index, false)).URI.spec;
    
    while ((this._getRootURL(url).replace("www.", "") === this._getRootURL(backurl).replace("www.", "")) && index > 0) {
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
    var url = eGc.topmostDocumentURL;
    var forwardurl = (gBrowser.sessionHistory.getEntryAtIndex(index, false)).URI.spec;
    
    while (this._getRootURL(url).replace("www.", "") === this._getRootURL(forwardurl).replace("www.", "") && index < gBrowser.sessionHistory.count - 1) {
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
    this._sendPerformActionMessage();
  }, function() {
    return eGc.targetWindowScrollY === 0 && eGc.topmostWindowScrollY === 0;
  }, true, "pageBottom"),
  
  pageBottom : new DisableableAction("pageBottom", function() {
    this._sendPerformActionMessage();
  }, function() {
    return eGc.targetWindowScrollY === eGc.targetWindowScrollMaxY &&
           eGc.topmostWindowScrollY === eGc.topmostWindowScrollMaxY;
  }, false, "autoscrolling"),
  
  autoscrolling : new Action("autoscrolling", function() {
    this._sendPerformActionMessage();
  }, false, "zoomIn"),
  
  zoomIn : new Action("zoomIn", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    if (eGm.imageElementDoesntExist) {
      window.ZoomManager.enlarge();
    }
    else {
      this._sendPerformActionMessage();
    }
  }, false, "zoomOut"),
  
  zoomOut : new Action("zoomOut", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    if (eGm.imageElementDoesntExist) {
      window.ZoomManager.reduce();
    }
    else {
      this._sendPerformActionMessage();
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
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.saveBrowser(window.gBrowser.selectedBrowser);
  }, false, "printPage"),
  
  printPage : new Action("printPage", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.PrintUtils.print();
  }, false, "viewPageSource"),
  
  viewPageSource : new Action("viewPageSource", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.BrowserViewSource(window.gBrowser.selectedBrowser);
  }, false, "viewPageInfo"),
  
  viewPageInfo : new Action("viewPageInfo", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.BrowserPageInfo();
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
      if (window !== currentWindow) {
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
    var url = eGc.topmostDocumentURL;
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
    var url = eGc.topmostDocumentURL;
    var rootURL = this._getRootURL(url);
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.gBrowser.loadURI(rootURL);
  }, false, "showOnlyThisFrame"),
  
  showOnlyThisFrame : new Action("showOnlyThisFrame", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.loadURI(eGc.targetDocumentURL);
  }, false, "focusLocationBar"),
  
  focusLocationBar : new Action("focusLocationBar", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.gURLBar.focus();
  }, false, "searchWeb"),
  
  searchWeb : new Action("searchWeb", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.BrowserSearch.searchBar.value = eGm.selection;
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
    var url = eGm.anchorElementHREF;
    
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
    window.open(eGm.anchorElementHREF);
  }, false, "openLinkInNewPrivateWindow"),
  
  openLinkInNewPrivateWindow : new LinkExistsDisableableAction("openLinkInNewPrivateWindow", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    this._openInPrivateWindow(eGm.anchorElementHREF, window);
  }, false, "copyLink"),
  
  copyLink : new LinkExistsDisableableAction("copyLink", function() {
    Components.classes["@mozilla.org/widget/clipboardhelper;1"]
              .getService(Components.interfaces.nsIClipboardHelper)
              .copyString(eGm.anchorElementHREF);
  }, false, "saveLinkAs"),
  
  saveLinkAs : new LinkExistsDisableableAction("saveLinkAs", function() {
    this._saveContentFromLink(eGm.anchorElementHREF,
                              Components.interfaces.nsIFilePicker.filterHTML);
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
    var uri = Services.io.newURI(eGc.topmostDocumentURL, null, null);
    if (bookmarksService.isBookmarked(uri)) {
      window.PlacesCommandHook.bookmarkCurrentPage(true,
          window.PlacesUtils.unfiledBookmarksFolderId);
    }
    else {
      bookmarksService.insertBookmark(bookmarksService.unfiledBookmarksFolder,
        uri, bookmarksService.DEFAULT_INDEX, eGc.topmostDocumentTitle);
    }
  }, false, "bookmarkThisLink"),
  
  bookmarkThisLink : new LinkExistsDisableableAction("bookmarkThisLink", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.PlacesCommandHook.bookmarkLink(window.PlacesUtils.bookmarksMenuFolderId,
                                          eGm.anchorElementHREF,
                                          eGm.anchorElementText);
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
    window.SidebarUI.toggle("viewBookmarksSidebar");
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
    window.SidebarUI.toggle("viewHistorySidebar");
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
  
  runScript10 : new RunScriptAction(10, false, "firefoxPreferences"),
  
  firefoxPreferences : new Action("firefoxPreferences", function() {
    this._showOrOpenTab("about:preferences");
  }, true, "addOns"),
  
  addOns : new Action("addOns", function() {
    this._showOrOpenTab("about:addons");
  }, false, "easyGesturesNPreferences"),
  
  easyGesturesNPreferences : new Action("easyGesturesNPreferences", function() {
    var openWindows = Services.wm.getEnumerator(null);
    var found = false;
    var window;
    
    while (openWindows.hasMoreElements() && !found) {
      window = openWindows.getNext();
      found = window.location.href === "chrome://easygestures/content/options.xul";
    }
    if (found) {
      window.focus();
    }
    else {
      window.openDialog("chrome://easygestures/content/options.xul", "", "");
    }
  }, false, "copyImageLocation"),
  
  copyImageLocation : new ImageExistsDisableableAction("copyImageLocation",
    function() {
    Components.classes["@mozilla.org/widget/clipboardhelper;1"]
              .getService(Components.interfaces.nsIClipboardHelper)
              .copyString(eGm.imageElementSRC);
  }, true, "copyImage"),
  
  copyImage : new ImageExistsDisableableAction("copyImage", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.document.popupNode = eGm.imageElement;
    window.goDoCommand("cmd_copyImageContents");
  }, false, "saveImageAs"),
  
  saveImageAs : new ImageExistsDisableableAction("saveImageAs", function() {
    this._saveContentFromLink(eGm.imageElementSRC,
                              Components.interfaces.nsIFilePicker.filterImages);
  }, false, "hideImages"),
  
  hideImages : new DisableableAction("hideImages", function() {
    var images = eGc.topmostDocument.querySelectorAll("img:not([id^='eG_'])");
    for (var i=0; i < images.length; ++i) {
      images[i].style.display = "none";
    }
  }, function() {
    return eGc.topmostDocument.querySelectorAll("img:not([id^='eG_'])").length === 0;
  }, false, "cut"),
  
  cut : new DisableableCommandAction("cut", true, "copy"),
  
  copy : new DisableableCommandAction("copy", false, "paste"),
  
  paste : new DisableableCommandAction("paste", false, "undo"),
  
  undo : new DisableableCommandAction("undo", false, "redo"),
  
  redo : new DisableableCommandAction("redo", false, "selectAll"),
  
  selectAll : new DisableableCommandAction("selectAll", false, null)
};
