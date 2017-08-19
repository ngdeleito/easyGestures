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


/* global browser, document, contextualMenus, addEventListener,
          removeMenuEventHandler, anchorElement, window, handleMousemove,
          actionStatusSetters, actionRunners, removeEventListener */

const HTML_NAMESPACE = "http://www.w3.org/1999/xhtml";
const EXTRA_MENU_ACTION = 2; // position of the extra menu action in base menus

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
  }).then(labels => {
    this.labels = labels;
  });
  
  // half the angle reserved for a sector (in radians)
  this.halfAngleForSector = Math.PI / this.actions.length;
  this.startingAngle = this.isLarge ? this.halfAngleForSector : 0;
  this.sectorOffset = this.isLarge ? 0 : this.halfAngleForSector;
  
  browser.runtime.sendMessage({
    messageName: "isExtraMenuAction",
    actionName: this.actions[EXTRA_MENU_ACTION]
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
MenuLayout.prototype.getUpdateStatsInformation = function() {
  var sector = this._pieMenu.sector;
  var sector8To10 = sector;
  if (!this.isLarge && sector > 4) {
    sector8To10++;
  }
  return {
    incrementMethodName: "incrementStatsMainMenuPref",
    incrementIndex: this._layoutNumber * 10 + sector8To10,
    updateActionName: this.actions[sector]
  };
};
MenuLayout.prototype.showMenuSign = function() {
  var specialNodes = document.getElementById("eG_SpecialNodes");
  var mainMenusSign = specialNodes.childNodes[1];
  mainMenusSign.style.visibility = "visible";
};
MenuLayout.prototype._updateMenuSign = function(menuSign, numberOfMenus) {
  var layoutNumber = Math.min(this._layoutNumber, numberOfMenus - 1);
  var previousLayoutNumber = (((layoutNumber - 1) % numberOfMenus) +
                              numberOfMenus) % numberOfMenus;
  previousLayoutNumber = Math.min(previousLayoutNumber, numberOfMenus - 1);
  
  var specialNodes = document.getElementById("eG_SpecialNodes");
  var menusSignNode = specialNodes.childNodes[menuSign];
  
  menusSignNode.childNodes[previousLayoutNumber].removeAttribute("class");
  menusSignNode.childNodes[layoutNumber].className = "active";
};
MenuLayout.prototype.updateMenuSign = function() {
  this._updateMenuSign(1, this._pieMenu.numberOfMainMenus);
};
MenuLayout.prototype._clearMenuSign = function(menuSignNode) {
  for (let i=0; i < menuSignNode.childNodes.length; ++i) {
    menuSignNode.childNodes[i].removeAttribute("class");
  }
};
MenuLayout.prototype.hideMenuSign = function() {
  var specialNodes = document.getElementById("eG_SpecialNodes");
  var mainMenusSignNode = specialNodes.childNodes[1];
  mainMenusSignNode.style.visibility = "hidden";
  this._clearMenuSign(mainMenusSignNode);
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
ExtraMenuLayout.prototype.getUpdateStatsInformation = function() {
  var sector = this._pieMenu.sector;
  return {
    incrementMethodName: "incrementStatsExtraMenuPref",
    incrementIndex: this._layoutNumber * 5 + sector,
    updateActionName: this.actions[sector]
  };
};
ExtraMenuLayout.prototype.updateMenuSign = function() {
  this._updateMenuSign(2, this._pieMenu.numberOfExtraMenus);
};
ExtraMenuLayout.prototype.hideMenuSign = function() {
  var specialNodes = document.getElementById("eG_SpecialNodes");
  var extraMenusSignNode = specialNodes.childNodes[2];
  extraMenusSignNode.style.visibility = "hidden";
  this._clearMenuSign(extraMenusSignNode);
};

function ContextualMenuLayout(menu, name, actionsPrefs) {
  MenuLayout.call(this, menu, name, 0, null, actionsPrefs);
  this.localizedName = browser.i18n.getMessage(this.name);
}
ContextualMenuLayout.prototype = Object.create(MenuLayout.prototype);
ContextualMenuLayout.prototype.constructor = ContextualMenuLayout;
ContextualMenuLayout.prototype.getNextLayout = function() {
  return contextualMenus[(contextualMenus.indexOf(this.name) + 1) %
                         contextualMenus.length];
};
ContextualMenuLayout.prototype.getUpdateStatsInformation = function() {
  return {
    updateActionName: this.actions[this._pieMenu.sector]
  };
};
ContextualMenuLayout.prototype.showMenuSign = function() {
  var specialNodes = document.getElementById("eG_SpecialNodes");
  var contextMenuSignNode = specialNodes.childNodes[3];
  contextMenuSignNode.style.visibility = "visible";
  if (contextualMenus.length > 1) {
    contextMenuSignNode.className = "withAltSign";
  }
};
ContextualMenuLayout.prototype.updateMenuSign = function() {
  var specialNodes = document.getElementById("eG_SpecialNodes");
  var contextMenuSignNode = specialNodes.childNodes[3];
  contextMenuSignNode.textContent = this.localizedName;
};
ContextualMenuLayout.prototype.hideMenuSign = function() {
  var specialNodes = document.getElementById("eG_SpecialNodes");
  var contextMenuSignNode = specialNodes.childNodes[3];
  contextMenuSignNode.style.visibility = "hidden";
  contextMenuSignNode.removeAttribute("class");
};

var eGPieMenu = {
  settings: {},
  
  init : function() {
    this.numberOfMainMenus = 1 +
      ((this.settings.mainAlt1Enabled || this.settings.mainAlt2Enabled) ? 1 : 0) +
      ((this.settings.mainAlt1Enabled && this.settings.mainAlt2Enabled) ? 1 : 0);
    
    this.numberOfExtraMenus = 1 +
      ((this.settings.extraAlt1Enabled || this.settings.extraAlt2Enabled) ? 1 : 0) +
      ((this.settings.extraAlt1Enabled && this.settings.extraAlt2Enabled) ? 1 : 0);
    
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
    
    this.iconSize = this.settings.smallIcons? 20 : 32;
    
    this.showingTooltips = false; // tooltips are showing or hidden
    
    // final initializations
    
    this.menuSet = { // contains main, extra, alternatives and contextual menu layouts objects
      main: new MenuLayout(this, "main", 0,
                           this.settings.mainAlt1Enabled ? "mainAlt1" :
                             (this.settings.mainAlt2Enabled ? "mainAlt2" : "main"),
                           this.settings.main.split("/")),
      
      mainAlt1: new MenuLayout(this, "mainAlt1", 1,
                               this.settings.mainAlt2Enabled ? "mainAlt2" : "main",
                               this.settings.mainAlt1.split("/")),
      
      mainAlt2: new MenuLayout(this, "mainAlt2", 2, "main",
                               this.settings.mainAlt2.split("/")),
      
      extra: new ExtraMenuLayout(this, "extra", 0,
                                 this.settings.extraAlt1Enabled ? "extraAlt1" :
                                   (this.settings.extraAlt2Enabled ? "extraAlt2" : "extra"),
                                 this.settings.extra.split("/")),
      
      extraAlt1: new ExtraMenuLayout(this, "extraAlt1", 1,
                                     this.settings.extraAlt2Enabled ? "extraAlt2" : "extra",
                                     this.settings.extraAlt1.split("/")),
      
      extraAlt2: new ExtraMenuLayout(this, "extraAlt2", 2, "extra",
                                     this.settings.extraAlt2.split("/")),
      
      contextLink: new ContextualMenuLayout(this, "contextLink",
                                            this.settings.contextLink.split("/")),
      
      contextImage: new ContextualMenuLayout(this, "contextImage",
                                             this.settings.contextImage.split("/")),
      
      contextSelection: new ContextualMenuLayout(this, "contextSelection",
                                                 this.settings.contextSelection.split("/")),
      
      contextTextbox: new ContextualMenuLayout(this, "contextTextbox",
                                               this.settings.contextTextbox.split("/"))
    };
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
  
  _createEasyGesturesNode : function() {
    var easyGesturesNode = document.createElementNS(HTML_NAMESPACE, "div");
    easyGesturesNode.id = this.easyGesturesID;
    easyGesturesNode.style.opacity = this.settings.menuOpacity;
    
    addEventListener("pagehide", removeMenuEventHandler, true);
    
    return easyGesturesNode;
  },
  
  _updateMenuPosition: function(easyGesturesNode) {
    easyGesturesNode.style.left = this.centerX + "px";
    easyGesturesNode.style.top = this.centerY + "px";
  },
  
  _createSpecialNodes : function(numberOfMainMenus, numberOfExtraMenus) {
    var specialNodesNode = document.createElementNS(HTML_NAMESPACE, "div");
    specialNodesNode.id = "eG_SpecialNodes";
    
    var linkSignNode = document.createElementNS(HTML_NAMESPACE, "div");
    linkSignNode.id = "eG_linkSign";
    specialNodesNode.appendChild(linkSignNode);
    
    var mainMenusSignNode = document.createElementNS(HTML_NAMESPACE, "div");
    mainMenusSignNode.id = "easyGesturesMainMenusSign";
    
    var i = numberOfMainMenus;
    while (i > 0) {
      let span = document.createElementNS(HTML_NAMESPACE, "span");
      mainMenusSignNode.appendChild(span);
      --i;
    }
    
    specialNodesNode.appendChild(mainMenusSignNode);
    
    var extraMenusSignNode = document.createElementNS(HTML_NAMESPACE, "div");
    extraMenusSignNode.id = "easyGesturesExtraMenusSign";
    
    i = numberOfExtraMenus;
    while (i > 0) {
      let span = document.createElementNS(HTML_NAMESPACE, "span");
      extraMenusSignNode.appendChild(span);
      --i;
    }
    
    specialNodesNode.appendChild(extraMenusSignNode);
    
    var contextMenuSignNode = document.createElementNS(HTML_NAMESPACE, "div");
    contextMenuSignNode.id = "easyGesturesContextMenuSign";
    specialNodesNode.appendChild(contextMenuSignNode);
    
    return specialNodesNode;
  },
  
  _createActionsNodes : function(layoutName, outerRadius, innerRadius,
                                 startingAngle, actions, halfAngleForSector) {
    var anActionsNode = document.createElementNS(HTML_NAMESPACE, "div");
    anActionsNode.id = "eG_actions_" + layoutName;
    
    // creating actions images
    
    var offset = outerRadius - this.iconSize / 2;
    var imageR = (outerRadius + innerRadius) / 2;
    var angle = startingAngle;
    
    actions.forEach(function(action, index) {
      let xpos = imageR * Math.cos(angle) + offset;
      let ypos = -imageR * Math.sin(angle) + offset;
      
      let anActionNode = document.createElementNS(HTML_NAMESPACE, "div");
      anActionNode.id = "eG_action_" + layoutName + "_" + index;
      anActionNode.style.left = Math.round(xpos) + "px";
      anActionNode.style.top = Math.round(ypos) + "px";
      
      let iconName = action;
      
      if (action.startsWith("loadURL")) { // new icon path for loadURL ?
        if (this.settings.loadURLActionPrefs[action][2] === "true" &&
            this.settings.loadURLActionPrefs[action][1] !== "") {
          browser.runtime.sendMessage({
            messageName: "retrieveAndAddFavicon",
            aURL: this.settings.loadURLActionPrefs[action][1]
          }).then(aMessage => {
            var faviconURL = aMessage.aURL;
            if (faviconURL === "" || (document.documentURI.startsWith("https://") &&
                                      faviconURL.startsWith("http://"))) {
              anActionNode.className = action;
            }
            else {
              anActionNode.style.backgroundImage = "url('" + faviconURL + "')";
              anActionNode.className = "customIcon";
            }
          });
        }
      }
      else if (action.startsWith("runScript")) { // new icon path for runScript?
        let iconPath = this.settings.runScriptActionPrefs[action][2];
        if (iconPath !== "" && !document.documentURI.startsWith("https://")) {
          anActionNode.style.backgroundImage =
            "url('" + iconPath.replace(/\\/g , "\\\\") + "')";
          iconName = "customIcon";
        }
      }
      
      anActionNode.className = iconName;
      anActionsNode.appendChild(anActionNode);
      angle += 2 * halfAngleForSector;
    }, this);
    
    return anActionsNode;
  },
  
  _createTooltipsNodes: function(layoutName, tooltips, hasExtraMenuAction) {
    var aTooltipsNode = document.createElementNS(HTML_NAMESPACE, "div");
    aTooltipsNode.id = "eG_labels_" + layoutName;
    
    tooltips.forEach(function(tooltip, index) {
      let aTooltipNode = document.createElementNS(HTML_NAMESPACE, "div");
      aTooltipNode.id = "eG_label_" + layoutName + "_" + index;
      aTooltipNode.classList.add("label" + index);
      aTooltipNode.appendChild(document.createTextNode(tooltip));
      aTooltipsNode.appendChild(aTooltipNode);
    });
    if (hasExtraMenuAction) {
      aTooltipsNode.childNodes[EXTRA_MENU_ACTION].classList.add("extra");
    }
    
    return aTooltipsNode;
  },
  
  _showMenuTooltips: function() {
    var layout = this.menuSet[this.curLayoutName];
    var easyGesturesNode = document.getElementById(this.easyGesturesID);
    var tooltipsNode = document.getElementById("eG_labels_" + layout.name);
    if (tooltipsNode === null) {
      tooltipsNode = this._createTooltipsNodes(layout.name, layout.labels,
                                               layout.hasExtraMenuAction);
      easyGesturesNode.appendChild(tooltipsNode);
    }
    tooltipsNode.style.visibility = "visible";
    this.showingTooltips = true;
  },
  
  _ensureMenuTooltipsAreShown: function() {
    if (this.showingTooltips) {
        this._showMenuTooltips();
    }
  },
  
  _showLayout: function(layoutName) {
    var layout = this.menuSet[layoutName];
    var actionsNode = document.getElementById("eG_actions_" + layoutName);
    if (actionsNode === null) {
      let easyGesturesNode = document.getElementById(this.easyGesturesID);
      actionsNode = this._createActionsNodes(layoutName, layout.outerR,
                                             layout.innerR,
                                             layout.startingAngle,
                                             layout.actions,
                                             layout.halfAngleForSector);
      easyGesturesNode.appendChild(actionsNode);
    }
    actionsNode.style.visibility = "visible";
    
    this.curLayoutName = layoutName;
    browser.runtime.sendMessage({
      messageName: "getActionsStatus",
      actions: layout.actions
    }).then(statusesArray => {
      statusesArray.forEach(function(response, actionSector) {
        if (response !== undefined) {
          actionStatusSetters[response.messageName](response, layoutName, actionSector);
        }
      });
    });
    layout.updateMenuSign();
    this._ensureMenuTooltipsAreShown();
  },
  
  _setTooltipsTimeout: function() {
    if (this.settings.showTooltips) {
      this.tooltipsTrigger = window.setTimeout(function() {
        eGPieMenu._showMenuTooltips();
      }, this.settings.tooltipsDelay);
    }
  },
  
  open: function(layoutName) {
    this.setJustOpened();
    
    var bodyNode = document.body ? document.body : document.documentElement;
    var easyGesturesNode = document.getElementById(this.easyGesturesID);
    if (easyGesturesNode === null) {
      easyGesturesNode = this._createEasyGesturesNode();
      bodyNode.insertBefore(easyGesturesNode, bodyNode.firstChild);
    }
    
    this._updateMenuPosition(easyGesturesNode);
    
    var specialNodes = document.getElementById("eG_SpecialNodes");
    if (specialNodes === null) {
      specialNodes = this._createSpecialNodes(this.numberOfMainMenus,
                                              this.numberOfExtraMenus);
      easyGesturesNode.appendChild(specialNodes);
    }
    
    var layout = this.menuSet[layoutName];
    layout.showMenuSign();
    this._showLayout(layoutName);
    this._setTooltipsTimeout();
    
    // showing link sign
    var linkSign = specialNodes.childNodes[0];
    if (this.settings.handleLinks && anchorElement !== null &&
        this.isJustOpened() && layoutName === "main") {
      linkSign.style.visibility = "visible";
      window.setTimeout(function() {
        linkSign.style.visibility = "hidden";
      }, this.settings.linksDelay);
    }
    else {
      linkSign.style.visibility = "hidden";
    }
    
    addEventListener("mousemove", handleMousemove, true);
  },
  
  hideLinkSign: function() {
    var specialNodes = document.getElementById("eG_SpecialNodes");
    var linkSign = specialNodes.childNodes[0];
    linkSign.style.visibility = "hidden";
  },
  
  _highlightSelectedAction: function(oldSector, newSector, layoutName) {
    var actionsNode = document.getElementById("eG_actions_" + layoutName);
    var tooltipsNode = document.getElementById("eG_labels_" + layoutName);
    
    if (oldSector >= 0) {
      actionsNode.childNodes[oldSector].classList.remove("selected");
      if (tooltipsNode !== null) {
        tooltipsNode.childNodes[oldSector].classList.remove("selected");
      }
    }
    
    if (newSector >= 0) {
      actionsNode.childNodes[newSector].classList.add("selected");
      if (tooltipsNode !== null) {
        tooltipsNode.childNodes[newSector].classList.add("selected");
      }
    }
  },
  
  _hideCurrentLayout: function() {
    var actionsNode = document.getElementById("eG_actions_" + this.curLayoutName);
    var tooltipsNode = document.getElementById("eG_labels_" + this.curLayoutName);
    var specialNodes = document.getElementById("eG_SpecialNodes");
    var linkSign = specialNodes.childNodes[0];
    
    if (actionsNode !== null) {
      actionsNode.style.visibility = "hidden";
    }
    if (tooltipsNode !== null) {
      tooltipsNode.style.visibility = "hidden";
    }
    
    linkSign.style.visibility = "hidden";
    
    if (this.sector >= 0) {
      actionsNode.childNodes[this.sector].classList.remove("selected");
      if (tooltipsNode !== null) {
        tooltipsNode.childNodes[this.sector].classList.remove("selected");
      }
    }
    
    // reset rollover for extra menu in base menu if needed
    if (this.baseMenu !== "") {
      var baseActionsNode = document.getElementById("eG_actions_" + this.baseMenu);
      var baseTooltipsNode = document.getElementById("eG_labels_" + this.baseMenu);
      baseActionsNode.childNodes[EXTRA_MENU_ACTION].classList.remove("showingExtraMenu");
      baseActionsNode.childNodes[EXTRA_MENU_ACTION].classList.remove("selected");
      if (baseTooltipsNode !== null) {
        baseTooltipsNode.childNodes[EXTRA_MENU_ACTION].classList.remove("selected");
      }
    }
  },
  
  _showExtraMenu: function() {
    this.baseMenu = this.curLayoutName;
    var actionsNode = document.getElementById("eG_actions_" + this.baseMenu);
    var specialNodes = document.getElementById("eG_SpecialNodes");
    var mainMenusSign = specialNodes.childNodes[1];
    var extraMenusSign = specialNodes.childNodes[2];
    var tooltipsNode = document.getElementById("eG_labels_" + this.baseMenu);
    
    this._showLayout("extra");
    
    actionsNode.childNodes[EXTRA_MENU_ACTION].classList.add("showingExtraMenu");
    
    mainMenusSign.style.visibility = "hidden";
    extraMenusSign.style.visibility = "visible";
    
    // hide main menu tooltips after extra menu showed
    if (tooltipsNode !== null) {
      tooltipsNode.style.visibility = "hidden";
    }
    
    browser.runtime.sendMessage({
      messageName: "incrementShowExtraMenuStats",
      incrementIndex: eGPieMenu.menuSet[this.baseMenu]._layoutNumber * 10 +
                      EXTRA_MENU_ACTION
    });
  },
  
  _hideExtraMenu: function() {
    var baseActionsNode = document.getElementById("eG_actions_" + this.baseMenu);
    var specialNodes = document.getElementById("eG_SpecialNodes");
    var mainMenusSign = specialNodes.childNodes[1];
    var extraMenusSign = specialNodes.childNodes[2];
    
    // reset rollover of extra menu action icon in main menu
    baseActionsNode.childNodes[EXTRA_MENU_ACTION].classList.remove("showingExtraMenu");
    
    this._hideCurrentLayout();
    
    mainMenusSign.style.visibility = "visible";
    extraMenusSign.style.visibility = "hidden";
    
    this.curLayoutName = this.baseMenu;
    this._ensureMenuTooltipsAreShown();
  },
  
  handleMousemove : function(positionX, positionY, shiftKey, movementX, movementY) {
    var layout = this.menuSet[this.curLayoutName];
    var shouldExtraMenuBeHidden = false;
    
    this.hideLinkSign();
    
    // state change if was dragged
    if (this.isJustOpened() && (movementX !== 0 || movementY !== 0)) {
      this.setJustOpenedAndMouseMoved();
    }
    
    // identifying current sector
    var sector = -1;
    var refX = this.centerX;
    var refY = this.centerY;
    if (layout.isExtraMenu) {
      refY -= this.menuSet[this.baseMenu].outerR * 1.2;
    }
    var radius = Math.sqrt((positionX - refX) * (positionX - refX) +
                           (positionY - refY) * (positionY - refY));
    
    if (radius > layout.innerR) {
      var angle = Math.atan2(refY - positionY, positionX - refX) + layout.sectorOffset;
      if (angle < 0) {
        angle += 2 * Math.PI;
      }
      sector = Math.floor(angle / (2 * layout.halfAngleForSector));
    }
    if (sector >= layout.actions.length) {
      shouldExtraMenuBeHidden = true;
      sector = -1;
    }
    
    // moving menu when shift key is down
    if (!this.settings.moveAuto && shiftKey ||
        this.settings.moveAuto && radius >= layout.outerR &&
          (sector !== EXTRA_MENU_ACTION || sector === EXTRA_MENU_ACTION &&
                                           !layout.hasExtraMenuAction)) {
      this.centerX += movementX;
      this.centerY += movementY;
      let easyGesturesNode = document.getElementById(this.easyGesturesID);
      this._updateMenuPosition(easyGesturesNode);
      return ;
    }
    
    if (this.sector !== sector) {
      this._highlightSelectedAction(this.sector, sector, layout.name);
    }
    this.sector = sector;
    
    // switching to/from extra menu
    if (radius > 3*layout.outerR) {
      if (!this.isJustOpenedAndMouseMoved()) {
        this.close();
      }
    }
    else if (radius > layout.outerR && sector === EXTRA_MENU_ACTION &&
             layout.hasExtraMenuAction) {
      this._showExtraMenu();
    }
    else if (shouldExtraMenuBeHidden) {
      this._hideExtraMenu();
    }
  },
  
  runAction : function() {
    var actionsNode = document.getElementById("eG_actions_" + this.curLayoutName);
    var actionNode = actionsNode.childNodes[this.sector];
    var layout = this.menuSet[this.curLayoutName];
    
    if (actionNode.classList.contains("disabled")) {
      this.close();
    }
    else {
      let runActionMessage = {
        messageName: "runAction",
        actionName: layout.actions[this.sector],
        updateStatsInformation: layout.getUpdateStatsInformation()
      };
      this.close();
      browser.runtime.sendMessage(runActionMessage).then(aMessage => {
        if (aMessage.runActionName !== undefined) {
          actionRunners[aMessage.runActionName](aMessage.runActionOptions);
        }
      });
    }
  },
  
  switchLayout : function() { // this is not about switching to/from extra menu
    var layout = this.menuSet[this.curLayoutName];
    this._hideCurrentLayout();
    this._showLayout(layout.getNextLayout());
  },
  
  close : function() {
    var layout = this.menuSet[this.curLayoutName];
    
    this._hideCurrentLayout();
    layout.hideMenuSign();
    if (layout.isExtraMenu) {
      // hide base menu too if closing is done from extra menu
      this.curLayoutName = this.baseMenu;
      layout = this.menuSet[this.curLayoutName];
      this._hideCurrentLayout();
      layout.hideMenuSign();
    }
    
    removeEventListener("mousemove", handleMousemove, true);
    
    this.setHidden();
    this.sector = -1;
    this.baseMenu = "";
    
    if (this.settings.showTooltips) {
      window.clearTimeout(this.tooltipsTrigger);
      this.showingTooltips = false;
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
      let messageName = clickedButton === 1 ? "loadURLInNewNonActiveTab" :
                                              "loadURLInCurrentTab";
      browser.runtime.sendMessage({
        messageName: messageName,
        url: anchorElement.href
      });
    }
    this.close();
  }
};
