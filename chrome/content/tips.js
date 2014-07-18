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


function tipEntry(tipLabelIndex, imageClass, paneName, tabNumber) {
  this.description = tipLabels[tipLabelIndex];
  this.imageClass = imageClass; // image source
  this.paneName = paneName;
  this.tabNumber = tabNumber;
}

var tips = [
  new tipEntry(0,  "triggerBySelection",  "activation",     "0"),
  new tipEntry(1,  "triggerByStroke",     ""          ,     "0"),
  new tipEntry(2,  "alternativeMenus",    "activation",     "0"),
  new tipEntry(3,  "builtInAction",       "menus",          "0"),
  new tipEntry(4,  "clickOnLink",         "",               "0"),
  new tipEntry(5,  "noTooltips",          "behavior",       "0"),
  new tipEntry(6,  "empty",               "",               "0"),
  new tipEntry(7,  "empty",               "",               "0"),
  new tipEntry(8,  "bookmarksOnlyLayout", "customizations", "0"),
  new tipEntry(9,  "programsAndScripts",  "customizations", "0"),
  new tipEntry(10, "contextual",          "activation",     "0"),
  new tipEntry(11, "suppressMenu",        "",               "0"),
  new tipEntry(12, "moveMenu",            "",               "0"),
  new tipEntry(13, "noIcons",             "behavior",       "0"),
  new tipEntry(14, "largeMenu",           "behavior",       "0"),
  new tipEntry(15, "empty",               "behavior",       "0"),
  new tipEntry(16, "empty",               "",               "0"),
  new tipEntry(17, "empty",               "",               "0"),
  new tipEntry(18, "empty",               "",               "0"),
  new tipEntry(19, "empty",               "",               "0")
];

var tipNbr;
document.getElementById("showTips").checked = eGPrefs.areStartupTipsOn();
try {
  tipNbr = eGPrefs.getTipNumberPref();
}
catch (ex) {
  tipNbr = 1;
}

function updateTipNbr(step) {
  tipNbr = (((tipNbr + step) % tips.length) + tips.length) % tips.length;
  eGPrefs.setTipNumberPref(tipNbr);
  updateContent(tipNbr);
}

function showPaneAndTabOn(paneName, tabNumber, doc) {
  var pane = doc.getElementById(paneName + "Pane");
  doc.getElementById("eG_optionsWindow").showPane(pane);
  if (tabNumber > 0) {
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
    found = win.location == "chrome://easygestures/content/options.xul";
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

function tipLinkClick(anEvent) {
  var paneName = tips[tipNbr].paneName;
  var tabNumber = tips[tipNbr].tabNumber;
  openPreferencesWith(paneName, tabNumber);
}

function updateContent(tipNbr) {
  document.getElementById("tipNbrDisplay").value = (tipNbr + 1) + " / " + tips.length;
  
  var text = tips[tipNbr].description.split("|")[0];
  var linkText = (tips[tipNbr].description.split("|").length > 1 ?
                    tips[tipNbr].description.split("|")[1]
                  : "");
  
  document.getElementById("tipText").textContent = text;
  document.getElementById("tipImage").setAttribute("class", tips[tipNbr].imageClass);
  document.getElementById("tipLink").textContent = linkText;
  sizeToContent();
}

function copyDescriptionToClipboard() {
  var description = tips[tipNbr].description.split("|")[0];
  Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper).copyString(description);
}