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


/* global addStatelessListeners, removeStatelessListeners, addMessageListener,
          removeMessageListener, addEventListener, removeEventListener,
          sendSyncMessage, sendAsyncMessage, content, HTML_NAMESPACE,
          cleanSelection, setContext, createSpecialNodes, createActionsNodes,
          hideLinkSign, updateMenuPosition, clearHoverEffect, setHoverEffect,
          showExtraMenu, hideExtraMenu */

var easyGesturesID;
var targetDocument, targetWindow, topmostWindow;
var selection, contextualMenus, anchorElement, imageElement;
var mouseupScreenX, mouseupScreenY;

Components.utils.import("chrome://easygestures/content/menu-frame-module.jsm");
addStatelessListeners(this);

addMessageListener("easyGesturesN@ngdeleito.eu:removeListeners", removeListeners);

addEventListener("mousedown", handleMousedown, true);
addEventListener("mouseup", handleMouseup, true);
addEventListener("keydown", handleKeydown, true);
addEventListener("contextmenu", handleContextmenu, true);

addMessageListener("easyGesturesN@ngdeleito.eu:showMenu", showMenu);
addMessageListener("easyGesturesN@ngdeleito.eu:addMousemoveListener", addMousemoveListener);
addMessageListener("easyGesturesN@ngdeleito.eu:removeMousemoveListener", removeMousemoveListener);
addMessageListener("easyGesturesN@ngdeleito.eu:removeMenu", removeMenu);

addMessageListener("easyGesturesN@ngdeleito.eu:action:pageTop", runPageTopAction);
addMessageListener("easyGesturesN@ngdeleito.eu:action:pageBottom", runPageBottomAction);
addMessageListener("easyGesturesN@ngdeleito.eu:action:autoscrolling", runAutoscrollingAction);
addMessageListener("easyGesturesN@ngdeleito.eu:action:zoomIn", runZoomInAction);
addMessageListener("easyGesturesN@ngdeleito.eu:action:zoomOut", runZoomOutAction);

function removeListeners() {
  removeStatelessListeners(this);
  // unloading the module results in an error message in the console, so no
  // unload at this moment
  
  removeMessageListener("easyGesturesN@ngdeleito.eu:removeListeners", removeListeners);
  
  removeEventListener("mousedown", handleMousedown, true);
  removeEventListener("mouseup", handleMouseup, true);
  removeEventListener("keydown", handleKeydown, true);
  removeEventListener("contextmenu", handleContextmenu, true);
  
  removeMessageListener("easyGesturesN@ngdeleito.eu:showMenu", showMenu);
  removeMessageListener("easyGesturesN@ngdeleito.eu:addMousemoveListener", addMousemoveListener);
  removeMessageListener("easyGesturesN@ngdeleito.eu:removeMousemoveListener", removeMousemoveListener);
  removeMessageListener("easyGesturesN@ngdeleito.eu:removeMenu", removeMenu);
  
  removeMessageListener("easyGesturesN@ngdeleito.eu:action:pageTop", runPageTopAction);
  removeMessageListener("easyGesturesN@ngdeleito.eu:action:pageBottom", runPageBottomAction);
  removeMessageListener("easyGesturesN@ngdeleito.eu:action:autoscrolling", runAutoscrollingAction);
  removeMessageListener("easyGesturesN@ngdeleito.eu:action:zoomIn", runZoomInAction);
  removeMessageListener("easyGesturesN@ngdeleito.eu:action:zoomOut", runZoomOutAction);
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
  
  selection = cleanSelection(targetWindow.getSelection().toString());
  [selection, contextualMenus, anchorElement, imageElement] =
    setContext(anEvent.target, targetWindow, selection);
  
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
  sendAsyncMessage("easyGesturesN@ngdeleito.eu:handleKeydown", {
    keyPressed: anEvent.keyCode
  });
}

function removeMenuEventHandler(anEvent) {
  removeEventListener("pagehide", removeMenuEventHandler, true);
  var easyGesturesNode = anEvent.target.getElementById(easyGesturesID);
  easyGesturesNode.parentNode.removeChild(easyGesturesNode);
}

function createEasyGesturesNode(aDocument) {
  var easyGesturesNode = aDocument.createElementNS(HTML_NAMESPACE, "div");
  easyGesturesNode.id = easyGesturesID;
  
  addEventListener("pagehide", removeMenuEventHandler, true);
  
  return easyGesturesNode;
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
    actionsNode = createActionsNodes(this, content.document, aMessage.data);
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

function addMousemoveListener() {
  addEventListener("mousemove", handleMousemove, true);
}

function removeMousemoveListener() {
  removeEventListener("mousemove", handleMousemove, true);
}

function handleMousemove(anEvent) {
  hideLinkSign(content.document);
  
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
    let easyGesturesNode = content.document.getElementById(easyGesturesID);
    updateMenuPosition(easyGesturesNode, result[0].centerX, result[0].centerY);
  }
  else {
    if (result[0].oldSector !== result[0].newSector) {
      clearHoverEffect(content.document, result[0].oldSector, result[0].layoutName, result[0].actionsLength);
      setHoverEffect(content.document, result[0].newSector, result[0].layoutName, result[0].actionsLength);
    }
    if (result[0].showExtraMenu) {
      showExtraMenu(content.document, result[0].layoutName);
    }
    else if (result[0].hideExtraMenu) {
      hideExtraMenu(content.document, result[0].layoutName, result[0].newSector, result[0].actionsLength, result[0].baseLayoutName);
    }
  }
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
