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

var eGf = {
  firstPage : function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.gBrowser.gotoIndex(0);
  },

  lastPage : function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.gBrowser.gotoIndex(window.gBrowser.sessionHistory.count - 1);
  },
  
  _getRootURL : function(url) {
    // this should work correcly with http://jolt.co.uk or gouv.qc.ca domains.
    var tld = Components.classes["@mozilla.org/network/effective-tld-service;1"]
                        .getService(Components.interfaces.nsIEffectiveTLDService);
    var uri = Services.io.newURI(url, null, null);
    var rootURL;
    try {
      rootURL = uri.scheme + "://" + tld.getBaseDomainFromHost(uri.host) + "/";
    }
    catch (ex) { // do something when NS_ERROR_HOST_IS_IP_ADDRES or other exception is thrown
      rootURL = url;
    }
    return rootURL;
  },
  
  backSite : function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    var gBrowser = window.gBrowser;
    var index = gBrowser.sessionHistory.index - 1;
    
    if (index >= 0) {
      var url = eGc.doc.URL;
      var backurl = (gBrowser.sessionHistory.getEntryAtIndex(index, false)).URI.spec;

      while ((this._getRootURL(url).replace("www.", "") == this._getRootURL(backurl).replace("www.", "")) && index > 0) {
        index -= 1;
        url = backurl;
        backurl = gBrowser.sessionHistory.getEntryAtIndex(index, false).URI.spec;
      }
      gBrowser.gotoIndex(index);
    }
  },

  forwardSite : function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    var gBrowser = window.gBrowser;
    var index = gBrowser.sessionHistory.index + 1;
    
    if (index <= gBrowser.sessionHistory.count - 1) {
      var url = eGc.doc.URL;
      var forwardurl = (gBrowser.sessionHistory.getEntryAtIndex(index, false)).URI.spec;

      while (this._getRootURL(url).replace("www.", "") == this._getRootURL(forwardurl).replace("www.", "") && index < gBrowser.sessionHistory.count - 1) {
        index += 1;
        url = forwardurl;
        forwardurl = gBrowser.sessionHistory.getEntryAtIndex(index, false).URI.spec;
      }
      gBrowser.gotoIndex(index);
    }
  },

  forward : function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.gBrowser.goForward();
  },

  back : function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.gBrowser.goBack();
  },

  reload : function(loading) { // reload or stop
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    var gBrowser = window.gBrowser;

    if (!loading) {
      gBrowser.reload();
    }
    else {
      gBrowser.stop();
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

    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.gBrowser.loadURI(upURL);
    return upURL;
  },

  root : function(url)	{
    var rootURL = this._getRootURL(url);
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.gBrowser.loadURI(rootURL);
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
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.document.getElementById("content").mCurrentBrowser.startScroll(evt);
  },

  //*********************************************************************************

  newTab : function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    var gBrowser = window.gBrowser;
    gBrowser.selectedTab = gBrowser.addTab();
    window.gURLBar.focus();
  },
  
  duplicateTab : function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    var gBrowser = window.gBrowser;
    var ss = Components.classes["@mozilla.org/browser/sessionstore;1"]
                       .getService(Components.interfaces.nsISessionStore);
    gBrowser.selectedTab = ss.duplicateTab(window, gBrowser.selectedTab);
  },

  prevTab : function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.gBrowser.tabContainer.advanceSelectedTab(-1, true);
  },

  nextTab : function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.gBrowser.tabContainer.advanceSelectedTab(1, true);
  },

  closeTab : function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    var gBrowser = window.gBrowser;

    if (gBrowser.tabContainer.childNodes.length > 1 || !eGm.closeBrowserOnLastTab) {
      if (gBrowser.tabContainer.childNodes.length == 1) {
        gBrowser.loadURI("about:blank");
      }
      else {
        gBrowser.removeCurrentTab();
      }
    }
    else {
      window.close();
    }
  },

  closeOtherTabs : function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    var gBrowser = window.gBrowser;
    gBrowser.removeAllTabsBut(gBrowser.selectedTab);
  },

  undoCloseTab : function() {
    var ss = Components.classes["@mozilla.org/browser/sessionstore;1"]
                       .getService(Components.interfaces.nsISessionStore);
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    if (ss.getClosedTabCount(window) > 0) {
      ss.undoCloseTab(window, 0);
    }
  },

  //*********************************************************************************

  newWindow : function() {
    var url = "";
    if (Services.prefs.getIntPref("browser.startup.page") == 1) {
      url = Services.prefs.getCharPref("browser.startup.homepage");
      if (url.split('|')[1]) {
        url = "about:blank";
      }
    }
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.open(url);
  },
  
  duplicateWindow : function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    var gBrowser = window.gBrowser;
    var newWindow;
    
    for (let i = 0; i < gBrowser.browsers.length; i++) {
      let url = gBrowser.browsers[i].currentURI.spec;
      if (i == 0) {
        window.open(url);
        newWindow = Services.wm.getMostRecentWindow("navigator:browser");
      }
      else {
        newWindow.gBrowser.addTab(url);
      }
    }
  },

  closeOtherWindows : function() {
    var currentWindow = Services.wm.getMostRecentWindow("navigator:browser");
    var openWindows = Services.wm.getEnumerator("navigator:browser");
    
    while (openWindows.hasMoreElements()) {
      let window = openWindows.getNext();
      if (window != currentWindow) {
        window.close();
      }
    }
  },
  
  restart : function() {
    Services.startup.quit(Components.interfaces.nsIAppStartup.eForceQuit
                         |Components.interfaces.nsIAppStartup.eRestart);
  },

  quit : function() {
    Services.startup.quit(Components.interfaces.nsIAppStartup.eForceQuit);
  },

  minimizeWindow : function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.minimize();
  },

  fullscreen : function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.fullScreen = !window.fullScreen;
  },

  //*********************************************************************************

  _readClipboard : function() {
    var clipb = Components.classes["@mozilla.org/widget/clipboard;1"]
                          .createInstance(Components.interfaces.nsIClipboard);
    var transf = Components.classes["@mozilla.org/widget/transferable;1"]
                           .createInstance(Components.interfaces.nsITransferable);

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
  },

  openLink : function(link) {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    var gBrowser = window.gBrowser;
    var url;
    if (link == null) {
      url = this._readClipboard();
    }
    else {
      url = link.href;
    }

    switch (eGm.openLink) {
      case "curTab":
        gBrowser.loadURI(url);
        break;
      case "newTab":
        gBrowser.addTab(url);
        break;
      case "newWindow":
        window.open(url);
        break;
    }
  },

  openLinkNewWindow : function(link) {
    var url;
    if (link == null) {
      url = this._readClipboard();
    }
    else {
      url = link.href;
    }
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.open(url);
  },

  copyLink : function(link) { //write to clipboard the link url
    if (link != null) {
      const cbhelper = Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper);
      cbhelper.copyString(link.href);
    }
  },

  sendLink : function(link) {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    if (link != null) {
      window.MailIntegration.sendMessage(link, this._getRootURL(link));
    }
    else {
      window.MailIntegration.sendMessage(eGc.doc.URL, eGc.doc.title);
    }
  },

  copyImageLocation : function(src) {
    if (src != null) {
      const cbhelper = Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper);
      cbhelper.copyString(src);
    }
  },

  _getFileForSavingData : function(filter, defaultName) {
    const nsIFilePicker = Components.interfaces.nsIFilePicker;
    var fp = Components.classes["@mozilla.org/filepicker;1"]
                       .createInstance(nsIFilePicker);
    var window = Services.wm.getMostRecentWindow("navigator:browser");

    fp.init(window, null, nsIFilePicker.modeSave);
    fp.appendFilters(filter);
    fp.defaultString = defaultName;
    var returnValue = fp.show();
    if (returnValue == nsIFilePicker.returnOK || returnValue == nsIFilePicker.returnReplace) {
      return fp.file;
    }
    else {
      return null;
    }
  },
  
  _saveContentFromLink : function(link, filter) {
    var uri = Services.io.newURI(link, null, null);
    var file = this._getFileForSavingData(
                 filter,
                 uri.path.substring(uri.path.lastIndexOf("/") + 1));

    if (file != null) {
      var wbp = Components.classes['@mozilla.org/embedding/browser/nsWebBrowserPersist;1']
                          .createInstance(Components.interfaces.nsIWebBrowserPersist);
      // don't save gzipped
      wbp.persistFlags &= ~Components.interfaces.nsIWebBrowserPersist.PERSIST_FLAGS_NO_CONVERSION;
      var window = Services.wm.getMostRecentWindow("navigator:browser");
      var privacyContext = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                                 .getInterface(Components.interfaces.nsIWebNavigation)
                                 .QueryInterface(Components.interfaces.nsILoadContext);
      wbp.saveURI(uri, null, null, null, null, file, privacyContext);
    }
  },
  
  saveLinkAs : function(link) {
    this._saveContentFromLink(link, Components.interfaces.nsIFilePicker.filterHTML);
  },

  saveImageAs : function(link) {
    this._saveContentFromLink(link, Components.interfaces.nsIFilePicker.filterImages);
  },

  savePageAs : function(document) {
    var file = this._getFileForSavingData(
                 Components.interfaces.nsIFilePicker.filterHTML,
                 document.title);

    if (file != null) {
      var wbp = Components.classes['@mozilla.org/embedding/browser/nsWebBrowserPersist;1']
                          .createInstance(Components.interfaces.nsIWebBrowserPersist);
      // don't save gzipped
      wbp.persistFlags &= ~Components.interfaces.nsIWebBrowserPersist.PERSIST_FLAGS_NO_CONVERSION;
      wbp.saveDocument(document, file, null, null, null, null);
    }
  },

  hideImages : function() {
    if (eGc.image != null) {
      eGc.image.style.display = "none";
    }
    else {
      var imgs = eGc.doc.getElementsByTagName("img");
      for (var i=0; i < imgs.length; i++) {
        imgs[i].style.display = "none";
      }
    }
  },

  copyImage : function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.document.popupNode = eGc.image;
    window.goDoCommand('cmd_copyImageContents');
  },

  //*********************************************************************************

  homePage : function() {
    var homepage = Services.prefs.getCharPref("browser.startup.homepage");
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.gBrowser.loadTabs(homepage.split("|"), true, false);
  },
  
  _checkDailyReadingsFolder : function() {
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
      options.excludeItems = false;
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
      var menuFolder = bookmarksService.toolbarFolder;
      var newFolderId = bookmarksService.createFolder(menuFolder, folderName, -1);
      
      eGm.dailyReadingsFolderURI = newFolderId;
      eG_prefsObs.prefs.setCharPref("behavior.dailyReadingsFolderURI", newFolderId);
      
      Services.prompt.alert(null, "", eGc.localizing.getString("dailyReadingsCreate"));
    }
    return dailyReadingsFolderNode;
  },

  dailyReadings : function() {
    var dailyReadingsFolderNode = this._checkDailyReadingsFolder();

    if (dailyReadingsFolderNode != null) {
      dailyReadingsFolderNode.QueryInterface(Components.interfaces.nsINavHistoryContainerResultNode);
      dailyReadingsFolderNode.containerOpen = true;
      var uris = [];
      for (let i=0; i < dailyReadingsFolderNode.childCount; ++i) {
        uris.push(dailyReadingsFolderNode.getChild(i).uri);
      }
      dailyReadingsFolderNode.containerOpen = false;
      var window = Services.wm.getMostRecentWindow("navigator:browser");
      window.gBrowser.loadTabs(uris, true, false);
    }
  },

  searchWeb : function(string) {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.BrowserSearch.searchBar.value = string;
    window.BrowserSearch.webSearch();
  },

  loadURLScript : function(appNum, string) {
    var loadURLScript = eGm["loadURLScript" + appNum];
    var codetext = loadURLScript[1];
    var isScript = loadURLScript[2];

    if (codetext != "") {
      if (string != "") {
        codetext = codetext.replace("%s", string);
      }
      var curURL = eGc.doc.URL; // get current URL
      if (curURL != "") {
        codetext = codetext.replace("%u", curURL);
      }
    }

    if ( (new Function ("return " + isScript))() ) {
      (new Function ("return " + codetext))(); // (new Function ("return " + data ))() replacing eval on data
    }
    else {
      var window = Services.wm.getMostRecentWindow("navigator:browser");
      var gBrowser = window.gBrowser;
      
      switch (eGm.loadURLin) {
        case "curTab":
          gBrowser.loadURI(codetext);
          break;
        case "newTab":
          gBrowser.selectedTab = gBrowser.addTab(codetext);
          break;
        case "newWindow":
          window.open(codetext);
          break;
      }
    }
    return false; // avoid JavaScript Error
  },

  //*********************************************************************************

  markVisitedLinks : function() {
    var styleElement = eGc.doc.createElement("style");
    eGc.doc.getElementsByTagName("head")[0].appendChild(styleElement);
    var styleSheet = eGc.doc.styleSheets[eGc.doc.styleSheets.length - 1];
    styleSheet.insertRule(":link, :link img { outline: dashed medium white !important; }", 0);
    styleSheet.insertRule(":visited, :visited img { outline-color: red !important; }", 1);
  },

  bookmarkThisLink : function(url) {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.PlacesCommandHook.bookmarkLink(window.PlacesUtils.unfiledBookmarksFolderId, url.href, url.text);
    //PlacesUIUtils.showMinimalAddBookmarkUI(PlacesUtils._uri(url), url.text);    // classic UI
  },

  bookmarkPage : function(url, name, doc) {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.PlacesCommandHook.bookmarkPage(window.gBrowser.selectedBrowser, window.PlacesUtils.unfiledBookmarksFolderId, true);
    // PlacesUIUtils.showMinimalAddBookmarkUI(PlacesUtils._uri(url), name, PlacesUtils.getDescriptionFromDocument(doc));   // classic UI
  },

  bookmarkOpenTabs : function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.PlacesCommandHook.bookmarkCurrentPages();
    //PlacesUIUtils.showMinimalAddMultiBookmarkUI(PlacesCommandHook._getUniqueTabInfo());
  },

  bookmarks : function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.toggleSidebar("viewBookmarksSidebar");
  },

  bookmarksToolbar : function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    var document = window.document;
    var tb = document.getElementById("PersonalToolbar");
    if (tb.hasAttribute("collapsed")) {
      tb.removeAttribute("collapsed");
    }
    else {
      tb.setAttribute("collapsed", true);
    }
    // make it persistent
    document.persist("PersonalToolbar", 'collapsed');
  },

  history : function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.toggleSidebar("viewHistorySidebar");
  },

  viewPageSource : function(doc) {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.BrowserViewSourceOfDocument(doc);
  },

  viewPageInfo : function(doc) {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.BrowserPageInfo(doc, null);
  },

  showOnlyThisFrame : function(frame_doc) {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.loadURI(frame_doc.location.href);
  },

  properties : function(target) {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    // no more available since FF 3.6: changed temporaly action to View Image Info
    if (target != null) {
      window.BrowserPageInfo(target.ownerDocument, "mediaTab", target);
    }
  },

  printPage : function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.PrintUtils.print();
  },
  
  focusLocationBar : function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.gURLBar.focus();
  },

  newPrivateWindow : function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.OpenBrowserWindow({private: true});
  },

  //*********************************************************************************

  cut : function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    if (eGc.selectionNode != null) {
      eGc.selectionNode.select();
      eGc.selectionNode.setSelectionRange(eGc.selectionStart,eGc.selectionEnd);
    }
    window.goDoCommand('cmd_cut');
  },

  copy : function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    if (eGc.selectionNode != null) {
      eGc.selectionNode.select();
      eGc.selectionNode.setSelectionRange(eGc.selectionStart,eGc.selectionEnd);
    }
    window.goDoCommand('cmd_copy');
  },

  paste : function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    eGc.evtMouseDown.target.focus();
    window.goDoCommand('cmd_paste');
  },

  undo : function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    eGc.evtMouseDown.target.focus();
    window.goDoCommand('cmd_undo');
  },

  selectAll : function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    if (eGc.evtMouseDown.target instanceof window.HTMLInputElement || eGc.evtMouseDown.target instanceof window.HTMLTextAreaElement) {
      eGc.evtMouseDown.target.focus();
    }
    else {
      window._content.focus();
    }
    window.goDoCommand('cmd_selectAll');
  },

  toggleFindBar : function(currentSelection) {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    if (window.gFindBar.hidden) {
      window.gFindBar.onFindCommand(currentSelection);
    }
    else {
      window.gFindBar.close();
    }
  },

  zoomIn : function zoomIn() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    if (eGc.image == null) {
      window.ZoomManager.useFullZoom = false; //zoom text only because eG's actions images look ugly when scaled
      window.ZoomManager.enlarge();
    }
    else {
      // double image size only
      var width;
      var height;

      if (eGc.image.style.width == "") {
        width = eGc.image.width * 2 + "px";
      }
      else {
        width = parseInt(eGc.image.style.width) * 2 + "px";
      }

      if (eGc.image.style.height == "") {
        height = eGc.image.height * 2 + "px";
      }
      else {
        height = parseInt(eGc.image.style.height) * 2 + "px";
      }

      eGc.image.style.width = width;
      eGc.image.style.height = height;
    }
  },

  zoomOut : function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    if (eGc.image == null) {
      window.ZoomManager.useFullZoom = false; //zoom text only because eG's actions images look ugly when scaled
      window.ZoomManager.reduce();
    }
    else {
      // halve image size only
      var width;
      var height;

      if (eGc.image.style.width == "") {
        width = eGc.image.width * 0.5 + "px";
      }
      else {
        width = parseInt(eGc.image.style.width) * 0.5 + "px";
      }

      if (eGc.image.style.height == "") {
        height = eGc.image.height * 0.5 + "px";
      }
      else {
        height = parseInt(eGc.image.style.height) * 0.5 + "px";
      }

      eGc.image.style.width = width;
      eGc.image.style.height = height;
    }
  },

  zoomReset : function () {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.ZoomManager.reset();
  }
};

//*********************************************************************************

function eG_canGoUp () {
  var url = eGc.doc.URL;
  return eGf._getRootURL(url) != url.replace("www.", "");
}
