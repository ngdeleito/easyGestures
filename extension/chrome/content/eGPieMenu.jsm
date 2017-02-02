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

The Original Code is RadialContext.

The Initial Developer of the Original Code is Jens Tinz.
Portions created by the Initial Developer are Copyright (C) 2002
the Initial Developer. All Rights Reserved.

Contributor(s):
  Ons Besbes.
  ngdeleito
  
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


/* exported EXPORTED_SYMBOLS, eGPieMenu */
/* global Components, Services */

var EXPORTED_SYMBOLS = ["eGPieMenu"];

Components.utils.import("resource://gre/modules/Services.jsm");

var eGPieMenu = {
  init : function() {
    var prefs = Services.prefs.getBranch("extensions.easygestures.");
    
    // loading preferences first
    this.showButton = prefs.getIntPref("activation.showButton"); // mouse button for opening the pie menu
    this.showKey = prefs.getIntPref("activation.showKey"); // key for showing the pie menu with mouse button clicked
    this.showAltButton = prefs.getIntPref("activation.showAltButton"); // mouse button for switching between primary and alternative pie menu
    this.preventOpenKey = prefs.getIntPref("activation.preventOpenKey");
    this.contextKey = prefs.getIntPref("activation.contextKey"); // key for forcing non contextual or contextual pie menu
    this.contextShowAuto = prefs.getBoolPref("activation.contextShowAuto");	// enables context sensitivity
    
    this.largeMenu = prefs.getBoolPref("behavior.largeMenu"); // use larger pie menu with 10 actions instead of 8
    this.smallIcons = prefs.getBoolPref("behavior.smallIcons");
    this.menuOpacity = prefs.getIntPref("behavior.menuOpacity")/100; // because menuopacity is set in % in preferences dialog
    this.showTooltips = prefs.getBoolPref("behavior.showTooltips"); // tooltip showing
    this.tooltipsDelay = prefs.getIntPref("behavior.tooltipsDelay"); // tooltip delay
    this.moveAuto = prefs.getBoolPref("behavior.moveAuto"); // true: menu moves when reaching edge. false: memu moves by pressing <Shift> key
    this.handleLinks = prefs.getBoolPref("behavior.handleLinks"); // handle clicking on links through pie menu button
    this.linksDelay = prefs.getIntPref("behavior.linksDelay"); // max delay to click on a link. If delay is passed, a keyup will just keep menu open
    this.handleLinksAsOpenLink = prefs.getBoolPref("behavior.handleLinksAsOpenLink");
    this.autoscrollingOn = prefs.getBoolPref("behavior.autoscrollingOn");	// autoscrolling enabling
    this.autoscrollingDelay = prefs.getIntPref("behavior.autoscrollingDelay"); // autoscrolling delay
    
    this.mainAlt1MenuEnabled = prefs.getBoolPref("menus.mainAlt1Enabled");
    this.mainAlt2MenuEnabled = prefs.getBoolPref("menus.mainAlt2Enabled");
    
    this.extraAlt1MenuEnabled = prefs.getBoolPref("menus.extraAlt1Enabled");
    this.extraAlt2MenuEnabled = prefs.getBoolPref("menus.extraAlt2Enabled");
    
    this.loadURLActionPrefs = {
      loadURL1: prefs.getComplexValue("customizations.loadURL1", Components.interfaces.nsISupportsString).data.split("\u2022"), // [0]: name, [1]: text, [2]:isScript, [3]: newIconPath, [4]: favicon, [5]: newIcon // previous separator "•" no longer works
      loadURL2: prefs.getComplexValue("customizations.loadURL2", Components.interfaces.nsISupportsString).data.split("\u2022"),
      loadURL3: prefs.getComplexValue("customizations.loadURL3", Components.interfaces.nsISupportsString).data.split("\u2022"),
      loadURL4: prefs.getComplexValue("customizations.loadURL4", Components.interfaces.nsISupportsString).data.split("\u2022"),
      loadURL5: prefs.getComplexValue("customizations.loadURL5", Components.interfaces.nsISupportsString).data.split("\u2022"),
      loadURL6: prefs.getComplexValue("customizations.loadURL6", Components.interfaces.nsISupportsString).data.split("\u2022"),
      loadURL7: prefs.getComplexValue("customizations.loadURL7", Components.interfaces.nsISupportsString).data.split("\u2022"),
      loadURL8: prefs.getComplexValue("customizations.loadURL8", Components.interfaces.nsISupportsString).data.split("\u2022"),
      loadURL9: prefs.getComplexValue("customizations.loadURL9", Components.interfaces.nsISupportsString).data.split("\u2022"),
      loadURL10: prefs.getComplexValue("customizations.loadURL10", Components.interfaces.nsISupportsString).data.split("\u2022")
    };
    this.runScriptActionPrefs = {
      runScript1: prefs.getComplexValue("customizations.runScript1", Components.interfaces.nsISupportsString).data.split("\u2022"),
      runScript2: prefs.getComplexValue("customizations.runScript2", Components.interfaces.nsISupportsString).data.split("\u2022"),
      runScript3: prefs.getComplexValue("customizations.runScript3", Components.interfaces.nsISupportsString).data.split("\u2022"),
      runScript4: prefs.getComplexValue("customizations.runScript4", Components.interfaces.nsISupportsString).data.split("\u2022"),
      runScript5: prefs.getComplexValue("customizations.runScript5", Components.interfaces.nsISupportsString).data.split("\u2022"),
      runScript6: prefs.getComplexValue("customizations.runScript6", Components.interfaces.nsISupportsString).data.split("\u2022"),
      runScript7: prefs.getComplexValue("customizations.runScript7", Components.interfaces.nsISupportsString).data.split("\u2022"),
      runScript8: prefs.getComplexValue("customizations.runScript8", Components.interfaces.nsISupportsString).data.split("\u2022"),
      runScript9: prefs.getComplexValue("customizations.runScript9", Components.interfaces.nsISupportsString).data.split("\u2022"),
      runScript10: prefs.getComplexValue("customizations.runScript10", Components.interfaces.nsISupportsString).data.split("\u2022")
    };
  },
  
  isShown : function() {
    return false;
  },
  
  close : function() {
  },
  
  removeFromAllPages : function() {
  }
};
