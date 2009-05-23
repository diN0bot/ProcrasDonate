/********** HTML INSERTION FUNCTIONS AND HELPERS ***************/

function make_site_box(name, url, tag) {
	/*
	 * 
	 */
	function undefined_wrap(inner) {
		return "<span class='img_link move_to_procrasdonate'>			" +
					"<img class='Move_Site_Arrow' src='"+ constants.MEDIA_URL +"img/LeftArrow.png'></span>" +
			inner + "<span class='img_link move_to_timewellspent'>" +
						"<img class='Move_Site_Arrow' src='"+ constants.MEDIA_URL +"img/RightArrow.png'></span>";
	}
	function procrasdonate_wrap(inner) {
		return inner + "<span class='img_link move_to_undefined'>" +
							"<img class='Move_Site_Arrow' src='"+ constants.MEDIA_URL +"img/RightArrow.png'></span>";
	}
	function timewellspent_wrap(inner) {
		return "<span class='img_link move_to_undefined'>" +
					"<img class='Move_Site_Arrow' src='"+ constants.MEDIA_URL +"img/LeftArrow.png'></span>" + inner;
				
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
	
	$("#content").html( register_wrapper_snippet(middle) );
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
	"<h3>Support ProcrasDonate automatically.</h3>" +
	"<p>What <i>percentage</i> of your donations would <b>you</b> like to use to pay for this service?</p>" +
	
	"<form name='account_form' onSubmit='return false'>" +

	"<table<tbody><tr>" +
		"<td><label class='right'>Support ProcrasDonate: </label></td>" +
		"<td><div id='support_slider' class='slider' alt='" + pct + "'></div></td>" +
		"<td><input id='support_input' class='press_enter_for_next input' alt='" + pct + "' value='" + pct + "' size='1'/></td>" +
		"<td><span class='help'>% of total donation</span></td>" +
	"</tr></tbody></table>" +
	
	"</form>";
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
	$("#content").html( register_wrapper_snippet(support_middle()) );
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
	$("#content").html(register_wrapper_snippet(site_classifications_middle()));
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
	$("#content").html(register_wrapper_snippet(recipients_middle(user_recipients_ary, potential_recipients_ary)));
	activate_register_tab_events();
	activate_recipients_middle(user_recipients_ary, potential_recipients_ary);
}

function insert_register_donation_amounts() {
	/* Inserts form so that user may enter donation information */
	GM_setValue('register_state', 'donation_amounts');
	$("#content").html( register_wrapper_snippet(donation_amounts_middle()) );
	activate_register_tab_events();
}

function donation_amounts_middle() {
	return "" +
	"<form name='account_form' onSubmit='return false'>" +
	"<table><tbody>" +
	"<tr>" +
		"<td><label class='right'>ProcrasDonation rate</label></td>" +
		"<td><input class='left' type='text' size='4' name='cents_per_hr' value='"+GM_getValue('cents_per_hr','')+"'></td>" +
		"<td><div class='help'>&cent; per hour</div></td>" +
	"</tr>" +
	
	"<tr>" +
		"<td><label class='right'>ProcrasDonation goal</label></td>" +
		"<td><input class='left' id='hr_per_week_goal' type='text' size='4' name='hr_per_week_goal' value='"+GM_getValue('hr_per_week_goal','')+"'></td>" +
		"<td><div class='help'>hours per day</span><span id='cents_per_week_goal'></div></td>" +
	"</tr>" +
	
	"<tr" +
		"<td><label class='right'>ProcrasDonation limit</label></td>" +
		"<td><input class='press_enter_for_next left' id='hr_per_week_max' type='text' size='4' name='hr_per_week_max' value='"+GM_getValue('hr_per_week_max','')+"'></td>" +
		"<td><div class='help'>hours per day</div></td>" +
	"</tr>" +
	
	"</table></tbody>" +
	"</form>";
}

function impact_wrapper_snippet(middle) {
	var cell_text = "<div id='thin_column'" + impact_tab_snippet();
	cell_text += "<div id='messages'></div><div id='errors'></div><div id='success'></div>";
	cell_text += middle;
	cell_text += "</div>";
	return cell_text;
}

function register_wrapper_snippet(middle) {
	return _wrapper_snippet(middle, register_tab_snippet());
}

function settings_wrapper_snippet(middle) {
	return _wrapper_snippet(middle, settings_tab_snippet());
}

function _wrapper_snippet(middle, tab_snippet) {
	/*
	 * @param middle: html string to insert below tab_snippet and success, error, messages
	 * 
	 */
	var cell_text = "<div id='thin_column'>" + tab_snippet;
	cell_text += "<div id='messages'></div><div id='errors'></div><div id='success'></div>";
	cell_text += middle;
	cell_text += "</div>";
	return cell_text;
}

function twitter_account_middle() {
	return "" +
	"<form name='account_form' onSubmit='return false'>" +

	"<h3>Procrasdonate uses your Twitter account.</h3>" +
	"<p style='text-align: left;'>Click <a href='https://twitter.com/signup'>HERE</a> if you're not on twitter yet.</p>" +
	"<p style='text-align: left;'><span id='what_is_twitter' class='link'>What is Twitter?</span></p>" +

	"<h3>Please sign in:</h3>" +
	
	"<table><tbody>" +
	"<tr><td><label class='right'>Twitter username </label></td>" +
	"<td><input class='left' type='text' name='twitter_username' value='"+GM_getValue('twitter_username','')+"'></td></tr>" +
	
	"<tr class='above_helprow'><td><label class='right'>Twitter password</label></td>" +
	"<td><input class='press_enter_for_next left' type='password' name='twitter_password' value='"+GM_getValue('twitter_password','')+"'></td></tr>" +
	"<tr class='helprow'><td></td><td><div class='help'><a href='" + constants.PRIVACY_URL + "'>Privacy Guarantee</a></div></td></tr>" +
	
	"</table></tbody>" +
	
	"<h2><a name='tos'></a>Terms of Use</h2>" +
	"<img src='"+ constants.MEDIA_URL +"img/TermsOfUse.png' class='small-image'>" +
	"<input type='checkbox'>" +
		"<p>By using our service you agree to the following:" +
		"<ul class='paragraph_list'>" +
		"<li>ProcrasDonate may update these terms of service without warning or notification." +
		"<li>You understand how our service works and are willingly participating." +
		"<li>You agree to pay all pledges made on your behalf in full." +
		"<li>A percentage that you determine of your donations is donated to our service." +
		"<li>You are responsible for any content you add to this site." +
		"<li>Illegal, unfriendly, or otherwise problematic content will be removed." +
		"<li>Your individual records and settings are private and not accessible by our company." +
		"<li>Your summary records are used for community statistics and other as yet undetermined uses (hopefully that will support the service financially)." +
		"<li>All rights are reserved including ProcrasDonate intellectual property of software and our business model." +
		"</li><li><b>Thanks for ProcrasDonating!</b>" +
		"</ul>" +
	"</p>" +	

	"</form>";
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
	
	$("#content").html( settings_wrapper_snippet(twitter_account_middle()) );
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
	$("#content").html(settings_wrapper_snippet(recipients_middle(user_recipients_ary, potential_recipients_ary)));
	activate_settings_tab_events();
	activate_recipients_middle(user_recipients_ary, potential_recipients_ary);
}

function insert_settings_donation_amounts() {
	/* Inserts form so that user may enter donation information */
	GM_setValue('settings_state', 'donation_amounts');
	$("#content").html( settings_wrapper_snippet(donation_amounts_middle()) );
	activate_settings_tab_events();
}

function insert_settings_site_classifications() {
	/* Inserts site classification html into page */
	GM_setValue('settings_state', 'site_classifications');
	$("#content").html(settings_wrapper_snippet(site_classifications_middle()));
	activate_settings_tab_events();
	activate_site_classifications_middle();
}

function insert_settings_support() {
	/* Inserts support ProcrasDonate info. */
	GM_setValue('settings_state', 'support');
	$("#content").html( settings_wrapper_snippet(support_middle()) );
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

function process_support(event) {
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
	var hr_per_week_goal = parseFloat($("input[name='hr_per_week_goal']").attr("value"));
	var max = 2000;
	if ( cents > 0 && cents < max ) {
		return true
	}
	if ( cents >= max ) {
		var confirm_results = confirm("Do you really want to donate " + cents + "&cent; every hour you spend procrastinating up to your daily limit of " + hr_per_week_goal + "?");
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
	if ( hours > (24*7) ) { hours = (24*7); }
	if ( parseInt(hours) != hours ) { hours = hours.toFixed(2); }
	return hours
}

function validate_twitter_username_and_password(username, password) {
	return validate_string(username) && validate_string(password)
}

function validate_string(v) {
	return v && v != ''
}

function process_donation(event) {
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
		GM_setValue('cents_per_hr', clean_cents_input(cents_per_hr));
		GM_setValue('hr_per_week_goal', clean_hours_input(hr_per_week_goal));
		GM_setValue('hr_per_week_max', clean_hours_input(hr_per_week_max));
		return true;
	}
	return false;
}

function process_balance(event) {
	return true;
}

function process_site_classifications(event) {
	return true;
}

function process_recipients(event) {
	return true;
}

function process_done(event) {
	return true;
}

function process_twitter_account(event) {
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
								
								event();
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
								
								event();
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
	$("#messages").append("verifying username and password...");
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
	var next_src = constants.MEDIA_URL +"img/NextArrow.png";
	if ( GM_getValue('register_state','') == 'balance' ) {
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
	return _track_snippet('impact', constants.IMPACT_STATE_ENUM, constants.IMPACT_STATE_TAB_NAMES, false);
	//return _tab_snippet('impact', constants.IMPACT_STATE_ENUM, constants.IMPACT_STATE_TAB_NAMES);
}

function _process_before_proceeding(state_name, state_enums, processors, event) {
	return function() {
		for (var i = 0; i < state_enums.length; i += 1) {
			var tab_state = state_enums[i];
			if ( GM_getValue(state_name+"_state", "") == tab_state ) {
				var processor = processors[i];
				if ( processor(event) ) {
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

/************************** IMPACT INSERTIONS **********************************************/

function insert_register_twitter_account() {
	/* Inserts user's twitter account form into page */
	GM_setValue('register_state', 'twitter_account');
	$("#content").html( register_wrapper_snippet(twitter_account_middle()) );
	activate_register_tab_events();
	activate_twitter_account_middle();
}

function impact_sites_middle(data, show_tags) {
	var middle = "<div id='ranks'>";
	
	if (show_tags) {
		middle += "" +
			//"<fieldset class='rank_legend' style='-moz-border-radius:1em;'>" +
			"<div class='rank_legend'>" +
			"<h3>Site Classification Legend</h3>" +
			//"<legend>Legend</legend>" +
			"<label>ProcrasDonate:</label><div class='bar procrasdonate'></div	>" +
			"<label>TimeWellSpent:</label><div class='bar timewellspent'></div>" +
			"<label>Other:</label><div class='bar other'></div>" +
			"</div>" +
			//"</fieldset>" +
			"<h3>Most Visited Sites</h3>";
	} else {
		middle += "" +
			"<h3>Most Supported Recipient</h3>";
	}
	
	middle += "" +
		"<table><tbody>";
	
	var max = null;
	for (i = 0; i < data.length; i += 1) {
		if ( i == 0 ) max = data[i][1];
		middle += "<tr class='site_rank'>";
		middle += "<td class='site_name'>" + data[i][0] + "</td>";
		var bar_class = "";
		if (data[i].length > 3) {
			bar_class = data[i][3];
		}
		middle += "<td class='rank'><div class='bar " + bar_class + "' style='width:" + parseInt( ((data[i][1]+1)/max)*100.0 ) + "%'>";
		if (show_tags) {
			middle += "<div class='rank_text'>" + data[i][1] + "&nbsp;min</span>";
		} else {
			middle += "<div class='rank_text'>$" + data[i][2] + "</span>";
		}
		middle += "</div></td>";
		middle += "</tr>";
	}
	middle += "</tbody></table>";
	return middle
}

function activate_impact_sites_middle(has_tags) {
	$(".site_rank .rank_text").hide();
	$(".site_rank .bar").hover(
		function() {
			$(this).children().show();
		},
		function() {
			$(this).children().hide();
		}
	);
}

function insert_impact_sites() {
	/* insert sites chart */
	GM_setValue('impact_state', 'sites');
	var sort_arr = [
		['www.ycombinator.com', 120, 200, 'timewellspent'],
		['bilumi.org', 100, 100, 'procrasdonate'],
		['gmail.com', 45, 75, 'timewellspent'],
		['www.slashdot.com', 30, 50, 'other'],
		['www.javascriptkit.com', 30, 50, 'other'],
		['news.ycombinator.com', 2, 2, 'timewellspent'],
		['hulu.com', 1, 1, 'procrasdonate'],
	];
	$("#content").html( impact_wrapper_snippet(impact_sites_middle(sort_arr, true)) );
	activate_impact_tab_events();
	activate_impact_sites_middle();
}

function insert_impact_recipients() {
	/* insert sites chart */
	GM_setValue('impact_state', 'recipients');
	var sort_arr = [
		['bilumi', 120, 200],
		['miller', 100, 100],
		['pd', 45, 75],
	];
	$("#content").html( impact_wrapper_snippet(impact_sites_middle(sort_arr, false)) );
	activate_impact_tab_events();
	activate_impact_sites_middle();
}

function insert_impact_goals() {
	/* Inserts weekly progress towards donation goals and max */
	GM_setValue('impact_state', 'goals');
	
	var middle = "<div id='goals_chart' style='width:100%;height:25em;'></div>";
	$("#content").html( impact_wrapper_snippet(middle) );
	activate_impact_tab_events();
	
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
		//GM_log("   past: "+d);
	}
	days.push(today);
	var d2 = new Date(today);
	d2.setHours(d2.getHours()-offset_days_offset);
	offset_days.push(d2);
	//GM_log("   today: "+today);
	for (var i = today.getDay()+1; i < 7; i++) {
		var d = new Date();
		d.setHours(24 * (i-today.getDay()) - offset,0,0,0);
		days.push(d);
		var d2 = new Date(d);
		d2.setHours(d2.getHours()-offset_days_offset);
		offset_days.push(d2);
		//GM_log("   future: "+d);
	}
	
	var start_time = new Date(days[0]);
	start_time.setHours(start_time.getHours()-12);
	var end_time = new Date(days[6]);
	end_time.setHours(end_time.getHours()+12);
	var g = GM_getValue('hr_per_week_goal',22);
	var goal = [ [start_time, g], [end_time, g] ];
	var m = GM_getValue('hr_per_week_max',22);
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
	GM_log("DATA: "+data);
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
