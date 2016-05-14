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

function initCanContextmenuBeOpened(showKey, contextKey) {
  eGPieMenu.showButton = 2;
  eGPieMenu.showKey = showKey;
  eGPieMenu.contextKey = contextKey;
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

QUnit.test("test canContextmenuBeOpened with left button", function(assert) {
  eGPieMenu.showButton = 0;
  assert.notOk(eGPieMenu.canContextmenuBeOpened(false, false, false));
});

QUnit.test("test canContextmenuBeOpened with middle button", function(assert) {
  eGPieMenu.showButton = 1;
  assert.notOk(eGPieMenu.canContextmenuBeOpened(false, false, false));
});

QUnit.test("test canContextmenuBeOpened with right button", function(assert) {
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

QUnit.test("test canContextmenuBeOpened with right button, context with alt key", function(assert) {
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

QUnit.test("test canContextmenuBeOpened with right button, context with ctrl key", function(assert) {
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

QUnit.test("test canContextmenuBeOpened with right button and shift key", function(assert) {
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

QUnit.test("test canContextmenuBeOpened with right button and shift key, context with alt key", function(assert) {
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

QUnit.test("test canContextmenuBeOpened with right button and shift key, context with ctrl key", function(assert) {
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

QUnit.test("test canContextmenuBeOpened with right button and ctrl key", function(assert) {
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

QUnit.test("test canContextmenuBeOpened with right button and ctrl key, context with alt key", function(assert) {
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
