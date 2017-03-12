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


/* global window, browser, document */

window.addEventListener("load", tipsLoadHandler);
window.addEventListener("unload", tipsUnloadHandler);

function tipEntry(label, hash) {
  this.label = label;
  this.imageClass = label.slice("tips.".length);
  this.hash = hash;
}

var tips = [
  new tipEntry("tips.openButton",                "activation"),
  new tipEntry("tips.dragToAction",              ""),
  new tipEntry("tips.openAltMenu",               "activation"),
  new tipEntry("tips.menusCustomization",        "menus"),
  new tipEntry("tips.openExtraMenu",             ""),
  new tipEntry("tips.clickOnLink",               "behavior"),
  new tipEntry("tips.tooltips",                  "behavior"),
  new tipEntry("tips.searchWebAction",           ""),
  new tipEntry("tips.backAndForwardSiteActions", ""),
  new tipEntry("tips.loadURLActions",            "customizations"),
  new tipEntry("tips.advancedLoadURLActions",    "customizations"),
  new tipEntry("tips.runScriptActions",          "customizations_runScriptActions"),
  new tipEntry("tips.contextualMenus",           "activation"),
  new tipEntry("tips.preventOpen",               "activation"),
  new tipEntry("tips.moveMenu",                  ""),
  new tipEntry("tips.smallIcons",                "behavior"),
  new tipEntry("tips.largeMenu",                 "behavior"),
  new tipEntry("tips.autoscrolling",             "behavior"),
  new tipEntry("tips.zoomOnImage",               ""),
  new tipEntry("tips.openLinkAction",            "customizations_otherActions"),
  new tipEntry("tips.dailyReadingsAction",       "customizations_otherActions")
];
browser.runtime.sendMessage({
  messageName: "getLocalizedStrings",
  stringIDs: tips.map(tip => {
    return tip.label;
  })
}).then(aMessage => {
  tips.forEach(function(tip, index) {
    tip.description = aMessage.response[index];
  });
});

// var generalPrefBranch;
var tipNumber;

function updateContent(tipNbr) {
  // we extract a potential link from the description; links are contained
  // inside square brackets (with no space after the opening bracket and no
  // space before the closing bracket): "text1 [link] text2"
  var text = tips[tipNbr].description.split(/\[\s{0}(\S.*\S)\s{0}\]/);
  
  // we resolve the locale strings that constitute the link text
  if (text.length > 1) {
    browser.runtime.sendMessage({
      messageName: "getLocalizedStrings",
      stringIDs: text[1].split("/")
    }).then(aMessage => {
      document.getElementById("tipTextLink").textContent =
        aMessage.response.join("/");
    });
  }
  
  document.getElementById("tipNumber").textContent = (tipNbr + 1) + " / " +
                                                     tips.length;
  document.getElementById("tipTextBeforeLink").textContent = text[0];
  document.getElementById("tipTextLink").textContent = "";
  document.getElementById("tipTextAfterLink").textContent = text[2];
  document.getElementById("tipImage").className = tips[tipNbr].imageClass;
}

function updateTipNbr(step) {
  tipNumber = (((tipNumber + step) % tips.length) + tips.length) % tips.length;
  browser.runtime.sendMessage({
    messageName: "query_eGPrefs",
    methodName: "setTipNumberPref",
    parameter: tipNumber
  });
  updateContent(tipNumber);
}

function goToPreviousTip() {
  updateTipNbr(-1);
}

function goToNextTip() {
  updateTipNbr(+1);
}

function tipLinkClick() {
  var hash = tips[tipNumber].hash;
  browser.tabs.query({}).then(tabs => {
    let tipsTab = tabs.find(tab => {
      return tab.url
                .startsWith(browser.extension.getURL("/options/options.html"));
    });
    let urlToOpen = "/options/options.html" + (hash === "" ? "" : "#" + hash);
    if (tipsTab === undefined) {
      browser.tabs.create({
        active: true,
        url: urlToOpen
      });
    }
    else {
      browser.tabs.update(tipsTab.id, {
        active: true,
        url: urlToOpen
      });
    }
  });
}

function updateShowTipsCheckbox() {
  browser.runtime.sendMessage({
    messageName: "query_eGPrefs",
    methodName: "toggleStartupTips"
  });
}

function setShowTipsCheckbox() {
  browser.runtime.sendMessage({
    messageName: "query_eGPrefs",
    methodName: "areStartupTipsOn"
  }).then(aMessage => {
    document.getElementById("showTipsControl").checked = aMessage.response;
  });
}

function tipsLoadHandler() {
  document.getElementById("previousTipButton")
          .addEventListener("click", goToPreviousTip);
  document.getElementById("nextTipButton")
          .addEventListener("click", goToNextTip);
  document.getElementById("tipTextLink")
          .addEventListener("click", tipLinkClick);
  document.getElementById("showTipsControl")
          .addEventListener("click", updateShowTipsCheckbox);
  
  // generalPrefBranch = Services.prefs.getBranch("extensions.easygestures.general.");
  // generalPrefBranch.addObserver("startupTips", setShowTipsCheckbox, false);
  
  browser.runtime.sendMessage({
    messageName: "query_eGStrings",
    methodName: "getString",
    parameter: "tips"
  }).then(aMessage => {
    document.title = aMessage.response + " " + document.title;
  });
  setShowTipsCheckbox();
  var elementsToLocalize = document.querySelectorAll("[data-l10n]");
  var stringIDs = [];
  for (let i=0; i < elementsToLocalize.length; i++) {
    stringIDs.push(elementsToLocalize[i].dataset.l10n);
  }
  browser.runtime.sendMessage({
    messageName: "getLocalizedStrings",
    stringIDs: stringIDs
  }).then(aMessage => {
    for (let i=0; i < elementsToLocalize.length; ++i) {
      elementsToLocalize[i].textContent = aMessage.response[i];
    }
  });
  browser.runtime.sendMessage({
    messageName: "query_eGPrefs",
    methodName: "getTipNumberPref"
  }).then(aMessage => {
    tipNumber = aMessage.response;
    updateTipNbr(0);
  });
}

function tipsUnloadHandler() {
  window.removeEventListener("load", tipsLoadHandler);
  window.removeEventListener("unload", tipsUnloadHandler);
  document.getElementById("previousTipButton")
          .removeEventListener("click", goToPreviousTip);
  document.getElementById("nextTipButton")
          .removeEventListener("click", goToNextTip);
  document.getElementById("tipTextLink")
          .removeEventListener("click", tipLinkClick);
  document.getElementById("showTipsControl")
          .removeEventListener("click", updateShowTipsCheckbox);
  
  browser.runtime.sendMessage({
    messageName: "query_eGPrefs",
    methodName: "setTipNumberPref",
    parameter: (tipNumber + 1) % tips.length
  });
  // generalPrefBranch.removeObserver("startupTips", setShowTipsCheckbox);
}
