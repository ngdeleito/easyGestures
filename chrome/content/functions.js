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

  all : function(start, end, showAll) {
    while (eGm.popup.hasChildNodes()) { // remove all from menupopup
      eGm.popup.removeChild(eGm.popup.firstChild);
    }

    eGm.popup.addEventListener("popuphiding", eG_popup, true);
    var popupNode;

    for (var i=2; i<eG_menuItems.length; i++) {
      if (!showAll) {
        if (i < start) {
          continue;
        }
        if (i > end) {
          break;
        }
      }

      if (i==14 || i==21 || i==27 || i==37 || i==71 || i==85) {
        var menuSeparator = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "menuseparator");
        eGm.popup.appendChild(menuSeparator);
      }

      var itemNode = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "menuitem");
      var imageNode = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "image");
      var subItemNode = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "label");
      itemNode.appendChild(imageNode);
      itemNode.appendChild(subItemNode);
      itemNode.setAttribute("oncommand","(new Function ('return ' + eG_menuItems["+i+"].func))();");  // (new Function ("return " + data ))() replacing eval on data
      itemNode.style.paddingRight="0px";
      imageNode.style.listStyleImage="url('"+eGm.skinPath+"small_actions.png')";
      imageNode.setAttribute("class", "small_"+eG_menuItems[i].src);

      var number = eG_menuItems[i].src.match (/\d+/); // for names like runProgramFiles1-10 and loadURLScript1-20
      var label = eG_menuItems[i].src.replace (number, ""); // for names like runProgramFiles1-10 and loadURLScript1-20, remove number at the end of string
      subItemNode.setAttribute("value", eGc.localizing.getString(label)+(number==null?"":" "+number));

      if (showAll) {
        if (i==2 || i==14 || i==21 || i==27 || i==37 || i==71 || i==85) {
          var menu = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "menu");
          var label;
          switch (i) {
            case 2:  label = "Navigation"; break;
            case 14: label = "Tabs"; break;
            case 21: label = "Windows"; break;
            case 27: label = "Links"; break;
            case 37: label = "Special actions"; break;
            case 71: label = "Miscellaneous"; break;
            case 85: label = "Edition"; break;
          }
          menu.setAttribute("label", label);
          eGm.popup.appendChild(menu);

          popupNode = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "menupopup");
          menu.appendChild(popupNode);
        }
        popupNode.appendChild(itemNode);
      }
      else {
        eGm.popup.appendChild(itemNode);
      }
    }

    eGm.popup.openPopupAtScreen(eGc.screenXUp, eGc.screenYUp, false);
    if (eGm.showTooltips) {
      clearTimeout(eGm.tooltipsTrigger);
    }
  },

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

    if (eGm.xlink) {
      eG_xlink(link);
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
    if (eGm.xlink) {
      eG_xlink(link);
    }
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

    if (dailyReadingsFolderNode!=null) {
      var bookmarksList = PlacesUtils.getFolderContents(dailyReadingsFolderNode.itemId, false, false).root;

      while (eGm.popup.hasChildNodes()) { // remove all from menupopup
        eGm.popup.removeChild(eGm.popup.firstChild);
      }
      eGm.popup.addEventListener("popuphiding", eG_popup, true);

      if (bookmarksList.childCount > 1) {
        var itemNode = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "menuitem");
        itemNode.setAttribute("class", "menuitem-iconic");
        itemNode.setAttribute("default", true);
        itemNode.setAttribute("label", " Open All in Tabs");
        itemNode.setAttribute("oncommand", "PlacesUIUtils.openContainerNodeInTabs(eG_checkDailyReadingsFolder(),null);");
        itemNode.setAttribute("src", "" );
        eGm.popup.appendChild(itemNode);
      }

      // menuseparator
      var itemNode = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "menuseparator");
      eGm.popup.appendChild(itemNode);

      for (var i=0; i<bookmarksList.childCount; i++) {
        var itemNode = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "menuitem");
        itemNode.setAttribute("class", "menuitem-iconic");
        itemNode.setAttribute("label", " " + bookmarksList.getChild(i).title);
        itemNode.setAttribute("onclick", "if (event.button=='0') loadURI('" + bookmarksList.getChild(i).uri+ "'); else {openNewTabWith('" + bookmarksList.getChild(i).uri+ "');var container = document.getElementById('content').mTabContainer;var tabs=container.childNodes;container._selectNewTab(tabs[tabs.length-1]);} eGm.popup.hidePopup();" );
        if (bookmarksList.getChild(i).icon != null) {
          itemNode.setAttribute("src", bookmarksList.getChild(i).icon);
        }
        else {
          itemNode.setAttribute("src", "" );
        }
        itemNode.setAttribute("crop", "end");
        eGm.popup.appendChild(itemNode);
      }

      eGm.popup.openPopupAtScreen(eGc.screenXUp-8, eGc.screenYUp-8, false);
      if (eGm.showTooltips) {
        clearTimeout(eGm.tooltipsTrigger);
      }
    }
  },

  searchWeb : function(string) {
    if (eGm.inputBox.style.visibility == "hidden" && eGm.popup.state !="showing" && eGm.popup.state !="hiding" && !eGm.inputBoxSignForSearchWeb.hasAttribute("noPopup")) { // show popup before opening search textbox
      eGm.showPopupForSearchWeb(true);
    }
    else {
      var first = true;
      var win = null;
      var chksearch;
      var query;
      var currentEngine = parseInt(eGm.inputBoxSignForSearchWeb.getAttribute("currentEngine"));

      for (var i=1; i<=6; i++) {
        chksearch = eGm["search"+i];
        query = eGm["searchQuery"+i];

        if (query !="" && ( (chksearch && (currentEngine == 0) ) || (currentEngine == i))) {
          var url = query;
          var curURL = eGc.doc.URL;
          if (string != "") {
            url = url.replace("%s",string);
          }
          if (curURL != "") {
            url = url.replace("%u",curURL);
          }
          if (url == query) {
            url = eG_getRoot(query); // no placeholders to change the query
          }

          url = encodeURI(url);

          if (!eGm.queryInNewWindow) {
            if (!eGm.queryInNewTab && first) {
              loadURI(url);
              first=false;
            }
            else {
              openNewTabWith(url);
            }

            var container = document.getElementById("content").mTabContainer;
            var tabs = container.childNodes;
            // highlighting the last created tab
            tabs[tabs.length-1].setAttribute('style', 'color:Brown');   // color:IndianRed ?
            // select new created tab
            if (first) { // selectNewTab removed from FF3
              container._selectNewTab(tabs[tabs.length-1]); first=false;
            }
          }
          else {
            if (win==null) {
              win = window.open(url);
              win = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("navigator:browser");
            }
            else {
              win.openNewTabWith(url);
            }
          }
        }
      }
    }
  },

  runProgramFile : function(appNum, string) {
    //code adapted from "External Application Buttons" extension by Torisugari

    var runProgramFile = eGm["runProgramFile"+appNum];
    var path = runProgramFile[1];
    var argumentstext = runProgramFile[2];

    if (argumentstext != "") {
      if (string != "") {
        argumentstext = argumentstext.replace("%s",string);
      }
      var curURL = eGc.doc.URL;
      if (curURL != "") {
        argumentstext = argumentstext.replace("%u",curURL);
      }
    }

    try {
      if (path == "") {
        return false;
      }

      var file = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile);
      var process = Components.classes['@mozilla.org/process/util;1'].getService(Components.interfaces.nsIProcess);
      file.initWithPath(path);

      if (!file.exists()) {
        return false;
      }
      if (!file.isExecutable() || path.match(/\.lnk$/i)!=null) {
        file.launch();
        return true;
      }
      process.init(file);
      var args = [];
      argumentstext = argumentstext.split(/\s/);

      var count = 0;
      while (argumentstext.length  > 0  && count < 20 ) {
        count++;

        var text = argumentstext.shift();

        text = text.replace(/\\\\/g , "%backslash%");
        text = text.replace(/\\s/g , " ");
        text = text.replace(/\\a/g , "\a");
        text = text.replace(/\\e/g , "\e");
        text = text.replace(/\\f/g , "\f");
        text = text.replace(/\\n/g , "\n");
        text = text.replace(/\\r/g , "\r");
        text = text.replace(/\\t/g , "\t");
        text = text.replace(/\\v/g , "\v");
        text = text.replace(/\\/g , "");

        if (text !="") {
          args.push(text);
        }
      }

      process.run(false, args, args.length, {});
      return true;
    }
    catch (ex) {
      alert("Exception: "+ ex.toString());
      return false;
    }
    return false; // avoid JavaScript Error
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
          if (image!=null && image.src!=eGm.skinPath + "xLink.png") { // any image inside the link must be tagged too except xLink tag inserted by eG
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

  highlight : function(phrase, win, changeColor) { // code adapted from "Googlebar" extension by GoogleBar Team
    // find selectors added to end of the word
    var caseSensitive=eGm.inputBoxSignForHighlight.src.search("matchCase_On") != -1 ? true: false;
    var reverseHighlightCountOption = false;
    var highlightCountOption = eGm.highlightCount;

    // Confirm clearing Highlights
    if (changeColor && phrase=="") {
      if (!confirm(eGc.localizing.getString("clearHighlightsConfirmation"))) {
        return;
      }
    }

    // this is to have same color in all frames
    if (changeColor) {
      eGc.highlightColor = (eGc.highlightColor+1) % 10;
    }

    if (!win) {
      // This appears to only highlight the current tab.
      // Rather than grab _content we can get the window
      // itself and highlight all the tabs at once.
      //win = window.self;
      win = window._content;
    }

    // Search component
    var gFinder = Components.classes["@mozilla.org/embedcomp/rangefind;1"].createInstance().QueryInterface(Components.interfaces.nsIFind);
    gFinder.caseSensitive=caseSensitive;
    // gFinder.wordBreaker=;	// nsIWordBreaker not implemented yet

    for (var i = 0; win.frames && i < win.frames.length; i++) {
      this.highlight (phrase, win.frames[i], false);
    }

    var doc = win.document;
    if (!doc) {
      return;
    }

    // Remove highligthing
    if (phrase=="") {
      var elem = null;
      while ((elem = doc.getElementById("eGHighlight-id"))) {
        var child = null;
        var docfrag = doc.createDocumentFragment();
        var next = elem.nextSibling;
        var parent = elem.parentNode;
        while ((child = elem.firstChild)) {
          if (child.id=="eGHighlightCount-id") {
            break; // removing count number after highlighted word
          }
          docfrag.appendChild(child);
        }
        parent.removeChild(elem);
        parent.insertBefore(docfrag, next);
      }
      eGc.highlightColor=-1;
      gFindBar.close();
      return;
    }

    var body = doc.body;
    if (!body) {
      return;
    }

    // Set color
    var color = eGm.highlightColorList[eGc.highlightColor];

    var count = body.childNodes.length;
    searchRange = doc.createRange();
    startPt = doc.createRange();
    endPt = doc.createRange();

    var baseNode = doc.createElement("layer");
    baseNode.setAttribute("style", "-moz-user-select: -moz-all; background-color: " + color + ";");
    baseNode.setAttribute("id", "eGHighlight-id");

    searchRange.setStart(body, 0);
    searchRange.setEnd(body, count);

    startPt.setStart(body, 0);
    startPt.setEnd(body, 0);
    endPt.setStart(body, count);
    endPt.setEnd(body, count);

    // highlight text if any
    var retRange = null;
    var countHighligths = 0;
    var nodeSurround;
    while ((retRange = gFinder.Find(phrase, searchRange, startPt, endPt))) {
      eGc.noTextHighlighted = false;
      // check that we have a whole word
      // gSelection.addRange(range);

      // Highlight
      nodeSurround = baseNode.cloneNode(true);

      var startContainer = retRange.startContainer;
      var startOffset = retRange.startOffset;
      var endOffset = retRange.endOffset;
      var docfrag = retRange.extractContents();
      var before = startContainer.splitText(startOffset);
      var parent = before.parentNode;
      nodeSurround.appendChild(docfrag);
      parent.insertBefore(nodeSurround, before);

      startPt = nodeSurround.ownerDocument.createRange();
      startPt.setStart(nodeSurround, nodeSurround.childNodes.length);
      startPt.setEnd(nodeSurround, nodeSurround.childNodes.length);

      // mark highlighted words with count number
      if (highlightCountOption) {
        countHighligths++;
        supNode = eGc.frame_doc.createElementNS("http://www.w3.org/1999/xhtml", "sup");
        supNode.innerHTML=countHighligths;
        if (supNode.innerHTML!=countHighligths) { // this is not html document: probably .txt
          supNode = eGc.frame_doc.createTextNode("["+String(countHighligths)+"]");
        }
        supNode.id= "eGHighlightCount-id";

        nodeSurround.appendChild(supNode);
      }
    }

    // mark last highlighted word with total count number
    if (nodeSurround!=null && highlightCountOption) {
      if (nodeSurround.lastChild.innerHTML!=null) {
        nodeSurround.lastChild.innerHTML = countHighligths+"/"+countHighligths;
      }
      else { // this is a text node: no innerHTML !
        nodeSurround.lastChild.nodeValue = "["+countHighligths+"/"+countHighligths+"]";
      }
    }

    if (changeColor) {
      if (eGc.noTextHighlighted) {
        eG_showTextNotFoundStrip(phrase);
        eGc.highlightColor = (eGc.highlightColor-1) % 10; // reset color back
      }
      else {
        // show FindBar for previous and next navigation, from first occurence from cursor
        getBrowser().focus();
        gFindBar._findField.value = phrase;
        if (gFindBar.hidden) {
          gFindBar.onFindCommand();
        }
        gFindBar._setCaseSensitivity(caseSensitive); // updates "accessibility.typeaheadfind.casesensitive" preference
        gFindBar._find();
      }

      eGc.noTextHighlighted = true;
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

function eG_getRoot(url) {
  // this is a special code only for searchWeb function: does not take into acount the subnetwork in a host

  while (url.lastIndexOf("://") != url.lastIndexOf("/")-2) {
    goodurl = url;
    url = url.substring(0, url.substring(0, url.length-1).lastIndexOf('/')+1);
  }
  return goodurl;
}

function eG_canGoUp () {
  var url = eGc.doc.URL;
  if (eGf.root(url, false) != url.replace("www.","")) {
    return true;
  }
  else {
    return false;
  }
}

function eG_xlink(node) { // tag clicked link
  // avoid tagging twice
  if ( (node.nextSibling instanceof HTMLImageElement) && node.nextSibling.src.indexOf("xLink.png") >= 0) {
    return;
  }

  timg = eGc.frame_doc.createElementNS("http://www.w3.org/1999/xhtml", "img");
  eGm.shieldCss(timg);
  timg.style.position = "relative";
  timg.style.display = "inline";
  timg.style.left = "0px";
  timg.style.top = "0px";
  timg.style.width = 16; //size of xlink.png image
  timg.style.height = 16;
  timg.src = eGm.skinPath + "xLink.png";
  timg.alt = "";
  node.appendChild(timg); // add node inside <a> </a> tag in last position
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

function eG_popup(evt) {
  eGm.popup.removeEventListener("popuphiding", eG_popup, true);
  eGm.close();
}
