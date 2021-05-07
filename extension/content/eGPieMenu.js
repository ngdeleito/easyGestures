/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

/* The current maintainer of this file (ngdeleito) suspects that the original
   version of some code excerpts might be by Jens Tinz, Copyright (C) 2002. All
   Rights Reserved. The excerpts are explicitly marked where they occur in this
   file. */

/* global browser, contextualMenus, document, addEventListener,
          removeMenuEventHandler, actionStatusSetters, window, handleMousemove,
          context, actionRunners, removeEventListener */

"use strict";

const EXTRA_MENU_SECTOR = 2; // position of the extra menu action in base menus
const HTML_NAMESPACE = "http://www.w3.org/1999/xhtml";
const ACTIONS_NODE_ID_PREFIX = "easyGesturesActionsNode:";
const EXTRA_NODE_CLASS_NAME = "easyGesturesExtraNode";
const TOOLTIPS_NODE_ID_PREFIX = "easyGesturesTooltipsNode:";

class MenuLayout {
  constructor(menu, name, number, nextMenuLayout, actionsPrefs) {
    this._pieMenu = menu;
    this.name = name; // "main", "mainAlt1", "mainAlt2", "extra".  "extraAlt1",
      // "extraAlt2", "contextLink", "contextImage",  "contextSelection",
      // "contextTextbox"
    this.layoutNumber = number;
    this._nextMenuLayout = nextMenuLayout;
    this.isExtraMenu = false;
    this._isLarge = menu.settings.largeMenu;
    
    if (!this._isLarge) {
      // removing actions intended for large menus
      actionsPrefs.splice(9, 1);
      actionsPrefs.splice(5, 1);
    }
    this.actions = actionsPrefs;
    browser.runtime.sendMessage({
      messageName: "getTooltips",
      actions: this.actions
    }).then(tooltips => this.tooltips = tooltips);
    
    // half the angle reserved for a sector (in radians)
    this.halfAngleForSector = Math.PI / this.actions.length;
    this.sectorOffset = this._isLarge ? 0 : this.halfAngleForSector;
    
    this._menuSignNodeIndex = 1;
    
    browser.runtime.sendMessage({
      messageName: "isExtraMenuAction",
      actionName: this.actions[EXTRA_MENU_SECTOR]
    }).then(aMessage => this.hasExtraMenuAction = aMessage.response);
  }
  
  getNextLayout() {
    return this._nextMenuLayout;
  }
  
  getUsageInformationUpdate() {
    let sector = this._pieMenu.sector;
    let sector8To10 = sector;
    if (!this._isLarge && sector > 4) {
      sector8To10++;
    }
    return {
      incrementMethodName: "incrementUsageMainMenuPref",
      incrementIndex: this.layoutNumber * 10 + sector8To10,
      updateActionName: this.actions[sector]
    };
  }
  
  _getMenuSignNode() {
    return this._pieMenu.specialNodesNode.childNodes[this._menuSignNodeIndex];
  }
  
  _showMenuSign() {
    let menuSignNode = this._getMenuSignNode();
    menuSignNode.style.visibility = "visible";
    return menuSignNode;
  }
  
  showMenuSign() {
    this._showMenuSign();
  }
  
  _updateMenuSign(menuSign, numberOfMenus) {
    let layoutNumber = Math.min(this.layoutNumber, numberOfMenus - 1);
    let previousLayoutNumber = (((layoutNumber - 1) % numberOfMenus) +
                                numberOfMenus) % numberOfMenus;
    previousLayoutNumber = Math.min(previousLayoutNumber, numberOfMenus - 1);
    
    let menusSignNode = this._pieMenu.specialNodesNode.childNodes[menuSign];
    
    menusSignNode.childNodes[previousLayoutNumber].removeAttribute("class");
    menusSignNode.childNodes[layoutNumber].className = "active";
  }
  
  updateMenuSign() {
    this._updateMenuSign(1, this._pieMenu.numberOfMainMenus);
  }
  
  _clearMenuSign(menuSignNode) {
    for (let i=0; i < menuSignNode.childNodes.length; ++i) {
      menuSignNode.childNodes[i].removeAttribute("class");
    }
  }
  
  hideMenuSign() {
    let mainMenusSignNode = this._pieMenu.specialNodesNode.childNodes[1];
    mainMenusSignNode.style.visibility = "hidden";
    this._clearMenuSign(mainMenusSignNode);
  }
}

class ExtraMenuLayout extends MenuLayout {
  constructor(menu, name, number, nextMenuLayout, actionsPrefs) {
    super(menu, name, number, nextMenuLayout, actionsPrefs);
    
    this.isExtraMenu = true;
    this._isLarge = false; // extra menus are never large
    
    this.halfAngleForSector = Math.PI / 8;
    this.sectorOffset = this.halfAngleForSector;
    
    this._menuSignNodeIndex = 2;
  }
  
  getUsageInformationUpdate() {
    let sector = this._pieMenu.sector;
    return {
      incrementMethodName: "incrementUsageExtraMenuPref",
      incrementIndex: this.layoutNumber * 5 + sector,
      updateActionName: this.actions[sector]
    };
  }
  
  updateMenuSign() {
    this._updateMenuSign(2, this._pieMenu.numberOfExtraMenus);
  }
  
  hideMenuSign() {
    let extraMenusSignNode = this._pieMenu.specialNodesNode.childNodes[2];
    extraMenusSignNode.style.visibility = "hidden";
    this._clearMenuSign(extraMenusSignNode);
  }
}

class ContextualMenuLayout extends MenuLayout {
  constructor(menu, name, actionsPrefs) {
    super(menu, name, 0, null, actionsPrefs);
    this._localizedName = browser.i18n.getMessage(this.name);
    
    this._menuSignNodeIndex = 3;
  }
  
  getNextLayout() {
    return contextualMenus[(contextualMenus.indexOf(this.name) + 1) %
                           contextualMenus.length];
  }
  
  getUsageInformationUpdate() {
    return {
      incrementMethodName: "incrementNoUsage",
      incrementIndex: undefined,
      updateActionName: this.actions[this._pieMenu.sector]
    };
  }
  
  showMenuSign() {
    let contextMenuSignNode = this._showMenuSign();
    if (contextualMenus.length > 1) {
      contextMenuSignNode.className = "withAltSign";
    }
  }
  
  updateMenuSign() {
    let contextMenuSignNode = this._pieMenu.specialNodesNode.childNodes[3];
    contextMenuSignNode.textContent = this._localizedName;
  }
  
  hideMenuSign() {
    let contextMenuSignNode = this._pieMenu.specialNodesNode.childNodes[3];
    contextMenuSignNode.style.visibility = "hidden";
    contextMenuSignNode.removeAttribute("class");
  }
}

let eGPieMenu = {
  settings: {},
  easyGesturesNode: null,
  
  init() {
    this._scaleFactor = this.settings.smallIcons ? 0.625 : 1;
    this._outerRadius = Math.round((this.settings.largeMenu ? 70 : 61) * this._scaleFactor);
    this._innerRadius = Math.round((this.settings.largeMenu ? 36 : 26) * this._scaleFactor);
    
    this.numberOfMainMenus = 1 +
      ((this.settings.mainAlt1Enabled || this.settings.mainAlt2Enabled) ? 1 : 0) +
      ((this.settings.mainAlt1Enabled && this.settings.mainAlt2Enabled) ? 1 : 0);
    
    this.numberOfExtraMenus = 1 +
      ((this.settings.extraAlt1Enabled || this.settings.extraAlt2Enabled) ? 1 : 0) +
      ((this.settings.extraAlt1Enabled && this.settings.extraAlt2Enabled) ? 1 : 0);
    
    // coordinates of the pie menu center (relative to the viewport)
    this.centerX = 0;
    this.centerY = 0;
    
    this._currentLayout = null;
    this._baseLayout = null;
    this.sector = -1; // index of the action under the mouse pointer
    this.setHidden();
    
    this._tooltipsTimeoutID = null;
    this._showingTooltips = false; // indicates whether tooltips are being shown
    
    this._layouts = {
      main: new MenuLayout(this, "main", 0,
                           this.settings.mainAlt1Enabled ? "mainAlt1" :
                             (this.settings.mainAlt2Enabled ? "mainAlt2" : "main"),
                           this.settings.main),
      
      mainAlt1: new MenuLayout(this, "mainAlt1", 1,
                               this.settings.mainAlt2Enabled ? "mainAlt2" : "main",
                               this.settings.mainAlt1),
      
      mainAlt2: new MenuLayout(this, "mainAlt2", 2, "main",
                               this.settings.mainAlt2),
      
      extra: new ExtraMenuLayout(this, "extra", 0,
                                 this.settings.extraAlt1Enabled ? "extraAlt1" :
                                   (this.settings.extraAlt2Enabled ? "extraAlt2" : "extra"),
                                 this.settings.extra),
      
      extraAlt1: new ExtraMenuLayout(this, "extraAlt1", 1,
                                     this.settings.extraAlt2Enabled ? "extraAlt2" : "extra",
                                     this.settings.extraAlt1),
      
      extraAlt2: new ExtraMenuLayout(this, "extraAlt2", 2, "extra",
                                     this.settings.extraAlt2),
      
      contextLink: new ContextualMenuLayout(this, "contextLink",
                                            this.settings.contextLink),
      
      contextImage: new ContextualMenuLayout(this, "contextImage",
                                             this.settings.contextImage),
      
      contextSelection: new ContextualMenuLayout(this, "contextSelection",
                                                 this.settings.contextSelection),
      
      contextTextbox: new ContextualMenuLayout(this, "contextTextbox",
                                               this.settings.contextTextbox)
    };
    
    this.specialNodesNode = null;
  },
  
  isShown() {
    return this._menuState !== 0;
  },
  
  setHidden() {
    this._menuState = 0;
  },
  
  isJustOpened() {
    return this._menuState === 1;
  },
  
  _setJustOpened() {
    this._menuState = 1;
  },
  
  isJustOpenedAndMouseMoved() {
    return this._menuState === 2;
  },
  
  _setJustOpenedAndMouseMoved() {
    this._menuState = 2;
  },
  
  setOpen() {
    this._menuState = 3;
  },
  
  _createEasyGesturesNode() {
    this.easyGesturesNode = document.createElementNS(HTML_NAMESPACE, "div");
    this.easyGesturesNode.id = "easyGesturesPieMenu";
    this.easyGesturesNode.classList.toggle("darkTheme", this.settings.darkTheme);
    this.easyGesturesNode.classList.toggle("large", this.settings.largeMenu);
    this.easyGesturesNode.style.setProperty("--scale-factor", this._scaleFactor);
    this.easyGesturesNode.style.opacity = this.settings.menuOpacity / 100;
    
    addEventListener("pagehide", removeMenuEventHandler, true);
  },
  
  _updateMenuPosition() {
    this.easyGesturesNode.style.left = this.centerX + "px";
    this.easyGesturesNode.style.top = this.centerY + "px";
  },
  
  _createSpecialNodes(numberOfMainMenus, numberOfExtraMenus) {
    this.specialNodesNode = document.createElementNS(HTML_NAMESPACE, "div");
    
    let linkSignNode = document.createElementNS(HTML_NAMESPACE, "div");
    linkSignNode.id = "easyGesturesLinkSign";
    this.specialNodesNode.appendChild(linkSignNode);
    
    let mainMenusSignNode = document.createElementNS(HTML_NAMESPACE, "div");
    mainMenusSignNode.id = "easyGesturesMainMenusSign";
    
    let i = numberOfMainMenus;
    while (i > 0) {
      let span = document.createElementNS(HTML_NAMESPACE, "span");
      mainMenusSignNode.appendChild(span);
      --i;
    }
    
    this.specialNodesNode.appendChild(mainMenusSignNode);
    
    let extraMenusSignNode = document.createElementNS(HTML_NAMESPACE, "div");
    extraMenusSignNode.id = "easyGesturesExtraMenusSign";
    
    i = numberOfExtraMenus;
    while (i > 0) {
      let span = document.createElementNS(HTML_NAMESPACE, "span");
      extraMenusSignNode.appendChild(span);
      --i;
    }
    
    this.specialNodesNode.appendChild(extraMenusSignNode);
    
    let contextMenuSignNode = document.createElementNS(HTML_NAMESPACE, "div");
    contextMenuSignNode.id = "easyGesturesContextMenuSign";
    this.specialNodesNode.appendChild(contextMenuSignNode);
  },
  
  _createActionsNodes(layoutName, actions) {
    let anActionsNode = document.createElementNS(HTML_NAMESPACE, "div");
    anActionsNode.id = ACTIONS_NODE_ID_PREFIX + layoutName;
    anActionsNode.className = "easyGesturesActionsNode";
    anActionsNode.classList.toggle(EXTRA_NODE_CLASS_NAME,
                                   this._currentLayout.isExtraMenu);
    
    actions.forEach((action, index) => {
      let anActionNode = document.createElementNS(HTML_NAMESPACE, "div");
      anActionNode.className = "sector" + index;
      anActionNode.classList.add(action);
      anActionsNode.appendChild(anActionNode);
    });
    
    return anActionsNode;
  },
  
  _createTooltipsNode(layoutName) {
    let aTooltipsNode = document.createElementNS(HTML_NAMESPACE, "div");
    aTooltipsNode.id = TOOLTIPS_NODE_ID_PREFIX + layoutName;
    aTooltipsNode.className = "easyGesturesTooltipsNode";
    aTooltipsNode.classList.toggle(EXTRA_NODE_CLASS_NAME,
                                   this._currentLayout.isExtraMenu);
    return aTooltipsNode;
  },
  
  _appendTooltips(tooltipsNode, tooltips, hasExtraMenuAction) {
    tooltips.forEach((tooltip, index) => {
      let aTooltipNode = document.createElementNS(HTML_NAMESPACE, "div");
      aTooltipNode.classList.add("tooltip" + index);
      let aTooltipTextNode = document.createElementNS(HTML_NAMESPACE, "span");
      aTooltipTextNode.textContent = tooltip;
      aTooltipNode.appendChild(aTooltipTextNode);
      tooltipsNode.appendChild(aTooltipNode);
      // for overflowWidth to be a meaninful value, the above nodes need to be
      // inserted in the page upfront
      let overflowWidth = aTooltipTextNode.scrollWidth -
                          aTooltipTextNode.clientWidth;
      aTooltipNode.style.setProperty("--overflow-width", overflowWidth);
    });
    if (hasExtraMenuAction) {
      tooltipsNode.childNodes[EXTRA_MENU_SECTOR].classList.add("extra");
    }
  },
  
  _showMenuTooltips() {
    let tooltipsNode = document.getElementById(TOOLTIPS_NODE_ID_PREFIX +
                                               this._currentLayout.name);
    if (tooltipsNode === null) {
      tooltipsNode = this._createTooltipsNode(this._currentLayout.name);
      this.easyGesturesNode.appendChild(tooltipsNode);
      this._appendTooltips(tooltipsNode, this._currentLayout.tooltips,
                           this._currentLayout.hasExtraMenuAction);
    }
    tooltipsNode.style.visibility = "visible";
    this._showingTooltips = true;
  },
  
  _ensureMenuTooltipsAreShown() {
    if (this._showingTooltips) {
      this._showMenuTooltips();
    }
  },
  
  _showLayout(layoutName) {
    this._currentLayout = this._layouts[layoutName];
    
    let actionsNode = document.getElementById(ACTIONS_NODE_ID_PREFIX + layoutName);
    if (actionsNode === null) {
      actionsNode = this._createActionsNodes(layoutName,
                                             this._currentLayout.actions);
      this.easyGesturesNode.appendChild(actionsNode);
    }
    actionsNode.style.visibility = "visible";
    
    browser.runtime.sendMessage({
      messageName: "getActionsStatus",
      actions: this._currentLayout.actions
    }).then(statusesArray => {
      statusesArray.forEach((response, actionSector) => {
        actionStatusSetters[response.messageName](response, layoutName, actionSector);
      });
    });
    this._currentLayout.updateMenuSign();
    this._ensureMenuTooltipsAreShown();
  },
  
  _setTooltipsTimeout() {
    if (this.settings.showTooltips) {
      this._tooltipsTimeoutID = window.setTimeout(() => {
        eGPieMenu._showMenuTooltips();
      }, this.settings.tooltipsDelay);
    }
  },
  
  _open(layoutName) {
    this._setJustOpened();
    
    let bodyNode = document.body;
    if (this.easyGesturesNode === null) {
      this._createEasyGesturesNode();
      bodyNode.insertBefore(this.easyGesturesNode, bodyNode.firstChild);
    }
    
    this._updateMenuPosition();
    
    if (this.specialNodesNode === null) {
      this._createSpecialNodes(this.numberOfMainMenus, this.numberOfExtraMenus);
      this.easyGesturesNode.appendChild(this.specialNodesNode);
    }
    
    this._showLayout(layoutName);
    this._currentLayout.showMenuSign();
    this._setTooltipsTimeout();
    
    addEventListener("mousemove", handleMousemove, true);
    if (context.frameHierarchyArray.length > 1) {
      browser.runtime.sendMessage({
        messageName: "addMousemoveListenerToFrame",
        parameters: {
          frameID: context.frameHierarchyArray[0].frameID
        }
      });
    }
  },
  
  _showLinkSign() {
    let linkSignNode = this.specialNodesNode.childNodes[0];
    if (this.settings.handleLinks && context.anchorElementExists &&
        this.isJustOpened()) {
      linkSignNode.style.visibility = "visible";
      window.setTimeout(() => linkSignNode.style.visibility = "hidden",
                        this.settings.linksDelay);
    }
  },
  
  isLinkSignVisible() {
    return this.specialNodesNode.childNodes[0].style.visibility === "visible";
  },
  
  openWithMainLayout() {
    this._open("main");
    this._showLinkSign();
  },
  
  openWithContextualLayout(layoutName) {
    this._open(layoutName);
  },
  
  _hideLinkSign() {
    let linkSignNode = this.specialNodesNode.childNodes[0];
    linkSignNode.style.visibility = "hidden";
  },
  
  _highlightSelectedAction(oldSector, newSector, layoutName) {
    let actionsNode = document.getElementById(ACTIONS_NODE_ID_PREFIX + layoutName);
    let tooltipsNode = document.getElementById(TOOLTIPS_NODE_ID_PREFIX + layoutName);
    
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
  
  _hideCurrentLayout() {
    let actionsNode = document.getElementById(ACTIONS_NODE_ID_PREFIX +
                                              this._currentLayout.name);
    let tooltipsNode = document.getElementById(TOOLTIPS_NODE_ID_PREFIX +
                                               this._currentLayout.name);
    
    if (actionsNode !== null) {
      actionsNode.style.visibility = "hidden";
    }
    if (tooltipsNode !== null) {
      tooltipsNode.style.visibility = "hidden";
    }
    this._hideLinkSign();
    
    if (this.sector >= 0) {
      actionsNode.childNodes[this.sector].classList.remove("selected");
      if (tooltipsNode !== null) {
        tooltipsNode.childNodes[this.sector].classList.remove("selected");
      }
    }
  },
  
  _showExtraMenu() {
    let baseActionsNode = document.getElementById(ACTIONS_NODE_ID_PREFIX +
                                                  this._currentLayout.name);
    let baseTooltipsNode = document.getElementById(TOOLTIPS_NODE_ID_PREFIX +
                                                   this._currentLayout.name);
    
    this._baseLayout = this._currentLayout;
    this._currentLayout.hideMenuSign();
    this._showLayout("extra");
    this._currentLayout.showMenuSign();
    baseActionsNode.childNodes[EXTRA_MENU_SECTOR].classList.add("showingExtraMenu");
    
    // hide main menu tooltips after extra menu showed
    if (baseTooltipsNode !== null) {
      baseTooltipsNode.style.visibility = "hidden";
    }
    
    browser.runtime.sendMessage({
      messageName: "incrementShowExtraMenuUsage",
      incrementIndex: this._baseLayout.layoutNumber * 10 + EXTRA_MENU_SECTOR
    });
  },
  
  _hideExtraMenu() {
    let baseActionsNode = document.getElementById(ACTIONS_NODE_ID_PREFIX +
                                                  this._baseLayout.name);
    let baseTooltipsNode = document.getElementById(TOOLTIPS_NODE_ID_PREFIX +
                                                   this._baseLayout.name);
    
    this._hideCurrentLayout();
    this._currentLayout.hideMenuSign();
    
    baseActionsNode.childNodes[EXTRA_MENU_SECTOR].classList.remove("showingExtraMenu");
    baseActionsNode.childNodes[EXTRA_MENU_SECTOR].classList.remove("selected");
    if (baseTooltipsNode !== null) {
      baseTooltipsNode.childNodes[EXTRA_MENU_SECTOR].classList.remove("selected");
    }
    
    this._currentLayout = this._baseLayout;
    this._currentLayout.showMenuSign();
    this._currentLayout.updateMenuSign();
    this._ensureMenuTooltipsAreShown();
  },
  
  handleMousemove(positionX, positionY, shiftKey, movementX, movementY) {
    let shouldExtraMenuBeHidden = false;
    
    this._hideLinkSign();
    
    // the original version of the code of the remainder of this function might
    // be by Jens Tinz, Copyright (C) 2002. All Rights Reserved.
    // state change if was dragged
    if (this.isJustOpened() && (movementX !== 0 || movementY !== 0)) {
      this._setJustOpenedAndMouseMoved();
    }
    
    // identifying current sector
    let sector = -1;
    let refX = this.centerX;
    let refY = this.centerY;
    if (this._currentLayout.isExtraMenu) {
      refY -= this._outerRadius * 1.2;
    }
    let radius = Math.sqrt((positionX - refX) * (positionX - refX) +
                           (positionY - refY) * (positionY - refY));
    
    if (radius > this._innerRadius) {
      let angle = Math.atan2(refY - positionY, positionX - refX) +
                  this._currentLayout.sectorOffset;
      if (angle < 0) {
        angle += 2 * Math.PI;
      }
      sector = Math.floor(angle / (2 * this._currentLayout.halfAngleForSector));
    }
    if (sector >= this._currentLayout.actions.length) {
      shouldExtraMenuBeHidden = true;
      sector = -1;
    }
    
    // moving menu when shift key is down
    if (!this.settings.moveAuto && shiftKey ||
        this.settings.moveAuto && radius >= this._outerRadius &&
          (sector !== EXTRA_MENU_SECTOR || sector === EXTRA_MENU_SECTOR &&
                                           !this._currentLayout.hasExtraMenuAction)) {
      this.centerX += movementX;
      this.centerY += movementY;
      this._updateMenuPosition();
      return ;
    }
    
    if (this.sector !== sector) {
      this._highlightSelectedAction(this.sector, sector, this._currentLayout.name);
    }
    this.sector = sector;
    
    // switching to/from extra menu
    if (radius > 3 * this._outerRadius) {
      if (!this.isJustOpenedAndMouseMoved()) {
        this.close();
      }
    }
    else if (radius > this._outerRadius && sector === EXTRA_MENU_SECTOR &&
             this._currentLayout.hasExtraMenuAction) {
      this._showExtraMenu();
    }
    else if (shouldExtraMenuBeHidden) {
      this._hideExtraMenu();
    }
  },
  
  runAction() {
    let actionsNode = document.getElementById(ACTIONS_NODE_ID_PREFIX +
                                              this._currentLayout.name);
    let actionNode = actionsNode.childNodes[this.sector];
    
    if (actionNode.classList.contains("disabled")) {
      this.close();
    }
    else {
      let runActionMessage = {
        messageName: "runAction",
        actionName: this._currentLayout.actions[this.sector],
        usageInformationUpdate: this._currentLayout.getUsageInformationUpdate()
      };
      this.close();
      browser.runtime.sendMessage(runActionMessage).then(aMessage => {
        if (aMessage !== undefined) {
          actionRunners[aMessage.runActionName](aMessage.runActionOptions);
        }
      });
    }
  },
  
  switchLayout() {
    this._hideCurrentLayout();
    this._showLayout(this._currentLayout.getNextLayout());
  },
  
  close() {
    removeEventListener("mousemove", handleMousemove, true);
    if (context.frameHierarchyArray.length > 1) {
      browser.runtime.sendMessage({
        messageName: "removeMousemoveListenerFromFrame",
        parameters: {
          frameID: context.frameHierarchyArray[0].frameID
        }
      });
    }
    
    if (this.settings.showTooltips) {
      window.clearTimeout(this._tooltipsTimeoutID);
      this._showingTooltips = false;
    }
    
    if (this._currentLayout.isExtraMenu) {
      this._hideExtraMenu();
    }
    this._hideCurrentLayout();
    this._currentLayout.hideMenuSign();
    
    this._currentLayout = null;
    this._baseLayout = null;
    this.sector = -1;
    this.setHidden();
  },
  
  removeEasyGesturesNode() {
    removeEventListener("pagehide", removeMenuEventHandler, true);
    if (this.easyGesturesNode !== null) {
      this.easyGesturesNode.parentNode.removeChild(this.easyGesturesNode);
      this.easyGesturesNode = null;
    }
  },
  
  canBeOpened(button, shiftKey, ctrlKey, altKey) {
    let showKey = this.settings.showKey;
    let contextKey = this.settings.contextKey;
    let preventOpenKey = this.settings.preventOpenKey;
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
  
  canLayoutBeSwitched(aButtonPressed) {
    let showAltButton = this.settings.showAltButton;
    let showButton = this.settings.showButton;
    return aButtonPressed === showAltButton &&
           (showAltButton !== showButton ||
            showAltButton === showButton && this.sector === -1);
  },
  
  canContextualMenuBeOpened(ctrlKey, altKey) {
    let contextKey = this.settings.contextKey;
    let contextShowAuto = this.settings.contextShowAuto;
    let rightKey = contextKey !== 0 && ((contextKey === 17 && ctrlKey) ||
                                        (contextKey === 18 && altKey));
    return (!contextShowAuto && rightKey) || (contextShowAuto && !rightKey);
  },
  
  canContextmenuBeOpened(shiftKey, ctrlKey, altKey) {
    let showKey = this.settings.showKey;
    let contextKey = this.settings.contextKey;
    return (this.settings.showButton === 2 /* right click */ &&
            ((showKey === 0 && !shiftKey && !ctrlKey) ||
             (showKey === 0 && contextKey === 17 && ctrlKey && !shiftKey) ||
             (showKey === 0 && contextKey === 18 && altKey && !shiftKey && !ctrlKey) ||
             (showKey === 16 && shiftKey && !ctrlKey) ||
             (showKey === 16 && shiftKey && contextKey === 17 && ctrlKey) ||
             (showKey === 17 && !shiftKey && ctrlKey))) ||
           (this.isShown() && this.settings.showAltButton === 2);
  },
  
  openLinkThroughPieMenuCenter(clickedButton) {
    if (this.settings.handleLinksAsOpenLink) {
      browser.runtime.sendMessage({
        messageName: "runAction",
        actionName: "openLink",
        usageInformationUpdate: {
          incrementMethodName: "incrementNoUsage",
          incrementIndex: undefined
        }
      });
    }
    else {
      let messageName = clickedButton === 1 ? "loadURLInNewNonActiveTab" :
                                              "loadURLInCurrentTab";
      browser.runtime.sendMessage({
        messageName: messageName,
        url: context.anchorElementHREF
      });
    }
  }
};
