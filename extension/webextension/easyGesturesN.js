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


/* exported showMenu, updateMenuSign, updateContextualMenuSign,
            showMenuTooltips, handleHideLayout, close */
/* global browser, eGPieMenu, addEventListener, removeEventListener, window,
          content, document */

const HTML_NAMESPACE = "http://www.w3.org/1999/xhtml";
const EXTRA_MENU_ACTION = 2;

var mousedownScreenX, mousedownScreenY, mouseupScreenX, mouseupScreenY;
var autoscrollingTrigger = null;
var targetDocument, targetWindow, topmostWindow;
var selection, contextualMenus, anchorElement, imageElement;
var easyGesturesID;
var eGContext = {};

browser.runtime.sendMessage({
  messageName: "handleContentScriptLoad"
}).then(aMessage => {
  for (let key in aMessage) {
    eGPieMenu.settings[key] = aMessage[key];
  }
  eGPieMenu.init();
});

addEventListener("mousedown", handleMousedown, true);
addEventListener("mouseup", handleMouseup, true);
addEventListener("keydown", handleKeydown, true);
addEventListener("contextmenu", handleContextmenu, true);

function cleanSelection(selection) {
  var result = selection.trim();
  // replace all linefeed, carriage return and tab characters with a space
  result = result.replace(/(\n|\r|\t)+/g, " ");
  return result;
}

function setContext(anHTMLElement, window, currentSelection) {
  // <a> elements cannot be nested
  // <a> elements cannot have <input> and <textarea> elements as descendants
  // <area>, <img> and <input> elements cannot have children
  // <textarea> cannot have other elements as children, only character data
  var inputBoxSelection = "";
  var contextualMenus = [];
  var anchorElement = null;
  var imageElement = null;
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
  return [selection, contextualMenus, anchorElement, imageElement];
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
  
  content.focus();
  
  eGContext.contextualMenus = contextualMenus;
  eGContext.selection = selection;
  eGContext.anchorElementExists = anchorElement !== null;
  eGContext.anchorElementHREF = anchorElement !== null ? anchorElement.href : null;
  eGContext.anchorElementText = anchorElement !== null ? anchorElement.text : null;
  eGContext.imageElementDoesntExist = imageElement === null;
  eGContext.imageElementSRC = imageElement !== null ? imageElement.src : null;
  eGPieMenu.centerX = centerX;
  eGPieMenu.centerY = centerY;
  eGContext.targetDocumentURL = targetDocument.URL;
  eGContext.targetWindowScrollY = targetWindow.scrollY;
  eGContext.targetWindowScrollMaxY = targetWindow.scrollMaxY;
  eGContext.topmostWindowScrollY = topmostWindow.scrollY;
  eGContext.topmostWindowScrollMaxY = topmostWindow.scrollMaxY;
  browser.runtime.sendMessage({
    messageName: "seteGContext",
    eGContext: eGContext
  });
  
  if (eGContext.contextualMenus.length !== 0 &&
      eGPieMenu.canContextualMenuBeOpened(anEvent.ctrlKey, anEvent.altKey)) {
    eGPieMenu.show(eGContext.contextualMenus[0]);
  }
  else {
    eGPieMenu.show("main");
  }
  
  if (eGPieMenu.settings.autoscrollingOn) {
    autoscrollingTrigger = window.setTimeout(function() {
      browser.runtime.sendMessage({
        messageName: "runAction",
        actionName: "autoscrolling",
        options: {
          useMousedownCoordinates: true
        }
      });
    }, eGPieMenu.settings.autoscrollingDelay);
  }
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

function removeMenuEventHandler(anEvent) {
  removeEventListener("pagehide", removeMenuEventHandler, true);
  var easyGesturesNode = anEvent.target.getElementById(easyGesturesID);
  easyGesturesNode.parentNode.removeChild(easyGesturesNode);
}

function createEasyGesturesNode(aDocument, menuOpacity) {
  var easyGesturesNode = aDocument.createElementNS(HTML_NAMESPACE, "div");
  easyGesturesNode.id = easyGesturesID;
  easyGesturesNode.style.opacity = menuOpacity;
  
  addEventListener("pagehide", removeMenuEventHandler, true);
  
  return easyGesturesNode;
}

function createSpecialNodes(aDocument, numberOfMainMenus, numberOfExtraMenus) {
  var specialNodesNode = aDocument.createElementNS(HTML_NAMESPACE, "div");
  specialNodesNode.id = "eG_SpecialNodes";
  
  var linkSignNode = aDocument.createElementNS(HTML_NAMESPACE, "div");
  linkSignNode.id = "eG_linkSign";
  specialNodesNode.appendChild(linkSignNode);
  
  var mainMenusSignNode = aDocument.createElementNS(HTML_NAMESPACE, "div");
  mainMenusSignNode.id = "easyGesturesMainMenusSign";
  
  var i = numberOfMainMenus;
  while (i > 0) {
    let span = aDocument.createElementNS(HTML_NAMESPACE, "span");
    mainMenusSignNode.appendChild(span);
    --i;
  }
  
  specialNodesNode.appendChild(mainMenusSignNode);
  
  var extraMenusSignNode = aDocument.createElementNS(HTML_NAMESPACE, "div");
  extraMenusSignNode.id = "easyGesturesExtraMenusSign";
  
  i = numberOfExtraMenus;
  while (i > 0) {
    let span = aDocument.createElementNS(HTML_NAMESPACE, "span");
    extraMenusSignNode.appendChild(span);
    --i;
  }
  
  specialNodesNode.appendChild(extraMenusSignNode);
  
  var contextMenuSignNode = aDocument.createElementNS(HTML_NAMESPACE, "div");
  contextMenuSignNode.id = "easyGesturesContextMenuSign";
  specialNodesNode.appendChild(contextMenuSignNode);
  
  return specialNodesNode;
}

function createActionsNodes(frame, aDocument, aMessageData) {
  var anActionsNode = aDocument.createElementNS(HTML_NAMESPACE, "div");
  anActionsNode.id = "eG_actions_" + aMessageData.layoutName;
  
  // creating actions images
  
  var offset = aMessageData.outerRadius - aMessageData.iconSize / 2;
  var imageR = (aMessageData.outerRadius + aMessageData.innerRadius) / 2;
  var angle = aMessageData.startingAngle;
  
  aMessageData.actions.forEach(function(action, index) {
    let xpos = imageR * Math.cos(angle) + offset;
    let ypos = -imageR * Math.sin(angle) + offset;
    
    let anActionNode = aDocument.createElementNS(HTML_NAMESPACE, "div");
    anActionNode.id = "eG_action_" + aMessageData.layoutName + "_" + index;
    anActionNode.style.left = Math.round(xpos) + "px";
    anActionNode.style.top = Math.round(ypos) + "px";
    
    let iconName = action;
    
    if (action.startsWith("loadURL")) { // new icon path for loadURL ?
      if (aMessageData.loadURLActionPrefs[action][2] === "true" &&
          aMessageData.loadURLActionPrefs[action][1] !== "") {
        browser.runtime.sendMessage({
          messageName: "retrieveAndAddFavicon",
          aURL: aMessageData.loadURLActionPrefs[action][1]
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
    else if (action.startsWith("runScript")) { // new icon path for runScript ?
      let iconPath = aMessageData.runScriptActionPrefs[action][2];
      if (iconPath !== "" && !aDocument.documentURI.startsWith("https://")) {
        anActionNode.style.backgroundImage =
          "url('" + iconPath.replace(/\\/g , "\\\\") + "')";
        iconName = "customIcon";
      }
    }
    
    anActionNode.className = iconName;
    anActionsNode.appendChild(anActionNode);
    angle += 2 * aMessageData.halfAngleForSector;
  });
  
  return anActionsNode;
}

function showMenu(aMessage) {
  easyGesturesID = aMessage.easyGesturesID;
  var bodyNode = content.document.body ? content.document.body :
                                         content.document.documentElement;
  var easyGesturesNode = content.document.getElementById(easyGesturesID);
  if (easyGesturesNode === null) {
    easyGesturesNode = createEasyGesturesNode(content.document, aMessage.menuOpacity);
    bodyNode.insertBefore(easyGesturesNode, bodyNode.firstChild);
  }
  
  easyGesturesNode.style.left = aMessage.centerX + "px";
  easyGesturesNode.style.top = aMessage.centerY + "px";
  
  var specialNodes = content.document.getElementById("eG_SpecialNodes");
  if (specialNodes === null) {
    specialNodes = createSpecialNodes(content.document,
                                      aMessage.numberOfMainMenus,
                                      aMessage.numberOfExtraMenus);
    easyGesturesNode.appendChild(specialNodes);
  }
  
  if (!aMessage.isExtraMenu) {
    if (aMessage.layoutName.startsWith("main")) {
      var mainMenusSign = specialNodes.childNodes[1];
      mainMenusSign.style.visibility = "visible";
    }
  }
  
  var actionsNode = content.document.getElementById("eG_actions_" + aMessage.layoutName);
  if (actionsNode === null) {
    actionsNode = createActionsNodes(this, content.document, aMessage);
    easyGesturesNode.appendChild(actionsNode);
  }
  actionsNode.style.visibility = "visible";
  
  // showing link sign
  var linkSign = specialNodes.childNodes[0];
  if (aMessage.showLinkSign) {
    linkSign.style.visibility = "visible";
    content.setTimeout(function() {
      linkSign.style.visibility = "hidden";
    }, aMessage.linksDelay);
  }
  else {
    linkSign.style.visibility = "hidden";
  }
  
  addEventListener("mousemove", handleMousemove, true);
}

function updateMenuSign(aMessage) {
  var specialNodes = content.document.getElementById("eG_SpecialNodes");
  var menusSign = specialNodes.childNodes[aMessage.menuSign];
  
  menusSign.childNodes[aMessage.previousLayoutNumber].removeAttribute("class");
  menusSign.childNodes[aMessage.layoutNumber].className = "active";
}

function updateContextualMenuSign(aMessage) {
  var specialNodes = content.document.getElementById("eG_SpecialNodes");
  var contextMenuSign = specialNodes.childNodes[3];
  
  contextMenuSign.textContent = aMessage.layoutLabel;
  contextMenuSign.style.visibility = "visible";
  if (aMessage.moreThanOneLayout) {
    contextMenuSign.className = "withAltSign";
  }
  else {
    contextMenuSign.removeAttribute("class");
  }
}

function createTooltipsNodes(aDocument, aMessageData) {
  var aTooltipsNode = aDocument.createElementNS(HTML_NAMESPACE, "div");
  aTooltipsNode.id = "eG_labels_" + aMessageData.layoutName;
  
  aMessageData.tooltips.forEach(function(tooltip, index) {
    let aTooltipNode = aDocument.createElementNS(HTML_NAMESPACE, "div");
    aTooltipNode.id = "eG_label_" + aMessageData.layoutName + "_" + index;
    aTooltipNode.classList.add("label" + index);
    aTooltipNode.appendChild(aDocument.createTextNode(tooltip));
    aTooltipsNode.appendChild(aTooltipNode);
  });
  if (aMessageData.hasExtraMenuAction) {
    aTooltipsNode.childNodes[EXTRA_MENU_ACTION].classList.add("extra");
  }
  
  return aTooltipsNode;
}

function showMenuTooltips(aMessage) {
  var document = content.document;
  var easyGesturesNode = document.getElementById(aMessage.easyGesturesID);
  var tooltipsNode = document.getElementById("eG_labels_" + aMessage.layoutName);
  if (tooltipsNode === null) {
    tooltipsNode = createTooltipsNodes(document, aMessage);
    easyGesturesNode.appendChild(tooltipsNode);
  }
  tooltipsNode.style.visibility = "visible";
}

function hideLinkSign(aDocument) {
  var specialNodes = aDocument.getElementById("eG_SpecialNodes");
  var linkSign = specialNodes.childNodes[0];
  linkSign.style.visibility = "hidden";
}

function updateMenuPosition(easyGesturesNode, centerX, centerY) {
  easyGesturesNode.style.left = centerX + "px";
  easyGesturesNode.style.top = centerY + "px";
}

function clearHoverEffect(aDocument, sector, layoutName, actionsLength) {
  var actionsNode = aDocument.getElementById("eG_actions_" + layoutName);
  var tooltipsNode = aDocument.getElementById("eG_labels_" + layoutName);
  
  if (sector >= 0 && sector < actionsLength) {
    actionsNode.childNodes[sector].classList.remove("selected");
    if (tooltipsNode !== null) {
      tooltipsNode.childNodes[sector].classList.remove("selected");
    }
  }
}

function setHoverEffect(aDocument, sector, layoutName, actionsLength) {
  var actionsNode = aDocument.getElementById("eG_actions_" + layoutName);
  var tooltipsNode = aDocument.getElementById("eG_labels_" + layoutName);
  
  if (sector >= 0 && sector < actionsLength) {
    actionsNode.childNodes[sector].classList.add("selected");
    if (tooltipsNode !== null) {
      tooltipsNode.childNodes[sector].classList.add("selected");
    }
  }
}

function hide(aDocument, layoutName, sector, layoutActionsLength, baseLayoutName) {
  var actionsNode = aDocument.getElementById("eG_actions_" + layoutName);
  var tooltipsNode = aDocument.getElementById("eG_labels_" + layoutName);
  var specialNodes = aDocument.getElementById("eG_SpecialNodes");
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
    var baseActionsNode = aDocument.getElementById("eG_actions_" + baseLayoutName);
    var baseTooltipsNode = aDocument.getElementById("eG_labels_" + baseLayoutName);
    baseActionsNode.childNodes[EXTRA_MENU_ACTION].classList.remove("showingExtraMenu");
    baseActionsNode.childNodes[EXTRA_MENU_ACTION].classList.remove("selected");
    if (baseTooltipsNode !== null) {
      baseTooltipsNode.childNodes[EXTRA_MENU_ACTION].classList.remove("selected");
    }
  }
}

function showExtraMenu(aDocument, layoutName) {
  var actionsNode = aDocument.getElementById("eG_actions_" + layoutName);
  var specialNodes = aDocument.getElementById("eG_SpecialNodes");
  var mainMenusSign = specialNodes.childNodes[1];
  var extraMenusSign = specialNodes.childNodes[2];
  var tooltipsNode = aDocument.getElementById("eG_labels_" + layoutName);
  
  actionsNode.childNodes[EXTRA_MENU_ACTION].classList.add("showingExtraMenu");
  
  mainMenusSign.style.visibility = "hidden";
  extraMenusSign.style.visibility = "visible";
  
  // hide main menu tooltips after extra menu showed
  if (tooltipsNode !== null) {
    tooltipsNode.style.visibility = "hidden";
  }
}

function hideExtraMenu(aDocument, layoutName, sector, layoutActionsLength, baseLayoutName) {
  var baseActionsNode = aDocument.getElementById("eG_actions_" + baseLayoutName);
  var specialNodes = aDocument.getElementById("eG_SpecialNodes");
  var mainMenusSign = specialNodes.childNodes[1];
  var extraMenusSign = specialNodes.childNodes[2];
  
  // reset rollover of extra menu action icon in main menu
  baseActionsNode.childNodes[EXTRA_MENU_ACTION].classList.remove("showingExtraMenu");
  
  hide(aDocument, layoutName, sector, layoutActionsLength, baseLayoutName);
  
  mainMenusSign.style.visibility = "visible";
  extraMenusSign.style.visibility = "hidden";
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
  
  // clear automatic delayed autoscrolling
  window.clearTimeout(autoscrollingTrigger);
  
  var result = eGPieMenu.handleMousemove({
    positionX: positionX,
    positionY: positionY,
    shiftKey: anEvent.shiftKey,
    movementX: anEvent.movementX,
    movementY: anEvent.movementY
  });
  if (result.centerX !== undefined) {
    let easyGesturesNode = content.document.getElementById(easyGesturesID);
    updateMenuPosition(easyGesturesNode, result.centerX, result.centerY);
  }
  else {
    if (result.oldSector !== result.newSector) {
      clearHoverEffect(content.document, result.oldSector, result.layoutName, result.actionsLength);
      setHoverEffect(content.document, result.newSector, result.layoutName, result.actionsLength);
    }
    if (result.showExtraMenu) {
      showExtraMenu(content.document, result.layoutName);
    }
    else if (result.hideExtraMenu) {
      hideExtraMenu(content.document, result.layoutName, result.newSector, result.actionsLength, result.baseLayoutName);
    }
  }
}

function handleHideLayout(aMessage) {
  hide(content.document, aMessage.layoutName, aMessage.sector,
       aMessage.layoutActionsLength, aMessage.baseLayoutName);
}

function clearMenuSign(menuSign) {
  for (let i=0; i < menuSign.childNodes.length; ++i) {
    menuSign.childNodes[i].removeAttribute("class");
  }
}

function close(aMessage) {
  if (content === null) {
    return ;
  }
  
  var specialNodes = content.document.getElementById("eG_SpecialNodes");
  var mainMenusSign = specialNodes.childNodes[1];
  var extraMenusSign = specialNodes.childNodes[2];
  
  hide(content.document, aMessage.layoutName, aMessage.sector,
       aMessage.layoutActionsLength, aMessage.baseLayoutName);
  if (aMessage.layoutIsExtraMenu) {
    // hide base menu too if closing is done from extra menu
    hide(content.document, aMessage.baseLayoutName, aMessage.sector,
         aMessage.baseLayoutActionsLength, aMessage.baseLayoutName);
    
    extraMenusSign.style.visibility = "hidden";
  }
  mainMenusSign.style.visibility = "hidden";
  
  clearMenuSign(mainMenusSign);
  clearMenuSign(extraMenusSign);
  
  removeEventListener("mousemove", handleMousemove, true);
}
