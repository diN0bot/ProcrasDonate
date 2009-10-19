
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
		this.insert_based_on_state(request, default_state, state_enums, event_inserts); 
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
			// remove start now button
			request.jQuery("#StartButtonDiv").remove();
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
			//return false;
			//#@TODO ALERT USER
			logger("Invalid ProcrasDonate URL: " + request.url);
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
		impact_substate: constants.DEFAULT_IMPACT_SUBSTATE,
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
		pd_cents_per_hr: constants.PD_DEFAULT_CENTS_PER_HR,
		pd_hr_per_week_goal: constants.PD_DEFAULT_HR_PER_WEEK_GOAL,
		pd_hr_per_week_max: constants.PD_DEFAULT_HR_PER_WEEK_MAX,
		tws_cents_per_hr: constants.TWS_DEFAULT_CENTS_PER_HR,
		tws_hr_per_week_goal: constants.TWS_DEFAULT_HR_PER_WEEK_GOAL,
		tws_hr_per_week_max: constants.TWS_DEFAULT_HR_PER_WEEK_MAX,
		support_pct: constants.DEFAULT_SUPPORT_PCT,
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
	///
	trigger_payment: function() {
		var recipient = this.pddb.Recipient.get_or_null({
			slug: 'bilumi'
		});
		this.pddb.page.pd_api.pay_multiuse(2.22, recipient);
	},
	
	trigger_on_install: function() {
		myOverlay.onInstall("0.0.0");
	},
	
	manual_test_suite: function(request) {
		var actions = ["trigger_daily_cycle",
		               "trigger_weekly_cycle",
		               "",
		               "trigger_payment",
		               "",
		               "trigger_on_install",
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
		self.pddb = new PDDB("test.0.sqlite");
		self.pddb.init_db();
		
		testrunner.test("Test Update Totals", function() {
			self.pddb.tester.test_update_totals(testrunner);
		});
		
		testrunner.test("Check Requires Payments", function() {
			self.pddb.checker.check_requires_payments(testrunner);
		});
		
		testrunner.test("Check Payments", function() {
			self.pddb.checker.check_payments(testrunner);
		});
		
		self.pddb = original_pddb;
		
		/*
		testrunner.test("a second happy test", function() {
			testrunner.expect(3);
			testrunner.ok( false, "this test is fine" );
			var value = "hello";
			testrunner.equals( "hello", value, "We expect value to be hello" );
			testrunner.same( "hello", value, "We still expect value to be hello" );
		});
		*/
		
		// display results
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
			["<div id=\"ExtensionMenu\">",
			 "    <div id=\"progress_menu_item\"><a href=\""+
			 	constants.PROGRESS_URL+"\">My Progress</a></div>",
			 "    <div id=\"impact_menu_item\"><a href=\""+
			 	constants.IMPACT_URL+"\">My Impact</a></div>",
			 "    <div id=\"messages_menu_item\"><a href=\""+
			 	constants.MESSAGES_URL+"\">My Messages</a></div>",
			 "    <div id=\"settings_menu_item\"><a href=\""+
			 	constants.SETTINGS_URL+"\">My Settings</a></div>",
			 "</div>"].join("\n"));
	
		if (!this.registration_complete()) {
			request.jQuery("#settings_menu_item")
				.attr("id", "register_menu_item")
				.children("a")
					.attr("href", constants.REGISTER_URL)
					.text("Please Finish Registering !");
		}
	},
	
	registration_complete: function() {
		var reg_state = this.prefs.get('register_state', false);
		var tos_accepted = this.prefs.get('tos', false);
		return reg_state && reg_state == "done" && tos_accepted;
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
		
		var n = "<span class='name'>" + name + "</span>";
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
	
	check_latest_version: function() {
		/*
		 * Check if user should update to newer version of ProcrasDonate.
		 * Inserts html into page.
		 * @TODO THIS IS NOT CALLED Y DISPATCH, nor is the actual
		 * code here correct. Maybe we don't even need this. see upgrade/version
		 * stuff in main.js
		 */
		var newest_version;
		
		if (document.getElementById("newest_version")) {
			newest_version = parseInt(
				document.getElementById("newest_version").innerHTML, 10);
			if (newest_version > 30) { // change to a constant somehow
				
				var cell_text;
				cell_text = "You are running an old version of ProcrasDonate. ";
				cell_text += 'Update <a href="https://addons.mozilla.org/firefox/3685/">here</a>';
				document.getElementById("newest_version").innerHTML = cell_text;
				document.getElementById("newest_version").style.display = "inline";
				// document.getElementById("newest_version").style.color="#EDCB09";
			}
		}
	},
	
	payment_system_middle: function(request, is_register) {
		var middle = Template.get("payment_system_middle").render(new Context({}));
		if (is_register) {
			request.jQuery("#content").html( this.register_wrapper_snippet(request, middle) );
		} else {
			request.jQuery("#content").html( this.settings_wrapper_snippet(request, middle) );
		}
		
		this.insert_multiuse_auth(request);
	},
	
	retrieve_and_display_multi_auth_link: function(request, caller_reference, new_auth_link_text, link_div_id) {
		logger("create_and_display_new_multi_auth");
		this.pd_api.authorize_multiuse(
			caller_reference,
			function(r) { // onsuccess
				request.jQuery(link_div_id).html("<a href=\""+r.full_url+"\">"+new_auth_link_text+"</a>");
			}, function(r) { // onfailure
				request.jQuery(link_div_id).html("<span class=\"error\">Failed to create authorization link: "+r.reason+"</span>");
			}
		);
	},
	
	display_message: function(request, multi_auth, message, message_div_id, is_error) {
		logger("display_message: "+message);
		request.jQuery(message_div_id).html(message);
		if (is_error) {
			request.jQuery(message_div_id).addClass("error");
		} else {
			request.jQuery(message_div_id).removeClass("error");
		}
	},
	
	lookup_balance: function(request, multi_auth, balance_div_id) {
		logger("lookup balance");
	},
	
	show_cancel_and_edit: function(request, cancel_div_id, edit_div_id) {
		var self = this;
		logger("lookup show_cancel_and_edit");
		request.jQuery(cancel_div_id).html("<span id=\"cancel_link\"></span>");
		request.jQuery(edit_div_id).html("<span id=\"edit_link\"></span>");
		
		request.jQuery("#cancel_link")
			.addClass("link")
			.text("Cancel donation authorization")
			.click(function() {
				self.pd_api.cancel_multiuse_token("User clicked cancel",
				function() {
					// onsuccess
					request.jQuery("#message_here")
					.removeClass("error")
					.addClass("message")
					.text("Successfully cancelled donation authorization.");
				}, function(r) {
					// onfailure
					request.jQuery("#message_here")
						.addClass("error")
						.removeClass("message")
						.text("Failed to cancel donation authorization: "+r.reason);
				});
			});
		
		request.jQuery("#edit_link")
		 	.addClass("link")
		 	.text("Edit donation authorization")
			.click(function() {
				alert("coming soon");
			});
	},

	insert_multiuse_auth: function(request) {
		/* 
		 * 
		 * INVARIANT: we don't need to know which token is current,
		 * we just need to know there is a successful token out there.
		 * 
		 * if has success:
		 *     display happy message
		 * else:
		 *     get updates from server
		 *     if has success:
		 *         display happy message
		 *     else:
		 *         get latest
		 *         if error:
		 *             display error
		 *         elif waiting:
		 *             display waiting
		 *         elif cancel:
		 *             display cancel message
		 *             create new link
		 *         elif expired:
		 *             display expired message
		 *             create new link
		 *         else no latest:
		 *             create new link
		 * 
		 * if has no rows:
		 *     create new multi_auth
		 *     display link
		 * else if has success:
		 *     display happy message
		 *     lookup balance
		 * else (has unsuccessfuls or cancels):
		 *     retrieve updates from server
		 *     if has success:
		 *         display happy message
		 *         lookup balance
		 *     else 
		 *     	   get most recent auth
		 *     	   if waiting:
		 *             display waiting message
		 *         else if error:
		 *             display error message based on error type
		 *         display link for most recent row
		 */
		var self = this;
		
		var happy_message = "<b>Donations successfully authorized!</b> Click Done to continue.";
		var waiting_message = "Authorization initiated... did you complete the pipeline on Amazon?";
		var error_message = "Something went wrong with authorization: ";
		var cancelled_message = "Previous authorization cancelled";
		var error_message = "Previous authorization excpired";
		
		var message_div_id = "#message_here";
		var cancel_div_id = "#cancel_here";
		var edit_div_id = "#edit_here";
		var balance_div_id = "#balance_here";
		var link_div_id = "#auth_a_here";
		var new_auth_link_text = "Allow future pledges to automatically get turned into donations.";
		var retry_auth_link_text = "Allow future pledges to automatically get turned into donations (try again).";
		
		logger("insert_multiuse_auth");
		
		/*if has success:
			 *     display happy message
			 * else:
			 *     get updates from server
			 *     if has success:
			 *         display happy message
			 *     else:
			 *         get latest
			 *         if error:
			 *             display error
			 *         elif waiting:
			 *             display waiting
			 *         elif cancel:
			 *             display cancel message
			 *             create new link
			 *         elif expired:
			 *             display expired message
			 *             create new link
			 *         else no latest:
			 *             create new link*/
		
		if (this.pddb.FPSMultiuseAuthorization.has_success()) {
			logger("has_success");
			// successfully authorized multi use token
			var multi_auth = this.pddb.FPSMultiuseAuthorization.get_latest_success();
			this.display_message(request, multi_auth, happy_message, message_div_id);
			this.show_cancel_and_edit(request, cancel_div_id, edit_div_id);
			this.lookup_balance(request, multi_auth, balance_div_id);
		
		} else {
			logger("!has_success");
			// do updates and handle successful, waiting and error possibilities
			this.pd_api.request_data_updates(function(recipients, multi_auths) {
				logger("updates after success");
				// after successful update
				if (self.pddb.FPSMultiuseAuthorization.has_success()) {
					logger("has_success");
					// successfully authorized multi use token
					var multi_auth = self.pddb.FPSMultiuseAuthorization.get_latest_success();
					self.display_message(request, multi_auth, happy_message, message_div_id);
					self.show_cancel_and_edit(request, cancel_div_id, edit_div_id);
					self.lookup_balance(request, multi_auth, balance_div_id);
				} else {
					logger("!has_success");
					// get most recent
					var multi_auth = self.pddb.FPSMultiuseAuthorization.most_recent();
					
					if (!multi_auth) {
						// there are no rows
						self.retrieve_and_display_multi_auth_link(request, create_caller_reference(), new_auth_link_text, link_div_id);
						
					} else if (multi_auth.error()) {
						// error
						self.display_message(request, multi_auth, error_message, message_div_id);
						self.retrieve_and_display_multi_auth_link(request, create_caller_reference(), new_auth_link_text, link_div_id);
						
					} else if (multi_auth.response_not_received()) {
						// waiting for response
						//self.display_message(request, multi_auth, waiting_message, message_div_id);
						self.retrieve_and_display_multi_auth_link(request, multi_auth.caller_reference, new_auth_link_text, link_div_id);
						
					} else if (multi_auth.cancelled()) {
						// cancelled
						self.display_message(request, multi_auth, cancelled_message, message_div_id);
						self.retrieve_and_display_multi_auth_link(request, create_caller_reference(), new_auth_link_text, link_div_id);
						
					} else if (multi_auth.expired()) {
						// expired (expiry reached, eg credit card needs editing)
						self.display_message(request, multi_auth, expired_message, message_div_id);
						self.retrieve_and_display_multi_auth_link(request, create_caller_reference(), new_auth_link_text, link_div_id);
					} 
				}
					
			}, function() {
				// after failure
				logger("after failure in updates");
			});
		}
	},

	insert_register_payment_system: function(request) {
		var self = this;
		this.prefs.set('register_state', 'payment_system');

		this.payment_system_middle(request, true);
	
		this.activate_register_tab_events(request);
	},
	
	support_middle: function(request) {
		var pd_recipient = this.pddb.Recipient.get_or_null({
			slug: "pd"
		});
		var pct = _un_prefify_float(this.prefs.get('support_pct', constants.DEFAULT_SUPPORT_PCT));
		var context = new Context({
			pct: pct,
			constants: constants,
		});
		return Template.get("support_middle").render(context);
	},
	
	activate_support_middle: function(request) {
		var pct = _un_prefify_float(this.prefs.get('support_pct', constants.DEFAULT_SUPPORT_PCT));
		//request.jQuery("#support_slider").slider({
		//	//animate: true,
		//	min: 0,
		//	max: 10,
		//	value: pct,
		//	step: 1,
		//	slide: function(event, ui) {
		//		set_sliders_and_input(
		//			request.jQuery(this), 
		//			request.jQuery(this).next(), 
		//			request.jQuery(this).next().attr("value"), 
		//			ui.value);
		//	}
		//});
		
		request.jQuery("#support_input").keyup(function(event) {
			set_sliders_and_input(
				request.jQuery(this).prev(), 
				request.jQuery(this), 
				request.jQuery(this).attr("alt"), 
				request.jQuery(this).attr("value"));
		});
		
		var self=this;
		function set_sliders_and_input(slider, input, oldv, newv) {
			if ( newv < 0 || newv > 100 ) return false;
			var diff = oldv - newv;
			input.attr("value", newv).attr("alt", newv);
			//slider.slider('option', 'value', newv);
			self.prefs.set('support_pct', _prefify_float(newv));
			return true;
		}
	},
	
	insert_register_support: function(request) {
		/* Inserts support ProcrasDonate info. */
		this.prefs.set('register_state', 'support');
		request.jQuery("#content").html( 
			this.register_wrapper_snippet(request, this.support_middle(request)) );
		this.activate_register_tab_events(request);
		this.activate_support_middle(request);
	},
	
	insert_register_done: function(request) {
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
		//new XPCNativeWrapper(unsafeWin, "location").location = constants.IMPACT_URL;
	},
	
	site_classifications_middle: function(request) {
		var self = this;
		
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
		
		var context = new Context({
			timewellspent_text: timewellspent_text,
			procrasdonate_text: procrasdonate_text,
			unsorted_text: unsorted_text,
			constants: constants,
		});
		return Template.get("site_classifications_middle").render(context);
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
				
				request.jQuery("#"+tag+"_col .title")
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
	},
	
	insert_register_site_classifications: function(request) {
		/* Inserts site classification html into page */
		this.prefs.set('register_state', 'site_classifications');
		var html = this.register_wrapper_snippet(
			request, this.site_classifications_middle(request));
		request.jQuery("#content").html(html);
		this.activate_register_tab_events(request);
		this.activate_site_classifications_middle(request);
	},
	
	recipient_snippet: function(request, recipient) {
		var category = this.pddb.Category.get_or_null({ id: recipient.category_id });
		var category_name = null;
		if (category) {
			category_name = category.category;
		}
		var context = new Context({
			id: recipient.id,
			url: recipient.url,
			name: recipient.name,
			category: category_name,
			mission: recipient.mission,
			description: recipient.description,
			constants: constants
		});
		return Template.get("recipient_snippet").render(context);
	},
	
	recipient_with_percent_snippet: function(request, recipient, percent) {
		var category = this.pddb.Category.get_or_null({ id: recipient.category_id });
		var category_name = null;
		if (category) {
			category_name = category.category;
		}
		var context = new Context({
			id: recipient.id,
			url: recipient.url,
			name: recipient.name,
			category: category_name,
			mission: recipient.mission,
			description: recipient.description,
			percent: percent,
			constants: constants
		});
		return Template.get("recipient_with_percent_snippet").render(context);
	},
	
	recipients_middle: function(request) {
		var self = this;
		var user_recipients = "";
		
		logger("recipients_middle");
		this.pddb.RecipientPercent.select({}, function(row) {
			logger("recipient is this one: "+row);
			var recipient = self.pddb.Recipient.get_or_null({ id: row.recipient_id });
			var percent = parseFloat(row.percent) * 100.0;
			if ( parseInt(percent) == percent ) {
				percent = parseInt(percent);
			} else {
				percent = percent.toFixed(2);
			}
			
			if (recipient && recipient.slug != "pd") {
				user_recipients += self.recipient_with_percent_snippet(request, recipient, percent);
			}
		});
		
		var spacer = "<div id='recipient_spacer_row'><hr></div>";
		
		var potential_recipients = "";
		this.pddb.Recipient.select({ is_visible: true }, function(row) {
			if (self.pddb.RecipientPercent.get_or_null({ recipient_id: row.id })) {

			} else {
				potential_recipients += self.recipient_snippet(request, row);
			}
		});
		
		var context = new Context({
			potential_recipients: potential_recipients,
			user_recipients: user_recipients
		});
		return Template.get("recipients_middle").render(context);
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
		
		var user_recipients_div = request.jQuery("#user_recipients");
		var potential_recipients_div = request.jQuery("#potential_recipients");
		
		recipient_elem.children(".add_recipient").click(function() {
			var recipient_id = request.jQuery(this).siblings(".recipient_id").text();
			var recipient = self.pddb.Recipient.get_or_null({ id: recipient_id });
			var percent = .20;
			self.pddb.RecipientPercent.create({
				recipient_id: recipient_id,
				percent: percent
			});
			request.jQuery(this).parent().fadeOut("slow", function() {
				request.jQuery(this).remove();
			});
			
			var new_recip = request.jQuery(self.recipient_with_percent_snippet(request, recipient, percent*100));
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

			var new_recip = request.jQuery(self.recipient_snippet(request, recipient));
			potential_recipients_div.prepend(new_recip);
			
			self.activate_a_recipient(request, new_recip);
		});
	},
	
	activate_recipients_middle: function(request) {
		var self = this;
		request.jQuery(".recipient").each( function() {
			self.activate_a_recipient(request, request.jQuery(this));
		});
		/*
		request.jQuery(".recipient_id").hide();
		
		request.jQuery(".description_toggle").click( function() {
			var e = request.jQuery(this);
			if (e.text() == "(less)") {
				e.text("(more)");
				e.parent().siblings(".description").hide();
			} else {
				e.text("(less)");
				e.parent().siblings(".description").show();
			}
		}).each( function() {
			var e = request.jQuery(this);
			if (e.text() == "(less)") {
				e.text("(more)");
				e.parent().siblings(".description").hide();
			}
		});
		
		var user_recipients_div = request.jQuery("#user_recipients");
		var potential_recipients_div = request.jQuery("#potential_recipients");
		
		request.jQuery(".add_recipient").click(function() {
			var recipient_id = request.jQuery(this).siblings(".recipient_id").text();
			var recipient = self.pddb.Recipient.get_or_null({ id: recipient_id });
			var percent = .20;
			self.pddb.RecipientPercent.create({
				recipient_id: recipient_id,
				percent: percent
			});
			request.jQuery(this).parent().fadeOut("slow", function() {
				request.jQuery(this).remove();
			});
			
			var new_recip = request.jQuery(self.recipient_with_percent_snippet(request, recipient, percent));
			user_recipients_div.append(new_recip);
			new_recip.children(".remove_recipient").click(function() {
				request.jQuery(this).parent().css("background", "red");
			});
			request.jQuery(".recipient_id").hide();
		});
		
		request.jQuery(".remove_recipient").click(function() {
			var recipient_id = request.jQuery(this).siblings(".recipient_id").text();
			self.pddb.RecipientPercent.del({
				recipient_id: recipient_id
			});
			var recipient = self.pddb.Recipient.get_or_null({ id: recipient_id });
			
			//request.jQuery(this).parent().clone(true).insertAfter(spacer);
			request.jQuery(this).parent().fadeOut("slow", function() {
				request.jQuery(this).remove();
			});

			var new_recip = request.jQuery(self.recipient_snippet(request, recipient));
			potential_recipients_div.append(new_recip);
			new_recip.children(".add_recipient").click(function() {
				request.jQuery(this).parent().css("background", "red");
			});
			request.jQuery(".recipient_id").hide();
		});
		*/
		
		/*
		var slider_elems = [];
		for (var i = 0; i < user_recipients_ary.length; i += 1) {
			slider_elems.push(request.jQuery("#slider"+i));
		}
		for (var i = 0; i < slider_elems.length; i += 1) {
			var slider = slider_elems[i];
			var input = slider.next();
			// all sliders except current slider
			var not_slider = slider_elems.slice().splice(i, 0);
			//slider.slider({
			//	//animate: true,
			//	min: 0,
			//	max: 100,
			//	value: request.jQuery("#slider"+i).attr('alt'),
			//	//step: not_slider.length,
			//	slide: function(event, ui) {
			//		set_sliders_and_input(slider, input, input.attr("value"), ui.value);
			//	},
			//});
			input.keyup(function(event) {
				set_sliders_and_input(slider, input, input.attr("alt"), input.attr("value"));
			});
		}
		function set_sliders_and_input(slider, input, oldv, newv) {
			var diff = oldv - newv;
			input.attr("value", newv).attr("alt", newv);
			//slider.slider('option', 'value', newv);
			adjust_other_sliders(slider.attr("id"), diff);	
		}
		function adjust_other_sliders(id, diff) {
			for (var i = 0; i < slider_elems.length; i += 1) {
				var slider = slider_elems[i];
				var input = slider.next();
				if ( slider.attr("id") != id ) {
					var oldv = input.attr("value");
					//slider.slider('option', 'value', oldv - diff);
					input.attr("value", oldv - diff).attr("alt", oldv - diff);
				}
			}
		}
		*/
	},
	
	insert_register_recipients: function(request) {
		/*
		 * Inserts form so that user may select recipients. 
		 * 
		 * Slider input's alt must contain "last" value of input, so when do keyboard presses we can compute how to alter the other tabs.
		 */
		this.prefs.set('register_state', 'recipients');
		request.jQuery("#content").html(
			this.register_wrapper_snippet(
				request,
				this.recipients_middle(request)));
		this.activate_register_tab_events(request);
		this.activate_recipients_middle(request);
	},
	
	
	insert_register_donation_amounts: function(request) {
		/* Inserts form so that user may enter donation information */
		this.prefs.set('register_state', 'donation_amounts');
		request.jQuery("#content").html( 
			this.register_wrapper_snippet(
				request, this.donation_amounts_middle(request)) );
		this.activate_register_tab_events(request);
	},
	
	donation_amounts_middle: function(request) {
		var context = new Context({
			pd_hr_per_week_max: this.prefs.get("pd_hr_per_week_max", constants.PD_DEFAULT_HR_PER_WEEK_MAX),
			pd_hr_per_week_goal: this.prefs.get("pd_hr_per_week_goal", constants.PD_DEFAULT_HR_PER_WEEK_GOAL),
			pd_cents_per_hr: this.prefs.get("pd_cents_per_hr", constants.PD_DEFAULT_CENTS_PER_HR),
			tws_hr_per_week_max: this.prefs.get("tws_hr_per_week_max", constants.TWS_DEFAULT_HR_PER_WEEK_MAX),
			tws_hr_per_week_goal: this.prefs.get("tws_hr_per_week_goal", constants.TWS_DEFAULT_HR_PER_WEEK_MAX),
			tws_cents_per_hr: this.prefs.get("tws_cents_per_hr", constants.TWS_DEFAULT_CENTS_PER_HR),
			constants: constants,
		});
		return Template.get("donation_amounts_middle").render(context);
	},
	
	impact_wrapper_snippet: function(request, middle) {
		return this._wrapper_snippet(
			request, middle, this.impact_tab_snippet(request));
	},
	
	progress_wrapper_snippet: function(request, middle) {
		return this._wrapper_snippet(
			request, middle, this.progress_tab_snippet(request));
	},
	
	messages_wrapper_snippet: function(request, middle) {
		return this._wrapper_snippet(
			request, middle, this.messages_tab_snippet(request));
	},
	
	register_wrapper_snippet: function(request, middle) {
		return this._wrapper_snippet(
			request, middle, this.register_tab_snippet(request));
	},
	
	settings_wrapper_snippet: function(request, middle) {
		return this._wrapper_snippet(
			request, middle, this.settings_tab_snippet(request));
	},
	
	_wrapper_snippet: function(request, middle, tab_snippet) {
		/*
		 * @param middle: html string to insert below tab_snippet and success, error, messages
		 * 
		 */
		//logger(middle);
		//logger(tab_snippet);
		var context = new Context({
			tab_snippet: tab_snippet,
			middle: middle
		});
		//return request.jQuery("#content").html(
		return Template.get("wrapper_snippet").render(context); //);
	},
	
	
	account_middle: function(request) {
		var context = new Context({
			twitter_username: this.prefs.get("twitter_username", ""),
			twitter_password: this.prefs.get("twitter_password", ""),
			email: this.prefs.get("email", ""),
			tos: this.prefs.get("tos", ""),
			constants: constants,
		});
		return Template.get("account_middle").render(context);
	},
	
	activate_account_middle: function(request) {
		request.jQuery("#what_is_twitter").click( function() {
			request.jQuery(this).text("\"A service to communicate and stay connected through the exchange of quick," +
						 "frequent answers to one simple question: What are you doing?\"")
				.css("display", "block")
				.addClass('open')
				.removeClass('link');
		});	
	},
	
	insert_settings_account: function(request) {
		/* Inserts user's twitter account form into page */
		this.prefs.set('settings_state', 'account');
		
		request.jQuery("#content").html( 
			this.settings_wrapper_snippet(
				request, this.account_middle(request)) );
		this.activate_settings_tab_events(request);
		this.activate_account_middle(request);
	},
	
	
	insert_settings_recipients: function(request) {
		/*
		 * Inserts form so that user may select recipients.
		 * 
		 * Slider input's alt must contain "last" value of input, 
		 * so when do keyboard presses we can compute how to alter the other tabs.
		 */
		this.prefs.set('settings_state', 'recipients');
		
		var html= this.settings_wrapper_snippet(
			request,
			this.recipients_middle(request));
		request.jQuery("#content").html(html);
		
		this.activate_settings_tab_events(request);
		this.activate_recipients_middle(request);
	},
	
	insert_settings_donation_amounts: function(request) {
		/* Inserts form so that user may enter donation information */
		this.prefs.set('settings_state', 'donation_amounts');
		request.jQuery("#content").html( 
			this.settings_wrapper_snippet(
				request, 
				this.donation_amounts_middle(request)) );
		this.activate_settings_tab_events(request);
	},
	
	insert_settings_site_classifications: function(request) {
		/* Inserts site classification html into page */
		this.prefs.set('settings_state', 'site_classifications');
		request.jQuery("#content").html(
			this.settings_wrapper_snippet(
				request, 
				this.site_classifications_middle(request)));
		this.activate_settings_tab_events(request);
		this.activate_site_classifications_middle(request);
	},
	
	insert_settings_support: function(request) {
		/* Inserts support ProcrasDonate info. */
		this.prefs.set('settings_state', 'support');
		request.jQuery("#content").html( 
			this.settings_wrapper_snippet(
				request, this.support_middle(request)) );
		this.activate_settings_tab_events(request);
		this.activate_support_middle(request);
	},
	
	insert_settings_payment_system: function(request) {
		var self = this;
		this.prefs.set('settings_state', 'payment_system');

		this.payment_system_middle(request, false);
	
		this.activate_settings_tab_events(request);
	},
	
	process_support: function(request, event) {
		var support_input = parseFloat( request.jQuery("#support_input").attr("value") );
			//request.jQuery("input[name='support_input']").attr("value"))

		logger("process_support:: support="+support_input);
		if ( support_input < 0 || support_input > 15 ) {
			request.jQuery("#errors").text("Please enter a percent between 0 and 15.");
			return false;

		} else {
			this.prefs.set('support_pct', _prefify_float(support_input));
			return true;
		}
	},
	
	validate_cents_input: function(request, v) {
		var cents = parseInt(v);
		//var hr_per_week_goal = parseFloat(
		//	request.jQuery("input[name='hr_per_week_goal']").attr("value"));
		var max = 2000;
		if ( cents > 0 && cents < max )
			return true;
		
		if ( cents >= max ) {
			var confirm_results = confirm("Do you really want to donate " + cents + "&cent; every hour you spend procrastinating up to your daily limit of " + hr_per_week_goal + "?");
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
		if ( hours > 0 )
			return true;
		else
			return false;
	},
	
	clean_cents_input: function(v) {
		var cents = parseInt(v);
		return cents;
	},
	
	clean_hours_input: function(v) {
		var hours = parseFloat(v);
		if ( hours > (24*7) )
			hours = (24*7);
		if ( parseInt(hours) != hours )
			hours = hours.toFixed(2);
		return hours;
	},
	
	validate_twitter_username_and_password: function(username, password) {
		return this.validate_string(username) && this.validate_string(password)
	},
	
	validate_string: function(v) {
		return v && v != ''
	},
	
		
	process_donation: function(request, event) {
		/*
		 * cents_per_hr: pos int
		 * hr_per_week_goal: pos float < 25
		 * hr_per_week_max: pos float < 25
		 */
		var pd_cents_per_hr = parseInt(
			request.jQuery("input[name='pd_cents_per_hr']").attr("value"));
		var pd_hr_per_week_goal = parseFloat(
			request.jQuery("input[name='pd_hr_per_week_goal']").attr("value"));
		var pd_hr_per_week_max = parseFloat(
			request.jQuery("input[name='pd_hr_per_week_max']").attr("value"));
		
		var tws_cents_per_hr = parseInt(
			request.jQuery("input[name='tws_cents_per_hr']").attr("value"));
		var tws_hr_per_week_goal = parseFloat(
			request.jQuery("input[name='tws_hr_per_week_goal']").attr("value"));
		var tws_hr_per_week_max = parseFloat(
			request.jQuery("input[name='tws_hr_per_week_max']").attr("value"));

		request.jQuery("#errors").text("");
		if ( !this.validate_cents_input(request, pd_cents_per_hr) || 
				!this.validate_cents_input(request, tws_cents_per_hr) ) {
			request.jQuery("#errors").append("<p>Please enter a valid dollar amount. For example, to donate $2.34 an hour, please enter 2.34</p>");
		} else if ( !this.validate_hours_input(request, pd_hr_per_week_goal) ||
				!this.validate_hours_input(request, tws_hr_per_week_goal)) {
			request.jQuery("#errors").append("<p>Please enter number of hours. For example, enter 1 hr and 15 minutes as 1.25</p>");
		} else if ( !this.validate_hours_input(request, pd_hr_per_week_max) ||
				!this.validate_hours_input(request, tws_hr_per_week_max)) {
			request.jQuery("#errors").append("<p>Please enter number of hours. For example, enter 30 minutes as .5</p>");
		} else {
			this.prefs.set('pd_cents_per_hr', this.clean_cents_input(pd_cents_per_hr));
			this.prefs.set('pd_hr_per_week_goal', this.clean_hours_input(pd_hr_per_week_goal));
			this.prefs.set('pd_hr_per_week_max', this.clean_hours_input(pd_hr_per_week_max));
			
			this.prefs.set('tws_cents_per_hr', this.clean_cents_input(tws_cents_per_hr));
			this.prefs.set('tws_hr_per_week_goal', this.clean_hours_input(tws_hr_per_week_goal));
			this.prefs.set('tws_hr_per_week_max', this.clean_hours_input(tws_hr_per_week_max));
			return true;
		}
		return false;
	},
	
	process_payment_system: function(request, event) {
		return true;
	},
	
	process_site_classifications: function(request, event) {
		return true;
	},
	
	process_recipients: function(request, event) {
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
	
	process_done: function(request, event) {
		return true;
	},
	
	process_account: function(request, event) {
		/*
		 * Validate account form and save.
		 * @TODO twitter credentials and recipient twitter name should be verified.
		 * @TODO all fields should be validated as soon as user tabs to next field.
		 */
		var self = this; 
		var ret = true;
		
		request.jQuery("#messages").html("");
		request.jQuery("#errors").html("");
		request.jQuery("#success").html("");

		var email = request.jQuery("input[name='email']").attr("value");
		if (email) {
			old_email = this.prefs.get("email", constants.DEFAULT_EMAIL);
			if (email != old_email) {
				// @TODO: use onload to know if email succeeded. if wrong email address, alert user.
				this.pd_api.send_welcome_email();
			}
			this.prefs.set("email", email);
		} else {
			request.jQuery("#errors").append("<p>To continue, please enter a valid email address.</p>");
			return false
		}
		
		var tos = request.jQuery("input[name='tos']");
		if (tos && !tos.attr("checked")) {
			request.jQuery("#errors").append("<p>To continue, please agree to the Terms of Use.</p>");
			ret = false;
			this.prefs.set("tos", false);
			return false;
		} else {
			this.prefs.set("tos", true);
		}

		/**** no more twitter tipjoy stuff ****/
		// @TODO no longer using tipjoy. needs to be redesigned.
		// idea: "Twitter" tab holds only TOS and optional email.
		//       "Balance" holds 'authorize payments' amazon FPS links
		return true;
		
		var twitter_username = request.jQuery("input[name='twitter_username']").attr("value");
		var twitter_password = request.jQuery("input[name='twitter_password']").attr("value");
		
		if ( !this.validate_twitter_username_and_password(twitter_username, 
														  twitter_password) ) {
			request.jQuery("#errors").append("<p>Please enter your twitter username and password</p>");
			ret = false;
			return false;
		} else {
			// Check if the username/password combo matches an existing account. We use
			// check balance for this in order to test that the password works, too.
			// If "no such tipjoy user", then create account 
			var self = this;
			logger(" about to check if account exists");
			this.tipjoy.check_exists(
				twitter_username,  
				function(r) {
					logger(" success! "+r.responseText);
					var result = eval("("+r.responseText+")").result;
					var exists = eval("("+r.responseText+")").exists;
					if ( result == "success" && exists ) {
						logger(" about to check balance ");
						self.tipjoy.check_balance(twitter_username, twitter_password,
							function(r) {
								var result = eval("("+r.responseText+")").result;
								if ( result == "success" ) {
									logger("tipjoy user exists and can sign-on");
									self.prefs.set('twitter_username', twitter_username);
									self.prefs.set('twitter_password', twitter_password);
									
									self[event](request);
								} else {
									logger("tipjoy user exists but can not sign-on");
									var reason = eval("("+r.responseText+")").reason;
									request.jQuery("#errors").append("tipjoy user exists but can not sign-on: "+reason);
								}
							}
						);
					} else {
						logger("tipjoy user does not exist");
						self.tipjoy.create_account(
							twitter_username,
							twitter_password,
							function(r) {
								var str = ""; for (var prop in r) {	str += prop + " value :" + r[prop]+ + " __ "; }
								logger(" account created "+r+"_"+str+" typeof="+typeof(r));
								
								var result = eval("("+r.responseText+")").result;
								if ( result == "success" ) {
									logger("created tipjoy account");
									self.prefs.set('twitter_username', twitter_username);
									self.prefs.set('twitter_password', twitter_password);
									
									self[event](request);
								} else {
									logger("problem creating tipjoy account");
									var str = ""; for (var prop in result) {	str += prop + " value :" + result[prop]+ + " __ "; }
									logger("_: "+str);
									var reason = eval("("+r.responseText+")").reason;
									logger("problem creating tipjoy account: "+reason);
									request.jQuery("#errors").append("problem creating tipjoy account: "+reason);
								}
							}
						);
					}
				}
			);
		}
		request.jQuery("#messages").append("verifying username and password...");
		return ret;
	},
	
	_tab_snippet: function(request, state_name, state_enums, tab_names) {
		/* Returns menu html for the specified state.
		 * 
		 * Currently, developers must call activate_<state_name>_tab_events() whenever
		 * this html is inserted into the DOM.
		 *
		 * @param state_name: string. one of 'settings' or 'impact
		 * @param state_enums: array. state enumeration. one of 'constants.SETTINGS_STATE_ENUM' or 'constants.IMPACT_STATE_ENUM'
		 * @param tab_names: array. tab names corresponding to enums. one of
		 * 		'constants.SETTINGS_STATE_TAB_NAMES' or 'constants.IMPACT_STATE_TAB_NAMES'
		 */
		var tabs_text = "<div id='" + state_name + "_tabs' class='tabs'>";
		
		var selected = this.prefs.get(state_name + '_state', '');
		
		for (i = 0; i < state_enums.length; i += 1) {
			var tab_state = state_enums[i];
			
			var tab_selected_class = '';
			if ( tab_state == selected ) { tab_selected_class = 'selected'; }
			
			tabs_text += "<div id='" + tab_state + "_tab' class='tab link " + tab_selected_class +"'>";
			tabs_text += tab_names[i];
			tabs_text += "</div>";
		}
		tabs_text += "</div>";
		
		return tabs_text;
	},
	
	register_tab_snippet: function(request) {
		/* Creates register state track. Does not call _tab_snippet! */
		var ret = this._track_snippet(request, 'register', constants.REGISTER_STATE_ENUM, constants.REGISTER_STATE_TAB_NAMES, true);
		var is_done = ( this.prefs.get('register_state','') == 'payment_system' );
		
		var context = new Context({
			constants: constants,
			is_done: is_done, 
		});
		ret += Template.get("next_prev_buttons").render(context);
		return ret;
	},
	
	settings_tab_snippet: function(request) {
		/* Creates settings state track.*/
		return this._track_snippet(request, 'settings', constants.SETTINGS_STATE_ENUM, constants.SETTINGS_STATE_TAB_NAMES, false);
	},
	
	progress_tab_snippet: function(request) {
		/* Creates settings state track.*/
		return this._track_snippet(request, 'progress', constants.PROGRESS_STATE_ENUM, constants.PROGRESS_STATE_TAB_NAMES, false);
	},
	
	messages_tab_snippet: function(request) {
		/* Creates settings state track.*/
		return this._track_snippet(request, 'messages', constants.MESSAGES_STATE_ENUM, constants.MESSAGES_STATE_TAB_NAMES, false);
	},
	
	_track_snippet: function(request, state_name, state_enum, tab_names, track_progress) {
		var tracks_text = "<table id='"+state_name+"_track' class='tracks'><tbody><tr>";
		
		var current_state = this.prefs.get(state_name+'_state', '');
		var current_state_index = state_enum.length;
		
		//#@TODO dont' show register track done thingy...
		// without using hardcoded number...or maybe ok?
		var max_enums = constants.REGISTER_STATE_TAB_NAMES.length - 1;
		
		for (i = 0; i < state_enum.length && i < max_enums; i += 1) {
			var track_state = state_enum[i];
			var track_name = tab_names[i];
			var image_number = i+1;
			
			var selected_class = '';
			if ( track_state == current_state ) {
				current_state_index = i;
				selected_class = 'selected';
			}
			
			var done_class = 'done';
			if ( i >= current_state_index ) {
				done_class = '';
			}
			
			var circle_image_name = constants.MEDIA_URL + "img/StepCircle" + image_number;
			var bar_image_name = constants.MEDIA_URL + "img/";
			
			if ( (track_progress && done_class) || selected_class ) {
				circle_image_name += "Done";
				bar_image_name += "DashGreen";	
			} else {
				if ( track_progress ) {
					bar_image_name += "Arrow";
				} else {
					bar_image_name += "DashGreen";
				}
			}
			circle_image_name += ".png";
			bar_image_name += ".png";
			
			if ( i != 0 ) {
				tracks_text += "<td><img src='"+ bar_image_name +"' class='StageBar'></td>";
			}
			
			tracks_text += "<td id='" + track_state + "_track' class='track " + selected_class +" "+ done_class +"'>";
			
				tracks_text += "<img src='"+ circle_image_name +"' class='StageCircle "+ done_class +"'>"
			
			tracks_text += "</td>";
		}
		tracks_text += "</tr><tr>";
		
		for (i = 0; i < state_enum.length && i < max_enums; i += 1) {
			var track_state = state_enum[i];
			var track_name = tab_names[i];
			
			var selected_class = '';
			if ( track_state == current_state ) {
				current_state_index = i;
				selected_class = 'selected';
			}
			
			var done_class = 'done';
			if ( i >= current_state_index ) {
				done_class = '';
			}
			
			if ( i != 0 ) { tracks_text += "<td></td>"; }
			tracks_text += "<td id='" + track_state + "_text' class='track_text " + selected_class +" "+ done_class +"'>" + track_name + "</td>";
		}
		
		tracks_text += "</tr></tbody></table>";
		return tracks_text;
	},
	
	impact_tab_snippet: function(request) {
		/* Calls _tab_snippet for impact state */
		return this._track_snippet(request, 'impact', constants.IMPACT_STATE_ENUM, constants.IMPACT_STATE_TAB_NAMES, false);
		//return _tab_snippet('impact', constants.IMPACT_STATE_ENUM, constants.IMPACT_STATE_TAB_NAMES);
	},
	
	_process_before_proceeding: function(request, state_name, state_enums, processors, event) {
		//logger("_process_before_proceeding event="+event);
		var self = this;
		return function() {
			for (var i = 0; i < state_enums.length; i += 1) {
				var tab_state = state_enums[i];
				if ( self.prefs.get(state_name+"_state", "") == tab_state ) {
					var processor = processors[i];
					//logger("PROCESS_BEFORE_PROCEEDING: "+processor);
					//logger(self[processor]);
					var ret = self[processor](request, event);
					//logger(" actual ret="+ret+" typeof="+typeof(ret));
					if ( ret ) {
						//logger("process returned true!"+event);
						self[event](request);
					}
					break;
				}
			}
		}
	},
	
	/// necessary because when did direct closure
	/* .click(
	 *     (function(event) { return event; })(self[event])
	 * )
	 * called functions had incorrect this
	 */
	_proceed: function(event, request) {
		var self = this;
		return function() {
			//self[fnname].apply(self, args);
			self[event](request);
		};
	},
	
	//#@TODO the settings, messages and impact activate_foo_tab_events 
	// can all be abstracted with a single activate_tab_events
	// that the current methods all call
	
	activate_settings_tab_events: function(request) {
		/* Attaches EventListeners to settings tabs */
		for (var i = 0; i < constants.SETTINGS_STATE_ENUM.length; i += 1) {
			var tab_state = constants.SETTINGS_STATE_ENUM[i];
			var event = constants.SETTINGS_STATE_INSERTS[i];
			// closure
			request.jQuery("#"+tab_state+"_track, #"+tab_state+"_text").click(
					this._process_before_proceeding(
						request, 
						'settings', 
						constants.SETTINGS_STATE_ENUM, 
						constants.SETTINGS_STATE_PROCESSORS, event) );
		}
		// cursor pointer to tracks
		request.jQuery(".track, .track_text").css("cursor","pointer");
		
		//@TODO
		request.jQuery(".press_enter_for_next").bind( 'keypress', function(e) {
			var code = (e.keyCode ? e.keyCode : e.which);
			if(code == 13) { //Enter keycode
				request.jQuery("#next_register_track").click();
			}
		});
	},
	
	activate_impact_tab_events: function(request) {
		/* Attaches EventListeners to impact tabs */
		var self=this;
		for (var i = 0; i < constants.IMPACT_STATE_ENUM.length; i += 1) {
			var tab_state = constants.IMPACT_STATE_ENUM[i];
			var event = constants.IMPACT_STATE_INSERTS[i];
			// closure
			request.jQuery("#"+tab_state+"_track, #"+tab_state+"_text").click(
				//(function(event) { return event; })(self[event])
				this._proceed(event, request)
			);
		}
		// cursor pointer to tracks
		request.jQuery(".track, .track_text").css("cursor","pointer");
		/*
		 * only works for tabs not tracks
		 for (var i = 0; i < constants.IMPACT_STATE_ENUM.length; i += 1) {
			var tab_state = constants.IMPACT_STATE_ENUM[i];
			var event = constants.IMPACT_STATE_INSERTS[i];
			// closure
			$("#"+tab_state+"_tab").click(
					(function (event) { return event; })(event)
			);
		}
		*/
	},
	
	activate_messages_tab_events: function(request) {
		/* Attaches EventListeners to messages tabs */
		var self=this;
		for (var i = 0; i < constants.MESSAGES_STATE_ENUM.length; i += 1) {
			var tab_state = constants.MESSAGES_STATE_ENUM[i];
			var event = constants.MESSAGES_STATE_INSERTS[i];
			// closure
			request.jQuery("#"+tab_state+"_track, #"+tab_state+"_text").click(
				//(function(event) { return event; })(self[event])
				this._proceed(event, request)
			);
		}
		// cursor pointer to tracks
		request.jQuery(".track, .track_text").css("cursor","pointer");
	},
	
	activate_register_tab_events: function(request) {
		/* Attaches EventListeners to register tabs */
		for (var i = 0; i < constants.REGISTER_STATE_ENUM.length; i += 1) {
			var tab_state = constants.REGISTER_STATE_ENUM[i];
			var current_state = this.prefs.get('register_state', '');
			
			if ( tab_state == current_state ) {
				if ( i > 0 ) {
					var prev = constants.REGISTER_STATE_INSERTS[i-1];
					request.jQuery("#prev_register_track").click(
						this._process_before_proceeding(
							request, 
							'register', 
							constants.REGISTER_STATE_ENUM, 
							constants.REGISTER_STATE_PROCESSORS, prev) );
				} else { request.jQuery("#prev_register_track").hide(); }
				
				if ( i < constants.REGISTER_STATE_ENUM.length ) {
					var next = constants.REGISTER_STATE_INSERTS[i+1];
					request.jQuery("#next_register_track").click(
						this._process_before_proceeding(
							request, 
							'register', 
							constants.REGISTER_STATE_ENUM, 
							constants.REGISTER_STATE_PROCESSORS, 
							next) );
				} else { request.jQuery("#next_register_track").hide(); }
			}
		}
		request.jQuery(".press_enter_for_next").bind( 'keypress', function(e) {
			var code = (e.keyCode ? e.keyCode : e.which);
			if(code == 13) { //Enter keycode
				request.jQuery("#next_register_track").click();
			}
		});
	},
	
	
	insert_register_account: function(request) {
		/* Inserts user's twitter account form into page */
		this.prefs.set('register_state', 'account');
		var html1 = this.account_middle(request);
		var html = this.register_wrapper_snippet(request, html1);
		request.jQuery("#content").html(html);
		this.activate_register_tab_events(request);
		this.activate_account_middle(request);
	},
	
	/************************** IMPACT INSERTIONS ***********************/
	
	activate_impact_middle: function(request, has_tags) {
		var self = this;
		request.jQuery(".site_rank .rank_text").hide();
		request.jQuery(".site_rank .bar").hover(
			function() {
				request.jQuery(this).children().show();
			},
			function() {
				request.jQuery(this).children().hide();
			}
		);
		request.jQuery(".menuitem").click( function() {
			var id = request.jQuery(this).attr("id");
			self.change_substate(request, id);
		});
	},
	
	change_substate: function(request, substate) {
		var self = this;
		
		if ( substate == "classify_sites" ) {
			this.prefs.set("settings_state", "site_classifications");
			_change_location(request, constants.SETTINGS_URL);
			
		} else if ( substate == "select_recipients" ) {
			this.prefs.set("settings_state", "recipients");
			_change_location(request, constants.SETTINGS_URL);
			
		} else if ( substate == "set_goals" ) {
			this.prefs.set("settings_state", "donation_amounts");
			_change_location(request, constants.SETTINGS_URL);
			
		} else {
			this.prefs.set("impact_substate", substate);
			var impact_state = this.prefs.get("impact_state", constants.DEFAULT_IMPACT_STATE);
			for (var i = 0; i < constants.IMPACT_STATE_ENUM.length; i++) {
				if ( constants.IMPACT_STATE_ENUM[i] == impact_state) {
					self[constants.IMPACT_STATE_INSERTS[i]](request);
				}
			}
		}
	},
	
	impact_middle: function(request, acontext, template) {
		var context = new Context({
			context: acontext,
			colors: ["#AACCFF", "#FFCCAA", "#FFCCAA", "#FFCCAA", "#FFCCAA", "#FFCCAA", "#FFCCAA"],
			constants: constants,
		});
		return Template.get(template).render(context);
	},
	
	insert_impact_sites: function(request) {
		/* insert sites chart */
		var self = this;
		this.prefs.set('impact_state', 'sites');
		var substate = this.prefs.get('impact_substate', constants.DEFAULT_IMPACT_SUBSTATE);
		
		var contenttype = this.pddb.ContentType.get_or_null({
			modelname: "SiteGroup"
		});
		
		var timetype = timetype = self.pddb.Forever;
		var time = _end_of_forever();
		if ( substate == "today" ) {
			timetype = self.pddb.Daily;
			time = _dbify_date(_end_of_day());
		} else if ( substate == "this_week" ) {
			timetype = self.pddb.Weekly;
			time = _dbify_date(_end_of_week());
		} else if ( substate == "all_time" ) {
			timetype = self.pddb.Forever;
			time = _end_of_forever();
		}
		
		var context = this.impact_data(
			request,
			contenttype,
			timetype,
			time,
			false
		);
		context.title = "Most Supported Sites";
		context.sub_title = "Time spent supporting sites"
		context.submenus = [
			[
				{name: "Today", substate: "today", selected:("today" == substate)},
				{name: "This Week", substate: "this_week", selected:("this_week" == substate)},
				{name: "All Time", substate: "all_time", selected:("all_time" == substate)}
			],
			[
				{name: "Daily", substate: "daily", coming:1},
				{name: "Weekly", substate: "weekly", coming:1}
			],
			[
				{name: "Classify Sites", substate: "classify_sites"}
			]
		];
		
		request.jQuery("#content").html(
			this.impact_wrapper_snippet(
				request, 
				this.impact_middle(request, context, "impact_middle")
			)
		);
			
		this.activate_impact_tab_events(request);
		this.activate_impact_middle(request);
	},
	
	insert_impact_recipients: function(request) {
		/* insert sites chart */
		var self = this;
		this.prefs.set('impact_state', 'recipients');
		var substate = this.prefs.get('impact_substate', constants.DEFAULT_IMPACT_SUBSTATE);
		
		var contenttype = this.pddb.ContentType.get_or_null({
			modelname: "Recipient"
		});
		
		var timetype = null;
		var time = null;
		if ( substate == "today" ) {
			timetype = self.pddb.Daily;
			time = _dbify_date(_end_of_day());
		} else if ( substate == "this_week" ) {
			timetype = self.pddb.Weekly;
			time = _dbify_date(_end_of_week());
		} else if ( substate == "all_time" ) {
			timetype = self.pddb.Forever;
			time = _end_of_forever();
		}
		
		var context = this.impact_data(
			request,
			contenttype,
			timetype,
			time,
			false
		);
		context.title = "Most Supported Recipients";
		context.sub_title = "Recipients ranked by your donations (in $)";
		context.submenus = [
			[
				{name: "Today", substate: "today", selected:("today" == substate)},
				{name: "This Week", substate: "this_week", selected:("this_week" == substate)},
				{name: "All Time", substate: "all_time", selected:("all_time" == substate)},
			],
			[
				{name: "Daily", substate: "daily", coming:1},
				{name: "Weekly", substate: "weekly", coming:1}
			],
			[
				{name: "Select Recipients", substate: "select_recipients"}
			]
		];
		
		request.jQuery("#content").html(
			this.impact_wrapper_snippet(
				request, 
				this.impact_middle(request, context, "impact_middle")
			)
		);
			
		this.activate_impact_tab_events(request);
		this.activate_impact_middle(request);
	},
	
	impact_menu_events: function() {
		return {
			"today": this.insert_subimpact_today,
			"this_week": this.insert_subimpact_this_week,
			"all_time": this.insert_subimpact_all_time,
			
			"daily": this.insert_subimpact_daily,
			"weekly": this.insert_subimpact_weekly,
			
			"select_recipients": this.insert_subimpact_select_recipients,
			"set_goals": this.insert_subimpact_set_goals
		}
	},
	
	insert_impact_goals: function(request) {
		/* insert sites chart */
		var self = this;
		this.prefs.set('impact_state', 'goals');
		var substate = this.prefs.get('impact_substate', constants.DEFAULT_IMPACT_SUBSTATE);
		
		var contenttype = this.pddb.ContentType.get_or_null({
			modelname: "Tag"
		});
		
		var timetype = null;
		var time = null;
		if ( substate == "today" ) {
			timetype = self.pddb.Daily;
			time = _dbify_date(_end_of_day());
		} else if ( substate == "this_week" ) {
			timetype = self.pddb.Weekly;
			time = _dbify_date(_end_of_week());
		} else if ( substate == "all_time" ) {
			timetype = self.pddb.Forever;
			time = _end_of_forever();
		}
		
		var context = this.impact_data(
			request,
			contenttype,
			timetype,
			time,
			true
		);
		context.title = "Goals";
		context.sub_title = "Total impact";
		// "Weekly progress towards goals"
		// "Weekly score-cards"
		context.submenus = [
			[
				{name: "Progress Today", substate: "today", selected:("today" == substate)},
				{name: "Progress This Week", substate: "this_week", selected:("this_week" == substate)},
				{name: "All Time", substate: "all_time", selected:("all_time" == substate)},
			],
			[
				{name: "Daily Comparison", substate: "daily", coming:1},
				{name: "Weekly Comparison", substate: "weekly", coming:1},
			],
			[
				{name: "Set Goals", substate: "set_goals"}
			]
		];
		
		request.jQuery("#content").html(
			this.impact_wrapper_snippet(
				request, 
				this.impact_middle(request, context, "impact_middle")
			)
		);
			
		this.activate_impact_tab_events(request);
		this.activate_impact_middle(request);
	},
	
	impact_data: function(request, contenttype, timetype, time, is_time) {
		var self = this;
		var data = [];
		var class_names = {};
		var max = 0;
		var order_by = "-total_time";
		if (!is_time) {
			order_by = "-total_amount";
		}
		
		this.pddb.Total.select({
			timetype_id: timetype.id,
			contenttype_id: contenttype.id,
			datetime: time
		}, function(row) {
			var total = 0;
			if (is_time) {
				// keep as dbified date for now
				total = parseInt(row.total_time);
			} else {
				// cents into dollars;
				total = (parseFloat(row.total_amount) / 100.0).toFixed(2);
			}
			if (total > max) { max = total; }
			// this is the Recipient, Tag, Site or SiteGroup
			var content = row.content();
			// we want to populate these based on specified contenttype
			var name;
			var class_name;
			if (contenttype.modelname == "Recipient") {
				name = content.name;
				class_name = content.category().category;
				
			} else if (contenttype.modelname == "SiteGroup") {
				name = content.host;
				class_name = content.tag().tag;
				
			} else if (contenttype.modelname == "Site") {
				name = content.url;
				class_name = content.sitegroup_id;

			} else if (contenttype.modelname == "Tag") {
				name = content.tag;
				class_name = content.tag;
			}
			data.push({
				name: name,
				class_name: class_name,
				total: total
			});
		},
		order_by
		);
		
		for (var i = 0; i < data.length; i++) {
			var datum = data[i];
			datum.percent = Math.round( (datum.total / max )*100 );
			if (is_time) {
				// format time
				var t = _start_of_day();
				t.setSeconds(datum.total);
				var hours = t.getHours();
				if (hours < 10) { hours = "0" + hours; }
				var minutes = t.getMinutes();
				if (minutes < 10) { minutes = "0" + minutes; }
				var seconds = t.getSeconds();
				if (seconds < 10) { seconds = "0" + seconds; }
				datum.total = hours + "h:" + minutes + "m." + seconds;
			}
			// collate list of class_names
			class_names[datum.class_name] = 1;
		}
		var cnames = [];
		for (var cname in class_names) {
			cnames.push(cname);
		}
		return {data: data, class_names: cnames}
	},
	
	insert_impact_goals_old: function(request) {
		/* Inserts weekly progress towards donation goals and max */
		this.prefs.set('impact_state', 'goals');
		
		var middle = "<div id='goals_chart' style='width:100%;height:25em;'></div>";
		request.jQuery("#content").html(
			this.impact_wrapper_snippet(request, middle) );
		this.activate_impact_tab_events(request);
		
		// days holds days of week
		var days = [];
		// days offset by half a day so chart looks centered
		var offset_days = [];
		var offset_days_offset = 12;
		var today = new Date();
		// zero out hours, mins, secs and msec
		var offset = today.getTimezoneOffset() / 60;
		today.setHours(-1*offset,0,0,0);
		// push previous days of week to days, oldest first
		for (var i = today.getDay(); i > 0; i--) {
			var d = new Date();
			d.setHours(-24 * i - offset,0,0,0);
			days.push(d);
			var d2 = new Date(d);
			d2.setHours(d2.getHours()-offset_days_offset);
			offset_days.push(d2);
		}
		days.push(today);
		var d2 = new Date(today);
		d2.setHours(d2.getHours()-offset_days_offset);
		offset_days.push(d2);
		for (var i = today.getDay()+1; i < 7; i++) {
			var d = new Date();
			d.setHours(24 * (i-today.getDay()) - offset,0,0,0);
			days.push(d);
			var d2 = new Date(d);
			d2.setHours(d2.getHours()-offset_days_offset);
			offset_days.push(d2);
		}
		
		var start_time = new Date(days[0]);
		start_time.setHours(start_time.getHours()-12);
		var end_time = new Date(days[6]);
		end_time.setHours(end_time.getHours()+12);
		var g = this.prefs.get('hr_per_week_goal',22);
		var goal = [ [start_time, g], [end_time, g] ];
		var m = this.prefs.get('hr_per_week_max',22);
		var max = [ [start_time, m], [end_time, m] ];
		var avg = (g+m)/2;
		var red_zone = [ [start_time, avg], [end_time, avg] ];
		
		var madeuphours = [6,5,3,7,7,3,4];
		var data = [];
		var sum = 0;
		for (var i = 0; i < days.length; i++) {
			sum += madeuphours[i];
			data.push( [offset_days[i].getTime(), sum] );
		}
		data.push( [end_time.getTime(), sum] );
		var options = {
			xaxis: { mode: "time" },
			grid: { hoverable: true, clickable: true, backgroundColor:"#FFF" },
			//selection: { mode: "y", },
			//crosshair: { mode: "xy", },
		};
		var red_solid = "#F55";
		var red = "rgba(255,200,200,0.8)";
		var red_gradient = { colors: [red, red, "#F55"] };
		var green_solid = "#8A8";
		var green = "#AFA";
		var green_gradient = { colors: ["#FFF", green] };
		var bars_solid = "#88A";
		var bars_bottom = "rgba(180, 180, 200, 0.8)";
		var bars_top = "rgba(180, 180, 200, 0.2)";
		var bars_gradient = { colors: [bars_bottom, bars_top] };
		request.jQuery.plot(request.jQuery("#goals_chart"), [ /*{data:red_zone,lines:{lineWidth:90}},*/
			{data:max,
			 lines: { fill:true, fillColor:red_gradient },
			 color: red_solid,
			 shadowSize: 0
			},
			{data:goal,
			 lines: { fill:true, fillColor:green_gradient },
			 color: green_solid,
			 shadowSize: 0
			},
			{data:data,
			 /*bars:{ show: true, align: "center", barWidth: 12*60*60*2000/*half a day*//*, lineWidth: 0, fillColor: bars_top },*/
			 /*points:{ show: true },*/
			 lines:{ show: true, steps: true, fill:true, fillColor:bars_gradient },
			 color: bars_solid,
			 shadowSize: 0
			 /*threshold: {below: g, color:"rgba(50, 255, 100, 0.8)"}*/
			}], options);
	},
	
	
	insert_impact_history: function(request) {
		/*
		 * Inserts historic information into impact.historic page
		 */
		this.prefs.set('impact_state', 'history');
		
		var middle = "<div id='procrasdonation_chart' style='width:100%;height:300px'></div>";
		request.jQuery("#content").html( 
			this.impact_wrapper_snippet(request, middle) );
		this.activate_impact_tab_events(request);
		
		var rawdata_procrasdonate = [ [1, 1], [2, 2], [3, 3] ];
		var rawdata_unsorted = [ [1, 4], [2, 6], [3, 4] ];
		var rawdata_work = [ [1, 7], [2, 5], [3, 3] ];
		var data = [
			{
				data: rawdata_procrasdonate,
				label: "Procrasdonation",
			},
			{
				data: rawdata_unsorted,
				label: "Unsorted",
			},
			{
				data: rawdata_work,
				label: "rawdata_work",
			},
		];
		var options = {
			lines: { show: true },
			points: { show: true },
			bars: { show: true, align: "center" },
			selection: { mode: "x", },
			// crosshair: { mode: "xy", },
		};
		//$.plot($("#procrasdonation_chart"), data, options);
	},
	
	insert_messages_all: function(request) {
		var self = this;
		this.prefs.set('messages_state', 'all');

		var middle = Template.get("messages_all_middle").render(new Context({}));
		request.jQuery("#content").html( this.messages_wrapper_snippet(request, middle) );
		
		this.activate_messages_tab_events(request);
	},
	/*
	"insert_messages_all",
	"insert_messages_thankyous",
	"insert_messages_newsletters",
	"insert_messages_weekly",
	"insert_messages_tax",
	*/
	
	insert_progress_overview: function(request) {
		var self = this;
		this.prefs.set('progress_state', 'overview');

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
		
		var middle = Template.get("progress_overview_middle").render(
			new Context({
				pd_total_this_week: pd_total_this_week,
				pd_total_last_week: pd_total_last_week,
				pd_total: pd_total
			})
		);
		request.jQuery("#content").html( this.progress_wrapper_snippet(request, middle) );
	},
});
