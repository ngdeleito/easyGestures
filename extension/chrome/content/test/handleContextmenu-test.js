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


/* global eGm, QUnit, eG_handleContextmenu */

function initHandleContextmenu(showKey, contextKey) {
  eGm.showButton = 2;
  eGm.showKey = showKey;
  eGm.contextKey = contextKey;
}

function initHandleContextmenuMessage(shiftKey, ctrlKey, altKey) {
  return {
    data: {
      shiftKey: shiftKey,
      ctrlKey: ctrlKey,
      altKey: altKey
    }
  };
}

// All possible combinations for initHandleContextmenu are:
//   0  0
//   0  18
//   0  17
//   16 0
//   16 18
//   16 17
//   17 0
//   17 18
//   17 17 -> not tested, not allowed

QUnit.test("test eG_handleContextmenu with left button", function(assert) {
  eGm.showButton = 0;
  assert.notOk(eG_handleContextmenu(initHandleContextmenuMessage(false, false, false)));
});

QUnit.test("test eG_handleContextmenu with middle button", function(assert) {
  eGm.showButton = 1;
  assert.notOk(eG_handleContextmenu(initHandleContextmenuMessage(false, false, false)));
});

QUnit.test("test eG_handleContextmenu with right button", function(assert) {
  initHandleContextmenu(0, 0);
  assert.ok(eG_handleContextmenu(initHandleContextmenuMessage(false, false, false)));
  assert.ok(eG_handleContextmenu(initHandleContextmenuMessage(false, false, true)));
  assert.notOk(eG_handleContextmenu(initHandleContextmenuMessage(false, true, false)));
  assert.notOk(eG_handleContextmenu(initHandleContextmenuMessage(false, true, true)));
  assert.notOk(eG_handleContextmenu(initHandleContextmenuMessage(true, false, false)));
  assert.notOk(eG_handleContextmenu(initHandleContextmenuMessage(true, false, true)));
  assert.notOk(eG_handleContextmenu(initHandleContextmenuMessage(true, true, false)));
  assert.notOk(eG_handleContextmenu(initHandleContextmenuMessage(true, true, true)));
});

QUnit.test("test eG_handleContextmenu with right button, context with alt key", function(assert) {
  initHandleContextmenu(0, 18);
  assert.ok(eG_handleContextmenu(initHandleContextmenuMessage(false, false, false)));
  assert.ok(eG_handleContextmenu(initHandleContextmenuMessage(false, false, true)));
  assert.notOk(eG_handleContextmenu(initHandleContextmenuMessage(false, true, false)));
  assert.notOk(eG_handleContextmenu(initHandleContextmenuMessage(false, true, true)));
  assert.notOk(eG_handleContextmenu(initHandleContextmenuMessage(true, false, false)));
  assert.notOk(eG_handleContextmenu(initHandleContextmenuMessage(true, false, true)));
  assert.notOk(eG_handleContextmenu(initHandleContextmenuMessage(true, true, false)));
  assert.notOk(eG_handleContextmenu(initHandleContextmenuMessage(true, true, true)));
});

QUnit.test("test eG_handleContextmenu with right button, context with ctrl key", function(assert) {
  initHandleContextmenu(0, 17);
  assert.ok(eG_handleContextmenu(initHandleContextmenuMessage(false, false, false)));
  assert.ok(eG_handleContextmenu(initHandleContextmenuMessage(false, false, true)));
  assert.ok(eG_handleContextmenu(initHandleContextmenuMessage(false, true, false)));
  assert.ok(eG_handleContextmenu(initHandleContextmenuMessage(false, true, true)));
  assert.notOk(eG_handleContextmenu(initHandleContextmenuMessage(true, false, false)));
  assert.notOk(eG_handleContextmenu(initHandleContextmenuMessage(true, false, true)));
  assert.notOk(eG_handleContextmenu(initHandleContextmenuMessage(true, true, false)));
  assert.notOk(eG_handleContextmenu(initHandleContextmenuMessage(true, true, true)));
});

QUnit.test("test eG_handleContextmenu with right button and shift key", function(assert) {
  initHandleContextmenu(16, 0);
  assert.notOk(eG_handleContextmenu(initHandleContextmenuMessage(false, false, false)));
  assert.notOk(eG_handleContextmenu(initHandleContextmenuMessage(false, false, true)));
  assert.notOk(eG_handleContextmenu(initHandleContextmenuMessage(false, true, false)));
  assert.notOk(eG_handleContextmenu(initHandleContextmenuMessage(false, true, true)));
  assert.ok(eG_handleContextmenu(initHandleContextmenuMessage(true, false, false)));
  assert.ok(eG_handleContextmenu(initHandleContextmenuMessage(true, false, true)));
  assert.notOk(eG_handleContextmenu(initHandleContextmenuMessage(true, true, false)));
  assert.notOk(eG_handleContextmenu(initHandleContextmenuMessage(true, true, true)));
});

QUnit.test("test eG_handleContextmenu with right button and shift key, context with alt key", function(assert) {
  initHandleContextmenu(16, 18);
  assert.notOk(eG_handleContextmenu(initHandleContextmenuMessage(false, false, false)));
  assert.notOk(eG_handleContextmenu(initHandleContextmenuMessage(false, false, true)));
  assert.notOk(eG_handleContextmenu(initHandleContextmenuMessage(false, true, false)));
  assert.notOk(eG_handleContextmenu(initHandleContextmenuMessage(false, true, true)));
  assert.ok(eG_handleContextmenu(initHandleContextmenuMessage(true, false, false)));
  assert.ok(eG_handleContextmenu(initHandleContextmenuMessage(true, false, true)));
  assert.notOk(eG_handleContextmenu(initHandleContextmenuMessage(true, true, false)));
  assert.notOk(eG_handleContextmenu(initHandleContextmenuMessage(true, true, true)));
});

QUnit.test("test eG_handleContextmenu with right button and shift key, context with ctrl key", function(assert) {
  initHandleContextmenu(16, 17);
  assert.notOk(eG_handleContextmenu(initHandleContextmenuMessage(false, false, false)));
  assert.notOk(eG_handleContextmenu(initHandleContextmenuMessage(false, false, true)));
  assert.notOk(eG_handleContextmenu(initHandleContextmenuMessage(false, true, false)));
  assert.notOk(eG_handleContextmenu(initHandleContextmenuMessage(false, true, true)));
  assert.ok(eG_handleContextmenu(initHandleContextmenuMessage(true, false, false)));
  assert.ok(eG_handleContextmenu(initHandleContextmenuMessage(true, false, true)));
  assert.ok(eG_handleContextmenu(initHandleContextmenuMessage(true, true, false)));
  assert.ok(eG_handleContextmenu(initHandleContextmenuMessage(true, true, true)));
});

QUnit.test("test eG_handleContextmenu with right button and ctrl key", function(assert) {
  initHandleContextmenu(17, 0);
  assert.notOk(eG_handleContextmenu(initHandleContextmenuMessage(false, false, false)));
  assert.notOk(eG_handleContextmenu(initHandleContextmenuMessage(false, false, true)));
  assert.ok(eG_handleContextmenu(initHandleContextmenuMessage(false, true, false)));
  assert.ok(eG_handleContextmenu(initHandleContextmenuMessage(false, true, true)));
  assert.notOk(eG_handleContextmenu(initHandleContextmenuMessage(true, false, false)));
  assert.notOk(eG_handleContextmenu(initHandleContextmenuMessage(true, false, true)));
  assert.notOk(eG_handleContextmenu(initHandleContextmenuMessage(true, true, false)));
  assert.notOk(eG_handleContextmenu(initHandleContextmenuMessage(true, true, true)));
});

QUnit.test("test eG_handleContextmenu with right button and ctrl key, context with alt key", function(assert) {
  initHandleContextmenu(17, 18);
  assert.notOk(eG_handleContextmenu(initHandleContextmenuMessage(false, false, false)));
  assert.notOk(eG_handleContextmenu(initHandleContextmenuMessage(false, false, true)));
  assert.ok(eG_handleContextmenu(initHandleContextmenuMessage(false, true, false)));
  assert.ok(eG_handleContextmenu(initHandleContextmenuMessage(false, true, true)));
  assert.notOk(eG_handleContextmenu(initHandleContextmenuMessage(true, false, false)));
  assert.notOk(eG_handleContextmenu(initHandleContextmenuMessage(true, false, true)));
  assert.notOk(eG_handleContextmenu(initHandleContextmenuMessage(true, true, false)));
  assert.notOk(eG_handleContextmenu(initHandleContextmenuMessage(true, true, true)));
});
