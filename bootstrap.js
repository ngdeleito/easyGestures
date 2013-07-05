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
}

function loadEasyGesturesOn(window) {
  // make sure that easyGestures is only loaded on navigator windows and not on
  // e.g. preferences and console windows
  var wintype = window.document.documentElement.getAttribute("windowtype");
  if (wintype != "navigator:browser") {
    return;
  }
  
  eG_initMenuIntegration(window);
  window.addEventListener("unload", eG_handleUnload, false);
  window.addEventListener("mousedown", eG_countClicks, false);
}

function unloadEasyGesturesOn(window) {
  // this function is only called for navigator windows (no need thus for an
  // additional test)
  
  eG_deactivateMenu(window);
  window.removeEventListener("unload", eG_handleUnload, false);
  window.removeEventListener("mousedown", eG_countClicks, false);
}

function loadEasyGesturesOnNewWindow(aSubject, aTopic, aData) {
  if (aTopic == "domwindowopened") {
    if (aSubject.document.readyState == "complete") {
      loadEasyGesturesOn(aSubject);
    }
    else {
      aSubject.addEventListener("load", function runOnLoad() {
        aSubject.removeEventListener("load", runOnLoad, false);
        loadEasyGesturesOn(aSubject);
      }, false);
    }
  }
}

function startup(data, reason) {
  AddonManager.getAddonByID(data.id, function(addon) {
    Services.scriptloader.loadSubScript("chrome://easygestures/content/integration.js");
    Services.scriptloader.loadSubScript("chrome://easygestures/content/preferences.js");
    Services.scriptloader.loadSubScript("chrome://easygestures/content/menu.js");
    Services.scriptloader.loadSubScript("chrome://easygestures/content/functions.js");
  
    eGc.localizing = new stringBundle(addon);

    var currentWindows = Services.wm.getEnumerator("navigator:browser");
    while (currentWindows.hasMoreElements()) {
      loadEasyGesturesOn(currentWindows.getNext());
    }

    Services.ww.registerNotification(loadEasyGesturesOnNewWindow);
  });
}

function shutdown(data, reason) {
  // flushing because a string bundle was created
  Services.strings.flushBundles();
  
  var currentWindows = Services.wm.getEnumerator("navigator:browser");
  while (currentWindows.hasMoreElements()) {
    unloadEasyGesturesOn(currentWindows.getNext());
  }
  
  Services.ww.unregisterNotification(loadEasyGesturesOnNewWindow);
}

function install(data, reason) {
}

function uninstall(data, reason) {
  if (reason == ADDON_UNINSTALL) {
    var prefs = Services.prefs.getBranch("easygestures.");
    prefs.deleteBranch("");
  }
}
