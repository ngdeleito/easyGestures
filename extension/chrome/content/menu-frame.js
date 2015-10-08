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


/* global addMessageListener, removeMessageListener, content */

var HTMLNamespace = "http://www.w3.org/1999/xhtml";
var easyGesturesID;
var extraMenuAction = 2;

addMessageListener("easyGesturesN@ngdeleito.eu:removeMessageListeners", removeMessageListeners);

addMessageListener("easyGesturesN@ngdeleito.eu:showMenu", showMenu);
addMessageListener("easyGesturesN@ngdeleito.eu:showMenuTooltips", showMenuTooltips);
addMessageListener("easyGesturesN@ngdeleito.eu:updateMenuPosition", updateMenuPosition);
addMessageListener("easyGesturesN@ngdeleito.eu:hideLinkSign", hideLinkSign);

function removeMessageListeners() {
  removeMessageListener("easyGesturesN@ngdeleito.eu:removeMessageListeners", removeMessageListeners);
  removeMessageListener("easyGesturesN@ngdeleito.eu:showMenu", showMenu);
  removeMessageListener("easyGesturesN@ngdeleito.eu:showMenuTooltips", showMenuTooltips);
  removeMessageListener("easyGesturesN@ngdeleito.eu:updateMenuPosition", updateMenuPosition);
  removeMessageListener("easyGesturesN@ngdeleito.eu:hideLinkSign", hideLinkSign);
}

function removeMenu(anEvent) {
  var easyGesturesNode = anEvent.target.getElementById(easyGesturesID);
  easyGesturesNode.parentNode.removeChild(easyGesturesNode);
}

function createEasyGesturesNode(aDocument) {
  var easyGesturesNode = aDocument.createElementNS(HTMLNamespace, "div");
  easyGesturesNode.id = easyGesturesID;
  
  aDocument.defaultView.addEventListener("unload", removeMenu, true);
  
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

function addFavicon(aURL, anHTMLElement) {
  if (aURL === "") {
    return ;
  }
  
  if (aURL.match(/\:\/\//i) === null) {
    aURL = "http://" + aURL;
  }
  
  var faviconService = Components
                         .classes["@mozilla.org/browser/favicon-service;1"]
                         .getService(Components.interfaces.mozIAsyncFavicons);
  faviconService.getFaviconURLForPage(Services.io.newURI(aURL, null, null), function(aURI) {
    anHTMLElement.style.backgroundImage =
      "url('" + (aURI !== null ? aURI.spec : "") + "')";
  });
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
        addFavicon(aMessageData.loadURLActionPrefs[action][1], anActionNode);
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

function hideLinkSign() {
  var specialNodes = content.document.getElementById("eG_SpecialNodes");
  var linkSign = specialNodes.childNodes[0];
  linkSign.style.visibility = "hidden";
}

function updateMenuPosition(aMessage) {
  var easyGesturesNode = content.document.getElementById(easyGesturesID);
  easyGesturesNode.style.left = aMessage.data.centerX + "px";
  easyGesturesNode.style.top = aMessage.data.centerY + "px";
}
