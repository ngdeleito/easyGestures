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


/* exported EXPORTED_SYMBOLS, eGStrings */
/* global Components, Services */

var EXPORTED_SYMBOLS = ["eGStrings"];

Components.utils.import("resource://gre/modules/AddonManager.jsm");
Components.utils.import("resource://gre/modules/Services.jsm");

var eGStrings = {
  _stringBundle : null,
  
  init : function(addon) {
    function getLocaleThatFitsBest() {
      var browserLocale =
            Services.prefs.getCharPref("general.useragent.locale");
      var eGLocales =
            Components.classes["@mozilla.org/chrome/chrome-registry;1"]
              .getService(Components.interfaces.nsIToolkitChromeRegistry)
              .getLocalesForPackage("easygestures");
      var perfectMatch = false;
      var selectedLocale = "en-US"; // default locale
      
      while (eGLocales.hasMore() && !perfectMatch) {
        var locale = eGLocales.getNext();
        if (locale === browserLocale) {
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
    this._stringBundle = getStringBundle(locale);
    this._stringBundle.getSimpleEnumeration();
  },
  
  getString : function(stringName) {
    return this._stringBundle.GetStringFromName(stringName);
  }
};
