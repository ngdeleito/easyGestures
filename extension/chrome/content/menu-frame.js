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


/* global addMessageListener, removeMessageListener, content, addEventListener,
          removeEventListener, sendSyncMessage, sendAsyncMessage */

var HTMLNamespace = "http://www.w3.org/1999/xhtml";
var easyGesturesID;
var extraMenuAction = 2;

var targetDocument, targetWindow, topmostWindow, topmostDocument;

var contextualMenus;
var selection;
var anchorElement;
var imageElement;
var mouseupScreenX, mouseupScreenY;

addMessageListener("easyGesturesN@ngdeleito.eu:removeMessageListeners", removeMessageListeners);

addEventListener("mousedown", handleMousedown, true);
addEventListener("mouseup", handleMouseup, true);
addEventListener("keydown", handleKeydown, true);
addEventListener("keyup", handleKeyup, true);
addEventListener("contextmenu", handleContextmenu, true);

addMessageListener("easyGesturesN@ngdeleito.eu:addFavicon", addFavicon);
addMessageListener("easyGesturesN@ngdeleito.eu:showMenu", showMenu);
addMessageListener("easyGesturesN@ngdeleito.eu:setActionStatus", setActionStatus);
addMessageListener("easyGesturesN@ngdeleito.eu:setReloadActionStatus", setReloadActionStatus);
addMessageListener("easyGesturesN@ngdeleito.eu:setHideImagesActionStatus", setHideImagesStatus);
addMessageListener("easyGesturesN@ngdeleito.eu:updateMenuSign", updateMenuSign);
addMessageListener("easyGesturesN@ngdeleito.eu:updateContextualMenuSign", updateContextualMenuSign);
addMessageListener("easyGesturesN@ngdeleito.eu:showMenuTooltips", showMenuTooltips);
addMessageListener("easyGesturesN@ngdeleito.eu:addMousemoveListener", addMousemoveListener);
addMessageListener("easyGesturesN@ngdeleito.eu:removeMousemoveListener", removeMousemoveListener);
addMessageListener("easyGesturesN@ngdeleito.eu:handleHideLayout", handleHideLayout);
addMessageListener("easyGesturesN@ngdeleito.eu:close", close);
addMessageListener("easyGesturesN@ngdeleito.eu:removeMenu", removeMenu);

addMessageListener("easyGesturesN@ngdeleito.eu:action:pageTop", runPageTopAction);
addMessageListener("easyGesturesN@ngdeleito.eu:action:pageBottom", runPageBottomAction);
addMessageListener("easyGesturesN@ngdeleito.eu:action:autoscrolling", runAutoscrollingAction);
addMessageListener("easyGesturesN@ngdeleito.eu:action:zoomIn", runZoomInAction);
addMessageListener("easyGesturesN@ngdeleito.eu:action:zoomOut", runZoomOutAction);
addMessageListener("easyGesturesN@ngdeleito.eu:action:hideImages", runHideImagesAction);

function removeMessageListeners() {
  removeMessageListener("easyGesturesN@ngdeleito.eu:removeMessageListeners", removeMessageListeners);
  
  removeEventListener("mousedown", handleMousedown, true);
  removeEventListener("mouseup", handleMouseup, true);
  removeEventListener("keydown", handleKeydown, true);
  removeEventListener("keyup", handleKeyup, true);
  removeEventListener("contextmenu", handleContextmenu, true);
  
  removeMessageListener("easyGesturesN@ngdeleito.eu:addFavicon", addFavicon);
  removeMessageListener("easyGesturesN@ngdeleito.eu:showMenu", showMenu);
  removeMessageListener("easyGesturesN@ngdeleito.eu:setActionStatus", setActionStatus);
  removeMessageListener("easyGesturesN@ngdeleito.eu:setReloadActionStatus", setReloadActionStatus);
  removeMessageListener("easyGesturesN@ngdeleito.eu:setHideImagesActionStatus", setHideImagesStatus);
  removeMessageListener("easyGesturesN@ngdeleito.eu:updateMenuSign", updateMenuSign);
  removeMessageListener("easyGesturesN@ngdeleito.eu:updateContextualMenuSign", updateContextualMenuSign);
  removeMessageListener("easyGesturesN@ngdeleito.eu:showMenuTooltips", showMenuTooltips);
  removeMessageListener("easyGesturesN@ngdeleito.eu:addMousemoveListener", addMousemoveListener);
  removeMessageListener("easyGesturesN@ngdeleito.eu:removeMousemoveListener", removeMousemoveListener);
  removeMessageListener("easyGesturesN@ngdeleito.eu:handleHideLayout", handleHideLayout);
  removeMessageListener("easyGesturesN@ngdeleito.eu:close", close);
  removeMessageListener("easyGesturesN@ngdeleito.eu:removeMenu", removeMenu);
  
  removeMessageListener("easyGesturesN@ngdeleito.eu:action:pageTop", runPageTopAction);
  removeMessageListener("easyGesturesN@ngdeleito.eu:action:pageBottom", runPageBottomAction);
  removeMessageListener("easyGesturesN@ngdeleito.eu:action:autoscrolling", runAutoscrollingAction);
  removeMessageListener("easyGesturesN@ngdeleito.eu:action:zoomIn", runZoomInAction);
  removeMessageListener("easyGesturesN@ngdeleito.eu:action:zoomOut", runZoomOutAction);
  removeMessageListener("easyGesturesN@ngdeleito.eu:action:hideImages", runHideImagesAction);
}

function handleContextmenu(anEvent) {
  var result = sendSyncMessage("easyGesturesN@ngdeleito.eu:handleContextmenu", {
    shiftKey: anEvent.shiftKey,
    ctrlKey: anEvent.ctrlKey
  });
  if (result[0]) {
    anEvent.preventDefault();
  }
}

function cleanSelection(selection) {
  var result = selection.trim();
  // replace all linefeed, carriage return and tab characters with a space
  result = result.replace(/(\n|\r|\t)+/g, " ");
  return result;
}

function setContext(anHTMLElement, window) {
  // <a> elements cannot be nested
  // <a> elements cannot have <input> and <textarea> elements as descendants
  // <area>, <img> and <input> elements cannot have children
  // <textarea> cannot have other elements as children, only character data
  var inputBoxSelection = "";
  contextualMenus = [];
  anchorElement = null;
  imageElement = null;
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
    contextualMenus.push("contextTextbox");
  }
  else if (anHTMLElement instanceof window.HTMLTextAreaElement) {
    inputBoxSelection = anHTMLElement.value.substring(anHTMLElement.selectionStart,
                                                      anHTMLElement.selectionEnd);
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
}

function handleMousedown(anEvent) {
  const PREVENT_DEFAULT_AND_RETURN = 1;
  const LET_DEFAULT_AND_RETURN = 2;
  
  // we ignore non cancelable mousedown events like those issued for triggering
  // Firefox's autoscrolling
  if (!anEvent.cancelable) {
    return ;
  }
  var result = sendSyncMessage("easyGesturesN@ngdeleito.eu:performOpenMenuChecks", {
    button: anEvent.button,
    shiftKey: anEvent.shiftKey,
    ctrlKey: anEvent.ctrlKey
  });
  
  if (result[0] === PREVENT_DEFAULT_AND_RETURN) {
    anEvent.preventDefault();
    return ;
  }
  else if (result[0] === LET_DEFAULT_AND_RETURN) {
    return ;
  }
  
  anEvent.preventDefault();
  
  targetDocument = anEvent.target.ownerDocument;
  targetWindow = targetDocument.defaultView;
  topmostWindow = targetWindow.top;
  topmostDocument = topmostWindow.document;
  
  selection = cleanSelection(targetWindow.getSelection().toString());
  setContext(anEvent.target, targetWindow);
  
  var centerX = anEvent.clientX + targetWindow.mozInnerScreenX -
                                  topmostWindow.mozInnerScreenX;
  var centerY = anEvent.clientY + targetWindow.mozInnerScreenY -
                                  topmostWindow.mozInnerScreenY;
  
  result = sendSyncMessage("easyGesturesN@ngdeleito.eu:handleMousedown", {
    contextualMenus: contextualMenus,
    selection: selection,
    anchorElementExists: anchorElement !== null,
    anchorElementHREF: anchorElement !== null ? anchorElement.href : null,
    anchorElementText: anchorElement !== null ? anchorElement.text : null,
    imageElementDoesntExist: imageElement === null,
    imageElementSRC: imageElement !== null ? imageElement.src : null,
    centerX: centerX,
    centerY: centerY,
    targetDocumentURL: targetDocument.URL,
    targetWindowScrollY: targetWindow.scrollY,
    targetWindowScrollMaxY: targetWindow.scrollMaxY,
    topmostWindowScrollY: topmostWindow.scrollY,
    topmostWindowScrollMaxY: topmostWindow.scrollMaxY
  });
}

function handleMouseup(anEvent) {
  var specialNodes = content.document.getElementById("eG_SpecialNodes");
  var linkSignIsVisible = false;
  if (specialNodes !== null) {
    var linkSign = specialNodes.childNodes[0];
    linkSignIsVisible = linkSign.style.visibility === "visible";
  }
  
  mouseupScreenX = anEvent.screenX;
  mouseupScreenY = anEvent.screenY;
  
  var result = sendSyncMessage("easyGesturesN@ngdeleito.eu:handleMouseup", {
    button: anEvent.button,
    linkSignIsVisible: linkSignIsVisible
  });
  if (result[0] !== undefined) {
    anEvent.preventDefault();
  }
}

function handleKeydown(anEvent) {
  var keyPressed = anEvent.keyCode;
  var result = sendSyncMessage("easyGesturesN@ngdeleito.eu:handleKeydown", {
    keyPressed: keyPressed
  });
  if (result[0]) {
    anEvent.preventDefault();
  }
}

function handleKeyup() {
  sendAsyncMessage("easyGesturesN@ngdeleito.eu:handleKeyup");
}

function removeMenuEventHandler(anEvent) {
  removeEventListener("pagehide", removeMenuEventHandler, true);
  var easyGesturesNode = anEvent.target.getElementById(easyGesturesID);
  easyGesturesNode.parentNode.removeChild(easyGesturesNode);
}

function createEasyGesturesNode(aDocument) {
  var easyGesturesNode = aDocument.createElementNS(HTMLNamespace, "div");
  easyGesturesNode.id = easyGesturesID;
  
  addEventListener("pagehide", removeMenuEventHandler, true);
  
  return easyGesturesNode;
}

function createSpecialNodes(aDocument, numberOfMainMenus, numberOfExtraMenus) {
  var specialNodesNode = aDocument.createElementNS(HTMLNamespace, "div");
  specialNodesNode.id = "eG_SpecialNodes";
  
  var linkSignNode = aDocument.createElementNS(HTMLNamespace, "div");
  linkSignNode.id = "eG_linkSign";
  specialNodesNode.appendChild(linkSignNode);
  
  var mainMenusSignNode = aDocument.createElementNS(HTMLNamespace, "div");
  mainMenusSignNode.id = "easyGesturesMainMenusSign";
  
  var i = numberOfMainMenus;
  while (i > 0) {
    let span = aDocument.createElementNS(HTMLNamespace, "span");
    mainMenusSignNode.appendChild(span);
    --i;
  }
  
  specialNodesNode.appendChild(mainMenusSignNode);
  
  var extraMenusSignNode = aDocument.createElementNS(HTMLNamespace, "div");
  extraMenusSignNode.id = "easyGesturesExtraMenusSign";
  
  i = numberOfExtraMenus;
  while (i > 0) {
    let span = aDocument.createElementNS(HTMLNamespace, "span");
    extraMenusSignNode.appendChild(span);
    --i;
  }
  
  specialNodesNode.appendChild(extraMenusSignNode);
  
  var contextMenuSignNode = aDocument.createElementNS(HTMLNamespace, "div");
  contextMenuSignNode.id = "easyGesturesContextMenuSign";
  specialNodesNode.appendChild(contextMenuSignNode);
  
  return specialNodesNode;
}

function addFavicon(aMessage) {
  var anActionNode = content.document.getElementById(aMessage.data.anActionNodeID);
  anActionNode.style.backgroundImage = "url('" + aMessage.data.aURL + "')";
}

function createActionsNodes(aDocument, aMessageData) {
  var anActionsNode = aDocument.createElementNS(HTMLNamespace, "div");
  anActionsNode.id = "eG_actions_" + aMessageData.layoutName;
  
  // creating actions images
  
  var offset = aMessageData.outerRadius - aMessageData.iconSize / 2;
  var imageR = (aMessageData.outerRadius + aMessageData.innerRadius) / 2;
  var angle = aMessageData.startingAngle;
  
  aMessageData.actions.forEach(function(action, index) {
    let xpos = imageR * Math.cos(angle) + offset;
    let ypos = -imageR * Math.sin(angle) + offset;
    
    let anActionNode = aDocument.createElementNS(HTMLNamespace, "div");
    anActionNode.id = "eG_action_" + aMessageData.layoutName + "_" + index;
    anActionNode.style.left = Math.round(xpos) + "px";
    anActionNode.style.top = Math.round(ypos) + "px";
    anActionNode.setAttribute("grayed", "false");
    anActionNode.setAttribute("active", "false");
    
    let iconName = action;
    
    if (action.startsWith("loadURL")) { // new icon path for loadURL ?
      if (aMessageData.loadURLActionPrefs[action][2] === "true") {
        sendAsyncMessage("easyGesturesN@ngdeleito.eu:retrieveAndAddFavicon", {
          aURL: aMessageData.loadURLActionPrefs[action][1],
          anActionNodeID: anActionNode.id
        });
        iconName = "customIcon";
      }
    }
    else if (action.startsWith("runScript")) { // new icon path for runScript ?
      if (aMessageData.runScriptActionPrefs[action][2] !== "") {
        anActionNode.style.backgroundImage =
          "url('" + (aMessageData.runScriptActionPrefs[action][2]).replace(/\\/g , "\\\\") + "')";
        iconName = "customIcon";
      }
    }
    
    anActionNode.setAttribute("class", (aMessageData.smallMenuTag +
                                       (aMessageData.noIcons ? "empty" : iconName)));
    anActionsNode.appendChild(anActionNode);
    angle += 2 * aMessageData.halfAngleForSector;
  });
  
  // creating menu image
  
  var menuImageNode = aDocument.createElementNS(HTMLNamespace, "img");
  menuImageNode.id = "eG_actions_" + aMessageData.layoutName + "_menu";
  menuImageNode.src = aMessageData.menuImage;
  menuImageNode.style.opacity = aMessageData.menuOpacity;
  menuImageNode.alt = "";
  anActionsNode.appendChild(menuImageNode);
  
  return anActionsNode;
}

function showMenu(aMessage) {
  easyGesturesID = aMessage.data.easyGesturesID;
  var bodyNode = content.document.body ? content.document.body :
                                         content.document.documentElement;
  var easyGesturesNode = content.document.getElementById(easyGesturesID);
  if (easyGesturesNode === null) {
    easyGesturesNode = createEasyGesturesNode(content.document);
    bodyNode.insertBefore(easyGesturesNode, bodyNode.firstChild);
  }
  
  easyGesturesNode.style.left = aMessage.data.centerX + "px";
  easyGesturesNode.style.top = aMessage.data.centerY + "px";
  
  var specialNodes = content.document.getElementById("eG_SpecialNodes");
  if (specialNodes === null) {
    specialNodes = createSpecialNodes(content.document,
                                      aMessage.data.numberOfMainMenus,
                                      aMessage.data.numberOfExtraMenus);
    easyGesturesNode.appendChild(specialNodes);
  }
  
  if (!aMessage.data.isExtraMenu) {
    if (aMessage.data.layoutName.startsWith("main")) {
      var mainMenusSign = specialNodes.childNodes[1];
      mainMenusSign.style.visibility = "visible";
    }
  }
  
  var actionsNode = content.document.getElementById("eG_actions_" + aMessage.data.layoutName);
  if (actionsNode === null) {
    actionsNode = createActionsNodes(content.document, aMessage.data);
    easyGesturesNode.appendChild(actionsNode);
  }
  actionsNode.style.visibility = "visible";
  
  // showing link sign
  var linkSign = specialNodes.childNodes[0];
  if (aMessage.data.showLinkSign) {
    linkSign.style.visibility = "visible";
    content.setTimeout(function() {
      linkSign.style.visibility = "hidden";
    }, aMessage.data.linksDelay);
  }
  else {
    linkSign.style.visibility = "hidden";
  }
}

function setActionStatusHelper(layoutName, actionSector, disabled) {
  var actionsNode = content.document.getElementById("eG_actions_" + layoutName);
  var actionNode = actionsNode.childNodes[actionSector];
  actionNode.setAttribute("grayed", disabled.toString());
}

function setActionStatus(aMessage) {
  setActionStatusHelper(aMessage.data.layoutName, aMessage.data.actionSector,
                                                  aMessage.data.status);
}

function setReloadActionStatus(aMessage) {
  var actionsNode = content.document.getElementById("eG_actions_" + aMessage.data.layoutName);
  var actionNode = actionsNode.childNodes[aMessage.data.actionSector];
  actionNode.classList.toggle("stop", aMessage.data.status);
  actionNode.classList.toggle("reload", !aMessage.data.status);
}

function setHideImagesStatus(aMessage) {
  var disabled = content.document.querySelectorAll("img:not([id^='eG_'])").length === 0;
  setActionStatusHelper(aMessage.data.layoutName, aMessage.data.actionSector,
                                                  disabled);
}

function updateMenuSign(aMessage) {
  var specialNodes = content.document.getElementById("eG_SpecialNodes");
  var menusSign = specialNodes.childNodes[aMessage.data.menuSign];
  
  menusSign.childNodes[aMessage.data.previousLayoutNumber].removeAttribute("class");
  menusSign.childNodes[aMessage.data.layoutNumber].className = "active";
}

function updateContextualMenuSign(aMessage) {
  var specialNodes = content.document.getElementById("eG_SpecialNodes");
  var contextMenuSign = specialNodes.childNodes[3];
  
  contextMenuSign.textContent = aMessage.data.layoutLabel;
  contextMenuSign.style.visibility = "visible";
  if (aMessage.data.moreThanOneLayout) {
    contextMenuSign.className = "withAltSign";
  }
  else {
    contextMenuSign.removeAttribute("class");
  }
}

function createTooltipsNodes(aDocument, aMessageData) {
  var aTooltipsNode = aDocument.createElementNS(HTMLNamespace, "div");
  aTooltipsNode.id = "eG_labels_" + aMessageData.layoutName;
  
  aMessageData.tooltips.forEach(function(tooltip, index) {
    let aTooltipNode = aDocument.createElementNS(HTMLNamespace, "div");
    aTooltipNode.id = "eG_label_" + aMessageData.layoutName + "_" + index;
    aTooltipNode.classList.add("label" + index);
    aTooltipNode.appendChild(aDocument.createTextNode(tooltip));
    aTooltipsNode.appendChild(aTooltipNode);
  });
  if (aMessageData.hasExtraMenuAction) {
    aTooltipsNode.childNodes[extraMenuAction].classList.add("extra");
  }
  
  return aTooltipsNode;
}

function showMenuTooltips(aMessage) {
  var easyGesturesNode = content.document.getElementById(easyGesturesID);
  var tooltipsNode = content.document.getElementById("eG_labels_" + aMessage.data.layoutName);
  if (tooltipsNode === null) {
    tooltipsNode = createTooltipsNodes(content.document, aMessage.data);
    easyGesturesNode.appendChild(tooltipsNode);
  }
  tooltipsNode.style.visibility = "visible";
}

function addMousemoveListener() {
  addEventListener("mousemove", handleMousemove, true);
}

function removeMousemoveListener() {
  removeEventListener("mousemove", handleMousemove, true);
}

function hideLinkSign() {
  var specialNodes = content.document.getElementById("eG_SpecialNodes");
  var linkSign = specialNodes.childNodes[0];
  linkSign.style.visibility = "hidden";
}

function updateMenuPosition(centerX, centerY) {
  var easyGesturesNode = content.document.getElementById(easyGesturesID);
  easyGesturesNode.style.left = centerX + "px";
  easyGesturesNode.style.top = centerY + "px";
}

function clearHoverEffect(sector, layoutName, actionsLength) {
  var actionsNode = content.document.getElementById("eG_actions_" + layoutName);
  var tooltipsNode = content.document.getElementById("eG_labels_" + layoutName);
  
  if (sector >= 0 && sector < actionsLength) {
    actionsNode.childNodes[sector].setAttribute("active", "false");
    if (tooltipsNode !== null) {
      tooltipsNode.childNodes[sector].classList.remove("selected");
    }
  }
}

function setHoverEffect(sector, layoutName, actionsLength) {
  var actionsNode = content.document.getElementById("eG_actions_" + layoutName);
  var tooltipsNode = content.document.getElementById("eG_labels_" + layoutName);
  
  if (sector >= 0 && sector < actionsLength) {
    actionsNode.childNodes[sector].setAttribute("active", "true");
    if (tooltipsNode !== null) {
      tooltipsNode.childNodes[sector].classList.add("selected");
    }
  }
}

function showExtraMenu(layoutName) {
  var actionsNode = content.document.getElementById("eG_actions_" + layoutName);
  var specialNodes = content.document.getElementById("eG_SpecialNodes");
  var mainMenusSign = specialNodes.childNodes[1];
  var extraMenusSign = specialNodes.childNodes[2];
  var tooltipsNode = content.document.getElementById("eG_labels_" + layoutName);
  
  actionsNode.childNodes[extraMenuAction].setAttribute("extraMenuShowing", "true");
  
  mainMenusSign.style.visibility = "hidden";
  extraMenusSign.style.visibility = "visible";
  
  // hide main menu tooltips after extra menu showed
  if (tooltipsNode !== null) {
    tooltipsNode.style.visibility = "hidden";
  }
}

function hideExtraMenu(layoutName, sector, layoutActionsLength, baseLayoutName) {
  var baseActionsNode = content.document.getElementById("eG_actions_" + baseLayoutName);
  var specialNodes = content.document.getElementById("eG_SpecialNodes");
  var mainMenusSign = specialNodes.childNodes[1];
  var extraMenusSign = specialNodes.childNodes[2];
  
  // reset rollover of extra menu action icon in main menu
  baseActionsNode.childNodes[extraMenuAction].setAttribute("extraMenuShowing", "false");
  
  hide(layoutName, sector, layoutActionsLength, baseLayoutName);
  
  mainMenusSign.style.visibility = "visible";
  extraMenusSign.style.visibility = "hidden";
}

function handleMousemove(anEvent) {
  hideLinkSign();
  
  // anEvent.target differs depending on whether the mouse button is pressed or
  // not; if pressed we reuse the original targetWindow value, if not we
  // reconstruct it
  var localTargetWindow = anEvent.target.ownerDocument === null ?
                            targetWindow :
                            anEvent.target.ownerDocument.defaultView;
  var localTopmostWindow = localTargetWindow.top;
  var positionX = anEvent.clientX + localTargetWindow.mozInnerScreenX -
                                    localTopmostWindow.mozInnerScreenX;
  var positionY = anEvent.clientY + localTargetWindow.mozInnerScreenY -
                                    localTopmostWindow.mozInnerScreenY;
  var result = sendSyncMessage("easyGesturesN@ngdeleito.eu:handleMousemove", {
    positionX: positionX,
    positionY: positionY,
    shiftKey: anEvent.shiftKey,
    movementX: anEvent.movementX,
    movementY: anEvent.movementY
  });
  if (result[0].centerX !== undefined) {
    updateMenuPosition(result[0].centerX, result[0].centerY);
  }
  else {
    if (result[0].oldSector !== result[0].newSector) {
      clearHoverEffect(result[0].oldSector, result[0].layoutName, result[0].actionsLength);
      setHoverEffect(result[0].newSector, result[0].layoutName, result[0].actionsLength);
    }
    if (result[0].showExtraMenu) {
      showExtraMenu(result[0].layoutName);
    }
    else if (result[0].hideExtraMenu) {
      hideExtraMenu(result[0].layoutName, result[0].newSector, result[0].actionsLength, result[0].baseLayoutName);
    }
  }
}

function hide(layoutName, sector, layoutActionsLength, baseLayoutName) { // makes menu invisible
  var actionsNode = content.document.getElementById("eG_actions_" + layoutName);
  var tooltipsNode = content.document.getElementById("eG_labels_" + layoutName);
  var specialNodes = content.document.getElementById("eG_SpecialNodes");
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
    actionsNode.childNodes[sector].setAttribute("active", "false");
    if (tooltipsNode !== null) {
      tooltipsNode.childNodes[sector].classList.remove("selected");
    }
  }
  
  // reset rollover for extra menu in base menu if needed
  if (baseLayoutName !== "") {
    var baseActionsNode = content.document.getElementById("eG_actions_" + baseLayoutName);
    var baseTooltipsNode = content.document.getElementById("eG_labels_" + baseLayoutName);
    baseActionsNode.childNodes[extraMenuAction].setAttribute("extraMenuShowing", "false");
    baseActionsNode.childNodes[extraMenuAction].setAttribute("active", "false");
    if (baseTooltipsNode !== null) {
      baseTooltipsNode.childNodes[extraMenuAction].classList.remove("selected");
    }
  }
}

function handleHideLayout(aMessage) {
  hide(aMessage.data.layoutName, aMessage.data.sector,
       aMessage.data.layoutActionsLength, aMessage.data.baseLayoutName);
}

function close(aMessage) {
  if (content === null) {
    return ;
  }
  
  var specialNodes = content.document.getElementById("eG_SpecialNodes");
  var mainMenusSign = specialNodes.childNodes[1];
  var extraMenusSign = specialNodes.childNodes[2];
  
  hide(aMessage.data.layoutName, aMessage.data.sector,
       aMessage.data.layoutActionsLength, aMessage.data.baseLayoutName);
  if (aMessage.data.layoutIsExtraMenu) {
    // hide base menu too if closing is done from extra menu
    hide(aMessage.data.baseLayoutName, aMessage.data.sector,
         aMessage.data.baseLayoutActionsLength, aMessage.data.baseLayoutName);
    
    extraMenusSign.style.visibility = "hidden";
  }
  mainMenusSign.style.visibility = "hidden";
}

function removeMenu() {
  removeEventListener("pagehide", removeMenuEventHandler, true);
  var easyGesturesNode = content.document.getElementById(easyGesturesID);
  if (easyGesturesNode !== null) {
    easyGesturesNode.parentNode.removeChild(easyGesturesNode);
  }
}

function runPageTopAction() {
  if (targetWindow.scrollY !== 0) {
    targetWindow.scroll(0, 0);
  }
  else {
    topmostWindow.scroll(0, 0);
  }
}

function runPageBottomAction() {
  if (targetWindow.scrollY !== targetWindow.scrollMaxY) {
    targetWindow.scroll(0, targetWindow.scrollMaxY);
  }
  else {
    topmostWindow.scroll(0, topmostWindow.scrollMaxY);
  }
}

function runAutoscrollingAction() {
  // see chrome://global/content/browser-content.js: we simulate a middle
  // button (non cancelable) mousedown event to trigger Firefox's autoscrolling
  content.document.documentElement.dispatchEvent(new content.MouseEvent("mousedown", {
    view: content,
    bubbles: true,
    button: 1,
    screenX: mouseupScreenX,
    screenY: mouseupScreenY
  }));
}

function runZoomInAction() {
  // double image size only
  var width = imageElement.style.width === "" ?
    imageElement.width * 2 + "px" :
    parseInt(imageElement.style.width, 10) * 2 + "px";
  
  var height = imageElement.style.height === "" ?
    imageElement.height * 2 + "px" :
    parseInt(imageElement.style.height, 10) * 2 + "px";
  
  imageElement.style.width = width;
  imageElement.style.height = height;
}

function runZoomOutAction() {
  // halve image size only
  var width = imageElement.style.width === "" ?
    imageElement.width * 0.5 + "px" :
    parseInt(imageElement.style.width, 10) * 0.5 + "px";
  
  var height = imageElement.style.height === "" ?
    imageElement.height * 0.5 + "px" :
    parseInt(imageElement.style.height, 10) * 0.5 + "px";
  
  imageElement.style.width = width;
  imageElement.style.height = height;
}

function runHideImagesAction() {
  var images = content.document.querySelectorAll("img:not([id^='eG_'])");
  for (var i=0; i < images.length; ++i) {
    images[i].style.display = "none";
  }
}