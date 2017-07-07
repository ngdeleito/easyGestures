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


/* global browser, eGPrefs, document, contextualMenus, selection,
          addEventListener, removeMenuEventHandler, anchorElement, window,
          handleMousemove, EXTRA_MENU_ACTION, mousedownScreenX, mouseupScreenX,
          mousedownScreenY, mouseupScreenY, imageElement, inputElement, hide,
          frameScrollY, iframeElement, frameScrollMaxY, removeEventListener */

const HTML_NAMESPACE = "http://www.w3.org/1999/xhtml";

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
  eGPrefs.incrementStatsMainMenuPref(this._layoutNumber * 10 + sector8To10);
  eGPrefs.updateStatsForAction(this.actions[sector]);
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
  eGPrefs.incrementStatsExtraMenuPref(this._layoutNumber * 5 + sector);
  eGPrefs.updateStatsForAction(this.actions[sector]);
};
ExtraMenuLayout.prototype.updateMenuSign = function() {
  this._updateMenuSign(2, this._pieMenu.numberOfExtraMenus);
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
ContextualMenuLayout.prototype.updateStatsForActionToBeExecuted = function() {
  eGPrefs.updateStatsForAction(this.actions[this._pieMenu.sector]);
};
ContextualMenuLayout.prototype.updateMenuSign = function() {
  var specialNodes = document.getElementById("eG_SpecialNodes");
  var contextMenuSignNode = specialNodes.childNodes[3];
  
  contextMenuSignNode.textContent = this.localizedName;
  contextMenuSignNode.style.visibility = "visible";
  if (contextualMenus.length > 1) {
    contextMenuSignNode.className = "withAltSign";
  }
  else {
    contextMenuSignNode.removeAttribute("class");
  }
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
    
    this.extraMenuAction = 2; // position of extra menu action in base menu from which extra menu is called
    
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
  
  setDisableableActionStatus : function(aMessage, layoutName, actionSector) {
    this._setActionStatusHelper(layoutName, actionSector, aMessage.status);
  },
  
  setHideImagesActionStatus : function(aMessage, layoutName, actionSector) {
    var disabled = document.querySelectorAll("img").length === 0;
    this._setActionStatusHelper(layoutName, actionSector, disabled);
  },
  
  setActionStatus_cut : function(aMessage, layoutName, actionSector) {
    var disabled = inputElement === null ||
                   inputElement.selectionStart === inputElement.selectionEnd;
    this._setActionStatusHelper(layoutName, actionSector, disabled);
  },
  
  setActionStatus_copy : function(aMessage, layoutName, actionSector) {
    var enabled = selection !== "" || (inputElement !== null &&
                    inputElement.selectionEnd > inputElement.selectionStart);
    this._setActionStatusHelper(layoutName, actionSector, !enabled);
  },
  
  _createEasyGesturesNode : function() {
    var easyGesturesNode = document.createElementNS(HTML_NAMESPACE, "div");
    easyGesturesNode.id = this.easyGesturesID;
    easyGesturesNode.style.opacity = this.settings.menuOpacity;
    
    addEventListener("pagehide", removeMenuEventHandler, true);
    
    return easyGesturesNode;
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
  
  show : function(layoutName) { // makes menu visible
    var layout = this.menuSet[layoutName];
    
    if (this.isHidden()) {
      this.setJustOpened();
    }
    
    var bodyNode = document.body ? document.body : document.documentElement;
    var easyGesturesNode = document.getElementById(this.easyGesturesID);
    if (easyGesturesNode === null) {
      easyGesturesNode = this._createEasyGesturesNode();
      bodyNode.insertBefore(easyGesturesNode, bodyNode.firstChild);
    }
    
    easyGesturesNode.style.left = this.centerX + "px";
    easyGesturesNode.style.top = this.centerY + "px";
    
    var specialNodes = document.getElementById("eG_SpecialNodes");
    if (specialNodes === null) {
      specialNodes = this._createSpecialNodes(this.numberOfMainMenus,
                                              this.numberOfExtraMenus);
      easyGesturesNode.appendChild(specialNodes);
    }
    
    if (!layout.isExtraMenu) {
      if (layoutName.startsWith("main")) {
        var mainMenusSign = specialNodes.childNodes[1];
        mainMenusSign.style.visibility = "visible";
      }
    }
    
    var actionsNode = document.getElementById("eG_actions_" + layoutName);
    if (actionsNode === null) {
      actionsNode = this._createActionsNodes(layoutName, layout.outerR,
                                             layout.innerR,
                                             layout.startingAngle,
                                             layout.actions,
                                             layout.halfAngleForSector);
      easyGesturesNode.appendChild(actionsNode);
    }
    actionsNode.style.visibility = "visible";
    
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
    
    this.curLayoutName = layoutName;
    browser.runtime.sendMessage({
      messageName: "getActionsStatus",
      actions: layout.actions
    }).then(statusesArray => {
      statusesArray.forEach(function(response, actionSector) {
        if (response !== undefined) {
          eGPieMenu[response.messageName](response, layoutName, actionSector);
        }
      });
    });
    layout.updateMenuSign();
    this.resetTooltipsTimeout();
  },
  
  _createTooltipsNodes : function(layoutName, tooltips, hasExtraMenuAction) {
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
  
  showMenuTooltips : function() {
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
  
  runAction_back : function() {
    window.history.back();
  },
  
  runAction_forward : function() {
    window.history.forward();
  },
  
  runAction_pageTop : function() {
    if (frameScrollY !== 0) {
      iframeElement.contentWindow.scroll(0, 0);
    }
    else {
      window.scroll(0, 0);
    }
  },
  
  runAction_pageBottom : function() {
    if (frameScrollY !== frameScrollMaxY) {
      iframeElement.contentWindow.scroll(0, frameScrollMaxY);
    }
    else {
      window.scroll(0, window.scrollMaxY);
    }
  },
  
  runAction_autoscrolling : function(options) {
    var useMousedownCoordinates = options.useMousedownCoordinates;
    // see chrome://global/content/browser-content.js: we simulate a middle
    // button (non cancelable) mousedown event to trigger Firefox's
    // autoscrolling --> autoscrolling is currently broken, as in WebExtensions
    // created events seem to be non trusted
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
  
  runAction_printPage : function() {
    window.print();
  },
  
  runAction_copyInformation: function(options) {
    var selection = window.getSelection();
    selection.removeAllRanges();
    var node = document.createElement("div");
    node.textContent = options.information;
    var easyGesturesNode = document.getElementById(this.easyGesturesID);
    easyGesturesNode.appendChild(node);
    var range = document.createRange();
    range.selectNode(node);
    selection.addRange(range);
    document.execCommand("copy");
    easyGesturesNode.removeChild(node);
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
  
  runAction_commandAction : function(options) {
    document.execCommand(options.commandName);
  },
  
  runAction_paste : function() {
    var selectionStart = inputElement.selectionStart;
    var selectionEnd = inputElement.selectionEnd;
    
    var textareaWithPastedText = document.createElement("textarea");
    textareaWithPastedText.contentEditable = true;
    var easyGesturesNode = document.getElementById(this.easyGesturesID);
    easyGesturesNode.appendChild(textareaWithPastedText);
    textareaWithPastedText.focus();
    document.execCommand("paste");
    
    var inputContent = inputElement.value;
    inputElement.value = inputContent.substring(0, selectionStart) +
      textareaWithPastedText.textContent +
      inputContent.substring(selectionEnd, inputContent.length);
    inputElement.focus();
    
    easyGesturesNode.removeChild(textareaWithPastedText);
  },
  
  runAction_selectAll : function() {
    if (inputElement !== null) {
      inputElement.select();
    }
    else {
      document.designMode = "on";
      document.execCommand("selectAll");
      document.designMode = "off";
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
        if (aMessage.runActionName !== undefined) {
          this["runAction_" + aMessage.runActionName](aMessage.runActionOptions);
        }
      }
    });
  },
  
  switchLayout : function() { // this is not about switching to/from extra menu
    var layout = this.menuSet[this.curLayoutName];
    hide(layout.name, this.sector, layout.actions.length, this.baseMenu);
    this.show(layout.getNextLayout());
  },
  
  _clearMenuSign : function(menuSign) {
    for (let i=0; i < menuSign.childNodes.length; ++i) {
      menuSign.childNodes[i].removeAttribute("class");
    }
  },
  
  close : function() {
    var layout = this.menuSet[this.curLayoutName];
    var baseLayout = this.menuSet[this.baseMenu];
    
    if (window === null) {
      return ;
    }
    
    var specialNodes = document.getElementById("eG_SpecialNodes");
    var mainMenusSign = specialNodes.childNodes[1];
    var extraMenusSign = specialNodes.childNodes[2];
    
    hide(layout.name, this.sector, layout.actions.length, this.baseMenu);
    if (layout.isExtraMenu) {
      // hide base menu too if closing is done from extra menu
      hide(this.baseMenu, this.sector,
           baseLayout !== undefined ? baseLayout.actions.length : 0,
           this.baseMenu);
      extraMenusSign.style.visibility = "hidden";
    }
    mainMenusSign.style.visibility = "hidden";
    
    this._clearMenuSign(mainMenusSign);
    this._clearMenuSign(extraMenusSign);
    
    removeEventListener("mousemove", handleMousemove, true);
    
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
        this.tooltipsTrigger = window.setTimeout(function() {
          eGPieMenu.showMenuTooltips();
        }, this.settings.tooltipsDelay);
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
