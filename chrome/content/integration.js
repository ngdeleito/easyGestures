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
  version: "4.3.2", // Ex: 1.1beta
  localizing: null, // Access to string bundle for easygestures.properties file
  
  blockStdContextMenu: false, // whether the std context menu should be suppressed
  allowContextBrowserOption: null, // used to set back "Disable or replace context menus" Browser option
  allowContextBrowserOptionTimerId: null,
  keyPressed: 0, // used to control display of pie menu
  
  contextType: "", // link/, image/, selection/ or textbox/
  evtMouseDown: null,
  doc: null,
  body: null,
  frame_doc: null,
  loading: false, // used for reload/stop action
  
  moving: false, // used when menu is moved
  xMoving: -1, // last mouse x position when menu is moving
  yMoving: -1,
  
  link: null, // the whole node link
  image: null,
  selection: null, //contains the text of the selected object
  selectionNode: null, //used for Textarea & Text Input
  selectionStart: null, //used for Textarea & Text Input
  selectionEnd: null, //used for Textarea & Text Input
  
  // used for drag movements in 'open when dragging' situations
  pageXDown: -1, // needed for to give a tolerance to 'open when dragging'
  pageYDown: -1,
  clientXDown: -1,
  clientYDown: -1,
  screenXDown: -1,
  screenYDown: -1,
  pieDragTolerance: 6, // tolerance to 'open when dragging'
  showAfterDelayTimer: null, // trigger to display menu after delay
  showAfterDelayPassed: false, // used to display menu after delay
  openedOnDrag: false, // used to switch on/off selection
  draggedToOpen: false,
  
  maxzIndex: 2147483647 // Max Int. Same value as the one used for displaying autoscrolling image
};

var eGm = null;

function eG_activateMenu(window) {
  // setting events handlers
  window.gBrowser.addEventListener("mousedown", eG_handleMousedown, true);
  window.gBrowser.addEventListener("mouseup", eG_handleMouseup, true);
  window.gBrowser.addEventListener("keydown", eG_handleKeys, true);
  window.gBrowser.addEventListener("keyup", eG_handleKeys, true);
  var contextMenu = window.document.getElementById("contentAreaContextMenu");
  if (contextMenu) {
    contextMenu.addEventListener("popupshowing", eG_handlePopup, true);
  }
}

function eG_deactivateMenu(window) {
  // removing event handlers
  window.gBrowser.removeEventListener("mousedown", eG_handleMousedown, true);
  window.gBrowser.removeEventListener("mouseup", eG_handleMouseup, true);
  window.gBrowser.removeEventListener("keydown", eG_handleKeys, true);
  window.gBrowser.removeEventListener("keyup", eG_handleKeys, true);
  var contextMenu = window.document.getElementById("contentAreaContextMenu");
  if (contextMenu) {
    contextMenu.removeEventListener("popupshowing", eG_handlePopup, true);
  }
}

function eG_getSelection() { // find text selection in current HTML document
  var sel = eGc.evtMouseDown.view.getSelection();
  sel = sel.toString();
  sel = sel.replace( /^\s+/, "" );        // remove all spaces at the beginnng of the string
  sel = sel.replace(/(\n|\r|\t)+/g, " "); // replace all Linefeed, Carriage return & Tab with a space
  sel = sel.replace(/\s+$/,"");           // remove all spaces at the end of the string
  return sel;
}

// suppress standard context menu
function eG_handlePopup(evt) {
  if (eGc.blockStdContextMenu) {
    evt.preventDefault();
  }
  eGc.blockStdContextMenu = false;
}

function eG_handleKeys(evt) {
  var window = evt.target.ownerDocument.defaultView;

  // clear automatic delayed autoscrolling
  window.clearTimeout(eGm.autoscrollingTrigger);
  
  // clear tooltips timeout
  if (eGm.showTooltips && !eGm.showingTooltips) {
    window.clearTimeout(eGm.tooltipsTrigger);
  }
  
  if (evt.type == "keyup") {
    eGc.keyPressed = 0;
  }
  else {
    eGc.keyPressed = evt.keyCode;
  }
  
  if (evt.keyCode == 18 && eGm.menuState != 0 && evt.type == "keydown") {
    // <Alt> key is pressed (use right key)
    eGm.switchLayout();
    return;
  }
  
  // show textarea for typing and retrieve typed text as selected text
  if (eGm.menuState != 0 && evt.keyCode != eGm.contextKey && evt.keyCode != eGm.showKey && evt.keyCode != eGm.supprKey) {
    // all keys except keys to control display of pie
    if (evt.keyCode == 27) {
      evt.preventDefault();
    }
    
    if (evt.type == "keydown") {
      if (evt.keyCode == 27) { // ESC key pressed
        eGm.sector = -1;
        eGm.runAction();
      }
    }
  }
}

function eG_handleMouseup(evt) {
  var window = Services.wm.getMostRecentWindow("navigator:browser");
  var layout = eGm.menuSet[eGm.curLayoutName];
  
  window.clearTimeout(eGc.showAfterDelayTimer);
  eGc.showAfterDelayTimer = null;
  eGc.showAfterDelayPassed = false;
  eGc.draggedToOpen = false;
  
  // clear automatic delayed autoscrolling
  window.clearTimeout(eGm.autoscrollingTrigger);
  if (window.document.getElementById("content").mCurrentBrowser._scrollingView == null) {
    if (eGm.autoscrolling) {
      eGm.autoscrolling = false;
      if (eGm.menuState == 0) {
        return; // avoid contextual menu when autoscrolling ends (this would be triggered below)
      }
    }
  }
  
  if (eGc.openedOnDrag) { // enabling selection
    var selCon = window.gBrowser.docShell.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsISelectionDisplay).QueryInterface(Components.interfaces.nsISelectionController);
    selCon.setDisplaySelection(2); // SELECTION_ON
    //eG_openedOnDrag = false; //variable does not exist; is it meant eGc.openedOnDrag?
  }
  
  // menuState:    0-> not shown    1-> showing   2-> showing & mouse moved    3-> staying open
  if (eGm.menuState == 0) {
    if (!eGm.autoscrolling) {
      // avoid enabling contextual menu when autoscrolling
      eGc.blockStdContextMenu = false;
      window.removeEventListener("mousemove", eG_handleMousemove, true);
    }
  }
  else if (eGm.menuState == 1) {
    if (evt.button == eGm.showButton) {
      eGm.menuState = 3;
    }
    
    var linkSign = eGc.frame_doc.getElementById("eG_SpecialNodes").childNodes[0];
    if (linkSign.style.visibility == "visible" && eGc.link != null && eGm.handleLinks && (evt.button != eGm.showAltButton && eGm.showButton != eGm.showAltButton || eGm.showButton == eGm.showAltButton)) {
      // if a link is clicked without dragging and related option is checked
      // note: after a short delay linkSign is hidden in update() function to cancel opening of link and keep menu open after a short wait on link without moving mouse
      if (eGm.handleLinksAsOpenLink) {
        eGf.openLink(eGc.link);
      }
      else {
        // when option "use browser behavior" is checked to open links
        // middle clicking on a link through eG must display the link in a new tab or new window according to corresponding Firefox pref.
        if (evt.button == 1) {
          // middle click
          var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("browser.");
          if (prefs.getBoolPref("tabs.opentabfor.middleclick")) {
            window.gBrowser.addTab(eGc.link);
          }
          else {
            window.open(eGc.link);
          }
        }
        else {
          window.gBrowser.loadURI(eGc.link);
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
      if (eGm.sector != -1 || eGm.sector == -1 && (eGm.menuState != 2 || eGm.menuState == 2 && (evt.button != eGm.showButton))) {
        eGm.runAction();
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
  
  eGc.draggedToOpen = Math.sqrt( Math.pow(evt.clientX- eGc.clientXDown,2) + Math.pow(evt.clientY- eGc.clientYDown,2) ) > eGc.pieDragTolerance;
  
  if (eGm.menuState == 0) {
    if (eGc.showAfterDelayPassed) {
      return;
    }
    
    if (eGm.showButton == 0 && eGm.dragOnlyUpLeft && eGm.dragOnly) {
      eGc.draggedToOpen = ((eGc.clientYDown-evt.clientY) > eGc.pieDragTolerance || (eGc.clientXDown-evt.clientX) > eGc.pieDragTolerance);
    }
    
    if (eGc.draggedToOpen && eGm.dragOnly) {
      // user dragged mouse to open menu
      
      // get selection if any
      if (eGc.selection == "" || eGc.selection==null) {
        eGc.selection = eG_getSelection(); // save current selection before removal
      }
      
      eGc.pageXDown = evt.pageX;
      eGc.pageYDown = evt.pageY;
      eGc.clientXDown = evt.clientX;
      eGc.clientYDown = evt.clientY;
      eGc.screenXDown = evt.screenX;
      eGc.screenYDown = evt.screenY;
      
      eG_openMenu();
      eGc.openedOnDrag = true; // used to switch on again selection
    }
  }
  else {
    // check if moved outside tolerance
    if (eGc.draggedToOpen) {
      // clear automatic delayed autoscrolling
      window.clearTimeout(eGm.autoscrollingTrigger);
      
      if (!eGm.showingTooltips) {
        eGm.resetTooltipsTimeout(); // reset tooltips timeout
      }
      
      // hide center icon if mouse moved
      var linkSign = eGc.frame_doc.getElementById("eG_SpecialNodes").childNodes[0];
      linkSign.style.visibility = "hidden";
      
      eGm.handleMousemove(evt);
    }
  }
}

function eG_handleMousedown(evt) {
  var window = evt.target.ownerDocument.defaultView;
  
  eGc.blockStdContextMenu = true;
  
  // check whether pie menu should change layout or hide (later)
  if (eGm.menuState > 0 || eGm.autoscrollingState) {
    // toggle primitive/alternative pie menu
    eGm.autoscrollingState = false; // disable autoscrolling if any
    
    if (evt.button == eGm.showAltButton && (eGm.showAltButton != eGm.showButton || eGm.sector == -1 && eGm.showAltButton == eGm.showButton)) {
      eGm.switchLayout();
    }
    evt.preventDefault(); // prevent current selection (if any) from being flushed by the click being processed
    return;
  }
  
  // check for tabbroswer area to exclude it from clickable area
  var excludeTarget = false;
  for (var node = evt.originalTarget; node != null; node = node.parentNode) {
    if ((node.nodeName.toString().indexOf("tabbrowser") >= 0 && node.id.toString().indexOf("content")>= 0)
        || evt.originalTarget.nodeName == "xul:scrollbarbutton"
        || evt.originalTarget.nodeName == "xul:thumb"
        || evt.originalTarget.nodeName == "xul:slider") {
      excludeTarget = true;
      break;
    }
  }
  
  // check if menu should not be displayed
  if (excludeTarget || (evt.button != eGm.showButton)
      || (eGc.keyPressed != eGm.showKey && eGm.showKey != 0)
      || (eGc.keyPressed == eGm.supprKey && eGm.supprKey != 0)) {
    if (!eGm.dragOnly && excludeTarget) {
      eGc.blockStdContextMenu=true; // to be suppressed ?
    }
    else {
      eGc.blockStdContextMenu = false;
      eGc.keyPressed = 0;
    }
    return;
  }
  
  // "Disable or replace context menus" Browser option back to false if was false before showing pie menu. This is needed in case the timeout in hide function has not elapsed
  if (eGm.showButton == 2 && !eGc.allowContextBrowserOption && eGc.menuState == 0) {
    window.clearTimeout(eGc.allowContextBrowserOptionTimerId);
    eG_resetInitialContextBrowserOption();
  }
  
  // start timer for delayed show up
  if (eGc.showAfterDelayTimer == null && eGm.showAfterDelay) {
    eGc.showAfterDelayPassed = true;
    eGc.showAfterDelayTimer = window.setTimeout(eG_showAfterDelay, eGm.showAfterDelayDelay);
  }
  
  // copying parts of evt object
  eGc.evtMouseDown = {}; // don't just keep a reference to evt because evt will change before it can be used properly
  eGc.evtMouseDown.clientX = evt.clientX;
  eGc.evtMouseDown.clientY = evt.clientY;
  eGc.evtMouseDown.screenX = evt.screenX;
  eGc.evtMouseDown.screenY = evt.screenY;
  eGc.evtMouseDown.pageX = evt.pageX;
  eGc.evtMouseDown.pageY = evt.pageY;
  eGc.evtMouseDown.originalTarget = evt.originalTarget;
  eGc.evtMouseDown.target=evt.target;
  eGc.evtMouseDown.view=evt.view;
  
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
        continue;
      }
      
      if (node instanceof window.HTMLImageElement) {
        eGc.image = node;
        continue;
      }
      
      if (node instanceof window.HTMLTextAreaElement) {
        eGc.selection = node.value.substring(node.selectionStart,node.selectionEnd);
        eGc.selectionNode = node;
        eGc.selectionStart = node.selectionStart;
        eGc.selectionEnd = node.selectionEnd;
        continue;
      }
      
      if (node instanceof window.HTMLInputElement) {
        if (node.type.toUpperCase() == "TEXT" || node.type.toUpperCase() == "PASSWORD") {
          eGc.selection = node.value.substring(node.selectionStart,node.selectionEnd);
          eGc.selectionNode = node;
          eGc.selectionStart = node.selectionStart;
          eGc.selectionEnd = node.selectionEnd;
        }
        continue;
      }
    }
  }
  
  // set eGc.contextType property for contextual menu displaying
  eGc.contextType = "";
  if (eGc.link != null) {
    eGc.contextType += "link/";
  }
  if (eGc.image != null) {
    eGc.contextType += "image/";
  }
  if (eGc.contextType == "") {
    // no need to go further if already link or image
    if (eGc.selection != null && eGc.selection != "") {
      eGc.contextType += "selection/";
    }
    if (eGc.selectionNode != null) {
      eGc.contextType += "textbox/";
    }
  }
  
  eGc.pageXDown = evt.pageX;
  eGc.pageYDown = evt.pageY;
  eGc.clientXDown = evt.clientX;
  eGc.clientYDown = evt.clientY;
  eGc.screenXDown = evt.screenX;
  eGc.screenYDown = evt.screenY;
  
  window.addEventListener("mousemove", eG_handleMousemove, true);
  
  if ((!eGm.dragOnly || (eGc.link != null && eGm.handleLinks)) && !eGm.showAfterDelay) {
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
    eGm.autoscrollingTrigger = window.setTimeout(function foo(arg) {eGm.autoscrolling=true; eGm.close(); eGf.autoscrolling(arg); }, eGm.autoscrollingDelay, eGc.evtMouseDown);
  }
}

function eG_handleUnload(evt) {
  if (eGm.showButton == 2 && !eGc.allowContextBrowserOption && eGm.stateMenu == 0) {
    // "Disable or replace context menus" Browser option back to false if was false before showing pie menu
    eG_resetInitialContextBrowserOption();
  }
}

function eG_countClicks() {
  // update statsClicks preference
  try { // because could be called from options.xul
    eGPrefs.incrementStatsClicksPref();
    
    // disable counting clicks inside window because menu is displayed
    if (eGm.menuState != 0) {
      window.removeEventListener("mousedown", eG_countClicks, false);
    }
  }
  catch (ex) {}
}

function eG_resetInitialContextBrowserOption() {
  // reset the initial value of 'Allow scripts to...Disable or replace context menu' in browser options
  var pref = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
  pref.setBoolPref("dom.event.contextmenu.enabled", false);
  eGc.allowContextBrowserOptionTimerId = null;
}

function eG_showAfterDelay() {
  var window = Services.wm.getMostRecentWindow("navigator:browser");
  eGc.showAfterDelayPassed = false;
  window.clearTimeout(eGc.showAfterDelayTimer);
  eGc.showAfterDelayTimer = null;
  
  if (!eGm.dragOnly && !eGc.draggedToOpen) {
    eG_openMenu();
  }
}

function eG_openMenu() {
  // disabling selection when left mouse button is used until mouseup is done or menu is closed
  if (eGm.showButton == 0) { // left mouse button
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    var selCon = window.gBrowser.docShell.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsISelectionDisplay).QueryInterface(Components.interfaces.nsISelectionController);
    selCon.setDisplaySelection(0); // SELECTION_OFF
  }
  
  eGm.pageX = eGc.pageXDown;
  eGm.pageY = eGc.pageYDown;
  eGm.clientX = eGc.clientXDown;
  eGm.clientY = eGc.clientYDown;
  eGm.screenX = eGc.screenXDown;
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
  
  if ((eGm.contextMenuAuto && eGc.contextType != "" && (eGc.keyPressed != eGm.contextKey || eGm.contextKey == 0)) || (!eGm.contextMenuAuto && eGc.contextType != "" && (eGc.keyPressed == eGm.contextKey) && eGm.contextKey != 0)) {
    switch (eGc.contextType) {
      case "link/":
        eGm.show("contextLink");
        break;
      case "image/":
        eGm.show("contextImage");
        break;
      case "link/image/":
        if (eGm.contextImageFirst) {
          eGm.show("contextImage");
        }
        else {
          eGm.show("contextLink");
        }
        break;
      case "selection/":
        eGm.show("contextSelection");
        break;
      case "textbox/":
        eGm.show("contextTextbox");
        break;
      case "selection/textbox/":
        if (eGm.contextTextboxFirst) {
          eGm.show("contextTextbox");
        }
        else {
          eGm.show("contextSelection");
        }
        break;
    }
    var contextMenuSign = eGc.frame_doc.getElementById("eG_SpecialNodes").childNodes[2];
    contextMenuSign.style.visibility = "visible";
  }
  else {
    eGm.show("main");
  }
}
