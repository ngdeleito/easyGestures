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


/* exported eGUtils */
/* global browser */

"use strict";

let eGUtils = {
  isVersionSmallerOrEqualThan(oldVersion, newVersion) {
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
               oldVersionArray[2] <= newVersionArray[2]));
  },
  
  performOnCurrentTab(aFunction) {
    return browser.tabs.query({
      active: true,
      currentWindow: true
    }).then(tabs => {
      return aFunction(tabs[0]);
    });
  },
  
  _sendMessageToParentOfFrameWithURLWithinCurrentTab(frameURL, message, includeFrameID) {
    this.performOnCurrentTab(currentTab => {
      browser.webNavigation.getAllFrames({
        tabId: currentTab.id
      }).then(anArray => {
        let frameData = anArray.find(element => {
          return element.url === frameURL;
        });
        if (includeFrameID) {
          let lastIndex = message.parameters.frameHierarchy.length - 1;
          message.parameters.frameHierarchy[lastIndex].frameID = frameData.frameId;
        }
        browser.tabs.sendMessage(currentTab.id, message, {
          frameId: frameData.parentFrameId
        });
      });
    });
  },
  
  transferMousedownToUpperFrame(frameURL, message) {
    this._sendMessageToParentOfFrameWithURLWithinCurrentTab(frameURL, message, true);
  },
  
  sendMessageToParentOfFrameWithURLWithinCurrentTab(frameURL, message) {
    this._sendMessageToParentOfFrameWithURLWithinCurrentTab(frameURL, message, false);
  },
  
  sendMessageToTopmostFrameWithinCurrentTab(message) {
    this.performOnCurrentTab(currentTab => {
      browser.tabs.sendMessage(currentTab.id, message, {
        frameId: 0
      });
    });
  },
  
  showOrOpenTab: function(aURLPathSuffix, aURLHash, giveFocus) {
    browser.tabs.query({}).then(tabs => {
      let tipsTab = tabs.find(tab => {
        return tab.url.startsWith(browser.extension.getURL(aURLPathSuffix));
      });
      let urlToOpen = aURLPathSuffix + (aURLHash === "" ? "" : "#" + aURLHash);
      if (tipsTab === undefined) {
        this.performOnCurrentTab(currentTab => {
          browser.tabs.create({
            active: giveFocus,
            openerTabId: currentTab.id,
            url: urlToOpen
          });
        });
      }
      else {
        browser.tabs.update(tipsTab.id, {
          active: giveFocus,
          url: urlToOpen
        });
      }
    });
  },
  
  setDocumentTitle: function(document, titleStringName) {
    document.title = browser.i18n.getMessage(titleStringName) + " " +
                     document.title;
  },
  
  setDocumentLocalizedStrings: function(document) {
    let elements = document.querySelectorAll("[data-l10n]");
    for (let i=0; i < elements.length; ++i) {
      elements[i].textContent = browser.i18n
                                       .getMessage(elements[i].dataset.l10n);
    }
  }
};
