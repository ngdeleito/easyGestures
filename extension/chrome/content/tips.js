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

The Original Code is easyGestures.

The Initial Developer of the Original Code is Ons Besbes.

Contributor(s): ngdeleito

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


/* exported onloadHandler, tipLinkClick */
/* global Components, eGStrings, document, eGPrefs, Services, window,
          removeEventListener, sizeToContent */

Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("chrome://easygestures/content/eGStrings.jsm");
Components.utils.import("chrome://easygestures/content/eGPrefs.jsm");

function tipEntry(label, imageClass, paneName, tabNumber) {
  this.label = label;
  this.imageClass = imageClass; // image source
  this.paneName = paneName;
  this.tabNumber = tabNumber;
}

var tips = [
  new tipEntry("tips.openButton",                "triggerBySelection",  "activation",     undefined),
  new tipEntry("tips.dragToAction",              "triggerByStroke",     ""          ,     undefined),
  new tipEntry("tips.openAltMenu",               "alternativeMenus",    "activation",     undefined),
  new tipEntry("tips.menusCustomization",        "builtInAction",       "menus",          "0"),
  new tipEntry("tips.openExtraMenu",             "empty",               "",               undefined),
  new tipEntry("tips.clickOnLink",               "clickOnLink",         "behavior",       undefined),
  new tipEntry("tips.tooltips",                  "noTooltips",          "behavior",       undefined),
  new tipEntry("tips.searchWebAction",           "empty",               "",               undefined),
  new tipEntry("tips.backAndForwardSiteActions", "empty",               "",               undefined),
  new tipEntry("tips.loadURLActions",            "bookmarksOnlyLayout", "customizations", "0"),
  new tipEntry("tips.advancedLoadURLActions",    "empty",               "customizations", "0"),
  new tipEntry("tips.runScriptActions",          "programsAndScripts",  "customizations", "1"),
  new tipEntry("tips.contextualMenus",           "contextual",          "activation",     undefined),
  new tipEntry("tips.preventOpen",               "empty",               "activation",     undefined),
  new tipEntry("tips.moveMenu",                  "moveMenu",            "",               undefined),
  new tipEntry("tips.smallIcons",                "smallIcons",          "behavior",       undefined),
  new tipEntry("tips.largeMenu",                 "largeMenu",           "behavior",       undefined),
  new tipEntry("tips.autoscrolling",             "empty",               "behavior",       undefined),
  new tipEntry("tips.zoomOnImage",               "empty",               "",               undefined),
  new tipEntry("tips.openLinkAction",            "empty",               "customizations", "2"),
  new tipEntry("tips.dailyReadingsAction",       "empty",               "customizations", "2")
];
tips.forEach(function(tip) {
  tip.description = eGStrings.getString(tip.label);
});

var tipNbr;

function onloadHandler() {
  document.title = eGStrings.getString("tips") + " " + document.title;
  var showTipsCheckbox = document.getElementById("showTips");
  showTipsCheckbox.label = eGStrings.getString("general.startupTips");
  showTipsCheckbox.checked = eGPrefs.areStartupTipsOn();
  document.getElementById("previousButton").label = eGStrings.getString("tips.previous");
  document.getElementById("nextButton").label = eGStrings.getString("tips.next");
  document.getElementById("closeButton").label = eGStrings.getString("close");
  try {
    tipNbr = eGPrefs.getTipNumberPref();
  }
  catch (ex) {
    tipNbr = 1;
  }
  updateTipNbr(0);
}

function updateTipNbr(step) {
  tipNbr = (((tipNbr + step) % tips.length) + tips.length) % tips.length;
  eGPrefs.setTipNumberPref(tipNbr);
  updateContent(tipNbr);
}

function showPaneAndTabOn(paneName, tabNumber, doc) {
  var pane = doc.getElementById(paneName + "Pane");
  doc.getElementById("eG_optionsWindow").showPane(pane);
  if (tabNumber !== undefined) {
    var tabbox = doc.getElementById(paneName + "Tabboxes");
    tabbox.selectedIndex = tabNumber;
  }
}

function openPreferencesWith(paneName, tabNumber) {
  var winenum = Services.wm.getEnumerator("");
  var found = false;
  var win;
  while (winenum.hasMoreElements() && !found) {
    win = winenum.getNext();
    found = win.location.toString() === "chrome://easygestures/content/options.xul";
  }
  if (!found) {
    win = window.openDialog("chrome://easygestures/content/options.xul", "", "");
    win.addEventListener("load", function runOnLoad() {
      removeEventListener("load", runOnLoad, false);
      showPaneAndTabOn(paneName, tabNumber, win.document);
    }, false);
  }
  else {
    showPaneAndTabOn(paneName, tabNumber, win.document);
    win.focus();
  }
}

function tipLinkClick() {
  var paneName = tips[tipNbr].paneName;
  var tabNumber = tips[tipNbr].tabNumber;
  openPreferencesWith(paneName, tabNumber);
}

function updateContent(tipNbr) {
  // we extract a potential link from the description; links are contained
  // inside square brackets (with no space after the opening bracket and no
  // space before the closing bracket): "text1 [link] text2"
  var text = tips[tipNbr].description.split(/\[\s{0}(\S.*\S)\s{0}\]/);
  var linkText = "";
  
  // we resolve the locale strings that constitute the link text
  if (text.length > 1) {
    let linkTextStrings = text[1].split("/");
    linkText = linkTextStrings.map(function(label) {
      return eGStrings.getString(label);
    }).join("/");
  }
  
  document.getElementById("tipNbrDisplay").value = (tipNbr + 1) + " / " + tips.length;
  document.getElementById("tipTextBeforeLink").textContent = text[0];
  document.getElementById("tipTextLink").textContent = linkText;
  document.getElementById("tipTextAfterLink").textContent = text[2];
  document.getElementById("tipImage").setAttribute("class", tips[tipNbr].imageClass);
  sizeToContent();
}
