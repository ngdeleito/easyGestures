/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

/* global browser, eGPrefs, eGContext, eGActions, eGUtils, window */

"use strict";

let installOrUpgradeTriggered = false;

function resetPieMenuOnAllTabs() {
  browser.tabs.query({}).then(tabs => {
    for (let tab of tabs) {
      // we do a catch to avoid having an error message being displayed on the
      // console for tabs on which the content scripts are not loaded
      browser.tabs.sendMessage(tab.id, {
        messageName: "resetPieMenu",
        parameters: undefined
      }).catch(() => {});
    }
  });
}

function handleStorageChange(changes) {
  for (let change in changes) {
    let prefix = change.split(".")[0];
    if (prefix !== "general" && prefix !== "usage") {
      resetPieMenuOnAllTabs();
    }
  }
}

let eGMessageHandlers = {
  transferMousedownToUpperFrame: function(aMessage) {
    eGUtils.transferMousedownToUpperFrame(aMessage.parameters.innerFrameURL, {
      messageName: "handleMousedownFromInnerFrame",
      parameters: aMessage.parameters
    });
  },
  
  transferMouseupToUpperFrame: function(aMessage) {
    eGUtils.sendMessageToParentOfFrameWithURLWithinCurrentTab({
      messageName: "handleMouseupFromInnerFrame",
      parameters: aMessage.parameters
    }, aMessage.parameters.innerFrameURL);
  },
  
  transferKeydownToTopmostFrame: function(aMessage) {
    eGUtils.sendMessageToTopmostFrameWithinCurrentTab({
      messageName: "handleKeydownFromInnerFrame",
      parameters: aMessage.parameters
    });
  },
  
  addMousemoveListenerToFrame: function(aMessage) {
    eGUtils.sendMessageToFrameWithFrameIDWithinCurrentTab({
      messageName: "addMousemoveListener",
      parameters: undefined
    }, aMessage.parameters.frameID);
  },
  
  transferMousemoveToUpperFrame: function(aMessage) {
    eGUtils.sendMessageToParentOfFrameWithURLWithinCurrentTab({
      messageName: "handleMousemoveFromInnerFrame",
      parameters: aMessage.parameters
    }, aMessage.parameters.innerFrameURL);
  },
  
  removeMousemoveListenerFromFrame: function(aMessage) {
    eGUtils.sendMessageToFrameWithFrameIDWithinCurrentTab({
      messageName: "removeMousemoveListener",
      parameters: undefined
    }, aMessage.parameters.frameID);
  },
  
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
  
  incrementShowExtraMenuUsage: function(aMessage) {
    eGPrefs.incrementUsageMainMenuPref(aMessage.incrementIndex);
  },
  
  runAction: function(aMessage) {
    return eGActions[aMessage.actionName].run(aMessage.usageInformationUpdate);
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
    eGPrefs.initializeUsageData();
  }
  else if (details.reason === "update") {
    if (eGUtils.isVersionSmallerThan(details.previousVersion, "5.3")) {
      await eGPrefs.updateToV5_3();
    }
    if (eGUtils.isVersionSmallerThan(details.previousVersion, "5.4")) {
      await eGPrefs.updateToV5_4();
    }
    if (eGUtils.isVersionSmallerThan(details.previousVersion, "6.2")) {
      await eGPrefs.updateToV6_2();
    }
    if (eGUtils.isVersionSmallerThan(details.previousVersion, "6.3")) {
      await eGPrefs.updateToV6_3();
    }
    if (eGUtils.isVersionSmallerThan(details.previousVersion, "6.4")) {
      eGUtils.showOrOpenTab("/options/options.html", "permissions");
    }
    if (eGUtils.isVersionSmallerThan(details.previousVersion, "6.5")) {
      await eGPrefs.updateToV6_5();
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
