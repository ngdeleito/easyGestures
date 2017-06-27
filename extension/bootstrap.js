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
  Jens Tinz, his portions are Copyright (C) 2002. All Rights Reserved.
  Ons Besbes.

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


/* exported startup, shutdown, install, uninstall */
/* global Components, Services */

Components.utils.import("resource://gre/modules/Services.jsm");

var eGMessageListeners = {
  retrieveAndAddFavicon: function(aMessage, sendResponse) {
    var aURL = aMessage.aURL;
    if (aURL.match(/\:\/\//i) === null) {
      aURL = "http://" + aURL;
    }
    
    var faviconService = Components
                           .classes["@mozilla.org/browser/favicon-service;1"]
                           .getService(Components.interfaces.mozIAsyncFavicons);
    faviconService.getFaviconURLForPage(Services.io.newURI(aURL, null, null), function(aURI) {
      sendResponse({
        aURL: aURI !== null ? aURI.spec : ""
      });
    });
    return true;
  }
};

function handleMessage(aMessage, sender, sendResponse) {
  if (eGMessageListeners[aMessage.messageName] !== undefined) {
    return eGMessageListeners[aMessage.messageName](aMessage, sendResponse);
  }
}

function startup(data) {
  data.webExtension.startup().then(api => {
    const {browser} = api;
    browser.runtime.onMessage.addListener(handleMessage);
  });
}

function shutdown() {
  // removing existing easyGestures menus from open web pages
  // eGPieMenu.removeFromAllPages();
}

function install() {
}

function uninstall() {
}
