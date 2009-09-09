
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
		
		var data = [];
		this.pddb[KlassName].select(selectors, function(row) {
			if (parseInt(row.datetime) > new_last_time) { new_last_time = parseInt(row.datetime) ; }
			data.push(extract_data(row));
		});
		
		var url = constants.PD_URL + constants.SEND_DATA_URL;
		this._hello_operator_give_me_procrasdonate(
			url,
			{
				hash: this.prefs.get('hash', constants.DEFAULT_HASH),
				data: data,
				data_type: KlassName
			},
			"POST",
			function(r) { //onsuccess
				logger("server says successfully processed "+r.process_success_count+" items");
			},
			function(r) { //onfailure
				logger("server says receiving data failed because "+r.reason);
			},
			function(r) { //onerror
				logger("communication error");
			});
			
		this.prefs.set('time_last_sent_'+KlassName, new_last_time);
	},

	send_user_studies: function() {
		this._send_data("UserStudy", function(row) {
			return {
				datetime: _date_to_http_format( _un_dbify_date( row.datetime ) ),
				type: row.type,
				message: row.message,
				quant: row.data
			}
		});
	},
	
	send_logs: function() {
		this._send_data("Log", function(row) {
			return {
				datetime: _date_to_http_format( _un_dbify_date( row.datetime ) ),
				type: row.type,
				message: row.message,
				detail_type: row.detail_type
			}
		});
	},
	
	send_payments: function() {
		this._send_data("Payment", function(row) {
			var payment_service = self.pddb.PaymentService.get_or_null({ id: row.payment_service_id });
			return {
				datetime: _date_to_http_format( _un_dbify_date( row.datetime ) ),
				sent_to_service: _un_dbify_bool(row.sent_to_service),
				settled: _un_dbify_bool(row.settled),
				total_amount_paid: total_amount_paid,
				amount_paid_in_fees: amount_paid_in_fees,
				amount_paid_tax_deductibly: amount_paid_tax_deductibly,
				payment_id: payment_id,
				payment_service_name: payment_service.name
			}
		});
	},
	
	send_totals: function() {
		var self = this;
		this._send_data("Total", function(row) {
			return row.deep_dict();
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
