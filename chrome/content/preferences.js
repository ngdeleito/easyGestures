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

The Original Code is easyGestures.

The Initial Developer of the Original Code is Ons Besbes.

Contributor(s):

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

function eG_setPrefs(locale){	// this function is also called in options.xul with 'null' argument to reset preferences without changing locale
	eG_prefsObs.prefs.setCharPref("profile.version", eGc.version);
	eG_prefsObs.prefs.setBoolPref("profile.active", true);
	eG_prefsObs.prefs.setBoolPref("profile.statusbarShowIcon", true);
	
	eG_prefsObs.prefs.setBoolPref("stateChange.language", false);

	if(locale!=null) {// the call is not from Options Dialog
		eG_prefsObs.prefs.setIntPref("profile.statsClicks",0);		// clicks inside window excluding clicks inside menu
		eG_prefsObs.prefs.setIntPref("profile.statsUse",0);		// calls for menu
		var d=new Date();							// date of last reset
		eG_prefsObs.prefs.setCharPref("profile.statsLastReset", d.getFullYear() + "/" + (d.getMonth()+1) + "/"+d.getDate()+"  "+ d.getHours()+":"+(d.getMinutes()<10? "0":"")+d.getMinutes()+":"+(d.getSeconds()<10? "0":"")+d.getSeconds() );	
		eG_prefsObs.prefs.setCharPref("profile.statsMain","[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]");		// saved as source of an Array
		eG_prefsObs.prefs.setCharPref("profile.statsExtra","[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]");			// saved as source of an Array
		var actionsStr=new Array();
		for (i=0; i<eG_menuItems.length ; i++) actionsStr.push(0);										// all actions stats set to 0
		eG_prefsObs.prefs.setCharPref("profile.statsActions", actionsStr.toSource());								// saved as source of an Array
	}

	eG_prefsObs.prefs.setBoolPref("profile.startupTips", true);
	eG_prefsObs.prefs.setIntPref("profile.tipNbr", 1);					// used in tips.xul
	
	if(navigator.userAgent.indexOf("Mac")==- 1) {
		eG_prefsObs.prefs.setIntPref("behavior.showButton", 1);		// middle button 
		eG_prefsObs.prefs.setIntPref("behavior.showAltButton", 2);		// right button 
		eG_prefsObs.prefs.setIntPref("behavior.showKey", 0);		// 0=none  16=shift	17=ctrl
		eG_prefsObs.prefs.setIntPref("behavior.supprKey", 45);		// 18= alt	45=Insert
		eG_prefsObs.prefs.setIntPref("behavior.contextKey", 17);
		eG_prefsObs.prefs.setBoolPref("behavior.handleLinksAsOpenLink", true);
	} else {
		// mac users need different defaults
		eG_prefsObs.prefs.setIntPref("behavior.showButton", 0);
		eG_prefsObs.prefs.setIntPref("behavior.showAltButton", 2);		// a shift-right click on Mac gives a right mouse click
		eG_prefsObs.prefs.setIntPref("behavior.showKey", 0);
		eG_prefsObs.prefs.setIntPref("behavior.supprKey", 17);
		eG_prefsObs.prefs.setIntPref("behavior.contextKey", 0);
		eG_prefsObs.prefs.setBoolPref("behavior.handleLinksAsOpenLink", false);
	}

	eG_prefsObs.prefs.setBoolPref("behavior.dragOnly", false);
	eG_prefsObs.prefs.setBoolPref("behavior.dragOnlyUpLeft", false);

	eG_prefsObs.prefs.setBoolPref("behavior.showAfterDelay", false);
	eG_prefsObs.prefs.setIntPref("behavior.showAfterDelayDelay", 200);

	eG_prefsObs.prefs.setBoolPref("behavior.contextMenuAuto", false);			// Show contextual pie menu automatically

	eG_prefsObs.prefs.setBoolPref("behavior.handleLinks", true);
	eG_prefsObs.prefs.setIntPref("behavior.linksDelay", 300);

	eG_prefsObs.prefs.setBoolPref("behavior.autoscrollingOn", false);
	eG_prefsObs.prefs.setIntPref("behavior.autoscrollingDelay", 750);

	eG_prefsObs.prefs.setBoolPref("behavior.largeMenu", false);
	eG_prefsObs.prefs.setBoolPref("behavior.noIcons", false);
	eG_prefsObs.prefs.setBoolPref("behavior.smallIcons", true);
	eG_prefsObs.prefs.setIntPref("behavior.menuOpacity", 100);				// set in % but will be converted when used in style.opacity
	eG_prefsObs.prefs.setBoolPref("behavior.showTooltips", true);
	eG_prefsObs.prefs.setIntPref("behavior.tooltipsDelay", 1000);
	eG_prefsObs.prefs.setBoolPref("behavior.tooltipsDelayOmit", false);

	eG_prefsObs.prefs.setBoolPref("behavior.dropDownMenu", false);			// menu is displayed as pie menu or drop down menu
	eG_prefsObs.prefs.setBoolPref("behavior.moveAuto", false);				// must press <Shitf> key to move menu

	if (locale!=null) eG_prefsObs.prefs.setCharPref("behavior.dailyReadingsFolderURI","");		// initialize only on first start

	eG_prefsObs.prefs.setBoolPref("actions.mainAlternative1", true);	// activate main alternative 1 layout
	eG_prefsObs.prefs.setBoolPref("actions.mainAlternative2", false);
	eG_prefsObs.prefs.setBoolPref("actions.extraAlternative1", true);
	eG_prefsObs.prefs.setBoolPref("actions.extraAlternative2", false);

	eG_prefsObs.prefs.setBoolPref("actions.contextImageFirst", false);
	eG_prefsObs.prefs.setBoolPref("actions.contextTextboxFirst", true);

	eG_setActions(true);
    
	eG_prefsObs.prefs.setBoolPref("customizations.xlink", true);			
	eG_prefsObs.prefs.setCharPref("customizations.openLink", "newTab");			// "curTab"  or "newTab" or "newWindow"
    
	eG_prefsObs.prefs.setBoolPref("customizations.highlightCount", true);
	eG_prefsObs.prefs.setCharPref("customizations.highlightColorList", eGc.defaultHighlightColorList);
	
	eG_prefsObs.prefs.setBoolPref("customizations.closeBrowserOnLastTab", true);
    
	eG_prefsObs.prefs.setBoolPref("customizations.queryInNewWindow", false);
	eG_prefsObs.prefs.setBoolPref("customizations.queryInNewTab", true);

	if (locale!=null) eG_localizeSearchURLs(locale);		// don't localize searchs if called from Options Dialog (reseting preferences)
	
	eG_prefsObs.prefs.setBoolPref("customizations.search1", true);
	eG_prefsObs.prefs.setBoolPref("customizations.search2", true);
	eG_prefsObs.prefs.setBoolPref("customizations.search3", false);
	eG_prefsObs.prefs.setBoolPref("customizations.search4", true);
	eG_prefsObs.prefs.setBoolPref("customizations.search5", false);
	eG_prefsObs.prefs.setBoolPref("customizations.search6", false);

	var string = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
	
	for (i=1; i<=10;i++) {
		string.data=eGc.localizing.getString( "runProgramFile" )+" "+i;	
		string.data = string.data + "••••false•false";   // name, path, arg, newIconPath, appIcon and newIcon:   '•' is the separator
		eG_prefsObs.prefs.setComplexValue("customizations.runProgramFile"+i, Components.interfaces.nsISupportsString, string);	    // complex value used here to support non-ascii characters
	}
 
	for (i=1; i<=20;i++) {
		string.data=eGc.localizing.getString( "loadURLScript" )+" "+i;	
		string.data = string.data +"••false••false•false";   // name, text, isScript, newIconPath, favicon, newIcon: '•' is the separator
		eG_prefsObs.prefs.setComplexValue("customizations.loadURLScript"+i, Components.interfaces.nsISupportsString, string);	    // complex value used here to support non-ascii characters
	}

	eG_prefsObs.prefs.setCharPref("customizations.loadURLin", "newTab");			//  execute 'load URL' action in "curTab" or "newTab" or "newWindow"

	eG_prefsObs.prefs.setCharPref("skin.path", "chrome://easygestures/skin/");		// path to skin containing icons and images 

}

function eG_localizeSearchURLs(locale){
	// localizing default search queries
	switch (locale){
		case "fr-FR":
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery1", "http://www.google.fr/search?q=%s&ie=UTF-8&hl=fr&num=100");
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery2", "http://fr.wikipedia.org/wiki/Special:Search?search=%s&go=Consulter");
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery3", "http://fr.wiktionary.org/wiki/%s");
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery4", "http://www.youtube.com/results?search_type=&search_query=%s&aq=f&hl=fr");
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery5", "");
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery6", "");
			eG_prefsObs.prefs.setCharPref("customizations.translateQuery", "http://info.babylon.com/cgi-bin/info.cgi?ot=2&layout=combo.html&n=30&lang=1&word=%s");
			break;
		case "es-ES":
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery1", "http://www.google.es/search?q=%s&ie=UTF-8&hl=es&num=100");
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery2", "http://es.wikipedia.org/wiki/Especial:Search?search=%s&go=Ir");
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery3", "http://es.wiktionary.org/wiki/%s");
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery4", "http://www.youtube.com/results?search_type=&search_query=%s&aq=f&hl=es");
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery5", "");
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery6", "");
			eG_prefsObs.prefs.setCharPref("customizations.translateQuery", "http://info.babylon.com/cgi-bin/info.cgi?ot=2&layout=combo.html&n=30&lang=3&word=%s");
			break;			
		case "de-DE":
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery1", "http://www.google.de/search?q=%s&ie=UTF-8&hl=de&num=100");
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery2", "http://de.wikipedia.org/wiki/Spezial:Search?search=%s&go=Artikel");
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery3", "http://de.wiktionary.org/wiki/%s");
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery4", "http://www.youtube.com/results?search_type=&search_query=%s&aq=f&hl=de");
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery5", "");
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery6", "");
			eG_prefsObs.prefs.setCharPref("customizations.translateQuery", "http://info.babylon.com/cgi-bin/info.cgi?ot=2&layout=combo.html&n=30&lang=6&word=%s");		
			break;
		case "it-IT":
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery1", "http://www.google.it/search?q=%s&ie=UTF-8&hl=it&num=100");
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery2", "http://it.wikipedia.org/wiki/Speciale:Search?search=%s&go=Vai");
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery3", "http://it.wiktionary.org/wiki/%s");
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery4", "http://www.youtube.com/results?search_type=&search_query=%s&aq=f&hl=it");
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery5", "");
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery6", "");
			eG_prefsObs.prefs.setCharPref("customizations.translateQuery", "http://info.babylon.com/cgi-bin/info.cgi?ot=2&layout=combo.html&n=30&lang=2&word=%s");
			break;
		case "ja-JP":
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery1", "http://www.google.co.jp/search?q=%s&ie=UTF-8&hl=ja&num=100");
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery2", "http://ja.wikipedia.org/wiki/%E7%89%B9%E5%88%A5:Search?search=%s&go=%E8%A1%A8%E7%A4%BA");
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery3", "http://ja.wiktionary.org/wiki/%s");
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery4", "http://www.youtube.com/results?search_type=&search_query=%s&aq=f&hl=ja");
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery5", "");
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery6", "");
			eG_prefsObs.prefs.setCharPref("customizations.translateQuery", "http://info.babylon.com/cgi-bin/info.cgi?ot=2&layout=combo.html&n=30&lang=8&word=%s");
			break;		
		case "zh-TW":
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery1", "http://www.google.com.tw/search?q=%s&ie=UTF-8&hl=zh-TW&num=100");
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery2", "http://en.wikipedia.org/wiki/Special:Search?search=%s&go=Go");
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery3", "http://zh.wiktionary.org/wiki/%s");
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery4", "http://www.youtube.com/results?search_type=&search_query=%s&aq=f&hl=zh-TW");
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery5", "");
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery6", "");
			eG_prefsObs.prefs.setCharPref("translateQuery", "http://info.babylon.com/cgi-bin/info.cgi?ot=2&layout=combo.html&n=30&lang=9&word=%s");
			break;	
		case "pt-BR":
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery1", "http://www.google.com/search?q=%s&ie=UTF-8&hl=pt-BR&num=100");
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery2", "http://pt.wikipedia.org/wiki/Especial:Search?search=%s&go=Artigo");
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery3", "http://pt.wiktionary.org/wiki/%s");
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery4", "http://www.youtube.com/results?search_type=&search_query=%s&aq=f&hl=pt");
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery5", "");
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery6", "");
			eG_prefsObs.prefs.setCharPref("customizations.translateQuery", "http://info.babylon.com/cgi-bin/info.cgi?ot=2&layout=combo.html&n=30&lang=5&word=%s");
			break;
		case "pl-PL":
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery1", "http://www.google.com/search?q=%s&ie=UTF-8&hl=pl&num=100");
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery2", "http://pl.wikipedia.org/wiki/Specjalna:Search?search=%s&go=Przejd%C5%BA");
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery3", "http://pl.wiktionary.org/wiki/%s");
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery4", "http://www.youtube.com/results?search_type=&search_query=%s&aq=f&hl=pl");
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery5", "");
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery6", "");
			eG_prefsObs.prefs.setCharPref("customizations.translateQuery", "http://info.babylon.com/cgi-bin/info.cgi?ot=2&layout=combo.html&n=30&lang=0&word=%s");
			break;
		case "tr-TR":
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery1", "http://www.google.com/search?q=%s&ie=UTF-8&hl=en&num=100");
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery2", "http://en.wikipedia.org/wiki/Special:Search?search=%s&go=Go");
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery3", "http://tr.wiktionary.org/wiki/%s");
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery4", "http://www.youtube.com/results?search_type=&search_query=%s&aq=f&hl=en");
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery5", "");
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery6", "");
			eG_prefsObs.prefs.setCharPref("customizations.translateQuery", "http://info.babylon.com/cgi-bin/info.cgi?ot=2&layout=combo.html&n=30&lang=0&word=%s");
			break;
		case "zh-CN":
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery1", "http://www.google.com.tw/search?q=%s&ie=UTF-8&hl=zh-CN&num=100");
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery2", "http://en.wikipedia.org/wiki/Special:Search?search=%s&go=Go");
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery3", "http://zh.wiktionary.org/wiki/%s");
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery4", "http://www.youtube.com/results?search_type=&search_query=%s&aq=f&hl=zh-CN");
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery5", "");
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery6", "");
			eG_prefsObs.prefs.setCharPref("translateQuery", "http://info.babylon.com/cgi-bin/info.cgi?ot=2&layout=combo.html&n=30&lang=9&word=%s");
			break;	            
		default:
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery1", "http://www.google.com/search?q=%s&ie=UTF-8&hl=en&num=100");
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery2", "http://en.wikipedia.org/wiki/Special:Search?search=%s&go=Go");
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery3", "http://en.wiktionary.org/wiki/%s");
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery4", "http://www.youtube.com/results?search_type=&search_query=%s&aq=f&hl=en");
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery5", "");
			eG_prefsObs.prefs.setCharPref("customizations.searchQuery6", "");
			eG_prefsObs.prefs.setCharPref("customizations.translateQuery", "http://info.babylon.com/cgi-bin/info.cgi?ot=2&layout=combo.html&n=30&lang=0&word=%s");
			break;
	}
}	

function eG_setActions(setAll) {	// setAll is set to false to only update labels after language change
    
	var menus = new Array("main","mainAlt1","mainAlt2","extra","extraAlt1","extraAlt2","contextLink","contextImage","contextSelection","contextTextbox");
	var actionsList = new Array("1/17/7/14/12/75/18/24/6/11", "1/84/5/80/25/73/19/81/4/26", "1/51/52/58/53/54/55/59/56/57", "39/90/38/0/0/0/0/0/37/8", "40/20/71/0/0/0/0/0/10/9", "91/77/74/0/0/0/0/0/82/93",
					"29/72/32/0/71/0/30/0/28/27", "36/33/91/0/92/81/0/0/35/31", "39/90/86/0/0/0/0/0/89/40",  "88/85/86/0/87/0/0/0/89/0");
	var actions;
	
	for (var i=0; i<menus.length; i++) {
		if (setAll) {
			// set actions
			actions = actionsList[i];
			eG_prefsObs.prefs.setCharPref("actions."+menus[i], actions );		
		} else actions = eG_prefsObs.prefs.getCharPref("actions."+menus[i]);

		// set labels
		var actionsSplit = actions.split("/");
		var prefStr="";
		for (var n=0; n<actionsSplit.length; n++) { 
			if (actionsSplit[n]!="0") {
				var number = eG_menuItems[parseInt(actionsSplit[n])].src.match (/\d+/);	// for names like runProgramFiles1-10 and loadURLScript1-20
				var label = eG_menuItems[parseInt(actionsSplit[n])].src.replace (number, "");	// for names like runProgramFiles1-10 and loadURLScript1-20, remove number at the end of string
				prefStr+=eGc.localizing.getString(label)+(number==null?"":" "+number);
			}
			else prefStr+="";
			if(n<actionsSplit.length-1) prefStr+="•";  // this is the separator, prefStr ends without seprator.
		}
        
		var string = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
		string.data = prefStr;
		eG_prefsObs.prefs.setComplexValue("actions.labels."+menus[i], Components.interfaces.nsISupportsString, string);	
	}
}

function eG_updateToVersion43() {	// update actions numbers, labels and stats because of addition of 3 new actions

    var menus = new Array("main","mainAlt1","mainAlt2","extra","extraAlt1","extraAlt2",
					"contextLink","contextImage","contextSelection","contextTextbox");

	for (var i=0; i<menus.length; i++) {
        
		var actionsSplit = eG_prefsObs.prefs.getCharPref("actions."+menus[i]).split("/");
		var labelsPrefs="";
        var actionsPrefs="";
        
		for (var n=0; n<actionsSplit.length; n++) {
        
            if (parseInt(actionsSplit[n]) >=82) actionsSplit[n] =parseInt(actionsSplit[n]) + 3;
            else if (parseInt(actionsSplit[n]) >=78) actionsSplit[n] =parseInt(actionsSplit[n]) + 2;
            else if (parseInt(actionsSplit[n]) >=30) actionsSplit[n] =parseInt(actionsSplit[n]) + 1;
        
            actionsPrefs += actionsSplit[n];
            
			if (actionsSplit[n]!="0") {
				var number = eG_menuItems[parseInt(actionsSplit[n])].src.match (/\d+/);	// for names like runProgramFiles1-10 and loadURLScript1-20
				var label = eG_menuItems[parseInt(actionsSplit[n])].src.replace (number, "");	// for names like runProgramFiles1-10 and loadURLScript1-20, remove number at the end of string
                labelsPrefs+=eGc.localizing.getString(label)+(number==null?"":" "+number);
			}
			else labelsPrefs+="";
			if(n<actionsSplit.length-1) {
                labelsPrefs+="•";  // this is the separator, prefStr ends without seprator.
                actionsPrefs+="/";
            }
		}
        
        // update labels
		var string = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
		string.data = labelsPrefs;
		eG_prefsObs.prefs.setComplexValue("actions.labels."+menus[i], Components.interfaces.nsISupportsString, string);	
        
        // update actions
        eG_prefsObs.prefs.setCharPref("actions."+menus[i], actionsPrefs);
	}
    
    // update actions stats
    var prevActionsStr=(new Function ("return " + eG_prefsObs.prefs.getCharPref("profile.statsActions")))();    // (new Function ("return " + data ))() replacing eval on data
    var actionsStr = new Array();
	for (i=0; i<eG_menuItems.length ; i++) {
        if (i<30) actionsStr.push(prevActionsStr[i]);
        else if (i==30) actionsStr.push(0);
        else if (i>30 && i<78) actionsStr.push(prevActionsStr[i-1]);
        else if (i==78) actionsStr.push(0);
        else if (i>78 && i<82) actionsStr.push(prevActionsStr[i-2]);
        else if (i==82) actionsStr.push(0);
        else actionsStr.push(prevActionsStr[i-3]);
    }

	eG_prefsObs.prefs.setCharPref("profile.statsActions", actionsStr.toSource());						// saved as source of an Array

}

function eG_prefsObserver() {	// observes changes in the Options Dialog
	
	try {// add the observer
		var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch(null);
		prefs.QueryInterface(Components.interfaces.nsIPrefBranchInternal).addObserver("easygestures.stateChange.prefs", this, false);
	} catch(ex) {}
	
	this.prefs=Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("easygestures.");
	this.domain= "easygestures";

	this.observe = function (subject, topic, pname) {	// handle changes in preferences
	
		try {
				
            // clean all previous insertions inside page
            if (eGc.frame_doc!=null) {
                var layoutNames = new Array("main","mainAlt1","mainAlt2","extra","extraAlt1","extraAlt2","contextLink","contextImage","contextSelection","contextTextbox");
                var targetNode;
                for (i=0; i<layoutNames.length;i++) {
                    targetNode = eGc.frame_doc.getElementById("eG_actions_" + layoutNames[i]);  // actions
                    if (targetNode!=null) targetNode.parentNode.removeChild(targetNode);
                    targetNode = eGc.frame_doc.getElementById("eG_labels_" + layoutNames[i]);   // labels
                    if (targetNode!=null) targetNode.parentNode.removeChild(targetNode);

                }
            }

            eGm=new eG_menu();	// rebuild menu
							
			// disable mouse scroll if middle mouse button is menu's button
			if (eGm.showButton == 1){
				var prefs=Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("general.");
				if ( prefs.getBoolPref("autoScroll") ) prefs.setBoolPref("autoScroll", false);
			}
				
		} catch(ex) {alert(ex);}
	}
}

function eG_deleteAllPreferences(){    // called if eG is uninstalled
    prefs=Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("easygestures.");
    prefs.deleteBranch("");
}
