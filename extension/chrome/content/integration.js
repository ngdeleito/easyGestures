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

The Original Code is RadialContext.

The Initial Developer of the Original Code is Jens Tinz.
Portions created by the Initial Developer are Copyright (C) 2002
the Initial Developer. All Rights Reserved.

Contributor(s):
  Ons Besbes.
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


/* exported eG_enableMenu, eG_disableMenu */
/* global eGActions, eGm, eGContext */

function eG_enableMenu() {
  Services.mm.loadFrameScript("chrome://easygestures/content/menu-frame.js", true);
  Services.mm.addMessageListener("easyGesturesN@ngdeleito.eu:performOpenMenuChecks", eG_performOpenMenuChecks);
  Services.mm.addMessageListener("easyGesturesN@ngdeleito.eu:handleMousedown", eG_handleMousedown);
  Services.mm.addMessageListener("easyGesturesN@ngdeleito.eu:handleMouseup", eG_handleMouseup);
  Services.mm.addMessageListener("easyGesturesN@ngdeleito.eu:handleKeydown", eG_handleKeydown);
  Services.mm.addMessageListener("easyGesturesN@ngdeleito.eu:handleContextmenu", eG_handleContextmenu);
  Services.mm.addMessageListener("easyGesturesN@ngdeleito.eu:handleMousemove", eG_handleMousemove);
  Services.mm.addMessageListener("easyGesturesN@ngdeleito.eu:retrieveAndAddFavicon", eG_retrieveAndAddFavicon);
}

function eG_disableMenu() {
  Services.mm.removeDelayedFrameScript("chrome://easygestures/content/menu-frame.js");
  Services.mm.broadcastAsyncMessage("easyGesturesN@ngdeleito.eu:removeListeners");
  Services.mm.removeMessageListener("easyGesturesN@ngdeleito.eu:performOpenMenuChecks", eG_performOpenMenuChecks);
  Services.mm.removeMessageListener("easyGesturesN@ngdeleito.eu:handleMousedown", eG_handleMousedown);
  Services.mm.removeMessageListener("easyGesturesN@ngdeleito.eu:handleMouseup", eG_handleMouseup);
  Services.mm.removeMessageListener("easyGesturesN@ngdeleito.eu:handleKeydown", eG_handleKeydown);
  Services.mm.removeMessageListener("easyGesturesN@ngdeleito.eu:handleContextmenu", eG_handleContextmenu);
  Services.mm.removeMessageListener("easyGesturesN@ngdeleito.eu:handleMousemove", eG_handleMousemove);
  Services.mm.removeMessageListener("easyGesturesN@ngdeleito.eu:retrieveAndAddFavicon", eG_retrieveAndAddFavicon);
}

function eG_performOpenMenuChecks(aMessage) {
  const PREVENT_DEFAULT_AND_OPEN_MENU = 0;
  const PREVENT_DEFAULT_AND_RETURN = 1;
  const LET_DEFAULT_AND_RETURN = 2;
  var window = Services.wm.getMostRecentWindow("navigator:browser");
  
  // clear automatic delayed autoscrolling
  window.clearTimeout(eGContext.autoscrollingTrigger);
  
  // check whether pie menu should change layout or hide (later)
  if (eGm.isShown()) {
    if (eGm.canLayoutBeSwitched(aMessage.data.button)) {
      eGm.switchLayout();
    }
    return PREVENT_DEFAULT_AND_RETURN;
  }
  
  // check if menu should not be displayed
  if (!eGm.canBeOpened(aMessage.data.button, aMessage.data.shiftKey,
                       aMessage.data.ctrlKey, aMessage.data.altKey)) {
    return LET_DEFAULT_AND_RETURN;
  }
  
  return PREVENT_DEFAULT_AND_OPEN_MENU;
}

function eG_handleMousedown(aMessage) {
  eGContext.contextualMenus = aMessage.data.contextualMenus;
  eGContext.selection = aMessage.data.selection;
  eGContext.anchorElementExists = aMessage.data.anchorElementExists;
  eGContext.anchorElementHREF = aMessage.data.anchorElementHREF;
  eGContext.anchorElementText = aMessage.data.anchorElementText;
  eGContext.imageElementDoesntExist = aMessage.data.imageElementDoesntExist;
  eGContext.imageElementSRC = aMessage.data.imageElementSRC;
  eGm.centerX = aMessage.data.centerX;
  eGm.centerY = aMessage.data.centerY;
  eGContext.targetDocumentURL = aMessage.data.targetDocumentURL;
  eGContext.targetWindowScrollY = aMessage.data.targetWindowScrollY;
  eGContext.targetWindowScrollMaxY = aMessage.data.targetWindowScrollMaxY;
  eGContext.topmostWindowScrollY = aMessage.data.topmostWindowScrollY;
  eGContext.topmostWindowScrollMaxY = aMessage.data.topmostWindowScrollMaxY;
  
  if (eGContext.contextualMenus.length !== 0 &&
      eGm.canContextualMenuBeOpened(aMessage.data.ctrlKey, aMessage.data.altKey)) {
    eGm.show(eGContext.contextualMenus[0]);
  }
  else {
    eGm.show("main");
  }
  
  // give focus to browser (blur any outside-browser selected object so that it won't respond to keypressed event)
  var window = Services.wm.getMostRecentWindow("navigator:browser");
  window.gBrowser.focus();
  
  if (eGm.autoscrollingOn) {
    eGContext.autoscrollingTrigger = window.setTimeout(function() {
      eGActions.autoscrolling.run();
    }, eGm.autoscrollingDelay);
  }
}

function eG_handleMouseup(aMessage) {
  var preventDefaultUponReturn = false;
  var window = Services.wm.getMostRecentWindow("navigator:browser");
  
  if (eGm.isJustOpened()) {
    eGm.setOpen();
    if (aMessage.data.linkSignIsVisible) {
      window.clearTimeout(eGContext.autoscrollingTrigger);
      eGm.openLinkThroughPieMenuCenter(aMessage.data.button);
    }
  }
  else if (eGm.isJustOpenedAndMouseMoved()) {
    if (eGm.sector !== -1) {
      eGm.runAction();
    }
    else {
      eGm.setOpen();
      preventDefaultUponReturn = true;
    }
  }
  else if (eGm.isShown()) {
    if (aMessage.data.button === eGm.showAltButton) {
      preventDefaultUponReturn = true;
    }
    else {
      if (eGm.sector !== -1) {
        eGm.runAction();
      }
      else {
        eGm.close();
      }
    }
  }
  
  return preventDefaultUponReturn;
}

function eG_handleKeydown(aMessage) {
  var window = Services.wm.getMostRecentWindow("navigator:browser");
  
  // clear automatic delayed autoscrolling
  window.clearTimeout(eGContext.autoscrollingTrigger);
  
  if (eGm.isShown()) {
    if (aMessage.data.altKey) {
      eGm.switchLayout();
    }
    else if (aMessage.data.escKey) {
      eGm.close();
    }
  }
}

function eG_handleContextmenu(aMessage) {
  return eGm.canContextmenuBeOpened(aMessage.data.shiftKey,
                                    aMessage.data.ctrlKey,
                                    aMessage.data.altKey);
}

function eG_handleMousemove(aMessage) {
  var window = Services.wm.getMostRecentWindow("navigator:browser");
  
  // clear automatic delayed autoscrolling
  window.clearTimeout(eGContext.autoscrollingTrigger);
  
  return eGm.handleMousemove(aMessage.data);
}

function eG_retrieveAndAddFavicon(aMessage) {
  var aURL = aMessage.data.aURL;
  if (aURL === "") {
    return ;
  }
  
  if (aURL.match(/\:\/\//i) === null) {
    aURL = "http://" + aURL;
  }
  
  var faviconService = Components
                         .classes["@mozilla.org/browser/favicon-service;1"]
                         .getService(Components.interfaces.mozIAsyncFavicons);
  faviconService.getFaviconURLForPage(Services.io.newURI(aURL, null, null), function(aURI) {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    var browserMM = window.gBrowser.selectedBrowser.messageManager;
    browserMM.sendAsyncMessage("easyGesturesN@ngdeleito.eu:addFavicon", {
      anActionNodeID: aMessage.data.anActionNodeID,
      aURL: aURI !== null ? aURI.spec : ""
    });
  });
}
