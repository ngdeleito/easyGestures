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

The Original Code is easyGestures.

The Initial Developer of the Original Code is Ons Besbes.

Contributor(s):
  ngdeleito

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


/* exported EXPORTED_SYMBOLS, eGPrefs */
/* global Components, Services, eGActions */

var EXPORTED_SYMBOLS = ["eGPrefs"];

Components.utils.import("resource://gre/modules/Services.jsm");

function Pref(name, value) {
  this.name = name;
  this.value = value;
}

function BoolPref(name, value) {
  Pref.call(this, name, value);
}
BoolPref.prototype = Object.create(Pref.prototype);
BoolPref.prototype.constructor = BoolPref;
BoolPref.prototype.setPreference = function(prefsBranch) {
  prefsBranch.setBoolPref(this.name, this.value);
};
BoolPref.prototype.updateTo = function(newPrefValue) {
  if (typeof newPrefValue === "boolean") {
    this.value = newPrefValue;
  }
  else {
    throw "";
  }
};

function IntPref(name, value, possibleValuesArray) {
  Pref.call(this, name, value);
  this.possibleValuesArray = possibleValuesArray;
}
IntPref.prototype = Object.create(Pref.prototype);
IntPref.prototype.constructor = IntPref;
IntPref.prototype.setPreference = function(prefsBranch) {
  prefsBranch.setIntPref(this.name, this.value);
};
IntPref.prototype.updateTo = function(newPrefValue) {
  if (Number.isInteger(newPrefValue) &&
      (this.possibleValuesArray === undefined ||
       this.possibleValuesArray.indexOf(newPrefValue) !== -1)) {
    this.value = newPrefValue;
  }
  else {
    throw "";
  }
};

function CharPref(name, value, isPossibleValue) {
  Pref.call(this, name, value);
  this.isPossibleValue = isPossibleValue;
}
CharPref.prototype = Object.create(Pref.prototype);
CharPref.prototype.constructor = CharPref;
CharPref.prototype.setPreference = function(prefsBranch) {
  prefsBranch.setCharPref(this.name, this.value);
};
CharPref.prototype.updateTo = function(newPrefValue) {
  if (typeof newPrefValue === "string" &&
      this.isPossibleValue(this.name, newPrefValue)) {
    this.value = newPrefValue;
  }
  else {
    throw "";
  }
};

function ComplexPref(name, value, isPossibleValue) {
  Pref.call(this, name, value);
  this.isPossibleValue = isPossibleValue;
}
ComplexPref.prototype = Object.create(Pref.prototype);
ComplexPref.prototype.constructor = ComplexPref;
ComplexPref.prototype.setPreference = function(prefsBranch) {
  var string = Components.classes["@mozilla.org/supports-string;1"]
                 .createInstance(Components.interfaces.nsISupportsString);
  string.data = this.value;
  prefsBranch.setComplexValue(this.name,
                              Components.interfaces.nsISupportsString, string);
};
ComplexPref.prototype.updateTo = function(newPrefValue) {
  if (typeof newPrefValue === "string" && this.isPossibleValue(newPrefValue)) {
    this.value = newPrefValue;
  }
  else {
    throw "";
  }
};

var eGPrefs = {
  _prefs : Services.prefs.getBranch("extensions.easygestures."),
  
  _setCharPref : function(defaultPrefsMap, prefName, prefValue, isPossibleValue) {
    defaultPrefsMap.set(prefName, new CharPref(prefName, prefValue, isPossibleValue));
  },
  
  _getDefaultPrefsMap : function() {
    function setBoolPref(defaultPrefsMap, prefName, prefValue) {
      defaultPrefsMap.set(prefName, new BoolPref(prefName, prefValue));
    }
    function setIntPref(defaultPrefsMap, prefName, prefValue, possibleValues) {
      defaultPrefsMap.set(prefName,
                          new IntPref(prefName, prefValue, possibleValues));
    }
    function setComplexPref(defaultPrefsMap, prefName, prefValue, isPossibleValue) {
      defaultPrefsMap.set(prefName, new ComplexPref(prefName, prefValue, isPossibleValue));
    }
    
    function setDefaultMenus(defaultPrefsMap) {
      var menus = [
        ["main",             "nextTab/pageTop/showExtraMenu/newTab/back/reload/closeTab/firstPage/backSite/bookmarkThisPage"],
        ["mainAlt1",         "forward/duplicateTab/showExtraMenu/undoCloseTab/prevTab/homepage/pageBottom/lastPage/forwardSite/pinUnpinTab"],
        ["mainAlt2",         "loadURL2/loadURL1/showExtraMenu/loadURL7/loadURL6/runScript2/loadURL5/loadURL4/loadURL3/runScript1"],
        ["extra",            "bookmarkThisPage/toggleFindBar/searchWeb/reload/homepage"],
        ["extraAlt1",        "newPrivateWindow/empty/toggleFullscreen/restart/quit"],
        ["extraAlt2",        "zoomReset/zoomOut/zoomIn/savePageAs/printPage"],
        ["contextLink",      "bookmarkThisLink/saveLinkAs/copyLink/openLink/openLinkInNewPrivateWindow/empty/empty/empty/empty/empty"],
        ["contextImage",     "empty/saveImageAs/copyImage/copyImageLocation/hideImages/empty/empty/empty/empty/empty"],
        ["contextSelection", "empty/toggleFindBar/searchWeb/cut/copy/empty/paste/empty/empty/empty"],
        ["contextTextbox",   "selectAll/redo/undo/cut/copy/empty/paste/empty/empty/empty"]
      ];
      
      menus.forEach(function([menuName, actions]) {
        eGPrefs._setCharPref(defaultPrefsMap, "menus." + menuName, actions,
                             function(prefName, newPrefValue) {
          var numberOfActions = prefName.startsWith("menus.extra") ? 5 : 10;
          var actionsArray = newPrefValue.split("/");
          if (actionsArray.length === numberOfActions) {
            return actionsArray.every(function(element) {
              return element in eGActions;
            });
          }
          else {
            return false;
          }
        });
      });
    }
    
    function checkPossibleLoadURLValues(newPrefValue) {
      var values = newPrefValue.split("\u2022");
      return values.length === 4 &&
             typeof JSON.parse(values[2]) === "boolean" &&
             typeof JSON.parse(values[3]) === "boolean";
    }
    
    function checkPossibleRunScriptValues(newPrefValue) {
      return newPrefValue.split("\u2022").length === 3;
    }
    
    Components.utils.import("chrome://easygestures/content/eGActions.jsm");
    var defaultPrefs = new Map();
    setBoolPref(defaultPrefs, "general.startupTips", true);
    setIntPref(defaultPrefs, "general.tipNumber", 0);
    
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    if (window.navigator.userAgent.indexOf("Mac") === -1) {
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
    setBoolPref(defaultPrefs, "activation.contextShowAuto", false);
    
    setBoolPref(defaultPrefs, "behavior.moveAuto", false);
    setBoolPref(defaultPrefs, "behavior.largeMenu", false);
    setIntPref(defaultPrefs, "behavior.menuOpacity", 100); // set in % but will be converted when used in style.opacity
    setBoolPref(defaultPrefs, "behavior.smallIcons", false);
    setBoolPref(defaultPrefs, "behavior.showTooltips", true);
    setIntPref(defaultPrefs, "behavior.tooltipsDelay", 1000);
    setBoolPref(defaultPrefs, "behavior.handleLinks", true);
    setIntPref(defaultPrefs, "behavior.linksDelay", 300);
    setBoolPref(defaultPrefs, "behavior.handleLinksAsOpenLink", false);
    setBoolPref(defaultPrefs, "behavior.autoscrollingOn", false);
    setIntPref(defaultPrefs, "behavior.autoscrollingDelay", 750);
    
    setBoolPref(defaultPrefs, "menus.mainAlt1Enabled", true);
    setBoolPref(defaultPrefs, "menus.mainAlt2Enabled", false);
    setBoolPref(defaultPrefs, "menus.extraAlt1Enabled", true);
    setBoolPref(defaultPrefs, "menus.extraAlt2Enabled", false);
    setDefaultMenus(defaultPrefs);
    
    this._setCharPref(defaultPrefs, "customizations.loadURLin", "newTab",
                      function(prefName, newPrefValue) {
      return ["curTab", "newTab", "newWindow"].indexOf(newPrefValue) !== -1;
    });
    
    for (let i=1; i<=10; i++) {
      setComplexPref(defaultPrefs, "customizations.loadURL" + i,
                     "\u2022\u2022false\u2022false",
                     checkPossibleLoadURLValues);
      setComplexPref(defaultPrefs, "customizations.runScript" + i,
                     "\u2022\u2022", checkPossibleRunScriptValues);
    }
    
    this._setCharPref(defaultPrefs, "customizations.openLink", "newTab",
                      function(prefName, newPrefValue) {
      return ["curTab", "newTab", "newWindow"].indexOf(newPrefValue) !== -1;
    });
    setIntPref(defaultPrefs, "customizations.dailyReadingsFolderID", -1);
    
    return defaultPrefs;
  },
  
  _getDefaultStatsMap : function() {
    Components.utils.import("chrome://easygestures/content/eGActions.jsm");
    var defaultStats = new Map();
    
    var lastResetDate = new Date();
    this._setCharPref(defaultStats, "stats.lastReset",
                      lastResetDate.toISOString(),
                      function(prefName, newPrefValue) {
      return !Number.isNaN(Date.parse(newPrefValue));
    });
    this._setCharPref(defaultStats, "stats.mainMenu",
                      "[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]",
                      function(prefName, newPrefValue) {
      var statsMainMenuArray = JSON.parse(newPrefValue);
      return Array.isArray(statsMainMenuArray) &&
             statsMainMenuArray.length === 30 &&
             statsMainMenuArray.every(function(element) {
               return Number.isInteger(element);
             });
    });
    this._setCharPref(defaultStats, "stats.extraMenu",
                      "[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]",
                      function(prefName, newPrefValue) {
      var statsExtraMenuArray = JSON.parse(newPrefValue);
      return Array.isArray(statsExtraMenuArray) &&
             statsExtraMenuArray.length === 15 &&
             statsExtraMenuArray.every(function(element) {
               return Number.isInteger(element);
             });
    });
    
    var actionsStats = {};
    for (let action in eGActions) {
      actionsStats[action] = 0;
    }
    this._setCharPref(defaultStats, "stats.actions",
                      JSON.stringify(actionsStats),
                      function(prefName, newPrefValue) {
      var statsActionsObject = JSON.parse(newPrefValue);
      var result = statsActionsObject instanceof Object &&
                   !(statsActionsObject instanceof Array);
      var statsActions = Object.getOwnPropertyNames(statsActionsObject).sort();
      var actions = Object.getOwnPropertyNames(eGActions).sort();
      var i = 0;
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
  
  exportPrefsToString : function() {
    var prefsNames = this._prefs.getChildList("");
    var result = [];
    
    prefsNames.forEach(function(prefName) {
      let prefType = this._prefs.getPrefType(prefName);
      let prefValue;
      switch (prefType) {
        case Components.interfaces.nsIPrefBranch.PREF_STRING:
          prefValue = this._prefs.getComplexValue(prefName,
                        Components.interfaces.nsISupportsString).data;
          break;
        case Components.interfaces.nsIPrefBranch.PREF_INT:
          prefValue = this._prefs.getIntPref(prefName);
          break;
        case Components.interfaces.nsIPrefBranch.PREF_BOOL:
          prefValue = this._prefs.getBoolPref(prefName);
          break;
      }
      result.push([prefName, prefValue]);
    }, this);
    return JSON.stringify(result);
  },
  
  importPrefsFromString : function(aString) {
    var newPrefs;
    try {
      newPrefs = JSON.parse(aString);
    }
    catch (syntaxErrorException) {}
    if (newPrefs === undefined || !Array.isArray(newPrefs)) {
      throw { code: "invalidFileContent" };
    }
    var anArrayOfArrays = newPrefs.every(function(element) {
      return Array.isArray(element) && element.length === 2;
    });
    if (newPrefs.length === 0 || !anArrayOfArrays) {
      throw { code: "invalidFileContent" };
    }
    
    var prefs = this._getDefaultPrefsMap();
    var stats = this._getDefaultStatsMap();
    var notImportedPrefs = [];
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
    
    prefs.forEach(function(pref) {
      pref.setPreference(this._prefs);
    }, this);
    stats.forEach(function(stat) {
      stat.setPreference(this._prefs);
    }, this);
    
    if (notImportedPrefs.length !== 0) {
      throw { code: "nonImportedPrefs", prefs: notImportedPrefs.join(", ") };
    }
  },
  
  setDefaultSettings : function() {
    var defaultPrefsMap = this._getDefaultPrefsMap();
    defaultPrefsMap.forEach(function(pref) {
      pref.setPreference(this._prefs);
    }, this);
  },
  
  initializeStats : function() {
    var defaultStats = this._getDefaultStatsMap();
    defaultStats.forEach(function(pref) {
      pref.setPreference(this._prefs);
    }, this);
  },
  
  areStartupTipsOn : function() {
    return this._prefs.getBoolPref("general.startupTips");
  },
  
  toggleStartupTips : function() {
    this._prefs.setBoolPref("general.startupTips", !this.areStartupTipsOn());
  },
  
  getTipNumberPref : function() {
    return this._prefs.getIntPref("general.tipNumber");
  },
  
  setTipNumberPref : function(anInteger) {
    return this._prefs.setIntPref("general.tipNumber", anInteger);
  },
  
  getShowButtonPref : function() {
    return this._prefs.getIntPref("activation.showButton");
  },
  
  getShowAltButtonPref : function() {
    return this._prefs.getIntPref("activation.showAltButton");
  },
  
  isLargeMenuOff : function() {
    return !this._prefs.getBoolPref("behavior.largeMenu");
  },
  
  areTooltipsOn : function() {
    return this._prefs.getBoolPref("behavior.showTooltips");
  },
  
  isHandleLinksOn : function() {
    return this._prefs.getBoolPref("behavior.handleLinks");
  },
  
  isAutoscrollingOn : function() {
    return this._prefs.getBoolPref("behavior.autoscrollingOn");
  },
  
  isMainAlt1MenuEnabled : function() {
    return this._prefs.getBoolPref("menus.mainAlt1Enabled");
  },
  
  isMainAlt2MenuEnabled : function() {
    return this._prefs.getBoolPref("menus.mainAlt2Enabled");
  },
  
  isExtraAlt1MenuEnabled : function() {
    return this._prefs.getBoolPref("menus.extraAlt1Enabled");
  },
  
  isExtraAlt2MenuEnabled : function() {
    return this._prefs.getBoolPref("menus.extraAlt2Enabled");
  },
  
  getLoadURLInPref : function() {
    // execute 'Load URL' action in current tab = 'curTab' or new tab = 'newTab' or new window = 'newWindow'
    return this._prefs.getCharPref("customizations.loadURLin");
  },
  
  getLoadURLOrRunScriptPrefValue : function(aPrefName) {
    return this._prefs.getComplexValue("customizations." + aPrefName,
      Components.interfaces.nsISupportsString).data.split("\u2022");
  },
  
  getOpenLinkPref : function() {
    return this._prefs.getCharPref("customizations.openLink");
  },
  
  getDailyReadingsFolderID : function() {
    return this._prefs.getIntPref("customizations.dailyReadingsFolderID");
  },
  
  getStatsLastResetPref : function() {
    return (new Date(this._prefs.getCharPref("stats.lastReset")))
             .toLocaleString();
  },
  
  getStatsMainMenuPref : function() {
    return JSON.parse(this._prefs.getCharPref("stats.mainMenu"));
  },
  
  incrementStatsMainMenuPref : function(anIndex) {
    var anArray = this.getStatsMainMenuPref();
    ++anArray[anIndex];
    this._prefs.setCharPref("stats.mainMenu", JSON.stringify(anArray));
  },
  
  getStatsExtraMenuPref : function() {
    return JSON.parse(this._prefs.getCharPref("stats.extraMenu"));
  },
  
  incrementStatsExtraMenuPref : function(anIndex) {
    var anArray = this.getStatsExtraMenuPref();
    ++anArray[anIndex];
    this._prefs.setCharPref("stats.extraMenu", JSON.stringify(anArray));
  },
  
  updateStatsForAction : function(anActionName) {
    var actionsStats = JSON.parse(this._prefs.getCharPref("stats.actions"));
    ++actionsStats[anActionName];
    this._prefs.setCharPref("stats.actions", JSON.stringify(actionsStats));
  },
  
  getStatsActionsPref : function() {
    return JSON.parse(this._prefs.getCharPref("stats.actions"));
  },
  
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
  }
};