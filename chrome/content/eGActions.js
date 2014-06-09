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

function Action(name, action) {
  this._name = name;
  this.run = action;
  
  this.getLabel = function() {
    return eGc.localizing.getString(this._name);
  };
  
  // helper functions
  
  this._getRootURL = function(url) {
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
  };
  
  this._readClipboard = function() {
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
      else if (Components.interfaces.nsISupportsString) {
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
  };
  
  this._getFileForSavingData = function(filter, defaultName) {
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
  };
  
  this._saveContentFromLink = function(link, filter) {
    var uri = Services.io.newURI(link, null, null);
    var file = this._getFileForSavingData(
                 filter,
                 uri.path.substring(uri.path.lastIndexOf("/") + 1));
    
    if (file !== null) {
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
  };
}

function EmptyAction() {
  Action.call(this, "empty", function() {});
}
EmptyAction.prototype = new Action();

function ExtraMenuAction() {
  Action.call(this, "more", function() {
    eGm.showExtraMenu();
  });
}
ExtraMenuAction.prototype = new Action();

function LoadURLScriptAction(number) {
  Action.call(this, "loadURLScript", function() {
    this._loadURLScript(this._number);
  });
  
  this._number = number;
  
  this._loadURLScript = function(appNum) {
    var loadURLScript = eGm["loadURLScript" + appNum];
    var codetext = loadURLScript[1];
    var isScript = loadURLScript[2];
    var string = eGc.selection;
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    
    if (codetext !== "") {
      if (string !== "") {
        codetext = codetext.replace("%s", string);
      }
      var curURL = eGc.doc.URL; // get current URL
      if (curURL !== "") {
        codetext = codetext.replace("%u", curURL);
      }
    }
    
    if (isScript === "true") {
      var sandbox = Components.utils.Sandbox(window);
      sandbox.window = window;
      Components.utils.evalInSandbox(codetext, sandbox);
    }
    else {
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
  };
  
  this.getLabel = function() {
    var prefValue = eGPrefs.getLoadURLScriptPref(this._number);
    var label = prefValue[0];
    if (label !== "") {
      // if this action has already a label given by the user, then use it
      return label;
    }
    // otherwise use the default label
    return eGc.localizing.getString(this._name) + " " + number;
  };
}
LoadURLScriptAction.prototype = new Action();

var eGActions = {
  empty : new EmptyAction(),
  
  more : new ExtraMenuAction(),
  
  firstPage : new Action("firstPage", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.gBrowser.gotoIndex(0);
  }),
  
  lastPage : new Action("lastPage", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.gBrowser.gotoIndex(window.gBrowser.sessionHistory.count - 1);
  }),
  
  backSite : new Action("backSite", function() {
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
  }),
  
  forwardSite : new Action("forwardSite", function() {
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
  }),
  
  forward : new Action("forward", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.gBrowser.goForward();
  }),
  
  back : new Action("back", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.gBrowser.goBack();
  }),
  
  reload : new Action("reload", function() { // reload or stop
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    var gBrowser = window.gBrowser;
    
    if (!eGc.loading) {
      gBrowser.reload();
    }
    else {
      gBrowser.stop();
    }
  }),
  
  up : new Action("up", function() {
    var url = eGc.doc.URL;
    // removing any trailing "/"
    url = url.replace(/\/$/, "");
    // creating a nsIURI and removing the last "/"-separated item from its path
    var uri = Services.io.newURI(url, null, null);
    var path = uri.path.split("/");
    path.pop();
    var upurl = uri.prePath + path.join("/");
    
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.gBrowser.loadURI(upurl);
  }),
  
  root : new Action("root", function() {
    var url = eGc.doc.URL;
    var rootURL = this._getRootURL(url);
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.gBrowser.loadURI(rootURL);
  }),
  
  pageTop : new Action("pageTop", function() {
    var frame = eGc.evtMouseDown.originalTarget.ownerDocument.defaultView;
    frame.scroll(0,0);
  }),
  
  pageBottom : new Action("pageBottom", function() {
    var frame = eGc.evtMouseDown.originalTarget.ownerDocument.defaultView;
    //var doc= eGc.evt.originalTarget.ownerDocument;
    //frame.scroll(0,doc.getBoxObjectFor(doc.documentElement).height);
    frame.scroll(0,2147483647);	// max Int value
  }),
  
  autoscrolling : new Action("autoscrolling", function() {
    var evt = eGc.evtMouseDown;
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.document.getElementById("content").mCurrentBrowser.startScroll(evt);
  }),
  
  newTab : new Action("newTab", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    var gBrowser = window.gBrowser;
    gBrowser.selectedTab = gBrowser.addTab();
    window.gURLBar.focus();
  }),
  
  duplicateTab : new Action("duplicateTab", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    var gBrowser = window.gBrowser;
    var ss = Components.classes["@mozilla.org/browser/sessionstore;1"]
                       .getService(Components.interfaces.nsISessionStore);
    gBrowser.selectedTab = ss.duplicateTab(window, gBrowser.selectedTab);
  }),
  
  prevTab : new Action("prevTab", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.gBrowser.tabContainer.advanceSelectedTab(-1, true);
  }),
  
  nextTab : new Action("nextTab", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.gBrowser.tabContainer.advanceSelectedTab(1, true);
  }),
  
  closeTab : new Action("closeTab", function() {
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
  }),
  
  closeOtherTabs : new Action("closeOtherTabs", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    var gBrowser = window.gBrowser;
    gBrowser.removeAllTabsBut(gBrowser.selectedTab);
  }),
  
  undoCloseTab : new Action("undoCloseTab", function() {
    var ss = Components.classes["@mozilla.org/browser/sessionstore;1"]
                       .getService(Components.interfaces.nsISessionStore);
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    if (ss.getClosedTabCount(window) > 0) {
      ss.undoCloseTab(window, 0);
    }
  }),
  
  newWindow : new Action("newWindow", function() {
    var url = "";
    if (Services.prefs.getIntPref("browser.startup.page") == 1) {
      url = Services.prefs.getCharPref("browser.startup.homepage");
      if (url.split('|')[1]) {
        url = "about:blank";
      }
    }
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.open(url);
  }),
  
  duplicateWindow : new Action("duplicateWindow", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    var gBrowser = window.gBrowser;
    var newWindow;
    
    for (let i = 0; i < gBrowser.browsers.length; i++) {
      let url = gBrowser.browsers[i].currentURI.spec;
      if (i === 0) {
        window.open(url);
        newWindow = Services.wm.getMostRecentWindow("navigator:browser");
      }
      else {
        newWindow.gBrowser.addTab(url);
      }
    }
  }),
  
  closeOtherWindows : new Action("closeOtherWindows", function() {
    var currentWindow = Services.wm.getMostRecentWindow("navigator:browser");
    var openWindows = Services.wm.getEnumerator("navigator:browser");
    
    while (openWindows.hasMoreElements()) {
      let window = openWindows.getNext();
      if (window != currentWindow) {
        window.close();
      }
    }
  }),
  
  restart : new Action("restart", function() {
    Services.startup.quit(Components.interfaces.nsIAppStartup.eAttemptQuit |
                          Components.interfaces.nsIAppStartup.eRestart);
  }),
  
  quit : new Action("quit", function() {
    Services.startup.quit(Components.interfaces.nsIAppStartup.eForceQuit);
  }),
  
  minimizeWindow : new Action("minimizeWindow", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.minimize();
  }),
  
  fullscreen : new Action("fullscreen", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.fullScreen = !window.fullScreen;
  }),
  
  openLink : new Action("openLink", function() {
    var link = eGc.link;
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    var gBrowser = window.gBrowser;
    var url;
    if (link === null) {
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
  }),
  
  openLinkNewWindow : new Action("openLinkNewWindow", function() {
    var link = eGc.link;
    var url;
    if (link === null) {
      url = this._readClipboard();
    }
    else {
      url = link.href;
    }
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.open(url);
  }),
  
  copyLink : new Action("copyLink", function() { //write to clipboard the link url
    var link = eGc.link;
    if (link !== null) {
      const cbhelper = Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper);
      cbhelper.copyString(link.href);
    }
  }),
  
  copyImageLocation : new Action("copyImageLocation", function() {
    var src = eGc.image.src;
    if (src !== null) {
      const cbhelper = Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper);
      cbhelper.copyString(src);
    }
  }),
  
  saveLinkAs : new Action("saveLinkAs", function() {
    this._saveContentFromLink(eGc.link, Components.interfaces.nsIFilePicker.filterHTML);
  }),
  
  saveImageAs : new Action("saveImageAs", function() {
    this._saveContentFromLink(eGc.image.src, Components.interfaces.nsIFilePicker.filterImages);
  }),
  
  savePageAs : new Action("savePageAs", function() {
    var document = eGc.doc;
    var file = this._getFileForSavingData(
                 Components.interfaces.nsIFilePicker.filterHTML,
                 document.title);
    
    if (file !== null) {
      var wbp = Components.classes['@mozilla.org/embedding/browser/nsWebBrowserPersist;1']
                          .createInstance(Components.interfaces.nsIWebBrowserPersist);
      // don't save gzipped
      wbp.persistFlags &= ~Components.interfaces.nsIWebBrowserPersist.PERSIST_FLAGS_NO_CONVERSION;
      wbp.saveDocument(document, file, null, null, null, null);
    }
  }),
  
  hideImages : new Action("hideImages", function() {
    if (eGc.image !== null) {
      eGc.image.style.display = "none";
    }
    else {
      var imgs = eGc.doc.getElementsByTagName("img");
      for (var i=0; i < imgs.length; i++) {
        imgs[i].style.display = "none";
      }
    }
  }),
  
  copyImage : new Action("copyImage", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.document.popupNode = eGc.image;
    window.goDoCommand('cmd_copyImageContents');
  }),
  
  homepage : new Action("homepage", function() {
    var homepage = Services.prefs.getCharPref("browser.startup.homepage");
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.gBrowser.loadTabs(homepage.split("|"), true, false);
  }),
  
  dailyReadings : new Action("dailyReadings", function() {
    function _checkDailyReadingsFolder() {
      var dailyReadingsFolderNode = null;
      var folderName = "@easyGestures";
      var historyService = Components.classes["@mozilla.org/browser/nav-history-service;1"]
                                     .getService(Components.interfaces.nsINavHistoryService);
      var bookmarksService = Components.classes["@mozilla.org/browser/nav-bookmarks-service;1"]
                                     .getService(Components.interfaces.nsINavBookmarksService);
      
      try {
        // check if dailyReadings folder already exists in toolbarFolder
        var options = historyService.getNewQueryOptions();
        var query = historyService.getNewQuery();
        options.excludeItems = false;
        query.setFolders([bookmarksService.toolbarFolder], 1);
        //query.setFolders([bookmarksService.placesRoot], 1);
        var result = historyService.executeQuery(query, options);
        
        result.root.containerOpen = true;
        for (var i = 0; i < result.root.childCount; i++) {
          // iterate over the immediate children of this folder
          if (result.root.getChild(i).itemId == eGm.dailyReadingsFolderURI && eGm.dailyReadingsFolderURI !== "" || result.root.getChild(i).title == folderName) {
            dailyReadingsFolderNode = result.root.getChild(i);
            if (eGm.dailyReadingsFolderURI === "") {
              // update value if no value found
              eGm.dailyReadingsFolderURI = result.root.getChild(i).itemId;
              eGPrefs.setDailyReadingsFolderPref(eGm.dailyReadingsFolderURI);
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
      
      if (eGm.dailyReadingsFolderURI === "" || dailyReadingsFolderNode === null) {
        var menuFolder = bookmarksService.toolbarFolder;
        var newFolderId = bookmarksService.createFolder(menuFolder, folderName, -1);
        
        eGm.dailyReadingsFolderURI = newFolderId;
        eGPrefs.setDailyReadingsFolderPref(newFolderId);
        
        Services.prompt.alert(null, "", eGc.localizing.getString("dailyReadingsCreate"));
      }
      return dailyReadingsFolderNode;
    }
    
    var dailyReadingsFolderNode = _checkDailyReadingsFolder();
    
    if (dailyReadingsFolderNode !== null) {
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
  }),
  
  searchWeb : new Action("searchWeb", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.BrowserSearch.searchBar.value = eGc.selection;
    window.BrowserSearch.webSearch();
  }),
  
  loadURLScript1 : new LoadURLScriptAction(1),
  
  loadURLScript2 : new LoadURLScriptAction(2),
  
  loadURLScript3 : new LoadURLScriptAction(3),
  
  loadURLScript4 : new LoadURLScriptAction(4),
  
  loadURLScript5 : new LoadURLScriptAction(5),
  
  loadURLScript6 : new LoadURLScriptAction(6),
  
  loadURLScript7 : new LoadURLScriptAction(7),
  
  loadURLScript8 : new LoadURLScriptAction(8),
  
  loadURLScript9 : new LoadURLScriptAction(9),
  
  loadURLScript10 : new LoadURLScriptAction(10),
  
  loadURLScript11 : new LoadURLScriptAction(11),
  
  loadURLScript12 : new LoadURLScriptAction(12),
  
  loadURLScript13 : new LoadURLScriptAction(13),
  
  loadURLScript14 : new LoadURLScriptAction(14),
  
  loadURLScript15 : new LoadURLScriptAction(15),
  
  loadURLScript16 : new LoadURLScriptAction(16),
  
  loadURLScript17 : new LoadURLScriptAction(17),
  
  loadURLScript18 : new LoadURLScriptAction(18),
  
  loadURLScript19 : new LoadURLScriptAction(19),
  
  loadURLScript20 : new LoadURLScriptAction(20),
  
  markVisitedLinks : new Action("markVisitedLinks", function() {
    var styleElement = eGc.doc.createElement("style");
    eGc.doc.getElementsByTagName("head")[0].appendChild(styleElement);
    var styleSheet = eGc.doc.styleSheets[eGc.doc.styleSheets.length - 1];
    styleSheet.insertRule(":link, :link img { outline: dashed medium white !important; }", 0);
    styleSheet.insertRule(":visited, :visited img { outline-color: red !important; }", 1);
  }),
  
  bookmarkThisLink : new Action("bookmarkThisLink", function() {
    var url = eGc.link;
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.PlacesCommandHook.bookmarkLink(window.PlacesUtils.unfiledBookmarksFolderId, url.href, url.text);
    //PlacesUIUtils.showMinimalAddBookmarkUI(PlacesUtils._uri(url), url.text);    // classic UI
  }),
  
  bookmarkPage : new Action("bookmarkPage", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.PlacesCommandHook.bookmarkPage(window.gBrowser.selectedBrowser, window.PlacesUtils.unfiledBookmarksFolderId, true);
    // var url = eGc.doc.URL, name = eGc.doc.title, doc = eGc.doc;
    // PlacesUIUtils.showMinimalAddBookmarkUI(PlacesUtils._uri(url), name, PlacesUtils.getDescriptionFromDocument(doc));   // classic UI
  }),
  
  bookmarkOpenTabs : new Action("bookmarkOpenTabs", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.PlacesCommandHook.bookmarkCurrentPages();
    //PlacesUIUtils.showMinimalAddMultiBookmarkUI(PlacesCommandHook._getUniqueTabInfo());
  }),
  
  bookmarks : new Action("bookmarks", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.toggleSidebar("viewBookmarksSidebar");
  }),
  
  bookmarksToolbar : new Action("bookmarksToolbar", function() {
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
  }),
  
  history : new Action("history", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.toggleSidebar("viewHistorySidebar");
  }),
  
  viewPageSource : new Action("viewPageSource", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.BrowserViewSourceOfDocument(eGc.doc);
  }),
  
  viewPageInfo : new Action("viewPageInfo", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.BrowserPageInfo(eGc.doc, null);
  }),
  
  showOnlyThisFrame : new Action("showOnlyThisFrame", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.loadURI(eGc.frame_doc.location.href);
  }),
  
  printPage : new Action("printPage", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.PrintUtils.print();
  }),
  
  focusLocationBar : new Action("focusLocationBar", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.gURLBar.focus();
  }),
  
  newPrivateWindow : new Action("newPrivateWindow", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.OpenBrowserWindow({private: true});
  }),
  
  cut : new Action("cut", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    if (eGc.selectionNode !== null) {
      eGc.selectionNode.select();
      eGc.selectionNode.setSelectionRange(eGc.selectionStart,eGc.selectionEnd);
    }
    window.goDoCommand('cmd_cut');
  }),
  
  copy : new Action("copy", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    if (eGc.selectionNode !== null) {
      eGc.selectionNode.select();
      eGc.selectionNode.setSelectionRange(eGc.selectionStart,eGc.selectionEnd);
    }
    window.goDoCommand('cmd_copy');
  }),
  
  paste : new Action("paste", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    eGc.evtMouseDown.target.focus();
    window.goDoCommand('cmd_paste');
  }),
  
  undo : new Action("undo", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    eGc.evtMouseDown.target.focus();
    window.goDoCommand('cmd_undo');
  }),
  
  selectAll : new Action("selectAll", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    if (eGc.evtMouseDown.target instanceof window.HTMLInputElement || eGc.evtMouseDown.target instanceof window.HTMLTextAreaElement) {
      eGc.evtMouseDown.target.focus();
    }
    else {
      window.content.focus();
    }
    window.goDoCommand('cmd_selectAll');
  }),
  
  toggleFindBar : new Action("toggleFindBar", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    if (window.gFindBar.hidden) {
      window.gFindBar.onFindCommand(eGc.selection);
    }
    else {
      window.gFindBar.close();
    }
  }),
  
  zoomIn : new Action("zoomIn", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    if (eGc.image === null) {
      window.ZoomManager.useFullZoom = false; //zoom text only because eG's actions images look ugly when scaled
      window.ZoomManager.enlarge();
    }
    else {
      // double image size only
      var width;
      var height;
      
      if (eGc.image.style.width === "") {
        width = eGc.image.width * 2 + "px";
      }
      else {
        width = parseInt(eGc.image.style.width, 10) * 2 + "px";
      }
      
      if (eGc.image.style.height === "") {
        height = eGc.image.height * 2 + "px";
      }
      else {
        height = parseInt(eGc.image.style.height, 10) * 2 + "px";
      }
      
      eGc.image.style.width = width;
      eGc.image.style.height = height;
    }
  }),
  
  zoomOut : new Action("zoomOut", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    if (eGc.image === null) {
      window.ZoomManager.useFullZoom = false; //zoom text only because eG's actions images look ugly when scaled
      window.ZoomManager.reduce();
    }
    else {
      // halve image size only
      var width;
      var height;
      
      if (eGc.image.style.width === "") {
        width = eGc.image.width * 0.5 + "px";
      }
      else {
        width = parseInt(eGc.image.style.width, 10) * 0.5 + "px";
      }
      
      if (eGc.image.style.height === "") {
        height = eGc.image.height * 0.5 + "px";
      }
      else {
        height = parseInt(eGc.image.style.height, 10) * 0.5 + "px";
      }
      
      eGc.image.style.width = width;
      eGc.image.style.height = height;
    }
  }),
  
  zoomReset : new Action("zoomReset", function() {
    var window = Services.wm.getMostRecentWindow("navigator:browser");
    window.ZoomManager.reset();
  })
};

function eG_canGoUp() {
  function getRootURL(url) {
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
  }
  
  var url = eGc.doc.URL;
  return getRootURL(url) != url.replace("www.", "");
}