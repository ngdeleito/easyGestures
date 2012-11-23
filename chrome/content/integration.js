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
  id: "{11F9F076-72B3-4586-995D-5042CF5D3AD4}", // easyGestures ID
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
  
  lastTypedWord: "", // remembers the last word typed in the textarea for search or highlight or translation
  highlightColor: -1, // used for 'highlight' action
  noTextHighlighted: true, // used to know if alert must be displayed or not
  
  // used for drag movements in 'open when dragging' situations
  pageXDown: -1, // needed for to give a tolerance to 'open when dragging'
  pageYDown: -1,
  clientXDown: -1,
  clientYDown: -1,
  screenXDown: -1,
  screenYDown: -1,
  screenXUp: -1,
  screenYUp: -1,
  pieDragTolerance: 6, // tolerance to 'open when dragging'
  showAfterDelayTimer: null, // trigger to display menu after delay
  showAfterDelayPassed: false, // used to display menu after delay
  openedOnDrag: false, // used to switch on/off selection
  draggedToOpen: false,
  
  maxzIndex: 2147483647, // Max Int. Same value as the one used for displaying autoscrolling image
  
  defaultHighlightColorList: "rgb(255,255,176);rgb(255,191,191);rgb(184,230,255);rgb(182,255,183);rgb(233,187,255);yellow;salmon;aqua;SpringGreen;violet",
  gray: "#DDDDDD",
  lightgray: "#F3F3F3",
  darkgray: "#B2B4BF"
};

var eGm = null;
var eG_prefsObs = null;

if (window.document.location != 'chrome://easygestures/content/options.xul') {
  // avoid a call when options dialog is opened or closed
  window.addEventListener("load", eG_initMenuIntegration, false);
  window.addEventListener("unload", eG_handleUnload, false);
}

window.addEventListener("mousedown", eG_countClicks, false);

function eG_initMenuIntegration(evt) {
  // set the prefs, initiate menu
  eGc.localizing = document.getElementById("easygestures.properties");
  
  /////////////////////////////////////////////////////////
  // localizing extension's description in Extension Manager
  /////////////////////////////////////////////////////////

  var eGLocalizationPrefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions."+eGc.id+".");
  var supportsString = Components.classes[ "@mozilla.org/supports-string;1" ].createInstance(Components.interfaces.nsISupportsString);
  supportsString.data = eGc.localizing.getString("description");
  eGLocalizationPrefs.setComplexValue( "description", Components.interfaces.nsISupportsString, supportsString );
  
  /////////////////////////////////////////////////////////
  // setting preferences
  /////////////////////////////////////////////////////////
  eG_prefsObs = new eG_prefsObserver();
  
  eG_updatePrefs(eG_prefsObs.prefs);
  
  var active = eG_prefsObs.prefs.getBoolPref("profile.active");
  if (eG_prefsObs.prefs.getBoolPref("profile.statusbarShowIcon")) {
    ///////////////////////////////////////////////////////
    // adding status bar icon and activating/deactivating menu
    // Note: no more status bar on Firefox 4. Replaced by addon-bar
    ///////////////////////////////////////////////////////
    
    var statusBar = document.getElementById("addon-bar");
    var statusbarpanel = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "statusbarpanel");
    statusbarpanel.setAttribute("id","statusbarIcon");
    statusbarpanel.setAttribute("tooltiptext", eGc.localizing.getString("statusMenuTooltip"));
    statusbarpanel.setAttribute("src","chrome://easygestures/content/statusbar"+(active?"":"_gray")+".png");
    statusbarpanel.setAttribute("class","statusbarpanel-iconic");
    statusbarpanel.setAttribute("onclick","if (event.button=='0') eG_changeStatus();if (event.button=='2') window.openDialog('chrome://easygestures/content/options.xul','','chrome,titlebar,toolbar,centerscreen,resizable');");
    statusbarpanel.setAttribute("ondblclick","if (event.button=='0') window.openDialog('chrome://easygestures/content/options.xul','','chrome,titlebar,toolbar,centerscreen,resizable');");
    statusBar.appendChild(statusbarpanel);
  }
  
  if (active) {
    eG_activateMenu();
    var skinPath = eG_prefsObs.prefs.getCharPref("skin.path");
    
    ///////////////////////////////////////////////////////
    // register CSS for images
    ///////////////////////////////////////////////////////
    var sss = Components.classes["@mozilla.org/content/style-sheet-service;1"].getService(Components.interfaces.nsIStyleSheetService);
    var ios = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
    var u = ios.newURI(skinPath+"actions.css", null, null);
    if (!sss.sheetRegistered(u, sss.AGENT_SHEET)) {
      sss.loadAndRegisterSheet(u, sss.AGENT_SHEET);
    }
    
    if (window.arguments[0] == "about:blank") {
      loadURI("about:blank"); // FIX TRICK: when homepage is set to Blank Page, icons won't show because of CSS unless loading explicitly the blank page...
    }
    
    ///////////////////////////////////////////////////////
    // displaying tips at startup
    ///////////////////////////////////////////////////////
    var wenum = Components.classes["@mozilla.org/embedcomp/window-watcher;1"].getService(Components.interfaces.nsIWindowWatcher).getWindowEnumerator();
    wenum.getNext();
    if (!wenum.hasMoreElements()) { // only one Firefox window is open
      if (eGm.startupTips) {
        window.openDialog('chrome://easygestures/content/tips.xul', '', 'chrome,centerscreen,resizable'); // show tip dialog
      }
    }
  }
}

function eG_updatePrefs(prefs) {
  try {
    var versionCompare = Components.classes["@mozilla.org/xpcom/version-comparator;1"].getService(Components.interfaces.nsIVersionComparator);
    var prevVersion = prefs.getCharPref("profile.version"); // if a previous version is not already installed, this will trigger the catch statement to set all prefs
    
    if (prevVersion == eGc.version) { // no new version
      // update newly localized prefs if language was changed
      if (prefs.getBoolPref("stateChange.language")) {
        eG_setActions(false);
        eG_localizeSearchURLs(eGc.localizing.getString("locale"));
        prefs.setBoolPref("stateChange.language", false);
      }
    }
    else { // new version installed
      eG_restoreCustomIconsAndSkins(); // restore custom icons and skins from previously made temporary backup on last unload
      if (versionCompare.compare(prevVersion, "4.3.1") >= 0) {
        // Keep current preferences because no changes to prefs have been made since version 4.3.1
      }
      else if (versionCompare.compare(prevVersion, "4.3") >= 0) {
        // make a few changes for all versions from version 4.3 to prior to version 4.3.1
        
        // update value of prefs
        prefs.setIntPref("customizations.tabPopupDelay", 400);
      }
      else if (versionCompare.compare(prevVersion, "4.1.2") >= 0) {
        // make a few changes for all versions from version 4.1.2 to prior to version 4.3
        
        // update value of prefs for 4.3.1
        prefs.setIntPref("customizations.tabPopupDelay", 400);
        
        // update actions numbers and labels because of addition of 3 new actions
        eG_updateToVersion43();
        
        // clear obsolete user prefs
        prefs.clearUserPref("customizations.tabRepetitionDelay");
        
        // update value of prefs
        prefs.setBoolPref("customizations.queryInNewTab", !prefs.getBoolPref("customizations.queryInNewTab"));
      }
      else {
        // update all preferences for all versions prior to version 4.1.2
        eG_setPrefs(eGc.localizing.getString("locale"));
      }
      
      // update version
      prefs.setCharPref("profile.version", eGc.version);
    }
  }
  catch (ex) { // default values at first start
    eG_setPrefs(eGc.localizing.getString("locale"));
    
    // display welcome page
    setTimeout(function() { top.getBrowser().selectedTab = openNewTabWith(getShortcutOrURI("chrome://easygestures/content/welcomePage.xhtml", {})); }, 100, '');
  }
}

function eG_activateMenu() {
  /////////////////////////////////////////////////////////
  // creating menu
  /////////////////////////////////////////////////////////
  eGm = new eG_menu();
  
  /////////////////////////////////////////////////////////
  // setting events handlers
  /////////////////////////////////////////////////////////
  
  getBrowser().addEventListener("mousedown", eG_handleMousedown, true);
  getBrowser().addEventListener("mouseup", eG_handleMouseup, true);
  getBrowser().addEventListener("keydown", eG_handleKeys, true);
  getBrowser().addEventListener("keyup", eG_handleKeys, true);
  var contextMenu = document.getElementById("contentAreaContextMenu");
  if (contextMenu) {
    contextMenu.addEventListener("popupshowing", eG_handlePopup, true);
  }
  
  /////////////////////////////////////////////////////////
  // disabling autoscrolling if middle mouse button is menu's button
  /////////////////////////////////////////////////////////
  if (eGm.showButton == 1) {
    var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("general.");
    if (prefs.getBoolPref("autoScroll")) {
      prefs.setBoolPref("autoScroll", false);
    }
  }
}

function eG_changeStatus() {
  var active = eG_prefsObs.prefs.getBoolPref("profile.active");
  active = !active; // switch status
  eG_prefsObs.prefs.setBoolPref("profile.active", active);
  
  document.getElementById("statusbarIcon").src = "chrome://easygestures/content/statusbar"+(active?"":"_gray")+".png";
  if (active) {
    eG_activateMenu();
  }
  else {
    getBrowser().removeEventListener("mousedown", eG_handleMousedown, true);
    getBrowser().removeEventListener("mouseup", eG_handleMouseup, true);
    getBrowser().removeEventListener("keydown", eG_handleKeys, true);
    getBrowser().removeEventListener("keyup", eG_handleKeys, true);
    var contextMenu = document.getElementById("contentAreaContextMenu");
    if (contextMenu) {
      contextMenu.removeEventListener("popupshowing", eG_handlePopup, true);
    }
  }
}

// suppress standard context menu
function eG_handlePopup(evt) {
  if (eGc.blockStdContextMenu) {
    evt.preventDefault();
  }
  eGc.blockStdContextMenu = false;
}

function eG_handleKeys(evt) {
  // clear automatic delayed autoscrolling
  clearTimeout(eGm.autoscrollingTrigger);
  
  // clear tooltips timeout
  if (eGm.showTooltips && !eGm.showingTooltips) {
    clearTimeout(eGm.tooltipsTrigger);
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
    if (evt.keyCode == 13 || evt.keyCode == 27) {
      evt.preventDefault();
    }
    
    if (evt.type == "keydown") {
      if (evt.keyCode == 13 || evt.keyCode == 27) {
        // <Enter> key pressed
        eGc.selection = eGm.inputBox.value;
        
        if (eGm.sector != -1) {
          eGc.lastTypedWord = eGm.inputBox.value; // remember the last typed word in inputBox except addresses
        }
        eGm.inputBox.blur(); // removing the cursor
        
        if (evt.keyCode != 27) {
          // any other key except <Escape> key pressed
          if (eGc.selection != "" ) {
            // do nothing if selection is empty
            if (eGc.selection == "/") {
              // open options dialog if character "/" (slash) typed
              window.openDialog("chrome://easygestures/content/options.xul","","");
            }
            else {
              if (eGm.sector == -1) {
                var postData = { };
                if (evt.shiftKey) {
                  // load url in new tab if <Shift+Enter> pressed
                  openNewTabWith(getShortcutOrURI(eGc.selection, postData));
                  // select new created tab
                  var container = document.getElementById("content").mTabContainer;
                  var tabs = container.childNodes;
                  container._selectNewTab(tabs[tabs.length-1]); // selectNewTab removed from FF3
                }
                else {
                  // load url in current tab if only <Enter> pressed
                  loadURI(getShortcutOrURI(eGc.selection, postData)); // load url
                }
              }
            }
          }
        }
        else { // <Escape> key pressed
          eGm.sector = -1; // cancel action
        }
        eGm.runAction();
      }
    }
  }
}

function eG_handleMouseup(evt) {
  var layout = eGm.menuSet[eGm.curLayoutName];
  
  clearTimeout(eGc.showAfterDelayTimer);
  eGc.showAfterDelayTimer = null;
  eGc.showAfterDelayPassed = false;
  eGc.draggedToOpen = false;
  eGc.screenXUp = evt.screenX;
  eGc.screenYUp = evt.screenY;
  
  // clear automatic delayed autoscrolling
  clearTimeout(eGm.autoscrollingTrigger);
  if (document.getElementById("content").mCurrentBrowser._scrollingView == null) {
    if (eGm.autoscrolling) {
      eGm.autoscrolling = false;
      if (eGm.menuState == 0) {
        return; // avoid contextual menu when autoscrolling ends (this would be triggered below)
      }
    }
  }
  
  if (eGm.typingText) {
    evt.preventDefault();
    return;
  }

  if (eGc.openedOnDrag) { // enabling selection
    selCon = getBrowser().docShell.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsISelectionDisplay).QueryInterface(Components.interfaces.nsISelectionController);
    selCon.setDisplaySelection(2); // SELECTION_ON
    eG_openedOnDrag = false;
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
    
    if (eGm.linkSign.style.visibility == "visible" && eGc.link != null && eGm.handleLinks && (evt.button != eGm.showAltButton && eGm.showButton != eGm.showAltButton || eGm.showButton == eGm.showAltButton)) {
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
            openNewTabWith(eGc.link);
          }
          else {
            openNewWindowWith(eGc.link);
          }
        }
        else {
          loadURI(eGc.link);
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
      if (eGm.inputBox.style.visibility == "visible" ) {}
      else {
        if (eGm.sector != -1 || eGm.sector == -1 && (eGm.menuState != 2 || eGm.menuState == 2 && (evt.button != eGm.showButton))) {
          var actionName = (eGm.sector >=0 ? layout.actions[eGm.sector].src : "");
          if ((actionName.search("searchWeb") != -1 || actionName.search("translate") != -1 || actionName.search("highlight") != -1 ) && eGc.selection == "") {
            // Only for actions needing entry: searchWeb, translate, highlight
            // Selected text should not bring up input box
            if (actionName.search("searchWeb") != -1) {
              eGm.showPopupForSearchWeb(false);
            }
            eGm.showInputBox(actionName.search("highlight")!=-1 ); // argument is to display options sign for highlight action
          }
          else {
            eGm.runAction();
          }
        }
        else {
          eGm.menuState = 3;
        }
      }
    }
  }
}

function eG_handleMousemove(evt) {
  if (eGm.typingText) {
    if (eGm.inputBox.style.cursor != "auto") {
      eGm.inputBox.style.cursor = "auto";
    }
    return;
  }
  
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
      clearTimeout(eGm.autoscrollingTrigger);
      
      if (!eGm.dropDownMenu && !eGm.showingTooltips) {
        eGm.resetTooltipsTimeout(); // reset tooltips timeout
      }
      
      // hide center icon if mouse moved
      eGm.linkSign.style.visibility = "hidden";
      
      eGm.handleMousemove(evt);
    }
  }
}

function eG_handleMousedown(evt) {
  if (eGm.typingText) {
    eGc.blockStdContextMenu = false;
    return;
  }
  
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
    clearTimeout(eGc.allowContextBrowserOptionTimerId);
    eG_resetInitialContextBrowserOption();
  }
  
  // start timer for delayed show up
  if (eGc.showAfterDelayTimer == null && eGm.showAfterDelay) {
    eGc.showAfterDelayPassed = true;
    eGc.showAfterDelayTimer = setTimeout(eG_showAfterDelay, eGm.showAfterDelayDelay);
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
  eGc.doc = window._content.document;
  eGc.frame_doc = evt.originalTarget.ownerDocument;
  eGc.body = eGc.frame_doc.documentElement;
  
  eGc.selection = eG_getSelection();
  
  for (var node = evt.originalTarget; node != null; node = node.parentNode) {
    if (node.nodeType == Node.ELEMENT_NODE) {
      if ((node instanceof HTMLAreaElement) || (node instanceof HTMLAnchorElement)) {
        if (node.href != null && node.href != "") {
          eGc.link = node;
        }
        continue;
      }
      
      if (node instanceof HTMLImageElement) {
        eGc.image = node;
        continue;
      }
      
      if (node instanceof HTMLTextAreaElement) {
        eGc.selection = node.value.substring(node.selectionStart,node.selectionEnd);
        eGc.selectionNode = node;
        eGc.selectionStart = node.selectionStart;
        eGc.selectionEnd = node.selectionEnd;
        continue;
      }
      
      if (node instanceof HTMLInputElement) {
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
  getBrowser().focus();
  
  if (eGm.autoscrollingOn) {
    // automatic delayed autoscrolling on mouse down
    
    // making a partial clone of current evt for setTimeout because object will be lost
    // don't use autoscrollingEvent[i]=evt[i] because will cause selection pb on dragging with left mouse button
    eGm.autoscrollingTrigger = setTimeout(function foo(arg) {eGm.autoscrolling=true; eGm.close(); eGf.autoscrolling(arg); }, eGm.autoscrollingDelay, eGc.evtMouseDown);
  }
}

function eG_handleUnload(evt) {
  if (eGm.showButton == 2 && !eGc.allowContextBrowserOption && eGm.stateMenu == 0) {
    // "Disable or replace context menus" Browser option back to false if was false before showing pie menu
    eG_resetInitialContextBrowserOption();
  }
  
  try { // remove the prefs observer to prevent memory leaks
    var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch(null);
    prefs.QueryInterface(Components.interfaces.nsIPrefBranchInternal).removeObserver("easygestures.stateChange.prefs", eG_prefsObs);
  }
  catch (ex) {}
  
  var needsChange = eG_needsChange();
  if (needsChange == "needs-upgrade") {
    eG_backupCustomIconsAndSkins();
  }
  else if (needsChange == "needs-uninstall") {
    eG_deleteAllPreferences();
  }
}

function eG_countClicks() {
  // update statsClicks preference
  try { // because could be called from options.xul
    var statsClicks = eG_prefsObs.prefs.getIntPref("profile.statsClicks")+1;
    eG_prefsObs.prefs.setIntPref("profile.statsClicks",  statsClicks );
    
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
  eGc.showAfterDelayPassed = false;
  clearTimeout(eGc.showAfterDelayTimer);
  eGc.showAfterDelayTimer = null;
  
  if (!eGm.dragOnly && !eGc.draggedToOpen) {
    eG_openMenu();
  }
}

function eG_openMenu() {
  // disabling selection when left mouse button is used until mouseup is done or menu is closed
  if (eGm.showButton == 0) { // left mouse button
    selCon = getBrowser().docShell.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsISelectionDisplay).QueryInterface(Components.interfaces.nsISelectionController);
    selCon.setDisplaySelection(0); // SELECTION_OFF
  }
  
  eGm.pageX = eGc.pageXDown;
  eGm.pageY = eGc.pageYDown;
  eGm.clientX = eGc.clientXDown;
  eGm.clientY = eGc.clientYDown;
  eGm.screenX = eGc.screenXDown;
  eGm.screenY = eGc.screenYDown;
  
  // offset to put mouse cursor just above the middle in case of large pie menu
  if (eGm.largeMenu && !eGm.dropDownMenu) {
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
    eGm.contextMenuSign.style.visibility = "visible";
  }
  else {
    eGm.show("main");
  }
}

function eG_showTextNotFoundStrip(phrase) {
  if (document.getElementById("eGAlertTextNotFound") == null) {
    var panel = getBrowser().mPanelContainer.selectedPanel; // many tabs
    if (panel == null) {
      panel = getBrowser().mPanelContainer.firstChild; // one tab only
    }
    
    hbox = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "hbox");
    hbox.setAttribute("id","eGAlertTextNotFound");
    hbox.setAttribute("style","background-color:#FFFFDD;border-top-style:outset;border-width:1px;");
    panel.appendChild(hbox);
    
    vbox = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "vbox");
    vbox.setAttribute("pack","center");
    hbox.appendChild(vbox);
    
    image = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "image");
    image.setAttribute("style","margin-left:10px;");
    image.setAttribute("src","chrome://easygestures/content/warning.png");
    vbox.appendChild(image);
    
    vbox = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "vbox");
    vbox.setAttribute("pack","center");
    hbox.appendChild(vbox);
    
    message = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "label");
    message.setAttribute("style","font-weight:bold;");
    message.setAttribute("value", eGc.localizing.getString("textNotFoundAlert") + "   " +  eGc.localizing.getString("textNotFoundAgain"));
    vbox.appendChild(message);
    
    vbox = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "vbox");
    vbox.setAttribute("pack","center");
    hbox.appendChild(vbox);
    
    textbox = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "textbox");
    textbox.setAttribute("value",phrase);
    textbox.setAttribute("onchange", "eGc.selection=this.value;eGc.lastTypedWord=this.value;this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode);eGf.highlight(eGc.selection, window._content,true);");
    //textbox.select();
    vbox.appendChild(textbox);
    
    spacer = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "spacer");
    spacer.setAttribute("flex","1");
    hbox.appendChild(spacer);
    
    toolbarbutton = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "toolbarbutton");
    toolbarbutton.setAttribute("style","list-style-image: url('chrome://global/skin/icons/close.png');-moz-appearance: none;-moz-image-region: rect(0px, 14px, 14px, 0px);padding: 4px 2px;border: none !important;");
    toolbarbutton.setAttribute("onmouseover","this.style.MozImageRegion='rect(0px, 28px, 14px, 14px)'");
    toolbarbutton.setAttribute("onmouseout","this.style.MozImageRegion='rect(0px, 14px, 14px, 0px)'"); // with some themes, image disapears on mouseover because image is not a 3 states image
    toolbarbutton.setAttribute("oncommand","this.parentNode.parentNode.removeChild(this.parentNode);");
    hbox.appendChild(toolbarbutton);
  }
}

function eG_checkDailyReadingsFolder() {
  var dailyReadingsFolderNode = null;
  var folderName = "@easyGestures";
  
  try {
    // check if dailyReadings folder already exists in toolbarFolder
    var historyService = Components.classes["@mozilla.org/browser/nav-history-service;1"]
                                   .getService(Components.interfaces.nsINavHistoryService);
    var bookmarksService = Components.classes["@mozilla.org/browser/nav-bookmarks-service;1"]
                                     .getService(Components.interfaces.nsINavBookmarksService);
    var options = historyService.getNewQueryOptions();
    var query = historyService.getNewQuery();
    options.excludeItems = true;
    query.setFolders([bookmarksService.toolbarFolder], 1); //query.setFolders([bookmarksService.placesRoot], 1);
    var result = historyService.executeQuery(query, options);
    
    result.root.containerOpen = true;
    for (var i = 0; i < result.root.childCount; i++) {
      // iterate over the immediate children of this folder
      if (result.root.getChild(i).itemId == eGm.dailyReadingsFolderURI && eGm.dailyReadingsFolderURI != "" || result.root.getChild(i).title == folderName) {
        dailyReadingsFolderNode = result.root.getChild(i);
        if (eGm.dailyReadingsFolderURI == "") {
          // update value if no value found
          eGm.dailyReadingsFolderURI = result.root.getChild(i).itemId;
          eG_prefsObs.prefs.setCharPref("behavior.dailyReadingsFolderURI", eGm.dailyReadingsFolderURI);
        }
        break;
      }
    }
    result.root.containerOpen = false; // close a container after using it!
  }
  catch (ex) {
    alert("Exception: "+ ex.toString());
    return false;
  }
  
  if (eGm.dailyReadingsFolderURI == "" || dailyReadingsFolderNode == null) {
    var menuFolder = PlacesUtils.bookmarks.toolbarFolder; //Bookmarks menu folder: bookmarksMenuFolder, Toolbar folder: toolbarFolder,
    var newFolderId = PlacesUtils.bookmarks.createFolder(menuFolder, folderName, -1);
    
    eGm.dailyReadingsFolderURI = newFolderId;
    eG_prefsObs.prefs.setCharPref("behavior.dailyReadingsFolderURI", newFolderId);
    
    // adding default bookmarks in folder
    var locale = eGc.localizing.getString("locale");
    switch (locale) {
      case "fr-FR":
        PlacesUtils.bookmarks.insertBookmark(newFolderId, PlacesUtils._uri("http://www.mozillazine.org/"),-1,"MozillaZine");
        PlacesUtils.bookmarks.insertBookmark(newFolderId, PlacesUtils._uri("http://fr.news.yahoo.com/"),-1,"Yahoo! Actualit곢");
        break;
      case "de-DE":
        PlacesUtils.bookmarks.insertBookmark(newFolderId, PlacesUtils._uri("http://www.mozillazine.org/"),-1,"MozillaZine");
        PlacesUtils.bookmarks.insertBookmark(newFolderId, PlacesUtils._uri("http://de.news.yahoo.com/"),-1,"Yahoo! Nachrichten");
        break;
      case "it-IT":
        PlacesUtils.bookmarks.insertBookmark(newFolderId, PlacesUtils._uri("http://www.mozillazine.org/"),-1,"MozillaZine");
        PlacesUtils.bookmarks.insertBookmark(newFolderId, PlacesUtils._uri("http://it.news.yahoo.com/"),-1,"Yahoo! Notizie");
        break;
      case "ja-JP":
        PlacesUtils.bookmarks.insertBookmark(newFolderId, PlacesUtils._uri("http://ryuzi.dyndns.org/mozillazine/html/modules/news/"),-1,"mozillaZine ???? - mozillaZine ??");
        PlacesUtils.bookmarks.insertBookmark(newFolderId, PlacesUtils._uri("http://dailynews.yahoo.co.jp/fc/"),-1,"Yahoo!???? - ?????");
        break;
      case "zh-TW":
        PlacesUtils.bookmarks.insertBookmark(newFolderId, PlacesUtils._uri("http://www.mozillazine.org/"),-1,"MozillaZine");
        PlacesUtils.bookmarks.insertBookmark(newFolderId, PlacesUtils._uri("http://tw.news.yahoo.com/"),-1,"Yahoo!ʟܯس܄");
        break;
      case "pt-BR":
        PlacesUtils.bookmarks.insertBookmark(newFolderId, PlacesUtils._uri("http://www.mozillazine.org/"),-1,"MozillaZine");
        PlacesUtils.bookmarks.insertBookmark(newFolderId, PlacesUtils._uri("http://br.news.yahoo.com/"),-1,"Yahoo! Notas");
        break;
      case "es-ES":
        PlacesUtils.bookmarks.insertBookmark(newFolderId, PlacesUtils._uri("http://www.mozillazine.org/"),-1,"MozillaZine");
        PlacesUtils.bookmarks.insertBookmark(newFolderId, PlacesUtils._uri("http://es.news.yahoo.com/"),-1,"Noticias en Yahoo!");
        break;
      default:
        PlacesUtils.bookmarks.insertBookmark(newFolderId, PlacesUtils._uri("http://www.mozillazine.org/"),-1,"MozillaZine");
        PlacesUtils.bookmarks.insertBookmark(newFolderId, PlacesUtils._uri("http://dailynews.yahoo.com/"),-1,"Yahoo! News");
        break;
    }
    
    alert(eGc.localizing.getString("dailyReadingsCreate"));
  }
  return dailyReadingsFolderNode;
}

function eG_needsChange() {
  // returns "" if no change or "needs-upgrade" or "needs-uninstall"
  try {
    var fileLocator = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties);
    var userProfilePath = fileLocator.get("ProfD", Components.interfaces.nsIFile).path;
    
    // cross platform append
    var stagedFolder = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
    stagedFolder.initWithPath(userProfilePath);
    stagedFolder.append("extensions");
    stagedFolder.append("staged");
    stagedFolder.append("{11F9F076-72B3-4586-995D-5042CF5D3AD4}");
    
    if (stagedFolder.exists()) {
      // if extensions\staged\{11F9F076-72B3-4586-995D-5042CF5D3AD4} folder exists, check if empty or not: empty means uninstall, not empty means update
      if (stagedFolder.fileSize != 0) {
        return 'needs-upgrade'; // upgrading
      }
      else {
        return 'needs-uninstall'; //uninstalling
      }
    }
    return "";
  }
  catch (ex) {
    return "";
  }
}

function eG_backupCustomIconsAndSkins() {
  // save customicons and skins packs folders to a temp folder
  try {
    var fileLocator = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties);
    var userProfilePath = fileLocator.get("ProfD", Components.interfaces.nsIFile).path;
    
    var destinationFolder = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
    destinationFolder.initWithPath(userProfilePath);
    destinationFolder.append("extensions");
    destinationFolder.append("temp_" + eGc.id);
    
    // copy customicons folder into temp_ folder
    var customiconsFolder = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
    customiconsFolder.initWithPath(userProfilePath);
    customiconsFolder.append("extensions");
    customiconsFolder.append(eGc.id);
    customiconsFolder.append("chrome");
    customiconsFolder.append("customicons");
    customiconsFolder.copyTo(destinationFolder, "");
    
    // copy skin packs folder into temp_ folder
    var skinsFolder = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
    skinsFolder.initWithPath(userProfilePath);
    skinsFolder.append("extensions");
    skinsFolder.append(eGc.id);
    skinsFolder.append("chrome");
    skinsFolder.append("skins packs");
    skinsFolder.copyTo(destinationFolder, "");
  }
  catch (ex) {}
}

function eG_restoreCustomIconsAndSkins() {
  // restore customicons and skins packs folders from temp_ folder
  try {
    var fileLocator = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties);
    var userProfilePath = fileLocator.get("ProfD", Components.interfaces.nsIFile).path;
    
    var destinationFolder = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
    destinationFolder.initWithPath(userProfilePath);
    destinationFolder.append("extensions");
    destinationFolder.append(eGc.id);
    destinationFolder.append("chrome");
    
    // copy customicons folder into eG's chrome folder
    var customiconsFolder = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
    customiconsFolder.initWithPath(userProfilePath);
    customiconsFolder.append("extensions");
    customiconsFolder.append("temp_" + eGc.id);
    customiconsFolder.append("customicons");
    customiconsFolder.copyTo(destinationFolder, "");
    
    // copy skin packs folder into eG's chrome folder
    var skinsFolder = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
    skinsFolder.initWithPath(userProfilePath);
    skinsFolder.append("extensions");
    customiconsFolder.append("temp_" + eGc.id);
    skinsFolder.append("skins packs");
    skinsFolder.copyTo(destinationFolder, "");
    
    // delete temp_ folder
    var tempFolder = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
    tempFolder.initWithPath(userProfilePath);
    tempFolder.append("extensions");
    tempFolder.append("temp_" + eGc.id);
    tempFolder.remove(true);
  }
  catch (ex) {}
}
