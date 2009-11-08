
// PD_API
// * handles interaction with ProcrasDonate.com
var ProcrasDonate_API = function(prefs, pddb) {
	this.prefs = prefs;
	this.pddb = pddb;
	//API.apply(this, arguments);
};

ProcrasDonate_API.prototype = new API();
_extend(ProcrasDonate_API.prototype, {
	/*
	 * 
	 * 
	 */
	
	send_data: function() {
	//#@TODO - send email, tos, weekly_affirmations, org_thank_yous, org_newsletters prefs
	//        always, or triggered by send_data parameter when register_updates processor calls send_data?
		var self = this;
		var models_to_methods = {
			"Total": "_get_totals",
		    "UserStudy": "_get_user_studies",
            "Log": "_get_logs",
            "Payment": "_get_payments",
            "RequiresPayment": "_get_requires_payments"
		};
		
		var data = {
			hash: this.prefs.get('hash', constants.DEFAULT_HASH)
		}
		
		_iterate(models_to_methods, function(key, value, index) {
			var items = self[value]();
			data[self.pddb[key].table_name] = JSON.stringify(items);
		});
		
		var url = constants.PD_URL + constants.SEND_DATA_URL;
		logger("pd.js:: send_data: ");
		_pprint(data.totals[0]);
		_pprint(data.totals[0].content);
		this._hello_operator_give_me_procrasdonate(
			url,
			data,
			"POST",
			function(r) { //onsuccess
				logger("pd.js::send_data: server says successfully processed "+r.process_success_count+" items");
			},
			function(r) { //onfailure
				logger("pd.js::send_data: server says receiving data failed because "+r.reason);
			},
			function(r) { //onerror
				logger("pd.js::send_data: communication error");
			}
		);
	},

	/*
	 * 
	 * @requires: KlassName must have a datetime field
	 * 
	 * @param KlassName: eg UserStudy, Payment, Total, Log
	 * @param selectors: eg { datetime__gte: last_time }
	 * @param extract=data: function that takes a row and returns a dictionary representation
	 */
	_get_data: function(KlassName, extract_data, extra_selectors) {
		var last_time = this.prefs.get('time_last_sent_'+KlassName, 0);
		var new_last_time = last_time;
	
		var selectors = _extend({
			datetime__gte: last_time
		}, extra_selectors);
		
		var data = [];
		this.pddb[KlassName].select(selectors, function(row) {
			if (parseInt(row.datetime) > new_last_time) { new_last_time = parseInt(row.datetime) ; }
			data.push(extract_data(row));
		});
		
		return data;
	},
	
	_get_user_studies: function() {
		return this._get_data("UserStudy", function(row) {
			logger(" inside send_user_stuides row="+row+" deepdict="+row.deep_dict());
			return row.deep_dict();
		});
	},
	
	_get_logs: function() {
		return this._get_data("Log", function(row) {
			return row.deep_dict();
		});
	},
	
	_get_payments: function() {
		return this._get_data("Payment", function(row) {
			return row.deep_dict();
		});
	},
	
	_get_requires_payments: function() {
		var data = [];
		this.pddb.RequiresPayment.select({}, function(row) {
			data.push( row.deep_dict() );
		});
		return data;
	},
	
	_get_totals: function() {
		return this._get_data("Total", function(row) {
			return row.deep_dict();
		}, {
			timetype_id: this.pddb.Daily.id
		});
	},

	/*
	 * 
	 * @requires: KlassName must have a datetime field
	 * 
	 * @param KlassName: eg UserStudy, Payment, Total, Log
	 * @param selectors: eg { datetime__gte: last_time }
	 * @param extract=data: function that takes a row and returns a dictionary representation
	 */
	_send_data: function(KlassName, extract_data, extra_selectors) {
		var last_time = this.prefs.get('time_last_sent_'+KlassName, 0);
		var new_last_time = last_time;
	
		var selectors = _extend({
			datetime__gte: last_time
		}, extra_selectors);
		
		var items = [];
		this.pddb[KlassName].select(selectors, function(row) {
			if (parseInt(row.datetime) > new_last_time) { new_last_time = parseInt(row.datetime) ; }
			items.push(extract_data(row));
		});
		
		var data = {
			hash: this.prefs.get('hash', constants.DEFAULT_HASH)
		};
		data[this.pddb[KlassName].table_name] = items;
		
		// serialize into json
		var json_data = JSON.stringify(data);
		
		var url = constants.PD_URL + constants.SEND_DATA_URL;
		this._hello_operator_give_me_procrasdonate(
			url,
			{"json_data": json_data}, // must be dictionary, not json string
			"POST",
			function(response) { //onsuccess
				logger("pd.js::_send_data server says successfully processed "+response.process_success_count+" items");
			},
			function(response) { //onfailure
				logger("pd.js::_send_data server says receiving data failed because "+response.reason);
			},
			function(r) { //onerror
				logger("pd.js::_send_data communication error");
			});
			
		this.prefs.set('time_last_sent_'+KlassName, new_last_time);
	},

	send_user_studies: function() {
		this._send_data("UserStudy", function(row) {
			return row.deep_dict();
		});
	},
	
	send_logs: function() {
		this._send_data("Log", function(row) {
			return row.deep_dict();
		});
	},
	
	send_payments: function() {
		this._send_data("Payment", function(row) {
			return row.deep_dict();
		});
	},
	
	send_requires_payments: function() {
		this._send_data("RequiresPayment", function(row) {
			return row.deep_dict();
		});
	},
	
	send_totals: function() {
		var self = this;
		this._send_data("Total", function(row) {
			return row.deep_dict();
		}, {
			timetype_id: self.pddb.Daily.id
		});
	},
	
	authorize_payments: function(onsuccess, onfailure, onerror) {
		var self = this;
		
		var data = {
			hash: this.prefs.get('hash', constants.DEFAULT_HASH),
			globalAmountLimit: this.prefs.get('global_amount_limit', constants.DEFAULT_GLOBAL_AMOUNT_LIMIT),
            creditLimit: this.prefs.get('credit_limit', constants.DEFAULT_CREDIT_LIMIT),
            version: this.prefs.get('fps_version', constants.DEFAULT_FPS_CBUI_VERSION),
            paymentReason: this.prefs.get('payment_reason', constants.DEFAULT_PAYMENT_REASON),
		}
		
		var url = constants.PD_URL + constants.AUTHORIZE_PAYMENTS_URL;
		
		this._hello_operator_give_me_procrasdonate(
			url,
			data,
			"POST",
			onsuccess,
			onfailure,
			onerror
		);
	},
	
	make_payment: function(onload, onerror) {
	},
	
	settle_debt: function(onload, onerror) {
		// returns JSON
		constants.SETTLE_DEBT_URL = '/fps/user/payment/settle_debt/';
	},
	
	send_welcome_email: function() {
		logger("send welcome email: "+this.prefs.get('email', constants.DEFAULT_EMAIL))
		this.make_request(
			constants.PD_URL + constants.SEND_WELCOME_EMAIL_URL,
			{
				email_address: this.prefs.get('email', constants.DEFAULT_EMAIL),
				hash: this.prefs.get('hash', constants.DEFAULT_HASH),
			},
			"POST",
			function() {}
		);
	},
	
	send_regular_email: function() {
		
	},
	
    authorize_multiuse: function(caller_reference, onsuccess, onfailure) {
		var multi_auth = this.pddb.FPSMultiuseAuthorization.get_or_create({
			caller_reference: caller_reference
		}, {
			timestamp: _dbify_date(new Date()),
			global_amount_limit: this.prefs.get('fps_global_amount_limit', constants.DEFAULT_GLOBAL_AMOUNT_LIMIT),
			is_recipient_cobranding: _dbify_bool(true),
			payment_method: "ABT,ACH,CC",
			payment_reason: this.prefs.get('fps_payment_reason', constants.DEFAULT_PAYMENT_REASON),
			recipient_slug_list: "all",
			status: this.pddb.FPSMultiuseAuthorization.RESPONSE_NOT_RECEIVED
		});

		multi_auth = multi_auth.deep_dict();
		var data = _extend(multi_auth, {
			hash: this.prefs.get('hash', constants.DEFAULT_HASH),
			version: this.prefs.get('fps_version', constants.DEFAULT_FPS_CBUI_VERSION)
		});

		//this.pddb.orthogonals.info("authorize_multiuse: "+JSON.stringify(multi_auth), "pd.js");
		this._hello_operator_give_me_procrasdonate(
			constants.PD_URL + constants.AUTHORIZE_MULTIUSE_URL,
			data,
			"POST",
			onsuccess,
			onfailure
		);
	},
	
	cancel_multiuse_token: function(reason_text, after_success, after_failure) {
		// after_failure should take r as parameter. after_success takes nothing.
		var self = this;
		// find success token
		var multiuse = self.pddb.FPSMultiuseAuthorization.get_latest_success();
		if (!multiuse) {
			// nothing to cancel
			return
		}
		
		this._hello_operator_give_me_procrasdonate(
			constants.PD_URL + constants.CANCEL_MULTIUSE_TOKEN_URL,
			{
				token_id: multiuse.token_id,
				reason_text: reason_text,
				hash: this.prefs.get('hash', constants.DEFAULT_HASH),
				version: this.prefs.get('fps_version', constants.DEFAULT_FPS_API_VERSION),
				timestamp: _dbify_date(new Date())
			},
			"POST",
			function(r) {
				self.pddb.orthogonals.log("Successfully cancelled multiuse token", "multiuse token");
				
				// set token to canceleld
				self.pddb.FPSMultiuseAuthorization.set({
					token_id: "",
					status: self.pddb.FPSMultiuseAuthorization.CANCELLED,
				}, {
					id: multiuse.id
				});
				
				if (after_success) after_success();
			},
			function(r) {
				self.pddb.orthogonals.log("Failed to cancel multiuse token: "+r.reason, "multiuse token");
				if (after_failure) after_failure();
			}
		);
	},
	
	pay_multiuse: function(transaction_amount, recipient, after_success, after_failure) {
		var self = this;
		
		var multiauth = this.pddb.FPSMultiuseAuthorization.get_latest_success();
		if (!multiauth || !multiauth.token_id) {
			self.pddb.orthogonals.error("Not successfully authorized to make payments", "pay");
			return
		}
		
		var pay = this.pddb.FPSMultiusePay.create({
			timestamp: _dbify_date(new Date()),
			caller_reference: create_caller_reference(),
			//marketplace_fixed_fee: 0,
			marketplace_variable_fee: 10.00,
			transaction_amount: transaction_amount,
			recipient_slug: recipient.slug,
			sender_token_id: multiauth.token_id,
			
			transaction_status: self.pddb.FPSMultiuseAuthorization.WAITING
		});

		pay = pay.deep_dict();
		var data = _extend(pay, {
			hash: this.prefs.get('hash', constants.DEFAULT_HASH),
			version: this.prefs.get('fps_version', constants.DEFAULT_FPS_API_VERSION),
			timestamp: _dbify_date(new Date())
		});
		
		this._hello_operator_give_me_procrasdonate(
				constants.PD_URL + constants.PAY_MULTIUSE_URL,
				data,
				"POST",
				function(r) {
					self.pddb.orthogonals.log("Successfully paid "+transaction_amount, "pay");
					
					// process returned pay object
					if (r.pay) {
						self.pddb.FPSMultiusePay.process_object(r.pay);
					} else {
						logger("NO R.PAY in pd.js::pay");
					}
					
					if (after_success) after_success();
				},
				function(r) {
					self.pddb.orthogonals.log("Failed to pay "+transaction_amount+": "+r.reason, "pay");
					if (after_failure) after_failure();
				}
			);
	},
	
	make_payments: function() {
		var self = this;
		var prevent_payments = self.prefs.get('prevent_payments ', constants.DEFAULT_PREVENT_PAYMENTS);
		if (prevent_payments) {
			self.pddb.orthogonals.log("Aborted because prevent_payments flag is: "+prevent_payments, "make_payments")
			return 
		}
		
		this.pddb.RequiresPayment.select({}, function(row) {
			var total = row.total();
			var recipient = total.recipient();
			var amount = parseFloat(total.total_amount) / 100.00;
			var threshhold = self.prefs.get('payment_threshhold ', constants.DEFAULT_PAYMENT_THRESHHOLD);
			if (recipient && amount >= threshhold) {
				pay_multiuse(
						total.total_amount,
						recipient,
						function() {
							// after success
							self.pddb.RequiresPayment.del({id: row.id})
						}, function() {
							// after_failure
						});
			}
		});
	},
	
	request_data_updates: function(after_success, after_failure) {
		// after_success should take two parameters:
		//    recipients: array of recipient rows added (new since time)
		//    multi_auths: array of multi_auths (all)
		var self = this;
		var new_since = new Date();
		this._hello_operator_give_me_procrasdonate(
			constants.PD_URL + constants.RECEIVE_DATA_URL,
			{
				since: 0, // self.prefs.get('since_received_data', 0);
				hash: this.prefs.get('hash', constants.DEFAULT_HASH),
			}, //#@TODO store time in prefs
			"GET",
			function(r) {
				self.pddb.orthogonals.log("Successfully received data", "dataflow");
				
				var recipients = [];
				var multi_auths = [];
				
				_iterate(r.multiuse_auths, function(key, value, index) {
					//logger("inside iterator for multiuse_auths..."+index+". "+value);
					self.pddb.FPSMultiuseAuthorization.process_object(value);
				});
				_iterate(r.recipients, function(key, value, index) {
					//logger("NEW RECIPIENT FROM SERVER "+key+" "+value.slug);
					var r = self.pddb.Recipient.process_object(value);
					//logger("recip: "+r.slug);
				});
				self.prefs.set('since_received_data', _dbify_date(new_since));
				self.pddb.orthogonals.log("Done: "+_dbify_date(new_since), "dataflow");
				
				if (after_success) {
					after_success(recipients, multi_auths);
				}
			},
			function(r) {
				self.pddb.orthogonals.log("Failed to received data: "+r.reason, "dataflow");
				if (after_failure) after_failure();
			}
		);
	},

	/*
	 * Posts data to ProcrasDonate server
	 * @param url: url to post to 
	 * @param data: data structure. will not be JSON.stringify-ied
	 * @param onload: function to execute on success
	 * @param onerror: function to execute on error
	 */
	_hello_operator_give_me_procrasdonate: function(url, data, method, onsuccess, onfailure, onerror) {
		// make request
		this.make_request(
			url,
			data,
			method,
			function(r) {
				try {
					var response = eval("("+r.responseText+")");
					
					if (response.result == "success") {
						if (onsuccess) {
							onsuccess(response);
						}
					} else {
						if (onfailure) {
							onfailure(response);
						}
					}
				} catch (e) {
					logger("EXCEPTION: pd.js::RETURNED: "+r+"  "+e.stack);
				}
			},
			onerror
		);
	},
	
});
