///
/// Friendly dialogue for installing xpi.
///
function install(anchor_class) {
	var item = $("."+anchor_class).slice(0,1);
	var params = {
		"ProcrasDonate, a charitable incentive for good time management": {
			URL: item.attr("href"),
			IconURL: item.attr("iconURL"),
			Hash: $.trim(item.children(".hash").text()),
			toString: function() { return this.URL; }
		}
	};
	InstallTrigger.install( params );
	return false;
}

function not_ready_to_install() {
	alert("Payments through our service have been temporarily suspended because " +
			"the third party payment service we've been using has gone out of " +
			"business.\n\nWe are hard at work integrating with a new payment system.\n\n" +
			"We will release this shortly.");
	return false;
}

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
	/// 
	/// 
	/// 
	if (!browser_checked) {
		browser_checked = true;
		var ff_version = "";
		if ($.browser.mozilla) {
			browser_ok = true;
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
		if (!browser_ok || !browser_version_ok) {
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
			var explanation = ""; 
			if (browser_ok && !browser_version_ok) {
				explanation = "ProcrasDonate is happiest with Firefox <b>3.5</b>. You have version "+ff_version;
			} else if (!browser_ok) {
				var browser = "";
				if ($.browser.msie) browser = "Internet Explorer";
				else if ($.browser.safari) browser = "Safari";
				else if ($.browser.opera) browser = "Opera";
				explanation = "ProcrasDonate is an add-on specifically for the <b>Firefox</b> web browser. ";
				if (browser) {
					explanation += "ProcrasDonate won't work with your current browser, "+browser+".";
				}
			}
			$("#wrapper").prepend([
			        "<div id=\"brwoser_message\" class=\"above_layout_table\">",
			       	"<p>",
			       	explanation,
			       	"</p><ol>",
					"<li><a id=\"download_firefox\" href=\"",
					href,
					"\">Please download Firefox 3.5</a></li>",
					"<li>Then come back to <a href=\"http://ProcrasDonate.com\">ProcrasDonate.com</a> ",
					"to download this add-on</li></ol>",
					"</div>"].join("\n"));
		}
	}
});

var browser_checked = false;
var browser_ok = false;
var browser_version_ok = false;

function is_windows() { return navigator.appVersion.indexOf("Win")!=-1; }
function is_mac() { return navigator.appVersion.indexOf("Mac")!=-1; }
function is_linux() { return navigator.appVersion.indexOf("Linux")!=-1; }
function is_unix() { return navigator.appVersion.indexOf("X11")!=-1; }

