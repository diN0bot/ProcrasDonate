
// TipJoy_API
// * handles interaction with TipJoy.com
var TipJoy_API = function(prefs, pddb) {
	this.prefs = prefs;
	this.pddb = pddb;
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
	check_exists: function(username, onload, onerror) {
		logger(" about to check_exists from tipjoy api. username="+username);
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
	check_balance: function(username, password, onload, onerror) {
		this.make_request(
			"http://tipjoy.com/api/user/balance/",
			{ twitter_username: username, twitter_password: password },
			"GET",
			onload,
			onerror
		);
	},
	
	send_new_payments: function() {
		var self = this;
		// 1. Send all new Payments to TJ: no tipjoy id
		this.Payment.select({
			tipjoy_transaction_id: 0,
		}, function(row) {
			var total = self.pddb.Total.get_or_null({ id: row.total_id });
			self._make_payment(total, row);
		});
	},
	
	update_pledges: function(pddb) {
		// 3. Ask TJ for newly paid transactions: 
		//    ask for xactions since 'last_paid_tipjoy_id_sent_to_pd', iterate until pledges
		
	},
	
	_make_payment: function(total, payment) {
		var self = this;
		var reason = this.prefs.get('timewellspent_reason', '');
		try {
			// this should work if payment is for a tag-content total,
			// which currently it should be...
			self.pddb.Tag.get_or_null({
				id: total.content_id
			}, function(row) {
				if (row.tag == "ProcrasDonate") {
					reason = this.prefs.get('procrasdonate_reason', '');
				}
			});
		} catch(e) {
		}
		// pay @ProcrasDonate via TipJoy
		this._make_payment_request(
			total.total_amount,
			reason,
			function(r) {
				var response = eval("("+r.responseText+")");
				if ( response.result == "success" ) {
					self._payment_success(total, payment, response);
				} else {
					logger(" Tried to make payment through TipJoy... failed because: "+response.reason);
					logger("    payment="+payment);
					logger("    total="+total);
				}
			}
		);
	},
		
	_payment_success: function(total, payment, response) {
		var is_loan = False;
		var tipjoy_transaction_id = "";
		var fallover_is_loan = False;
		var fallover_tipjoy_transaction_id = "";
		
		if (response.transaction_ids.length > 0) {
			// will report isLoan when payment is split between paid and unpaid transactions
			var is_pledge = False;
			if ( response.isLoan || response.transaction_ids.length > 1 ) {
				is_pledge = True;
			}
			this.pddb.Payment.set({
				tipjoy_transaction_id: response.transaction_ids[0],
				is_pledge: is_pledge 
			}, {
				id: payment.id
			});
		}
		if (response.transaction_ids.length > 1) {
			this.pddb.Payment.create({
				tipjoy_transaction_id: response.transaction_ids[1],
				is_pledge: True
			});
		}	
	},
	
	
	/* Makes payment via TipJoy.
	 * @param amt: amount in cents
	 * @param reason: TipJoy comment on what payment is for
	 * 	eg: "ProcrasDonating for a good cause"
	 *      "TimeWellSpent for a good cause"
	 */
	_make_payment_request: function(amt, reason, onload, onerror) {
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
	}

});
