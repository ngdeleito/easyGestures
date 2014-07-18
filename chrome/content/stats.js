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


function createRow1(id) {
  var row = document.createElement("hbox");
  row.setAttribute("pack", "center");
  
  var label = document.createElement("label");
  label.setAttribute("id", id);
  label.setAttribute("value", "0%");
  row.appendChild(label);
  
  return row;
}

function createRow2(id1, id2) {
  var row = document.createElement("hbox");
  
  var spacer = document.createElement("spacer");
  spacer.setAttribute("flex", "1");
  row.appendChild(spacer);
  
  var label = document.createElement("label");
  label.setAttribute("id", id1);
  label.setAttribute("value", "0%");
  row.appendChild(label);
  
  spacer = document.createElement("spacer");
  spacer.setAttribute("flex", "1");
  row.appendChild(spacer);
  
  label = document.createElement("label");
  label.setAttribute("id", id2);
  label.setAttribute("value", "0%");
  row.appendChild(label);
  
  spacer = document.createElement("spacer");
  spacer.setAttribute("flex", "1");
  row.appendChild(spacer);
  
  return row;
}

function createLabelsforMiddleRow(id1, id2) {
  var vbox = document.createElement("vbox");
  vbox.setAttribute("pack", "center");
  
  var label = document.createElement("label");
  label.setAttribute("id", id1);
  label.setAttribute("value", "0%");
  vbox.appendChild(label);
  
  label = document.createElement("label");
  label.setAttribute("id", id2);
  label.setAttribute("value", "0%");
  if (eGPrefs.isLargeMenuOff()) {
    label.setAttribute("style", "display: none");
  }
  vbox.appendChild(label);
  
  return vbox;
}

function createRowTotal(id) {
  var row = document.createElement("hbox");
  row.setAttribute("pack", "center");
  
  var label = document.createElement("label");
  label.setAttribute("id", id);
  label.setAttribute("style", "font-weight: bold; font-size:medium");
  label.setAttribute("value", "0%");
  row.appendChild(label);
  
  return row;
}

function fillMainMenuDirections(layout) {
  var target = document.getElementById("gr_Main" + layout);
  
  var vbox = document.createElement("vbox");
  target.appendChild(vbox);
  
  vbox.appendChild(createRow1("main" + layout + "Sector0"));
  vbox.appendChild(createRow2("main" + layout + "Sector9",
                              "main" + layout + "Sector1"));
  
  var row = document.createElement("hbox");
  row.setAttribute("pack", "center");
  vbox.appendChild(row);
  
  row.appendChild(createLabelsforMiddleRow("main" + layout + "Sector8",
                                           "main" + layout + "Sector7"));
  
  var image = document.createElement("image");
  image.setAttribute("tooltiptext", "&stats.main;");
  image.setAttribute("src", "mainMenu.png");
  image.setAttribute("width", "41");
  image.setAttribute("height", "41");
  row.appendChild(image);
  
  row.appendChild(createLabelsforMiddleRow("main" + layout + "Sector2",
                                           "main" + layout + "Sector3"));
  
  vbox.appendChild(createRow2("main" + layout + "Sector6",
                              "main" + layout + "Sector4"));
  vbox.appendChild(createRow1("main" + layout + "Sector5"));
  
  var separator = document.createElement("separator");
  separator.setAttribute("style", "height: 1em");
  vbox.appendChild(separator);
  
  vbox.appendChild(createRowTotal("main" + layout));
}

function fillExtraMenuDirections(layout) {
  var target = document.getElementById("gr_Extra" + layout);
  
  var vbox = document.createElement("vbox");
  target.appendChild(vbox);
  
  vbox.appendChild(createRow1("extra" + layout + "Sector0"));
  vbox.appendChild(createRow2("extra" + layout + "Sector7",
                              "extra" + layout + "Sector1"));
  
  var hbox = document.createElement("hbox");
  hbox.setAttribute("align", "center");
  vbox.appendChild(hbox);
  
  var label = document.createElement("label");
  label.setAttribute("id", "extra" + layout + "Sector6");
  label.setAttribute("value", "0%");
  hbox.appendChild(label);
  
  var image = document.createElement("image");
  image.setAttribute("tooltiptext", "&stats.extra;");
  image.setAttribute("src", "extraMenu.png");
  image.setAttribute("width", "41");
  image.setAttribute("height", "41");
  hbox.appendChild(image);
  
  label = document.createElement("label");
  label.setAttribute("id", "extra" + layout + "Sector2");
  label.setAttribute("value", "0%");
  hbox.appendChild(label);
  
  var separator = document.createElement("separator");
  separator.setAttribute("style", "height: 1em");
  vbox.appendChild(separator);
  
  vbox.appendChild(createRowTotal("extra" + layout));
}

function fillActions() {
  var target = document.getElementById("statsActionsTab");
  
  for (var n=0; n<5; n++) {	// number of columns
    var vbox = document.createElement("vbox");
    target.appendChild(vbox);
    
    var grid = document.createElement("grid");
    vbox.appendChild(grid);
    
    var columns = document.createElement("columns");
    grid.appendChild(columns);
    
    var column = document.createElement("column");
    column.setAttribute("flex","1");
    columns.appendChild(column);
    
    column = document.createElement("column");
    column.setAttribute("flex","1");
    columns.appendChild(column);
    
    var rows = document.createElement("rows");
    grid.appendChild(rows);
    
    var actionNames = Object.getOwnPropertyNames(window.opener.eGActions);
    // excluding "empty" action from the actionNames array
    actionNames.splice(actionNames.indexOf("empty"), 1);
    for (var i=n*19; i<(n+1)*19 && i < actionNames.length; i++) {
      // 19 rows per column
      
      var row = document.createElement("row");
      rows.appendChild(row);
      
      vbox = document.createElement("vbox");
      row.appendChild(vbox);
      
      var hbox = document.createElement("hbox");
      vbox.appendChild(hbox);
      
      var image = document.createElement("image");
      image.setAttribute("id", "eG_image" + actionNames[i]);
      image.setAttribute("tooltiptext",
        window.opener.eGActions[actionNames[i]].getXULLabel());
      image.setAttribute("class", "small_" + actionNames[i]);
      hbox.appendChild(image);
      
      var hbox2 = document.createElement("hbox");
      hbox2.setAttribute("align", "center");
      hbox2.setAttribute("style", "width: 80px;");
      hbox.appendChild(hbox2);
      
      var label = document.createElement("label");
      label.setAttribute("value", " ");
      hbox2.appendChild(label);
      
      image = document.createElement("image");
      image.setAttribute("id", "eG_bar" + actionNames[i]);
      image.setAttribute("src", "chrome://easygestures/content/bar.png");
      image.setAttribute("maxwidth", "40");
      image.setAttribute("width", "0");
      image.setAttribute("height", "20");
      hbox2.appendChild(image);
      
      label = document.createElement("label");
      label.setAttribute("id", "eG_action" + actionNames[i]);
      label.setAttribute("value", "0%");
      hbox2.appendChild(label);
      
      var separator = document.createElement("separator");
      separator.setAttribute("class", "thin");
      vbox.appendChild(separator);
    }
  }
}

function initDialog() {
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
  
  var statsClicks = eGPrefs.getStatsClicksPref();
  var statsMenuShown = eGPrefs.getStatsMenuShownPref();
  var statsLastReset = eGPrefs.getStatsLastResetPref();
  
  if (statsClicks === 0) {
    statsClicks = 1; //just avoiding division by 0 to prevent displaying NaN
  }
  
  var use = statsMenuShown / statsClicks * 100;
  document.getElementById("eG_statsUse").value = Math.round(use) + "%";
  if (use < 10) {
    document.getElementById("eG_statsUseStars").width = "0px";
  }
  else if (use < 30) {
    document.getElementById("eG_statsUseStars").width = 20 + "px";
  }
  else if (use < 60) {
    document.getElementById("eG_statsUseStars").width = 20*2 + "px";
  }
  else {
    document.getElementById("eG_statsUseStars").width = 20*3 + "px";
  }
  
  document.getElementById("eG_statsLastReset").value = statsLastReset;
  
  var useComment = "";
  if (use < 10) {
    useComment = document.getElementById("eG_statsNovice").value;
  }
  else if (use < 30) {
    useComment = document.getElementById("eG_statsCoolUser").value;
  }
  else if (use < 60) {
    useComment = document.getElementById("eG_statsAddicted").value;
  }
  else {
    useComment = document.getElementById("eG_statsMaster").value;
  }
  document.getElementById("eG_statsUseComment").value = useComment;
  
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
      
      document.getElementById("eG_action" + actionName).value = (clicksForAction > 0 ? (count > 0.1 ? count + "%" : "<0.1%") : " _ ");
      document.getElementById("eG_bar" + actionName).width = count * scaleFactor;
      document.getElementById("eG_image" + actionName).setAttribute("tooltiptext", document.getElementById("eG_image" + actionName).getAttribute("tooltiptext") + " : " + clicksForAction);
    }
  }
  
  for (var i=0; i<10; i++) {
    document.getElementById("mainPrimarySector"+String(i)).value=Math.round(statsMainArray[i]/statsClicksOnActions*100)+"%";
    document.getElementById("mainAlternative1Sector"+String(i)).value=Math.round(statsMainArray[10+i]/statsClicksOnActions*100)+"%";
    document.getElementById("mainAlternative2Sector"+String(i)).value=Math.round(statsMainArray[20+i]/statsClicksOnActions*100)+"%";
    document.getElementById("mainTotalSector"+String(i)).value=Math.round((statsMainArray[i]+statsMainArray[10+i]+statsMainArray[20+i])/statsClicksOnActions*100)+"%";
    totalMP+=statsMainArray[i];
    totalMA1+=statsMainArray[10+i];
    totalMA2+=statsMainArray[20+i];
    if (i<8 && (i<2 || i>5)) {
      document.getElementById("extraPrimarySector"+String(i)).value=Math.round(statsExtraArray[i]/statsClicksOnActions*100)+"%";
      document.getElementById("extraAlternative1Sector"+String(i)).value=Math.round(statsExtraArray[8+i]/statsClicksOnActions*100)+"%";
      document.getElementById("extraAlternative2Sector"+String(i)).value=Math.round(statsExtraArray[16+i]/statsClicksOnActions*100)+"%";
      document.getElementById("extraTotalSector"+String(i)).value=Math.round((statsExtraArray[i]+statsExtraArray[8+i]+statsExtraArray[16+i])/statsClicksOnActions*100)+"%";
      totalEP+=statsExtraArray[i];
      totalEA1+=statsExtraArray[8+i];
      totalEA2+=statsExtraArray[16+i];
    }
  }
  
  document.getElementById("mainPrimary").value=Math.round(totalMP/statsClicksOnActions*100)+"%";
  document.getElementById("extraPrimary").value=Math.round(totalEP/statsClicksOnActions*100)+"%";
  
  document.getElementById("mainAlternative1").value=Math.round(totalMA1/statsClicksOnActions*100)+"%";
  document.getElementById("extraAlternative1").value=Math.round(totalEA1/statsClicksOnActions*100)+"%";
  
  document.getElementById("mainAlternative2").value=Math.round(totalMA2/statsClicksOnActions*100)+"%";
  document.getElementById("extraAlternative2").value=Math.round(totalEA2/statsClicksOnActions*100)+"%";
  
  document.getElementById("mainTotal").value= Math.round((totalMP + totalMA1+totalMA2)/statsClicksOnActions*100)+"%";
  document.getElementById("extraTotal").value=Math.round((totalEP + totalEA1+totalEA2)/statsClicksOnActions*100)+"%";
  
  this.sizeToContent();
}