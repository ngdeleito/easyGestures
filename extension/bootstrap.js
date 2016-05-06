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


/* global Components, Services, eGm, eGPrefs, eGStrings */

Components.utils.import("resource://gre/modules/AddonManager.jsm");
Components.utils.import("resource://gre/modules/Services.jsm");

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
    eGm.init();
  }
};

function startup(data, reason) {
  Components.utils.import("chrome://easygestures/content/eGPrefs.jsm");
  Components.utils.import("chrome://easygestures/content/eGStrings.jsm");
  Components.utils.import("chrome://easygestures/content/menu.js");
  Components.utils.import("chrome://easygestures/content/eGActions.js");
  Services.scriptloader.loadSubScript("chrome://easygestures/content/integration.js");
  
  AddonManager.getAddonByID(data.id, function(addon) {
    // installing or upgrading preferences
    var count = {};
    Services.prefs.getChildList("extensions.easygestures.", count);
    if (reason == ADDON_INSTALL || (reason == ADDON_ENABLE && count.value === 0)) {
      // when installing an extension by copying it to the extensions folder
      // reason == ADDON_ENABLE, hence the test to see if there are already
      // preferences in the easygestures preferences branch
      eGPrefs.setDefaultSettings();
      eGPrefs.initializeStats();
    }
    else if (reason == ADDON_UPGRADE) {
      if (Services.vc.compare(data.oldVersion, "4.5") < 0) {
        eGPrefs.updateToV4_5();
      }
      if (Services.vc.compare(data.oldVersion, "4.6") < 0) {
        eGPrefs.updateToV4_6();
      }
      if (Services.vc.compare(data.oldVersion, "4.7") < 0) {
        eGPrefs.updateToV4_7();
      }
      if (Services.vc.compare(data.oldVersion, "4.8") < 0) {
        eGPrefs.updateToV4_8();
      }
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
    }
    
    // getting access to localization strings
    eGStrings.init(addon);
    
    // start listening to changes in preferences that could require rebuilding
    // the menus
    eGPrefsObserver.register();
    
    // creating menu
    eGm.init();
    
    // registering style sheet
    var sss = Components.classes["@mozilla.org/content/style-sheet-service;1"]
                        .getService(Components.interfaces.nsIStyleSheetService);
    var uri = Services.io.newURI("chrome://easygestures/skin/actions.css", null, null);
    if (!sss.sheetRegistered(uri, sss.AUTHOR_SHEET)) {
      sss.loadAndRegisterSheet(uri, sss.AUTHOR_SHEET);
    }
    
    eG_enableMenu();
    
    // displaying startup tips
    if (eGPrefs.areStartupTipsOn()) {
      let window = Services.wm.getMostRecentWindow("navigator:browser");
      if (window.document.readyState == "complete") {
        window.openDialog("chrome://easygestures/content/tips.xul", "",
                          "chrome,centerscreen,resizable");
      }
      else {
        window.addEventListener("load", function displayTipsAtStartup() {
          window.removeEventListener("load", displayTipsAtStartup, false);
          window.openDialog("chrome://easygestures/content/tips.xul", "",
                            "chrome,centerscreen,resizable");
        }, false);
      }
    }
  });
}

function shutdown() {
  // flushing because a string bundle was created
  Services.strings.flushBundles();
  
  // stop listening to changes in preferences
  eGPrefsObserver.unregister();
  
  // removing existing easyGestures menus from open web pages
  eGm.removeFromAllPages();
  
  // unregistering style sheet
  var sss = Components.classes["@mozilla.org/content/style-sheet-service;1"]
                      .getService(Components.interfaces.nsIStyleSheetService);
  var uri = Services.io.newURI("chrome://easygestures/skin/actions.css", null, null);
  if (sss.sheetRegistered(uri, sss.AUTHOR_SHEET)) {
    sss.unregisterSheet(uri, sss.AUTHOR_SHEET);
  }
  
  eG_disableMenu();
  
  Components.utils.unload("chrome://easygestures/content/eGActions.js");
  Components.utils.unload("chrome://easygestures/content/menu.js");
  Components.utils.unload("chrome://easygestures/content/eGStrings.jsm");
  Components.utils.unload("chrome://easygestures/content/eGPrefs.jsm");
}

function install() {
}

function uninstall(data, reason) {
  if (reason == ADDON_UNINSTALL) {
    var prefs = Services.prefs.getBranch("extensions.easygestures.");
    prefs.deleteBranch("");
  }
}
