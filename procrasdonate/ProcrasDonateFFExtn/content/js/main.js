var STORE_VISIT_LOGGING = false;
var IDLE_LOGGING = false;

var ProcrasDonate__UUID="extension@procrasdonate.com";

// from https://developer.mozilla.org/En/Code_snippets:On_page_load
const STATE_START = Components.interfaces.nsIWebProgressListener.STATE_START;
const STATE_STOP = Components.interfaces.nsIWebProgressListener.STATE_STOP;

var URLBarListener = function URLBarListener(self, pddb) {
	this.self = self;
	this.pddb = pddb;
	this.toolbar_manager = new PD_ToolbarManager(pddb);
};
URLBarListener.prototype = {
	QueryInterface: function(aIID) {
		if (aIID.equals(Components.interfaces.nsIWebProgressListener) ||
			aIID.equals(Components.interfaces.nsISupportsWeakReference) ||
			aIID.equals(Components.interfaces.nsISupports)) {
			//logger("QueryInterface:: " + aIID);
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
		//logger(msg);
	},
	
	onLocationChange: function(aProgress, aRequest, aURI) {
		// This fires when the location bar changes; i.e load event is confirmed
		// or when the user switches tabs. If you use myListener for more than one tab/window,
		// use aProgress.DOMWindow to obtain the tab/window which triggered the change.
		var href = aProgress.DOMWindow.location.href;
		logger("onLocationChange:: href=" + href);
		//logger(jQuery(aProgress.DOMWindow,
		//if (aURI == "about:config")
		//	return;
		if  (aURI == "") {
			return
		}
		//logger(window);
		//logger(document);
		//logger(gBrowser);
		//logger(gBrowser.contentWindow);
		//logger(gBrowser.contentWindow.document);
		//logger(gBrowser.contentDocument);
		
		//logger(jQuery("*", gBrowser.contentWindow.document).length);
		//logger([]);
		//logger([aProgress.DOMWindow.content]);
		
		//logger(" location changed. start recording: "+href);
		this.pddb.start_recording(href);

		this.toolbar_manager.updateButtons({ url: href });
		this.self.processNewURL(aProgress.DOMWindow, aURI);
	},
	
	// For definitions of the remaining functions see XULPlanet.com
	onProgressChange: function(aWebProgress, aRequest, curSelf, maxSelf, curTot, maxTot) {
		//logger("onProgressChange:: " + curTot + "/" + maxTot);
	},
	onStatusChange: function(aWebProgress, aRequest, aStatus, aMessage) {
		//logger("onStatusChange:: " + aStatus + " => " + aMessage);
	},
	onSecurityChange: function(aWebProgress, aRequest, aState) {
		//logger("onSecurityChange:: " + aState);
	}
	
};


var Prefs = Components.classes["@mozilla.org/preferences-service;1"]
                      .getService(Components.interfaces.nsIPrefService);
Prefs = Prefs.getBranch("ProcrasDonate.");

//ProcrasDonate.log

//function _callback(obj, method) {
//	var args = Array.prototype.slice.apply(arguments, [2, arguments.length]);
//	return function() {
//		return method.apply(obj, 
//							args.concat(Array.prototype.slice.apply(arguments)));
//	}
//}

function Overlay() {
	//logger("Overlay()");
	//logger([window, document, gBrowser]);
	
	var self = this;
	// load ff app. onPageLoad handles page loads
 	window.addEventListener("load", _bind(this, this.init), false);
	window.addEventListener("unload", _bind(this, this.uninit), false);
	
	// #@TODO use change listener to automatically save user input ?? (in activate fns)
};

Overlay.prototype = {
	VERSION: -1,
	
	init: function() {
		var self = this;
	
		this.pddb = new PDDB("procrasdonate.0.sqlite");
		this.pddb.init_db();
		
		// install generated input
		// we need to do this every time so that the PD domain are set
		// don't set preselected charities yet.
		self.install_generated_input(false);
		
		this.url_bar_listener = new URLBarListener(this, this.pddb);
		
		this.page_controllers = [];
		this.page_controllers.push(
			new Controller(this.pddb.prefs, this.pddb));
		
		var appcontent = document.getElementById("appcontent");   // browser
		
		if(appcontent && !appcontent.seen_by_ProcrasDonate) {
			//logger("Overlay.init::appcontent!" + appcontent);
			appcontent.seen_by_ProcrasDonate = true;
			
			// DOMContentLoaded - fires when DOM is ready but images not loaded
			appcontent.addEventListener(
				"DOMContentLoaded", _bind(this, this.onPageLoad), true);
			// load - fires after pageload is complete
			//appcontent.addEventListener(
			//	"load", _bind(this, this.onLoad), false);
			
			//appcontent.addEventListener("pageshow", Overlay.onPageShow, false);
			//appcontent.addEventListener("pagehide", Overlay.onPageHide, false);
			
			//appcontent.addEventListener(
			//	"unload", _bind(this, this.onUnload), false);
		}
		
		this.checkVersion();
		//// Listen for webpage loads
		gBrowser.addProgressListener(
			this.url_bar_listener,//new URLBarListener(this, this.pddb),
		    Components.interfaces.nsIWebProgress.NOTIFY_LOCATION);
		
		// Only works in 3.5+
		//gBrowser.addTabsProgressListener(Overlay_urlBarListener,
		//                             Components.interfaces.nsIWebProgress.NOTIFY_LOCATION);
		
		// FIXME: Do we remove this right away or only at onUnload?
		//window.removeEventListener("load", this.eventListeners.load ,true);
		//window.addEventListener("load", function(){ Overlay.onLoad(); }, false);
		
		// set focus state to true. this means that FF is the active app right now.
		//this.pddb.prefs.set("ff_is_in_focus", true);
		this.pddb.prefs.set("ff_focus_timer_started", false);
		
		// setup uninstall observer
		this.observerService = Cc['@mozilla.org/observer-service;1'].
			getService(Ci.nsIObserverService);
		this.observerService.addObserver({ observe: self.uninstall }, "em-action-requested", false);
		
		// add listeners for idle times
		// we want to listen for 3 minutes and 20 minutes.
		// https://developer.mozilla.org/en/nsIIdleService
		
		// need to restart ff to see changes, not just reload chrome.
		// observers stick around until ff shutdown, then automatically removed
		// (based on experience. not sure what we're *supposed* to do)
		
		// idle time is based on OS idle time, NOT FF only.
		// so if switch apps and then start clicking, 'back' will be triggered....
		
		this.idleService = Components.classes["@mozilla.org/widget/idleservice;1"].
			getService(Components.interfaces.nsIIdleService);
		
		// need to provide named dict... when unnamed, got error couldn't find 'observe' function
		var idle_no_flash_observer = { observe: _bind(self.pddb, self.pddb.idle_no_flash) };
		var idle_flash_observer = { observe: _bind(self.pddb, self.pddb.idle_flash) };
		
		this.idleService.addIdleObserver(idle_no_flash_observer, constants.DEFAULT_MAX_IDLE);
		this.idleService.addIdleObserver(idle_flash_observer, constants.DEFAULT_FLASH_MAX_IDLE);
		
		// initialize toolbar
		// still not early enough! chrome toolbar not setup, so 
		// document.getElementById still returns null buttons.
		//this.url_bar_listener.toolbar_manager.initialize();
	},
	
	uninstall: function(aSubject, aTopic, aData) {
		try {
			var item = aSubject.QueryInterface(Ci.nsIUpdateItem);
			if (item.id != ProcrasDonate__UUID) {
				return;
			}
			if (aData == "item-uninstalled") {
				// this works
				gBrowser.selectedTab = gBrowser.addTab(constants.FEEDBACK_URL);
				
				Prefs.setBoolPref("firstrun",true);
				////// this does not work. prefs are still present in about:config
				try {
				// Remove all properties that were installed by our extension
				Prefs.deleteBranch("");
				this.pddb.prefs.deleteBranch("");
				// @TODO delete database? archive as separate file?
				} catch (e) {}
				
				// remove toolbar items
				this.url_bar_listener.toolbar_manager.uninstall_toolbar();
			}
		} catch (e) {
		}
	},
	
	uninit: function() {
		var self = this;

		// stop recording
		this.pddb.stop_recording();
		
		//logger("Overlay.uninit()");
		gBrowser.removeProgressListener(this.url_bar_listener);
		
		var idle_no_flash_observer = { observe: _bind(self.pddb, self.pddb.idle_no_flash) };
		var idle_flash_observer = { observe: _bind(self.pddb, self.pddb.idle_flash) };
		
		this.idleService.removeIdleObserver(idle_no_flash_observer, constants.DEFAULT_MAX_IDLE);
		this.idleService.removeIdleObserver(idle_flash_observer, constants.DEFAULT_FLASH_MAX_IDLE);
	},
	
	
	onLoad: function() {
		//logger("Overlay.onLoad()");
	},
	
	onUnload: function() {
		//logger("Overlay.onUnload()");
	},
	
	onPageShow: function() {
		//logger("Overlay.onPageShow()");
	},
	
	onPageHide: function() {
		//logger("Overlay.onPageHide()");
	},
	
	dispatch: function(href, event) {
		var i, controller, request, response;
		request = new PageRequest(href, event);
		//logger("request: " + request);
		for (i=0; i<this.page_controllers.length; i++) {
			controller = this.page_controllers[i];
			response = controller.handle(request);
			if (response)
				return response;
		}
		//logger("done");
		return null;
	},
	
	onPageLoad: function(event) {
		// We only care about page load (DOMContentLoaded) when we're
		// going to display a page.
		var msg = "Overlay.onPageLoad:: ";
		//logger(msg);
		
		// initialize toolbar
		if (!this.url_bar_listener.toolbar_manager.initialized) {
			this.url_bar_listener.toolbar_manager.initialize();
		}
		
		var unsafeWin = event.target.defaultView;
		if (unsafeWin.wrappedJSObject)
			unsafeWin = unsafeWin.wrappedJSObject;
		
		var href = new XPCNativeWrapper(
			new XPCNativeWrapper(unsafeWin, "location").location, "href").href;
		
		return this.dispatch(href, event);
		
		// record if there is flash on page so that appropriate max idle time is used
		var request = new PageRequest(href, event);
		var has_flash = null;
		var max_idle = null;
		request.jQuery("*[type=application/x-shockwave-flash]").after("<H1>BOOM</h1>");
		if (request.jQuery("[type=application/x-shockwave-flash]").length > 0) {
			has_flash = true;
			max_idle = constants.DEFAULT_FLASH_MAX_IDLE;
			logger("flash on page");
		} else {
			has_flash = false;
			max_idle = constants.DEFAULT_MAX_IDLE;
			logger("NO flash on page");
		}
		// create site if necessary and overwrite flash and max idle
		var site = this.Site.get_or_make(href, has_flash, max_idle);
		
		////////// OLD /////////////
		//
		//var doc = event.originalTarget; // doc is document that triggered "onload" event
		//if (event.originalTarget instanceof HTMLDocument) {
		//	// Target is an HTML element
		//	msg += "HTML ";
		//	
		//	if (event.originalTarget.defaultView.frameElement) {
		//		// Target is a frame
		//		msg += "Frame: " + event.originalTarget;
		//	} else {
		//		msg += event.originalTarget;
		//	}
		//	
		//} else {
		//	msg += "non-HTML: " + typeof(event.originalTarget);
		//}
		//logger(msg);
		//// do something with the loaded page.
		//// doc.location is a Location object (see below for a link).
		//// You can use it to make your code executed on certain pages only.
		////logger("a page is loaded: " + doc.location);
		////if (doc.location.href.search("forum") > -1)
		////	alert("a forum page is loaded");
		//var unsafeWin = event.target.defaultView;
		//if (unsafeWin.wrappedJSObject)
		//	unsafeWin = unsafeWin.wrappedJSObject;
		//
		//var unsafeLoc = new XPCNativeWrapper(unsafeWin, "location").location;
		//var href = new XPCNativeWrapper(unsafeLoc, "href").href;
		//
		//if (this.handle_url(href)) {
		//	// Inject scripts into page
		//	logger("handling url: "+href);
		//	//logger(jQuery("#content", doc).length);
		//	this.pddb.dispatch(doc, href);
		//	//this.injectScript("logger(\"Script injected!\");", href, unsafeWin);
		//} else {
		//	logger("storing url: "+href);
		//	var now = parseInt((new Date()).getTime() / 1000);
		//	this.pddb.store_visit(href, now, 1000);
		//}
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
		//logger("Overlay.injectScript:: url=" + url);
	},
	
	onPageUnload: function(event) {
		var msg = "Overlay.onPageUnload:: ";
		var doc = event.originalTarget;
		if (event.originalTarget instanceof HTMLDocument) {
			msg += "HTML "
			//var doc = event.originalTarget;
			//logger("page unloaded:" + doc.location.href);
		}
		//logger(msg);
	},
	
	
	processNewURL: function(win, url) {
		//logger("Overlay.processNewURL:: url=" + url);
		//logger(jQuery("#content", win.document.defaultView).length);
		this.pddb.house_keeping();
		//if (is_procrasdonate_domain()) {
		//	logger("Overlay.processNewURL:: do house keeping");
		//	house_keeping();
		//} else {
		//	logger("Overlay.processNewURL:: don't do house keeping");
		//}
	},
	
	checkVersion: function() {
		logger("CHECK VERSION");
		var ver = -1, firstrun = true;
		
		var gExtensionManager = Components.
		    classes["@mozilla.org/extensions/manager;1"].
		    getService(Components.interfaces.nsIExtensionManager);
		
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
				this.onInstall(current);
			}
			
			if (ver != current && !firstrun) {
				this.doUpgrade();
				// !firstrun ensures that this section does not get loaded if its a first run.
				Prefs.setCharPref("version",current);
				
				// Insert code if version is different here => upgrade
				this.onUpgrade(current);
			}
		}
	},
	
	install_generated_input: function(set_preselected_charities) {
		var self = this;
		_iterate(generated_input()[0], function(key, value, index) {
			if (key == "private_key") {
				if (!self.pddb.prefs.exists("private_key")) {
					self.pddb.prefs.set("private_key", value);
				}
			
			} else if (key == "preselected_charities") {
				if (set_preselected_charities && self.pddb.prefs.exists("set_preselected_charities")) {
					self.pddb.prefs.set("set_preselected_charities", true);
					_iterate(value, function(k, recip_pct, idx) {
						self.pddb.RecipientPercent.process_object(recip_pct);
					});
				}
			
			} else if (key == "constants_PD_URL") {
				constants.PD_URL = value;
			
			} else if (key == "constants_PD_API_URL") {
				constants.PD_API_URL = value;
				
			} else {
				self.pddb.orthogonals.log("generated input: unrecognized key: "+key+" value="+value);
			}
		});
	},
	
	doInstall: function() { // 
		logger("Overlay.doInstall::");
		
		this.url_bar_listener.toolbar_manager.install_toolbar();
	},
	onInstall: function(version) { // execute on first run
		var self = this;
		logger("Overlay.onInstall::");
		
		// The example below loads a page by opening a new tab.
		// Useful for loading a mini tutorial
		window.setTimeout(function() {
			gBrowser.selectedTab = gBrowser.addTab(constants.PD_URL + constants.AFTER_INSTALL_URL + version + "/");
		}, 1500); //Firefox 2 fix - or else tab will get closed
		
		// initialize state
		for (var i = 0; i < this.page_controllers.length; i++) {
			this.page_controllers[i].initialize_state();
		}
		
		// receive data from server to populate database
		// received tables: sitegroups, categories, recipients (user can add their own eventually)
		// after success, set default recipient percent
		this.pddb.page.pd_api.request_data_updates(
			function() {
				// after success

				// install generated input
				// pre-selected charities will now be installed
				self.install_generated_input(true);
				
			}, function() {
				// after failure
			}
		);
		
		// we send an email address as soon as user enters an email
		// address in the first register tab
		
		// send data to server (log install)
		//this.pddb.schedule.do_once_daily_tasks();
		this.pddb.page.pd_api.send_data();
	},
	
	doUpgrade: function() { // make any necessary changes for a new version (upgrade)
		logger("Overlay.doUpgrade::");
	},
	onUpgrade: function(version) { // execute after each new version (upgrade)
		logger("Overlay.onUpgrade::");
		// initialize new state (initialize_state initializes state if necessary.
		for (var i = 0; i < this.page_controllers.length; i++) {
			this.page_controllers[i].initialize_state();
		}
		
		
		// The example below loads a page by opening a new tab.
		// Useful for loading a mini tutorial
		window.setTimeout(function() {
			gBrowser.selectedTab = gBrowser.addTab(constants.PD_URL + constants.AFTER_UPGRADE_URL + version + "/");
		}, 1500); //Firefox 2 fix - or else tab will get closed
		
	},
	
	doMenuSelect: function() {
		//logger("Menu selected!");
	},
};


var Dispatcher = function Dispatcher(pddb) {
	this.pddb = pddb;
	//this.template = Template;
	//this.prefs = new PreferenceManager("ProcrasDonate.", {});
	
	this.controllers = [];
};
Dispatcher.prototype = {};
_extend(Dispatcher.prototype, {
	get_controller: function(url, event, chromeWindow, contentWindow) {
		
	},
	dispatch: function(url, event, chromeWindow, contentWindow) {
		
	},
});

var PDDB = function PDDB(db_filename) {
	//logger("PDDB()");
	//if (Main.locked)
	//	return Main.instance;
	
	this.db_filename = db_filename;
	
	this.template = Template;
	logger(this.template);
	
	this.prefs = new PreferenceManager("ProcrasDonate.", {
		
	});
	
	this.controller = new Controller(this.prefs, this);
	this.page = new PageController(this.prefs, this);
	this.schedule = new Schedule(this.prefs, this);
	this.orthogonals = new Orthogonals(this.prefs, this);
	this.tester = new PDTests(this.prefs, this);
	this.checker = new PDChecks(this.prefs, this);
	
	// #@TODO can we remove need for timer by adding listener higher up ??
	window.addEventListener('focus', _bind(this, this.focus), true);
	window.addEventListener('blur', _bind(this, this.blur), true);
};

PDDB.prototype = {
	init_db: function() {
		logger("PDDB.init_db()");
		var db = new Backend__Firefox();
		db.connect(this.db_filename);
		this.db = db;
		this.models = load_models(db, this);
		
		var self = this;
		_iterate(this.models, function(name, model) {
			//logger("model: "+name);
			self[name] = model; //new Model(db, name, spec);
			
			var already_exists = false;
			self.db.execute("SELECT * FROM sqlite_master", {}, function(row) {
				if (row[1] == model.table_name)
					already_exists = true;
			});
			if (!already_exists) {
				model.create_table();
			}
		});
		
		// install data if not already installed.
		
		// NOTE: onInstall will receive data from server after this method (init_db)
		// is called.
		
		/////// TAGS ////////
		this.Unsorted      = this.Tag.get_or_create({ tag: "Unsorted" })
		this.ProcrasDonate = this.Tag.get_or_create({ tag: "ProcrasDonate" })
		this.TimeWellSpent = this.Tag.get_or_create({ tag: "TimeWellSpent" })
		
		////// TIMETYPES ////////
		this.Daily   = this.TimeType.get_or_create({ timetype: "Daily" });
		this.Weekly  = this.TimeType.get_or_create({ timetype: "Weekly" });
		this.Yearly  = this.TimeType.get_or_create({ timetype: "Yearly" });
		this.Forever = this.TimeType.get_or_create({ timetype: "Forever" });
		
		////// PAYMENT SERVICES ////////
		this.AmazonFPS = this.PaymentService.get_or_create({
			name: "Amazon Flexible Payments Service",
			user_url: constants.AMAZON_USER_URL
		});

		////// CONTENTTYPES ////////
		this.content_types = {};
		if (this.ContentType.count() == 0) {
			var contenttype_names = ['Site', 'SiteGroup', 'Recipient', 'Tag'];
			for (var i=0; i < contenttype_names.length; i++) {
				var ct = this.ContentType.create({ modelname: contenttype_names[i] });
				this.content_types[ct.id] = this[ct.modelname];
			}
		}
	},
	
	dispatch: function(doc, url) {
		//logger("dispatch()", doc, url);
		this.controller.dispatch_by_host(doc, _href());
	},
	
	house_keeping: function() {
		/* Called on every page load.
		   Checks schedule. Not sure if it should do anything else... */
		
		// does periodic checks for whether it's time to do scheduled tasks
		this.schedule.run();
	},
	
	focus: function(e) {
		//_pprint(e.target);
		this.prefs.set("new_ff_is_in_focus", true);
		this.prefs.set("ff_blur_time", _dbify_date(new Date()));
		
		//logger("before FOCUS: "+e.target+
		//		"\n in_focus="+this.prefs.get("new_ff_is_in_focus", "--")+
		//		"\n timer_started="+this.prefs.get("ff_focus_timer_started", "--"));
		
		var self = this;
		if (!this.prefs.get("ff_focus_timer_started", false)) {
			setTimeout(function() {
				self.determine_ff_focus_state()
			}, 1000);
			this.prefs.set("ff_focus_timer_started", true);
		}
	},
	
	blur: function(e) {
		//_pprint(e.target);
		this.prefs.set("new_ff_is_in_focus", false);
		this.prefs.set("ff_blur_time", _dbify_date(new Date()));
		
		//logger("before BLUR: "+e.target+
		//		"\n in_focus="+this.prefs.get("new_ff_is_in_focus", "--")+
		//		"\n timer_started="+this.prefs.get("ff_focus_timer_started", "--"));
		
		var self = this;
		
		if (!this.prefs.get("ff_focus_timer_started", false)) {
			setTimeout(function() {
				self.determine_ff_focus_state()
			}, 1000);
			this.prefs.set("ff_focus_timer_started", true);
		}
	},
	
	determine_ff_focus_state: function() {
		this.prefs.set("ff_focus_timer_started", false);
		var new_ff_state = this.prefs.get("new_ff_is_in_focus", false);
		var ff_state = this.prefs.get("ff_is_in_focus", false);
		
		//logger("determine_ff_focus_state timer_started="+this.prefs.get("ff_focus_timer_started", false)+
		//		" new ff state="+new_ff_state+
		//		"     ff state="+ff_state);
		
		
		if (ff_state != new_ff_state) {
			this.prefs.set("ff_is_in_focus", new_ff_state);
			if (new_ff_state) {
				//#@TODO check multiple urls like in idle_no_flash??
				var url = this.prefs.get("saved_focus_last_url", "");
				if (IDLE_LOGGING) logger("focus last_url="+this.prefs.get("last_url", "")+
						"\n focus_url="+this.prefs.get("saved_focus_last_url", "-"));
				if (url) {
					this.prefs.set("saved_focus_last_url", "");
					this.start_recording(url);
				}
			} else {
				//#@TODO check multiple urls like in idle_no_flash??
				var last_url = this.prefs.get("last_url", "");
				if (IDLE_LOGGING) logger("blur last_url="+this.prefs.get("last_url", "")+
						"\n focus_url="+this.prefs.get("saved_focus_last_url", "-"));
				
				if (last_url) {
					this.prefs.set("saved_focus_last_url", last_url); 
					this.stop_recording();
				}
			}
		}
	},
	
	idle_no_flash: function(subject, topic, data) {
		logger(topic+" -- no flash   ");
		// if idle and no flash on site, call idle()
		// if back, call back()
		if (topic == "back") {
			this.back();
		} else if (topic == "idle") {
			var url = this.prefs.get("last_url", "");
			if (!url) {
				url = this.prefs.get("saved_idle_last_url", "");
			}
			logger("saved_idle_last_url is "+url);
			if (url) {
				var site = this.Site.get_or_null({url__eq: url });
				if (site) {
					if (!site.has_flash()) {
						this.idle();
					}
				} else {
					logger("NO SITE in idle_no_flash "+url);
				}
			}
		}
	},
	
	idle_flash: function(subject, topic, data) {
		logger(topic+" -- flash");
		// if idle, call idle() regardless of flash ( might as well)
		// if back, call back()
		if (topic == "back") {
			this.back();
		} else if (topic == "idle") {
			this.idle();
		}
	},
	
	idle: function() {
		if (IDLE_LOGGING) logger("IDLE last_url="+this.prefs.get("last_url", "")+
				"\n idle_url="+this.prefs.get("saved_idle_last_url", ""));
		//#@TODO check multiple urls like in idle_no_flash??
		var last_url = this.prefs.get("last_url", "");
		if (last_url) {
			this.prefs.set("saved_idle_last_url", last_url); 
			this.stop_recording();
		}
	},
	
	back: function() {
		if (IDLE_LOGGING) logger("BACK in_focus="+this.prefs.get("ff_is_in_focus", "")+
				"\n last_url="+this.prefs.get("last_url", "")+
				"\n idle_url="+this.prefs.get("saved_idle_last_url", ""));
		if (this.prefs.get("ff_is_in_focus", "")) {
			// we want to check this because maybe we start_recording
			// before back is called, in which case, we don't
			// want to do anything.
			// (ns1IdleService can have 5 second delay)
			var url = this.prefs.get("saved_idle_last_url", "");
			//#@TODO check multiple urls like in idle_no_flash??
			if (url) {
				this.prefs.set("saved_idle_last_url", "");
				this.start_recording(url);
			}
		}
	},

	start_recording: function(url) {
		this.stop_recording();
		if (IDLE_LOGGING) logger("start recording "+url+
				"\n last_url="+this.prefs.get("last_url", "--")+
				"\n idle_url="+this.prefs.get("saved_idle_last_url", "")+
				"\n focus_url="+this.prefs.get("saved_focus_last_url", ""));
		this.prefs.set("saved_idle_last_url", "");
		this.prefs.set("saved_focus_last_url", "");
		
		this.prefs.set("last_url", url);
		var now = _dbify_date(new Date());
		this.prefs.set("last_start", now);
	},
	
	stop_recording: function() {
		if (IDLE_LOGGING) logger("stop recording "+
				"\n last_url="+this.prefs.get("last_url", "")+
				"\n idle_url="+this.prefs.get("saved_idle_last_url", "")+
				"\n focus_url="+this.prefs.get("saved_focus_last_url", "")+
				"\n in focus="+this.prefs.get("ff_is_in_focus", "--"));
		var url = this.prefs.get("last_url", false);
		if (url) {
			this.prefs.set("last_url", "");
			var start = this.prefs.get("last_start");
			var now = _dbify_date(new Date());
			var diff = now - start;
			if (IDLE_LOGGING) logger(">> stop recording "+
					"\n last_start="+this.prefs.get("last_start", "")+
					"\n now="+now+
					"\n diff="+diff+
					"\n rounded="+Math.round(diff));
			this.prefs.set("last_start", "");
			// log diff if greater than flash max...just in case its a bug...
			if (diff > constants.DEFAULT_FLASH_MAX_IDLE) {
				this.orthogonals.warn("store_visit:: diff greater than flash max: "+diff+" start="+start+"="+_un_dbify_date(start)+" url="+url);
				//diff = constants.DEFAULT_FLASH_MAX_IDLE + 1;
			}
			if (diff > 0) {
				this.store_visit(url, start, diff);
			}
		}
	},
	
	store_visit: function(url, start_time, duration) {
		if (STORE_VISIT_LOGGING) logger("  >>>> store_visit "+url+" "+start_time+" for "+duration);
		
		var site = this.Site.get_or_null({url__eq: url });
		if (STORE_VISIT_LOGGING) logger("SITE: "+site);
		
		if (!site) {
			var host = _host(url);
			var sitegroup = this.SiteGroup.get_or_create({
				host: host
			}, {
				name: host,
				host: host,
				tag_id: this.Unsorted.id
			});

			site = this.Site.create({
				url: url,
				sitegroup_id: sitegroup.id,
				flash: _dbify_bool(false),
				max_idle: constants.DEFAULT_FLASH_MAX_IDLE
			});
			if (STORE_VISIT_LOGGING) logger("store created "+site);
		}
		
		var visit = this.Visit.create({
			site_id: site.id,
			enter_at: start_time,
			duration: duration
		});
		
		this.update_totals(site, visit);
	},
		
	update_totals: function(site, visit) {
		var self = this;
		
		var sitegroup = site.sitegroup();
		var tag = site.tag();
		
		var pd_recipient = this.Recipient.get_or_null({ slug: "pd" });
		//var pd_recipientpercent = this.RecipientPercent.get_or_null({ recipient_id: pd_recipient.id });
		var pd_pct = _un_prefify_float(this.prefs.get('support_pct', constants.DEFAULT_SUPPORT_PCT)) / 100.0;
		
		var enter_at = _un_dbify_date(visit.enter_at);
		var end_of_day     = _dbify_date(_end_of_day(enter_at));
		var end_of_week    = _dbify_date(_end_of_week(enter_at));
		var end_of_year    = _dbify_date(_end_of_year(enter_at));
		var end_of_forever = _end_of_forever();
		
		var timetypes = [ this.Daily, this.Weekly, this.Yearly, this.Forever ];
		var times     = [ end_of_day, end_of_week, end_of_year, end_of_forever ];
		
		var pd_dollars_per_hr = _un_prefify_float(this.prefs.get('pd_dollars_per_hr', constants.PD_DEFAULT_DOLLARS_PER_HR));
		var tws_dollars_per_hr = _un_prefify_float(this.prefs.get('tws_dollars_per_hr', constants.TWS_DEFAULT_DOLLARS_PER_HR));
		
		if (STORE_VISIT_LOGGING) logger("pd_dollars_per_hr="+pd_dollars_per_hr);
		
		// time_delta is in seconds
		var time_delta = parseInt(visit.duration);
		var limited_time_delta = time_delta;
		/// A total's total_time is always aggregated on how much time a user spent
		/// on a site. However, the total_amount maxes out when the user's limit
		/// is reached.
		if ( tag.id != this.Unsorted.id ) {
			var tag_contenttype = this.ContentType.get_or_null({ modelname: "Tag" });
			if ( tag.id == this.ProcrasDonate.id ) {
				var limit = parseFloat( this.prefs.get('pd_hr_per_week_max', 0) );
				limited_time_delta = this.check_limit( limit, time_delta, end_of_week, tag_contenttype, tag );
			} else if ( tag.id == this.TimeWellSpent.id ) {
				var limit = parseFloat( this.prefs.get('tws_hr_per_week_max', 0) );
				limited_time_delta = this.check_limit( limit, time_delta, end_of_week, tag_contenttype, tag );
			}
		}
		
		// full amount. still have to calculate recipient percents
		// use limited_time_delta for calculation (in seconds, so turn into hours)
		// NOTE: pd support gets taken automatically by amazon !!
		// amazon fee and marketplace fee to PD are automatically taken
		// from recipient's account! so full amount is tax deductible if any part is!
		// time_delta is in seconds / (60s/m * 60m/h) --> hours
		var pd_full_amount_delta = ( limited_time_delta / (60.0*60.0) ) * pd_dollars_per_hr;
		var tws_full_amount_delta = ( limited_time_delta / (60.0*60.0) ) * tws_dollars_per_hr;
		
		if (STORE_VISIT_LOGGING) logger("time_delta="+time_delta+"limited_time_delta="+limited_time_delta+" pd_dollars_per_hr="+pd_dollars_per_hr+" tws_dollars_per_hr="+tws_dollars_per_hr);
		
		// don't need these anymore. see above note
		var pd_skim_amount = pd_full_amount_delta * pd_pct;
		var tws_skim_amount = tws_full_amount_delta * pd_pct;
		
		// don't need these anymore. see above note
		var pd_rest_amount = pd_full_amount_delta - pd_skim_amount;
		var tws_rest_amount = tws_full_amount_delta - tws_skim_amount;
		
		// abstract away whether this visit is ProcrasDonate, TimeWellSpent or Unsorted
		var full_amount_delta = 0;
		var skim_amount = 0;
		var rest_amount = 0;
		if ( tag.id == this.ProcrasDonate.id ) {
			full_amount_delta = pd_full_amount_delta;
			skim_amount = pd_skim_amount;
			rest_amount = pd_rest_amount;
		} else if ( tag.id == this.TimeWellSpent.id ) {
			full_amount_delta = tws_full_amount_delta;
			skim_amount = tws_skim_amount;
			rest_amount = tws_rest_amount;
		} else if ( tag.id == this.Unsorted.id ) {
			// no money changes hands
		}
		
		if (STORE_VISIT_LOGGING) logger("tag == "+tag.tag+"\nfull_amount_delta="+full_amount_delta+" skim_amount="+skim_amount+" rest_amount="+rest_amount);
		
		/// array objects containing:
		///	contenttype instance
		///  content instance
		///  amt (float)
		var content_instances = [];
		
		this.ContentType.select({}, function(row) {
			if (row.modelname == "Site") {
				content_instances.push({
					contenttype: row,
					content: site,
					amt: full_amount_delta,//rest_amount,
					requires_payment: false
				});
			} else if (row.modelname == "SiteGroup") {
				var requires_payment = (tag.id == self.TimeWellSpent.id);
				content_instances.push({
					contenttype: row,
					content: sitegroup,
					amt: full_amount_delta,//rest_amount,
					requires_payment: requires_payment
				});
			} else if (row.modelname == "Tag") {
				content_instances.push({
					contenttype: row,
					content: tag,
					amt: full_amount_delta,//rest_amount,
					requires_payment: false
				});
			} else if (row.modelname == "Recipient") {
				if (tag.id != self.Unsorted.id && pd_recipient) {
					// site is TWS or PD, so some amount will go to pd
					// this isn't used to make payments; just to check against:
					// marketplace fees should add up to this total amount
					content_instances.push({
						contenttype: row,
						content: pd_recipient,
						amt: skim_amount, // SKIM TO US. we record this for the heck of it.
						requires_payment: false
					});
				}
				if (tag.id == self.ProcrasDonate.id) {
					// site is PD, so pay all recipients
					self.RecipientPercent.select({}, function(r) {
						var recip = self.Recipient.get_or_null({ id: r.recipient_id });
						content_instances.push({
							contenttype: row,
							content: recip,
							amt: full_amount_delta * parseFloat(r.percent),//rest_amount_delta * parseFloat(r.percent)
							requires_payment: true
						});
					});
				}
				
			} else {
				this.orthogonals.warn("update_totals:: not a content type we care about:"+row);
				if (STORE_VISIT_LOGGING) logger("update_totals:: not a content type we care about");
			}
		});

		for (var i = 0; i < timetypes.length; i++) {
		
			for (var j = 0; j < content_instances.length; j++) {
				var tuple = content_instances[j];
				var contenttype = tuple.contenttype;
				var content = tuple.content;
				var amt = tuple.amt;
				var requires_payment = tuple.requires_payment && timetypes[i].id == this.Weekly.id;
				if (STORE_VISIT_LOGGING) logger(" ------------------------------------------------ ");
				if (STORE_VISIT_LOGGING) logger(" `````` i "+i+"  j "+j);
				if (STORE_VISIT_LOGGING) logger(" `````contenttype: "+contenttype);
				if (STORE_VISIT_LOGGING) logger(" `````content: "+content);
				if (STORE_VISIT_LOGGING) logger(" `````amt: "+amt);
				if (STORE_VISIT_LOGGING) logger(" `````requires_payment: "+requires_payment);
				
				if (STORE_VISIT_LOGGING) logger(" .....timetypes="+timetypes[i]);
				if (STORE_VISIT_LOGGING) logger(" .....times="+times[i]);
				var total = this.Total.get_or_create({
					contenttype_id: contenttype.id,
					content_id: content.id,
					datetime: times[i],
					timetype_id: timetypes[i].id
				}, {
					total_time: 0,
					total_amount: 0,
				});
				if (STORE_VISIT_LOGGING) logger(" .....before.. total... ="+total);
				
				var new_total_time = parseInt(total.total_time) + time_delta;
				var new_total_amount = parseFloat(total.total_amount) + parseFloat(amt);
				
				this.Total.set({
					total_time: parseInt(total.total_time) + time_delta,
					total_amount: parseFloat(total.total_amount) + parseFloat(amt)
				}, {
					id: total.id
				});
				if (STORE_VISIT_LOGGING) logger("updated total="+this.Total.get_or_null({ id: total.id }));
				
				if ( requires_payment && timetypes[i].id == this.Weekly.id ) {
					this.RequiresPayment.get_or_create({
						total_id: total.id
					}, {
						partially_paid: _dbify_bool(false),
						pending: _dbify_bool(false)
					});
				}
			}
		}
	},
	
	check_limit: function( limit, time_delta, end_of_week, contenttype, tag ) {
		/* Seeks to return the time amount that does not exceed the limit.
		 * Essentially: max(limit, (total_time+time_delta))
		 * 
		 * if unsorted tag, return time_delta.
		 * retrieve weekly tag total. 
		 * if (total_time + time_delta) - limit < 0, return time_delta
		 * if (total_time + time_delta) - limit > 0, then
		 *    if total_time - limit > 0, return time_delta
		 *    if total_time - limit < 0, return Math.round( limit - total-time )
		 *         this difference is the amount to add to meet limit exactly.
		 */
		if (STORE_VISIT_LOGGING) logger("main.js::check_limit: time_delta="+time_delta+" ||end_of_week="+end_of_week+" ||contenttype="+contenttype+" ||tag="+tag);
		// put limit into seconds/wk not hours/wk
		limit = limit * 3600;
		if ( tag.id == this.Unsorted.id ) {
			return time_delta;
		}
		var self = this;
		var total = this.Total.get_or_null({
			contenttype_id: contenttype.id,
			content_id: tag.id,
			datetime: end_of_week,
			timetype_id: self.Weekly.id
		});
		if ( total ) {
			var total_time = parseInt(total.total_time);
			if (STORE_VISIT_LOGGING) logger("    total="+total);
			var diff = total_time + time_delta;
			var diff_m_limit = diff - limit;
			if (STORE_VISIT_LOGGING) logger("    total_time + time_delta = diff::::"+total_time+" "+time_delta+" "+diff);
			if (STORE_VISIT_LOGGING) logger("    diff - limit = diff_m_limit::::"+diff+" "+limit+" "+diff_m_limit);

			if ( diff_m_limit <= 0 ) {
				if (STORE_VISIT_LOGGING) logger("    dml < 0, return time_delta="+time_delta);
				return time_delta;
			} else {
				var short = Math.round( limit - total_time );
				if ( short < 0 ) {
					if (STORE_VISIT_LOGGING) logger("    limit - total_time < 0 >>> "+total_time+" "+limit+"   return 0");
					if (STORE_VISIT_LOGGING) logger("    short "+short);
					return 0;
				} else {
					if (STORE_VISIT_LOGGING) logger("    return "+short);
					return short;
				}
			}
		} else {
			if (STORE_VISIT_LOGGING) logger("    NO TOTAL");
		}
		return time_delta;
	}
};

var Orthogonals = function Orthogonals(prefs, pddb) {
	this.prefs = prefs;
	this.pddb = pddb;
};
Orthogonals.prototype = {
	_record: function(type, msg, detail_type) {
		detail_type = detail_type || "default";
		this.pddb.Log.create({
			datetime: _dbify_date(new Date()),
			type: type,
			detail_type: detail_type,
			message: msg
		});
		logger("Orthogonal."+type+" ("+detail_type+"): "+msg);
	},
	
	info: function(msg, detail_type) {
		this._record("INFO", msg, detail_type);
	},
	
	debug: function(msg, detail_type) {
		this._record("DEBUG", msg, detail_type);
	},
	
	log: function(msg, detail_type) {
		/*try {
			this.FAIL(); // we expect this to fail because we haven't defined a FAIL property!
		} catch (e) {
			logger("Orthogonals lOOOOOOOg: "+detail_type+": "+msg+"\n"+e.stack);
		}*/
		this._record("LOG", msg, detail_type);
	},
	
	warn: function(msg, detail_type) {
		this._record("WARN", msg, detail_type);
	},
	
	fail: function(msg, detail_type) {
		this._record("FAIL", msg, detail_type);
	},
	
	error: function(msg, detail_type) {
		//logger("Orthogonal.ErRoR ("+detail_type+"): "+msg);
		this._record("ERROR", msg, detail_type);
		try {
			this.FAIL(); // we expect this to fail because we haven't defined a FAIL property!
		} catch (e) {
			logger("Orthogonals ERROR: "+detail_type+": "+msg+"\n"+e.stack);
		}
		throw "Orthogonals ERROR: "+detail_type+": "+msg
	},
	
	UserStudy: function(type, msg, quant) {
		/*
		 * @param quant: some quantity (float)
		 */
		this.pddb.UserStudy.create({
			datetime: _dbify_date(new Date()),
			type: type,
			message: msg,
			quant: quant
		});
		logger("Orthogonal.UserStudy"+type+": "+msg+" ("+quant+")");
	}
	
}

var myOverlay = new Overlay();
