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

The Original Code is easyGestures N.

The Initial Developer of the Original Code is ngdeleito.

Contributor(s):
  Jens Tinz, his portions are Copyright (C) 2002. All Rights Reserved.
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


/* exported handleMousemove */
/* global browser, eGPieMenu, addEventListener, removeEventListener, window,
          document, MouseEvent */

const EXTRA_MENU_ACTION = 2;

var mousedownScreenX, mousedownScreenY, mouseupScreenX, mouseupScreenY;
var autoscrollingTrigger = null;
var selection, contextualMenus, anchorElement, imageElement, inputElement,
    iframeElement;
var frameScrollY, frameScrollMaxY, frameURL;

if (window.self === window.top) {
  // setting up pie menu on topmost frame
  setPieMenuSettings();
  addEventListener("mousedown", handleMousedown, true);
  addEventListener("mouseup", handleMouseup, true);
  addEventListener("keydown", handleKeydown, true);
  addEventListener("contextmenu", handleContextmenu, true);
  browser.runtime.onMessage.addListener(resetPieMenu);
}
else {
  // initializing state for eGPieMenu.canBeOpened()
  setPieMenuSettingsOnInnerFrame();
  // capturing necessary events on inner frame
  addEventListener("mousedown", handleMousedownOnInnerFrame, true);
  addEventListener("mouseup", handleMouseupOnInnerFrame, true);
  browser.runtime.onMessage.addListener(resetPieMenuOnInnerFrame);
}

function setPieMenuSettings() {
  browser.storage.local.get([
    "activation.showButton", "activation.showKey", "activation.showAltButton",
    "activation.preventOpenKey", "activation.contextKey",
    "activation.contextShowAuto", "behavior.largeMenu", "behavior.smallIcons",
    "behavior.menuOpacity", "behavior.showTooltips", "behavior.tooltipsDelay",
    "behavior.moveAuto", "behavior.handleLinks", "behavior.linksDelay",
    "behavior.handleLinksAsOpenLink", "behavior.autoscrollingOn",
    "behavior.autoscrollingDelay", "menus.main", "menus.mainAlt1Enabled",
    "menus.mainAlt1", "menus.mainAlt2Enabled", "menus.mainAlt2", "menus.extra",
    "menus.extraAlt1Enabled", "menus.extraAlt1", "menus.extraAlt2Enabled",
    "menus.extraAlt2", "menus.contextLink", "menus.contextImage",
    "menus.contextSelection", "menus.contextTextbox", "customizations.loadURL1",
    "customizations.loadURL2", "customizations.loadURL3",
    "customizations.loadURL4", "customizations.loadURL5",
    "customizations.loadURL6", "customizations.loadURL7",
    "customizations.loadURL8", "customizations.loadURL9",
    "customizations.loadURL10", "customizations.runScript1",
    "customizations.runScript2", "customizations.runScript3",
    "customizations.runScript4", "customizations.runScript5",
    "customizations.runScript6", "customizations.runScript7",
    "customizations.runScript8", "customizations.runScript9",
    "customizations.runScript10"
  ]).then(prefs => {
    eGPieMenu.settings.loadURLActionPrefs = {};
    eGPieMenu.settings.runScriptActionPrefs = {};
    for (let key in prefs) {
      let prefName = key.split(".")[1];
      if (prefName.startsWith("loadURL")) {
        eGPieMenu.settings.loadURLActionPrefs[prefName] =
          prefs[key].split("\u2022");
      }
      else if (prefName.startsWith("runScript")) {
        eGPieMenu.settings.runScriptActionPrefs[prefName] =
          prefs[key].split("\u2022");
      }
      else if (prefName === "menuOpacity") {
        eGPieMenu.settings[prefName] = prefs[key] / 100;
      }
      else {
        eGPieMenu.settings[prefName] = prefs[key];
      }
    }
    eGPieMenu.init();
  });
}

function resetPieMenu() {
  removeEventListener("pagehide", removeMenuEventHandler, true);
  var easyGesturesNode = document.getElementById(eGPieMenu.easyGesturesID);
  if (easyGesturesNode !== null) {
    easyGesturesNode.parentNode.removeChild(easyGesturesNode);
  }
  setPieMenuSettings();
}

function setPieMenuSettingsOnInnerFrame() {
  browser.storage.local.get([
    "activation.showButton", "activation.showKey", "activation.preventOpenKey",
    "activation.contextKey"
  ]).then(prefs => {
    for (let key in prefs) {
      let prefName = key.split(".")[1];
      eGPieMenu.settings[prefName] = prefs[key];
    }
  });
}

function resetPieMenuOnInnerFrame() {
  setPieMenuSettingsOnInnerFrame();
}


function cleanSelection(selection) {
  var result = selection.trim();
  // replace all linefeed, carriage return and tab characters with a space
  result = result.replace(/(\n|\r|\t)+/g, " ");
  return result;
}

function setContext(anHTMLElement, currentSelection) {
  // <a> elements cannot be nested
  // <a> elements cannot have <input> and <textarea> elements as descendants
  // <area>, <img> and <input> elements cannot have children
  // <textarea> cannot have other elements as children, only character data
  var inputBoxSelection = "";
  var contextualMenus = [];
  var anchorElement = null;
  var imageElement = null;
  var inputElement = null;
  var selection = currentSelection;
  if (anHTMLElement instanceof window.HTMLInputElement &&
      (anHTMLElement.type.toUpperCase() === "EMAIL" ||
       anHTMLElement.type.toUpperCase() === "NUMBER" ||
       anHTMLElement.type.toUpperCase() === "PASSWORD" ||
       anHTMLElement.type.toUpperCase() === "SEARCH" ||
       anHTMLElement.type.toUpperCase() === "TEL" ||
       anHTMLElement.type.toUpperCase() === "TEXT" ||
       anHTMLElement.type.toUpperCase() === "URL")) {
    inputBoxSelection = anHTMLElement.value.substring(anHTMLElement.selectionStart,
                                                      anHTMLElement.selectionEnd);
    inputElement = anHTMLElement;
    contextualMenus.push("contextTextbox");
  }
  else if (anHTMLElement instanceof window.HTMLTextAreaElement) {
    inputBoxSelection = anHTMLElement.value.substring(anHTMLElement.selectionStart,
                                                      anHTMLElement.selectionEnd);
    inputElement = anHTMLElement;
    contextualMenus.push("contextTextbox");
  }
  else if (anHTMLElement instanceof window.HTMLAreaElement &&
           anHTMLElement.href !== null && anHTMLElement.href !== "") {
    anchorElement = anHTMLElement;
    contextualMenus.push("contextLink");
  }
  else {
    if (anHTMLElement instanceof window.HTMLImageElement) {
      imageElement = anHTMLElement;
      contextualMenus.push("contextImage");
    }
    
    while (anHTMLElement !== null &&
           !(anHTMLElement instanceof window.HTMLAnchorElement)) {
      anHTMLElement = anHTMLElement.parentElement;
    }
    if (anHTMLElement !== null && anHTMLElement.href !== null &&
        anHTMLElement.href !== "") {
      anchorElement = anHTMLElement;
      contextualMenus.push("contextLink");
    }
  }
  if (inputBoxSelection !== "") {
    selection = inputBoxSelection;
  }
  if (selection !== "") {
    contextualMenus.push("contextSelection");
  }
  return [selection, contextualMenus, anchorElement, imageElement, inputElement];
}

function handleMousedown(anEvent) {
  // we ignore non cancelable mousedown events like those issued for triggering
  // Firefox's autoscrolling
  if (!anEvent.cancelable) {
    return ;
  }
  
  mousedownScreenX = anEvent.screenX;
  mousedownScreenY = anEvent.screenY;
  
  // clear automatic delayed autoscrolling
  window.clearTimeout(autoscrollingTrigger);
  
  // check whether pie menu should change layout or hide (later)
  if (eGPieMenu.isShown()) {
    if (eGPieMenu.canLayoutBeSwitched(anEvent.button)) {
      eGPieMenu.switchLayout();
    }
    anEvent.preventDefault();
    return ;
  }
  
  // check if menu should not be displayed
  if (!eGPieMenu.canBeOpened(anEvent.button, anEvent.shiftKey, anEvent.ctrlKey,
                             anEvent.altKey)) {
    return ;
  }
  
  anEvent.preventDefault();
  
  selection = cleanSelection(window.getSelection().toString());
  [selection, contextualMenus, anchorElement, imageElement, inputElement] =
    setContext(anEvent.target, selection);
  
  window.focus();
  
  eGPieMenu.centerX = anEvent.clientX;
  eGPieMenu.centerY = anEvent.clientY;
  iframeElement = undefined;
  frameScrollY = 0;
  frameScrollMaxY = 0;
  frameURL = null;
  if (anEvent.target instanceof window.HTMLIFrameElement) {
    iframeElement = anEvent.target;
    frameScrollY = iframeElement.contentWindow.scrollY;
    frameScrollMaxY = iframeElement.contentWindow.scrollMaxY;
    frameURL = iframeElement.contentDocument.documentURI;
  }
  browser.runtime.sendMessage({
    messageName: "setContext",
    context: {
      selection: selection,
      anchorElementExists: anchorElement !== null,
      anchorElementHREF: anchorElement !== null ? anchorElement.href : null,
      anchorElementText: anchorElement !== null ? anchorElement.text : null,
      imageElementDoesntExist: imageElement === null,
      imageElementSRC: imageElement !== null ? imageElement.src : null,
      inputElementExists: inputElement !== null,
      windowScrollY: window.scrollY,
      windowScrollMaxY: window.scrollMaxY,
      frameScrollY: frameScrollY,
      frameScrollMaxY: frameScrollMaxY,
      frameURL: frameURL
    }
  });
  
  if (contextualMenus.length !== 0 &&
      eGPieMenu.canContextualMenuBeOpened(anEvent.ctrlKey, anEvent.altKey)) {
    eGPieMenu.show(contextualMenus[0]);
  }
  else {
    eGPieMenu.show("main");
  }
  
  if (eGPieMenu.settings.autoscrollingOn) {
    autoscrollingTrigger = window.setTimeout(function() {
      eGPieMenu.close();
      eGPieMenu.runAction_autoscrolling({
        useMousedownCoordinates: true
      });
    }, eGPieMenu.settings.autoscrollingDelay);
  }
}

function handleMouseup(anEvent) {
  var specialNodes = document.getElementById("eG_SpecialNodes");
  var linkSignIsVisible = false;
  if (specialNodes !== null) {
    var linkSign = specialNodes.childNodes[0];
    linkSignIsVisible = linkSign.style.visibility === "visible";
  }
  
  mouseupScreenX = anEvent.screenX;
  mouseupScreenY = anEvent.screenY;
  
  var preventDefaultUponReturn = false;
  
  if (eGPieMenu.isJustOpened()) {
    eGPieMenu.setOpen();
    if (linkSignIsVisible) {
      window.clearTimeout(autoscrollingTrigger);
      eGPieMenu.openLinkThroughPieMenuCenter(anEvent.button);
    }
  }
  else if (eGPieMenu.isJustOpenedAndMouseMoved()) {
    if (eGPieMenu.sector !== -1) {
      window.setTimeout(function() { eGPieMenu.runAction(); });
    }
    else {
      eGPieMenu.setOpen();
      preventDefaultUponReturn = true;
    }
  }
  else if (eGPieMenu.isShown()) {
    if (anEvent.button === eGPieMenu.settings.showAltButton) {
      preventDefaultUponReturn = true;
    }
    else {
      if (eGPieMenu.sector !== -1) {
        window.setTimeout(function() { eGPieMenu.runAction(); });
      }
      else {
        eGPieMenu.close();
      }
    }
  }
  if (preventDefaultUponReturn) {
    anEvent.preventDefault();
  }
}

function handleKeydown(anEvent) {
  var altKey = anEvent.keyCode === 18;
  var escKey = anEvent.keyCode === 27;
  
  // clear automatic delayed autoscrolling
  window.clearTimeout(autoscrollingTrigger);
  
  if (eGPieMenu.isShown()) {
    if (altKey) {
      eGPieMenu.switchLayout();
    }
    else if (escKey) {
      eGPieMenu.close();
    }
  }
}

function handleContextmenu(anEvent) {
  var result = eGPieMenu.canContextmenuBeOpened(anEvent.shiftKey,
                                                anEvent.ctrlKey,
                                                anEvent.altKey);
  if (result) {
    anEvent.preventDefault();
  }
}

function handleMousedownOnInnerFrame(anEvent) {
  if (!eGPieMenu.canBeOpened(anEvent.button, anEvent.shiftKey, anEvent.ctrlKey,
                             anEvent.altKey)) {
    return ;
  }
  
  anEvent.preventDefault();
  var frameElementStyle = window.getComputedStyle(window.frameElement);
  var frameElementOffsetX =
        Number(frameElementStyle.paddingLeft.replace("px", "")) +
        Number(frameElementStyle.borderLeftWidth.replace("px", ""));
  var frameElementOffsetY =
        Number(frameElementStyle.paddingTop.replace("px", "")) +
        Number(frameElementStyle.borderTopWidth.replace("px", ""));
  var frameElementBoundingRect = window.frameElement.getBoundingClientRect();
  var newEvent = new MouseEvent("mousedown", {
    cancelable: anEvent.cancelable,
    screenX: anEvent.screenX,
    screenY: anEvent.screenY,
    clientX: anEvent.clientX + frameElementOffsetX + frameElementBoundingRect.x,
    clientY: anEvent.clientY + frameElementOffsetY + frameElementBoundingRect.y,
    ctrlKey: anEvent.ctrlKey,
    shiftKey: anEvent.shiftKey,
    altKey: anEvent.altKey,
    button: anEvent.button
  });
  // per the call to dispatchEvent, window.frameElement becomes newEvent.target
  window.frameElement.dispatchEvent(newEvent);
}

function handleMouseupOnInnerFrame(anEvent) {
  var newEvent = new MouseEvent("mouseup", {
    screenX: anEvent.screenX,
    screenY: anEvent.screenY,
    button: anEvent.button
  });
  window.frameElement.dispatchEvent(newEvent);
}

function removeMenuEventHandler(anEvent) {
  removeEventListener("pagehide", removeMenuEventHandler, true);
  var easyGesturesNode = anEvent.target.getElementById(eGPieMenu.easyGesturesID);
  easyGesturesNode.parentNode.removeChild(easyGesturesNode);
}

function hideLinkSign() {
  var specialNodes = document.getElementById("eG_SpecialNodes");
  var linkSign = specialNodes.childNodes[0];
  linkSign.style.visibility = "hidden";
}

function updateMenuPosition(easyGesturesNode, centerX, centerY) {
  easyGesturesNode.style.left = centerX + "px";
  easyGesturesNode.style.top = centerY + "px";
}

function clearHoverEffect(sector, layoutName, actionsLength) {
  var actionsNode = document.getElementById("eG_actions_" + layoutName);
  var tooltipsNode = document.getElementById("eG_labels_" + layoutName);
  
  if (sector >= 0 && sector < actionsLength) {
    actionsNode.childNodes[sector].classList.remove("selected");
    if (tooltipsNode !== null) {
      tooltipsNode.childNodes[sector].classList.remove("selected");
    }
  }
}

function setHoverEffect(sector, layoutName, actionsLength) {
  var actionsNode = document.getElementById("eG_actions_" + layoutName);
  var tooltipsNode = document.getElementById("eG_labels_" + layoutName);
  
  if (sector >= 0 && sector < actionsLength) {
    actionsNode.childNodes[sector].classList.add("selected");
    if (tooltipsNode !== null) {
      tooltipsNode.childNodes[sector].classList.add("selected");
    }
  }
}

function hide(layoutName, sector, layoutActionsLength, baseLayoutName) {
  var actionsNode = document.getElementById("eG_actions_" + layoutName);
  var tooltipsNode = document.getElementById("eG_labels_" + layoutName);
  var specialNodes = document.getElementById("eG_SpecialNodes");
  var linkSign = specialNodes.childNodes[0];
  var contextMenuSign = specialNodes.childNodes[3];
  
  if (actionsNode !== null) {
    actionsNode.style.visibility = "hidden";
  }
  if (tooltipsNode !== null) {
    tooltipsNode.style.visibility = "hidden";
  }
  
  linkSign.style.visibility = "hidden";
  contextMenuSign.style.visibility = "hidden";
  
  if (sector >= 0 && sector < layoutActionsLength) {
    actionsNode.childNodes[sector].classList.remove("selected");
    if (tooltipsNode !== null) {
      tooltipsNode.childNodes[sector].classList.remove("selected");
    }
  }
  
  // reset rollover for extra menu in base menu if needed
  if (baseLayoutName !== "") {
    var baseActionsNode = document.getElementById("eG_actions_" + baseLayoutName);
    var baseTooltipsNode = document.getElementById("eG_labels_" + baseLayoutName);
    baseActionsNode.childNodes[EXTRA_MENU_ACTION].classList.remove("showingExtraMenu");
    baseActionsNode.childNodes[EXTRA_MENU_ACTION].classList.remove("selected");
    if (baseTooltipsNode !== null) {
      baseTooltipsNode.childNodes[EXTRA_MENU_ACTION].classList.remove("selected");
    }
  }
}

function showExtraMenu(layoutName) {
  var actionsNode = document.getElementById("eG_actions_" + layoutName);
  var specialNodes = document.getElementById("eG_SpecialNodes");
  var mainMenusSign = specialNodes.childNodes[1];
  var extraMenusSign = specialNodes.childNodes[2];
  var tooltipsNode = document.getElementById("eG_labels_" + layoutName);
  
  actionsNode.childNodes[EXTRA_MENU_ACTION].classList.add("showingExtraMenu");
  
  mainMenusSign.style.visibility = "hidden";
  extraMenusSign.style.visibility = "visible";
  
  // hide main menu tooltips after extra menu showed
  if (tooltipsNode !== null) {
    tooltipsNode.style.visibility = "hidden";
  }
  
  browser.runtime.sendMessage({
    messageName: "incrementShowExtraMenuStats",
    incrementIndex: eGPieMenu.menuSet[layoutName]._layoutNumber * 10 + EXTRA_MENU_ACTION
  });
}

function hideExtraMenu(layoutName, sector, layoutActionsLength, baseLayoutName) {
  var baseActionsNode = document.getElementById("eG_actions_" + baseLayoutName);
  var specialNodes = document.getElementById("eG_SpecialNodes");
  var mainMenusSign = specialNodes.childNodes[1];
  var extraMenusSign = specialNodes.childNodes[2];
  
  // reset rollover of extra menu action icon in main menu
  baseActionsNode.childNodes[EXTRA_MENU_ACTION].classList.remove("showingExtraMenu");
  
  hide(layoutName, sector, layoutActionsLength, baseLayoutName);
  
  mainMenusSign.style.visibility = "visible";
  extraMenusSign.style.visibility = "hidden";
}

function handleMousemove(anEvent) {
  hideLinkSign();
  
  // clear automatic delayed autoscrolling
  window.clearTimeout(autoscrollingTrigger);
  
  var result = eGPieMenu.handleMousemove({
    positionX: anEvent.clientX,
    positionY: anEvent.clientY,
    shiftKey: anEvent.shiftKey,
    movementX: anEvent.movementX,
    movementY: anEvent.movementY
  });
  if (result.centerX !== undefined) {
    let easyGesturesNode = document.getElementById(eGPieMenu.easyGesturesID);
    updateMenuPosition(easyGesturesNode, result.centerX, result.centerY);
  }
  else {
    if (result.oldSector !== result.newSector) {
      clearHoverEffect(result.oldSector, result.layoutName, result.actionsLength);
      setHoverEffect(result.newSector, result.layoutName, result.actionsLength);
    }
    if (result.showExtraMenu) {
      showExtraMenu(result.layoutName);
    }
    else if (result.hideExtraMenu) {
      hideExtraMenu(result.layoutName, result.newSector, result.actionsLength, result.baseLayoutName);
    }
  }
}
