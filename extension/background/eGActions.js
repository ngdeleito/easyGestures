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
//  |-- DocumentContainsImagesDisableableAction
//  |-- FullscreenAction
//  |-- CommandAction
//  |-- DisableableAction
//       ^
//       |-- SelectionExistsDisableableAction
//       |-- URLToIdentifierExistsDisableableAction
//       |-- CanGoUpDisableableAction
//       |-- OtherTabsExistDisableableAction
//       |-- LinkExistsDisableableAction
//       |-- DailyReadingsDisableableAction
//       |-- NumberedAction
//       |    ^
//       |    |-- LoadURLAction
//       |    |-- RunScriptAction
//       |-- ImageExistsDisableableAction
//       |-- DisabledAction

/* exported eGActions */
/* global eGPrefs, console, browser, eGUtils, eGContext, URL, atob, Blob, fetch */

"use strict";

function Action(name, action, startsNewGroup, nextAction) {
  this._name = name;
  this.run = function(updateStatsInformation) {
    eGPrefs[updateStatsInformation.incrementMethodName](updateStatsInformation.incrementIndex);
    if (updateStatsInformation.updateActionName !== undefined) {
      eGPrefs.updateStatsForAction(updateStatsInformation.updateActionName);
    }
    return new Promise((resolve, reject) => {
      try {
        resolve(action.call(this));
      }
      catch (exception) {
        console.error("easyGestures N: error when executing \"" + this._name +
                      "\" action: " + exception);
        reject();
      }
    });
  };
  
  // startsNewGroup and nextAction are used in options.js to display a sorted
  // list of available actions
  this.startsNewGroup = startsNewGroup;
  this.nextAction = nextAction;
  
  this.isExtraMenuAction = false;
}
Action.prototype = {
  constructor: Action,
  
  increasingZoomLevels: [0.3, 0.5, 0.67, 0.8, 0.9, 1, 1.1, 1.2, 1.33, 1.5, 1.7,
                         2, 2.4, 3],
  decreasingZoomLevels: [3, 2.4, 2, 1.7, 1.5, 1.33, 1.2, 1.1, 1, 0.9, 0.8, 0.67,
                         0.5, 0.3],
  
  getTooltip: function() {
    return Promise.resolve(browser.i18n.getMessage(this._name));
  },
  
  getLocalizedActionName: function() {
    return browser.i18n.getMessage(this._name);
  },
  
  getActionStatus: function() {
    return {
      messageName: "nonDisableableAction",
      status: Promise.resolve(false)
    };
  },
  
  // helper functions
  
  _sendPerformActionMessage: function() {
    return {
      runActionName: this._name,
      runActionOptions: undefined
    };
  },
  
  _sendPerformActionMessageToFrameWithIndexWithinCurrentTab: function(frameIndex) {
    eGUtils.performOnCurrentTab(currentTab => {
      browser.tabs.sendMessage(currentTab.id, {
        messageName: "runAction",
        parameters: {
          runActionName: this._name,
          runActionOptions: undefined
        }
      }, {
        frameId: eGContext.frameHierarchyArray[frameIndex].frameID
      });
    });
  },
  
  _sendPerformActionMessageToInnermostFrameWithinCurrentTab: function() {
    this._sendPerformActionMessageToFrameWithIndexWithinCurrentTab(0);
  },
  
  _openURLOn: function(url, on, newTabShouldBeActive) {
    switch (on) {
      case "curTab":
        browser.tabs.update({
          url: url
        });
        break;
      case "newTab":
        eGUtils.performOnCurrentTab(function(currentTab) {
          browser.tabs.create({
            active: newTabShouldBeActive,
            openerTabId: currentTab.id,
            url: url
          });
        });
        break;
      case "newWindow":
        browser.windows.create({
          url: url
        });
        break;
    }
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

function DisableableAction(name, action, isDisabledAsPromise, startsNewGroup, nextAction) {
  Action.call(this, name, action, startsNewGroup, nextAction);
  
  this._isDisabledAsPromise = isDisabledAsPromise;
}
DisableableAction.prototype = Object.create(Action.prototype);
DisableableAction.prototype.constructor = DisableableAction;
DisableableAction.prototype.getActionStatus = function() {
  return {
    messageName: "disableableAction",
    status: this._isDisabledAsPromise()
  };
};

function SelectionExistsDisableableAction(name, action, startsNewGroup, nextAction) {
  DisableableAction.call(this, name, action, function() {
    return Promise.resolve(eGContext.selection === "");
  }, startsNewGroup, nextAction);
}
SelectionExistsDisableableAction.prototype = Object.create(DisableableAction.prototype);
SelectionExistsDisableableAction.prototype.constructor = SelectionExistsDisableableAction;

function URLToIdentifierExistsDisableableAction(name, action, startsNewGroup, nextAction) {
  DisableableAction.call(this, name, action, function() {
    return Promise.resolve(eGContext.urlToIdentifier === "");
  }, startsNewGroup, nextAction);
}
URLToIdentifierExistsDisableableAction.prototype = Object.create(DisableableAction.prototype);
URLToIdentifierExistsDisableableAction.prototype.constructor = URLToIdentifierExistsDisableableAction;

function CanGoUpDisableableAction(name, action, startsNewGroup, nextAction) {
  DisableableAction.call(this, name, action, function() {
    let url = new URL(eGContext.pageURL);
    return Promise.resolve(url.pathname === "/");
  }, startsNewGroup, nextAction);
}
CanGoUpDisableableAction.prototype = Object.create(DisableableAction.prototype);
CanGoUpDisableableAction.prototype.constructor = CanGoUpDisableableAction;

function OtherTabsExistDisableableAction(name, action, startsNewGroup, nextAction) {
  DisableableAction.call(this, name, action, function() {
    return browser.tabs.query({
      currentWindow: true
    }).then(tabs => {
      return tabs.length <= 1;
    });
  }, startsNewGroup, nextAction);
}
OtherTabsExistDisableableAction.prototype = Object.create(DisableableAction.prototype);
OtherTabsExistDisableableAction.prototype.constructor = OtherTabsExistDisableableAction;

function LinkExistsDisableableAction(name, action, startsNewGroup, nextAction) {
  DisableableAction.call(this, name, action, function() {
    return Promise.resolve(!eGContext.anchorElementExists);
  }, startsNewGroup, nextAction);
}
LinkExistsDisableableAction.prototype = Object.create(DisableableAction.prototype);
LinkExistsDisableableAction.prototype.constructor = LinkExistsDisableableAction;

function DailyReadingsDisableableAction(startsNewGroup, nextAction) {
  DisableableAction.call(this, "dailyReadings", function() {
    function traverseSubTree(node) {
      if (node.children === undefined) {
        browser.tabs.create({
          active: false,
          openerTabId: currentTabId,
          url: node.url
        });
      }
      else {
        node.children.forEach(subnode => {
          traverseSubTree(subnode);
        });
      }
    }
    
    let currentTabId;
    let rootNode = this.rootNode;
    eGUtils.performOnCurrentTab(function(currentTab) {
      currentTabId = currentTab.id;
      traverseSubTree(rootNode);
    });
  }, function() {
    return eGPrefs.getDailyReadingsFolderName().then(async folderName => {
      if (folderName === "") {
        return true;
      }
      
      let foundBookmarks = await browser.bookmarks.search({
        title: folderName
      });
      return foundBookmarks.length === 0 ||
             browser.bookmarks.getSubTree(foundBookmarks[0].id)
                              .then(rootNode => {
               this.rootNode = rootNode[0];
               return rootNode[0].children === undefined;
             });
    });
  }, startsNewGroup, nextAction);
}
DailyReadingsDisableableAction.prototype = Object.create(DisableableAction.prototype);
DailyReadingsDisableableAction.prototype.constructor = DailyReadingsDisableableAction;

function NumberedAction(namePrefix, number, action, startsNewGroup, nextAction) {
  DisableableAction.call(this, namePrefix + number, function() {
    return eGPrefs.getLoadURLOrRunScriptPrefValue(this._name)
                  .then(prefValue => {
      let content = prefValue[1];
      content = content.replace("%s", eGContext.selection);
      content = content.replace("%u", eGContext.pageURL);
      return action.call(this, content,
                         2 in prefValue ? prefValue[2] : undefined);
    });
  }, function() {
    return eGPrefs.getLoadURLOrRunScriptPrefValue(this._name)
                  .then(prefValue => {
                    return prefValue[1] === "";
                  });
  }, startsNewGroup, nextAction);
  
  this._number = number;
}
NumberedAction.prototype = Object.create(DisableableAction.prototype);
NumberedAction.prototype.constructor = NumberedAction;
NumberedAction.prototype.getTooltip = function() {
  return eGPrefs.getLoadURLOrRunScriptPrefValue(this._name).then(prefValue => {
    let tooltip = prefValue[0];
    if (tooltip !== "") {
      // if this action has already a tooltip given by the user, then use it
      return tooltip;
    }
    // otherwise use the default tooltip
    return browser.i18n.getMessage(this._name);
  });
};

function LoadURLAction(number, startsNewGroup, nextAction) {
  NumberedAction.call(this, "loadURL", number,
    function(URL, openInPrivateWindow) {
      if (openInPrivateWindow) {
        browser.windows.create({
          incognito: true,
          url: URL
        });
      }
      else {
        eGPrefs.getLoadURLInPref().then(prefValue => {
          this._openURLOn(URL, prefValue, true);
        });
      }
    }, startsNewGroup, nextAction);
}
LoadURLAction.prototype = Object.create(NumberedAction.prototype);
LoadURLAction.prototype.constructor = LoadURLAction;

function RunScriptAction(number, startsNewGroup, nextAction) {
  NumberedAction.call(this, "runScript", number, function(script) {
    browser.tabs.executeScript({
      code: script
    });
  }, startsNewGroup, nextAction);
}
RunScriptAction.prototype = Object.create(NumberedAction.prototype);
RunScriptAction.prototype.constructor = RunScriptAction;

function ImageExistsDisableableAction(name, action, startsNewGroup, nextAction) {
  DisableableAction.call(this, name, action, function() {
    return Promise.resolve(eGContext.imageElementDoesntExist);
  }, startsNewGroup, nextAction);
}
ImageExistsDisableableAction.prototype = Object.create(DisableableAction.prototype);
ImageExistsDisableableAction.prototype.constructor = ImageExistsDisableableAction;

function DocumentContainsImagesDisableableAction(name, startsNewGroup, nextAction) {
  Action.call(this, name, function() {
    this._sendPerformActionMessageToInnermostFrameWithinCurrentTab();
  }, startsNewGroup, nextAction);
}
DocumentContainsImagesDisableableAction.prototype = Object.create(Action.prototype);
DocumentContainsImagesDisableableAction.prototype.constructor = DocumentContainsImagesDisableableAction;
DocumentContainsImagesDisableableAction.prototype.getActionStatus = function() {
  return {
    messageName: this._name,
    status: Promise.resolve(undefined)
  };
};

function FullscreenAction(name, startsNewGroup, nextAction) {
  Action.call(this, name, function() {}, startsNewGroup, nextAction);
}
FullscreenAction.prototype = Object.create(Action.prototype);
FullscreenAction.prototype.constructor = FullscreenAction;
FullscreenAction.prototype.getActionStatus = function() {
  return {
    messageName: this._name,
    status: Promise.resolve(undefined)
  };
};

function CommandAction(name, startsNewGroup, nextAction) {
  Action.call(this, name, function() {
    eGUtils.performOnCurrentTab(currentTab => {
      browser.tabs.sendMessage(currentTab.id, {
        messageName: "runAction",
        parameters: {
          runActionName: "commandAction",
          runActionOptions: {
            commandName: name
          }
        }
      }, {
        frameId: eGContext.frameHierarchyArray[0].frameID
      });
    });
  }, startsNewGroup, nextAction);
}
CommandAction.prototype = Object.create(Action.prototype);
CommandAction.prototype.constructor = CommandAction;
CommandAction.prototype.getActionStatus = function() {
  return {
    messageName: this._name,
    status: Promise.resolve(undefined)
  };
};

function DisabledAction(name, startsNewGroup, nextAction) {
  DisableableAction.call(this, name, function() {}, function() {
    return Promise.resolve(true);
  }, startsNewGroup, nextAction);
}
DisabledAction.prototype = Object.create(DisableableAction.prototype);
DisabledAction.prototype.constructor = DisabledAction;


let eGActions = {
  empty: new EmptyAction(false, "showExtraMenu"),
  
  showExtraMenu: new ShowExtraMenuAction(true, "back"),
  
  back: new Action("back", function() {
    return this._sendPerformActionMessage();
  }, true, "backSite"),
  
  backSite: new DisabledAction("backSite", false, "firstPage"),
  
  firstPage: new DisabledAction("firstPage", false, "forward"),
  
  forward: new Action("forward", function() {
    return this._sendPerformActionMessage();
  }, false, "forwardSite"),
  
  forwardSite: new DisabledAction("forwardSite", false, "lastPage"),
  
  lastPage: new DisabledAction("lastPage", false, "reload"),
  
  reload: new Action("reload", function() {
    browser.tabs.reload({
      bypassCache: true
    });
  }, false, "homepage"),
  
  homepage: new Action("homepage", function() {
    browser.browserSettings.homepageOverride.get({}).then(result => {
      let homepageArray = result.value.split("|");
      browser.tabs.update({
        url: homepageArray[0]
      });
      if (homepageArray.length > 1) {
        homepageArray.shift();
        eGUtils.performOnCurrentTab(function(currentTab) {
          homepageArray.forEach(url => {
            browser.tabs.create({
              active: false,
              openerTabId: currentTab.id,
              url: url
            });
          });
        });
      }
    });
  }, false, "pageTop"),
  
  pageTop: new DisableableAction("pageTop", function() {
    let frameIndex = eGContext.frameHierarchyArray.findIndex(element => {
      return element.scrollY !== 0;
    });
    this._sendPerformActionMessageToFrameWithIndexWithinCurrentTab(frameIndex);
  }, function() {
    return Promise.resolve(eGContext.frameHierarchyArray.every(element => {
      return element.scrollY === 0;
    }));
  }, false, "pageBottom"),
  
  pageBottom: new DisableableAction("pageBottom", function() {
    let frameIndex = eGContext.frameHierarchyArray.findIndex(element => {
      return element.scrollY !== element.scrollMaxY;
    });
    this._sendPerformActionMessageToFrameWithIndexWithinCurrentTab(frameIndex);
  }, function() {
    return Promise.resolve(eGContext.frameHierarchyArray.every(element => {
      return element.scrollY === element.scrollMaxY;
    }));
  }, false, "savePageAs"),
  
  savePageAs: new Action("savePageAs", function() {
    eGUtils.performOnCurrentTab(function(currentTab) {
      browser.downloads.download({
        url: currentTab.url,
        filename: currentTab.title,
        saveAs: true
      }).catch(() => {});
    });
  }, false, "printPage"),
  
  printPage: new Action("printPage", function() {
    browser.tabs.print();
  }, false, "showPrintPreview"),
  
  showPrintPreview: new Action("showPrintPreview", function() {
    browser.tabs.printPreview();
  }, false, "searchWeb"),
  
  searchWeb: new SelectionExistsDisableableAction("searchWeb", function() {
    browser.search.search({
      query: eGContext.selection
    });
  }, false, "loadPageInNewTab"),
  
  loadPageInNewTab: new Action("loadPageInNewTab", function() {
    eGUtils.performOnCurrentTab(function(currentTab) {
      browser.tabs.create({
        openerTabId: currentTab.id,
        url: eGContext.pageURL
      });
    });
  }, true, "loadPageInNewPrivateWindow"),
  
  loadPageInNewPrivateWindow: new Action("loadPageInNewPrivateWindow", function() {
    browser.windows.create({
      incognito: true,
      url: eGContext.pageURL
    });
  }, false, "moveTabToNewWindow"),
  
  moveTabToNewWindow: new Action("moveTabToNewWindow", function() {
    eGUtils.performOnCurrentTab(function(currentTab) {
      browser.windows.create({
        tabId: currentTab.id
      });
    });
  }, false, "copyPageURL"),
  
  copyPageURL: new Action("copyPageURL", function() {
    return {
      runActionName: "copyInformation",
      runActionOptions: {
        information: eGContext.pageURL
      }
    };
  }, false, "copyURLToIdentifier"),
  
  copyURLToIdentifier: new URLToIdentifierExistsDisableableAction("copyURLToIdentifier", function() {
    return {
      runActionName: "copyInformation",
      runActionOptions: {
        information: eGContext.urlToIdentifier
      }
    };
  }, false, "zoomIn"),
  
  zoomIn: new Action("zoomIn", function() {
    if (eGContext.imageElementDoesntExist) {
      browser.tabs.getZoom().then(zoomFactor => {
        let newZoomFactor = this.increasingZoomLevels.find(element => {
          return element > zoomFactor;
        });
        if (newZoomFactor !== undefined) {
          browser.tabs.setZoom(newZoomFactor);
        }
      });
    }
    else {
      this._sendPerformActionMessageToInnermostFrameWithinCurrentTab();
    }
  }, false, "zoomOut"),
  
  zoomOut: new Action("zoomOut", function() {
    if (eGContext.imageElementDoesntExist) {
      browser.tabs.getZoom().then(zoomFactor => {
        let newZoomFactor = this.decreasingZoomLevels.find(element => {
          return element < zoomFactor;
        });
        if (newZoomFactor !== undefined) {
          browser.tabs.setZoom(newZoomFactor);
        }
      });
    }
    else {
      this._sendPerformActionMessageToInnermostFrameWithinCurrentTab();
    }
  }, false, "zoomReset"),
  
  zoomReset: new Action("zoomReset", function() {
    browser.tabs.setZoom(1);
  }, false, "findAndHighlightSelection"),
  
  findAndHighlightSelection: new SelectionExistsDisableableAction("findAndHighlightSelection", function() {
    browser.find.find(eGContext.selection).then(() => {
      browser.find.highlightResults();
    });
  }, false, "removeHighlight"),
  
  removeHighlight: new Action("removeHighlight", function() {
    browser.find.removeHighlighting();
  }, false, "enterReaderMode"),
  
  enterReaderMode: new DisableableAction("enterReaderMode", function() {
    browser.tabs.toggleReaderMode();
  }, function() {
    return eGUtils.performOnCurrentTab(function(currentTab) {
      return !currentTab.isArticle;
    });
  }, false, "takeTabScreenshot"),
  
  takeTabScreenshot: new Action("takeTabScreenshot", function() {
    eGUtils.performOnCurrentTab(currentTab => {
      browser.tabs.captureVisibleTab().then(dataURL => {
        let imageData = atob(dataURL.split(",")[1]);
        let imageDataArray = new Uint8Array(imageData.length);
        for (let i=0; i < imageData.length; ++i) {
          imageDataArray[i] = imageData.charCodeAt(i);
        }
        let aBlob = new Blob([imageDataArray.buffer], {type: "image/png"});
        let blobURL = URL.createObjectURL(aBlob);
        browser.downloads.download({
          url: blobURL,
          filename: currentTab.title + ".png",
          saveAs: true
        }).then((downloadID) => {
          browser.downloads.onChanged.addListener(function downloadListener(download) {
            if (downloadID === download.id && download.state !== undefined &&
                download.state.current === "complete") {
              URL.revokeObjectURL(blobURL);
              browser.downloads.onChanged.removeListener(downloadListener);
            }
          });
        }).catch(() => {
          URL.revokeObjectURL(blobURL);
        });
      });
    });
  }, false, "toggleFullscreen"),
  
  toggleFullscreen: new FullscreenAction("toggleFullscreen", false, "up"),
  
  up: new CanGoUpDisableableAction("up", function() {
    let url = new URL(eGContext.pageURL);
    let pathname = url.pathname;
    // removing any trailing "/" and the leading "/"
    pathname = pathname.replace(/\/$/, "").substring(1);
    let pathnameItems = pathname.split("/");
    pathnameItems.pop();
    browser.tabs.update({
      url: url.protocol + "//" + url.username +
           (url.password === "" ? "" : ":" + url.password) +
           (url.username === "" ? "" : "@") + url.hostname + "/" +
           pathnameItems.join("/") + (pathnameItems.length === 0 ? "" : "/")
    });
  }, false, "root"),
  
  root: new CanGoUpDisableableAction("root", function() {
    let url = new URL(eGContext.pageURL);
    browser.tabs.update({
      url: url.protocol + "//" + url.username +
           (url.password === "" ? "" : ":" + url.password) +
           (url.username === "" ? "" : "@") + url.hostname
    });
  }, false, "showOnlyThisFrame"),
  
  showOnlyThisFrame: new DisableableAction("showOnlyThisFrame", function() {
    browser.tabs.update({
      url: eGContext.frameHierarchyArray[0].URL
    });
  }, function() {
    return Promise.resolve(eGContext.frameHierarchyArray.length === 1);
  }, false, "viewPageSource"),
  
  viewPageSource: new Action("viewPageSource", function() {
    eGUtils.performOnCurrentTab(function(currentTab) {
      browser.tabs.create({
        openerTabId: currentTab.id,
        url: "view-source:" + eGContext.pageURL
      });
    });
  }, false, "newTab"),
  
  newTab: new Action("newTab", function() {
    browser.tabs.create({});
  }, true, "newBlankTab"),
  
  newBlankTab: new Action("newBlankTab", function() {
    browser.tabs.create({
      url: "about:blank"
    });
  }, false, "duplicateTab"),
  
  duplicateTab: new Action("duplicateTab", function() {
    eGUtils.performOnCurrentTab(function(currentTab) {
      browser.tabs.duplicate(currentTab.id);
    });
  }, false, "closeTab"),
  
  closeTab: new DisableableAction("closeTab", function() {
    eGUtils.performOnCurrentTab(function(currentTab) {
      browser.tabs.remove(currentTab.id);
    });
  }, function() {
    return eGUtils.performOnCurrentTab(function(currentTab) {
      return currentTab.pinned;
    });
  }, false, "closeOtherTabs"),
  
  closeOtherTabs: new DisableableAction("closeOtherTabs", function() {
    browser.tabs.query({
      active: false,
      pinned: false,
      currentWindow: true
    }).then(tabsToClose => {
      browser.tabs.remove(tabsToClose.map(tab => {
        return tab.id;
      }));
    });
  }, function() {
    return browser.tabs.query({
      active: false,
      pinned: false,
      currentWindow: true
    }).then(tabsToClose => {
      return tabsToClose.length === 0;
    });
  }, false, "undoCloseTab"),
  
  undoCloseTab: new DisableableAction("undoCloseTab", function() {
    browser.sessions.getRecentlyClosed().then(closedItems => {
      let mostRecentlyClosedTab = closedItems.find(closedItem => {
        return closedItem.tab !== undefined;
      });
      browser.sessions.restore(mostRecentlyClosedTab.tab.sessionId);
    });
  }, function() {
    return browser.sessions.getRecentlyClosed().then(closedItems => {
      let mostRecentlyClosedTab = closedItems.find(closedItem => {
        return closedItem.tab !== undefined;
      });
      return mostRecentlyClosedTab === undefined;
    });
  }, false, "previousTab"),
  
  previousTab: new OtherTabsExistDisableableAction("previousTab", function() {
    eGUtils.performOnCurrentTab(async function(currentTab) {
      let tabs = await browser.tabs.query({
        currentWindow: true
      });
      let [previousTab] = await browser.tabs.query({
        index: currentTab.index - 1 < 0 ? tabs.length - 1 :
                                          currentTab.index - 1,
        currentWindow: true
      });
      browser.tabs.update(previousTab.id, {
        active: true
      });
    });
  }, false, "nextTab"),
  
  nextTab: new OtherTabsExistDisableableAction("nextTab", function() {
    eGUtils.performOnCurrentTab(async function(currentTab) {
      let tabs = await browser.tabs.query({
        currentWindow: true
      });
      let [nextTab] = await browser.tabs.query({
        index: currentTab.index + 1 < tabs.length ? currentTab.index + 1 : 0,
        currentWindow: true
      });
      browser.tabs.update(nextTab.id, {
        active: true
      });
    });
  }, false, "pinUnpinTab"),
  
  pinUnpinTab: new Action("pinUnpinTab", function() {
    eGUtils.performOnCurrentTab(function(currentTab) {
      browser.tabs.update({
        pinned: !currentTab.pinned
      });
    });
  }, false, "newWindow"),
  
  newWindow: new Action("newWindow", function() {
    browser.browserSettings.homepageOverride.get({}).then(result => {
      browser.windows.create({
        url: result.value.split("|")
      });
    });
  }, true, "newBlankWindow"),
  
  newBlankWindow: new Action("newBlankWindow", function() {
    browser.windows.create({});
  }, false, "newPrivateWindow"),
  
  newPrivateWindow: new Action("newPrivateWindow", function() {
    browser.windows.create({
      incognito: true
    });
  }, false, "duplicateWindow"),
  
  duplicateWindow: new Action("duplicateWindow", async function() {
    let currentWindow = await browser.windows.getCurrent({
      populate: true
    });
    let newWindow = await browser.windows.create({});
    Promise.all(currentWindow.tabs.map(tab => {
      return browser.tabs.duplicate(tab.id).then(async duplicatedTab => {
        let wasPinned = duplicatedTab.pinned;
        let unpinnedTab = await browser.tabs.update(duplicatedTab.id, {
          pinned: false
        });
        browser.tabs.move(unpinnedTab.id, {
          windowId: newWindow.id,
          index: tab.index + 1
        }).then(movedTabs => {
          browser.tabs.update(movedTabs[0].id, {
            pinned: wasPinned
          });
        });
      });
    })).then(() => {
      browser.tabs.remove(newWindow.tabs[0].id);
    });
  }, false, "minimizeWindow"),
  
  minimizeWindow: new Action("minimizeWindow", function() {
    browser.windows.getCurrent().then(currentWindow => {
      browser.windows.update(currentWindow.id, {
        state: "minimized"
      });
    });
  }, false, "closeWindow"),
  
  closeWindow: new Action("closeWindow", function() {
    browser.windows.getCurrent().then(currentWindow => {
      browser.windows.remove(currentWindow.id);
    });
  }, false, "closeOtherWindows"),
  
  closeOtherWindows: new DisableableAction("closeOtherWindows", async function() {
    let currentWindow = await browser.windows.getCurrent();
    let openWindows = await browser.windows.getAll();
    openWindows.forEach(windowToClose => {
      if (windowToClose.id !== currentWindow.id) {
        browser.windows.remove(windowToClose.id);
      }
    });
  }, function() {
    return browser.windows.getAll().then(openWindows => {
      return openWindows.length === 1;
    });
  }, false, "undoCloseWindow"),
  
  undoCloseWindow: new DisableableAction("undoCloseWindow", function() {
    browser.sessions.getRecentlyClosed().then(closedItems => {
      let mostRecentlyClosedWindow = closedItems.find(closedItem => {
        return closedItem.window !== undefined;
      });
      browser.sessions.restore(mostRecentlyClosedWindow.window.sessionId);
    });
  }, function() {
    return browser.sessions.getRecentlyClosed().then(closedItems => {
      let mostRecentlyClosedWindow = closedItems.find(closedItem => {
        return closedItem.window !== undefined;
      });
      return mostRecentlyClosedWindow === undefined;
    });
  }, false, "toggleFullscreenWindow"),
  
  toggleFullscreenWindow: new Action("toggleFullscreenWindow", function() {
    browser.windows.getCurrent().then(aWindow => {
      let newState = aWindow.state === "fullscreen" ? "normal" : "fullscreen";
      browser.windows.update(aWindow.id, {
        state: newState
      });
    });
  }, false, "openLink"),
  
  openLink: new LinkExistsDisableableAction("openLink", function() {
    eGPrefs.getOpenLinkPref().then(prefValue => {
      this._openURLOn(eGContext.anchorElementHREF, prefValue, false);
    });
  }, true, "openLinkInNewWindow"),
  
  openLinkInNewWindow: new LinkExistsDisableableAction("openLinkInNewWindow", function() {
    browser.windows.create({
      url: eGContext.anchorElementHREF
    });
  }, false, "openLinkInNewPrivateWindow"),
  
  openLinkInNewPrivateWindow: new LinkExistsDisableableAction("openLinkInNewPrivateWindow", function() {
    browser.windows.create({
      incognito: true,
      url: eGContext.anchorElementHREF
    });
  }, false, "copyLink"),
  
  copyLink: new LinkExistsDisableableAction("copyLink", function() {
    return {
      runActionName: "copyInformation",
      runActionOptions: {
        information: eGContext.anchorElementHREF
      }
    };
  }, false, "saveLinkAs"),
  
  saveLinkAs: new LinkExistsDisableableAction("saveLinkAs", function() {
    browser.downloads.download({
      url: eGContext.anchorElementHREF,
      saveAs: true
    }).catch(() => {});
  }, false, "dailyReadings"),
  
  dailyReadings: new DailyReadingsDisableableAction(true, "bookmarkThisPage"),
  
  bookmarkThisPage: new DisableableAction("bookmarkThisPage", function() {
    eGUtils.performOnCurrentTab(function(currentTab) {
      browser.bookmarks.create({
        title: currentTab.title,
        url: currentTab.url
      });
    });
  }, function() {
    try {
      return browser.bookmarks.search({
        url: eGContext.pageURL
      }).then(foundBookmarks => {
        return foundBookmarks.length > 0;
      });
    }
    catch (exception) {
      return Promise.resolve(true);
    }
  }, false, "bookmarkThisIdentifier"),
  
  bookmarkThisIdentifier: new URLToIdentifierExistsDisableableAction("bookmarkThisIdentifier", function() {
    eGUtils.performOnCurrentTab(function(currentTab) {
      browser.bookmarks.create({
        title: currentTab.title,
        url: eGContext.urlToIdentifier
      });
    });
  }, false, "bookmarkThisLink"),
  
  bookmarkThisLink: new DisableableAction("bookmarkThisLink", function() {
    browser.bookmarks.create({
      title: eGContext.anchorElementText,
      url: eGContext.anchorElementHREF
    });
  }, function() {
    try {
      return eGContext.anchorElementExists ? browser.bookmarks.search({
                                               url: eGContext.anchorElementHREF
                                             }).then(foundBookmarks => {
                                               return foundBookmarks.length > 0;
                                             })
                                           : Promise.resolve(true);
    }
    catch (exception) {
      return Promise.resolve(true);
    }
  }, false, "bookmarkAllTabs"),
  
  bookmarkAllTabs: new Action("bookmarkAllTabs", function() {
    browser.windows.getCurrent({
      populate: true
    }).then(currentWindow => {
      currentWindow.tabs.forEach(tab => {
        browser.bookmarks.create({
          title: tab.title,
          url: tab.url
        });
      });
    });
  }, false, "removeBookmarkToThisPage"),
  
  removeBookmarkToThisPage: new DisableableAction("removeBookmarkToThisPage", function() {
    browser.bookmarks.search({
      url: eGContext.pageURL
    }).then(foundBookmarks => {
      browser.bookmarks.remove(foundBookmarks[0].id);
    });
  }, function() {
    try {
      return browser.bookmarks.search({
        url: eGContext.pageURL
      }).then(foundBookmarks => {
        return foundBookmarks.length === 0;
      });
    }
    catch (exception) {
      return Promise.resolve(true);
    }
  }, false, "removeBookmarkToThisIdentifier"),
  
  removeBookmarkToThisIdentifier: new DisableableAction("removeBookmarkToThisIdentifier", function() {
    browser.bookmarks.search({
      url: eGContext.urlToIdentifier
    }).then(foundBookmarks => {
      browser.bookmarks.remove(foundBookmarks[0].id);
    });
  }, function() {
    try {
      return eGContext.urlToIdentifier === "" ? Promise.resolve(true)
                                              : browser.bookmarks.search({
                                                  url: eGContext.urlToIdentifier
                                                }).then(foundBookmarks => {
                                                  return foundBookmarks.length === 0;
                                                });
    }
    catch (exception) {
      return Promise.resolve(true);
    }
  }, false, "removeBookmarkToThisLink"),
  
  removeBookmarkToThisLink: new DisableableAction("removeBookmarkToThisLink", function() {
    browser.bookmarks.search({
      url: eGContext.anchorElementHREF
    }).then(foundBookmarks => {
      browser.bookmarks.remove(foundBookmarks[0].id);
    });
  }, function() {
    try {
      return eGContext.anchorElementExists ? browser.bookmarks.search({
                                               url: eGContext.anchorElementHREF
                                             }).then(foundBookmarks => {
                                               return foundBookmarks.length === 0;
                                             })
                                           : Promise.resolve(true);
    }
    catch (exception) {
      return Promise.resolve(true);
    }
  }, false, "loadURL1"),
  
  loadURL1: new LoadURLAction(1, true, "loadURL2"),
  
  loadURL2: new LoadURLAction(2, false, "loadURL3"),
  
  loadURL3: new LoadURLAction(3, false, "loadURL4"),
  
  loadURL4: new LoadURLAction(4, false, "loadURL5"),
  
  loadURL5: new LoadURLAction(5, false, "loadURL6"),
  
  loadURL6: new LoadURLAction(6, false, "loadURL7"),
  
  loadURL7: new LoadURLAction(7, false, "loadURL8"),
  
  loadURL8: new LoadURLAction(8, false, "loadURL9"),
  
  loadURL9: new LoadURLAction(9, false, "loadURL10"),
  
  loadURL10: new LoadURLAction(10, false, "runScript1"),
  
  runScript1: new RunScriptAction(1, true, "runScript2"),
  
  runScript2: new RunScriptAction(2, false, "runScript3"),
  
  runScript3: new RunScriptAction(3, false, "runScript4"),
  
  runScript4: new RunScriptAction(4, false, "runScript5"),
  
  runScript5: new RunScriptAction(5, false, "runScript6"),
  
  runScript6: new RunScriptAction(6, false, "runScript7"),
  
  runScript7: new RunScriptAction(7, false, "runScript8"),
  
  runScript8: new RunScriptAction(8, false, "runScript9"),
  
  runScript9: new RunScriptAction(9, false, "runScript10"),
  
  runScript10: new RunScriptAction(10, false, "easyGesturesNPreferences"),
  
  easyGesturesNPreferences: new Action("easyGesturesNPreferences", function() {
    eGUtils.showOrOpenTab("/options/options.html", "");
  }, true, "copyImageLocation"),
  
  copyImageLocation: new ImageExistsDisableableAction("copyImageLocation",
    function() {
      return {
        runActionName: "copyInformation",
        runActionOptions: {
          information: eGContext.imageElementSRC
        }
      };
  }, true, "copyImage"),
  
  copyImage: new ImageExistsDisableableAction("copyImage", function() {
    fetch(eGContext.imageElementSRC).then(aResponse => {
      let imageType = aResponse.headers.get("Content-Type")
                                       .replace("image/", "");
      if (imageType === "png" || imageType === "jpeg") {
        aResponse.arrayBuffer().then(anArrayBuffer => {
          browser.clipboard.setImageData(anArrayBuffer, imageType);
        });
      }
    });
  }, false, "saveImageAs"),
  
  saveImageAs: new ImageExistsDisableableAction("saveImageAs", function() {
    browser.downloads.download({
      url: eGContext.imageElementSRC,
      saveAs: true
    }).catch(() => {});
  }, false, "hideImages"),
  
  hideImages: new DocumentContainsImagesDisableableAction("hideImages", false, "cut"),
  
  cut: new CommandAction("cut", true, "copy"),
  
  copy: new CommandAction("copy", false, "paste"),
  
  paste: new DisableableAction("paste", function() {
    this._sendPerformActionMessageToInnermostFrameWithinCurrentTab();
  }, function() {
    return Promise.resolve(!eGContext.inputElementExists);
  }, false, "selectAll"),
  
  selectAll: new Action("selectAll", function() {
    this._sendPerformActionMessageToInnermostFrameWithinCurrentTab();
  }, false, null)
};
