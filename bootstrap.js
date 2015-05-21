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


/* global eGPrefs, eGPrefsObserver */

Components.utils.import("resource://gre/modules/AddonManager.jsm");
Components.utils.import("resource://gre/modules/Services.jsm");

function stringBundle(addon) {
  function getLocaleThatFitsBest() {
    var browserLocale = Services.prefs.getCharPref("general.useragent.locale");
    var eGLocales = Components.classes["@mozilla.org/chrome/chrome-registry;1"]
                              .getService(Components.interfaces.nsIToolkitChromeRegistry)
                              .getLocalesForPackage("easygestures");
    var perfectMatch = false;
    var selectedLocale = "en-US"; // default locale
    
    while (eGLocales.hasMore() && !perfectMatch) {
      var locale = eGLocales.getNext();
      if (locale == browserLocale) {
        perfectMatch = true;
        selectedLocale = locale;
      }
      else if (locale.startsWith(browserLocale)) {
        // example: fr-FR startsWith fr
        selectedLocale = locale;
      }
    }
    return selectedLocale;
  }
  
  function getStringBundle(locale) {
    var path = "chrome/locale/" + locale + "/easygestures.properties";
    var propertiesFile = addon.getResourceURI(path);
    return Services.strings.createBundle(propertiesFile.spec);
  }
  
  var locale = getLocaleThatFitsBest();
  this.stringBundle = getStringBundle(locale);
  this.stringBundle.getSimpleEnumeration();
}

stringBundle.prototype = {
  stringBundle : null,
  
  getString : function(stringName) {
    return this.stringBundle.GetStringFromName(stringName);
  }
};

function loadEasyGesturesOn(window) {
  // making sure that easyGestures is only loaded on navigator windows and not
  // on e.g. preferences and console windows
  var wintype = window.document.documentElement.getAttribute("windowtype");
  if (wintype != "navigator:browser") {
    return;
  }
  
  eG_activateMenu(window);
  window.addEventListener("mousedown", eG_countClicks, false);
}

function loadEasyGesturesOnExistingWindow(window) {
  if (window.document.readyState == "complete") {
    loadEasyGesturesOn(window);
  }
  else {
    window.addEventListener("load", function runOnLoad() {
      window.removeEventListener("load", runOnLoad, false);
      loadEasyGesturesOn(window);
    }, false);
  }
}

function loadEasyGesturesOnNewWindow(aSubject, aTopic) {
  if (aTopic == "domwindowopened") {
    loadEasyGesturesOnExistingWindow(aSubject);
  }
}

function unloadEasyGesturesOn(window) {
  // this function is only called for navigator windows (no need thus for an
  // additional test)
  
  eG_deactivateMenu(window);
  window.removeEventListener("mousedown", eG_countClicks, false);
}

function startup(data, reason) {
  Services.scriptloader.loadSubScript("chrome://easygestures/content/integration.js");
  Services.scriptloader.loadSubScript("chrome://easygestures/content/preferences.js");
  Services.scriptloader.loadSubScript("chrome://easygestures/content/menu.js");
  Services.scriptloader.loadSubScript("chrome://easygestures/content/eGActions.js");
  
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
    }
    
    // getting access to localization strings
    eGc.localizing = new stringBundle(addon);
    
    // start listening to changes in preferences that could require rebuilding
    // the menus
    eGPrefsObserver.register();
    
    // creating menu
    eGm = new eG_menu();
    
    // registering style sheet
    var sss = Components.classes["@mozilla.org/content/style-sheet-service;1"]
                        .getService(Components.interfaces.nsIStyleSheetService);
    var uri = Services.io.newURI("chrome://easygestures/skin/actions.css", null, null);
    if (!sss.sheetRegistered(uri, sss.AUTHOR_SHEET)) {
      sss.loadAndRegisterSheet(uri, sss.AUTHOR_SHEET);
    }
    
    // activating easyGestures on current windows
    var currentWindows = Services.wm.getEnumerator("navigator:browser");
    while (currentWindows.hasMoreElements()) {
      loadEasyGesturesOnExistingWindow(currentWindows.getNext());
    }
    
    // start listening to new window events in order to activate easyGestures on
    // such windows
    Services.ww.registerNotification(loadEasyGesturesOnNewWindow);
    
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
  
  // disabling easyGestures on current windows
  var currentWindows = Services.wm.getEnumerator("navigator:browser");
  while (currentWindows.hasMoreElements()) {
    unloadEasyGesturesOn(currentWindows.getNext());
  }
  
  // stop listening to new window events
  Services.ww.unregisterNotification(loadEasyGesturesOnNewWindow);
}

function install() {
}

function uninstall(data, reason) {
  if (reason == ADDON_UNINSTALL) {
    var prefs = Services.prefs.getBranch("extensions.easygestures.");
    prefs.deleteBranch("");
  }
}
