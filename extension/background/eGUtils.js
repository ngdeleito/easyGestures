/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

/* exported eGUtils */
/* global browser */

"use strict";

let eGUtils = {
  isVersionSmallerThan(oldVersion, newVersion) {
    let oldVersionArray = oldVersion.split(".");
    let newVersionArray = newVersion.split(".");
    
    if (oldVersionArray[2] === undefined) {
      oldVersionArray[2] = 0;
    }
    if (newVersionArray[2] === undefined) {
      newVersionArray[2] = 0;
    }
    
    return oldVersionArray[0] < newVersionArray[0] ||
           (oldVersionArray[0] === newVersionArray[0] &&
             oldVersionArray[1] < newVersionArray[1] ||
             (oldVersionArray[1] === newVersionArray[1] &&
               oldVersionArray[2] < newVersionArray[2]));
  },
  
  performOnCurrentTab(aFunction) {
    return browser.tabs.query({
      active: true,
      currentWindow: true
    }).then(tabs => aFunction(tabs[0]));
  },
  
  _sendMessageToParentOfFrameWithURLWithinCurrentTab(message, frameURL, includeFrameID) {
    this.performOnCurrentTab(currentTab => {
      browser.webNavigation.getAllFrames({
        tabId: currentTab.id
      }).then(anArray => {
        let frameData = anArray.find(element => {
          return element.url === frameURL;
        });
        if (includeFrameID) {
          let frameHierarchyArray = message.parameters.context.frameHierarchyArray;
          frameHierarchyArray[frameHierarchyArray.length - 1].frameID = frameData.frameId;
        }
        browser.tabs.sendMessage(currentTab.id, message, {
          frameId: frameData.parentFrameId
        });
      });
    });
  },
  
  transferMousedownToUpperFrame(frameURL, message) {
    this._sendMessageToParentOfFrameWithURLWithinCurrentTab(message, frameURL, true);
  },
  
  sendMessageToParentOfFrameWithURLWithinCurrentTab(message, frameURL) {
    this._sendMessageToParentOfFrameWithURLWithinCurrentTab(message, frameURL, false);
  },
  
  sendMessageToFrameWithFrameIDWithinCurrentTab(message, frameID) {
    this.performOnCurrentTab(currentTab => {
      browser.tabs.sendMessage(currentTab.id, message, {
        frameId: frameID
      });
    });
  },
  
  sendMessageToTopmostFrameWithinCurrentTab(message) {
    this.sendMessageToFrameWithFrameIDWithinCurrentTab(message, 0);
  },
  
  showOrOpenTab(aURLPathSuffix, aURLHash) {
    browser.tabs.query({}).then(tabs => {
      let firstTabWithSamePathSuffix = tabs.find(tab => {
        // since extensions get host permissions for their own pages, we
        // explicitly check that tab.url is not undefined to avoid requesting
        // the "tabs" permission for opening the preferences and tips pages
        return tab.url !== undefined &&
               tab.url.startsWith(browser.runtime.getURL(aURLPathSuffix));
      });
      let urlToOpen = aURLPathSuffix + (aURLHash === "" ? "" : "#" + aURLHash);
      if (firstTabWithSamePathSuffix === undefined) {
        this.performOnCurrentTab(currentTab => {
          browser.tabs.create({
            active: true,
            openerTabId: currentTab.id,
            url: urlToOpen
          });
        });
      }
      else {
        browser.tabs.update(firstTabWithSamePathSuffix.id, {
          active: true,
          url: urlToOpen
        });
      }
    });
  },
  
  setDocumentTitle(document, titleStringName) {
    document.title = browser.i18n.getMessage(titleStringName) + " " +
                     document.title;
  },
  
  setDocumentLocalizedStrings(document) {
    let elements = document.querySelectorAll("[data-l10n]");
    for (let i=0; i < elements.length; ++i) {
      elements[i].textContent = browser.i18n
                                       .getMessage(elements[i].dataset.l10n);
    }
  }
};
