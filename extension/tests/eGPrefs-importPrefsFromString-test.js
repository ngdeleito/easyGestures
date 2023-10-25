/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

/* global QUnit */

import { eGPrefs } from "/background/eGPrefs.js";
import { eGActions } from "/background/eGActions.js";

QUnit.test("test importPrefsFromString with invalid file content", assert => {
  assert.throws(() => eGPrefs.importPrefsFromString(""));
  assert.throws(() => eGPrefs.importPrefsFromString("A string"));
  assert.throws(() => eGPrefs.importPrefsFromString("123"));
  assert.throws(() => eGPrefs.importPrefsFromString("{}"));
  assert.throws(() => eGPrefs.importPrefsFromString("{'a': 1}"));
  assert.throws(() => eGPrefs.importPrefsFromString("[]"));
  assert.throws(() => eGPrefs.importPrefsFromString("[1, 2, 3]"));
  assert.throws(() => eGPrefs.importPrefsFromString("[[1, 2], 3]"));
});

QUnit.test("test importPrefsFromString with invalid preference values", assert => {
  let done1 = assert.async();
  eGPrefs.importPrefsFromString("[[\"not.existing.pref\", 0]]").then(result => {
    assert.ok(result.code === "nonImportedPrefs" &&
              result.prefs === "not.existing.pref");
    done1();
  });
  // boolean prefs
  let done2 = assert.async();
  eGPrefs.importPrefsFromString("[[\"general.startupTips\", 0]]")
         .then(result => {
    assert.ok(result.code === "nonImportedPrefs" &&
              result.prefs === "general.startupTips");
    done2();
  });
  // int prefs
  let done3 = assert.async();
  eGPrefs.importPrefsFromString("[[\"activation.showKey\", true]]")
         .then(result => {
    assert.ok(result.code === "nonImportedPrefs" &&
              result.prefs === "activation.showKey");
    done3();
  });
  let done4 = assert.async();
  eGPrefs.importPrefsFromString("[[\"activation.showKey\", -1]]")
         .then(result => {
    assert.ok(result.code === "nonImportedPrefs" &&
              result.prefs === "activation.showKey");
    done4();
  });
  // char prefs
  let done5 = assert.async();
  eGPrefs.importPrefsFromString("[[\"menus.extra\", true]]").then(result => {
    assert.ok(result.code === "nonImportedPrefs" &&
              result.prefs === "menus.extra");
    done5();
  });
  let done6 = assert.async();
  eGPrefs.importPrefsFromString("[[\"menus.extra\", \"a\"]]").then(result => {
    assert.ok(result.code === "nonImportedPrefs" &&
              result.prefs === "menus.extra");
    done6();
  });
  let done7 = assert.async();
  eGPrefs.importPrefsFromString("[[\"menus.extra\", [\"a\", \"b\", \"c\"]]]")
         .then(result => {
    assert.ok(result.code === "nonImportedPrefs" &&
              result.prefs === "menus.extra");
    done7();
  });
  let done8 = assert.async();
  eGPrefs.importPrefsFromString("[[\"menus.extra\", " +
                                "[\"empty\", \"goToTop\", \"newTab\", \"xxx\", \"empty\"]]]")
         .then(result => {
    assert.ok(result.code === "nonImportedPrefs" &&
              result.prefs === "menus.extra");
    done8();
  });
  let done9 = assert.async();
  eGPrefs.importPrefsFromString("[[\"customizations.loadURLin\", \"xxx\"]]")
         .then(result => {
    assert.ok(result.code === "nonImportedPrefs" &&
              result.prefs === "customizations.loadURLin");
    done9();
  });
  let done10 = assert.async();
  eGPrefs.importPrefsFromString("[[\"usage.lastReset\", \"xxx\"]]")
         .then(result => {
    assert.ok(result.code === "nonImportedPrefs" &&
              result.prefs === "usage.lastReset");
    done10();
  });
  let done11 = assert.async();
  eGPrefs.importPrefsFromString("[[\"usage.mainMenu\", \"\"]]").then(result => {
    assert.ok(result.code === "nonImportedPrefs" &&
              result.prefs === "usage.mainMenu");
    done11();
  });
  let done12 = assert.async();
  eGPrefs.importPrefsFromString("[[\"usage.mainMenu\", [0]]]").then(result => {
    assert.ok(result.code === "nonImportedPrefs" &&
              result.prefs === "usage.mainMenu");
    done12();
  });
  let done13 = assert.async();
  eGPrefs.importPrefsFromString("[[\"usage.mainMenu\", " +
                                "[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0," +
                                "0,\"xxx\",0,0,0]]]").then(result => {
    assert.ok(result.code === "nonImportedPrefs" &&
              result.prefs === "usage.mainMenu");
    done13();
  });
  let done14 = assert.async();
  eGPrefs.importPrefsFromString("[[\"usage.actions\", \"\"]]").then(result => {
    assert.ok(result.code === "nonImportedPrefs" &&
              result.prefs === "usage.actions");
    done14();
  });
  let done15 = assert.async();
  eGPrefs.importPrefsFromString("[[\"usage.actions\", []]]")
         .then(result => {
    assert.ok(result.code === "nonImportedPrefs" &&
              result.prefs === "usage.actions");
    done15();
  });
  let done16 = assert.async();
  eGPrefs.importPrefsFromString("[[\"usage.actions\", {}]]")
         .then(result => {
    assert.ok(result.code === "nonImportedPrefs" &&
              result.prefs === "usage.actions");
    done16();
  });
  let done17 = assert.async();
  let usageActions = {};
  for (let actionName in eGActions) {
    usageActions[actionName] = 0;
  }
  usageActions.selectAll = false;
  let prefToImportArray = [["usage.actions", usageActions]];
  eGPrefs.importPrefsFromString(JSON.stringify(prefToImportArray))
         .then(result => {
    assert.ok(result.code === "nonImportedPrefs" &&
              result.prefs === "usage.actions");
    done17();
  });
  // array prefs
  let done18 = assert.async();
  eGPrefs.importPrefsFromString("[[\"customizations.loadURL1\", " +
                                "[\"a\", \"b\", \"c\", \"d\"]]]")
         .then(result => {
    assert.ok(result.code === "nonImportedPrefs" &&
              result.prefs === "customizations.loadURL1");
    done18();
  });
  let done19 = assert.async();
  eGPrefs.importPrefsFromString("[[\"customizations.loadURL1\", " +
                                "[\"a\", \"b\", \"c\"]]]").then(result => {
    assert.ok(result.code === "nonImportedPrefs" &&
              result.prefs === "customizations.loadURL1");
    done19();
  });
  let done20 = assert.async();
  eGPrefs.importPrefsFromString("[[\"customizations.loadURL1\", " +
                                "[\"a\", true, true]]]").then(result => {
    assert.ok(result.code === "nonImportedPrefs" &&
              result.prefs === "customizations.loadURL1");
    done20();
  });
});
