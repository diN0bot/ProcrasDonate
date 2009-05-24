
var ProcrasDonate__UUID="{5d393167-8b1c-4ce1-8593-0ba5f39f3210}";


// from https://developer.mozilla.org/En/Code_snippets:On_page_load
const STATE_START = Components.interfaces.nsIWebProgressListener.STATE_START;
const STATE_STOP = Components.interfaces.nsIWebProgressListener.STATE_STOP;

var URLBarListener = function URLBarListener(self) {
	this.self = self;
};
URLBarListener.prototype = {
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
		this.self.processNewURL(aURI);
	},
	
	// For definitions of the remaining functions see XULPlanet.com
	onProgressChange: function(aWebProgress, aRequest, curSelf, maxSelf, curTot, maxTot) {
		//logger("onProgressChange:: " + curTot + "/" + maxTot);
	},
	onStatusChange: function(aWebProgress, aRequest, aStatus, aMessage) {
		//logger("onStatusChange:: " + aStatus + " => " + aMessage);
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
	var consoleService = Components.
		classes["@mozilla.org/consoleservice;1"].
	    getService(Components.interfaces.nsIConsoleService);
	consoleService.logStringMessage(msg);
};

function _callback(obj, method) {
	var args = Array.prototype.slice.apply(arguments, [2, arguments.length]);
	return function() {
		return method.apply(obj, 
							args.concat(Array.prototype.slice.apply(arguments)));
	}
}

function Overlay() {
	var self = this;
	window.addEventListener("load", function() { return self.init() }, false);
	
	this.pddb = new PDDB();
	this.pddb.init_db();
};

Overlay.prototype = {
	VERSION: -1,
	
	eventListeners: {
		load: function(){ Overlay.init(); },
		unload: function() { Overlay.uninit(); }
	},
	
	init: function() {
		logger("Overlay.init()");
		var appcontent = document.getElementById("appcontent");   // browser
		
		if(appcontent && !appcontent.loaded_ProcrasDonate) {
			logger("Overlay.init::appcontent!" + appcontent);
			appcontent.loaded_ProcrasDonate = true;
			
			// DOMContentLoaded - fires when DOM is ready but images not loaded
			appcontent.addEventListener(
				"DOMContentLoaded", _callback(this, this.onPageLoad), true);
			// load - fires after pageload is complete
			appcontent.addEventListener(
				"load", _callback(this, this.onLoad), false);
			//appcontent.addEventListener("pageshow", Overlay.onPageShow, false);
			//appcontent.addEventListener("pagehide", Overlay.onPageHide, false);
			appcontent.addEventListener(
				"unload", _callback(this, this.onUnload), false);
		}
		
		this.checkVersion();
		//// Listen for webpage loads
		gBrowser.addProgressListener(
			new URLBarListener(this),
		    Components.interfaces.nsIWebProgress.NOTIFY_LOCATION);
		// Only works in 3.5+
		//gBrowser.addTabsProgressListener(Overlay_urlBarListener,
		//                             Components.interfaces.nsIWebProgress.NOTIFY_LOCATION);
		
		// FIXME: Do we remove this right away or only at onUnload?
		//window.removeEventListener("load", this.eventListeners.load ,true);
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
		var msg = "Overlay.onPageLoad:: ";
		logger(msg);
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
		var unsafeWin = event.target.defaultView;
		if (unsafeWin.wrappedJSObject)
			unsafeWin = unsafeWin.wrappedJSObject;
		
		var unsafeLoc = new XPCNativeWrapper(unsafeWin, "location").location;
		var href = new XPCNativeWrapper(unsafeLoc, "href").href;
		
		if (this.handle_url(href)) {
			// Inject scripts into page
			logger("handling url: "+href);
			this.injectScript("logger(\"Script injected!\");", href, unsafeWin);
		} else {
			logger("storing url: "+href);
			var now = Math.round((new Date()).getTime() / 1000);
			this.pddb.store_visit(href, now, 1000);
		}
	},
	
	handle_url: function(url) {
		// First, is this a page we can inject into?
		var scheme=Components.classes["@mozilla.org/network/io-service;1"]
		                     .getService(Components.interfaces.nsIIOService)
		                     .extractScheme(url);
		if (!((scheme == "http" || scheme == "https" || scheme == "file") &&
			  !/hiddenWindow\.html$/.test(url)))
			return false;
		
		if (/http:\/\/localhost.*/.test(url))
			return true;
		
		return false;
	},
	
	injectScript: function(script, url, unsafeWin) {
		logger("Overlay.injectScript:: url=" + url);
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
		
		var gExtensionManager = Components.
		    classes["@mozilla.org/extensions/manager;1"].
		    getService(Components.interfaces.nsIExtensionManager);
		
		//"extension@guid.net" should be replaced with your extension's GUID.
		var current = gExtensionManager.getItemForID(ProcrasDonate__UUID).version;
		
		try {
			ver = Prefs.getCharPref("version");
			firstrun = Prefs.getBoolPref("firstrun");
		} catch(e) {
			//nothing
		} finally {
			if (firstrun) {
				this.doInstall();
				
				Prefs.setBoolPref("firstrun",false);
				Prefs.setCharPref("version",current);
				
				// Insert code for first run here
				this.onInstall();
			}
			
			if (ver != current && !firstrun) {
				this.doUpgrade();
				// !firstrun ensures that this section does not get loaded if its a first run.
				Prefs.setCharPref("version",current);
				
				// Insert code if version is different here => upgrade
				this.onUpgrade();
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


var PDDB = function PDDB() {
	//if (Main.locked)
	//	return Main.instance;
	
	
};

PDDB.prototype = {
	init_db: function() {
		var self = this;
		var db = new Backend__Firefox();
		db.connect("test010.sqlite");
		this.db = db;
		
		_iterate(PDDB.tables, function(name, spec) {
			self[name] = new Model(db, name, spec);
			
			var already_exists = false;
			self.db.execute("SELECT * FROM sqlite_master", {}, function(row) {
				if (row[1] == self[name].table_name)
					already_exists = true;
			});
			if (!already_exists) {
				self[name].create_table();
			}
		});
	},
	
	house_keeping: function() {
		var host = window.location.host;
	},
	
	start_recording: function(url) {
		this.stop_recording();
		
		if (this.getPref("idle_timeout_mode", false)) {
			this.setPref("last_url", url);
			var now = Math.round((new Date()).getTime() / 1000);
			this.setPref("last_start", now);
			this.setPref("last_wakeup", now);
		}
	},
	
	stop_recording: function() {
		var url = this.getPref("last_url", false);
		if (url) {
			this.setPref("last_url", null);
			var start = this.getPref("last_start");
			var now = Math.round((new Date()).getTime() / 1000);
			this.store_visit(url, start, now - start);
		}
	},
	
	store_visit: function(url, start_time, duration) {
		var site = null;
		logger("store_visit()");
		this.Site.select({ url__eq: url }, function(row) {
			logger(row[0]);
			site = row;
		});
		logger("select done");
		logger(site);
		if (!site) {
			logger("Creating Site: url="+url+"]")
			site = this.Site.create({ name: "heyo", url: url });
		}
		logger("Site: id="+site.url+" url="+site.url);
		logger("Site: " + site.toString());
		
		var visit = this.Visit.create({
			site_id: site.id,
			enter_at: start_time,
			leave_at: duration
		});
		logger("Visit: " + visit.toString());
	},
	
};

PDDB.tables = {
	_order: ["Site", "Visit", "Tag", "SiteTagging"],
	Site: {
		table_name: "sites",
		columns: {
			_order: ["id", "name", "url", "url_re"],
			id: "INTEGER PRIMARY KEY",
			name: "VARCHAR",
			url: "VARCHAR",
			url_re: "VARCHAR"
		},
		indexes: []
	},
	Visit: {
		table_name: "visits",
		columns: {
			_order: ["id", "site_id", "enter_at", "leave_at"],
			id: "INTEGER PRIMARY KEY",
			site_id: "INTEGER",
			enter_at: "INTEGER", //"DATETIME",
			leave_at: "INTEGER", //"DATETIME"
		},
		indexes: []
	},
	Tag: {
		table_name: "tags",
		columns: {
			_order: ["id", "tag"],
			id: "INTEGER PRIMARY KEY",
			tag: "VARCHAR"
		},
		indexes: []
	},
	SiteTagging: {
		table_name: "sitetaggings",
		columns: {
			_order: ["id", "site_id", "tag_id"],
			id: "INTEGER PRIMARY KEY",
			site_id: "INTEGER",
			tag_id: "INTEGER"
		},
		indexes: []
	}
};



var myOverlay = new Overlay();
