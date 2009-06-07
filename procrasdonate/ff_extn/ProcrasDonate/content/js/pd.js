
// PD_API
// * handles interaction with ProcrasDonate.com
var ProcrasDonate_API = function(prefs, pddb) {
	this.prefs = prefs;
	this.pddb = pddb;
	//API.apply(this, arguments);
};

ProcrasDonate_API.prototype = new API();
_extend(ProcrasDonate_API.prototype, {
	
	send_new_totals: function(pddb) {
		// 2. Send all new Totals to PD: more recent time than 'last_total_time_sent_to_pd'
		var self = this;
		var totals = [];
		var time = this.prefs.get('last_total_time_sent_to_pd', 0);
		var new_last_time = time;
		logger("pd.js::send_new_totals: time="+time);
		this.pddb.Total.select({
			timetype_id: self.pddb.Daily.id,
			time__gte: time
		}, function(row) {
			if (parseInt(row.time) > new_last_time) { new_last_time = parseInt(row.time) ; }
			var contenttype = self.pddb.ContentType.get_or_null({ id: row.contenttype_id });
			var recipient = null;
			var recipient_category = null;
			var site = null;
			var site_sitegroup = null;
			var site_tag = null;
			var sitegroup = null;
			var sitegroup_tag = null;
			var tag = null;
			if (contenttype.modelname == "Site") {
				site = self.pddb.Site.get_or_null({ id: row.content_id });
				site_sitegroup = self.pddb.SiteGroup.get_or_null({ id: site.sitegroup_id });
				site_tag = self.pddb.Tag.get_or_null({ id: site_sitegroup.tag_id });
			} else if (contenttype.modelname == "Recipient") {
				recipient = self.pddb.Recipient.get_or_null({ id: row.content_id });
				recipient_category = self.pddb.Category.get_or_null({ id: recipient.category_id });
			} else if (contenttype.modelname == "SiteGroup") {
				sitegroup = self.pddb.SiteGroup.get_or_null({ id: row.content_id });
				sitegroup_tag = self.pddb.Tag.get_or_null({ id: sitegroup.tag_id });
			} else if (contenttype.modelname == "Tag") {
				tag = self.pddb.Tag.get_or_null({ id: row.content_id });
				if (tag.tag == "ProcrasDonate") {
					pd_tag_total = row;
				} else if (tag.tag == "TimeWellSpent") {
					tws_tag_total = row;
				}
			}
			var total_data = {
				total_time: row.total_time,
				total_amount: row.total_amount,
				time: row.time
			};
			if (recipient) {
				var category = "Uncategorized";
				if (recipient_category) {
					category = recipient_category.category;
				}
				total_data.recipient = {
					twitter_name: recipient.twitter_name,
					url: recipient.url,
					name: recipient.name,
					mission: recipient.mission,
					description: recipient.description,
					category: category
				}
			}
			else if (site) {
				total_data.site = {
						url: site.url,
						url_re: site_sitegroup.url_re,
						name: site_sitegroup.name,
						host: site_sitegroup.host,
						tag: site_tag.tag
					}
			} else if (sitegroup) {
				total_data.sitegroup = {
					url_re: sitegroup.url_re,
					name: sitegroup.name,
					host: sitegroup.host,
					tag: sitegroup_tag.tag
				}
			} else if (tag) {
				total_data.tag = {
					tag: tag.tag
				}
			}
			totals.push(total_data);
		});
		
		var url = constants.PD_URL + constants.POST_TOTALS_URL;
		logger("HASH: "+this.prefs.get('hash', constants.DEFAULT_HASH));
		this._post_data(url,
		{
			hash: this.prefs.get('hash', constants.DEFAULT_HASH),
			totals: totals
		}, function(r) {
			logger("pd.js::_post_dataSuccessfully posted totals to ProcrasDonate r="+r);
			var str = "";
			for (var p in r) { str += p+"="+r[p] +" "; }
			logger("pd.js::_post_data r="+str);
		});
		
		this.prefs.set('last_total_time_sent_to_pd', new_last_time);
	},
	
	send_new_paid_pledges: function() {
		// 4. Send newly paid pledges to PD: 'last_paid_tipjoy_id_sent_to_pd' to 'last_paid_tipjoy_id'
		//constants.POST_PAYMENTS_URL 
	},
	
	/*
	 * Posts anonymous information to procrasdonate server for community page
	 * tracking
	 * @param totals: { totals:<array of total dicts>, hash:<> }
	 * @param domain: constants.PD_URL
	 */
	_post_data: function(url, data, onload) {
		// serialize into json
		var json_data = JSON.stringify(data);
		
		// make request
		this.make_request(
			url,
			{data: json_data},
			"POST",
			onload
		);
	},

});
