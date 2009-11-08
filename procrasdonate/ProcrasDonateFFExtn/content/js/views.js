
//var constants = CONSTANTS();

// Controller
// * handles 'views' for browser-generated ProcrasDonate.com pages
var Controller = function(prefs, pddb) {
	this.prefs = prefs;
	this.pddb = pddb;
	this.page = new PageController(this.prefs, this.pddb);
};

//function $(selector, context) {
//	return jQuery(selector, document.defaultView);
//}

Controller.prototype = {};
_extend(Controller.prototype, {
	handle: function(request) {
		//logger("Controller.handler: url="+request.url);
		var host = _host(request.url);
		for (var i = 0; i < constants.VALID_HOSTS.length; i++) {
			var valid_host = constants.VALID_HOSTS[i];
			if (host == valid_host) { //match(new RegExp(valid_host)))
				//request.do_in_page(_bind(this.page, this.page.insert_settings_recipients, request));
				//request.do_in_page(
				//	_bind(this.page, this.page.insert_settings_donation_amounts, request));
				//request.do_in_page(_bind(this.page, this.page.insert_settings_account, request));
				//request.do_in_page(_bind(this, this.pd_dispatch_by_url, request));
				return this.pd_dispatch_by_url(request);
			}
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
		//this.page.$ = request.jQuery;
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
		
		this.page.default_inserts(request);
		
		var path = request.url.match(new RegExp("http:\/\/[^/]+(.*)"))
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
		case constants.AUTHORIZE_PAYMENTS_CALLBACK_URL:
			this.authorize_payments_callback(request);
			break;
		case constants.HOME_URL:
			break;
		case constants.MANUAL_TEST_SUITE_URL:
			this.manual_test_suite(request);
			break;
		case constants.AUTOMATIC_TEST_SUITE_URL:
			this.automatic_test_suite(request);
			break;
		case constants.AUTHORIZE_PAYMENTS:
			this.authorize_payments(request);
			break;
		default:
			return false;
			//logger("Invalid ProcrasDonate URL: " + request.url);
		}
		return true;
	},
	
	check_page_inserts: function() {
		/*
		 * Insert data into matching webpage
		 *    (localhost:8000 or procrasdonate.com)
		 * See constants.PD_HOST in global constants at top of page.
		 * 
		 * @SNOOPY here for developer grep purposes
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
			logger("state defaults: "+name+" "+value);
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
		hash: constants.DEFAULT_HASH,
		twitter_username: constants.DEFAULT_USERNAME,
		twitter_password: constants.DEFAULT_PASSWORD,
		email: constants.DEFAULT_EMAIL,
		procrasdonate_reason: constants.DEFAULT_PROCRASDONATE_REASON,
		timewellspent_reason: constants.DEFAULT_TIMEWELLSPENT_REASON,
		pd_dollars_per_hr: constants.PD_DEFAULT_DOLLARS_PER_HR,
		pd_hr_per_week_goal: constants.PD_DEFAULT_HR_PER_WEEK_GOAL,
		pd_hr_per_week_max: constants.PD_DEFAULT_HR_PER_WEEK_MAX,
		tws_dollars_per_hr: constants.TWS_DEFAULT_DOLLARS_PER_HR,
		tws_hr_per_week_goal: constants.TWS_DEFAULT_HR_PER_WEEK_GOAL,
		tws_hr_per_week_max: constants.TWS_DEFAULT_HR_PER_WEEK_MAX,
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
			logger("account defaults: "+name+" "+value);
			if (!self.prefs.get(name, ''))
				return self.prefs.set(name, value);
		});
		
		if (this.prefs.get('hash', constants.DEFAULT_HASH) == constants.DEFAULT_HASH) {
			this.set_user_hash();
		}
	},
	
	set_user_hash: function() {
		// construct user hash
		var monsterbet = "abcdefghijklmnopqrstuvwxyzABCEFGHIJKLMNOPQRSTUVXYZ0123456789";
		var hash = [];
		for (var i = 0; i < 22; i++) {
			hash.push( monsterbet[Math.floor(Math.random()*62)] );
		}
		this.prefs.set('hash', hash.join(''));
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
			logger("SET STATE: name:"+name+", value:"+value);
			self.prefs.set(name, value);
		});
	},
	
	////////////////////////////// DEV TESTS //////////////////////////////////
	
	add_random_visits: function() {
		var test1 = this.pddb.SiteGroup.get_or_create({
			url_re: "test1.com"
		});
		this.pddb.SiteGroup.set({
			tag_id: this.pddb.ProcrasDonate.id
		}, {
			url_re: "test1.com"
		});
		var test2 = this.pddb.SiteGroup.get_or_create({
			url_re: "test2.com"
		});
		this.pddb.SiteGroup.set({
			tag_id: this.pddb.TimeWellSpent.id
		}, {
			url_re: "test2.com"
		});
		var start = _start_of_day();
		var duration = 2222;
		var urls = ["http://test1.com/apage.html",
		            "http://test1.com/bpage.html",
		            "http://test1.com/apage.html",
		            "http://test1.com/bpage.html",
		            "http://test1.com/apage.html",
		            
		            "http://test2.com/cpage.html",
		            "http://test2.com/cpage.html",
		            "http://test2.com/cpage.html",
		            "http://test2.com/cpage.html",
		            "http://test2.com/cpage.html",
		            "http://test2.com/cpage.html",
		            /*
		            "http://test1.com/apage.html",
		            "http://test1.com/apage.html",
		            "http://test1.com/apage.html",
		            "http://test1.com/apage.html",
		            "http://test1.com/apage.html",
		            "http://test1.com/apage.html",
		            "http://test1.com/apage.html",
		            "http://test1.com/apage.html",
		            "http://test1.com/apage.html",
		            "http://test1.com/apage.html",
		            "http://test1.com/apage.html",
		            "http://test1.com/apage.html",
		            "http://test1.com/apage.html",
		            "http://test1.com/apage.html",
		            "http://test1.com/apage.html",
		            "http://test1.com/apage.html"
		            */
		            ];
		for (var i = 0; i < urls.length; i++) {
			this.pddb.store_visit(urls[i], _dbify_date(start), duration);
			logger("add random visits ="+start);
			start.setMinutes( start.getMinutes() + 10 );
		}
	},

	///
	/// Triggers daily cycle. Does not reset 24hr period state.
	///
	trigger_daily_cycle: function() {
		logger("triggering daily cycle...");
		this.pddb.schedule.do_once_daily_tasks();
		logger("...daily cycle done");
	},
	
	///
	/// Triggers weekly cycle. Does not reset weekly period state.
	///
	trigger_weekly_cycle: function() {
		logger("triggering weekly cycle...");
		this.pddb.schedule.do_once_weekly_tasks();
		logger("...weekly cycle done");
	},
	
	///
	/// Triggers payment. Does not reset payment period.
	/// #@TODO check if authorized to make payments ?! 
	///       or should pd::pay_multiuse check?
	///
	trigger_payment: function() {
		/* TEST */
		var recipient = this.pddb.Recipient.get_or_null({
			id: 1
		});
		this.pddb.page.pd_api.pay_multiuse(2.22, recipient);
	},
	
	trigger_on_install: function() {
		myOverlay.onInstall("0.0.0");
	},
	
	trigger_init_db: function() {
		this.pddb.init_db();
	},
	
	manual_test_suite: function(request) {
		var actions = ["trigger_daily_cycle",
		               "trigger_weekly_cycle",
		               "",
		               "trigger_payment",
		               "",
		               "trigger_on_install",
		               "trigger_init_db",
		               "",
		               "reset_state_to_defaults",
		               "reset_account_to_defaults",
		               "initialize_state",
		               "add_random_visits"];
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

	/// run tester tests (mutates db) and checker checks 
	/// (checks db) on test database
	automatic_test_suite: function(request) {
		var testrunner = new TestRunner(request);
		var self = this;
		
		var original_pddb = self.pddb;
		
		try {
			self.pddb = new PDDB("test.0.sqlite");
			self.pddb.init_db();
			
			/*testrunner.test("Test Update Totals", function() {
				self.pddb.tester.test_update_totals(testrunner);
			});
			
			testrunner.test("Check Requires Payments", function() {
				self.pddb.checker.check_requires_payments(testrunner);
			});
			
			testrunner.test("Check Payments", function() {
				self.pddb.checker.check_payments(testrunner);
			});*/
			
			/// WARNING: this uses setTimeout to test blur/focus,
			///          idle/back, start/stop-recording....
			///          tests after this one should worry about interference!
			
			/// WARNING 2: this test requires the tester to continuous move 
			///            their mouse but not click so that IDLE isn't
			///            inadvertantly triggered in the middle of the test.
			///            the test runs for at least 5 minute.
			testrunner.test("Test Idle/Back-Focus/Blur Combos", function() {
				self.pddb.tester.test_idle_focus_combos(testrunner, _bind(self, self.display_test_results));
			});
		} catch(e) {
			self.pddb.orthogonals.error(e+"\n\n"+e.stack);
		}
		
		self.pddb = original_pddb;
		
		self.display_test_results(testrunner);
	},
	
	display_test_results: function(testrunner) {
		var inner_display = new TestRunnerConsoleDisplay();
		var display = new TestRunnerPDDisplay(inner_display, self.pddb);
		for (var name in testrunner.test_modules) {
			var test_module = testrunner.test_modules[name];
			for (var i = 0; i < test_module.test_groups.length; i++) {
				var testgroup = test_module.test_groups[i];
				
				display.display_testgroup_result(testrunner, testgroup);
			}
		}
		display.test_done(testrunner);
	},
	
	authorize_payments_callback: function(request) {
		var self = this;
		var result = {};
		//var status = "";
		//var refundTokenID = "";
		//var tokenID = "";
		//var callerReference = "";
		request.jQuery("#parameters .parameter").each(function() {
			var key = request.jQuery(this).children(".key").text();
			var value = request.jQuery(this).children(".value").text();
			result[key] = value;
		});
		this.prefs.set('authorize_payments_status', status);
	}
});

function Schedule(prefs, pddb) {
	this.prefs = prefs;
	this.pddb = pddb;
}
Schedule.prototype = {};
_extend(Schedule.prototype, {
	run: function() {
		if ( this.is_new_24hr_period() ) {
			this.do_once_daily_tasks();
			this.reset_24hr_period();
		}
		if ( this.is_new_week_period() ) {
			this.do_once_weekly_tasks();
			this.reset_week_period();
		}
		if ( this.is_time_to_make_payment() ) {
			this.do_make_payment();
			this.reset_make_payment_period();
		}
	},
	
	is_new_24hr_period: function() {
		/* @returns: true if it is at least 24 hrs past the last 24hr mark */
		var two_four_hr = _un_dbify_date(this.prefs.get('last_24hr_mark', 0));
		var now = new Date();
		two_four_hr.setHours(two_four_hr.getHours() + 24);
		return now > two_four_hr
	},
	
	do_first_daily_tasks: function() {
		// first time daily ta
	},
	
	do_once_daily_tasks: function() {
		var self = this;
		
		// Receive updates from server
		this.pddb.page.pd_api.request_data_updates(
			function() {
				// after success
			}, function() {
				// after failure
			});
		
		// run checker to log failures, db corruptions
		
		// Send data to server (more recent than time_last_sent_KlassName)
		this.pddb.page.pd_api.send_data();
	},
	
	reset_24hr_period: function() {
		// reset last_24hr_mark to now
		var two_four_hr = _un_dbify_date(this.prefs.get('last_24hr_mark', 0));
		var new_two_four_hr = new Date();
		new_two_four_hr.setHours(two_four_hr.getHours());
		new_two_four_hr.setMinutes(two_four_hr.getMinutes());
		new_two_four_hr.setSeconds(two_four_hr.getSeconds());
		var now = new Date();
		if ( new_two_four_hr > now ) {
			// is this possible? is this a dire error? loopy?
			new_two_four_hr.setDate( now.getDate() - 1 );
		}
		this.prefs.set('last_24hr_mark', _dbify_date( new_two_four_hr ));
		//alert("ding! last 24hr "+two_four_hr+" new 24hr "+now+"  now  "+new Date());	
	},
	
	is_new_week_period: function() {
		/* @returns: true if it is at least 1 week past the last week mark */
		var week_hr = new Date(this.prefs.get('last_week_mark', 0)*1000);
		var now = new Date();
		week_hr.setDate(week_hr.getDate() + 7);
		return now > week_hr
	},
	
	do_once_weekly_tasks: function() {
		// make payments if necessary
		this.pddb.page.pd_api.make_payments();
	},
	
	reset_week_period: function() {
		// reset last_week_mark to now
		//#@TODO make this a Sunday night?
		var week_hr = new Date(this.prefs.get('last_week_mark', 0)*1000);
		var now = new Date();
		now.setHours(week_hr.getHours());
		now.setMinutes(week_hr.getMinutes());
		now.setSeconds(week_hr.getSeconds());
		if ( now > new Date() ) {
			now.setDate( now.getDate() - 1 );
		}
		this.prefs.set('last_week_mark', Math.floor(now.getTime()/1000));
		//alert("ding! last week "+week_hr+" new week "+now+"  now  "+new Date());
	},
	
	is_time_to_make_payment: function() {
		return false
		//return this.do_once_weekly_tasks();
	},
	
	do_make_payment: function() {
		this.pddb.page.pd_api.make_payment(function(r) {
			// onload
		}, function(r) {
			// onerror
		});
	},
	
	reset_make_payment_period: function() {
		
	},

});


/********** HTML INSERTION FUNCTIONS AND HELPERS ***************/

function PageController(prefs, pddb) {
	this.prefs = prefs;
	this.pddb = pddb;
	//this.tipjoy = new TipJoy_API(this.prefs, this.pddb);
	this.pd_api = new ProcrasDonate_API(this.prefs, this.pddb);
}
PageController.prototype = {};
_extend(PageController.prototype, {
	
	default_inserts: function(request) {
		// add private menu items
		request.jQuery("#MainMenu").before(
			["<div id=\"ExtensionMenu\" class=\"menu\">",
			 "    <div id=\"progress_menu_item\"><a href=\""+
			 	constants.PROGRESS_URL+"\">My Progress</a></div>",
			 "    <div id=\"impact_menu_item\"><a href=\""+
			 	constants.IMPACT_URL+"\">My Impact</a></div>",
			 //"    <div id=\"messages_menu_item\"><a href=\""+
			// 	constants.MESSAGES_URL+"\">My Messages</a></div>",
			 "    <div id=\"settings_menu_item\"><a href=\""+
			 	constants.SETTINGS_URL+"\">My Settings</a></div>",
			 "</div>"].join("\n"));
	
		if (!this.registration_complete()) {
			request.jQuery("#settings_menu_item")
				.attr("id", "register_menu_item")
				.children("a")
					.attr("href", constants.REGISTER_URL)
					.text("Not Done Registering");
		}
		
		// remove start
		request.jQuery("#StartButtonDiv").remove();
	},
	
	registration_complete: function() {
		var reg_state = this.prefs.get('register_state', false);
		var tos_accepted = this.prefs.get('tos', false);
		return reg_state && reg_state == "done" && tos_accepted;
	},
	
	/*************************************************************************/
	/***************************** VIEW UTILS ********************************/
	
	/*
	 * @return: dictionary of:
	 * 		menu_items: list of (id, klasses, value) tuples for substate menu
	 *          id is "substate_tab_"+enums[index]
	 *          value is tab_names[index]
	 *          klasses is ["substate_tab", "current_tab"]<---if current tab
	 *      next: tuple of next tab or null
	 *      prev: tuple of prev tab or null
	 */
	make_substate_menu_items: function(current_substate, enums, tab_names) {
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
			if (!_one_past_current) {
				img = constants.MEDIA_URL+"img/StepCircle"+(index+1)+"Done.png";
				bar = constants.MEDIA_URL+"img/Dash.png";
			} else {
				img = constants.MEDIA_URL+"img/StepCircle"+(index+1)+".png";
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
			if (value != "XXX") {
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
				request.jQuery("#substate_tab_"+substate).click(
					self._process(current_substate, enums, processors, inserts[index], request)
				);
			} else {
				request.jQuery("#substate_tab_"+substate).click(
					self._proceed(inserts[index], request)
				);
			}
		});
	},
	
	_process: function(current_substate, enums, processors, event, request) {
		var self = this;
		return function() {
			logger("_process !!!! "+current_substate+"\n"+enums+"\n"+processors);
			_iterate(enums, function(key, substate, index) {
				if (substate == current_substate) {
					logger("processors="+processors);
					logger("processors[index]="+processors[index]);
					var success = self[processors[index]](request, event);
					logger("_process success="+success);
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
	
	validate_positive_float_input: function(request, v) {
		try {
			return parseFloat(v) >= 0
		} catch(e) {
			return false
		}
	},
	
	validate_dollars_input: function(request, v) {
		return parseFloat(v) >= 0
		
		/// old
		
		//var hr_per_week_goal = parseFloat(
		//	request.jQuery("input[name='hr_per_week_goal']").attr("value"));
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
	
	validate_hours_input: function(request, v) {
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
		logger("clean_percent_input v="+v);
		var f = parseFloat(v);
		logger("f="+f+" "+_prefify_float(f / 100.00));
		return _prefify_float(f / 100.00);
	},
	
	validate_string: function(v) {
		return v && v != ''
	},
	/*************************************************************************/
	/******************************* SETTINGS ********************************/

	insert_settings_overview: function(request) {
		var self = this;
		this.prefs.set('settings_state', 'overview');
		
		var substate_menu_items = this.make_substate_menu_items('overview',
			constants.SETTINGS_STATE_ENUM, constants.SETTINGS_STATE_TAB_NAMES);

		var middle = Template.get("settings_overview_middle").render(
			new Context({
				substate_menu_items: substate_menu_items,
				
				estimated_time_till_reauth: {units: "months", time: 4},
				
				pd_hr_per_week_goal: self.retrieve_float_for_display("pd_hr_per_week_goal", constants.PD_DEFAULT_HR_PER_WEEK_GOAL),
				pd_dollars_per_hr: self.retrieve_float_for_display("pd_dollars_per_hr", constants.PD_DEFAULT_DOLLARS_PER_HR),
				pd_hr_per_week_max: self.retrieve_float_for_display("pd_hr_per_week_max", constants.PD_DEFAULT_HR_PER_WEEK_MAX),
				
				tws_hr_per_week_goal: self.retrieve_float_for_display("tws_hr_per_week_goal", constants.TWS_DEFAULT_HR_PER_WEEK_MAX),
				tws_dollars_per_hr: self.retrieve_float_for_display("tws_dollars_per_hr", constants.TWS_DEFAULT_DOLLARS_PER_HR),
				tws_hr_per_week_max: self.retrieve_float_for_display("tws_hr_per_week_max", constants.TWS_DEFAULT_HR_PER_WEEK_MAX),
				
				monthly_fee: 0,
				support_pct: self.retrieve_percent_for_display('support_pct', constants.DEFAULT_SUPPORT_PCT),
				
				email: this.prefs.get("email", constants.DEFAULT_EMAIL),
				receive_weekly_affirmations: this.prefs.get("receive_weekly_affirmations", constants.DEFAULT_RECEIVE_WEEKLY_AFFIRMATIONS),
				receive_thankyous: this.prefs.get("receive_thankyous", constants.DEFAULT_RECEIVE_THANKYOUS),
				receive_newsletters: this.prefs.get("receive_newsletters", constants.DEFAULT_RECEIVE_NEWSLETTERS),
			})
		);
		request.jQuery("#content").html( middle );
		
		this.activate_settings_overview(request);
		
		this.activate_substate_menu_items(request, 'overview',
			constants.SETTINGS_STATE_ENUM, constants.SETTINGS_STATE_INSERTS, constants.SETTINGS_STATE_PROCESSORS);
	},
	
	activate_settings_overview: function(request) {
		var self = this;
		
		function arrow_click(arrow_id, diff) {
			request.jQuery(arrow_id)
				.css("cursor", "pointer")
				.click(function(e) {
					var item = request.jQuery(this).siblings(".thevalue");
					var id = item.attr("id");
					item.append(" "+id+" ");
					var value = _un_prefify_float( self.prefs.get(id, null) );
					if (value != null) {
						var new_value = value + diff;
						if (new_value < 0) new_value = 0.0;
						self.prefs.set(id, _prefify_float(new_value));
						item.text(new_value.toFixed(2));
						item.siblings(".error").text("");
					} else {
						item.siblings(".error").text("ERROR");
					}
				});
		}
		arrow_click(".up_arrow", 0.25);
		arrow_click(".down_arrow", -0.25);
	},
	
	process_settings_overview: function(request) {
	},
	
	/*************************************************************************/
	/******************************** IMPACT *********************************/
	
	insert_impact_totals: function(request) {
		var self = this;
		this.prefs.set('impact_state', 'totals');
		
		var substate_menu_items = this.make_substate_menu_items('totals',
			constants.IMPACT_STATE_ENUM, constants.IMPACT_STATE_TAB_NAMES);

		var recipient_contenttype = self.pddb.ContentType.get_or_null({ modelname: "Recipient" });
		var sitegroup_contenttype = self.pddb.ContentType.get_or_null({ modelname: "SiteGroup" });
		
		// total $$ PLEDGED for [this year, last year]
		var taxdeduct_total_amounts = [0.0, 0.0];
		var NOT_taxdeduct_total_amounts = [0.0, 0.0];
		// payment {id: row, ...} for [this year, last year]
		var taxdeduct_payments = [{}, {}];
		var NOT_taxdeduct_payments = [{}, {}];
		// total $$ PAID for [this year, last year]
		var taxdeduct_payment_totals = [0.0, 0.0];
		var NOT_taxdeduct_payment_totals = [0.0, 0.0];

		_iterate([recipient_contenttype, sitegroup_contenttype], function(key, contenttype, index) {
			_iterate([_end_of_year(), _end_of_last_year()], function(key2, endtime, YEAR_INDEX) {
				// iterate through all recipients and sitegroups for this or last year
				self.pddb.Total.select({
					contenttype_id: contenttype.id,
					datetime: _dbify_date(endtime),
					timetype_id: self.pddb.Yearly.id
				}, function(row) {
					var amt = row.dollars()
					if (row.recipient() && row.recipient().has_tax_exempt_status()) {
						taxdeduct_total_amounts[index] += amt;
						_iterate(row.payments(), function(key3, payment, index3) {
							taxdeduct_payments[YEAR_INDEX][payment.id] += payment;
						});
					} else {
						NOT_taxdeduct_total_amounts[index] += amt;
						_iterate(row.payments(), function(key3, payment, index3) {
							NOT_taxdeduct_payments[YEAR_INDEX][payment.id] += payment;
						});
					}
				});
			});
		});
		
		_iterate([0, 1], function(key, year_idx, idx) {
			_iterate(taxdeduct_payments[idx], function(key, payment, index) {
				taxdeduct_payment_totals[idx] += parseFloat(payment.total_amount_paid);
			});
			
			_iterate(NOT_taxdeduct_payments[idx], function(key, payment, index) {
				NOT_taxdeduct_payment_totals[idx] += parseFloat(payment.total_amount_paid);
			});
		});
		
		var table_headers = ["Recipients",
		                     "Current Pledges",
		                     "2009 Donations To Date",
		                     "2008 All Donations",
		                     "All Time Donations",
		                     /*"Messages"*/];
		var table_rows = [
			["Total, tax-deductible recipients",
			 (taxdeduct_total_amounts[0]+taxdeduct_total_amounts[1]) - (taxdeduct_payment_totals[0]+taxdeduct_payment_totals[1]),
			 taxdeduct_payment_totals[0],
			 taxdeduct_payment_totals[1],
			 taxdeduct_payment_totals[0] + taxdeduct_payment_totals[1],
			 /**/],
			 
		    ["Total, other recipients",
		     (NOT_taxdeduct_total_amounts[0]+NOT_taxdeduct_total_amounts[1]) - (NOT_taxdeduct_payment_totals[0]+NOT_taxdeduct_payment_totals[1]),
			 NOT_taxdeduct_payment_totals[0],
			 NOT_taxdeduct_payment_totals[1],
			 NOT_taxdeduct_payment_totals[0] + NOT_taxdeduct_payment_totals[1],
			 /**/]
		];
		table_rows.push([
		    "Combined total of all recipients",
		    table_rows[0][1] + table_rows[1][1],
		    table_rows[0][2] + table_rows[1][2],
		    table_rows[0][3] + table_rows[1][3],
		    table_rows[0][4] + table_rows[1][4],
		    /**/
		]);
		_pprint(table_rows);
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

		var row_data = {};
		//{
		//	 r: { slug: {thisyear: total,  lastyear: total}, ... }
		//	sg: { host: {thisyear: total,  lastyear: total}, ... }
		//}
		row_data[recipient_contenttype.id] = {};
		row_data[sitegroup_contenttype.id] = {};
		
		_iterate([recipient_contenttype, sitegroup_contenttype], function(key, contenttype, index) {
			_iterate([_end_of_year(), _end_of_last_year()], function(key2, endtime, YEAR_INDEX) {
				// iterate through all recipients and sitegroups for this or last year
				self.pddb.Total.select({
					contenttype_id: contenttype.id,
					datetime: _dbify_date(endtime),
					timetype_id: self.pddb.Yearly.id
				}, function(total) {
					if (filter_fn(total)) {
						var fieldname = "slug";
						if (contenttype.id == sitegroup_contenttype.id) fieldname = "host";
						
						if (!row_data[contenttype.id][total.content()[fieldname]]) {
							row_data[contenttype.id][total.content()[fieldname]] = {}
						}
						row_data[contenttype.id][total.content()[fieldname]][endtime] = total;
					};
				});
			});
		});
		
		// row_data
		// {
		//	  r: { slug: {thisyear: total,  lastyear: total}, ... }
		//	 sg: { host: {thisyear: total,  lastyear: total}, ... }
		// }
		
		// calculate row table
		var table_rows = [];
		_iterate([recipient_contenttype, sitegroup_contenttype], function(key, contenttype, index) {
			_iterate(row_data[contenttype.id], function(slug, twoyears, index2) {
				var thisyear = twoyears[_end_of_year()];
				var lastyear = twoyears[_end_of_last_year()];
				
				var contentname = "recipient";
				if (contenttype.id == sitegroup_contenttype.id) contentname = "sitegroup";
				
				if (!thisyear[contentname]() || 
						(lastyear && !lastyear[contentname]()) || 
						(lastyear && thisyear[contentname]().id != lastyear[contentname]().id)) {
					// #@TODO ERROR impossible
					logger("IMPOSSIBLE ERROR");
				}
				
				var thispayments = 0.0;
				_iterate(thisyear.payments(), function(k, payment, i) {
					thispayments += parseFloat(payment.total_amount_paid);
				});
				
				var lastpayments = 0.0;
				if (lastyear) {
					_iterate(lastyear.payments(), function(k, payment, i) {
						lastpayments += parseFloat(payment.total_amount_paid);
					});
				}
				
				var totalpledges = thisyear.dollars();
				if (lastyear) totalpledges += lastyear.dollars();
				
				table_rows.push([thisyear[contentname](),
				                 totalpledges - (thispayments + lastpayments),
				                 thispayments,
				                 lastpayments,
				                 thispayments + lastpayments
				                 ]);
			});
		});
		
		var new_table_rows = [];
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
			// format first cell
			var first_cell = null;
			if (table_rows[i1][0]["host"]) {
				first_cell = table_rows[i1][0]["host"];
			} else {
				first_cell = "<img src=\""+
					table_rows[i1][0]["logo"]+
					"\"><span>"+
					table_rows[i1][0]["name"]+
					"</span>";
			}
			
			// for sitegroup rows, delete if trivial
			if (table_rows[i1][0]["host"]) {
				var allblank = true;
				for (var i2 = 1; i2 < table_rows[i1].length; i2++) {
					if (table_rows[i1][i2] != "-") {
						allblank = false;
					}
				}
				if (!allblank) {
					table_rows[i1][0] = first_cell;
					new_table_rows.push(table_rows[i1]);
				}
			} else {
				table_rows[i1][0] = first_cell;
				new_table_rows.push(table_rows[i1]);
			}
		});
  		table_rows = new_table_rows;
  		
		var table_headers = ["Recipients",
		                     "Current Pledges",
		                     "2009 Donations To Date",
		                     "2008 All Donations",
		                     "All Time Donations",
		                     /*"Messages"*/];
		
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
	
	/*
	"insert_messages_all",
	"insert_messages_thankyous",
	"insert_messages_newsletters",
	"insert_messages_weekly",
	"insert_messages_tax",
	*/
	insert_messages_all: function(request) {
		var self = this;
		this.prefs.set('messages_state', 'all');
		
		var substate_menu_items = this.make_substate_menu_items('all',
				constants.MESSAGES_STATE_ENUM, constants.MESSAGES_STATE_TAB_NAMES);

		var middle = Template.get("messages_all_middle").render(
			new Context({
				substate_menu_items: substate_menu_items
			})
		);
		request.jQuery("#content").html( middle );
		
		this.activate_substate_menu_items(request, 'all',
			constants.MESSAGES_STATE_ENUM, constants.MESSAGES_STATE_INSERTS);
	},
	
	/*************************************************************************/
	/******************************* PROGRESS ********************************/
	
	insert_progress_overview: function(request) {
		var self = this;
		this.prefs.set('progress_state', 'overview');

		// currently, there is no progress submenu
		var substate_menu_items = this.make_substate_menu_items('overview',
			constants.PROGRESS_STATE_ENUM, constants.PROGRESS_STATE_TAB_NAMES);	
		
		var tag_contenttype = self.pddb.ContentType.get_or_null({
			modelname: "Tag"
		});
		var pd_total_this_week = self.pddb.Total.get_or_null({
			contenttype_id: tag_contenttype.id,
			content_id: self.pddb.ProcrasDonate.id,
			datetime: _dbify_date(_end_of_week()),
			timetype_id: self.pddb.Weekly.id
		});
		
		var last_week = new Date();
		last_week.setDate(last_week.getDate() - 7);
		var pd_total_last_week = self.pddb.Total.get_or_null({
			contenttype_id: tag_contenttype.id,
			content_id: self.pddb.ProcrasDonate.id,
			datetime: _dbify_date(last_week),
			timetype_id: self.pddb.Weekly.id
		});
		
		var pd_total = self.pddb.Total.get_or_null({
			contenttype_id: tag_contenttype.id,
			content_id: self.pddb.ProcrasDonate.id,
			datetime: _dbify_date(_end_of_forever()),
			timetype_id: self.pddb.Forever.id
		});
		
		var this_week_hrs = 0.0;
		if (pd_total_this_week) {
			this_week_hrs = pd_total_this_week.hours().toFixed(1)
		}
		var last_week_hrs = 0.0;
		if (pd_total_last_week) {
			last_week_hrs = pd_total_last_week.hours().toFixed(1)
		}
		var total_hrs = 0.0;
		if (pd_total) {
			total_hrs = pd_total.hours().toFixed(1)
		}
		
		var middle = Template.get("progress_overview_middle").render(
			new Context({
				substate_menu_items: substate_menu_items,
				pd_this_week_hrs: this_week_hrs,
				pd_last_week_hrs: last_week_hrs,
				pd_total_hrs: total_hrs,
				pd_limit: this.prefs.get("pd_hr_per_week_max", constants.DEFAULT_PD_HR_PER_WEEK_MAX)
			})
		);
		request.jQuery("#content").html( middle );
		
		this.insert_gauges(request, this_week_hrs, last_week_hrs, total_hrs);
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
		var width = 600;
		
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
		var major_tick_SPACES_count = 5;
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
				this_week_laptop: this_week_laptop,
				last_week_laptop: last_week_laptop,
				total_laptop: total_laptop,
				width: width
			})
		);
		request.jQuery("#gauges").after( explanation );
	},
	
	/*************************************************************************/
	/******************************* REGISTER ********************************/
	
	insert_register_incentive: function(request) {
		var self = this;
		this.prefs.set('register_state', 'incentive');
		
		var substate_menu_items = this.make_substate_menu_items('incentive',
				constants.REGISTER_STATE_ENUM, constants.REGISTER_STATE_TAB_NAMES);
		var substate_menu = Template.get("register_submenu").render(
				new Context({ substate_menu_items: substate_menu_items })
			);
		
		var middle = Template.get("register_incentive_middle").render(
			new Context({
				substate_menu_items: substate_menu_items,
				substate_menu: substate_menu,
				pd_dollars_per_hr: self.retrieve_float_for_display('pd_dollars_per_hr', constants.PD_DEFAULT_DOLLARS_PER_HR),
				pd_hr_per_week_goal: self.retrieve_float_for_display('pd_hr_per_week_goal', constants.PD_DEFAULT_HR_PER_WEEK_GOAL),
				pd_hr_per_week_max: self.retrieve_float_for_display('pd_hr_per_week_max', constants.PD_DEFAULT_HR_PER_WEEK_MAX),
			})
		);
		request.jQuery("#content").html( middle );
		
		this.activate_substate_menu_items(request, 'incentive',
			constants.REGISTER_STATE_ENUM, constants.REGISTER_STATE_INSERTS, constants.REGISTER_STATE_PROCESSORS);
	},
	
	process_register_incentive: function(request) {
		logger("process_register_incentive");
		var self = this;
		var pd_dollars_per_hr = request.jQuery("input[name='pd_dollars_per_hr']").attr("value");
		var pd_hr_per_week_goal = request.jQuery("input[name='pd_hr_per_week_goal']").attr("value");
		var pd_hr_per_week_max = request.jQuery("input[name='pd_hr_per_week_max']").attr("value");

		request.jQuery("#errors").text("");
		if ( !this.validate_dollars_input(request, pd_dollars_per_hr) ) {
			request.jQuery("#rate_error").text("Please enter a valid dollar amount. For example, to donate $2.34 per hour, please enter 2.34");
			
		} else if ( !this.validate_hours_input(request, pd_hr_per_week_goal) ) {
			request.jQuery("#goal_error").text("Please enter number of hours. For example, to strive for 8 hrs and 15 minutes, please enter 1.25");
			
		} else if ( !this.validate_hours_input(request, pd_hr_per_week_max) ) {
			request.jQuery("#max_error").text("Please enter number of hours. For example, enter 30 minutes as .5");
			
		} else if (parseFloat(pd_hr_per_week_goal) > parseFloat(pd_hr_per_week_max)) { 
			request.jQuery("#max_error").text("You maximum hours cannot be less than your goal");

		} else {
			logger("333333333 "+this.prefs.get('pd_hr_per_week_goal', "banana")+"     "+pd_hr_per_week_goal+"-----"+this.clean_hours_input(pd_hr_per_week_goal));
			this.prefs.set('pd_dollars_per_hr', this.clean_dollars_input(pd_dollars_per_hr));
			this.prefs.set('pd_hr_per_week_goal', this.clean_hours_input(pd_hr_per_week_goal));
			this.prefs.set('pd_hr_per_week_max', this.clean_hours_input(pd_hr_per_week_max));
			logger("777777777 "+this.prefs.get('pd_hr_per_week_goal', "banana"));
			return true;
		}
		return false;
	},
	
	insert_register_charities: function(request) {
		var self = this;
		this.prefs.set('register_state', 'charities');
		
		var substate_menu_items = this.make_substate_menu_items('charities',
				constants.REGISTER_STATE_ENUM, constants.REGISTER_STATE_TAB_NAMES);
		var substate_menu = Template.get("register_submenu").render(
				new Context({ substate_menu_items: substate_menu_items })
			);
		
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
						deep_recip_pct: row
					})
				);
				chosen_charities.push(html);
				chosen_charities_rows.push(recipient);
			}
		});
		
		var not_chosen_charities = [];
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
					not_chosen_charities.push(html);
				}
			}
		});
		
		var middle = Template.get("register_charities_middle").render(
			new Context({
				constants: constants,
				substate_menu_items: substate_menu_items,
				substate_menu: substate_menu,
				categories: categories,
				chosen_charities: chosen_charities,
				not_chosen_charities: not_chosen_charities
			})
		);
		request.jQuery("#content").html( middle );
		
		this.activate_substate_menu_items(request, 'charities',
			constants.REGISTER_STATE_ENUM, constants.REGISTER_STATE_INSERTS, constants.REGISTER_STATE_PROCESSORS);
		this.activate_register_charities(request);
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
			logger("value:"+value+".");
			if (!value || value == "") return
			
			var slug = slugify(value);
			logger("slug:"+slug+"."+(!slug)+" "+(slug==""));
			if (!slug || slug == "") {
				slug = "blank_" + parseInt(Math.random()*10000)
				logger("new slug:"+slug+".");
			}
			// ensure unique slug
			if (self.pddb.Recipient.get_or_null({ slug: slug })) {
				slug = slug + "_" + parseInt(Math.random()*10000);
				logger("2new slug:"+slug+".");
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
			request.jQuery("#chosen_charities").prepend(html);
			// clear input
			request.jQuery("#new_recipient_name").attr("value", "");
		});
	},
	
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
		var potential_recipients_div = request.jQuery("#not_chosen_charities");
		
		recipient_elem.children(".add_recipient").click(function() {
			var recipient_id = request.jQuery(this).siblings(".recipient_id").text();
			var recipient = self.pddb.Recipient.get_or_null({ id: recipient_id });
			var percent = 0;
			var recipient_pct = self.pddb.RecipientPercent.create({
				recipient_id: recipient_id,
				percent: percent
			});
			request.jQuery(this).parent().fadeOut("slow", function() {
				request.jQuery(this).remove();
			});
			
			var context = new Context({
				constants: constants,
				deep_recip_pct: recipient_pct
			});
			var new_recip = request.jQuery(
					Template.get("recipient_with_percent_snippet").render(context));
			
			user_recipients_div.append(new_recip);
			self.activate_a_recipient(request, new_recip);
		});
		
		recipient_elem.children(".remove_recipient").click(function() {
			var recipient_id = request.jQuery(this).siblings(".recipient_id").text();
			self.pddb.RecipientPercent.del({
				recipient_id: recipient_id
			});
			var recipient = self.pddb.Recipient.get_or_null({ id: recipient_id });
			
			//request.jQuery(this).parent().clone(true).insertAfter(spacer);
			request.jQuery(this).parent().fadeOut("slow", function() {
				request.jQuery(this).remove();
			});
			
			var context = new Context({
				constants: constants,
				recipient: recipient
			});
			var new_recip = request.jQuery(Template.get("recipient_snippet").render(context));
			
			potential_recipients_div.prepend(new_recip);
			self.activate_a_recipient(request, new_recip);
		});
	},
	
	process_register_charities: function(request) {
		var self = this;
		var ret = true;
		request.jQuery("input").each( function() {
			var percent = request.jQuery(this).attr("value");
			try {
				percent = parseFloat(percent) / 100.0;
				if (percent < 0.0) {
					request.jQuery("#errors").append("<p>Please enter a percent greater than 0");
					logger(" process_recipients says please enter a percent greater than 0");
					ret = false;
				}
			} catch(e) {
				request.jQuery("#errors").append("<p>Please enter a number, such as 22</p>");
				logger(" process_recipients says please enter a number");
				ret = false;
			}
			var recipient_id = request.jQuery(this).parent().siblings(".recipient_id").text();
			logger("process_recipients:: rid="+recipient_id+" pct="+percent);
			self.pddb.RecipientPercent.set({ percent: percent }, { recipient_id: recipient_id });
		});
		logger(" process_recipients says okiedokie");
		return ret;
	},
	
	insert_register_content: function(request) {
		var self = this;
		this.prefs.set('register_state', 'content');
		
		var substate_menu_items = this.make_substate_menu_items('content',
				constants.REGISTER_STATE_ENUM, constants.REGISTER_STATE_TAB_NAMES);
		var substate_menu = Template.get("register_submenu").render(
				new Context({ substate_menu_items: substate_menu_items })
			);
		
		var middle = Template.get("register_content_middle").render(
			new Context({
				substate_menu_items: substate_menu_items,
				substate_menu: substate_menu,
				tws_dollars_per_hr: self.retrieve_float_for_display('tws_dollars_per_hr', constants.TWS_DEFAULT_DOLLARS_PER_HR),
				//tws_hr_per_week_goal: self.retrieve_float_for_display('tws_hr_per_week_goal', constants.TWS_DEFAULT_HR_PER_WEEK_GOAL),
				tws_hr_per_week_max: self.retrieve_float_for_display('tws_hr_per_week_max', constants.TWS_DEFAULT_HR_PER_WEEK_MAX),
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

		request.jQuery("#errors").text("");
		if ( !this.validate_dollars_input(request, tws_dollars_per_hr) ) {
			request.jQuery("#errors").append("<p>Please enter a valid dollar amount. For example, to donate $2.34 per hour, please enter 2.34</p>");
			
		//} else if ( !this.validate_hours_input(request, tws_hr_per_week_goal) ) {
		//	request.jQuery("#errors").append("<p>Please enter number of hours. For example, to strive for 8 hrs and 15 minutes, please enter 1.25</p>");
			
		} else if ( !this.validate_hours_input(request, tws_hr_per_week_max) ) {
			request.jQuery("#errors").append("<p>Please enter number of hours. For example, enter 30 minutes as .5</p>");
			
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
				new Context({ substate_menu_items: substate_menu_items })
			);
		
		var middle = Template.get("register_support_middle").render(
			new Context({
				substate_menu_items: substate_menu_items,
				substate_menu: substate_menu,
				support_pct: self.retrieve_percent_for_display('support_pct', constants.DEFAULT_SUPPORT_PCT),
				monthly_fee: self.retrieve_float_for_display('monthly_fee', constants.DEFAULT_MONTHLY_FEE),
			})
		);
		request.jQuery("#content").html( middle );
		
		this.activate_substate_menu_items(request, 'support',
			constants.REGISTER_STATE_ENUM, constants.REGISTER_STATE_INSERTS, constants.REGISTER_STATE_PROCESSORS);
	},
	
	process_register_support: function(request) {
		var self = this;
		var support_pct = request.jQuery("input[name='support_pct']").attr("value");
		logger("process spct="+support_pct);
		var monthly_fee = request.jQuery("input[name='monthly_fee']").attr("value");

		request.jQuery("#errors").text("");
		if ( !this.validate_positive_float_input(request, support_pct) ) {
			request.jQuery("#errors").append("<p>Please enter a valid percent. For example, blah blah</p>");
			
		} else if ( !this.validate_dollars_input(request, monthly_fee) ) {
			request.jQuery("#errors").append("<p>Please blah</p>");
			
		} else {
			logger("2. process spct="+support_pct);
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
				new Context({ substate_menu_items: substate_menu_items })
			);
		
		var middle = Template.get("register_updates_middle").render(
			new Context({
				substate_menu_items: substate_menu_items,
				substate_menu: substate_menu,
				email: self.prefs.get('email', constants.DEFAULT_EMAIL),
				weekly_affirmations: _un_dbify_bool(self.prefs.get('weekly_affirmations', constants.DEFAULT_WEEKLY_AFFIRMATIONS)),
				org_thank_yous: _un_dbify_bool(self.prefs.get('org_thank_yous', constants.DEFAULT_ORG_THANK_YOUS)),
				org_newsletters: _un_dbify_bool(self.prefs.get('org_newsletters', constants.DEFAULT_ORG_NEWSLETTERS)),
				tos: _un_dbify_bool(self.prefs.get('tos', constants.DEFAULT_TOS)),
			})
		);
		request.jQuery("#content").html( middle );
		
		this.activate_substate_menu_items(request, 'updates',
			constants.REGISTER_STATE_ENUM, constants.REGISTER_STATE_INSERTS, constants.REGISTER_STATE_PROCESSORS);
	},
	
	process_register_updates: function(request) {
		request.jQuery("#error").text("");
		
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
			request.jQuery("#error").text("To use our service you must agree to the terms of service by checking the Terms of Service checkbox below");
		}
		
		if (old_email != email) {
			this.pddb.page.pd_api.send_data();
		}
		return tos
	},
	
	insert_register_payments: function(request) {
		var self = this;
		this.prefs.set('register_state', 'payments');
		
		var substate_menu_items = this.make_substate_menu_items('payments',
				constants.REGISTER_STATE_ENUM, constants.REGISTER_STATE_TAB_NAMES);
		var substate_menu = Template.get("register_submenu").render(
				new Context({ substate_menu_items: substate_menu_items })
			);

		var middle = Template.get("register_payments_middle").render(
				new Context({
					substate_menu_items: substate_menu_items,
					substate_menu: substate_menu,
					support_pct: self.retrieve_float_for_display('support_pct', constants.DEFAULT_SUPPORT_PCT),
					monthly_fee: self.retrieve_float_for_display('monthly_fee', constants.DEFAULT_MONTHLY_FEE),
				})
			);
		request.jQuery("#content").html( middle );
		
		this.activate_substate_menu_items(request, 'payments',
			constants.REGISTER_STATE_ENUM, constants.REGISTER_STATE_INSERTS, constants.REGISTER_STATE_PROCESSORS);
	},
	
	process_register_payments: function(request) {
		return true
	},
	
	insert_register_done: function(request) {
		if (this.prefs.get('register_state', false) != 'done') {
			this.prefs.set('register_state', 'done');
			var unsafeWin = request.get_unsafeContentWin();//event.target.defaultView;
			if (unsafeWin.wrappedJSObject) {
				// raises: [Exception... "Illegal value" nsresult: "0x80070057
				// (NS_ERROR_ILLEGAL_VALUE)" location: "JS frame :: 
				// chrome://procrasdonate/content/js/views.js :: anonymous :: line 828" data: no]
				unsafeWin = unsafeWin.wrappedJSObject;
			}
			
			// raises [Exception... "Illegal value" nsresult: "0x80070057 
			// (NS_ERROR_ILLEGAL_VALUE)" location: "JS frame :: 
			// chrome://procrasdonate/content/js/views.js :: anonymous :: line 834" data: no]
			new XPCNativeWrapper(unsafeWin, "location").location = constants.IMPACT_URL;
		} else {
			var middle = Template.get("register_done_middle").render(
				new Context({ constants: constants })
			);
			request.jQuery("#content").html( middle );
		}
	}, 
	
	process_register_done: function(request) {
		return true
	}
});
