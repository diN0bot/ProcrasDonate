
var API = function() {
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
		logger("api.js::make_request: data="+data);

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
		
		if (!onerror) {
			onerror = function(r) {
				var str = ""; for (var prop in r) {	str += prop + " value :" + r[prop]+ + " __ "; }
				logger("standard_onerror for url="+url+" data="+data+": "+r+"_"+str);
				// might as well try
				request.jQuery("#errors").append("Something unexpected occurred.");
			};
		}
	
		var options = {
			url: url,
			data: encoded_data,
			method: method,
			onload: onload,
			onerror: onerror
		};
		try {
			var request = new HttpRequest(window, window);
			request.contentStartRequest(options);
			//request.chromeStartRequest(url, options);
			return request;
		} catch(e) {
			logger(" HTTPREQUEST error occured in api.js "+e);
			onerror("Something unexpected happened.");
		}
	},
});
