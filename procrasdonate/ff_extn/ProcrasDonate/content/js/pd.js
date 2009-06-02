
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
		// 2. Send all new Totals to PD: more recent time than 'last_total_time_send_to_pd'
		var self = this;
		var totals = [];
		var time = this.prefs.get('last_total_time_send_to_pd', '0');
		this.pddb.Total.select({
			timetype_id: self.pddb.Daily.id,
			time__gte: time
		}, function(row) {
			var contenttype = self.pddb.ContentType.get_or_null({ id: row.contenttype_id });
			var recipient = null;
			var recipient_category = null;
			var site = null;
			var site_sitegroup = null;
			var sitegroup = null;
			var tag = null;
			if (contenttype.modelname == "Site") {
				site = self.pddb.Site.get_or_null({ id: row.content_id });
				site_sitegroup = self.pddb.SiteGroup.get_or_null({ id: site.sitegroup_id });
			} else if (contenttype.modelname == "Recipient") {
				recipient = self.pddb.Recipient.get_or_null({ id: row.content_id });
				recipient_category = self.pddb.Category.get_or_null({ id: recipient.category_id });
			} else if (contenttype.modelname == "SiteGroup") {
				sitegroup = self.pddb.SiteGroup.get_or_null({ id: row.content_id });
			} else if (contenttype.modelname == "Tag") {
				tag = self.pddb.Tag.get_or_null({ id: row.content_id });
				if (tag.tag == "ProcrasDonate") {
					pd_tag_total = row;
				} else if (tag.tag == "TimeWellSpent") {
					tws_tag_total = row;
				}
			}
			totals.push({
				total: row,
				recipient: recipient,
				recipient_category: recipient_category,
				site: site,
				site_sitegroup: site_sitegroup,
				sitegroup: sitegroup,
				tag: tag
			});
		});
		
		this._post_data({
			hash: this.prefs.get('hash', constants.HASH_DEFAULT),
			totals: totals
		}, function(r) {
			logger("Successfully posted totals to ProcrasDonate");
		});
	},
	
	send_new_paid_pledges: function(pddb) {
		// 4. Send newly paid pledges to PD: 'last_paid_tipjoy_id_sent_to_pd' to 'last_paid_tipjoy_id'
		
	},
	
	/*
	 * Posts anonymous information to procrasdonate server for community page
	 * tracking
	 * @param totals: { totals:<array of total dicts>, hash:<> }
	 * @param domain: constants.PD_URL
	 */
	_post_data: function(data, onload) {
		// serialize into json
		JSON.stringify(data);
		
		// make request
		this.make_request(
			constants.PD_URL+"/totals/",
			data,
			"POST",
			onload
		);
	},

});
