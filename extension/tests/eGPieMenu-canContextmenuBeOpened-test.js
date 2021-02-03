/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

/* global eGPieMenu, QUnit */

"use strict";

function initCanContextmenuBeOpened(showKey, contextKey) {
  eGPieMenu.settings.showButton = 2;
  eGPieMenu.settings.showKey = showKey;
  eGPieMenu.settings.contextKey = contextKey;
}

// All possible combinations for initCanContextmenuBeOpened are:
//   0  0
//   0  18
//   0  17
//   16 0
//   16 18
//   16 17
//   17 0
//   17 18
//   17 17 -> not tested, not allowed

function testWithShowAltButton(assert) {
  eGPieMenu.settings.showAltButton = 0;
  assert.notOk(eGPieMenu.canContextmenuBeOpened(false, false, false));
  eGPieMenu.settings.showAltButton = 1;
  assert.notOk(eGPieMenu.canContextmenuBeOpened(false, false, false));
  eGPieMenu.settings.showAltButton = 2;
  assert.notOk(eGPieMenu.canContextmenuBeOpened(false, false, false));
  eGPieMenu.setOpen();
  eGPieMenu.settings.showAltButton = 0;
  assert.notOk(eGPieMenu.canContextmenuBeOpened(false, false, false));
  eGPieMenu.settings.showAltButton = 1;
  assert.notOk(eGPieMenu.canContextmenuBeOpened(false, false, false));
  eGPieMenu.settings.showAltButton = 2;
  assert.ok(eGPieMenu.canContextmenuBeOpened(false, false, false));
  eGPieMenu.setHidden();
}

QUnit.test("test canContextmenuBeOpened with left button", assert => {
  eGPieMenu.settings.showButton = 0;
  assert.notOk(eGPieMenu.canContextmenuBeOpened(false, false, false));
});

QUnit.test("test canContextmenuBeOpened with left button and alt button", assert => {
  eGPieMenu.settings.showButton = 0;
  testWithShowAltButton(assert);
});

QUnit.test("test canContextmenuBeOpened with middle button", assert => {
  eGPieMenu.settings.showButton = 1;
  assert.notOk(eGPieMenu.canContextmenuBeOpened(false, false, false));
});

QUnit.test("test canContextmenuBeOpened with middle button and alt button", assert => {
  eGPieMenu.settings.showButton = 1;
  testWithShowAltButton(assert);
});

QUnit.test("test canContextmenuBeOpened with right button", assert => {
  initCanContextmenuBeOpened(0, 0);
  assert.ok(eGPieMenu.canContextmenuBeOpened(false, false, false));
  assert.ok(eGPieMenu.canContextmenuBeOpened(false, false, true));
  assert.notOk(eGPieMenu.canContextmenuBeOpened(false, true, false));
  assert.notOk(eGPieMenu.canContextmenuBeOpened(false, true, true));
  assert.notOk(eGPieMenu.canContextmenuBeOpened(true, false, false));
  assert.notOk(eGPieMenu.canContextmenuBeOpened(true, false, true));
  assert.notOk(eGPieMenu.canContextmenuBeOpened(true, true, false));
  assert.notOk(eGPieMenu.canContextmenuBeOpened(true, true, true));
});

QUnit.test("test canContextmenuBeOpened with right button, context with alt key", assert => {
  initCanContextmenuBeOpened(0, 18);
  assert.ok(eGPieMenu.canContextmenuBeOpened(false, false, false));
  assert.ok(eGPieMenu.canContextmenuBeOpened(false, false, true));
  assert.notOk(eGPieMenu.canContextmenuBeOpened(false, true, false));
  assert.notOk(eGPieMenu.canContextmenuBeOpened(false, true, true));
  assert.notOk(eGPieMenu.canContextmenuBeOpened(true, false, false));
  assert.notOk(eGPieMenu.canContextmenuBeOpened(true, false, true));
  assert.notOk(eGPieMenu.canContextmenuBeOpened(true, true, false));
  assert.notOk(eGPieMenu.canContextmenuBeOpened(true, true, true));
});

QUnit.test("test canContextmenuBeOpened with right button, context with ctrl key", assert => {
  initCanContextmenuBeOpened(0, 17);
  assert.ok(eGPieMenu.canContextmenuBeOpened(false, false, false));
  assert.ok(eGPieMenu.canContextmenuBeOpened(false, false, true));
  assert.ok(eGPieMenu.canContextmenuBeOpened(false, true, false));
  assert.ok(eGPieMenu.canContextmenuBeOpened(false, true, true));
  assert.notOk(eGPieMenu.canContextmenuBeOpened(true, false, false));
  assert.notOk(eGPieMenu.canContextmenuBeOpened(true, false, true));
  assert.notOk(eGPieMenu.canContextmenuBeOpened(true, true, false));
  assert.notOk(eGPieMenu.canContextmenuBeOpened(true, true, true));
});

QUnit.test("test canContextmenuBeOpened with right button and shift key", assert => {
  initCanContextmenuBeOpened(16, 0);
  assert.notOk(eGPieMenu.canContextmenuBeOpened(false, false, false));
  assert.notOk(eGPieMenu.canContextmenuBeOpened(false, false, true));
  assert.notOk(eGPieMenu.canContextmenuBeOpened(false, true, false));
  assert.notOk(eGPieMenu.canContextmenuBeOpened(false, true, true));
  assert.ok(eGPieMenu.canContextmenuBeOpened(true, false, false));
  assert.ok(eGPieMenu.canContextmenuBeOpened(true, false, true));
  assert.notOk(eGPieMenu.canContextmenuBeOpened(true, true, false));
  assert.notOk(eGPieMenu.canContextmenuBeOpened(true, true, true));
});

QUnit.test("test canContextmenuBeOpened with right button and shift key, context with alt key", assert => {
  initCanContextmenuBeOpened(16, 18);
  assert.notOk(eGPieMenu.canContextmenuBeOpened(false, false, false));
  assert.notOk(eGPieMenu.canContextmenuBeOpened(false, false, true));
  assert.notOk(eGPieMenu.canContextmenuBeOpened(false, true, false));
  assert.notOk(eGPieMenu.canContextmenuBeOpened(false, true, true));
  assert.ok(eGPieMenu.canContextmenuBeOpened(true, false, false));
  assert.ok(eGPieMenu.canContextmenuBeOpened(true, false, true));
  assert.notOk(eGPieMenu.canContextmenuBeOpened(true, true, false));
  assert.notOk(eGPieMenu.canContextmenuBeOpened(true, true, true));
});

QUnit.test("test canContextmenuBeOpened with right button and shift key, context with ctrl key", assert => {
  initCanContextmenuBeOpened(16, 17);
  assert.notOk(eGPieMenu.canContextmenuBeOpened(false, false, false));
  assert.notOk(eGPieMenu.canContextmenuBeOpened(false, false, true));
  assert.notOk(eGPieMenu.canContextmenuBeOpened(false, true, false));
  assert.notOk(eGPieMenu.canContextmenuBeOpened(false, true, true));
  assert.ok(eGPieMenu.canContextmenuBeOpened(true, false, false));
  assert.ok(eGPieMenu.canContextmenuBeOpened(true, false, true));
  assert.ok(eGPieMenu.canContextmenuBeOpened(true, true, false));
  assert.ok(eGPieMenu.canContextmenuBeOpened(true, true, true));
});

QUnit.test("test canContextmenuBeOpened with right button and ctrl key", assert => {
  initCanContextmenuBeOpened(17, 0);
  assert.notOk(eGPieMenu.canContextmenuBeOpened(false, false, false));
  assert.notOk(eGPieMenu.canContextmenuBeOpened(false, false, true));
  assert.ok(eGPieMenu.canContextmenuBeOpened(false, true, false));
  assert.ok(eGPieMenu.canContextmenuBeOpened(false, true, true));
  assert.notOk(eGPieMenu.canContextmenuBeOpened(true, false, false));
  assert.notOk(eGPieMenu.canContextmenuBeOpened(true, false, true));
  assert.notOk(eGPieMenu.canContextmenuBeOpened(true, true, false));
  assert.notOk(eGPieMenu.canContextmenuBeOpened(true, true, true));
});

QUnit.test("test canContextmenuBeOpened with right button and ctrl key, context with alt key", assert => {
  initCanContextmenuBeOpened(17, 18);
  assert.notOk(eGPieMenu.canContextmenuBeOpened(false, false, false));
  assert.notOk(eGPieMenu.canContextmenuBeOpened(false, false, true));
  assert.ok(eGPieMenu.canContextmenuBeOpened(false, true, false));
  assert.ok(eGPieMenu.canContextmenuBeOpened(false, true, true));
  assert.notOk(eGPieMenu.canContextmenuBeOpened(true, false, false));
  assert.notOk(eGPieMenu.canContextmenuBeOpened(true, false, true));
  assert.notOk(eGPieMenu.canContextmenuBeOpened(true, true, false));
  assert.notOk(eGPieMenu.canContextmenuBeOpened(true, true, true));
});

QUnit.test("test canContextmenuBeOpened with right button and alt button", assert => {
  eGPieMenu.settings.showButton = 2;
  testWithShowAltButton(assert);
});
