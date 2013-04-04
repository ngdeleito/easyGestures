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

var eGf = {
  firstPage : function() { // two behaviors are possible. Select the prefered lines of code
    //Returns at the begining of the history list
    getWebNavigation().gotoIndex(0);

    //Load again the first visited page --- enable this code if wanted and disable the code above
    //entry = getWebNavigation().sessionHistory.getEntryAtIndex(0, false);
    //loadURI(entry.title);
  },

  lastPage : function() {
    getWebNavigation().gotoIndex(getWebNavigation().sessionHistory.count-1);
  },

  backSite : function() {
    var index = getWebNavigation().sessionHistory.index-1;
    if (index >= 0) {
      var url = eGc.doc.URL;
      var backurl = (getWebNavigation().sessionHistory.getEntryAtIndex(index,false)).URI.spec;

      while ( (this.root(url, false).replace("www.","") == this.root(backurl, false).replace("www.","") ) && index > 0) {
        index -= 1;
        url = backurl;
        backurl = getWebNavigation().sessionHistory.getEntryAtIndex(index,false).URI.spec;
      }
      getWebNavigation().gotoIndex(index);
    }
  },

  forwardSite : function() {
    var index = getWebNavigation().sessionHistory.index+1;
    if (index <= getWebNavigation().sessionHistory.count-1) {
      var url = eGc.doc.URL;
      var forwardurl = (getWebNavigation().sessionHistory.getEntryAtIndex(index,false)).URI.spec;

      while (this.root(url, false).replace("www.","") == this.root(forwardurl, false).replace("www.","") && index < getWebNavigation().sessionHistory.count-1) {
        index += 1;
        url = forwardurl;
        forwardurl = getWebNavigation().sessionHistory.getEntryAtIndex(index,false).URI.spec;
      }
      getWebNavigation().gotoIndex(index);
    }
  },

  forward : function() {
    BrowserForward();
  },

  back : function() {
    BrowserBack();
  },

  reload : function(loading) { // reload or stop
    if (!loading) {
      BrowserReload(); // BrowserReloadSkipCache();
    }
    else {
      BrowserStop();
    }
  },

  up : function(url) {
    var protocol;
    var host;
    var directory;
    var upURL;
    var checkSubNetwork=true;
    var splitURL = url.split("/");
    //get protocol
    protocol = (splitURL[0].search(":")==-1?"":splitURL[0]);
    //get host
    for (var i=0; i<splitURL.length; i++)
      if (splitURL[i]!="" && splitURL[i]!=protocol) {
        host = splitURL[i];
        break;
      }
    //get directory
    directory = url.substring(url.search(host)+host.length+1,url.length);

    //going up
    var splitDIR = directory.split("/");

    var updir = directory;
    for (i = splitDIR.length-1; i>=0; i--) {
      if (splitDIR[i]=="") {
        if (updir!="") {
          updir = updir.substring(0,updir.length-1); //remove the slash at the end
        }
      }
      else {
        checkSubNetwork=false;
        break;
      }
    }

    // remove last part from url
    if (splitDIR[i] != "" && updir != "") {
      updir = updir.substring(0,updir.length - splitDIR[i].length);
    }
    upURL = url.replace(directory,updir);

    if (checkSubNetwork) { // remove first subnetwork of host from url if possible
      var uphost = host;
      var splitHOST = host.split(".");
      if (splitHOST[0]!="www" && splitHOST.length>2) {
        uphost = host.replace(splitHOST[0]+".","");
        upURL = url.replace(host,uphost);
      }
    }

    loadURI(upURL);
    return upURL;
  },

  root : function(url, loadURL)	{ // when eG_canGoUp calls root, url must not be loaded
    // this should work correcly with http://jolt.co.uk or gouv.qc.ca domains.
    var ios = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
    var tld = Components.classes["@mozilla.org/network/effective-tld-service;1"].getService(Components.interfaces.nsIEffectiveTLDService);
    var uri = ios.newURI(url, null, null);
    var rootURL;
    try {
      rootURL = uri.scheme + "://"+ tld.getBaseDomainFromHost(uri.host)+"/";
    }
    catch (ex) { // do something when NS_ERROR_HOST_IS_IP_ADDRES or other exception is thrown
      rootURL = url;
    }
    if (loadURL) {
      loadURI(rootURL);
    }
    return rootURL;
  },

  pageTop : function() {
    var frame = eGc.evtMouseDown.originalTarget.ownerDocument.defaultView;
    frame.scroll(0,0);
  },

  pageBottom : function() {
    var frame = eGc.evtMouseDown.originalTarget.ownerDocument.defaultView;
    //var doc= eGc.evt.originalTarget.ownerDocument;
    //frame.scroll(0,doc.getBoxObjectFor(doc.documentElement).height);
    frame.scroll(0,2147483647);	// max Int value
  },

  autoscrolling : function(evt) {
    document.getElementById("content").mCurrentBrowser.startScroll(evt);
  },

  //*********************************************************************************

  newTab : function(duplicate) {
    var originalHistory = getBrowser().sessionHistory;
    var originalIndex = originalHistory.index;

    BrowserOpenTab();
    if (duplicate) {
      // duplicate history first
      var newHistory = getBrowser().sessionHistory;

      for (var i = 0; i < originalHistory.count; i++) {
        var entry = originalHistory.getEntryAtIndex(i,false);
        var newEntry = entry;
        newHistory.QueryInterface(Components.interfaces.nsISHistoryInternal).addEntry(newEntry, true);
      }
      // go to original index
      getWebNavigation().gotoIndex(originalIndex);
    }
  },

  prevTab : function() {
    getBrowser().tabContainer.advanceSelectedTab(-1, true);
  },

  nextTab : function() {
    getBrowser().tabContainer.advanceSelectedTab(1, true);
  },

  closeTab : function() {
    gBrowser = document.getElementById("content");
    if (gBrowser.tabContainer.childNodes.length > 1 || !eGm.closeBrowserOnLastTab) {
      if (gBrowser.tabContainer.childNodes.length == 1) {
        loadURI("about:blank");
      }
      else {
        gBrowser.removeCurrentTab();
      }
    }
    else {
      closeWindow(true); //BrowserCloseWindow() removed from FF3;
    }
  },

  closeOtherTabs : function() {
    getBrowser().removeAllTabsBut(getBrowser().selectedTab);
  },

  undoCloseTab : function() {
    var ss = Cc["@mozilla.org/browser/sessionstore;1"].getService(Ci.nsISessionStore);
    if (ss.getClosedTabCount(window) > 0) {
      ss.undoCloseTab(window, 0);
    }
  },

  //*********************************************************************************

  newWindow : function(duplicate) {
    var url = "";
    if (duplicate) {
      var windowManager = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService();
      var windowManagerInterface = windowManager.QueryInterface( Components.interfaces.nsIWindowMediator);
      var win;
      for (var i= 0; i < getBrowser().browsers.length; i++) {
        url = getBrowser().browsers[i].currentURI.spec;
        if (i==0) {
          window.open(url);
          win = windowManagerInterface.getMostRecentWindow( "navigator:browser" );
        }
        else {
          win.BrowserOpenTab();
          win.loadURI(url);
        }
      }
    }
    else {
      var prefs= Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");
      if (prefs.getIntPref("browser.startup.page") == 1) {
        url = prefs.getCharPref("browser.startup.homepage");
        if (url.split('|')[1]) {
          url = "about:blank";
        }
      }
      window.open(url);
    }
  },

  closeOtherWindows : function() {
    var windowManager = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService();
    var windowManagerInterface = windowManager.QueryInterface( Components.interfaces.nsIWindowMediator);
    var winCur = windowManagerInterface.getMostRecentWindow( "navigator:browser" );
    var winEnum = windowManagerInterface.getZOrderDOMWindowEnumerator( "navigator:browser" ,false);
    while (winEnum.hasMoreElements()) {
      win = winEnum.getNext();
      if (winCur != win) {
        win.close();
      }
    }
  },

  closeBrowser : function() {
    goQuitApplication(); /*closeWindow(true);*/
  },

  minimizeWindow : function() {
    window.minimize();
  },

  fullscreen : function() {
    BrowserFullScreen();
    //hide sidebar
    var sidebar = document.getElementById("sidebar");
    if (window.fullScreen && sidebar.hasAttribute("hidden") && !sidebar.hidden) {
      toggleSidebar();
    }
  },

  //*********************************************************************************

  openLink : function(link) {
    var url;
    if (link == null) {
      url = eG_readClipboard();
    }
    else {
      url = link.href;
    }

    switch (eGm.openLink) {
      case "curTab":
        loadURI(url);
        break;
      case "newTab":
        openNewTabWith(url);
        break;
      case "newWindow":
        window.open(url);
        break;
    }
  },

  openLinkNewWindow : function(link) {
    var url;
    if (link==null) {
      url = eG_readClipboard();
    }
    else {
      url = link.href;
    }
    openNewWindowWith(url);
  },

  copyLink : function(link) { //write to clipboard the link url
    if (link!=null) {
      const cbhelper = Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper);
      cbhelper.copyString(link.href);
    }
  },

  sendLink : function(link) {
    if (link!=null) {
      MailIntegration.sendMessage(link, this.root(link, false));
    }
    else {
      MailIntegration.sendMessage(eGc.doc.URL, eGc.doc.title);
    }
  },

  copyImageLocation : function(src) {
    if (src!=null) {
      const cbhelper= Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper);
      cbhelper.copyString(src);
    }
  },

  saveLinkAs : function(link) {
    saveURL(link, null, null, false);
  },

  saveImageAs : function(src, title) {
    saveURL(src, title, null, false); /*false means don't bypass cache*/
  },

  savePageAs : function(doc) {
    saveDocument(doc);
  },

  hideImages : function() {
    if (eGc.image != null) {
      eGc.image.style.display="none";
    }
    else {
      var imgs = eGc.doc.getElementsByTagName("img");
      for (var i=0; i < imgs.length; i++) {
        imgs[i].style.display = "none";
      }
    }
  },

  copyImage : function() {
    document.popupNode = eGc.image;
    goDoCommand('cmd_copyImageContents');
  },

  //*********************************************************************************

  homePage : function() {
    BrowserHome();
  },

  dailyReadings : function() {
    var dailyReadingsFolderNode = eG_checkDailyReadingsFolder();

    if (dailyReadingsFolderNode != null) {
      PlacesUIUtils.openContainerNodeInTabs(dailyReadingsFolderNode, null, eGc.doc.defaultView);
    }
  },

  searchWeb : function(string) {
    BrowserSearch.searchBar.value = string;
    BrowserSearch.webSearch();
  },

  loadURLScript : function(appNum, string) {
    var loadURLScript= eGm["loadURLScript"+appNum];
    var codetext = loadURLScript[1];
    var isScript = loadURLScript[2];

    if (codetext != "") {
      if (string != "") {
        codetext = codetext.replace("%s",string);
      }
      var curURL = eGc.doc.URL; // get current URL
      if (curURL != "") {
        codetext = codetext.replace("%u",curURL);
      }
    }

    if ( (new Function ("return " + isScript))() ) (new Function ("return " + codetext))(); // (new Function ("return " + data ))() replacing eval on data
    else {
      switch (eGm.loadURLin) {
        case "curTab":
          loadURI(codetext); break;
        case "newTab":
          openNewTabWith(codetext);
          var container = document.getElementById("content").mTabContainer;
          var tabs = container.childNodes;
          // select new created tab
          container._selectNewTab(tabs[tabs.length-1]);   // selectNewTab removed from FF3
          break;
        case "newWindow":
          window.open(codetext); break;
      }
    }
    return false; // avoid JavaScript Error
  },

  //*********************************************************************************

  markVisitedLinks : function() {
    var globalHistory = Components.classes["@mozilla.org/browser/global-history;2"].getService(Components.interfaces.nsIGlobalHistory2);
    var ioService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
    allLinks = eGc.body.getElementsByTagName("a"); // don't use uppercase tag name because of xhtml
    for (var i=0; i<allLinks.length; i++) {
      if (allLinks[i].href!="") {
        var uri = ioService.newURI(allLinks[i].href, null, null);
        if (globalHistory.isVisited(uri)) {
          allLinks[i].style.color = "gray";
          allLinks[i].style.textDecoration = "line-through";

          var image = allLinks[i].getElementsByTagName("img")[0]; // don't use uppercase tag name because of xhtml
          if (image!=null) { // any image inside the link must be tagged too
            image.style.backgroundColor = "#eeeeee";
            image.style.border = "6px dotted #c0c0c0";
          }
        }
      }
    }
  },

  bookmarkThisLink : function(url) {
    PlacesCommandHook.bookmarkLink(PlacesUtils.unfiledBookmarksFolderId, url.href, url.text);
    //PlacesUIUtils.showMinimalAddBookmarkUI(PlacesUtils._uri(url), url.text);    // classic UI
  },

  bookmarkPage : function(url, name, doc) {
    PlacesCommandHook.bookmarkPage (getBrowser().selectedBrowser, PlacesUtils.unfiledBookmarksFolderId, true);
    // PlacesUIUtils.showMinimalAddBookmarkUI(PlacesUtils._uri(url), name, PlacesUtils.getDescriptionFromDocument(doc));   // classic UI
  },

  bookmarkOpenTabs : function() {
    PlacesCommandHook.bookmarkCurrentPages();
    //PlacesUIUtils.showMinimalAddMultiBookmarkUI(PlacesCommandHook._getUniqueTabInfo());
  },

  bookmarks : function() {
    toggleSidebar("viewBookmarksSidebar");
  },

  bookmarksToolbar : function() {
    tb = document.getElementById("PersonalToolbar");
    if (tb.hasAttribute("collapsed")) {
      tb.removeAttribute("collapsed");
    }
    else {
      tb.setAttribute("collapsed",true);
    }
    // make it persistent
    document.persist("PersonalToolbar", 'collapsed');
  },

  history : function() {
    toggleSidebar("viewHistorySidebar");
  },

  viewPageSource : function(doc) {
    BrowserViewSourceOfDocument(doc);
  },

  viewPageInfo : function(doc) {
    BrowserPageInfo(doc, null);
  },

  showOnlyThisFrame : function(frame_doc) {
    window.loadURI(frame_doc.location.href);
  },

  properties : function(target) {
    // no more available since FF 3.6: changed temporaly action to View Image Info
    if (target != null) {
      BrowserPageInfo(target.ownerDocument, "mediaTab", target);
    }
  },

  printPage : function() {
    //BrowserPrintPreview();		//could be that !
    PrintUtils.print(); 
  },

  mail : function() {
    // No more function in Firefox 3
    // MailIntegration.readMail();
    loadURI("mailto:");
  },

  privateBrowsing : function() {
    var pbs = Components.classes["@mozilla.org/privatebrowsing;1"].getService(Components.interfaces.nsIPrivateBrowsingService);  
    pbs.privateBrowsingEnabled = !pbs.privateBrowsingEnabled;
  },

  //*********************************************************************************

  cut : function() {
    if (eGc.selectionNode!=null) {
      eGc.selectionNode.select();
      eGc.selectionNode.setSelectionRange(eGc.selectionStart,eGc.selectionEnd);
    }
    goDoCommand('cmd_cut');
  },

  copy : function() {
    if (eGc.selectionNode!=null) {
      eGc.selectionNode.select();
      eGc.selectionNode.setSelectionRange(eGc.selectionStart,eGc.selectionEnd);
    }
    goDoCommand('cmd_copy');
  },

  paste : function() {
    eGc.evtMouseDown.target.focus();
    goDoCommand('cmd_paste');
  },

  undo : function() {
    eGc.evtMouseDown.target.focus();
    goDoCommand('cmd_undo');
  },

  selectAll : function() {
    if (eGc.evtMouseDown.target instanceof HTMLInputElement || eGc.evtMouseDown.target instanceof HTMLTextAreaElement) {
      eGc.evtMouseDown.target.focus();
    }
    else {
      window._content.focus();
    }
    goDoCommand('cmd_selectAll');
  },

  toggleFindBar : function(currentSelection) {
    if (gFindBar.hidden) {
      gFindBar.onFindCommand(currentSelection);
    }
    else {
      gFindBar.close();
    }
  },

  zoomIn : function zoomIn() {
    if (eGc.image==null) {
      ZoomManager.useFullZoom=false; //zoom text only because eG's actions images look ugly when scaled
      ZoomManager.enlarge();
    }
    else {
      // double image size only
      var width;
      var height;

      if (eGc.image.style.width=="") {
        width = eGc.image.width * 2 + "px";
      }
      else {
        width = parseInt(eGc.image.style.width) * 2 + "px";
      }

      if (eGc.image.style.height=="") {
        height=eGc.image.height * 2 + "px";
      }
      else {
        height = parseInt(eGc.image.style.height) * 2 + "px";
      }

      eGc.image.style.width = width;
      eGc.image.style.height = height;
    }
  },

  zoomOut : function() {
    if (eGc.image==null) {
      ZoomManager.useFullZoom = false; //zoom text only because eG's actions images look ugly when scaled
      ZoomManager.reduce();
    }
    else {
      // halve image size only
      var width;
      var height;

      if (eGc.image.style.width=="") {
        width=eGc.image.width * 0.5 + "px";
      }
      else {
        width = parseInt(eGc.image.style.width) * 0.5 + "px";
      }

      if (eGc.image.style.height=="") {
        height=eGc.image.height * 0.5 + "px";
      }
      else {
        height = parseInt(eGc.image.style.height) * 0.5 + "px";
      }

      eGc.image.style.width = width;
      eGc.image.style.height = height;
    }
  },

  zoomReset : function () {
    ZoomManager.reset();
  }
};

//*********************************************************************************

function eG_canGoUp () {
  var url = eGc.doc.URL;
  if (eGf.root(url, false) != url.replace("www.","")) {
    return true;
  }
  else {
    return false;
  }
}

function eG_getSelection() { // find text selection in current HTML document
  var sel = eGc.evtMouseDown.view.getSelection();
  sel = sel.toString();
  sel = sel.replace( /^\s+/, "" );        // remove all spaces at the beginnng of the string
  sel = sel.replace(/(\n|\r|\t)+/g, " "); // replace all Linefeed, Carriage return & Tab with a space
  sel = sel.replace(/\s+$/,"");           // remove all spaces at the end of the string
  return sel;
}

function eG_readClipboard() {
  clipb = Components.classes["@mozilla.org/widget/clipboard;1"].createInstance(Components.interfaces.nsIClipboard);
  transf = Components.classes["@mozilla.org/widget/transferable;1"].createInstance(Components.interfaces.nsITransferable);
  transf.addDataFlavor("text/unicode");

  clipb.getData(transf, clipb.kGlobalClipboard);

  var str = {};
  var strLength = {};

  transf.getTransferData("text/unicode", str, strLength);

  if (str) {
    if (Components.interfaces.nsISupportsWString) {
      str = str.value.QueryInterface(Components.interfaces.nsISupportsWString);
    }
    else
      if (Components.interfaces.nsISupportsString) {
        str = str.value.QueryInterface(Components.interfaces.nsISupportsString);
      }
      else {
        str = null;
      }
  }
  if (str) {
    return str;
  }
  else {
    return "";
  }
}

function eG_checkDailyReadingsFolder() {
  var dailyReadingsFolderNode = null;
  var folderName = "@easyGestures";
  
  try {
    // check if dailyReadings folder already exists in toolbarFolder
    var historyService = Components.classes["@mozilla.org/browser/nav-history-service;1"]
                                   .getService(Components.interfaces.nsINavHistoryService);
    var bookmarksService = Components.classes["@mozilla.org/browser/nav-bookmarks-service;1"]
                                     .getService(Components.interfaces.nsINavBookmarksService);
    var options = historyService.getNewQueryOptions();
    var query = historyService.getNewQuery();
    options.excludeItems = true;
    query.setFolders([bookmarksService.toolbarFolder], 1); //query.setFolders([bookmarksService.placesRoot], 1);
    var result = historyService.executeQuery(query, options);
    
    result.root.containerOpen = true;
    for (var i = 0; i < result.root.childCount; i++) {
      // iterate over the immediate children of this folder
      if (result.root.getChild(i).itemId == eGm.dailyReadingsFolderURI && eGm.dailyReadingsFolderURI != "" || result.root.getChild(i).title == folderName) {
        dailyReadingsFolderNode = result.root.getChild(i);
        if (eGm.dailyReadingsFolderURI == "") {
          // update value if no value found
          eGm.dailyReadingsFolderURI = result.root.getChild(i).itemId;
          eG_prefsObs.prefs.setCharPref("behavior.dailyReadingsFolderURI", eGm.dailyReadingsFolderURI);
        }
        break;
      }
    }
    result.root.containerOpen = false; // close a container after using it!
  }
  catch (ex) {
    alert("Exception: "+ ex.toString());
    return false;
  }
  
  if (eGm.dailyReadingsFolderURI == "" || dailyReadingsFolderNode == null) {
    var menuFolder = PlacesUtils.bookmarks.toolbarFolder; //Bookmarks menu folder: bookmarksMenuFolder, Toolbar folder: toolbarFolder,
    var newFolderId = PlacesUtils.bookmarks.createFolder(menuFolder, folderName, -1);
    
    eGm.dailyReadingsFolderURI = newFolderId;
    eG_prefsObs.prefs.setCharPref("behavior.dailyReadingsFolderURI", newFolderId);
    
    alert(eGc.localizing.getString("dailyReadingsCreate"));
  }
  return dailyReadingsFolderNode;
}
