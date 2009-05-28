
var API = function(contentWindow, chromeWindow) {
	this.contentWindow = contentWindow;
	this.chromeWindow = chromeWindow;
};
API.prototype = {};
_extend(API.prototype, {
	make_request: function(url, data, method, onload, onerror) {
		var options = {
			url: url,
			data: data,
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
