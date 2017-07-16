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
/* global Components, Services, ADDON_UPGRADE */

Components.utils.import("resource://gre/modules/Services.jsm");

var eGPrefsUpdater = {
  _prefs : Services.prefs.getBranch("extensions.easygestures."),
  
  updateToV4_10: function() {
    this._prefs.deleteBranch("menus.contextImageFirst");
    this._prefs.deleteBranch("menus.contextTextboxFirst");
    
    var actionsStats = JSON.parse(this._prefs.getCharPref("stats.actions"));
    var newActions = ["firefoxPreferences", "addOns",
                      "easyGesturesNPreferences"];
    newActions.forEach(function(actionName) {
      actionsStats[actionName] = 0;
    });
    this._prefs.setCharPref("stats.actions", JSON.stringify(actionsStats));
    
    this._prefs.setIntPref("activation.preventOpenKey",
      this._prefs.getIntPref("activation.suppressKey"));
    this._prefs.deleteBranch("activation.suppressKey");
  },
  
  updateToV4_11: function() {
    var menuNames = ["main", "mainAlt1", "mainAlt2", "extra", "extraAlt1",
      "extraAlt2", "contextLink", "contextImage", "contextSelection",
      "contextTextbox"];
    var extraMenuNames = ["extra", "extraAlt1", "extraAlt2"];
    
    menuNames.forEach(function(menuName) {
      let actions = this._prefs.getCharPref("menus." + menuName).split("/");
      [actions[0], actions[2]] = [actions[2], actions[0]];
      [actions[9], actions[3]] = [actions[3], actions[9]];
      [actions[8], actions[4]] = [actions[4], actions[8]];
      [actions[7], actions[5]] = [actions[5], actions[7]];
      this._prefs.setCharPref("menus." + menuName, actions.join("/"));
    }, this);
    
    extraMenuNames.forEach(function(menuName) {
      let actions = this._prefs.getCharPref("menus." + menuName).split("/");
      actions.splice(5, 5);
      this._prefs.setCharPref("menus." + menuName, actions.join("/"));
    }, this);
    
    var mainMenuStats = JSON.parse(this._prefs.getCharPref("stats.mainMenu"));
    [mainMenuStats[0], mainMenuStats[2]] = [mainMenuStats[2], mainMenuStats[0]];
    [mainMenuStats[9], mainMenuStats[3]] = [mainMenuStats[3], mainMenuStats[9]];
    [mainMenuStats[8], mainMenuStats[4]] = [mainMenuStats[4], mainMenuStats[8]];
    [mainMenuStats[7], mainMenuStats[5]] = [mainMenuStats[5], mainMenuStats[7]];
    [mainMenuStats[10], mainMenuStats[12]] = [mainMenuStats[12], mainMenuStats[10]];
    [mainMenuStats[19], mainMenuStats[13]] = [mainMenuStats[13], mainMenuStats[19]];
    [mainMenuStats[18], mainMenuStats[14]] = [mainMenuStats[14], mainMenuStats[18]];
    [mainMenuStats[17], mainMenuStats[15]] = [mainMenuStats[15], mainMenuStats[17]];
    [mainMenuStats[20], mainMenuStats[22]] = [mainMenuStats[22], mainMenuStats[20]];
    [mainMenuStats[29], mainMenuStats[23]] = [mainMenuStats[23], mainMenuStats[29]];
    [mainMenuStats[28], mainMenuStats[24]] = [mainMenuStats[24], mainMenuStats[28]];
    [mainMenuStats[27], mainMenuStats[25]] = [mainMenuStats[25], mainMenuStats[27]];
    this._prefs.setCharPref("stats.mainMenu", JSON.stringify(mainMenuStats));
    
    var extraMenuStats = JSON.parse(this._prefs.getCharPref("stats.extraMenu"));
    [extraMenuStats[0], extraMenuStats[2]] = [extraMenuStats[2], extraMenuStats[0]];
    [extraMenuStats[7], extraMenuStats[3]] = [extraMenuStats[3], extraMenuStats[7]];
    [extraMenuStats[6], extraMenuStats[4]] = [extraMenuStats[4], extraMenuStats[6]];
    [extraMenuStats[8], extraMenuStats[10]] = [extraMenuStats[10], extraMenuStats[8]];
    [extraMenuStats[15], extraMenuStats[11]] = [extraMenuStats[11], extraMenuStats[15]];
    [extraMenuStats[14], extraMenuStats[12]] = [extraMenuStats[12], extraMenuStats[14]];
    [extraMenuStats[16], extraMenuStats[18]] = [extraMenuStats[18], extraMenuStats[16]];
    [extraMenuStats[22], extraMenuStats[19]] = [extraMenuStats[19], extraMenuStats[22]];
    [extraMenuStats[23], extraMenuStats[20]] = [extraMenuStats[20], extraMenuStats[23]];
    extraMenuStats.splice(5, 3);
    extraMenuStats.splice(10, 3);
    extraMenuStats.splice(15, 3);
    this._prefs.setCharPref("stats.extraMenu", JSON.stringify(extraMenuStats));
  },
  
  updateToV4_12: function() {
    this._prefs.deleteBranch("activation.showAfterDelay");
    this._prefs.deleteBranch("activation.showAfterDelayValue");
    this._prefs.deleteBranch("stats.clicks");
    this._prefs.deleteBranch("stats.menuShown");
  },
  
  updateToV4_13: function() {
    var preventOpenKey = this._prefs.getIntPref("activation.preventOpenKey");
    var contextKey = this._prefs.getIntPref("activation.contextKey");
    var message = "Your previous key choices for the preferences listed below " +
      "are no longer supported and have been reset. You can select other keys " +
      "under the \"Activation\" tab in the easyGestures N preferences dialog.\n";
    var showMessage = false;
    if (preventOpenKey !== 0 && preventOpenKey !== 17 && preventOpenKey !== 18) {
      this._prefs.setIntPref("activation.preventOpenKey", 0);
      message += "  - key used to prevent the pie menu from opening\n";
      showMessage = true;
    }
    if (contextKey !== 0 && contextKey !== 17 && contextKey !== 18) {
      this._prefs.setIntPref("activation.contextKey", 18);
      message += "  - key used to activate the contextual menu";
      showMessage = true;
    }
    if (showMessage) {
      Services.prompt.alert(null, "easyGestures N v4.13", message);
    }
  },
  
  updateToV4_14: function() {
    this._prefs.deleteBranch("customizations.dailyReadingsFolder");
    var lastResetString = this._prefs.getCharPref("stats.lastReset");
    var lastResetItems = lastResetString.split(/\/|\s{2}|:/);
    var lastResetDate = new Date(lastResetItems[0], lastResetItems[1],
                                 lastResetItems[2], lastResetItems[3],
                                 lastResetItems[4], lastResetItems[5]);
    this._prefs.setCharPref("stats.lastReset", lastResetDate.toISOString());
    this._prefs.deleteBranch("behavior.noIcons");
  },
  
  updateToV5_2: function() {
    this._prefs.setCharPref("customizations.dailyReadingsFolderName", "");
    this._prefs.deleteBranch("customizations.dailyReadingsFolderID");
  }
};

var eGMessageListeners = {
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
  
  exportPrefs: function(aMessage) {
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
      converterOutputStream.writeString(aMessage.prefsAsString);
      converterOutputStream.close();
      outputStream.close();
    }
  },
  
  retrievePreferences: function(aMessage, sendResponse) {
    var prefs = Services.prefs.getBranch("extensions.easygestures.");
    var prefsNames = prefs.getChildList("");
    var result = [];
    
    prefsNames.forEach(function(prefName) {
      let prefType = prefs.getPrefType(prefName);
      let prefValue;
      switch (prefType) {
        case Components.interfaces.nsIPrefBranch.PREF_STRING:
          prefValue = prefs.getComplexValue(prefName,
                        Components.interfaces.nsISupportsString).data;
          break;
        case Components.interfaces.nsIPrefBranch.PREF_INT:
          prefValue = prefs.getIntPref(prefName);
          break;
        case Components.interfaces.nsIPrefBranch.PREF_BOOL:
          prefValue = prefs.getBoolPref(prefName);
          break;
      }
      result.push([prefName, prefValue]);
    });
    sendResponse({
      response: JSON.stringify(result)
    });
    prefs.deleteBranch("");
  }
};

function handleMessage(aMessage, sender, sendResponse) {
  if (eGMessageListeners[aMessage.messageName] !== undefined) {
    return eGMessageListeners[aMessage.messageName](aMessage, sendResponse);
  }
}

function startup(data, reason) {
  if (reason === ADDON_UPGRADE) {
    if (Services.vc.compare(data.oldVersion, "4.10") < 0) {
      eGPrefsUpdater.updateToV4_10();
    }
    if (Services.vc.compare(data.oldVersion, "4.11") < 0) {
      eGPrefsUpdater.updateToV4_11();
    }
    if (Services.vc.compare(data.oldVersion, "4.12") < 0) {
      eGPrefsUpdater.updateToV4_12();
    }
    if (Services.vc.compare(data.oldVersion, "4.13") < 0) {
      eGPrefsUpdater.updateToV4_13();
    }
    if (Services.vc.compare(data.oldVersion, "4.14") < 0) {
      eGPrefsUpdater.updateToV4_14();
    }
    if (Services.vc.compare(data.oldVersion, "5.2") < 0) {
      eGPrefsUpdater.updateToV5_2();
    }
  }
  
  data.webExtension.startup().then(api => {
    const {browser} = api;
    browser.runtime.onMessage.addListener(handleMessage);
  });
}

function shutdown() {
  // removing existing easyGestures menus from open web pages
  // eGPieMenu.removeFromAllPages();
}

function install() {
}

function uninstall() {
}
