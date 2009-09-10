
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
			data[self.pddb[key].table_name] = items;
		});
		
		var url = constants.PD_URL + constants.SEND_DATA_URL;
		this._hello_operator_give_me_procrasdonate(
			url,
			data,
			"POST",
			function(r) { //onsuccess
				logger("server says successfully processed "+r.process_success_count+" items");
			},
			function(r) { //onfailure
				logger("server says receiving data failed because "+r.reason);
			},
			function(r) { //onerror
				logger("communication error");
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
		
		var url = constants.PD_URL + constants.SEND_DATA_URL;
		this._hello_operator_give_me_procrasdonate(
			url,
			data,
			"POST",
			function(response) { //onsuccess
				logger("server says successfully processed "+response.process_success_count+" items");
			},
			function(response) { //onfailure
				logger("server says receiving data failed because "+response.reason);
			},
			function(r) { //onerror
				logger("communication error");
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
			timetype_id: pddb.Daily.id
		});
	},
	
	make_payment: function(onload, onerror) {
	},
	
	settle_debt: function(onload, onerror) {
	},
	
	send_welcome_email: function(email_address) {
		logger("send welcome email: "+email_address)
		this.make_request(
			constants.PD_URL + constants.SEND_WELCOME_EMAIL_URL,
			{email_address: email_address},
			"POST",
			function() {}
		);
	},
	
	send_regular_email: function(email_address) {
		logger("send welcome email: "+email_address)
		this.make_request(
			constants.PD_URL + constants.SEND_REGULAR_EMAIL_URL,
			{email_address: email_address},
			"POST",
			function() {}
		);
	},
	
	request_updated_data: function(onload, onerror) {
	},

	/*
	 * Posts data to ProcrasDonate server
	 * @param url: url to post to 
	 * @param data: data structure will by JSON.stringify-ied
	 * @param onload: function to execute on success
	 * @param onerror: function to execute on error
	 */
	_hello_operator_give_me_procrasdonate: function(url, data, method, onsuccess, onfailure, onerror) {
		// serialize into json
		var json_data = JSON.stringify(data);
		// make request
		this.make_request(
			url,
			{"json_data": json_data}, // must be dictionary, not json string
			method,
			function(r) {
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
			},
			onerror
		);
	},
	
});
