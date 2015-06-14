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


/* exported eGPrefs, eGPrefsObserver */
/* global eGActions, eGm */

var eGPrefs = {
  _prefs : Services.prefs.getBranch("extensions.easygestures."),
  
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
  
  _setDefaultMenus : function() {
    var menus = {
      main:             "showExtraMenu/pageTop/nextTab/bookmarkThisPage/backSite/firstPage/closeTab/reload/back/newTab",
      mainAlt1:         "showExtraMenu/duplicateTab/forward/pinUnpinTab/forwardSite/lastPage/pageBottom/homepage/prevTab/undoCloseTab",
      mainAlt2:         "showExtraMenu/loadURL1/loadURL2/runScript1/loadURL3/loadURL4/loadURL5/runScript2/loadURL6/loadURL7",
      extra:            "searchWeb/toggleFindBar/bookmarkThisPage/empty/empty/empty/empty/empty/homepage/reload",
      extraAlt1:        "toggleFullscreen/empty/newPrivateWindow/empty/empty/empty/empty/empty/quit/restart",
      extraAlt2:        "zoomIn/zoomOut/zoomReset/empty/empty/empty/empty/empty/printPage/savePageAs",
      contextLink:      "copyLink/saveLinkAs/bookmarkThisLink/empty/empty/empty/empty/empty/openLinkInNewPrivateWindow/openLink",
      contextImage:     "copyImage/saveImageAs/empty/empty/empty/empty/empty/empty/hideImages/copyImageLocation",
      contextSelection: "searchWeb/toggleFindBar/empty/empty/empty/empty/paste/empty/copy/cut",
      contextTextbox:   "undo/redo/selectAll/empty/empty/empty/paste/empty/copy/cut"
    };
    
    for (let [menuName, actions] in Iterator(menus)) {
      this._prefs.setCharPref("menus." + menuName, actions);
    }
  },
  
  setDefaultSettings : function() {
    this._prefs.setBoolPref("general.startupTips", true);
    this._prefs.setIntPref("general.tipNumber", 0);
    
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    if (window.navigator.userAgent.indexOf("Mac") == -1) {
      this._prefs.setIntPref("activation.showButton", 1); // middle button
      this._prefs.setIntPref("activation.showKey", 0); // no key
      this._prefs.setIntPref("activation.suppressKey", 17); // ctrl key
    }
    else {
      // mac users need different defaults
      this._prefs.setIntPref("activation.showButton", 0); // left button
      this._prefs.setIntPref("activation.showKey", 16); // shift key
      this._prefs.setIntPref("activation.suppressKey", 0);
    }
    
    this._prefs.setBoolPref("activation.showAfterDelay", false);
    this._prefs.setIntPref("activation.showAfterDelayValue", 200);
    this._prefs.setIntPref("activation.showAltButton", 2); // right button
    this._prefs.setIntPref("activation.contextKey", 18); // alt key
    this._prefs.setBoolPref("activation.contextShowAuto", false); // Show contextual pie menu automatically
    
    this._prefs.setBoolPref("behavior.moveAuto", false); // must press <Shitf> key to move menu
    this._prefs.setBoolPref("behavior.largeMenu", false);
    this._prefs.setIntPref("behavior.menuOpacity", 100); // set in % but will be converted when used in style.opacity
    this._prefs.setBoolPref("behavior.noIcons", false);
    this._prefs.setBoolPref("behavior.smallIcons", false);
    this._prefs.setBoolPref("behavior.showTooltips", true);
    this._prefs.setIntPref("behavior.tooltipsDelay", 1000);
    this._prefs.setBoolPref("behavior.handleLinks", true);
    this._prefs.setIntPref("behavior.linksDelay", 300);
    this._prefs.setBoolPref("behavior.handleLinksAsOpenLink", false);
    this._prefs.setBoolPref("behavior.autoscrollingOn", false);
    this._prefs.setIntPref("behavior.autoscrollingDelay", 750);
    
    this._prefs.setCharPref("customizations.dailyReadingsFolder", "");
    
    this._prefs.setBoolPref("menus.mainAlt1Enabled", true);
    this._prefs.setBoolPref("menus.mainAlt2Enabled", false);
    this._prefs.setBoolPref("menus.extraAlt1Enabled", true);
    this._prefs.setBoolPref("menus.extraAlt2Enabled", false);
    this._setDefaultMenus();
    
    this._prefs.setCharPref("customizations.loadURLin", "newTab"); // execute 'load URL' action in "curTab" or "newTab" or "newWindow"
    
    var string = Components.classes["@mozilla.org/supports-string;1"]
                           .createInstance(Components.interfaces.nsISupportsString);
    for (let i=1; i<=10; i++) {
      string.data = "\u2022\u2022false\u2022false";
      this._prefs.setComplexValue("customizations.loadURL" + i,
        Components.interfaces.nsISupportsString, string);
      
      string.data = "\u2022\u2022";
      this._prefs.setComplexValue("customizations.runScript" + i,
        Components.interfaces.nsISupportsString, string);
    }
    
    this._prefs.setCharPref("customizations.openLink", "newTab"); // "curTab"  or "newTab" or "newWindow"
    this._prefs.setIntPref("customizations.dailyReadingsFolderID", -1);
  },
  
  initializeStats : function() {
    this._prefs.setIntPref("stats.clicks", 0); // clicks inside window excluding clicks inside menu
    this._prefs.setIntPref("stats.menuShown", 0); // calls for menu
    var d = new Date(); // date of last reset
    this._prefs.setCharPref("stats.lastReset", d.getFullYear() + "/" + (d.getMonth()+1) + "/"+d.getDate()+"  "+ d.getHours()+":"+(d.getMinutes()<10? "0":"")+d.getMinutes()+":"+(d.getSeconds()<10? "0":"")+d.getSeconds() );
    this._prefs.setCharPref("stats.mainMenu", "[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]"); // saved as source of an Array
    this._prefs.setCharPref("stats.extraMenu", "[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]"); // saved as source of an Array
    
    var actionsStats = {};
    for (let action in eGActions) {
      actionsStats[action] = 0;
    }
    this._prefs.setCharPref("stats.actions", JSON.stringify(actionsStats));
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
  
  getLoadURLOrRunScriptPrefValue : function(aPrefName) {
    return this._prefs.getComplexValue("customizations." + aPrefName,
      Components.interfaces.nsISupportsString).data.split("\u2022");
  },
  
  getDailyReadingsFolderID : function() {
    return this._prefs.getIntPref("customizations.dailyReadingsFolderID");
  },
  
  getStatsClicksPref : function() {
    return this._prefs.getIntPref("stats.clicks");
  },
  
  incrementStatsClicksPref : function() {
    var value = this._prefs.getIntPref("stats.clicks");
    this._prefs.setIntPref("stats.clicks", ++value);
  },
  
  getStatsMenuShownPref : function() {
    return this._prefs.getIntPref("stats.menuShown");
  },
  
  incrementStatsMenuShownPref : function() {
    var value = this._prefs.getIntPref("stats.menuShown");
    this._prefs.setIntPref("stats.menuShown", ++value);
  },
  
  getStatsLastResetPref : function() {
    return this._prefs.getCharPref("stats.lastReset");
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
  }
};

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
    // removing existing easyGestures menus from open web pages
    eGm.removeFromAllPages();
    
    // rebulding the menu
    eGm = new eG_menu();
  }
};
