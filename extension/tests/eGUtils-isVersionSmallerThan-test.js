/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

/* global QUnit, eGUtils */

"use strict";

QUnit.test("test isVersionSmallerThan", assert => {
  assert.ok(eGUtils.isVersionSmallerThan("5.2", "5.2.1"));
  assert.ok(eGUtils.isVersionSmallerThan("5.2.1", "5.2.2"));
  assert.ok(eGUtils.isVersionSmallerThan("5.2", "5.3"));
  assert.ok(eGUtils.isVersionSmallerThan("5.2", "6.0"));
  assert.notOk(eGUtils.isVersionSmallerThan("5.2", "5.2"));
  assert.notOk(eGUtils.isVersionSmallerThan("5.2.1", "5.2.1"));
  assert.notOk(eGUtils.isVersionSmallerThan("5.2.1", "5.2"));
  assert.notOk(eGUtils.isVersionSmallerThan("5.2.2", "5.2.1"));
  assert.notOk(eGUtils.isVersionSmallerThan("5.3", "5.2"));
  assert.notOk(eGUtils.isVersionSmallerThan("6.0", "5.2"));
});
