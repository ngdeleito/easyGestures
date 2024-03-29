/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

/* exported imageElement, inputElement, removeMenuEventHandler, handleMousemove */
/* global window, addEventListener, browser, eGPieMenu, document, MouseEvent,
          KeyboardEvent, actionRunners, removeEventListener */

"use strict";

let scrollableElement, contextualMenus, imageElement, inputElement, context;

if (window.self === window.top) {
  // setting up pie menu within topmost frame
  setPieMenuSettingsWithinTopmostFrame();
  addEventListener("mousedown", handleMousedownWithinTopmostFrame, true);
  addEventListener("mouseup", handleMouseupWithinTopmostFrame, true);
  addEventListener("keydown", handleKeydownWithinTopmostFrame, true);
  addEventListener("contextmenu", handleContextmenuWithinTopmostFrame, true);
  browser.runtime.onMessage.addListener(handleMessageFromBackgroundScriptWithinTopmostFrame);
}
else {
  // initializing state for eGPieMenu.canBeOpened()
  setPieMenuSettingsWithinInnerFrame();
  // capturing necessary events within inner frames
  addEventListener("mousedown", handleMousedownWithinInnerFrame, true);
  addEventListener("mouseup", handleMouseupWithinInnerFrame, true);
  addEventListener("keydown", handleKeydownWithinInnerFrame, true);
  browser.runtime.onMessage.addListener(handleMessageFromBackgroundScriptWithinInnerFrame);
}

function setPieMenuSettingsWithinTopmostFrame() {
  browser.storage.local.get([
    "installOrUpgradeTriggered", "activation.showButton", "activation.showKey",
    "activation.showAltButton", "activation.preventOpenKey",
    "activation.contextKey", "activation.contextShowAuto",
    "appearance.darkTheme", "appearance.largeMenu", "appearance.smallIcons",
    "appearance.menuOpacity", "behavior.showTooltips", "behavior.tooltipsDelay",
    "behavior.moveAuto", "behavior.handleLinks", "behavior.linksDelay",
    "behavior.handleLinksAsOpenLink", "menus.main", "menus.mainAlt1Enabled",
    "menus.mainAlt1", "menus.mainAlt2Enabled", "menus.mainAlt2", "menus.extra",
    "menus.extraAlt1Enabled", "menus.extraAlt1", "menus.extraAlt2Enabled",
    "menus.extraAlt2", "menus.contextLink", "menus.contextImage",
    "menus.contextSelection", "menus.contextTextbox"
  ]).then(prefs => {
    if (Object.keys(prefs).length === 0 || prefs.installOrUpgradeTriggered) {
      // an install or upgrade procedure is ongoing, we wait for the background
      // scripts to send a reset
      return ;
    }
    
    for (let key in prefs) {
      let prefName = key.split(".")[1];
      eGPieMenu.settings[prefName] = prefs[key];
    }
    eGPieMenu.init();
  });
}

function initializeScrollableElement(anHTMLElement) {
  let aScrollableElement = anHTMLElement;
  while (aScrollableElement !== document.documentElement &&
         (aScrollableElement.scrollHeight <= aScrollableElement.clientHeight ||
          (window.getComputedStyle(aScrollableElement).overflowY !== "scroll" &&
           window.getComputedStyle(aScrollableElement).overflowY !== "auto"))) {
    aScrollableElement = aScrollableElement.parentElement;
  }
  return aScrollableElement;
}

function isScrollableElementFullyScrolled(aScrollableElement) {
  return aScrollableElement.scrollHeight - aScrollableElement.scrollTop ===
         aScrollableElement.clientHeight;
}

function getCleanedSelection() {
  let result = window.getSelection().toString().trim();
  // replace all linefeed, carriage return and tab characters with a space
  result = result.replace(/(\n|\r|\t)+/g, " ");
  return result;
}

function initializeContext(anHTMLElement, currentSelection) {
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
  return [contextualMenus, imageElement, inputElement, {
    selection: selection,
    anchorElementExists: anchorElement !== null,
    anchorElementHREF: anchorElement !== null ? anchorElement.href : null,
    anchorElementText: anchorElement !== null ? anchorElement.text : null,
    imageElementDoesntExist: imageElement === null,
    imageElementSRC: imageElement !== null ? imageElement.src : null,
    inputElementExists: inputElement !== null,
    inputElementContainsSelection: inputElement !== null ?
      inputElement.selectionEnd > inputElement.selectionStart : false,
    documentDoesntContainImages: document.querySelectorAll("img").length === 0,
    frameHierarchyArray: []
  }];
}

function getURLOfNearestIDAttribute(anHTMLElement) {
  let currentElement = anHTMLElement;
  while (currentElement.parentElement !== null &&
         currentElement.previousElementSibling === null &&
         currentElement.nextElementSibling === null &&
         currentElement.id === "") {
    currentElement = currentElement.parentElement;
  }
  return currentElement.id === "" ? "" : `${document.location.origin}` +
                                         `${document.location.pathname}#` +
                                         `${currentElement.id}`;
}

function handleMousedownWithinTopmostFrame(anEvent) {
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
  
  eGPieMenu.centerX = anEvent.clientX;
  eGPieMenu.centerY = anEvent.clientY;
  scrollableElement = initializeScrollableElement(anEvent.target);
  if (!(anEvent.target instanceof window.HTMLIFrameElement)) {
    // when this condition is not met, mousedown has been first triggered inside
    // an inner frame and contextualMenus and context have already been
    // initialized
    [contextualMenus, imageElement, inputElement, context] =
      initializeContext(anEvent.target, getCleanedSelection());
  }
  context.pageURL = document.documentURI;
  context.urlToIdentifier = getURLOfNearestIDAttribute(anEvent.target);
  context.frameHierarchyArray.push({
    URL: window.location.toString(),
    scrollableElementScrollTop: scrollableElement.scrollTop,
    windowScrollY: window.scrollY,
    scrollableElementIsFullyScrolled:
      isScrollableElementFullyScrolled(scrollableElement),
    windowScrollMaxY: window.scrollMaxY,
    frameID: 0
  });
  browser.runtime.sendMessage({
    messageName: "setContextAndFocusCurrentWindow",
    context: context
  });
  
  if (contextualMenus.length !== 0 &&
      eGPieMenu.canContextualMenuBeOpened(anEvent.ctrlKey, anEvent.altKey)) {
    eGPieMenu.openWithContextualLayout(contextualMenus[0]);
  }
  else {
    eGPieMenu.openWithMainLayout();
  }
}

function handleMouseupWithinTopmostFrame(anEvent) {
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
      window.setTimeout(() => eGPieMenu.runAction());
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
        window.setTimeout(() => eGPieMenu.runAction());
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

function handleKeydownWithinTopmostFrame(anEvent) {
  if (eGPieMenu.isShown()) {
    if (anEvent.key === "Alt") {
      eGPieMenu.switchLayout();
    }
    else if (anEvent.key === "Escape") {
      eGPieMenu.close();
    }
  }
}

function handleContextmenuWithinTopmostFrame(anEvent) {
  let result = eGPieMenu.canContextmenuBeOpened(anEvent.shiftKey,
                                                anEvent.ctrlKey,
                                                anEvent.altKey);
  if (result) {
    anEvent.preventDefault();
  }
}

function resetPieMenuWithinTopmostFrame() {
  eGPieMenu.removeEasyGesturesNode();
  setPieMenuSettingsWithinTopmostFrame();
}

function performOnInnerFrameElement(innerFrameURL, aFunction) {
  let frameElements = document.getElementsByTagName("iframe");
  let i = 0;
  let found = false;
  while (i < frameElements.length && !found) {
    found = frameElements[i].src === innerFrameURL;
    ++i;
  }
  if (found) {
    // the element should normally exist, still we leave this condition (and the
    // first one in the while loop) to be on the safe side
    aFunction(frameElements[i-1]);
  }
}

function updateClientCoordinatesFromInnerFrame(innerFrameElement, parameters) {
  let innerFrameElementStyle = window.getComputedStyle(innerFrameElement);
  let innerFrameOffsetX =
        Number(innerFrameElementStyle.paddingLeft.replace("px", "")) +
        Number(innerFrameElementStyle.borderLeftWidth.replace("px", ""));
  let innerFrameOffsetY =
        Number(innerFrameElementStyle.paddingTop.replace("px", "")) +
        Number(innerFrameElementStyle.borderTopWidth.replace("px", ""));
  let innerFrameBoundingRect = innerFrameElement.getBoundingClientRect();
  parameters.clientX += innerFrameOffsetX + innerFrameBoundingRect.x;
  parameters.clientY += innerFrameOffsetY + innerFrameBoundingRect.y;
}

function handleMousedownFromInnerFrameWithinTopmostFrame(parameters) {
  performOnInnerFrameElement(parameters.innerFrameURL, innerFrameElement => {
    updateClientCoordinatesFromInnerFrame(innerFrameElement, parameters);
    contextualMenus = parameters.contextualMenus;
    context = parameters.context;
    // per the call to dispatchEvent, innerFrameElement becomes the target of
    // the event
    innerFrameElement.dispatchEvent(new MouseEvent("mousedown", parameters));
  });
}

function handleMouseupFromInnerFrameWithinTopmostFrame(parameters) {
  performOnInnerFrameElement(parameters.innerFrameURL, innerFrameElement => {
    innerFrameElement.dispatchEvent(new MouseEvent("mouseup", parameters));
  });
}

function handleKeydownFromInnerFrameWithinTopmostFrame(parameters) {
  document.dispatchEvent(new KeyboardEvent("keydown", parameters));
}

function handleMousemoveFromInnerFrameWithinTopmostFrame(parameters) {
  performOnInnerFrameElement(parameters.innerFrameURL, innerFrameElement => {
    updateClientCoordinatesFromInnerFrame(innerFrameElement, parameters);
    handleMousemove(parameters);
  });
}

function runAction(parameters) {
  actionRunners[parameters.runActionName](parameters.runActionOptions);
}

function handleMessageFromBackgroundScriptWithinTopmostFrame(aMessage) {
  let processMessage = {
    "resetPieMenu": resetPieMenuWithinTopmostFrame,
    "handleMousedownFromInnerFrame": handleMousedownFromInnerFrameWithinTopmostFrame,
    "handleMouseupFromInnerFrame": handleMouseupFromInnerFrameWithinTopmostFrame,
    "handleKeydownFromInnerFrame": handleKeydownFromInnerFrameWithinTopmostFrame,
    "handleMousemoveFromInnerFrame": handleMousemoveFromInnerFrameWithinTopmostFrame,
    "runAction": runAction
  };
  processMessage[aMessage.messageName](aMessage.parameters);
}

function setPieMenuSettingsWithinInnerFrame() {
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

function handleMousedownWithinInnerFrame(anEvent) {
  if (!eGPieMenu.canBeOpened(anEvent.button, anEvent.shiftKey, anEvent.ctrlKey,
                             anEvent.altKey)) {
    return ;
  }
  
  anEvent.preventDefault();
  
  scrollableElement = initializeScrollableElement(anEvent.target);
  [contextualMenus, imageElement, inputElement, context] =
    initializeContext(anEvent.target, getCleanedSelection());
  context.frameHierarchyArray.push({
    URL: window.location.toString(),
    scrollableElementScrollTop: scrollableElement.scrollTop,
    windowScrollY: window.scrollY,
    scrollableElementIsFullyScrolled:
      isScrollableElementFullyScrolled(scrollableElement),
    windowScrollMaxY: window.scrollMaxY
  });
  browser.runtime.sendMessage({
    messageName: "transferMousedownToUpperFrame",
    parameters: {
      innerFrameURL: window.location.toString(),
      contextualMenus: contextualMenus,
      context: context,
      cancelable: anEvent.cancelable,
      screenX: anEvent.screenX,
      screenY: anEvent.screenY,
      clientX: anEvent.clientX,
      clientY: anEvent.clientY,
      ctrlKey: anEvent.ctrlKey,
      shiftKey: anEvent.shiftKey,
      altKey: anEvent.altKey,
      button: anEvent.button
    }
  });
}

function handleMouseupWithinInnerFrame(anEvent) {
  browser.runtime.sendMessage({
    messageName: "transferMouseupToUpperFrame",
    parameters: {
      innerFrameURL: window.location.toString(),
      button: anEvent.button
    }
  });
}

function handleKeydownWithinInnerFrame(anEvent) {
  browser.runtime.sendMessage({
    messageName: "transferKeydownToTopmostFrame",
    parameters: {
      key: anEvent.key
    }
  });
}

function resetPieMenuWithinInnerFrame() {
  setPieMenuSettingsWithinInnerFrame();
}

function handleMousedownFromInnerFrameWithinInnerFrame(parameters) {
  performOnInnerFrameElement(parameters.innerFrameURL, innerFrameElement => {
    updateClientCoordinatesFromInnerFrame(innerFrameElement, parameters);
    parameters.innerFrameURL = window.location.toString();
    parameters.context.frameHierarchyArray.push({
      URL: window.location.toString(),
      windowScrollY: window.scrollY,
      windowScrollMaxY: window.scrollMaxY
    });
    browser.runtime.sendMessage({
      messageName: "transferMousedownToUpperFrame",
      parameters: parameters
    });
  });
}

function handleMouseupFromInnerFrameWithinInnerFrame(parameters) {
  parameters.innerFrameURL = window.location.toString();
  browser.runtime.sendMessage({
    messageName: "transferMouseupToUpperFrame",
    parameters: parameters
  });
}

function addMousemoveListenerWithinInnerFrame() {
  addEventListener("mousemove", handleMousemoveWithinInnerFrame, true);
}

function handleMousemoveFromInnerFrameWithinInnerFrame(parameters) {
  performOnInnerFrameElement(parameters.innerFrameURL, innerFrameElement => {
    updateClientCoordinatesFromInnerFrame(innerFrameElement, parameters);
    parameters.innerFrameURL = window.location.toString();
    browser.runtime.sendMessage({
      messageName: "transferMousemoveToUpperFrame",
      parameters: parameters
    });
  });
}

function removeMousemoveListenerWithinInnerFrame() {
  removeEventListener("mousemove", handleMousemoveWithinInnerFrame, true);
}

function handleMessageFromBackgroundScriptWithinInnerFrame(aMessage) {
  let processMessage = {
    "resetPieMenu": resetPieMenuWithinInnerFrame,
    "handleMousedownFromInnerFrame": handleMousedownFromInnerFrameWithinInnerFrame,
    "handleMouseupFromInnerFrame": handleMouseupFromInnerFrameWithinInnerFrame,
    "addMousemoveListener": addMousemoveListenerWithinInnerFrame,
    "handleMousemoveFromInnerFrame": handleMousemoveFromInnerFrameWithinInnerFrame,
    "removeMousemoveListener": removeMousemoveListenerWithinInnerFrame,
    "runAction": runAction
  };
  processMessage[aMessage.messageName](aMessage.parameters);
}

function removeMenuEventHandler() {
  eGPieMenu.removeEasyGesturesNode();
}

function handleMousemove(anEvent) {
  eGPieMenu.handleMousemove(anEvent.clientX, anEvent.clientY, anEvent.shiftKey,
                            anEvent.movementX, anEvent.movementY);
}

function handleMousemoveWithinInnerFrame(anEvent) {
  browser.runtime.sendMessage({
    messageName: "transferMousemoveToUpperFrame",
    parameters: {
      innerFrameURL: window.location.toString(),
      clientX: anEvent.clientX,
      clientY: anEvent.clientY,
      shiftKey: anEvent.shiftKey,
      movementX: anEvent.movementX,
      movementY: anEvent.movementY
    }
  });
}
