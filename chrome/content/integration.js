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

var eGc = {
  localizing: null, // Access to string bundle for easygestures.properties file
  
  _blockStdContextMenu: false, // whether the std context menu should be suppressed
  keyPressed: 0, // used to control display of pie menu
  
  contextType: [], // contextLink, contextImage, contextSelection or contextTextbox
  evtMouseDown: null,
  doc: null,
  body: null,
  frame_doc: null,
  loading: false, // used for reload/stop action
  
  link: null, // the whole node link
  image: null,
  selection: null, //contains the text of the selected object
  selectionNode: null, //used for Textarea & Text Input
  
  // used for drag movements in 'open when dragging' situations
  pageYDown: -1,
  clientXDown: -1,
  clientYDown: -1,
  screenYDown: -1,
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

var eGm = null;

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
  if (eGm.isMenuDisplayed()) {
    let window = anEvent.currentTarget;
    window.removeEventListener("mousedown", eG_countClicks, false);
  }
}

function eG_handleKeyup(event) {
  eGc.keyPressed = 0;
}

function eG_handleKeydown(event) {
  var window = event.target.ownerDocument.defaultView;
  
  // clear automatic delayed autoscrolling
  window.clearTimeout(eGm.autoscrollingTrigger);
  
  eGc.keyPressed = event.keyCode;
  
  if (eGm.isMenuDisplayed()) {
    if (event.keyCode === 18) { // Alt key
      eGm.switchLayout();
    }
    else if (event.keyCode === 27) { // ESC key
      event.preventDefault();
      eGm.close();
    }
  }
}

function eG_getSelection() { // find text selection in current HTML document
  var sel = eGc.evtMouseDown.view.getSelection();
  sel = sel.toString();
  sel = sel.trim();
  sel = sel.replace(/(\n|\r|\t)+/g, " "); // replace all Linefeed, Carriage return & Tab with a space
  return sel;
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
      if (eGm.isMenuHidden()) {
        return; // avoid contextual menu when autoscrolling ends (this would be triggered below)
      }
    }
  }
  
  // menuState:    0-> not shown    1-> showing   2-> showing & mouse moved    3-> staying open
  if (eGm.isMenuHidden()) {
    if (!eGm.autoscrolling) {
      // avoid enabling contextual menu when autoscrolling
      eGc.unblockStdContextMenu();
      window.removeEventListener("mousemove", eG_handleMousemove, true);
    }
  }
  else if (eGm.menuState == 1) {
    eGm.menuState = 3;
    
    var linkSign = eGc.frame_doc.getElementById("eG_SpecialNodes").childNodes[0];
    if (linkSign.style.visibility == "visible" && eGc.link != null && eGm.handleLinks && (evt.button != eGm.showAltButton && eGm.showButton != eGm.showAltButton || eGm.showButton == eGm.showAltButton)) {
      // if a link is clicked without dragging and related option is checked
      // note: after a short delay linkSign is hidden in update() function to cancel opening of link and keep menu open after a short wait on link without moving mouse
      if (eGm.handleLinksAsOpenLink) {
        eGActions.openLink.run();
      }
      else {
        // when option "use browser behavior" is checked to open links
        // middle clicking on a link through eG must display the link in a new tab or new window according to corresponding Firefox pref.
        if (evt.button == 1) {
          // middle click
          var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("browser.");
          if (prefs.getBoolPref("tabs.opentabfor.middleclick")) {
            window.gBrowser.addTab(eGc.link.href);
          }
          else {
            window.open(eGc.link.href);
          }
        }
        else {
          window.gBrowser.loadURI(eGc.link.href);
        }
      }
      eGm.close();
    }
  }
  else {
    if (evt.button == eGm.showAltButton && ((eGm.menuState != 2 || eGm.menuState == 2 && eGm.sector == -1) && eGm.showAltButton == eGm.showButton || eGm.showAltButton != eGm.showButton)) {
      evt.preventDefault(); // prevent current selection (if any) from being flushed by the click being processed
    }
    else {
      if (eGm.sector !== -1) {
        eGm.runAction();
      }
      else if (eGm.menuState != 2) {
        eGm.close();
      }
      else {
        eGm.menuState = 3;
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
  
  // hide center icon if mouse moved
  var linkSign = eGc.frame_doc.getElementById("eG_SpecialNodes").childNodes[0];
  linkSign.style.visibility = "hidden";
  
  eGm.handleMousemove(evt);
}

function eG_handleMousedown(evt) {
  var window = evt.target.ownerDocument.defaultView;
  
  eGc.blockStdContextMenu();
  
  // check whether pie menu should change layout or hide (later)
  if (eGm.isMenuDisplayed() || eGm.autoscrollingState) {
    // toggle primitive/alternative pie menu
    eGm.autoscrollingState = false; // disable autoscrolling if any
    
    if (evt.button == eGm.showAltButton && (eGm.showAltButton != eGm.showButton || eGm.sector == -1 && eGm.showAltButton == eGm.showButton)) {
      eGm.switchLayout();
    }
    evt.preventDefault(); // prevent current selection (if any) from being flushed by the click being processed
    return;
  }
  
  // check if menu should not be displayed
  if ((evt.button != eGm.showButton) ||
      (eGc.keyPressed != eGm.showKey && eGm.showKey != 0) ||
      (eGc.keyPressed == eGm.suppressKey && eGm.suppressKey != 0)) {
    eGc.unblockStdContextMenu();
    eGc.keyPressed = 0;
    return;
  }
  
  // start timer for delayed show up
  if (eGc.showAfterDelayTimer == null && eGm.showAfterDelay) {
    eGc.showAfterDelayTimer = window.setTimeout(eG_showAfterDelay, eGm.showAfterDelayValue);
  }
  
  // copying parts of evt object
  eGc.evtMouseDown = {}; // don't just keep a reference to evt because evt will change before it can be used properly
  eGc.evtMouseDown.originalTarget = evt.originalTarget;
  eGc.evtMouseDown.view=evt.view;
  
  eGc.image = null; // removes the pointed image if any
  eGc.link = null; // removes the pointed link if any
  eGc.selection = null; // removes the selected text if any
  eGc.selectionNode = null; // removes the selected node if any
  
  // identify context, find body etc
  eGc.doc = evt.target.ownerDocument;
  eGc.frame_doc = evt.originalTarget.ownerDocument;
  eGc.body = eGc.frame_doc.documentElement;
  
  eGc.selection = eG_getSelection();
  
  for (var node = evt.originalTarget; node != null; node = node.parentNode) {
    if (node.nodeType == window.Node.ELEMENT_NODE) {
      if ((node instanceof window.HTMLAreaElement) || (node instanceof window.HTMLAnchorElement)) {
        if (node.href != null && node.href != "") {
          eGc.link = node;
        }
      }
      else if (node instanceof window.HTMLImageElement) {
        eGc.image = node;
      }
      else if (node instanceof window.HTMLTextAreaElement) {
        eGc.selection = node.value.substring(node.selectionStart,node.selectionEnd);
        eGc.selectionNode = node;
      }
      else if (node instanceof window.HTMLInputElement) {
        if (node.type.toUpperCase() == "TEXT" || node.type.toUpperCase() == "PASSWORD") {
          eGc.selection = node.value.substring(node.selectionStart,node.selectionEnd);
          eGc.selectionNode = node;
        }
      }
    }
  }
  
  // set eGc.contextType property for contextual menu displaying
  eGc.contextType = [];
  if (eGc.link !== null) {
    eGc.contextType.push("contextLink");
  }
  if (eGc.image !== null) {
    if (eGm.contextImageFirst) {
      eGc.contextType.unshift("contextImage");
    }
    else {
      eGc.contextType.push("contextImage");
    }
  }
  if (eGc.contextType.length === 0) {
    // no need to go further if already link or image
    if (eGc.selection !== null && eGc.selection !== "") {
      eGc.contextType.push("contextSelection");
    }
    if (eGc.selectionNode !== null) {
      if (eGm.contextTextboxFirst) {
        eGc.contextType.unshift("contextTextbox");
      }
      else {
        eGc.contextType.push("contextTextbox");
      }
    }
  }
  
  eGc.pageYDown = evt.pageY;
  eGc.clientXDown = evt.clientX;
  eGc.clientYDown = evt.clientY;
  eGc.screenYDown = evt.screenY;
  
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
  
  eGm.pageY = eGc.pageYDown;
  eGm.clientX = eGc.clientXDown;
  eGm.clientY = eGc.clientYDown;
  eGm.screenY = eGc.screenYDown;
  
  // offset to put mouse cursor just above the middle in case of large pie menu
  if (eGm.largeMenu) {
    if (eGm.smallIcons) {
      eGm.clientY += 9;
    }
    else {
      eGm.clientY += 15;
    }
  }
  
  if (eGc.contextType.length !== 0 &&
      (!eGm.contextShowAuto && eGc.keyPressed === eGm.contextKey && eGm.contextKey !== 0) ||
      (eGm.contextShowAuto && (eGc.keyPressed !== eGm.contextKey || eGm.contextKey === 0))) {
    eGm.show(eGc.contextType[0]);
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
    var ios = Components.classes["@mozilla.org/network/io-service;1"]
                        .getService(Components.interfaces.nsIIOService);
    var uri = ios.newURI(url, null, null).prePath;
    
    faviconService.getFaviconURLForPage(ios.newURI(uri, null, null), function(aURI) {
      callback(aURI);
    });
  }
}
