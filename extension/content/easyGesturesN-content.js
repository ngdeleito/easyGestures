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


/* exported removeMenuEventHandler, handleMousemove */
/* global browser, eGPieMenu, addEventListener, window, document, MouseEvent */

"use strict";

let selection, contextualMenus, anchorElement, imageElement, inputElement,
    iframeElement;
let frameScrollY, frameScrollMaxY, frameURL;

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
    "installOrUpgradeTriggered", "activation.showButton", "activation.showKey",
    "activation.showAltButton", "activation.preventOpenKey",
    "activation.contextKey", "activation.contextShowAuto", "behavior.largeMenu",
    "behavior.smallIcons", "behavior.menuOpacity", "behavior.showTooltips",
    "behavior.tooltipsDelay", "behavior.moveAuto", "behavior.handleLinks",
    "behavior.linksDelay", "behavior.handleLinksAsOpenLink", "menus.main",
    "menus.mainAlt1Enabled", "menus.mainAlt1", "menus.mainAlt2Enabled",
    "menus.mainAlt2", "menus.extra", "menus.extraAlt1Enabled",
    "menus.extraAlt1", "menus.extraAlt2Enabled", "menus.extraAlt2",
    "menus.contextLink", "menus.contextImage", "menus.contextSelection",
    "menus.contextTextbox", "customizations.loadURL1",
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
    if (Object.keys(prefs).length === 0 || prefs.installOrUpgradeTriggered) {
      // an install or upgrade procedure is ongoing, we wait for the background
      // scripts to send a reset
      return ;
    }
    
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
  eGPieMenu.removeEasyGesturesNode();
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
  let result = selection.trim();
  // replace all linefeed, carriage return and tab characters with a space
  result = result.replace(/(\n|\r|\t)+/g, " ");
  return result;
}

function setContext(anHTMLElement, currentSelection) {
  // <a> elements cannot be nested
  // <a> elements cannot have <input> and <textarea> elements as descendants
  // <area>, <img> and <input> elements cannot have children
  // <textarea> cannot have other elements as children, only character data
  let inputBoxSelection = "";
  let contextualMenus = [];
  let anchorElement = null;
  let imageElement = null;
  let inputElement = null;
  let selection = currentSelection;
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

function findNearestIDAttribute(anHTMLElement) {
  let currentElement = anHTMLElement;
  while (currentElement.parentElement !== null &&
         currentElement.previousElementSibling === null &&
         currentElement.nextElementSibling === null &&
         currentElement.id === "") {
    currentElement = currentElement.parentElement;
  }
  return currentElement.id;
}

function handleMousedown(anEvent) {
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
  
  let elementID = findNearestIDAttribute(anEvent.target);
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
    messageName: "setContextAndFocusCurrentWindow",
    context: {
      pageURL: document.documentURI,
      urlToIdentifier:
        elementID === "" ? ""
                         : document.location.origin +
                           document.location.pathname + "#" + elementID,
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
    eGPieMenu.openWithContextualLayout(contextualMenus[0]);
  }
  else {
    eGPieMenu.openWithMainLayout();
  }
}

function handleMouseup(anEvent) {
  let preventDefaultUponReturn = false;
  
  if (eGPieMenu.isJustOpened()) {
    eGPieMenu.setOpen();
    if (eGPieMenu.isLinkSignVisible()) {
      eGPieMenu.openLinkThroughPieMenuCenter(anEvent.button);
      eGPieMenu.close();
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
  if (eGPieMenu.isShown()) {
    if (anEvent.key === "Alt") {
      eGPieMenu.switchLayout();
    }
    else if (anEvent.key === "Escape") {
      eGPieMenu.close();
    }
  }
}

function handleContextmenu(anEvent) {
  let result = eGPieMenu.canContextmenuBeOpened(anEvent.shiftKey,
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
  let frameElementStyle = window.getComputedStyle(window.frameElement);
  let frameElementOffsetX =
        Number(frameElementStyle.paddingLeft.replace("px", "")) +
        Number(frameElementStyle.borderLeftWidth.replace("px", ""));
  let frameElementOffsetY =
        Number(frameElementStyle.paddingTop.replace("px", "")) +
        Number(frameElementStyle.borderTopWidth.replace("px", ""));
  let frameElementBoundingRect = window.frameElement.getBoundingClientRect();
  let newEvent = new MouseEvent("mousedown", {
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
  let newEvent = new MouseEvent("mouseup", {
    screenX: anEvent.screenX,
    screenY: anEvent.screenY,
    button: anEvent.button
  });
  window.frameElement.dispatchEvent(newEvent);
}

function removeMenuEventHandler() {
  eGPieMenu.removeEasyGesturesNode();
}

function handleMousemove(anEvent) {
  eGPieMenu.handleMousemove(anEvent.clientX, anEvent.clientY, anEvent.shiftKey,
                            anEvent.movementX, anEvent.movementY);
}
