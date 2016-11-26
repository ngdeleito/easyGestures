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


/* exported EXPORTED_SYMBOLS, eGUtils */
/* global Components, Services, eGStrings */

var EXPORTED_SYMBOLS = ["eGUtils"];

Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("chrome://easygestures/content/eGStrings.jsm");

var eGUtils = {
  showOrOpenTab: function(aURL, giveFocus) {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    var gBrowser = window.gBrowser;
    var i;
    var found = false;
    var tab;
    
    for (i = 0; i < gBrowser.tabs.length && !found; ++i) {
      let browser = gBrowser.getBrowserForTab(gBrowser.tabs[i]);
      found = browser.currentURI.specIgnoringRef === aURL.split("#")[0];
    }
    if (found) {
      tab = gBrowser.tabs[--i];
      if (aURL.includes("#")) {
        let currentTab = gBrowser.selectedTab;
        gBrowser.selectedTab = tab;
        gBrowser.loadURI(aURL);
        gBrowser.selectedTab = currentTab;
      }
    }
    else {
      tab = gBrowser.addTab(aURL);
    }
    if (giveFocus) {
      gBrowser.selectedTab = tab;
    }
    
    window.focus();
  },
  
  setDocumentTitle: function(document, titleStringName) {
    document.title = eGStrings.getString(titleStringName) + " " +
                     document.title;
  },
  
  setDocumentLocalizedStrings: function(document, idStringNameMap) {
    idStringNameMap.forEach(function(stringName, id) {
      document.getElementById(id).textContent = eGStrings.getString(stringName);
    });
  }
};
