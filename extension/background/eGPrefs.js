/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

/* exported eGPrefs */
/* global browser, eGActions */

"use strict";

class Pref {
  constructor(name, value) {
    this.name = name;
    this.value = value;
  }
  
  updateTo(newPrefValue) {
    if (this.isNewValuePossible(newPrefValue)) {
      this.value = newPrefValue;
    }
    else {
      throw "";
    }
  }
  
  setPreference() {
    let prefObject = {};
    prefObject[this.name] = this.value;
    return browser.storage.local.set(prefObject);
  }
}

class BoolPref extends Pref {
  isNewValuePossible(newPrefValue) {
    return typeof newPrefValue === "boolean";
  }
}

class IntPref extends Pref {
  constructor(name, value, possibleValuesArray) {
    super(name, value);
    this.possibleValuesArray = possibleValuesArray;
  }
  
  isNewValuePossible(newPrefValue) {
    return Number.isInteger(newPrefValue) &&
           (this.possibleValuesArray === undefined ||
            this.possibleValuesArray.indexOf(newPrefValue) !== -1);
  }
}

class PrefWithValidationFunction extends Pref {
  constructor(name, value, isPossibleValue) {
    super(name, value);
    this.isPossibleValue = isPossibleValue;
  }
}

class StringPref extends PrefWithValidationFunction {
  isNewValuePossible(newPrefValue) {
    return typeof newPrefValue === "string" && this.isPossibleValue(newPrefValue);
  }
}

class ArrayPref extends PrefWithValidationFunction {
  isNewValuePossible(newPrefValue) {
    return Array.isArray(newPrefValue) && this.isPossibleValue(newPrefValue);
  }
}

class ObjectPref extends PrefWithValidationFunction {
  isNewValuePossible(newPrefValue) {
    return newPrefValue instanceof Object && !(newPrefValue instanceof Array) &&
           this.isPossibleValue(newPrefValue);
  }
}

let eGPrefs = {
  _setBoolPref(aPrefsMap, prefName, prefValue) {
    aPrefsMap.set(prefName, new BoolPref(prefName, prefValue));
  },
  
  _setArrayPref(aPrefsMap, prefName, prefValue, isPossibleValue) {
    aPrefsMap.set(prefName,
                  new ArrayPref(prefName, prefValue, isPossibleValue));
  },
  
  _setStringPref(aPrefsMap, prefName, prefValue, isPossibleValue) {
    aPrefsMap.set(prefName,
                  new StringPref(prefName, prefValue, isPossibleValue));
  },
  
  _addDefaultMenusMap(aPrefsMap) {
    function checkPossibleMenuValues(numberOfActions, newPrefValue) {
      return newPrefValue.length === numberOfActions &&
             newPrefValue.every(element => element in eGActions);
    }
    
    function checkPossibleNonExtraMenuValues(newPrefValue) {
      return checkPossibleMenuValues(10, newPrefValue);
    }
    
    function checkPossibleExtraMenuValues(newPrefValue) {
      return checkPossibleMenuValues(5, newPrefValue);
    }
    
    let nonExtraMenus = [
      ["main", ["nextTab", "goToTop", "showExtraMenu", "newTab", "back",
                "empty", "closeTab", "reload", "previousTab", "empty"]],
      ["mainAlt1", ["forward", "loadPageInNewTab", "showExtraMenu",
                    "undoCloseTab", "bookmarkThisPage", "empty", "goToBottom",
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
    nonExtraMenus.forEach(([menuName, actions]) => {
      this._setArrayPref(aPrefsMap, `menus.${menuName}`, actions,
                         checkPossibleNonExtraMenuValues);
    });
    extraMenus.forEach(([menuName, actions]) => {
      this._setArrayPref(aPrefsMap, `menus.${menuName}`, actions,
                         checkPossibleExtraMenuValues);
    });
  },
  
  _getDefaultPrefsMap(platformOS) {
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
                        newPrefValue => {
      return ["curTab", "newTab", "newWindow"].indexOf(newPrefValue) !== -1;
    });
    
    for (let i=1; i<=10; i++) {
      this._setArrayPref(defaultPrefs, `customizations.loadURL${i}`,
                         ["", "", false], checkPossibleLoadURLValues);
      this._setArrayPref(defaultPrefs, `customizations.runScript${i}`,
                         ["" , ""], checkPossibleRunScriptValues);
    }
    
    this._setStringPref(defaultPrefs, "customizations.openLink", "newTab",
                        newPrefValue => {
      return ["curTab", "newTab", "newWindow"].indexOf(newPrefValue) !== -1;
    });
    this._setStringPref(defaultPrefs, "customizations.dailyReadingsFolderName",
                        "", () => true);
    
    return defaultPrefs;
  },
  
  _getDefaultUsageMap() {
    let defaultUsage = new Map();
    this._setStringPref(defaultUsage, "usage.lastReset",
                        (new Date()).toISOString(), newPrefValue => {
      return !Number.isNaN(Date.parse(newPrefValue));
    });
    this._setArrayPref(defaultUsage, "usage.mainMenu", Array(30).fill(0),
                       newPrefValue => {
      return Array.isArray(newPrefValue) && newPrefValue.length === 30 &&
             newPrefValue.every(element => Number.isInteger(element));
    });
    this._setArrayPref(defaultUsage, "usage.extraMenu", Array(15).fill(0),
                       newPrefValue => {
      return Array.isArray(newPrefValue) && newPrefValue.length === 15 &&
             newPrefValue.every(element => Number.isInteger(element));
    });
    
    let actionsUsage = {};
    for (let action in eGActions) {
      actionsUsage[action] = 0;
    }
    defaultUsage.set("usage.actions",
                     new ObjectPref("usage.actions", actionsUsage,
                                    newPrefValue => {
      let usageActions = Object.getOwnPropertyNames(newPrefValue).sort();
      let actions = Object.getOwnPropertyNames(eGActions).sort();
      let i = 0;
      let result = usageActions.length === actions.length;
      while (result && i < usageActions.length) {
        result = result && usageActions[i] === actions[i] &&
                 Number.isInteger(newPrefValue[usageActions[i]]);
        ++i;
      }
      return result;
    }));
    
    return defaultUsage;
  },
  
  exportPrefsToString() {
    return browser.storage.local.get().then(prefs => {
      let result = [];
      for (let key in prefs) {
        result.push([key, prefs[key]]);
      }
      return JSON.stringify(result);
    });
  },
  
  importPrefsFromString(aString) {
    let newPrefs;
    try {
      newPrefs = JSON.parse(aString);
    }
    catch (syntaxErrorException) {}
    if (newPrefs === undefined || !Array.isArray(newPrefs)) {
      throw { code: "invalidFileContent" };
    }
    let anArrayOfArrays = newPrefs.every(element => {
      return Array.isArray(element) && element.length === 2;
    });
    if (newPrefs.length === 0 || !anArrayOfArrays) {
      throw { code: "invalidFileContent" };
    }
    
    return browser.runtime.getPlatformInfo().then(platformInfo => {
      let prefs = this._getDefaultPrefsMap(platformInfo.os);
      let usage = this._getDefaultUsageMap();
      let notImportedPrefs = [];
      newPrefs.forEach(([prefName, prefValue]) => {
        try {
          if (prefs.has(prefName)) {
            prefs.get(prefName).updateTo(prefValue);
          }
          else if (usage.has(prefName)) {
            usage.get(prefName).updateTo(prefValue);
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
      prefs.forEach(pref => setPreferencePromises.push(pref.setPreference()));
      usage.forEach(usageItem => {
        setPreferencePromises.push(usageItem.setPreference());
      });
      
      return Promise.all(setPreferencePromises).then(() => {
        return notImportedPrefs.length === 0 ? undefined : {
          code: "nonImportedPrefs",
          prefs: notImportedPrefs.join(", ")
        };
      });
    });
  },
  
  setDefaultSettings() {
    return browser.runtime.getPlatformInfo().then(platformInfo => {
      let defaultPrefsMap = this._getDefaultPrefsMap(platformInfo.os);
      let setPreferencePromises = [];
      defaultPrefsMap.forEach(pref => {
        setPreferencePromises.push(pref.setPreference());
      });
      return Promise.all(setPreferencePromises);
    });
  },
  
  setDefaultMenus() {
    let defaultMenusPrefsMap = new Map();
    this._addDefaultMenusMap(defaultMenusPrefsMap);
    let setPreferencePromises = [];
    defaultMenusPrefsMap.forEach(pref => {
      setPreferencePromises.push(pref.setPreference());
    });
    return Promise.all(setPreferencePromises);
  },
  
  initializeUsageData() {
    let defaultUsageMap = this._getDefaultUsageMap();
    let setPreferencePromises = [];
    defaultUsageMap.forEach(pref => {
      setPreferencePromises.push(pref.setPreference());
    });
    return Promise.all(setPreferencePromises);
  },
  
  getPref(aPrefName) {
    return browser.storage.local.get(aPrefName).then(prefObject => {
      return prefObject[aPrefName];
    });
  },
  
  toggleBoolPref(aPrefName) {
    browser.storage.local.get(aPrefName).then(prefObject => {
      this.setPref(aPrefName, !prefObject[aPrefName]);
    });
  },
  
  setPref(aPrefName, prefValue) {
    let prefObject = {};
    prefObject[aPrefName] = prefValue;
    browser.storage.local.set(prefObject);
  },
  
  areStartupTipsOn() {
    return this.getPref("general.startupTips");
  },
  
  toggleStartupTips() {
    this.areStartupTipsOn().then(prefValue => {
      browser.storage.local.set({
        "general.startupTips": !prefValue
      });
    });
  },
  
  getTipNumberPref() {
    return this.getPref("general.tipNumber");
  },
  
  setTipNumberPref(anInteger) {
    browser.storage.local.set({
      "general.tipNumber": anInteger
    });
  },
  
  isDarkThemeOn() {
    return this.getPref("appearance.darkTheme");
  },
  
  isLargeMenuOn() {
    return this.getPref("appearance.largeMenu");
  },
  
  areTooltipsOn() {
    return this.getPref("behavior.showTooltips");
  },
  
  isHandleLinksOn() {
    return this.getPref("behavior.handleLinks");
  },
  
  isMainAlt1MenuEnabled() {
    return this.getPref("menus.mainAlt1Enabled");
  },
  
  isMainAlt2MenuEnabled() {
    return this.getPref("menus.mainAlt2Enabled");
  },
  
  isExtraAlt1MenuEnabled() {
    return this.getPref("menus.extraAlt1Enabled");
  },
  
  isExtraAlt2MenuEnabled() {
    return this.getPref("menus.extraAlt2Enabled");
  },
  
  getLoadURLInPref() {
    // execute 'Load URL' action in current tab = 'curTab' or new tab = 'newTab' or new window = 'newWindow'
    return this.getPref("customizations.loadURLin");
  },
  
  getLoadURLOrRunScriptPrefValue(aPrefName) {
    return this.getPref(`customizations.${aPrefName}`);
  },
  
  getOpenLinkPref() {
    return this.getPref("customizations.openLink");
  },
  
  getDailyReadingsFolderName() {
    return this.getPref("customizations.dailyReadingsFolderName");
  },
  
  setDailyReadingsFolderName(prefValue) {
    browser.storage.local.set({
      "customizations.dailyReadingsFolderName": prefValue
    });
  },
  
  getUsageLastResetPref() {
    return this.getPref("usage.lastReset").then(prefValue => {
      return (new Date(prefValue)).toLocaleString();
    });
  },
  
  getUsageMainMenuPref() {
    return this.getPref("usage.mainMenu");
  },
  
  incrementUsageMainMenuPref(anIndex) {
    this.getUsageMainMenuPref().then(anArray => {
      ++anArray[anIndex];
      browser.storage.local.set({
        "usage.mainMenu": anArray
      });
    });
  },
  
  getUsageExtraMenuPref() {
    return this.getPref("usage.extraMenu");
  },
  
  incrementUsageExtraMenuPref(anIndex) {
    this.getUsageExtraMenuPref().then(anArray => {
      ++anArray[anIndex];
      browser.storage.local.set({
        "usage.extraMenu": anArray
      });
    });
  },
  
  incrementNoUsage() {},
  
  updateUsageForAction(anActionName) {
    this.getPref("usage.actions").then(actionsUsage => {
      ++actionsUsage[anActionName];
      browser.storage.local.set({
        "usage.actions": actionsUsage
      });
    });
  },
  
  getUsageActionsPref() {
    return this.getPref("usage.actions");
  },
  
  _updateActions(actionsToRemove, actionsToAdd, actionsToRename) {
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
  
  _renameActions(actionsToRename) {
    function newActionNameForAction(actionName) {
      return actionsToRename[actionName] === undefined ?
               actionName :
               actionsToRename[actionName];
    }
    
    let promises = [];
    promises.push(this.getPref("usage.actions").then(prefValue => {
      for (let action in actionsToRename) {
        prefValue[actionsToRename[action]] = prefValue[action];
        delete prefValue[action];
      }
      return browser.storage.local.set({
        "usage.actions": prefValue
      });
    }));
    promises.push(browser.storage.local.get(["menus.main", "menus.mainAlt1",
      "menus.mainAlt2", "menus.extra", "menus.extraAlt1", "menus.extraAlt2",
      "menus.contextLink", "menus.contextImage", "menus.contextSelection",
      "menus.contextTextbox"
    ]).then(prefs => {
      for (let key in prefs) {
        prefs[key] = prefs[key].map(newActionNameForAction);
      }
      return browser.storage.local.set(prefs);
    }));
    return promises;
  },
  
  _addActions(actionsToAdd) {
    return this.getPref("usage.actions").then(prefValue => {
      actionsToAdd.forEach(actionName => prefValue[actionName] = 0);
      return browser.storage.local.set({
        "usage.actions": prefValue
      });
    });
  },
  
  updateToV5_3() {
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
  
  updateToV5_4() {
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
  
  updateToV6_2() {
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
  
  updateToV6_3() {
    let promises = [];
    promises.push(this.getPref("stats.actions").then(prefValue => {
      let actionsStats = JSON.parse(prefValue);
      actionsStats.toggleFullscreenWindow = actionsStats.toggleFullscreen;
      actionsStats.toggleFullscreen = 0;
      return browser.storage.local.set({
        "stats.actions": actionsStats
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
    promises.push(browser.storage.local.get([
      "stats.mainMenu", "stats.extraMenu"
    ]).then(prefs => {
      for (let key in prefs) {
        prefs[key] = JSON.parse(prefs[key]);
      }
      return browser.storage.local.set(prefs);
    }));
    return Promise.all(promises);
  },
  
  async updateToV6_5() {
    let prefsToRename = [
      "stats.lastReset", "stats.actions", "stats.mainMenu", "stats.extraMenu"
    ];
    await browser.storage.local.get(prefsToRename).then(prefs => {
      let newPrefs = {};
      for (let pref in prefs) {
        newPrefs[pref.replace("stats", "usage")] = prefs[pref];
      }
      return browser.storage.local.set(newPrefs);
    });
    await browser.storage.local.remove(prefsToRename);
    
    let promises = this._renameActions({
      "pageTop": "goToTop",
      "pageBottom": "goToBottom"
    });
    
    promises.push(this._addActions(["savePageAsPDF"]));
    
    return Promise.all(promises);
  }
};
