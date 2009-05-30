
logger = function(msg) {
	dump("---------\n" + msg + "\n");
	try {
		logger.FAIL();
	} catch (e) {
		dump(e.stack);
	}
};

var ProcrasDonate__UUID="{5d393167-8b1c-4ce1-8593-0ba5f39f3210}";


// from https://developer.mozilla.org/En/Code_snippets:On_page_load
const STATE_START = Components.interfaces.nsIWebProgressListener.STATE_START;
const STATE_STOP = Components.interfaces.nsIWebProgressListener.STATE_STOP;

var URLBarListener = function URLBarListener(self, pddb) {
	this.self = self;
	this.toolbar_manager = new PD_ToolbarManager(pddb);
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
		logger("onLocationChange:: " + aProgress.DOMWindow.location.href+" "+aURI);
		//logger(jQuery(aProgress.DOMWindow,
		//if (aURI == "about:config")
		//	return;
		logger(window);
		logger(document);
		logger(gBrowser);
		logger(gBrowser.contentWindow);
		logger(gBrowser.contentWindow.document);
		logger(gBrowser.contentDocument);
		
		http_request = new HttpRequest(window, window);
		var request = http_request.contentStartRequest({
			method: "get",
			//url: "http://localhost:8000/start_now",
			url: "http://www.google.com",
			onload: function(event) {
				logger(["HttpRequest->onload()", arguments.length]);
				logger(event.responseText);
			},
			onerror: function(event) {
				logger(["HttpRequest->onerror()",arguments.length]); },
			onreadystatechange: function(event) {
				logger(["HttpRequest->onreadystatechange()", arguments]); },
		});
		
		logger(jQuery("*", gBrowser.contentWindow.document).length);
		//logger([]);
		//logger([aProgress.DOMWindow.content]);
		
		//PD_ToolbarManager.updateButtons({ url: aProgress.DOMWindow.location.href });
		this.toolbar_manager.updateButtons({ url: aProgress.DOMWindow.location.href });
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
		logger("onSecurityChange:: " + aState);
	}
	
};


var Prefs = Components.classes["@mozilla.org/preferences-service;1"]
                      .getService(Components.interfaces.nsIPrefService);
Prefs = Prefs.getBranch("extensions.my_extension_name.");

//ProcrasDonate.log

//function _callback(obj, method) {
//	var args = Array.prototype.slice.apply(arguments, [2, arguments.length]);
//	return function() {
//		return method.apply(obj, 
//							args.concat(Array.prototype.slice.apply(arguments)));
//	}
//}

function Overlay() {
	logger("Overlay()");
	logger([window, document, gBrowser]);
	
	var self = this;
	window.addEventListener("load", _bind(this, this.init), false);
	window.addEventListener("unload", _bind(this, this.uninit), false);
	//function() { return self.init() }, false);
};

Overlay.prototype = {
	VERSION: -1,
	
	//eventListeners: {
	//	load: function(){ Overlay.init(); },
	//	unload: function() { Overlay.uninit(); }
	//},
	
	init: function() {
		logger([window, document, gBrowser]);
		logger("Overlay.init()");
		
		this.pddb = new PDDB();
		this.pddb.init_db();
		
		this.page_controllers = [];
		this.page_controllers.push(
			new Controller(this.pddb.prefs));
		
		var appcontent = document.getElementById("appcontent");   // browser
		
		if(appcontent && !appcontent.seen_by_ProcrasDonate) {
			logger("Overlay.init::appcontent!" + appcontent);
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
		//gBrowser.addProgressListener(
		//	new URLBarListener(this, this.pddb),
		//    Components.interfaces.nsIWebProgress.NOTIFY_LOCATION);
		
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
		//gBrowser.removeProgressListener(Overlay_urlBarListener);
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
	
	dispatch: function(href, event) {
		var i, controller, request, response;
		request = new PageRequest(href, event);
		logger("request: " + request);
		for (i=0; i<this.page_controllers.length; i++) {
			controller = this.page_controllers[i];
			response = controller.handle(request);
			if (response)
				return response;
		}
		logger("done");
		return null;
	},
	
	onPageLoad: function(event) {
		// We only care about page load (DOMContentLoaded) when we're
		// going to display a page.
		var msg = "Overlay.onPageLoad:: ";
		logger(msg);
		
		var unsafeWin = event.target.defaultView;
		if (unsafeWin.wrappedJSObject)
			unsafeWin = unsafeWin.wrappedJSObject;
		
		var href = new XPCNativeWrapper(
			new XPCNativeWrapper(unsafeWin, "location").location, "href").href;
		
		return this.dispatch(href, event);
		
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
		//	var now = Math.round((new Date()).getTime() / 1000);
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
	
	
	processNewURL: function(win, url) {
		logger("Overlay.processNewURL:: url=" + url);
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

var PDDB = function PDDB() {
	logger("PDDB()");
	//if (Main.locked)
	//	return Main.instance;
	
	this.template = Template;
	logger(this.template);
	
	this.prefs = new PreferenceManager("ProcrasDonate.", {
		
	});
	
	this.controller = new Controller(this.prefs);
	this.schedule = new Schedule(this.prefs);
	this.page = new PageController(this.prefs);
};

PDDB.prototype = {
	init_db: function() {
		logger("PDDB.init_db()");
		var db = new Backend__Firefox();
		db.connect("test011.sqlite");
		this.db = db;
		this.models = load_models(db);
		
		var self = this;
		_iterate(this.models, function(name, model) {
			logger("model: "+name);
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
	},
	
	dispatch: function(doc, url) {
		logger("dispatch()", doc, url);
		this.controller.dispatch_by_host(doc, _href());
	},
	
	house_keeping: function() {
		/*
		 * Called on every page load.
		 * 
		 * 0. Set setup account if necessary
		 * 1. If loading restricted page tag and time limit is exceeded, block page
		 * 2. If loading a pageaddict page, then insert data if necessary
		 * 3. Updated ProcrasDonate version available for download?
		 * 4. Do daily and weekly tasks if necessary
		 */
		// 0.
		//CONSTANTS();
		this.controller.initialize_account_defaults_if_necessary();
		this.controller.initialize_state_if_necessary();
		
		//?
		//set_default_idle_mode_if_necessary();
		
		var host = window.location.host;
		
		//this.controller.dispatch_by_host(_href());
		
		//
		//if (!(host.match(/pageaddict\.com$/)) && !(host.match(new RegExp(constants.PD_HOST)))) {
		//	// 1.
		//	check_restriction();
		//} else {
		//	// 2.
		//	check_page_inserts();
		//}
		
		this.schedule.run();
		
		
		var last_global = this.prefs.get('last_visit', 0);
		var first = this.prefs.get('first_visit', 0);
		// chover = change over, as in change over the day ...?
		var chover = new Date();
		chover.setHours(0, 0, 0);
		chover = Math.round(chover.getTime() / 1000);
		//if (first < chover) {
		//	reset_visits();
		//}
		
		// var currentTime = new Date();
		// var t_in_s = Math.round(currentTime.getTime()/1000);
		// this.prefs.set('last_visit', t_in_s);
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
			var now = Math.round((new Date()).getTime() / 1000.0);
			logger(" start: "+start+" now: "+now+" diff: "+now-start);
			this.store_visit(url, start, now - start);
		}
	},
	
	store_visit: function(url, start_time, duration) {
		var site = null;
		//logger("store_visit()");
		this.Site.select({ url__eq: url }, function(row) {
			logger(row[0]);
			site = row;
		});
		//logger("select done");
		logger(site);
		if (!site) {
			logger("Creating Site: url="+url+"]")
			var host = _host(url);
			var sitegroup = this.SiteGroup.get_or_null({ host: host });
			if (!sitegroup) {
				sitegroup = this.SiteGroup.create({ name: host, host: host });
			}
			site = this.Site.create({ url: url, sitegroup_id: sitegroup.id });
		}
		//logger("Site: id="+site.url+" url="+site.url);
		//logger("Site: " + site.toString());
		logger("store_visit site: "+site);
		
		var visit = this.Visit.create({
			site_id: site.id,
			enter_at: start_time,
			duration: duration
		});
		logger("store_visit visit: " + visit);
		
		var sitegroup = this.SiteGroup.get_or_null({ id: site.sitegroup_id });
		logger("store_visit sitegroup: "+sitegroup);
		var tag = this.Tag.get_or_null({ id: sitegroup.tag_id })
		if (!tag) {
			tag = this.Tag.get_or_null({ id: 1 })
		}
		logger("store_visit tag: "+tag);
		
		// update daily visit and daily total
		var end_of_day = _dbify_date(_end_of_day());
		
		var totals = {};
		var totals_keys = [ "daily", "weekly", "forever" ];
		
		var cents_per_hour = 100; // @TODO HACK - get actual cents_per_hour
		
		var end_of_week = _dbify_date(_end_of_week());
		var end_of_day = _dbify_date(_end_of_day());
		
		var pd_recipient = this.Recipient.get_or_create({ 
			twitter_name: "ProcrasDonate"
		},{
			name: "ProcrasDonate",
			mission: "mission statement or slogan!",
			description: "late da lkj a;lsdkfj lskjf laskjf ;oiaw ekld sjfl skf al;fial;i alfkja f;oi l;jfwio jfwf i awi woif w",
			url: "http://ProcrasDonate.com/",
			is_visible: False
		});
		var pd_recipientpercent = this.RecipientPercent.get_or_create({ 
			recipient_id: pd_recipient 
		}, { 
			percent: .05 
		});
		var pd_dailyvisit = this.DailyVisit.get_or_null({ 
			time: end_of_day, recipient_id: pd_recipient.id 
		});
		
		if (pd_dailyvisit) {
			totals.daily = this.Total.get_or_null({ id: pd_dailyvisit.dailytotal_id });
			totals.weekly = this.Total.get_or_null({ id: pd_dailyvisit.weeklytotal_id });
			totals.forever = this.Total.get_or_null({ id: pd_dailyvisit.forevertotal_id });
			// should not be null...if they are errorzz
			logger(" if store_visit dailytotal: "+totals.daily);
			logger(" if store_visit weeklytotal: "+totals.weekly);
			logger(" if store_visit forevertotal: "+totals.forever);
		} else {
			var types = [ this.Type.get_or_create({ type: "Daily" }),
					      this.Type.get_or_create({ type: "Weekly" }),
			              this.Type.get_or_create({ type: "Forever" })
			            ];
			var times = [ end_of_day, end_of_week, _end_of_forever ];
			logger(" > types: "+types);
			logger(" > times: "+times);
			logger(" > totals: "+totals);
			logger(" > totals_keys: "+totals_keys);
			
			for (var i = 0; i < types.length; i++) {
				
				totals[ totals_keys[i] ] = this.Total.get_or_create({ 
					time: times[i],
					type_id: types[i].id
				}, { 
					total_time: 0,
					total_amount: 0,
					time: times[i],
					paid: False,
					tag_id: (tag && tag.id || 0),
					type_id: types[i].id
				});
			}
	
			pd_dailyvisit = this.DailyVisit.create({
				recipient_id: pd_recipient.id,
				total_time: 0,
				total_amount: 0,
				time: end_of_day,
				dailytotal_id: totals.daily.id,
				weeklytotal_id: totals.weekly.id,
				forevertotal_id: totals.forever.id,
			});
			
		}
		
		// loop in following if-statement should do this.
		//var amt_delta = (visit.duration/3600)*cents_per_hour*pd_recipientpercent.percent;
		//this.update_totals(pd_dailyvisit, visit.duration, amt_delta);
		
		if ((tag && tag.tag) == "ProcrasDonate") {
			var self = this;
			this.RecipientPercent.select({}, function(row) {
				var dv = this.DailyVisit.get_or_create({ 
					time: end_of_day,
					recipient_id: row.recipient_id
				},{ 
					total_time: 0,
					total_amount: 0,
					time: end_of_day,
					dailytotal_id: pd_dailyvisit.dailytotal_id,
					weeklytotal_id: pd_dailyvisit.weeklytotal_id,
					forevertotal_id: pd_dailyvisit.forevertotal_id
				});
				// duration in hours * cents/hr * percent
				//@TODO IF DV IS PROCRASDONATE, JUST SKIM
				//@TODO IF DV IS NOT PROCRASDONATE, SUBTRACT SKIM
				var amt_delta = (parseInt(visit.duration)/3600)*cents_per_hour*parseFloat(row.percent);
				self.update_totals(dv, visit.duration, amt_delta);
			});
		} else {
			var dv = this.DailyVisit.get_or_null({ time: end_of_day, site_id: site.id });
			// duration in hours * cents/hr
			//@TODO SUBTRACT SKIM
			var amt_delta = (parseInt(visit.duration)/3600)*cents_per_hour;
			if (dv)
				this.update_totals(dv, visit.duration, amt_delta);
		}

		for (var total in totals) {
			var amt_delta = (parseInt(visit.duration)/3600)*cents_per_hour;
			this.Total.set({
				total_time:   parseInt(total.total_time) + parseInt(visit.duration),
				total_amount: parseFloat(total.total_amount) + amt_delta
			}, { 
				id: total.id
			});
		}

	},
	
	update_totals: function(dailyvisit, time_delta, amount_delta) {
		this.DailyVisit.set(
			{ total_time: dailyvisit.total_time + time_delta,
			  total_amount: dailyvisit.amount + amount_delta
			},
			{ id: dailyvisit.id }
		);
	}
	
};

var myOverlay = new Overlay();
