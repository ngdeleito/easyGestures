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

function eG_setDefaultMenus() {
  var prefs = Services.prefs.getBranch("easygestures.");
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
    prefs.setCharPref("actions." + menuName, actions);
  }
}

function eG_setDefaultSettings() {
  var prefs = Services.prefs.getBranch("easygestures.");
  
  prefs.setCharPref("profile.version", eGc.version);
  prefs.setBoolPref("profile.startupTips", true);
  prefs.setIntPref("profile.tipNbr", 1); // used in tips.xul
  
  var window = Services.wm.getMostRecentWindow("navigator:browser");
  if (window.navigator.userAgent.indexOf("Mac") == -1) {
    prefs.setIntPref("behavior.showButton", 1); // middle button
    prefs.setIntPref("behavior.showKey", 0); // 0=none 16=shift 17=ctrl
    prefs.setIntPref("behavior.showAltButton", 2); // right button
    prefs.setIntPref("behavior.supprKey", 45); // 18=alt 45=insert
    prefs.setIntPref("behavior.contextKey", 17);
    prefs.setBoolPref("behavior.handleLinksAsOpenLink", true);
  }
  else {
    // mac users need different defaults
    prefs.setIntPref("behavior.showButton", 0);
    prefs.setIntPref("behavior.showKey", 16);
    prefs.setIntPref("behavior.showAltButton", 2); // a shift-right click on Mac gives a right mouse click
    prefs.setIntPref("behavior.supprKey", 17);
    prefs.setIntPref("behavior.contextKey", 0);
    prefs.setBoolPref("behavior.handleLinksAsOpenLink", false);
  }
  
  prefs.setBoolPref("behavior.showAfterDelay", false);
  prefs.setIntPref("behavior.showAfterDelayDelay", 200);
  prefs.setBoolPref("behavior.dragOnly", false);
  prefs.setBoolPref("behavior.dragOnlyUpLeft", false);
  prefs.setBoolPref("behavior.contextMenuAuto", false); // Show contextual pie menu automatically
  
  prefs.setBoolPref("behavior.moveAuto", false); // must press <Shitf> key to move menu
  prefs.setBoolPref("behavior.largeMenu", false);
  prefs.setIntPref("behavior.menuOpacity", 100); // set in % but will be converted when used in style.opacity
  prefs.setBoolPref("behavior.noIcons", false);
  prefs.setBoolPref("behavior.smallIcons", false);
  prefs.setBoolPref("behavior.showTooltips", true);
  prefs.setIntPref("behavior.tooltipsDelay", 1000);
  prefs.setBoolPref("behavior.tooltipsDelayOmit", false);
  prefs.setBoolPref("behavior.handleLinks", true);
  prefs.setIntPref("behavior.linksDelay", 300);
  prefs.setBoolPref("behavior.autoscrollingOn", false);
  prefs.setIntPref("behavior.autoscrollingDelay", 750);
  
  prefs.setCharPref("behavior.dailyReadingsFolderURI", "");
  
  prefs.setBoolPref("actions.mainAlternative1", true); // activate main alternative 1 layout
  prefs.setBoolPref("actions.mainAlternative2", false);
  prefs.setBoolPref("actions.extraAlternative1", true);
  prefs.setBoolPref("actions.extraAlternative2", false);
  prefs.setBoolPref("actions.contextImageFirst", false);
  prefs.setBoolPref("actions.contextTextboxFirst", true);
  eG_setDefaultMenus();
  
  prefs.setCharPref("customizations.loadURLin", "newTab"); // execute 'load URL' action in "curTab" or "newTab" or "newWindow"
  
  var string = Components.classes["@mozilla.org/supports-string;1"]
                         .createInstance(Components.interfaces.nsISupportsString);
  for (let i=1; i<=20; i++) {
    string.data = "\u2022\u2022false\u2022\u2022false\u2022false"; // name, text, isScript, newIconPath, favicon, newIcon: '•' is the separator
    prefs.setComplexValue("customizations.loadURLScript" + i, Components.interfaces.nsISupportsString, string); // complex value used here to support non-ascii characters
  }
  
  prefs.setCharPref("customizations.openLink", "newTab"); // "curTab"  or "newTab" or "newWindow"
  prefs.setBoolPref("customizations.closeBrowserOnLastTab", true);
}

function eG_initializeStats() {
  // this function is also called in options.xul with 'false' argument to reset
  // preferences
  var prefs = Services.prefs.getBranch("easygestures.");
  
  var numberOfActions;
  if (typeof eG_menuItems === "undefined") {
    numberOfActions = eG_PopupImages.length;
  }
  else {
    numberOfActions = eG_menuItems.length;
  }
  
  prefs.setIntPref("profile.statsClicks", 0); // clicks inside window excluding clicks inside menu
  prefs.setIntPref("profile.statsUse", 0); // calls for menu
  var d = new Date(); // date of last reset
  prefs.setCharPref("profile.statsLastReset", d.getFullYear() + "/" + (d.getMonth()+1) + "/"+d.getDate()+"  "+ d.getHours()+":"+(d.getMinutes()<10? "0":"")+d.getMinutes()+":"+(d.getSeconds()<10? "0":"")+d.getSeconds() );
  prefs.setCharPref("profile.statsMain","[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]"); // saved as source of an Array
  prefs.setCharPref("profile.statsExtra","[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]"); // saved as source of an Array
  var actionsStr = new Array();
  for (let i=0; i<numberOfActions; i++) {
    actionsStr.push(0); // all actions stats set to 0
  }
  prefs.setCharPref("profile.statsActions", actionsStr.toSource()); // saved as source of an Array
}

function eG_updateToVersion43() {
  // update actions numbers, labels and stats because of addition of 3 new actions
  var menus = new Array("main", "mainAlt1", "mainAlt2", "extra", "extraAlt1",
                        "extraAlt2", "contextLink", "contextImage",
                        "contextSelection","contextTextbox");
  
  for (var i=0; i<menus.length; i++) {
    var actionsSplit = eG_prefsObs.prefs.getCharPref("actions." + menus[i]).split("/");
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
    eG_prefsObs.prefs.setCharPref("actions." + menus[i], actionsPrefs);
  }
  
  // update actions stats
  var prevActionsStr = (new Function ("return " + eG_prefsObs.prefs.getCharPref("profile.statsActions")))(); // (new Function ("return " + data ))() replacing eval on data
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
  
  eG_prefsObs.prefs.setCharPref("profile.statsActions", actionsStr.toSource()); // saved as source of an Array
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
    eG_setDefaultSettings();
    eG_initializeStats();
  }
  
  // update version
  prefs.setCharPref("profile.version", eGc.version);
}

function eG_prefsObserver() {
  // observes changes in the Options Dialog
  try {
    // add the observer
    var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                          .getService(Components.interfaces.nsIPrefService)
                          .getBranch(null);
    prefs.QueryInterface(Components.interfaces.nsIPrefBranchInternal)
         .addObserver("easygestures.stateChange.prefs", this, false);
  }
  catch (ex) {
  }
  
  this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
                         .getService(Components.interfaces.nsIPrefService)
                         .getBranch("easygestures.");
  this.domain = "easygestures";
  
  this.observe = function(subject, topic, pname) {
    // handle changes in preferences
    try {
      // clean all previous insertions inside page
      if (eGc.frame_doc != null) {
        var layoutNames = new Array("main", "mainAlt1", "mainAlt2", "extra",
                                    "extraAlt1", "extraAlt2", "contextLink",
                                    "contextImage", "contextSelection",
                                    "contextTextbox");
        var targetNode;
        for (var i=0; i<layoutNames.length; i++) {
          targetNode = eGc.frame_doc.getElementById("eG_actions_" + layoutNames[i]); // actions
          if (targetNode != null) {
            targetNode.parentNode.removeChild(targetNode);
          }
          targetNode = eGc.frame_doc.getElementById("eG_labels_" + layoutNames[i]); // labels
          if (targetNode!=null) {
            targetNode.parentNode.removeChild(targetNode);
          }
        }
      }
      
      eGm = new eG_menu(); // rebuild menu
      
      // disable mouse scroll if middle mouse button is menu's button
      if (eGm.showButton == 1) {
        var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                              .getService(Components.interfaces.nsIPrefService)
                              .getBranch("general.");
        if (prefs.getBoolPref("autoScroll")) {
          prefs.setBoolPref("autoScroll", false);
        }
      }
    }
    catch (ex) {
      alert(ex);
    }
  }
}
