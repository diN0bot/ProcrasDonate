var STORE_VISIT_LOGGING = false;
var IDLE_LOGGING = false;

/*
 * ?? currently we do not know when force quit or other unexpected shutdown problems occurs.
 *    solutions:
 *       * listener that notifies on restart after unexpected shutdown
 *       * periodic callback that notices unexpected length of time between last chirp
 */

/**
 * 
 * @param pddb
 * @return
 */
var TimeTracker = function TimeTracker(pddb, prefs) {
	this.pddb = pddb;
	this.prefs = prefs;
};
TimeTracker.prototype = {};
_extend(TimeTracker.prototype, {

	start_recording: function(url, enter_type) {
		this.stop_recording(this.pddb.Visit.UNKNOWN);
		if (IDLE_LOGGING) logger("start recording "+url+
				"\n last_url="+this.prefs.get("last_url", "--")+
				"\n idle_url="+this.prefs.get("saved_idle_last_url", "")+
				"\n focus_url="+this.prefs.get("saved_focus_last_url", ""));
		this.prefs.set("saved_idle_last_url", "");
		this.prefs.set("saved_focus_last_url", "");
		this.prefs.set("saved_sleep_last_url", "");
		
		this.prefs.set("last_url", url);
		this.prefs.set("last_url_enter_type", enter_type);
		var now = _dbify_date(new Date());
		this.prefs.set("last_start", now);
	},
	
	stop_recording: function(leave_type) {
		if (IDLE_LOGGING) logger("stop recording "+
				"\n last_url="+this.prefs.get("last_url", "")+
				"\n idle_url="+this.prefs.get("saved_idle_last_url", "")+
				"\n focus_url="+this.prefs.get("saved_focus_last_url", "")+
				"\n in focus="+this.prefs.get("ff_is_in_focus", "--"));
		var url = this.prefs.get("last_url", false);
		var enter_type = this.prefs.get("last_url_enter_type", false);
		if (!enter_type) { enter_type = this.pddb.Visit.UNKNOWN; }
		
		if (url) {
			this.prefs.set("last_url", "");
			this.prefs.set("last_url_enter_type", "");
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
				this.pddb.orthogonals.warn("store_visit:: diff greater than flash max: "+diff+" start="+start+"="+_un_dbify_date(start)+" url="+url);
				//diff = constants.DEFAULT_FLASH_MAX_IDLE + 1;
			}
			var private_browsing_enabled = this.prefs.get("private_browsing_enabled", constants.DEFAULT_PRIVATE_BROWSING_ENABLED);
			if (diff > 0 && !private_browsing_enabled) {
				this.store_visit(url, start, diff, enter_type, leave_type);
			}
		}
	},
	
	store_visit: function(url, start_time, duration, enter_type, leave_type) {
		var site = this.pddb.Site.get_or_null({url__eq: url });
		
		if (!site) {
			var host = _host(url);
			var sitegroup = this.pddb.SiteGroup.get_or_create({
				host: host
			}, {
				name: host,
				host: host,
				tag_id: this.pddb.Unsorted.id
			});

			site = this.pddb.Site.create({
				url: url,
				sitegroup_id: sitegroup.id,
				flash: _dbify_bool(false),
				max_idle: constants.DEFAULT_FLASH_MAX_IDLE
			});
		}
		
		var visit = this.pddb.Visit.create({
			site_id: site.id,
			enter_at: start_time,
			duration: duration,
			enter_type: enter_type,
			leave_type: leave_type
		});
		
		this.update_totals(site, visit);
	},
		
	update_totals: function(site, visit) {
		var self = this;
		
		var sitegroup = site.sitegroup();
		var tag = site.tag();
		
		var pd_recipient = this.pddb.Recipient.get_or_null({ slug: "pd" });
		//var pd_recipientpercent = this.RecipientPercent.get_or_null({ recipient_id: pd_recipient.id });
		var pd_pct = _un_prefify_float(this.prefs.get('support_pct', constants.DEFAULT_SUPPORT_PCT)) / 100.0;
		
		var enter_at = _un_dbify_date(visit.enter_at);
		var end_of_day     = _dbify_date(_end_of_day(enter_at));
		var end_of_week    = _dbify_date(_end_of_week(enter_at));
		var end_of_year    = _dbify_date(_end_of_year(enter_at));
		var end_of_forever = _end_of_forever();
		
		var timetypes = [ this.pddb.Daily, this.pddb.Weekly, this.pddb.Yearly, this.pddb.Forever ];
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
		if ( tag.id != this.pddb.Unsorted.id ) {
			var tag_contenttype = this.pddb.ContentType.get_or_null({ modelname: "Tag" });
			if ( tag.id == this.pddb.ProcrasDonate.id ) {
				var limit = parseFloat( this.prefs.get('pd_hr_per_week_max', 0) );
				limited_time_delta = this.check_limit( limit, time_delta, end_of_week, tag_contenttype, tag );
			} else if ( tag.id == this.pddb.TimeWellSpent.id ) {
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
		if ( tag.id == this.pddb.ProcrasDonate.id ) {
			full_amount_delta = pd_full_amount_delta;
			skim_amount = pd_skim_amount;
			rest_amount = pd_rest_amount;
		} else if ( tag.id == this.pddb.TimeWellSpent.id ) {
			full_amount_delta = tws_full_amount_delta;
			skim_amount = tws_skim_amount;
			rest_amount = tws_rest_amount;
		} else if ( tag.id == this.pddb.Unsorted.id ) {
			// no money changes hands
		}
		
		if (STORE_VISIT_LOGGING) logger("tag == "+tag.tag+"\nfull_amount_delta="+full_amount_delta+" skim_amount="+skim_amount+" rest_amount="+rest_amount);
		
		/// array objects containing:
		///	contenttype instance
		///  content instance
		///  amt (float)
		var content_instances = [];
		
		this.pddb.ContentType.select({}, function(row) {
			if (row.modelname == "Site") {
				content_instances.push({
					contenttype: row,
					content: site,
					amt: full_amount_delta,//rest_amount,
					requires_payment: false
				});
			} else if (row.modelname == "SiteGroup") {
				var requires_payment = (tag.id == self.pddb.TimeWellSpent.id);
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
				if (tag.id != self.pddb.Unsorted.id && pd_recipient) {
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
				if (tag.id == self.pddb.ProcrasDonate.id) {
					// site is PD, so pay all recipients
					self.pddb.RecipientPercent.select({}, function(r) {
						var recip = self.pddb.Recipient.get_or_null({ id: r.recipient_id });
						content_instances.push({
							contenttype: row,
							content: recip,
							amt: full_amount_delta * parseFloat(r.percent),//rest_amount_delta * parseFloat(r.percent)
							requires_payment: true
						});
					});
				}
				
			} else {
				this.pddb.orthogonals.warn("update_totals:: not a content type we care about:"+row);
				if (STORE_VISIT_LOGGING) logger("update_totals:: not a content type we care about");
			}
		});

		for (var i = 0; i < timetypes.length; i++) {
		
			for (var j = 0; j < content_instances.length; j++) {
				var tuple = content_instances[j];
				var contenttype = tuple.contenttype;
				var content = tuple.content;
				var amt = tuple.amt;
				var requires_payment = tuple.requires_payment && timetypes[i].id == this.pddb.Weekly.id;
				if (STORE_VISIT_LOGGING) logger(" ------------------------------------------------ ");
				if (STORE_VISIT_LOGGING) logger(" `````` i "+i+"  j "+j);
				if (STORE_VISIT_LOGGING) logger(" `````contenttype: "+contenttype);
				if (STORE_VISIT_LOGGING) logger(" `````content: "+content);
				if (STORE_VISIT_LOGGING) logger(" `````amt: "+amt);
				if (STORE_VISIT_LOGGING) logger(" `````requires_payment: "+requires_payment);
				
				if (STORE_VISIT_LOGGING) logger(" .....timetypes="+timetypes[i]);
				if (STORE_VISIT_LOGGING) logger(" .....times="+times[i]);
				var total = this.pddb.Total.get_or_create({
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
				
				this.pddb.Total.set({
					total_time: parseInt(total.total_time) + time_delta,
					total_amount: parseFloat(total.total_amount) + parseFloat(amt)
				}, {
					id: total.id
				});
				if (STORE_VISIT_LOGGING) logger("updated total="+this.pddb.Total.get_or_null({ id: total.id }));
				
				if ( requires_payment && timetypes[i].id == this.pddb.Weekly.id ) {
					this.pddb.RequiresPayment.get_or_create({
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
		if ( tag.id == this.pddb.Unsorted.id ) {
			return time_delta;
		}
		var self = this;
		var total = this.pddb.Total.get_or_null({
			contenttype_id: contenttype.id,
			content_id: tag.id,
			datetime: end_of_week,
			timetype_id: self.pddb.Weekly.id
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
});

/**
 * 	
		// add listeners for idle times
		// we want to listen for 3 minutes and 20 minutes.
		// https://developer.mozilla.org/en/nsIIdleService
		
		// need to restart ff to see changes, not just reload chrome.
		// observers stick around until ff shutdown, then automatically removed
		// (based on experience. not sure what we're *supposed* to do)
		
		// idle time is based on OS idle time, NOT FF only.
		// so if switch apps and then start clicking, 'back' will be triggered....
		
		NOTE since register multiple idlebacklisteners (one for flash, one for no flash)
		     back might be called multiple times? (i think not)
		     both idle timeouts occur one after the other? (i think so)
		
 * @param pddb
 * @param time_tracker
 * @return
 */
var IdleBackListener = function IdleBackListener() {
};
IdleBackListener.prototype = {};
_extend(IdleBackListener.prototype, {
	init: function(idleService, pddb, prefs, time_tracker) {
		this.idleService = idleService;
		this.pddb = pddb;
		this.prefs = prefs;
		this.time_tracker = time_tracker;
		
		// we can't call register here because this constructor is called outside
		// the subclass's constructor in order to inherit this superclass's behavior.
		//
		// we could assign the prototype within the subclass's constructor,
		// especially since in this case only a couple instances are created.
		//
		// however, this would not work either because the superclass's constructor
		// would still be called before the subclass's prototypes had extended super.
		//
		// the question is: how do we inherit both behavior and state AND permit the
		// superclass constructor to call superclass behavior?
		//
		// anyway, the subclass constructor will have to call this.register()
		this.register();
	},
	
	register: function() {
		this.idleService.addIdleObserver(this, this.idle_timeout, false);
	},
	
	unregister: function() {
		this.idleService.removeIdleObserver(this, this.idle_timeout, false);
	},
	
	/*
	 * user is recognized to be idle. check if we should stop_recording
	 */
	idle: function(leave_type) {
		logger("idle");
		var url = this.prefs.get("last_url", "");
		if (!url) {
			url = this.prefs.get("saved_idle_last_url", "");
		}
		if (url) {
			this.prefs.set("saved_idle_last_url", url); 
			this.time_tracker.stop_recording(leave_type);
		}
	},
	
	/*
	 * user is no longer idle. check if we should start recording.
	 * in particular, we don't want to start_recording if already recording.
	 * since then we'll get stutter visits. 
	 */
	back: function() {
		logger("back");
		if (this.prefs.get("ff_is_in_focus", "")) {
			// we want to check this because maybe we start_recording
			// before back is called, in which case, we don't
			// want to do anything.
			// (ns1IdleService can have 5 second delay)
			var url = this.prefs.get("saved_idle_last_url", "");
			if (url) {
				this.prefs.set("saved_idle_last_url", "");
				this.time_tracker.start_recording(url, this.pddb.Visit.BACK);
			}
		}
	}
});

/**
 * 
 */
var IdleBack_Flash_Listener = function IdleBack_Flash_Listener(idleService, pddb, prefs, time_tracker, idle_timeout) {
	this.idle_timeout = idle_timeout;
	
	this.init(idleService, pddb, prefs, time_tracker);
};
// we do this to inherit the superclass's behavior.
// initializing state will occur when the subclass is instantiated.
IdleBack_Flash_Listener.prototype = new IdleBackListener();
_extend(IdleBack_Flash_Listener.prototype, {
	/**
	 * if idle, call idle() regardless of flash ( might as well)
	 * if back, call back()
	 */
	observe: function(subject, topic, data) {
		logger(topic+" -- flash");
		if (topic == "back") {
			this.back(this.pddb.Visit.BACK);
		} else if (topic == "idle") {
			this.idle(this.pddb.Visit.IDLE_FLASH);
		}
	},
});

/**
 * 
 */
var IdleBack_NoFlash_Listener = function IdleBack_Flash_Listener(idleService, pddb, prefs, time_tracker, idle_timeout) {
	this.idle_timeout = idle_timeout;

	this.init(idleService, pddb, prefs, time_tracker);
};
//we do this to inherit the superclass's state. the superclass's constructor 
//will be recalled when the subclass is instantiated.
IdleBack_NoFlash_Listener.prototype = new IdleBackListener();
_extend(IdleBack_NoFlash_Listener.prototype, {
	/**
	 * if idle and no flash on site, call idle()
	 * if back, call back()
	 */
	observe: function(subject, topic, data) {
		logger(topic+" -- no flash   ");
		
		if (topic == "back") {
			this.back(this.pddb.Visit.BACK);
		} else if (topic == "idle") {
			var url = this.prefs.get("last_url", "");
			if (!url) {
				url = this.prefs.get("saved_idle_last_url", "");
			}
			logger("saved_idle_last_url is "+url);
			if (url) {
				var site = this.pddb.Site.get_or_null({url__eq: url });
				if (site) {
					if (!site.has_flash()) {
						this.idle(this.pddb.Visit.FLASH_NOFLASH);
					}
				} else {
					logger("NO SITE in idle_no_flash "+url);
				}
			}
		}
	},
});

/**
 * 
 */
var BlurFocusListener = function BlurFocusListener(pddb, prefs, time_tracker) {
	this.pddb = pddb;
	this.prefs = prefs;
	this.time_tracker = time_tracker;
	
	// set focus state to true. this means that FF is the active app right now.
	//this.prefs.set("ff_is_in_focus", true);
	
	// time is not started
	this.prefs.set("ff_focus_timer_started", false);
	
	this.register();
};
BlurFocusListener.prototype = {};
_extend(BlurFocusListener.prototype, {
	register: function() {
		var self = this;
		window.addEventListener('focus', function(event) { self.focus(event); }, true);
		window.addEventListener('blur', function(event) { self.blur(event); }, true);
	},
	
	unregister: function() {
		var self = this;
		window.removeEventListener('focus', function(event) { self.focus(event); }, true);
		window.removeEventListener('blur', function(event) { self.blur(event); }, true);
	},
	
	focus: function(e) {
		this.prefs.set("new_ff_is_in_focus", true);
		this.prefs.set("ff_blur_time", _dbify_date(new Date()));

		var self = this;
		if (!this.prefs.get("ff_focus_timer_started", false)) {
			setTimeout(function() {
				self.determine_ff_focus_state()
			}, 1000);
			this.prefs.set("ff_focus_timer_started", true);
		}
	},
	
	blur: function(e) {
		this.prefs.set("new_ff_is_in_focus", false);
		this.prefs.set("ff_blur_time", _dbify_date(new Date()));
		
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
		
		/*logger("determine_ff_focus_state timer_started="+this.prefs.get("ff_focus_timer_started", false)+
				" new ff state="+new_ff_state+
				"     ff state="+ff_state);
		*/
		
		if (ff_state != new_ff_state) {
			this.prefs.set("ff_is_in_focus", new_ff_state);
			if (new_ff_state) {
				var url = this.prefs.get("saved_focus_last_url", "");
				if (IDLE_LOGGING) logger("focus last_url="+this.prefs.get("last_url", "")+
						"\n focus_url="+this.prefs.get("saved_focus_last_url", "-"));
				if (url) {
					this.prefs.set("saved_focus_last_url", "");
					this.time_tracker.start_recording(url, this.pddb.Visit.FOCUS);
				}
			} else {
				var last_url = this.prefs.get("last_url", "");
				if (IDLE_LOGGING) logger("blur last_url="+this.prefs.get("last_url", "")+
						"\n focus_url="+this.prefs.get("saved_focus_last_url", "-"));
				
				if (last_url) {
					this.prefs.set("saved_focus_last_url", last_url);
					this.time_tracker.stop_recording(this.pddb.Visit.BLUR);
				}
			}
		}
	},
});

/**
 * 
 */
var SleepWakeListener = function SleepWakeListener(observerService, pddb, prefs, time_tracker) {
	this.observerService = observerService;
	this.pddb = pddb;
	this.prefs = prefs;
	this.time_tracker = time_tracker;
	
	this.register();
};
SleepWakeListener.prototype = {};
_extend(SleepWakeListener.prototype, {
	register: function() {
		this.observerService.addObserver(this, "sleep_notification", false);
		this.observerService.addObserver(this, "wake_notification", false);
	},
	
	unregister: function() {
		this.observerService.removeObserver(this, "sleep_notification", false);
		this.observerService.removeObserver(this, "wake_notification", false);
	},
	
	observe: function(subject, topic, data) {
		if (topic == "sleep_notification") {
			this.sleep();
		} else if (topic == "wake_notification") {
			this.wake();
		}
	},
	
	sleep: function() {
		logger("sleep at date "+(new Date())+
				"\n last_url "+this.prefs.get('last_url', '')+
				"\n sleep_url"+this.prefs.get('sleep_url', ''));
		var last_url = this.prefs.get("last_url", "");
		if (last_url) {
			this.prefs.set("saved_sleep_last_url", last_url); 
			this.time_tracker.stop_recording(this.pddb.Visit.SLEEP);
		}
	},
	
	wake: function(subject, topic, data) {
		logger("wake at date "+(new Date())+
				"\n last_url "+this.prefs.get('last_url', '')+
				"\n sleep_url"+this.prefs.get('sleep_url', ''));
		if (this.prefs.get("ff_is_in_focus", "")) {
			// we want to check this because maybe we start_recording
			// before back is called, in which case, we don't
			// want to do anything.
			var url = this.prefs.get("saved_sleep_last_url", "");
			if (url) {
				this.prefs.set("saved_sleep_last_url", "");
				this.time_tracker.start_recording(url, this.pddb.Visit.WAKE);
			}
		}
	},
});
