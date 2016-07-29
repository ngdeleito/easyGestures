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


/* exported tipsLoadHandler, tipsUnloadHandler, tipLinkClick,
            updateShowTipsCheckbox */
/* global Components, eGStrings, document, eGPrefs, Services, window,
          removeEventListener */

Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("chrome://easygestures/content/eGStrings.jsm");
Components.utils.import("chrome://easygestures/content/eGPrefs.jsm");

function tipEntry(label, paneName, tabNumber) {
  this.label = label;
  this.imageClass = label.slice("tips.".length);
  this.paneName = paneName;
  this.tabNumber = tabNumber;
}

var tips = [
  new tipEntry("tips.openButton",                "activation",     undefined),
  new tipEntry("tips.dragToAction",              ""          ,     undefined),
  new tipEntry("tips.openAltMenu",               "activation",     undefined),
  new tipEntry("tips.menusCustomization",        "menus",          "0"),
  new tipEntry("tips.openExtraMenu",             "",               undefined),
  new tipEntry("tips.clickOnLink",               "behavior",       undefined),
  new tipEntry("tips.tooltips",                  "behavior",       undefined),
  new tipEntry("tips.searchWebAction",           "",               undefined),
  new tipEntry("tips.backAndForwardSiteActions", "",               undefined),
  new tipEntry("tips.loadURLActions",            "customizations", "0"),
  new tipEntry("tips.advancedLoadURLActions",    "customizations", "0"),
  new tipEntry("tips.runScriptActions",          "customizations", "1"),
  new tipEntry("tips.contextualMenus",           "activation",     undefined),
  new tipEntry("tips.preventOpen",               "activation",     undefined),
  new tipEntry("tips.moveMenu",                  "",               undefined),
  new tipEntry("tips.smallIcons",                "behavior",       undefined),
  new tipEntry("tips.largeMenu",                 "behavior",       undefined),
  new tipEntry("tips.autoscrolling",             "behavior",       undefined),
  new tipEntry("tips.zoomOnImage",               "",               undefined),
  new tipEntry("tips.openLinkAction",            "customizations", "2"),
  new tipEntry("tips.dailyReadingsAction",       "customizations", "2")
];
tips.forEach(function(tip) {
  tip.description = eGStrings.getString(tip.label);
});

var generalPrefBranch;
var tipNumber;

function setShowTipsCheckbox() {
  document.getElementById("showTipsCheckbox").checked =
    eGPrefs.areStartupTipsOn();
}

function tipsLoadHandler() {
  generalPrefBranch = Services.prefs.getBranch("extensions.easygestures.general.");
  generalPrefBranch.addObserver("startupTips", setShowTipsCheckbox, false);
  
  document.title = eGStrings.getString("tips") + " " + document.title;
  setShowTipsCheckbox();
  document.getElementById("showTipsLabel").textContent =
    eGStrings.getString("general.startupTips");
  document.getElementById("previousButton").value =
    eGStrings.getString("tips.previous");
  document.getElementById("nextButton").value =
    eGStrings.getString("tips.next");
  try {
    tipNumber = eGPrefs.getTipNumberPref();
  }
  catch (ex) {
    tipNumber = 1;
  }
  updateTipNbr(0);
}

function tipsUnloadHandler() {
  eGPrefs.setTipNumberPref((tipNumber + 1) % tips.length);
  generalPrefBranch.removeObserver("startupTips", setShowTipsCheckbox);
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
  
  document.getElementById("tipNumber").textContent = (tipNbr + 1) + " / " +
                                                     tips.length;
  document.getElementById("tipTextBeforeLink").textContent = text[0];
  document.getElementById("tipTextLink").textContent = linkText;
  document.getElementById("tipTextAfterLink").textContent = text[2];
  document.getElementById("tipImage").setAttribute("class",
                                                   tips[tipNbr].imageClass);
}

function updateTipNbr(step) {
  tipNumber = (((tipNumber + step) % tips.length) + tips.length) % tips.length;
  eGPrefs.setTipNumberPref(tipNumber);
  updateContent(tipNumber);
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
  var paneName = tips[tipNumber].paneName;
  var tabNumber = tips[tipNumber].tabNumber;
  openPreferencesWith(paneName, tabNumber);
}

function updateShowTipsCheckbox() {
  eGPrefs.toggleStartupTips();
}
