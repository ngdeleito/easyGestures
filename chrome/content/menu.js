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

function eG_menuItem (id, type, name) {
  this.id = id;     // label of item
  this.type = type; // -1 = empty, 0 = action, 1 = extra
  this.src = name;  // name of default icon source without suffix or extension
}

var eG_menuItems = [
  new eG_menuItem(0,   -1, "empty"),
  new eG_menuItem(1,    1, "more"),

  new eG_menuItem(2,    0, "firstPage"),
  new eG_menuItem(3,    0, "lastPage"),
  new eG_menuItem(4,    0, "backSite"),
  new eG_menuItem(5,    0, "forwardSite"),
  new eG_menuItem(6,    0, "back"),
  new eG_menuItem(7,    0, "forward"),
  new eG_menuItem(8,    0, "reload"),
  new eG_menuItem(9,    0, "up"),
  new eG_menuItem(10,   0, "root"),
  new eG_menuItem(11,   0, "pageTop"),
  new eG_menuItem(12,   0, "pageBottom"),
  new eG_menuItem(13,   0, "autoscrolling"),

  new eG_menuItem(14,   0, "newTab"),
  new eG_menuItem(15,   0, "duplicateTab"),
  new eG_menuItem(16,   0, "prevTab"),
  new eG_menuItem(17,   0, "nextTab"),
  new eG_menuItem(18,   0, "closeTab"),
  new eG_menuItem(19,   0, "closeOtherTabs"),
  new eG_menuItem(20,   0, "undoCloseTab"),

  new eG_menuItem(21,   0, "newWindow"),
  new eG_menuItem(22,   0, "duplicateWindow"),
  new eG_menuItem(23,   0, "closeOtherWindows"),
  new eG_menuItem(24,   0, "quit"),
  new eG_menuItem(25,   0, "minimizeWindow"),
  new eG_menuItem(26,   0, "fullscreen"),

  new eG_menuItem(27,   0, "openLink"),
  new eG_menuItem(28,   0, "openLinkNewWindow"),
  new eG_menuItem(29,   0, "copyLink"),
  new eG_menuItem(30,  -1, "empty"),
  new eG_menuItem(31,   0, "copyImageLocation"),
  new eG_menuItem(32,   0, "saveLinkAs"),
  new eG_menuItem(33,   0, "saveImageAs"),
  new eG_menuItem(34,   0, "savePageAs"),
  new eG_menuItem(35,   0, "hideImages"),
  new eG_menuItem(36,   0, "copyImage"),

  new eG_menuItem(37,   0, "homepage"),
  new eG_menuItem(38,   0, "dailyReadings"),
  new eG_menuItem(39,   0, "searchWeb"),
  new eG_menuItem(40,   0, "restart"),
  new eG_menuItem(41,  -1, "empty"),
  new eG_menuItem(42,  -1, "empty"),
  new eG_menuItem(43,  -1, "empty"),
  new eG_menuItem(44,  -1, "empty"),
  new eG_menuItem(45,  -1, "empty"),
  new eG_menuItem(46,  -1, "empty"),
  new eG_menuItem(47,  -1, "empty"),
  new eG_menuItem(48,  -1, "empty"),
  new eG_menuItem(49,  -1, "empty"),
  new eG_menuItem(50,  -1, "empty"),

  new eG_menuItem(51,   0, "loadURLScript1"),
  new eG_menuItem(52,   0, "loadURLScript2"),
  new eG_menuItem(53,   0, "loadURLScript3"),
  new eG_menuItem(54,   0, "loadURLScript4"),
  new eG_menuItem(55,   0, "loadURLScript5"),
  new eG_menuItem(56,   0, "loadURLScript6"),
  new eG_menuItem(57,   0, "loadURLScript7"),
  new eG_menuItem(58,   0, "loadURLScript8"),
  new eG_menuItem(59,   0, "loadURLScript9"),
  new eG_menuItem(60,   0, "loadURLScript10"),
  new eG_menuItem(61,   0, "loadURLScript11"),
  new eG_menuItem(62,   0, "loadURLScript12"),
  new eG_menuItem(63,   0, "loadURLScript13"),
  new eG_menuItem(64,   0, "loadURLScript14"),
  new eG_menuItem(65,   0, "loadURLScript15"),
  new eG_menuItem(66,   0, "loadURLScript16"),
  new eG_menuItem(67,   0, "loadURLScript17"),
  new eG_menuItem(68,   0, "loadURLScript18"),
  new eG_menuItem(69,   0, "loadURLScript19"),
  new eG_menuItem(70,   0, "loadURLScript20"),

  new eG_menuItem(71,   0, "markVisitedLinks"),
  new eG_menuItem(72,   0, "bookmarkThisLink"),
  new eG_menuItem(73,   0, "bookmarkPage"),
  new eG_menuItem(74,   0, "bookmarkOpenTabs"),
  new eG_menuItem(75,   0, "bookmarks"),
  new eG_menuItem(76,   0, "bookmarksToolbar"),
  new eG_menuItem(77,   0, "history"),
  new eG_menuItem(78,   0, "viewPageSource"),
  new eG_menuItem(79,   0, "viewPageInfo"),
  new eG_menuItem(80,   0, "showOnlyThisFrame"),
  new eG_menuItem(81,  -1, "empty"),
  new eG_menuItem(82,   0, "printPage"),
  new eG_menuItem(83,   0, "focusLocationBar"),
  new eG_menuItem(84,   0, "newPrivateWindow"),

  new eG_menuItem(85,   0, "cut"),
  new eG_menuItem(86,   0, "copy"),
  new eG_menuItem(87,   0, "paste"),
  new eG_menuItem(88,   0, "undo"),
  new eG_menuItem(89,   0, "selectAll"),
  new eG_menuItem(90,   0, "toggleFindBar"),
  new eG_menuItem(91,   0, "zoomIn"),
  new eG_menuItem(92,   0, "zoomOut"),
  new eG_menuItem(93,   0, "zoomReset")
];

function eG_menuLayout(menu, name, actionsPrefs) {
  this.name = name; // "main", "mainAlt1", "mainAlt2", "extra".  "extraAlt1",  "extraAlt2", "contextLink", "contextImage",  "contextSelection", "contextTextbox"
  this.isExtraMenu = name.search("extra") != -1;
  this.isLarge = menu.largeMenu && !this.isExtraMenu; // extra menus are never large
  this.actions = [];
  this.labels = [];
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
    undoCloseTab:      -1
  };

  //////////////////////////////////////////////////////////////////////////////
  //  initializing layout's actions & labels arrays
  //////////////////////////////////////////////////////////////////////////////

  for (let i=0; i<actionsPrefs.length; i++) {
    if ( !this.isLarge && (i==3 || i==7) ) {} // don't push actions that are intended for large menus
    else {
      var action = eG_menuItems[actionsPrefs[i]];
      this.actions.push(eG_menuItems[actionsPrefs[i]]);
      var label = "";
      if (action.type != -1) {
        // if the name of the action ends with a number (i.e. loadURLScript),
        // extract this number...
        var number = action.src.match(/\d+$/);
        // ... and remove it from the name
        var actionName = action.src.replace(number, "");
        label = eGc.localizing.getString(actionName);
        
        if (number !== null) {
          if (menu[action.src][0] !== "") {
            // if the action has already a name given by the user, then use it
            label = menu[action.src][0];
          }
          else {
            // otherwise use the standard one
            label += " " + number;
          }
        }
      }
      this.labels.push(this.isExtraMenu && i>2 && i<8 ? "" : label);
    }
  }

  this.hasExtraMenuAction = (this.actions[0].type==1);

  //////////////////////////////////////////////////////////////////////////////
  // initializing update object
  //////////////////////////////////////////////////////////////////////////////

  for (let i = 0; i<this.actions.length; i++) {
    if (this.update[this.actions[i].src] !== undefined && this.update[this.actions[i].src] == -1) {
      this.update[this.actions[i].src] = i;
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////
  //	setting menu and tooltips images
  ///////////////////////////////////////////////////////////////////////////////////////////////

  this.menuImage = menu.skinPath + menu.smallMenuTag + (menu.noIcons ? "basic_":"");
  this.tooltipsImage = menu.skinPath;
  if (!this.isExtraMenu) {
    this.menuImage += menu.largeMenu ? "largeMenu.png": "menu.png";
    this.tooltipsImage += (this.hasExtraMenuAction ? "other_": "") + (menu.largeMenu ? "largeLabels.png":"labels.png");
  }
  else {
    this.menuImage += "extraMenu.png"; // extra menus are never large
    this.tooltipsImage += "extraLabels.png";
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////
  //	setting dimensions and positioning
  ///////////////////////////////////////////////////////////////////////////////////////////////

  var zoom = menu.smallIcons ? 0.625:1;
  var zoomTooltips = menu.smallIcons ? 0.75:1;

  this.outerR = Math.round((this.isLarge ? 70:61)*zoom); // outer radius of pie
  this.innerR = Math.round((this.isLarge ? 36:26)*zoom); // inner radius of pie
  this.actionR = this.innerR; // minimum action radius on pie
  this.width = Math.round((this.isLarge ? 440 : 394) * zoomTooltips);
  this.height = Math.round((this.isLarge ? 180:146)*zoom);
  this.zIndex = ( !this.isExtraMenu) ? eGc.maxzIndex-1:eGc.maxzIndex-2;	// extra menus are displayed below main menu level

  this.aNodeXOff = -this.outerR; // offset of menu image
  this.aNodeYOff = -this.outerR;
  this.lNodeXOff = -this.width/2; // offset of tooltips image
  this.lNodeYOff = -this.height/2;

  // labels positioning
  this.xLabelsPos = this.isLarge ?
                      (menu.smallIcons ?
                        [10, 212, 219, 219, 211, 186, 10, 10, 10, 10]
                      : [10, 290, 300, 300, 285, 230, 10, 10, 10, 10])
                    : (menu.smallIcons ?
                        [10, 190, 195, 190, 167, 10, 10, 10]
                      : [10, 265, 270, 260, 230, 10, 10, 10]);
  this.yLabelsPos = this.isLarge ?
                      (menu.smallIcons ?
                        [ 6, 23, 41,  60,  79,  97,  80,  62, 42, 25]
                      : [10, 40, 70, 100, 130, 162, 130, 100, 70, 40])
                    : (menu.smallIcons ?
                        [ 6, 23, 41,  60,  77, 58, 42, 25]
                      : [10, 40, 70, 100, 125, 95, 68, 40]);
}

// menu Constructor
function eG_menu () {
  var prefs = Services.prefs.getBranch("extensions.easygestures.");

  ///////////////////////////////////////////////////////////////////////////////////////////////
  // loading preferences first
  ///////////////////////////////////////////////////////////////////////////////////////////////

  this.showButton = prefs.getIntPref("activation.showButton"); // mouse button for opening the pie menu
  this.showKey = prefs.getIntPref("activation.showKey"); // key for showing the pie menu with mouse button clicked
  this.showAfterDelay = prefs.getBoolPref("activation.showAfterDelay"); // enabling display pie menu after delay before dragging
  this.showAfterDelayValue = prefs.getIntPref("activation.showAfterDelayValue"); // delay to display pie menu after delay before dragging
  this.showAltButton = prefs.getIntPref("activation.showAltButton"); // mouse button for switching between primary and alternative pie menu
  this.suppressKey = prefs.getIntPref("activation.suppressKey"); // key for suppressing the pie menu
  this.contextKey = prefs.getIntPref("activation.contextKey"); // key for forcing non contextual or contextual pie menu
  this.contextShowAuto = prefs.getBoolPref("activation.contextShowAuto");	// enables context sensitivity

  this.largeMenu = prefs.getBoolPref("behavior.largeMenu"); // use larger pie menu with 10 actions instead of 8
  this.noIcons = prefs.getBoolPref("behavior.noIcons");
  this.smallIcons = prefs.getBoolPref("behavior.smallIcons");
  this.menuOpacity = prefs.getIntPref("behavior.menuOpacity")/100; // because menuopacity is set in % in preferences dialog
  this.showTooltips = prefs.getBoolPref("behavior.showTooltips"); // tooltip showing
  this.tooltipsDelay = prefs.getIntPref("behavior.tooltipsDelay"); // tooltip delay
  this.moveAuto = prefs.getBoolPref("behavior.moveAuto"); // true: menu moves when reaching edge. false: memu moves by pressing <Shift> key
  this.handleLinks = prefs.getBoolPref("behavior.handleLinks"); // handle clicking on links through pie menu button
  this.linksDelay = prefs.getIntPref("behavior.linksDelay"); // max delay to click on a link. If delay is passed, a keyup will just keep menu open
  this.handleLinksAsOpenLink = prefs.getBoolPref("behavior.handleLinksAsOpenLink");
  this.autoscrollingOn = prefs.getBoolPref("behavior.autoscrollingOn");	// autoscrolling enabling
  this.autoscrollingDelay = prefs.getIntPref("behavior.autoscrollingDelay"); // autoscrolling delay

  this.mainAlt1MenuEnabled = prefs.getBoolPref("menus.mainAlt1Enabled");
  this.mainAlt2MenuEnabled = prefs.getBoolPref("menus.mainAlt2Enabled");
  this.numberOfMainMenus = 1 +
    ((this.mainAlt1MenuEnabled || this.mainAlt2MenuEnabled) ? 1 : 0) +
    ((this.mainAlt1MenuEnabled && this.mainAlt2MenuEnabled) ? 1 : 0);
  
  this.extraAlt1MenuEnabled = prefs.getBoolPref("menus.extraAlt1Enabled");
  this.extraAlt2MenuEnabled = prefs.getBoolPref("menus.extraAlt2Enabled");
  this.numberOfExtraMenus = 1 +
    ((this.extraAlt1MenuEnabled || this.extraAlt2MenuEnabled) ? 1 : 0) +
    ((this.extraAlt1MenuEnabled && this.extraAlt2MenuEnabled) ? 1 : 0);
  
  this.contextImageFirst = prefs.getBoolPref("menus.contextImageFirst");
  this.contextTextboxFirst = prefs.getBoolPref("menus.contextTextboxFirst");

  this.loadURLin = prefs.getCharPref("customizations.loadURLin"); // execute 'Load URL' action in current tab = 'curTab' or new tab = 'newTab' or new window = 'newWindow'
  this.loadURLScript1 = prefs.getComplexValue("customizations.loadURLScript1", Components.interfaces.nsISupportsString).data.split("\u2022"); // [0]: name, [1]: text, [2]:isScript, [3]: newIconPath, [4]: favicon, [5]: newIcon // previous separator "•" no longer works
  this.loadURLScript2 = prefs.getComplexValue("customizations.loadURLScript2", Components.interfaces.nsISupportsString).data.split("\u2022");
  this.loadURLScript3 = prefs.getComplexValue("customizations.loadURLScript3", Components.interfaces.nsISupportsString).data.split("\u2022");
  this.loadURLScript4 = prefs.getComplexValue("customizations.loadURLScript4", Components.interfaces.nsISupportsString).data.split("\u2022");
  this.loadURLScript5 = prefs.getComplexValue("customizations.loadURLScript5", Components.interfaces.nsISupportsString).data.split("\u2022");
  this.loadURLScript6 = prefs.getComplexValue("customizations.loadURLScript6", Components.interfaces.nsISupportsString).data.split("\u2022");
  this.loadURLScript7 = prefs.getComplexValue("customizations.loadURLScript7", Components.interfaces.nsISupportsString).data.split("\u2022");
  this.loadURLScript8 = prefs.getComplexValue("customizations.loadURLScript8", Components.interfaces.nsISupportsString).data.split("\u2022");
  this.loadURLScript9 = prefs.getComplexValue("customizations.loadURLScript9", Components.interfaces.nsISupportsString).data.split("\u2022");
  this.loadURLScript10 = prefs.getComplexValue("customizations.loadURLScript10", Components.interfaces.nsISupportsString).data.split("\u2022");
  this.loadURLScript11 = prefs.getComplexValue("customizations.loadURLScript11", Components.interfaces.nsISupportsString).data.split("\u2022");
  this.loadURLScript12 = prefs.getComplexValue("customizations.loadURLScript12", Components.interfaces.nsISupportsString).data.split("\u2022");
  this.loadURLScript13 = prefs.getComplexValue("customizations.loadURLScript13", Components.interfaces.nsISupportsString).data.split("\u2022");
  this.loadURLScript14 = prefs.getComplexValue("customizations.loadURLScript14", Components.interfaces.nsISupportsString).data.split("\u2022");
  this.loadURLScript15 = prefs.getComplexValue("customizations.loadURLScript15", Components.interfaces.nsISupportsString).data.split("\u2022");
  this.loadURLScript16 = prefs.getComplexValue("customizations.loadURLScript16", Components.interfaces.nsISupportsString).data.split("\u2022");
  this.loadURLScript17 = prefs.getComplexValue("customizations.loadURLScript17", Components.interfaces.nsISupportsString).data.split("\u2022");
  this.loadURLScript18 = prefs.getComplexValue("customizations.loadURLScript18", Components.interfaces.nsISupportsString).data.split("\u2022");
  this.loadURLScript19 = prefs.getComplexValue("customizations.loadURLScript19", Components.interfaces.nsISupportsString).data.split("\u2022");
  this.loadURLScript20 = prefs.getComplexValue("customizations.loadURLScript20", Components.interfaces.nsISupportsString).data.split("\u2022");
  this.openLink = prefs.getCharPref("customizations.openLink"); // display link in current tab = 'curTab' or new tab = 'newTab' or new window = 'newWindow'
  this.closeBrowserOnLastTab = prefs.getBoolPref("customizations.closeBrowserOnLastTab"); // close browser when last tab is closed
  this.dailyReadingsFolderURI = prefs.getCharPref("customizations.dailyReadingsFolder");

  ///////////////////////////////////////////////////////////////////////////////////////////////
  //	initializing properties
  ///////////////////////////////////////////////////////////////////////////////////////////////

  this.skinPath = "chrome://easygestures/skin/"; // path to skin containing icons and images
  
  this.smallMenuTag = this.smallIcons ? "small_" : "";
  this.linkSignPath = this.skinPath + this.smallMenuTag + "link.png";

  this.curLayoutName = "main";
  this.baseMenu = ""; // is the menu from which extra menu is called: main, mainAlt1 or mainAlt2
  this.menuState = 0; // 0: not shown; 1: showing; 2: showing & mouse moved; 3: staying open

  // Coordonnées
  this.pageX = 0; // page x coordinate of pie menu center
  this.pageY = 0;
  this.clientX = 0; // client x coordinate of pie menu center
  this.clientY = 0;
  this.screenX = 0; // screen x coordinate of pie menu center
  this.screenY = 0;

  this.sector = -1; // index of item under mouse

  this.tooltipsTrigger = null; // trigger to display pie menu labels
  this.autoscrollingTrigger = null; // trigger to display autoscrolling
  this.autoscrolling = false; // used for automatic delayed autoscrolling on mouse down

  this.extraMenuAction = null; // position of extra menu action in base menu from which extra menu is called

  this.iconSize = this.smallIcons? 20 : 32;

  this.showingTooltips = false; // tooltips are showing or hidden

  ///////////////////////////////////////////////////////////////////////////////////////////////
  // final initializations
  ///////////////////////////////////////////////////////////////////////////////////////////////

  this.menuSet = { // contains main, extra, alternatives and contextual menu layouts objects
    main: new eG_menuLayout(this, "main",
                            prefs.getCharPref("menus.main").split("/")),

    mainAlt1: new eG_menuLayout(this, "mainAlt1",
                                prefs.getCharPref("menus.mainAlt1").split("/")),

    mainAlt2: new eG_menuLayout(this, "mainAlt2",
                                prefs.getCharPref("menus.mainAlt2").split("/")),

    extra: new eG_menuLayout(this, "extra",
                             prefs.getCharPref("menus.extra").split("/")),

    extraAlt1: new eG_menuLayout(this, "extraAlt1",
                                 prefs.getCharPref("menus.extraAlt1").split("/")),

    extraAlt2: new eG_menuLayout(this, "extraAlt2",
                                 prefs.getCharPref("menus.extraAlt2").split("/")),

    contextLink: new eG_menuLayout(this, "contextLink",
                                   prefs.getCharPref("menus.contextLink").split("/")),

    contextImage: new eG_menuLayout(this, "contextImage",
                                    prefs.getCharPref("menus.contextImage").split("/")),

    contextSelection: new eG_menuLayout(this, "contextSelection",
                                        prefs.getCharPref("menus.contextSelection").split("/")),

    contextTextbox: new eG_menuLayout(this, "contextTextbox",
                                      prefs.getCharPref("menus.contextTextbox").split("/"))
  };
}

eG_menu.prototype = {
  isMenuHidden : function() {
    return this.menuState === 0;
  },
  
  isMenuDisplayed : function() {
    return this.menuState !== 0;
  },
  
  createEasyGesturesNode : function(aDocument) {
    var aDiv = aDocument.createElementNS(eGc.HTMLNamespace, "div");
    aDiv.setAttribute("id", eGc.easyGesturesID);
    return aDiv;
  },
  
  createSpecialNodes : function (layoutName) { //creating DOM nodes
    var layout = this.menuSet[layoutName];

    ////////////////////////////////////////////////////////////////////////////
    // creating a div to contain all the items
    ///////////////////////////////////////////////////////////////////////////

    var node = eGc.frame_doc.createElementNS(eGc.HTMLNamespace, "div");
    node.setAttribute("id", "eG_SpecialNodes"); // used to know if menu has already been displayed in the current document

    ////////////////////////////////////////////////////////////////////////////
    // creating link sign
    ///////////////////////////////////////////////////////////////////////////

    var img = eGc.frame_doc.createElementNS(eGc.HTMLNamespace, "img");
    img.setAttribute("id", "eG_linkSign_" + this.smallMenuTag);
    img.style.left = Math.round(layout.outerR - this.iconSize/2) + "px";
    img.style.top = Math.round(layout.outerR - this.iconSize/2) + "px";
    img.src = this.linkSignPath;
    img.alt = "";

    node.appendChild(img);
    
    // adding the main menus sign
    var div = eGc.frame_doc.createElementNS(eGc.HTMLNamespace, "div");
    div.setAttribute("id", "easyGesturesMainMenusSign");
    div.style.left = layout.outerR + this.iconSize + "px";
    
    var i = this.numberOfMainMenus;
    while (i > 0) {
      let span = eGc.frame_doc.createElementNS(eGc.HTMLNamespace, "span");
      div.appendChild(span);
      --i;
    }
    
    node.appendChild(div);
    
    // adding the extra menus sign
    div = eGc.frame_doc.createElementNS(eGc.HTMLNamespace, "div");
    div.setAttribute("id", "easyGesturesExtraMenusSign");
    div.style.left = layout.outerR + this.iconSize + "px";
    div.style.top = "calc(" + -2 * this.iconSize + "px - 1em)";
    
    i = this.numberOfExtraMenus;
    while (i > 0) {
      let span = eGc.frame_doc.createElementNS(eGc.HTMLNamespace, "span");
      div.appendChild(span);
      --i;
    }
    
    node.appendChild(div);
    
    // adding the contextual menu sign
    div = eGc.frame_doc.createElementNS(eGc.HTMLNamespace, "div");
    div.setAttribute("id", "easyGesturesContextMenuSign");
    div.style.left = layout.outerR + this.iconSize + "px";
    node.appendChild(div);
    
    return node;
  },

  createActionsNodes : function(layoutName) { //creating DOM nodes
    var layout = this.menuSet[layoutName];

    ////////////////////////////////////////////////////////////////////////////
    // creating a div to contain all the items
    ///////////////////////////////////////////////////////////////////////////

    var node = eGc.frame_doc.createElementNS(eGc.HTMLNamespace, "div");
    node.setAttribute("id", "eG_actions_" + layoutName); // used to know if menu has already been displayed in the current document
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

      timg = eGc.frame_doc.createElementNS(eGc.HTMLNamespace, "div"); // was img tag. Changed to div tag to use compound image
      timg.setAttribute("id", "eG_action_" + this.smallMenuTag + layoutName + "_" + i);
      timg.style.zIndex = layout.zIndex;
      timg.style.left = Math.round(xpos) + "px";
      timg.style.top = Math.round(ypos) + "px";
      timg.setAttribute("grayed", "false");
      timg.setAttribute("active", "false");

      if (layout.actions[i].src.search("loadURLScript")==-1) {
        timg.setAttribute("class", (this.smallMenuTag + (this.noIcons ? "empty": layout.actions[i].src)));
        if (layout.actions[i].type==1) {
          this.extraMenuAction = i;
        }
      }
      else { // new icon path for loadURLScript ?
        if (this[layout.actions[i].src][4]=="true" || this[layout.actions[i].src][5]=="true") {
          if (!this.smallIcons && this[layout.actions[i].src][4]=="true") { // adjusting icons for better presentation because favicons are 16x16 size and look small in the pie
            timg.style.backgroundPosition = "4px 4px";
            timg.style.backgroundSize = "26px 26px";
          }
          timg.style.backgroundImage="url('"+(this[layout.actions[i].src][3]).replace(/\\/g , "\\\\")+"')";
          timg.setAttribute("class", (this.smallMenuTag + (this.noIcons ? "empty": "customIcon")));
        }
        else {
          timg.setAttribute("class", (this.smallMenuTag + (this.noIcons ? "empty": layout.actions[i].src)));
        }
      }

      timg.alt = "";
      node.appendChild(timg);
    }

    ////////////////////////////////////////////////////////////////////////////
    // creating menu image
    ///////////////////////////////////////////////////////////////////////////

    var timg = eGc.frame_doc.createElementNS(eGc.HTMLNamespace, "img");
    timg.setAttribute("id", "eG_actions_" + layoutName + "_menu");
    timg.style.zIndex = layout.zIndex-1;
    timg.src = layout.menuImage;
    timg.style.width = 2*layout.outerR + "px";
    timg.style.height = 2*layout.outerR + "px";
    timg.style.opacity = this.menuOpacity;
    timg.alt = "";
    node.appendChild(timg);

    // save node and hide it
    node.style.display = "none";
    return node;
  },

  createLabelsNodes : function(layoutName) { //creating DOM nodes
    var layout = this.menuSet[layoutName];

    ////////////////////////////////////////////////////////////////////////////
    // creating a div to contain all the items
    ///////////////////////////////////////////////////////////////////////////

    var node = eGc.frame_doc.createElementNS(eGc.HTMLNamespace, "div");
    node.setAttribute("id", "eG_labels_" + layoutName); // used to know if labels have already been displayed in the current document
    node.style.height = layout.height + "px";
    node.style.width = layout.width + "px";
    node.style.zIndex =  layout.zIndex - 1; // labels are displayed below menu level

    ////////////////////////////////////////////////////////////////////////////
    // creating labels and adjusting labels position
    ///////////////////////////////////////////////////////////////////////////

    var nbItems = layout.labels.length; // number of items to be displayed

    var xofs = 0;
    var yofs = 0;

    for (var i = 0; i<nbItems; i++) {
      var xpos = layout.xLabelsPos[i] + xofs;
      var ypos = layout.yLabelsPos[i] + yofs;

      var tdiv = eGc.frame_doc.createElementNS(eGc.HTMLNamespace, "div");
      tdiv.setAttribute("id", "eG_label_" + layoutName + "_" + i);
      tdiv.style.zIndex = layout.zIndex - 1;
      tdiv.style.left = Math.round(xpos) + "px";
      tdiv.style.top = Math.round(ypos) + "px";
      tdiv.appendChild(eGc.frame_doc.createTextNode(layout.labels[i]) );
      node.appendChild(tdiv);
    }

    ////////////////////////////////////////////////////////////////////////////
    // creating tooltips image
    ///////////////////////////////////////////////////////////////////////////

    var timg = eGc.frame_doc.createElementNS(eGc.HTMLNamespace, "img");
    timg.setAttribute("id", "eG_labels_" + layoutName + "_background");
    timg.style.zIndex = layout.zIndex - 2;
    timg.src = layout.tooltipsImage;
    timg.style.width = layout.width + "px";
    timg.style.height = layout.height + "px";
    node.appendChild(timg);

    // save node and hide it
    node.style.display = "none";
    return node;
  },

  show : function(layoutName) { // makes menu visible
    var layout = this.menuSet[layoutName];
    
    // create resources if necessary
    var easyGesturesNode = eGc.frame_doc.getElementById(eGc.easyGesturesID);
    if (easyGesturesNode === null) {
      easyGesturesNode = this.createEasyGesturesNode(eGc.frame_doc);
      eGc.body.insertBefore(easyGesturesNode, eGc.body.firstChild);
    }
    
    var specialNodes = eGc.frame_doc.getElementById("eG_SpecialNodes");
    if (specialNodes === null) {
      specialNodes = this.createSpecialNodes("main");
      easyGesturesNode.appendChild(specialNodes);
    }
    
    // create resources if necessary
    var layout_aNode = eGc.frame_doc.getElementById("eG_actions_" + layoutName);
    if (layout_aNode === null) {
      layout_aNode = this.createActionsNodes(layoutName); // checking if menu has already been displayed in the current document
      easyGesturesNode.appendChild(layout_aNode);
    }

    // recalculate positions
    layout_aNode.style.left = this.clientX + layout.aNodeXOff + "px";
    layout_aNode.style.top = this.clientY + layout.aNodeYOff+ "px";
    layout_aNode.style.display = "block";

    specialNodes.style.left = this.clientX + layout.aNodeXOff + "px";
    //this.specialNodes.style.top=this.clientX + layout.aNodeYOff+ "px";
    if (!layout.isExtraMenu) {
      specialNodes.style.top = this.clientY + layout.aNodeYOff + "px";
    }
    
    if (this.isMenuHidden()) {
      this.menuState = 1; // menu is showing
    }
    this.curLayoutName = layoutName;
    this.update();
    this.resetTooltipsTimeout();
  },

  handleMousemove : function(event) { // handle rollover effects and switch to/from extra menu
    var layout = this.menuSet[this.curLayoutName];
    
    var layout_aNode = eGc.frame_doc.getElementById("eG_actions_" + this.curLayoutName);
    var layout_lNode = eGc.frame_doc.getElementById("eG_labels_" + this.curLayoutName);
    var baseLayout_aNode = eGc.frame_doc.getElementById("eG_actions_" + this.baseMenu);
    var baseLayout_lNode = eGc.frame_doc.getElementById("eG_labels_" + this.baseMenu);
    var specialNodes = eGc.frame_doc.getElementById("eG_SpecialNodes");
    var mainMenusSign = specialNodes.childNodes[1];
    var extraMenusSign = specialNodes.childNodes[2];
    
    // state change if was dragged
    if (this.menuState == 1 && (Math.abs(event.clientX- this.clientX)> 1 || Math.abs(event.clientY- this.clientY)> 1)) {
      this.menuState = 2;
    }

    var movDir = event.clientY - eGc.clientYDown; // used to control extra menu opening/closing from an action
    eGc.clientYDown = event.clientY;

    ///////////////////////////////////////////////////////////////////////////////////////////////
    //	identifying current sector
    ///////////////////////////////////////////////////////////////////////////////////////////////

    var nbItems = layout.actions.length; // number of items to be displayed

    var sector = -1;
    var radius = Math.sqrt((event.clientX-this.clientX)* (event.clientX-this.clientX) + (event.clientY-this.clientY)* (event.clientY-this.clientY));

    if (radius > layout.innerR) {
      var angle = Math.atan2(event.clientX-this.clientX, this.clientY-event.clientY) + Math.PI/nbItems;
      if (angle < 0) {
        angle += 2* Math.PI;
      }
      sector = Math.floor( nbItems*angle/ (2* Math.PI) );
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    // moving menu when shift key is down
    ///////////////////////////////////////////////////////////////////////////////////////////////

    var moveAutoTrigger = (radius >= layout.outerR && layout.actions[sector].type != 1);

    if (event.shiftKey && !this.moveAuto || this.moveAuto && moveAutoTrigger ) {
      if (eGc.moving) {
        var dx = (event.clientX - eGc.xMoving);
        var dy = (event.clientY - eGc.yMoving);

        this.clientX += dx;
        this.clientY += dy;

        layout_aNode.style.left = parseFloat(layout_aNode.style.left)+dx+ "px"; // parseFloat !!!
        layout_aNode.style.top = parseFloat(layout_aNode.style.top)+dy+ "px";
        if (layout_lNode !== null) {
          layout_lNode.style.left = parseFloat(layout_lNode.style.left)+dx+ "px";
          layout_lNode.style.top = parseFloat(layout_lNode.style.top)+dy+ "px";
        }

        specialNodes.style.left = parseFloat(specialNodes.style.left)+dx+ "px";
        specialNodes.style.top = parseFloat(specialNodes.style.top)+dy+ "px";

        if (layout.isExtraMenu) { // extra menu is displayed: move base menu too
          baseLayout_aNode.style.left = parseFloat(baseLayout_aNode.style.left)+dx+ "px"; // parseFloat !!!
          baseLayout_aNode.style.top = parseFloat(baseLayout_aNode.style.top)+dy+ "px";
          if (baseLayout_lNode !== null) {
            baseLayout_lNode.style.left = parseFloat(baseLayout_lNode.style.left)+dx+ "px";
            baseLayout_lNode.style.top = parseFloat(baseLayout_lNode.style.top)+dy+ "px";
          }
        }
      }
      else {
        eGc.moving = true;
      }

      eGc.xMoving = event.clientX;
      eGc.yMoving = event.clientY;

      return;
    }
    else {
      eGc.moving = false;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    // rollover effects
    ///////////////////////////////////////////////////////////////////////////////////////////////

    if (this.sector != sector) { // moved to new sector
      this.clearRollover(layout, false);

      if (sector >= 0) { // sector targetted exists: highlighting icons and labels
        layout_aNode.childNodes[sector].setAttribute("active", "true");
        this.rolloverExternalIcons(layout.actions[sector].src, layout_aNode.childNodes[sector], true);
        if (layout_lNode !== null) {
          layout_lNode.childNodes[sector].style.fontWeight = "bold";
        }
      }
    }

    this.sector = sector;

    ///////////////////////////////////////////////////////////////////////////////////////////////
    // switching to/from extra menu
    ///////////////////////////////////////////////////////////////////////////////////////////////

    if (radius > 3*layout.outerR) {
      if (this.menuState != 2) {
        this.close();
      }
    }
    else if (radius > layout.outerR) {
      if (layout.actions[sector].type == 1) {	// show extra menu
        this.showExtraMenu();
      }
    }
    else if (radius>layout.innerR && sector>2 && sector <6 && layout.isExtraMenu && movDir>0) { // hide extra menu
      var baseLayout = this.menuSet[this.baseMenu];
      baseLayout_aNode.childNodes[this.extraMenuAction].setAttribute("extraMenuShowing","false"); // reset rollover of extra menu action icon in main menu

      this.hide(layout);
      
      mainMenusSign.style.visibility = "visible";
      extraMenusSign.style.visibility = "hidden";
      
      this.pageY = this.pageY+baseLayout.outerR*1.2;
      this.clientY = this.clientY+baseLayout.outerR*1.2;
      this.screenY = this.screenY+baseLayout.outerR*1.2;

      this.curLayoutName = this.baseMenu;
      this.resetTooltipsTimeout();
    }
  },

  showExtraMenu : function() {
    var layout = this.menuSet[this.curLayoutName];
    
    var layout_aNode = eGc.frame_doc.getElementById("eG_actions_" + this.curLayoutName);
    var baseLayout_lNode = eGc.frame_doc.getElementById("eG_labels_" + this.baseMenu);
    var specialNodes = eGc.frame_doc.getElementById("eG_SpecialNodes");
    var mainMenusSign = specialNodes.childNodes[1];
    var extraMenusSign = specialNodes.childNodes[2];
    
    layout_aNode.childNodes[this.extraMenuAction].setAttribute("extraMenuShowing","true");

    this.pageY = this.pageY-layout.outerR*1.2;
    this.clientY = this.clientY-layout.outerR*1.2;
    this.screenY = this.screenY-layout.outerR*1.2;

    this.baseMenu = this.curLayoutName; // base menu from which extra menu is called
    this.show("extra");
    
    mainMenusSign.style.visibility = "hidden";
    extraMenusSign.style.visibility = "visible";
    
    // hide main menu tooltips after extra menu showed
    if (baseLayout_lNode !== null) {
      baseLayout_lNode.style.display = "none";
    }
  },

  hide : function(layout) { // makes menu invisible
    var layout_aNode = eGc.frame_doc.getElementById("eG_actions_" + layout.name);
    var layout_lNode = eGc.frame_doc.getElementById("eG_labels_" + layout.name);
    var specialNodes = eGc.frame_doc.getElementById("eG_SpecialNodes");
    var linkSign = specialNodes.childNodes[0];
    var contextMenuSign = specialNodes.childNodes[3];
  
    if (layout_aNode !== null) {
      layout_aNode.style.display = "none";
    }
    if (layout_lNode !== null) {
      layout_lNode.style.display = "none";
    }

    linkSign.style.visibility = "hidden";
    contextMenuSign.style.visibility = "hidden";

    this.clearRollover(layout, true);

    if (this.showTooltips) {
      var window = Services.wm.getMostRecentWindow("navigator:browser");
      window.clearTimeout(this.tooltipsTrigger);
    }
  },

  clearRollover : function(layout, hidding) { // clear rollover effect
    var layout_aNode = eGc.frame_doc.getElementById("eG_actions_" + layout.name);
    var layout_lNode = eGc.frame_doc.getElementById("eG_labels_" + layout.name);
    var baseLayout_aNode = eGc.frame_doc.getElementById("eG_actions_" + this.baseMenu);
  
    if (this.sector >= 0) {
      layout_aNode.childNodes[this.sector].setAttribute("active", "false");
      this.rolloverExternalIcons(layout.actions[this.sector].src, layout_aNode.childNodes[this.sector], false);
      if (layout_lNode !== null) {
        layout_lNode.childNodes[this.sector].style.fontWeight = "normal";
      }
    }

    // reset rollover for extra menu in base menu if needed
    var baseLayout = this.menuSet[this.baseMenu];
    if (baseLayout !== undefined && baseLayout.hasExtraMenuAction && hidding) {
      baseLayout_aNode.childNodes[this.extraMenuAction].setAttribute("extraMenuShowing","false");
      baseLayout_aNode.childNodes[this.extraMenuAction].setAttribute("active","false");
    }
  },

  rolloverExternalIcons : function(src, node, active) { // this is for loadURLScript actions icons which can be customized or imported from favicons or program's icons
    if (this[src] === undefined || src === "autoscrolling") {
      return;
    }

    if (active) {
      if (this[src][4] == "true") {
        node.style.backgroundPosition = (!this.smallIcons?"5px 5px":"1px 1px");
      }
      else if (this[src][5] == "true") {
        node.style.backgroundPosition = (!this.smallIcons?"1px 1px":"1px 1px");
      }
    }
    else {
      if (this[src][4] == "true") {
        node.style.backgroundPosition = (!this.smallIcons?"4px 4px":"0px 0px");
      }
      else if (this[src][5] == "true") {
        node.style.backgroundPosition = (!this.smallIcons?"0px 0px":"0px 0px");
      }
    }
  },

  runAction : function() {
    var layout = this.menuSet[this.curLayoutName];

    if (this.sector >= 0) {

      ///////////////////////////////////////////////////////////////////////////////////////////////
      // updatel stats
      ///////////////////////////////////////////////////////////////////////////////////////////////

      var index = layout.name.match (/\d+/);
      if (index === null) {
        index = 0;
      }

      if (layout.name.search("extra") == -1) { // main
        var statsMainArray = eGPrefs.getStatsMainMenuPref();

        var sector8To10 = this.sector;
        if (!layout.isLarge) {
          if (this.sector > 2) {
            sector8To10++;
          }
          if (this.sector >= 6) {
            sector8To10++;
          }
        }
        statsMainArray[index*10+sector8To10]++;
        eGPrefs.setStatsMainMenuPref(statsMainArray.toSource());
      }
      else { // extra
        var statsExtraArray = eGPrefs.getStatsExtraMenuPref();
        statsExtraArray[index*8+this.sector]++;
        eGPrefs.setStatsExtraMenuPref(statsExtraArray.toSource());
      }

      var statsActionsArray = eGPrefs.getStatsActionsPref();
      statsActionsArray[layout.actions[this.sector].id]++;
      eGPrefs.setStatsActionsPref(statsActionsArray.toSource());

      try {
        eGf[layout.actions[this.sector].src]();
      }
      catch(ex) {
        var error = Components.classes["@mozilla.org/scripterror;1"]
                              .createInstance(Components.interfaces.nsIScriptError);
        error.init("easyGestures N exception: " + ex.toString(), null, null, null, null, error.errorFlag, null);
        Services.console.logMessage(error);
      }
    }

    if (this.sector == -1 || layout.actions[this.sector].type != 1) {
      this.close(); // close menu if no extra menu is called from action or no action
    }
  },

  update : function() { // update menu content (gray actions, display special signs etc.)
    var layout = this.menuSet[this.curLayoutName];
    
    var layout_aNode = eGc.frame_doc.getElementById("eG_actions_" + this.curLayoutName);
    var specialNodes = eGc.frame_doc.getElementById("eG_SpecialNodes");
    var linkSign = specialNodes.childNodes[0];
    var mainMenusSign = specialNodes.childNodes[1];
    var extraMenusSign = specialNodes.childNodes[2];
    var contextMenuSign = specialNodes.childNodes[3];
    
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    var gBrowser = window.gBrowser;

    ///////////////////////////////////////////////////////////////////////////////////////////////
    // showing center icon
    ///////////////////////////////////////////////////////////////////////////////////////////////

    if (eGc.link !== null && this.handleLinks && this.menuState!=2 && this.menuState!=3 && this.curLayoutName =="main") { //if a link is pointed and mouse not dragged
      linkSign.style.visibility = "visible";
      this.linkTrigger = window.setTimeout(function() { linkSign.style.visibility = "hidden"; }, this.linksDelay);
    }
    else {
      linkSign.style.visibility = "hidden";
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    // graying actions
    ///////////////////////////////////////////////////////////////////////////////////////////////
    
    var actionNode = null;
    var actionName = "back";
    if (layout.update[actionName] != -1) {
      actionNode = layout_aNode.childNodes[layout.update[actionName]];
      if (gBrowser.canGoBack) {
        actionNode.setAttribute("grayed", "false");
      }
      else {
        actionNode.setAttribute("grayed", "true");
      }
    }

    actionName = "backSite";
    if (layout.update[actionName] != -1) {
      actionNode = layout_aNode.childNodes[layout.update[actionName]];
      if (gBrowser.canGoBack) {
        actionNode.setAttribute("grayed", "false");
      }
      else {
        actionNode.setAttribute("grayed", "true");
      }
    }

    actionName = "firstPage";
    if (layout.update[actionName] != -1) {
      actionNode = layout_aNode.childNodes[layout.update[actionName]];
      if (gBrowser.canGoBack) {
        actionNode.setAttribute("grayed", "false");
      }
      else {
        actionNode.setAttribute("grayed", "true");
      }
    }

    actionName = "forward";
    if (layout.update[actionName] != -1) {
      actionNode = layout_aNode.childNodes[layout.update[actionName]];
      if (gBrowser.canGoForward) {
        actionNode.setAttribute("grayed", "false");
      }
      else {
        actionNode.setAttribute("grayed", "true");
      }
    }

    actionName = "forwardSite";
    if (layout.update[actionName] != -1) {
      actionNode = layout_aNode.childNodes[layout.update[actionName]];
      if (gBrowser.canGoForward) {
        actionNode.setAttribute("grayed", "false");
      }
      else {
        actionNode.setAttribute("grayed", "true");
      }
    }

    actionName = "lastPage";
    if (layout.update[actionName] != -1) {
      actionNode = layout_aNode.childNodes[layout.update[actionName]];
      if (gBrowser.canGoForward) {
        actionNode.setAttribute("grayed", "false");
      }
      else {
        actionNode.setAttribute("grayed", "true");
      }
    }

    actionName = "nextTab";
    if (layout.update[actionName] != -1) {
      actionNode = layout_aNode.childNodes[layout.update[actionName]];
      if (gBrowser.mTabContainer.childNodes.length > 1) {
        actionNode.setAttribute("grayed", "false");
      }
      else {
        actionNode.setAttribute("grayed", "true");
      }
    }

    actionName = "prevTab";
    if (layout.update[actionName] != -1) {
      actionNode = layout_aNode.childNodes[layout.update[actionName]];
      if (gBrowser.mTabContainer.childNodes.length > 1) {
        actionNode.setAttribute("grayed", "false");
      }
      else {
        actionNode.setAttribute("grayed", "true");
      }
    }

    actionName = "closeOtherTabs";
    if (layout.update[actionName] != -1) {
      actionNode = layout_aNode.childNodes[layout.update[actionName]];
      if (gBrowser.mTabContainer.childNodes.length > 1) {
        actionNode.setAttribute("grayed", "false");
      }
      else {
        actionNode.setAttribute("grayed", "true");
      }
    }

    actionName = "undoCloseTab";
    if (layout.update[actionName] != -1) {
      actionNode = layout_aNode.childNodes[layout.update[actionName]];
      if (Components.classes["@mozilla.org/browser/sessionstore;1"].getService(Components.interfaces.nsISessionStore).getClosedTabCount(window) > 0) {
        actionNode.setAttribute("grayed", "false");
      }
      else {
        actionNode.setAttribute("grayed", "true");
      }
    }

    actionName = "closeOtherWindows";
    if (layout.update[actionName] != -1) {
      actionNode = layout_aNode.childNodes[layout.update[actionName]];

      var winEnum = Services.wm.getZOrderDOMWindowEnumerator("navigator:browser", false);
      if (winEnum.hasMoreElements()) {
        winEnum.getNext(); //first window
      }

      if (winEnum.hasMoreElements()) {
        actionNode.setAttribute("grayed", "false");
      }
      else {
        actionNode.setAttribute("grayed", "true");
      }
    }

    actionName = "reload";
    if (layout.update[actionName] != -1) {
      actionNode = layout_aNode.childNodes[layout.update[actionName]];

      var stop_bcaster = window.document.getElementById("Browser:Stop");
      eGc.loading = !stop_bcaster.hasAttribute("disabled");

      var actionClass = actionNode.getAttribute("class");
      if (!eGc.loading) {
        actionNode.setAttribute("class", actionClass.replace("stop","reload"));
      }
      else {
        actionNode.setAttribute("class", actionClass.replace("reload","stop"));
      }
    }

    actionName = "up";
    if (layout.update[actionName] != -1) {
      actionNode = layout_aNode.childNodes[layout.update[actionName]];
      if (eG_canGoUp()) {
        actionNode.setAttribute("grayed", "false");
      }
      else {
        actionNode.setAttribute("grayed", "true");
      }
    }

    actionName = "root";
    if (layout.update[actionName] != -1) {
      actionNode = layout_aNode.childNodes[layout.update[actionName]];
      if (eG_canGoUp()) {
        actionNode.setAttribute("grayed", "false");
      }
      else {
        actionNode.setAttribute("grayed", "true");
      }
    }

    ////////////////////////////////////////////////////////////////////////////
    // update context title and signs
    ////////////////////////////////////////////////////////////////////////////
    
    if (layout.name.search("context") != -1) {
      contextMenuSign.innerHTML = eGc.localizing.getString(layout.name);
      if (eGc.contextType.split("/").length > 2) {
        contextMenuSign.className = "withAltSign";
      }
      else {
        contextMenuSign.removeAttribute("class");
      }
    }
    
    // update main or extra menu sign
    if (layout.name.startsWith("main")) {
      mainMenusSign.style.visibility = "visible";
      this.updateMenuSign(mainMenusSign, layout.name, this.numberOfMainMenus);
    }
    else {
      this.updateMenuSign(extraMenusSign, layout.name, this.numberOfExtraMenus);
    }
  },
  
  updateMenuSign : function(menuSign, layoutName, numberOfMenus) {
    var layoutNumber = parseInt(layoutName.replace(/^\D*/, '0'), 10);
    layoutNumber = Math.min(layoutNumber, numberOfMenus - 1);
    var previousLayoutNumber = (((layoutNumber - 1) % numberOfMenus) +
      numberOfMenus) % numberOfMenus;
    previousLayoutNumber = Math.min(previousLayoutNumber, numberOfMenus - 1);
    menuSign.childNodes[previousLayoutNumber].removeAttribute("class");
    menuSign.childNodes[layoutNumber].className = "active";
  },

  switchLayout : function() { // this is not about switching to/from extra menu
    var layout = this.menuSet[this.curLayoutName];
    var nextLayoutName = "";
    
    var specialNodes = eGc.frame_doc.getElementById("eG_SpecialNodes");
    var contextMenuSign = specialNodes.childNodes[3];
    
    if (this.curLayoutName.search("context") == -1) { // switch to alternative layouts
      this.hide(layout);

      if (!layout.isExtraMenu) {
        nextLayoutName = "main";
        if (this.curLayoutName == "main" && this.mainAlt1MenuEnabled) {
          nextLayoutName = "mainAlt1";
        }
        else if (this.curLayoutName == "mainAlt1" && this.mainAlt2MenuEnabled || this.curLayoutName == "main" && !this.mainAlt1MenuEnabled && this.mainAlt2MenuEnabled) {
          nextLayoutName = "mainAlt2";
        }
      }
      else {
        nextLayoutName = "extra";
        if (this.curLayoutName == "extra" && this.extraAlt1MenuEnabled) {
          nextLayoutName = "extraAlt1";
        }
        else if (this.curLayoutName == "extraAlt1" && this.extraAlt2MenuEnabled || this.curLayoutName == "extra" && !this.extraAlt1MenuEnabled && this.extraAlt2MenuEnabled) {
          nextLayoutName = "extraAlt2";
        }
      }

      this.show(nextLayoutName);
    }
    else { // switch to other contextual layouts
      if (eGc.contextType.split("/").length>2) {
        this.hide(layout);
        if (eGc.contextType == "link/image/") {
          nextLayoutName = (this.curLayoutName=="contextLink" ? "contextImage" : "contextLink" );
        }
        else {
          nextLayoutName = (this.curLayoutName=="contextSelection" ? "contextTextbox" : "contextSelection" );
        }

        this.show(nextLayoutName);
        contextMenuSign.style.visibility = "visible";
      }
    }
  },

  close : function() {
    var layout = this.menuSet[this.curLayoutName];
    var baseLayout = this.menuSet[this.baseMenu];
    var specialNodes = eGc.frame_doc.getElementById("eG_SpecialNodes");
    var mainMenusSign = specialNodes.childNodes[1];
    var extraMenusSign = specialNodes.childNodes[2];
    
    this.hide(layout);
    if (layout.isExtraMenu) {
      this.hide(baseLayout); // hide base menu too if closing is done from extra menu
      extraMenusSign.style.visibility = "hidden";
    }
    mainMenusSign.style.visibility = "hidden";

    this.reset();

    eGPrefs.incrementStatsMenuShownPref();

    // re-enable counting clicks inside window
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.addEventListener("mousedown", eG_countClicks, false);
  },

  reset : function() {
    this.menuState = 0; // menu is not showing
    this.sector = -1;
    this.baseMenu = "";
    this.showingTooltips = false;

    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.removeEventListener("mousemove", eG_handleMousemove, true);

    eGc.image = null; // removes the pointed image if any
    eGc.link = null; // removes the pointed link if any
    eGc.selection = null; // removes the selected text if any
    eGc.selectionNode = null; // removes the selected node if any

    // enabling selection when left mouse button is used because selection is turned off in that case
    if (this.showButton === 0) { // left mouse button
      var selCon = window.gBrowser.docShell.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsISelectionDisplay).QueryInterface(Components.interfaces.nsISelectionController);
      selCon.setDisplaySelection(2); // SELECTION_ON
    }
  },

  resetTooltipsTimeout : function() { // setting and resetting tooltips timeout
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    
    if (this.showTooltips) {
      window.clearTimeout(this.tooltipsTrigger);
      if (this.showingTooltips || this.tooltipsDelay === 0) {
        this.showMenuTooltips();
      }
      else {
        this.tooltipsTrigger = window.setTimeout(this.showMenuTooltips.bind(eGm), this.tooltipsDelay);
      }
    }
  },

  showMenuTooltips : function() { // displaying tooltips
    var layout = this.menuSet[this.curLayoutName];
    var easyGesturesNode = eGc.frame_doc.getElementById(eGc.easyGesturesID);
    
    // create resources if necessary
    var layout_lNode = eGc.frame_doc.getElementById("eG_labels_" + this.curLayoutName);
    if (layout_lNode === null) {
      layout_lNode = this.createLabelsNodes(this.curLayoutName); // checking if labels have already been displayed in the current document
      easyGesturesNode.appendChild(layout_lNode);
    }

    layout_lNode.style.left = this.clientX + layout.lNodeXOff + "px";
    layout_lNode.style.top = this.clientY + layout.lNodeYOff + "px";
    this.compensateTextZoom(layout_lNode);
    layout_lNode.style.display = "block";
    
    this.showingTooltips = true;
  },

  compensateTextZoom : function(lNode) { // adjust labels font size to compensate for zoom changes
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    var currentZoom = window.gBrowser.selectedBrowser.markupDocumentViewer.textZoom;
    //lNode.style.fontSize = Math.round(10*100/currentZoom)+"pt";

    if (!this.smallIcons) {
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
    }
    else {
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
  },
  
  removeExistingMenusFromPages : function() {
    var removeMenus = function(element, index, array) {
      var document = this.gBrowser.getBrowserForTab(element).contentDocument;
      var easyGesturesNode = document.getElementById(eGc.easyGesturesID);
      if (easyGesturesNode !== null) {
        easyGesturesNode.parentNode.removeChild(easyGesturesNode);
      }
    };
    
    // iterating over all windows and over all tabs in each window, in order to
    // remove any previously inserted easyGestures menus
    var openWindows = Services.wm.getEnumerator("navigator:browser");
    while (openWindows.hasMoreElements()) {
      let window = openWindows.getNext();
      let tabs = window.gBrowser.tabs;
      Array.forEach(tabs, removeMenus, window); // window is this in removeMenus
    }
  }
};