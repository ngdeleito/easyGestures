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
  _prefs : Services.prefs.getBranch("easygestures."),
  
  _setDefaultMenus : function() {
    var menus = {
      main:             "1/17/7/14/12/75/18/24/6/11",
      mainAlt1:         "1/84/5/80/25/73/19/81/4/26",
      mainAlt2:         "1/51/52/58/53/54/55/59/56/57",
      extra:            "39/90/38/0/0/0/0/0/37/8",
      extraAlt1:        "40/20/71/0/0/0/0/0/10/9",
      extraAlt2:        "91/77/74/0/0/0/0/0/82/93",
      contextLink:      "29/72/32/0/71/0/30/0/28/27",
      contextImage:     "36/33/91/0/92/81/0/0/35/31",
      contextSelection: "39/90/86/0/0/0/0/0/89/40",
      contextTextbox:   "88/85/86/0/87/0/0/0/89/0"
    };
    
    for (let [menuName, actions] in Iterator(menus)) {
      this._prefs.setCharPref("actions." + menuName, actions);
    }
  },

  setDefaultSettings : function() {
    this._prefs.setCharPref("profile.version", eGc.version);
    this._prefs.setBoolPref("profile.startupTips", true);
    this._prefs.setIntPref("profile.tipNbr", 1); // used in tips.xul
    
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    if (window.navigator.userAgent.indexOf("Mac") == -1) {
      this._prefs.setIntPref("behavior.showButton", 1); // middle button
      this._prefs.setIntPref("behavior.showKey", 0); // 0=none 16=shift 17=ctrl
      this._prefs.setIntPref("behavior.showAltButton", 2); // right button
      this._prefs.setIntPref("behavior.supprKey", 45); // 18=alt 45=insert
      this._prefs.setIntPref("behavior.contextKey", 17);
      this._prefs.setBoolPref("behavior.handleLinksAsOpenLink", true);
    }
    else {
      // mac users need different defaults
      this._prefs.setIntPref("behavior.showButton", 0);
      this._prefs.setIntPref("behavior.showKey", 16);
      this._prefs.setIntPref("behavior.showAltButton", 2); // a shift-right click on Mac gives a right mouse click
      this._prefs.setIntPref("behavior.supprKey", 17);
      this._prefs.setIntPref("behavior.contextKey", 0);
      this._prefs.setBoolPref("behavior.handleLinksAsOpenLink", false);
    }
    
    this._prefs.setBoolPref("behavior.showAfterDelay", false);
    this._prefs.setIntPref("behavior.showAfterDelayDelay", 200);
    this._prefs.setBoolPref("behavior.contextMenuAuto", false); // Show contextual pie menu automatically
    
    this._prefs.setBoolPref("behavior.moveAuto", false); // must press <Shitf> key to move menu
    this._prefs.setBoolPref("behavior.largeMenu", false);
    this._prefs.setIntPref("behavior.menuOpacity", 100); // set in % but will be converted when used in style.opacity
    this._prefs.setBoolPref("behavior.noIcons", false);
    this._prefs.setBoolPref("behavior.smallIcons", false);
    this._prefs.setBoolPref("behavior.showTooltips", true);
    this._prefs.setIntPref("behavior.tooltipsDelay", 1000);
    this._prefs.setBoolPref("behavior.tooltipsDelayOmit", false);
    this._prefs.setBoolPref("behavior.handleLinks", true);
    this._prefs.setIntPref("behavior.linksDelay", 300);
    this._prefs.setBoolPref("behavior.autoscrollingOn", false);
    this._prefs.setIntPref("behavior.autoscrollingDelay", 750);
    
    this._prefs.setCharPref("behavior.dailyReadingsFolderURI", "");
    
    this._prefs.setBoolPref("actions.mainAlternative1", true); // activate main alternative 1 layout
    this._prefs.setBoolPref("actions.mainAlternative2", false);
    this._prefs.setBoolPref("actions.extraAlternative1", true);
    this._prefs.setBoolPref("actions.extraAlternative2", false);
    this._prefs.setBoolPref("actions.contextImageFirst", false);
    this._prefs.setBoolPref("actions.contextTextboxFirst", true);
    this._setDefaultMenus();
    
    this._prefs.setCharPref("customizations.loadURLin", "newTab"); // execute 'load URL' action in "curTab" or "newTab" or "newWindow"
    
    var string = Components.classes["@mozilla.org/supports-string;1"]
                           .createInstance(Components.interfaces.nsISupportsString);
    for (let i=1; i<=20; i++) {
      string.data = "\u2022\u2022false\u2022\u2022false\u2022false"; // name, text, isScript, newIconPath, favicon, newIcon: '•' is the separator
      this._prefs.setComplexValue("customizations.loadURLScript" + i, Components.interfaces.nsISupportsString, string); // complex value used here to support non-ascii characters
    }
    
    this._prefs.setCharPref("customizations.openLink", "newTab"); // "curTab"  or "newTab" or "newWindow"
    this._prefs.setBoolPref("customizations.closeBrowserOnLastTab", true);
  },

  initializeStats : function() {
    var numberOfActions;
    if (typeof eG_menuItems === "undefined") {
      numberOfActions = eG_PopupImages.length;
    }
    else {
      numberOfActions = eG_menuItems.length;
    }
    
    this._prefs.setIntPref("profile.statsClicks", 0); // clicks inside window excluding clicks inside menu
    this._prefs.setIntPref("profile.statsUse", 0); // calls for menu
    var d = new Date(); // date of last reset
    this._prefs.setCharPref("profile.statsLastReset", d.getFullYear() + "/" + (d.getMonth()+1) + "/"+d.getDate()+"  "+ d.getHours()+":"+(d.getMinutes()<10? "0":"")+d.getMinutes()+":"+(d.getSeconds()<10? "0":"")+d.getSeconds() );
    this._prefs.setCharPref("profile.statsMain","[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]"); // saved as source of an Array
    this._prefs.setCharPref("profile.statsExtra","[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]"); // saved as source of an Array
    var actionsStr = new Array();
    for (let i=0; i<numberOfActions; i++) {
      actionsStr.push(0); // all actions stats set to 0
    }
    this._prefs.setCharPref("profile.statsActions", actionsStr.toSource()); // saved as source of an Array
  },
  
  areStartupTipsOn : function() {
    return this._prefs.getBoolPref("profile.startupTips");
  },
  
  setDailyReadingsFolderPref : function(aString) {
    this._prefs.setCharPref("behavior.dailyReadingsFolderURI", aString);
  },
  
  incrementStatsClicksPref : function() {
    var value = this._prefs.getIntPref("profile.statsClicks");
    this._prefs.setIntPref("profile.statsClicks", ++value);
  },
  
  incrementStatsUsePref : function() {
    var value = this._prefs.getIntPref("profile.statsUse");
    this._prefs.setIntPref("profile.statsUse", ++value);
  },
  
  getStatsMainPref : function() {
    return this._prefs.getCharPref("profile.statsMain");
  },
  
  setStatsMainPref : function(aString) {
    this._prefs.setCharPref("profile.statsMain", aString);
  },
  
  getStatsExtraPref : function() {
    return this._prefs.getCharPref("profile.statsExtra");
  },
  
  setStatsExtraPref : function(aString) {
    this._prefs.setCharPref("profile.statsExtra", aString);
  },
  
  getStatsActionsPref : function() {
    return this._prefs.getCharPref("profile.statsActions");
  },
  
  setStatsActionsPref : function(aString) {
    this._prefs.setCharPref("profile.statsActions", aString);
  }
};

function eG_updateToVersion43() {
  // update actions numbers, labels and stats because of addition of 3 new actions
  var menus = new Array("main", "mainAlt1", "mainAlt2", "extra", "extraAlt1",
                        "extraAlt2", "contextLink", "contextImage",
                        "contextSelection","contextTextbox");
  
  for (var i=0; i<menus.length; i++) {
    var actionsSplit = eGPrefs._prefs.getCharPref("actions." + menus[i]).split("/");
    var actionsPrefs = "";
    
    for (var n=0; n<actionsSplit.length; n++) {
      if (parseInt(actionsSplit[n]) >= 82) {
        actionsSplit[n] = parseInt(actionsSplit[n]) + 3;
      }
      else if (parseInt(actionsSplit[n]) >= 78) {
        actionsSplit[n] = parseInt(actionsSplit[n]) + 2;
      }
      else if (parseInt(actionsSplit[n]) >= 30) {
        actionsSplit[n] = parseInt(actionsSplit[n]) + 1;
      }
      
      actionsPrefs += actionsSplit[n];
      
      if (n<actionsSplit.length-1) {
        actionsPrefs += "/"; // this is the separator, prefStr ends without separator
      }
    }
    
    // update actions
    eGPrefs._prefs.setCharPref("actions." + menus[i], actionsPrefs);
  }
  
  // update actions stats
  var prevActionsStr = (new Function ("return " + eGPrefs.getStatsActionsPref()))(); // (new Function ("return " + data ))() replacing eval on data
  var actionsStr = new Array();
  for (i=0; i<eG_menuItems.length; i++) {
    if (i<30) {
      actionsStr.push(prevActionsStr[i]);
    }
    else if (i==30) {
      actionsStr.push(0);
    }
    else if (i>30 && i<78) {
      actionsStr.push(prevActionsStr[i-1]);
    }
    else if (i==78) {
      actionsStr.push(0);
    }
    else if (i>78 && i<82) {
      actionsStr.push(prevActionsStr[i-2]);
    }
    else if (i==82) {
      actionsStr.push(0);
    }
    else {
      actionsStr.push(prevActionsStr[i-3]);
    }
  }
  
  eGPrefs.setStatsActionsPref(actionsStr.toSource()); // saved as source of an Array
}

function eG_updatePrefs() {
  var prefs = Services.prefs.getBranch("easygestures.");
  
  var versionCompare = Components.classes["@mozilla.org/xpcom/version-comparator;1"].getService(Components.interfaces.nsIVersionComparator);
  var prevVersion = prefs.getCharPref("profile.version"); // if a previous version is not already installed, this will trigger the catch statement to set all prefs
  
  if (versionCompare.compare(prevVersion, "4.3.1") >= 0) {
    // Keep current preferences because no changes to prefs have been made since version 4.3.1
  }
  else if (versionCompare.compare(prevVersion, "4.3") >= 0) {
    // make a few changes for all versions from version 4.3 to prior to version 4.3.1
    
    // update value of prefs
    prefs.setIntPref("customizations.tabPopupDelay", 400);
  }
  else if (versionCompare.compare(prevVersion, "4.1.2") >= 0) {
    // make a few changes for all versions from version 4.1.2 to prior to version 4.3
    
    // update value of prefs for 4.3.1
    prefs.setIntPref("customizations.tabPopupDelay", 400);
    
    // update actions numbers and labels because of addition of 3 new actions
    eG_updateToVersion43();
    
    // clear obsolete user prefs
    prefs.clearUserPref("customizations.tabRepetitionDelay");
    
    // update value of prefs
    prefs.setBoolPref("customizations.queryInNewTab", !prefs.getBoolPref("customizations.queryInNewTab"));
  }
  else {
    // update all preferences for all versions prior to version 4.1.2
    eGPrefs.setDefaultSettings();
    eGPrefs.initializeStats();
  }
  
  // update version
  prefs.setCharPref("profile.version", eGc.version);
}

var eGPrefsObserver = {
  register: function() {
    this._branch = Services.prefs.getBranch("easygestures.stateChange.prefs");
    this._branch.addObserver("", this, false);
  },

  unregister: function() {
    this._branch.removeObserver("", this);
  },

  observe: function(aSubject, aTopic, aData) {
    // removing existing easyGestures menus from open web pages
    eGm.removeExistingMenusFromPages();
    
    // rebulding the menu
    eGm = new eG_menu();
  }
};
