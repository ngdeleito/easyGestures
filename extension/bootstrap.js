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


/* exported startup, shutdown, install, uninstall */
/* global Components, Services, eGPieMenu, eGContext, eGActions, AddonManager,
          ADDON_INSTALL, ADDON_ENABLE, eGPrefs, ADDON_UPGRADE, eGStrings,
          setTimeout, eGUtils, ADDON_UNINSTALL */

Components.utils.import("resource://gre/modules/AddonManager.jsm");
Components.utils.import("resource://gre/modules/Services.jsm");

var eGPrefsObserver = {
  register: function() {
    this._branch = Services.prefs.getBranch("extensions.easygestures.");
    this._branch.addObserver("activation.", this, false);
    this._branch.addObserver("behavior.", this, false);
    this._branch.addObserver("menus.", this, false);
    this._branch.addObserver("customizations.", this, false);
  },
  
  unregister: function() {
    this._branch.removeObserver("activation.", this);
    this._branch.removeObserver("behavior.", this);
    this._branch.removeObserver("menus.", this);
    this._branch.removeObserver("customizations.", this);
  },
  
  observe: function() {
    if (eGPieMenu.isShown()) {
      // we properly close an open menu in case e.g. the showAltButton
      // preference has been updated through the custom mouse button option
      eGPieMenu.close();
    }
    
    // removing existing easyGestures menus from open web pages
    eGPieMenu.removeFromAllPages();
    
    // rebulding the menu
    eGPieMenu.init();
  }
};

var eGMessageListeners = {
  handleContentScriptLoad : function(aMessage, sendResponse) {
    sendResponse({
      showButton: eGPieMenu.showButton,
      showKey: eGPieMenu.showKey,
      showAltButton: eGPieMenu.showAltButton,
      preventOpenKey: eGPieMenu.preventOpenKey,
      contextKey: eGPieMenu.contextKey,
      contextShowAuto: eGPieMenu.contextShowAuto,
      largeMenu: eGPieMenu.largeMenu,
      smallIcons: eGPieMenu.smallIcons,
      menuOpacity: eGPieMenu.menuOpacity,
      showTooltips: eGPieMenu.showTooltips,
      tooltipsDelay: eGPieMenu.tooltipsDelay,
      moveAuto: eGPieMenu.moveAuto,
      handleLinks: eGPieMenu.handleLinks,
      linksDelay: eGPieMenu.linksDelay,
      handleLinksAsOpenLink: eGPieMenu.handleLinksAsOpenLink,
      openTabForMiddleclick: Services.prefs.getBoolPref("browser.tabs.opentabfor.middleclick"),
      autoscrollingOn: eGPieMenu.autoscrollingOn,
      autoscrollingDelay: eGPieMenu.autoscrollingDelay,
      mainAlt1MenuEnabled: eGPieMenu.mainAlt1MenuEnabled,
      mainAlt2MenuEnabled: eGPieMenu.mainAlt2MenuEnabled,
      extraAlt1MenuEnabled: eGPieMenu.extraAlt1MenuEnabled,
      extraAlt2MenuEnabled: eGPieMenu.extraAlt2MenuEnabled,
      loadURLActionPrefs: eGPieMenu.loadURLActionPrefs,
      runScriptActionPrefs: eGPieMenu.runScriptActionPrefs,
      menusMain: eGPrefs._prefs.getCharPref("menus.main"),
      menusMainAlt1: eGPrefs._prefs.getCharPref("menus.mainAlt1"),
      menusMainAlt2: eGPrefs._prefs.getCharPref("menus.mainAlt2"),
      menusExtra: eGPrefs._prefs.getCharPref("menus.extra"),
      menusExtraAlt1: eGPrefs._prefs.getCharPref("menus.extraAlt1"),
      menusExtraAlt2: eGPrefs._prefs.getCharPref("menus.extraAlt2"),
      menusContextLink: eGPrefs._prefs.getCharPref("menus.contextLink"),
      menusContextImage: eGPrefs._prefs.getCharPref("menus.contextImage"),
      menusContextSelection: eGPrefs._prefs.getCharPref("menus.contextSelection"),
      menusContextTextbox: eGPrefs._prefs.getCharPref("menus.contextTextbox")
    });
  },
  
  seteGContext : function(aMessage) {
    for (let key in aMessage.eGContext) {
      eGContext[key] = aMessage.eGContext[key];
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
  
  getContextualMenuLocalizedName : function(aMessage, sendResponse) {
    sendResponse({
      response: eGStrings.getString(aMessage.contextualMenuName)
    });
  },
  
  getActionsStatus : function(aMessage, sendResponse) {
    sendResponse({
      responses: aMessage.actions.map(function(actionName, actionSector) {
        return eGActions[actionName]
                 .getActionStatus(aMessage.layoutName, actionSector);
      })
    });
  },
  
  updateStatsForActionToBeExecuted : function(aMessage) {
    if (aMessage.type === "main") {
      eGPrefs.incrementStatsMainMenuPref(aMessage.position);
    }
    else if (aMessage.type === "extra") {
      eGPrefs.incrementStatsExtraMenuPref(aMessage.position);
    }
    eGPrefs.updateStatsForAction(aMessage.actionName);
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
        var error = Components.classes["@mozilla.org/scripterror;1"]
                              .createInstance(Components.interfaces.nsIScriptError);
        error.init("easyGestures N exception: " + ex.toString(), null, null, null, null, error.errorFlag, null);
        Services.console.logMessage(error);
      }
    }
    sendResponse(response);
  },
  
  retrieveAndAddFavicon: function(aMessage, sendResponse) {
    var aURL = aMessage.aURL;
    if (aURL.match(/\:\/\//i) === null) {
      aURL = "http://" + aURL;
    }
    
    var faviconService = Components
                           .classes["@mozilla.org/browser/favicon-service;1"]
                           .getService(Components.interfaces.mozIAsyncFavicons);
    faviconService.getFaviconURLForPage(Services.io.newURI(aURL, null, null), function(aURI) {
      sendResponse({
        aURL: aURI !== null ? aURI.spec : ""
      });
    });
    return true;
  }
};

function handleMessage(aMessage, sender, sendResponse) {
  if (eGMessageListeners[aMessage.messageName] !== undefined) {
    return eGMessageListeners[aMessage.messageName](aMessage, sendResponse);
  }
}

function startup(data, reason) {
  Components.utils.import("chrome://easygestures/content/eGPrefs.jsm");
  Components.utils.import("chrome://easygestures/content/eGStrings.jsm");
  Components.utils.import("chrome://easygestures/content/eGPieMenu.jsm");
  Components.utils.import("chrome://easygestures/content/eGActions.jsm");
  Components.utils.import("chrome://easygestures/content/eGContext.jsm");
  Components.utils.import("chrome://easygestures/content/eGUtils.jsm");
  
  AddonManager.getAddonByID(data.id, function(addon) {
    // installing or upgrading preferences
    var count = {};
    Services.prefs.getChildList("extensions.easygestures.", count);
    if (reason === ADDON_INSTALL ||
        (reason === ADDON_ENABLE && count.value === 0)) {
      // when installing an extension by copying it to the extensions folder
      // reason == ADDON_ENABLE, hence the test to see if there are already
      // preferences in the easygestures preferences branch
      eGPrefs.setDefaultSettings();
      eGPrefs.initializeStats();
    }
    else if (reason === ADDON_UPGRADE) {
      if (Services.vc.compare(data.oldVersion, "4.10") < 0) {
        eGPrefs.updateToV4_10();
      }
      if (Services.vc.compare(data.oldVersion, "4.11") < 0) {
        eGPrefs.updateToV4_11();
      }
      if (Services.vc.compare(data.oldVersion, "4.12") < 0) {
        eGPrefs.updateToV4_12();
      }
      if (Services.vc.compare(data.oldVersion, "4.13") < 0) {
        eGPrefs.updateToV4_13();
      }
      if (Services.vc.compare(data.oldVersion, "4.14") < 0) {
        eGPrefs.updateToV4_14();
      }
    }
    
    // getting access to localization strings
    eGStrings.init(addon);
    
    // start listening to changes in preferences that could require rebuilding
    // the menus
    eGPrefsObserver.register();
    
    // creating menu
    eGPieMenu.init();
    
    // registering style sheet
    var sss = Components.classes["@mozilla.org/content/style-sheet-service;1"]
                        .getService(Components.interfaces.nsIStyleSheetService);
    var uri = Services.io.newURI("chrome://easygestures/skin/actions.css", null, null);
    if (!sss.sheetRegistered(uri, sss.AUTHOR_SHEET)) {
      sss.loadAndRegisterSheet(uri, sss.AUTHOR_SHEET);
    }
    
    data.webExtension.startup().then(api => {
      const {browser} = api;
      browser.runtime.onMessage.addListener(handleMessage);
    });
    
    // displaying startup tips
    if (eGPrefs.areStartupTipsOn()) {
      let window = Services.wm.getMostRecentWindow("navigator:browser");
      if (window.document.readyState === "complete") {
        eGUtils.showOrOpenTab("chrome://easygestures/content/tips.html", false);
      }
      else {
        window.addEventListener("load", function displayTipsAtStartup() {
          window.removeEventListener("load", displayTipsAtStartup, false);
          setTimeout(function() {
            eGUtils.showOrOpenTab("chrome://easygestures/content/tips.html",
                                  false);
          }, 200);
        }, false);
      }
    }
  });
}

function shutdown() {
  // flushing because a string bundle was created
  Services.strings.flushBundles();
  
  // stop listening to changes in preferences
  eGPrefsObserver.unregister();
  
  // removing existing easyGestures menus from open web pages
  eGPieMenu.removeFromAllPages();
  
  // unregistering style sheet
  var sss = Components.classes["@mozilla.org/content/style-sheet-service;1"]
                      .getService(Components.interfaces.nsIStyleSheetService);
  var uri = Services.io.newURI("chrome://easygestures/skin/actions.css", null, null);
  if (sss.sheetRegistered(uri, sss.AUTHOR_SHEET)) {
    sss.unregisterSheet(uri, sss.AUTHOR_SHEET);
  }
  
  Components.utils.unload("chrome://easygestures/content/eGContext.jsm");
  Components.utils.unload("chrome://easygestures/content/eGActions.jsm");
  Components.utils.unload("chrome://easygestures/content/eGPieMenu.jsm");
  Components.utils.unload("chrome://easygestures/content/eGStrings.jsm");
  Components.utils.unload("chrome://easygestures/content/eGPrefs.jsm");
}

function install() {
}

function uninstall(data, reason) {
  if (reason === ADDON_UNINSTALL) {
    var prefs = Services.prefs.getBranch("extensions.easygestures.");
    prefs.deleteBranch("");
  }
}
