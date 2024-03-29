/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

/* global  eGPieMenu, QUnit */

import { eGPrefs } from "/background/eGPrefs.js";

let savedPrefs;

eGPieMenu.setHidden();

QUnit.begin(() => {
  eGPrefs.exportPrefsToString().then(prefsAsString => {
    savedPrefs = prefsAsString;
  });
});

QUnit.done(() => eGPrefs.importPrefsFromString(savedPrefs));
