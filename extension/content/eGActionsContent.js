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
  Jens Tinz, his portions are Copyright (C) 2002. All Rights Reserved.
  Ons Besbes.

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


/* exported actionStatusSetters, actionRunners */
/* global document, ACTIONS_NODE_ID_PREFIX, TOOLTIPS_NODE_ID_PREFIX,
          inputElement, selection, window, imageElement, eGPieMenu */

"use strict";

let actionStatusSetters = {
  _setActionStatus: function(layoutName, actionSector, disabled) {
    let actionsNode = document.getElementById(ACTIONS_NODE_ID_PREFIX + layoutName);
    let tooltipsNode = document.getElementById(TOOLTIPS_NODE_ID_PREFIX + layoutName);
    actionsNode.childNodes[actionSector].classList.toggle("disabled", disabled);
    if (tooltipsNode !== null) {
      tooltipsNode.childNodes[actionSector].classList
                                           .toggle("disabled", disabled);
    }
  },
  
  nonDisableableAction: function() {},
  
  disableableAction: function(aMessage, layoutName, actionSector) {
    this._setActionStatus(layoutName, actionSector, aMessage.status);
  },
  
  hideImages: function(aMessage, layoutName, actionSector) {
    let disabled = document.querySelectorAll("img").length === 0;
    this._setActionStatus(layoutName, actionSector, disabled);
  },
  
  cut: function(aMessage, layoutName, actionSector) {
    let disabled = inputElement === null ||
                   inputElement.selectionStart === inputElement.selectionEnd;
    this._setActionStatus(layoutName, actionSector, disabled);
  },
  
  copy: function(aMessage, layoutName, actionSector) {
    let enabled = selection !== "" || (inputElement !== null &&
                    inputElement.selectionEnd > inputElement.selectionStart);
    this._setActionStatus(layoutName, actionSector, !enabled);
  }
};

let actionRunners = {
  back: function() {
    window.history.back();
  },
  
  forward: function() {
    window.history.forward();
  },
  
  pageTop: function() {
    window.scroll(0, 0);
  },
  
  pageBottom: function() {
    window.scroll(0, window.scrollMaxY);
  },
  
  zoomIn: function() {
    // double image size only
    let width = imageElement.style.width === "" ?
      imageElement.width * 2 + "px" :
      parseInt(imageElement.style.width, 10) * 2 + "px";
    
    let height = imageElement.style.height === "" ?
      imageElement.height * 2 + "px" :
      parseInt(imageElement.style.height, 10) * 2 + "px";
    
    imageElement.style.width = width;
    imageElement.style.height = height;
  },
  
  zoomOut: function() {
    // halve image size only
    let width = imageElement.style.width === "" ?
      imageElement.width * 0.5 + "px" :
      parseInt(imageElement.style.width, 10) * 0.5 + "px";
    
    let height = imageElement.style.height === "" ?
      imageElement.height * 0.5 + "px" :
      parseInt(imageElement.style.height, 10) * 0.5 + "px";
    
    imageElement.style.width = width;
    imageElement.style.height = height;
  },
  
  copyInformation: function(options) {
    let selection = window.getSelection();
    selection.removeAllRanges();
    let node = document.createElement("div");
    node.textContent = options.information;
    eGPieMenu.easyGesturesNode.appendChild(node);
    let range = document.createRange();
    range.selectNode(node);
    selection.addRange(range);
    document.execCommand("copy");
    eGPieMenu.easyGesturesNode.removeChild(node);
  },
  
  runScript: function(options) {
    eval(options.script);
  },
  
  hideImages: function() {
    let images = document.querySelectorAll("img");
    for (let i=0; i < images.length; ++i) {
      images[i].style.display = "none";
    }
  },
  
  commandAction: function(options) {
    document.execCommand(options.commandName);
  },
  
  paste: function() {
    let selectionStart = inputElement.selectionStart;
    let selectionEnd = inputElement.selectionEnd;
    
    let textareaWithPastedText = document.createElement("textarea");
    textareaWithPastedText.contentEditable = true;
    eGPieMenu.easyGesturesNode.appendChild(textareaWithPastedText);
    textareaWithPastedText.focus();
    document.execCommand("paste");
    
    let inputContent = inputElement.value;
    inputElement.value = inputContent.substring(0, selectionStart) +
      textareaWithPastedText.textContent +
      inputContent.substring(selectionEnd, inputContent.length);
    inputElement.focus();
    
    eGPieMenu.easyGesturesNode.removeChild(textareaWithPastedText);
  },
  
  selectAll: function() {
    if (inputElement !== null) {
      inputElement.select();
    }
    else {
      document.designMode = "on";
      document.execCommand("selectAll");
      document.designMode = "off";
    }
  }
};
