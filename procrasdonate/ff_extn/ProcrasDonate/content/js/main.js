
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
		logger("onLocationChange:: " + aProgress.DOMWindow.location.href+" "+aURI);
		logger(aProgress.DOMWindow);
		PD_ToolbarManager.updateButtons({ url: aProgress.DOMWindow.location.href });
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
			//logger(jQuery("#content", doc).length);
			this.pddb.dispatch(doc, href);
			//this.injectScript("logger(\"Script injected!\");", href, unsafeWin);
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
	
	
	processNewURL: function(win, url) {
		logger("Overlay.processNewURL:: url=" + url);
		logger(jQuery("#content", win.document.defaultView).length);
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


var PDDB = function PDDB() {
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
		
		var sitegroup = SiteGroup.get_or_null({ id: site.sitegroup_id });
		logger("store_visit sitegroup: "+sitegroup);
		var tag = Tag.get_or_null({ id: sitegroup.tag_id })
		if (!tag) {
			tag = Tag.get_or_null({ id: 1 })
		}
		logger("store_visit tag: "+tag);
		
		// update daily visit and daily total
		var end_of_day = _dbify_date(_end_of_day());
		
		var totals = {};
		var totals_keys = [ "daily", "weekly", "forever" ];

		var cents_per_hour = 100; // @TODO HACK - get actual cents_per_hour
		
		var end_of_week = _dbify_date(_end_of_week());
		var end_of_day = _dbify_date(_end_of_day());
		
		var pd_recipient = Recipient.get_or_create({
				twitter_name: "ProcrasDonate"
			}, {
				name: "ProcrasDonate",
				mission: "mission statement or slogan!",
				description: "late da lkj a;lsdkfj lskjf laskjf ;oiaw ekld sjfl skf al;fial;i alfkja f;oi l;jfwio jfwf i awi woif w",
				url: "http://ProcrasDonate.com/",
				is_visible: False
			});
		var pd_recipientpercent = RecipientPercent.get_or_create({
				recipient_id: pd_recipient.id
			}, {
				percent: .05
			});
		var pd_dailyvisit = DailyVisit.get_or_null({ time: end_of_day, recipient_id: pd_recipient.id });
		
		if (pd_dailyvisit) {
			totals.daily = Total.get_or_null({ id: pd_dailyvisit.dailytotal_id });
			totals.weekly = Total.get_or_null({ id: pd_dailyvisit.weeklytotal_id });
			totals.forever = Total.get_or_null({ id: pd_dailyvisit.forevertotal_id });
			// should not be null...if they are errorzz
			logger(" if store_visit dailytotal: "+totals.daily);
			logger(" if store_visit weeklytotal: "+totals.weekly);
			logger(" if store_visit forevertotal: "+totals.forever);
		} else {
			var types = [ Type.get_or_create({ type: "Daily" }),
					      Type.get_or_create({ type: "Weekly" }),
			              Type.get_or_create({ type: "Forever" })
			            ];
			var times = [ end_of_day, end_of_week, _end_of_forever ];
			logger(" > types: "+types);
			logger(" > times: "+times);
			logger(" > totals: "+totals);
			logger(" > totals_keys: "+totals_keys);
			
			for (var i = 0; i < types.length; i++) {
				totals[ totals_keys[i] ] = Total.get_or_create({
					time: times[i],
					type_id: types[i].id
				}, {
					total_time: 0,
					total_amount: 0,
					time: times[i],
					paid: False,
					tag_id: tag.id,
					type_id: types[i].id
				});
			}
	
			pd_dailyvisit = DailyVisit.create({
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
		
		if (tag.tag == "ProcrasDonate") {
			var self = this;
			RecipientPercent.select({}, function(row) {
				var dv = DailyVisit.get_or_create({
					time: end_of_day,
					recipient_id: row.recipient_id
				}, {
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
			var dv = DailyVisit.get_or_null({ time: end_of_day, site_id: site.id });
			// duration in hours * cents/hr
			//@TODO SUBTRACT SKIM
			var amt_delta = (parseInt(visit.duration)/3600)*cents_per_hour;
			this.update_totals(dv, visit.duration, amt_delta);
		}

		for (var total in totals) {
			var amt_delta = (parseInt(visit.duration)/3600)*cents_per_hour;
			Total.set({
				total_time:   parseInt(total.total_time) + parseInt(visit.duration),
				total_amount: parseFloat(total.total_amount) + amt_delta
			}, { 
				id: total.id
			});
		}

	},
	
	update_totals: function(dailyvisit, time_delta, amount_delta) {
		DailyVisit.set(
			{ total_time: dailyvisit.total_time + time_delta,
			  total_amount: dailyvisit.amount + amount_delta
			},
			{ id: dailyvisit.id }
		);
	}
	
};

PDDB.tables = {
	_order: ["Tag", "Category", "Type", "SiteGroup", "Site", "Recipient", "Total", "DailyVisit", "Visit", "RecipientPercent"],

	// sitegroup has 1 tag
	Tag : {
		table_name: "tags",
		columns: {
			_order: ["id", "tag"],
			id: "INTEGER PRIMARY KEY",
			tag: "VARCHAR"
		},
		indexes: []
	},

	// recipient has 1 category
	Category : {
		table_name: "categories",
		columns: {
			_order: ["id", "category"],
			id: "INTEGER PRIMARY KEY",
			category: "VARCHAR"
		},
		indexes: []
	},

	// Totals have 1 type: daily, weekly or forever
	Type : {
		table_name: "types",
		columns: {
			_order: ["id", "type"],
			id: "INTEGER PRIMARY KEY",
			type: "VARCHAR"
		},
		indexes: []
	},

	SiteGroup : {
		table_name: "sitegroups",
		columns: {
			_order: ["id", "name", "host", "url_re", "tag_id"],
			id: "INTEGER PRIMARY KEY",
			name: "VARCHAR",
			host: "VARCHAR",
			url_re: "VARCHAR",
			tag_id: "INTEGER"
		},
		indexes: []
	},

	Site : {
		// Model metadata
		table_name: "sites",
		columns: {
			_order: ["id", "sitegroup_id", "url"],
			id: "INTEGER PRIMARY KEY",
			sitegroup_id: "INTEGER",
			url: "VARCHAR"
		},
		indexes: []
	},
	
	Recipient : {
		table_name: "recipients",
		columns: {
			_order: ["id", "name", "mission", "description", "twitter_name", "url", "category_id", "is_visible"],
			id: "INTEGER PRIMARY KEY",
			name: "VARCHAR",
			twitter_name: "VARCHAR",
			mission: "VARCHAR",
			description: "VARCHAR",
			url: "VARCHAR",
			category_id: "INTEGER",
			is_visible: "INTEGER", // boolean 0=false
		},
		indexes: []
	},

	/*
	var SiteGroupTagging = new Model(db, "SiteGroupTagging", {
		table_name: "sitegrouptaggings",
		columns: {
			_order: ["id", "sitegroup_id", "tag_id"],
			id: "INTEGER PRIMARY KEY",
			sitegroup_id: "INTEGER",
			tag_id: "INTEGER"
		},
		indexes: []
	});
	*/

	// Overall ProcrasDonate or TimeWellSpent
	// Daily, weekly and forever total
	Total : {
		table_name: "totals",
		columns: {
			_order: ["id", "total_time", "total_amount", "time", "paid", "tag_id", "type_id"],
			id: "INTEGER PRIMARY KEY",
			total_time: "INTEGER", //seconds
			total_amount: "REAL", //cents
			time: "INTEGER", //"DATETIME"
			paid: "INTEGER",
			tag_id: "INTEGER",
			type_id: "INTEGER",
		}
	},
	
	// Tracks how much a site(url) or recipient should be paid each day.
	// Payment is tracked in DailyTotal
	DailyVisit : {
		table_name: "dailyvisits",
		columns: {
			_order: ["id", "site_id", "recipient_id", "total_time", "total_amount", "time", "dailytotal_id", "weeklytotal_id", "forevertotal_id"],
			id: "INTEGER PRIMARY KEY",
			site_id: "INTEGER", // one or the other (or both, if tag for site changes during day  ?)
			recipient_id: "INTEGER", // one or the other
			total_time: "INTEGER", //seconds
			total_amount: "REAL", //cents
			time: "INTEGER", //"DATETIME"
			dailytotal_id: "INTEGER", // Total id
			weeklytotal_id: "INTEGER", // Total id
			forevertotal_id: "INTEGER", // Total id
		}
	},

	Visit : {
		table_name: "visits",
		columns: {
			_order: ["id", "site_id", "enter_at", "duration"],
			id: "INTEGER PRIMARY KEY",
			site_id: "INTEGER",
			enter_at: "INTEGER", //"DATETIME",
			duration: "INTEGER", //seconds
		},
		indexes: []
	},
	
	RecipientPercent : {
		table_name: "recipientpercents",
		columns: {
			_order: ["id", "recipient_id", "percent"],
			id: "INTEGER PRIMARY KEY",
			recipient_id: "INTEGER",
			percent: "REAL"
		},
		indexes: []
	}

};

var myOverlay = new Overlay();
