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
  
  mouseupEvent: null,
  doc: null,
  body: null,
  frame_doc: null,
  loading: false, // used for reload/stop action
  
  // used for drag movements in 'open when dragging' situations
  clientXDown: -1,
  clientYDown: -1,
  showAfterDelayTimer: null, // trigger to display menu after delay
  
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
  window.gBrowser.addEventListener("mousedown", eG_handleMousedown, true);
  window.gBrowser.addEventListener("mouseup", eG_handleMouseup, true);
  window.gBrowser.addEventListener("keydown", eG_handleKeydown, true);
  window.gBrowser.addEventListener("keyup", eG_handleKeyup, true);
  var contextMenu = window.document.getElementById("contentAreaContextMenu");
  if (contextMenu) {
    contextMenu.addEventListener("popupshowing", eG_handlePopup, true);
  }
}

function eG_deactivateMenu(window) {
  // removing event handlers
  window.gBrowser.removeEventListener("mousedown", eG_handleMousedown, true);
  window.gBrowser.removeEventListener("mouseup", eG_handleMouseup, true);
  window.gBrowser.removeEventListener("keydown", eG_handleKeydown, true);
  window.gBrowser.removeEventListener("keyup", eG_handleKeyup, true);
  var contextMenu = window.document.getElementById("contentAreaContextMenu");
  if (contextMenu) {
    contextMenu.removeEventListener("popupshowing", eG_handlePopup, true);
  }
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

function eG_cleanSelection(selection) {
  var result = selection.toString();
  result = result.trim();
  result = result.replace(/(\n|\r|\t)+/g, " "); // replace all Linefeed, Carriage return & Tab with a space
  return result;
}

function eG_handleMouseup(evt) {
  var window = Services.wm.getMostRecentWindow("navigator:browser");
  
  window.clearTimeout(eGc.showAfterDelayTimer);
  eGc.showAfterDelayTimer = null;
  
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
      window.removeEventListener("mousemove", eG_handleMousemove, true);
    }
  }
  else if (eGm.isJustOpened()) {
    eGm.setOpen();
    eGm.openLinkThroughPieMenuCenter(evt.button);
  }
  else if (eGm.isJustOpenedAndMouseMoved()) {
    if (eGm.sector !== -1) {
      eGc.mouseupEvent = evt;
      eGm.runAction();
    }
    else {
      evt.preventDefault(); // prevent current selection (if any) from being flushed by the click being processed
      eGm.setOpen();
    }
  }
  else {
    if (evt.button === eGm.showAltButton) {
      evt.preventDefault(); // prevent current selection (if any) from being flushed by the click being processed
    }
    else {
      if (eGm.sector !== -1) {
        eGc.mouseupEvent = evt;
        eGm.runAction();
      }
      else {
        eGm.close();
      }
    }
  }
}

function eG_handleMousemove(evt) {
  var window = evt.target.ownerDocument.defaultView;
  
  if (evt.originalTarget.ownerDocument != eGc.frame_doc) {
    return;
  }
  
  // clear automatic delayed autoscrolling
  window.clearTimeout(eGm.autoscrollingTrigger);
  
  eGm.handleMousemove(evt);
}

function eG_handleMousedown(evt) {
  var window = evt.target.ownerDocument.defaultView;
  
  eGc.blockStdContextMenu();
  
  // check whether pie menu should change layout or hide (later)
  if (eGm.isShown() || eGm.autoscrollingState) {
    // toggle primitive/alternative pie menu
    eGm.autoscrollingState = false; // disable autoscrolling if any
    
    if (eGm.canLayoutBeSwitched(evt.button)) {
      eGm.switchLayout();
    }
    evt.preventDefault(); // prevent current selection (if any) from being flushed by the click being processed
    return;
  }
  
  // check if menu should not be displayed
  if (!eGm.canBeOpened(evt)) {
    eGc.unblockStdContextMenu();
    return;
  }
  
  // start timer for delayed show up
  if (eGc.showAfterDelayTimer == null && eGm.showAfterDelay) {
    eGc.showAfterDelayTimer = window.setTimeout(eG_showAfterDelay, eGm.showAfterDelayValue);
  }
    
  // identify context, find body etc
  eGc.doc = evt.target.ownerDocument;
  eGc.frame_doc = evt.originalTarget.ownerDocument;
  eGc.body = eGc.frame_doc.documentElement;
  
  eGm.setContext(evt.target, window, eG_cleanSelection(evt.view.getSelection()));
  
  eGc.clientXDown = evt.clientX;
  eGc.clientYDown = evt.clientY;
  
  if (!eGm.showAfterDelay) {
    //evt.preventDefault();
    eG_openMenu();
  }
  
  // give focus to browser (blur any outside-browser selected object so that it won't respond to keypressed event)
  var mainWindow = Services.wm.getMostRecentWindow("navigator:browser");
  mainWindow.gBrowser.focus();
  
  if (eGm.autoscrollingOn) {
    // automatic delayed autoscrolling on mouse down
    
    // making a partial clone of current evt for setTimeout because object will be lost
    // don't use autoscrollingEvent[i]=evt[i] because will cause selection pb on dragging with left mouse button
    eGm.autoscrollingTrigger = window.setTimeout(function() {
      eGm.autoscrolling = true;
      eGm.close();
      eGActions.autoscrolling.run();
    }, eGm.autoscrollingDelay);
  }
}

function eG_showAfterDelay() {
  var window = Services.wm.getMostRecentWindow("navigator:browser");
  window.clearTimeout(eGc.showAfterDelayTimer);
  eGc.showAfterDelayTimer = null;
  eG_openMenu();
}

function eG_openMenu() {
  var window = Services.wm.getMostRecentWindow("navigator:browser");
  window.addEventListener("mousemove", eG_handleMousemove, true);
  
  // disabling selection when left mouse button is used until mouseup is done or menu is closed
  if (eGm.showButton == 0) { // left mouse button
    var selCon = window.gBrowser.docShell.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsISelectionDisplay).QueryInterface(Components.interfaces.nsISelectionController);
    selCon.setDisplaySelection(0); // SELECTION_OFF
  }
  
  eGm.clientX = eGc.clientXDown;
  eGm.clientY = eGc.clientYDown;
  
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

function retrieveFavicon(url, callback) {
  if (url !== "") {
    if (url.match(/\:\/\//i) === null) {
      url = "http://" + url;
    }
    
    var faviconService = Components
                           .classes["@mozilla.org/browser/favicon-service;1"]
                           .getService(Components.interfaces.mozIAsyncFavicons);
    faviconService.getFaviconURLForPage(Services.io.newURI(url, null, null), function(aURI) {
      callback(aURI);
    });
  }
}
