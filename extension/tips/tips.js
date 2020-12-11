/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

/* global window, browser, document, eGPrefs, eGUtils */

"use strict";

window.addEventListener("load", tipsLoadHandler);
window.addEventListener("unload", tipsUnloadHandler);

function tipEntry(label, hash) {
  /* jshint validthis: true */
  this.label = label;
  this.imageClass = label.slice("tips.".length);
  this.hash = hash;
}

let tips = [
  new tipEntry("tips.openButton",                "activation"),
  new tipEntry("tips.dragToAction",              ""),
  new tipEntry("tips.openAltMenu",               "activation"),
  new tipEntry("tips.menusCustomization",        "menus"),
  new tipEntry("tips.optionalPermissions",       "permissions"),
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
  new tipEntry("tips.zoomOnImage",               ""),
  new tipEntry("tips.openLinkAction",            "customizations_otherActions"),
  new tipEntry("tips.dailyReadingsAction",       "customizations_otherActions")
];
tips.forEach(function(tip) {
  tip.description = browser.i18n.getMessage(tip.label);
});

let tipNumber;

function updateContent(tipNbr) {
  // we extract a potential link from the description; links are contained
  // inside square brackets (with no space after the opening bracket and no
  // space before the closing bracket): "text1 [link] text2"
  let text = tips[tipNbr].description.split(/\[\s{0}(\S.*\S)\s{0}\]/);
  let linkText = "";
  
  // we resolve the locale strings that constitute the link text
  if (text.length > 1) {
    let linkTextStrings = text[1].split("/");
    linkText = linkTextStrings.map(function(label) {
      return browser.i18n.getMessage(label);
    }).join("/");
  }
  
  document.getElementById("tipNumber").textContent = (tipNbr + 1) + " / " +
                                                     tips.length;
  document.getElementById("tipTextBeforeLink").textContent = text[0];
  document.getElementById("tipTextLink").textContent = linkText;
  document.getElementById("tipTextAfterLink").textContent = text[2];
  document.getElementById("tipImage").className = tips[tipNbr].imageClass;
}

function updateTipNbr(step) {
  tipNumber = (((tipNumber + step) % tips.length) + tips.length) % tips.length;
  eGPrefs.setTipNumberPref(tipNumber);
  updateContent(tipNumber);
}

function goToPreviousTip() {
  updateTipNbr(-1);
}

function goToNextTip() {
  updateTipNbr(+1);
}

function tipLinkClick() {
  eGUtils.showOrOpenTab("/options/options.html", tips[tipNumber].hash);
}

function updateShowTipsCheckbox() {
  eGPrefs.toggleStartupTips();
}

function setShowTipsCheckbox() {
  eGPrefs.areStartupTipsOn().then(prefValue => {
    document.getElementById("showTipsControl").checked = prefValue;
  });
}

function handleStorageChange(changes) {
  for (let change in changes) {
    if (change === "general.startupTips") {
      setShowTipsCheckbox();
    }
  }
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
  
  browser.storage.onChanged.addListener(handleStorageChange);
  
  eGUtils.setDocumentTitle(document, "tips");
  eGUtils.setDocumentLocalizedStrings(document);
  setShowTipsCheckbox();
  eGPrefs.getTipNumberPref().then(prefValue => {
    tipNumber = prefValue;
    updateTipNbr(+1);
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
  
  browser.storage.onChanged.removeListener(handleStorageChange);
}
