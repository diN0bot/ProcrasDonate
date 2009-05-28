
// TipJoy_API
// * handles interaction with TipJoy.com
var TipJoy_API = function(prefs) {
	this.prefs = prefs;
};

TipJoy_API.prototype = new API();
_extend(TipJoy_API.prototype, {
	
	/*
	 * Creates TipJoy account. Not sure what happens if user already exists.
	 */
	create_account: function(username, password, onload, onerror) {
		var params = { twitter_username: username, twitter_password: password }
		this.make_request(
			"http://tipjoy.com/api/createTwitterAccount/",
			params,
			"POST",
			onload,
			onerror
		);
	},
	
	/*
	 * Checks whether user's twitter credentials match a user account on TipJoy.
	 * If so, returns TipJoy user information.
	 */
	check_exists: function(onload, onerror) {
		var username = this.prefs.get('twitter_username', '')
		this.make_request(
			"http://tipjoy.com/api/user/exists/",
			{ twitter_username: username },
			"GET",
			onload,
			onerror
		);
	},
	
	/* 
	 * Determines user's current TipJoy balance
	 */
	check_balance: function(onload, onerror) {
		var username = this.prefs.get('twitter_username', '')
		var password = this.prefs.get('twitter_password', '')
		this.make_request(
			"http://tipjoy.com/api/user/balance/",
			{ twitter_username: username, twitter_password: password },
			"GET",
			onload,
			onerror
		);
	},
	
	/* Makes payment via TipJoy.
	 * @param amt: amount in cents
	 * @param reason: TipJoy comment on what payment is for
	 * 	eg: "ProcrasDonating for a good cause"
	 *      "TimeWellSpent for a good cause"
	 */
	make_payment: function(amt, reason, onload, onerror) {
		//var text = "p " + amt + "¢ @" + this.prefs.get('recipient') + " " + escape(reason);
		var text = "p " + amt + "¢ @ProcrasDonate " + escape(reason);
		var username = this.prefs.get('twitter_username', '')
		var password = this.prefs.get('twitter_password', '')
		//var params = "twitter_username=" + username + "&twitter_password=" + password + "&text=" + text;
		var params = {
			twitter_username: username,
			twitter_password: password,
			text: text };
		this.make_request(
			'http://tipjoy.com/api/tweetpayment/',
			params,
			'POST',
			onload,
			onerror
		);
	},
	
});