///
/// Instead of requiring a form action, submit directly from a drop down.
/// Adjusts GET parameters based on key and selected option value extracted from select (this).
///
function dropdown_submit(key, select) {
    var val = (select.options[select.selectedIndex].value);
    get_parameter_submit(key, val);
}

///
/// Instead of requiring a form action, submit directly from a drop down.
/// Adjusts GET parameters based on key and selected option value extracted from select (this).
///
function dropdown_submit2(key1, key2, select) {
  var val = (select.options[select.selectedIndex].value);
  get_parameter_submit2(key1, val, key2, val);
}

///
/// Instead of requiring a form action, submit directly from an input.
/// Adjusts GET parameters based on key and selected option value extracted from select (this).
///
function input_submit(key, form) {
	var val = encode(form.filter_by_name.value);
	get_parameter_submit(key, val);
}

///
/// Instead of requiring a form action, submit directly from a checkbox.
/// Adjusts GET parameters based on checkbox input (this).
///
function checkbox_submit(key, cbinput) {
	if (cbinput.checked) {
		get_parameter_submit(key, 'True');
	} else {
		location.href = remove_get_parameter(key, location.href);
	}
}

///
/// Adjust GET parameters based on key and value and submit.
///
function get_parameter_submit(key, val) {
    location.href = get_parameter_adjust(location.href, key, val);
}

///
/// Adjust GET parameters based on key and value and submit.
///
function get_parameter_submit2(key1, val1, key2, val2) {
  var s = get_parameter_adjust(location.href, key1, val1);
  location.href =  get_parameter_adjust(s, key2, val2);
}

///
/// Adjust GET parameters based on key and value --- return url do not submit
///
function get_parameter_adjust(url, key, val) {
  if (val) {
	    var new_location = url;
	    new_location = remove_get_parameter("page", new_location);
	    if (val.indexOf("none") > -1) { new_location = remove_get_parameter(key, new_location); }
	    else {
	    	if (new_location.indexOf(key) > -1)
		    	{ new_location = remove_get_parameter(key, new_location); }
  		if (new_location.indexOf("?") > -1)
	    		{ new_location = new_location + "&" + key + "=" + val; }
	    	else
		    	{ new_location = new_location + "?" + key + "=" + val; }
	    }
	    return new_location
	} else {
		return url
	}
}

///
/// Return location.href with GET parameter matching key removed
///
function remove_get_parameter(key, loc) {
	if (!loc) { loc = location.href; }
	two_parts = loc.split("?");
	// two_parts = /Main/foo, key=val&k2=v2
	if (two_parts.length > 1) {
		params = two_parts[1].split("&");
		new_params = "";
		for (i=0; i < params.length; i++) {
			kv = params[i].split("=");
			if (kv[0].indexOf(key) == -1) {
				if (new_params != "") new_params += "&";
				new_params += params[i];
			}
		}
		if (new_params.length > 0) {
			return two_parts[0] + "?" + new_params;
		} else {
			return two_parts[0];
		}
	} else {
		return loc;
	}
}
