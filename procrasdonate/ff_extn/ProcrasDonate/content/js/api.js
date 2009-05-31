
var API = function(contentWindow, chromeWindow) {
	this.contentWindow = contentWindow;
	this.chromeWindow = chromeWindow;
};
API.prototype = {};
_extend(API.prototype, {
	make_request: function(url, data, method, onload, onerror) {
		var encoded_data = "";
		var remove_last = false;
		for (var prop in data) {
			encoded_data += encodeURIComponent(prop) +
				"=" +
				encodeURIComponent(data[prop]) +
				"&";
			remove_last = true;
		}
		if ( remove_last ) {
			encoded_data = encoded_data.substring(0, encoded_data.length-1);
		}

		if ( method == "GET" ) {
			url += "?" + encoded_data;
			encoded_data = "";
		}

		var headers = {
			"User-agent" : "Mozilla/4.0 (compatible) ProcrasDonate",
			"Content-length" : encoded_data.length
		}
		if ( method == 'POST' ) {
			headers["Content-type"] = "application/x-www-form-urlencoded";
		}
	
		var options = {
			url: url,
			data: encoded_data,
			method: method,
			onload: onload,
			onerror: onerror
		};
		var request = new HttpRequest(window, window);
		request.contentStartRequest(options);
		//request.chromeStartRequest(url, options);
		return request;
	},
});

// PD_API
// * handles interaction with ProcrasDonate.com
var ProcrasDonate_API = function() {
	API.apply(this, arguments);
};

ProcrasDonate_API.prototype = new API();
_extend(ProcrasDonate_API.prototype, {
	/*
	 * Posts anonymous information to procrasdonate server for community page
	 * tracking
	 */
	post_anonymous_info: function() {
		// get data from db
		
		// serialize into json
	
		// make request
	},
});
