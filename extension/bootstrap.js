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
/* global Components, Services, eGPieMenu, AddonManager, ADDON_INSTALL,
          ADDON_ENABLE, eGPrefs, ADDON_UPGRADE, ADDON_UNINSTALL */

Components.utils.import("resource://gre/modules/AddonManager.jsm");
Components.utils.import("resource://gre/modules/Services.jsm");

var embeddedExtensionPort;

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
    eGPieMenu.init();
    
    // removing existing easyGestures menus from open web pages
    embeddedExtensionPort.postMessage({});
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
  
  query_eGPrefs : function(aMessage, sendResponse) {
    sendResponse({
      response: eGPrefs[aMessage.methodName].apply(eGPrefs,
         [aMessage.parameter, aMessage.parameter2])
    });
  },
  
  importPrefsFromString : function(aMessage, sendResponse) {
    var response = {};
    try {
      eGPrefs.importPrefsFromString(aMessage.prefsString);
    }
    catch (exception) {
      response.prefs = exception.prefs;
      response.code = exception.code;
    }
    
    sendResponse(response);
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
  
  increaseExtraMenuUsage : function(aMessage) {
    eGPrefs.incrementStatsMainMenuPref(aMessage.position);
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
  },
  
  retrieveCustomIconFile: function(aMessage, sendResponse) {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    var fp = Components.classes["@mozilla.org/filepicker;1"]
                       .createInstance(Components.interfaces.nsIFilePicker);
    fp.init(window, null, Components.interfaces.nsIFilePicker.modeOpen);
    fp.appendFilters(Components.interfaces.nsIFilePicker.filterImages);
    var returnedOK = fp.show() === Components.interfaces.nsIFilePicker.returnOK;
    
    sendResponse({
      returnedOK: returnedOK,
      path: returnedOK ? fp.file.path : undefined
    });
  },
  
  importPrefs: function(aMessage, sendResponse) {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    var fp = Components.classes["@mozilla.org/filepicker;1"]
                       .createInstance(Components.interfaces.nsIFilePicker);
    fp.init(window, "easyGestures N", Components.interfaces.nsIFilePicker.modeOpen);
    fp.appendFilters(Components.interfaces.nsIFilePicker.filterAll);
    var returnValue = fp.show();
    var aString;
    if (returnValue === Components.interfaces.nsIFilePicker.returnOK) {
      var inputStream = Components
                        .classes["@mozilla.org/network/file-input-stream;1"]
                        .createInstance(Components.interfaces.nsIFileInputStream);
      inputStream.init(fp.file, 0x01, 444, 0);
      
      var converterInputStream = Components
                   .classes["@mozilla.org/intl/converter-input-stream;1"]
                   .createInstance(Components.interfaces.nsIConverterInputStream);
      converterInputStream.init(inputStream, "UTF-8", 0, 0xFFFD);
      var content = {};
      aString = "";
      while (converterInputStream.readString(4096, content) !== 0) {
        aString += content.value;
      }
      converterInputStream.close();
      inputStream.close();
    }
    
    sendResponse({
      prefsString: aString
    });
  },
  
  exportPrefs: function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    var fp = Components.classes["@mozilla.org/filepicker;1"]
                       .createInstance(Components.interfaces.nsIFilePicker);
    fp.init(window, "easyGestures N", Components.interfaces.nsIFilePicker.modeSave);
    fp.appendFilters(Components.interfaces.nsIFilePicker.filterAll);
    fp.defaultString = "easyGesturesNPreferences-" + (new Date()).toISOString() +
                       ".json";
    var returnValue = fp.show();
    if (returnValue === Components.interfaces.nsIFilePicker.returnOK ||
        returnValue === Components.interfaces.nsIFilePicker.returnReplace) {
      var outputStream = Components
                       .classes[ "@mozilla.org/network/file-output-stream;1"]
                       .createInstance(Components.interfaces.nsIFileOutputStream);
      outputStream.init(fp.file, 0x04 | 0x08, 420, 0);
      
      var converterOutputStream = Components
                  .classes["@mozilla.org/intl/converter-output-stream;1"]
                  .createInstance(Components.interfaces.nsIConverterOutputStream);
      converterOutputStream.init(outputStream, "UTF-8", 0, 0x0000);
      converterOutputStream.writeString(eGPrefs.exportPrefsToString());
      converterOutputStream.close();
      outputStream.close();
    }
  }
};

function handleMessage(aMessage, sender, sendResponse) {
  if (eGMessageListeners[aMessage.messageName] !== undefined) {
    return eGMessageListeners[aMessage.messageName](aMessage, sendResponse);
  }
}

function startup(data, reason) {
  Components.utils.import("chrome://easygestures/content/eGPrefs.jsm");
  Components.utils.import("chrome://easygestures/content/eGPieMenu.jsm");
  
  AddonManager.getAddonByID(data.id, function() {
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
    
    // start listening to changes in preferences that could require rebuilding
    // the menus
    eGPrefsObserver.register();
    
    // creating menu
    eGPieMenu.init();
    
    data.webExtension.startup().then(api => {
      const {browser} = api;
      browser.runtime.onMessage.addListener(handleMessage);
      browser.runtime.onConnect.addListener(aPort => {
        embeddedExtensionPort = aPort;
      });
    });
  });
}

function shutdown() {
  // stop listening to changes in preferences
  eGPrefsObserver.unregister();
  
  // removing existing easyGestures menus from open web pages
  eGPieMenu.removeFromAllPages();
  
  Components.utils.unload("chrome://easygestures/content/eGPieMenu.jsm");
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
