
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
	post_anonymous_info: function(site, duration, amount, recipient) {
		
	},
});
