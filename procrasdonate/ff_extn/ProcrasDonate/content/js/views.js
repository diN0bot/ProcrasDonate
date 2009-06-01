
//var constants = CONSTANTS();

// Controller
// * handles 'views' for browser-generated ProcrasDonate.com pages
var Controller = function(prefs, pddb) {
	logger("Controller()");
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
		logger("Controller.handler: url="+request.url);
		var host = _host(request.url);
		if (host.match(new RegExp(constants.PD_HOST)))
			//request.do_in_page(_bind(this.page, this.page.insert_settings_recipients, request));
			//request.do_in_page(
			//	_bind(this.page, this.page.insert_settings_donation_amounts, request));
			//request.do_in_page(_bind(this.page, this.page.insert_settings_twitter_account, request));
			//request.do_in_page(_bind(this, this.pd_dispatch_by_url, request));
			return this.pd_dispatch_by_url(request);
		else
			return false;
	},
	
	insert_based_on_state: function(request, state_name, state_enums, event_inserts) {
		/* Calls appropriate insert method based on current state
		 * 
		 * @param state_name: string. one of 'settings', 'register' or 'impact
		 * @param state_enums: array. state enumeration. one of 'constants.SETTINGS_STATE_ENUM',
		 * 		'constants.REGISTER_STATE_ENUM' or 'constants.IMPACT_STATE_ENUM'
		 * @param event_inserts: array. functions corresponding to enums. one of
		 * 		'constants.SETTINGS_STATE_INSERTS', 'constants.IMPACT_STATE_INSERTS', 'constants.REGISTER_STATE_INSERTS'
		 */
		//this.page.$ = request.jQuery;
		this.prefs.set('site_classifications_settings_activated', true);
		for (var i = 0; i < state_enums.length; i += 1) {
			var state = state_enums[i];
			if ( this.prefs.get(state_name + '_state', '') == state ) {
				logger(event_inserts[i]);
				//return false;
				this.page[event_inserts[i]](request);
				return true;
			}
		}
		return false;
	},
	
	pd_dispatch_by_url: function(request) {
		logger("pd_dispatch_by_url: "+ request.url);
		if (this.registration_complete) {
			this.page.registration_complete_inserts(request);
		}
		
		switch (request.url) {
		case constants.START_URL:
			var state_matched = this.insert_based_on_state(
				request,
				'register', 
				constants.REGISTER_STATE_ENUM, 
				constants.REGISTER_STATE_INSERTS);
			
			if (!state_matched) {
				this.prefs.set('register_state', constants.DEFAULT_REGISTER_STATE);
				this.insert_based_on_state(
					request,
					'register', 
					constants.REGISTER_STATE_ENUM, 
					constants.REGISTER_STATE_INSERTS);
			}
			break;
		case constants.SETTINGS_URL:
			var state_matched = this.insert_based_on_state(
				request,
				'settings', 
				constants.SETTINGS_STATE_ENUM, 
				constants.SETTINGS_STATE_INSERTS);
			
			if (!state_matched) {
				this.prefs.set('settings_state', constants.DEFAULT_SETTINGS_STATE);
				this.insert_based_on_state(
					request,
					'settings', 
					constants.SETTINGS_STATE_ENUM, 
					constants.SETTINGS_STATE_INSERTS);
			}
			break;
		case constants.IMPACT_URL:
			var state_matched = this.insert_based_on_state(
				request,
				'impact', 
				constants.IMPACT_STATE_ENUM, 
				constants.IMPACT_STATE_INSERTS);
			
			if (!state_matched) {
				this.prefs.set('impact_state', constants.DEFAULT_IMPACT_STATE);
				this.insert_based_on_state(
					request,
					'impact', 
					constants.IMPACT_STATE_ENUM, 
					constants.IMPACT_STATE_INSERTS);
			}
			break;
		case constants.RESET_URL:
			this.reset_state_to_defaults();
			this.reset_account_to_defaults();
			break;
		default:
			//return false;
			//throw new Error("Invalid ProcrasDonate URL: " + request.url);
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
		impact_state: constants.DEFAULT_IMPACT_STATE,
		register_state: constants.DEFAULT_REGISTER_STATE,
	},
	
	initialize_state: function() {
		this.initialize_account_defaults_if_necessary();
		this.initialize_state_if_necessary();
		
		// construct user hash
		var monsterbet = "abcdefghijklmnopqrstuvwxyzABCEFGHIJKLMNOPQRSTUVXYZ0123456789";
		var hash = [];
		for (var i = 0; i < 22; i++) {
			hash.push( monsterbet[Math.floor(Math.random()*62)] );
		}
		this.prefs.set('hash', hash.join(''));
	},
	
	registration_complete: function() {
		return this.prefs.get('register_state', false) == 'done';
	},
	
	initialize_state_if_necessary: function() {
		logger("initialize_state_if_necessary()");
		/*
		 * Initialize settings and impact state enumerations. Other inits?
		 */
		var self = this;
		_iterate(this.STATE_DEFAULTS, function(name, value) {
			if (!self.prefs.get(name, ''))
				return self.prefs.set(name, value);
		});
		
		var last_24hr_mark = this.prefs.get("last_24hr_mark", "");
		if (!last_24hr_mark) {
			
			function get_semi_random_date() {
				/* @returns: Date object for current day, month and fullyear with random hours, minutes and seconds */
				var d = new Date();
				// Math.floor(Math.random()*X) generates random ints, x: 0 <= x < X
				d.setHours(Math.floor(Math.random()*24));
				d.setMinutes(Math.floor(Math.random()*60));
				d.setSeconds(Math.floor(Math.random()*60));
				return d;
			}
			
			last_24hr_mark = Math.floor(get_semi_random_date().getTime() / 1000);
			this.prefs.set("last_24hr_mark", last_24hr_mark);
		}
		
		var last_week_mark = this.prefs.get("last_week_mark", "") * 1000;
		if (!last_week_mark) {
			last_week_mark = new Date(last_24hr_mark * 1000);
			this.prefs.set("last_week_mark", last_week_mark);
		}
	},
	
	ACCOUNT_DEFAULTS: {
		hash: "nohash",
		twitter_username: constants.DEFAULT_USERNAME,
		twitter_password: constants.DEFAULT_PASSWORD,
		cents_per_hr: constants.DEFAULT_CENTS_PER_HR,
		hr_per_week_goal: constants.DEFAULT_HR_PER_WEEK_GOAL,
		hr_per_week_max: constants.DEFAULT_HR_PER_WEEK_MAX,
	},
	
	initialize_account_defaults_if_necessary: function() {
		logger("initialize_account_defaults_if_necessary()");
		/*
		 * Set any blank account data to defaults.
		 */
		var self = this;
		_iterate(this.ACCOUNT_DEFAULTS, function init(name, value) {
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
			self.prefs.set(name, value);
		});
	},
});

function Schedule(prefs, pddb) {
	logger("Schedule()");
	this.prefs = prefs;
	this.pddb = pddb;
}
Schedule.prototype = {};
_extend(Schedule.prototype, {
	run: function() {
		// 4.
		if ( this.is_new_24hr_period() ) {
			this.do_once_daily_tasks();
		}
		if ( this.is_new_week_period() ) {
			this.do_once_weekly_tasks();
		}
	},
	
	is_new_24hr_period: function() {
		/* @returns: true if it is at least 24 hrs past the last 24hr mark */
		var two_four_hr = new Date(this.prefs.get('last_24hr_mark', '')*1000);
		var now = new Date();
		two_four_hr.setHours(two_four_hr.getHours() + 24);
		return now > two_four_hr
	},
	
	do_once_daily_tasks: function() {
		// reset last_24hr_mark to now
		var two_four_hr = new Date(this.prefs.get('last_24hr_mark', '')*1000);
		var now = new Date();
		now.setHours(two_four_hr.getHours());
		now.setMinutes(two_four_hr.getMinutes());
		now.setSeconds(two_four_hr.getSeconds());
		if ( now > new Date() ) {
			now.setDate( now.getDate() - 1 );
		}
		this.prefs.set('last_24hr_mark', Math.floor(now.getTime()/1000));
		alert("ding! last 24hr "+two_four_hr+" new 24hr "+now+"  now  "+new Date());
	},
	
	is_new_week_period: function() {
		/* @returns: true if it is at least 1 week past the last week mark */
		var week_hr = new Date(this.prefs.get('last_week_mark', '')*1000);
		var now = new Date();
		week_hr.setDate(week_hr.getDate() + 7);
		return now > week_hr
	},
	
	do_once_weekly_tasks: function() {
		// reset last_week_mark to now
		var week_hr = new Date(this.prefs.get('last_week_mark', '')*1000);
		var now = new Date();
		now.setHours(week_hr.getHours());
		now.setMinutes(week_hr.getMinutes());
		now.setSeconds(week_hr.getSeconds());
		if ( now > new Date() ) {
			now.setDate( now.getDate() - 1 );
		}
		this.prefs.set('last_week_mark', Math.floor(now.getTime()/1000));
		
		alert("ding! last week "+week_hr+" new week "+now+"  now  "+new Date());
	},
});


/********** HTML INSERTION FUNCTIONS AND HELPERS ***************/

function PageController(prefs, pddb) {
	logger("PageController()");
	this.prefs = prefs;
	this.tipjoy = new TipJoy_API(this.prefs);
	this.pddb = pddb;
}
PageController.prototype = {};
_extend(PageController.prototype, {
	
	registration_complete_inserts: function(request) {
		request.jQuery("#start_now_menu_item a")
			.attr("href", constants.SETTINGS_URL)
			.text("Settings");
		/*request.jQuery("#StartButton")
			.attr("src", constants.MEDIA_URL+"img/DoneButton.png");*/
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
	
	balance_middle: function(request, is_register) {
		var middle = Template.get("balance_middle").render(new Context({}));
		if (is_register) {
			request.jQuery("#content").html( this.register_wrapper_snippet(request, middle) );
		} else {
			request.jQuery("#content").html( this.settings_wrapper_snippet(request, middle) );
		}
		
		this.tipjoy.check_balance(
			this.prefs.get("twitter_username", false),
			this.prefs.get("twitter_password", false),
			function(r) {
				var response = eval("("+r.responseText+")");
				if ( response.result == "success" ) {
					request.jQuery("#balance_here").text(response.balance);
				} else {
					var reason = eval("("+r.responseText+")").reason;
					request.jQuery("#balance").append("Problem retrieving balance from TipJoy: "+reason);
				}
			},
			function(r) {
				var str = ""; for (var prop in r) {	str += prop + " value :" + r[prop]+ + " __ "; }
				logger("standard_onerror: "+r+"_"+str);
				var reason = eval("("+r.responseText+")").reason;
				request.jQuery("#errors").append("An error occurred: " + reason);
			}
		);
	},
	
	insert_register_balance: function(request) {
		/* Inserts balance/TipJoy info. */
		var self = this;
		this.prefs.set('register_state', 'balance');

		this.balance_middle(request, true);
	
		this.activate_register_tab_events(request);
	},
	
	support_middle: function(request) {
		var pd_recipient = this.pddb.Recipient.get_or_null({
			name: "ProcrasDonate"
		});
		var pd_recipientpercent = this.pddb.RecipientPercent.get_or_null({
			recipient_id: pd_recipient.id
		});
		var context = new Context({
			pct: parseFloat(pd_recipientpercent.percent) * 100.0,
			constants: constants,
		});
		return Template.get("support_middle").render(context);
	},
	
	activate_support_middle: function(request) {
		var pct = .22;//this.prefs.get('support_pct', constants.DEFAULT_SUPPORT_PCT);
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
			self.prefs.set('support_pct', newv);
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
			unsafeWin = unsafeWin.wrappedJSObject;
		}
		
		new XPCNativeWrapper(unsafeWin, "location").location = constants.IMPACT_URL;
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
		});
		return Template.get("site_classifications_middle").render(context);
	},
	
	activate_site_classifications_middle: function(request) {
		var self = this;
		//if ( this.prefs.get('site_classifications_settings_activated', false) ) {
			
			var f = function(elem, tag, db_tag) {
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
				
				new_elem.click( function() {
					f(new_elem, tag, db_tag);
				});
				
				logger(" hshshshshshs tag="+db_tag+"     site_name="+site_name);
				// alter data in db
				self.pddb.SiteGroup.set({
					tag_id: db_tag.id
				}, {
					host: site_name
				});
				logger(" yes ");
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
		logger("Inside insert_register_site_classifications!");
		/* Inserts site classification html into page */
		this.prefs.set('register_state', 'site_classifications');
		logger("getting html");
		var html = this.register_wrapper_snippet(
			request, this.site_classifications_middle(request));
		logger(html);
		request.jQuery("#content").html(html);
		this.activate_register_tab_events(request);
		this.activate_site_classifications_middle(request);
	},
	
	recipient_snippet: function(request, recipient) {
		var context = new Context({
			id: recipient.id,
			url: recipient.url,
			name: recipient.name,
			mission: recipient.mission,
			description: recipient.description,
			constants: constants
		});
		return Template.get("recipient_snippet").render(context);
	},
	
	recipient_with_percent_snippet: function(request, recipient, percent) {
		var context = new Context({
			id: recipient.id,
			url: recipient.url,
			name: recipient.name,
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
		
		this.pddb.RecipientPercent.select({}, function(row) {
			var recipient = self.pddb.Recipient.get_or_null({ id: row.recipient_id });
			var percent = parseFloat(row.percent) * 100.0;
			
			logger(" inside recipients_middle: recipient="+recipient+" percent="+percent);
			
			if (recipient && recipient.twitter_name != "ProcrasDonate") {
				user_recipients += self.recipient_with_percent_snippet(request, recipient, percent);
				/*
				"<div class='recipient_row'>" +
					//self.recipient_snippet(recipient.name, recipient.url, recipient.description) +
					//"<div id='slider" + i + "' class='slider' alt='" + percent + "'></div>" +
					//"<input id='input"+ i + "' class='input' alt='" + percent + "' value='" + percent + "' size='1'/>" +
				this.recipient_snippet(request, name, url, description) +
					"<div id='slider" + i + "' class='slider' alt='" + pct + "'></div>" +
					"<input id='input"+ i + "' class='input' alt='" + pct + "' value='" + pct + "' size='1'/>" +
					"<div class='remove'>X</div>" +
				"</div>";
				*/
			}
		});
		
		var spacer = "<div id='recipient_spacer_row'>&nbsp;----------------------thespacer------------</div>";
		
		var potential_recipients = "";
		this.pddb.Recipient.select({ is_visible: True }, function(row) {
			if (self.pddb.RecipientPercent.get_or_null({ recipient_id: row.id })) {
				logger(" if=T inside recipients_middle: recipient="+row);
			} else {
				logger(" if=F inside recipients_middle: recipient="+row);
				potential_recipients += self.recipient_snippet(request, row);
			}
		});
		
		var cell_text =
			"<div id='user_recipients'>" +
				user_recipients +
			"</div>" +
			spacer +
			"<div id='potential_recipients'>" +
				potential_recipients +
			"</div>";
		return cell_text;
	},
	
	activate_recipients_middle: function(request) {
		var self = this;
		
		request.jQuery(".recipient_id").hide();
		
		var spacer = request.jQuery("#recipient_spacer_row");
		
		request.jQuery(".add_recipient").click(function() {
			var recipient_id = request.jQuery(this).siblings(".recipient_id").text();
			var recipient = self.pddb.Recipient.get_or_null({ id: recipient_id });
			self.pddb.RecipientPercent.create({
				recipient_id: recipient_id,
				percent: 0
			});
			request.jQuery(this).parent().remove();
			spacer.before(self.recipient_with_percent_snippet(request, recipient, 0));
			
			self.activate_recipients_middle(request);
		});
		
		request.jQuery(".remove_recipient").click(function() {
			var recipient_id = request.jQuery(this).siblings(".recipient_id").text();
			self.pddb.RecipientPercent.del({
				recipient_id: recipient_id
			});
			var recipient = self.pddb.Recipient.get_or_null({ id: recipient_id });
			
			//request.jQuery(this).parent().clone(true).insertAfter(spacer);
			request.jQuery(this).parent().remove();
			spacer.after(self.recipient_snippet(request, recipient));
			
			self.activate_recipients_middle(request);
		});
		
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
			hr_per_week_max: this.prefs.get("hr_per_week_max", ""),
			hr_per_week_goal: this.prefs.get("hr_per_week_goal", ""),
			cents_per_hr: this.prefs.get("cents_per_hr", ""),
			constants: constants,
		});
		return Template.get("donation_amounts_middle").render(context);
	},
	
	impact_wrapper_snippet: function(request, middle) {
		return this._wrapper_snippet(
			request, middle, this.impact_tab_snippet(request));
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
		logger("_wrapper_snippet");
		//logger(middle);
		//logger(tab_snippet);
		var context = new Context({
			tab_snippet: tab_snippet,
			middle: middle
		});
		logger("_wrapper_snippet: " + request)
		//return request.jQuery("#content").html(
		return Template.get("wrapper_snippet").render(context); //);
	},
	
	
	twitter_account_middle: function(request) {
		var context = new Context({
			twitter_username: this.prefs.get("twitter_username", ""),
			twitter_password: this.prefs.get("twitter_password", ""),
			constants: constants,
		});
		return Template.get("twitter_account_middle").render(context);
	},
	
	activate_twitter_account_middle: function(request) {
		request.jQuery("#what_is_twitter").click( function() {
			request.jQuery(this).text("\"A service to communicate and stay connected through the exchange of quick," +
						 "frequent answers to one simple question: What are you doing?\"")
				.css("display", "block")
				.addClass('open')
				.removeClass('link');
		});	
	},
	
	insert_settings_twitter_account: function(request) {
		/* Inserts user's twitter account form into page */
		this.prefs.set('settings_state', 'twitter_account');
		
		request.jQuery("#content").html( 
			this.settings_wrapper_snippet(
				request, this.twitter_account_middle(request)) );
		this.activate_settings_tab_events(request);
		this.activate_twitter_account_middle(request);
	},
	
	
	insert_settings_recipients: function(request) {
		/*
		 * Inserts form so that user may select recipients.
		 * 
		 * Slider input's alt must contain "last" value of input, so when do keyboard presses we can compute how to alter the other tabs.
		 */
		logger("insert_settings_recipients");
		this.prefs.set('settings_state', 'recipients');
		
		var html= this.settings_wrapper_snippet(
			request,
			this.recipients_middle(request));
		logger(html);
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
	
	insert_settings_balance: function(request) {
		/* Inserts balance/TipJoy info. */
		var self = this;
		this.prefs.set('settings_state', 'balance');

		this.balance_middle(request, false);
	
		this.activate_settings_tab_events(request);
	},
	
	process_support: function(request, event) {
		var support_input = parseFloat(
			request.jQuery("input[name='support_input']").attr("value"))
		
		if ( support_input < 0 || support_input > 100 ) {
			request.jQuery("#errors").text("<p>Please enter a percent between 0 and 10.</p>");
		} else {
			var pd_recipient = this.pddb.Recipient.get_or_null({ name: "ProcrasDonate" });
			this.pddb.RecipientPercent.set({
				percent: support_input / 100.0
			}, {
				recipient_id: pd_recipient.id
			});
			return true;
		}
		return false;
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
		var cents_per_hr = parseInt(
			request.jQuery("input[name='cents_per_hr']").attr("value"));
		var hr_per_week_goal = parseFloat(
			request.jQuery("input[name='hr_per_week_goal']").attr("value"));
		var hr_per_week_max = parseFloat(
			request.jQuery("input[name='hr_per_week_max']").attr("value"));
		request.jQuery("#errors").text("");
		if ( !this.validate_cents_input(request, cents_per_hr) ) {
			request.jQuery("#errors").append("<p>Please enter a valid dollar amount. For example, to donate $2.34 an hour, please enter 2.34</p>");
		} else if ( !this.validate_hours_input(request, hr_per_week_goal) ) {
			request.jQuery("#errors").append("<p>Please enter number of hours. For example, enter 1 hr and 15 minutes as 1.25</p>");
		} else if (!this.validate_hours_input(request, hr_per_week_max) ) {
			request.jQuery("#errors").append("<p>Please enter number of hours. For example, enter 30 minutes as .5</p>");
		} else {
			this.prefs.set('cents_per_hr', this.clean_cents_input(cents_per_hr));
			this.prefs.set('hr_per_week_goal', this.clean_hours_input(hr_per_week_goal));
			this.prefs.set('hr_per_week_max', this.clean_hours_input(hr_per_week_max));
			return true;
		}
		return false;
	},
	
	process_balance: function(request, event) {
		return true;
	},
	
	process_site_classifications: function(request, event) {
		return true;
	},
	
	process_recipients: function(request, event) {
		var self = this;
		request.jQuery("input").each( function() {
			var percent = request.jQuery(this).attr("value");
			try {
				percent = parseFloat(percent) / 100.0;
				if (percent < 0.0) {
					request.jQuery("#errors").append("<p>Please enter a percent greater than 0");
					return false;
				}
			} catch(e) {
				request.jQuery("#errors").append("<p>Please enter a numerical percent, such as 22</p>");
				return false;
			}
			var recipient_id = request.jQuery(this).parent().siblings(".recipient_id").text();
			self.pddb.RecipientPercent.set({ percent: percent }, { recipient_id: recipient_id });
		});
		return true;
	},
	
	process_done: function(request, event) {
		return true;
	},
	
	process_twitter_account: function(request, event) {
		/*
		 * Validate account form and save.
		 * @TODO twitter credentials and recipient twitter name should be verified.
		 * @TODO all fields should be validated as soon as user tabs to next field.
		 */
		var self = this; 
		
		request.jQuery("#messages").html("");
		request.jQuery("#errors").html("");
		request.jQuery("#success").html("");
		
		var twitter_username = request.jQuery(
			"input[name='twitter_username']").attr("value");
		var twitter_password = request.jQuery(
			"input[name='twitter_password']").attr("value");
		
		if ( !this.validate_twitter_username_and_password(twitter_username, 
														  twitter_password) ) {
			request.jQuery("#errors").append("<p>Please enter your twitter username and password</p>");
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
							},
							function(r) {
								var str = ""; for (var prop in r) {	str += prop + " value :" + r[prop]+ + " __ "; }
								logger("standard_onerror: "+r+"_"+str);
								var reason = eval("("+r.responseText+")").reason;
								request.jQuery("#errors").append("An error occurred: " + reason);
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
									
									event();
								} else {
									logger("problem creating tipjoy account");
									var str = ""; for (var prop in result) {	str += prop + " value :" + result[prop]+ + " __ "; }
									logger("_: "+str);
									var reason = eval("("+r.responseText+")").reason;
									logger("problem creating tipjoy account: "+reason);
									request.jQuery("#errors").append("problem creating tipjoy account: "+reason);
								}
							},
							function(r) {
								var str = ""; for (var prop in r) {	str += prop + " value :" + r[prop]+ + " __ "; }
								logger("standard_onerror: "+r+"_"+str);
								var reason = eval("("+r.responseText+")").reason;
								request.jQuery("#errors").append("An error occurred: " + reason);
							}
						);
					}
				},
				function(r) {
					var str = ""; for (var prop in r) {	str += prop + " value :" + r[prop]+ + " __ "; }
					logger("standard_onerror: "+r+"_"+str);
					var reason = eval("("+r.responseText+")").reason;
					request.jQuery("#errors").append("An error occurred: " + reason);
				}
			);
		}
		request.jQuery("#messages").append("verifying username and password...");
		return false;
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
		var next_src = constants.MEDIA_URL +"img/NextArrow.png";
		if ( this.prefs.get('register_state','') == 'balance' ) {
			next_src = constants.MEDIA_URL +"img/DoneButton.png";
		}
		ret += "" +
			"<div id='register_prev_next'>" +
				"<img src='"+ constants.MEDIA_URL +"img/BackArrow.png' id='prev_register_track' class='link register_button'>" +
				"<img src='"+ next_src +"' id='next_register_track' class='link register_button'>"	+		
			"</div>";
			//"<input id='prev_register_track' class='link' type='button' name='save' value='Prev'>" +
			//"<input id='next_register_track' class='link' type='button' name='save' value='" + next_value + "'>";
		return ret;
	},
	
	settings_tab_snippet: function(request) {
		/* Creates settings state track.*/
		return this._track_snippet(request, 'settings', constants.SETTINGS_STATE_ENUM, constants.SETTINGS_STATE_TAB_NAMES, false);
	},
	
	_track_snippet: function(request, state_name, state_enum, tab_names, track_progress) {
		var tracks_text = "<table id='"+state_name+"_track' class='tracks'><tbody><tr>";
		
		var current_state = this.prefs.get(state_name+'_state', '');
		var current_state_index = state_enum.length;
		
		for (i = 0; i < state_enum.length && i < 6; i += 1) {
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
		
		for (i = 0; i < state_enum.length && i < 6; i += 1) {
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
		logger("_process_before_proceeding event="+event);
		var self = this;
		return function() {
			for (var i = 0; i < state_enums.length; i += 1) {
				var tab_state = state_enums[i];
				if ( self.prefs.get(state_name+"_state", "") == tab_state ) {
					var processor = processors[i];
					logger(processor);
					//logger(self[processor]);
					if ( self[processor](request, event) ) {
						logger(event);
						self[event](request);
					}
					break;
				}
			}
		}
	},
	
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
				(function(event) { return event; })(self[event])
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
	
	/************************** IMPACT INSERTIONS ***********************/
	
	insert_register_twitter_account: function(request) {
		/* Inserts user's twitter account form into page */
		this.prefs.set('register_state', 'twitter_account');
		var html1 = this.twitter_account_middle(request);
		//logger(html1);
		var html = this.register_wrapper_snippet(request, html1);
		//logger(html);
		logger(document.defaultView);
		//logger($("#content", document.defaultView.document).length);
		request.jQuery("#content").html(html);
		this.activate_register_tab_events(request);
		this.activate_twitter_account_middle(request);
	},
	
	impact_sites_middle: function(request, data, show_tags) {
		logger(" IMPACT SITES MIDDLE "+data);
		var context = new Context({
			data: data,
			show_tags: show_tags,
			width: 100, //parseInt( ((data[i][1]+1)/max)*100.0 ),
			constants: constants,
		});
		return Template.get("impact_sites_middle").render(context);
	},
	
	activate_impact_sites_middle: function(request, has_tags) {
		request.jQuery(".site_rank .rank_text").hide();
		request.jQuery(".site_rank .bar").hover(
			function() {
				request.jQuery(this).children().show();
			},
			function() {
				request.jQuery(this).children().hide();
			}
		);
	},
	
	insert_impact_sites: function(request) {
		/* insert sites chart */
		this.prefs.set('impact_state', 'sites');
		var sort_arr = [
			['www.ycombinator.com', 120, 200, 'timewellspent'],
			['bilumi.org', 100, 100, 'procrasdonate'],
			['gmail.com', 45, 75, 'timewellspent'],
			['www.slashdot.com', 30, 50, 'other'],
			['www.javascriptkit.com', 30, 50, 'other'],
			['news.ycombinator.com', 2, 2, 'timewellspent'],
			['hulu.com', 1, 1, 'procrasdonate'],
		];
		logger(request);
		request.jQuery("#content").html(
			this.impact_wrapper_snippet(request, this.impact_sites_middle(sort_arr, true)) );
		this.activate_impact_tab_events(request);
		this.activate_impact_sites_middle(request);
	},
	
	insert_impact_recipients: function(request) {
		/* insert sites chart */
		this.prefs.set('impact_state', 'recipients');
		var data = [];
		
		//var type = Type.get_or_create({ type: "Forever" });
		//DailyVisit.select({ site_id: null }, function() {
		//	var recipient = Recipient.get_or_null({ id: row.recipient_id });
		//	var percent = RecipientPercent.get_or_null({ recipient_id: recipient.id }).percent;
		//	percent = Math.round( parseFloat(percent) * 100 );
		//	data.push( [dailyvisit, recipient, percent] );
		//});
		
		var sort_arr = [
			['bilumi', 120, 200],
			['miller', 100, 100],
			['pd', 45, 75],
		];
		request.jQuery("#content").html(
			this.impact_wrapper_snippet(
				request, 
				this.impact_sites_middle(request, sort_arr, false)) );
		this.activate_impact_tab_events(request);
		this.activate_impact_sites_middle(request);
	},
	
	insert_impact_goals: function(request) {
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
			//_logger("   past: "+d);
		}
		days.push(today);
		var d2 = new Date(today);
		d2.setHours(d2.getHours()-offset_days_offset);
		offset_days.push(d2);
		//_logger("   today: "+today);
		for (var i = today.getDay()+1; i < 7; i++) {
			var d = new Date();
			d.setHours(24 * (i-today.getDay()) - offset,0,0,0);
			days.push(d);
			var d2 = new Date(d);
			d2.setHours(d2.getHours()-offset_days_offset);
			offset_days.push(d2);
			//_logger("   future: "+d);
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
		logger("DATA: "+data);
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
	
});
