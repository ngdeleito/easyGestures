/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

/* The current maintainer of this file (ngdeleito) suspects that the original
   version of some code excerpts might be by Jens Tinz, Copyright (C) 2002. All
   Rights Reserved. The excerpts are explicitly marked where they occur in this
   file. */

/* exported actionStatusSetters, actionRunners */
/* global document, ACTIONS_NODE_ID_PREFIX, TOOLTIPS_NODE_ID_PREFIX,
          context, scrollableElement, window, isScrollableElementFullyScrolled,
          imageElement, navigator, inputElement */

"use strict";

let actionStatusSetters = {
  // these methods run on the topmost frame
  
  _setActionStatus(layoutName, actionSector, disabled) {
    let actionsNode = document.getElementById(ACTIONS_NODE_ID_PREFIX + layoutName);
    let tooltipsNode = document.getElementById(TOOLTIPS_NODE_ID_PREFIX + layoutName);
    actionsNode.childNodes[actionSector].classList.toggle("disabled", disabled);
    if (tooltipsNode !== null) {
      tooltipsNode.childNodes[actionSector].classList
                                           .toggle("disabled", disabled);
    }
  },
  
  nonDisableableAction() {},
  
  disableableAction(aMessage, layoutName, actionSector) {
    this._setActionStatus(layoutName, actionSector, aMessage.status);
  },
  
  toggleFullscreen(aMessage, layoutName, actionSector) {
    this._setActionStatus(layoutName, actionSector, false);
    // the code for running this action appears here, as requestFullscreen can
    // only be called within a "short running user-generated event handler"
    let actionsNode = document.getElementById(ACTIONS_NODE_ID_PREFIX + layoutName);
    actionsNode.childNodes[actionSector].addEventListener("mouseup",
      function requestFullscreen() {
        this.removeEventListener("mouseup", requestFullscreen);
        if (document.fullscreenElement === null) {
          document.documentElement.requestFullscreen();
        }
        else {
          document.exitFullscreen();
        }
      }
    );
  },
  
  hideImages(aMessage, layoutName, actionSector) {
    this._setActionStatus(layoutName, actionSector,
                          context.documentDoesntContainImages);
  },
  
  cut(aMessage, layoutName, actionSector) {
    let disabled = !context.inputElementExists ||
                   !context.inputElementContainsSelection;
    this._setActionStatus(layoutName, actionSector, disabled);
  },
  
  copy(aMessage, layoutName, actionSector) {
    let enabled = context.selection !== "" || (context.inputElementExists &&
                    context.inputElementContainsSelection);
    this._setActionStatus(layoutName, actionSector, !enabled);
  }
};

let actionRunners = {
  // these methods run on the innermost frame
  
  goToTop() {
    if (scrollableElement.scrollTop > 0) {
      scrollableElement.scroll(0, 0);
    }
    else {
      window.scroll(0, 0);
    }
  },
  
  goToBottom() {
    if (isScrollableElementFullyScrolled(scrollableElement)) {
      window.scroll(0, window.scrollMaxY);
    }
    else {
      scrollableElement.scroll(0, scrollableElement.scrollHeight -
                                  scrollableElement.clientHeight);
    }
  },
  
  zoomIn() {
    // the original version of the code of this function might be by Jens Tinz,
    // Copyright (C) 2002. All Rights Reserved.
    // double image size only
    let width = imageElement.style.width === "" ?
      `${imageElement.width * 2}px` :
      `${parseInt(imageElement.style.width, 10) * 2}px`;
    
    let height = imageElement.style.height === "" ?
      `${imageElement.height * 2}px` :
      `${parseInt(imageElement.style.height, 10) * 2}px`;
    
    imageElement.style.width = width;
    imageElement.style.height = height;
  },
  
  zoomOut() {
    // the original version of the code of this function might be by Jens Tinz,
    // Copyright (C) 2002. All Rights Reserved.
    // halve image size only
    let width = imageElement.style.width === "" ?
      `${imageElement.width * 0.5}px` :
      `${parseInt(imageElement.style.width, 10) * 0.5}px`;
    
    let height = imageElement.style.height === "" ?
      `${imageElement.height * 0.5}px` :
      `${parseInt(imageElement.style.height, 10) * 0.5}px`;
    
    imageElement.style.width = width;
    imageElement.style.height = height;
  },
  
  copyInformation(options) {
    navigator.clipboard.writeText(options.information);
  },
  
  hideImages() {
    let images = document.querySelectorAll("img");
    for (let i=0; i < images.length; ++i) {
      images[i].style.display = "none";
    }
  },
  
  commandAction(options) {
    document.execCommand(options.commandName);
  },
  
  paste() {
    let selectionStart = inputElement.selectionStart;
    let selectionEnd = inputElement.selectionEnd;
    let inputContent = inputElement.value;
    navigator.clipboard.readText().then(textToPaste => {
      inputElement.value = inputContent.substring(0, selectionStart) +
        textToPaste +
        inputContent.substring(selectionEnd, inputContent.length);
    });
    inputElement.focus();
  },
  
  selectAll() {
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
