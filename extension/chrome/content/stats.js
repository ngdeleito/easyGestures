/***** BEGIN LICENSE BLOCK *****
Version: MPL 1.1/GPL 2.0/LGPL 2.1

The contents of this file are subject to the Mozilla Public License Version 1.1
(the "License"); you may not use this file except in compliance with the
License. You may obtain a copy of the License at http://www.mozilla.org/MPL/

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for
the specific language governing rights and limitations under the License.

The Original Code is easyGestures.

The Initial Developer of the Original Code is Ons Besbes.

Contributor(s): ngdeleito

Alternatively, the contents of this file may be used under the terms of either
the GNU General Public License Version 2 or later (the "GPL"), or the GNU
Lesser General Public License Version 2.1 or later (the "LGPL"), in which case
the provisions of the GPL or the LGPL are applicable instead of those above. If
you wish to allow use of your version of this file only under the terms of
either the GPL or the LGPL, and not to allow others to use your version of this
file under the terms of the MPL, indicate your decision by deleting the
provisions above and replace them with the notice and other provisions required
by the GPL or the LGPL. If you do not delete the provisions above, a recipient
may use your version of this file under the terms of any one of the MPL, the
GPL or the LGPL.

***** END LICENSE BLOCK *****/


/* exported statsLoadHandler */
/* global Components, document, eGPrefs, eGActions, eGStrings */

Components.utils.import("chrome://easygestures/content/eGPrefs.jsm");
Components.utils.import("chrome://easygestures/content/eGActions.jsm");
Components.utils.import("chrome://easygestures/content/eGStrings.jsm");

function createRow1(id) {
  var div = document.createElement("div");
  div.id = id;
  div.className = "row1";
  return div;
}

function createRow2(id1, id2) {
  var div = document.createElement("div");
  div.className = "row2";
  
  var span = document.createElement("span");
  span.id = id1;
  div.appendChild(span);
  
  span = document.createElement("span");
  span.id = id2;
  div.appendChild(span);
  
  return div;
}

function createLabelsforMiddleRow(id1, id2) {
  var div = document.createElement("div");
  
  var div2 = document.createElement("div");
  div2.id = id1;
  div.appendChild(div2);
  
  if (!eGPrefs.isLargeMenuOff()) {
    div2 = document.createElement("div");
    div2.id = id2;
    div.appendChild(div2);
  }
  
  return div;
}

function createRowTotal(id) {
  var div = document.createElement("div");
  div.id = id;
  div.className = "row1";
  div.setAttribute("style", "font-weight: bold; font-size:medium");
  return div;
}

function fillMainMenuDirections(layout) {
  var container = document.getElementById(layout + "MainMenu");
  
  container.appendChild(createRow1(layout + "MainMenuSector2"));
  container.appendChild(createRow2(layout + "MainMenuSector3",
                                   layout + "MainMenuSector1"));
  
  var div = document.createElement("div");
  div.className = "row3";
  container.appendChild(div);
  
  div.appendChild(createLabelsforMiddleRow(layout + "MainMenuSector4",
                                           layout + "MainMenuSector5"));
  
  var img = document.createElement("img");
  img.setAttribute("src", "mainMenu.png");
  img.setAttribute("width", "41");
  img.setAttribute("height", "41");
  div.appendChild(img);
  
  div.appendChild(createLabelsforMiddleRow(layout + "MainMenuSector0",
                                           layout + "MainMenuSector9"));
  
  container.appendChild(createRow2(layout + "MainMenuSector6",
                                   layout + "MainMenuSector8"));
  container.appendChild(createRow1(layout + "MainMenuSector7"));
  
  container.appendChild(createRowTotal(layout + "MainMenuTotal"));
}

function fillExtraMenuDirections(layout) {
  var container = document.getElementById(layout + "ExtraMenu");
  
  container.appendChild(createRow1(layout + "ExtraMenuSector2"));
  container.appendChild(createRow2(layout + "ExtraMenuSector3",
                                   layout + "ExtraMenuSector1"));
  
  var div = document.createElement("div");
  div.className = "row3";
  container.appendChild(div);
  
  var div2 = document.createElement("div");
  div2.id = layout + "ExtraMenuSector4";
  div.appendChild(div2);
  
  var img = document.createElement("img");
  img.setAttribute("src", "extraMenu.png");
  img.setAttribute("width", "41");
  img.setAttribute("height", "41");
  div.appendChild(img);
  
  div2 = document.createElement("div");
  div2.id = layout + "ExtraMenuSector0";
  div.appendChild(div2);
  
  container.appendChild(createRowTotal(layout + "ExtraMenuTotal"));
}

function fillActions(statsActions, totalClicks) {
  var container = document.getElementById("clicksByActions");
  
  // we start at the action that follow the "empty" action
  var currentAction = eGActions.empty.nextAction;
  while (currentAction !== null) {
    let clicksForAction = statsActions[currentAction];
    let count = Math.round(clicksForAction / totalClicks * 1000) / 10;
    if (count > 1) {
      count = Math.round(count);
    }
    
    let div = document.createElement("div");
    div.setAttribute("title",
      eGActions[currentAction].getLocalizedActionName() + ": " +
      clicksForAction + " " + eGStrings.getString("stats.clicks"));
    container.appendChild(div);
    
    let span = document.createElement("span");
    span.className = "eG_" + currentAction;
    div.appendChild(span);
    
    let img = document.createElement("span");
    img.style.width = count / 2 + "px";
    div.appendChild(img);
    
    span = document.createElement("span");
    span.textContent = clicksForAction > 0 ?
                         (count > 0.1 ? count + "%" : "<0.1%") : "–";
    div.appendChild(span);
    
    currentAction = eGActions[currentAction].nextAction;
  }
}

function statsLoadHandler() {
  document.title = eGStrings.getString("stats") + " " + document.title;
  document.getElementById("lastResetLabel").textContent =
    eGStrings.getString("stats.lastReset");
  document.getElementById("clicksByActionsLabel").textContent =
    eGStrings.getString("stats.actions");
  document.getElementById("clicksByDirectionsLabel").textContent =
    eGStrings.getString("stats.directions");
  document.getElementById("mainMenuLabel").textContent =
    eGStrings.getString("menus.main");
  document.getElementById("primaryMenuLabel").textContent =
    eGStrings.getString("menus.primary");
  document.getElementById("alt1MenuLabel").textContent =
    eGStrings.getString("menus.alternative1");
  document.getElementById("alt2MenuLabel").textContent =
    eGStrings.getString("menus.alternative2");
  document.getElementById("allMenusLabel").textContent =
    eGStrings.getString("stats.allMenus");
  document.getElementById("extraMenuLabel").textContent =
    eGStrings.getString("menus.extra");
  
  fillMainMenuDirections("primary");
  fillMainMenuDirections("alt1");
  fillMainMenuDirections("alt2");
  fillMainMenuDirections("allMenus");
  fillExtraMenuDirections("primary");
  fillExtraMenuDirections("alt1");
  fillExtraMenuDirections("alt2");
  fillExtraMenuDirections("allMenus");
  
  var statsClicksOnActions = 0;
  
  var statsMainArray = eGPrefs.getStatsMainMenuPref();
  var statsExtraArray = eGPrefs.getStatsExtraMenuPref();
  var statsActions = eGPrefs.getStatsActionsPref();
  
  var statsLastReset = eGPrefs.getStatsLastResetPref();
  
  document.getElementById("lastReset").textContent = statsLastReset;
  
  for (let action in statsActions) {
    statsClicksOnActions += statsActions[action];
  }
  if (statsClicksOnActions === 0) {
    statsClicksOnActions = 1; //just avoiding division by 0 to prevent displaying NaN
  }
  
  var totalMP = 0;
  var totalEP = 0;
  var totalMA1 = 0;
  var totalEA1 = 0;
  var totalMA2 = 0;
  var totalEA2 = 0;
  
  fillActions(statsActions, statsClicksOnActions - statsActions.empty);
  
  var sectors = eGPrefs.isLargeMenuOff() ? [0, 1, 2, 3, 4, 6, 7, 8]
                                         : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  sectors.forEach(function (i) {
    document.getElementById("primaryMainMenuSector"+String(i)).textContent=Math.round(statsMainArray[i]/statsClicksOnActions*100)+"%";
    document.getElementById("alt1MainMenuSector"+String(i)).textContent=Math.round(statsMainArray[10+i]/statsClicksOnActions*100)+"%";
    document.getElementById("alt2MainMenuSector"+String(i)).textContent=Math.round(statsMainArray[20+i]/statsClicksOnActions*100)+"%";
    document.getElementById("allMenusMainMenuSector"+String(i)).textContent=Math.round((statsMainArray[i]+statsMainArray[10+i]+statsMainArray[20+i])/statsClicksOnActions*100)+"%";
    totalMP+=statsMainArray[i];
    totalMA1+=statsMainArray[10+i];
    totalMA2+=statsMainArray[20+i];
  });
  
  [0, 1, 2, 3, 4].forEach(function(i) {
    document.getElementById("primaryExtraMenuSector"+String(i)).textContent=Math.round(statsExtraArray[i]/statsClicksOnActions*100)+"%";
    document.getElementById("alt1ExtraMenuSector"+String(i)).textContent=Math.round(statsExtraArray[5+i]/statsClicksOnActions*100)+"%";
    document.getElementById("alt2ExtraMenuSector"+String(i)).textContent=Math.round(statsExtraArray[10+i]/statsClicksOnActions*100)+"%";
    document.getElementById("allMenusExtraMenuSector"+String(i)).textContent=Math.round((statsExtraArray[i]+statsExtraArray[5+i]+statsExtraArray[10+i])/statsClicksOnActions*100)+"%";
    totalEP+=statsExtraArray[i];
    totalEA1+=statsExtraArray[5+i];
    totalEA2+=statsExtraArray[10+i];
  });
  
  document.getElementById("primaryMainMenuTotal").textContent=Math.round(totalMP/statsClicksOnActions*100)+"%";
  document.getElementById("primaryExtraMenuTotal").textContent=Math.round(totalEP/statsClicksOnActions*100)+"%";
  
  document.getElementById("alt1MainMenuTotal").textContent=Math.round(totalMA1/statsClicksOnActions*100)+"%";
  document.getElementById("alt1ExtraMenuTotal").textContent=Math.round(totalEA1/statsClicksOnActions*100)+"%";
  
  document.getElementById("alt2MainMenuTotal").textContent=Math.round(totalMA2/statsClicksOnActions*100)+"%";
  document.getElementById("alt2ExtraMenuTotal").textContent=Math.round(totalEA2/statsClicksOnActions*100)+"%";
  
  document.getElementById("allMenusMainMenuTotal").textContent= Math.round((totalMP + totalMA1+totalMA2)/statsClicksOnActions*100)+"%";
  document.getElementById("allMenusExtraMenuTotal").textContent=Math.round((totalEP + totalEA1+totalEA2)/statsClicksOnActions*100)+"%";
}
