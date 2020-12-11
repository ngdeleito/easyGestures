/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

/* global  eGPieMenu, QUnit, eGPrefs */

"use strict";

let savedPrefs;

eGPieMenu.setHidden();

QUnit.begin(function() {
  eGPrefs.exportPrefsToString().then(prefsAsString => {
    savedPrefs = prefsAsString;
  });
});

QUnit.done(function() {
  eGPrefs.importPrefsFromString(savedPrefs);
});
