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


/* global browser, eGPrefs, eGContext, eGActions, console, eGUtils, window */

"use strict";

let installOrUpgradeTriggered = false;

function resetPieMenuOnAllTabs() {
  browser.tabs.query({}).then(tabs => {
    for (let tab of tabs) {
      // we do a catch to avoid having an error message being displayed on the
      // console for tabs on which the content scripts are not loaded
      browser.tabs.sendMessage(tab.id, {}).catch(() => {});
    }
  });
}

function handleStorageChange(changes) {
  for (let change in changes) {
    let prefix = change.split(".")[0];
    if (prefix !== "general" && prefix !== "stats") {
      resetPieMenuOnAllTabs();
    }
  }
}

let eGMessageHandlers = {
  setContextAndFocusCurrentWindow: function(aMessage) {
    for (let key in aMessage.context) {
      eGContext[key] = aMessage.context[key];
    }
    browser.windows.getCurrent().then(currentWindow => {
      browser.windows.update(currentWindow.id, {
        focused: true
      });
    });
  },
  
  getTooltips: function(aMessage) {
    return Promise.all(aMessage.actions.map(function(actionName) {
      return eGActions[actionName].getTooltip();
    }));
  },
  
  isExtraMenuAction: function(aMessage, sendResponse) {
    sendResponse({
      response: eGActions[aMessage.actionName].isExtraMenuAction
    });
  },
  
  getActionsStatus: function(aMessage) {
    let actionsStatus = aMessage.actions.map(function(actionName) {
                            return eGActions[actionName].getActionStatus();
                        });
    return Promise.all(actionsStatus.map(function(status) {
      return status.status;
    })).then(statuses => {
      return actionsStatus.map((actionStatus, index) => {
        actionStatus.status = statuses[index];
        return actionStatus;
      });
    });
  },
  
  incrementShowExtraMenuStats: function(aMessage) {
    eGPrefs.incrementStatsMainMenuPref(aMessage.incrementIndex);
  },
  
  runAction: function(aMessage) {
    return eGActions[aMessage.actionName].run(aMessage.updateStatsInformation);
  },
  
  loadURLInNewNonActiveTab: function(aMessage) {
    eGUtils.performOnCurrentTab(currentTab => {
      browser.tabs.create({
        active: false,
        openerTabId: currentTab.id,
        url: aMessage.url
      });
    });
  },
  
  loadURLInCurrentTab: function(aMessage) {
    browser.tabs.update({
      url: aMessage.url
    });
  }
};

function handleMessage(aMessage, sender, sendResponse) {
  if (eGMessageHandlers[aMessage.messageName] !== undefined) {
    return eGMessageHandlers[aMessage.messageName](aMessage, sendResponse);
  }
}

function startup() {
  // start listening to changes in preferences that could require rebuilding the
  // menus
  browser.storage.onChanged.addListener(handleStorageChange);
  // start listening to messages from content scripts
  browser.runtime.onMessage.addListener(handleMessage);
  // displaying tips if requested
  eGPrefs.areStartupTipsOn().then(prefValue => {
    if (prefValue) {
      browser.tabs.create({
        active: false,
        url: "/tips/tips.html"
      });
    }
  });
}

async function handleInstallOrUpgrade(details) {
  installOrUpgradeTriggered = true;
  await browser.storage.local.set({
    "installOrUpgradeTriggered": true
  });
  if (details.reason === "install") {
    await eGPrefs.setDefaultSettings();
    eGPrefs.initializeStats();
  }
  else if (details.reason === "update") {
    if (eGUtils.isVersionSmallerOrEqualThan(details.previousVersion, "5.3")) {
      await eGPrefs.updateToV5_3();
    }
    if (eGUtils.isVersionSmallerOrEqualThan(details.previousVersion, "5.4")) {
      await eGPrefs.updateToV5_4();
    }
    if (eGUtils.isVersionSmallerOrEqualThan(details.previousVersion, "6.2")) {
      await eGPrefs.updateToV6_2();
    }
  }
  await browser.storage.local.remove("installOrUpgradeTriggered");
  startup();
  // sending a reset to initialize the content scripts
  resetPieMenuOnAllTabs();
}

browser.runtime.onInstalled.addListener(handleInstallOrUpgrade);

window.setTimeout(function() {
  // if no install or upgrade procedure is triggered, then run startup
  if (!installOrUpgradeTriggered) {
    startup();
  }
}, 200);
