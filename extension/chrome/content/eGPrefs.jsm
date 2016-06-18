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

function IntPref(name, value) {
  Pref.call(this, name, value);
}
IntPref.prototype = Object.create(Pref.prototype);
IntPref.prototype.constructor = IntPref;
IntPref.prototype.setPreference = function(prefsBranch) {
  prefsBranch.setIntPref(this.name, this.value);
};

function CharPref(name, value) {
  Pref.call(this, name, value);
}
CharPref.prototype = Object.create(Pref.prototype);
CharPref.prototype.constructor = CharPref;
CharPref.prototype.setPreference = function(prefsBranch) {
  prefsBranch.setCharPref(this.name, this.value);
};

function ComplexPref(name, value) {
  Pref.call(this, name, value);
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

var eGPrefs = {
  _prefs : Services.prefs.getBranch("extensions.easygestures."),
  
  _setCharPref : function(defaultPrefsMap, prefName, prefValue) {
    defaultPrefsMap.set(prefName, new CharPref(prefName, prefValue));
  },
  
  _getDefaultPrefsMap : function() {
    function setBoolPref(defaultPrefsMap, prefName, prefValue) {
      defaultPrefsMap.set(prefName, new BoolPref(prefName, prefValue));
    }
    function setIntPref(defaultPrefsMap, prefName, prefValue) {
      defaultPrefsMap.set(prefName, new IntPref(prefName, prefValue));
    }
    function setComplexPref(defaultPrefsMap, prefName, prefValue) {
      defaultPrefsMap.set(prefName, new ComplexPref(prefName, prefValue));
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
        eGPrefs._setCharPref(defaultPrefsMap, "menus." + menuName, actions);
      });
    }
    
    var defaultPrefs = new Map();
    setBoolPref(defaultPrefs, "general.startupTips", true);
    setIntPref(defaultPrefs, "general.tipNumber", 0);
    
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    if (window.navigator.userAgent.indexOf("Mac") === -1) {
      setIntPref(defaultPrefs, "activation.showButton", 1); // middle button
      setIntPref(defaultPrefs, "activation.showKey", 0); // no key
      setIntPref(defaultPrefs, "activation.preventOpenKey", 17); // ctrl key
    }
    else {
      // mac users need different defaults
      setIntPref(defaultPrefs, "activation.showButton", 0); // left button
      setIntPref(defaultPrefs, "activation.showKey", 16); // shift key
      setIntPref(defaultPrefs, "activation.preventOpenKey", 0);
    }
    
    setIntPref(defaultPrefs, "activation.showAltButton", 2); // right button
    setIntPref(defaultPrefs, "activation.contextKey", 18); // alt key
    setBoolPref(defaultPrefs, "activation.contextShowAuto", false);
    
    setBoolPref(defaultPrefs, "behavior.moveAuto", false);
    setBoolPref(defaultPrefs, "behavior.largeMenu", false);
    setIntPref(defaultPrefs, "behavior.menuOpacity", 100); // set in % but will be converted when used in style.opacity
    setBoolPref(defaultPrefs, "behavior.noIcons", false);
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
    
    this._setCharPref(defaultPrefs, "customizations.loadURLin", "newTab"); // execute 'load URL' action in "curTab" or "newTab" or "newWindow"
    
    for (let i=1; i<=10; i++) {
      setComplexPref(defaultPrefs, "customizations.loadURL" + i,
                     "\u2022\u2022false\u2022false");
      setComplexPref(defaultPrefs, "customizations.runScript" + i,
                     "\u2022\u2022");
    }
    
    this._setCharPref(defaultPrefs, "customizations.openLink", "newTab"); // "curTab"  or "newTab" or "newWindow"
    setIntPref(defaultPrefs, "customizations.dailyReadingsFolderID", -1);
    
    return defaultPrefs;
  },
  
  _getDefaultStatsMap : function() {
    Components.utils.import("chrome://easygestures/content/eGActions.jsm");
    var defaultStats = new Map();
    
    var lastResetDate = new Date();
    this._setCharPref(defaultStats, "stats.lastReset",
                      lastResetDate.toISOString());
    this._setCharPref(defaultStats, "stats.mainMenu",
                      "[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]");
    this._setCharPref(defaultStats, "stats.extraMenu",
                      "[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]");
    
    var actionsStats = {};
    for (let action in eGActions) {
      actionsStats[action] = 0;
    }
    this._setCharPref(defaultStats, "stats.actions",
                      JSON.stringify(actionsStats));
    
    return defaultStats;
  },
  
  exportPrefsToString : function() {
    var prefsNames = this._prefs.getChildList("");
    var result = "";
    
    prefsNames.forEach(function(prefName) {
      result += prefName + "\n";
      let prefType = this._prefs.getPrefType(prefName);
      result +=  prefType + "\n";
      switch (prefType) {
        case Components.interfaces.nsIPrefBranch.PREF_STRING:
          result += this._prefs.getComplexValue(prefName,
                      Components.interfaces.nsISupportsString).data;
          break;
        case Components.interfaces.nsIPrefBranch.PREF_INT:
          result += this._prefs.getIntPref(prefName);
          break;
        case Components.interfaces.nsIPrefBranch.PREF_BOOL:
          result += this._prefs.getBoolPref(prefName);
          break;
      }
      result += "\n";
    }, this);
    return result;
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
  
  updateToV4_5 : function() {
    function PrefUpdate(type, oldPref, newPref) {
      this.type = type;
      this.oldPref = oldPref;
      this.newPref = newPref;
    }
    
    var prefsToUpdate = [];
    var oldBranch = Services.prefs.getBranch("easygestures.");
    
    prefsToUpdate.push(new PrefUpdate("Bool", "profile.startupTips", "general.startupTips"));
    prefsToUpdate.push(new PrefUpdate("Int", "profile.tipNbr", "general.tipNumber"));
    
    prefsToUpdate.push(new PrefUpdate("Int", "behavior.showButton", "activation.showButton"));
    prefsToUpdate.push(new PrefUpdate("Int", "behavior.showKey", "activation.showKey"));
    prefsToUpdate.push(new PrefUpdate("Bool", "behavior.showAfterDelay", "activation.showAfterDelay"));
    prefsToUpdate.push(new PrefUpdate("Int", "behavior.showAfterDelayDelay", "activation.showAfterDelayValue"));
    prefsToUpdate.push(new PrefUpdate("Int", "behavior.showAltButton", "activation.showAltButton"));
    prefsToUpdate.push(new PrefUpdate("Int", "behavior.supprKey", "activation.suppressKey"));
    prefsToUpdate.push(new PrefUpdate("Int", "behavior.contextKey", "activation.contextKey"));
    prefsToUpdate.push(new PrefUpdate("Bool", "behavior.contextMenuAuto", "activation.contextShowAuto"));
    
    prefsToUpdate.push(new PrefUpdate("Bool", "behavior.largeMenu", "behavior.largeMenu"));
    prefsToUpdate.push(new PrefUpdate("Bool", "behavior.noIcons", "behavior.noIcons"));
    prefsToUpdate.push(new PrefUpdate("Bool", "behavior.smallIcons", "behavior.smallIcons"));
    prefsToUpdate.push(new PrefUpdate("Int", "behavior.menuOpacity", "behavior.menuOpacity"));
    prefsToUpdate.push(new PrefUpdate("Bool", "behavior.showTooltips", "behavior.showTooltips"));
    prefsToUpdate.push(new PrefUpdate("Int", "behavior.tooltipsDelay", "behavior.tooltipsDelay"));
    prefsToUpdate.push(new PrefUpdate("Bool", "behavior.moveAuto", "behavior.moveAuto"));
    prefsToUpdate.push(new PrefUpdate("Bool", "behavior.handleLinks", "behavior.handleLinks"));
    prefsToUpdate.push(new PrefUpdate("Int", "behavior.linksDelay", "behavior.linksDelay"));
    prefsToUpdate.push(new PrefUpdate("Bool", "behavior.handleLinksAsOpenLink", "behavior.handleLinksAsOpenLink"));
    prefsToUpdate.push(new PrefUpdate("Bool", "behavior.autoscrollingOn", "behavior.autoscrollingOn"));
    prefsToUpdate.push(new PrefUpdate("Int", "behavior.autoscrollingDelay", "behavior.autoscrollingDelay"));
    
    prefsToUpdate.push(new PrefUpdate("Char", "actions.main", "menus.main"));
    prefsToUpdate.push(new PrefUpdate("Bool", "actions.mainAlternative1", "menus.mainAlt1Enabled"));
    prefsToUpdate.push(new PrefUpdate("Char", "actions.mainAlt1", "menus.mainAlt1"));
    prefsToUpdate.push(new PrefUpdate("Bool", "actions.mainAlternative2", "menus.mainAlt2Enabled"));
    prefsToUpdate.push(new PrefUpdate("Char", "actions.mainAlt2", "menus.mainAlt2"));
    prefsToUpdate.push(new PrefUpdate("Char", "actions.extra", "menus.extra"));
    prefsToUpdate.push(new PrefUpdate("Bool", "actions.extraAlternative1", "menus.extraAlt1Enabled"));
    prefsToUpdate.push(new PrefUpdate("Char", "actions.extraAlt1", "menus.extraAlt1"));
    prefsToUpdate.push(new PrefUpdate("Bool", "actions.extraAlternative2", "menus.extraAlt2Enabled"));
    prefsToUpdate.push(new PrefUpdate("Char", "actions.extraAlt2", "menus.extraAlt2"));
    prefsToUpdate.push(new PrefUpdate("Bool", "actions.contextImageFirst", "menus.contextImageFirst"));
    prefsToUpdate.push(new PrefUpdate("Bool", "actions.contextTextboxFirst", "menus.contextTextboxFirst"));
    prefsToUpdate.push(new PrefUpdate("Char", "actions.contextLink", "menus.contextLink"));
    prefsToUpdate.push(new PrefUpdate("Char", "actions.contextImage", "menus.contextImage"));
    prefsToUpdate.push(new PrefUpdate("Char", "actions.contextSelection", "menus.contextSelection"));
    prefsToUpdate.push(new PrefUpdate("Char", "actions.contextTextbox", "menus.contextTextbox"));
    
    prefsToUpdate.push(new PrefUpdate("Char", "customizations.loadURLin", "customizations.loadURLin"));
    prefsToUpdate.push(new PrefUpdate("Char", "customizations.openLink", "customizations.openLink"));
    prefsToUpdate.push(new PrefUpdate("Bool", "customizations.closeBrowserOnLastTab", "customizations.closeBrowserOnLastTab"));
    prefsToUpdate.push(new PrefUpdate("Char", "behavior.dailyReadingsFolderURI", "customizations.dailyReadingsFolder"));
    
    prefsToUpdate.push(new PrefUpdate("Int", "profile.statsClicks", "stats.clicks"));
    prefsToUpdate.push(new PrefUpdate("Int", "profile.statsUse", "stats.menuShown"));
    prefsToUpdate.push(new PrefUpdate("Char", "profile.statsLastReset", "stats.lastReset"));
    prefsToUpdate.push(new PrefUpdate("Char", "profile.statsMain", "stats.mainMenu"));
    prefsToUpdate.push(new PrefUpdate("Char", "profile.statsExtra", "stats.extraMenu"));
    prefsToUpdate.push(new PrefUpdate("Char", "profile.statsActions", "stats.actions"));
    
    prefsToUpdate.forEach(function (prefToUpdate) {
      this._prefs["set" + prefToUpdate.type + "Pref"](prefToUpdate.newPref,
        oldBranch["get" + prefToUpdate.type + "Pref"](prefToUpdate.oldPref));
    }, this);
    
    for (let i=1; i<=20; ++i) {
      this._prefs.setComplexValue("customizations.loadURLScript" + i,
                                  Components.interfaces.nsISupportsString,
                                  oldBranch.getComplexValue("customizations.loadURLScript" + i,
                                                            Components.interfaces.nsISupportsString));
    }
    
    oldBranch.deleteBranch("");
  },
  
  updateToV4_6 : function() {
    var menuNames = ["main", "mainAlt1", "mainAlt2", "extra", "extraAlt1",
      "extraAlt2", "contextLink", "contextImage", "contextSelection",
      "contextTextbox"];
    var actionNames = ["empty", "more", "firstPage", "lastPage", "backSite",
      "forwardSite", "back", "forward", "reload", "up", "root", "pageTop",
      "pageBottom", "autoscrolling", "newTab", "duplicateTab", "prevTab",
      "nextTab", "closeTab", "closeOtherTabs", "undoCloseTab", "newWindow",
      "duplicateWindow", "closeOtherWindows", "quit", "minimizeWindow",
      "fullscreen", "openLink", "openLinkNewWindow", "copyLink",
      "newBlankWindow", "copyImageLocation", "saveLinkAs", "saveImageAs",
      "savePageAs", "hideImages", "copyImage", "homepage", "dailyReadings",
      "searchWeb", "restart", "openLinkInNewPrivateWindow", "empty", "empty",
      "empty", "empty", "empty", "empty", "empty", "empty", "empty",
      "loadURLScript1", "loadURLScript2", "loadURLScript3", "loadURLScript4",
      "loadURLScript5", "loadURLScript6", "loadURLScript7", "loadURLScript8",
      "loadURLScript9", "loadURLScript10", "loadURLScript11", "loadURLScript12",
      "loadURLScript13", "loadURLScript14", "loadURLScript15",
      "loadURLScript16", "loadURLScript17", "loadURLScript18",
      "loadURLScript19", "loadURLScript20", "markVisitedLinks",
      "bookmarkThisLink", "bookmarkPage", "bookmarkOpenTabs", "bookmarks",
      "bookmarksToolbar", "history", "viewPageSource", "viewPageInfo",
      "showOnlyThisFrame", "empty", "printPage", "focusLocationBar",
      "newPrivateWindow", "cut", "copy", "paste", "undo", "selectAll",
      "toggleFindBar", "zoomIn", "zoomOut", "zoomReset"];
    
    function transformFromActionNumbersToActionNames(anArray) {
      anArray.forEach(function(actionNumber, index, array) {
        array[index] = actionNames[actionNumber];
      });
    }
    
    menuNames.forEach(function(menuName) {
      let actionsString = this._prefs.getCharPref("menus." + menuName);
      let actionsArray = actionsString.split("/");
      transformFromActionNumbersToActionNames(actionsArray);
      this._prefs.setCharPref("menus." + menuName, actionsArray.join("/"));
    }, this);
    
    var actionsStats = JSON.parse(this._prefs.getCharPref("stats.actions"));
    var newActionsStats = {};
    actionsStats.forEach(function(statValue, index) {
      let actionName = actionNames[index];
      if (actionName !== "empty" || index === 0) {
        newActionsStats[actionName] = statValue;
      }
    });
    this._prefs.setCharPref("stats.actions", JSON.stringify(newActionsStats));
  },
  
  updateToV4_7 : function() {
    this._prefs.deleteBranch("customizations.closeBrowserOnLastTab");
    
    var menuNames = ["main", "mainAlt1", "mainAlt2", "extra", "extraAlt1",
      "extraAlt2", "contextLink", "contextImage", "contextSelection",
      "contextTextbox"];
    var actionsToRename = [
      ["more", "showExtraMenu"], ["fullscreen", "toggleFullscreen"],
      ["openLinkNewWindow", "openLinkInNewWindow"],
      ["bookmarkPage", "bookmarkThisPage"],
      ["bookmarks", "toggleBookmarksSidebar"],
      ["bookmarksToolbar", "toggleBookmarksToolbar"],
      ["history", "toggleHistorySidebar"]
    ];
    
    function renameActionsInMenu(anArray) {
      actionsToRename.forEach(function(action) {
        anArray = anArray.replace(action[0], action[1]);
      });
      return anArray;
    }
    
    menuNames.forEach(function(menuName) {
      let actions = this._prefs.getCharPref("menus." + menuName);
      actions = actions.replace("markVisitedLinks", "empty");
      actions = renameActionsInMenu(actions);
      this._prefs.setCharPref("menus." + menuName, actions);
    }, this);
    
    var actionsStats = JSON.parse(this._prefs.getCharPref("stats.actions"));
    delete actionsStats.markVisitedLinks;
    var newActions = ["newBlankTab", "pinUnpinTab", "closeWindow",
                      "undoCloseWindow", "showBookmarks", "showHistory",
                      "showDownloads", "redo"];
    newActions.forEach(function(actionName) {
      actionsStats[actionName] = 0;
    });
    actionsToRename.forEach(function(action) {
      actionsStats[action[1]] = actionsStats[action[0]];
      delete actionsStats[action[0]];
    });
    this._prefs.setCharPref("stats.actions", JSON.stringify(actionsStats));
  },
  
  updateToV4_8: function() {
    var numberOfLoadURLActions = 0;
    var numberOfRunScriptActions = 0;
    var nonMigratedActions = [];
    
    function writePref(prefs, actionName, prefArray) {
      var string = Components.classes["@mozilla.org/supports-string;1"]
                       .createInstance(Components.interfaces.nsISupportsString);
      string.data = prefArray.join("\u2022");
      prefs.setComplexValue("customizations." + actionName,
                            Components.interfaces.nsISupportsString, string);
    }
    
    function replaceActionInMenus(prefs, originalAction, newAction) {
      var menuNames = ["main", "mainAlt1", "mainAlt2", "extra", "extraAlt1",
        "extraAlt2", "contextLink", "contextImage", "contextSelection",
        "contextTextbox"];
      
      menuNames.forEach(function(menuName) {
        let actionsString = prefs.getCharPref("menus." + menuName);
        actionsString = actionsString.replace(originalAction, newAction);
        prefs.setCharPref("menus." + menuName, actionsString);
      });
    }
    
    function replaceActionInStats(prefs, originalAction, newAction) {
      var actionsStats = JSON.parse(prefs.getCharPref("stats.actions"));
      if (newAction !== undefined) {
        actionsStats[newAction] = actionsStats[originalAction];
      }
      delete actionsStats[originalAction];
      prefs.setCharPref("stats.actions", JSON.stringify(actionsStats));
    }
    
    var actionsStats = JSON.parse(this._prefs.getCharPref("stats.actions"));
    for (let i=1; i <= 10; ++i) {
      writePref(this._prefs, "loadURL" + i, ["", "", "false", "false"]);
      writePref(this._prefs, "runScript" + i, ["", "", ""]);
      actionsStats["loadURL" + i] = 0;
      actionsStats["runScript" + i] = 0;
    }
    this._prefs.setCharPref("stats.actions", JSON.stringify(actionsStats));
    
    for (let i=1; i <= 20; ++i) {
      let originalAction = "loadURLScript" + i;
      let pref = this._prefs.getComplexValue("customizations." + originalAction,
                  Components.interfaces.nsISupportsString).data.split("\u2022");
      if (pref[2] === "true") {
        if (numberOfRunScriptActions < 10) {
          ++numberOfRunScriptActions;
          let newAction = "runScript" + numberOfRunScriptActions;
          writePref(this._prefs, newAction, [pref[0], pref[1], pref[3]]);
          replaceActionInMenus(this._prefs, originalAction, newAction);
          replaceActionInStats(this._prefs, originalAction, newAction);
        }
        else {
          nonMigratedActions.push(pref.join("\u2022"));
          replaceActionInMenus(this._prefs, originalAction, "empty");
          replaceActionInStats(this._prefs, originalAction);
        }
      }
      else if (pref[2] === "false") {
        if (numberOfLoadURLActions < 10) {
          ++numberOfLoadURLActions;
          let newAction = "loadURL" + numberOfLoadURLActions;
          writePref(this._prefs, newAction, [pref[0], pref[1], pref[4], "false"]);
          replaceActionInMenus(this._prefs, originalAction, newAction);
          replaceActionInStats(this._prefs, originalAction, newAction);
        }
        else {
          nonMigratedActions.push(pref.join("\u2022"));
          replaceActionInMenus(this._prefs, originalAction, "empty");
          replaceActionInStats(this._prefs, originalAction);
        }
      }
      this._prefs.deleteBranch("customizations." + originalAction);
    }
    if (nonMigratedActions.length > 0) {
      let message = "The customizations below for the former loadURLScript " +
        "actions could not be migrated to the new version of easyGestures N. " +
        "Please copy/paste them now not to lose them.\n\n" +
        nonMigratedActions.join("\n");
      Services.prompt.alert(null, "easyGestures N v4.8", message);
    }
    
    this._prefs.deleteBranch("customizations.dailyReadingsFolder");
    this._prefs.setIntPref("customizations.dailyReadingsFolderID", -1);
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
  }
};
