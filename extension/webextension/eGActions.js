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
//  |-- DocumentContainsImagesDisableableAction
//  |-- DisableableAction
//       ^
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
/* global Components, browser, Services, eGContext, eGPrefs, Downloads,
          eGUtils */

// Components.utils.import("resource://gre/modules/Services.jsm");
// Components.utils.import("chrome://easygestures/content/eGPrefs.jsm");

function Action(name, action, startsNewGroup, nextAction) {
  this._name = name;
  this.run = function() {
    var response = action.call(this);
    if (response === undefined) {
      response = {};
    }
    return response;
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
  
  getTooltipLabel: function() {
    return browser.i18n.getMessage(this._name);
  },
  
  getLocalizedActionName: function() {
    return this.getTooltipLabel();
  },
  
  getActionStatus: function() {},
  
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
  
  _sendPerformActionMessage: function(options) {
    return {
      runActionName: this._name,
      runActionOptions: options
    };
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
  }
};

function EmptyAction(startsNewGroup, nextAction) {
  Action.call(this, "empty", function() {}, startsNewGroup, nextAction);
}
EmptyAction.prototype = Object.create(Action.prototype);
EmptyAction.prototype.constructor = EmptyAction;
EmptyAction.prototype.getLocalizedActionName = function() {
  return browser.i18n.getMessage("emptyActionName");
};

function ShowExtraMenuAction(startsNewGroup, nextAction) {
  Action.call(this, "showExtraMenu", function() {}, startsNewGroup, nextAction);
  
  this.isExtraMenuAction = true;
}
ShowExtraMenuAction.prototype = Object.create(Action.prototype);
ShowExtraMenuAction.prototype.constructor = ShowExtraMenuAction;

function ReloadAction(startsNewGroup, nextAction) {
  Action.call(this, "reload", function() { // reload or stop
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    var gBrowser = window.gBrowser;
    
    if (!eGContext.loading) {
      gBrowser.reload();
    }
    else {
      gBrowser.stop();
    }
  }, startsNewGroup, nextAction);
}
ReloadAction.prototype = Object.create(Action.prototype);
ReloadAction.prototype.constructor = ReloadAction;
ReloadAction.prototype.getLocalizedActionName = function() {
  return browser.i18n.getMessage("reloadActionName");
};
ReloadAction.prototype.getActionStatus = function() {
  var window = Services.wm.getMostRecentWindow("navigator:browser");
  var stop_bcaster = window.document.getElementById("Browser:Stop");
  eGContext.loading = !stop_bcaster.hasAttribute("disabled");
  return {
    messageName: "setReloadActionStatus",
    status: eGContext.loading
  };
};

function DisableableAction(name, action, isDisabled, startsNewGroup, nextAction) {
  Action.call(this, name, action, startsNewGroup, nextAction);
  
  this.isDisabled = isDisabled;
}
DisableableAction.prototype = Object.create(Action.prototype);
DisableableAction.prototype.constructor = DisableableAction;
DisableableAction.prototype.getActionStatus = function() {
  return {
    messageName: "setDisableableActionStatus",
    status: this.isDisabled()
  };
};

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
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    var url = window.gBrowser.selectedBrowser.currentURI.spec;
    return this._getRootURL(url) === url.replace("www.", "");
  }, startsNewGroup, nextAction);
}
CanGoUpDisableableAction.prototype = Object.create(DisableableAction.prototype);
CanGoUpDisableableAction.prototype.constructor = CanGoUpDisableableAction;

function LinkExistsDisableableAction(name, action, startsNewGroup, nextAction) {
  DisableableAction.call(this, name, action, function() {
    return !eGContext.anchorElementExists;
  }, startsNewGroup, nextAction);
}
LinkExistsDisableableAction.prototype = Object.create(DisableableAction.prototype);
LinkExistsDisableableAction.prototype.constructor = LinkExistsDisableableAction;

function DailyReadingsDisableableAction(startsNewGroup, nextAction) {
  DisableableAction.call(this, "dailyReadings", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.gBrowser.loadTabs(this.uris, true, false);
  }, function() {
    var folderName = eGPrefs.getDailyReadingsFolderName();
    this.initializeURIsArrayWithContentsOfDailyReadingsFolder();
    return folderName === "" || this.uris.length === 0;
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
  
  // var historyService =
  //   Components.classes["@mozilla.org/browser/nav-history-service;1"]
  //             .getService(Components.interfaces.nsINavHistoryService);
  // var query = historyService.getNewQuery();
  // query.setFolders([eGPrefs.getDailyReadingsFolderID()], 1);
  // var options = historyService.getNewQueryOptions();
  // var results = historyService.executeQuery(query, options);
  
  this.uris = [];
  // pushURIsContainedInFolder(results.root, this);
};

function NumberedAction(namePrefix, number, action, startsNewGroup, nextAction) {
  DisableableAction.call(this, namePrefix + number, function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    var prefValue = eGPrefs.getLoadURLOrRunScriptPrefValue(this._name);
    var content = prefValue[1];
    
    content = content.replace("%s", eGContext.selection);
    content = content.replace("%u", window.gBrowser.selectedBrowser.currentURI.spec);
    
    return action.call(this, content, window,
                       3 in prefValue ? prefValue[3] : undefined);
  }, function() {
    return eGPrefs.getLoadURLOrRunScriptPrefValue(this._name)[1] === "";
  }, startsNewGroup, nextAction);
  
  this._number = number;
}
NumberedAction.prototype = Object.create(DisableableAction.prototype);
NumberedAction.prototype.constructor = NumberedAction;
NumberedAction.prototype.getTooltipLabel = function() {
  // var prefValue = eGPrefs.getLoadURLOrRunScriptPrefValue(this._name);
  // var label = prefValue[0];
  // if (label !== "") {
  //   // if this action has already a label given by the user, then use it
  //   return label;
  // }
  // otherwise use the default label
  return browser.i18n.getMessage(this._name);
};

function LoadURLAction(number, startsNewGroup, nextAction) {
  NumberedAction.call(this, "loadURL", number,
    function(URL, window, openInPrivateWindow) {
      var gBrowser = window.gBrowser;
      
      if (openInPrivateWindow === "true") {
        this._openInPrivateWindow(URL, window);
      }
      else {
        switch (eGPrefs.getLoadURLInPref()) {
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
  NumberedAction.call(this, "runScript", number, function(script) {
    return {
      runActionName: "runScript",
      runActionOptions: {
        script: script
      }
    };
  }, startsNewGroup, nextAction);
}
RunScriptAction.prototype = Object.create(NumberedAction.prototype);
RunScriptAction.prototype.constructor = RunScriptAction;

function ImageExistsDisableableAction(name, action, startsNewGroup, nextAction) {
  DisableableAction.call(this, name, action, function() {
    return eGContext.imageElementDoesntExist;
  }, startsNewGroup, nextAction);
}
ImageExistsDisableableAction.prototype = Object.create(DisableableAction.prototype);
ImageExistsDisableableAction.prototype.constructor = ImageExistsDisableableAction;

function DocumentContainsImagesDisableableAction(name, startsNewGroup, nextAction) {
  Action.call(this, name, function() {
    return {
      runActionName: "hideImages"
    };
  }, startsNewGroup, nextAction);
}
DocumentContainsImagesDisableableAction.prototype = Object.create(Action.prototype);
DocumentContainsImagesDisableableAction.prototype.constructor = DocumentContainsImagesDisableableAction;
DocumentContainsImagesDisableableAction.prototype.getActionStatus = function() {
  return {
    messageName: "setHideImagesActionStatus"
  };
};

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
  
  back : new Action("back", function() {
    return this._sendPerformActionMessage();
  }, true, "backSite"),
  
  backSite : new Action("backSite", function() {}, false, "firstPage"),
  
  firstPage : new Action("firstPage", function() {}, false, "forward"),
  
  forward : new Action("forward", function() {
    return this._sendPerformActionMessage();
  }, false, "forwardSite"),
  
  forwardSite : new Action("forwardSite", function() {}, false, "lastPage"),
  
  lastPage : new Action("lastPage", function() {}, false, "reload"),
  
  reload : new ReloadAction(false, "homepage"),
  
  homepage : new Action("homepage", function() {
    var homepage = Services.prefs.getCharPref("browser.startup.homepage");
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.gBrowser.loadTabs(homepage.split("|"), true, false);
  }, false, "pageTop"),
  
  pageTop : new DisableableAction("pageTop", function() {
    return this._sendPerformActionMessage();
  }, function() {
    return eGContext.targetWindowScrollY === 0 &&
           eGContext.topmostWindowScrollY === 0;
  }, true, "pageBottom"),
  
  pageBottom : new DisableableAction("pageBottom", function() {
    return this._sendPerformActionMessage();
  }, function() {
    return eGContext.targetWindowScrollY === eGContext.targetWindowScrollMaxY &&
           eGContext.topmostWindowScrollY === eGContext.topmostWindowScrollMaxY;
  }, false, "autoscrolling"),
  
  autoscrolling : new Action("autoscrolling", function() {
    return this._sendPerformActionMessage({
             useMousedownCoordinates: false
           });
  }, false, "zoomIn"),
  
  zoomIn : new Action("zoomIn", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    if (eGContext.imageElementDoesntExist) {
      window.ZoomManager.enlarge();
    }
    else {
      return this._sendPerformActionMessage();
    }
  }, false, "zoomOut"),
  
  zoomOut : new Action("zoomOut", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    if (eGContext.imageElementDoesntExist) {
      window.ZoomManager.reduce();
    }
    else {
      return this._sendPerformActionMessage();
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
    window.gBrowser.removeCurrentTab({animate: true});
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
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    var url = window.gBrowser.selectedBrowser.currentURI.spec;
    // removing any trailing "/"
    url = url.replace(/\/$/, "");
    // creating a nsIURI and removing the last "/"-separated item from its path
    var uri = Services.io.newURI(url, null, null);
    var path = uri.path.split("/");
    path.pop();
    var upurl = uri.prePath + path.join("/");
    
    window.gBrowser.loadURI(upurl);
  }, true, "root"),
  
  root : new CanGoUpDisableableAction("root", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    var url = window.gBrowser.selectedBrowser.currentURI.spec;
    var rootURL = this._getRootURL(url);
    window.gBrowser.loadURI(rootURL);
  }, false, "showOnlyThisFrame"),
  
  showOnlyThisFrame : new Action("showOnlyThisFrame", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.loadURI(eGContext.targetDocumentURL);
  }, false, "focusLocationBar"),
  
  focusLocationBar : new Action("focusLocationBar", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.gURLBar.focus();
  }, false, "searchWeb"),
  
  searchWeb : new Action("searchWeb", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.BrowserSearch.searchBar.value = eGContext.selection;
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
    var url = eGContext.anchorElementHREF;
    
    switch (eGPrefs.getOpenLinkPref()) {
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
    window.open(eGContext.anchorElementHREF);
  }, false, "openLinkInNewPrivateWindow"),
  
  openLinkInNewPrivateWindow : new LinkExistsDisableableAction("openLinkInNewPrivateWindow", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    this._openInPrivateWindow(eGContext.anchorElementHREF, window);
  }, false, "copyLink"),
  
  copyLink : new LinkExistsDisableableAction("copyLink", function() {
    Components.classes["@mozilla.org/widget/clipboardhelper;1"]
              .getService(Components.interfaces.nsIClipboardHelper)
              .copyString(eGContext.anchorElementHREF);
  }, false, "saveLinkAs"),
  
  saveLinkAs : new LinkExistsDisableableAction("saveLinkAs", function() {
    this._saveContentFromLink(eGContext.anchorElementHREF,
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
    var uri = window.gBrowser.selectedBrowser.currentURI;
    if (bookmarksService.isBookmarked(uri)) {
      window.PlacesCommandHook.bookmarkCurrentPage(true,
          window.PlacesUtils.unfiledBookmarksFolderId);
    }
    else {
      bookmarksService.insertBookmark(bookmarksService.unfiledBookmarksFolder,
                                      uri, bookmarksService.DEFAULT_INDEX,
                                      window.gBrowser.selectedBrowser.contentTitle);
    }
  }, false, "bookmarkThisLink"),
  
  bookmarkThisLink : new LinkExistsDisableableAction("bookmarkThisLink", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.PlacesCommandHook.bookmarkLink(window.PlacesUtils.bookmarksMenuFolderId,
                                          eGContext.anchorElementHREF,
                                          eGContext.anchorElementText);
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
    eGUtils.showOrOpenTab("about:preferences", true);
  }, true, "addOns"),
  
  addOns : new Action("addOns", function() {
    eGUtils.showOrOpenTab("about:addons", true);
  }, false, "easyGesturesNPreferences"),
  
  easyGesturesNPreferences : new Action("easyGesturesNPreferences", function() {
    eGUtils.showOrOpenTab("chrome://easygestures/content/options.html", true);
  }, false, "copyImageLocation"),
  
  copyImageLocation : new ImageExistsDisableableAction("copyImageLocation",
    function() {
    Components.classes["@mozilla.org/widget/clipboardhelper;1"]
              .getService(Components.interfaces.nsIClipboardHelper)
              .copyString(eGContext.imageElementSRC);
  }, true, "copyImage"),
  
  copyImage : new ImageExistsDisableableAction("copyImage", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    // window.document.popupNode = eGPieMenu.imageElement;
    window.goDoCommand("cmd_copyImageContents");
  }, false, "saveImageAs"),
  
  saveImageAs : new ImageExistsDisableableAction("saveImageAs", function() {
    this._saveContentFromLink(eGContext.imageElementSRC,
                              Components.interfaces.nsIFilePicker.filterImages);
  }, false, "hideImages"),
  
  hideImages : new DocumentContainsImagesDisableableAction("hideImages", false, "cut"),
  
  cut : new DisableableCommandAction("cut", true, "copy"),
  
  copy : new DisableableCommandAction("copy", false, "paste"),
  
  paste : new DisableableCommandAction("paste", false, "undo"),
  
  undo : new DisableableCommandAction("undo", false, "redo"),
  
  redo : new DisableableCommandAction("redo", false, "selectAll"),
  
  selectAll : new DisableableCommandAction("selectAll", false, null)
};
