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


/* global browser, updateMenuSign, eGContext, updateContextualMenuSign,
          document, showMenu, showMenuTooltips, targetWindow, topmostWindow,
          mousedownScreenX, mouseupScreenX, mousedownScreenY, mouseupScreenY,
          imageElement, handleHideLayout, close, window */

function MenuLayout(menu, name, number, nextMenuLayout, actionsPrefs) {
  this._pieMenu = menu;
  this.name = name; // "main", "mainAlt1", "mainAlt2", "extra".  "extraAlt1",  "extraAlt2", "contextLink", "contextImage",  "contextSelection", "contextTextbox"
  this._layoutNumber = number;
  this._nextMenuLayout = nextMenuLayout;
  this.isExtraMenu = false;
  this.isLarge = menu.settings.largeMenu;
  
  if (!this.isLarge) {
    // removing actions intended for large menus
    actionsPrefs.splice(9, 1);
    actionsPrefs.splice(5, 1);
  }
  this.actions = actionsPrefs;
  browser.runtime.sendMessage({
    messageName: "getTooltipLabels",
    actions: this.actions
  }).then(aMessage => {
    this.labels = aMessage.response;
  });
  
  // half the angle reserved for a sector (in radians)
  this.halfAngleForSector = Math.PI / this.actions.length;
  this.startingAngle = this.isLarge ? this.halfAngleForSector : 0;
  this.sectorOffset = this.isLarge ? 0 : this.halfAngleForSector;
  
  browser.runtime.sendMessage({
    messageName: "isExtraMenuAction",
    actionName: this.actions[menu.extraMenuAction]
  }).then(aMessage => {
    this.hasExtraMenuAction = aMessage.response;
  });
  
  ///////////////////////////////////////////////////////////////////////////////////////////////
  //  setting dimensions and positioning
  ///////////////////////////////////////////////////////////////////////////////////////////////
  
  var zoom = menu.settings.smallIcons ? 0.625:1;
  
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
  browser.runtime.sendMessage({
    messageName: "updateStatsForActionToBeExecuted",
    type: "main",
    position: this._layoutNumber * 10 + sector8To10,
    actionName: this.actions[sector]
  });
};
MenuLayout.prototype._updateMenuSign = function(menuSign, numberOfMenus) {
  var layoutNumber = Math.min(this._layoutNumber, numberOfMenus - 1);
  var previousLayoutNumber = (((layoutNumber - 1) % numberOfMenus) +
                              numberOfMenus) % numberOfMenus;
  previousLayoutNumber = Math.min(previousLayoutNumber, numberOfMenus - 1);
  
  updateMenuSign({
    menuSign: menuSign,
    layoutNumber: layoutNumber,
    previousLayoutNumber: previousLayoutNumber
  });
};
MenuLayout.prototype.updateMenuSign = function() {
  this._updateMenuSign(1, this._pieMenu.numberOfMainMenus);
};

function ExtraMenuLayout(menu, name, number, nextMenuLayout, actionsPrefs) {
  MenuLayout.call(this, menu, name, number, nextMenuLayout, actionsPrefs);
  
  this.isExtraMenu = true;
  this.isLarge = false; // extra menus are never large
  
  this.halfAngleForSector = Math.PI / 8;
  this.startingAngle = 0;
  this.sectorOffset = this.halfAngleForSector;
}
ExtraMenuLayout.prototype = Object.create(MenuLayout.prototype);
ExtraMenuLayout.prototype.constructor = ExtraMenuLayout;
ExtraMenuLayout.prototype.updateStatsForActionToBeExecuted = function() {
  var sector = this._pieMenu.sector;
  browser.runtime.sendMessage({
    messageName: "updateStatsForActionToBeExecuted",
    type: "extra",
    position: this._layoutNumber * 5 + sector,
    actionName: this.actions[sector]
  });
};
ExtraMenuLayout.prototype.updateMenuSign = function() {
  this._updateMenuSign(2, this._pieMenu.numberOfExtraMenus);
};

function ContextualMenuLayout(menu, name, actionsPrefs) {
  MenuLayout.call(this, menu, name, 0, null, actionsPrefs);
  browser.runtime.sendMessage({
    messageName: "getContextualMenuLocalizedName",
    contextualMenuName: this.name
  }).then(aMessage => {
    this.localizedName = aMessage.response;
  });
}
ContextualMenuLayout.prototype = Object.create(MenuLayout.prototype);
ContextualMenuLayout.prototype.constructor = ContextualMenuLayout;
ContextualMenuLayout.prototype.getNextLayout = function() {
  return eGContext.contextualMenus[
    (eGContext.contextualMenus.indexOf(this.name) + 1) %
      eGContext.contextualMenus.length];
};
ContextualMenuLayout.prototype.updateStatsForActionToBeExecuted = function() {
  browser.runtime.sendMessage({
    messageName: "updateStatsForActionToBeExecuted",
    type: "contextual",
    actionName: this.actions[this._pieMenu.sector]
  });
};
ContextualMenuLayout.prototype.updateMenuSign = function() {
  updateContextualMenuSign({
    layoutLabel: this.localizedName,
    moreThanOneLayout: eGContext.contextualMenus.length > 1
  });
};

var eGPieMenu = {
  settings: {},
  
  init : function() {
    this.numberOfMainMenus = 1 +
      ((this.settings.mainAlt1MenuEnabled || this.settings.mainAlt2MenuEnabled) ? 1 : 0) +
      ((this.settings.mainAlt1MenuEnabled && this.settings.mainAlt2MenuEnabled) ? 1 : 0);
    
    this.numberOfExtraMenus = 1 +
      ((this.settings.extraAlt1MenuEnabled || this.settings.extraAlt2MenuEnabled) ? 1 : 0) +
      ((this.settings.extraAlt1MenuEnabled && this.settings.extraAlt2MenuEnabled) ? 1 : 0);
    
    // initializing properties
    this.easyGesturesID = "easyGesturesPieMenu_" +
                          (this.settings.largeMenu ? "l" : "n") +
                          (this.settings.smallIcons ? "s": "n");
    
    this.curLayoutName = "main";
    this.baseMenu = ""; // is the menu from which extra menu is called: main, mainAlt1 or mainAlt2
    this.setHidden();
    
    // coordinates of the pie menu center (relative to the viewport)
    this.centerX = 0;
    this.centerY = 0;
    
    this.sector = -1; // index of item under mouse
    
    this.tooltipsTrigger = null; // trigger to display pie menu labels
    
    this.extraMenuAction = 2; // position of extra menu action in base menu from which extra menu is called
    
    this.iconSize = this.settings.smallIcons? 20 : 32;
    
    this.showingTooltips = false; // tooltips are showing or hidden
    
    // final initializations
    
    this.menuSet = { // contains main, extra, alternatives and contextual menu layouts objects
      main: new MenuLayout(this, "main", 0,
                           this.settings.mainAlt1MenuEnabled ? "mainAlt1" :
                             (this.settings.mainAlt2MenuEnabled ? "mainAlt2" : "main"),
                           this.settings.menusMain.split("/")),
      
      mainAlt1: new MenuLayout(this, "mainAlt1", 1,
                               this.settings.mainAlt2MenuEnabled ? "mainAlt2" : "main",
                               this.settings.menusMainAlt1.split("/")),
      
      mainAlt2: new MenuLayout(this, "mainAlt2", 2, "main",
                               this.settings.menusMainAlt2.split("/")),
      
      extra: new ExtraMenuLayout(this, "extra", 0,
                                 this.settings.extraAlt1MenuEnabled ? "extraAlt1" :
                                   (this.settings.extraAlt2MenuEnabled ? "extraAlt2" : "extra"),
                                 this.settings.menusExtra.split("/")),
      
      extraAlt1: new ExtraMenuLayout(this, "extraAlt1", 1,
                                     this.settings.extraAlt2MenuEnabled ? "extraAlt2" : "extra",
                                     this.settings.menusExtraAlt1.split("/")),
      
      extraAlt2: new ExtraMenuLayout(this, "extraAlt2", 2, "extra",
                                     this.settings.menusExtraAlt2.split("/")),
      
      contextLink: new ContextualMenuLayout(this, "contextLink",
                                            this.settings.menusContextLink.split("/")),
      
      contextImage: new ContextualMenuLayout(this, "contextImage",
                                             this.settings.menusContextImage.split("/")),
      
      contextSelection: new ContextualMenuLayout(this, "contextSelection",
                                                 this.settings.menusContextSelection.split("/")),
      
      contextTextbox: new ContextualMenuLayout(this, "contextTextbox",
                                               this.settings.menusContextTextbox.split("/"))
    };
  },
  
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
  
  _setActionStatusHelper : function(layoutName, actionSector, disabled) {
    var actionsNode = document.getElementById("eG_actions_" + layoutName);
    var actionNode = actionsNode.childNodes[actionSector];
    if (disabled) {
      actionNode.classList.add("disabled");
    }
    else {
      actionNode.classList.remove("disabled");
    }
  },
  
  setActionStatus : function(aMessage) {
    this._setActionStatusHelper(aMessage.layoutName, aMessage.actionSector,
                                aMessage.status);
  },
  
  setReloadActionStatus : function(aMessage) {
    var actionsNode = document.getElementById("eG_actions_" + aMessage.layoutName);
    var actionNode = actionsNode.childNodes[aMessage.actionSector];
    actionNode.classList.toggle("stop", aMessage.status);
    actionNode.classList.toggle("reload", !aMessage.status);
  },
  
  setHideImagesActionStatus : function(aMessage) {
    var disabled = document.querySelectorAll("img").length === 0;
    this._setActionStatusHelper(aMessage.layoutName, aMessage.actionSector,
                                disabled);
  },
  
  show : function(layoutName) { // makes menu visible
    var layout = this.menuSet[layoutName];
    
    if (this.isHidden()) {
      this.setJustOpened();
    }
    
    showMenu({
      easyGesturesID: this.easyGesturesID,
      menuOpacity: this.settings.menuOpacity,
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
      loadURLActionPrefs: this.settings.loadURLActionPrefs,
      runScriptActionPrefs: this.settings.runScriptActionPrefs,
      halfAngleForSector: layout.halfAngleForSector,
      showLinkSign: this.settings.handleLinks && eGContext.anchorElementExists &&
                    this.isJustOpened() && layoutName === "main",
      linksDelay: this.settings.linksDelay
    });
    
    this.curLayoutName = layoutName;
    layout.actions.forEach(function(actionName, actionSector) {
      browser.runtime.sendMessage({
        messageName: "setActionsStatusOn",
        actionName: actionName,
        layoutName: layoutName,
        actionSector: actionSector
      }).then(aMessage => {
        if (aMessage.response !== undefined) {
          eGPieMenu[aMessage.response.messageName](aMessage.response);
        }
      });
    });
    layout.updateMenuSign();
    this.resetTooltipsTimeout();
  },
  
  showMenuTooltips : function() {
    var layout = this.menuSet[this.curLayoutName];
    
    showMenuTooltips({
      easyGesturesID: this.easyGesturesID,
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
    var radius = Math.sqrt((aMessageData.positionX - refX) * (aMessageData.positionX - refX) +
                           (aMessageData.positionY - refY) * (aMessageData.positionY - refY));
    
    if (radius > layout.innerR) {
      var angle = Math.atan2(refY - aMessageData.positionY, aMessageData.positionX - refX) + layout.sectorOffset;
      if (angle < 0) {
        angle += 2 * Math.PI;
      }
      sector = Math.floor(angle / (2 * layout.halfAngleForSector));
    }
    
    // moving menu when shift key is down
    if (!this.settings.moveAuto && aMessageData.shiftKey ||
        this.settings.moveAuto && radius >= layout.outerR &&
          sector < layout.actions.length &&
          (sector !== this.extraMenuAction || sector === this.extraMenuAction &&
                                              !layout.hasExtraMenuAction)) {
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
             layout.hasExtraMenuAction) {
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
  
  runAction_pageTop : function() {
    if (targetWindow.scrollY !== 0) {
      targetWindow.scroll(0, 0);
    }
    else {
      topmostWindow.scroll(0, 0);
    }
  },
  
  runAction_pageBottom : function() {
    if (targetWindow.scrollY !== targetWindow.scrollMaxY) {
      targetWindow.scroll(0, targetWindow.scrollMaxY);
    }
    else {
      topmostWindow.scroll(0, topmostWindow.scrollMaxY);
    }
  },
  
  runAction_autoscrolling : function(options) {
    var useMousedownCoordinates = options.useMousedownCoordinates;
    // see chrome://global/content/browser-content.js: we simulate a middle
    // button (non cancelable) mousedown event to trigger Firefox's autoscrolling
    document.documentElement.dispatchEvent(new window.MouseEvent("mousedown", {
      view: window,
      bubbles: true,
      button: 1,
      screenX: useMousedownCoordinates ? mousedownScreenX : mouseupScreenX,
      screenY: useMousedownCoordinates ? mousedownScreenY : mouseupScreenY
    }));
  },
  
  runAction_zoomIn : function() {
    // double image size only
    var width = imageElement.style.width === "" ?
      imageElement.width * 2 + "px" :
      parseInt(imageElement.style.width, 10) * 2 + "px";
    
    var height = imageElement.style.height === "" ?
      imageElement.height * 2 + "px" :
      parseInt(imageElement.style.height, 10) * 2 + "px";
    
    imageElement.style.width = width;
    imageElement.style.height = height;
  },
  
  runAction_zoomOut : function() {
    // halve image size only
    var width = imageElement.style.width === "" ?
      imageElement.width * 0.5 + "px" :
      parseInt(imageElement.style.width, 10) * 0.5 + "px";
    
    var height = imageElement.style.height === "" ?
      imageElement.height * 0.5 + "px" :
      parseInt(imageElement.style.height, 10) * 0.5 + "px";
    
    imageElement.style.width = width;
    imageElement.style.height = height;
  },
  
  runAction_runScript: function(options) {
    eval(options.script);
  },
  
  runAction_hideImages : function() {
    var images = document.querySelectorAll("img");
    for (var i=0; i < images.length; ++i) {
      images[i].style.display = "none";
    }
  },
  
  runAction : function() {
    var layout = this.menuSet[this.curLayoutName];
    
    browser.runtime.sendMessage({
      messageName: "runAction",
      actionName: layout.actions[this.sector]
    }).then(aMessage => {
      if (aMessage.actionIsDisabled) {
        this.close();
      }
      else {
        layout.updateStatsForActionToBeExecuted();
        this.close();
        if (aMessage.runActionName !== null) {
          this["runAction_" + aMessage.runActionName](aMessage.runActionOptions);
        }
      }
    });
  },
  
  switchLayout : function() { // this is not about switching to/from extra menu
    var layout = this.menuSet[this.curLayoutName];
    
    handleHideLayout({
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
    
    close({
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
    
    if (this.settings.showTooltips) {
      window.clearTimeout(this.tooltipsTrigger);
      this.showingTooltips = false;
    }
  },
  
  resetTooltipsTimeout : function() { // setting and resetting tooltips timeout
    if (this.settings.showTooltips) {
      window.clearTimeout(this.tooltipsTrigger);
      if (this.showingTooltips || this.settings.tooltipsDelay === 0) {
        this.showMenuTooltips();
      }
      else {
        this.tooltipsTrigger = window.setTimeout(this.showMenuTooltips.bind(eGPieMenu), this.settings.tooltipsDelay);
      }
    }
  },
  
  canBeOpened : function(button, shiftKey, ctrlKey, altKey) {
    var showKey = this.settings.showKey;
    var contextKey = this.settings.contextKey;
    var preventOpenKey = this.settings.preventOpenKey;
    return button === this.settings.showButton &&
           ((showKey === 0 && !shiftKey && !ctrlKey) ||
            (showKey === 0 && contextKey === 17 && ctrlKey && !shiftKey) ||
            (showKey === 0 && contextKey === 18 && altKey && !shiftKey && !ctrlKey) ||
            (showKey === 16 && shiftKey && !ctrlKey) ||
            (showKey === 16 && shiftKey && contextKey === 17 && ctrlKey) ||
            (showKey === 17 && !shiftKey && ctrlKey)) &&
           (preventOpenKey === 0 || (preventOpenKey === 17 && !ctrlKey) ||
            (preventOpenKey === 18 && !altKey));
  },
  
  canLayoutBeSwitched : function(aButtonPressed) {
    var showAltButton = this.settings.showAltButton;
    var showButton = this.settings.showButton;
    return aButtonPressed === showAltButton &&
           (showAltButton !== showButton ||
            showAltButton === showButton && this.sector === -1);
  },
  
  canContextualMenuBeOpened : function(ctrlKey, altKey) {
    var contextKey = this.settings.contextKey;
    var contextShowAuto = this.settings.contextShowAuto;
    var rightKey = contextKey !== 0 && ((contextKey === 17 && ctrlKey) ||
                                        (contextKey === 18 && altKey));
    return (!contextShowAuto && rightKey) || (contextShowAuto && !rightKey);
  },
  
  canContextmenuBeOpened : function(shiftKey, ctrlKey, altKey) {
    var showKey = this.settings.showKey;
    var contextKey = this.settings.contextKey;
    return (this.settings.showButton === 2 /* right click */ &&
            ((showKey === 0 && !shiftKey && !ctrlKey) ||
             (showKey === 0 && contextKey === 17 && ctrlKey && !shiftKey) ||
             (showKey === 0 && contextKey === 18 && altKey && !shiftKey && !ctrlKey) ||
             (showKey === 16 && shiftKey && !ctrlKey) ||
             (showKey === 16 && shiftKey && contextKey === 17 && ctrlKey) ||
             (showKey === 17 && !shiftKey && ctrlKey))) ||
           (this.isShown() && this.settings.showAltButton === 2);
  },
  
  openLinkThroughPieMenuCenter : function(clickedButton) {
    if (this.settings.handleLinksAsOpenLink) {
      browser.runtime.sendMessage({
        messageName: "runAction",
        actionName: "openLink"
      });
    }
    else {
      // when option "use browser behavior" is checked to open links
      // middle clicking on a link through eG must display the link in a new tab or new window according to corresponding Firefox pref.
      if (clickedButton === 1) {
        // middle click
        if (this.settings.openTabForMiddleclick) {
          window.gBrowser.addTab(eGContext.anchorElementHREF);
        }
        else {
          window.open(eGContext.anchorElementHREF);
        }
      }
      else {
        window.gBrowser.loadURI(eGContext.anchorElementHREF);
      }
    }
    this.close();
  },
  
  // removeFromAllPages : function() {
  //   Services.mm.broadcastAsyncMessage("easyGesturesN@ngdeleito.eu:removeMenu");
  // }
};
