
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
/*
ProcrasDonate_API.prototype = new API;
_extend(ProcrasDonateAPI.prototype, {
	post_anonymous_info: function(site, duration, amount, recipient) {
		
	},
};

error reported: Missing ) after argument list
so changed to mirror tipjoy.js:
*/
ProcrasDonate_API.prototype = {
	post_anonymous_info: function(site, duration, amount, recipient) {
	
	},
}