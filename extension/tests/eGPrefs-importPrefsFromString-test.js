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


/* global QUnit, eGPrefs, eGActions */

"use strict";

QUnit.test("test importPrefsFromString with invalid file content",
  function(assert) {
  assert.throws(function() {
    eGPrefs.importPrefsFromString("");
  });
  assert.throws(function() {
    eGPrefs.importPrefsFromString("A string");
  });
  assert.throws(function() {
    eGPrefs.importPrefsFromString("123");
  });
  assert.throws(function() {
    eGPrefs.importPrefsFromString("{}");
  });
  assert.throws(function() {
    eGPrefs.importPrefsFromString("{'a': 1}");
  });
  assert.throws(function() {
    eGPrefs.importPrefsFromString("[]");
  });
  assert.throws(function() {
    eGPrefs.importPrefsFromString("[1, 2, 3]");
  });
  assert.throws(function() {
    eGPrefs.importPrefsFromString("[[1, 2], 3]");
  });
});

QUnit.test("test importPrefsFromString with invalid preference values",
  function(assert) {
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
                                "[\"empty\", \"pageTop\", \"newTab\", \"xxx\", \"empty\"]]]")
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
  eGPrefs.importPrefsFromString("[[\"stats.lastReset\", \"xxx\"]]")
         .then(result => {
    assert.ok(result.code === "nonImportedPrefs" &&
              result.prefs === "stats.lastReset");
    done10();
  });
  let done11 = assert.async();
  eGPrefs.importPrefsFromString("[[\"stats.mainMenu\", \"\"]]").then(result => {
    assert.ok(result.code === "nonImportedPrefs" &&
              result.prefs === "stats.mainMenu");
    done11();
  });
  let done12 = assert.async();
  eGPrefs.importPrefsFromString("[[\"stats.mainMenu\", [0]]]").then(result => {
    assert.ok(result.code === "nonImportedPrefs" &&
              result.prefs === "stats.mainMenu");
    done12();
  });
  let done13 = assert.async();
  eGPrefs.importPrefsFromString("[[\"stats.mainMenu\", " +
                                "[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0," +
                                "0,\"xxx\",0,0,0]]]").then(result => {
    assert.ok(result.code === "nonImportedPrefs" &&
              result.prefs === "stats.mainMenu");
    done13();
  });
  let done14 = assert.async();
  eGPrefs.importPrefsFromString("[[\"stats.actions\", \"\"]]").then(result => {
    assert.ok(result.code === "nonImportedPrefs" &&
              result.prefs === "stats.actions");
    done14();
  });
  let done15 = assert.async();
  eGPrefs.importPrefsFromString("[[\"stats.actions\", []]]")
         .then(result => {
    assert.ok(result.code === "nonImportedPrefs" &&
              result.prefs === "stats.actions");
    done15();
  });
  let done16 = assert.async();
  eGPrefs.importPrefsFromString("[[\"stats.actions\", {}]]")
         .then(result => {
    assert.ok(result.code === "nonImportedPrefs" &&
              result.prefs === "stats.actions");
    done16();
  });
  let done17 = assert.async();
  let usageActions = {};
  for (let actionName in eGActions) {
    usageActions[actionName] = 0;
  }
  usageActions.selectAll = false;
  let prefToImportArray = [["stats.actions", usageActions]];
  eGPrefs.importPrefsFromString(JSON.stringify(prefToImportArray))
         .then(result => {
    assert.ok(result.code === "nonImportedPrefs" &&
              result.prefs === "stats.actions");
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
