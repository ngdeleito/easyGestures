/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

// This file provides the following class hierarchy of Actions and the eGActions
// object, containing the actions available in easyGestures N

// Action
//  ^
//  |-- EmptyAction
//  |-- ShowExtraMenuAction
//  |-- DisableableAction
//  |    ^
//  |    |-- SelectionExistsDisableableAction
//  |    |-- URLToIdentifierExistsDisableableAction
//  |    |-- CanGoUpDisableableAction
//  |    |-- OtherTabsExistDisableableAction
//  |    |-- LinkExistsDisableableAction
//  |    |-- DailyReadingsDisableableAction
//  |    |-- NumberedAction
//  |    |    ^
//  |    |    |-- LoadURLAction
//  |    |    |-- RunScriptAction
//  |    |-- ImageExistsDisableableAction
//  |    |-- DisabledAction
//  |-- ContentSideStatusAction
//  |    ^
//  |    |-- CommandAction

/* exported eGActions */
/* global eGPrefs, console, browser, eGUtils, eGContext, URL, atob, Blob, fetch */

"use strict";

class Action {
  constructor(name, action, startsNewGroup, nextAction) {
    this._name = name;
    this.run = function(usageInformationUpdate) {
      eGPrefs[usageInformationUpdate.incrementMethodName](usageInformationUpdate.incrementIndex);
      if (usageInformationUpdate.updateActionName !== undefined) {
        eGPrefs.updateUsageForAction(usageInformationUpdate.updateActionName);
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
  
  getTooltip() {
    return Promise.resolve(browser.i18n.getMessage(this._name));
  }
  
  getLocalizedActionName() {
    return browser.i18n.getMessage(this._name);
  }
  
  getActionStatus() {
    return {
      messageName: "nonDisableableAction",
      status: Promise.resolve(false)
    };
  }
  
  // helper methods
  
  _sendPerformActionMessage(actionName, actionOptions) {
    return {
      runActionName: actionName,
      runActionOptions: actionOptions
    };
  }
  
  _sendPerformActionMessageToFrameWithIndexWithinCurrentTab(frameIndex) {
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
  }
  
  _sendPerformActionMessageToInnermostFrameWithinCurrentTab() {
    this._sendPerformActionMessageToFrameWithIndexWithinCurrentTab(0);
  }
  
  _openURLOn(url, on, newTabShouldBeActive) {
    switch (on) {
      case "curTab":
        browser.tabs.update({
          url: url
        });
        break;
      case "newTab":
        eGUtils.performOnCurrentTab(currentTab => {
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
}

class EmptyAction extends Action {
  constructor(startsNewGroup, nextAction) {
    super("empty", function() {}, startsNewGroup, nextAction);
  }
  
  getLocalizedActionName() {
    return browser.i18n.getMessage("emptyActionName");
  }
}

class ShowExtraMenuAction extends Action {
  constructor(startsNewGroup, nextAction) {
    super("showExtraMenu", function() {}, startsNewGroup, nextAction);
    this.isExtraMenuAction = true;
  }
}

class DisableableAction extends Action {
  constructor(name, action, isDisabledAsPromise, startsNewGroup, nextAction) {
    super(name, action, startsNewGroup, nextAction);
    this._isDisabledAsPromise = isDisabledAsPromise;
  }
  
  getActionStatus() {
    return {
      messageName: "disableableAction",
      status: this._isDisabledAsPromise()
    };
  }
}

class SelectionExistsDisableableAction extends DisableableAction {
  constructor(name, action, startsNewGroup, nextAction) {
    super(name, action, function() {
      return Promise.resolve(eGContext.selection === "");
    }, startsNewGroup, nextAction);
  }
}

class URLToIdentifierExistsDisableableAction extends DisableableAction {
  constructor(name, action, startsNewGroup, nextAction) {
    super(name, action, function() {
      return Promise.resolve(eGContext.urlToIdentifier === "");
    }, startsNewGroup, nextAction);
  }
}

class CanGoUpDisableableAction extends DisableableAction {
  constructor(name, action, startsNewGroup, nextAction) {
    super(name, action, function() {
      let url = new URL(eGContext.pageURL);
      return Promise.resolve(url.pathname === "/");
    }, startsNewGroup, nextAction);
  }
}

class OtherTabsExistDisableableAction extends DisableableAction {
  constructor(name, getTargetTabIndex, startsNewGroup, nextAction) {
    super(name, function() {
      this._getTargetTab().then(targetTab => {
        browser.tabs.update(targetTab.id, {
          active: true
        });
      });
    }, function() {
      return browser.tabs.query({
        currentWindow: true
      }).then(tabs => {
        if (tabs.length > 1) {
          this._getTargetTab().then(targetTab => {
            browser.tabs.warmup(targetTab.id);
          });
        }
        return tabs.length <= 1;
      });
    }, startsNewGroup, nextAction);
    this._getTargetTabIndex = getTargetTabIndex;
  }
  
  async _getTargetTab() {
    return eGUtils.performOnCurrentTab(async currentTab => {
      let tabs = await browser.tabs.query({
        currentWindow: true
      });
      let [targetTab] = await browser.tabs.query({
        index: this._getTargetTabIndex(currentTab.index, tabs.length),
        currentWindow: true
      });
      return targetTab;
    });
  }
}

class LinkExistsDisableableAction extends DisableableAction {
  constructor(name, action, startsNewGroup, nextAction) {
    super(name, action, function() {
      return Promise.resolve(!eGContext.anchorElementExists);
    }, startsNewGroup, nextAction);
  }
}

class DailyReadingsDisableableAction extends DisableableAction {
  constructor(startsNewGroup, nextAction) {
    super("dailyReadings", function() {
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
      eGUtils.performOnCurrentTab(currentTab => {
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
}

class NumberedAction extends DisableableAction {
  constructor(namePrefix, number, action, startsNewGroup, nextAction) {
    super(namePrefix + number, function() {
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
  
  getTooltip() {
    return eGPrefs.getLoadURLOrRunScriptPrefValue(this._name).then(prefValue => {
      let tooltip = prefValue[0];
      if (tooltip !== "") {
        // if this action has already a tooltip given by the user, then use it
        return tooltip;
      }
      // otherwise use the default tooltip
      return browser.i18n.getMessage(this._name);
    });
  }
}

class LoadURLAction extends NumberedAction {
  constructor(number, startsNewGroup, nextAction) {
    super("loadURL", number, function(URL, openInPrivateWindow) {
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
}

class RunScriptAction extends NumberedAction {
  constructor(number, startsNewGroup, nextAction) {
    super("runScript", number, function(script) {
      browser.tabs.executeScript({
        code: script
      });
    }, startsNewGroup, nextAction);
  }
}

class ImageExistsDisableableAction extends DisableableAction {
  constructor(name, action, startsNewGroup, nextAction) {
    super(name, action, function() {
      return Promise.resolve(eGContext.imageElementDoesntExist);
    }, startsNewGroup, nextAction);
  }
}

class ContentSideStatusAction extends Action {
  getActionStatus() {
    return {
      messageName: this._name,
      status: Promise.resolve(undefined)
    };
  }
}

class CommandAction extends ContentSideStatusAction {
  constructor(name, startsNewGroup, nextAction) {
    super(name, function() {
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
}

class DisabledAction extends DisableableAction {
  constructor(name, startsNewGroup, nextAction) {
    super(name, function() {}, function() {
      return Promise.resolve(true);
    }, startsNewGroup, nextAction);
  }
}


let eGActions = {
  empty: new EmptyAction(false, "showExtraMenu"),
  
  showExtraMenu: new ShowExtraMenuAction(true, "back"),
  
  back: new Action("back", function() {
    browser.tabs.goBack();
  }, true, "backSite"),
  
  backSite: new DisabledAction("backSite", false, "firstPage"),
  
  firstPage: new DisabledAction("firstPage", false, "forward"),
  
  forward: new Action("forward", function() {
    browser.tabs.goForward();
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
        eGUtils.performOnCurrentTab(currentTab => {
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
  }, false, "goToTop"),
  
  goToTop: new DisableableAction("goToTop", function() {
    let frameIndex = eGContext.frameHierarchyArray.findIndex(element => {
      return element.scrollableElementScrollTop !== 0 ||
             element.windowScrollY !== 0;
    });
    this._sendPerformActionMessageToFrameWithIndexWithinCurrentTab(frameIndex);
  }, function() {
    return Promise.resolve(eGContext.frameHierarchyArray.every(element => {
      return element.scrollableElementScrollTop === 0 &&
             element.windowScrollY === 0;
    }));
  }, false, "goToBottom"),
  
  goToBottom: new DisableableAction("goToBottom", function() {
    let frameIndex = eGContext.frameHierarchyArray.findIndex(element => {
      return !element.scrollableElementIsFullyScrolled ||
             element.windowScrollY !== element.windowScrollMaxY;
    });
    this._sendPerformActionMessageToFrameWithIndexWithinCurrentTab(frameIndex);
  }, function() {
    return Promise.resolve(eGContext.frameHierarchyArray.every(element => {
      return element.scrollableElementIsFullyScrolled &&
             element.windowScrollY === element.windowScrollMaxY;
    }));
  }, false, "savePageAs"),
  
  savePageAs: new Action("savePageAs", function() {
    eGUtils.performOnCurrentTab(currentTab => {
      browser.downloads.download({
        url: currentTab.url,
        filename: currentTab.title,
        saveAs: true
      }).catch(() => {});
    });
  }, false, "savePageAsPDF"),
  
  savePageAsPDF: new Action("savePageAsPDF", function() {
    eGUtils.performOnCurrentTab(currentTab => {
      browser.tabs.saveAsPDF({
        toFileName: currentTab.title + ".pdf"
      });
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
    eGUtils.performOnCurrentTab(currentTab => {
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
    eGUtils.performOnCurrentTab(currentTab => {
      browser.windows.create({
        tabId: currentTab.id
      });
    });
  }, false, "copyPageURL"),
  
  copyPageURL: new Action("copyPageURL", function() {
    return this._sendPerformActionMessage("copyInformation", {
      information: eGContext.pageURL
    });
  }, false, "copyURLToIdentifier"),
  
  copyURLToIdentifier: new URLToIdentifierExistsDisableableAction("copyURLToIdentifier", function() {
    return this._sendPerformActionMessage("copyInformation", {
      information: eGContext.urlToIdentifier
    });
  }, false, "zoomIn"),
  
  zoomIn: new Action("zoomIn", function() {
    if (eGContext.imageElementDoesntExist) {
      browser.tabs.getZoom().then(zoomFactor => {
        const INCREASING_ZOOM_LEVELS = [0.3, 0.5, 0.67, 0.8, 0.9, 1, 1.1, 1.2,
                                        1.33, 1.5, 1.7, 2, 2.4, 3];
        let newZoomFactor = INCREASING_ZOOM_LEVELS.find(element => {
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
        const DECREASING_ZOOM_LEVELS = [3, 2.4, 2, 1.7, 1.5, 1.33, 1.2, 1.1, 1,
                                        0.9, 0.8, 0.67, 0.5, 0.3];
        let newZoomFactor = DECREASING_ZOOM_LEVELS.find(element => {
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
    return eGUtils.performOnCurrentTab(currentTab => !currentTab.isArticle);
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
        }).catch(() => URL.revokeObjectURL(blobURL));
      });
    });
  }, false, "toggleFullscreen"),
  
  toggleFullscreen: new ContentSideStatusAction("toggleFullscreen",
                                                function() {}, false, "up"),
  
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
    eGUtils.performOnCurrentTab(currentTab => {
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
    eGUtils.performOnCurrentTab(currentTab => {
      browser.tabs.duplicate(currentTab.id);
    });
  }, false, "closeTab"),
  
  closeTab: new DisableableAction("closeTab", function() {
    eGUtils.performOnCurrentTab(currentTab => {
      browser.tabs.remove(currentTab.id);
    });
  }, function() {
    return eGUtils.performOnCurrentTab(currentTab => currentTab.pinned);
  }, false, "closeOtherTabs"),
  
  closeOtherTabs: new DisableableAction("closeOtherTabs", function() {
    browser.tabs.query({
      active: false,
      pinned: false,
      currentWindow: true
    }).then(tabsToClose => {
      browser.tabs.remove(tabsToClose.map(tab => tab.id));
    });
  }, function() {
    return browser.tabs.query({
      active: false,
      pinned: false,
      currentWindow: true
    }).then(tabsToClose => tabsToClose.length === 0);
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
  
  previousTab: new OtherTabsExistDisableableAction("previousTab",
    function(currentTabIndex, numberOfTabs) {
      return currentTabIndex - 1 < 0 ? numberOfTabs - 1 :
                                       currentTabIndex - 1;
  }, false, "nextTab"),
  
  nextTab: new OtherTabsExistDisableableAction("nextTab",
    function(currentTabIndex, numberOfTabs) {
      return currentTabIndex + 1 < numberOfTabs ? currentTabIndex + 1 : 0;
  }, false, "pinUnpinTab"),
  
  pinUnpinTab: new Action("pinUnpinTab", function() {
    eGUtils.performOnCurrentTab(currentTab => {
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
    })).then(() => browser.tabs.remove(newWindow.tabs[0].id));
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
    return this._sendPerformActionMessage("copyInformation", {
      information: eGContext.anchorElementHREF
    });
  }, false, "saveLinkAs"),
  
  saveLinkAs: new LinkExistsDisableableAction("saveLinkAs", function() {
    browser.downloads.download({
      url: eGContext.anchorElementHREF,
      saveAs: true
    }).catch(() => {});
  }, false, "dailyReadings"),
  
  dailyReadings: new DailyReadingsDisableableAction(true, "bookmarkThisPage"),
  
  bookmarkThisPage: new DisableableAction("bookmarkThisPage", function() {
    eGUtils.performOnCurrentTab(currentTab => {
      browser.bookmarks.create({
        title: currentTab.title,
        url: currentTab.url
      });
    });
  }, function() {
    try {
      return browser.bookmarks.search({
        url: eGContext.pageURL
      }).then(foundBookmarks => foundBookmarks.length > 0);
    }
    catch (exception) {
      return Promise.resolve(true);
    }
  }, false, "bookmarkThisIdentifier"),
  
  bookmarkThisIdentifier: new URLToIdentifierExistsDisableableAction("bookmarkThisIdentifier", function() {
    eGUtils.performOnCurrentTab(currentTab => {
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
    }).then(foundBookmarks => browser.bookmarks.remove(foundBookmarks[0].id));
  }, function() {
    try {
      return browser.bookmarks.search({
        url: eGContext.pageURL
      }).then(foundBookmarks => foundBookmarks.length === 0);
    }
    catch (exception) {
      return Promise.resolve(true);
    }
  }, false, "removeBookmarkToThisIdentifier"),
  
  removeBookmarkToThisIdentifier: new DisableableAction("removeBookmarkToThisIdentifier", function() {
    browser.bookmarks.search({
      url: eGContext.urlToIdentifier
    }).then(foundBookmarks => browser.bookmarks.remove(foundBookmarks[0].id));
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
    }).then(foundBookmarks => browser.bookmarks.remove(foundBookmarks[0].id));
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
      return this._sendPerformActionMessage("copyInformation", {
        information: eGContext.imageElementSRC
      });
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
  
  hideImages: new ContentSideStatusAction("hideImages", function() {
    this._sendPerformActionMessageToInnermostFrameWithinCurrentTab();
  }, false, "cut"),
  
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
