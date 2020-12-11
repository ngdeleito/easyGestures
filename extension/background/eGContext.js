/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

/* exported eGContext */

"use strict";

let eGContext = {
  pageURL: "",
  urlToIdentifier: "",
  
  selection: null,
  anchorElementExists: false,
  anchorElementHREF: null,
  anchorElementText: null,
  imageElementDoesntExist: true,
  imageElementSRC: "",
  inputElementExists: false,
  inputElementContainsSelection: false,
  documentDoesntContainImages: true,
  frameHierarchyArray: null
};
