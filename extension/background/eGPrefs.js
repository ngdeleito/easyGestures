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


/* exported eGPrefs */
/* global browser, eGActions */

"use strict";

function Pref(name, value) {
  this.name = name;
  this.value = value;
}
Pref.prototype = {
  constructor: Pref,
  
  updateTo: function(newPrefValue) {
    if (this.isNewValuePossible(newPrefValue)) {
      this.value = newPrefValue;
    }
    else {
      throw "";
    }
  },
  
  setPreference: function() {
    let prefObject = {};
    prefObject[this.name] = this.value;
    return browser.storage.local.set(prefObject);
  }
};

function BoolPref(name, value) {
  Pref.call(this, name, value);
}
BoolPref.prototype = Object.create(Pref.prototype);
BoolPref.prototype.constructor = BoolPref;
BoolPref.prototype.isNewValuePossible = function(newPrefValue) {
  return typeof newPrefValue === "boolean";
};

function IntPref(name, value, possibleValuesArray) {
  Pref.call(this, name, value);
  this.possibleValuesArray = possibleValuesArray;
}
IntPref.prototype = Object.create(Pref.prototype);
IntPref.prototype.constructor = IntPref;
IntPref.prototype.isNewValuePossible = function(newPrefValue) {
  return Number.isInteger(newPrefValue) &&
         (this.possibleValuesArray === undefined ||
          this.possibleValuesArray.indexOf(newPrefValue) !== -1);
};

function StringPref(name, value, isPossibleValue) {
  Pref.call(this, name, value);
  this.isPossibleValue = isPossibleValue;
}
StringPref.prototype = Object.create(Pref.prototype);
StringPref.prototype.constructor = StringPref;
StringPref.prototype.isNewValuePossible = function(newPrefValue) {
  return typeof newPrefValue === "string" && this.isPossibleValue(newPrefValue);
};

function ArrayPref(name, value, isPossibleValue) {
  Pref.call(this, name, value);
  this.isPossibleValue = isPossibleValue;
}
ArrayPref.prototype = Object.create(Pref.prototype);
ArrayPref.prototype.constructor = ArrayPref;
ArrayPref.prototype.isNewValuePossible = function(newPrefValue) {
  return Array.isArray(newPrefValue) && this.isPossibleValue(newPrefValue);
};

let eGPrefs = {
  _setBoolPref: function(aPrefsMap, prefName, prefValue) {
    aPrefsMap.set(prefName, new BoolPref(prefName, prefValue));
  },
  
  _setArrayPref: function(aPrefsMap, prefName, prefValue, isPossibleValue) {
    aPrefsMap.set(prefName,
                  new ArrayPref(prefName, prefValue, isPossibleValue));
  },
  
  _setStringPref: function(aPrefsMap, prefName, prefValue, isPossibleValue) {
    aPrefsMap.set(prefName,
                  new StringPref(prefName, prefValue, isPossibleValue));
  },
  
  _addDefaultMenusMap(aPrefsMap) {
    function checkPossibleMenuValues(numberOfActions, newPrefValue) {
      return newPrefValue.length === numberOfActions &&
             newPrefValue.every(function(element) {
               return element in eGActions;
             });
    }
    
    function checkPossibleNonExtraMenuValues(newPrefValue) {
      return checkPossibleMenuValues(10, newPrefValue);
    }
    
    function checkPossibleExtraMenuValues(newPrefValue) {
      return checkPossibleMenuValues(5, newPrefValue);
    }
    
    let nonExtraMenus = [
      ["main", ["nextTab", "pageTop", "showExtraMenu", "newTab", "back",
                "empty", "closeTab", "reload", "previousTab", "empty"]],
      ["mainAlt1", ["forward", "loadPageInNewTab", "showExtraMenu",
                    "undoCloseTab", "bookmarkThisPage", "empty", "pageBottom",
                    "empty", "empty", "empty"]],
      ["mainAlt2", ["loadURL2", "loadURL1", "showExtraMenu", "loadURL7",
                    "loadURL6", "runScript2", "loadURL5", "loadURL4",
                    "loadURL3", "runScript1"]],
      ["contextLink", ["bookmarkThisLink", "saveLinkAs", "copyLink", "openLink",
                       "openLinkInNewPrivateWindow", "empty", "empty", "empty",
                       "removeBookmarkToThisLink", "empty"]],
      ["contextImage", ["empty", "saveImageAs", "copyImage",
                        "copyImageLocation", "hideImages", "empty", "empty",
                        "empty", "empty", "empty"]],
      ["contextSelection", ["findAndHighlightSelection", "paste", "copy", "cut",
                            "searchWeb", "empty", "empty", "empty",
                            "removeHighlight", "empty"]],
      ["contextTextbox", ["selectAll", "paste", "copy", "cut", "empty", "empty",
                          "empty", "empty", "empty", "empty"]]
    ];
    let extraMenus = [
      ["extra", ["pinUnpinTab", "copyURLToIdentifier", "copyPageURL",
                 "loadPageInNewPrivateWindow", "newPrivateWindow"]],
      ["extraAlt1", ["toggleFullscreen", "takeTabScreenshot",
                     "findAndHighlightSelection", "removeHighlight",
                     "enterReaderMode"]],
      ["extraAlt2", ["zoomReset", "zoomOut", "zoomIn", "savePageAs",
                     "printPage"]]
    ];
    
    this._setBoolPref(aPrefsMap, "menus.mainAlt1Enabled", true);
    this._setBoolPref(aPrefsMap, "menus.mainAlt2Enabled", false);
    this._setBoolPref(aPrefsMap, "menus.extraAlt1Enabled", true);
    this._setBoolPref(aPrefsMap, "menus.extraAlt2Enabled", false);
    nonExtraMenus.forEach(function([menuName, actions]) {
      this._setArrayPref(aPrefsMap, "menus." + menuName, actions,
                         checkPossibleNonExtraMenuValues);
    }, this);
    extraMenus.forEach(function([menuName, actions]) {
      this._setArrayPref(aPrefsMap, "menus." + menuName, actions,
                         checkPossibleExtraMenuValues);
    }, this);
  },
  
  _getDefaultPrefsMap: function(platformOS) {
    function setIntPref(aPrefsMap, prefName, prefValue, possibleValues) {
      aPrefsMap.set(prefName, new IntPref(prefName, prefValue, possibleValues));
    }
    
    function checkPossibleLoadURLValues(newPrefValue) {
      return newPrefValue.length === 3 && typeof newPrefValue[0] === "string" &&
             typeof newPrefValue[1] === "string" &&
             typeof newPrefValue[2] === "boolean";
    }
    
    function checkPossibleRunScriptValues(newPrefValue) {
      return newPrefValue.length === 2 && typeof newPrefValue[0] === "string" &&
             typeof newPrefValue[1] === "string";
    }
    
    let defaultPrefs = new Map();
    this._setBoolPref(defaultPrefs, "general.startupTips", true);
    setIntPref(defaultPrefs, "general.tipNumber", -1);
    
    if (platformOS !== "mac") {
      setIntPref(defaultPrefs, "activation.showButton", 1); // middle button
      setIntPref(defaultPrefs, "activation.showKey", 0, [0, 16, 17]); // no key
      setIntPref(defaultPrefs, "activation.preventOpenKey", 17, [0, 17, 18]); // ctrl key
    }
    else {
      // mac users need different defaults
      setIntPref(defaultPrefs, "activation.showButton", 0); // left button
      setIntPref(defaultPrefs, "activation.showKey", 16, [0, 16, 17]); // shift key
      setIntPref(defaultPrefs, "activation.preventOpenKey", 0, [0, 17, 18]);
    }
    
    setIntPref(defaultPrefs, "activation.showAltButton", 2); // right button
    setIntPref(defaultPrefs, "activation.contextKey", 18, [0, 17, 18]); // alt key
    this._setBoolPref(defaultPrefs, "activation.contextShowAuto", false);
    
    this._setBoolPref(defaultPrefs, "appearance.darkTheme", false);
    this._setBoolPref(defaultPrefs, "appearance.largeMenu", false);
    this._setBoolPref(defaultPrefs, "appearance.smallIcons", false);
    setIntPref(defaultPrefs, "appearance.menuOpacity", 100);
    
    this._setBoolPref(defaultPrefs, "behavior.showTooltips", true);
    setIntPref(defaultPrefs, "behavior.tooltipsDelay", 1000);
    this._setBoolPref(defaultPrefs, "behavior.moveAuto", false);
    this._setBoolPref(defaultPrefs, "behavior.handleLinks", true);
    setIntPref(defaultPrefs, "behavior.linksDelay", 300);
    this._setBoolPref(defaultPrefs, "behavior.handleLinksAsOpenLink", false);
    
    this._addDefaultMenusMap(defaultPrefs);
    
    this._setStringPref(defaultPrefs, "customizations.loadURLin", "newTab",
                        function(newPrefValue) {
      return ["curTab", "newTab", "newWindow"].indexOf(newPrefValue) !== -1;
    });
    
    for (let i=1; i<=10; i++) {
      this._setArrayPref(defaultPrefs, "customizations.loadURL" + i,
                         ["", "", false], checkPossibleLoadURLValues);
      this._setArrayPref(defaultPrefs, "customizations.runScript" + i,
                         ["" , ""], checkPossibleRunScriptValues);
    }
    
    this._setStringPref(defaultPrefs, "customizations.openLink", "newTab",
                        function(newPrefValue) {
      return ["curTab", "newTab", "newWindow"].indexOf(newPrefValue) !== -1;
    });
    this._setStringPref(defaultPrefs, "customizations.dailyReadingsFolderName",
                        "", () => { return true; });
    
    return defaultPrefs;
  },
  
  _getDefaultStatsMap: function() {
    let defaultStats = new Map();
    this._setStringPref(defaultStats, "stats.lastReset",
                        (new Date()).toISOString(), function(newPrefValue) {
      return !Number.isNaN(Date.parse(newPrefValue));
    });
    this._setStringPref(defaultStats, "stats.mainMenu",
                        JSON.stringify(Array(30).fill(0)),
                        function(newPrefValue) {
      let statsMainMenuArray = JSON.parse(newPrefValue);
      return Array.isArray(statsMainMenuArray) &&
             statsMainMenuArray.length === 30 &&
             statsMainMenuArray.every(function(element) {
               return Number.isInteger(element);
             });
    });
    this._setStringPref(defaultStats, "stats.extraMenu",
                        JSON.stringify(Array(15).fill(0)),
                        function(newPrefValue) {
      let statsExtraMenuArray = JSON.parse(newPrefValue);
      return Array.isArray(statsExtraMenuArray) &&
             statsExtraMenuArray.length === 15 &&
             statsExtraMenuArray.every(function(element) {
               return Number.isInteger(element);
             });
    });
    
    let actionsStats = {};
    for (let action in eGActions) {
      actionsStats[action] = 0;
    }
    this._setStringPref(defaultStats, "stats.actions",
                        JSON.stringify(actionsStats), function(newPrefValue) {
      let statsActionsObject = JSON.parse(newPrefValue);
      let result = statsActionsObject instanceof Object &&
                   !(statsActionsObject instanceof Array);
      let statsActions = Object.getOwnPropertyNames(statsActionsObject).sort();
      let actions = Object.getOwnPropertyNames(eGActions).sort();
      let i = 0;
      result = result && statsActions.length === actions.length;
      while (result && i < statsActions.length) {
        result = result && statsActions[i] === actions[i] &&
                 Number.isInteger(statsActionsObject[statsActions[i]]);
        ++i;
      }
      return result;
    });
    
    return defaultStats;
  },
  
  exportPrefsToString: function() {
    return browser.storage.local.get().then(prefs => {
      let result = [];
      for (let key in prefs) {
        result.push([key, prefs[key]]);
      }
      return JSON.stringify(result);
    });
  },
  
  importPrefsFromString: function(aString) {
    let newPrefs;
    try {
      newPrefs = JSON.parse(aString);
    }
    catch (syntaxErrorException) {}
    if (newPrefs === undefined || !Array.isArray(newPrefs)) {
      throw { code: "invalidFileContent" };
    }
    let anArrayOfArrays = newPrefs.every(function(element) {
      return Array.isArray(element) && element.length === 2;
    });
    if (newPrefs.length === 0 || !anArrayOfArrays) {
      throw { code: "invalidFileContent" };
    }
    
    return browser.runtime.getPlatformInfo().then(platformInfo => {
      let prefs = this._getDefaultPrefsMap(platformInfo.os);
      let stats = this._getDefaultStatsMap();
      let notImportedPrefs = [];
      newPrefs.forEach(function([prefName, prefValue]) {
        try {
          if (prefs.has(prefName)) {
            prefs.get(prefName).updateTo(prefValue);
          }
          else if (stats.has(prefName)) {
            stats.get(prefName).updateTo(prefValue);
          }
          else {
            notImportedPrefs.push(prefName);
          }
        }
        catch (exception) {
          notImportedPrefs.push(prefName);
        }
      });
      
      let setPreferencePromises = [];
      prefs.forEach(function(pref) {
        setPreferencePromises.push(pref.setPreference());
      });
      stats.forEach(function(stat) {
        setPreferencePromises.push(stat.setPreference());
      });
      
      return Promise.all(setPreferencePromises).then(() => {
        return notImportedPrefs.length === 0 ? undefined : {
          code: "nonImportedPrefs",
          prefs: notImportedPrefs.join(", ")
        };
      });
    });
  },
  
  setDefaultSettings: function() {
    return browser.runtime.getPlatformInfo().then(platformInfo => {
      let defaultPrefsMap = this._getDefaultPrefsMap(platformInfo.os);
      let setPreferencePromises = [];
      defaultPrefsMap.forEach(function(pref) {
        setPreferencePromises.push(pref.setPreference());
      });
      return Promise.all(setPreferencePromises);
    });
  },
  
  setDefaultMenus: function() {
    let defaultMenusPrefsMap = new Map();
    this._addDefaultMenusMap(defaultMenusPrefsMap);
    let setPreferencePromises = [];
    defaultMenusPrefsMap.forEach(function(pref) {
      setPreferencePromises.push(pref.setPreference());
    });
    return Promise.all(setPreferencePromises);
  },
  
  initializeStats: function() {
    let defaultStatsMap = this._getDefaultStatsMap();
    let setPreferencePromises = [];
    defaultStatsMap.forEach(function(pref) {
      setPreferencePromises.push(pref.setPreference());
    });
    return Promise.all(setPreferencePromises);
  },
  
  getPref: function(aPrefName) {
    return browser.storage.local.get(aPrefName).then(prefObject => {
      return prefObject[aPrefName];
    });
  },
  
  getMenuPrefAsArray: function(aPrefName) {
    return browser.storage.local.get(aPrefName).then(prefObject => {
      return prefObject[aPrefName];
    });
  },
  
  toggleBoolPref: function(aPrefName) {
    browser.storage.local.get(aPrefName).then(prefObject => {
      this.setPref(aPrefName, !prefObject[aPrefName]);
    });
  },
  
  setPref: function(aPrefName, prefValue) {
    let prefObject = {};
    prefObject[aPrefName] = prefValue;
    browser.storage.local.set(prefObject);
  },
  
  setMenuPref: function(aPrefName, prefValueAsArray) {
    let prefObject = {};
    prefObject[aPrefName] = prefValueAsArray;
    browser.storage.local.set(prefObject);
  },
  
  areStartupTipsOn: function() {
    return this.getPref("general.startupTips");
  },
  
  toggleStartupTips: function() {
    this.areStartupTipsOn().then(prefValue => {
      browser.storage.local.set({
        "general.startupTips": !prefValue
      });
    });
  },
  
  getTipNumberPref: function() {
    return this.getPref("general.tipNumber");
  },
  
  setTipNumberPref: function(anInteger) {
    browser.storage.local.set({
      "general.tipNumber": anInteger
    });
  },
  
  isDarkThemeOn: function() {
    return this.getPref("appearance.darkTheme");
  },
  
  isLargeMenuOn: function() {
    return this.getPref("appearance.largeMenu");
  },
  
  areTooltipsOn: function() {
    return this.getPref("behavior.showTooltips");
  },
  
  isHandleLinksOn: function() {
    return this.getPref("behavior.handleLinks");
  },
  
  isMainAlt1MenuEnabled: function() {
    return this.getPref("menus.mainAlt1Enabled");
  },
  
  isMainAlt2MenuEnabled: function() {
    return this.getPref("menus.mainAlt2Enabled");
  },
  
  isExtraAlt1MenuEnabled: function() {
    return this.getPref("menus.extraAlt1Enabled");
  },
  
  isExtraAlt2MenuEnabled: function() {
    return this.getPref("menus.extraAlt2Enabled");
  },
  
  getLoadURLInPref: function() {
    // execute 'Load URL' action in current tab = 'curTab' or new tab = 'newTab' or new window = 'newWindow'
    return this.getPref("customizations.loadURLin");
  },
  
  getLoadURLOrRunScriptPrefValue: function(aPrefName) {
    return this.getPref("customizations." + aPrefName);
  },
  
  setLoadURLOrRunScriptPrefValue: function(aPrefName, aPrefValueAsArray) {
    let prefObject = {};
    prefObject[aPrefName] = aPrefValueAsArray;
    browser.storage.local.set(prefObject);
  },
  
  getOpenLinkPref: function() {
    return this.getPref("customizations.openLink");
  },
  
  getDailyReadingsFolderName: function() {
    return this.getPref("customizations.dailyReadingsFolderName");
  },
  
  setDailyReadingsFolderName: function(prefValue) {
    browser.storage.local.set({
      "customizations.dailyReadingsFolderName": prefValue
    });
  },
  
  getStatsLastResetPref: function() {
    return this.getPref("stats.lastReset").then(prefValue => {
      return (new Date(prefValue)).toLocaleString();
    });
  },
  
  getStatsMainMenuPref: function() {
    return this.getPref("stats.mainMenu").then(prefValue => {
      return JSON.parse(prefValue);
    });
  },
  
  incrementStatsMainMenuPref: function(anIndex) {
    this.getStatsMainMenuPref().then(anArray => {
      ++anArray[anIndex];
      browser.storage.local.set({
        "stats.mainMenu": JSON.stringify(anArray)
      });
    });
  },
  
  getStatsExtraMenuPref: function() {
    return this.getPref("stats.extraMenu").then(prefValue => {
      return JSON.parse(prefValue);
    });
  },
  
  incrementStatsExtraMenuPref: function(anIndex) {
    this.getStatsExtraMenuPref().then(anArray => {
      ++anArray[anIndex];
      browser.storage.local.set({
        "stats.extraMenu": JSON.stringify(anArray)
      });
    });
  },
  
  incrementNoStats: function() {},
  
  updateStatsForAction: function(anActionName) {
    this.getPref("stats.actions").then(prefValue => {
      let actionsStats = JSON.parse(prefValue);
      ++actionsStats[anActionName];
      browser.storage.local.set({
        "stats.actions": JSON.stringify(actionsStats)
      });
    });
  },
  
  getStatsActionsPref: function() {
    return this.getPref("stats.actions").then(prefValue => {
      return JSON.parse(prefValue);
    });
  },
  
  _updateActions: function(actionsToRemove, actionsToAdd, actionsToRename) {
    return this.getPref("stats.actions").then(prefValue => {
      let actionsStats = JSON.parse(prefValue);
      actionsToRemove.forEach(actionName => {
        delete actionsStats[actionName];
      });
      actionsToAdd.forEach(actionName => {
        actionsStats[actionName] = 0;
      });
      actionsToRename.forEach(actionTuple => {
        actionsStats[actionTuple[1]] = actionsStats[actionTuple[0]];
        delete actionsStats[actionTuple[0]];
      });
      return browser.storage.local.set({
        "stats.actions": JSON.stringify(actionsStats)
      });
    });
  },
  
  updateToV5_3: function() {
    let actionsToRemove = [
      "autoscrolling", "viewPageInfo", "focusLocationBar", "quit", "restart",
      "firefoxPreferences", "addOns", "undo", "redo"
    ];
    let actionsToAdd = [
      "copyPageURL", "copyURLToIdentifier", "moveTabToNewWindow",
      "loadURLInNewPrivateWindow", "bookmarkThisIdentifier",
      "removeBookmarkToThisPage", "removeBookmarkToThisIdentifier",
      "removeBookmarkToThisLink"
    ];
    let promises = [];
    promises.push(browser.storage.local.get([
      "menus.main", "menus.mainAlt1", "menus.mainAlt2", "menus.extra",
      "menus.extraAlt1", "menus.extraAlt2", "menus.contextLink",
      "menus.contextImage", "menus.contextSelection", "menus.contextTextbox"
    ]).then(prefs => {
      for (let pref in prefs) {
        let prefArray = prefs[pref].split("/");
        for (let i=0; i < prefArray.length; ++i) {
          if (actionsToRemove.includes(prefArray[i])) {
            prefArray[i] = "empty";
          }
        }
        prefs[pref] = prefArray.join("/");
      }
      return browser.storage.local.set(prefs);
    }));
    promises.push(this._updateActions(actionsToRemove, actionsToAdd, []));
    promises.push(browser.storage.local.remove([
      "behavior.autoscrollingOn", "behavior.autoscrollingDelay"
    ]));
    return Promise.all(promises);
  },
  
  updateToV5_4: function() {
    let actionsToRemove = [
      "showBookmarks", "toggleBookmarksSidebar", "toggleBookmarksToolbar",
      "showHistory", "toggleHistorySidebar", "showDownloads"
    ];
    let actionsToRename = [
      ["toggleFindBar", "findAndHighlightSelection"],
      ["loadURLInNewPrivateWindow", "loadPageInNewPrivateWindow"],
      ["prevTab", "previousTab"], ["bookmarkOpenTabs", "bookmarkAllTabs"]
    ];
    let actionsToAdd = [
      "showPrintPreview", "loadPageInNewTab", "removeHighlight",
      "enterReaderMode", "takeTabScreenshot"
    ];
    let promises = [];
    promises.push(browser.storage.local.get([
      "menus.main", "menus.mainAlt1", "menus.mainAlt2", "menus.extra",
      "menus.extraAlt1", "menus.extraAlt2", "menus.contextLink",
      "menus.contextImage", "menus.contextSelection", "menus.contextTextbox"
    ]).then(prefs => {
      for (let pref in prefs) {
        for (let i = 0; i < actionsToRename.length; ++i) {
          prefs[pref] = prefs[pref].replace(actionsToRename[i][0],
                                            actionsToRename[i][1]);
        }
      }
      return browser.storage.local.set(prefs);
    }));
    promises.push(this._updateActions(actionsToRemove, actionsToAdd,
                                      actionsToRename));
    return Promise.all(promises);
  },
  
  updateToV6_2: function() {
    let promises = [];
    let prefsToRename = [
      "behavior.largeMenu", "behavior.smallIcons", "behavior.menuOpacity"
    ];
    promises.push(browser.storage.local.set({
      "appearance.darkTheme": false
    }));
    promises.push(browser.storage.local.get(prefsToRename).then(prefs => {
      let newPrefs = {};
      for (let pref in prefs) {
        newPrefs[pref.replace("behavior", "appearance")] = prefs[pref];
      }
      return browser.storage.local.set(newPrefs);
    }));
    promises.push(browser.storage.local.remove(prefsToRename));
    return Promise.all(promises);
  },
  
  updateToV6_3: function() {
    let promises = [];
    promises.push(this.getPref("stats.actions").then(prefValue => {
      let actionsStats = JSON.parse(prefValue);
      actionsStats.toggleFullscreenWindow = actionsStats.toggleFullscreen;
      actionsStats.toggleFullscreen = 0;
      return browser.storage.local.set({
        "stats.actions": JSON.stringify(actionsStats)
      });
    }));
    promises.push(browser.storage.local.get(["customizations.loadURL1",
      "customizations.loadURL2", "customizations.loadURL3",
      "customizations.loadURL4", "customizations.loadURL5",
      "customizations.loadURL6", "customizations.loadURL7",
      "customizations.loadURL8", "customizations.loadURL9",
      "customizations.loadURL10", "customizations.runScript1",
      "customizations.runScript2", "customizations.runScript3",
      "customizations.runScript4", "customizations.runScript5",
      "customizations.runScript6", "customizations.runScript7",
      "customizations.runScript8", "customizations.runScript9",
      "customizations.runScript10"
    ]).then(prefs => {
      for (let key in prefs) {
        let prefArray = prefs[key].split("\u2022");
        prefArray.splice(2, 1);
        if (prefArray[2] !== undefined) {
          prefArray[2] = prefArray[2] === "true";
        }
        prefs[key] = prefArray;
      }
      return browser.storage.local.set(prefs);
    }));
    promises.push(browser.storage.local.get(["menus.main", "menus.mainAlt1",
      "menus.mainAlt2", "menus.extra", "menus.extraAlt1", "menus.extraAlt2",
      "menus.contextLink", "menus.contextImage", "menus.contextSelection",
      "menus.contextTextbox"
    ]).then(prefs => {
      for (let key in prefs) {
        prefs[key] = prefs[key].split("/");
      }
      return browser.storage.local.set(prefs);
    }));
    return Promise.all(promises);
  }
};
