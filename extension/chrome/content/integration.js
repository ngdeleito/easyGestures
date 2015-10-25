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


/* global eGActions, eGm, eGPrefs */

var eGc = {
  _blockStdContextMenu: false, // whether the std context menu should be suppressed
  keyPressed: 0, // used to control display of pie menu
  
  mouseupEventScreenX: null,
  mouseupEventScreenY: null,
  
  targetDocumentURL: null,
  targetWindowScrollY: null,
  targetWindowScrollMaxY: null,
  topmostWindowScrollY: null,
  topmostWindowScrollMaxY: null,
  topmostDocumentURL: null,
  topmostDocumentTitle: null,
  
  loading: false, // used for reload/stop action
  
  isStdContextMenuBlocked : function() {
    return this._blockStdContextMenu;
  },
  
  blockStdContextMenu : function() {
    this._blockStdContextMenu = true;
  },
  
  unblockStdContextMenu : function() {
    this._blockStdContextMenu = false;
  }
};

function eG_activateMenu(window) {
  // setting events handlers
  window.gBrowser.addEventListener("keydown", eG_handleKeydown, true);
  window.gBrowser.addEventListener("keyup", eG_handleKeyup, true);
  var contextMenu = window.document.getElementById("contentAreaContextMenu");
  if (contextMenu) {
    contextMenu.addEventListener("popupshowing", eG_handlePopup, true);
  }
  
  var globalMM = Components.classes["@mozilla.org/globalmessagemanager;1"]
               .getService(Components.interfaces.nsIMessageListenerManager);
  globalMM.loadFrameScript("chrome://easygestures/content/menu-frame.js", true);
  globalMM.addMessageListener("easyGesturesN@ngdeleito.eu:performOpenMenuChecks", eG_performOpenMenuChecks);
  globalMM.addMessageListener("easyGesturesN@ngdeleito.eu:handleMousedown", eG_handleMousedown);
  globalMM.addMessageListener("easyGesturesN@ngdeleito.eu:handleMouseup", eG_handleMouseup);
  globalMM.addMessageListener("easyGesturesN@ngdeleito.eu:handleMousemove", eG_handleMousemove);
}

function eG_deactivateMenu(window) {
  // removing event handlers
  window.gBrowser.removeEventListener("keydown", eG_handleKeydown, true);
  window.gBrowser.removeEventListener("keyup", eG_handleKeyup, true);
  var contextMenu = window.document.getElementById("contentAreaContextMenu");
  if (contextMenu) {
    contextMenu.removeEventListener("popupshowing", eG_handlePopup, true);
  }
  
  var globalMM = Components.classes["@mozilla.org/globalmessagemanager;1"]
               .getService(Components.interfaces.nsIMessageListenerManager);
  globalMM.broadcastAsyncMessage("easyGesturesN@ngdeleito.eu:removeMessageListeners");
  globalMM.removeMessageListener("easyGesturesN@ngdeleito.eu:performOpenMenuChecks", eG_performOpenMenuChecks);
  globalMM.removeMessageListener("easyGesturesN@ngdeleito.eu:handleMousedown", eG_handleMousedown);
  globalMM.removeMessageListener("easyGesturesN@ngdeleito.eu:handleMouseup", eG_handleMouseup);
  globalMM.removeMessageListener("easyGesturesN@ngdeleito.eu:handleMousemove", eG_handleMousemove);
}

function eG_countClicks(anEvent) {
  eGPrefs.incrementStatsClicksPref();
  
  // disabling counting clicks inside window if menu is displayed
  if (eGm.isShown()) {
    let window = anEvent.currentTarget;
    window.removeEventListener("mousedown", eG_countClicks, false);
  }
}

function eG_handleKeyup() {
  eGc.keyPressed = 0;
}

function eG_handleKeydown(event) {
  var window = event.target.ownerDocument.defaultView;
  
  // clear automatic delayed autoscrolling
  window.clearTimeout(eGm.autoscrollingTrigger);
  
  eGc.keyPressed = event.keyCode;
  
  if (eGm.isShown()) {
    if (event.keyCode === 18) { // Alt key
      eGm.switchLayout();
    }
    else if (event.keyCode === 27) { // ESC key
      event.preventDefault();
      eGm.close();
    }
  }
}

function eG_handleMouseup(aMessage) {
  var window = Services.wm.getMostRecentWindow("navigator:browser");
  
  // clear automatic delayed autoscrolling
  window.clearTimeout(eGm.autoscrollingTrigger);
  if (window.document.getElementById("content").mCurrentBrowser._scrollingView == null) {
    if (eGm.autoscrolling) {
      eGm.autoscrolling = false;
      if (eGm.isHidden()) {
        return; // avoid contextual menu when autoscrolling ends (this would be triggered below)
      }
    }
  }
  
  if (eGm.isHidden()) {
    if (!eGm.autoscrolling) {
      // avoid enabling contextual menu when autoscrolling
      eGc.unblockStdContextMenu();
      let browserMM = window.gBrowser.selectedBrowser.messageManager;
      browserMM.sendAsyncMessage("easyGesturesN@ngdeleito.eu:removeMousemoveListener");
    }
  }
  else if (eGm.isJustOpened()) {
    eGm.setOpen();
    eGm.openLinkThroughPieMenuCenter(aMessage.data.linkSignIsVisible,
                                     aMessage.data.button);
  }
  else if (eGm.isJustOpenedAndMouseMoved()) {
    if (eGm.sector !== -1) {
      eGc.mouseupEventScreenX = aMessage.data.screenX;
      eGc.mouseupEventScreenY = aMessage.data.screenY;
      eGm.runAction();
    }
    else {
      eGm.setOpen();
      return 1;
    }
  }
  else {
    if (aMessage.data.button === eGm.showAltButton) {
      return 1;
    }
    else {
      if (eGm.sector !== -1) {
        eGc.mouseupEventScreenX = aMessage.data.screenX;
        eGc.mouseupEventScreenY = aMessage.data.screenY;
        eGm.runAction();
      }
      else {
        eGm.close();
      }
    }
  }
}

function eG_handleMousemove(aMessage) {
  var window = Services.wm.getMostRecentWindow("navigator:browser");
  
  // clear automatic delayed autoscrolling
  window.clearTimeout(eGm.autoscrollingTrigger);
  
  return eGm.handleMousemove(aMessage.data);
}

function eG_performOpenMenuChecks(aMessage) {
  const MENU_IS_OPENED = 2;
  const MENU_CANT_BE_OPENED = 1;
  const MENU_SHOULD_BE_OPENED = 0;
  
  eGc.blockStdContextMenu();
  
  // check whether pie menu should change layout or hide (later)
  if (eGm.isShown() || eGm.autoscrollingState) {
    // toggle primitive/alternative pie menu
    eGm.autoscrollingState = false; // disable autoscrolling if any
    
    if (eGm.canLayoutBeSwitched(aMessage.data.button)) {
      eGm.switchLayout();
    }
    return MENU_IS_OPENED;
  }
  
  // check if menu should not be displayed
  if (!eGm.canBeOpened(aMessage.data.button, aMessage.data.shiftKey, aMessage.data.ctrlKey)) {
    eGc.unblockStdContextMenu();
    return MENU_CANT_BE_OPENED;
  }
  
  return MENU_SHOULD_BE_OPENED;
}

function eG_handleMousedown(aMessage) {
  eGm.contextualMenus = aMessage.data.contextualMenus;
  eGm.selection = aMessage.data.selection;
  eGm.anchorElementExists = aMessage.data.anchorElementExists;
  eGm.anchorElementHREF = aMessage.data.anchorElementHREF;
  eGm.imageElementDoesntExist = aMessage.data.imageElementDoesntExist;
  eGm.imageElementStyleWidth = aMessage.data.imageElementStyleWidth;
  eGm.imageElementWidth = aMessage.data.imageElementWidth;
  eGm.imageElementStyleHeight = aMessage.data.imageElementStyleHeight;
  eGm.imageElementHeight = aMessage.data.imageElementHeight;
  eGm.imageElementSRC = aMessage.data.imageElementSRC;
  eGm.centerX = aMessage.data.centerX;
  eGm.centerY = aMessage.data.centerY;
  eGc.targetDocumentURL = aMessage.data.targetDocumentURL;
  eGc.targetWindowScrollY = aMessage.data.targetWindowScrollY;
  eGc.targetWindowScrollMaxY = aMessage.data.targetWindowScrollMaxY;
  eGc.topmostWindowScrollY = aMessage.data.topmostWindowScrollY;
  eGc.topmostWindowScrollMaxY = aMessage.data.topmostWindowScrollMaxY;
  eGc.topmostDocumentURL = aMessage.data.topmostDocumentURL;
  eGc.topmostDocumentTitle = aMessage.data.topmostDocumentTitle;
  
  
  eG_openMenu();
  
  // give focus to browser (blur any outside-browser selected object so that it won't respond to keypressed event)
  var mainWindow = Services.wm.getMostRecentWindow("navigator:browser");
  mainWindow.gBrowser.focus();
  
  if (eGm.autoscrollingOn) {
    // automatic delayed autoscrolling on mouse down
    
    // making a partial clone of current evt for setTimeout because object will be lost
    // don't use autoscrollingEvent[i]=evt[i] because will cause selection pb on dragging with left mouse button
    eGm.autoscrollingTrigger = mainWindow.setTimeout(function() {
      eGm.autoscrolling = true;
      eGm.close();
      eGActions.autoscrolling.run();
    }, eGm.autoscrollingDelay);
  }
}

function eG_openMenu() {
  var window = Services.wm.getMostRecentWindow("navigator:browser");
  var browserMM = window.gBrowser.selectedBrowser.messageManager;
  browserMM.sendAsyncMessage("easyGesturesN@ngdeleito.eu:addMousemoveListener");
  
  // disabling selection when left mouse button is used until mouseup is done or menu is closed
  if (eGm.showButton == 0) { // left mouse button
    var selCon = window.gBrowser.docShell.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsISelectionDisplay).QueryInterface(Components.interfaces.nsISelectionController);
    selCon.setDisplaySelection(0); // SELECTION_OFF
  }
  
  if (eGm.contextualMenus.length !== 0 &&
      eGm.canContextualMenuBeOpened(eGc.keyPressed)) {
    eGm.show(eGm.contextualMenus[0]);
  }
  else {
    eGm.show("main");
  }
}

function eG_handlePopup(evt) {
  if (eGc.isStdContextMenuBlocked()) {
    evt.preventDefault();
  }
  eGc.unblockStdContextMenu();
}
