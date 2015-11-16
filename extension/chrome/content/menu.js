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


/* global eGActions, eGm, eGPrefs, eGStrings */

function MenuLayout(menu, name, number, nextMenuLayout, actionsPrefs) {
  this._pieMenu = menu;
  this.name = name; // "main", "mainAlt1", "mainAlt2", "extra".  "extraAlt1",  "extraAlt2", "contextLink", "contextImage",  "contextSelection", "contextTextbox"
  this._layoutNumber = number;
  this._nextMenuLayout = nextMenuLayout;
  this.isExtraMenu = false;
  this.isLarge = menu.largeMenu;
  
  if (!this.isLarge) {
    // removing actions intended for large menus
    actionsPrefs.splice(9, 1);
    actionsPrefs.splice(5, 1);
  }
  this.actions = actionsPrefs;
  this.labels = actionsPrefs.map(function(actionName) {
    return eGActions[actionName].getLabel();
  });
  
  // half the angle reserved for a sector (in radians)
  this.halfAngleForSector = Math.PI / this.actions.length;
  this.startingAngle = this.isLarge ? this.halfAngleForSector : 0;
  this.sectorOffset = this.isLarge ? 0 : this.halfAngleForSector;
  
  this.hasExtraMenuAction = eGActions[this.actions[menu.extraMenuAction]].isExtraMenuAction;
  
  // setting menu and tooltips images
  
  this.menuImage = menu.skinPath + menu.smallMenuTag +
                   (menu.noIcons ? "basic_" : "") +
                   (menu.largeMenu ? "largeMenu.png" : "menu.png");
  
  ///////////////////////////////////////////////////////////////////////////////////////////////
  //	setting dimensions and positioning
  ///////////////////////////////////////////////////////////////////////////////////////////////

  var zoom = menu.smallIcons ? 0.625:1;

  this.outerR = Math.round((this.isLarge ? 70:61)*zoom); // outer radius of pie
  this.innerR = Math.round((this.isLarge ? 36:26)*zoom); // inner radius of pie
}
MenuLayout.prototype.getNextLayout = function() {
  return this._nextMenuLayout;
};
MenuLayout.prototype.updateStatsForActionToBeExecuted = function() {
  var sector = this._pieMenu.sector;
  var sector8To10 = sector;
  if (!this.isLarge && sector > 4) {
    sector8To10++;
  }
  eGPrefs.incrementStatsMainMenuPref(this._layoutNumber * 10 + sector8To10);
  eGPrefs.updateStatsForAction(this.actions[sector]);
};
MenuLayout.prototype._updateMenuSign = function(browserMM, menuSign, numberOfMenus) {
  var layoutNumber = Math.min(this._layoutNumber, numberOfMenus - 1);
  var previousLayoutNumber = (((layoutNumber - 1) % numberOfMenus) +
                              numberOfMenus) % numberOfMenus;
  previousLayoutNumber = Math.min(previousLayoutNumber, numberOfMenus - 1);
  
  browserMM.sendAsyncMessage("easyGesturesN@ngdeleito.eu:updateMenuSign", {
    menuSign: menuSign,
    layoutNumber: layoutNumber,
    previousLayoutNumber: previousLayoutNumber
  });
};
MenuLayout.prototype.updateMenuSign = function(browserMM) {
  this._updateMenuSign(browserMM, 1, this._pieMenu.numberOfMainMenus);
};

function ExtraMenuLayout(menu, name, number, nextMenuLayout, actionsPrefs) {
  MenuLayout.call(this, menu, name, number, nextMenuLayout, actionsPrefs);
  
  this.isExtraMenu = true;
  this.isLarge = false; // extra menus are never large
  
  this.halfAngleForSector = Math.PI / 8;
  this.startingAngle = 0;
  this.sectorOffset = this.halfAngleForSector;
  
  this.menuImage = menu.skinPath + menu.smallMenuTag +
                   (menu.noIcons ? "basic_" : "") + "extraMenu.png";
}
ExtraMenuLayout.prototype = Object.create(MenuLayout.prototype);
ExtraMenuLayout.prototype.constructor = ExtraMenuLayout;
ExtraMenuLayout.prototype.updateStatsForActionToBeExecuted = function() {
  var sector = this._pieMenu.sector;
  eGPrefs.incrementStatsExtraMenuPref(this._layoutNumber * 5 + sector);
  eGPrefs.updateStatsForAction(this.actions[sector]);
};
ExtraMenuLayout.prototype.updateMenuSign = function(browserMM) {
  this._updateMenuSign(browserMM, 2, this._pieMenu.numberOfExtraMenus);
};

function ContextualMenuLayout(menu, name, actionsPrefs) {
  MenuLayout.call(this, menu, name, 0, null, actionsPrefs);
}
ContextualMenuLayout.prototype = Object.create(MenuLayout.prototype);
ContextualMenuLayout.prototype.constructor = ContextualMenuLayout;
ContextualMenuLayout.prototype.getNextLayout = function() {
  return this._pieMenu.contextualMenus[
    (this._pieMenu.contextualMenus.indexOf(this.name) + 1) %
      this._pieMenu.contextualMenus.length];
};
ContextualMenuLayout.prototype.updateStatsForActionToBeExecuted = function() {
  eGPrefs.updateStatsForAction(this.actions[this._pieMenu.sector]);
};
ContextualMenuLayout.prototype.updateMenuSign = function(browserMM) {
  browserMM.sendAsyncMessage("easyGesturesN@ngdeleito.eu:updateContextualMenuSign", {
    layoutLabel: eGStrings.getString(this.name),
    moreThanOneLayout: this._pieMenu.contextualMenus.length > 1
  });
};

// menu Constructor
function eG_menu () {
  this.HTMLNamespace = "http://www.w3.org/1999/xhtml";
  
  this.contextualMenus = []; // possible values: contextLink, contextImage, contextSelection or contextTextbox
  this.anchorElementExists = false;
  this.anchorElementHREF = null;
  this.imageElementDoesntExist = true;
  this.imageElementStyleWidth = null;
  this.imageElementWidth = null;
  this.imageElementStyleHeight = null;
  this.imageElementHeight = null;
  this.imageElementSRC = "";
  this.selection = null;
  
  var prefs = Services.prefs.getBranch("extensions.easygestures.");

  ///////////////////////////////////////////////////////////////////////////////////////////////
  // loading preferences first
  ///////////////////////////////////////////////////////////////////////////////////////////////

  this.showButton = prefs.getIntPref("activation.showButton"); // mouse button for opening the pie menu
  this.showKey = prefs.getIntPref("activation.showKey"); // key for showing the pie menu with mouse button clicked
  this.showAltButton = prefs.getIntPref("activation.showAltButton"); // mouse button for switching between primary and alternative pie menu
  this.preventOpenKey = prefs.getIntPref("activation.preventOpenKey");
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
  
  this.loadURLin = prefs.getCharPref("customizations.loadURLin"); // execute 'Load URL' action in current tab = 'curTab' or new tab = 'newTab' or new window = 'newWindow'
  this.loadURLActionPrefs = {
    loadURL1: prefs.getComplexValue("customizations.loadURL1", Components.interfaces.nsISupportsString).data.split("\u2022"), // [0]: name, [1]: text, [2]:isScript, [3]: newIconPath, [4]: favicon, [5]: newIcon // previous separator "•" no longer works
    loadURL2: prefs.getComplexValue("customizations.loadURL2", Components.interfaces.nsISupportsString).data.split("\u2022"),
    loadURL3: prefs.getComplexValue("customizations.loadURL3", Components.interfaces.nsISupportsString).data.split("\u2022"),
    loadURL4: prefs.getComplexValue("customizations.loadURL4", Components.interfaces.nsISupportsString).data.split("\u2022"),
    loadURL5: prefs.getComplexValue("customizations.loadURL5", Components.interfaces.nsISupportsString).data.split("\u2022"),
    loadURL6: prefs.getComplexValue("customizations.loadURL6", Components.interfaces.nsISupportsString).data.split("\u2022"),
    loadURL7: prefs.getComplexValue("customizations.loadURL7", Components.interfaces.nsISupportsString).data.split("\u2022"),
    loadURL8: prefs.getComplexValue("customizations.loadURL8", Components.interfaces.nsISupportsString).data.split("\u2022"),
    loadURL9: prefs.getComplexValue("customizations.loadURL9", Components.interfaces.nsISupportsString).data.split("\u2022"),
    loadURL10: prefs.getComplexValue("customizations.loadURL10", Components.interfaces.nsISupportsString).data.split("\u2022")
  };
  this.runScriptActionPrefs = {
    runScript1: prefs.getComplexValue("customizations.runScript1", Components.interfaces.nsISupportsString).data.split("\u2022"),
    runScript2: prefs.getComplexValue("customizations.runScript2", Components.interfaces.nsISupportsString).data.split("\u2022"),
    runScript3: prefs.getComplexValue("customizations.runScript3", Components.interfaces.nsISupportsString).data.split("\u2022"),
    runScript4: prefs.getComplexValue("customizations.runScript4", Components.interfaces.nsISupportsString).data.split("\u2022"),
    runScript5: prefs.getComplexValue("customizations.runScript5", Components.interfaces.nsISupportsString).data.split("\u2022"),
    runScript6: prefs.getComplexValue("customizations.runScript6", Components.interfaces.nsISupportsString).data.split("\u2022"),
    runScript7: prefs.getComplexValue("customizations.runScript7", Components.interfaces.nsISupportsString).data.split("\u2022"),
    runScript8: prefs.getComplexValue("customizations.runScript8", Components.interfaces.nsISupportsString).data.split("\u2022"),
    runScript9: prefs.getComplexValue("customizations.runScript9", Components.interfaces.nsISupportsString).data.split("\u2022"),
    runScript10: prefs.getComplexValue("customizations.runScript10", Components.interfaces.nsISupportsString).data.split("\u2022")
  };
  this.openLink = prefs.getCharPref("customizations.openLink"); // display link in current tab = 'curTab' or new tab = 'newTab' or new window = 'newWindow'

  ///////////////////////////////////////////////////////////////////////////////////////////////
  //	initializing properties
  ///////////////////////////////////////////////////////////////////////////////////////////////

  this.easyGesturesID = "easyGesturesPieMenu_" +
                        (this.largeMenu ? "l" : "n") +
                        (this.smallIcons ? "s": "n");
  this.skinPath = "chrome://easygestures/skin/"; // path to skin containing icons and images
  
  this.smallMenuTag = this.smallIcons ? "small_" : "";

  this.curLayoutName = "main";
  this.baseMenu = ""; // is the menu from which extra menu is called: main, mainAlt1 or mainAlt2
  this.setHidden();
  
  // coordinates of the pie menu center (relative to the viewport)
  this.centerX = 0;
  this.centerY = 0;
  
  this.sector = -1; // index of item under mouse

  this.tooltipsTrigger = null; // trigger to display pie menu labels
  this.autoscrollingTrigger = null; // trigger to display autoscrolling
  
  this.extraMenuAction = 2; // position of extra menu action in base menu from which extra menu is called

  this.iconSize = this.smallIcons? 20 : 32;

  this.showingTooltips = false; // tooltips are showing or hidden

  ///////////////////////////////////////////////////////////////////////////////////////////////
  // final initializations
  ///////////////////////////////////////////////////////////////////////////////////////////////

  this.menuSet = { // contains main, extra, alternatives and contextual menu layouts objects
    main: new MenuLayout(this, "main", 0,
                         this.mainAlt1MenuEnabled ? "mainAlt1" :
                           (this.mainAlt2MenuEnabled ? "mainAlt2": "main"),
                         prefs.getCharPref("menus.main").split("/")),

    mainAlt1: new MenuLayout(this, "mainAlt1", 1,
                             this.mainAlt2MenuEnabled ? "mainAlt2" : "main",
                             prefs.getCharPref("menus.mainAlt1").split("/")),

    mainAlt2: new MenuLayout(this, "mainAlt2", 2, "main",
                             prefs.getCharPref("menus.mainAlt2").split("/")),

    extra: new ExtraMenuLayout(this, "extra", 0,
                               this.extraAlt1MenuEnabled ? "extraAlt1" :
                                 (this.extraAlt2MenuEnabled ? "extraAlt2": "extra"),
                               prefs.getCharPref("menus.extra").split("/")),

    extraAlt1: new ExtraMenuLayout(this, "extraAlt1", 1,
                                   this.extraAlt2MenuEnabled ? "extraAlt2" : "extra",
                                   prefs.getCharPref("menus.extraAlt1").split("/")),

    extraAlt2: new ExtraMenuLayout(this, "extraAlt2", 2, "extra",
                                   prefs.getCharPref("menus.extraAlt2").split("/")),

    contextLink: new ContextualMenuLayout(this, "contextLink",
                                          prefs.getCharPref("menus.contextLink").split("/")),

    contextImage: new ContextualMenuLayout(this, "contextImage",
                                           prefs.getCharPref("menus.contextImage").split("/")),

    contextSelection: new ContextualMenuLayout(this, "contextSelection",
                                               prefs.getCharPref("menus.contextSelection").split("/")),

    contextTextbox: new ContextualMenuLayout(this, "contextTextbox",
                                             prefs.getCharPref("menus.contextTextbox").split("/"))
  };
}

eG_menu.prototype = {
  constructor: eG_menu,
  
  isHidden : function() {
    return this._menuState === 0;
  },
  
  isShown : function() {
    return this._menuState !== 0;
  },
  
  setHidden : function() {
    this._menuState = 0;
  },
  
  isJustOpened : function() {
    return this._menuState === 1;
  },
  
  setJustOpened : function() {
    this._menuState = 1;
  },
  
  isJustOpenedAndMouseMoved : function() {
    return this._menuState === 2;
  },
  
  setJustOpenedAndMouseMoved : function() {
    this._menuState = 2;
  },
  
  setOpen : function() {
    this._menuState = 3;
  },
  
  show : function(layoutName) { // makes menu visible
    var layout = this.menuSet[layoutName];
    
    if (this.isHidden()) {
      this.setJustOpened();
    }
    
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    var browserMM = window.gBrowser.selectedBrowser.messageManager;
    browserMM.sendAsyncMessage("easyGesturesN@ngdeleito.eu:showMenu", {
      easyGesturesID: this.easyGesturesID,
      centerX: this.centerX,
      centerY: this.centerY,
      numberOfMainMenus: this.numberOfMainMenus,
      numberOfExtraMenus: this.numberOfExtraMenus,
      isExtraMenu: layout.isExtraMenu,
      layoutName: layoutName,
      iconSize: this.iconSize,
      outerRadius: layout.outerR,
      innerRadius: layout.innerR,
      actions: layout.actions,
      startingAngle: layout.startingAngle,
      loadURLActionPrefs: this.loadURLActionPrefs,
      runScriptActionPrefs: this.runScriptActionPrefs,
      smallMenuTag: this.smallMenuTag,
      noIcons: this.noIcons,
      halfAngleForSector: layout.halfAngleForSector,
      menuImage: layout.menuImage,
      menuOpacity: this.menuOpacity,
      showLinkSign: this.handleLinks && this.anchorElementExists &&
                    this.isJustOpened() && layoutName === "main",
      linksDelay: this.linksDelay
    });
    
    this.curLayoutName = layoutName;
    layout.actions.forEach(function(actionName, actionSector) {
      eGActions[actionName].setActionStatusOn(layoutName, actionSector);
    });
    layout.updateMenuSign(browserMM);
    this.resetTooltipsTimeout();
  },
  
  showMenuTooltips : function() {
    var layout = this.menuSet[this.curLayoutName];
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    var browserMM = window.gBrowser.selectedBrowser.messageManager;
    
    browserMM.sendAsyncMessage("easyGesturesN@ngdeleito.eu:showMenuTooltips", {
      layoutName: layout.name,
      tooltips: layout.labels,
      hasExtraMenuAction: layout.hasExtraMenuAction
    });
    this.showingTooltips = true;
  },
  
  handleMousemove : function(aMessageData) {
    var layout = this.menuSet[this.curLayoutName];
    
    // state change if was dragged
    if (this.isJustOpened() && (aMessageData.movementX !== 0 || aMessageData.movementY !== 0)) {
      this.setJustOpenedAndMouseMoved();
    }
    
    // identifying current sector
    var sector = -1;
    var refX = this.centerX;
    var refY = this.centerY;
    if (layout.isExtraMenu) {
      refY -= this.menuSet[this.baseMenu].outerR * 1.2;
    }
    var radius = Math.sqrt((aMessageData.clientX - refX) * (aMessageData.clientX - refX) +
                           (aMessageData.clientY - refY) * (aMessageData.clientY - refY));
    
    if (radius > layout.innerR) {
      var angle = Math.atan2(refY - aMessageData.clientY, aMessageData.clientX - refX) + layout.sectorOffset;
      if (angle < 0) {
        angle += 2 * Math.PI;
      }
      sector = Math.floor(angle / (2 * layout.halfAngleForSector));
    }
    
    // moving menu when shift key is down
    if (!this.moveAuto && aMessageData.shiftKey ||
        this.moveAuto && radius >= layout.outerR && sector < layout.actions.length &&
                         !eGActions[layout.actions[sector]].isExtraMenuAction) {
      this.centerX += aMessageData.movementX;
      this.centerY += aMessageData.movementY;
      
      return {
        centerX: this.centerX,
        centerY: this.centerY
      };
    }
    
    var result = {
      oldSector: this.sector,
      newSector: sector,
      layoutName: layout.name,
      actionsLength: layout.actions.length,
      showExtraMenu: false,
      hideExtraMenu: false
    };
    this.sector = sector;
    
    // switching to/from extra menu
    if (radius > 3*layout.outerR) {
      if (!this.isJustOpenedAndMouseMoved()) {
        this.close();
      }
    }
    else if (radius > layout.outerR && sector === this.extraMenuAction &&
             eGActions[layout.actions[sector]].isExtraMenuAction) {
      result.showExtraMenu = true;
      this.baseMenu = this.curLayoutName; // base menu from which extra menu is called
      this.show("extra");
    }
    else if (layout.isExtraMenu && sector > 4) {
      result.hideExtraMenu = true;
      result.baseLayoutName = this.baseMenu;
      this.curLayoutName = this.baseMenu;
      this.resetTooltipsTimeout();
    }
    
    return result;
  },
  
  runAction : function() {
    var layout = this.menuSet[this.curLayoutName];
    
    if (!eGActions[layout.actions[this.sector]].isDisabled()) {
      layout.updateStatsForActionToBeExecuted();
      
      try {
        // upon calling run, the pie menu is closed first (except for the
        // showExtraMenu action)
        eGActions[layout.actions[this.sector]].run();
      }
      catch(ex) {
        var error = Components.classes["@mozilla.org/scripterror;1"]
                              .createInstance(Components.interfaces.nsIScriptError);
        error.init("easyGestures N exception: " + ex.toString(), null, null, null, null, error.errorFlag, null);
        Services.console.logMessage(error);
      }
    }
    else {
      this.close();
    }
  },
  
  switchLayout : function() { // this is not about switching to/from extra menu
    var layout = this.menuSet[this.curLayoutName];
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    var browserMM = window.gBrowser.selectedBrowser.messageManager;
    
    browserMM.sendAsyncMessage("easyGesturesN@ngdeleito.eu:handleHideLayout", {
      layoutName: layout.name,
      sector: this.sector,
      layoutActionsLength: layout.actions.length,
      baseLayoutName: this.baseMenu
    });
    this.show(layout.getNextLayout());
  },

  close : function() {
    var layout = this.menuSet[this.curLayoutName];
    var baseLayout = this.menuSet[this.baseMenu];
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    var browserMM = window.gBrowser.selectedBrowser.messageManager;
    
    browserMM.sendAsyncMessage("easyGesturesN@ngdeleito.eu:close", {
      layoutName: layout.name,
      sector: this.sector,
      layoutActionsLength: layout.actions.length,
      baseLayoutName: this.baseMenu,
      layoutIsExtraMenu: layout.isExtraMenu,
      baseLayoutActionsLength: baseLayout !== undefined ? baseLayout.actions.length : 0
    });
    
    this.setHidden();
    this.sector = -1;
    this.baseMenu = "";
    
    if (this.showTooltips) {
      window.clearTimeout(this.tooltipsTrigger);
      this.showingTooltips = false;
    }
    
    browserMM.sendAsyncMessage("easyGesturesN@ngdeleito.eu:removeMousemoveListener");
    
    eGPrefs.incrementStatsMenuShownPref();

    // re-enable counting clicks inside window
    window.addEventListener("mousedown", eG_countClicks, false);
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
  
  canBeOpened : function(button, shiftKey, ctrlKey) {
    return button === this.showButton &&
           ((this.showKey === 0 && eGc.keyPressed === 0) ||
            (this.showKey === 16 && shiftKey) ||
            (this.showKey === 17 && ctrlKey)) &&
           (this.preventOpenKey === 0 || eGc.keyPressed !== this.preventOpenKey);
  },
  
  canLayoutBeSwitched : function(aButtonPressed) {
    return aButtonPressed === this.showAltButton &&
           (this.showAltButton !== this.showButton ||
            this.showAltButton === this.showButton && this.sector === -1);
  },
  
  canContextualMenuBeOpened : function(aKeyPressed) {
    var rightKey = this.contextKey !== 0 && aKeyPressed === this.contextKey;
    return (!this.contextShowAuto && rightKey) ||
           (this.contextShowAuto && !rightKey);
  },
  
  openLinkThroughPieMenuCenter : function(linkSignIsVisible, clickedButton) {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    
    if (linkSignIsVisible) {
      // if a link is clicked without dragging and related option is checked
      // note: after a short delay linkSign is hidden to cancel opening of link and keep menu open after a short wait on link without moving mouse
      if (this.handleLinksAsOpenLink) {
        eGActions.openLink.run();
      }
      else {
        // when option "use browser behavior" is checked to open links
        // middle clicking on a link through eG must display the link in a new tab or new window according to corresponding Firefox pref.
        if (clickedButton === 1) {
          // middle click
          if (Services.prefs.getBoolPref("browser.tabs.opentabfor.middleclick")) {
            window.gBrowser.addTab(this.anchorElementHREF);
          }
          else {
            window.open(this.anchorElementHREF);
          }
        }
        else {
          window.gBrowser.loadURI(this.anchorElementHREF);
        }
      }
      this.close();
    }
  },
  
  removeFromAllPages : function() {
    Services.mm.broadcastAsyncMessage("easyGesturesN@ngdeleito.eu:removeMenu");
  }
};
