
var ProcrasDonate__UUID="{5d393167-8b1c-4ce1-8593-0ba5f39f3210}";


// from https://developer.mozilla.org/En/Code_snippets:On_page_load
const STATE_START = Components.interfaces.nsIWebProgressListener.STATE_START;
const STATE_STOP = Components.interfaces.nsIWebProgressListener.STATE_STOP;

var Overlay_urlBarListener = {
	QueryInterface: function(aIID) {
		if (aIID.equals(Components.interfaces.nsIWebProgressListener) ||
			aIID.equals(Components.interfaces.nsISupportsWeakReference) ||
			aIID.equals(Components.interfaces.nsISupports)) {
			logger("QueryInterface:: " + aIID);
			return this;
		}
		throw Components.results.NS_NOINTERFACE;
	},
	
	onStateChange: function(aWebProgress, aRequest, aFlag, aStatus) {
		// If you use myListener for more than one tab/window, use
		// aWebProgress.DOMWindow to obtain the tab/window which triggers the state change
		var msg = "onStateChange:: ";
		if (aFlag & STATE_START) {
			// This fires when the load event is initiated
			msg += "load_start ";
			//logger("onStateChange::load_start: " + aWebProgress.DOMWindow.location.href);
		}
		if (aFlag & STATE_STOP) {
			// This fires when the load finishes
			msg += "load_stop ";
			//logger("onStateChange::load_end: " + aWebProgress.DOMWindow.location.href);
		}
		logger(msg);
	},
	
	onLocationChange: function(aProgress, aRequest, aURI) {
		// This fires when the location bar changes; i.e load event is confirmed
		// or when the user switches tabs. If you use myListener for more than one tab/window,
		// use aProgress.DOMWindow to obtain the tab/window which triggered the change.
		logger("onLocationChange:: " + aProgress.DOMWindow.location.href);
		Overlay.processNewURL(aURI);
	},
	
	// For definitions of the remaining functions see XULPlanet.com
	onProgressChange: function(aWebProgress, aRequest, curSelf, maxSelf, curTot, maxTot) {
		logger("onProgressChange:: " + curTot + "/" + maxTot);
	},
	onStatusChange: function(aWebProgress, aRequest, aStatus, aMessage) {
		logger("onStatusChange:: " + aStatus + " => " + aMessage);
	},
	onSecurityChange: function(aWebProgress, aRequest, aState) {
		logger("onSecurityChange:: " + aState);
	}
	
};


var Prefs = Components.classes["@mozilla.org/preferences-service;1"]
                      .getService(Components.interfaces.nsIPrefService);
Prefs = Prefs.getBranch("extensions.my_extension_name.");

//ProcrasDonate.log
var logger = function(msg) {
	var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
	                               .getService(Components.interfaces.nsIConsoleService);
	consoleService.logStringMessage(msg);
};

window.addEventListener("load", function(){ Overlay.init(); }, false);
//window.addEventListener("pagehide", function(){ Overlay.onPageUnload(); }, false);

var Overlay = {
	VERSION: -1,
	
	eventListeners: {
		load: function(){ Overlay.init(); },
		unload: function() { Overlay.uninit(); }
	},
	
	init: function() {
		logger("Overlay.init()");
		var appcontent = document.getElementById("appcontent");   // browser
		
		if(appcontent) {
			logger("Overlay.init::appcontent!" + appcontent);
			// DOMContentLoaded - fires when the DOM is ready but images may not have loaded
			appcontent.addEventListener("DOMContentLoaded", Overlay.onPageLoad, true);
			// load - fires after pageload is complete
			appcontent.addEventListener("load", Overlay.onLoad, false);
			appcontent.addEventListener("pageshow", Overlay.onPageShow, false);
			appcontent.addEventListener("pagehide", Overlay.onPageHide, false);
			appcontent.addEventListener("unload", Overlay.onUnload, false);
		}
		
		Overlay.checkVersion();
		//// Listen for webpage loads
		gBrowser.addProgressListener(Overlay_urlBarListener,
		                             Components.interfaces.nsIWebProgress.NOTIFY_LOCATION);
		// Only works in 3.5+
		//gBrowser.addTabsProgressListener(Overlay_urlBarListener,
		//                             Components.interfaces.nsIWebProgress.NOTIFY_LOCATION);
		
		window.removeEventListener("load",function(){ Overlay.init(); },true);
		//window.addEventListener("load", function(){ Overlay.onLoad(); }, false);
		
		logger("Overlay.init() => end");
	},
	
	uninit: function() {
		logger("Overlay.uninit()");
		gBrowser.removeProgressListener(Overlay_urlBarListener);
	},
	
	
	onLoad: function() {
		logger("Overlay.onLoad()");
	},
	
	onUnload: function() {
		logger("Overlay.onUnload()");
	},
	
	onPageShow: function() {
		//logger("Overlay.onPageShow()");
	},
	
	onPageHide: function() {
		//logger("Overlay.onPageHide()");
	},
	
	onPageLoad: function(event) {
		var msg = "Overlay.onPageLoad:: "
		var doc = event.originalTarget; // doc is document that triggered "onload" event
		if (event.originalTarget instanceof HTMLDocument) {
			// Target is an HTML element
			msg += "HTML ";
			
			if (event.originalTarget.defaultView.frameElement) {
				// Target is a fram
				msg += "Frame: " + event.originalTarget;
			} else {
				msg += event.originalTarget;
			}
			
		} else {
			msg += "non-HTML: " + typeof(event.originalTarget);
		}
		logger(msg);
		// do something with the loaded page.
		// doc.location is a Location object (see below for a link).
		// You can use it to make your code executed on certain pages only.
		//logger("a page is loaded: " + doc.location);
		//if (doc.location.href.search("forum") > -1)
		//	alert("a forum page is loaded");
	},
	
	onPageUnload: function(event) {
		var msg = "Overlay.onPageUnload:: ";
		var doc = event.originalTarget;
		if (event.originalTarget instanceof HTMLDocument) {
			msg += "HTML "
			//var doc = event.originalTarget;
			//logger("page unloaded:" + doc.location.href);
		}
		logger(msg);
	},
	
	
	processNewURL: function(url) {
		logger("Overlay.processNewURL:: url=" + url);
	},
	
	checkVersion: function() {
		var ver = -1, firstrun = true;
		
		var gExtensionManager = Components.classes["@mozilla.org/extensions/manager;1"]
		                                  .getService(Components.interfaces.nsIExtensionManager);
		//"extension@guid.net" should be replaced with your extension's GUID.
		var current = gExtensionManager.getItemForID(ProcrasDonate__UUID).version;
		
		try {
			ver = Prefs.getCharPref("version");
			firstrun = Prefs.getBoolPref("firstrun");
		} catch(e) {
			//nothing
		} finally {
			if (firstrun) {
				Overlay.doInstall();
				
				Prefs.setBoolPref("firstrun",false);
				Prefs.setCharPref("version",current);
				
				// Insert code for first run here
				Overlay.onInstall();
			}
			
			if (ver != current && !firstrun){
				Overlay.doUpgrade();
				// !firstrun ensures that this section does not get loaded if its a first run.
				Prefs.setCharPref("version",current);
				
				// Insert code if version is different here => upgrade
				Overlay.onUpgrade();
			}
		}
	},
	
	doInstall: function() { // 
		logger("Overlay.doInstall::");
	},
	onInstall: function() { // execute on first run
		logger("Overlay.onInstall::");
		// The example below loads a page by opening a new tab.
		// Useful for loading a mini tutorial
		window.setTimeout(function() {
			gBrowser.selectedTab = gBrowser.addTab("about:mozilla");
		}, 1500); //Firefox 2 fix - or else tab will get closed
	},
	
	doUpgrade: function() { // make any necessary changes for a new version (upgrade)
		logger("Overlay.doUpgrade::");
	},
	onUpgrade: function() { // execute after each new version (upgrade)
		logger("Overlay.onUpgrade::");
	},
	
	
	doMenuSelect: function() {
		logger("Menu selected!");
	},
};

