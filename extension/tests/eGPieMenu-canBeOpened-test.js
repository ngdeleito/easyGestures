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


/* global eGPieMenu, QUnit */

"use strict";

function initCanBeOpened(showButton, showKey, preventOpenKey, contextKey) {
  eGPieMenu.settings.showButton = showButton;
  eGPieMenu.settings.showKey = showKey;
  eGPieMenu.settings.preventOpenKey = preventOpenKey;
  eGPieMenu.settings.contextKey = contextKey;
}

// All possible combinations (with left, middle and right mouse buttons) for
// initCanBeOpened are:
//   0 0  0  0
//   0 0  0  18
//   0 0  0  17 -> not tested, right click on Mac
//   0 0  18 0
//   0 0  18 18 -> not tested, not allowed
//   0 0  18 17 -> not tested, right click on Mac
//   0 0  17 0
//   0 0  17 18 -> not tested, right click on Mac
//   0 0  17 17 -> not tested, not allowed
//   0 16 0  0
//   0 16 0  18
//   0 16 0  17 -> not tested, right click on Mac
//   0 16 18 0
//   0 16 18 18 -> not tested, not allowed
//   0 16 18 17 -> not tested, right click on Mac
//   0 16 17 xx -> not tested, right click on Mac
//   0 17 xx xx -> not tested, right click on Mac
//   1 0  0  0
//   1 0  0  18
//   1 0  0  17
//   1 0  18 0
//   1 0  18 18 -> not tested, not allowed
//   1 0  18 17
//   1 0  17 0
//   1 0  17 18
//   1 0  17 17 -> not tested, not allowed
//   1 16 0  0
//   1 16 0  18
//   1 16 0  17
//   1 16 18 0
//   1 16 18 18 -> not tested, not allowed
//   1 16 18 17
//   1 16 17 0
//   1 16 17 18
//   1 16 17 17 -> not tested, not allowed
//   1 17 0  0
//   1 17 0  18
//   1 17 0  17 -> not tested, not allowed
//   1 17 18 0
//   1 17 18 18 -> not tested, not allowed
//   1 17 18 17 -> not tested, not allowed
//   1 17 17 xx -> not tested, not allowed
//   2 0  0  0
//   2 0  0  18
//   2 0  0  17
//   2 0  18 0
//   2 0  18 18 -> not tested, not allowed
//   2 0  18 17
//   2 0  17 0
//   2 0  17 18
//   2 0  17 17 -> not tested, not allowed
//   2 16 0  0
//   2 16 0  18
//   2 16 0  17
//   2 16 18 0
//   2 16 18 18 -> not tested, not allowed
//   2 16 18 17
//   2 16 17 0
//   2 16 17 18
//   2 16 17 17 -> not tested, not allowed
//   2 17 0  0
//   2 17 0  18
//   2 17 0  17 -> not tested, not allowed
//   2 17 18 0
//   2 17 18 18 -> not tested, not allowed
//   2 17 18 17 -> not tested, not allowed
//   2 17 17 xx -> not tested, not allowed

QUnit.test("test canBeOpened with left button", function(assert) {
  initCanBeOpened(0, 0, 0, 0);
  assert.ok(eGPieMenu.canBeOpened(0, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(1, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(0, true, false, false));
  assert.notOk(eGPieMenu.canBeOpened(0, false, true, false));
  assert.notOk(eGPieMenu.canBeOpened(0, true, true, false));
  assert.ok(eGPieMenu.canBeOpened(0, false, false, true));
  assert.notOk(eGPieMenu.canBeOpened(0, true, false, true));
  assert.notOk(eGPieMenu.canBeOpened(0, false, true, true));
  assert.notOk(eGPieMenu.canBeOpened(0, true, true, true));
});

QUnit.test("test canBeOpened with left button, context with alt key", function(assert) {
  initCanBeOpened(0, 0, 0, 18);
  assert.ok(eGPieMenu.canBeOpened(0, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(1, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(0, true, false, false));
  assert.notOk(eGPieMenu.canBeOpened(0, false, true, false));
  assert.notOk(eGPieMenu.canBeOpened(0, true, true, false));
  assert.ok(eGPieMenu.canBeOpened(0, false, false, true));
  assert.notOk(eGPieMenu.canBeOpened(0, true, false, true));
  assert.notOk(eGPieMenu.canBeOpened(0, false, true, true));
  assert.notOk(eGPieMenu.canBeOpened(0, true, true, true));
});

QUnit.test("test canBeOpened with left button, prevent with alt key", function(assert) {
  initCanBeOpened(0, 0, 18, 0);
  assert.ok(eGPieMenu.canBeOpened(0, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(1, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(0, true, false, false));
  assert.notOk(eGPieMenu.canBeOpened(0, false, true, false));
  assert.notOk(eGPieMenu.canBeOpened(0, true, true, false));
  assert.notOk(eGPieMenu.canBeOpened(0, false, false, true));
  assert.notOk(eGPieMenu.canBeOpened(0, true, false, true));
  assert.notOk(eGPieMenu.canBeOpened(0, false, true, true));
  assert.notOk(eGPieMenu.canBeOpened(0, true, true, true));
});

QUnit.test("test canBeOpened with left button, prevent with ctrl key", function(assert) {
  initCanBeOpened(0, 0, 17, 0);
  assert.ok(eGPieMenu.canBeOpened(0, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(1, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(0, true, false, false));
  assert.notOk(eGPieMenu.canBeOpened(0, false, true, false));
  assert.notOk(eGPieMenu.canBeOpened(0, true, true, false));
  assert.ok(eGPieMenu.canBeOpened(0, false, false, true));
  assert.notOk(eGPieMenu.canBeOpened(0, true, false, true));
  assert.notOk(eGPieMenu.canBeOpened(0, false, true, true));
  assert.notOk(eGPieMenu.canBeOpened(0, true, true, true));
});

QUnit.test("test canBeOpened with left button and shift key", function(assert) {
  initCanBeOpened(0, 16, 0, 0);
  assert.notOk(eGPieMenu.canBeOpened(0, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(1, false, false, false));
  assert.ok(eGPieMenu.canBeOpened(0, true, false, false));
  assert.notOk(eGPieMenu.canBeOpened(0, false, true, false));
  assert.notOk(eGPieMenu.canBeOpened(0, true, true, false));
  assert.notOk(eGPieMenu.canBeOpened(0, false, false, true));
  assert.ok(eGPieMenu.canBeOpened(0, true, false, true));
  assert.notOk(eGPieMenu.canBeOpened(0, false, true, true));
  assert.notOk(eGPieMenu.canBeOpened(0, true, true, true));
});

QUnit.test("test canBeOpened with left button and shift key, context with alt key", function(assert) {
  initCanBeOpened(0, 16, 0, 18);
  assert.notOk(eGPieMenu.canBeOpened(0, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(1, false, false, false));
  assert.ok(eGPieMenu.canBeOpened(0, true, false, false));
  assert.notOk(eGPieMenu.canBeOpened(0, false, true, false));
  assert.notOk(eGPieMenu.canBeOpened(0, true, true, false));
  assert.notOk(eGPieMenu.canBeOpened(0, false, false, true));
  assert.ok(eGPieMenu.canBeOpened(0, true, false, true));
  assert.notOk(eGPieMenu.canBeOpened(0, false, true, true));
  assert.notOk(eGPieMenu.canBeOpened(0, true, true, true));
});

QUnit.test("test canBeOpened with left button and shift key, prevent with alt key", function(assert) {
  initCanBeOpened(0, 16, 18, 0);
  assert.notOk(eGPieMenu.canBeOpened(0, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(1, false, false, false));
  assert.ok(eGPieMenu.canBeOpened(0, true, false, false));
  assert.notOk(eGPieMenu.canBeOpened(0, false, true, false));
  assert.notOk(eGPieMenu.canBeOpened(0, true, true, false));
  assert.notOk(eGPieMenu.canBeOpened(0, false, false, true));
  assert.notOk(eGPieMenu.canBeOpened(0, true, false, true));
  assert.notOk(eGPieMenu.canBeOpened(0, false, true, true));
  assert.notOk(eGPieMenu.canBeOpened(0, true, true, true));
});

QUnit.test("test canBeOpened with middle button", function(assert) {
  initCanBeOpened(1, 0, 0, 0);
  assert.ok(eGPieMenu.canBeOpened(1, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(0, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(1, true, false, false));
  assert.notOk(eGPieMenu.canBeOpened(1, false, true, false));
  assert.notOk(eGPieMenu.canBeOpened(1, true, true, false));
  assert.ok(eGPieMenu.canBeOpened(1, false, false, true));
  assert.notOk(eGPieMenu.canBeOpened(1, true, false, true));
  assert.notOk(eGPieMenu.canBeOpened(1, false, true, true));
  assert.notOk(eGPieMenu.canBeOpened(1, true, true, true));
});

QUnit.test("test canBeOpened with middle button, context with alt key", function(assert) {
  initCanBeOpened(1, 0, 0, 18);
  assert.ok(eGPieMenu.canBeOpened(1, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(0, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(1, true, false, false));
  assert.notOk(eGPieMenu.canBeOpened(1, false, true, false));
  assert.notOk(eGPieMenu.canBeOpened(1, true, true, false));
  assert.ok(eGPieMenu.canBeOpened(1, false, false, true));
  assert.notOk(eGPieMenu.canBeOpened(1, true, false, true));
  assert.notOk(eGPieMenu.canBeOpened(1, false, true, true));
  assert.notOk(eGPieMenu.canBeOpened(1, true, true, true));
});

QUnit.test("test canBeOpened with middle button, context with ctrl key", function(assert) {
  initCanBeOpened(1, 0, 0, 17);
  assert.ok(eGPieMenu.canBeOpened(1, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(0, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(1, true, false, false));
  assert.ok(eGPieMenu.canBeOpened(1, false, true, false));
  assert.notOk(eGPieMenu.canBeOpened(1, true, true, false));
  assert.ok(eGPieMenu.canBeOpened(1, false, false, true));
  assert.notOk(eGPieMenu.canBeOpened(1, true, false, true));
  assert.ok(eGPieMenu.canBeOpened(1, false, true, true));
  assert.notOk(eGPieMenu.canBeOpened(1, true, true, true));
});

QUnit.test("test canBeOpened with middle button, prevent with alt key", function(assert) {
  initCanBeOpened(1, 0, 18, 0);
  assert.ok(eGPieMenu.canBeOpened(1, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(0, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(1, true, false, false));
  assert.notOk(eGPieMenu.canBeOpened(1, false, true, false));
  assert.notOk(eGPieMenu.canBeOpened(1, true, true, false));
  assert.notOk(eGPieMenu.canBeOpened(1, false, false, true));
  assert.notOk(eGPieMenu.canBeOpened(1, true, false, true));
  assert.notOk(eGPieMenu.canBeOpened(1, false, true, true));
  assert.notOk(eGPieMenu.canBeOpened(1, true, true, true));
});

QUnit.test("test canBeOpened with middle button, prevent with alt key, context with ctrl key", function(assert) {
  initCanBeOpened(1, 0, 18, 17);
  assert.ok(eGPieMenu.canBeOpened(1, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(0, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(1, true, false, false));
  assert.ok(eGPieMenu.canBeOpened(1, false, true, false));
  assert.notOk(eGPieMenu.canBeOpened(1, true, true, false));
  assert.notOk(eGPieMenu.canBeOpened(1, false, false, true));
  assert.notOk(eGPieMenu.canBeOpened(1, true, false, true));
  assert.notOk(eGPieMenu.canBeOpened(1, false, true, true));
  assert.notOk(eGPieMenu.canBeOpened(1, true, true, true));
});

QUnit.test("test canBeOpened with middle button, prevent with ctrl key", function(assert) {
  initCanBeOpened(1, 0, 17, 0);
  assert.ok(eGPieMenu.canBeOpened(1, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(0, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(1, true, false, false));
  assert.notOk(eGPieMenu.canBeOpened(1, false, true, false));
  assert.notOk(eGPieMenu.canBeOpened(1, true, true, false));
  assert.ok(eGPieMenu.canBeOpened(1, false, false, true));
  assert.notOk(eGPieMenu.canBeOpened(1, true, false, true));
  assert.notOk(eGPieMenu.canBeOpened(1, false, true, true));
  assert.notOk(eGPieMenu.canBeOpened(1, true, true, true));
});

QUnit.test("test canBeOpened with middle button, prevent with ctrl key, context with alt key", function(assert) {
  initCanBeOpened(1, 0, 17, 18);
  assert.ok(eGPieMenu.canBeOpened(1, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(0, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(1, true, false, false));
  assert.notOk(eGPieMenu.canBeOpened(1, false, true, false));
  assert.notOk(eGPieMenu.canBeOpened(1, true, true, false));
  assert.ok(eGPieMenu.canBeOpened(1, false, false, true));
  assert.notOk(eGPieMenu.canBeOpened(1, true, false, true));
  assert.notOk(eGPieMenu.canBeOpened(1, false, true, true));
  assert.notOk(eGPieMenu.canBeOpened(1, true, true, true));
});

QUnit.test("test canBeOpened with middle button and shift key", function(assert) {
  initCanBeOpened(1, 16, 0, 0);
  assert.notOk(eGPieMenu.canBeOpened(1, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(0, false, false, false));
  assert.ok(eGPieMenu.canBeOpened(1, true, false, false));
  assert.notOk(eGPieMenu.canBeOpened(1, false, true, false));
  assert.notOk(eGPieMenu.canBeOpened(1, true, true, false));
  assert.notOk(eGPieMenu.canBeOpened(1, false, false, true));
  assert.ok(eGPieMenu.canBeOpened(1, true, false, true));
  assert.notOk(eGPieMenu.canBeOpened(1, false, true, true));
  assert.notOk(eGPieMenu.canBeOpened(1, true, true, true));
});

QUnit.test("test canBeOpened with middle button and shift key, context with alt key", function(assert) {
  initCanBeOpened(1, 16, 0, 18);
  assert.notOk(eGPieMenu.canBeOpened(1, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(0, false, false, false));
  assert.ok(eGPieMenu.canBeOpened(1, true, false, false));
  assert.notOk(eGPieMenu.canBeOpened(1, false, true, false));
  assert.notOk(eGPieMenu.canBeOpened(1, true, true, false));
  assert.notOk(eGPieMenu.canBeOpened(1, false, false, true));
  assert.ok(eGPieMenu.canBeOpened(1, true, false, true));
  assert.notOk(eGPieMenu.canBeOpened(1, false, true, true));
  assert.notOk(eGPieMenu.canBeOpened(1, true, true, true));
});

QUnit.test("test canBeOpened with middle button and shift key, context with ctrl key", function(assert) {
  initCanBeOpened(1, 16, 0, 17);
  assert.notOk(eGPieMenu.canBeOpened(1, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(0, false, false, false));
  assert.ok(eGPieMenu.canBeOpened(1, true, false, false));
  assert.notOk(eGPieMenu.canBeOpened(1, false, true, false));
  assert.ok(eGPieMenu.canBeOpened(1, true, true, false));
  assert.notOk(eGPieMenu.canBeOpened(1, false, false, true));
  assert.ok(eGPieMenu.canBeOpened(1, true, false, true));
  assert.notOk(eGPieMenu.canBeOpened(1, false, true, true));
  assert.ok(eGPieMenu.canBeOpened(1, true, true, true));
});

QUnit.test("test canBeOpened with middle button and shift key, prevent with alt key", function(assert) {
  initCanBeOpened(1, 16, 18, 0);
  assert.notOk(eGPieMenu.canBeOpened(1, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(0, false, false, false));
  assert.ok(eGPieMenu.canBeOpened(1, true, false, false));
  assert.notOk(eGPieMenu.canBeOpened(1, false, true, false));
  assert.notOk(eGPieMenu.canBeOpened(1, true, true, false));
  assert.notOk(eGPieMenu.canBeOpened(1, false, false, true));
  assert.notOk(eGPieMenu.canBeOpened(1, true, false, true));
  assert.notOk(eGPieMenu.canBeOpened(1, false, true, true));
  assert.notOk(eGPieMenu.canBeOpened(1, true, true, true));
});

QUnit.test("test canBeOpened with middle button and shift key, prevent with alt key, context with ctrl key", function(assert) {
  initCanBeOpened(1, 16, 18, 17);
  assert.notOk(eGPieMenu.canBeOpened(1, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(0, false, false, false));
  assert.ok(eGPieMenu.canBeOpened(1, true, false, false));
  assert.notOk(eGPieMenu.canBeOpened(1, false, true, false));
  assert.ok(eGPieMenu.canBeOpened(1, true, true, false));
  assert.notOk(eGPieMenu.canBeOpened(1, false, false, true));
  assert.notOk(eGPieMenu.canBeOpened(1, true, false, true));
  assert.notOk(eGPieMenu.canBeOpened(1, false, true, true));
  assert.notOk(eGPieMenu.canBeOpened(1, true, true, true));
});

QUnit.test("test canBeOpened with middle button and shift key, prevent with ctrl key", function(assert) {
  initCanBeOpened(1, 16, 17, 0);
  assert.notOk(eGPieMenu.canBeOpened(1, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(0, false, false, false));
  assert.ok(eGPieMenu.canBeOpened(1, true, false, false));
  assert.notOk(eGPieMenu.canBeOpened(1, false, true, false));
  assert.notOk(eGPieMenu.canBeOpened(1, true, true, false));
  assert.notOk(eGPieMenu.canBeOpened(1, false, false, true));
  assert.ok(eGPieMenu.canBeOpened(1, true, false, true));
  assert.notOk(eGPieMenu.canBeOpened(1, false, true, true));
  assert.notOk(eGPieMenu.canBeOpened(1, true, true, true));
});

QUnit.test("test canBeOpened with middle button and shift key, prevent with ctrl key, context with alt key", function(assert) {
  initCanBeOpened(1, 16, 17, 18);
  assert.notOk(eGPieMenu.canBeOpened(1, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(0, false, false, false));
  assert.ok(eGPieMenu.canBeOpened(1, true, false, false));
  assert.notOk(eGPieMenu.canBeOpened(1, false, true, false));
  assert.notOk(eGPieMenu.canBeOpened(1, true, true, false));
  assert.notOk(eGPieMenu.canBeOpened(1, false, false, true));
  assert.ok(eGPieMenu.canBeOpened(1, true, false, true));
  assert.notOk(eGPieMenu.canBeOpened(1, false, true, true));
  assert.notOk(eGPieMenu.canBeOpened(1, true, true, true));
});

QUnit.test("test canBeOpened with middle button and ctrl key", function(assert) {
  initCanBeOpened(1, 17, 0, 0);
  assert.notOk(eGPieMenu.canBeOpened(1, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(0, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(1, true, false, false));
  assert.ok(eGPieMenu.canBeOpened(1, false, true, false));
  assert.notOk(eGPieMenu.canBeOpened(1, true, true, false));
  assert.notOk(eGPieMenu.canBeOpened(1, false, false, true));
  assert.notOk(eGPieMenu.canBeOpened(1, true, false, true));
  assert.ok(eGPieMenu.canBeOpened(1, false, true, true));
  assert.notOk(eGPieMenu.canBeOpened(1, true, true, true));
});

QUnit.test("test canBeOpened with middle button and ctrl key, context with alt key", function(assert) {
  initCanBeOpened(1, 17, 0, 18);
  assert.notOk(eGPieMenu.canBeOpened(1, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(0, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(1, true, false, false));
  assert.ok(eGPieMenu.canBeOpened(1, false, true, false));
  assert.notOk(eGPieMenu.canBeOpened(1, true, true, false));
  assert.notOk(eGPieMenu.canBeOpened(1, false, false, true));
  assert.notOk(eGPieMenu.canBeOpened(1, true, false, true));
  assert.ok(eGPieMenu.canBeOpened(1, false, true, true));
  assert.notOk(eGPieMenu.canBeOpened(1, true, true, true));
});

QUnit.test("test canBeOpened with middle button and ctrl key, prevent with alt key", function(assert) {
  initCanBeOpened(1, 17, 18, 0);
  assert.notOk(eGPieMenu.canBeOpened(1, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(0, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(1, true, false, false));
  assert.ok(eGPieMenu.canBeOpened(1, false, true, false));
  assert.notOk(eGPieMenu.canBeOpened(1, true, true, false));
  assert.notOk(eGPieMenu.canBeOpened(1, false, false, true));
  assert.notOk(eGPieMenu.canBeOpened(1, true, false, true));
  assert.notOk(eGPieMenu.canBeOpened(1, false, true, true));
  assert.notOk(eGPieMenu.canBeOpened(1, true, true, true));
});

QUnit.test("test canBeOpened with right button", function(assert) {
  initCanBeOpened(2, 0, 0, 0);
  assert.ok(eGPieMenu.canBeOpened(2, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(0, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(2, true, false, false));
  assert.notOk(eGPieMenu.canBeOpened(2, false, true, false));
  assert.notOk(eGPieMenu.canBeOpened(2, true, true, false));
  assert.ok(eGPieMenu.canBeOpened(2, false, false, true));
  assert.notOk(eGPieMenu.canBeOpened(2, true, false, true));
  assert.notOk(eGPieMenu.canBeOpened(2, false, true, true));
  assert.notOk(eGPieMenu.canBeOpened(2, true, true, true));
});

QUnit.test("test canBeOpened with right button, context with alt key", function(assert) {
  initCanBeOpened(2, 0, 0, 18);
  assert.ok(eGPieMenu.canBeOpened(2, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(0, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(2, true, false, false));
  assert.notOk(eGPieMenu.canBeOpened(2, false, true, false));
  assert.notOk(eGPieMenu.canBeOpened(2, true, true, false));
  assert.ok(eGPieMenu.canBeOpened(2, false, false, true));
  assert.notOk(eGPieMenu.canBeOpened(2, true, false, true));
  assert.notOk(eGPieMenu.canBeOpened(2, false, true, true));
  assert.notOk(eGPieMenu.canBeOpened(2, true, true, true));
});

QUnit.test("test canBeOpened with right button, context with ctrl key", function(assert) {
  initCanBeOpened(2, 0, 0, 17);
  assert.ok(eGPieMenu.canBeOpened(2, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(0, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(2, true, false, false));
  assert.ok(eGPieMenu.canBeOpened(2, false, true, false));
  assert.notOk(eGPieMenu.canBeOpened(2, true, true, false));
  assert.ok(eGPieMenu.canBeOpened(2, false, false, true));
  assert.notOk(eGPieMenu.canBeOpened(2, true, false, true));
  assert.ok(eGPieMenu.canBeOpened(2, false, true, true));
  assert.notOk(eGPieMenu.canBeOpened(2, true, true, true));
});

QUnit.test("test canBeOpened with right button, prevent with alt key", function(assert) {
  initCanBeOpened(2, 0, 18, 0);
  assert.ok(eGPieMenu.canBeOpened(2, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(0, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(2, true, false, false));
  assert.notOk(eGPieMenu.canBeOpened(2, false, true, false));
  assert.notOk(eGPieMenu.canBeOpened(2, true, true, false));
  assert.notOk(eGPieMenu.canBeOpened(2, false, false, true));
  assert.notOk(eGPieMenu.canBeOpened(2, true, false, true));
  assert.notOk(eGPieMenu.canBeOpened(2, false, true, true));
  assert.notOk(eGPieMenu.canBeOpened(2, true, true, true));
});

QUnit.test("test canBeOpened with right button, prevent with alt key, context with ctrl key", function(assert) {
  initCanBeOpened(2, 0, 18, 17);
  assert.ok(eGPieMenu.canBeOpened(2, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(0, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(2, true, false, false));
  assert.ok(eGPieMenu.canBeOpened(2, false, true, false));
  assert.notOk(eGPieMenu.canBeOpened(2, true, true, false));
  assert.notOk(eGPieMenu.canBeOpened(2, false, false, true));
  assert.notOk(eGPieMenu.canBeOpened(2, true, false, true));
  assert.notOk(eGPieMenu.canBeOpened(2, false, true, true));
  assert.notOk(eGPieMenu.canBeOpened(2, true, true, true));
});

QUnit.test("test canBeOpened with right button, prevent with ctrl key", function(assert) {
  initCanBeOpened(2, 0, 17, 0);
  assert.ok(eGPieMenu.canBeOpened(2, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(0, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(2, true, false, false));
  assert.notOk(eGPieMenu.canBeOpened(2, false, true, false));
  assert.notOk(eGPieMenu.canBeOpened(2, true, true, false));
  assert.ok(eGPieMenu.canBeOpened(2, false, false, true));
  assert.notOk(eGPieMenu.canBeOpened(2, true, false, true));
  assert.notOk(eGPieMenu.canBeOpened(2, false, true, true));
  assert.notOk(eGPieMenu.canBeOpened(2, true, true, true));
});

QUnit.test("test canBeOpened with right button, prevent with ctrl key, context with alt key", function(assert) {
  initCanBeOpened(2, 0, 17, 18);
  assert.ok(eGPieMenu.canBeOpened(2, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(0, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(2, true, false, false));
  assert.notOk(eGPieMenu.canBeOpened(2, false, true, false));
  assert.notOk(eGPieMenu.canBeOpened(2, true, true, false));
  assert.ok(eGPieMenu.canBeOpened(2, false, false, true));
  assert.notOk(eGPieMenu.canBeOpened(2, true, false, true));
  assert.notOk(eGPieMenu.canBeOpened(2, false, true, true));
  assert.notOk(eGPieMenu.canBeOpened(2, true, true, true));
});

QUnit.test("test canBeOpened with right button and shift key", function(assert) {
  initCanBeOpened(2, 16, 0, 0);
  assert.notOk(eGPieMenu.canBeOpened(2, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(0, false, false, false));
  assert.ok(eGPieMenu.canBeOpened(2, true, false, false));
  assert.notOk(eGPieMenu.canBeOpened(2, false, true, false));
  assert.notOk(eGPieMenu.canBeOpened(2, true, true, false));
  assert.notOk(eGPieMenu.canBeOpened(2, false, false, true));
  assert.ok(eGPieMenu.canBeOpened(2, true, false, true));
  assert.notOk(eGPieMenu.canBeOpened(2, false, true, true));
  assert.notOk(eGPieMenu.canBeOpened(2, true, true, true));
});

QUnit.test("test canBeOpened with right button and shift key, context with alt key", function(assert) {
  initCanBeOpened(2, 16, 0, 18);
  assert.notOk(eGPieMenu.canBeOpened(2, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(0, false, false, false));
  assert.ok(eGPieMenu.canBeOpened(2, true, false, false));
  assert.notOk(eGPieMenu.canBeOpened(2, false, true, false));
  assert.notOk(eGPieMenu.canBeOpened(2, true, true, false));
  assert.notOk(eGPieMenu.canBeOpened(2, false, false, true));
  assert.ok(eGPieMenu.canBeOpened(2, true, false, true));
  assert.notOk(eGPieMenu.canBeOpened(2, false, true, true));
  assert.notOk(eGPieMenu.canBeOpened(2, true, true, true));
});

QUnit.test("test canBeOpened with right button and shift key, context with ctrl key", function(assert) {
  initCanBeOpened(2, 16, 0, 17);
  assert.notOk(eGPieMenu.canBeOpened(2, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(0, false, false, false));
  assert.ok(eGPieMenu.canBeOpened(2, true, false, false));
  assert.notOk(eGPieMenu.canBeOpened(2, false, true, false));
  assert.ok(eGPieMenu.canBeOpened(2, true, true, false));
  assert.notOk(eGPieMenu.canBeOpened(2, false, false, true));
  assert.ok(eGPieMenu.canBeOpened(2, true, false, true));
  assert.notOk(eGPieMenu.canBeOpened(2, false, true, true));
  assert.ok(eGPieMenu.canBeOpened(2, true, true, true));
});

QUnit.test("test canBeOpened with right button and shift key, prevent with alt key", function(assert) {
  initCanBeOpened(2, 16, 18, 0);
  assert.notOk(eGPieMenu.canBeOpened(2, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(0, false, false, false));
  assert.ok(eGPieMenu.canBeOpened(2, true, false, false));
  assert.notOk(eGPieMenu.canBeOpened(2, false, true, false));
  assert.notOk(eGPieMenu.canBeOpened(2, true, true, false));
  assert.notOk(eGPieMenu.canBeOpened(2, false, false, true));
  assert.notOk(eGPieMenu.canBeOpened(2, true, false, true));
  assert.notOk(eGPieMenu.canBeOpened(2, false, true, true));
  assert.notOk(eGPieMenu.canBeOpened(2, true, true, true));
});

QUnit.test("test canBeOpened with right button and shift key, prevent with alt key, context with ctrl key", function(assert) {
  initCanBeOpened(2, 16, 18, 17);
  assert.notOk(eGPieMenu.canBeOpened(2, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(0, false, false, false));
  assert.ok(eGPieMenu.canBeOpened(2, true, false, false));
  assert.notOk(eGPieMenu.canBeOpened(2, false, true, false));
  assert.ok(eGPieMenu.canBeOpened(2, true, true, false));
  assert.notOk(eGPieMenu.canBeOpened(2, false, false, true));
  assert.notOk(eGPieMenu.canBeOpened(2, true, false, true));
  assert.notOk(eGPieMenu.canBeOpened(2, false, true, true));
  assert.notOk(eGPieMenu.canBeOpened(2, true, true, true));
});

QUnit.test("test canBeOpened with right button and shift key, prevent with ctrl key", function(assert) {
  initCanBeOpened(2, 16, 17, 0);
  assert.notOk(eGPieMenu.canBeOpened(2, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(0, false, false, false));
  assert.ok(eGPieMenu.canBeOpened(2, true, false, false));
  assert.notOk(eGPieMenu.canBeOpened(2, false, true, false));
  assert.notOk(eGPieMenu.canBeOpened(2, true, true, false));
  assert.notOk(eGPieMenu.canBeOpened(2, false, false, true));
  assert.ok(eGPieMenu.canBeOpened(2, true, false, true));
  assert.notOk(eGPieMenu.canBeOpened(2, false, true, true));
  assert.notOk(eGPieMenu.canBeOpened(2, true, true, true));
});

QUnit.test("test canBeOpened with right button and shift key, prevent with ctrl key, context with alt key", function(assert) {
  initCanBeOpened(2, 16, 17, 18);
  assert.notOk(eGPieMenu.canBeOpened(2, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(0, false, false, false));
  assert.ok(eGPieMenu.canBeOpened(2, true, false, false));
  assert.notOk(eGPieMenu.canBeOpened(2, false, true, false));
  assert.notOk(eGPieMenu.canBeOpened(2, true, true, false));
  assert.notOk(eGPieMenu.canBeOpened(2, false, false, true));
  assert.ok(eGPieMenu.canBeOpened(2, true, false, true));
  assert.notOk(eGPieMenu.canBeOpened(2, false, true, true));
  assert.notOk(eGPieMenu.canBeOpened(2, true, true, true));
});

QUnit.test("test canBeOpened with right button and ctrl key", function(assert) {
  initCanBeOpened(2, 17, 0, 0);
  assert.notOk(eGPieMenu.canBeOpened(2, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(0, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(2, true, false, false));
  assert.ok(eGPieMenu.canBeOpened(2, false, true, false));
  assert.notOk(eGPieMenu.canBeOpened(2, true, true, false));
  assert.notOk(eGPieMenu.canBeOpened(2, false, false, true));
  assert.notOk(eGPieMenu.canBeOpened(2, true, false, true));
  assert.ok(eGPieMenu.canBeOpened(2, false, true, true));
  assert.notOk(eGPieMenu.canBeOpened(2, true, true, true));
});

QUnit.test("test canBeOpened with right button and ctrl key, context with alt key", function(assert) {
  initCanBeOpened(2, 17, 0, 18);
  assert.notOk(eGPieMenu.canBeOpened(2, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(0, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(2, true, false, false));
  assert.ok(eGPieMenu.canBeOpened(2, false, true, false));
  assert.notOk(eGPieMenu.canBeOpened(2, true, true, false));
  assert.notOk(eGPieMenu.canBeOpened(2, false, false, true));
  assert.notOk(eGPieMenu.canBeOpened(2, true, false, true));
  assert.ok(eGPieMenu.canBeOpened(2, false, true, true));
  assert.notOk(eGPieMenu.canBeOpened(2, true, true, true));
});

QUnit.test("test canBeOpened with right button and ctrl key, prevent with alt key", function(assert) {
  initCanBeOpened(2, 17, 18, 0);
  assert.notOk(eGPieMenu.canBeOpened(2, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(0, false, false, false));
  assert.notOk(eGPieMenu.canBeOpened(2, true, false, false));
  assert.ok(eGPieMenu.canBeOpened(2, false, true, false));
  assert.notOk(eGPieMenu.canBeOpened(2, true, true, false));
  assert.notOk(eGPieMenu.canBeOpened(2, false, false, true));
  assert.notOk(eGPieMenu.canBeOpened(2, true, false, true));
  assert.notOk(eGPieMenu.canBeOpened(2, false, true, true));
  assert.notOk(eGPieMenu.canBeOpened(2, true, true, true));
});
