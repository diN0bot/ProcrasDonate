
/**
 * handles 'views' for browser-generated ProcrasDonate.com pages
 * @param prefs
 * @param pddb
 * @return
 */
var Controller = function(pddb, prefs, pd_api) {
	this.pddb = pddb;
	this.prefs = prefs;
	this.pd_api = pd_api;
	this.page = new PageController(this.pddb, this.prefs, this.pd_api);
};

Controller.prototype = {};
_extend(Controller.prototype, {
	handle: function(request) {
		var host = _host(request.url);
		
		// insert top bar
		//    if visiting first ProcrasDonate website of the day
		if (!this.prefs.get("inserted_top_bar_today", false)) {
			if (this.page.top_bar_has_content()) {
				var sitegroup = this.pddb.SiteGroup.get_from_url(request.url);
				if (sitegroup) {
					if (sitegroup.tag_id == this.pddb.ProcrasDonate.id) {
						this.page.insert_top_bar(request);
						this.page.activate_top_bar(request);
						this.prefs.set("inserted_top_bar_today", true)
					}
				}
			}
		}
		
		// create ProcrasDonate extension website
		if (host == constants.PD_HOST) { //match(new RegExp(valid_host)))
			return this.pd_dispatch_by_url(request);
		}
		return false;
	},
	
	insert_based_on_state: function(request, state_name, default_state, state_enums, event_inserts) {
		/* Calls appropriate insert method based on current state
		 * 
		 * @param state_name: string. one of 'settings', 'register' or 'impact
		 * @param state_enums: array. state enumeration. one of 'constants.SETTINGS_STATE_ENUM',
		 * 		'constants.REGISTER_STATE_ENUM' or 'constants.IMPACT_STATE_ENUM'
		 * @param event_inserts: array. functions corresponding to enums. one of
		 * 		'constants.SETTINGS_STATE_INSERTS', 'constants.IMPACT_STATE_INSERTS', 'constants.REGISTER_STATE_INSERTS'
		 */
		request.jQuery("#"+state_name+"_menu_item").addClass("here_we_are");
		
		this.prefs.set('site_classifications_settings_activated', true);
		for (var i = 0; i < state_enums.length; i += 1) {
			var state = state_enums[i];
			if ( this.prefs.get(state_name + '_state', '') == state ) {
				this.page[event_inserts[i]](request);
				return true;
			}
		}
		// substate did not match!!
		// set to default
		this.prefs.set(state_name + '_state', default_state);
		this.insert_based_on_state(request, state_name, default_state, state_enums, event_inserts); 
		return false;
	},
	
	pd_dispatch_by_url: function(request) {
		//logger("pd_dispatch_by_url: "+ request.url);
		var ret = true; 
		this.page.default_inserts(request);
		
		var path = request.url.match(new RegExp("https?:\/\/[^/]+(.*)"))
		switch (path[1]) {
		case constants.REGISTER_URL:
			this.insert_based_on_state(
				request,
				'register',
				constants.DEFAULT_REGISTER_STATE,
				constants.REGISTER_STATE_ENUM, 
				constants.REGISTER_STATE_INSERTS);
			break;
		case constants.SETTINGS_URL:
			this.insert_based_on_state(
				request,
				'settings', 
				constants.DEFAULT_SETTINGS_STATE,
				constants.SETTINGS_STATE_ENUM, 
				constants.SETTINGS_STATE_INSERTS);
			break;
		case constants.IMPACT_URL:
			this.insert_based_on_state(
				request,
				'impact', 
				constants.DEFAULT_IMPACT_STATE,
				constants.IMPACT_STATE_ENUM, 
				constants.IMPACT_STATE_INSERTS);
			break;
		case constants.PROGRESS_URL:
			this.insert_based_on_state(
				request,
				'progress', 
				constants.DEFAULT_PROGRESS_STATE,
				constants.PROGRESS_STATE_ENUM, 
				constants.PROGRESS_STATE_INSERTS);
			break;
		case constants.MESSAGES_URL:
			this.insert_based_on_state(
				request,
				'messages', 
				constants.DEFAULT_MESSAGES_STATE,
				constants.MESSAGES_STATE_ENUM, 
				constants.MESSAGES_STATE_INSERTS);
			break;
		case constants.TWS_SETTINGS_URL:
			this.page.insert_register_time_well_spent(request);
			break;
		case constants.HOME_URL:
			this.page.handle_home_url(request);
			break;
		case constants.SPLASH_URL:
			break;
		case constants.MANUAL_TEST_SUITE_URL:
			this.page.manual_test_suite(request);
			break;
		case constants.AUTOMATIC_TEST_SUITE_URL:
			this.page.automatic_test_suite(request, false);
			break;
		case constants.AUTOTESTER_TEST_SUITE_URL:
			this.page.automatic_test_suite(request, true);
			break;
		case constants.TIMING_TEST_SUITE_URL:
			this.page.timing_test_suite(request);
			break;
		case constants.VISUAL_DEBUG_URL:
			this.page.visual_debug(request);
			break;
		case constants.AUTHORIZE_PAYMENTS:
			break;
		case constants.AUTHORIZE_PAYMENTS_CALLBACK_URL:
			break;
		case constants.ADMIN_URL:
			this.page.insert_top_bar(request);
			this.page.activate_top_bar(request);
			break;
		default:
			ret = false;
			//logger("Unknown ProcrasDonate URL: " + request.url);
		}
		this.page.insert_user_messages(request);
		return ret;
	},
	
	check_page_inserts: function() {
		/*
		 * Insert data into matching webpage
		 *    (localhost:8000 or procrasdonate.com)
		 * See constants.PD_HOST in global constants at top of page.
		 */
		var url = _href();
		//var host = _host(href);
		this.dispatch_by_host(url);
	},
	
	STATE_DEFAULTS: {
		settings_state: constants.DEFAULT_SETTINGS_STATE,
		progress_state: constants.DEFAULT_PROGRESS_STATE,
		messages_state: constants.DEFAULT_MESSAGES_STATE,
		impact_state: constants.DEFAULT_IMPACT_STATE,
		register_state: constants.DEFAULT_REGISTER_STATE,
	},
	
	initialize_state: function() {
		this.initialize_account_defaults_if_necessary();
		this.initialize_state_if_necessary();
		//this.initialize_data_flow_state_if_necessary();
	},
	
	initialize_data_flow_state_if_necessary: function() {
		// This state is necessary for correctly synching data between
		// this extension, TipJoy and ProcrasDonate.
		// Synching does not depend on 24hr or weekly cycle settings. woot!!
		// Synching is triggered by those cycles, but the data to synch
		// is found using the following state
		var flow_state = ['last_tipjoy_id_sent_to_tipjoy',
		                  'last_paid_tipjoy_id_sent_to_pd',
		                  'last_pledge_tipjoy_id',
		                  'last_total_time_sent_to_pd'];
		for (var i = 0; i < flow_state.length; i++) {
			if ( !this.prefs.get(flow_state[i], false) ) {
				this.prefs.set(flow_state[i], false);
			}
		}
	},
	
	initialize_state_if_necessary: function() {
		logger("initialize_state_if_necessary()");
		/*
		 * Initialize settings and impact state enumerations. Other inits?
		 */
		var self = this;
		_iterate(this.STATE_DEFAULTS, function(name, value) {
			//logger("state defaults: "+name+" "+value);
			if (!self.prefs.get(name, ''))
				return self.prefs.set(name, value);
		});
		
		var last_24hr_mark = this.prefs.get("last_24hr_mark", "");
		if (!last_24hr_mark) {
			
			function get_semi_random_date() {
				/* @returns: Date object for current day */
				//// Math.floor(Math.random()*X) generates random ints, x: 0 <= x < X
				// wanted to distribute roll-over times so don't hose server. 
				// DO NOT NEED to correlate this with end_of_day and end_of_week times
				// in pddb.Totals objects. 
				var d = _start_of_day();
				d.setHours(0);
				d.setMinutes(Math.floor(Math.random()*60));
				d.setSeconds(Math.floor(Math.random()*60));
				if (d > new Date()) {
					d.setHours(d.getHours() - 24);
				}
				return d;
			}
			
			last_24hr_mark = _dbify_date( get_semi_random_date() );
			this.prefs.set("last_24hr_mark", last_24hr_mark);
		}
		
		var last_week_mark = this.prefs.get("last_week_mark", "");
		if (!last_week_mark) {
			this.prefs.set("last_week_mark", last_24hr_mark);
		}
	},
	
	ACCOUNT_DEFAULTS: {
		twitter_username: constants.DEFAULT_USERNAME,
		twitter_password: constants.DEFAULT_PASSWORD,
		email: constants.DEFAULT_EMAIL,
		procrasdonate_reason: constants.DEFAULT_PROCRASDONATE_REASON,
		timewellspent_reason: constants.DEFAULT_TIMEWELLSPENT_REASON,
		pd_dollars_per_hr: constants.DEFAULT_PD_DOLLARS_PER_HR,
		pd_hr_per_week_goal: constants.DEFAULT_PD_HR_PER_WEEK_GOAL,
		pd_hr_per_week_max: constants.DEFAULT_PD_HR_PER_WEEK_MAX,
		tws_dollars_per_hr: constants.DEFAULT_TWS_DOLLARS_PER_HR,
		tws_hr_per_week_goal: constants.DEFAULT_TWS_HR_PER_WEEK_GOAL,
		tws_hr_per_week_max: constants.DEFAULT_TWS_HR_PER_WEEK_MAX,
		support_pct: constants.DEFAULT_SUPPORT_PCT,
		monthly_fee: constants.DEFAULT_MONTHLY_FEE,
		tos: false,
		
		global_amount_limit: constants.DEFAULT_GLOBAL_AMOUNT_LIMIT,
		credit_limit: constants.DEFAULT_CREDIT_LIMIT,
		fps_cbui_version: constants.DEFAULT_FPS_CBUI_VERSION,
		fps_api_version: constants.DEFAULT_FPS_API_VERSION,
		payment_reason: constants.DEFAULT_PAYMENT_REASON,
	
	},
	
	initialize_account_defaults_if_necessary: function() {
		logger("initialize_account_defaults_if_necessary()");
		/*
		 * Set any blank account data to defaults.
		 */
		var self = this;
		_iterate(this.ACCOUNT_DEFAULTS, function init(name, value) {
			//logger("account defaults: "+name+" "+value);
			if (!self.prefs.get(name, ''))
				return self.prefs.set(name, value);
		});
	},

	reset_account_to_defaults: function() {
		/*
		 * Overwrite existing data (if any) with account defaults
		 */
		var self = this;
		_iterate(this.ACCOUNT_DEFAULTS, function init(name, value) {
			self.prefs.set(name, value);
		});
	},
	
	reset_state_to_defaults: function() {
		/*
		 * Overwrite existing data (if any) with state defaults
		 */
		var self = this;
		_iterate(this.STATE_DEFAULTS, function init(name, value) {
			//logger("SET STATE: name:"+name+", value:"+value);
			self.prefs.set(name, value);
		});
	},
});

/**
 * views
 * 
 * @param pddb
 * @param prefs
 * @return
 */
function PageController(pddb, prefs, pd_api) {
	this.pddb = pddb;
	this.prefs = prefs;
	this.pd_api = pd_api;
	
	// for dev testing. eventually, schedule could contain state so that
	// the real scheduler and the dev scheduler diverged (eg, shorter (mutable) cycles)
	this.schedule = new Schedule(pddb, prefs, pd_api);
}
PageController.prototype = {};
_extend(PageController.prototype, {
	
	default_inserts: function(request) {
	
		// add private menu items
		var private_menu = ["<div id=\"ExtensionMenu\" class=\"menu\">",
		       			 	"    <div id=\"progress_menu_item\"><a href=\""+
		       			 	constants.PROGRESS_URL+"\">My Progress</a></div>",
		       			 	"    <div id=\"messages_menu_item\"><a href=\""+
		       			 	constants.MESSAGES_URL+"\">My Messages</a></div>",
		       			 	"    <div id=\"impact_menu_item\"><a href=\""+
		       			 	constants.IMPACT_URL+"\">My Impact</a></div>",
		       			 	"    <div id=\"settings_menu_item\"><a href=\""+
		       			 	constants.SETTINGS_URL+"\">My Settings</a></div>",
		       			 	"</div>"].join("\n");
		
		if (request.jQuery("#MainMenu").length > 0) {
			// insert above Main Menu in left column
			request.jQuery("#MainMenu").before( private_menu );
		} else {
			// replace splash page's download button
			request.jQuery("#download_wrapper").html( private_menu );
			request.jQuery("#focus_slogan_line1").remove();
			request.jQuery("#focus_slogan_line2").remove();
		}
	
		if (!this.registration_complete()) {
			request.jQuery("#settings_menu_item")
				.attr("id", "register_menu_item")
				.children("a")
					.attr("href", constants.REGISTER_URL)
					.text("Not Done Registering");
		}
		
		// remove top download button
		request.jQuery("#download_top_button").remove();
	},
	
	registration_complete: function() {
		var reg_done = this.prefs.get('registration_done', false);
		var tos_accepted = this.prefs.get('tos', false);
		return reg_done && tos_accepted;
	},
	
	insert_user_messages: function(request) {
		var self = this;
		var message = self.prefs.get("user_message", "");
		if (message) {
			var html = Template.get("user_messages").render(
					new Context({
						message: message
					}));
						
			request.jQuery("#user_messages_wrapper").html( html ).hide().fadeIn("slow");
			self.prefs.set("user_message", "");
		}
	},
	
	/**
	 * returns true if top bar would have content; false if would be empty
	 */
	top_bar_has_content: function() {
		var latest = this.pddb.Report.latest();
		return latest && !latest.is_read()
	},
	
	/**
	 * does insertion and activation of top bar
	 */
	insert_top_bar: function(request) {
		var self = this;
		var html = Template.get("top_bar").render(
			new Context({
				latest_report: self.pddb.Report.latest(),
				registration_complete: this.registration_complete
			}));
		
		request.jQuery("body").prepend( html );
		
		// activate
		request.jQuery("#close_procrasdonate_extn_top_bar").click(function() {
			request.jQuery(this).parent().remove();
		});
	},
	
	activate_top_bar: function(request) {
		var self = this;
		request.jQuery("#procrasdonate_extn_expand").click(function() {
			if (request.jQuery(this).hasClass("contracted")) {
				var latest = self.pddb.Report.latest();
				request.jQuery("#procrasdonate_extn_message").html(
						latest.message).css("text-align", "left");
				request.jQuery("#procrasdonate_extn_top_bar").css("height", "auto");
				request.jQuery(this)
					.removeClass("contracted")
					.attr("src", constants.PD_URL+constants.MEDIA_URL+"img/ContractButton.png");
				self.pddb.Report.set({ read: _dbify_bool(true)}, { id: latest.id });
			} else {
				request.jQuery(this)
					.addClass("contracted")
					.attr("src", constants.PD_URL+constants.MEDIA_URL+"img/ExpandButton.png");
				request.jQuery("#procrasdonate_extn_message").html("");
				request.jQuery("#procrasdonate_extn_top_bar").css("height", "24px");
			}
		});
	},
	
	/*************************************************************************/
	/***************************** VIEW UTILS ********************************/
	
	/*
	 * @param: images: may be undefined
	 * @return: dictionary of:
	 * 		menu_items: list of (id, klasses, value) tuples for substate menu
	 *          id is "substate_tab_"+enums[index]
	 *          value is tab_names[index]
	 *          klasses is ["substate_tab", "current_tab"]<---if current tab
	 *      next: tuple of next tab or null
	 *      prev: tuple of prev tab or null
	 */
	make_substate_menu_items: function(current_substate, enums, tab_names, images) {
		var menu_items = [];
		var prev = null;
		var next = null;
		
		var _last = null;
		var _one_past_current = false;
		var _two_past_current = false; // because can't tell the difference bw nulls
		_iterate(tab_names, function(key, value, index) {
			// figure out menu item
			var klasses = ["substate_tab"];
			if (enums[index] == current_substate) {
				klasses.push("current_tab");
			} else if (!_one_past_current) {
				klasses.push("past");
			} else {
				klasses.push("future");
			}
			
			var img = "";
			var bar = "";
			if (enums[index] == current_substate) {
				if (images) {
					if (images[index].selected) {
						img = constants.MEDIA_URL+"img/"+images[index].selected;
					} else {
						img = constants.MEDIA_URL+"img/"+images[index].past;
					}
				} else {
					img = constants.MEDIA_URL+"img/StepCircle"+(index+1)+"Done.png";
				}
				bar = constants.MEDIA_URL+"img/Dash.png";
				
			} else if (!_one_past_current) {
				if (images) {
					img = constants.MEDIA_URL+"img/"+images[index].past;
				} else {
					img = constants.MEDIA_URL+"img/StepCircle"+(index+1)+"Done.png";
				}
				bar = constants.MEDIA_URL+"img/Dash.png";
				
			} else {
				if (images) {
					if (images[index].future) {
						img = constants.MEDIA_URL+"img/"+images[index].future;
					} else {
						img = constants.MEDIA_URL+"img/"+images[index].past;
					}
				} else {
					img = constants.MEDIA_URL+"img/StepCircle"+(index+1)+".png";
				}
				bar = constants.MEDIA_URL+"img/DashGreen.png";
			}
				
			var menu_item = {
				id: "substate_tab_"+enums[index],
				klasses: klasses,
				value: value,
				img: img,
				bar: bar
			}
			// set next
			if (_one_past_current && !_two_past_current) {
				next = menu_item;
				_two_past_current = true
			}
			// set prev
			if (enums[index] == current_substate) {
				_one_past_current = true;
				prev = _last;
			}
			// add to menu items
			if (value != "XXX" && value != "XXXX") {
				menu_items.push(menu_item);
			}
			_last = menu_item;
		});
		return {
			menu_items: menu_items,
			next: next,
			prev: prev
		}
	},
	
	activate_substate_menu_items: function(request, current_substate, enums, inserts, processors) {
		var self = this;
		_iterate(enums, function(key, substate, index) {
			if (processors) {
				request.jQuery("#substate_tab_"+substate+", .substate_tab_"+substate).click(
					self._process(current_substate, enums, processors, inserts[index], request)
				);
			} else {
				request.jQuery("#substate_tab_"+substate+", .substate_tab_"+substate).click(
					self._proceed(inserts[index], request)
				);
			}
		});
	},
	
	_process: function(current_substate, enums, processors, event, request) {
		var self = this;
		return function() {
			_iterate(enums, function(key, substate, index) {
				if (substate == current_substate) {
					var success = self[processors[index]](request, event);
					if (success) {
						self[event](request);
					}
				}
			});
		};
	},
	
	/// necessary because when did direct closure
	/// (function(event) { return event; })(self[event])
	// .click(
	//     (function(event) { return event; })(self[event])
	// )
	/// called functions had incorrect this
	_proceed: function(event, request) {
		var self = this;
		return function() {
			//self[fnname].apply(self, args);
			self[event](request);
		};
	},
	
	retrieve_float_for_display: function(key, def) {
		return _un_prefify_float( this.prefs.get(key, def) ).toFixed(2)
	},
	
	retrieve_percent_for_display: function(key, def) {
		return (_un_prefify_float( this.prefs.get(key, def) ) * 100).toFixed(2)
	},
	
	validate_positive_float_input: function(v) {
		try {
			return parseFloat(v) >= 0
		} catch(e) {
			return false
		}
	},
	
	validate_dollars_input: function(v) {
		return parseFloat(v) >= 0
		
		var max = 20;
		if ( dollars >= 0 && dollars <= max )
			return true;
		
		if ( dollars >= max ) {
			var confirm_results = confirm("Do you really want to donate $" + dollars + " every hour you spend procrastinating up to your daily limit?");
			if ( confirm_results ) {
				return true;
			} else {
				return false;
			}
		}
		return false;
	},
	
	validate_hours_input: function(v) {
		var hours = parseFloat(v);
		if ( hours >= 0 )
			return true;
		else
			return false;
	},
	
	clean_dollars_input: function(v) {
		return _prefify_float(v);
	},
	
	clean_hours_input: function(v) {
		return _prefify_float(v);
	},
	
	clean_positive_float_input: function(v) {
		return _prefify_float(v);
	},
	
	clean_percent_input: function(v) {
		var f = parseFloat(v);
		return _prefify_float(f / 100.00);
	},
	
	validate_string: function(v) {
		return v && v != ''
	},

	/*************************************************************************/
	/******************************* MISC VIEWS ********************************/

	handle_home_url: function(request) {
		var unsafeWin = request.get_unsafeContentWin();//event.target.defaultView;
		if (unsafeWin.wrappedJSObject) {
			unsafeWin = unsafeWin.wrappedJSObject;
		}
		new XPCNativeWrapper(unsafeWin, "location").location = constants.PD_URL + constants.PROGRESS_URL;	
	},

	/*************************************************************************/
	/******************************* SETTINGS ********************************/

	/**
	 * @return {
	 *     currently_authorized: bool, // True if currently authorized to make payments
	 *     authorization_expired: bool, // True if was authorized but expired
	 *     months: int 
	 * }
	 * months is number of months until reauthorization is necessary, 
	 * or 0 if expired or not authorized
	 */
	months_before_reauth: function() {
		var self = this;
		var currently_authorized = false;
		var authorization_expired = false;
		var months = 0;
		var multi_auth = this.pddb.FPSMultiuseAuthorization.most_recent();
		if (multi_auth) {
			if (multi_auth.good_to_go()) {
				currently_authorized = true;
				if (multi_auth.expiry && multi_auth.expiry.split("/").length == 2) {
					var expiry = multi_auth.expiry.split("/");
					var exp_year = parseInt(expiry[1]);
					var exp_month = parseInt(expiry[1]);
					var now = new Date();
					var now_year = now.getFullYear();
					var now_month = now.getMonth() + 1;
					// check if expired, and set status bit if expired
					if (exp_year < now_year || (exp_year == now_year && exp_month <= now_month)) {
						self.pddb.FPSMultiuseAuthorization.set({
							status: 'EX'
						}, {
							id: multi_auth.id
						});
						authorization_expired = true;
						currently_authorized = true;
						months = "Authorization has expired. <a href=\""+constants.REGISTER_URL+"\" class=\"reauthorize\">Please authorize</a>";
					} else {
						var min_auth_months = _un_prefify_float(self.prefs.get('min_auth_time', constants.DEFAULT_MIN_AUTH_TIME));
						var then = _un_dbify_date(multi_auth.timestamp);
						var months_since_then = (now.getFullYear() - then.getFullYear())*12 + (now.getMonth() - then.getMonth());
						
						if (months_since_then > min_auth_months) {
							// exceeded the number of months user allocated for auth
							// but....we don't care if there's still money left...
						}
						
						var amount_paid_against_multi_auth = 0.0;
						self.pddb.Payment.select({datetime__gte: multi_auth.timestamp}, function(row) {
							amount_paid_against_multi_auth += parseFloat(row.total_amount_paid);
						});
						
						if (amount_paid_against_multi_auth >= parseFloat(multi_auth.global_amount_limit)) {
							// expired because payments exceed global_amount_limit
							// ?? we probably already ran into this when trying to make payments
							//   what we want to do is predict how many months are left based on
							//   payments already made.
							self.pddb.FPSMultiuseAuthorization.set({
								status: 'EX'
							}, {
								id: multi_auth.id
							});
							authorization_expired = true;
							currently_authorized = true;
							months = "Authorization has expired. <a href=\""+constants.REGISTER_URL+"\" class=\"reauthorize\">Please authorize</a>";
						} else {
							// again, we probably want to predict since right now this is based on fulfilling limit each week.
							months = min_auth_months - months_since_then;
						}
					}
				} else {
					months = "unknown"
				}
			} else if (multi_auth.expired()) {
				authorization_expired = true;
				months = "Authorization has expired. <a href=\""+constants.REGISTER_URL+"\" class=\"reauthorize\">Please authorize</a>";
			} else {
				months = "Unsuccessful authorization attempts. <a href=\""+constants.REGISTER_URL+"\" class=\"reauthorize\">Please authorize</a>";
			}
		} else {
			months = "Not autohrized yet. <a href=\""+constants.REGISTER_URL+"\" class=\"reauthorize\">Please authorize</a>";
		}
		return {
			currently_authorized: currently_authorized,
			authorization_expired: authorization_expired,
			months: months
		}
	},
	
	insert_settings_overview: function(request) {
		var self = this;
		this.prefs.set('settings_state', 'overview');
		
		var substate_menu_items = this.make_substate_menu_items('overview',
			constants.SETTINGS_STATE_ENUM, constants.SETTINGS_STATE_TAB_NAMES);
		
		var recipient_percents = [];
		self.pddb.RecipientPercent.select({}, function(row) {
			recipient_percents.push(row);
		});
		
		var estimated_months_before_reauth = this.months_before_reauth();
		
		var middle = Template.get("settings_overview_middle").render(
			new Context({
				substate_menu_items: substate_menu_items,
				
				recipient_percents: recipient_percents,
				estimated_months_before_reauth: estimated_months_before_reauth,
				
				pd_hr_per_week_goal: self.retrieve_float_for_display("pd_hr_per_week_goal", constants.DEFAULT_PD_HR_PER_WEEK_GOAL),
				pd_dollars_per_hr: self.retrieve_float_for_display("pd_dollars_per_hr", constants.DEFAULT_PD_DOLLARS_PER_HR),
				pd_hr_per_week_max: self.retrieve_float_for_display("pd_hr_per_week_max", constants.DEFAULT_PD_HR_PER_WEEK_MAX),
				
				tws_hr_per_week_goal: self.retrieve_float_for_display("tws_hr_per_week_goal", constants.DEFAULT_TWS_HR_PER_WEEK_MAX),
				tws_dollars_per_hr: self.retrieve_float_for_display("tws_dollars_per_hr", constants.DEFAULT_TWS_DOLLARS_PER_HR),
				tws_hr_per_week_max: self.retrieve_float_for_display("tws_hr_per_week_max", constants.DEFAULT_TWS_HR_PER_WEEK_MAX),
				
				monthly_fee: self.retrieve_float_for_display('monthly_fee', constants.DEFAULT_MONTHLY_FEE),
				support_pct: self.retrieve_percent_for_display('support_pct', constants.DEFAULT_SUPPORT_PCT),
				
				email: self.prefs.get('email', constants.DEFAULT_EMAIL),
				weekly_affirmations: _un_dbify_bool(self.prefs.get('weekly_affirmations', constants.DEFAULT_WEEKLY_AFFIRMATIONS)),
				org_thank_yous: _un_dbify_bool(self.prefs.get('org_thank_yous', constants.DEFAULT_ORG_THANK_YOUS)),
				org_newsletters: _un_dbify_bool(self.prefs.get('org_newsletters', constants.DEFAULT_ORG_NEWSLETTERS)),
			})
		);
		request.jQuery("#content").html( middle );
		
		this.activate_settings_overview(request);
		
		this.activate_substate_menu_items(request, 'overview',
			constants.SETTINGS_STATE_ENUM, constants.SETTINGS_STATE_INSERTS, constants.SETTINGS_STATE_PROCESSORS);
		
		this.insert_example_gauges(request);
	},
	
	activate_settings_overview: function(request) {
		var self = this;
		
		request.jQuery(".reauthorize").addClass("link").click(function() {
			self.prefs.set('register_state', 'payments');
		});
		
		request.jQuery(".choose_charities").addClass("link").click(function() {
			self.prefs.set('register_state', 'charities');
		});
		
		/*request.jQuery(".choose_charities").addClass("link").click(function() {
			self.prefs.set('register_state', 'time_well_spent');
		});*/
		
		function arrow_click(arrow_id, diff) {
			request.jQuery(arrow_id)
				.css("cursor", "pointer")
				.click(function(e) {
					var item = request.jQuery(this).siblings(".thevalue");
					var id = item.attr("id");
					item.append(" "+id+" ");
					var value = _un_prefify_float( self.prefs.get(id, null) );
					if (value != null) {
						var new_value;
						if (item.siblings(".units").text() == "%") {
							new_value = value + (diff/100.0);
						} else {
							new_value = value + diff;
						}
						if (new_value < 0) new_value = 0.0;
						if (item.siblings(".units").text() == "%") {
							// toFixed returns a string not float!!
							x = new_value.toFixed(4);
							self.prefs.set(id, x);
							new_value = new_value * 100.0;
						} else {
							self.prefs.set(id, _prefify_float(new_value));
						}
						item.text(new_value.toFixed(2));
						item.siblings(".error").text("");
					} else {
						item.siblings(".error").text("ERROR");
					}
					self.insert_example_gauges(request);
				});
		}
		
		function arrow_click2(id, dir_class, diff) {
			var init_delay = 500;
			var delay = init_delay;
			var timer_id = null;
			var timer_running = false;
			var elem = request.jQuery("#"+id);
			
			function do_change() {
				var item = elem;
				var id = item.attr("id");
				//item.append(" "+id+" ");
				var value = _un_prefify_float( self.prefs.get(id, null) );
				//logger("do change ____ "+item.attr("class")+"."+item.attr("id")+"."+id+" = "+value);
				if (!isNaN(value) && value != null) {
					var new_value;
					if (item.siblings(".units").text() == "%") {
						new_value = value + (diff/100.0);
					} else {
						new_value = value + diff;
					}
					//logger(" new value = "+new_value);
					if (new_value < 0) new_value = 0.0;
					if (item.siblings(".units").text() == "%") {
						// toFixed returns a string not float!!
						x = new_value.toFixed(4);
						self.prefs.set(id, x);
						new_value = new_value * 100.0;
					} else {
						self.prefs.set(id, _prefify_float(new_value));
					}
					item.text(new_value.toFixed(2));
					//logger(" item text: "+(new_value.toFixed(2))+" actual = "+item.text());
					item.siblings(".error").text("");
				} else {
					item.siblings(".error").text("ERROR");
				}
			}
			
			elem.siblings(dir_class)
				.mousedown(function(e) {
					timer_running = true;
					change_do_change();
				})
				.css("cursor", "pointer");
			
			request.jQuery(request.get_document())
				.mouseup(function(e) {
					// we want to clear every timer_id that gets created
					timer_running = false;
					clearTimeout(timer_id);
					delay = init_delay;
					self.insert_example_gauges(request);
				});
			
			function change_do_change() {
				//logger("CHANGE DO CHANGE "+timer_running+" "+delay);
				if (timer_running) {
					do_change();
					if (delay > 100) { delay = delay * .80; }
					timer_id = setTimeout(change_do_change, delay);
				}
			}
		}

		request.jQuery(".up_arrow").each(function() {
			arrow_click2(request.jQuery(this).siblings(".thevalue").attr("id"), ".up_arrow", 0.25);
		});
		request.jQuery(".down_arrow").each(function() {
			arrow_click2(request.jQuery(this).siblings(".thevalue").attr("id"), ".down_arrow", -0.25);
		});
		
		request.jQuery("input[type=checkbox]").click(function() {
			var item = request.jQuery(this);
			var pref = item.attr("id");
			self.prefs.set(pref, item.attr("checked"));
		});
		
		request.jQuery("#email").keyup(function() {
			self.prefs.set('email', request.jQuery(this).attr("value"));
		});
	},
	
	/*************************************************************************/
	/******************************** IMPACT *********************************/
	
	insert_impact_totals: function(request) {
		/*
		 * Iterate through all RequiresPayment to determine pledges.
		 * Iterate through all Payment to determine paid.
		 *  -> put in right bucket based on _end_of_year( datetime )
		 */
		
		var self = this;
		this.prefs.set('impact_state', 'totals');
		
		var substate_menu_items = this.make_substate_menu_items('totals',
			constants.IMPACT_STATE_ENUM, constants.IMPACT_STATE_TAB_NAMES);

		var end_of_year = _end_of_year();
		var end_of_last_year = _end_of_last_year();
		
		var pledges_taxdeduct = 0.0;
		var pledges_not = 0.0;

		var payments_taxdeduct = {
				total: 0.0,
				end_of_year: 0.0,
				end_of_last_year: 0.0};
		
		var payments_not = {
				total: 0.0,
				end_of_year: 0.0,
				end_of_last_year: 0.0};
		
		this.pddb.RequiresPayment.select({}, function(row) {
			var total = row.total();
			var sitegroup = total.sitegroup();
			var recipient = total.recipient();
			if (!sitegroup && !recipient) {
				self.pddb.orthogonals.warn("Expected RequiresPayment for sitegroup or recipient. Found this instead: "+total+" requires_payment: "+row);
				return
			}

			if (total.content().has_tax_exempt_status()) {
				pledges_taxdeduct += total.dollars();
			} else {
				pledges_not += total.dollars();
			}
		});
		
		/* todo for Payment
		this.pddb.RequiresPayment.select({}, function(row) {
			var total = row.total();
			var date_idx = _end_of_year( _un_dbify_date(total.datetime) );
			var sitegroup = total.sitegroup();
			var recipient = total.recipient();
			if (!sitegroup && !recipient) {
				self.pddb.orthogonals.warn("Expected RequiresPayment for sitegroup or recipient. Found this instead: "+total+" requires_payment: "+row);
				return
			}
			var d = taxdeduct_total_amounts;
			if (!total.content().has_tax_exempt_status()) {
				d = NOT_taxdeduct_total_amounts;
			}
			if (!d[date_idx]) { d[date_idx] = 0.0; }
			d[date_idx] += total.dollars();
		});
		 */

		var table_headers = ["Recipients",
		                     "Current Pledges",
		                     _end_of_year().strftime("%Y Donations To Date"),
		                     _end_of_last_year().strftime("%Y All Donations"),
		                     "All Time Donations"];
		var table_rows = [
			["Total, tax-deductible recipients",
			 pledges_taxdeduct,
			 payments_taxdeduct[end_of_year],
			 payments_taxdeduct[end_of_last_year],
			 payments_taxdeduct.total
			],
			 
		    ["Total, other recipients",
		     pledges_not,
		     payments_not[end_of_year],
			 payments_not[end_of_last_year],
			 payments_not.total
			],
		];
		table_rows.push([
		    "Combined total of all recipients",
		    table_rows[0][1] + table_rows[1][1],
		    table_rows[0][2] + table_rows[1][2],
		    table_rows[0][3] + table_rows[1][3],
		    table_rows[0][4] + table_rows[1][4]
		]);
		
		_iterate(table_rows, function(k1, row, i1) {
			_iterate(row, function(k2, cell, i2) {
				if (isNumber(cell)) {
					var amt = cell.toFixed(2);
					if (amt > 0) {
						table_rows[i1][i2] = "$"+cell.toFixed(2);
					} else {
						table_rows[i1][i2] = "-";
					}
				}
			});
		});
		
		var middle = Template.get("impact_middle").render(
			new Context({
				substate_menu_items: substate_menu_items,
				table_headers: table_headers,
				table_rows: table_rows
			})
		);
		request.jQuery("#content").html( middle );
		
		this.activate_substate_menu_items(request, 'totals',
			constants.IMPACT_STATE_ENUM, constants.IMPACT_STATE_INSERTS);
	},
	
	_insert_impact_per_item: function(request, substate, filter_fn) {
		var self = this;
		this.prefs.set('impact_state', substate);
		
		var substate_menu_items = this.make_substate_menu_items(substate,
			constants.IMPACT_STATE_ENUM, constants.IMPACT_STATE_TAB_NAMES);

		var recipient_contenttype = self.pddb.ContentType.get_or_null({ modelname: "Recipient" });
		var sitegroup_contenttype = self.pddb.ContentType.get_or_null({ modelname: "SiteGroup" });

		var end_of_year = _end_of_year();
		var end_of_last_year = _end_of_last_year();
		
		var row_data = {};
		// total is _paid_ today, and thus sum of years data. excludes pledges. 
		//{
		//	 r: { slug: { name: "", logo: "", pledge: 0.0, total: 0.0, end_of_year: 0.0, end_of_last_year: 0.0, ... }, ... }
		//	sg: { host: { pledge: 0.0, total: 0.0, end_of_year: 0.0, end_of_last_year: 0.0, ... }, ... }
		//}
		row_data[recipient_contenttype.id] = {};
		row_data[sitegroup_contenttype.id] = {};
		
		this.pddb.RequiresPayment.select({}, function(row) {
			var total = row.total();
			
			if (filter_fn(total)) {
				var date_idx = _end_of_year( _un_dbify_date(total.datetime) );
				var sitegroup = total.sitegroup();
				var recipient = total.recipient();
				
				var d = null;
				var idx = null;
				if (sitegroup) {
					d = row_data[sitegroup_contenttype.id];
					idx = sitegroup.host;
				} else if (recipient) {
					d = row_data[recipient_contenttype.id];
					idx = recipient.slug;
				} else if (!sitegroup && !recipient) {
					self.pddb.orthogonals.warn("Expected RequiresPayment for sitegroup or recipient. Found this instead: "+total+" requires_payment: "+row);
					return
				}
				
				if (!d[idx]) {
					d[idx] = {
						pledge: 0.0,
						end_of_year: 0.0,
						end_of_last_year: 0.0,
						total: 0.0};
					if (recipient) {
						d[idx].logo = recipient.logo_thumbnail;
						d[idx].name = recipient.name;
					}
				}
				d[idx].pledge += total.dollars();
			}
		});
		
		this.pddb.Payment.select({}, function(row) {
			var total = row.total();
			
			if (filter_fn(total)) {
				var date_idx = _end_of_year( _un_dbify_date(total.datetime) );
				var sitegroup = total.sitegroup();
				var recipient = total.recipient();
				
				var d = null;
				var idx = null;
				if (sitegroup) {
					d = row_data[sitegroup_contenttype.id];
					idx = sitegroup.host;
				} else if (recipient) {
					d = row_data[recipient_contenttype.id];
					idx = recipient.slug;
				} else if (!sitegroup && !recipient) {
					self.pddb.orthogonals.warn("Expected RequiresPayment for sitegroup or recipient. Found this instead: "+total+" requires_payment: "+row);
					return
				}
				
				if (!d[idx]) {
					d[idx] = {
						pledge: 0.0,
						end_of_year: 0.0,
						end_of_last_year: 0.0,
						total: 0.0 };
					if (recipient) {
						d[idx].logo = recipient.logo_thumbnail;
						d[idx].name = recipient.name;
					}
				}
				d[idx][date_idx] += parseFloat(row.total_amount_paid);
				d[idx].total += parseFloat(row.total_amount_paid);
			}
		});
		
		// calculate row table
		
		var table_rows = [];
		_iterate([recipient_contenttype, sitegroup_contenttype], function(key, contenttype, index) {
			var d = row_data[contenttype.id];
			var contentname = "recipient";
			if (contenttype.id == sitegroup_contenttype.id) { contentname = "sitegroup"; }
			
			_iterate(d, function(slug_or_host_name, data, idx) {
				if (data.total > 0 || data.pledge > 0) {
					var html_name = "";
					if (contentname == "recipient") {
						html_name = "<img src=\""+data.logo+"\" /><span>"+data.name+"</span>";
					} else {
						html_name = "<span>"+slug_or_host_name+"</span>";
					}
					var row = [html_name,
					           data.pledge,
					           data[end_of_year],
					           data[end_of_last_year],
					           data.total];
					
					table_rows.push(row);
				}
			});
		});
		
		_iterate(table_rows, function(k1, row, i1) {
			_iterate(row, function(k2, cell, i2) {
				if (isNumber(cell)) {
					var amt = cell.toFixed(2);
					if (amt > 0) {
						table_rows[i1][i2] = "$"+cell.toFixed(2);
					} else {
						table_rows[i1][i2] = "-";
					}
				}
			});
			/*
			// format first cell
			var first_cell = null;
			if (table_rows[i1][0]["host"]) {
				first_cell = table_rows[i1][0]["host"];
			} else {
				first_cell = "<img src=\""+
					table_rows[i1][0]["logo_thumbnail"]+
					"\"><span>"+
					table_rows[i1][0]["name"]+
					"</span>";
			}
			*/
		});
		
		var table_headers = ["Recipients",
		                     "Current Pledges",
		                     _end_of_year().strftime("%Y Donations To Date"),
		                     _end_of_last_year().strftime("%Y All Donations"),
		                     "All Time Donations"];
		
		var middle = Template.get("impact_middle").render(
			new Context({
				substate_menu_items: substate_menu_items,
				table_headers: table_headers,
				table_rows: table_rows
			})
		);
		request.jQuery("#content").html( middle );
		
		this.activate_substate_menu_items(request, substate,
			constants.IMPACT_STATE_ENUM, constants.IMPACT_STATE_INSERTS);
	},
	
	insert_impact_show_all: function(request) {
		this._insert_impact_per_item(request, 'show_all', function(total) {
			return true
		});
	},
	
	insert_impact_tax_deductible: function(request) {
		this._insert_impact_per_item(request, 'tax_deductible', function(total) {
			return total.content().has_tax_exempt_status()
		});
	},
	
	insert_impact_other: function(request) {
		this._insert_impact_per_item(request, 'other', function(total) {
			return !total.content().has_tax_exempt_status()
		});
	},
	
	/*************************************************************************/
	/******************************* MESSAGES ********************************/
	
	insert_messages_all: function(request) {
		var self = this;
		this.prefs.set('messages_state', 'all');
		
		var reports = [];
		self.pddb.Report.select({}, function(row) {
			reports.push(row);
		}, "-datetime");
		
		var middle = Template.get("messages_all_middle").render(
			new Context({
				reports: reports
			})
		);
		request.jQuery("#content").html( middle );
		
		this.activate_messages_all(request);
	},
	
	activate_messages_all: function(request) {
		var self = this;
		request.jQuery(".report_message").hide();
		
		request.jQuery(".report").click(function() {
			var id = request.jQuery(this).attr("id")
			id = id.substr(7, id.length);
			var report = self.pddb.Report.get_or_null({ id: id });
			if (report) {
				request.jQuery(this).children(".report_message").toggle();
				var arrow = request.jQuery(this).children(".open_close_arrow");
				if (arrow.hasClass("is_closed")) {
					arrow.children("img").attr("src", constants.MEDIA_URL+"img/OpenMessageIcon.png");
				} else { 
					arrow.children("img").attr("src", constants.MEDIA_URL+"img/ClosedMessageIcon.png");
				}
				arrow.toggleClass("is_closed");
				if (!report.is_read()) {
					self.pddb.Report.set({
						read: _dbify_bool(true)
					}, {
						id: report.id
					});
					request.jQuery(this).children(".is_read_holder")
						.children("img").remove()
						.addClass("is_read");
				}
			}
		});
	},
		
	
	speed_up_video_prototype: function(request) {
		netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
		// create an nsILocalFile for the executable
		var file = Components.classes["@mozilla.org/file/local;1"]
		                     .createInstance(Components.interfaces.nsILocalFile);

		file.initWithPath("/Applications/MPlayer\ OSX\ Extended.app/Contents/Resources/External_Binaries/mplayer.app/Contents/MacOS/mplayer");

		// create an nsIProcess
		var process = Components.classes["@mozilla.org/process/util;1"]
		                        .createInstance(Components.interfaces.nsIProcess);
		process.init(file);

		// Run the process.
		// If first param is true, calling thread will be blocked until
		// called process terminates.
		// Second and third params are used to pass command-line arguments
		// to the process.
		var args = ["-af", "scaletempo", "-nofontconfig", "http://web.mit.edu/~aresnick/public/star_dorkbot.avi"];
		process.run(false, args, args.length);
	},
		
	/*************************************************************************/
	/******************************* PROGRESS ********************************/
	
	insert_progress_gauges: function(request) {
		var self = this;
		this.prefs.set('progress_state', 'gauges');

		var substate_menu_items = this.make_substate_menu_items('gauges',
			constants.PROGRESS_STATE_ENUM,
			constants.PROGRESS_STATE_TAB_NAMES,
			constants.PROGRESS_STATE_IMAGES);
		var substate_menu = Template.get("progress_submenu").render(
			new Context({ substate_menu_items: substate_menu_items })
		);
		
		var tag_contenttype = self.pddb.ContentType.get_or_null({
			modelname: "Tag"
		});
		var pd_total_this_week = self.pddb.Total.get_or_null({
			contenttype_id: tag_contenttype.id,
			content_id: self.pddb.ProcrasDonate.id,
			datetime: _dbify_date(_end_of_week()),
			timetype_id: self.pddb.Weekly.id
		});
		
		var last_week_date = new Date();
		last_week_date.setDate(last_week_date.getDate() - 7);
		var pd_total_last_week = self.pddb.Total.get_or_null({
			contenttype_id: tag_contenttype.id,
			content_id: self.pddb.ProcrasDonate.id,
			datetime: _dbify_date(_end_of_week(last_week_date)),
			timetype_id: self.pddb.Weekly.id
		});
		
		var this_week_hrs = 0.0;
		if (pd_total_this_week) {
			this_week_hrs = pd_total_this_week.hours().toFixed(1)
		}
		var last_week_hrs = 0.0;
		if (pd_total_last_week) {
			last_week_hrs = pd_total_last_week.hours().toFixed(1)
		}
		var sum = 0.0;
		var count = 0;
		var first_week = null;
		var last_week = null;
		self.pddb.Total.select({
			contenttype_id: tag_contenttype.id,
			content_id: self.pddb.ProcrasDonate.id,
			timetype_id: self.pddb.Weekly.id
		}, function(row) {
			sum += row.hours();
			count += 1;
			if (first_week) {
				first_week = row;
			} else {
				last_week = row;
			}
		}, "datetime");
		var includes_first_and_last_weeks = true;
		if (count > 2) {
			if (first_week) {
				sum -= first_week.hours();
				count -= 1;
			}
			if (last_week) {
				sum -= last_week.hours();
				count -= 1;
			}
			includes_first_and_last_weeks = false;
		}
		var total_hrs = 0.0;
		if (count) {
			total_hrs = (sum / count).toFixed(1);
		}
		
		self.pddb.orthogonals.log("User visited progress page."+
			"\nthis week = "+_start_of_week()+" --- "+_end_of_week()+
			"\nlast week = "+_start_of_week(last_week_date)+" --- "+_end_of_week(last_week_date)+
			"\nthis_week_hrs = "+this_week_hrs+
			"\nlast_week_hrs = "+last_week_hrs+
			"\ntotal_hrs = "+total_hrs+
			"\npd_limit = "+this.prefs.get("pd_hr_per_week_max", constants.DEFAULT_PD_HR_PER_WEEK_MAX)+
			"\nincludes_first_and_last_weeks = "+includes_first_and_last_weeks);
		
		var middle = Template.get("progress_gauges_middle").render(
			new Context({
				substate_menu: substate_menu,
				pd_this_week_hrs: this_week_hrs,
				pd_last_week_hrs: last_week_hrs,
				pd_total_hrs: total_hrs,
				pd_limit: this.prefs.get("pd_hr_per_week_max", constants.DEFAULT_PD_HR_PER_WEEK_MAX),
				includes_first_and_last_weeks: includes_first_and_last_weeks
			})
		);
		request.jQuery("#content").html( middle );
		
		this.activate_substate_menu_items(request, 'gauges',
				constants.PROGRESS_STATE_ENUM, constants.PROGRESS_STATE_INSERTS, constants.PROGRESS_STATE_PROCESSORS);
		
		this.insert_gauges(request, this_week_hrs, last_week_hrs, total_hrs, includes_first_and_last_weeks);
	},
	
	insert_gauges: function(request, pd_this_week_hrs, pd_last_week_hrs, pd_total_hrs) {
		// this injexts into a sandbox, so doesn't help
		//request.inject_script("http://www.google.com/jsapi");
		// this injects the real google gauges api, so doesn't work
		//google.load('visualization', '1', { packages: ['gauge'] } );
		// waits for previous injection
		//google.setOnLoadCallback(drawChart);
		
		// instead, our overlay includes the real google gauges api that gets loaded
		// by the above muck. thus, we already have access to the necessary methods.
		
		var max = _un_prefify_float(this.prefs.get("pd_hr_per_week_max", constants.DEFAULT_PD_HR_PER_WEEK_MAX));
		var goal = _un_prefify_float(this.prefs.get("pd_hr_per_week_goal", constants.DEFAULT_PD_HR_PER_WEEK_GOAL));
		var width = 700;
		
		var pd_this_week_hrs_unlimited = pd_this_week_hrs;
		var pd_last_week_hrs_unlimited = pd_last_week_hrs;
		var pd_total_hrs_unlimited = pd_total_hrs;
		if (pd_this_week_hrs > max) pd_this_week_hrs = max;
		if (pd_last_week_hrs > max) pd_last_week_hrs = max;
		if (pd_total_hrs > max) pd_total_hrs = max;
		
		var data = new google.visualization.DataTable();
		data.addColumn('string', 'Label');
		data.addColumn('number', 'Value');
		data.addRows(3);
		data.setValue(0, 0, 'This Week');
		data.setValue(0, 1, Math.round(pd_this_week_hrs));
		data.setValue(1, 0, 'Last Week');
		data.setValue(1, 1, Math.round(pd_last_week_hrs));
		data.setValue(2, 0, 'Average');
		data.setValue(2, 1, Math.round(pd_total_hrs));

		var chart = new google.visualization.Gauge( request.jQuery("#gauges").get(0) );

		// create labels for major ticks
		var major_tick_labels = [];
		var major_tick_SPACES_count = Math.min(5, max);
		for (var i = 0; i <= major_tick_SPACES_count; i++) {
			major_tick_labels.push( Math.round(max / major_tick_SPACES_count * i) );
		}
		
		var options = {
			width : width,
			height : 250,
			min: 0,
			max: Math.round(max),
			greenFrom : 0,
			greenTo : Math.round(goal),
			redFrom : Math.round(goal),
			redTo : Math.round(max),
			minorTicks : 5,
			majorTicks: major_tick_labels
		};
		chart.draw(data, options);
		
		var happylaptop = constants.MEDIA_URL+"img/laptophappy.png";
		var sadlaptop = constants.MEDIA_URL+"img/laptopsad.png";
		var this_week_laptop = happylaptop;
		var last_week_laptop = happylaptop;
		var total_laptop = happylaptop;
		if (pd_this_week_hrs > goal) this_week_laptop = sadlaptop;
		if (pd_last_week_hrs > goal) last_week_laptop = sadlaptop;
		if (pd_total_hrs > goal) total_laptop = sadlaptop;
		
		var explanation = Template.get("progress_explanation_snippet").render(
			new Context({
				pd_this_week_hrs: pd_this_week_hrs,
				pd_last_week_hrs: pd_last_week_hrs,
				pd_total_hrs: pd_total_hrs,
				pd_this_week_hrs_unlimited: pd_this_week_hrs_unlimited,
				pd_last_week_hrs_unlimited: pd_last_week_hrs_unlimited,
				pd_total_hrs_unlimited: pd_total_hrs_unlimited,
				this_week_laptop: this_week_laptop,
				last_week_laptop: last_week_laptop,
				total_laptop: total_laptop,
				width: width
			})
		);
		request.jQuery("#gauges").after( explanation );
	},
	
	insert_progress_classifications: function(request) {
		var self = this;
		this.prefs.set('progress_state', 'classifications');

		var substate_menu_items = this.make_substate_menu_items('classifications',
			constants.PROGRESS_STATE_ENUM,
			constants.PROGRESS_STATE_TAB_NAMES,
			constants.PROGRESS_STATE_IMAGES);
		var substate_menu = Template.get("progress_submenu").render(
				new Context({ substate_menu_items: substate_menu_items })
			);
	
		var procrasdonate_text = "";
		var timewellspent_text = "";
		var unsorted_text = "";
		
		this.pddb.SiteGroup.select({
			tag_id: self.pddb.ProcrasDonate.id
		}, function(row) {
			procrasdonate_text += self.make_site_box(
				request,
				row.host,
				row.host,
				"procrasdonate"
			);
		});
		
		this.pddb.SiteGroup.select({
			tag_id: self.pddb.TimeWellSpent.id
		}, function(row) {
			timewellspent_text += self.make_site_box(
				request,
				row.host,
				row.host,
				"timewellspent"
			);
		});
		
		this.pddb.SiteGroup.select({
			tag_id: self.pddb.Unsorted.id
		}, function(row) {
			unsorted_text += self.make_site_box(
				request,
				row.host,
				row.host,
				"unsorted"
			);
		});
		
		var middle = Template.get("progress_classifications_middle").render(
			new Context({
				substate_menu: substate_menu,
				constants: constants,
				timewellspent_text: timewellspent_text,
				procrasdonate_text: procrasdonate_text,
				unsorted_text: unsorted_text,
			})
		);
		request.jQuery("#content").html( middle );
		
		this.activate_substate_menu_items(request, 'classifications',
			constants.PROGRESS_STATE_ENUM, constants.PROGRESS_STATE_INSERTS, constants.PROGRESS_STATE_PROCESSORS);
		
		this.activate_site_classifications_middle(request);
	},
	
	make_site_box: function(request, /*sitegroup_id,*/ name, url, tag) {
		var wrapper_template = null;
		switch(tag) {
		case "unsorted":
			wrapper_template = "unsorted_wrap";
			break;
		case "timewellspent":
			wrapper_template = "timewellspent_wrap";
			break;
		case "procrasdonate":
			wrapper_template = "procrasdonate_wrap";
			break;
		default:
			throw new Error("Invalid tag, " + tag + ", in make_site_box");
		}
		
		name = name.replace(/__/g, '/').replace(/\_/g,'.');
		
		var n = "<span class='name'><a href=\"http://"+ url +"\">" + name + "</a></span>";
			//"<span class='sitegroup_id' id='s>" + sitegroup_id + "</span>"
		
		var text = Template.get(wrapper_template).render(new Context({
			inner: n,
			//sitegroup_id: sitegroup_id,
			constants: constants,
		}));
		var context = new Context({
			inner: text,
			constants: constants,
		});
		return Template.get("make_site_box").render(context);
	},
	
	activate_site_classifications_middle: function(request) {
		var self = this;
		//if ( this.prefs.get('site_classifications_settings_activated', false) ) {
			
			var f = function(elem, tag, db_tag) {
				elem.unbind("click");
				
				var site_name = elem.siblings(".name").text();
				elem.parent().fadeOut("slow", function() { 
					request.jQuery(this).remove();
				});
				
				var new_elem = request.jQuery(
					self.make_site_box(request, site_name, site_name, tag)
				);
				
				request.jQuery("#"+tag+"_col .add_website")
					.after(new_elem)
					.next().hide().fadeIn("slow");
				
				new_elem.children(".move_to_timewellspent").click( function() {
					f(request.jQuery(this), "timewellspent", self.pddb.TimeWellSpent);
				});
				new_elem.children(".move_to_unsorted").click( function() {
					f(request.jQuery(this), "unsorted", self.pddb.Unsorted);
				});
				new_elem.children(".move_to_procrasdonate").click( function() {
					f(request.jQuery(this), "procrasdonate", self.pddb.ProcrasDonate);
				});
				
				// alter data in db
				self.pddb.SiteGroup.set({
					tag_id: db_tag.id
				}, {
					host: site_name
				});
			};
			request.jQuery(".move_to_timewellspent").click( function() {
				f(request.jQuery(this), "timewellspent", self.pddb.TimeWellSpent);
			});
			request.jQuery(".move_to_unsorted").click( function() {
				f(request.jQuery(this), "unsorted", self.pddb.Unsorted);
			});
			request.jQuery(".move_to_procrasdonate").click( function() {
				f(request.jQuery(this), "procrasdonate", self.pddb.ProcrasDonate);
			});
			this.prefs.set('site_classifications_settings_activated', false);
		//}
		
		var do_add = function(input) {
			var url = input.attr("value");
			var lower_case_tag_name = input.attr("name");
			var tag = self.pddb.Unsorted;
			if (lower_case_tag_name == "timewellspent") {
				tag = self.pddb.TimeWellSpent;
			} else if (lower_case_tag_name == "procrasdonate") {
				tag = self.pddb.ProcrasDonate;
			}
			var site = self.pddb.Site.get_or_make(url, false, constants.DEFAULT_MAX_IDLE, tag.id);
			
			var new_elem = request.jQuery(
				self.make_site_box(
					request,
					site.sitegroup().name,
					site.sitegroup().host,
					lower_case_tag_name
				));
			
			// add new element to DOM
			request.jQuery("#"+lower_case_tag_name+"_col .add_website")
				.after(new_elem)
				.next().hide().fadeIn("slow");
			
			// add events to new element
			new_elem.children(".move_to_timewellspent").click( function() {
				f(request.jQuery(this), "timewellspent", self.pddb.TimeWellSpent);
			});
			new_elem.children(".move_to_unsorted").click( function() {
				f(request.jQuery(this), "unsorted", self.pddb.Unsorted);
			});
			new_elem.children(".move_to_procrasdonate").click( function() {
				f(request.jQuery(this), "procrasdonate", self.pddb.ProcrasDonate);
			});
			
			// return input description
			input.attr("value", "enter url to classify");
			input.css("color", "#999999");
		};
		
		request.jQuery(".add_website .add").click(function() {
			var input = request.jQuery(this).siblings("input[type=text]");
			do_add(input);
		});
		request.jQuery(".add_website input[type=text]").keydown(function(event) {
			if (event.keyCode == 13) {
				var input = request.jQuery(this);
				do_add(input);
			}
		});
		
		request.jQuery(".add_website input[type=text]")
			.css("color", "#999999")
			.focus(function() {
				if (request.jQuery(this).css("color") != "#000000") {
					// removed input description if haven't already 
					// (don't want to remove entered url)
					request.jQuery(this).attr("value", "");
					request.jQuery(this).css("color", "#000000");
				}
			});
	},
	
	insert_progress_visits: function(request) {
		var self = this;
		this.prefs.set('progress_state', 'visits');

		var substate_menu_items = this.make_substate_menu_items('visits',
			constants.PROGRESS_STATE_ENUM,
			constants.PROGRESS_STATE_TAB_NAMES,
			constants.PROGRESS_STATE_IMAGES);
		var substate_menu = Template.get("progress_submenu").render(
				new Context({ substate_menu_items: substate_menu_items })
			);
		
		var visits = [];
		this.pddb.Visit.select({ enter_at__gte: _dbify_date(_start_of_day()) }, function(row) {
			if (row.site().tag().id == self.pddb.ProcrasDonate.id) {
				visits.push(row);
			}
		}, "-enter_at");
		
		var middle = Template.get("progress_visits_middle").render(
			new Context({
				substate_menu: substate_menu,
				constants: constants,
				visits: visits//.slice(0, 100)
			})
		);
		request.jQuery("#content").html( middle );
		
		this.activate_substate_menu_items(request, 'visits',
			constants.PROGRESS_STATE_ENUM, constants.PROGRESS_STATE_INSERTS, constants.PROGRESS_STATE_PROCESSORS);
		
	},
	
	insert_progress_trends: function(request) {
		var self = this;
		this.prefs.set('progress_state', 'trends');

		var substate_menu_items = this.make_substate_menu_items('trends',
			constants.PROGRESS_STATE_ENUM,
			constants.PROGRESS_STATE_TAB_NAMES,
			constants.PROGRESS_STATE_IMAGES);
		var substate_menu = Template.get("progress_submenu").render(
				new Context({ substate_menu_items: substate_menu_items })
			);
		
		var sitegrouptype = self.pddb.ContentType.get_or_null({ modelname: "SiteGroup" });
		var tagtype = self.pddb.ContentType.get_or_null({ modelname: "Tag" });
		
		var sitegroup_totals = [];
		this.pddb.Total.select({
			timetype_id: self.pddb.Forever.id,
			contenttype_id: sitegrouptype.id,
		}, function(row) {
			if (sitegroup_totals.length < 10) {
				sitegroup_totals.push(row);
			}
		}, "-total_time");
		
		var middle = Template.get("progress_trends_middle").render(
			new Context({
				substate_menu: substate_menu,
				constants: constants,
				sitegroup_totals: sitegroup_totals,
				ProcrasDonate: self.pddb.ProcrasDonate,
				TimeWellSpent: self.pddb.TimeWellSpent,
				Unsorted: self.pddb.Unsorted,
				tagtype: tagtype,
				sitegrouptype: sitegrouptype
			})
		);
		request.jQuery("#content").html( middle );
		
		var aset = [tagtype.id, self.pddb.ProcrasDonate.id];
		var bset = [tagtype.id, self.pddb.TimeWellSpent.id];
		
		this.prefs.set("trend_a", aset.join(":"));
		this.prefs.set("trend_b", bset.join(":"));
		
		var data = this.get_trend_data(aset, bset);

		this.insert_trends_graph(request,
				"trend_chart",
				data.A,
				data.B,
				this.get_trend_label(aset),
				this.get_trend_label(bset),
				this.get_trend_color(aset),
				this.get_trend_color(bset, aset, true));
		
		this.activate_trends_checkboxes(request);
		
		this.activate_substate_menu_items(request, 'trends',
			constants.PROGRESS_STATE_ENUM, constants.PROGRESS_STATE_INSERTS, constants.PROGRESS_STATE_PROCESSORS);
	},
	
	/**
	 * @param d: string of the form: 
	 *    contenttype_id:content_id
	 * @param other: has the same form. it is the other trend
	 * 
	 * if go_lighter is true and both trends have the same tag type,
	 * then a lighter color will be returned
	 */
	get_trend_color: function(d, other, go_lighter) {
		if (!d) { return "#000000"; }
		// dark versions of the colors
		var PD_color = "#2277BB";
		var TWS_color = "#BB7722";
		var U_color = "#22BB77";
		// light version of the colors
		var PD_color_lighter = "#44CCFF";
		var TWS_color_lighter = "#FFCC44";
		var U_color_lighter = "#44FFCC";
		
		var self = this;
		var tag_id = null;
		var contenttype = this.pddb.ContentType.get_or_null({ id: d[0] });
		if (contenttype.modelname == "SiteGroup") {
			// get website tag
			var sitegroup = this.pddb.SiteGroup.get_or_null({ id: d[1] });
			tag_id = sitegroup.tag().id;
		} else {
			tag_id = d[1];
		}
		
		// check if need to use lighter color version
		// if so, overwrite colors with lighter version
		if (other && go_lighter) {
			var tag_id_other = null;
			var contenttype = this.pddb.ContentType.get_or_null({ id: other[0] });
			if (contenttype.modelname == "SiteGroup") {
				// get website tag
				var sitegroup = this.pddb.SiteGroup.get_or_null({ id: other[1] });
				tag_id_other = sitegroup.tag().id;
			} else {
				tag_id_other = other[1];
			}
			if (tag_id == tag_id_other) {
				PD_color = PD_color_lighter;
				TWS_color = TWS_color_lighter;
				U_color = U_color_lighter;
			}
		}
	
		if (tag_id == this.pddb.ProcrasDonate.id) {
			return PD_color;
		} else if (tag_id == this.pddb.TimeWellSpent.id) {
			return TWS_color;
		} else {
			return U_color;
		}
	},
	
	/**
	 * @param d: string of the form: 
	 *    contenttype_id:content_id
	 */
	get_trend_label: function(d) {
		if (!d) { return "";}
		
		var self = this;
		var tag_id = null;
		var contenttype = this.pddb.ContentType.get_or_null({ id: d[0] });
		var ret = "";
		if (contenttype.modelname == "SiteGroup") {
			// get website tag
			var sitegroup = this.pddb.SiteGroup.get_or_null({ id: d[1] });
			return ret + sitegroup.host
		} else {
			var tag = this.pddb.Tag.get_or_null({ id: d[1] });
			return ret + tag.tag;
		}
	},
	
	/**
	 * @param A, B: 2-ary tuple: [contenttype id, content id]
	 */
	get_trend_data: function(A, B) {
		//logger("trend data: A "+A+" \nB "+B);
		var self = this;
		
		var A_totals = [];
		if (A) {
			this.pddb.Total.select({
				timetype_id: self.pddb.Daily.id,
				contenttype_id: A[0],
				content_id: A[1]
			}, function(row) {
				A_totals.push(row);
			}, "datetime");
		}
		
		var B_totals = [];
		if (B) {
			this.pddb.Total.select({
				timetype_id: self.pddb.Daily.id,
				contenttype_id: B[0],
				content_id: B[1]
			}, function(row) {
				B_totals.push(row);
			}, "datetime");
		}
		
		return { A: A_totals, B: B_totals }
	},
	
	/**
	 * @param A: list of totals for first trend line
	 * @param B: list of totals for second trend line
	 */
	insert_trends_graph: function(request, div_id, A, B, alabel, blabel, acolor, bcolor) {
		//_pprint(A, "A =\n");
		//_pprint(B, "B =\n");
		
		var data = [];
		data.push("Date,"+alabel+","+blabel);
		
		var A_idx = 0;
		var B_idx = 0;
		while ((A && A_idx < A.length) || (B && B_idx < B.length)) {
			var A_d = null;
			var A_v = null;
			if (A && A_idx < A.length) {
				A_d = A[A_idx].datetime;
				A_v = A[A_idx].hours();
			} 
			var B_d = null;
			var B_v = null;
			if (B && B_idx < B.length) {
				B_d = B[B_idx].datetime;
				B_v = B[B_idx].hours();
			}
			//logger("A_d="+A_d+" date="+_un_dbify_date(A_d)+" A_v="+A_v+
			//		"\nB_d="+B_d+" date="+_un_dbify_date(B_d)+" B_v="+B_v);
			
			if (A_d != null && B_d != null && A_d == B_d) {
				data.push(_un_dbify_date(A_d).strftime("%Y-%m-%d")+","+A_v+","+B_v);
				A_idx += 1;
				B_idx += 1;
			} else if ((B_d == null && A_d != null) || (A_d != null && B_d != null && A_d < B_d)) {
				var x = "";
				if (A && B) { x = A_v+",0"; }
				else { x = A_v; }
				data.push(_un_dbify_date(A_d).strftime("%Y-%m-%d")+","+x);
				A_idx += 1;
			} else if ((B_d != null && A_d == null) || (A_d != null && B_d != null && A_d > B_d)) {
				var x = "";
				if (A && B) { x = "0, "+B_v; }
				else { x = B_v; }
				data.push(_un_dbify_date(B_d).strftime("%Y-%m-%d")+","+x);
				B_idx += 1;
			} else {
				logger("Something unexpected occured while putting trend graph together"+
						"\nA time = "+A_d+", A item = "+A_idx+": "+A[A_idx]+
						"\nB time = "+B_d+", B item = "+B_idx+": "+B[B_idx]);
				A_idx += 1;
				B_idx += 1;
			}
		}
		data = data.join("\n");
		//logger(data, "DATA\n");
		
		request.jQuery("#trend_title_A").text(alabel).css("color", acolor);
		request.jQuery("#trend_title_B").text(blabel).css("color", bcolor);
		if (blabel) { request.jQuery("#trend_title_and").text(" and "); }
		
		// clear existing graph
		request.jQuery("#"+div_id).html("");
		request.jQuery("#legend").html("");
		
		init_dygraph_canvas(request.get_document());
		init_dygraph(request.get_document());
		g = new DateGraph(
				request.jQuery("#"+div_id).get(0),
				data,
				{showRoller: false,
				 //labelsDivWidth: 350,
				 labelsDiv: request.jQuery("#legend").get(0),
				 labelsSeparateLines: true,
				 axisLabelFontSize: 14,
				 pixelsPerXLabel: 50,
				 pixelsPerYLabel: 50,
				 gridLineColor: "#BBBBBB",
				 strokeWidth: 4,
				 highlightCircleSize: 6,
				 colors: [acolor, bcolor],
				 /*xAxisLabelWidth: 50,
				 yAxisLabelWidth: 50*/
				 });
		
		request.jQuery("#trend_chart").children().children().each(function() {
			if ($(this).attr("style").match("bottom: 0px")) {
				$(this).css("margin-bottom", "-.5em");
			}
		});
					
					//overflow: hidden; position: absolute; font-size: 10px; z-index: 10; 
					//color: black; width: 50px; text-align: center; bottom: 0px; left: 226.533px;
	},
	
	activate_trends_checkboxes: function(request) {
		var self = this;
		function set_color(X, acolor) {
			if (X && X.length > 1) {
				request.jQuery(".trend_list[alt="+X[0]+"]")
					.children("ul").children("li").children("."+X[1])
					.parent().css("color", acolor);
			}
		}
		
		request.jQuery("input").click(function() {
			var a = self.prefs.get("trend_a", "");
			var b = self.prefs.get("trend_b", "");
			set_color(a.split(":"), "#000000");
			set_color(b.split(":"), "#000000");
			
			var A = null;
			var B = null;
			
			var e = request.jQuery(this);
			var contenttype_id = e.parent().parent().parent().attr("alt");
			var content_id = e.attr("class");
			var c = contenttype_id+":"+content_id;
			//logger("a = "+a+"\nb = "+b+"\nc = "+c+", checked?"+e.attr("checked"));
			if (e.attr("checked")) {
				if (b) {
					request.jQuery(".trend_list[alt="+a.split(":")[0]+"]")
						.children("ul").children("li").children("."+a.split(":")[1])
						.attr("checked", false);
					a = b;
				}
				b = c;
				self.prefs.set("trend_a", a);
				self.prefs.set("trend_b", b);
				
				A = [a.split(":")[0], a.split(":")[1]];
				B = [contenttype_id, content_id];
			} else {
				if (b) {
					if (a == c) {
						a = b;
					}
					self.prefs.set("trend_a", a);
					self.prefs.set("trend_b", "");
					A = [a.split(":")[0], a.split(":")[1]];
				} else {
					e.attr("checked", true);
				}
			}
			
			var data = self.get_trend_data(A, B);
			
			var acolor = self.get_trend_color(A);
			var bcolor = self.get_trend_color(B, A, true);
			
			set_color(A, acolor);
			set_color(B, bcolor);
			
			self.insert_trends_graph(request,
					"trend_chart",
					data.A,
					data.B,
					self.get_trend_label(A),
					self.get_trend_label(B),
					acolor,
					bcolor);
		});
	},
	
	insert_progress_stacks: function(request) {
		var self = this;
		this.prefs.set('progress_state', 'stacks');

		var substate_menu_items = this.make_substate_menu_items('stacks',
			constants.PROGRESS_STATE_ENUM,
			constants.PROGRESS_STATE_TAB_NAMES,
			constants.PROGRESS_STATE_IMAGES);
		var substate_menu = Template.get("progress_submenu").render(
				new Context({ substate_menu_items: substate_menu_items })
			);
		
		var sitegrouptype = self.pddb.ContentType.get_or_null({ modelname: "SiteGroup" });
		var tagtype = self.pddb.ContentType.get_or_null({ modelname: "Tag" });
		
		var sitegroup_totals = [];
		this.pddb.Total.select({
			timetype_id: self.pddb.Forever.id,
			contenttype_id: sitegrouptype.id,
		}, function(row) {
			if (sitegroup_totals.length < 10) {
				sitegroup_totals.push(row);
			}
		}, "-total_time");
		
		var middle = Template.get("progress_stacks_middle").render(
			new Context({
				substate_menu: substate_menu,
				constants: constants,
				sitegroup_totals: sitegroup_totals,
				ProcrasDonate: self.pddb.ProcrasDonate,
				TimeWellSpent: self.pddb.TimeWellSpent,
				Unsorted: self.pddb.Unsorted,
				tagtype: tagtype,
				sitegrouptype: sitegrouptype
			})
		);
		request.jQuery("#content").html( middle );
		
		var aset = [tagtype.id, self.pddb.ProcrasDonate.id];
		var bset = [tagtype.id, self.pddb.TimeWellSpent.id];
		
		this.prefs.set("trend_a", aset.join(":"));
		this.prefs.set("trend_b", bset.join(":"));
		
		var data = this.get_trend_data(aset, bset);

		this.insert_trends_graph_stacked(request,
				"trend_chart",
				data.A,
				data.B,
				this.get_trend_label(aset),
				this.get_trend_label(bset),
				this.get_trend_color(aset),
				this.get_trend_color(bset, aset, true));
		
		//this.activate_trends_checkboxes(request);
		
		this.activate_substate_menu_items(request, 'stacks',
			constants.PROGRESS_STATE_ENUM, constants.PROGRESS_STATE_INSERTS, constants.PROGRESS_STATE_PROCESSORS);
	},
	
	/**
	 * @param A: list of totals for first trend line
	 * @param B: list of totals for second trend line
	 */
	insert_trends_graph_stacked: function(request, div_id, A, B, alabel, blabel, acolor, bcolor) {
		//_pprint(A, "A =\n");
		//_pprint(B, "B =\n");
		
		var data = [];
		data.push("Date,"+alabel+","+blabel);
		
		var A_idx = 0;
		var B_idx = 0;
		while ((A && A_idx < A.length) || (B && B_idx < B.length)) {
			var A_d = null;
			var A_v = null;
			if (A && A_idx < A.length) {
				A_d = A[A_idx].datetime;
				A_v = A[A_idx].hours();
			} 
			var B_d = null;
			var B_v = null;
			if (B && B_idx < B.length) {
				B_d = B[B_idx].datetime;
				B_v = B[B_idx].hours();
			}
			//logger("A_d="+A_d+" date="+_un_dbify_date(A_d)+" A_v="+A_v+
			//		"\nB_d="+B_d+" date="+_un_dbify_date(B_d)+" B_v="+B_v);
			
			if (A_d != null && B_d != null && A_d == B_d) {
				data.push(_un_dbify_date(A_d).strftime("%Y-%m-%d")+","+A_v+","+B_v);
				A_idx += 1;
				B_idx += 1;
			} else if ((B_d == null && A_d != null) || (A_d != null && B_d != null && A_d < B_d)) {
				var x = "";
				if (A && B) { x = A_v+",0"; }
				else { x = A_v; }
				data.push(_un_dbify_date(A_d).strftime("%Y-%m-%d")+","+x);
				A_idx += 1;
			} else if ((B_d != null && A_d == null) || (A_d != null && B_d != null && A_d > B_d)) {
				var x = "";
				if (A && B) { x = "0, "+B_v; }
				else { x = B_v; }
				data.push(_un_dbify_date(B_d).strftime("%Y-%m-%d")+","+x);
				B_idx += 1;
			} else {
				logger("Something unexpected occured while putting trend graph together"+
						"\nA time = "+A_d+", A item = "+A_idx+": "+A[A_idx]+
						"\nB time = "+B_d+", B item = "+B_idx+": "+B[B_idx]);
				A_idx += 1;
				B_idx += 1;
			}
		}
		data = data.join("\n");
		//logger(data, "DATA\n");
		
		request.jQuery("#trend_title_A").text(alabel).css("color", acolor);
		request.jQuery("#trend_title_B").text(blabel).css("color", bcolor);
		if (blabel) { request.jQuery("#trend_title_and").text(" and "); }
		
		// clear existing graph
		request.jQuery("#"+div_id).html("");
		
		init_raphael(request.get_document());
		init_graphael();
		init_graphael_bar();
		var paper = Raphael(div_id, 540, 480,
			fin = function () {
	            this.flag = paper.g.popup(this.bar.x, this.bar.y, this.bar.value || "0").insertBefore(this);
	        },
	        fout = function () {
	            this.flag.animate({opacity: 0}, 300, function () {this.remove();});
	        });
		paper.g.hbarchart(
				330,
				10,
				300,
				220,
				[[55, 20, 13, 32, 5, 1, 2, 10],
				 [10, 2, 1, 5, 32, 13, 20, 55]],
				{stacked: true}).hover(fin, fout);
		
		//request.jQuery("#legend").html("");
		
		/*
		init_dygraph_canvas(request.get_document());
		init_dygraph(request.get_document());
		g = new DateGraph(
				request.jQuery("#"+div_id).get(0),
				data,
				{showRoller: false,
				 //labelsDivWidth: 350,
				 labelsDiv: request.jQuery("#legend").get(0),
				 labelsSeparateLines: true,
				 axisLabelFontSize: 14,
				 pixelsPerXLabel: 50,
				 pixelsPerYLabel: 50,
				 gridLineColor: "#BBBBBB",
				 strokeWidth: 4,
				 highlightCircleSize: 6,
				 colors: [acolor, bcolor],
				 xAxisLabelWidth: 50,
				 yAxisLabelWidth: 50
				 });
		
		request.jQuery("#trend_chart").children().children().each(function() {
			if ($(this).attr("style").match("bottom: 0px")) {
				$(this).css("margin-bottom", "-.5em");
			}
		});*/
					
					//overflow: hidden; position: absolute; font-size: 10px; z-index: 10; 
					//color: black; width: 50px; text-align: center; bottom: 0px; left: 226.533px;
	},
	
	
	insert_progress_averages: function(request) {
		var self = this;
		this.prefs.set('progress_state', 'averages');

		var substate_menu_items = this.make_substate_menu_items('averages',
			constants.PROGRESS_STATE_ENUM,
			constants.PROGRESS_STATE_TAB_NAMES,
			constants.PROGRESS_STATE_IMAGES);
		var substate_menu = Template.get("progress_submenu").render(
				new Context({ substate_menu_items: substate_menu_items })
			);
		
		var middle = Template.get("progress_averages_middle").render(
			new Context({
				substate_menu: substate_menu,
				constants: constants,
			})
		);
		request.jQuery("#content").html( middle );
		
		this.insert_averages_graph(request);
		
		this.activate_substate_menu_items(request, 'averages',
			constants.PROGRESS_STATE_ENUM, constants.PROGRESS_STATE_INSERTS, constants.PROGRESS_STATE_PROCESSORS);
	},
	
	insert_averages_graph: function(request) {
		var self = this;
		
		// day of week x hour of day
		//var data_matrix = [];
		var data_array = [];
		var xs = [];
		var ys = []
		// initialize data
		for (var day = 0; day < 7; day++) {
			//data_matrix[day] = [];
			for (var hour = 0; hour < 24; hour++) {
				//data_matrix[day][hour] = 0;
				var idx = day*hour + hour;
				data_array[idx] = 0;
				xs[idx] = hour;
				ys[idx] = day;
			}
		}
		logger("computed defaults");
		// sum visits into data
		this.pddb.Visit.select({}, function(row) {
			if (row.site().sitegroup().tag().id == self.pddb.ProcrasDonate.id) {
				var d = _un_dbify_date(row.enter_at);
				var day = d.getDay() - 1;
				if (day == -1) { day = 6; }
				var hour = d.getHours();
				var v = parseInt(row.duration);
				if (isNaN(v)) {
					logger(" NaN!! "+row.duration);
					v = 0;
				}
				//data_matrix[day][d.getHours()] += parseInt(row.duration);
				data_array[day*hour + hour] = 5;//+= v;
			}
		}/*, "enter_at"*/);
		logger("computed data");
		// create dot graph
		init_raphael(request.get_document());
		init_graphael();
		init_graphael_dot();
		logger("init raphael");
		var paper = Raphael("chart");
		xs = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
		ys = [7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
	    data_array = [294, 300, 204, 255, 348, 383, 334, 217, 114, 33, 44, 26, 41, 39, 52, 17, 13, 2, 0, 2, 5, 6, 64, 153, 294, 313, 195, 280, 365, 392, 340, 184, 87, 35, 43, 55, 53, 79, 49, 19, 6, 1, 0, 1, 1, 10, 50, 181, 246, 246, 220, 249, 355, 373, 332, 233, 85, 54, 28, 33, 45, 72, 54, 28, 5, 5, 0, 1, 2, 3, 58, 167, 206, 245, 194, 207, 334, 290, 261, 160, 61, 28, 11, 26, 33, 46, 36, 5, 6, 0, 0, 0, 0, 0, 0, 9, 9, 10, 7, 10, 14, 3, 3, 7, 0, 3, 4, 4, 6, 28, 24, 3, 5, 0, 0, 0, 0, 0, 0, 4, 3, 4, 4, 3, 4, 13, 10, 7, 2, 3, 6, 1, 9, 33, 32, 6, 2, 1, 3, 0, 0, 4, 40, 128, 212, 263, 202, 248, 307, 306, 284, 222, 79, 39, 26, 33, 40, 61, 54, 17, 3, 0, 0, 0, 3, 7, 70, 199];
	    var axisy = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
	    var axisx = ["12am", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12pm", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"];
	    
	    logger("DATA ARRAY length = "+data_array.length+" "+xs.length+" "+ys.length);
	    //_pprint(data_array, "DATA");
	    
	    paper.g.txtattr.font = "11px 'Fontin Sans', Fontin-Sans, sans-serif";
	    
	    xs   = [0,1,2,0,1,2,0,1,2];
	    yx   = [2,2,2,1,1,1,0,0,0];
	    data_array = [3,4,1,9,2,4,3,0,0];
    
	    paper.g.dotchart(
	    		100,
	    		100,
	    		620,
	    		260,
	    		xs,
	    		ys,
	    		data_array);
	    		/*{	symbol: "o",
	    			max: 10,
	    			heat: true,
	    			axis: "0 0 1 1",
	    			axisxstep: 2,
	    			axisystep: 2,
	    			axisxlabels: axisx,
	    			axisxtype: " ",
	    			axisytype: " ",
	    			axisylabels: axisy });*//*.hover(function () {
	    				this.tag = this.tag || paper.g.tag(this.x, this.y, this.value, 0, this.r + 2).insertBefore(this);
	    				this.tag.show();
	    			}, function () {
	    				this.tag && this.tag.hide();
	    			});*/
	    logger("drawn graph");
	},
	
	/*************************************************************************/
	/******************************* REGISTER ********************************/
	
	insert_register_incentive: function(request) {
		var self = this;
		this.prefs.set('register_state', 'incentive');
		
		var substate_menu_items = this.make_substate_menu_items('incentive',
				constants.REGISTER_STATE_ENUM, constants.REGISTER_STATE_TAB_NAMES);
		var substate_menu = Template.get("register_submenu").render(
				new Context({
					substate_menu_items: substate_menu_items,
					submenu_id: "register_track"
				}));
		var arrows = Template.get("register_arrows").render(
				new Context({ substate_menu_items: substate_menu_items }));

		var pd_dollars_per_hr = self.retrieve_float_for_display('pd_dollars_per_hr', constants.DEFAULT_PD_DOLLARS_PER_HR);
		var pd_hr_per_week_max = self.retrieve_float_for_display('pd_hr_per_week_max', constants.DEFAULT_PD_HR_PER_WEEK_MAX);
		var pd_dollars_per_week_max = (parseFloat(pd_dollars_per_hr) * parseFloat(pd_hr_per_week_max)).toFixed(2);
		logger("INCENTIVE:\npd_dollars_per_hr"+pd_dollars_per_hr+
				"\npd_hr_per_week_max"+pd_hr_per_week_max+
				"\npd_dollars_per_week_max"+pd_dollars_per_week_max);
		
		var middle = Template.get("register_incentive_middle").render(
			new Context({
				substate_menu_items: substate_menu_items,
				substate_menu: substate_menu,
				arrows: arrows,
				constants: constants,
				pd_dollars_per_hr: pd_dollars_per_hr,
				pd_hr_per_week_goal: self.retrieve_float_for_display('pd_hr_per_week_goal', constants.DEFAULT_PD_HR_PER_WEEK_GOAL),
				pd_hr_per_week_max: pd_hr_per_week_max,
				pd_dollars_per_week_max: pd_dollars_per_week_max
			})
		);
		request.jQuery("#content").html( middle );
		
		this.activate_substate_menu_items(request, 'incentive',
				constants.REGISTER_STATE_ENUM, constants.REGISTER_STATE_INSERTS, constants.REGISTER_STATE_PROCESSORS);
		
		this.activate_register_incentive(request);
		
		this.insert_example_gauges(request);
	},
	
	activate_register_incentive: function(request) {
		var self = this;

		request.jQuery("input[name='pd_dollars_per_hr']").keyup(function() {
			request.jQuery("#rate_error, error").html("");
			var value = request.jQuery.trim(request.jQuery(this).attr("value"));
			if (!value) { return; }
			
			if ( !self.validate_dollars_input(value) ) {
				request.jQuery("#rate_error").html("Please enter a valid dollar amount. For example, to donate $2.34 per hour, please enter 2.34");
			} else {
				var pd_dollars_per_hr = parseFloat(self.clean_dollars_input(value));
				var pd_hr_per_week_max = _un_prefify_float( self.prefs.get('pd_hr_per_week_max', constants.DEFAULT_PD_HR_PER_WEEK_MAX) );
				var pd_dollars_per_week_max = parseFloat(self.clean_dollars_input(request.jQuery("input[name='pd_dollars_per_week_max']").attr("value")));
				
				var pd_hr_per_week_max = pd_dollars_per_week_max / pd_dollars_per_hr;
				var pd_hr_per_week_goal = self.prefs.get('pd_hr_per_week_goal', constants.DEFAULT_PD_HR_PER_WEEK_GOAL);
				
				self.prefs.set('pd_dollars_per_hr', _prefify_float(pd_dollars_per_hr));
				self.prefs.set('pd_hr_per_week_max', _prefify_float(pd_hr_per_week_max));
				
				request.jQuery("#pd_hr_per_week_max_span").text(pd_hr_per_week_max.toFixed(2));
				request.jQuery("#pd_dollars_per_week_max").attr("value", pd_dollars_per_week_max.toFixed(2));
				
				self.insert_example_gauges(request);
				
				if (pd_hr_per_week_max < pd_hr_per_week_goal) {
					request.jQuery("#max_error").html("Your hourly <span class=\"hourly_rate_color\">incentive</span> "+
							"multiplied by your weekly <span class=\"weekly_goal_color\">goal</span> "+
							"must be less than your weekly <span class=\"weekly_limit_color\">limit</span>.");
				}
			}
		});
		
		request.jQuery("input[name='pd_hr_per_week_goal']").keyup(function() {
			request.jQuery("#goal_error, error").html("");
			var value = request.jQuery.trim(request.jQuery(this).attr("value"));
			if (!value) { return; }
			
			if ( !self.validate_hours_input(value) ) {
				request.jQuery("#goal_error").html("Please enter number of hours. For example, to strive for 8 hrs and 15 minutes, please enter 1.25");
			} else {
				self.prefs.set('pd_hr_per_week_goal', self.clean_hours_input(value));
				self.insert_example_gauges(request);
			}
		});
		
		// this input no longer used in favor of pd_dollars_per_week_max
		request.jQuery("input[name='pd_hr_per_week_max']").keyup(function() {
			request.jQuery("#max_error, error").html("");
			var value = request.jQuery.trim(request.jQuery(this).attr("value"));
			if (!value) { return; }
			
			if ( !self.validate_hours_input(value) ) {
				request.jQuery("#max_error").html("Please enter number of hours. For example, enter 30 minutes as .5");
			} else {
				self.prefs.set('pd_hr_per_week_max', self.clean_hours_input(value));
				self.insert_example_gauges(request);
			}
		});
		
		request.jQuery("input[name='pd_dollars_per_week_max']").keyup(function() {
			request.jQuery("#max_error, error").html("");
			var value = request.jQuery.trim(request.jQuery(this).attr("value"));
			if (!value) { return; }
			
			if ( !self.validate_dollars_input(value) ) {
				request.jQuery("#max_error").html("Please enter the maximum dollar amount you would spend each week.");
			} else {
				var pd_dollars_per_hr = request.jQuery("input[name='pd_dollars_per_hr']").attr("value");
				var pd_hr_per_week_max = _un_prefify_float( self.prefs.get('pd_hr_per_week_max', constants.DEFAULT_PD_HR_PER_WEEK_MAX) );
				var pd_dollars_per_week_max = parseFloat( self.clean_dollars_input(value) );
				
				var pd_hr_per_week_max = pd_dollars_per_week_max / pd_dollars_per_hr;
				var pd_hr_per_week_goal = self.prefs.get('pd_hr_per_week_goal', constants.DEFAULT_PD_HR_PER_WEEK_GOAL);
				
				self.prefs.set('pd_hr_per_week_max', _prefify_float( pd_hr_per_week_max ));
				
				request.jQuery("#pd_hr_per_week_max_span").text( pd_hr_per_week_max.toFixed(2) );
				self.insert_example_gauges(request);
				
				if (pd_hr_per_week_max < pd_hr_per_week_goal) {
					request.jQuery("#max_error").html("Your hourly <span class=\"hourly_rate_color\">incentive</span> "+
							"multiplied by your weekly <span class=\"weekly_goal_color\">goal</span> "+
							"must be less than your weekly <span class=\"weekly_limit_color\">limit</span>.");
				}
			}
		});
	},
	
	insert_example_gauges: function(request) {
		var max = _un_prefify_float(this.prefs.get("pd_hr_per_week_max", constants.DEFAULT_PD_HR_PER_WEEK_MAX));
		var goal = _un_prefify_float(this.prefs.get("pd_hr_per_week_goal", constants.DEFAULT_PD_HR_PER_WEEK_GOAL));
		
		/*
		var happy_example = goal / 2;
		if (Math.round(happy_example) == goal) { happy_example -= 1; }
		
		var unhappy_example = (max - goal) / 2 + goal;
		if (Math.round(unhappy_example) == goal) { unhappy_example += 1; }
		
		this.insert_example_gauge(request, goal, max, happy_example, "happy_example_gauge");
		this.insert_example_gauge(request, goal, max, unhappy_example, "unhappy_example_gauge");
		*/
		this.insert_example_gauge(request, goal, max, 0, "happy_example_gauge");
	},
	
	insert_example_gauge: function(request, goal, max, value, id) {
		var self = this;
		
		var width = 300;
		var data = new google.visualization.DataTable();
		data.addColumn('string', 'Label');
		data.addColumn('number', 'Value');
		data.addRows(1);
		data.setValue(0, 0, 'hours per week');
		data.setValue(0, 1, value);

		var chart = new google.visualization.Gauge( request.jQuery("#"+id).get(0) );

		// create labels for major ticks
		var major_tick_labels = [];
		var major_tick_SPACES_count = Math.min(5, max);
		for (var i = 0; i <= major_tick_SPACES_count; i++) {
			major_tick_labels.push( Math.round(max / major_tick_SPACES_count * i) );
		}
		
		var options = {
			width : width,
			height : 250,
			min: 0,
			max: Math.round(max),
			greenFrom : 0,
			greenTo : Math.round(goal),
			redFrom : Math.round(goal),
			redTo : Math.round(max),
			minorTicks : 5,
			majorTicks: major_tick_labels
		};
		chart.draw(data, options);
		
		var first = true;
		var r = request.jQuery("text").get(0);
		if (r) { request.jQuery(r).css("font-size", "1.1em"); }
		request.jQuery("g g text").attr("stroke", "#DDDDDD");
	},
	
	process_register_incentive: function(request) {
		var self = this;
		var pd_dollars_per_hr = request.jQuery("input[name='pd_dollars_per_hr']").attr("value");
		var pd_hr_per_week_goal = request.jQuery("input[name='pd_hr_per_week_goal']").attr("value");
		var pd_dollars_per_week_max = request.jQuery("input[name='pd_dollars_per_week_max']").attr("value");
	
		var pd_hr_per_week_max = pd_dollars_per_week_max / pd_dollars_per_hr;
		
		request.jQuery("#errors").html("");
		if ( !this.validate_dollars_input(pd_dollars_per_hr) ) {
			request.jQuery("#rate_error").html("Please enter a valid dollar amount. For example, to donate $2.34 per hour, please enter 2.34");
			
		} else if ( !this.validate_hours_input(pd_hr_per_week_goal) ) {
			request.jQuery("#goal_error").html("Please enter number of hours. For example, to strive for 8 hrs and 15 minutes, please enter 1.25");
			
		} else if ( !this.validate_hours_input(pd_hr_per_week_max) ) {
			request.jQuery("#max_error").html("Please enter number of hours. For example, enter 30 minutes as .5");
			
		} else if (parseFloat(pd_hr_per_week_goal) > parseFloat(pd_hr_per_week_max)) { 
			request.jQuery("#max_error").html("Your hourly <span class=\"hourly_rate_color\">incentive</span> "+
					"multiplied by your weekly <span class=\"weekly_goal_color\">goal</span> "+
					"must be less than your weekly <span class=\"weekly_limit_color\">limit</span>.");

		} else {
			this.prefs.set('pd_dollars_per_hr', this.clean_dollars_input(pd_dollars_per_hr));
			this.prefs.set('pd_hr_per_week_goal', this.clean_hours_input(pd_hr_per_week_goal));
			this.prefs.set('pd_hr_per_week_max', this.clean_hours_input(pd_hr_per_week_max));
			return true;
		}
		return false;
	},

	RECIPIENT_PERCENT_COLORS: [
		"#b4daf4",
		"#e92928",
		"#77c375",
		"#fbc236",
		"#ee9feb",
		"#f9cade",
		"#3f5caa",
		"#f6e801",
		"#d1c1c4",
		"#d0ea23"],
	
	insert_register_charities: function(request) {
		var self = this;
		this.prefs.set('register_state', 'charities');
		
		var substate_menu_items = this.make_substate_menu_items('charities',
				constants.REGISTER_STATE_ENUM, constants.REGISTER_STATE_TAB_NAMES);
		var substate_menu = Template.get("register_submenu").render(
			new Context({
				substate_menu_items: substate_menu_items,
				submenu_id: "register_track"
			}));
		var arrows = Template.get("register_arrows").render(
				new Context({ substate_menu_items: substate_menu_items }));
		
		var categories = [];
		this.pddb.Category.select({}, function(row) {
			categories.push(row)
		});
		
		var chosen_charities = [];
		var chosen_charities_rows = [];
		this.pddb.RecipientPercent.select({}, function(row) {
			var recipient = row.recipient();
			if (recipient.bool_is_visible()) {
				var html = Template.get("recipient_with_percent_snippet").render(
					new Context({
						constants: constants,
						deep_recip_pct: row,
						percent_color: self.RECIPIENT_PERCENT_COLORS[chosen_charities.length]
					})
				);
				chosen_charities.push(html);
				chosen_charities_rows.push(recipient);
			}
		}, "-percent");
		
		var staff_picks = [];
		var recently_added = [];
		this.pddb.Recipient.select({}, function(row) {
			if (row.bool_is_visible()) {
				var chosen = false;
				_iterate(chosen_charities_rows, function(key, value, index) {
					if (value.id == row.id) { chosen = true; }
				});
				if (!chosen) {
					var html = Template.get("recipient_snippet").render(
						new Context({
							constants: constants,
							recipient: row
						})
					);
					if (row.slug == "bilumi") {
						staff_picks.push(html);
					} else {
						recently_added.push(html);
					}
				}
			}
		});
		
		var middle = Template.get("register_charities_middle").render(
			new Context({
				constants: constants,
				substate_menu_items: substate_menu_items,
				substate_menu: substate_menu,
				arrows: arrows,
				categories: categories,
				chosen_charities: chosen_charities,
				staff_picks: staff_picks,
				recently_added: recently_added
			})
		);
		request.jQuery("#content").html( middle );
		
		this.insert_register_charities_pie_chart(request);
		this.activate_register_charities(request);
		
		this.activate_substate_menu_items(request, 'charities',
			constants.REGISTER_STATE_ENUM, constants.REGISTER_STATE_INSERTS, constants.REGISTER_STATE_PROCESSORS);
	},
	
	insert_register_charities_pie_chart: function(request) {
		// clear existing chart
		request.jQuery("#pie_chart").html("");
		
		// if no chart to show then leave
		if (this.pddb.RecipientPercent.count() == 0) {
			return
		}
		
		var self = this;
		var data = [];
		var legend = [];
		var colors = [];
		this.pddb.RecipientPercent.select({}, function(row) {
			data.push(row.display_percent());
			legend.push(row.recipient().name+" ("+row.display_percent()+"%)");
			colors.push(self.RECIPIENT_PERCENT_COLORS[colors.length]);
		}, "-percent");
		
		init_raphael(request.get_document());
		init_graphael();
		init_graphael_pie();
		
		// create pie chart
		var paper = Raphael("pie_chart", 550, 250);
		var pie = paper.g.piechart(125, 125, 100,
				data,
				{ legend: legend,
				  legendpos: "east",
				  colors: colors });

		// add cool effects (copied from g.raphael demo)
        pie.hover(function () {
            this.sector.stop();
            this.sector.scale(1.1, 1.1, this.cx, this.cy);
            if (this.label) {
                this.label[0].stop();
                this.label[0].scale(1.5);
                this.label[1].attr({"font-weight": 800});
            }
        }, function () {
            this.sector.animate({scale: [1, 1, this.cx, this.cy]}, 500, "bounce");
            if (this.label) {
                this.label[0].animate({scale: 1}, 500, "bounce");
                this.label[1].attr({"font-weight": 400});
            }
        });
	},
	
	activate_register_charities: function(request) {
		var self = this;
		// activate add and remove buttons per recipient
		request.jQuery(".recipient").each( function() {
			self.activate_a_recipient(request, request.jQuery(this));
		});
		// activate recipient suggestion
		request.jQuery("#new_recipient_submit").click(function() {
			var value = request.jQuery("#new_recipient_name").attr("value").trim();
			if (!value || value == "") return
			
			var slug = slugify(value);
			if (!slug || slug == "") {
				slug = "blank_" + parseInt(Math.random()*10000)
			}
			// ensure unique slug
			if (self.pddb.Recipient.get_or_null({ slug: slug })) {
				slug = slug + "_" + parseInt(Math.random()*10000);
			}
			// create User Created category if necessary
			var category = self.pddb.Category.get_or_create({ category: "User Created" });
			// create recipient and recipient percent
			var recipient = self.pddb.Recipient.create({
				slug: slug,
				name: value,
				category_id: category.id,
				is_visible: _dbify_bool(true),
				pd_registered: _dbify_bool(false)
			});
			var recipient_pct = self.pddb.RecipientPercent.create({
				recipient_id: recipient.id,
				percent: 0
			});
			// insert into DOM
			var html = Template.get("recipient_with_percent_snippet").render(
				new Context({
					constants: constants,
					deep_recip_pct: recipient_pct
				})
			);
			var x = request.jQuery(html);
			request.jQuery("#chosen_charities").prepend(x);
			// clear input
			request.jQuery("#new_recipient_name").attr("value", "");
			self.activate_a_recipient(request, x);
			self.insert_register_charities_pie_chart(request);
		});
	},
	
	/**
	 * redistribute lost points among remaining selected charities
	 * @param amount: float amount to redistribute (0, 1)
	 * 		a negative amount will be subtracted from percents
	 * @param not_id: id of the recipient percent from which the
	 * 		redistribution is coming from. thus, don't redistribute to it
	 */
	redistribute_percents: function(amount, not_id) {
		if (!amount) { return; }
		var self = this;
		// calculate the count based on percents eligible for redistribution
		var count = 0;
		self.pddb.RecipientPercent.select({}, function(row) {
			if (not_id && row.id == not_id) { return }
			if (parseFloat(row.percent) <= 0 && amount < 0) { return }
			if (parseFloat(row.percent) >= 1 && amount > 0) { return }
			count += 1;
		});
		if (count > 0) {
			var each = amount / count;
			var total_redistributed = 0;

			self.pddb.RecipientPercent.select({}, function(row) {
				// don't redistribute to source recipient percent
				if (not_id && row.id == not_id) { return }
				if (parseFloat(row.percent) <= 0 && amount < 0) { return }
				if (parseFloat(row.percent) >= 1 && amount > 0) { return }
				
				var amt = parseFloat(row.percent) + each;
				if (amt < 0) { amt = 0; }
				if (amt > 1) { amt = 1; }
				total_redistributed += amt - parseFloat(row.percent)
				self.pddb.RecipientPercent.set({
					percent: amt
				}, {
					id: row.id
				});
			});
			
			//logger("TOTAL RED "+total_redistributed+", ORIG AMOUNT "+amount);
			
			// might have left-overs to redistribute if a percent got capped at 0 or 1
			if (Math.abs(total_redistributed) > 0.001 &&
					Math.abs(total_redistributed - amount) > 0.001) {
				self.redistribute_percents((amount - total_redistributed), not_id); 
			}
		}
	},
	
	update_displayed_percents: function(request) {
		var self = this;
		//request.jQuery("#chosen_charities").html("");
		var i = 0;
		self.pddb.RecipientPercent.select({}, function(row) {
			/*
			var html = Template.get("recipient_with_percent_snippet").render(
				new Context({
					deep_recip_pct: row,
					percent_color: self.RECIPIENT_PERCENT_COLORS[i]
				})
			);
			//request.jQuery("#chosen_charities").append( html );
			*/
			
			// set percent amount on recipient with percent
			request.jQuery(".recipient[alt="+row.recipient_id+"]")
			.children(".recipient_percent")
				.children(".percent")
				.text(row.display_percent());
			
			// set dot background color on recipient with percent
			request.jQuery(".recipient[alt="+row.recipient_id+"]")
			.children(".recipient_percent")
				.children(".pie_sector_color")
				.css("background", self.RECIPIENT_PERCENT_COLORS[i]);
			
			i += 1;
		}, "-percent");
		/*
		 * reinserts all the recipient with percent blocks
		request.jQuery("#chosen_charities").children(".recipient").each( function() {
			self.activate_a_recipient(request, request.jQuery(this));
		});
		*/
	},
	
	/*
	 * initial percents -> action -> outcome
	 * -------------------------------------
	 * 1. percents should always sum to 100%
	 * 2. percents should always be integers?
	 * 3. philosophy of add and remove:
	 *      make no changes to other percents
	 *      because ?? might be part of larger action (eg, swap)
	 * 
	 * []         -> add Z    -> [Z:100]
	 * [A:x]      -> add Z    -> [A:x, Z:0]
	 * [A:x, B:y] -> add Z    -> [A:x, B:y, Z:0]
	 * [A:x, B:y] -> remove B -> [A:x]
	 * [A:x]      -> remove A -> []
	 * 
	 * 4. philosophy of up and down:
	 *      +/- 5 to acted on percent--capped at 0-100
	 *      redistribute lost 5 evenly amongst others
	 * 
	 * [A:x, B:y, C:z] -> C+5 -> [A:x-2, B:y-3, C:z+5]
	 * [A:x, B:y]      -> B+5 -> [A:x-5, B:y-5]
	 * [A:x]           -> A+5 -> [A:x]
	 */
	activate_a_recipient: function(request, recipient_elem) {
		var self = this;
		recipient_elem.children(".recipient_id").hide();
		
		var dtoggle = recipient_elem.children(".mission").children(".description_toggle");
		dtoggle.click( function() {
			if (dtoggle.text() == "(less)") {
				dtoggle.text("(more)");
				dtoggle.parent().siblings(".description").hide();
			} else {
				dtoggle.text("(less)");
				dtoggle.parent().siblings(".description").show();
			}
		})
		if (dtoggle.text() == "(less)") {
			dtoggle.text("(more)")
			dtoggle.parent().siblings(".description").hide();
		}
		
		var user_recipients_div = request.jQuery("#chosen_charities");
		var potential_recipients_div = request.jQuery("#removed_charities_temporary");
		
		recipient_elem.children(".add_recipient").children(".add_img").click(function() {
			//logger("ADD RECIP");
			var recipient_id = request.jQuery(this).parent().siblings(".recipient_id").text();
			var recipient = self.pddb.Recipient.get_or_null({ id: recipient_id });
			// percent is 0 unless no other recipients are selected
			// total percent should always sum to 1.
			var percent = 0;
			if (self.pddb.RecipientPercent.count() == 0) {
				percent = 1;
			}
			var recipient_pct = self.pddb.RecipientPercent.create({
				recipient_id: recipient_id,
				percent: percent
			});
			request.jQuery(this).parent().parent().fadeOut("slow", function() {
				request.jQuery(this).remove();
			});
			
			var new_recip = request.jQuery(
					Template.get("recipient_with_percent_snippet").render(
							new Context({ deep_recip_pct: recipient_pct })));
			
			user_recipients_div.append(new_recip);
			self.activate_a_recipient(request, new_recip);
			self.insert_register_charities_pie_chart(request);
			self.update_displayed_percents(request);
		});
		
		//recipient_elem.css("background", "red");
		//recipient_elem.children(".remove_recipient").css("background", "green");
		//recipient_elem.children(".remove_recipient").children(".remove_img").css("border", "4px solid black");
		
		recipient_elem.children().children().children().children()
			.children().children(".remove_recipient").children(".remove_img").click(function() {
			//logger("REMOVE RECIP: "+request.jQuery(this).attr("class"));
			
			var r_elem = request.jQuery(this).parent().parent().parent().parent()
				.parent().parent().parent();

			var recipient_id = r_elem.children(".recipient_id").text();
			
			var rp = self.pddb.RecipientPercent.get_or_null({
				recipient_id: recipient_id });
			
			var remove_pct = parseFloat(rp.percent);
			
			self.pddb.RecipientPercent.del({
				recipient_id: recipient_id
			});
			
			self.redistribute_percents(remove_pct);
			
			// add unselected charity to unselected section
			var recipient = self.pddb.Recipient.get_or_null({ id: recipient_id });
			
			//request.jQuery(this).parent().clone(true).insertAfter(spacer);
			r_elem.fadeOut("slow", function() {
				request.jQuery(this).remove();
			});
			
			var context = new Context({
				constants: constants,
				recipient: recipient
			});
			var new_recip = request.jQuery(Template.get("recipient_snippet").render(context));
			
			potential_recipients_div.prepend(new_recip);
			self.activate_a_recipient(request, new_recip);
			self.insert_register_charities_pie_chart(request);
			self.update_displayed_percents(request);
		});
		
		recipient_elem.children(".recipient_percent").children(".up_arrow, .down_arrow").click(function() {
			//logger("UP OR DOWN");
			// arrows only work if there are multiple recipient percents
			if (self.pddb.RecipientPercent.count() == 1) {
				return;
			}
			
			// using recipient_elem doesn't work
			// var id = recipient_elem.children(".recipient_id").text();
			var id = request.jQuery(this).parent().siblings(".recipient_id").text();

			var r = self.pddb.Recipient.get_or_null({
				id: id
			});
			var rp = r.recipient_percent();
			
			var new_pct = 0;
			if (request.jQuery(this).attr("class") == "up_arrow") {
				new_pct = parseFloat(rp.percent) + .05;
			} else if (request.jQuery(this).attr("class") == "down_arrow") {
				new_pct = parseFloat(rp.percent) - .05;
			} else {
				self.pddb.orthogonals.warn("Up or Down recipient percent Arrow is not up or down! "+request.jQuery(this).attr("class"));
			}
			if (new_pct > 1) { new_pct = 1; }
			if (new_pct < 0) { new_pct = 0; }
			
			self.pddb.RecipientPercent.set({
				percent: new_pct
			}, {
				id: rp.id
			});
			
			var diff = parseFloat(rp.percent) - new_pct;
			self.redistribute_percents(diff, rp.id);
			
			self.insert_register_charities_pie_chart(request);
			self.update_displayed_percents(request);
		});
	},
	
	process_register_charities: function(request) {
		var self = this;
		var ret = true;
		request.jQuery("#errors, .arrow_errors").html("");
		
		request.jQuery(".recipient_percent input").each( function() {
			var percent = request.jQuery(this).attr("value");
			try {
				percent = parseFloat(percent) / 100.0;
				if (percent <= 0 || percent > 1.0) {
					request.jQuery("#errors, .arrow_errors").append("<p>Please enter a percent greater than 0 and at most 100</p>");
					ret = false;
				}
			} catch(e) {
				request.jQuery("#errors, .arrow_errors").append("<p>Please enter a number, such as 5.24 for 5.24%</p>");
				ret = false;
			}
			var recipient_id = request.jQuery(this).parent().siblings(".recipient_id").text();
			if (ret && percent && recipient_id) {
				self.pddb.RecipientPercent.set({ percent: percent }, { recipient_id: recipient_id });
			}
		});
		if (self.pddb.RecipientPercent.count() == 0) {
			ret = false
			request.jQuery("#errors, .arrow_errors").append("<p>Please add at least one recipient</p>");
		}
		return ret;
	},
	
	insert_register_content: function(request) {
		var self = this;
		this.prefs.set('register_state', 'content');
		
		var substate_menu_items = this.make_substate_menu_items('content',
				constants.REGISTER_STATE_ENUM, constants.REGISTER_STATE_TAB_NAMES);
		var substate_menu = Template.get("register_submenu").render(
			new Context({
				substate_menu_items: substate_menu_items,
				submenu_id: "register_track"
			}));
		var arrows = Template.get("register_arrows").render(
			new Context({ substate_menu_items: substate_menu_items }));
		
		var middle = Template.get("register_content_middle").render(
			new Context({
				substate_menu_items: substate_menu_items,
				substate_menu: substate_menu,
				arrows: arrows,
				tws_dollars_per_hr: self.retrieve_float_for_display('tws_dollars_per_hr', constants.DEFAULT_TWS_DOLLARS_PER_HR),
				//tws_hr_per_week_goal: self.retrieve_float_for_display('tws_hr_per_week_goal', constants.DEFAULT_TWS_HR_PER_WEEK_GOAL),
				tws_hr_per_week_max: self.retrieve_float_for_display('tws_hr_per_week_max', constants.DEFAULT_TWS_HR_PER_WEEK_MAX),
			})
		);
		request.jQuery("#content").html( middle );
		
		this.activate_substate_menu_items(request, 'content',
			constants.REGISTER_STATE_ENUM, constants.REGISTER_STATE_INSERTS, constants.REGISTER_STATE_PROCESSORS);
	},
	
	process_register_content: function(request) {
		var self = this;
		var tws_dollars_per_hr = request.jQuery("input[name='tws_dollars_per_hr']").attr("value");
		//var tws_hr_per_week_goal = request.jQuery("input[name='tws_hr_per_week_goal']").attr("value");
		var tws_hr_per_week_max = request.jQuery("input[name='tws_hr_per_week_max']").attr("value");

		request.jQuery("#errors, .arrow_errors").text("");
		if ( !this.validate_dollars_input(tws_dollars_per_hr) ) {
			request.jQuery("#errors, .arrow_errors").append("<p>Please enter a valid dollar amount. For example, to donate $2.34 per hour, please enter 2.34</p>");
			
		//} else if ( !this.validate_hours_input(tws_hr_per_week_goal) ) {
		//	request.jQuery("#errors").append("<p>Please enter number of hours. For example, to strive for 8 hrs and 15 minutes, please enter 1.25</p>");
			
		} else if ( !this.validate_hours_input(tws_hr_per_week_max) ) {
			request.jQuery("#errors, .arrow_errors").append("<p>Please enter number of hours. For example, enter 30 minutes as .5</p>");
			
		} else {
			this.prefs.set('tws_dollars_per_hr', this.clean_dollars_input(tws_dollars_per_hr));
			//this.prefs.set('tws_hr_per_week_goal', this.clean_hours_input(tws_hr_per_week_goal));
			this.prefs.set('tws_hr_per_week_max', this.clean_hours_input(tws_hr_per_week_max));
			return true;
		}
		return false;
	},
	

	insert_register_support: function(request) {
		var self = this;
		this.prefs.set('register_state', 'support');
		
		var substate_menu_items = this.make_substate_menu_items('support',
				constants.REGISTER_STATE_ENUM, constants.REGISTER_STATE_TAB_NAMES);
		var substate_menu = Template.get("register_submenu").render(
			new Context({
				substate_menu_items: substate_menu_items,
				submenu_id: "register_track"
			}));
		var arrows = Template.get("register_arrows").render(
			new Context({ substate_menu_items: substate_menu_items }));
		
		var middle = Template.get("register_support_middle").render(
			new Context({
				substate_menu_items: substate_menu_items,
				substate_menu: substate_menu,
				arrows: arrows,
				support_pct: self.retrieve_percent_for_display('support_pct', constants.DEFAULT_SUPPORT_PCT),
				monthly_fee: self.retrieve_float_for_display('monthly_fee', constants.DEFAULT_MONTHLY_FEE),
			})
		);
		request.jQuery("#content").html( middle );
		
		this.activate_register_support(request);
		
		this.activate_substate_menu_items(request, 'support',
			constants.REGISTER_STATE_ENUM, constants.REGISTER_STATE_INSERTS, constants.REGISTER_STATE_PROCESSORS);
	},
	
	activate_register_support: function(request) {
		/*logger("JQUERY VIEW NORMAL");
		var keys = [];
		for (var k in request.jQuery) { keys.push(k); }
		_pprint(keys);
		
		var jq = request.jQuery;
		
		logger("JQUERY VIEW VAR");
		var keys = [];
		for (var k in jq) { keys.push(k); }
		_pprint(keys);
		
		jQuery_UI(request);
		
		var jq = _bind(request, request.jQuery);
		
		logger("JQUERY VIEW BIND");
		var keys = [];
		for (var k in jq) { keys.push(k); }
		_pprint(keys);*/
		
		//var jq = requestjQuery;
		//jq("#monthly_fee").effect("bounce");
		//jq("#monthly_fee_slider").slider({ handle: ".ui-slider-handle" });
		//jq("#monthly_fee_slider").slider();
		//jq("#frame_for_slider").append("<div id=\"monthly_fee_slider\"></div>");

		//////////////////////////////////////////////////////////////////
		var jq = request.add_jQuery_ui();
		jq("#monthly_fee_slider").slider();
		//////////////////////////////////////////////////////////////////
		
		//var slider = new Slider(request.jQuery);
		
		//jQuery_UI(jq);
		
		//var handle = $("<div class=\"ui-slider-handle\"></div>")
		//request.jQuery("#monthly_fee_slider").append(handle);
		//jq("#monthly_fee_slider").slider({ handle: handle });
	},
	
	process_register_support: function(request) {
		var self = this;
		var support_pct = request.jQuery("input[name='support_pct']").attr("value");
		var monthly_fee = request.jQuery("input[name='monthly_fee']").attr("value");

		request.jQuery(".error, .arrow_errors").text("");
		if ( !this.validate_positive_float_input(support_pct) ) {
			request.jQuery("#support_error, .arrow_errors").append("<p>Please enter a valid percent. For example, 6.75 for 6.75%</p>");
			
		} else if ( !this.validate_dollars_input(monthly_fee) ) {
			request.jQuery("#monthly_error, .arrow_errors").append("<p>Please enter a valid amount. For example, 4.99 for $4.99</p>");
			
		} else if ( parseFloat(support_pct) > 10.0 ) {
			request.jQuery("#support_error, .arrow_errors").append("<p>We cannot accept more than 10%. Please enter a lower percent. For example, 10 for 10%.</p>");
		} else {
			this.prefs.set('support_pct', this.clean_percent_input(support_pct));
			this.prefs.set('monthly_fee', this.clean_dollars_input(monthly_fee));
			return true;
		}
		return false;
	},
	
	insert_register_updates: function(request) {
		var self = this;
		this.prefs.set('register_state', 'updates');
		
		var substate_menu_items = this.make_substate_menu_items('updates',
				constants.REGISTER_STATE_ENUM, constants.REGISTER_STATE_TAB_NAMES);
		var substate_menu = Template.get("register_submenu").render(
			new Context({
				substate_menu_items: substate_menu_items,
				submenu_id: "register_track"
			}));
		var arrows = Template.get("register_arrows").render(
			new Context({ substate_menu_items: substate_menu_items }));
		
		var middle = Template.get("register_updates_middle").render(
			new Context({
				constants: constants,
				substate_menu_items: substate_menu_items,
				substate_menu: substate_menu,
				arrows: arrows,
				email: self.prefs.get('email', constants.DEFAULT_EMAIL),
				tax_deductions: _un_dbify_bool(self.prefs.get('tax_deductions', constants.DEFAULT_ELIGIBLE_FOR_TAX_DEDUCTIONS)),
				tos: _un_dbify_bool(self.prefs.get('tos', constants.DEFAULT_TOS)),
			})
		);
		request.jQuery("#content").html( middle );
		
		this.insert_tax_deductions_middle(request);
		
		this.activate_substate_menu_items(request, 'updates',
			constants.REGISTER_STATE_ENUM, constants.REGISTER_STATE_INSERTS, constants.REGISTER_STATE_PROCESSORS);
	},
	
	insert_tax_deductions_middle: function(request) {
		var self = this;
		
		var address_field_names = ["first_name", "last_name", "mail_address",
		                           "city", "state", "zip", "country"];
		var address_fields = [];
		_iterate(address_field_names, function(key, value, index) {
			address_fields.push({
				name: value,
				display: _displayable(value),
				value: self.prefs.get(value, '')
			});
		});
		
		var middle = Template.get("tax_deductions_middle").render(
			new Context({
				weekly_affirmations: _un_dbify_bool(self.prefs.get('weekly_affirmations', constants.DEFAULT_WEEKLY_AFFIRMATIONS)),
				org_thank_yous: _un_dbify_bool(self.prefs.get('org_thank_yous', constants.DEFAULT_ORG_THANK_YOUS)),
				org_newsletters: _un_dbify_bool(self.prefs.get('org_newsletters', constants.DEFAULT_ORG_NEWSLETTERS)),
				tax_deductions: _un_dbify_bool(self.prefs.get('tax_deductions', constants.DEFAULT_TAX_DEDUCTIONS)),
				address_fields: address_fields
			}));
		request.jQuery("#tax_deductions_middle").html( middle );
		
		this.activate_register_updates(request);
	},
	
	activate_register_updates: function(request) {
		var self = this;
		
		request.jQuery(".tax_deductions_radio").click(function() {
			var value = request.jQuery(this).attr("value");
			if (value == "yes") {
				self.prefs.set('tax_deductions', true);
				request.jQuery(".tax_deductions input").attr("disabled", false);
				request.jQuery(".not_tax_deductions input").attr("disabled", true);
				request.jQuery(".tax_deductions").removeClass("disabled");
				request.jQuery(".not_tax_deductions").addClass("disabled");
				
				self.prefs.set('org_thank_yous', true);
				self.prefs.set('org_newsletters', true);
				request.jQuery(".tax_deductions input[name=org_thank_yous]").attr("checked", true);
				request.jQuery(".tax_deductions input[name=org_newsletters]").attr("checked", true);
			} else {
				self.prefs.set('tax_deductions', _dbify_bool(false));
				request.jQuery(".tax_deductions input").attr("disabled", true);
				request.jQuery(".not_tax_deductions input").attr("disabled", false);
				request.jQuery(".tax_deductions").addClass("disabled");
				request.jQuery(".not_tax_deductions").removeClass("disabled");
				
				self.prefs.set('org_thank_yous', false);
				self.prefs.set('org_newsletters', false);
				request.jQuery(".not_tax_deductions input[name=org_thank_yous]").attr("checked", false);
				request.jQuery(".not_tax_deductions input[name=org_newsletters]").attr("checked", false);
			}
			//self.insert_tax_deductions_middle(request);
		});
		
		request.jQuery("input[type=text]").keyup(function() {
			var name = request.jQuery(this).attr("name");
			var value = request.jQuery(this).attr("value");
			self.prefs.set(name, value);
		});
		
		request.jQuery(".comm_radio").change(function() {
			var name = request.jQuery(this).attr("name");
			var value = request.jQuery(this).attr("checked");
			self.prefs.set(name, value);
		});
	},
	
	process_register_updates: function(request) {
		request.jQuery("#error, .arrow_errors").text("");
		var ret = true;
		
		var old_email = this.prefs.set('email', constants.DEFAULT_EMAIL);
		var email = request.jQuery("#email").attr("value").trim();
		
		var weekly_affirmations = request.jQuery("#weekly_affirmations").attr("checked");
		var org_thank_yous = request.jQuery("#org_thank_yous").attr("checked");
		var org_newsletters = request.jQuery("#org_newsletters").attr("checked");
		var tos = request.jQuery("#tos").attr("checked");
		
		this.prefs.set('email', email);
		this.prefs.set('weekly_affirmations', _dbify_bool(weekly_affirmations));
		this.prefs.set('org_thank_yous', _dbify_bool(org_thank_yous));
		this.prefs.set('org_newsletters', _dbify_bool(org_newsletters));
		this.prefs.set('tos', _dbify_bool(tos));
		
		if (!tos) {
			request.jQuery("#error, .arrow_errors").text("To use our service you must agree to the terms of service by checking the Terms of Service checkbox");
			ret = false;
		}
		
		if (old_email != email) {
			this.pd_api.send_data();
			this.pd_api.send_first_email();
		}
		
		if (this.prefs.get('tax_deductions', constants.DEFAULT_TAX_DEDUCTIONS)) {
			var address_field_names = ["first_name", "last_name", "mail_address",
			                           "city", "state", "zip", "country"];
			_iterate(address_field_names, function(key, value, index) {
				var value = request.jQuery("input[name="+value+"]").attr("value");
				if (!value) {
					request.jQuery("#error, .arrow_errors").text("To be eligible for tax deductions, you must provide your mailing address.");
					ret = false;
				}
			});
		}
		return ret
	},
	
	/**
	 * return maximum amount that would be paid at user's rate and limit
	 * for the given min_auth_time.
	 */
	calculate_max_amount: function(pd_dollars_per_hr, pd_hr_per_week_max, min_auth_time, monthly_fee) {
		var support_method = this.prefs.get('support_method', constants.DEFAULT_SUPPORT_METHOD);
		if (support_method != "monthly") {
			monthly_fee = 0;
		}
		var max_per_week = pd_dollars_per_hr * pd_hr_per_week_max + (monthly_fee / 4.348);
		var total_weeks = 0;
		if (min_auth_time.units == "months" || min_auth_time.units == "month") {
			// 4.348 is the avg number weeks per month
			total_weeks = min_auth_time.time * (365.25 / 12.0 / 7.0);
		} else if (min_auth_time.units == "weeks" || min_auth_time.units == "week") {
			total_weeks = min_auth_time.time;
		} else if (min_auth_time.units == "years" || min_auth_time.units == "year") {
			// 52.12 is the avg number of weeks per year
			total_weeks = min_auth_time.time * (365.25 / 7.0);
		}
		return total_weeks * max_per_week;
	},
	
	insert_register_payments: function(request) {
		var self = this;
		this.prefs.set('register_state', 'payments');
		
		var substate_menu_items = this.make_substate_menu_items('payments',
				constants.REGISTER_STATE_ENUM, constants.REGISTER_STATE_TAB_NAMES);
		var substate_menu = Template.get("register_submenu").render(
				new Context({
					substate_menu_items: substate_menu_items,
					submenu_id: "register_track"}));
		var arrows = Template.get("register_arrows").render(
				new Context({ substate_menu_items: substate_menu_items }));

		// money/time information
		var pd_dollars_per_hr = self.retrieve_float_for_display('pd_dollars_per_hr', constants.DEFAULT_PD_DOLLARS_PER_HR);
		var pd_hr_per_week_max = self.retrieve_float_for_display('pd_hr_per_week_max', constants.DEFAULT_PD_HR_PER_WEEK_MAX);
		var min_auth_time = {
			time: _un_prefify_float(self.prefs.get('min_auth_time', constants.DEFAULT_MIN_AUTH_TIME)),
			units: self.prefs.get('min_auth_units', constants.DEFAULT_MIN_AUTH_UNITS),
		};
		var monthly_fee = _un_prefify_float(self.prefs.get('monthly_fee', constants.DEFAULT_MONTHLY_FEE));
		var max_amount_paid = self.calculate_max_amount(
				pd_dollars_per_hr,
				pd_hr_per_week_max,
				min_auth_time,
				monthly_fee);
		
		var multi_auth = self.pddb.FPSMultiuseAuthorization.most_recent();
		var multi_auth_status = "";
		if (multi_auth) {
			multi_auth_status = Template.get("multi_auth_status").render(
				new Context({ multi_auth: multi_auth })
			);
		}
		
		// form parameters
		var form_params = [
			{ name: "global_amount_limit", value: parseInt(max_amount_paid+1) },
			{ name: "caller_reference", value: create_caller_reference() },
			{ name: "timestamp", value: _dbify_date(new Date()) },
			{ name: "is_recipient_cobranding", value: true },
			{ name: "payment_method", value: "ABT,ACH,CC" },
			{ name: "payment_reason", value: this.prefs.get('fps_payment_reason', constants.DEFAULT_PAYMENT_REASON) },
			{ name: "recipient_slug_list", value: "all" },
			{ name: "version", value: this.prefs.get('fps_version', constants.DEFAULT_FPS_CBUI_VERSION) },
			{ name: "private_key", value: this.prefs.get('private_key', constants.DEFAULT_PRIVATE_KEY) },
		];

		var middle = Template.get("register_payments_middle").render(
				new Context({
					constants: constants,
					substate_menu_items: substate_menu_items,
					substate_menu: substate_menu,
					arrows: arrows,
					support_method: self.prefs.get('support_method', constants.DEFAULT_SUPPORT_METHOD), 
					pd_dollars_per_hr: self.retrieve_float_for_display('pd_dollars_per_hr', constants.DEFAULT_PD_DOLLARS_PER_HR),
					pd_hr_per_week_goal: self.retrieve_float_for_display('pd_hr_per_week_goal', constants.DEFAULT_PD_HR_PER_WEEK_GOAL),
					pd_hr_per_week_max: self.retrieve_float_for_display('pd_hr_per_week_max', constants.DEFAULT_PD_HR_PER_WEEK_MAX),
					min_auth_time: min_auth_time,
					max_amount_paid: parseInt(max_amount_paid+1),
					multi_auth_status: multi_auth_status,
					
					multi_auth: multi_auth,
					form_params: form_params,
					action: constants.PD_URL + constants.AUTHORIZE_MULTIUSE_URL
				})
			);
		request.jQuery("#content").html( middle );
		
		this.activate_substate_menu_items(request, 'payments',
			constants.REGISTER_STATE_ENUM, constants.REGISTER_STATE_INSERTS, constants.REGISTER_STATE_PROCESSORS);
		
		this.insert_support_middle(request);
		
		this.activate_register_payments(request);
		
		// Receive updates from server
		this.pd_api.request_data_updates(
			function() {
				logger("AFTER SUCCESS");
				self.pddb.FPSMultiuseAuthorization.select({}, function(row) {
					logger("multiauth = "+row);
				});
				
				//logger("SERVER SAYS YAY");
				// after success
				var multi_auth = self.pddb.FPSMultiuseAuthorization.get_latest_success()
				//logger("multi auth="+multi_auth);
				if (!multi_auth) {
					multi_auth = self.pddb.FPSMultiuseAuthorization.most_recent();
					//logger("B multi auth="+multi_auth);
				}
				if (multi_auth && multi_auth.good_to_go()) {
					//logger("C multi auth="+multi_auth);
					self.insert_register_done(request);
					return
				}
				
				var html = "";
				if (multi_auth) {
					html = Template.get("multi_auth_status").render(new Context({
						multi_auth: multi_auth,
						server_dont_know: true
					}));
				}
				request.jQuery("#multi_auth_status").html( html );
			}, function() {
				// after failure
			}
		);
	},
		
	insert_support_middle: function(request) {
		var self = this;
		
		var middle = Template.get("support_middle").render(
			new Context({
				support_method: self.prefs.get('support_method', constants.DEFAULT_SUPPORT_METHOD),
				support_pct: self.retrieve_percent_for_display('support_pct', constants.DEFAULT_SUPPORT_PCT),
				monthly_fee: self.retrieve_float_for_display('monthly_fee', constants.DEFAULT_MONTHLY_FEE),
			}));
		request.jQuery("#support_middle").html( middle );
		
		this.activate_support_middle(request);
	},
	
	activate_support_middle: function(request) {
		var self = this;
		
		request.jQuery(".support_method_radio").click(function() {
			var value = request.jQuery(this).attr("value");
			self.prefs.set('support_method', value);
			//self.insert_support_middle(request);
			if (value == "monthly") {
				request.jQuery(".support_method_monthly input").attr("disabled", false);
				request.jQuery(".support_method_monthly").removeClass("disabled");
				
				request.jQuery(".support_method_percent input").attr("disabled", true);
				request.jQuery(".support_method_percent").addClass("disabled");
			} else {
				request.jQuery(".support_method_monthly input").attr("disabled", true);
				request.jQuery(".support_method_monthly").addClass("disabled");
				
				request.jQuery(".support_method_percent input").attr("disabled", false);
				request.jQuery(".support_method_percent").removeClass("disabled");
			}
			self.adjust_amazon_params(request);
		});
		
		request.jQuery("#support_pct").keyup(function() {
			var support_pct = request.jQuery(this).attr("value");
			request.jQuery(".error, .arrow_errors").text("");
			
			if ( !self.validate_positive_float_input(support_pct) ) {
				request.jQuery("#support_error").append("<p>Please enter a valid percent. For example, 6.75 for 6.75%</p>");
			} else if ( parseFloat(support_pct) > 10.0 ) {
				request.jQuery("#support_error").append("<p>We cannot accept more than 10%. Please enter a lower percent. For example, 10 for 10%.</p>");
			} else {
				self.prefs.set('support_pct', self.clean_percent_input(support_pct));
			}
		});
		
		request.jQuery("#monthly_fee").keyup(function() {
			var monthly_fee = request.jQuery(this).attr("value");
			request.jQuery(".error").text("");
			
			if ( !self.validate_dollars_input(monthly_fee) ) {
				request.jQuery("#monthly_error").append("<p>Please enter a valid amount. For example, 4.99 for $4.99</p>");
			} else {
				self.prefs.set('monthly_fee', self.clean_dollars_input(monthly_fee));
				self.adjust_amazon_params(request);
			}
		});
	},
		
	activate_register_payments: function(request) {
		var self = this;
		request.jQuery("#min_auth_time_input").keyup(function() {
			var time = null;
			try {
				time = parseFloat(request.jQuery(this).attr("value"));
			} catch(e) {
				self.pddb.orthogonals.log("activate_register_payments: user entered non-float time: "+request.jQuery(this).attr("value"));
			}
			if (!time) return
			self.prefs.set('min_auth_time', _prefify_float(time));
			self.adjust_amazon_params(request);
		});
	},
	
	adjust_amazon_params: function(request) {
		var self = this;
		
		var time = _un_prefify_float(self.prefs.get('min_auth_time', constants.DEFAULT_MIN_AUTH_TIME));
		var pd_dollars_per_hr = self.retrieve_float_for_display('pd_dollars_per_hr', constants.DEFAULT_PD_DOLLARS_PER_HR);
		var pd_hr_per_week_max = self.retrieve_float_for_display('pd_hr_per_week_max', constants.DEFAULT_PD_HR_PER_WEEK_MAX);
		
		var min_auth_time = {
			time: time,
			units: self.prefs.get('min_auth_units', constants.DEFAULT_MIN_AUTH_UNITS),
		};
		var monthly_fee = _un_prefify_float(self.prefs.get('monthly_fee', constants.DEFAULT_MONTHLY_FEE));
		var max_amount_paid = self.calculate_max_amount(
				pd_dollars_per_hr,
				pd_hr_per_week_max,
				min_auth_time,
				monthly_fee);
		
		request.jQuery("#max_amount_paid").text(Math.ceil(max_amount_paid));
		request.jQuery(".global_amount_limit").attr("value", Math.ceil(max_amount_paid));
		request.jQuery("#min_auth_time_display").text(min_auth_time.time);
		request.jQuery("#min_auth_units_display").text(min_auth_time.units);
	},
	
	process_register_payments: function(request) {
		return true
	},
	
	insert_register_done: function(request) {
		logger("INSERT REGISTER DONE!");
		this.prefs.set('registration_done', true);
		
		this.pd_api.send_completed_registration_email();
		
		//this.insert_register_time_well_spent(request);

		var unsafeWin = request.get_unsafeContentWin();//event.target.defaultView;
		if (unsafeWin.wrappedJSObject) {
			unsafeWin = unsafeWin.wrappedJSObject;
		}
		
		// raises [Exception... "Illegal value" nsresult: "0x80070057 
		// (NS_ERROR_ILLEGAL_VALUE)" location: "JS frame :: 
		// chrome://procrasdonate/content/js/views.js :: anonymous :: line 834" data: no]
		
		// NOTE: INCLUDE THE DOMAIN!!
		// raises the following error when not given a full url
		// Error: Component is not available = NS_ERROR_NOT_AVAILABLE
		// Source file: chrome://procrasdonate/content/js/ext/jquery-1.2.6.js
		// Line: 2020
		var version = this.prefs.get("version", "0.0.0");
		logger("version = "+version);
		var url = constants.PD_URL + constants.AFTER_REGISTER_URL + version + "/";
		logger("url = "+url);
		new XPCNativeWrapper(unsafeWin, "location").location = url;
	}, 
	
	process_register_done: function(request) {
		return true
	},
	
	insert_register_time_well_spent: function(request) {
		var self = this;
		this.prefs.set('register_state', 'time_well_spent');
		
		var middle = Template.get("register_time_well_spent_middle").render(
			new Context({
				constants: constants,
				tws_dollars_per_hr: self.retrieve_float_for_display('tws_dollars_per_hr', constants.DEFAULT_TWS_DOLLARS_PER_HR),
				tws_hr_per_week_goal: self.retrieve_float_for_display('tws_hr_per_week_goal', constants.DEFAULT_TWS_HR_PER_WEEK_GOAL),
				tws_hr_per_week_max: self.retrieve_float_for_display('tws_hr_per_week_max', constants.DEFAULT_TWS_HR_PER_WEEK_MAX),
			})
		);
		request.jQuery("#content").html( middle );
		
		this.activate_register_time_well_spent(request);
	},
	
	activate_register_time_well_spent: function(request) {
		var self = this;

		request.jQuery("input").keyup(function() {
			request.jQuery(this).siblings(".error, .arrow_errors").text("");
			var name = request.jQuery(this).attr("name");
			var value = request.jQuery.trim(request.jQuery(this).attr("value"));
			if (!value) { value = "0"; }
			
			if ( !self.validate_hours_input(value) ) {
				request.jQuery(this).siblings(".error, .arrow_errors").text("Please enter a number");
			} else {
				self.prefs.set(name, _prefify_float(value));
			}
		});
		
		request.jQuery(".done").click(function() {
			self.insert_register_time_well_spent_done(request);
		});
	},
	
	insert_register_time_well_spent_done: function(request) {
		this.prefs.set('registration_done', true);
		var unsafeWin = request.get_unsafeContentWin();//event.target.defaultView;
		if (unsafeWin.wrappedJSObject) {
			unsafeWin = unsafeWin.wrappedJSObject;
		}
		
		// raises [Exception... "Illegal value" nsresult: "0x80070057 
		// (NS_ERROR_ILLEGAL_VALUE)" location: "JS frame :: 
		// chrome://procrasdonate/content/js/views.js :: anonymous :: line 834" data: no]
		
		// NOTE: INCLUDE THE DOMAIN!!
		// raises the following error when not given a full url
		// Error: Component is not available = NS_ERROR_NOT_AVAILABLE
		// Source file: chrome://procrasdonate/content/js/ext/jquery-1.2.6.js
		// Line: 2020
		new XPCNativeWrapper(unsafeWin, "location").location = constants.PD_URL + constants.SETTINGS_URL;
	}, 
	
	/*************************************************************************/
	/************************** TESTS AND CHECKS *****************************/
	
	add_random_visits: function() {
		var self = this;
		
		var test1 = this.pddb.SiteGroup.create_from_url("test_pd.com", self.pddb.ProcrasDonate);
		var test2 = this.pddb.SiteGroup.create_from_url("test_tws.com", self.pddb.TimeWellSpent);
		
		// add visits for last four weeks
		// this week
		var start = _start_of_day();
		var times = [_dbify_date(start)];
		// last week
		start.setDate(start.getDate() - 7);
		times.push( _dbify_date(start) );
		// two weeks ago
		start.setDate(start.getDate() - 7*2);
		times.push( _dbify_date(start) );
		// three weeks ago
		start.setDate(start.getDate() - 7*3);
		times.push( _dbify_date(start) );
		
		_iterate(times, function(key, time, index) {
			var duration = 1000 + Math.floor(Math.random()*1000);
			var urls = ["http://test_pd.com/apage.html",
			            "http://test_pd.com/bpage.html",
			            "http://test_pd.com/apage.html",
			            "http://test_pd.com/bpage.html",
			            "http://test_pd.com/apage.html",
			            
			            "http://test_tws.com/cpage.html",
			            "http://test_tws.com/cpage.html",
			            "http://test_tws.com/cpage.html",
			            "http://test_tws.com/cpage.html",
			            "http://test_tws.com/cpage.html",
			            "http://test_tws.com/cpage.html"];
			for (var i = 0; i < urls.length; i++) {
				// add at least 2000 seconds to start time
				// times the number of visits already done
				myOverlay.init_listener.time_tracker.store_visit(urls[i], time + i*2000, duration);
			}
		});
	},

	///
	/// Triggers schedule run
	///
	trigger_schedule_run: function() {
		logger("triggering schedule run...");
		this.schedule.run();
		logger("...daily schedule done");
	},
	
	///
	/// Triggers daily cycle. Does not reset 24hr period state.
	///
	trigger_daily_cycle: function() {
		logger("triggering daily cycle...");
		this.schedule.do_once_daily_tasks();
		logger("...daily cycle done");
	},
	
	///
	/// Triggers weekly cycle. Does not reset weekly period state.
	///
	trigger_weekly_cycle: function() {
		logger("triggering weekly cycle...");
		this.schedule.do_once_weekly_tasks();
		logger("...weekly cycle done");
	},
	
	///
	/// Triggers payment. Does not reset payment period.
	///
	trigger_payment: function() {
		logger("triggering payment...");
		this.pd_api.make_payments_if_necessary(true);
		logger("...payment done");
	},
	
	trigger_on_install: function() {
		myOverlay.init_listener.onInstall(this.prefs.get("version","0.0.0"));
	},
	
	trigger_on_upgrade: function() {
		myOverlay.init_listener.onUpgrade("0.3.6", "0.3.7");
	},
	
	trigger_init_db: function() {
		this.pddb.init_db();
	},
	
	test_messages: function() {
		var self = this;
		
		var t, t2, t3, t4, t5 = null;
		self.pddb.Total.select({
			contenttype_id: self.pddb.ContentType.get_or_null({ modelname: "SiteGroup" }).id
		}, function(row) {
			if (!t) { t = row; }
			else if (!t2) { t2 = row; }
			else if (!t3) { t3 = row; }
			else if (!t4) { t4 = row; }
			else if (!t5) { t5 = row; }
		}, "-total_time");
		
		function message_test(
				pd_hrs_one_week, pd_hrs_two_week, pd_hrs_three_week,
				pd_hr_per_week_goal, pd_dollars_per_hr, pd_hr_per_week_max,
				start_date_friendly, end_date_friendly, expected) {
			
			[message, subject] = self.schedule.create_message_logic(
					pd_hrs_one_week, pd_hrs_two_week, pd_hrs_three_week,
					1,2,3,
					6,7,8,
					pd_hr_per_week_goal, pd_dollars_per_hr, pd_hr_per_week_max,
					2.22, 22,
					start_date_friendly, end_date_friendly,
					t, t2, t2,
					t3, t3, t4,
					t4, t5, t5);
			
			var actual = subject.split(" ");
			_pprint(actual);
			if (actual.length > 3) {
				actual = actual[3];
			}
			
			/*
			logger("\none week = "+pd_hrs_one_week+
					"\ntwo week = "+pd_hrs_two_week+
					"\nthree week = "+pd_hrs_three_week+
					"\ngoal = "+pd_hr_per_week_goal+
					"\n"+subject);
					//"\n"+subject+
					//"\n"+message);
			*/
			
			ret = {
				expected: expected,
				actual: actual,
				pd_hrs_one_week: pd_hrs_one_week,
				pd_hrs_two_week: pd_hrs_two_week,
				pd_hrs_three_week: pd_hrs_three_week,
				pd_hr_per_week_goal: pd_hr_per_week_goal,
				subject: subject,
				message: message
			}
			if (actual != expected) {
				logger("############# TEST FAILED: expected:"+expected+" actual:"+actual+
						"\none week = "+pd_hrs_one_week+
						"\ntwo week = "+pd_hrs_two_week+
						"\nthree week = "+pd_hrs_three_week+
						"\ngoal = "+pd_hr_per_week_goal+
						"\n"+subject);/*+
						"\n"+message);*/
				ret.is_fail = true;
			} else {
				ret.is_fail = false;
			}
			return ret
		}
		
		var d = [];
		d.push( message_test(8, 10, 12, 13, 1, 20, "12/22", "12/28", "Winning streak") ); // winning streak
		d.push( message_test(8, 10, 12, 11, 1, 20, "12/22", "12/28", "Good work") ); // good work
		d.push( message_test(8, 10, 12,  9, 1, 20, "12/22", "12/28", "Good work") ); // good work
		d.push( message_test(8, 10, 12,  7, 1, 20, "12/22", "12/28", "Getting better") ); // getting better
		
		d.push( message_test(12, 10, 8, 13, 1, 20, "12/22", "12/28", "Winning streak") ); // 
		d.push( message_test(12, 10, 8, 11, 1, 20, "12/22", "12/28", "Downturn") ); // 
		d.push( message_test(12, 10, 8,  9, 1, 20, "12/22", "12/28", "Getting worse") ); // 
		d.push( message_test(12, 10, 8,  7, 1, 20, "12/22", "12/28", "Getting worse") ); // 
		
		d.push( message_test(8, 12, 10, 13, 1, 20, "12/22", "12/28", "Winning streak") ); // 
		d.push( message_test(8, 12, 10, 11, 1, 20, "12/22", "12/28", "Good work") ); // 
		d.push( message_test(8, 12, 10,  9, 1, 20, "12/22", "12/28", "Good work") ); // 
		d.push( message_test(8, 12, 10,  7, 1, 20, "12/22", "12/28", "Getting better") ); // 
		
		d.push( message_test(10, 12, 8, 13, 1, 20, "12/22", "12/28", "Winning streak") ); // 
		d.push( message_test(10, 12, 8, 11, 1, 20, "12/22", "12/28", "Good work") ); // 
		d.push( message_test(10, 12, 8,  9, 1, 20, "12/22", "12/28", "Getting better") ); // 
		d.push( message_test(10, 12, 8,  7, 1, 20, "12/22", "12/28", "Getting better") ); // 
		
		d.push( message_test(10, 8, 12, 13, 1, 20, "12/22", "12/28", "Winning streak") ); // 
		d.push( message_test(10, 8, 12, 11, 1, 20, "12/22", "12/28", "Good work") ); // 
		d.push( message_test(10, 8, 12,  9, 1, 20, "12/22", "12/28", "Downturn") ); // 
		d.push( message_test(10, 8, 12,  7, 1, 20, "12/22", "12/28", "Getting worse") ); // 
		
		d.push( message_test(12, 8, 10, 13, 1, 20, "12/22", "12/28", "Winning streak") ); // 
		d.push( message_test(12, 8, 10, 11, 1, 20, "12/22", "12/28", "Downturn") ); // 
		d.push( message_test(12, 8, 10,  9, 1, 20, "12/22", "12/28", "Downturn") ); // 
		d.push( message_test(12, 8, 10,  7, 1, 20, "12/22", "12/28", "Getting worse") ); // 
		
		d.push( message_test(null, null, null, 13, 1, 20, "12/22", "12/28", "No ProcrasDonation") ); // 
		
		d.push( message_test(12, null, null, 13, 1, 20, "12/22", "12/28", "Good job") ); // 
		d.push( message_test(12, null, null, 12, 1, 20, "12/22", "12/28", "Good job") ); // 
		d.push( message_test(12, null, null, 11, 1, 20, "12/22", "12/28", "You can do better") ); // 
		
		d.push( message_test(10, 8, null, 7, 1, 20, "12/22", "12/28", "Getting worse") ); // 
		d.push( message_test(10, 8, null, 9, 1, 20, "12/22", "12/28", "Downturn") ); // 
		d.push( message_test(10, 8, null, 11, 1, 20, "12/22", "12/28", "Good work") ); // 
		
		d.push( message_test(10, 12, null, 9, 1, 20, "12/22", "12/28", "Getting better") ); // 
		d.push( message_test(10, 12, null, 10, 1, 20, "12/22", "12/28", "Good work") ); // 
		d.push( message_test(10, 12, null, 13, 1, 20, "12/22", "12/28", "Good work") ); // 
		
		d.push( message_test(10, 10, null, 10, 1, 20, "12/22", "12/28", "Pinball champion") ); //
		
		var fails = 0;
		_iterate(d, function(key, value, index) {
			if (value.is_fail) {
				fails += 1;
			}
		});
		logger(">>>>>>>>> "+fails+" failures");
		
		return d
	},
	
	/**
	 * Sends a specific set of data to check that everything goes through exactly right,
	 * and so that data reception can be tested manually by server.
	 */
	send_fake_data: function() {
		this.pd_api.send_fake_data();
	},
	
	send_first_email: function() {
		this.pd_api.send_first_email();
	},
	
	send_completed_registration_email: function() {
		this.pd_api.send_completed_registration_email();
	},
	
	send_stalling_registration_email: function() {
		this.pd_api.send_stalling_registration_email();
	},
	
	manual_test_suite: function(request) {
		var actions = ["trigger_daily_cycle",
		               "trigger_weekly_cycle",
		               "trigger_schedule_run",
		               ".",
		               "send_first_email",
		               "send_completed_registration_email",
		               "send_stalling_registration_email",
		               ".",
		               "trigger_payment",
		               ".",
		               "trigger_on_install",
		               "trigger_on_upgrade",
		               "trigger_init_db",
		               ".",
		               "test_messages",
		               ".",
		               "reset_state_to_defaults",
		               "reset_account_to_defaults",
		               "initialize_state",
		               "add_random_visits",
		               "send_fake_data"];
		var html = Template.get("manual_test_suite").render(new Context({
			actions: actions
		}));
		request.jQuery("#content").append( html );

		var self = this;
		for (var i = 0; i < actions.length; i++) {
			var action = actions[i];
			request.jQuery("#"+action).click(
				// closure to call self[action].
				// extra function needed to provide appropriate 'this'
				(function(a) { return function() {
					self[a]();
				}})(action)
				//// the above code is complicated to remember, anyway.
				//self._self_fn(action);
			);
		}
	},
	
	///
	/// wanted to use this instead of above, but kept getting errors on
	///     self._self_fn(action)
	/// said missing closing ")" ?!
	/// wanted to use apply so could be used for _proceed as well
	///
	_self_fn: function(fnname) {
		var self = this;
		return function() {
			//self[fnname].apply(self, args);
			//self[fname](request);
			//self[event](request);
			logger("inside _self_fn for "+fnname);
		};
	},
	
	visual_debug: function(request) {
		var actions = ["show_requires_payment",
		               "show_test_messages"];
		var html = Template.get("visual_debug").render(new Context({
			actions: actions
		}));
		request.jQuery("#content").append( html );

		var self = this;
		for (var i = 0; i < actions.length; i++) {
			var action = actions[i];
			request.jQuery("#"+action).click(
				// closure to call self[action].
				// extra function needed to provide appropriate 'this'
				(function(a) { return function() {
					self[a](request);
				}})(action)
				//// the above code is complicated to remember, anyway.
				//self._self_fn(action);
			);
		}
	},
	
	show_requires_payment: function(request) {
		var self = this;
		var html = ["<ol>"];
		this.pddb.RequiresPayment.select({}, function(row) {
			var rp = Template.get("requires_payment").render(
				new Context({ rp: row }));
			html.push("<li>"+rp+"</li>");
		});
		html.push("</ol>")
		request.jQuery("#theatre").html( html.join("\n\n") );
	},
	
	show_test_messages: function(request) {
		var self = this;
		
		var data = this.test_messages();
		
		var html = ["<ol>"];
		_iterate(data, function(key, value, index) {
			var m = Template.get("test_message").render(
				new Context({
					expected: value.expected,
					actual: value.actual,
					pd_hrs_one_week: value.pd_hrs_one_week,
					pd_hrs_two_week: value.pd_hrs_two_week,
					pd_hrs_three_week: value.pd_hrs_three_week,
					pd_hr_per_week_goal: value.pd_hr_per_week_goal,
					subject: value.subject,
					message: value.message,
					is_fail: value.is_fail
				}));
			html.push("<li>"+m+"</li>");
		});
		html.push("</ol>")
		request.jQuery("#theatre").html( html.join("\n\n") );
	},

	/// run tester tests (mutates db) and checker checks 
	/// (checks db) on test database
	automatic_test_suite: function(request, is_autotester) {
		var tester = new PDTests(this.pddb, this.prefs);
		var checker = new PDChecks(this.pddb, this.prefs);
		
		var testrunner = new TestRunner(request);
		var self = this;
		
		testrunner.test("Check *REAL DATA* Requires Payments", function() {
			checker.check_requires_payments(testrunner);
		});
		
		testrunner.test("Check *REAL DATA* Payment Total Taggings", function() {
			checker.check_payment_total_taggings(testrunner);
		});
		
		testrunner.test("Check *REAL DATA* Payments", function() {
			checker.check_payments(testrunner);
		});
		
		var original_pddb = self.pddb;
		
		try {
			self.pddb = new PDDB("test.0.sqlite");
			self.pddb.init_db();
			
			testrunner.test("Test Update Totals", function() {
				tester.test_update_totals(testrunner);
			});
			
			testrunner.test("Check Requires Payments", function() {
				checker.check_requires_payments(testrunner);
			});
			
			testrunner.test("Check Payment Total Taggings", function() {
				checker.check_payment_total_taggings(testrunner);
			});
			
			testrunner.test("Check Payments", function() {
				checker.check_payments(testrunner);
			});
			
			/// WARNING: this uses setTimeout to test blur/focus,
			///          idle/back, start/stop-recording....
			///          tests after this one should worry about interference!
			
			/// WARNING 2: this test requires the tester to continuous move 
			///            their mouse but not click so that IDLE isn't
			///            inadvertantly triggered in the middle of the test.
			///            the test runs for at least 5 minute.
			/*testrunner.test("Test Idle/Back-Focus/Blur Combos", function() {
				self.pddb.tester.test_idle_focus_combos(testrunner, self.display_test_results);
			});*/
		} catch(e) {
			self.pddb.orthogonals.error(e+"\n\n"+e.stack);
		}
		tester.uninit();
		
		self.pddb = original_pddb;
		
		self.display_test_results(testrunner, is_autotester);

		logger("automatic test suite done");
	},
	
	/// run TIMING tester tests (mutates db) and checker checks 
	/// (checks db) on test database
	/// see WARNINGS below
	timing_test_suite: function(request) {
		var tester = new PDTests(this.pddb, this.prefs);
		var checker = new PDChecks(this.pddb, this.prefs);
		
		var testrunner = new TestRunner(request);
		var self = this;
		
		var original_pddb = self.pddb;
		
		// change default max idles to 10 and 30 seconds
		// otherwise test would take looooong time.
		var orig_default_max_idle = constants.DEFAULT_MAX_IDLE;
		var orig_default_flash_max_idle = constants.DEFAULT_FLASH_MAX_IDLE;
		constants.DEFAULT_MAX_IDLE = 10;
		constants.DEFAULT_FLASH_MAX_IDLE = 30;
		
		try {
			self.pddb = new PDDB("test.0.sqlite");
			self.pddb.init_db();

			/// WARNING: this uses setTimeout to test blur/focus,
			///          idle/back, start/stop-recording....
			///          tests after this one should worry about interference!
			
			/// WARNING 2: this test requires the tester to continuous move 
			///            their mouse but not click so that IDLE isn't
			///            inadvertantly triggered in the middle of the test.
			///            the test runs for at least 5 minute.
			testrunner.test("Test Idle/Back-Focus/Blur Combos", function() {
				tester.test_idle_focus_combos(testrunner, self.display_test_results);
			});
		} catch(e) {
			self.pddb.orthogonals.error(e+"\n\n"+e.stack);
		}
		tester.uninit();
		
		self.pddb = original_pddb;
		
		constants.DEFAULT_MAX_IDLE = orig_default_max_idle; 
		constants.DEFAULT_FLASH_MAX_IDLE = orig_default_flash_max_idle;
		
		self.display_test_results(testrunner);
	},
	
	display_test_results: function(testrunner, is_autotester) {
		var display = null;
		if (is_autotester) {
		    display = new TestRunnerPDDBDisplay(this.pddb);
		} else {
		    var inner_display = new TestRunnerConsoleDisplay();
		    display = new TestRunnerPDDisplay(inner_display, this.pddb);
		}
		for (var name in testrunner.test_modules) {
			var test_module = testrunner.test_modules[name];
			for (var i = 0; i < test_module.test_groups.length; i++) {
				var testgroup = test_module.test_groups[i];
				
				display.display_testgroup_result(testrunner, testgroup);
			}
		}
		display.test_done(testrunner);
	}
});

function Schedule(pddb, prefs, pd_api) {
	this.pddb = pddb;
	this.prefs = prefs;
	this.pd_api = pd_api;
}
Schedule.prototype = {};
_extend(Schedule.prototype, {
	run: function() {
		if ( this.is_new_week_period() ) {
			this.pddb.orthogonals.log("Do weekly tasks on "+(new Date())+" for "+_un_dbify_date(this.prefs.get('last_week_mark', 0)), "schedule");
			this.do_once_weekly_tasks();
			this.pddb.orthogonals.log("Do weekly tasks on "+(new Date())+" for "+_un_dbify_date(this.prefs.get('last_week_mark', 0))+" !! once_weekly_tasks done", "schedule");
			this.do_make_payment();
			this.pddb.orthogonals.log("Do weekly tasks on "+(new Date())+" for "+_un_dbify_date(this.prefs.get('last_week_mark', 0))+" !! make_payments done", "schedule");
			this.reset_week_period();
		}
		if ( this.is_new_24hr_period() ) {
			this.pddb.orthogonals.log("Do daily tasks on "+(new Date())+" for "+_un_dbify_date(this.prefs.get('last_24hr_mark', 0)), "schedule");
			this.do_once_daily_tasks();
			this.reset_24hr_period();
		}
	},
	
	is_new_24hr_period: function() {
		/** @returns: true if the last marked day is over */
		var yesterday = _un_dbify_date(this.prefs.get('last_24hr_mark', 0));
		var start_of_yesterday = _start_of_day(yesterday);
		var start_of_day = _start_of_day();
		return start_of_yesterday < start_of_day
	},

	do_once_daily_tasks: function() {
		var self = this;
		
		// Receive updates from server
		this.pd_api.request_data_updates(
			function() {
				// after success
			}, function() {
				// after failure
			});
		
		// ?? run checker to log failures, db corruptions
		
		// Send data to server (more recent than time_last_sent_KlassName)
		this.pd_api.send_data();
		
		// add user message regarding new update available
		var version = self.prefs.get("latest_update_version", "0.0.0");
		var new_version = _version_to_number(version);
		var cur_version = _version_to_number(self.prefs.get("version","0.0.0"));
		if (new_version > cur_version) {
			var link = self.prefs.get("latest_update_link", "");
			var hash = self.prefs.get("latest_update_hash", "");
			
			var msg = '<span class="link" onClick="upgrade(\''+link+'\', \''+hash+'\');">Click here to <strong>upgrade</strong> ProcrasDonate to the latest version!</span>';
			self.pddb.orthogonals.log("user alerted to available upgrade: "+link, "extn_sys");
			self.prefs.set("user_message", msg);
		}
	},
	
	reset_24hr_period: function() {
		/** reset 24 hour cycle to start of today */
		var start_of_day = _start_of_day();
		this.prefs.set('last_24hr_mark', _dbify_date(start_of_day));
	},
	

	is_new_week_period: function() {
		/** @returns: true if the last marked week is over */
		var last_week = _un_dbify_date(this.prefs.get('last_week_mark', 0));
		//this.pddb.orthogonals.log("Do weekly tasks on "+(new Date())+" for "+_un_dbify_date(this.prefs.get('last_week_mark', 0))+" !! last_week = "+last_week, "schedule");
		var start_of_last_week = _start_of_week(last_week);
		//this.pddb.orthogonals.log("Do weekly tasks on "+(new Date())+" for "+_un_dbify_date(this.prefs.get('last_week_mark', 0))+" !! start_of_last_week = "+start_of_last_week, "schedule");
		var start_of_week = _start_of_week();
		//this.pddb.orthogonals.log("Do weekly tasks on "+(new Date())+" for "+_un_dbify_date(this.prefs.get('last_week_mark', 0))+" !! start_of_week = "+start_of_week, "schedule");
		//this.pddb.orthogonals.log("Do weekly tasks on "+(new Date())+" for "+_un_dbify_date(this.prefs.get('last_week_mark', 0))+" !! (start_of_last_week < start_of_week) = "+(start_of_last_week < start_of_week), "schedule");
		return start_of_last_week < start_of_week
	},
	
	do_once_weekly_tasks: function() {
		this.create_weekly_report();
	},
	
	do_make_payment: function() {
		/* all logic for whether to make payments is in pd_api */
		this.pd_api.make_payments_if_necessary(false);
	},

	reset_week_period: function() {
		/** reset weekly cycle to start of this week */
		//var last_week = _un_dbify_date(this.prefs.get('last_week_mark', 0));
		var start_of_week = _start_of_week();
		this.prefs.set('last_week_mark', _dbify_date(start_of_week));
	},
	
	retrieve_float_for_display: function(key, def) {
		return _un_prefify_float( this.prefs.get(key, def) ).toFixed(2)
	},
	
	create_weekly_report: function() {
		var self = this;
		
		/* user might want webpage reports, just not weekly emails. oops.
		 * if (!_un_dbify_bool(self.prefs.get('weekly_affirmations', constants.DEFAULT_WEEKLY_AFFIRMATIONS))) {
			// user doesn't want a weekly affirmation
			return
		}*/
		
		var email = self.prefs.get('email', constants.DEFAULT_EMAIL);
		var name = "";
		if (email) {
			name = email.substr(0, email.indexOf("@"));
		}
		
		var pd_hr_per_week_goal = self.retrieve_float_for_display("pd_hr_per_week_goal", constants.DEFAULT_PD_HR_PER_WEEK_GOAL);
		var pd_dollars_per_hr = self.retrieve_float_for_display("pd_dollars_per_hr", constants.DEFAULT_PD_DOLLARS_PER_HR);
		var pd_hr_per_week_max = self.retrieve_float_for_display("pd_hr_per_week_max", constants.DEFAULT_PD_HR_PER_WEEK_MAX);
		var tws_dollars_per_hr = self.retrieve_float_for_display("tws_dollars_per_hr", constants.DEFAULT_TWS_DOLLARS_PER_HR);
		var tws_hr_per_week_max = self.retrieve_float_for_display("tws_hr_per_week_max", constants.DEFAULT_TWS_HR_PER_WEEK_MAX);
		
		var tag_contenttype = self.pddb.ContentType.get_or_null({ modelname: "Tag" });
		var sitegroup_contenttype = self.pddb.ContentType.get_or_null({ modelname: "SiteGroup" });
		
		var one_week = _un_dbify_date(this.prefs.get("last_week_mark", 0));
		one_week.setDate(one_week.getDate() - 7);
		
		//logger("ONE WEEK "+one_week);
		
		var two_week = new Date(one_week);
		two_week.setDate(two_week.getDate() - 7);
		
		var three_week = new Date(two_week);
		three_week.setDate(three_week.getDate() - 7);
		
		var start_date_one_week = _start_of_week(one_week);
		var end_date_one_week = _end_of_week(one_week);
		
		var start_date_two_week = _start_of_week(two_week);
		var end_date_two_week = _end_of_week(two_week);
		
		var start_date_three_week = _start_of_week(three_week);
		var end_date_three_week = _end_of_week(three_week);
		
		var start_date_friendly = start_date_one_week.strftime("%m/%d");
		var end_date_friendly = end_date_one_week.strftime("%m/%d");
		
		//logger("START "+start_date_one_week); 
		//logger("START FRIENDLY "+start_date_friendly);
		
		//logger("END "+end_date_one_week); 
		//logger("END FRIENDLY "+end_date_friendly);
		
		var pd_total_one_week = self.pddb.Total.get_or_null({
			contenttype_id: tag_contenttype.id,
			content_id: self.pddb.ProcrasDonate.id,
			datetime: _dbify_date(end_date_one_week),
			timetype_id: self.pddb.Weekly.id
		});
		var pd_hrs_one_week = 0.0;
		var pd_culprit_one_week = null;
		var tws_culprit_one_week = null;
		var u_culprit_one_week = null;
		if (pd_total_one_week) {
			pd_hrs_one_week = pd_total_one_week.hours().toFixed(1);
			self.pddb.Total.select({
				contenttype_id: sitegroup_contenttype.id,
				datetime: _dbify_date(end_date_one_week),
				timetype_id: self.pddb.Weekly.id
			}, function(row) {
				if (!pd_culprit_one_week && row.sitegroup().tag_id == self.pddb.ProcrasDonate.id) {
					pd_culprit_one_week = row;
				} else if (!tws_culprit_one_week && row.sitegroup().tag_id == self.pddb.TimeWellSpent.id) {
					tws_culprit_one_week = row;
				} else if (!u_culprit_one_week && row.sitegroup().tag_id == self.pddb.Unsorted.id) {
					u_culprit_one_week = row;
				}
			}, "-total_time");
		}
		var tws_total_one_week = self.pddb.Total.get_or_null({
			contenttype_id: tag_contenttype.id,
			content_id: self.pddb.TimeWellSpent.id,
			datetime: _dbify_date(end_date_one_week),
			timetype_id: self.pddb.Weekly.id
		});
		var tws_hrs_one_week = 0.0;
		if (tws_total_one_week) {
			tws_hrs_one_week = tws_total_one_week.hours().toFixed(1);
		}
		var u_total_one_week = self.pddb.Total.get_or_null({
			contenttype_id: tag_contenttype.id,
			content_id: self.pddb.Unsorted.id,
			datetime: _dbify_date(end_date_one_week),
			timetype_id: self.pddb.Weekly.id
		});
		var u_hrs_one_week = 0.0;
		if (u_total_one_week) {
			u_hrs_one_week = u_total_one_week.hours().toFixed(1);
		}
		
		var pd_total_two_week = self.pddb.Total.get_or_null({
			contenttype_id: tag_contenttype.id,
			content_id: self.pddb.ProcrasDonate.id,
			datetime: _dbify_date(end_date_two_week),
			timetype_id: self.pddb.Weekly.id
		});
		var pd_hrs_two_week = 0.0;
		var pd_culprit_two_week = null;
		var tws_culprit_two_week = null;
		var u_culprit_two_week = null;
		if (pd_total_two_week) {
			pd_hrs_two_week = pd_total_two_week.hours().toFixed(1);
			self.pddb.Total.select({
				contenttype_id: sitegroup_contenttype.id,
				datetime: _dbify_date(end_date_two_week),
				timetype_id: self.pddb.Weekly.id
			}, function(row) {
				if (!pd_culprit_two_week && row.sitegroup().tag_id == self.pddb.ProcrasDonate.id) {
					pd_culprit_two_week = row;
				} else if (!tws_culprit_two_week && row.sitegroup().tag_id == self.pddb.TimeWellSpent.id) {
					tws_culprit_two_week = row;
				} else if (!u_culprit_two_week && row.sitegroup().tag_id == self.pddb.Unsorted.id) {
					u_culprit_two_week = row;
				}
			}, "-total_time");
		}
		var tws_total_two_week = self.pddb.Total.get_or_null({
			contenttype_id: tag_contenttype.id,
			content_id: self.pddb.TimeWellSpent.id,
			datetime: _dbify_date(end_date_two_week),
			timetype_id: self.pddb.Weekly.id
		});
		var tws_hrs_two_week = 0.0;
		if (tws_total_two_week) {
			tws_hrs_two_week = tws_total_two_week.hours().toFixed(1);
		}
		var u_total_two_week = self.pddb.Total.get_or_null({
			contenttype_id: tag_contenttype.id,
			content_id: self.pddb.Unsorted.id,
			datetime: _dbify_date(end_date_two_week),
			timetype_id: self.pddb.Weekly.id
		});
		var u_hrs_two_week = 0.0;
		if (u_total_two_week) {
			u_hrs_two_week = u_total_two_week.hours().toFixed(1);
		}
		
		var pd_total_three_week = self.pddb.Total.get_or_null({
			contenttype_id: tag_contenttype.id,
			content_id: self.pddb.ProcrasDonate.id,
			datetime: _dbify_date(end_date_three_week),
			timetype_id: self.pddb.Weekly.id
		});
		var pd_hrs_three_week = null;
		var pd_culprit_three_week = null;
		var tws_culprit_three_week = null;
		var u_culprit_three_week = null;
		if (pd_total_three_week) {
			pd_hrs_three_week = pd_total_three_week.hours().toFixed(1);
			self.pddb.Total.select({
				contenttype_id: sitegroup_contenttype.id,
				datetime: _dbify_date(end_date_three_week),
				timetype_id: self.pddb.Weekly.id
			}, function(row) {
				if (!pd_culprit_three_week && row.sitegroup().tag_id == self.pddb.ProcrasDonate.id) {
					pd_culprit_three_week = row;
				} else if (!tws_culprit_three_week && row.sitegroup().tag_id == self.pddb.TimeWellSpent.id) {
					tws_culprit_three_week = row;
				} else if (!u_culprit_three_week && row.sitegroup().tag_id == self.pddb.Unsorted.id) {
					u_culprit_three_week = row;
				}
			}, "-total_time");
		}
		var tws_total_three_week = self.pddb.Total.get_or_null({
			contenttype_id: tag_contenttype.id,
			content_id: self.pddb.TimeWellSpent.id,
			datetime: _dbify_date(end_date_three_week),
			timetype_id: self.pddb.Weekly.id
		});
		var tws_hrs_three_week = null;
		if (tws_total_three_week) {
			tws_hrs_three_week = tws_total_three_week.hours().toFixed(1);
		}
		var u_total_three_week = self.pddb.Total.get_or_null({
			contenttype_id: tag_contenttype.id,
			content_id: self.pddb.Unsorted.id,
			datetime: _dbify_date(end_date_three_week),
			timetype_id: self.pddb.Weekly.id
		});
		var u_hrs_three_week = null;
		if (u_total_three_week) {
			u_hrs_three_week = u_total_three_week.hours().toFixed(1);
		}
		
		/*
		logger("CULPRITs "+
				"\n"+pd_culprit_one_week+
				"\n"+pd_culprit_two_week+
				"\n"+pd_culprit_three_week+
				"\n"+tws_culprit_one_week+
				"\n"+tws_culprit_two_week+
				"\n"+tws_culprit_three_week+
				"\n"+u_culprit_one_week+
				"\n"+u_culprit_two_week+
				"\n"+u_culprit_three_week);
		*/
		
		var met_goal = null;
		var difference = null;
		var seconds_saved = null;
		
		[message, subject, met_goal, difference, seconds_saved] = this.create_message_logic(
				pd_hrs_one_week, pd_hrs_two_week, pd_hrs_three_week,
				tws_hrs_one_week, tws_hrs_two_week, tws_hrs_three_week,
				u_hrs_one_week, u_hrs_two_week, u_hrs_three_week,
				pd_hr_per_week_goal, pd_dollars_per_hr, pd_hr_per_week_max,
				tws_dollars_per_hr, tws_hr_per_week_max,
				start_date_friendly, end_date_friendly,
				pd_culprit_one_week, tws_culprit_one_week, u_culprit_one_week,
				pd_culprit_two_week, tws_culprit_two_week, u_culprit_two_week,
				pd_culprit_three_week, tws_culprit_three_week, u_culprit_three_week);
		
		var pd = self.pddb.Recipient.get_or_null({ slug: "PD" });
		self.pddb.Report.create({
			datetime: _dbify_date(end_date_one_week),
			type: self.pddb.Report.WEEKLY,
			subject: subject,
			message: message,
			recipient_id: pd.id,
			read: _dbify_bool(false),
			sent: _dbify_bool(false),
			met_goal: met_goal,
			difference: difference,
			seconds_saved: seconds_saved,
		});
	},
	
	create_message_logic: function(pd_hrs_one_week, pd_hrs_two_week, pd_hrs_three_week,
			tws_hrs_one_week, tws_hrs_two_week, tws_hrs_three_week,
			u_hrs_one_week, u_hrs_two_week, u_hrs_three_week,
			pd_hr_per_week_goal, pd_dollars_per_hr, pd_hr_per_week_max,
			tws_dollars_per_hr, tws_hr_per_week_max,
			start_date_friendly, end_date_friendly,
			pd_culprit_one_week, tws_culprit_one_week, u_culprit_one_week,
			pd_culprit_two_week, tws_culprit_two_week, u_culprit_three_week,
			pd_culprit_three_week, tws_culprit_three_week, u_culprit_three_week) {
		
		var pd_hrs_one_week_diff, pd_hrs_two_week_diff, pd_hrs_three_week_diff = null;
		var pd_hrs_one_week_two_week_diff_real, pd_hrs_one_week_two_week_diff = null;
		
		if (pd_hrs_one_week !== null) {
			pd_hrs_one_week_diff = Math.abs(pd_hr_per_week_goal - pd_hrs_one_week).toFixed(1);
		}
		if (pd_hrs_two_week !== null) {
			pd_hrs_two_week_diff = (pd_hr_per_week_goal - pd_hrs_two_week).toFixed(1);
			pd_hrs_one_week_two_week_diff_real = (pd_hrs_two_week - pd_hrs_one_week).toFixed(1);
			pd_hrs_one_week_two_week_diff = Math.abs(pd_hrs_one_week_two_week_diff_real);
		}
		if (pd_hrs_three_week !== null) {
			pd_hrs_three_week_diff = Math.abs(pd_hr_per_week_goal - pd_hrs_three_week).toFixed(1);
		}
		
		var met_goal = null;
		var difference = null;
		var seconds_saved = null;
		
		var pd_hrs_max_week = _un_prefify_float( this.prefs.get("pd_hrs_max_week", 0) );
		if (pd_hrs_one_week > pd_hrs_max_week) {
			pd_hrs_max_week = pd_hrs_one_week;
			this.prefs.set("pd_hrs_max_week", _prefify_float(pd_hrs_max_week));
		}
		var tws_hrs_max_week = _un_prefify_float(this.prefs.get("tws_hrs_max_week", 0) );
		if (tws_hrs_one_week > tws_hrs_max_week) {
			tws_hrs_max_week = tws_hrs_one_week;
			this.prefs.set("tws_hrs_max_week", _prefify_float(tws_hrs_max_week));
		}
		var u_hrs_max_week = _un_prefify_float(this.prefs.get("u_hrs_max_week", 0) );
		if (u_hrs_one_week > u_hrs_max_week) {
			u_hrs_max_week = u_hrs_one_week;
			this.prefs.set("u_hrs_max_week", _prefify_float(u_hrs_max_week));
		}
		
		if (pd_hrs_one_week) {
			if (pd_hrs_one_week < pd_hr_per_week_goal) {
				met_goal = true;
				difference = pd_hr_per_week_goal - pd_hrs_one_week;
				seconds_saved = (pd_hrs_max_week - pd_hrs_one_week) * 3600.0;
			} else {
				met_goal = false;
				difference = pd_hr_per_week_goal - pd_hrs_one_week;
				seconds_saved = 0;
			}
		} else {
			met_goal = true;
			difference = 0;
			seconds_saved = pd_hrs_max_week;
		}
		
		var no_data, one_week_good, one_week_bad, match, good_in_a_row, good, sudden_bad, getting_worse, getting_better = false;
		var weeks_in_a_row_met = 0;
		var subject = start_date_friendly+" - "+end_date_friendly+" ";
		if (pd_hrs_one_week === null) {
			no_data = true;
			subject += "No ProcrasDonation"
		} else if (pd_hrs_two_week === null) {
			if (pd_hrs_one_week <= pd_hr_per_week_goal) {
				one_week_good = true;
				subject += "Good job";
			} else {
				one_week_bad = true;
				subject += "You can do better";
			}
		} else if (pd_hrs_one_week == pd_hrs_two_week) {
			match = true;
			subject += "Pinball champion";
		} else if (pd_hrs_one_week <= pd_hr_per_week_goal &&
				pd_hrs_two_week <= pd_hr_per_week_goal &&
				pd_hrs_three_week !== null && pd_hrs_three_week <= pd_hr_per_week_goal) {
			weeks_in_a_row_met = 3;
			good_in_a_row = true;
			subject += "Winning streak";
		} else if (pd_hrs_one_week <= pd_hr_per_week_goal) {
			good = true;
			subject += "Good work";
		} else if (pd_hrs_one_week > pd_hr_per_week_goal &&
				pd_hrs_two_week <= pd_hr_per_week_goal) {
			if (pd_hrs_three_week !== null && pd_hrs_three_week <= pd_hr_per_week_goal) {
				weeks_in_a_row_met = 2;
			} else {
				weeks_in_a_row_met = 1;
			}
			subject += "Downturn";
			sudden_bad = true
		} else if (pd_hrs_one_week > pd_hr_per_week_goal &&
				pd_hrs_two_week > pd_hr_per_week_goal) {
			if (pd_hrs_one_week_two_week_diff_real > 0) {
				getting_better = true;
				subject += "Getting better";
			} else {
				getting_worse = true;
				subject += "Getting worse";
			}
		}
		
		var self = this;
		var top_charity = null;
		this.pddb.RecipientPercent.select({}, function(row) {
			if (!top_charity) { top_charity = row.recipient(); }
		}, "-percent");
		
		var pledges = [];
		var payments = [];
		var time_span = "first week in a row";
		
		var message = Template.get("weekly_report").render(
			new Context({
				name: name,
				
				pd_hrs_one_week: pd_hrs_one_week,
				pd_hrs_one_week_diff: pd_hrs_one_week_diff,
				pd_hrs_two_week: pd_hrs_two_week,
				pd_hrs_two_week_diff: pd_hrs_two_week_diff,
				pd_hrs_three_week: pd_hrs_three_week,
				pd_hrs_three_week_diff: pd_hrs_three_week_diff,
				pd_hrs_one_week_two_week_diff: pd_hrs_one_week_two_week_diff,
				
				tws_hrs_one_week: tws_hrs_one_week,
				tws_hrs_two_week: tws_hrs_two_week,
				tws_hrs_three_week: tws_hrs_three_week,
				u_hrs_one_week: u_hrs_one_week,
				u_hrs_two_week: u_hrs_two_week,
				u_hrs_three_week: u_hrs_three_week,
				
				pd_hr_per_week_goal: pd_hr_per_week_goal,
				pd_dollars_per_hr: pd_dollars_per_hr,
				pd_hr_per_week_max: pd_hr_per_week_max,
				tws_dollars_per_hr: tws_dollars_per_hr,
				tws_hr_per_week_max: tws_hr_per_week_max,
				
				start_date: start_date_friendly,
				end_date: end_date_friendly,
				
				no_data: no_data,
				one_week_good: one_week_good,
				one_week_bad: one_week_bad,
				match: match,
				good_in_a_row: good_in_a_row,
				good: good,
				sudden_bad: sudden_bad,
				getting_worse: getting_worse,
				getting_better: getting_better,
				weeks_in_a_row_met: weeks_in_a_row_met,
				
				pd_culprit_one_week: pd_culprit_one_week,
				tws_culprit_one_week: tws_culprit_one_week,
				u_culprit_one_week: u_culprit_one_week,
				pd_culprit_two_week: pd_culprit_two_week,
				tws_culprit_two_week: tws_culprit_two_week,
				u_culprit_three_week: u_culprit_three_week,
				pd_culprit_three_week: pd_culprit_three_week,
				tws_culprit_three_week: tws_culprit_three_week,
				u_culprit_three_week: u_culprit_three_week,
				
				top_charity: top_charity,
				pledges: pledges,
				payments: payments
			})
		);
		
		return [message, subject, met_goal, difference, seconds_saved]
	},

});