/** *************************************************************************** */

window.addEventListener('unload', stop_recording, true);
window.addEventListener('focus', start_recording, true);
window.addEventListener('blur', stop_recording, true);
window.addEventListener('mousemove', validate_mouse, true);
window.addEventListener('keydown', validate_mouse, true);

window.addEventListener('load', house_keeping, true);
// window.addEventListener('load',check_page_inserts, true);
check_restriction();

function register_observers() {
	/*
	 * These observers are used to determine whether a user is idle or active.
	 */
	document.addEventListener('click', record_activity, true);
	document.addEventListener('scroll', record_activity, true);
	document.addEventListener('keydown', record_activity, true);
	window.addEventListener('keydown', record_activity, true);
	// Is mousemove commented out because don't want or doesn't work?
	// speculation: mousemove does not trigger activity because movement on
	// other windows
	// still triggers call? would be good to test sometime, since mousemove
	// might
	// help with game or reading detection
	// document.addEventListener('mousemove',record_activity , true);
}

function record_activity() {
	/*
	 * Boolean used to determine whether a user is idle or not. Record activity
	 * is triggered by the above event listeners
	 */
	window.user_active = true;
}

function monitor_activity() {
	/*
	 * Called every second - see start_recording()
	 * 
	 * Decide whether to stop recording because of in-activity (30 counts of
	 * monitor_activity() = 30 seconds) or start recording because of activity
	 */
	if (window.page_addict_start) {
		if (window.user_active)
			window.idle_time = 0;
		else {
			window.idle_time += 1;
			// GM_log('idle time='+window.idle_time);
		}
		if (window.idle_time > 30) {
			// window.count_seconds+=1;
			if (window.page_addict_start) {
				stop_recording();
			}
		}
	} else {
		if (window.user_active)
			start_recording();
	}
	
	window.user_active = false;
	// if(window.continue_monitoring)
	// setTimeout(monitor_activity, 15000);
}

// function start_if_active() {
// if(window.user_active)
// start_recording();
// }

function house_keeping() {
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
	CONSTANTS();
	initialize_account_defaults_if_necessary();
	initialize_state_if_necessary();
	set_default_idle_mode_if_necessary();
	
	var host = window.location.host;
	if (!(host.match(/pageaddict\.com$/)) && !(host.match(new RegExp(constants.PD_HOST)))) {
		// 1.
		check_restriction();
	} else {
		// 2.
		check_page_inserts();
	}
	
	// 3.
	check_latest_version();
	
	// 4.
	if ( is_new_24hr_period() ) {
		do_once_daily_tasks();
	}
	if ( is_new_week_period() ) {
		do_once_weekly_tasks();
	}
	
	var last_global = GM_getValue('last_visit', 0);
	var first = GM_getValue('first_visit', 0);
	// chover = change over, as in change over the day ...?
	var chover = new Date();
	chover.setHours(0, 0, 0);
	chover = Math.round(chover.getTime() / 1000);
	if (first < chover) {
		reset_visits();
	}
	// var currentTime = new Date();
	// var t_in_s = Math.round(currentTime.getTime()/1000);
	// GM_setValue('last_visit', t_in_s);
}

function is_new_24hr_period() {
	/* @returns: true if it is at least 24 hrs past the last 24hr mark */
	var two_four_hr = new Date(GM_getValue('last_24hr_mark', '')*1000);
	var now = new Date();
	two_four_hr.setHours(two_four_hr.getHours() + 24);
	return now > two_four_hr
}

function do_once_daily_tasks() {
	// reset last_24hr_mark to now
	var two_four_hr = new Date(GM_getValue('last_24hr_mark', '')*1000);
	var now = new Date();
	now.setHours(two_four_hr.getHours());
	now.setMinutes(two_four_hr.getMinutes());
	now.setSeconds(two_four_hr.getSeconds());
	if ( now > new Date() ) {
		now.setDate( now.getDate() - 1 );
	}
	GM_setValue('last_24hr_mark', Math.floor(now.getTime()/1000));
	
	//alert("ding! last 24hr "+two_four_hr+" new 24hr "+now+"  now  "+new Date());
}


function is_new_week_period() {
	/* @returns: true if it is at least 1 week past the last week mark */
	var week_hr = new Date(GM_getValue('last_week_mark', '')*1000);
	var now = new Date();
	week_hr.setDate(week_hr.getDate() + 7);
	return now > week_hr
}

function do_once_weekly_tasks() {
	// reset last_week_mark to now
	var week_hr = new Date(GM_getValue('last_week_mark', '')*1000);
	var now = new Date();
	now.setHours(week_hr.getHours());
	now.setMinutes(week_hr.getMinutes());
	now.setSeconds(week_hr.getSeconds());
	if ( now > new Date() ) {
		now.setDate( now.getDate() - 1 );
	}
	GM_setValue('last_week_mark', Math.floor(now.getTime()/1000));
	
	alert("ding! last week "+week_hr+" new week "+now+"  now  "+new Date());
}

function check_latest_version() {
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

function start_recording(no_retry) {
	/*
	 * Start recording user time spent on a particular page.
	 */
	if (window.page_addict_start) {
		// GM_log('cant start recording: local');
		// return;
	}
	if (GM_getValue('page_addict_start', false) == true) {
		// GM_log('cant start recording: global');
		if (!no_retry) {
			setTimeout(function(){ start_recording(true); }, 200);
		}
		return;
	}
	
	// if(no_retry)
	// GM_log('delayed start!');
	
	var currentTime = new Date();
	var t_in_s = Math.round(currentTime.getTime() / 1000);
	window.page_addict_start = t_in_s;
	GM_setValue('page_addict_start', true);
	
	GM_log('start recording ' + window.location.host + ' @ ' + t_in_s);
	// dump('start recording '+window.location.host);
	// window.page_addict_recording=1;
	if (GM_getValue('idle_timeout_mode', false)) {
		// window.continue_monitoring=true;
		window.user_active = false;
		window.idle_time = 0;
		// window.count_seconds=0;
		if (!(window.interval_id)) {
			window.interval_id = setInterval(monitor_activity, 1000);
		}
		if (!(window.registered_observers)) {
			register_observers();
			window.registered_observers = true;
		}
	}
}

function validate_mouse() {
	/*
	 * Mousemove and keydown are added as EventListeners at the top of this file
	 * Rather than immediately calling start_recording, those listeners call
	 * this method, which removes those same EventListeners.
	 * 
	 * Does that mean that only the first mouse movement or key presses resumes
	 * recording after idle time. Subsequent idles cannot be resumed from mouse
	 * movement or key presses?
	 */
	start_recording();
	// window.page_addict_valid=1;
	window.removeEventListener('mousemove', validate_mouse, true);
	window.removeEventListener('keydown', validate_mouse, true);
}

function stop_recording() {
	/*
	 * Called everytime user becomes idle (if idle timeout is True) switches
	 * tabs or clicks a link (i think).
	 */
	if (window.page_addict_start == null) {
		// GM_log('cant stop recording: local');
		// return;
	}
	if (GM_getValue('page_addict_start', false) == false) {
		// GM_log('cant stop recording: global');
		return;
	}
	
	// if(window.page_addict_valid==null) return;
	window.continue_monitoring = false;
	var currentTime = new Date();
	var t_in_s = Math.round(currentTime.getTime() / 1000);
	
	// var href = window.location.host;
	var href = get_this_url();
	// href = href.replace(/\./g, '_');
	if (href.length == 0)
		return;
	// if(unsafeWindow.page_addict_start==null) return;
	var last = GM_getValue(href + '_last', 0);
	var last_visit = GM_getValue('last_visit', 0);
	
	// window.continue_monitoring=false;
	
	if (window.page_addict_start < last_visit
			|| window.page_addict_start == null) {
		// this seems to occur with some frequency in normal browse sessions...
		GM_log('fatal flaw?');
		window.page_addict_start = null;
		GM_setValue('page_addict_start', false);
		window.user_active = false;
		
		return;
	}
	
	if (t_in_s > last_visit + 1 || GM_getValue('idle_timeout_mode', false)) {
		var counts = Math.round(t_in_s - window.page_addict_start);
		// if(GM_getValue('idle_timeout_mode', false)) {
		// if(window.count_seconds)
		// counts=window.count_seconds;
		// else
		// counts=0;
		//
		// }
		
		GM_log('stop recording ' + window.location.host + ' for ' + counts + ' :: ' + href);
		
		GM_setValue(href + '_count', GM_getValue(href + '_count', 0) + counts);
		// GM_log('stopped recording '+href+', '+counts);
		if (last < 1)
			add_to_list(href, 'visited');
		GM_setValue(href + '_last', t_in_s);
		GM_setValue('last_visit', t_in_s);
		if (t_in_s % 5 == 0)
			GM_savePrefs();
		
		// SEND ANONYMOUS DATA TO PROCRASDONATE SERVER
		// cents_per_hr * 1hr/60min * 1min/60sec * seconds
		var amt = parseInt(GM_getValue('cents_per_hr', 0))/60.0/60.0 * counts;
		var recipient = GM_getValue('recipient', '');
		//GM_log("amt "+amt+" counts "+counts);
		//if ( amt > 0.0 && counts > 0 ) {
			// post_anonymous_info_to_procrasdonate(get_decoded_url(), counts,
			// amt, recipient);
			// @DAN we probably want to summarize this instead and do posts
			// elsewhere less frequently
		//}
	}
	window.page_addict_start = null;
	GM_setValue('page_addict_start', false);
	window.user_active = false;
	setTimeout("window.user_active=false", 100);
	// if(GM_getValue('idle_timeout_mode', false))
	// clearInterval(window.interval_id);
	
	// window.count_seconds=0;
	
	// check_exists();
	// make_payment(GM_getValue('cents_per_hr', ''));
	// create_account();
}

function post_anonymous_info_to_procrasdonate(site, time_spent, amt, recipient, time) {
	/*
	 * Posts anonymous information to procrasdonate server for community page
	 * tracking.
	 * 
	 * Site is domain of site spent time on Time is amount of time spent (in
	 * seconds) Amt is amount user will donate (in cents, based on rate)
	 * Recipient is recipient of donation
	 */
	var params = "site=" + site + "&time_spent=" + time_spent + "&amt=" + amt + "&recipient=" + recipient;
	if ( time ) {
		params += "&time=" + time;
	}
	
	make_request(
		constants.POST_DATA_URL,
		params,
		'POST',
		function(r) {
			GM_log('POST TO PD worked ' + r.status + ' ' + r.responseText);
		},
		function(r) {
			GM_log('POST TO PD failed');
		}
	);
}

function make_payment(amt) {
	/*
	 * Makes payment via TipJoy
	 */
	var reason = "ProcrasDonating for a good cause";
	var text = "p " + amt + "¢ @" + GM_getValue('recipient') + " " + escape(reason);
	var username = GM_getValue('twitter_username', '')
	var password = GM_getValue('twitter_password', '')
	//var params = "twitter_username=" + username + "&twitter_password=" + password + "&text=" + text;
	var params = { twitter_username: username, twitter_password: password, text: text };
	
	make_request(
		'http://tipjoy.com/api/tweetpayment/',
		params,
		'POST',
		function(r) {
			GM_log('PAYMENT onload ' + r.status + ' ' + r.responseText);
		},
		function(r) {
			GM_log('PAYMENT onerror' + r.responseText);
		}
	);
}

function check_balance(onload, onerror) {
	var username = GM_getValue('twitter_username', '')
	var password = GM_getValue('twitter_password', '')
	return check_balance(username, password, onload, onerror);
}

function check_balance(username, password, onload, onerror) {
	/*
	 * Determines user's current TipJoy balance
	 */
	if ( !username || !password ) {
		return false;
	}
	make_request(
		"http://tipjoy.com/api/user/balance/",
		{ twitter_username: username, twitter_password: password },
		"GET",
		onload,
		onerror
	);
}

function check_exists(onload, onerror) {
	var username = GM_getValue('twitter_username', '')
	return check_exists(username, onload, onerror);
}

function check_exists(username, onload, onerror) {
	/*
	 * Checks whether user's twitter credentials match a user account on TipJoy.
	 * If so, returns TipJoy user information.
	 */
	make_request(
		"http://tipjoy.com/api/user/exists/",
		{ twitter_username: username },
		"GET",
		onload,
		onerror
	);
}

function make_request(url, params, method, onload, onerror) {
	/*
	 * Helper method for making XmlHttpRequests @param params: string eg,
	 * a=3&b=4 @param method: string, either 'GET' or 'POST'
	 */
	var data = "";
	var remove_last = false;
	for (var prop in params) {
		data += encodeURIComponent(prop) + "=" + encodeURIComponent(params[prop]) + "&";
		remove_last = true;
	}
	if ( remove_last ) { data = data.substring(0, data.length-1); }
	
	if ( method == "GET" ) {
		url += "?" + data;
		data = "";
	}
	
	var headers = {
		"User-agent" : "Mozilla/4.0 (compatible) ProcrasDonate",
		"Content-length" : data.length
	}
	if ( method == 'POST' ) {
		headers["Content-type"] = "application/x-www-form-urlencoded";
	}

	GM_xmlhttpRequest( {
		method : method,
		url : url,
		data : data,
		headers : headers,
		onload : onload,
		onerror : onerror
	});
}

function create_account(username, password, onload, onerror) {
	/*
	 * Creates TipJoy account. Not sure what happens if user already exists.
	 */
	var params = { twitter_username: username, twitter_password: password }
	
	make_request(
		"http://tipjoy.com/api/createTwitterAccount/",
		params,
		"POST",
		onload,
		onerror
	);
}

function add_to_list(item, list) {
	/*
	 * Adds item to a GM_store variable called list. Specifically, list is ';'
	 * separated list of items. Item is appended. @param item: boolean, int or
	 * string (GM_store requirement) @param list: string -- name of GM_store
	 * variable.
	 */
	GM_setValue(list, GM_getValue(list, '') + item + ';');
}

function delete_all_data() {
	/*
	 * Resets plugin state.
	 */
	if (!confirm('Do you really want to permenantly delete all the data from pageaddict?'))
		return;
	GM_setValue('first_visit', -1);
	reset_visits();
	
	var tag_list = get_tag_list();
	var i;
	
	for (i = 0; i < tag_list.length; i += 1) {
		tag = tag_list[i];
		GM_delValue(tag + '_times');
		GM_delValue(tag + '_spent');
	}
	GM_delValue('ignore_list');
	GM_delValue('tag_list');
	GM_savePrefs();
}

function reset_visits() {
	/*
	 * Called by delete_all_data *and* when new day occurs. Just resets daily
	 * vars.
	 */
	var first = GM_getValue('first_visit', 0);
	if (first > 0)
		store_old_visits();
	var sites_array = GM_getValue('visited', '').split(";");
	GM_setValue('visited', '');
	var currentTime = new Date();
	var t_in_s = Math.round(currentTime.getTime() / 1000);
	GM_setValue('last_visit', t_in_s);
	GM_setValue('first_visit', t_in_s);
	var i;
	for (i = 0; i < sites_array.length; i += 1) {
		GM_delValue(sites_array[i] + '_count');
		GM_delValue(sites_array[i] + '_last');
	}
	// alert('reset addiction counts');
	GM_savePrefs();
}

toJSON = function (key) {
	/* serialize Dates as ISO strings */
	function f(n) {
		/* Format integers to have at least two digits. */
		return n < 10 ? '0' + n : n;
	}
	return this.getUTCFullYear()   + '-' +
		 f(this.getUTCMonth() + 1) + '-' +
		 f(this.getUTCDate())      + 'T' +
		 f(this.getUTCHours())     + ':' +
		 f(this.getUTCMinutes())   + ':' +
		 f(this.getUTCSeconds())   + 'Z';
};

fromJSON = function (key, value) {
	/* Values that look like ISO Dates will be converted to Dates */
	var a;
	if (typeof value === 'string') {
		a = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
		if (a) {
			return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
				+a[5], +a[6]));
		}
	}
	return value;
}

function initialize_state_if_necessary() {
	/*
	 * Initialize settings and impact state enumerations. Other inits?
	 */
	if (!GM_getValue('settings_state', '')) { GM_setValue('settings_state', constants.DEFAULT_SETTINGS_STATE); }
	if (!GM_getValue('impact_state', '')) { GM_setValue('impact_state', constants.DEFAULT_IMPACT_STATE); }
	if (!GM_getValue('register_state', '')) { GM_setValue('register_state', constants.DEFAULT_REGISTER_STATE); }
	
	if (!GM_getValue('last_24hr_mark', '')) {
		GM_setValue('last_24hr_mark', (Math.floor(get_semi_random_date().getTime() / 1000)));
		// todo once json gets included ok.
		//GM_setValue('last_24hr_mark', JSON.stringify(get_semi_random_date(), toJSON));
	}
	if (!GM_getValue('last_week_mark', '')) {
		//var two_four_hr = JSON.parse(GM_getValue('last_24hr_mark', ''), fromJSON);
		var two_four_hr = new Date(GM_getValue('last_24hr_mark', '')*1000);
		GM_setValue('last_week_mark', two_four_hr);
	}
}

function get_semi_random_date() {
	/* @returns: Date object for current day, month and fullyear with random hours, minutes and seconds */
	var d = new Date();
	// Math.floor(Math.random()*X) generates random ints, x: 0 <= x < X
	d.setHours(Math.floor(Math.random()*24));
	d.setMinutes(Math.floor(Math.random()*60));
	d.setSeconds(Math.floor(Math.random()*60));
	return d;
}

function initialize_account_defaults_if_necessary() {
	/*
	 * Set any blank account data to defaults.
	 */
	if (!GM_getValue('twitter_username', '')) { GM_setValue('twitter_username', constants.DEFAULT_USERNAME); }
	if (!GM_getValue('twitter_password', '')) { GM_setValue('twitter_password', constants.DEFAULT_PASSWORD); }
	if (!GM_getValue('recipients', '')) { GM_setValue('recipients', constants.DEFAULT_RECIPIENTS); }
	if (!GM_getValue('support_pct', '')) { GM_setValue('support_pct', constants.DEFAULT_SUPPORT_PCT); }
	if (!GM_getValue('cents_per_hr', '')) { GM_setValue('cents_per_hr', constants.DEFAULT_CENTS_PER_HR); }
	if (!GM_getValue('hr_per_week_goal', '')) { GM_setValue('hr_per_week_goal', constants.DEFAULT_HR_PER_WEEK_GOAL); }
	if (!GM_getValue('hr_per_week_max', '')) { GM_setValue('hr_per_week_max', constants.DEFAULT_HR_PER_WEEK_MAX); }
}

function reset_account_to_defaults() {
	/*
	 * Overwrite existing data (if any) with account defaults
	 */
	GM_setValue('twitter_username', constants.DEFAULT_USERNAME);
	GM_setValue('twitter_password', constants.DEFAULT_PASSWORD);
	GM_setValue('recipients', constants.DEFAULT_RECIPIENTS);
	GM_setValue('support_prct', constants.DEFAULT_SUPPORT_PCT);
	GM_setValue('cents_per_hr', constants.DEFAULT_CENTS_PER_HR);
	GM_setValue('hr_per_week_goal', constants.DEFAULT_HR_PER_WEEK_GOAL);
	GM_setValue('hr_per_week_max', constants.DEFAULT_HR_PER_WEEK_MAX);
}

function reset_state_to_defaults() {
	/*
	 * Overwrite existing data (if any) with state defaults
	 */
	GM_setValue('settings_state', constants.DEFAULT_SETTINGS_STATE);
	GM_setValue('impact_state', constants.DEFAULT_IMPACT_STATE);
	GM_setValue('register_state', constants.DEFAULT_REGISTER_STATE);
}

function store_old_visits() {
	/*
	 * Store old visits in tag_times and tag_spent
	 */
	calculate_time_use();
	var tag_counts = window.tag_counts;
	var tag_list = get_tag_list();
	var i, tag;
	for (i = 0; i < tag_list.length; i += 1) {
		tag = tag_list[i];
		GM_setValue(tag + '_times', GM_getValue(tag + '_times', '')
				+ GM_getValue('first_visit', 0) + ";");
		GM_setValue(tag + '_spent', GM_getValue(tag + '_spent', '')
				+ tag_counts[tag] + ";");
	}
	
	GM_setValue('total_times', GM_getValue('total_times', '')
			+ GM_getValue('first_visit', 0) + ";");
	GM_setValue('total_spent', GM_getValue('total_spent', '') + window.total
			+ ";");
}

function show_hidden_links() {
	/*
	 * Display hidden menu links that only apply to users running the extension.
	 */
	if (document.getElementById("history_link")) {
		document.getElementById("history_link").style.display = "block";
	}
	if (document.getElementById("settings_link")) {
		document.getElementById("settings_link").style.display = "block";
	}
	
	// document.getElementById("settings_link").style.display="block";
}

function check_page_inserts() {
	/*
	 * Insert data into matching webpage
	 *    pageaddict.com and (localhost:8000 or procrasdonate.com)
	 * See constants.PD_HOST in global constants at top of page.
	 * 
	 * @SNOOPY here for developer grep purposes
	 */
	var host = window.location.host;
	var href = window.location.href;
	
	function insert_based_on_state(state_name, state_enums, event_inserts) {
		/* Calls appropriate insert method based on current state
		 * 
		 * @param state_name: string. one of 'settings', 'register' or 'impact
		 * @param state_enums: array. state enumeration. one of 'constants.SETTINGS_STATE_ENUM',
		 * 		'constants.REGISTER_STATE_ENUM' or 'constants.IMPACT_STATE_ENUM'
		 * @param event_inserts: array. functions corresponding to enums. one of
		 * 		'constants.SETTINGS_STATE_INSERTS', 'constants.IMPACT_STATE_INSERTS', 'constants.REGISTER_STATE_INSERTS'
		 */
		GM_setValue('site_classifications_settings_activated', true);
		for (i = 0; i < state_enums.length; i += 1) {
			var state = state_enums[i];
			if ( GM_getValue(state_name + '_state', '') == state ) {
				event_inserts[i]();
				return true;
			}
		}
		return false;
	}
	
	if (host.match(new RegExp(constants.PD_HOST))) {
		
		function add_script(src) {
			var GM_JQ = document.createElement('script');
			GM_JQ.src = src;
			GM_JQ.type = 'text/javascript';
			document.getElementsByTagName('head')[0].appendChild(GM_JQ);
		}
		///////// Defined in procrasdonate.com
		// Add jQuery
		//add_script('http://jquery.com/src/jquery-latest.js');
		// Add jQuery UI
		//add_script('http://jqueryui.com/latest/ui/ui.core.js');
		//add_script('http://jqueryui.com/latest/ui/ui.slider.js');
		
		function GM_wait() {
			if(typeof unsafeWindow.jQuery == 'undefined') { window.setTimeout (GM_wait,100); }
			else { $ = unsafeWindow.jQuery; }
		}
		GM_wait();
		
		//reset_state_to_defaults();
		//reset_account_to_defaults();
		if ( GM_getValue('register_state', '') == 'done' ) {
			// If done registering, change Start menu item to Settings.
			$("#start_now_menu_item a").attr("href", constants.SETTINGS_URL).text("Settings");
		} else {
			// Else, if not working on registration track, give registration warning.
		}
		
		if ( href == constants.START_URL ) {
			// Page is replaced by registration track (or nothing if not
			// registered).
			// Once registration track is 'done', Start menu item is replaced by
			// Settings menu item, and Start page is replaced by settings pages
			var state_matched = insert_based_on_state('register', constants.REGISTER_STATE_ENUM, constants.REGISTER_STATE_INSERTS);
			if (!state_matched) {
				GM_setValue('register_state', constants.DEFAULT_REGISTER_STATE);
				insert_based_on_state('register', constants.REGISTER_STATE_ENUM, constants.REGISTER_STATE_INSERTS);
			}
		}
		// reason why not else if?
		if ( href == constants.SETTINGS_URL ) {
			// Page is replaced by settings options. Some Settings tabs re-use
			// snippets inserted by registration inserts
			var state_matched = insert_based_on_state('settings', constants.SETTINGS_STATE_ENUM, constants.SETTINGS_STATE_INSERTS);
			if (!state_matched) {
				GM_setValue('settings_state', constants.DEFAULT_SETTINGS_STATE);
				insert_based_on_state('settings', constants.SETTINGS_STATE_ENUM, constants.SETTINGS_STATE_INSERTS);
			}
		}
		else if ( href == constants.IMPACT_URL ) {
			// Page is replaced by impact tabs
			var state_matched = insert_based_on_state('impact', constants.IMPACT_STATE_ENUM, constants.IMPACT_STATE_INSERTS);
			if (!state_matched) {
				GM_setValue('impact_state', constants.DEFAULT_IMPACT_STATE);
				insert_based_on_state('impact', constants.IMPACT_STATE_ENUM, constants.IMPACT_STATE_INSERTS);
			}
		}
		else if ( href == constants.RESET_URL ) {
			reset_state_to_defaults();
			reset_account_to_defaults();
		}
	}
	if (host.match(/pageaddict\.com$/)) {
		// if(href.match(/pageaddict/)) {
		show_hidden_links();
		if (document.getElementById("insert_statistics_here")) {
			get_results_html();
		}
		if (document.getElementById("insert_history_here")) {
			plot_history(7);
		}
		if (document.getElementById("insert_settings_here")) {
			make_settings();
		}
	}
}
