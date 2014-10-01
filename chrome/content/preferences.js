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

var eGPrefs = {
  _prefs : Services.prefs.getBranch("extensions.easygestures."),
  
  exportPrefsToString : function() {
    var prefsNames = this._prefs.getChildList("");
    var result = "";
    
    prefsNames.forEach(function(prefName, index, array) {
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
      main:             "more/pageTop/nextTab/bookmarkPage/backSite/firstPage/closeTab/reload/back/newTab",
      mainAlt1:         "more/duplicateTab/forward/empty/forwardSite/lastPage/pageBottom/homepage/prevTab/undoCloseTab",
      mainAlt2:         "more/loadURLScript1/loadURLScript2/loadURLScript8/loadURLScript3/loadURLScript4/loadURLScript5/loadURLScript9/loadURLScript6/loadURLScript7",
      extra:            "searchWeb/toggleFindBar/bookmarkPage/empty/empty/empty/empty/empty/homepage/reload",
      extraAlt1:        "fullscreen/empty/newPrivateWindow/empty/empty/empty/empty/empty/quit/restart",
      extraAlt2:        "zoomIn/zoomOut/zoomReset/empty/empty/empty/empty/empty/printPage/savePageAs",
      contextLink:      "copyLink/saveLinkAs/bookmarkThisLink/empty/empty/empty/empty/empty/openLinkInNewPrivateWindow/openLink",
      contextImage:     "copyImage/saveImageAs/empty/empty/empty/empty/empty/empty/hideImages/copyImageLocation",
      contextSelection: "searchWeb/toggleFindBar/empty/empty/empty/empty/paste/empty/copy/cut",
      contextTextbox:   "undo/empty/selectAll/empty/empty/empty/paste/empty/copy/cut"
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
      this._prefs.setIntPref("activation.showKey", 0); // 0=none 16=shift 17=ctrl
      this._prefs.setIntPref("activation.showAltButton", 2); // right button
      this._prefs.setIntPref("activation.suppressKey", 45); // 18=alt 45=insert
      this._prefs.setIntPref("activation.contextKey", 17);
      this._prefs.setBoolPref("behavior.handleLinksAsOpenLink", true);
    }
    else {
      // mac users need different defaults
      this._prefs.setIntPref("activation.showButton", 0);
      this._prefs.setIntPref("activation.showKey", 16);
      this._prefs.setIntPref("activation.showAltButton", 2); // a shift-right click on Mac gives a right mouse click
      this._prefs.setIntPref("activation.suppressKey", 17);
      this._prefs.setIntPref("activation.contextKey", 0);
      this._prefs.setBoolPref("behavior.handleLinksAsOpenLink", false);
    }
    
    this._prefs.setBoolPref("activation.showAfterDelay", false);
    this._prefs.setIntPref("activation.showAfterDelayValue", 200);
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
    this._prefs.setBoolPref("behavior.autoscrollingOn", false);
    this._prefs.setIntPref("behavior.autoscrollingDelay", 750);
    
    this._prefs.setCharPref("customizations.dailyReadingsFolder", "");
    
    this._prefs.setBoolPref("menus.mainAlt1Enabled", true);
    this._prefs.setBoolPref("menus.mainAlt2Enabled", false);
    this._prefs.setBoolPref("menus.extraAlt1Enabled", true);
    this._prefs.setBoolPref("menus.extraAlt2Enabled", false);
    this._prefs.setBoolPref("menus.contextImageFirst", false);
    this._prefs.setBoolPref("menus.contextTextboxFirst", true);
    this._setDefaultMenus();
    
    this._prefs.setCharPref("customizations.loadURLin", "newTab"); // execute 'load URL' action in "curTab" or "newTab" or "newWindow"
    
    var string = Components.classes["@mozilla.org/supports-string;1"]
                           .createInstance(Components.interfaces.nsISupportsString);
    for (let i=1; i<=20; i++) {
      string.data = "\u2022\u2022false\u2022\u2022false\u2022false"; // name, text, isScript, newIconPath, favicon, newIcon: '•' is the separator
      this._prefs.setComplexValue("customizations.loadURLScript" + i, Components.interfaces.nsISupportsString, string); // complex value used here to support non-ascii characters
    }
    
    this._prefs.setCharPref("customizations.openLink", "newTab"); // "curTab"  or "newTab" or "newWindow"
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
  
  setDailyReadingsFolderPref : function(aString) {
    this._prefs.setCharPref("customizations.dailyReadingsFolder", aString);
  },
  
  getLoadURLScriptPref : function(anInteger) {
    return this._prefs.getComplexValue("customizations.loadURLScript" + anInteger,
      Components.interfaces.nsISupportsString).data.split("\u2022");
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
  
  setStatsMainMenuPref : function(aString) {
    this._prefs.setCharPref("stats.mainMenu", aString);
  },
  
  getStatsExtraMenuPref : function() {
    return JSON.parse(this._prefs.getCharPref("stats.extraMenu"));
  },
  
  setStatsExtraMenuPref : function(aString) {
    this._prefs.setCharPref("stats.extraMenu", aString);
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
    
    prefsToUpdate.forEach(function (prefToUpdate, index, array) {
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
    menuNames.forEach(function(menuName) {
      let actions = this._prefs.getCharPref("menus." + menuName);
      actions = actions.replace("markVisitedLinks", "empty");
      this._prefs.setCharPref("menus." + menuName, actions);
    });
    
    var actionsStats = JSON.parse(this._prefs.getCharPref("stats.actions"));
    delete actionsStats.markVisitedLinks;
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

  observe: function(aSubject, aTopic, aData) {
    // removing existing easyGestures menus from open web pages
    eGm.removeExistingMenusFromPages();
    
    // rebulding the menu
    eGm = new eG_menu();
  }
};
