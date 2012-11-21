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

function eG_menuItem (id, type, name, func) {
  this.id = id;     // label of item
  this.type = type; // -1 = empty, 0 = action, 1 = extra
  this.src = name;  // name of default icon source without suffix or extension
  this.func = func; // function    
}

var eG_menuItems= new Array(
  new eG_menuItem(0,   -1, "empty",              null),
  new eG_menuItem(1,	1, "more",               "eGm.showExtraMenu();"),

  new eG_menuItem(2,  	0, "firstPage",          "eGf.firstPage();"),
  new eG_menuItem(3,  	0, "lastPage",           "eGf.lastPage();"),
  new eG_menuItem(4,  	0, "backSite",           "eGf.backSite();"),
  new eG_menuItem(5,  	0, "forwardSite",        "eGf.forwardSite();"),
  new eG_menuItem(6,  	0, "back",               "eGf.back();"),
  new eG_menuItem(7,  	0, "forward",            "eGf.forward();"),
  new eG_menuItem(8,  	0, "reload",             "eGf.reload(eGc.loading);"),
  new eG_menuItem(9,  	0, "up",                 "eGf.up(eGc.doc.URL);"),
  new eG_menuItem(10,  	0, "root",               "eGf.root(eGc.doc.URL, true);"),
  new eG_menuItem(11,	0, "pageTop",            "eGf.pageTop();"),
  new eG_menuItem(12,  	0, "pageBottom",         "eGf.pageBottom();"),
  new eG_menuItem(13,	0, "autoscrolling",      "eGf.autoscrolling(eGc.evtMouseDown);"),

  new eG_menuItem(14,	0, "newTab",             "eGf.newTab(false);"),
  new eG_menuItem(15,	0, "duplicateTab",       "eGf.newTab(true);"),
  new eG_menuItem(16,	0, "prevTab",            "eGf.prevTab();"),
  new eG_menuItem(17,	0, "nextTab",            "eGf.nextTab();"),
  new eG_menuItem(18,	0, "closeTab",           "eGf.closeTab();"),
  new eG_menuItem(19,	0, "closeOtherTabs",     "eGf.closeOtherTabs();"),
  new eG_menuItem(20,	0, "undoCloseTab",       "eGf.undoCloseTab();"),

  new eG_menuItem(21,	0, "newWindow",          "eGf.newWindow(false);"),
  new eG_menuItem(22,	0, "duplicateWindow",    "eGf.newWindow(true);"),
  new eG_menuItem(23,	0, "closeOtherWindows",  "eGf.closeOtherWindows();"),
  new eG_menuItem(24,	0, "closeBrowser",       "eGf.closeBrowser();"),
  new eG_menuItem(25,	0, "minimizeWindow",     "eGf.minimizeWindow();"),
  new eG_menuItem(26,	0, "fullscreen",         "eGf.fullscreen();"),

  new eG_menuItem(27,	0, "openLink",           "eGf.openLink(eGc.link);"),
  new eG_menuItem(28,	0, "openLinkNewWindow",  "eGf.openLinkNewWindow(eGc.link);"),
  new eG_menuItem(29,	0, "copyLink",           "eGf.copyLink(eGc.link);"),
  new eG_menuItem(30,	0, "sendLink",           "eGf.sendLink(eGc.link);"),
  new eG_menuItem(31,	0, "copyImageLocation",  "eGf.copyImageLocation(eGc.image.src);"),
  new eG_menuItem(32,	0, "saveLinkAs",         "eGf.saveLinkAs(eGc.link);"),
  new eG_menuItem(33,	0, "saveImageAs",        "eGf.saveImageAs(eGc.image.src,eGc.doc.title);"),
  new eG_menuItem(34,	0, "savePageAs",         "eGf.savePageAs(eGc.doc);"),
  new eG_menuItem(35,	0, "hideImages",         "eGf.hideImages();"),
  new eG_menuItem(36,	0, "copyImage",          "eGf.copyImage();"),

  new eG_menuItem(37,	0, "homepage",           "eGf.homePage();"),
  new eG_menuItem(38,	0, "dailyReadings",      "eGf.dailyReadings();"),
  new eG_menuItem(39,	0, "searchWeb",          "eGf.searchWeb(eGc.selection);"),
  new eG_menuItem(40,	0, "translate",          "eGf.translate(eGc.selection);"),
  new eG_menuItem(41,	0, "runProgramFile1",    "eGf.runProgramFile(1,eGc.selection);"),
  new eG_menuItem(42,	0, "runProgramFile2",    "eGf.runProgramFile(2,eGc.selection);"),
  new eG_menuItem(43,	0, "runProgramFile3",    "eGf.runProgramFile(3,eGc.selection);"),
  new eG_menuItem(44,	0, "runProgramFile4",    "eGf.runProgramFile(4,eGc.selection);"),
  new eG_menuItem(45,	0, "runProgramFile5",    "eGf.runProgramFile(5,eGc.selection);"),
  new eG_menuItem(46,	0, "runProgramFile6",    "eGf.runProgramFile(6,eGc.selection);"),
  new eG_menuItem(47,	0, "runProgramFile7",    "eGf.runProgramFile(7,eGc.selection);"),
  new eG_menuItem(48,	0, "runProgramFile8",    "eGf.runProgramFile(8,eGc.selection);"),
  new eG_menuItem(49,	0, "runProgramFile9",    "eGf.runProgramFile(9,eGc.selection);"),
  new eG_menuItem(50,	0, "runProgramFile10",   "eGf.runProgramFile(10,eGc.selection);"),

  new eG_menuItem(51,	0, "loadURLScript1",     "eGf.loadURLScript(1,eGc.selection);"),
  new eG_menuItem(52,	0, "loadURLScript2",     "eGf.loadURLScript(2,eGc.selection);"),
  new eG_menuItem(53,	0, "loadURLScript3",     "eGf.loadURLScript(3,eGc.selection);"),
  new eG_menuItem(54,	0, "loadURLScript4",     "eGf.loadURLScript(4,eGc.selection);"),
  new eG_menuItem(55,	0, "loadURLScript5",     "eGf.loadURLScript(5,eGc.selection);"),
  new eG_menuItem(56,	0, "loadURLScript6",     "eGf.loadURLScript(6,eGc.selection);"),
  new eG_menuItem(57,	0, "loadURLScript7",     "eGf.loadURLScript(7,eGc.selection);"),
  new eG_menuItem(58,	0, "loadURLScript8",     "eGf.loadURLScript(8,eGc.selection);"),
  new eG_menuItem(59,	0, "loadURLScript9",     "eGf.loadURLScript(9,eGc.selection);"),
  new eG_menuItem(60,	0, "loadURLScript10",    "eGf.loadURLScript(10,eGc.selection);"),
  new eG_menuItem(61,	0, "loadURLScript11",    "eGf.loadURLScript(11,eGc.selection);"),
  new eG_menuItem(62,	0, "loadURLScript12",    "eGf.loadURLScript(12,eGc.selection);"),
  new eG_menuItem(63,	0, "loadURLScript13",    "eGf.loadURLScript(13,eGc.selection);"),
  new eG_menuItem(64,	0, "loadURLScript14",    "eGf.loadURLScript(14,eGc.selection);"),
  new eG_menuItem(65,	0, "loadURLScript15",    "eGf.loadURLScript(15,eGc.selection);"),
  new eG_menuItem(66,	0, "loadURLScript16",    "eGf.loadURLScript(16,eGc.selection);"),
  new eG_menuItem(67,	0, "loadURLScript17",    "eGf.loadURLScript(17,eGc.selection);"),
  new eG_menuItem(68,	0, "loadURLScript18",    "eGf.loadURLScript(18,eGc.selection);"),
  new eG_menuItem(69,	0, "loadURLScript19",    "eGf.loadURLScript(19,eGc.selection);"),
  new eG_menuItem(70,	0, "loadURLScript20",    "eGf.loadURLScript(20,eGc.selection);"),

  new eG_menuItem(71,	0, "markVisitedLinks",   "eGf.markVisitedLinks();"),
  new eG_menuItem(72,	0, "bookmarkThisLink",   "eGf.bookmarkThisLink(eGc.link);"),
  new eG_menuItem(73,	0, "bookmarkPage",       "eGf.bookmarkPage(eGc.doc.URL, eGc.doc.title, eGc.doc);"),
  new eG_menuItem(74,	0, "bookmarkOpenTabs",   "eGf.bookmarkOpenTabs();"),
  new eG_menuItem(75,	0, "bookmarks",          "eGf.bookmarks();"),
  new eG_menuItem(76,	0, "bookmarksToolbar",   "eGf.bookmarksToolbar();"),
  new eG_menuItem(77,	0, "history",            "eGf.history();"),
  new eG_menuItem(78,	0, "viewPageSource",     "eGf.viewPageSource(eGc.doc);"),
  new eG_menuItem(79,	0, "viewPageInfo",       "eGf.viewPageInfo(eGc.doc);"),
  new eG_menuItem(80,	0, "showOnlyThisFrame",  "eGf.showOnlyThisFrame(eGc.frame_doc);"),
  new eG_menuItem(81,	0, "properties",         "eGf.properties(eGc.evtMouseDown.originalTarget);"),
  new eG_menuItem(82,	0, "printPage",          "eGf.printPage();"),
  new eG_menuItem(83,	0, "mail",               "eGf.mail();"),
  new eG_menuItem(84,	0, "privateBrowsing",    "eGf.privateBrowsing();"),

  new eG_menuItem(85,	0, "cut",                "eGf.cut();"),
  new eG_menuItem(86,	0, "copy",               "eGf.copy();"),
  new eG_menuItem(87,	0, "paste",              "eGf.paste();"),
  new eG_menuItem(88,	0, "undo",               "eGf.undo();"),
  new eG_menuItem(89,	0, "selectAll",          "eGf.selectAll();"),
  new eG_menuItem(90,	0, "highlight",          "(eGm.inputBox.value='' || eGf.highlight(eGc.selection,window._content,true))"), // Because inputBox must be set before calling highlight, in one single instruction
  new eG_menuItem(91,	0, "zoomIn",             "eGf.zoomIn();"),
  new eG_menuItem(92,	0, "zoomOut",            "eGf.zoomOut();"),
  new eG_menuItem(93,	0, "zoomReset",          "eGf.zoomReset();")
);

function eG_menuLayout (menu, name, actionsPrefs, labelsPrefs) {
  this.name = name; // "main", "mainAlt1", "mainAlt2", "extra".  "extraAlt1",  "extraAlt2", "contextLink", "contextImage",  "contextSelection", "contextTextbox"
  this.isExtraMenu = name.search("extra") != -1;
  this.isLarge = menu.largeMenu && !this.isExtraMenu; // extra menus are never large
  this.actions = new Array();
  this.labels = new Array();
  this.aNode = null; // actions DOM node
  this.lNode=null; // labels DOM node
  this.update = { // contains all actions positions that need to be updated according to context
    firstPage:         -1,
    backSite:          -1,
    back:              -1,
    lastPage:          -1,
    forwardSite:       -1,
    forward:           -1,
    nextTab:           -1,
    prevTab:           -1,
    closeOtherTabs:    -1,
    closeOtherWindows: -1,
    reload:            -1,
    up:                -1,
    root:              -1,
    undoCloseTab:      -1,
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////
  //	 initializing layout's actions & labels arrays
  ///////////////////////////////////////////////////////////////////////////////////////////////

  for (var i=0; i<actionsPrefs.length; i++) {
    if ( !this.isLarge && (i==3 || i==7) ) {} // don't push actions that are intended for large menus
    else {
      if (eG_menuItems[actionsPrefs[i]].type==1) {
        if (menu.dropDownMenu)
          eG_menuItems[actionsPrefs[i]].src = "moreDropDownMenu";
        else
          eG_menuItems[actionsPrefs[i]].src = "more";
      }
      this.actions.push(eG_menuItems[actionsPrefs[i]]);
      this.labels.push(this.isExtraMenu && i>2&& i<8?"": labelsPrefs[i]);
    }
  }

  this.hasExtraMenuAction = (this.actions[0].type==1);

  ///////////////////////////////////////////////////////////////////////////////////////////////
  //	 initializing update object
  ///////////////////////////////////////////////////////////////////////////////////////////////

  for (var i = 0; i<this.actions.length; i++) {
    if (this.update[this.actions[i].src]==-1)
      this.update[this.actions[i].src] = i;
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////
  //	setting menu and tooltips images
  ///////////////////////////////////////////////////////////////////////////////////////////////

  this.menuImage = menu.skinPath + (menu.smallIcons ? "small_":"") + (menu.noIcons ? "basic_":"");
  if (!this.isExtraMenu )
    this.menuImage += menu.largeMenu ? "largeMenu.png": "menu.png";
  else
    this.menuImage += "extraMenu.png"; // extra menus are never large

  this.tooltipsImage = menu.skinPath;
  if (!this.isExtraMenu )
    this.tooltipsImage += (this.hasExtraMenuAction ? "other_": "") + (menu.largeMenu ? "largeLabels.png":"labels.png");
  else
    this.tooltipsImage += "extraLabels.png";

  ///////////////////////////////////////////////////////////////////////////////////////////////
  //	setting dimensions and positioning
  ///////////////////////////////////////////////////////////////////////////////////////////////

  var zoom = menu.smallIcons ? 0.625:1;
  var zoomTooltips = menu.smallIcons ? 0.75:1;

  this.outerR = Math.round((this.isLarge ? 70:61)*zoom); // outer radius of pie
  this.innerR = Math.round((this.isLarge ? 36:26)*zoom); // inner radius of pie
  this.actionR = this.innerR; // minimum action radius on pie
  this.width = Math.round((menu.dropDownMenu ? 180: (this.isLarge ? 440:394))*zoomTooltips);
  this.height = Math.round((this.isLarge ? 180:146)*zoom);
  this.zIndex = ( !this.isExtraMenu) ? eGc.maxzIndex-1:eGc.maxzIndex-2;	// extra menus are displayed below main menu level

  this.aNodeXOff = -this.outerR; // offset of menu image
  this.aNodeYOff = -this.outerR;
  this.lNodeXOff = -this.width/2; // offset of tooltips image
  this.lNodeYOff = -this.height/2;

  // labels positioning
  this.xLabelsPos = this.isLarge
                      ? (menu.smallIcons
                        ? new Array(10, 212, 219, 219, 211, 186, 10, 10, 10, 10)
                        : new Array(10, 290, 300, 300, 285, 230, 10, 10, 10, 10))
                      : (menu.smallIcons
                        ? new Array(10, 190, 195, 190, 167, 10, 10, 10)
                        : new Array(10, 265, 270, 260, 230, 10, 10, 10));
  this.yLabelsPos = this.isLarge
                      ? (menu.smallIcons
                        ? new Array( 6, 23, 41,  60,  79,  97,  80,  62, 42, 25)
                        : new Array(10, 40, 70, 100, 130, 162, 130, 100, 70, 40))
                      : (menu.smallIcons
                        ? new Array( 6, 23, 41,  60,  77, 58, 42, 25)
                        : new Array(10, 40, 70, 100, 125, 95, 68, 40));
}

// menu Constructor
function eG_menu () {
  var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("easygestures.");

  ///////////////////////////////////////////////////////////////////////////////////////////////
  // loading preferences first
  ///////////////////////////////////////////////////////////////////////////////////////////////

  this.startupTips = prefs.getBoolPref("profile.startupTips"); // show tips at startup

  this.showButton = prefs.getIntPref("behavior.showButton"); // mouse button for opening the pie menu
  this.showKey = prefs.getIntPref("behavior.showKey"); // key for showing the pie menu with mouse button clicked
  this.dragOnly = prefs.getBoolPref("behavior.dragOnly"); // show pie menu only when dragging
  this.dragOnlyUpLeft = prefs.getBoolPref("behavior.dragOnlyUpLeft"); // dragging for pie menu is only up/left
  this.showAltButton = prefs.getIntPref("behavior.showAltButton"); // mouse button for switching between primary and alternative pie menu
  this.supprKey = prefs.getIntPref("behavior.supprKey"); // key for suppressing the pie menu

  this.showAfterDelay = prefs.getBoolPref("behavior.showAfterDelay"); // enabling display pie menu after delay before dragging
  this.showAfterDelayDelay = prefs.getIntPref("behavior.showAfterDelayDelay"); // delay to display pie menu after delay before dragging

  this.contextMenuAuto = prefs.getBoolPref("behavior.contextMenuAuto");	// enables context sensitivity
  this.contextKey = prefs.getIntPref("behavior.contextKey"); // key for forcing non contextual or contextual pie menu

  this.handleLinks = prefs.getBoolPref("behavior.handleLinks"); // handle clicking on links through pie menu button
  this.handleLinksAsOpenLink = prefs.getBoolPref("behavior.handleLinksAsOpenLink");
  this.linksDelay = prefs.getIntPref("behavior.linksDelay"); // max delay to click on a link. If delay is passed, a keyup will just keep menu open

  this.autoscrollingOn = prefs.getBoolPref("behavior.autoscrollingOn");	// autoscrolling enabling
  this.autoscrollingDelay = prefs.getIntPref("behavior.autoscrollingDelay"); // autoscrolling delay

  this.largeMenu = prefs.getBoolPref("behavior.largeMenu"); // use larger pie menu with 10 actions instead of 8
  this.noIcons = prefs.getBoolPref("behavior.noIcons");
  this.smallIcons = prefs.getBoolPref("behavior.smallIcons");
  this.menuOpacity = prefs.getIntPref("behavior.menuOpacity")/100; // because menuopacity is set in % in preferences dialog
  this.showTooltips = prefs.getBoolPref("behavior.showTooltips"); // tooltip showing
  this.tooltipsDelay = prefs.getIntPref("behavior.tooltipsDelay"); // tooltip delay
  this.tooltipsDelayOmit = prefs.getBoolPref("behavior.tooltipsDelayOmit"); // tooltip delay omit
  this.dailyReadingsFolderURI = prefs.getCharPref("behavior.dailyReadingsFolderURI");

  this.dropDownMenu = prefs.getBoolPref("behavior.dropDownMenu");

  this.moveAuto = prefs.getBoolPref("behavior.moveAuto"); // true: menu moves when reaching edge. false: memu moves by pressing <Shift> key

  this.mainAlternative1 = prefs.getBoolPref("actions.mainAlternative1"); // activate main alternative 1 layout
  this.mainAlternative2 = prefs.getBoolPref("actions.mainAlternative2");
  this.extraAlternative1 = prefs.getBoolPref("actions.extraAlternative1");
  this.extraAlternative2 = prefs.getBoolPref("actions.extraAlternative2");
  this.contextImageFirst = prefs.getBoolPref("actions.contextImageFirst");
  this.contextTextboxFirst = prefs.getBoolPref("actions.contextTextboxFirst");

  this.xlink = prefs.getBoolPref("customizations.xlink"); // display red tag after link
  this.openLink = prefs.getCharPref("customizations.openLink"); // display link in current tab = 'curTab' or new tab = 'newTab' or new window = 'newWindow'

  this.highlightCount = prefs.getBoolPref("customizations.highlightCount"); // display count numbers or not when highlighting a word
  this.highlightColorList = prefs.getCharPref("customizations.highlightColorList").split(";");

  this.closeBrowserOnLastTab = prefs.getBoolPref("customizations.closeBrowserOnLastTab"); // close browser when last tab is closed

  this.queryInNewWindow = prefs.getBoolPref("customizations.queryInNewWindow"); // open search results in new window
  this.queryInNewTab = prefs.getBoolPref("customizations.queryInNewTab"); // always open first search results in current tab

  this.search1 = prefs.getBoolPref("customizations.search1");
  this.search2 = prefs.getBoolPref("customizations.search2");
  this.search3 = prefs.getBoolPref("customizations.search3");
  this.search4 = prefs.getBoolPref("customizations.search4");
  this.search5 = prefs.getBoolPref("customizations.search5");
  this.search6 = prefs.getBoolPref("customizations.search6");
  this.translateQuery = prefs.getCharPref("customizations.translateQuery");

  this.searchQuery1 = prefs.getCharPref("customizations.searchQuery1");
  this.searchQuery2 = prefs.getCharPref("customizations.searchQuery2");
  this.searchQuery3 = prefs.getCharPref("customizations.searchQuery3");
  this.searchQuery4 = prefs.getCharPref("customizations.searchQuery4");
  this.searchQuery5 = prefs.getCharPref("customizations.searchQuery5");
  this.searchQuery6 = prefs.getCharPref("customizations.searchQuery6");

  this.runProgramFile1 = prefs.getComplexValue("customizations.runProgramFile1", Components.interfaces.nsISupportsString).data.split("•"); // [0]: name, [1]:path, [2]:arg, [3]:newIconPath, [4]:appIcon, [5]: newIcon
  this.runProgramFile2 = prefs.getComplexValue("customizations.runProgramFile2", Components.interfaces.nsISupportsString).data.split("•");
  this.runProgramFile3 = prefs.getComplexValue("customizations.runProgramFile3", Components.interfaces.nsISupportsString).data.split("•");
  this.runProgramFile4 = prefs.getComplexValue("customizations.runProgramFile4", Components.interfaces.nsISupportsString).data.split("•");
  this.runProgramFile5 = prefs.getComplexValue("customizations.runProgramFile5", Components.interfaces.nsISupportsString).data.split("•");
  this.runProgramFile6 = prefs.getComplexValue("customizations.runProgramFile6", Components.interfaces.nsISupportsString).data.split("•");
  this.runProgramFile7 = prefs.getComplexValue("customizations.runProgramFile7", Components.interfaces.nsISupportsString).data.split("•");
  this.runProgramFile8 = prefs.getComplexValue("customizations.runProgramFile8", Components.interfaces.nsISupportsString).data.split("•");
  this.runProgramFile9 = prefs.getComplexValue("customizations.runProgramFile9", Components.interfaces.nsISupportsString).data.split("•");
  this.runProgramFile10 = prefs.getComplexValue("customizations.runProgramFile10", Components.interfaces.nsISupportsString).data.split("•");

  this.loadURLScript1 = prefs.getComplexValue("customizations.loadURLScript1", Components.interfaces.nsISupportsString).data.split("•"); // [0]: name, [1]: text, [2]:isScript, [3]: newIconPath, [4]: favicon, [5]: newIcon
  this.loadURLScript2 = prefs.getComplexValue("customizations.loadURLScript2", Components.interfaces.nsISupportsString).data.split("•");
  this.loadURLScript3 = prefs.getComplexValue("customizations.loadURLScript3", Components.interfaces.nsISupportsString).data.split("•");
  this.loadURLScript4 = prefs.getComplexValue("customizations.loadURLScript4", Components.interfaces.nsISupportsString).data.split("•");
  this.loadURLScript5 = prefs.getComplexValue("customizations.loadURLScript5", Components.interfaces.nsISupportsString).data.split("•");
  this.loadURLScript6 = prefs.getComplexValue("customizations.loadURLScript6", Components.interfaces.nsISupportsString).data.split("•");
  this.loadURLScript7 = prefs.getComplexValue("customizations.loadURLScript7", Components.interfaces.nsISupportsString).data.split("•");
  this.loadURLScript8 = prefs.getComplexValue("customizations.loadURLScript8", Components.interfaces.nsISupportsString).data.split("•");
  this.loadURLScript9 = prefs.getComplexValue("customizations.loadURLScript9", Components.interfaces.nsISupportsString).data.split("•");
  this.loadURLScript10 = prefs.getComplexValue("customizations.loadURLScript10", Components.interfaces.nsISupportsString).data.split("•");
  this.loadURLScript11 = prefs.getComplexValue("customizations.loadURLScript11", Components.interfaces.nsISupportsString).data.split("•");
  this.loadURLScript12 = prefs.getComplexValue("customizations.loadURLScript12", Components.interfaces.nsISupportsString).data.split("•");
  this.loadURLScript13 = prefs.getComplexValue("customizations.loadURLScript13", Components.interfaces.nsISupportsString).data.split("•");
  this.loadURLScript14 = prefs.getComplexValue("customizations.loadURLScript14", Components.interfaces.nsISupportsString).data.split("•");
  this.loadURLScript15 = prefs.getComplexValue("customizations.loadURLScript15", Components.interfaces.nsISupportsString).data.split("•");
  this.loadURLScript16 = prefs.getComplexValue("customizations.loadURLScript16", Components.interfaces.nsISupportsString).data.split("•");
  this.loadURLScript17 = prefs.getComplexValue("customizations.loadURLScript17", Components.interfaces.nsISupportsString).data.split("•");
  this.loadURLScript18 = prefs.getComplexValue("customizations.loadURLScript18", Components.interfaces.nsISupportsString).data.split("•");
  this.loadURLScript19 = prefs.getComplexValue("customizations.loadURLScript19", Components.interfaces.nsISupportsString).data.split("•");
  this.loadURLScript20 = prefs.getComplexValue("customizations.loadURLScript20", Components.interfaces.nsISupportsString).data.split("•");

  this.loadURLin = prefs.getCharPref("customizations.loadURLin"); // execute 'Load URL' action in current tab = 'curTab' or new tab = 'newTab' or new window = 'newWindow'

  this.skinPath = prefs.getCharPref("skin.path"); // path to skin containing icons and images

  ///////////////////////////////////////////////////////////////////////////////////////////////
  //	initializing properties
  ///////////////////////////////////////////////////////////////////////////////////////////////

  this.curLayoutName = "main";
  this.baseMenu; // is the menu from which extra menu is called: main, mainAlt1 or mainAlt2
  this.menuState = 0; // 0: not shown    1: showing   2: showing & mouse moved    3: staying open
  this.popup = null; // used for 'Search Web', 'Daily Readings' actions to display a popup on the fly

  // Coordonnées
  this.pageX = 0; // page x coordinate of pie menu center
  this.pageY = 0;
  this.clientX = 0; // client x coordinate of pie menu center
  this.clientY = 0;
  this.screenX = 0; // screen x coordinate of pie menu center
  this.screenY = 0;

  this.sector = -1; // index of item under mouse
  this.node = null; // root of DOM tree containing the pie menu

  this.tooltipsTrigger = null; // trigger to display pie menu labels
  this.autoscrollingTrigger = null; // trigger to display autoscrolling
  this.autoscrolling = false; // used for automatic delayed autoscrolling on mouse down

  this.specialNodes = null; // parent node of all special nodes inserted in the DOM: inputBox, linkSign, altMenuSign and contextMenuSign
  this.inputBox = null;
  this.inputBoxSignForHighlight = null; // used to make a case sensitive search or not
  this.inputBoxSignForSearchWeb = null; // used to select search engine on the fly
  this.searchWebEngine = 0;
  this.linkSign = null; // image displayed when a link is pointed
  this.altMenuSign = null; // image displayed when alternative menu is displayed
  this.altMenuSignWidth = 26; // width (size of image 8px + spacing 4px)
  this.contextMenuSign = null; // image displayed when contextual menu is displayed
  this.contextAltMenuSign = null; // image displayed when contextual menu is displayed and when an alternative contextual layout is available

  this.extraMenuAction = null; // position of extra menu action in base menu from which extra menu is called

  this.iconSize = this.smallIcons? 20 : 32;
  this.locationBarWitdh = 500; // width of inputBox for URL input
  this.inputBoxWidth = 120; // width of inputBox for text input

  this.typingText = false; // used to cancel mouse events to pie menu when <enter> is pressed for typing
  this.showingTooltips = false; // tooltips are showing or hidden

  // for drop down menu only
  this.lineHeight = 0;
  this.headerHeight = 8;
  this.footerHeight = 4;
  this.slideToExtraMenu = 0;

  ///////////////////////////////////////////////////////////////////////////////////////////////
  // final initilalizations
  ///////////////////////////////////////////////////////////////////////////////////////////////

  this.menuSet = { // contains main, extra, alternatives and contextual menu layouts objects
    main: new eG_menuLayout(this, "main",
                            prefs.getCharPref("actions.main").split("/"),
                            prefs.getComplexValue("actions.labels.main", Components.interfaces.nsISupportsString).data.split("•")),

    mainAlt1: new eG_menuLayout(this, "mainAlt1",
                                prefs.getCharPref("actions.mainAlt1").split("/"),
                                prefs.getComplexValue("actions.labels.mainAlt1", Components.interfaces.nsISupportsString).data.split("•")),

    mainAlt2: new eG_menuLayout(this, "mainAlt2",
                                prefs.getCharPref("actions.mainAlt2").split("/"),
                                prefs.getComplexValue("actions.labels.mainAlt2", Components.interfaces.nsISupportsString).data.split("•")),

    extra: new eG_menuLayout(this, "extra",
                             prefs.getCharPref("actions.extra").split("/"),
                             prefs.getComplexValue("actions.labels.extra", Components.interfaces.nsISupportsString).data.split("•")),

    extraAlt1: new eG_menuLayout(this, "extraAlt1",
                                 prefs.getCharPref("actions.extraAlt1").split("/"),
                                 prefs.getComplexValue("actions.labels.extraAlt1", Components.interfaces.nsISupportsString).data.split("•")),

    extraAlt2: new eG_menuLayout(this, "extraAlt2",
                                 prefs.getCharPref("actions.extraAlt2").split("/"),
                                 prefs.getComplexValue("actions.labels.extraAlt2", Components.interfaces.nsISupportsString).data.split("•")),

    contextLink: new eG_menuLayout(this, "contextLink",
                                   prefs.getCharPref("actions.contextLink").split("/"),
                                   prefs.getComplexValue("actions.labels.contextLink", Components.interfaces.nsISupportsString).data.split("•")),

    contextImage: new eG_menuLayout(this, "contextImage",
                                    prefs.getCharPref("actions.contextImage").split("/"),
                                    prefs.getComplexValue("actions.labels.contextImage", Components.interfaces.nsISupportsString).data.split("•")),

    contextSelection: new eG_menuLayout(this, "contextSelection",
                                        prefs.getCharPref("actions.contextSelection").split("/"),
                                        prefs.getComplexValue("actions.labels.contextSelection", Components.interfaces.nsISupportsString).data.split("•")),

    contextTextbox: new eG_menuLayout(this, "contextTextbox",
                                      prefs.getCharPref("actions.contextTextbox").split("/"),
                                      prefs.getComplexValue("actions.labels.contextTextbox", Components.interfaces.nsISupportsString).data.split("•")),
  }
}

eG_menu.prototype = {
  createPopup : function () {
    this.popup = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "menupopup");
    this.popup.setAttribute("id", "eG_popup");
    this.popup.setAttribute("maxwidth", 300);
    document.getElementById("mainPopupSet").appendChild(this.popup);
  },

  createSpecialNodes : function (layoutName) { //creating DOM nodes
    var layout = this.menuSet[layoutName];

    ////////////////////////////////////////////////////////////////////////////
    // creating a div to contain all the items
    ///////////////////////////////////////////////////////////////////////////

    var node = eGc.frame_doc.createElementNS("http://www.w3.org/1999/xhtml", "div");
    node.setAttribute("id","eG_SpecialNodes"); // used to know if menu has already been displayed in the current document
    this.shieldCss(node);
    node.style.position = "fixed";
    node.style.display = "inline";
    node.style.zIndex =eGc.maxzIndex;

    ////////////////////////////////////////////////////////////////////////////
    // creating link sign
    ///////////////////////////////////////////////////////////////////////////

    var img = eGc.frame_doc.createElementNS("http://www.w3.org/1999/xhtml", "img");
    this.shieldCss(img);
    img.style.position = "absolute";
    // img.style.display = "inline";
    if (this.dropDownMenu) {
      img.style.left = -this.iconSize/2+"px";
      img.style.top = (layout.hasExtraMenuAction
                        ? this.lineHeight + this.headerHeight + this.iconSize/2
                        : -this.iconSize/2) + "px";
    }
    else {
      img.style.left = Math.round(layout.outerR -this.iconSize/2)+"px";
      img.style.top = Math.round(layout.outerR -this.iconSize/2)+"px";
    }
    img.style.width = this.iconSize+"px";
    img.style.height = this.iconSize+"px";
    img.src = this.skinPath + (this.smallIcons ? "small_" : "") + "link.png";
    img.alt = "";
    img.style.visibility = "hidden";

    this.linkSign = img;
    node.appendChild(img);

    ////////////////////////////////////////////////////////////////////////////
    // creating inputBox for location bar and text search
    ///////////////////////////////////////////////////////////////////////////

    var txtbox = eGc.frame_doc.createElementNS("http://www.w3.org/1999/xhtml", "input");
    txtbox.style.font = "normal 10pt Arial, sans-serif";
    txtbox.style.backgroundColor = "white";
    txtbox.style.color = "black";
    txtbox.style.textAlign = "center";
    txtbox.style.position = "absolute";
    txtbox.style.borderColor = eGc.gray;
    txtbox.style.borderStyle = "solid";
    txtbox.style.borderTopWidth = "4px";
    txtbox.style.borderBottomWidth = "8px";
    txtbox.style.borderLeftWidth = "2px";
    txtbox.style.borderRightWidth = "2px";
    txtbox.style.zIndex = eGc.maxzIndex;
    txtbox.style.visibility = "hidden";

    this.inputBox = txtbox;
    node.appendChild(txtbox);

    ////////////////////////////////////////////////////////////////////////////
    // adding sign image for highlight inputBox
    ///////////////////////////////////////////////////////////////////////////

    var img = eGc.frame_doc.createElementNS("http://www.w3.org/1999/xhtml", "img");
    this.shieldCss(img);
    img.src = this.skinPath + "matchCase_Off.png";
    img.style.position = "absolute";
    //img.style.display = "inline";
    img.style.zIndex = eGc.maxzIndex;
    img.setAttribute("onclick",
                     "var matchCase = this.src.search('matchCase_On') != -1; this.src = this.src.replace( (matchCase?'On':'Off') , (matchCase?'Off':'On')); this.previousSibling.focus();");
    img.style.visibility = "hidden";

    this.inputBoxSignForHighlight = img;
    node.appendChild(img);

    ////////////////////////////////////////////////////////////////////////////
    // adding sign image for searchWeb inputBox
    ///////////////////////////////////////////////////////////////////////////

    var img = eGc.frame_doc.createElementNS("http://www.w3.org/1999/xhtml", "img");
    this.shieldCss(img);
    img.style.position = "absolute";
    //img.style.display = "inline";
    img.style.zIndex = eGc.maxzIndex;

    // finding favicons, setting items
    var searchEnginesCount = 0;
    var lastSearchEngineIndex = 0;
    var faviconPath = null;
    var faviconService = Components.classes["@mozilla.org/browser/favicon-service;1"].getService(Components.interfaces.nsIFaviconService);
    var ios = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
    for (var i=1; i<=6; i++) {
      chksearch = eGm["search"+i];
      query = eGm["searchQuery"+i];
      if (query !="" && chksearch) {
        try {
          faviconPath = faviconService.getFaviconForPage(ios.newURI(ios.newURI(query, null, null).prePath,null,null)).spec;
          img.setAttribute("searchQuery"+i, faviconPath);
        }
        catch (e) {
          faviconPath = ios.newURI(query, null, null).prePath + "/favicon.ico";
          img.setAttribute("searchQuery"+i, faviconPath);
        }
        if (chksearch)
          searchEnginesCount++;
        lastSearchEngineIndex = i;
      }
    }
    if (searchEnginesCount > 1) {
      img.src = this.skinPath +"searchWebSign.png";
      img.setAttribute("searchQuery0", img.src);
      img.setAttribute("currentEngine", "0");
    }
    else {
      img.src = faviconPath;
      img.setAttribute("currentEngine", lastSearchEngineIndex);
    }

    img.setAttribute ("onclick", "var next = parseInt(getAttribute('currentEngine')); do {next=(next+1)%7;} while (!this.hasAttribute('searchQuery'+next) && (next!=0 || !this.hasAttribute('searchQuery0')) ); this.src=this.getAttribute('searchQuery'+ next);this.setAttribute('currentEngine',next);this.previousSibling.previousSibling.focus();");
    img.style.visibility = "hidden";

    this.inputBoxSignForSearchWeb = img;
    node.appendChild(img);

    ////////////////////////////////////////////////////////////////////////////
    // adding sign image for alternative menu
    ///////////////////////////////////////////////////////////////////////////	

    var img = eGc.frame_doc.createElementNS("http://www.w3.org/1999/xhtml", "img");
    this.shieldCss(img);
    img.src = this.skinPath +"altMenuSign0.png";
    img.style.position = "absolute";
    //img.style.display = "inline";
    img.style.visibility = "hidden";

    this.altMenuSign = img;
    node.appendChild(img);
    //dumpObject(img.wrappedJSObject, false,0,0);

    ////////////////////////////////////////////////////////////////////////////
    // Adding sign image for contextual menu
    ///////////////////////////////////////////////////////////////////////////

    var div = eGc.frame_doc.createElementNS("http://www.w3.org/1999/xhtml", "div");
    this.shieldCss(div);
    div.style.backgroundImage = "url('chrome://easygestures/skin/contextMenuSign.png')";
    div.style.backgroundColor = "red";

    var text = eGc.frame_doc.createElementNS("http://www.w3.org/1999/xhtml", "div");
    //this.shieldCss(text);
    text.style.position = "absolute";
    //text.style.display = "inline";
    text.style.textAlign = "center";
    text.style.fontWeight = "bold";
    text.style.fontSize = "8pt";
    text.style.color = "#777777";
    text.style.width = 76+"px";
    if (this.dropDownMenu) {
      text.style.left = "-6px";
      text.style.top = "-16px";
    }
    else {
      text.style.left = Math.round(layout.outerR-76/2)+"px";
      text.style.top = Math.round(-this.iconSize/4-7)+"px";
    }
    //text.appendChild(eGc.frame_doc.createTextNode(eGc.localizing.getString("contextual")));
    text.appendChild(eGc.frame_doc.createTextNode(""));

    var img = eGc.frame_doc.createElementNS("http://www.w3.org/1999/xhtml", "img");
    img.src = this.skinPath+"contextMenuSign.png";
    img.style.position = "absolute";
    img.style.left = parseInt(text.style.left)+"px";
    img.style.top = parseInt(text.style.top)-6+"px";

    var img2 = eGc.frame_doc.createElementNS("http://www.w3.org/1999/xhtml", "img");
    img2.src = this.skinPath+"contextMenuSign.png";
    img2.style.position = "absolute";
    img2.style.left = parseInt(img.style.left)+4+"px";
    img2.style.top = parseInt(img.style.top)-4+"px";

    div.appendChild(img2); // img2 is for indicationg that there is an alternative context
    this.contextAltMenuSign=img2;

    div.appendChild(img);
    div.appendChild(text);

    div.style.visibility = "hidden";

    this.contextMenuSign = div;
    node.appendChild(div);

    this.specialNodes = node;
    eGc.body.insertBefore(this.specialNodes, eGc.body.firstChild);
  },

  createActionsNodes : function(layoutName) { //creating DOM nodes
    var layout = this.menuSet[layoutName];

    ////////////////////////////////////////////////////////////////////////////
    // creating a div to contain all the items
    ///////////////////////////////////////////////////////////////////////////

    var node = eGc.frame_doc.createElementNS("http://www.w3.org/1999/xhtml", "div");
    node.setAttribute("id","eG_actions_"+layoutName); // used to know if menu has already been displayed in the current document
    this.shieldCss(node);
    //node.style.position = "absolute";
    node.style.position = "fixed";
    node.style.width = 2*layout.outerR + "px";
    node.style.height = 2*layout.outerR + "px";
    node.style.zIndex = layout.zIndex;

    ////////////////////////////////////////////////////////////////////////////
    // creating actions images
    ///////////////////////////////////////////////////////////////////////////

    var xofs =  layout.outerR - this.iconSize/2;
    var yofs = layout.outerR - this.iconSize/2;
    var imageR = (layout.outerR+layout.innerR)/2;

    var nbItems = layout.actions.length; // number of items to be displayed
    for(var i = 0; i<nbItems; i++) {
      var angle = Math.PI/2 - i*2*Math.PI/nbItems;

      var xpos = imageR* Math.cos(angle)+ xofs;
      var ypos = -imageR* Math.sin(angle)+ yofs;

      timg = eGc.frame_doc.createElementNS("http://www.w3.org/1999/xhtml", "div"); // was img tag. Changed to div tag to use compound image
      this.shieldCss(timg);
      timg.style.zIndex = layout.zIndex;
      timg.style.position = "absolute";
      timg.style.display = "inline";
      timg.style.left = Math.round(xpos) + "px";
      timg.style.top = Math.round(ypos) + "px";
      timg.style.width = this.iconSize + "px";
      timg.style.height = this.iconSize + "px";
      timg.style.backgroundImage="url('"+this.skinPath+(this.smallIcons ? "small_actions.png":"actions.png") + "')";
      timg.style.backgroundRepeat="no-repeat";
      timg.setAttribute("grayed", "false");
      timg.setAttribute("active", "false");

      if (layout.actions[i].src.search("loadURLScript")==-1 && layout.actions[i].src.search("runProgramFile")==-1) {
        timg.setAttribute("class", ( (this.smallIcons ? "small_":"") + (this.noIcons ? "empty": layout.actions[i].src) ) );
        if (layout.actions[i].type==1)
          this.extraMenuAction = i;
      }
      else { // new icon path for both type of actions: loadURLScript & runProgramFile ?
        if (this[layout.actions[i].src][4]=="true" || this[layout.actions[i].src][5]=="true") {
          if (!this.smallIcons && this[layout.actions[i].src][4]=="true") { // adjusting icons for better presentation because favicons are 16x16 size and look small in the pie
            timg.style.font="bold 10px Arial, sans-serif";
            timg.style.paddingTop="16px";
            timg.style.paddingLeft="6px";
            timg.style.backgroundPosition="8px 0px";
            var number = parseInt(layout.actions[i].src.replace(/([^0-9])+/g,""));
            var protocol = this[layout.actions[i].src][1];
            protocol = protocol.substring(0,protocol.search("://")+1);
            timg.appendChild(eGc.frame_doc.createTextNode(protocol));
          }
          timg.style.backgroundImage="url('"+(this[layout.actions[i].src][3]).replace(/\\/g , "\\\\")+"')";
          timg.setAttribute("class", ( (this.smallIcons ? "small_":"") + (this.noIcons ? "empty": "customIcon") ) );
        }
        else {
          timg.setAttribute("class", ( (this.smallIcons ? "small_":"") + (this.noIcons ? "empty": layout.actions[i].src) ) );
        }
      }

      timg.alt = "";
      node.appendChild(timg);
    }

    ////////////////////////////////////////////////////////////////////////////
    // creating menu image
    ///////////////////////////////////////////////////////////////////////////

    var timg = eGc.frame_doc.createElementNS("http://www.w3.org/1999/xhtml", "img");
    this.shieldCss(timg);
    timg.style.zIndex = layout.zIndex-1;
    timg.src=layout.menuImage;
    timg.style.width = 2*layout.outerR+"px";
    timg.style.height = 2*layout.outerR +"px";
    timg.style.opacity = this.menuOpacity;
    timg.alt = "";
    node.appendChild(timg);

    // save node and hide it
    layout.aNode = node;
    layout.aNode.style.display = "none";
    eGc.body.insertBefore(layout.aNode, eGc.body.firstChild);
  },

  createLabelsNodes : function(layoutName) { //creating DOM nodes
    var layout = this.menuSet[layoutName];

    ////////////////////////////////////////////////////////////////////////////
    // creating a div to contain all the items
    ///////////////////////////////////////////////////////////////////////////

    var node = eGc.frame_doc.createElementNS("http://www.w3.org/1999/xhtml", "div");
    node.setAttribute("id","eG_labels_"+layoutName); // used to know if labels have already been displayed in the current document
    this.shieldCss(node);
    if (eGc.localizing.getString("locale")=="ar-TN")
      node.style.direction= "rtl";
    else
      node.style.direction = "ltr";
    node.style.font = "normal 0mm tahoma,arial,helvetica,sans-serif"; // font size is changed in compensateTextZoom
    node.style.verticalAlign = "baseline";
    node.style.textAlign = "left";
    node.style.textIndent = "0px";
    node.style.position = "fixed";
    node.style.height = layout.height+"px";
    node.style.width = layout.width+"px";
    node.style.zIndex =  layout.zIndex-1; // labels are displayed below menu level

    ////////////////////////////////////////////////////////////////////////////
    // creating labels and adjusting labels position
    ///////////////////////////////////////////////////////////////////////////

    var nbItems = layout.labels.length; // number of items to be displayed

    var xofs = 0;
    var yofs = 0;

    for (var i = 0; i<nbItems; i++) {
      var xpos = layout.xLabelsPos[i] + xofs;
      var ypos = layout.yLabelsPos[i] + yofs;

      var tdiv = eGc.frame_doc.createElementNS("http://www.w3.org/1999/xhtml", "div");
      this.shieldCss(tdiv);
      tdiv.style.zIndex = layout.zIndex-1;
      tdiv.style.fontWeigth = "normal";
      tdiv.style.position = "absolute";
      tdiv.style.left = Math.round(xpos)+"px";
      tdiv.style.top = Math.round(ypos)+"px";
      tdiv.style.width = "250px"; // gives space for bold text (highlighted)
      tdiv.appendChild(eGc.frame_doc.createTextNode(layout.labels[i]) );
      node.appendChild(tdiv);
    }

    ////////////////////////////////////////////////////////////////////////////
    // creating tooltips image
    ///////////////////////////////////////////////////////////////////////////

    var timg = eGc.frame_doc.createElementNS("http://www.w3.org/1999/xhtml", "img");
    this.shieldCss(timg);
    timg.style.zIndex = layout.zIndex-2;
    timg.src = layout.tooltipsImage;
    timg.style.width = layout.width+"px";
    timg.style.height = layout.height+"px";
    node.appendChild(timg);

    // save node and hide it
    layout.lNode = node;
    layout.lNode.style.display = "none";
    eGc.body.insertBefore(layout.lNode, eGc.body.firstChild);
  },

  createDropDownNodes : function(layoutName) {
    var layout = this.menuSet[layoutName];

    ////////////////////////////////////////////////////////////////////////////
    // creating a div to contain all the items
    ///////////////////////////////////////////////////////////////////////////

    var node = eGc.frame_doc.createElementNS("http://www.w3.org/1999/xhtml", "div");
    node.setAttribute("id","eG_actions_"+layoutName); // used to know if menu has already been displayed in the current document
    this.shieldCss(node);
    //node.style.position = "absolute";
    node.style.position = "fixed";
    node.style.width = layout.width + "px";
    node.style.zIndex = layout.zIndex;
    node.style.lineHeight = "0px";
    node.style.textAlign = "left";
    node.style.backgroundColor = eGc.gray;
    node.style.opacity = this.menuOpacity;
    node.style.borderStyle = "solid";
    node.style.borderColor = eGc.darkgray;
    node.style.borderWidth = "1px";
    //if (eGc.localizing.getString("locale")=="ar-TN") node.style.direction= "rtl";
    //else node.style.direction = "ltr";
    node.style.font = "normal 8pt tahoma,arial,helvetica,sans-serif"; // font size is changed in showLabels
    node.style.verticalAlign = "baseline";
    node.style.textIndent = "0px";

    ////////////////////////////////////////////////////////////////////////////
    // creating actions images
    ///////////////////////////////////////////////////////////////////////////

    var xofs =  0;
    var yofs = 0;

    var nbItems = layout.actions.length; // number of items to be displayed
    var horizSpacing = 4;
    this.lineHeight = !this.noIcons ? this.iconSize+4 : 20+4;

    for (var i=0; i<nbItems; i++) {
      if (layout.isExtraMenu && i>2 && i<6) { // create dummy nodes
        var lineNode = eGc.frame_doc.createElementNS("http://www.w3.org/1999/xhtml", "div");
        var timg = eGc.frame_doc.createElementNS("http://www.w3.org/1999/xhtml", "div");
        lineNode.appendChild(timg);
        node.appendChild(lineNode);
        continue;
      }

      var lineNode = eGc.frame_doc.createElementNS("http://www.w3.org/1999/xhtml", "div");
      this.shieldCss(lineNode);
      if (layout.isExtraMenu)
        lineNode.style.backgroundColor = eGc.lightgray;

      // set default selection
      if (i==0 && !layout.hasExtraMenuAction &&  !layout.isExtraMenu || i==1 && layout.hasExtraMenuAction)
        lineNode.style.backgroundImage= "url('chrome://easygestures/skin/lineSelection.png')";

      lineNode.style.position = "absolute";
      lineNode.style.left = xofs + "px";
      lineNode.style.top = yofs + "px";
      lineNode.style.display = "inline";
      lineNode.style.lineHeight = this.lineHeight+ "px"; // trick to center text and image inside div
      lineNode.style.width = node.style.width;
      lineNode.style.height = this.lineHeight+ "px";

      timg = eGc.frame_doc.createElementNS("http://www.w3.org/1999/xhtml", "div"); // was img tag. Changed to div tag to use compound image
      this.shieldCss(timg);
      timg.style.verticalAlign="middle";
      timg.style.width = (!this.noIcons ? this.iconSize : 1) + "px";
      timg.style.height = (!this.noIcons ? this.iconSize : 1) + "px";
      timg.style.marginLeft = horizSpacing + "px";
      timg.style.position = "absolute";
      //timg.alt = "";
      timg.style.backgroundImage = "url('"+this.skinPath+(this.smallIcons ? "small_actions.png":"actions.png") + "')";
      timg.style.backgroundRepeat = "no-repeat";
      timg.setAttribute("grayed", "false");
      timg.setAttribute("active", "false");

      if (layout.actions[i].src.search("loadURLScript")==-1 && layout.actions[i].src.search("runProgramFile")==-1) {
        timg.setAttribute("class", ( (this.smallIcons ? "small_":"") + (this.noIcons ? "empty": layout.actions[i].src) ) );
        if (layout.actions[i].type==1)
          this.extraMenuAction = i;
      }
      else { // new icon path for both type of actions: loadURLScript & runProgramFile ?
        if ( this[layout.actions[i].src][4]=="true" || this[layout.actions[i].src][5]=="true")	{
          if (!this.smallIcons && this[layout.actions[i].src][4]=="true") { // adjusting icons for better presentation because favicons are 16x16 size and look small in the pie
            timg.style.font = "bold 10px Arial, sans-serif";
            timg.style.paddingTop = "16px";
            timg.style.paddingLeft = "6px";
            timg.style.backgroundPosition = "8px 0px";
            var number = parseInt(layout.actions[i].src.replace(/([^0-9])+/g,""));
            var protocol = this[layout.actions[i].src][1];
            protocol = protocol.substring(0,protocol.search("://")+1);
            timg.appendChild(eGc.frame_doc.createTextNode(protocol));
          }
          timg.style.backgroundImage="url('"+(this[layout.actions[i].src][3])+"')";
          timg.setAttribute("class", ( (this.smallIcons ? "small_":"") + (this.noIcons ? "empty": "customIcon") ) );
        }
        else {
          timg.setAttribute("class", ( (this.smallIcons ? "small_":"") + (this.noIcons ? "empty": layout.actions[i].src) ) );
        }
      }

      lineNode.appendChild(timg);

      tspan = eGc.frame_doc.createElementNS("http://www.w3.org/1999/xhtml", "span");
      tspan.style.marginLeft = this.iconSize+2*horizSpacing+ "px";
      if (layout.actions[i].type!=1)
        tspan.appendChild(eGc.frame_doc.createTextNode(layout.labels[i])); // don't display Extra Menu label with drop down menu not to confuse user
      lineNode.appendChild(tspan);
      node.appendChild(lineNode);
      yofs += this.lineHeight;
    }

    node.style.height = yofs+this.footerHeight+ "px"; // footer

    // save node and hide it
    layout.aNode = node;
    layout.aNode.style.display = "none";
    eGc.body.insertBefore(layout.aNode, eGc.body.firstChild);
  },

  show : function(layoutName) { // makes menu visible
    var layout = this.menuSet[layoutName];

    if (this.showButton == 2) { // right click: make sure "Disable or replace context menus" Browser option is checked so that eG can control right click context menu display
      if (eGc.allowContextBrowserOptionTimerId != null)
        clearTimeout(eGc.allowContextBrowserOptionTimerId);
      var pref = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
      eGc.allowContextBrowserOption = pref.getBoolPref("dom.event.contextmenu.enabled");
      if (!eGc.allowContextBrowserOption)
        pref.setBoolPref("dom.event.contextmenu.enabled",true);
    }

    // create resources if necessary
    if (this.popup == null || document.getElementById("eG_popup") == null)
      this.createPopup();

    var existingNode = eGc.frame_doc.getElementById("eG_SpecialNodes");
    if (this.specialNodes == null || existingNode == null)
      this.createSpecialNodes("main");
    else
      if (this.specialNodes != existingNode ) { // get existing nodes
        this.specialNodes = existingNode;
        this.linkSign = this.specialNodes.wrappedJSObject.childNodes[0];
        this.inputBox = this.specialNodes.wrappedJSObject.childNodes[1];
        this.inputBoxSignForHighlight = this.specialNodes.wrappedJSObject.childNodes[2];
        this.inputBoxSignForSearchWeb = this.specialNodes.wrappedJSObject.childNodes[3];
        this.altMenuSign = this.specialNodes.wrappedJSObject.childNodes[4];
        this.contextMenuSign = this.specialNodes.wrappedJSObject.childNodes[5];
      }

    if (this.dropDownMenu) {
      // create resources if necessary
      var existingNode = eGc.frame_doc.getElementById("eG_actions_"+layoutName);
      if (layout.aNode == null || existingNode == null)
        this.createDropDownNodes(layoutName); // checking if menu has already been displayed in the current document
      else
        if (layout.aNode != existingNode)
          layout.aNode = existingNode;

      // recalculate positions
      layout.aNode.style.left = this.clientX + "px";
      layout.aNode.style.top = this.clientY + (layout.hasExtraMenuAction ? -this.lineHeight-this.headerHeight:0)+ "px";
      layout.aNode.style.display = "block";

      this.specialNodes.style.left = this.clientX + "px";
      this.specialNodes.style.top = this.clientY + (layout.hasExtraMenuAction && !layout.isExtraMenu ? -this.lineHeight-this.headerHeight:0)+"px";
      this.altMenuSign.style.top = -10+"px";
      this.altMenuSign.style.left = -4+"px";

      if (this.menuState == 0)
        this.menuState = 1; // menu is showing
      this.curLayoutName = layoutName;
      this.update();
    }
    else {
      // create resources if necessary
      var existingNode = eGc.frame_doc.getElementById("eG_actions_"+layoutName);
      if (layout.aNode == null ||  existingNode == null)
        this.createActionsNodes(layoutName); // checking if menu has already been displayed in the current document
      else
        if (layout.aNode != existingNode)
          layout.aNode = existingNode;

      // recalculate positions
      layout.aNode.style.left = this.clientX + layout.aNodeXOff + "px";
      layout.aNode.style.top = this.clientY + layout.aNodeYOff+ "px";
      layout.aNode.style.display = "block";

      this.specialNodes.style.left = this.clientX + layout.aNodeXOff + "px";
      //this.specialNodes.style.top=this.clientX + layout.aNodeYOff+ "px";
      if (!layout.isExtraMenu)
        this.specialNodes.style.top = this.clientY + layout.aNodeYOff + "px";
      this.altMenuSign.style.top = -10-(layout.isExtraMenu?layout.outerR*1.2 + (layout.isLarge ? this.iconSize/2 :0):0)+"px";
      this.altMenuSign.style.left=layout.outerR-12 + "px";

      if (this.menuState == 0)
        this.menuState = 1; // menu is showing
      this.curLayoutName = layoutName;
      this.update();
      this.resetTooltipsTimeout();
    }
  },

  handleMousemove : function(event) { // handle rollover effects and switch to/from extra menu
    var layout = this.menuSet[this.curLayoutName];

    // state change if was dragged
    if (this.menuState == 1 && (Math.abs(event.clientX- this.clientX)> 1 || Math.abs(event.clientY- this.clientY)> 1))
      this.menuState = 2;

    var movDir = event.clientY - eGc.clientYDown; // used to control extra menu opening/closing from an action
    eGc.clientYDown = event.clientY;

    ///////////////////////////////////////////////////////////////////////////////////////////////
    // two variables needed when dealing with drop down menu
    ///////////////////////////////////////////////////////////////////////////////////////////////
    var dx = (event.clientX-parseInt(layout.aNode.style.left) );
    var dy = (event.clientY-parseInt(layout.aNode.style.top) ) - this.lineHeight-this.headerHeight;

    ///////////////////////////////////////////////////////////////////////////////////////////////
    //	identifying current sector
    ///////////////////////////////////////////////////////////////////////////////////////////////

    var nbItems = layout.actions.length; // number of items to be displayed

    var sector = -1;
    var radius = Math.sqrt((event.clientX-this.clientX)* (event.clientX-this.clientX) + (event.clientY-this.clientY)* (event.clientY-this.clientY));

    if (radius > layout.innerR) {
      var angle = Math.atan2(event.clientX-this.clientX, this.clientY-event.clientY) + Math.PI/nbItems;
      if (angle < 0)
        angle += 2* Math.PI;
      sector = Math.floor( nbItems*angle/ (2* Math.PI) );
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    // moving menu when shift key is down
    ///////////////////////////////////////////////////////////////////////////////////////////////

    var moveAutoTrigger;
    if (this.dropDownMenu) {
      if (layout.isExtraMenu)
        nbItems=5;
      moveAutoTrigger = ((dy < -this.lineHeight || dx> layout.width || dx< 0) && !layout.hasExtraMenuAction)
                        || ((dy > (nbItems-1)*this.lineHeight || dx> layout.width || dx< 0) && layout.hasExtraMenuAction);
    }
    else
      moveAutoTrigger = (radius >= layout.outerR && layout.actions[sector].type!=1);

    if (event.shiftKey && !this.moveAuto || this.moveAuto && moveAutoTrigger ) {
      if (eGc.moving) {
        var dx = (event.clientX - eGc.xMoving);
        var dy = (event.clientY - eGc.yMoving);

        this.clientX += dx;
        this.clientY += dy;

        layout.aNode.style.left = parseFloat(layout.aNode.style.left)+dx+ "px"; // parseFloat !!!
        layout.aNode.style.top = parseFloat(layout.aNode.style.top)+dy+ "px";
        if (layout.lNode!=null) {
          layout.lNode.style.left = parseFloat(layout.lNode.style.left)+dx+ "px";
          layout.lNode.style.top = parseFloat(layout.lNode.style.top)+dy+ "px";
        }

        this.specialNodes.style.left = parseFloat(this.specialNodes.style.left)+dx+ "px";
        this.specialNodes.style.top = parseFloat(this.specialNodes.style.top)+dy+ "px";

        if (layout.isExtraMenu) { // extra menu is displayed: move base menu too
          var baseLayout = this.menuSet[this.baseMenu];
          baseLayout.aNode.style.left = parseFloat(baseLayout.aNode.style.left)+dx+ "px"; // parseFloat !!!
          baseLayout.aNode.style.top = parseFloat(baseLayout.aNode.style.top)+dy+ "px";
          if (baseLayout.lNode!=null) {
            baseLayout.lNode.style.left = parseFloat(baseLayout.lNode.style.left)+dx+ "px";
            baseLayout.lNode.style.top = parseFloat(baseLayout.lNode.style.top)+dy+ "px";
          }
        }
      }
      else
        eGc.moving = true;

      eGc.xMoving = event.clientX;
      eGc.yMoving = event.clientY;

      return;
    }
    else
      eGc.moving = false;

    ///////////////////////////////////////////////////////////////////////////////////////////////
    // dealing with drop down menu
    ///////////////////////////////////////////////////////////////////////////////////////////////

    if (this.dropDownMenu) {
      if (layout.isExtraMenu)
        nbItems = 5;

      ///////////////////////////////////////////////////////////////////////////////////////////////
      // rollover effects
      ///////////////////////////////////////////////////////////////////////////////////////////////

      var i;
      this.slideToExtraMenu = 6*this.lineHeight + this.footerHeight + this.headerHeight;

      if (dy<-this.lineHeight)
        i = -1;
      else
        if (dy < 0)
          i = 0;
        else
          i = Math.floor( dy / this.lineHeight ) + 1;

      var bottomMenu = false;
      if (i > nbItems-1) {
        i = nbItems - 1;
        bottomMenu = true;
      }

      if (i>=0 && i<nbItems) { // with extra menu, 7 nodes are created but only 5 are visible. So be carefull with indexes
        var cur = i;
        if (layout.isExtraMenu && (cur>2 && cur<5) )
          cur = cur+3;

        if (layout.actions[cur].type == 1)
          layout.aNode.childNodes[cur].firstChild.setAttribute("active", "true");
        else {
          layout.aNode.childNodes[cur].style.backgroundImage = "url('"+this.skinPath+"lineSelection.png')";
          layout.aNode.childNodes[cur].firstChild.setAttribute("active", "true");
          this.rolloverExternalIcons(layout.actions[cur].src, layout.aNode.childNodes[cur].firstChild, true);
        }

        var top = i-1;
        if (top>=0) {
          if (layout.isExtraMenu && (top>2 && top<5) )
            top = top+3;
          layout.aNode.childNodes[top].style.backgroundImage = 'none';
          layout.aNode.childNodes[top].firstChild.setAttribute("active", "false");
          this.rolloverExternalIcons(layout.actions[top].src, layout.aNode.childNodes[top].firstChild, false);
        }
        var bottom = i+1;
        if (bottom < nbItems) {
          if (layout.isExtraMenu && (bottom>2 && bottom<5) )
            bottom = bottom+3;
          layout.aNode.childNodes[bottom].style.backgroundImage = 'none';
          layout.aNode.childNodes[bottom].firstChild.setAttribute("active", "false");
          this.rolloverExternalIcons(layout.actions[bottom].src, layout.aNode.childNodes[bottom].firstChild, false);
        }
      }

      this.sector = i;
      if (layout.isExtraMenu && i> 2)
        this.sector += 3;

      if (dy < - 3*this.lineHeight || dy > nbItems*this.lineHeight || dx> (layout.width + this.iconSize) || dx< -this.iconSize) {
        if (this.menuState != 2)
          this.close();
        else {
          this.menuState = 3; // this trick will trigger the close function next move
          this.sector = -1;
        }
      }
      else
        if (layout.hasExtraMenuAction && dy <-this.lineHeight) {
          this.showExtraMenu();
        }
        else
          if (bottomMenu && layout.isExtraMenu) { // hide extra menu
            var baseLayout = this.menuSet[this.baseMenu];
            baseLayout.aNode.childNodes[this.extraMenuAction].setAttribute("extraMenuShowing","false"); // reset rollover of extra menu action icon in main menu

            this.hide(layout);

            this.altMenuSign.style.top = -10-this.lineHeight-this.headerHeight + this.slideToExtraMenu +"px";
            this.altMenuSign.style.visibility = "visible";
            this.updateAltMenuSign(this.baseMenu, this.mainAlternative1==true && this.mainAlternative2==true);

            this.pageY = this.pageY + this.slideToExtraMenu;
            this.clientY = this.clientY + this.slideToExtraMenu;
            this.screenY = this.screenY + this.slideToExtraMenu;

            this.curLayoutName = this.baseMenu;
          }

          return;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    // rollover effects
    ///////////////////////////////////////////////////////////////////////////////////////////////

    if (this.sector != sector) { // moved to new sector
      this.clearRollover(layout, false);

      if (sector >= 0) { // sector targetted exists: highlighting icons and labels
        layout.aNode.childNodes[sector].setAttribute("active", "true");
        this.rolloverExternalIcons(layout.actions[sector].src, layout.aNode.childNodes[sector], true);
        if (layout.lNode != null)
          layout.lNode.childNodes[sector].style.fontWeight = "bold";
      }
    }

    this.sector = sector;

    ///////////////////////////////////////////////////////////////////////////////////////////////
    // switching to/from extra menu
    ///////////////////////////////////////////////////////////////////////////////////////////////

    if (radius > 3*layout.outerR) {
      if (this.menuState != 2)
        this.close();
    }
    else
      if (radius > layout.outerR) {
        if (layout.actions[sector].type == 1) {	// show extra menu
          this.showExtraMenu();
        }
      }
      else
        if (radius>layout.innerR && sector>2 && sector <6 && layout.isExtraMenu && movDir>0) { // hide extra menu
          var baseLayout = this.menuSet[this.baseMenu];
          baseLayout.aNode.childNodes[this.extraMenuAction].setAttribute("extraMenuShowing","false"); // reset rollover of extra menu action icon in main menu

          this.hide(layout);

          this.altMenuSign.style.top = -10-(layout.isLarge ? this.iconSize/2 :0)+"px";
          this.altMenuSign.style.visibility = "visible";
          this.updateAltMenuSign(this.baseMenu, this.mainAlternative1==true && this.mainAlternative2==true);

          this.pageY = this.pageY+baseLayout.outerR*1.2;
          this.clientY = this.clientY+baseLayout.outerR*1.2;
          this.screenY = this.screenY+baseLayout.outerR*1.2;

          this.curLayoutName = this.baseMenu;
          this.resetTooltipsTimeout();
        }
  },

  showExtraMenu : function() {
    var layout = this.menuSet[this.curLayoutName];
    layout.aNode.childNodes[this.extraMenuAction].setAttribute("extraMenuShowing","true");

    if (this.dropDownMenu) {
      this.pageY = this.pageY - this.slideToExtraMenu;
      this.clientY = this.clientY - this.slideToExtraMenu;
      this.screenY = this.screenY - this.slideToExtraMenu;

      this.baseMenu = this.curLayoutName; // base menu from which extra menu is called
      this.show("extra");
    }
    else {
      this.pageY = this.pageY-layout.outerR*1.2;
      this.clientY = this.clientY-layout.outerR*1.2;
      this.screenY = this.screenY-layout.outerR*1.2;

      this.baseMenu = this.curLayoutName; // base menu from which extra menu is called
      this.show("extra");

      // hide main menu tooltips after extra menu showed
      var baseLayout = this.menuSet[this.baseMenu];
      if (baseLayout.lNode != null)
        baseLayout.lNode.style.display = "none";
    }
  },

  hide : function(layout) { // makes menu invisible
    if (layout.aNode != null)
      layout.aNode.style.display = "none";
    if (layout.lNode != null)
      layout.lNode.style.display = "none";

    this.linkSign.style.visibility = "hidden";
    this.inputBox.style.visibility = "hidden";
    this.inputBoxSignForHighlight.style.visibility = "hidden";
    this.inputBoxSignForSearchWeb.style.visibility = "hidden";
    this.altMenuSign.style.visibility = "hidden";
    this.contextMenuSign.style.visibility = "hidden";
    this.contextAltMenuSign.style.visibility = "hidden";

    this.clearRollover(layout, true);

    if (this.showTooltips)
      clearTimeout(this.tooltipsTrigger);
  },

  clearRollover : function(layout, hidding) { // clear rollover effect
    if (this.sector >= 0) {
      if (this.dropDownMenu) {
        layout.aNode.childNodes[this.sector].style.backgroundImage = 'none';
        layout.aNode.childNodes[this.sector].firstChild.setAttribute("active", "false");
        layout.aNode.childNodes[this.sector].firstChild.style.backgroundPosition = (!this.smallIcons?"8px 0px":"0px 0px");
      }
      else {
        layout.aNode.childNodes[this.sector].setAttribute("active", "false");
        this.rolloverExternalIcons(layout.actions[this.sector].src, layout.aNode.childNodes[this.sector], false);
        if (layout.lNode != null)
          layout.lNode.childNodes[this.sector].style.fontWeight = "normal";
      }
    }

    // reset rollover for extra menu in base menu if needed
    var baseLayout = this.menuSet[this.baseMenu];
    if (baseLayout != null && baseLayout.hasExtraMenuAction && hidding) {
      baseLayout.aNode.childNodes[this.extraMenuAction].setAttribute("extraMenuShowing","false");
      baseLayout.aNode.childNodes[this.extraMenuAction].setAttribute("active","false");
    }
  },

  rolloverExternalIcons : function(src, node, active) { // this is for runProgramFile and loadURLScript actions icons which can be customized or imported from favicons or program's icons
    try {
      if (active) {
        if (this[src][4] == "true")
          node.style.backgroundPosition = (!this.smallIcons?"9px 1px":"1px 1px");
        else
          if (this[src][5] == "true")
            node.style.backgroundPosition = (!this.smallIcons?"1px 1px":"1px 1px");
      }
      else {
        if (this[src][4] == "true")
          node.style.backgroundPosition = (!this.smallIcons?"8px 0px":"0px 0px");
        else
          if (this[src][5] == "true")
            node.style.backgroundPosition=(!this.smallIcons?"0px 0px":"0px 0px");
      }
    }
    catch (ex) {}
  },

  runAction : function() {
    var layout = this.menuSet[this.curLayoutName];

    if (this.sector >= 0) {

      ///////////////////////////////////////////////////////////////////////////////////////////////
      // updatel stats
      ///////////////////////////////////////////////////////////////////////////////////////////////

      index = layout.name.match (/\d+/);
      if (index == null)
        index = 0;

      if (layout.name.search("extra") == -1) { // main
        var statsMainArray = (new Function ("return " + eG_prefsObs.prefs.getCharPref("profile.statsMain") ))(); // (new Function ("return " + data ))() replacing eval on data

        var sector8To10 = this.sector;
        if (!layout.isLarge) {
          if (this.sector > 2)
            sector8To10++;
          if (this.sector >= 6)
            sector8To10++;
        }
        statsMainArray[index*10+sector8To10]++;
        eG_prefsObs.prefs.setCharPref("profile.statsMain", statsMainArray.toSource());
      }
      else { // extra
        var statsExtraArray = (new Function ("return " + eG_prefsObs.prefs.getCharPref("profile.statsExtra") ))(); // (new Function ("return " + data ))() replacing eval on data
        statsExtraArray[index*8+this.sector]++;
        eG_prefsObs.prefs.setCharPref("profile.statsExtra", statsExtraArray.toSource());
      }

      var statsActionsArray = (new Function ("return " + eG_prefsObs.prefs.getCharPref("profile.statsActions") ))(); // (new Function ("return " + data ))() replacing eval on data
      statsActionsArray[layout.actions[this.sector].id]++;
      eG_prefsObs.prefs.setCharPref("profile.statsActions", statsActionsArray.toSource());

      try {
        (new Function ("return " + layout.actions[this.sector].func ))(); // (new Function ("return " + data ))() replacing eval on data
      }
      catch(ex) {
        alert("Exception: "+ ex.toString());
      }

      if (this.popup != null && this.popup.state == 'showing')
        return; // return to avoid closing menu too early when eG_popup is visible
    }

    if (this.sector == -1 || layout.actions[this.sector].type != 1)
      this.close(); // close menu if no extra menu is called from action or no action
  },

  update : function() { // update menu content (gray actions, display special signs etc.)
    var layout = this.menuSet[this.curLayoutName];

    ///////////////////////////////////////////////////////////////////////////////////////////////
    // showing center icon
    ///////////////////////////////////////////////////////////////////////////////////////////////

    if (eGc.link != null && this.handleLinks && this.menuState!=2 && this.menuState!=3 && this.curLayoutName =="main") { //if a link is pointed and mouse not dragged
      this.linkSign.style.visibility = "visible";
      this.linkTrigger = setTimeout(function() { eGm.linkSign.style.visibility = "hidden"; }, this.linksDelay);
    }
    else
      this.linkSign.style.visibility = "hidden";

    ///////////////////////////////////////////////////////////////////////////////////////////////
    // graying actions
    ///////////////////////////////////////////////////////////////////////////////////////////////

    var actionNode = null;
    var actionName = "back";
    if (layout.update[actionName] != -1) {
      actionNode = !this.dropDownMenu ? layout.aNode.childNodes[layout.update[actionName] ]: layout.aNode.childNodes[layout.update[actionName] ].firstChild;
      if (getWebNavigation().canGoBack)
        actionNode.setAttribute("grayed", "false");
      else
        actionNode.setAttribute("grayed", "true");
    }

    actionName = "backSite";
    if (layout.update[actionName] != -1) {
      actionNode = !this.dropDownMenu ? layout.aNode.childNodes[layout.update[actionName] ]: layout.aNode.childNodes[layout.update[actionName] ].firstChild;
      if (getWebNavigation().canGoBack)
        actionNode.setAttribute("grayed", "false");
      else
        actionNode.setAttribute("grayed", "true");
    }

    actionName = "firstPage";
    if (layout.update[actionName] != -1) {
      actionNode = !this.dropDownMenu ? layout.aNode.childNodes[layout.update[actionName] ]: layout.aNode.childNodes[layout.update[actionName] ].firstChild;
      if (getWebNavigation().canGoBack)
        actionNode.setAttribute("grayed", "false");
      else
        actionNode.setAttribute("grayed", "true");
    }

    actionName = "forward";
    if (layout.update[actionName] != -1) {
      actionNode = !this.dropDownMenu ? layout.aNode.childNodes[layout.update[actionName] ]: layout.aNode.childNodes[layout.update[actionName] ].firstChild;
      if (getWebNavigation().canGoForward)
        actionNode.setAttribute("grayed", "false");
      else
        actionNode.setAttribute("grayed", "true");
    }

    actionName = "forwardSite";
    if (layout.update[actionName] != -1) {
      actionNode = !this.dropDownMenu ? layout.aNode.childNodes[layout.update[actionName] ]: layout.aNode.childNodes[layout.update[actionName] ].firstChild;
      if (getWebNavigation().canGoForward)
        actionNode.setAttribute("grayed", "false");
      else
        actionNode.setAttribute("grayed", "true");
    }

    actionName = "lastPage";
    if (layout.update[actionName] != -1) {
      actionNode = !this.dropDownMenu ? layout.aNode.childNodes[layout.update[actionName] ]: layout.aNode.childNodes[layout.update[actionName] ].firstChild;
      if (getWebNavigation().canGoForward)
        actionNode.setAttribute("grayed", "false");
      else
        actionNode.setAttribute("grayed", "true");
    }

    actionName = "nextTab";
    if (layout.update[actionName] != -1) {
      actionNode = !this.dropDownMenu ? layout.aNode.childNodes[layout.update[actionName] ]: layout.aNode.childNodes[layout.update[actionName] ].firstChild;
      if (getBrowser().mTabContainer.childNodes.length > 1)
        actionNode.setAttribute("grayed", "false");
      else
        actionNode.setAttribute("grayed", "true");
    }

    actionName = "prevTab";
    if (layout.update[actionName] != -1) {
      actionNode = !this.dropDownMenu ? layout.aNode.childNodes[layout.update[actionName] ]: layout.aNode.childNodes[layout.update[actionName] ].firstChild;
      if (getBrowser().mTabContainer.childNodes.length > 1)
        actionNode.setAttribute("grayed", "false");
      else
        actionNode.setAttribute("grayed", "true");
    }

    actionName = "closeOtherTabs";
    if (layout.update[actionName] != -1) {
      actionNode = !this.dropDownMenu ? layout.aNode.childNodes[layout.update[actionName] ]: layout.aNode.childNodes[layout.update[actionName] ].firstChild;
      if (getBrowser().mTabContainer.childNodes.length > 1)
        actionNode.setAttribute("grayed", "false");
      else
        actionNode.setAttribute("grayed", "true");
    }

    actionName = "undoCloseTab";
    if (layout.update[actionName] != -1) {
      actionNode = !this.dropDownMenu ? layout.aNode.childNodes[layout.update[actionName] ]: layout.aNode.childNodes[layout.update[actionName] ].firstChild;
      if (Cc["@mozilla.org/browser/sessionstore;1"].getService(Ci.nsISessionStore).getClosedTabCount(window) > 0)
        actionNode.setAttribute("grayed", "false");
      else
        actionNode.setAttribute("grayed", "true");
    }

    actionName = "closeOtherWindows";
    if (layout.update[actionName] != -1) {
      actionNode = !this.dropDownMenu ? layout.aNode.childNodes[layout.update[actionName] ]: layout.aNode.childNodes[layout.update[actionName] ].firstChild;

      var windowManager = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService();
      var windowManagerInterface = windowManager.QueryInterface( Components.interfaces.nsIWindowMediator);
      var winEnum = windowManagerInterface.getZOrderDOMWindowEnumerator("navigator:browser", false);
      if (winEnum.hasMoreElements())
        winEnum.getNext(); //first window

      if (winEnum.hasMoreElements())
        actionNode.setAttribute("grayed", "false");
      else
        actionNode.setAttribute("grayed", "true");
    }

    actionName = "reload";
    if (layout.update[actionName] != -1) {
      actionNode = !this.dropDownMenu ? layout.aNode.childNodes[layout.update[actionName] ]: layout.aNode.childNodes[layout.update[actionName] ].firstChild;

      var stop_bcaster = document.getElementById("Browser:Stop");
      eGc.loading = !stop_bcaster.hasAttribute("disabled");

      var actionClass = actionNode.getAttribute("class");
      if (!eGc.loading)
        actionNode.setAttribute("class", actionClass.replace("stop","reload"));
      else
        actionNode.setAttribute("class", actionClass.replace("reload","stop"));
    }

    actionName = "up";
    if (layout.update[actionName] != -1) {
      actionNode = !this.dropDownMenu ? layout.aNode.childNodes[layout.update[actionName] ]: layout.aNode.childNodes[layout.update[actionName] ].firstChild;
      if (eG_canGoUp())
        actionNode.setAttribute("grayed", "false");
      else
        actionNode.setAttribute("grayed", "true");
    }

    actionName = "root";
    if (layout.update[actionName] != -1) {
      actionNode = !this.dropDownMenu ? layout.aNode.childNodes[layout.update[actionName] ]: layout.aNode.childNodes[layout.update[actionName] ].firstChild;
      if (eG_canGoUp())
        actionNode.setAttribute("grayed", "false");
      else
        actionNode.setAttribute("grayed", "true");
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    // update context title and signs
    ///////////////////////////////////////////////////////////////////////////////////////////////

    if (layout.name.search("context") != -1) {
      this.contextMenuSign.childNodes[2].wrappedJSObject.firstChild.data=eGc.localizing.getString(layout.name);
      this.contextAltMenuSign.wrappedJSObject.style.visibility=(eGc.contextType.split("/").length>2 ? "visible": "hidden"); // alternative context exists or not
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    // show alternative menu sign
    ///////////////////////////////////////////////////////////////////////////////////////////////

    this.altMenuSign.style.visibility = "visible";
    this.updateAltMenuSign(layout.name,(this.mainAlternative1==true && this.mainAlternative2==true && layout.name.search("main") !=-1) || (this.extraAlternative1==true && this.extraAlternative2==true && layout.name.search("extra") !=-1) );
  },

  updateAltMenuSign : function(layoutName, alternative1and2Enabled) {
    var altLayoutNumber = parseInt(layoutName.replace(/^\D*/,'0'));

    if (alternative1and2Enabled) {
      switch (altLayoutNumber) {
        case 0: this.altMenuSign.src = this.skinPath + "altMenuSign0.png"; break;
        case 1: this.altMenuSign.src = this.skinPath + "altMenuSign1.png"; break;
        case 2: this.altMenuSign.src = this.skinPath + "altMenuSign2.png"; break;
      }
    }
    else {
      switch (altLayoutNumber) {
        case 0: this.altMenuSign.src = this.skinPath + "altMenuSign0.png"; break;
        case 1: this.altMenuSign.src = this.skinPath + "altMenuSign1.png"; break;
        case 2: this.altMenuSign.src = this.skinPath + "altMenuSign1.png"; break;
      }
    }
  },

  switchLayout : function() { // this is not about switching to/from extra menu
    var layout = this.menuSet[this.curLayoutName];
    var nextLayoutName = "";

    if (this.curLayoutName.search("context") == -1) { // switch to alternative layouts
      this.hide(layout);

      if (!layout.isExtraMenu) {
        nextLayoutName = "main";
        if (this.curLayoutName == "main" && this.mainAlternative1)
          nextLayoutName = "mainAlt1";
        else
          if (this.curLayoutName == "mainAlt1" && this.mainAlternative2 || this.curLayoutName == "main" && !this.mainAlternative1 && this.mainAlternative2)
            nextLayoutName = "mainAlt2";
      }
      else {
        nextLayoutName = "extra";
        if (this.curLayoutName=="extra" && this.extraAlternative1)
          nextLayoutName = "extraAlt1";
        else
          if (this.curLayoutName == "extraAlt1" && this.extraAlternative2 || this.curLayoutName == "extra" && !this.extraAlternative1 && this.extraAlternative2)
            nextLayoutName = "extraAlt2";
      }

      this.show(nextLayoutName);
    }
    else { // switch to other contextual layouts
      if (eGc.contextType.split("/").length>2) {
        this.hide(layout);
        if (eGc.contextType == "link/image/")
          nextLayoutName = (this.curLayoutName=="contextLink" ? "contextImage" : "contextLink" );
        else
          nextLayoutName = (this.curLayoutName=="contextSelection" ? "contextTextbox" : "contextSelection" );

        this.show(nextLayoutName);
        this.contextMenuSign.style.visibility = "visible";
      }
    }
  },

  close : function() {
    var layout = this.menuSet[this.curLayoutName];
    var baseLayout = this.menuSet[this.baseMenu];

    this.hide(layout);
    if (layout.isExtraMenu)
      this.hide(baseLayout); // hide base menu too if closing is done from extra menu
    if (this.popup != null)
      this.popup.hidePopup();

    this.reset();

    // update statsUse preference
    var statsUse = eG_prefsObs.prefs.getIntPref("profile.statsUse");
    statsUse++;
    eG_prefsObs.prefs.setIntPref("profile.statsUse", statsUse);

    // re-enable counting clicks inside window
    window.addEventListener("mousedown", eG_countClicks, false);
  },

  reset : function() {
    this.menuState = 0; // menu is not showing
    this.sector = -1;
    this.baseMenu = "";
    this.showingTooltips = false;
    this.inputBox.value = ""; // removes the value typed in textarea if any
    this.typingText = false;
    //this.inputBox.blur(); // removing the cursor

    window.removeEventListener("mousemove", eG_handleMousemove, true);

    eGc.image = null; // removes the pointed image if any
    eGc.link = null; // removes the pointed link if any
    eGc.selection = null; // removes the selected text if any
    eGc.selectionNode = null; // removes the selected node if any

    // enabling selection when left mouse button is used because selection is turned off in that case
    if (this.showButton == 0) { // left mouse button
      selCon = getBrowser().docShell.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsISelectionDisplay).QueryInterface(Components.interfaces.nsISelectionController);
      selCon.setDisplaySelection(2); // SELECTION_ON
    }

    if (this.showButton == 2 && !eGc.allowContextBrowserOption) { // set "Disable or replace context menus" Browser option back to false if was false before showing pie menu
      eGc.allowContextBrowserOptionTimerId = setTimeout(resetInitialContextBrowserOption, 1000); // setting the timer to make sure the reset function is called after completion of mouseup event
    }
  },

  resetTooltipsTimeout : function() { // setting and resetting tooltips timeout
    if (this.showTooltips) {
      clearTimeout(this.tooltipsTrigger);
      if (this.showingTooltips || this.tooltipsDelayOmit)
        this.showMenuTooltips();
      else
        this.tooltipsTrigger = setTimeout(eGm.showMenuTooltips, this.tooltipsDelay);
    }
  },

  showInputBox : function(enterURL, showInputBoxSignForHighlight) { // showInputBoxSignForHighlight is to display options sign for highlight or SearchWeb actions

    // clear tooltips timeout
    if (this.showTooltips && !this.showingTooltips)
      clearTimeout(this.tooltipsTrigger);

    var layout = this.menuSet[this.curLayoutName];
    var vertBorderWidth = parseInt(this.inputBox.style.borderTopWidth) + parseInt(this.inputBox.style.borderBottomWidth);
    var txtboxHeight = gBrowser.selectedBrowser.markupDocumentViewer.textZoom/100*parseInt(getComputedStyle(document.getElementById('main-window'),'').getPropertyValue('font-size'))+ vertBorderWidth + 6; // 6 is for padding/margin

    // unhide inputBox
    this.typingText = true;
    this.inputBox.style.visibility = "visible";
    this.inputBox.style.cursor = "url('chrome://easygestures/skin/empty.png'), default";
    this.inputBox.style.MozBoxSizing = "border-box";

    if (enterURL) { // URL input
      // positioning and sizing the inputBox
      this.inputBox.style.width = this.locationBarWitdh+"px";

      if (!this.dropDownMenu) {
        this.inputBox.style.left = Math.round(layout.outerR- this.locationBarWitdh/2)+"px";
        this.inputBox.style.top = Math.round(layout.outerR-txtboxHeight/2+1)+"px";
      }
      else {
        this.inputBox.style.left = -Math.round((this.locationBarWitdh)/2 - layout.width/2)+"px";
        this.inputBox.style.top = -txtboxHeight+"px";
      }
      // put url or selection as a default value
      if (eGc.selection != "")
        this.inputBox.value = eGc.selection;
      else
        this.inputBox.value = window._content.location.href;
    }
    else { // text input
      // positioning and sizing the inputBox
      if (!this.dropDownMenu) {
        this.inputBox.style.width = this.inputBoxWidth+"px";

        this.inputBox.style.left = parseInt(layout.aNode.childNodes[this.sector].style.left) -  this.inputBoxWidth/2 + this.iconSize/2+ "px";
        this.inputBox.style.top = parseInt(layout.aNode.childNodes[this.sector].style.top) - (layout.isExtraMenu?layout.outerR*1.2:0)+ "px";

        this.inputBox.style.paddingLeft = "4px";
        this.inputBox.style.paddingRight = "18px";

        if (showInputBoxSignForHighlight) {
          this.inputBoxSignForHighlight.style.left = parseInt(this.inputBox.style.left) + this.inputBoxWidth - 26 +"px";
          this.inputBoxSignForHighlight.style.top = parseInt(this.inputBox.style.top) + parseInt(this.inputBox.style.borderTopWidth)+"px";
          this.inputBoxSignForHighlight.style.visibility = "visible";
        }
        else {
          this.inputBoxSignForSearchWeb.style.left = parseInt(this.inputBox.style.left) + this.inputBoxWidth - 18 +"px";
          this.inputBoxSignForSearchWeb.style.top = parseInt(this.inputBox.style.top) + parseInt(this.inputBox.style.borderTopWidth)+"px";
          this.inputBoxSignForSearchWeb.style.visibility = "visible";
        }
      }
      else {
        var txtboxWidth = layout.width;
        this.inputBox.style.width = txtboxWidth + "px";

        var sector = this.sector;
        if (layout.isExtraMenu && sector > 5)
          sector -= 3;
        this.inputBox.style.left = parseInt(layout.aNode.childNodes[sector].style.left) - txtboxWidth/2 + this.iconSize/2 + "px";
        this.inputBox.style.top = parseInt(layout.aNode.childNodes[sector].style.top) + (this.lineHeight - txtboxHeight)/2;

        this.inputBox.style.paddingLeft = "4px";
        this.inputBox.style.paddingRight = "18px";

        if (showInputBoxSignForHighlight) {
          this.inputBoxSignForHighlight.style.left = parseInt(this.inputBox.style.left) + txtboxWidth - 26 + "px";
          this.inputBoxSignForHighlight.style.top = parseInt(this.inputBox.style.top) + parseInt(this.inputBox.style.borderTopWidth) + "px";
          this.inputBoxSignForHighlight.style.visibility = "visible";
        }
        else {
          this.inputBoxSignForSearchWeb.style.left = parseInt(this.inputBox.style.left) + txtboxWidth - 18 + "px";
          this.inputBoxSignForSearchWeb.style.top = parseInt(this.inputBox.style.top) + parseInt(this.inputBox.style.borderTopWidth) + "px";
          this.inputBoxSignForSearchWeb.style.visibility = "visible";
        }
      }
      // put last typed word as a default value
      this.inputBox.value = eGc.lastTypedWord;
    }
    this.inputBox.focus();
    this.inputBox.select();
  },

  showMenuTooltips : function() { // displaying tooltips
    var layout = this.menuSet[this.curLayoutName];

    if (this.dropDownMenu) {
    }
    else {
      // create resources if necessary
      if (layout.lNode == null || eGc.frame_doc.getElementById("eG_labels_"+this.curLayoutName) == null)
        this.createLabelsNodes(this.curLayoutName); // checking if labels have already been displayed in the current document
      else
        if (layout.lNode != eGc.frame_doc.getElementById("eG_labels_"+this.curLayoutName))
          layout.lNode = eGc.frame_doc.getElementById("eG_labels_"+this.curLayoutName);

      layout.lNode.style.left = this.clientX + layout.lNodeXOff + "px";
      layout.lNode.style.top = this.clientY + layout.lNodeYOff + "px";
      this.compensateTextZoom(layout.lNode);
      layout.lNode.style.display = "block";
    }
    this.showingTooltips = true;
  },

  showPopupForSearchWeb : function(closeMenuAndRunSearchOnHiding) {
    while (this.popup.hasChildNodes()) {
      // remove all from menupopup
      this.popup.removeChild(this.popup.firstChild);
    }
    if (closeMenuAndRunSearchOnHiding)
      this.popup.addEventListener("popuphiding", eG_popup, true);

    var tld = Components.classes["@mozilla.org/network/effective-tld-service;1"].getService(Components.interfaces.nsIEffectiveTLDService);
    var faviconService = Components.classes["@mozilla.org/browser/favicon-service;1"].getService(Components.interfaces.nsIFaviconService);
    var ios = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
    var searchEnginesCount = 0;
    var lastEnabledQuery;

    for (var i = 1; i <= 6; i++) {
      var itemNode = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "menuitem");
      itemNode.setAttribute("class", "menuitem-iconic");
      if (i == 1)
        itemNode.setAttribute("default", true);

      // finding favicons, setting items
      var faviconPath = null;

      chksearch = eGm["search"+i];
      query = eGm["searchQuery"+i];
      if (query != "" && chksearch) {
        searchEnginesCount++;
        lastEnabledQuery = i;
        itemNode.setAttribute("label", " " + tld.getBaseDomainFromHost(ios.newURI(query, null, null).host));
        if (closeMenuAndRunSearchOnHiding)
          itemNode.setAttribute("oncommand", "eGm.inputBoxSignForSearchWeb.setAttribute('currentEngine'," +i+ " );eGm.runAction();");
        else
          itemNode.setAttribute("oncommand", "eGm.inputBoxSignForSearchWeb.src = this.getAttribute('src');eGm.inputBoxSignForSearchWeb.setAttribute('currentEngine'," +i+ " );");
        try {
          faviconPath = faviconService.getFaviconForPage(ios.newURI(ios.newURI(query, null, null).prePath,null,null)).spec;
        }
        catch (e) {
          faviconPath = ios.newURI(query, null, null).prePath + "/favicon.ico";
        }
        itemNode.setAttribute("src", faviconPath);
        itemNode.setAttribute("crop", "end");
        this.popup.appendChild(itemNode);
      }
    }

    // if there are more than one search engine, add a 'Search all Engines' choice
    if (searchEnginesCount > 1) {
      // menuseparator
      var itemNode = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "menuseparator");
      this.popup.appendChild(itemNode);

      var itemNode = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "menuitem");
      itemNode.setAttribute("class", "menuitem-iconic");
      itemNode.setAttribute("label", " " + 'Search All');
      if (closeMenuAndRunSearchOnHiding)
        itemNode.setAttribute("oncommand", "eGm.inputBoxSignForSearchWeb.setAttribute('currentEngine',0);eGm.runAction();");
      else
        itemNode.setAttribute("oncommand", "eGm.inputBoxSignForSearchWeb.src = this.getAttribute('src');eGm.inputBoxSignForSearchWeb.setAttribute('currentEngine',0);");
      itemNode.setAttribute("src", this.skinPath +"searchWebSign.png");
      this.popup.appendChild(itemNode);
    }
    else { // don't show popup if only one search engine found
      this.inputBoxSignForSearchWeb.setAttribute('currentEngine', lastEnabledQuery);
      if (closeMenuAndRunSearchOnHiding) {
        this.inputBoxSignForSearchWeb.setAttribute('noPopup', ''); // avoid infinite loop in searchWeb function
        this.runAction();
        this.inputBoxSignForSearchWeb.removeAttribute('noPopup', '');
      }
      return; // return to avoid showing popup later
    }

    this.popup.openPopupAtScreen(eGc.screenXUp -32, eGc.screenYUp -8, false);
    if (eGm.showTooltips)
      clearTimeout(eGm.tooltipsTrigger);
  },

  shieldCss : function(node) {
    node.style.display = "block";
    node.style.margin = "0px";
    node.style.padding = "0px";
    node.style.border = "none 0px";
    node.style.cssFloat = "none";

    try {
      node.style.color = "black";
      node.style.backgroundImage = "none";
      node.style.backgroundColor = "transparent";
      node.style.minHeight = 0;
      node.style.minWidth = 0;
    }
    catch (ex) {}

    node.style.lineHeight = "0.8";
  },

  compensateTextZoom : function(lNode) { // adjust labels font size to compensate for zoom changes
    var currentZoom = gBrowser.selectedBrowser.markupDocumentViewer.textZoom;
    //lNode.style.fontSize = Math.round(10*100/currentZoom)+"pt";

    if (!this.smallIcons)
      switch (currentZoom) {
        case 450:  lNode.style.fontSize = "2pt"; break;
        case 300:  lNode.style.fontSize = "3pt"; break;
        case 200:  lNode.style.fontSize = "5pt"; break;
        case 150:  lNode.style.fontSize = "6pt"; break;
        case 120:  lNode.style.fontSize = "8pt"; break;
        case 100:  lNode.style.fontSize = "10pt"; break;
        case 90:   lNode.style.fontSize = "12pt"; break;
        case 75:   lNode.style.fontSize = "13pt"; break;
        case 50:   lNode.style.fontSize = "19pt"; break;
        case 33:   lNode.style.fontSize = "28pt"; break;
        case 22:   lNode.style.fontSize = "40pt"; break;
        default:   lNode.style.fontSize = "10pt"; break;
      }
    else
      switch (currentZoom) {
        case 450:  lNode.style.fontSize = "2pt"; break;
        case 300:  lNode.style.fontSize = "3pt"; break;
        case 200:  lNode.style.fontSize = "4pt"; break;
        case 150:  lNode.style.fontSize = "5pt"; break;
        case 120:  lNode.style.fontSize = "7pt"; break;
        case 100:  lNode.style.fontSize = "8pt"; break;
        case 90:   lNode.style.fontSize = "10pt"; break;
        case 75:   lNode.style.fontSize = "12pt"; break;
        case 50:   lNode.style.fontSize = "13pt"; break;
        case 33:   lNode.style.fontSize = "19pt"; break;
        case 22:   lNode.style.fontSize = "28pt"; break;
        default:   lNode.style.fontSize = "8pt"; break;
      }
  }
}
