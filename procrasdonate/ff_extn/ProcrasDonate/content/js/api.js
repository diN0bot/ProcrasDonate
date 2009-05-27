
var API = function() {};
API.prototype = {};
_extend(API.prototype, {
	make_request: function() {
		
	},
});

// PD_API
// * handles interaction with ProcrasDonate.com
var ProcrasDonate_API = function() {
	
};

ProcrasDonate_API.prototype = new API;
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
