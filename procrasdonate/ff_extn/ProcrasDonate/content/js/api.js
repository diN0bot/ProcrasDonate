
var API = function() {};
API.prototype = {};
_extend(API.prototype, {
	make_request: function() {
		
	},
});

// PD_API
// * handles interaction with ProcrasDonate.com
var ProcrasDonateAPI = function() {
	
};
ProcrasDonateAPI.prototype = new API;
_extend(ProcrasDonateAPI.prototype, {
	post_anonymous_info: function(site, duration, amount, recipient) {
		
	},
	check_exists: function() {
		
	},
};
