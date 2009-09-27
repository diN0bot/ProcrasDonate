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
});
