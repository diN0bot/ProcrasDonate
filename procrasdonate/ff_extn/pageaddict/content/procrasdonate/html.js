/********** HTML INSERTION FUNCTIONS AND HELPERS ***************/

function make_site_box(name, url, tag) {
	/*
	 * 
	 */
	function undefined_wrap(inner) {
		return "<span class='link move_to_left move_to_procrasdonate'>&lt;</span>" +
			inner + "<span class='link move_to_right move_to_timewellspent'>&gt;</span>";
	}
	function procrasdonate_wrap(inner) {
		return inner + "<span class='link move_to_right move_to_undefined'>&gt;</span>";
	}
	function timewellspent_wrap(inner) {
		return "<span class='link move_to_left move_to_undefined'>&lt;</span>" + inner;
	}
	
	var text = "<div class='site'>";
	var site_text = "<span class='name'>" + name.replace(/__/g, '/').replace(/\_/g,'.') + "</span>";
	if ( tag == 'undefined') text += undefined_wrap(site_text);
	else if ( tag == 'timewellspent') text += timewellspent_wrap(site_text);
	else if ( tag == 'procrasdonate') text += procrasdonate_wrap(site_text);
	text += "</div>";
	return text;
}

function activate_site_classifications_middle() {
	if ( GM_getValue('site_classifications_settings_activated', false) ) {
		var f = function(elem, tag) {
			var site_name = elem.siblings(".name").text();
			elem.parent().fadeOut("slow", function() { $(this).remove(); });
			$("#"+tag+"_col .title").after(make_site_box(site_name, site_name, tag))
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
		GM_setValue('site_classifications_settings_activated', false);
	}
}

function insert_register_balance() {
	/*
	 * Inserts balance/TipJoy info.
	 */
	GM_setValue('register_state', 'balance');
	
	var middle = "" +
		"exists: <span id='exists'></span>" +
		"<br /><br />" +
		"balance: <span id='balance_here'></span>";
	
	$("#content").html( register_wrapper_snippet(middle, true) );
	activate_register_tab_events();
	
	/*check_exists(
		function(r) {
			var str = ""; for (var prop in r) {	str += prop + " value :" + r[prop]+ + "\n\n"; }
			$("#exists").append(str);
			if ( r.responseText.result == "success" ) {
				$("#exists").append(r.responseText.result + str);
			} else {
				$("#exists").append("creating account...");
			}
			
		},
		function(r) {
			var str = ""; for (var prop in r) {	str += prop + " value :" + r[prop]+ + "\n\n"; }
			$("#exists").append(str);
		}
	);*/
	
	/*check_balance(
		function(r) {
			var str = ""; for (var prop in r) {	str += prop + " value :" + r[prop]+ + "\n\n"; }
			//alert("BALANCE !!!!! onload "+str);
			//alert("onload rt"+r.responseText);
			$("#balance_here").append(r.responseText.balance);
		},
		function(r) {
			var str = ""; for (var prop in r) {	str += prop + " value :" + r[prop]+ + "\n\n"; }
			$("#balance_here").append(str);
		}
	);*/
	
	//make_payment(4);
}

function support_middle() {
	var pct = GM_getValue('support_pct', constants.DEFAULT_SUPPORT_PCT);
	return "" +
	"<h3>Help us grow and develop</h3>" +
	"<p>Give back to the cause that lets you help the non-profits and content-providers you care about.</p>" +
	
	"<table<tbody><tr>" +
		"<td><label class='right'>Support ProcrasDonate: </label></td>" +
		"<td><div id='support_slider' class='slider' alt='" + pct + "'></div></td>" +
		"<td><input id='support_input' class='press_enter_for_next input' alt='" + pct + "' value='" + pct + "' size='1'/></td>" +
		"<td><span class='help'>% of total donation</span></td>" +
	"</tr></tbody></table";
}

function activate_support_middle() {
	var pct = GM_getValue('support_pct', constants.DEFAULT_SUPPORT_PCT);
	$("#support_slider").slider({
		//animate: true,
		min: 0,
		max: 10,
		value: pct,
		step: 1,
		slide: function(event, ui) {
			set_sliders_and_input($(this), $(this).next(), $(this).next().attr("value"), ui.value);
		}
	});
	
	$("#support_input").keyup(function(event) {
		set_sliders_and_input($(this).prev(), $(this), $(this).attr("alt"), $(this).attr("value"));
	});
	
	function set_sliders_and_input(slider, input, oldv, newv) {
		if ( newv < 0 || newv > 100 ) return false;
		var diff = oldv - newv;
		input.attr("value", newv).attr("alt", newv);
		//slider.slider('option', 'value', newv);
		slider.slider('option', 'value', newv);
		GM_setValue('support_pct', newv);
		return true;
	}
}

function insert_register_support() {
	/* Inserts support ProcrasDonate info. */
	GM_setValue('register_state', 'support');
	$("#content").html( register_wrapper_snippet(support_middle(), false) );
	activate_register_tab_events();
	activate_support_middle();
}

function insert_register_done() {
	GM_setValue('register_state', 'done');
	window.location.href = constants.IMPACT_URL;
}

function site_classifications_middle() {
	var procrasdonate_text = "";
	var undefined_text = "";
	var timewellspent_text = "";
	
	// var unsort_arr = [];
	// unsort_arr = window.unsort_arr;
	// var sort_arr = unsort_arr.sort(sortf);
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
			timewellspent_text += make_site_box(sort_arr[i][0], sort_arr[i][0], tag);
		} else if ( tag == 'procrasdonate' ) {
			procrasdonate_text += make_site_box(sort_arr[i][0], sort_arr[i][0], tag);
		} else {
			undefined_text += make_site_box(sort_arr[i][0], sort_arr[i][0], tag);
		}
	}
	
	return "" +
		"<div id='site_classifications'>" +
			"<div id='procrasdonate_col' class='column'><div class='title'>Procras Donate</div>" + procrasdonate_text + "</div>" +
			"<div id='undefined_col' class='column'><div class='title'><-~-></div>" + undefined_text + "</div>" +
			"<div id='timewellspent_col' class='column'><div class='title'>Time Well Spent</div>" + timewellspent_text + "</div>" +
		"</div>"
}

function insert_register_site_classifications() {
	/* Inserts site classification html into page */
	GM_setValue('register_state', 'site_classifications');
	$("#content").html(register_wrapper_snippet(site_classifications_middle(), false));
	activate_register_tab_events();
	activate_site_classifications_middle();
}

function recipient_snippet(name, url, description) {
	return "<div class='recipient'>" +
				"<div class='name'><a href='" + url + "'>" + name + "</a></div>" +
				"<div class='description'>" + description + "</div>" +
			"</div>";
}

function recipients_middle(user_recipients_ary, potential_recipients_ary) {
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
}

function activate_recipients_middle(user_recipients_ary, potential_recipients_ary) {
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
}

function insert_register_recipients() {
	/*
	 * Inserts form so that user may select recipients. 
	 * 
	 * Slider input's alt must contain "last" value of input, so when do keyboard presses we can compute how to alter the other tabs.
	 */
	GM_setValue('register_state', 'recipients');
	var user_recipients_ary = [
		{'name':'Bilumi','url':'http://bilumi.org','description':'Enabling the socially conscious consumer','pct':60},
		{'name':'CNC Mill','url':'http://cnc.org','description':'Every hacker should have one','pct':20},
		{'name':'Save The News','url':'http://cnc.org','description':'La lallaala LAlAla','pct':20}];
	var potential_recipients_ary = [
		{'name':'Red Cross','url':'http://redcross.org','description':'Exploring mono-chromatic orthoganal artwork since the 1800s'},
		{'name':'Green Peace','url':'http://greenpeace.org','description':'Expanding greener pastures'},
		{'name':'Act Blue','url':'http://actblue.org','description':'Earning money for democrats and making longer, longer, much longer descriptions for profit.'}
	];
	$("#content").html(register_wrapper_snippet(recipients_middle(user_recipients_ary, potential_recipients_ary), false));
	activate_register_tab_events();
	activate_recipients_middle(user_recipients_ary, potential_recipients_ary);
}

function insert_register_donation_amounts() {
	/* Inserts form so that user may enter donation information */
	GM_setValue('register_state', 'donation_amounts');
	$("#content").html( register_wrapper_snippet(donation_amounts_middle(), true) );
	activate_register_tab_events();
}

function donation_amounts_middle() {
	return "" +
	"<tr>" +
		"<td><label class='right'>ProcrasDonation rate</label></td>" +
		"<td><input class='left' type='text' size='4' name='cents_per_hour' value='"+GM_getValue('cents_per_hour','')+"'></td>" +
		"<td><div class='help'>&cent; per hour</div></td>" +
	"</tr>" +
	
	"<tr>" +
		"<td><label class='right'>ProcrasDonation goal</label></td>" +
		"<td><input class='left' id='hr_per_day_goal' type='text' size='4' name='hr_per_day_goal' value='"+GM_getValue('hr_per_day_goal','')+"'></td>" +
		"<td><div class='help'>hours per day</span><span id='cents_per_day_goal'></div></td>" +
	"</tr>" +
	
	"<tr" +
		"<td><label class='right'>ProcrasDonation limit</label></td>" +
		"<td><input class='press_enter_for_next left' id='hr_per_day_max' type='text' size='4' name='hr_per_day_max' value='"+GM_getValue('hr_per_day_max','')+"'></td>" +
		"<td><div class='help'>hours per day</div></td>" +
	"</tr>";
}

function impact_wrapper_snippet(middle) {
	var cell_text = "<div id='thin_column'" + impact_tab_snippet();
	cell_text += "<div id='errors'></div><div id='success'></div>";
	cell_text += middle;
	cell_text += "</div>";
	return cell_text;
}

function register_wrapper_snippet(middle, in_form) {
	return _wrapper_snippet(middle, in_form, register_tab_snippet());
}

function settings_wrapper_snippet(middle, in_form) {
	return _wrapper_snippet(middle, in_form, settings_tab_snippet());
}

function _wrapper_snippet(middle, in_form, tab_snippet) {
	/*
	 * @param in_form: if true, will wrap middle inside a form containing a table.
	 * 				   otherwise, will not.
	 * @param middle: If in_form is true, middle should contain table rows:
	 *    "<tr><td>...</td></tr>"
	 * 
	 */
	var cell_text = "<div id='thin_column'>" + tab_snippet;
	cell_text += "<div id='errors'></div><div id='success'></div>";
	if ( in_form ) {
		cell_text += "<form name='account_form' onSubmit='return false'>";
		cell_text += "<table><tbody>";
	}
	cell_text += middle;
	if ( in_form) {
		cell_text += "</tbody></table></form>";
	}
	cell_text += "</div>";
	return cell_text;
}

function twitter_account_middle() {
	return "" +
	"<p style='text-align: left;'>ProcrasDonate uses Twitter <span id='what_is_twitter' class='link'>(?)</span></p>" +
	"<p style='text-align: left;'>Create a twitter account <a href='https://twitter.com/signup'>HERE</a></p>" +
	
	"<tr><td><label class='right'>Twitter username </label></td>" +
	"<td><input class='left' type='text' name='twitter_username' value='"+GM_getValue('twitter_username','')+"'></td></tr>" +
	
	"<tr class='above_helprow'><td><label class='right'>Twitter password</label></td>" +
	"<td><input class='press_enter_for_next left' type='password' name='twitter_password' value='"+GM_getValue('twitter_password','')+"'></td></tr>" +
	"<tr class='helprow'><td></td><td><div class='help'><a href='" + constants.PRIVACY_URL + "'>Privacy Guarantee</a></div></td></tr>";
}

function activate_twitter_account_middle() {
	$("#what_is_twitter").click( function() {
		$(this).text("\"A service to communicate and stay connected through the exchange of quick," +
					"frequent answers to one simple question: What are you doing?\"")
				.css("display", "block")
				.addClass('open')
				.removeClass('link');
	});	
}

function insert_settings_twitter_account() {
	/* Inserts user's twitter account form into page */
	GM_setValue('settings_state', 'twitter_account');
	
	$("#content").html( settings_wrapper_snippet(twitter_account_middle(), true) );
	activate_settings_tab_events();
	activate_twitter_account_middle();
}

function insert_settings_recipients() {
	/*
	 * Inserts form so that user may select recipients.
	 * 
	 * Slider input's alt must contain "last" value of input, so when do keyboard presses we can compute how to alter the other tabs.
	 */
	GM_setValue('settings_state', 'recipients');
	var user_recipients_ary = [
		{'name':'Bilumi','url':'http://bilumi.org','description':'Enabling the socially conscious consumer','pct':60},
		{'name':'CNC Mill','url':'http://cnc.org','description':'Every hacker should have one','pct':20},
		{'name':'Save The News','url':'http://cnc.org','description':'La lallaala LAlAla','pct':20}];
	var potential_recipients_ary = [
		{'name':'Red Cross','url':'http://redcross.org','description':'Exploring mono-chromatic orthoganal artwork since the 1800s'},
		{'name':'Green Peace','url':'http://greenpeace.org','description':'Expanding greener pastures'},
		{'name':'Act Blue','url':'http://actblue.org','description':'Earning money for democrats and making longer, longer, much longer descriptions for profit.'}
	];
	$("#content").html(settings_wrapper_snippet(recipients_middle(user_recipients_ary, potential_recipients_ary), false));
	activate_settings_tab_events();
	activate_recipients_middle(user_recipients_ary, potential_recipients_ary);
}

function insert_settings_donation_amounts() {
	/* Inserts form so that user may enter donation information */
	GM_setValue('settings_state', 'donation_amounts');
	$("#content").html( settings_wrapper_snippet(donation_amounts_middle(), true) );
	activate_settings_tab_events();
}

function insert_settings_site_classifications() {
	/* Inserts site classification html into page */
	GM_setValue('settings_state', 'site_classifications');
	$("#content").html(settings_wrapper_snippet(site_classifications_middle(), false));
	activate_settings_tab_events();
	activate_site_classifications_middle();
}

function insert_settings_support() {
	/* Inserts support ProcrasDonate info. */
	GM_setValue('settings_state', 'support');
	$("#content").html( settings_wrapper_snippet(support_middle(), false) );
	activate_settings_tab_events();
	activate_support_middle();
}

function insert_settings_balance() {
	/* Inserts TipJoy balance html into page */
	GM_setValue('settings_state', 'balance');
	var cell_text =
		"<div id='thin_column'" +
		settings_tab_snippet() +
		"</div>";
	
	$("#content").html(cell_text);
	activate_settings_tab_events();
	
	// works
	// post_anonymous_info_to_procrasdonate('http://bilumi.org', 22, 5,
	// 'bilumi');
	
	/*
	 * check_balance( function(r) { GM_log("balance WORK "+r+" "r.result+"
	 * "+r.reason+" "+r.balance+" "+r.currency); }, function(r) {
	 * GM_log("balance FAIL "+r.result+" "+r.reason+" "+r.balance+"
	 * "+r.currency); } );
	 */
	
	// check_exists();
		/*
		 * function(r) { GM_log('STATUS worked ' + r.result + ' ' + r.reason + ' ' +
		 * r.exists + ' ' + r.user + ' ' + r.is_private); }
		 */
	// );
}

function process_support() {
	var support_input = parseFloat($("input[name='support_input']").attr("value"))
	
	if ( support_input < 0 || support_input > 100 ) {
		$("#errors").text("<p>Please enter a percent between 0 and 10.</p>");
	} else {
		GM_setValue('support', 4);
		return true;
	}
	return false;
}

function validate_cents_input(v) {
	var cents = parseInt(v);
	var hr_per_day_goal = parseFloat($("input[name='hr_per_day_goal']").attr("value"));
	var max = 2000;
	if ( cents > 0 && cents < max ) {
		return true
	}
	if ( cents >= max ) {
		var confirm_results = confirm("Do you really want to donate " + cents + "&cent; every hour you spend procrastinating up to your daily limit of " + hr_per_day_goal + "?");
		if ( confirm_results ) {
			return true
		} else {
			return false
		}
	}
	return false
}

function validate_hours_input(v) {
	var hours = parseFloat(v);
	if ( hours > 0 ) { return true }
	else { return false }
}

function clean_cents_input(v) {
	var cents = parseInt(v);
	return cents
}

function clean_hours_input(v) {
	var hours = parseFloat(v);
	if ( hours > 24 ) { hours = 24; }
	if ( parseInt(hours) != hours ) { hours = hours.toFixed(2); }
	return hours
}

function validate_twitter_username_and_password(username, password) {
	return validate_string(username) && validate_string(password)
}

function validate_string(v) {
	return v && v != ''
}

function process_donation() {
	/*
	 * cents_per_day: pos int
	 * hr_per_day_goal: pos float < 25
	 * hr_per_day_max: pos float < 25
	 */
	var cents_per_hour = parseInt($("input[name='cents_per_hour']").attr("value"));
	var hr_per_day_goal = parseFloat($("input[name='hr_per_day_goal']").attr("value"));
	var hr_per_day_max = parseFloat($("input[name='hr_per_day_max']").attr("value"));
	
	$("#errors").text("");
	if ( !validate_cents_input(cents_per_hour) ) {
		$("#errors").append("<p>Please enter a valid dollar amount. For example, to donate $2.34 an hour, please enter 2.34</p>");
	} else if ( !validate_hours_input(hr_per_day_goal) ) {
		$("#errors").append("<p>Please enter number of hours. For example, enter 1 hr and 15 minutes as 1.25</p>");
	} else if (!validate_hours_input(hr_per_day_max) ) {
		$("#errors").append("<p>Please enter number of hours. For example, enter 30 minutes as .5</p>");
	} else {
		GM_setValue('cents_per_hour', clean_cents_input(cents_per_hour));
		GM_setValue('hr_per_day_goal', clean_hours_input(hr_per_day_goal));
		GM_setValue('hr_per_day_max', clean_hours_input(hr_per_day_max));
		return true;
	}
	return false;
}

function process_balance() {
	GM_log("process_balance()");
	return true;
}

function process_site_classifications() {
	GM_log("process_site_classifications()");
	return true;
}

function process_recipients() {
	GM_log("process_recipients()");
	return true;
}

function process_done() {
	GM_log("process_done()");
	return true;
}

function process_twitter_account() {
	/*
	 * Validate account form and save.
	 * @TODO twitter credentials and recipient twitter name should be verified.
	 * @TODO all fields should be validated as soon as user tabs to next field.
	 */
	GM_log("process_twitter_account()");
	
	$("#errors").html("");
	$("#success").html("");
	
	var twitter_username = $("input[name='twitter_username']").attr("value");
	var twitter_password = $("input[name='twitter_password']").attr("value");
	
	if ( !validate_twitter_username_and_password(twitter_username, twitter_password) ) {
		$("#errors").append("<p>Please enter your twitter username and password</p>");
		return false;
	} else {
		// Check if the username/password combo matches an existing account. We use
		// check balance for this in order to test that the password works, too.
		// If "no such tipjoy user", then create account 
		check_exists(twitter_username,  
			function(r) {
				var result = eval("("+r.responseText+")").result;
				var exists = eval("("+r.responseText+")").exists;
				if ( result == "success" && exists ) {
					check_balance(twitter_username, twitter_password,
						function(r) {
							var result = eval("("+r.responseText+")").result;
							if ( result == "success" ) {
								GM_log("tipjoy user exists and can sign-on");
								GM_setValue('twitter_username', twitter_username);
								GM_setValue('twitter_password', twitter_password);
								if ( GM_getValue('register_state', '') != 'done' ) {
									constants.REGISTER_STATE_INSERTS[1]();
								} else {
									constants.SETTINGS_STATE_INSERTS[1]();
								}
							} else {
								GM_log("tipjoy user exists but can not sign-on");
								var reason = eval("("+r.responseText+")").reason;
								$("#errors").append("tipjoy user exists but can not sign-on: "+reason);
							}
						},
						function(r) {
							var str = ""; for (var prop in r) {	str += prop + " value :" + r[prop]+ + " __ "; }
							GM_log("standard_onerror: "+r+"_"+str);
							var reason = eval("("+r.responseText+")").reason;
							$("#errors").append("An error occurred: " + reason);
						}
					);
				} else {
					GM_log("tipjoy user does not exist");
					create_account(twitter_username, twitter_password,
						function(r) {
							var result = eval("("+r.responseText+")").result;
							if ( result == "success" ) {
								GM_log("created tipjoy account");
								GM_setValue('twitter_username', twitter_username);
								GM_setValue('twitter_password', twitter_password);
								
								if ( GM_getValue('register_state', '') != 'done' ) {
									constants.REGISTER_STATE_INSERTS[1]();
								} else {
									constants.SETTINGS_STATE_INSERTS[1]();
								}
							} else {
								GM_log("problem creating tipjoy account");
								var str = ""; for (var prop in result) {	str += prop + " value :" + result[prop]+ + " __ "; }
								GM_log("_: "+str);
								var reason = eval("("+r.responseText+")").reason;
								GM_log("problem creating tipjoy account: "+reason);
								$("#errors").append("problem creating tipjoy account: "+reason);
							}
						},
						function(r) {
							var str = ""; for (var prop in r) {	str += prop + " value :" + r[prop]+ + " __ "; }
							GM_log("standard_onerror: "+r+"_"+str);
							var reason = eval("("+r.responseText+")").reason;
							$("#errors").append("An error occurred: " + reason);
						}
					);
				}
			},
			function(r) {
				var str = ""; for (var prop in r) {	str += prop + " value :" + r[prop]+ + " __ "; }
				GM_log("standard_onerror: "+r+"_"+str);
				var reason = eval("("+r.responseText+")").reason;
				$("#errors").append("An error occurred: " + reason);
			}
		);
	}
	$("#errors").append("verifying username and password...");
	return false
}

function _tab_snippet(state_name, state_enums, tab_names) {
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
	
	var selected = GM_getValue(state_name + '_state', '');
	
	for (i = 0; i < state_enums.length; i += 1) {
		var tab_state = state_enums[i];
		
		var tab_selected_class = '';
		if ( tab_state == selected ) { tab_selected_class = 'selected'; }
		
		tabs_text += "<div id='" + tab_state + "_tab' class='tab link " + tab_selected_class +"'>";
		tabs_text += tab_names[i];
		tabs_text += "</div>";
	}
	tabs_text += "</div>";
	
	return tabs_text
}

function register_tab_snippet() {
	/* Creates register state track. Does not call _tab_snippet! */
	var ret = _track_snippet('register', constants.REGISTER_STATE_ENUM, constants.REGISTER_STATE_TAB_NAMES, true);
	var done_class = "";
	if ( GM_getValue('register_state','') == 'balance' ) {
		done_class = "done";
	}
	ret += "" +
		"<div id='register_prev_next'>" +
			"<div id='prev_register_track' class='link register_button'></div>" +
			"<div id='next_register_track' class='link register_button "+ done_class +"'></div>" +
		"</div>";
		//"<input id='prev_register_track' class='link' type='button' name='save' value='Prev'>" +
		//"<input id='next_register_track' class='link' type='button' name='save' value='" + next_value + "'>";
	return ret;
}

function settings_tab_snippet() {
	/* Creates settings state track.*/
	return _track_snippet('settings', constants.SETTINGS_STATE_ENUM, constants.SETTINGS_STATE_TAB_NAMES, false);
}

function _track_snippet(state_name, state_enum, tab_names, track_progress) {
	var tracks_text = "<table id='"+state_name+"_track' class='tracks'><tbody><tr>";
	
	var current_state = GM_getValue(state_name+'_state', '');
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
}

function impact_tab_snippet() {
	/* Calls _tab_snippet for impact state */
	return _tab_snippet('impact', constants.IMPACT_STATE_ENUM, constants.IMPACT_STATE_TAB_NAMES);
}

function _process_before_proceeding(state_name, state_enums, processors, event) {
	return function() {
		for (var i = 0; i < state_enums.length; i += 1) {
			var tab_state = state_enums[i];
			if ( GM_getValue(state_name+"_state", "") == tab_state ) {
				var processor = processors[i];
				if ( processor() ) {
					event();
				}
				break;
			}
		}
	}
}

function activate_settings_tab_events() {
	/* Attaches EventListeners to settings tabs */
	for (var i = 0; i < constants.SETTINGS_STATE_ENUM.length; i += 1) {
		var tab_state = constants.SETTINGS_STATE_ENUM[i];
		var event = constants.SETTINGS_STATE_INSERTS[i];
		// closure
		$("#"+tab_state+"_track, #"+tab_state+"_text").click(
				(_process_before_proceeding)('settings', constants.SETTINGS_STATE_ENUM, constants.SETTINGS_STATE_PROCESSORS, event) );
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
}

function activate_impact_tab_events() {
	/* Attaches EventListeners to impact tabs */
	for (var i = 0; i < constants.IMPACT_STATE_ENUM.length; i += 1) {
		var tab_state = constants.IMPACT_STATE_ENUM[i];
		var event = constants.IMPACT_STATE_INSERTS[i];
		// closure
		$("#"+tab_state+"_tab").click(
				(function (event) { return event; })(event)
		);
	}
}

function activate_register_tab_events() {
	/* Attaches EventListeners to register tabs */
	for (var i = 0; i < constants.REGISTER_STATE_ENUM.length; i += 1) {
		var tab_state = constants.REGISTER_STATE_ENUM[i];
		var current_state = GM_getValue('register_state', '');
		
		if ( tab_state == current_state ) {
			if ( i > 0 ) {
				var prev = constants.REGISTER_STATE_INSERTS[i-1];
				$("#prev_register_track").click(
						(_process_before_proceeding)('register', constants.REGISTER_STATE_ENUM, constants.REGISTER_STATE_PROCESSORS, prev) );
			} else { $("#prev_register_track").hide(); }
			
			if ( i < constants.REGISTER_STATE_ENUM.length ) {
				var next = constants.REGISTER_STATE_INSERTS[i+1];
				$("#next_register_track").click(
					(_process_before_proceeding)('register', constants.REGISTER_STATE_ENUM, constants.REGISTER_STATE_PROCESSORS, next) );
			} else { $("#next_register_track").hide(); }
		}
	}
	$(".press_enter_for_next").bind( 'keypress', function(e) {
		var code = (e.keyCode ? e.keyCode : e.which);
		if(code == 13) { //Enter keycode
			$("#next_register_track").click();
		}
	});
}

/************************************************************************/

function insert_register_twitter_account() {
	/* Inserts user's twitter account form into page */
	GM_setValue('register_state', 'twitter_account');
	$("#content").html( register_wrapper_snippet(twitter_account_middle(), true) );
	activate_register_tab_events();
	activate_twitter_account_middle();
}

function insert_impact_site_ranks() {
	/*
	 * Inserts site ranks information into impact.site_ranks page
	 */
	GM_setValue('impact_state', 'site_ranks');
	var sort_arr = [
		['www.ycombinator.com', 120, 200],
		['bilumi.org', 100, 100],
		['gmail.com', 45, 75],
		['www.slashdot.com', 30, 50],
		['www.javascriptkit.com', 30, 50],
		['news.ycombinator.com', 2, 2],
		['hulu.com', 1, 1],
	];
	
	var middle = "<div id='ranks'>";
	middle += "<table><tbody>";
	
	var max = null;
	for (i = 0; i < sort_arr.length; i += 1) {
		if ( i == 0 ) max = sort_arr[i][1];
		middle += "<tr class='site_rank'>";
		middle += "<td class='site_name'>" + sort_arr[i][0] + "</td>";
		middle += "<td class='rank'><div class='bar' style='width:" + parseInt( (sort_arr[i][1]/max)*100.0 ) + "%'></div></td>";
		middle += "<td class='rank_text'>" + sort_arr[i][1] + " min</td>";
		middle += "<td class='rank_text'>$" + sort_arr[i][2] + "</td>";
		middle += "</tr>";
	}
	middle += "</tbody></table>";
	
	$("#content").html( impact_wrapper_snippet(middle) );
	activate_impact_tab_events();
}

function insert_impact_visits() {
	/*
	 * Inserts visits information into impact.visits page
	 */
	GM_setValue('impact_state', 'visits');
	
	var middle = "<div id='procrasdonation_chart' style='width:100%;height:300px'></div>";
	$("#content").html( impact_wrapper_snippet(middle) );
	activate_impact_tab_events();
	
	var rawdata = [ [10, 1], [17, -14], [30, 5] ];
	var data = [
		{
			// color: color or number
			data: rawdata,
			label: "Games",
			// lines: specific lines options
			// bars: specific bars options
			// points: specific points options
			// threshold: specific threshold options
			// xaxis: 1 or 2
			// yaxis: 1 or 2
			xaxis: 1,
			clickable: true,
			hoverable: true,
			// shadowSize: number
		}
	];
	var options = {
		lines: { show: true },
		points: { show: true },
		selection: { mode: "x", },
		// crosshair: { mode: "xy", },
	};
	//$.plot($("#procrasdonation_chart"), data, options);
}

function insert_impact_history() {
	/*
	 * Inserts historic information into impact.historic page
	 */
	GM_setValue('impact_state', 'history');
	
	var middle = "<div id='procrasdonation_chart' style='width:100%;height:300px'></div>";
	$("#content").html( impact_wrapper_snippet(middle) );
	activate_impact_tab_events();
	
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
}
