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


/* exported EXPORTED_SYMBOLS, HTML_NAMESPACE, EXTRA_MENU_ACTION,
            addStatelessListeners, removeStatelessListeners, cleanSelection,
            setContext, createSpecialNodes, createActionsNodes, hideLinkSign,
            updateMenuPosition, clearHoverEffect, setHoverEffect, hide,
            showExtraMenu, hideExtraMenu, clearMenuSign */

const EXPORTED_SYMBOLS = ["HTML_NAMESPACE", "EXTRA_MENU_ACTION",
                          "addStatelessListeners", "removeStatelessListeners",
                          "cleanSelection", "setContext", "createSpecialNodes",
                          "createActionsNodes", "hideLinkSign",
                          "updateMenuPosition", "clearHoverEffect",
                          "setHoverEffect", "hide", "showExtraMenu",
                          "hideExtraMenu", "clearMenuSign"];
const HTML_NAMESPACE = "http://www.w3.org/1999/xhtml";
const EXTRA_MENU_ACTION = 2;

function addStatelessListeners(frame) {
  frame.addMessageListener("easyGesturesN@ngdeleito.eu:addFavicon", addFavicon);
  frame.addMessageListener("easyGesturesN@ngdeleito.eu:setActionStatus", setActionStatus);
  frame.addMessageListener("easyGesturesN@ngdeleito.eu:setReloadActionStatus", setReloadActionStatus);
  frame.addMessageListener("easyGesturesN@ngdeleito.eu:setHideImagesActionStatus", setHideImagesActionStatus);
  frame.addMessageListener("easyGesturesN@ngdeleito.eu:updateMenuSign", updateMenuSign);
  frame.addMessageListener("easyGesturesN@ngdeleito.eu:updateContextualMenuSign", updateContextualMenuSign);
  frame.addMessageListener("easyGesturesN@ngdeleito.eu:showMenuTooltips", showMenuTooltips);
  frame.addMessageListener("easyGesturesN@ngdeleito.eu:handleHideLayout", handleHideLayout);
  
  frame.addMessageListener("easyGesturesN@ngdeleito.eu:action:hideImages", runHideImagesAction);
}

function removeStatelessListeners(frame) {
  frame.removeMessageListener("easyGesturesN@ngdeleito.eu:addFavicon", addFavicon);
  frame.removeMessageListener("easyGesturesN@ngdeleito.eu:setActionStatus", setActionStatus);
  frame.removeMessageListener("easyGesturesN@ngdeleito.eu:setReloadActionStatus", setReloadActionStatus);
  frame.removeMessageListener("easyGesturesN@ngdeleito.eu:setHideImagesActionStatus", setHideImagesActionStatus);
  frame.removeMessageListener("easyGesturesN@ngdeleito.eu:updateMenuSign", updateMenuSign);
  frame.removeMessageListener("easyGesturesN@ngdeleito.eu:updateContextualMenuSign", updateContextualMenuSign);
  frame.removeMessageListener("easyGesturesN@ngdeleito.eu:showMenuTooltips", showMenuTooltips);
  frame.removeMessageListener("easyGesturesN@ngdeleito.eu:handleHideLayout", handleHideLayout);
  
  frame.removeMessageListener("easyGesturesN@ngdeleito.eu:action:hideImages", runHideImagesAction);
}

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

function addFavicon(aMessage) {
  var document = aMessage.target.content.document;
  var anActionNode = document.getElementById(aMessage.data.anActionNodeID);
  anActionNode.style.backgroundImage = "url('" + aMessage.data.aURL + "')";
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
    anActionNode.setAttribute("grayed", "false");
    anActionNode.setAttribute("active", "false");
    
    let iconName = action;
    
    if (action.startsWith("loadURL")) { // new icon path for loadURL ?
      if (aMessageData.loadURLActionPrefs[action][2] === "true") {
        frame.sendAsyncMessage("easyGesturesN@ngdeleito.eu:retrieveAndAddFavicon", {
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
    
    anActionNode.setAttribute("class", aMessageData.noIcons ? "empty" : iconName);
    anActionsNode.appendChild(anActionNode);
    angle += 2 * aMessageData.halfAngleForSector;
  });
  
  return anActionsNode;
}

function setActionStatusHelper(document, layoutName, actionSector, disabled) {
  var actionsNode = document.getElementById("eG_actions_" + layoutName);
  var actionNode = actionsNode.childNodes[actionSector];
  actionNode.setAttribute("grayed", disabled.toString());
}

function setActionStatus(aMessage) {
  setActionStatusHelper(aMessage.target.content.document, aMessage.data.layoutName,
                        aMessage.data.actionSector, aMessage.data.status);
}

function setReloadActionStatus(aMessage) {
  var document = aMessage.target.content.document;
  var actionsNode = document.getElementById("eG_actions_" + aMessage.data.layoutName);
  var actionNode = actionsNode.childNodes[aMessage.data.actionSector];
  actionNode.classList.toggle("stop", aMessage.data.status);
  actionNode.classList.toggle("reload", !aMessage.data.status);
}

function setHideImagesActionStatus(aMessage) {
  var document = aMessage.target.content.document;
  var disabled = document.querySelectorAll("img").length === 0;
  setActionStatusHelper(document, aMessage.data.layoutName,
                        aMessage.data.actionSector, disabled);
}

function updateMenuSign(aMessage) {
  var specialNodes = aMessage.target.content.document.getElementById("eG_SpecialNodes");
  var menusSign = specialNodes.childNodes[aMessage.data.menuSign];
  
  menusSign.childNodes[aMessage.data.previousLayoutNumber].removeAttribute("class");
  menusSign.childNodes[aMessage.data.layoutNumber].className = "active";
}

function updateContextualMenuSign(aMessage) {
  var specialNodes = aMessage.target.content.document.getElementById("eG_SpecialNodes");
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
  var document = aMessage.target.content.document;
  var easyGesturesNode = document.getElementById(aMessage.data.easyGesturesID);
  var tooltipsNode = document.getElementById("eG_labels_" + aMessage.data.layoutName);
  if (tooltipsNode === null) {
    tooltipsNode = createTooltipsNodes(document, aMessage.data);
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
    actionsNode.childNodes[sector].setAttribute("active", "false");
    if (tooltipsNode !== null) {
      tooltipsNode.childNodes[sector].classList.remove("selected");
    }
  }
}

function setHoverEffect(aDocument, sector, layoutName, actionsLength) {
  var actionsNode = aDocument.getElementById("eG_actions_" + layoutName);
  var tooltipsNode = aDocument.getElementById("eG_labels_" + layoutName);
  
  if (sector >= 0 && sector < actionsLength) {
    actionsNode.childNodes[sector].setAttribute("active", "true");
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
    actionsNode.childNodes[sector].setAttribute("active", "false");
    if (tooltipsNode !== null) {
      tooltipsNode.childNodes[sector].classList.remove("selected");
    }
  }
  
  // reset rollover for extra menu in base menu if needed
  if (baseLayoutName !== "") {
    var baseActionsNode = aDocument.getElementById("eG_actions_" + baseLayoutName);
    var baseTooltipsNode = aDocument.getElementById("eG_labels_" + baseLayoutName);
    baseActionsNode.childNodes[EXTRA_MENU_ACTION].setAttribute("extraMenuShowing", "false");
    baseActionsNode.childNodes[EXTRA_MENU_ACTION].setAttribute("active", "false");
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
  
  actionsNode.childNodes[EXTRA_MENU_ACTION].setAttribute("extraMenuShowing", "true");
  
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
  baseActionsNode.childNodes[EXTRA_MENU_ACTION].setAttribute("extraMenuShowing", "false");
  
  hide(aDocument, layoutName, sector, layoutActionsLength, baseLayoutName);
  
  mainMenusSign.style.visibility = "visible";
  extraMenusSign.style.visibility = "hidden";
}

function handleHideLayout(aMessage) {
  hide(aMessage.target.content.document, aMessage.data.layoutName,
       aMessage.data.sector, aMessage.data.layoutActionsLength,
       aMessage.data.baseLayoutName);
}

function clearMenuSign(menuSign) {
  for (let i=0; i < menuSign.childNodes.length; ++i) {
    menuSign.childNodes[i].removeAttribute("class");
  }
}

function runHideImagesAction(aMessage) {
  var images = aMessage.target.content.document.querySelectorAll("img");
  for (var i=0; i < images.length; ++i) {
    images[i].style.display = "none";
  }
}
