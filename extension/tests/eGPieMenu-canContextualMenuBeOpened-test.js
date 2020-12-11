/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

/* global eGPieMenu, QUnit */

"use strict";

function initCanContextualMenuBeOpened(contextShowAuto, contextKey) {
  eGPieMenu.settings.contextShowAuto = contextShowAuto;
  eGPieMenu.settings.contextKey = contextKey;
}

QUnit.test("test canContextualMenuBeOpened with no contextShowAuto and no key", function(assert) {
  initCanContextualMenuBeOpened(false, 0);
  assert.notOk(eGPieMenu.canContextualMenuBeOpened(false, false));
  assert.notOk(eGPieMenu.canContextualMenuBeOpened(false, true));
  assert.notOk(eGPieMenu.canContextualMenuBeOpened(true, false));
  assert.notOk(eGPieMenu.canContextualMenuBeOpened(true, true));
});

QUnit.test("test canContextualMenuBeOpened with no contextShowAuto and ctrl key", function(assert) {
  initCanContextualMenuBeOpened(false, 17);
  assert.notOk(eGPieMenu.canContextualMenuBeOpened(false, false));
  assert.notOk(eGPieMenu.canContextualMenuBeOpened(false, true));
  assert.ok(eGPieMenu.canContextualMenuBeOpened(true, false));
  assert.ok(eGPieMenu.canContextualMenuBeOpened(true, true));
});

QUnit.test("test canContextualMenuBeOpened with no contextShowAuto and alt key", function(assert) {
  initCanContextualMenuBeOpened(false, 18);
  assert.notOk(eGPieMenu.canContextualMenuBeOpened(false, false));
  assert.ok(eGPieMenu.canContextualMenuBeOpened(false, true));
  assert.notOk(eGPieMenu.canContextualMenuBeOpened(true, false));
  assert.ok(eGPieMenu.canContextualMenuBeOpened(true, true));
});

QUnit.test("test canContextualMenuBeOpened with contextShowAuto and no key", function(assert) {
  initCanContextualMenuBeOpened(true, 0);
  assert.ok(eGPieMenu.canContextualMenuBeOpened(false, false));
  assert.ok(eGPieMenu.canContextualMenuBeOpened(false, true));
  assert.ok(eGPieMenu.canContextualMenuBeOpened(true, false));
  assert.ok(eGPieMenu.canContextualMenuBeOpened(true, true));
});

QUnit.test("test canContextualMenuBeOpened with contextShowAuto and ctrl key", function(assert) {
  initCanContextualMenuBeOpened(true, 17);
  assert.ok(eGPieMenu.canContextualMenuBeOpened(false, false));
  assert.ok(eGPieMenu.canContextualMenuBeOpened(false, true));
  assert.notOk(eGPieMenu.canContextualMenuBeOpened(true, false));
  assert.notOk(eGPieMenu.canContextualMenuBeOpened(true, true));
});

QUnit.test("test canContextualMenuBeOpened with contextShowAuto and alt key", function(assert) {
  initCanContextualMenuBeOpened(true, 18);
  assert.ok(eGPieMenu.canContextualMenuBeOpened(false, false));
  assert.notOk(eGPieMenu.canContextualMenuBeOpened(false, true));
  assert.ok(eGPieMenu.canContextualMenuBeOpened(true, false));
  assert.notOk(eGPieMenu.canContextualMenuBeOpened(true, true));
});
