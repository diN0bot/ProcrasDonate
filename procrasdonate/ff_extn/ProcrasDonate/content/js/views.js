
//var constants = CONSTANTS();

// Controller
// * handles 'views' for browser-generated ProcrasDonate.com pages
var Controller = function(prefs) {
	logger("Controller()");
	this.prefs = prefs;
	this.page = new PageController(this.prefs);
	
};

function $(selector, context) {
	return jQuery(selector, document.defaultView);
}

Controller.prototype = {};
_extend(Controller.prototype, {
	
	insert_based_on_state: function(state_name, state_enums, event_inserts) {
		/* Calls appropriate insert method based on current state
		 * 
		 * @param state_name: string. one of 'settings', 'register' or 'impact
		 * @param state_enums: array. state enumeration. one of 'constants.SETTINGS_STATE_ENUM',
		 * 		'constants.REGISTER_STATE_ENUM' or 'constants.IMPACT_STATE_ENUM'
		 * @param event_inserts: array. functions corresponding to enums. one of
		 * 		'constants.SETTINGS_STATE_INSERTS', 'constants.IMPACT_STATE_INSERTS', 'constants.REGISTER_STATE_INSERTS'
		 */
		this.prefs.set('site_classifications_settings_activated', true);
		for (var i = 0; i < state_enums.length; i += 1) {
			var state = state_enums[i];
			if ( this.prefs.get(state_name + '_state', '') == state ) {
				logger(event_inserts[i]);
				this.page[event_inserts[i]]();
				return true;
			}
		}
		return false;
	},
	//$: function(selector, context) {
	//	return new jQuery.fn.init(selector, context || this.doc);
	//},
	dispatch_by_host: function(doc, url) {
		//this.doc = doc;
	$ = function(selector, context) {
		return new jQuery.fn.init(selector, context || doc);
	};
	$.fn = $.prototype = jQuery.fn;
		var host = _host(url);
		if (host.match(new RegExp(constants.PD_HOST)))
			return this.pd_dispatch_by_url(url);
		else if (host.match(/pageaddict\.com$/))
			return this.pa_dispatch_by_url(url);
		else
			//return this.check_restriction();
			return false;
			//throw new Error("Invalid host: " + host);
	},
	
	pd_dispatch_by_url: function(url) {
		
		switch (url) {
		case constants.START_URL:
			var state_matched = this.insert_based_on_state(
				'register', 
				constants.REGISTER_STATE_ENUM, 
				constants.REGISTER_STATE_INSERTS);
			
			if (!state_matched) {
				this.prefs.set('register_state', constants.DEFAULT_REGISTER_STATE);
				this.insert_based_on_state(
					'register', 
					constants.REGISTER_STATE_ENUM, 
					constants.REGISTER_STATE_INSERTS);
			}
			break;
		case constants.SETTINGS_URL:
			var state_matched = this.insert_based_on_state(
				'settings', 
				constants.SETTINGS_STATE_ENUM, 
				constants.SETTINGS_STATE_INSERTS);
			
			if (!state_matched) {
				this.prefs.set('settings_state', constants.DEFAULT_SETTINGS_STATE);
				this.insert_based_on_state(
					'settings', 
					constants.SETTINGS_STATE_ENUM, 
					constants.SETTINGS_STATE_INSERTS);
			}
			break;
		case constants.IMPACT_URL:
			var state_matched = this.insert_based_on_state(
				'impact', 
				constants.IMPACT_STATE_ENUM, 
				constants.IMPACT_STATE_INSERTS);
			
			if (!state_matched) {
				this.prefs.set('impact_state', constants.DEFAULT_IMPACT_STATE);
				this.insert_based_on_state(
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
			return false;
			//throw new Error("Invalid ProcrasDonate URL: " + url);
		}
	},
	
	pa_dispatch_by_url: function(url) {
		show_hidden_links();
		if (document.getElementById("insert_statistics_here")) {
			this.get_results_html();
		}
		if (document.getElementById("insert_history_here")) {
			this.plot_history(7);
		}
		if (document.getElementById("insert_settings_here")) {
			this.make_settings();
		}
	},
	
	check_page_inserts: function() {
		/*
		 * Insert data into matching webpage
		 *    pageaddict.com and (localhost:8000 or procrasdonate.com)
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
		twitter_username: constants.DEFAULT_USERNAME,
		twitter_password: constants.DEFAULT_PASSWORD,
		recipients: constants.DEFAULT_RECIPIENTS,
		support_pct: constants.DEFAULT_SUPPORT_PCT,
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

function Schedule(prefs) {
	logger("Schedule()");
	this.prefs = prefs;
}
Schedule.prototype = {};
_extend(Schedule.prototype, {
	run: function() {
		this.check_latest_version();
		
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
		
		//alert("ding! last 24hr "+two_four_hr+" new 24hr "+now+"  now  "+new Date());
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

	check_latest_version: function() {
		/*
		 * Check if user should update to newer version of page addict
		 */
		var newest_version;
		
		if (document.getElementById("newest_version")) {
			newest_version = parseInt(
				document.getElementById("newest_version").innerHTML, 10);
			if (newest_version > 30) { // change to a constant somehow
				var cell_text;
				cell_text = "You are running an old version of PageAddict. ";
				cell_text += 'Update <a href="https://addons.mozilla.org/firefox/3685/">here</a>';
				document.getElementById("newest_version").innerHTML = cell_text;
				document.getElementById("newest_version").style.display = "inline";
				// document.getElementById("newest_version").style.color="#EDCB09";
			}
		}
	}
});


/********** HTML INSERTION FUNCTIONS AND HELPERS ***************/

function PageController(prefs) {
	logger("PageController()");
	this.prefs = prefs;
	this.tipjoy = new TipJoy_API(this.prefs);
}
PageController.prototype = {};
_extend(PageController.prototype, {
	
	make_site_box: function(name, url, tag) {
		/*
		 * 
		 */
		
		var wrapper_template = null;
		switch(tag) {
		case "undefined":
			wrapper_template = "undefined_wrap";
			break;
		case "timewellspent":
			wrapper_template = "timewellspent_wrap";
			break;
		case "procrasdonate":
			wrapper_template = "procrasdonate_wrap";
			break;
		default:
			throw new Error("Invalid tag? " + tag);
		}
		
		name = name.replace(/__/g, '/').replace(/\_/g,'.');
		
		var text = Template.get(wrapper_template).render({
			inner: "<span class='name'>" + name + "</span>",
			constants: constants,
		});
		var context = new Context({
			inner: text,
			constants: constants,
		});
		return Template.get("make_site_box").render(context);
	},
	
	
	insert_register_balance: function() {
		/*
		 * Inserts balance/TipJoy info.
		 */
		this.prefs.set('register_state', 'balance');
		
		var middle = ["exists: <span id='exists'></span>",
					  "<br /><br />",
					  "balance: <span id='balance_here'></span>"].join("");
		
		$("#content").html( this.register_wrapper_snippet(middle) );
		this.activate_register_tab_events();
	},
	
	support_middle: function() {
		var context = new Context({
			pct: pct,
			constants: constants,
		});
		return Template.get("support_middle").render(context);
	},
	
	activate_support_middle: function() {
		var pct = this.prefs.get('support_pct', constants.DEFAULT_SUPPORT_PCT);
		$("#support_slider").slider({
			//animate: true,
			min: 0,
			max: 10,
			value: pct,
			step: 1,
			slide: function(event, ui) {
				set_sliders_and_input(
					$(this), $(this).next(), $(this).next().attr("value"), ui.value);
			}
		});
		
		$("#support_input").keyup(function(event) {
			set_sliders_and_input(
				$(this).prev(), $(this), $(this).attr("alt"), $(this).attr("value"));
		});
		
		function set_sliders_and_input(slider, input, oldv, newv) {
			if ( newv < 0 || newv > 100 ) return false;
			var diff = oldv - newv;
			input.attr("value", newv).attr("alt", newv);
			//slider.slider('option', 'value', newv);
			slider.slider('option', 'value', newv);
			this.prefs.set('support_pct', newv);
			return true;
		}
	},
	
	insert_register_support: function() {
		/* Inserts support ProcrasDonate info. */
		this.prefs.set('register_state', 'support');
		$("#content").html( 
			this.register_wrapper_snippet(this.support_middle()) );
		this.activate_register_tab_events();
		this.activate_support_middle();
	},
	
	insert_register_done: function() {
		this.prefs.set('register_state', 'done');
		window.location.href = constants.IMPACT_URL;
	},
	
	site_classifications_middle: function() {
		var procrasdonate_text = "";
		var undefined_text = "";
		var timewellspent_text = "";
		
		var sort_arr = [
			['www.javascriptkit.com', 'procrasdonate'],
			['bilumi.org', 'undefined'],
			['www.slashdot.com', 'procrasdonate'],
			['news.ycombinator.com', 'procrasdonate'],
			['www.ycombinator.com', 'timewellspent'],
			['gmail.com', 'timewellspent']
		];
		
		for (i = 0; i < sort_arr.length; i += 1) {
			var tag = sort_arr[i][1];
			if ( tag == 'timewellspent' ) {
				timewellspent_text += this.make_site_box(
					sort_arr[i][0], sort_arr[i][0], tag);
			} else if ( tag == 'procrasdonate' ) {
				procrasdonate_text += this.make_site_box(
					sort_arr[i][0], sort_arr[i][0], tag);
			} else {
				undefined_text += this.make_site_box(
					sort_arr[i][0], sort_arr[i][0], tag);
			}
		}
		
		var context = new Context({
			timewellspent_text: timewellspent_text,
			procrasdonate_text: procrasdonate_text,
			undefined_text: undefined_text,
		});
		return Template.get("site_classifications_middle").render(context);
	},
	
	activate_site_classifications_middle: function() {
		if ( this.prefs.get('site_classifications_settings_activated', false) ) {
			var f = function(elem, tag) {
				var site_name = elem.siblings(".name").text();
				elem.parent().fadeOut("slow", function() { $(this).remove(); });
				$("#"+tag+"_col .title").after(
					this.make_site_box(site_name, site_name, tag))
				.next().hide().fadeIn("slow");
			}
			$(".move_to_timewellspent").live("click", function() {
				f($(this), "timewellspent");
			});
			$(".move_to_undefined").live("click", function() {
				f($(this), "undefined");
			});
			$(".move_to_procrasdonate").live("click", function() {
				f($(this), "procrasdonate");
			});
			this.prefs.set('site_classifications_settings_activated', false);
		}
	},
	
	insert_register_site_classifications: function() {
		/* Inserts site classification html into page */
		this.prefs.set('register_state', 'site_classifications');
		$("#content").html(
			this.register_wrapper_snippet(this.site_classifications_middle()));
		this.activate_register_tab_events();
		this.activate_site_classifications_middle();
	},
	
	recipient_snippet: function(name, url, description) {
		var context = new Context({
			name: name,
			url: url,
			description: description,
			constants: constants,
		});
		return Template.get("recipient_snippet").render(context);
	},
	
	recipients_middle: function(user_recipients_ary, potential_recipients_ary) {
		var user_recipients = "";
		for (var i = 0; i < user_recipients_ary.length; i += 1) {
			var name = user_recipients_ary[i].name;
			var url = user_recipients_ary[i].url;
			var description = user_recipients_ary[i].description;
			var pct = user_recipients_ary[i].pct;
			user_recipients += "" +
				"<div class='recipient_row'>" +
					recipient_snippet(name, url, description) +
					"<div id='slider" + i + "' class='slider' alt='" + pct + "'></div>" +
					"<input id='input"+ i + "' class='input' alt='" + pct + "' value='" + pct + "' size='1'/>" +
					"<div class='remove'>X</div>" +
				"</div>";
		}
		var spacer = "<div class='recipient_spacer_row'>&nbsp;</div>";
		var potential_recipients = "";
		for (var i = 0; i < potential_recipients_ary.length; i += 1) {
			var name = potential_recipients_ary[i].name;
			var url = potential_recipients_ary[i].url;
			var description = potential_recipients_ary[i].description;
			potential_recipients += "" +
				"<div class='recipient_row'>" +
					recipient_snippet(name, url, description) +
					"<div class='add potential'>Add</div>" +
				"</div>";
		}
		
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
	
	activate_recipients_middle: function(user_recipients_ary, potential_recipients_ary) {
		$(".remove").click(function() {
			$(this).css("background","green");
			$(this).siblings().css("background","yellow");
		});
		
		$(".add").click(function() {
			$(this).css("background","red");
			$(this).siblings().css("background","yellow");
		});
		
		var slider_elems = [];
		for (var i = 0; i < user_recipients_ary.length; i += 1) {
			slider_elems.push($("#slider"+i));
		}
		for (var i = 0; i < slider_elems.length; i += 1) {
			var slider = slider_elems[i];
			var input = slider.next();
			// all sliders except current slider
			var not_slider = slider_elems.slice().splice(i, 0);
			slider.slider({
				//animate: true,
				min: 0,
				max: 100,
				value: $("#slider"+i).attr('alt'),
				//step: not_slider.length,
				slide: function(event, ui) {
					set_sliders_and_input(slider, input, input.attr("value"), ui.value);
				},
			});
			input.keyup(function(event) {
				set_sliders_and_input(slider, input, input.attr("alt"), input.attr("value"));
			});
		}
		function set_sliders_and_input(slider, input, oldv, newv) {
			var diff = oldv - newv;
			input.attr("value", newv).attr("alt", newv);
			slider.slider('option', 'value', newv);
			adjust_other_sliders(slider.attr("id"), diff);	
		}
		function adjust_other_sliders(id, diff) {
			for (var i = 0; i < slider_elems.length; i += 1) {
				var slider = slider_elems[i];
				var input = slider.next();
				if ( slider.attr("id") != id ) {
					var oldv = input.attr("value");
					slider.slider('option', 'value', oldv - diff);
					input.attr("value", oldv - diff).attr("alt", oldv - diff);
				}
			}
		}
	},
	
	insert_register_recipients: function() {
		/*
		 * Inserts form so that user may select recipients. 
		 * 
		 * Slider input's alt must contain "last" value of input, so when do keyboard presses we can compute how to alter the other tabs.
		 */
		this.prefs.set('register_state', 'recipients');
		var user_recipients_ary = [{
			name:'Bilumi',
			url:'http://bilumi.org',
			description:'Enabling the socially conscious consumer',
			pct:60
		}, {
			name:'CNC Mill',
			url:'http://cnc.org',
			description:'Every hacker should have one',
			pct:20
		}, {
			name:'Save The News',
			url:'http://cnc.org',
			description:'La lallaala LAlAla',
			pct:20
		}];
		var potential_recipients_ary = [{
			name:'Red Cross',
			url:'http://redcross.org',
			description:'Exploring mono-chromatic orthoganal artwork since the 1800s'
		}, {
			name:'Green Peace',
			url:'http://greenpeace.org',
			description:'Expanding greener pastures'
		}, {
			name:'Act Blue',
			url:'http://actblue.org',
			description:'Earning money for democrats and making longer, longer, much longer descriptions for profit.'
		}];
		$("#content").html(
			this.register_wrapper_snippet(
				this.recipients_middle(
					user_recipients_ary, potential_recipients_ary)));
		this.activate_register_tab_events();
		this.activate_recipients_middle(user_recipients_ary, potential_recipients_ary);
	},
	
	
	insert_register_donation_amounts: function() {
		/* Inserts form so that user may enter donation information */
		this.prefs.set('register_state', 'donation_amounts');
		$("#content").html( 
			this.register_wrapper_snippet(this.donation_amounts_middle()) );
		this.activate_register_tab_events();
	},
	
	donation_amounts_middle: function() {
		var context = new Context({
			hr_per_week_max: this.prefs.get("hr_per_week_max", ""),
			hr_per_week_goal: this.prefs.get("hr_per_week_goal", ""),
			cents_per_hr: this.prefs.get("cents_per_hr", ""),
			constants: constants,
		});
		return Template.get("donation_amounts_middle").render(context);
	},
	
	impact_wrapper_snippet: function(middle) {
		return this._wrapper_snippet(middle, this.impact_tab_snippet());
	},
	
	register_wrapper_snippet: function(middle) {
		return this._wrapper_snippet(middle, this.register_tab_snippet());
	},
	
	settings_wrapper_snippet: function(middle) {
		return this._wrapper_snippet(middle, this.settings_tab_snippet());
	},
	
	_wrapper_snippet: function(middle, tab_snippet) {
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
		return Template.get("wrapper_snippet").render(context);
	},
	
	
	twitter_account_middle: function() {
		var context = new Context({
			twitter_username: this.prefs.get("twitter_username", ""),
			twitter_password: this.prefs.get("twitter_password", ""),
			constants: constants,
		});
		return Template.get("twitter_account_middle").render(context);
	},
	
	activate_twitter_account_middle: function() {
		$("#what_is_twitter").click( function() {
			$(this).text("\"A service to communicate and stay connected through the exchange of quick," +
						 "frequent answers to one simple question: What are you doing?\"")
				.css("display", "block")
				.addClass('open')
				.removeClass('link');
		});	
	},
	
	insert_settings_twitter_account: function() {
		/* Inserts user's twitter account form into page */
		this.prefs.set('settings_state', 'twitter_account');
		
		$("#content").html( 
			this.settings_wrapper_snippet(this.twitter_account_middle()) );
		this.activate_settings_tab_events();
		this.activate_twitter_account_middle();
	},
	
	
	insert_settings_recipients: function() {
		/*
		 * Inserts form so that user may select recipients.
		 * 
		 * Slider input's alt must contain "last" value of input, so when do keyboard presses we can compute how to alter the other tabs.
		 */
		this.prefs.set('settings_state', 'recipients');
		var user_recipients_ary = [{
			name:'Bilumi',
			url:'http://bilumi.org',
			description:'Enabling the socially conscious consumer',
			pct:60
		}, {
			name:'CNC Mill',
			url:'http://cnc.org',
			description:'Every hacker should have one',
			pct:20
		}, {
			name:'Save The News',
			url:'http://cnc.org',
			description:'La lallaala LAlAla',
			pct:20
		}];
		var potential_recipients_ary = [{
			name:'Red Cross',
			url:'http://redcross.org',
			description:'Exploring mono-chromatic orthoganal artwork since the 1800s'
		}, {
			name:'Green Peace',
			url:'http://greenpeace.org',
			description:'Expanding greener pastures'
		}, {
			name:'Act Blue',
			url:'http://actblue.org',
			description:'Earning money for democrats and making longer, longer, much longer descriptions for profit.'
		}];
		$("#content").html(
			this.settings_wrapper_snippet(
				this.recipients_middle(user_recipients_ary, potential_recipients_ary)));
		this.activate_settings_tab_events();
		this.activate_recipients_middle(user_recipients_ary, potential_recipients_ary);
	},
	
	insert_settings_donation_amounts: function() {
		/* Inserts form so that user may enter donation information */
		this.prefs.set('settings_state', 'donation_amounts');
		$("#content").html( 
			this.settings_wrapper_snippet(this.donation_amounts_middle()) );
		this.activate_settings_tab_events();
	},
	
	insert_settings_site_classifications: function() {
		/* Inserts site classification html into page */
		this.prefs.set('settings_state', 'site_classifications');
		$("#content").html(
			this.settings_wrapper_snippet(this.site_classifications_middle()));
		this.activate_settings_tab_events();
		this.activate_site_classifications_middle();
	},
	
	insert_settings_support: function() {
		/* Inserts support ProcrasDonate info. */
		this.prefs.set('settings_state', 'support');
		$("#content").html( 
			this.settings_wrapper_snippet(this.support_middle()) );
		this.activate_settings_tab_events();
		this.activate_support_middle();
	},
	
	insert_settings_balance: function() {
		/* Inserts TipJoy balance html into page */
		this.prefs.set('settings_state', 'balance');
		var cell_text =
			"<div id='thin_column'" +
			this.settings_tab_snippet() +
			"</div>";
		
		$("#content").html(cell_text);
		this.activate_settings_tab_events();
		
		// works
		// post_anonymous_info_to_procrasdonate('http://bilumi.org', 22, 5,
		// 'bilumi');
		
		/*
		 * check_balance( function(r) { _logger("balance WORK "+r+" "r.result+"
		 * "+r.reason+" "+r.balance+" "+r.currency); }, function(r) {
		 * _logger("balance FAIL "+r.result+" "+r.reason+" "+r.balance+"
		 * "+r.currency); } );
		 */
		
		// check_exists();
			/*
			 * function(r) { _logger('STATUS worked ' + r.result + ' ' + r.reason + ' ' +
			 * r.exists + ' ' + r.user + ' ' + r.is_private); }
			 */
		// );
	},
	
	process_support: function(event) {
		var support_input = parseFloat($("input[name='support_input']").attr("value"))
		
		if ( support_input < 0 || support_input > 100 ) {
			$("#errors").text("<p>Please enter a percent between 0 and 10.</p>");
		} else {
			this.prefs.set('support', 4);
			return true;
		}
		return false;
	},
	
	validate_cents_input: function(v) {
		var cents = parseInt(v);
		var hr_per_week_goal = parseFloat($("input[name='hr_per_week_goal']").attr("value"));
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
	
	validate_hours_input: function(v) {
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
	
		
	process_donation: function(event) {
		/*
		 * cents_per_hr: pos int
		 * hr_per_week_goal: pos float < 25
		 * hr_per_week_max: pos float < 25
		 */
		var cents_per_hr = parseInt($("input[name='cents_per_hr']").attr("value"));
		var hr_per_week_goal = parseFloat($("input[name='hr_per_week_goal']").attr("value"));
		var hr_per_week_max = parseFloat($("input[name='hr_per_week_max']").attr("value"));
		$("#errors").text("");
		if ( !validate_cents_input(cents_per_hr) ) {
			$("#errors").append("<p>Please enter a valid dollar amount. For example, to donate $2.34 an hour, please enter 2.34</p>");
		} else if ( !validate_hours_input(hr_per_week_goal) ) {
			$("#errors").append("<p>Please enter number of hours. For example, enter 1 hr and 15 minutes as 1.25</p>");
		} else if (!validate_hours_input(hr_per_week_max) ) {
			$("#errors").append("<p>Please enter number of hours. For example, enter 30 minutes as .5</p>");
		} else {
			this.prefs.set('cents_per_hr', clean_cents_input(cents_per_hr));
			this.prefs.set('hr_per_week_goal', clean_hours_input(hr_per_week_goal));
			this.prefs.set('hr_per_week_max', clean_hours_input(hr_per_week_max));
			return true;
		}
		return false;
	},
	
	process_balance: function(event) {
		return true;
	},
	
	process_site_classifications: function(event) {
		return true;
	},
	
	process_recipients: function(event) {
		return true;
	},
	
	process_done: function(event) {
		return true;
	},
	
	process_twitter_account: function(event) {
		/*
		 * Validate account form and save.
		 * @TODO twitter credentials and recipient twitter name should be verified.
		 * @TODO all fields should be validated as soon as user tabs to next field.
		 */
		$("#messages").html("");
		$("#errors").html("");
		$("#success").html("");
		
		var twitter_username = $("input[name='twitter_username']").attr("value");
		var twitter_password = $("input[name='twitter_password']").attr("value");
		
		if ( !this.validate_twitter_username_and_password(twitter_username, 
														  twitter_password) ) {
			$("#errors").append("<p>Please enter your twitter username and password</p>");
			return false;
		} else {
			// Check if the username/password combo matches an existing account. We use
			// check balance for this in order to test that the password works, too.
			// If "no such tipjoy user", then create account 
			var self = this;
			this.tipjoy.check_exists(twitter_username,  
				function(r) {
					var result = eval("("+r.responseText+")").result;
					var exists = eval("("+r.responseText+")").exists;
					if ( result == "success" && exists ) {
						self.tipjoy.check_balance(twitter_username, twitter_password,
							function(r) {
								var result = eval("("+r.responseText+")").result;
								if ( result == "success" ) {
									logger("tipjoy user exists and can sign-on");
									self.prefs.set('twitter_username', twitter_username);
									self.prefs.set('twitter_password', twitter_password);
									
									event();
								} else {
									logger("tipjoy user exists but can not sign-on");
									var reason = eval("("+r.responseText+")").reason;
									$("#errors").append("tipjoy user exists but can not sign-on: "+reason);
								}
							},
							function(r) {
								var str = ""; for (var prop in r) {	str += prop + " value :" + r[prop]+ + " __ "; }
								logger("standard_onerror: "+r+"_"+str);
								var reason = eval("("+r.responseText+")").reason;
								$("#errors").append("An error occurred: " + reason);
							}
						);
					} else {
						logger("tipjoy user does not exist");
						self.tipjoy.create_account(twitter_username, twitter_password,
							function(r) {
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
									$("#errors").append("problem creating tipjoy account: "+reason);
								}
							},
							function(r) {
								var str = ""; for (var prop in r) {	str += prop + " value :" + r[prop]+ + " __ "; }
								logger("standard_onerror: "+r+"_"+str);
								var reason = eval("("+r.responseText+")").reason;
								$("#errors").append("An error occurred: " + reason);
							}
						);
					}
				},
				function(r) {
					var str = ""; for (var prop in r) {	str += prop + " value :" + r[prop]+ + " __ "; }
					logger("standard_onerror: "+r+"_"+str);
					var reason = eval("("+r.responseText+")").reason;
					$("#errors").append("An error occurred: " + reason);
				}
			);
		}
		$("#messages").append("verifying username and password...");
		return false;
	},
	
	_tab_snippet: function(state_name, state_enums, tab_names) {
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
	
	register_tab_snippet: function() {
		/* Creates register state track. Does not call _tab_snippet! */
		var ret = this._track_snippet('register', constants.REGISTER_STATE_ENUM, constants.REGISTER_STATE_TAB_NAMES, true);
		var next_src = constants.MEDIA_URL +"img/NextArrow.png";
		if ( this.prefs.get('register_state','') == 'balance' ) {
			next_src = constants.MEDIA_URL +"img/DoneArrow.png";
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
	
	settings_tab_snippet: function() {
		/* Creates settings state track.*/
		return this._track_snippet('settings', constants.SETTINGS_STATE_ENUM, constants.SETTINGS_STATE_TAB_NAMES, false);
	},
	
	_track_snippet: function(state_name, state_enum, tab_names, track_progress) {
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
	
	impact_tab_snippet: function() {
		/* Calls _tab_snippet for impact state */
		return this._track_snippet('impact', constants.IMPACT_STATE_ENUM, constants.IMPACT_STATE_TAB_NAMES, false);
		//return _tab_snippet('impact', constants.IMPACT_STATE_ENUM, constants.IMPACT_STATE_TAB_NAMES);
	},
	
	_process_before_proceeding: function(state_name, state_enums, processors, event) {
		var self = this;
		return function() {
			for (var i = 0; i < state_enums.length; i += 1) {
				var tab_state = state_enums[i];
				if ( self.prefs.get(state_name+"_state", "") == tab_state ) {
					var processor = processors[i];
					if ( self[processor](event) ) {
						event();
					}
					break;
				}
			}
		}
	},
	
	activate_settings_tab_events: function() {
		/* Attaches EventListeners to settings tabs */
		for (var i = 0; i < constants.SETTINGS_STATE_ENUM.length; i += 1) {
			var tab_state = constants.SETTINGS_STATE_ENUM[i];
			var event = constants.SETTINGS_STATE_INSERTS[i];
			// closure
			$("#"+tab_state+"_track, #"+tab_state+"_text").click(
					this._process_before_proceeding(
						'settings', 
						constants.SETTINGS_STATE_ENUM, 
						constants.SETTINGS_STATE_PROCESSORS, event) );
		}
		// cursor pointer to tracks
		$(".track, .track_text").css("cursor","pointer");
		
		//@TODO
		$(".press_enter_for_next").bind( 'keypress', function(e) {
			var code = (e.keyCode ? e.keyCode : e.which);
			if(code == 13) { //Enter keycode
				$("#next_register_track").click();
			}
		});
	},
	
	activate_impact_tab_events: function() {
		/* Attaches EventListeners to impact tabs */
		for (var i = 0; i < constants.IMPACT_STATE_ENUM.length; i += 1) {
			var tab_state = constants.IMPACT_STATE_ENUM[i];
			var event = constants.IMPACT_STATE_INSERTS[i];
			// closure
			$("#"+tab_state+"_track, #"+tab_state+"_text").click(
				(function(event) { return event; })(event)
			);
		}
		// cursor pointer to tracks
		$(".track, .track_text").css("cursor","pointer");
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
	
	activate_register_tab_events: function() {
		/* Attaches EventListeners to register tabs */
		for (var i = 0; i < constants.REGISTER_STATE_ENUM.length; i += 1) {
			var tab_state = constants.REGISTER_STATE_ENUM[i];
			var current_state = this.prefs.get('register_state', '');
			
			if ( tab_state == current_state ) {
				if ( i > 0 ) {
					var prev = constants.REGISTER_STATE_INSERTS[i-1];
					$("#prev_register_track").click(
							this._process_before_proceeding(
								'register', 
								constants.REGISTER_STATE_ENUM, 
								constants.REGISTER_STATE_PROCESSORS, prev) );
				} else { $("#prev_register_track").hide(); }
				
				if ( i < constants.REGISTER_STATE_ENUM.length ) {
					var next = constants.REGISTER_STATE_INSERTS[i+1];
					$("#next_register_track").click(
						this._process_before_proceeding(
							'register', 
							constants.REGISTER_STATE_ENUM, 
							constants.REGISTER_STATE_PROCESSORS, 
							next) );
				} else { $("#next_register_track").hide(); }
			}
		}
		$(".press_enter_for_next").bind( 'keypress', function(e) {
			var code = (e.keyCode ? e.keyCode : e.which);
			if(code == 13) { //Enter keycode
				$("#next_register_track").click();
			}
		});
	},
	
	/************************** IMPACT INSERTIONS ***********************/
	
	insert_register_twitter_account: function() {
		/* Inserts user's twitter account form into page */
		this.prefs.set('register_state', 'twitter_account');
		var html1 = this.twitter_account_middle();
		//logger(html1);
		var html = this.register_wrapper_snippet(html1);
		//logger(html);
		logger(document.defaultView);
		logger($("#content", document.defaultView.document).length);
		$("#content").html(html);
		this.activate_register_tab_events();
		this.activate_twitter_account_middle();
	},
	
	impact_sites_middle: function(data, show_tags) {
		var context = new Context({
			data: data,
			show_tags: show_tags,
			width: 100, //parseInt( ((data[i][1]+1)/max)*100.0 ),
			constants: constants,
		});
		return Template.get("twitter_account_middle").render(context);
	},
	
	activate_impact_sites_middle: function(has_tags) {
		$(".site_rank .rank_text").hide();
		$(".site_rank .bar").hover(
			function() {
				$(this).children().show();
			},
			function() {
				$(this).children().hide();
			}
		);
	},
	
	insert_impact_sites: function() {
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
		$("#content").html(
			this.impact_wrapper_snippet(this.impact_sites_middle(sort_arr, true)) );
		this.activate_impact_tab_events();
		this.activate_impact_sites_middle();
	},
	
	insert_impact_recipients: function() {
		/* insert sites chart */
		this.prefs.set('impact_state', 'recipients');
		var sort_arr = [
			['bilumi', 120, 200],
			['miller', 100, 100],
			['pd', 45, 75],
		];
		$("#content").html(
			this.impact_wrapper_snippet(this.impact_sites_middle(sort_arr, false)) );
		this.activate_impact_tab_events();
		this.activate_impact_sites_middle();
	},
	
	insert_impact_goals: function() {
		/* Inserts weekly progress towards donation goals and max */
		this.prefs.set('impact_state', 'goals');
		
		var middle = "<div id='goals_chart' style='width:100%;height:25em;'></div>";
		$("#content").html( this.impact_wrapper_snippet(middle) );
		this.activate_impact_tab_events();
		
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
		$.plot($("#goals_chart"), [ /*{data:red_zone,lines:{lineWidth:90}},*/
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
	
	
	insert_impact_history: function() {
		/*
		 * Inserts historic information into impact.historic page
		 */
		this.prefs.set('impact_state', 'history');
		
		var middle = "<div id='procrasdonation_chart' style='width:100%;height:300px'></div>";
		$("#content").html( this.impact_wrapper_snippet(middle) );
		this.activate_impact_tab_events();
		
		var rawdata_procrasdonate = [ [1, 1], [2, 2], [3, 3] ];
		var rawdata_undefined = [ [1, 4], [2, 6], [3, 4] ];
		var rawdata_work = [ [1, 7], [2, 5], [3, 3] ];
		var data = [
			{
				data: rawdata_procrasdonate,
				label: "Procrasdonation",
			},
			{
				data: rawdata_undefined,
				label: "Undefined",
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
