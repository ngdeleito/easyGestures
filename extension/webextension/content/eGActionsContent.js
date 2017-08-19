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
/* global document, inputElement, selection, window, frameScrollY,
          iframeElement, frameScrollMaxY, mousedownScreenX, mouseupScreenX,
          mousedownScreenY, mouseupScreenY, imageElement, eGPieMenu  */

var actionStatusSetters = {
  _setActionStatus: function(layoutName, actionSector, disabled) {
    var actionsNode = document.getElementById("eG_actions_" + layoutName);
    var actionNode = actionsNode.childNodes[actionSector];
    if (disabled) {
      actionNode.classList.add("disabled");
    }
    else {
      actionNode.classList.remove("disabled");
    }
  },
  
  disableableAction: function(aMessage, layoutName, actionSector) {
    this._setActionStatus(layoutName, actionSector, aMessage.status);
  },
  
  hideImages: function(aMessage, layoutName, actionSector) {
    var disabled = document.querySelectorAll("img").length === 0;
    this._setActionStatus(layoutName, actionSector, disabled);
  },
  
  cut: function(aMessage, layoutName, actionSector) {
    var disabled = inputElement === null ||
                   inputElement.selectionStart === inputElement.selectionEnd;
    this._setActionStatus(layoutName, actionSector, disabled);
  },
  
  copy: function(aMessage, layoutName, actionSector) {
    var enabled = selection !== "" || (inputElement !== null &&
                    inputElement.selectionEnd > inputElement.selectionStart);
    this._setActionStatus(layoutName, actionSector, !enabled);
  }
};

var actionRunners = {
  back: function() {
    window.history.back();
  },
  
  forward: function() {
    window.history.forward();
  },
  
  pageTop: function() {
    if (frameScrollY !== 0) {
      iframeElement.contentWindow.scroll(0, 0);
    }
    else {
      window.scroll(0, 0);
    }
  },
  
  pageBottom: function() {
    if (frameScrollY !== frameScrollMaxY) {
      iframeElement.contentWindow.scroll(0, frameScrollMaxY);
    }
    else {
      window.scroll(0, window.scrollMaxY);
    }
  },
  
  autoscrolling: function(options) {
    var useMousedownCoordinates = options.useMousedownCoordinates;
    // see chrome://global/content/browser-content.js: we simulate a middle
    // button (non cancelable) mousedown event to trigger Firefox's
    // autoscrolling --> autoscrolling is currently broken, as in WebExtensions
    // created events seem to be non trusted
    document.documentElement.dispatchEvent(new window.MouseEvent("mousedown", {
      view: window,
      bubbles: true,
      button: 1,
      screenX: useMousedownCoordinates ? mousedownScreenX : mouseupScreenX,
      screenY: useMousedownCoordinates ? mousedownScreenY : mouseupScreenY
    }));
  },
  
  zoomIn: function() {
    // double image size only
    var width = imageElement.style.width === "" ?
      imageElement.width * 2 + "px" :
      parseInt(imageElement.style.width, 10) * 2 + "px";
    
    var height = imageElement.style.height === "" ?
      imageElement.height * 2 + "px" :
      parseInt(imageElement.style.height, 10) * 2 + "px";
    
    imageElement.style.width = width;
    imageElement.style.height = height;
  },
  
  zoomOut: function() {
    // halve image size only
    var width = imageElement.style.width === "" ?
      imageElement.width * 0.5 + "px" :
      parseInt(imageElement.style.width, 10) * 0.5 + "px";
    
    var height = imageElement.style.height === "" ?
      imageElement.height * 0.5 + "px" :
      parseInt(imageElement.style.height, 10) * 0.5 + "px";
    
    imageElement.style.width = width;
    imageElement.style.height = height;
  },
  
  printPage: function() {
    window.print();
  },
  
  copyInformation: function(options) {
    var selection = window.getSelection();
    selection.removeAllRanges();
    var node = document.createElement("div");
    node.textContent = options.information;
    var easyGesturesNode = document.getElementById(eGPieMenu.easyGesturesID);
    easyGesturesNode.appendChild(node);
    var range = document.createRange();
    range.selectNode(node);
    selection.addRange(range);
    document.execCommand("copy");
    easyGesturesNode.removeChild(node);
  },
  
  runScript: function(options) {
    eval(options.script);
  },
  
  hideImages: function() {
    var images = document.querySelectorAll("img");
    for (var i=0; i < images.length; ++i) {
      images[i].style.display = "none";
    }
  },
  
  commandAction: function(options) {
    document.execCommand(options.commandName);
  },
  
  paste: function() {
    var selectionStart = inputElement.selectionStart;
    var selectionEnd = inputElement.selectionEnd;
    
    var textareaWithPastedText = document.createElement("textarea");
    textareaWithPastedText.contentEditable = true;
    var easyGesturesNode = document.getElementById(eGPieMenu.easyGesturesID);
    easyGesturesNode.appendChild(textareaWithPastedText);
    textareaWithPastedText.focus();
    document.execCommand("paste");
    
    var inputContent = inputElement.value;
    inputElement.value = inputContent.substring(0, selectionStart) +
      textareaWithPastedText.textContent +
      inputContent.substring(selectionEnd, inputContent.length);
    inputElement.focus();
    
    easyGesturesNode.removeChild(textareaWithPastedText);
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