
$(document).ready( function() {
	
	///
	/// Charts
	///
	//$.plot($("#placeholder"), data, options);

	
	///
	/// Automatic hover on username input field if there is one.
	/// If there isn't one, then automatic hover on zipcode or theme name.
	///
	$("#comment_textarea").focus();
	
	///
	/// Increase the size of all input text boxes
	///
	$(".organizer_form input[type=text]").attr("size", 46);
	$(".formset_table input[type=text]").attr("size", 80);
	$(".formset_table textarea").attr("cols", 80);
	
	///
	/// On organizer registration track, we want next and prev
	/// buttons to submit the form and then load the correct page.
	///
	$(".next").click(function() {
		return _next_prev_helper("next");
	});
	$(".prev").click(function() {
		return _next_prev_helper("prev");
	});
	function _next_prev_helper(direction) {
		var form = $(".organizer_form");
		if (form.length) {
			form.append("<input type=\"hidden\" name=\"arrow_direction\" value=\""+direction+"\" />");
			form.submit();
			return false
		} else {
			return true
		}
	}
	
	///
	/// close download "allow" helper box
	///
	$("#download_allow_helper_close").click( function() {
		$(this).parent().hide();
	});
	
	///
	/// helper for inserting email. single place to alter email; safe from spammers.
	///
	$(".insert_procrasdonate_email").each(function() {
		$(this).attr("href", "mailto:info@procrasdonate.com");
		if (!$(this).text()) {
			$(this).text("info@ProcrasDonate.com");
		}
	});

	/// move StartButtonDiv below banner on home page
	var banner = $("#TheBanner");
	var startnow = $("#StartButtonDiv");
	if (banner.length && startnow.length) {
		//var bannerclone = banner.clone();
		//startnow.before(bannerclone);
		//banner.remove();
		var startnowclone = startnow.clone();
		banner.after(startnowclone);
		startnow.remove();
	}
	
	var current_browser = $("#current_browser");
	if (current_browser.length) {
		var browser_info = get_browser_info();
		current_browser.text(browser_info.browser);
	}
	
	// see notes in css
	//$("#wrapper").prepend("<div id=\"large_video\"></div>");
	//$("#large_video").prepend("<div id=\"inside\"></div>");
	//$("#large_video #inside").prepend("<img src=\"/procrasdonate_media/img/FireWall.png\">");
	//$("#content").prepend("<div id=\"large_video_floatifier\"></div>");
	
	// click on homepage's charity icon to play charity's video
	$(".charity_logo").click(function() {
		var video_src = $(this).siblings(".charity_video_src").text();
		var name = $(this).siblings(".charity_name").text();
		var url = $(this).siblings(".charity_url").text();
		var mission = $(this).siblings(".charity_mission").text();
		var logo = $(this).attr("src");
		
		if (video_src) {
			var html = [];
			if (video_src == "__ProcrasDonate__") {
				html = [
				"<object width=\"444\" height=\"333\">",
					"<param name=\"movie\" value=\"/procrasdonate_media/swf/LaptopIntro.swf\" />",
					"<param name=\"allowFullScreen\" value=\"true\" />",
					"<param name=\"allowscriptaccess\" value=\"always\" />",
					"<embed",
						"src=\"/procrasdonate_media/swf/LaptopIntro.swf\"",
						"type=\"application/x-shockwave-flash\"",
						"allowscriptaccess=\"always\"",
						"allowfullscreen=\"true\"",
						"width=\"444\"",
						"height=\"300\" />",
				"</object>"];
				
				$("#focus_slogan_line2").removeClass("special_line2").children("h1").text("Make a Donation.");
				$("#below_big_video").hide();
			} else {
				html = [
				"<object width=\"444\" height=\"333\">",
					"<param name=\"movie\" value=\""+video_src+"\" />",
					"<param name=\"allowFullScreen\" value=\"true\" />",
					"<param name=\"allowscriptaccess\" value=\"always\" />",
					"<embed ",
						" src=\""+video_src+"&autoplay=1\"",
						" type=\"application/x-shockwave-flash\"",
						/*" autoplay=\"true\"",*/
						" allowscriptaccess=\"always\"",
						" allowfullscreen=\"true\"",
						" width=\"444\"",
						" height=\"300\" />",
				"</object>"];
				
				$("#focus_slogan_line2").addClass("special_line2").children("h1").text("Donate to "+name);
				$("#below_big_video").show();
			}
			$("#big_video").html("Loading video...");
			$("#big_video").html(html.join("\n"));
			
			// replace charity logo with big video data (starts out as procrasdonate...)
			var video_url = $("#below_big_video .video_charity_name a").attr("href");
			var video_name = $("#below_big_video .video_charity_name a").text();
			var video_mission = $("#below_big_video .video_charity_mission").text();
			var video_logo = $("#below_big_video .video_charity_logo").attr("src");
			var video_video = $("#below_big_video .video_charity_video").text();
			
			$(this).siblings(".charity_video_src").text(video_video);
			$(this).siblings(".charity_name").text(video_name);
			$(this).siblings(".charity_url").text(video_url);
			$(this).siblings(".charity_mission").text(video_mission);
			$(this).attr("src", video_logo);
		}
		
		$("#below_big_video .video_charity_name a").attr("href", url);
		$("#below_big_video .video_charity_name a").text(name);
		$("#below_big_video .video_charity_mission").text(mission);
		$("#below_big_video .video_charity_logo").attr("src", logo);
		$("#below_big_video .video_charity_video").text(video_src);
	});

});

function is_windows() { return navigator.appVersion.indexOf("Win")!=-1; }
function is_mac() { return navigator.appVersion.indexOf("Mac")!=-1; }
function is_linux() { return navigator.appVersion.indexOf("Linux")!=-1; }
function is_unix() { return navigator.appVersion.indexOf("X11")!=-1; }

///
/// Friendly dialogue for installing xpi.
///
function install(anchor_class) {
	var browser_info = get_browser_info();
	if (!browser_info.browser_ok) {
		var href = "";
		if (is_windows()) {
			href = "http://download.mozilla.org/?product=firefox-3.5.3&os=win&lang=en-US";
		} else if (is_mac()) {
			href = "http://download.mozilla.org/?product=firefox-3.5.3&os=osx&lang=en-US";
		} else if (is_linux()) {
			href = "http://download.mozilla.org/?product=firefox-3.5.3&os=linux&lang=en-US";
		} else {
			href = "http://releases.mozilla.org/pub/mozilla.org/firefox/releases/3.5.3/contrib/";
		}
		
		location.href = "/incompatible_browser/"
		return false
		
	} else {
		// NOT READY FOR INSTALL YET
		//return not_ready_to_install();

		// when ready, comment above line so that the following code is used.
		var item = $("."+anchor_class).slice(0,1);
		var xpi_url = item.attr("href");
		var xpi_hash = $.trim(item.children(".hash").text());
		
		// get recipient slug if on recipient page
		// /bilumi/ --> ["", "bilumi", ""]
		// /r/bilumi/ --> ["", "r", "bilumi", ""]
		// /splash/ --> ["", "splash", ""]
		// /after_install/0.4.0/ --> ["", "after_install", "0.4.0", ""]
		var cur_url = location.pathname.split("/");
		var slug = "__none__";
		if (cur_url.length > 1) {
			slug = $.trim(cur_url[1]);
			if (slug == "r" && cur_url.length > 2) {
				slug = $.trim(cur_url[2]);
			}
		}
		if (!slug) { slug = "__none__"; }
		$.post("/generate_xpi/"+slug+"/",
				{},
				function(data) {
					//s = "";
					//for (var k in data) { s += k+"="+data[k]+"\n"; }
					//alert(s);
					if (data && !data.wait_list) {
						if (data.xpi_url && data.xpi_hash) {
							xpi_url = data.xpi_url;
							xpi_hash = data.xpi_hash;
							var params = {
								"ProcrasDonate, a charitable incentive for good time management": {
									URL: xpi_url,
									IconURL: "/procrasdonate_media/img/ToolbarImages/ProcrasDonateIcon.png",
									Hash: xpi_hash,
									toString: function() { return "ProcrasDonate Add-On For Proud ProcrasDonators!" }
								}
							};
							InstallTrigger.install( params );
							$("#download_allow_helper").show();
						} else {
							alert("Problem occured while downloading ProcrasDonate.");
						}
					} else {
						location.href = data.wait_list_url + "?group=" + location.pathname;
					}
				},
				"json");
		return false
	}
}

/**
 * Called by extensions so that user's can pull upgrade rather than waiting for Firefox
 * 
 * @param link
 * @param hash
 * @return
 */
function upgrade(link, hash) {
	var params = {
		"ProcrasDonate, a charitable incentive for good time management": {
			URL: link,
			IconURL: "/procrasdonate_media/img/ToolbarImages/ProcrasDonateIcon.png",
			Hash: hash,
			toString: function() { return "ProcrasDonate Add-On For Proud ProcrasDonators!" }
		}
	};
	InstallTrigger.install( params );
}

function not_ready_to_install() {
    alert("Our service is currently open to select charities only.\n\nPlease email us at info@ProcrasDonate.com if you represent a U.S. charity or if you'd like to be alerted of our upcoming public release (it should be available before the end of 2009).\n\nThanks!");

	return false;
}
function is_chrome() {
 return navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
}

function get_browser_info() {
	var browser_ok = false;
	var browser = "ummm...you sure are special...";
	var ff_version_ok = false;
	var ff_version = "Unknown";
	
	if ($.browser.mozilla) {
		browser_ok = true;
		browser = "Firefox";
		var v = $.browser.version.split(".");
		if (v[0] >= 1 && v[1] >= 9 && v[2] >= 1) {
			// FF 3.5 uses gecko 1.9.1
			// good. all is up to date....or futuristic
			browser_version_ok = true;
			ff_version = "3.5";
		} else if (v[0] >= 1 && v[1] >= 9 && v[2] >= 0) {
			// FF 3.0 uses gecko 1.9.0
			ff_version = "3.0";
		} else {
			ff_version = "old";
		}
	}
	if (!browser_ok) {
		if ($.browser.msie) { browser = "Internet Explorer";
		} else if ($.browser.safari) {
			if (is_chrome()) {
				browser = "Chrome";
			} else {
				browser = "Safari";
			}
		} else if ($.browser.opera) { browser = "Opera"; }
	}
	return {
		browser_ok: browser_ok,
		browser: browser,
		ff_version_ok: ff_version_ok,
		ff_version: ff_version
	}
}
