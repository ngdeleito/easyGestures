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
  var container = document.getElementById("gr_Main" + layout);
  
  container.appendChild(createRow1("main" + layout + "Sector2"));
  container.appendChild(createRow2("main" + layout + "Sector3",
                                   "main" + layout + "Sector1"));
  
  var div = document.createElement("div");
  div.className = "row3";
  container.appendChild(div);
  
  div.appendChild(createLabelsforMiddleRow("main" + layout + "Sector4",
                                           "main" + layout + "Sector5"));
  
  var img = document.createElement("img");
  img.setAttribute("src", "mainMenu.png");
  img.setAttribute("width", "41");
  img.setAttribute("height", "41");
  div.appendChild(img);
  
  div.appendChild(createLabelsforMiddleRow("main" + layout + "Sector0",
                                           "main" + layout + "Sector9"));
  
  container.appendChild(createRow2("main" + layout + "Sector6",
                                   "main" + layout + "Sector8"));
  container.appendChild(createRow1("main" + layout + "Sector7"));
  
  container.appendChild(createRowTotal("main" + layout));
}

function fillExtraMenuDirections(layout) {
  var container = document.getElementById("gr_Extra" + layout);
  
  container.appendChild(createRow1("extra" + layout + "Sector2"));
  container.appendChild(createRow2("extra" + layout + "Sector3",
                                   "extra" + layout + "Sector1"));
  
  var div = document.createElement("div");
  div.className = "row3";
  container.appendChild(div);
  
  var div2 = document.createElement("div");
  div2.id = "extra" + layout + "Sector4";
  div.appendChild(div2);
  
  var img = document.createElement("img");
  img.setAttribute("src", "extraMenu.png");
  img.setAttribute("width", "41");
  img.setAttribute("height", "41");
  div.appendChild(img);
  
  div2 = document.createElement("div");
  div2.id = "extra" + layout + "Sector0";
  div.appendChild(div2);
  
  container.appendChild(createRowTotal("extra" + layout));
}

function fillActions() {
  var container = document.getElementById("statsActionsTab");
  
  // we start at the action that follow the "empty" action
  var currentAction = eGActions.empty.nextAction;
  while (currentAction !== null) {
    let div = document.createElement("div");
    container.appendChild(div);
    
    let span = document.createElement("span");
    span.id = "eG_image" + currentAction;
    span.className = "eG_" + currentAction;
    span.setAttribute("title",
      eGActions[currentAction].getLocalizedActionName());
    div.appendChild(span);
    
    let img = document.createElement("img");
    img.id = "eG_bar" + currentAction;
    img.setAttribute("src", "chrome://easygestures/content/bar.png");
    img.setAttribute("height", "20");
    div.appendChild(img);
    
    span = document.createElement("span");
    span.id = "eG_action" + currentAction;
    div.appendChild(span);
    
    currentAction = eGActions[currentAction].nextAction;
  }
}

function statsLoadHandler() {
  document.title = eGStrings.getString("stats") + " " + document.title;
  document.getElementById("lastResetLabel").textContent =
    eGStrings.getString("stats.lastReset");
  document.getElementById("clicksByActionsTab").textContent =
    eGStrings.getString("stats.actions");
  document.getElementById("clicksByDirectionsTab").textContent =
    eGStrings.getString("stats.directions");
  document.getElementById("mainMenuLabel").textContent =
    eGStrings.getString("menus.main");
  document.getElementById("primaryMenuLabel").textContent =
    eGStrings.getString("menus.primary");
  document.getElementById("alt1MenuLabel").textContent =
    eGStrings.getString("menus.alternative1");
  document.getElementById("alt2MenuLabel").textContent =
    eGStrings.getString("menus.alternative2");
  document.getElementById("allStatsLabel").textContent =
    eGStrings.getString("stats.all");
  document.getElementById("extraMenuLabel").textContent =
    eGStrings.getString("menus.extra");
  
  fillActions();
  fillMainMenuDirections("Primary");
  fillMainMenuDirections("Alternative1");
  fillMainMenuDirections("Alternative2");
  fillMainMenuDirections("Total");
  fillExtraMenuDirections("Primary");
  fillExtraMenuDirections("Alternative1");
  fillExtraMenuDirections("Alternative2");
  fillExtraMenuDirections("Total");
  
  var scaleFactor = 3;
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
  
  var clicksForEmptyAction = statsActions.empty;
  for (let actionName in statsActions) {
    if (actionName !== "empty") {
      var clicksForAction = statsActions[actionName];
      var count = Math.round(clicksForAction/(statsClicksOnActions - clicksForEmptyAction)*1000)/10;
      if (count > 1) {
        count = Math.round(count);
      }
      
      document.getElementById("eG_action" + actionName).textContent =
        (clicksForAction > 0 ? (count > 0.1 ? count + "%" : "<0.1%") : " _ ");
      document.getElementById("eG_bar" + actionName).width = count * scaleFactor;
      document.getElementById("eG_image" + actionName).setAttribute("title",
        document.getElementById("eG_image" + actionName).getAttribute("title") +
        " : " + clicksForAction);
    }
  }
  
  var sectors = eGPrefs.isLargeMenuOff() ? [0, 1, 2, 3, 4, 6, 7, 8]
                                         : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  sectors.forEach(function (i) {
    document.getElementById("mainPrimarySector"+String(i)).textContent=Math.round(statsMainArray[i]/statsClicksOnActions*100)+"%";
    document.getElementById("mainAlternative1Sector"+String(i)).textContent=Math.round(statsMainArray[10+i]/statsClicksOnActions*100)+"%";
    document.getElementById("mainAlternative2Sector"+String(i)).textContent=Math.round(statsMainArray[20+i]/statsClicksOnActions*100)+"%";
    document.getElementById("mainTotalSector"+String(i)).textContent=Math.round((statsMainArray[i]+statsMainArray[10+i]+statsMainArray[20+i])/statsClicksOnActions*100)+"%";
    totalMP+=statsMainArray[i];
    totalMA1+=statsMainArray[10+i];
    totalMA2+=statsMainArray[20+i];
    if (i < 5) {
      document.getElementById("extraPrimarySector"+String(i)).textContent=Math.round(statsExtraArray[i]/statsClicksOnActions*100)+"%";
      document.getElementById("extraAlternative1Sector"+String(i)).textContent=Math.round(statsExtraArray[5+i]/statsClicksOnActions*100)+"%";
      document.getElementById("extraAlternative2Sector"+String(i)).textContent=Math.round(statsExtraArray[10+i]/statsClicksOnActions*100)+"%";
      document.getElementById("extraTotalSector"+String(i)).textContent=Math.round((statsExtraArray[i]+statsExtraArray[5+i]+statsExtraArray[10+i])/statsClicksOnActions*100)+"%";
      totalEP+=statsExtraArray[i];
      totalEA1+=statsExtraArray[5+i];
      totalEA2+=statsExtraArray[10+i];
    }
  });
  
  document.getElementById("mainPrimary").textContent=Math.round(totalMP/statsClicksOnActions*100)+"%";
  document.getElementById("extraPrimary").textContent=Math.round(totalEP/statsClicksOnActions*100)+"%";
  
  document.getElementById("mainAlternative1").textContent=Math.round(totalMA1/statsClicksOnActions*100)+"%";
  document.getElementById("extraAlternative1").textContent=Math.round(totalEA1/statsClicksOnActions*100)+"%";
  
  document.getElementById("mainAlternative2").textContent=Math.round(totalMA2/statsClicksOnActions*100)+"%";
  document.getElementById("extraAlternative2").textContent=Math.round(totalEA2/statsClicksOnActions*100)+"%";
  
  document.getElementById("mainTotal").textContent= Math.round((totalMP + totalMA1+totalMA2)/statsClicksOnActions*100)+"%";
  document.getElementById("extraTotal").textContent=Math.round((totalEP + totalEA1+totalEA2)/statsClicksOnActions*100)+"%";
}
