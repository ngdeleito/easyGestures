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


/* global eGContext, eGActions, console, browser */

var eGMessageHandlers = {
  setContext : function(aMessage) {
    for (let key in aMessage.context) {
      eGContext[key] = aMessage.context[key];
    }
  },
  
  getTooltipLabels : function(aMessage, sendResponse) {
    sendResponse({
      response: aMessage.actions.map(function(actionName) {
                  return eGActions[actionName].getTooltipLabel();
                })
    });
  },
  
  isExtraMenuAction : function(aMessage, sendResponse) {
    sendResponse({
      response: eGActions[aMessage.actionName].isExtraMenuAction
    });
  },
  
  getActionsStatus : function(aMessage, sendResponse) {
    sendResponse({
      responses: aMessage.actions.map(function(actionName) {
        return eGActions[actionName].getActionStatus();
      })
    });
  },
  
  runAction : function(aMessage, sendResponse) {
    var response = {
      actionIsDisabled: eGActions[aMessage.actionName].isDisabled()
    };
    if (!response.actionIsDisabled) {
      try {
        let result = eGActions[aMessage.actionName].run();
        response.runActionName = result.runActionName;
        response.runActionOptions = result.runActionOptions;
      }
      catch(ex) {
        console.error("easyGestures N exception: " + ex.toString());
      }
    }
    sendResponse(response);
  },
  
  loadURLInNewNonActiveTab : function(aMessage) {
    browser.tabs.create({
      active: false,
      url: aMessage.url
    });
  },
  
  loadURLInNewWindow : function(aMessage) {
    browser.windows.create({
      url: aMessage.url
    });
  },
  
  loadURLInCurrentTab : function(aMessage) {
    browser.tabs.update({
      url: aMessage.url
    });
  }
};

function handleMessage(aMessage, sender, sendResponse) {
  if (eGMessageHandlers[aMessage.messageName] !== undefined) {
    eGMessageHandlers[aMessage.messageName](aMessage, sendResponse);
  }
}

browser.runtime.onMessage.addListener(handleMessage);

function resetPieMenuOnAllTabs() {
  browser.tabs.query({}).then(tabs => {
    for (let tab of tabs) {
      // we do a catch to avoid having an error message being displayed on the
      // console for tabs on which the content scripts are not loaded
      browser.tabs.sendMessage(tab.id, {}).catch(() => {});
    }
  });
}

browser.runtime.connect().onMessage.addListener(resetPieMenuOnAllTabs);

browser.runtime.sendMessage({
  messageName: "query_eGPrefs",
  methodName: "areStartupTipsOn"
}).then(aMessage => {
  if (aMessage.response) {
    browser.tabs.create({
      active: false,
      url: "/tips/tips.html"
    });
  }
});
