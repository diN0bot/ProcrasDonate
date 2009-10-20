/*
 * regression tests
 *  --> checklist or manual tests
 * 
 * **methods to test: (stop_rec calls store_v calls update_t)
 *   (not done) start_recording(url);
 *   (not done) stop_record();
 *   (done) store_visit(url, start_time, duration);
 *   (done) update_totals(site, visit);
 * (done) crossed with visiting unsorted, pd and tws sites
 * test all data is correct: (done) times, (not done) amounts, (done) requirespayments
 * 
 * other tests:
 *   makes correct payments (extension, server, amazon)
 *       send server "test" flag to not make real transaction?
 *       refund?
 *       
 *       check duplicates
 *       verify in logs that schedule is on track ---> assert this in scheduled things
 *   payments to pd match expected skim
 *   time active tab correctly
 *   ??check self-imposed limits, eg large payments, visits?
 *   duplicate payments ok? or since time correct before and after?
 *   receives updates correctly, esp. with since times, duplicates
 *   "view logic" with multiauth, payments, state
 * run tests once a day and record failures in logs?
 * 
 * 
 * TESTS: may mutate database. checks that logic inserts appropriate objects into database.
 * CHECKS: checks database is well formed, not corrupted
 */
var PDChecks = function PDChecks(prefs, pddb) {
	this.prefs = prefs;
	this.pddb = pddb;
};
PDChecks.prototype = {};
_extend(PDChecks.prototype, {
	///
	/// RequiresPayments must:
	/// * be for recipient or sitegroup totals
	/// * be for weekly totals
	/// * if partially paid, then there should be a 
	///   corresponding Payment (same total) with 
	///   matching amount
	/// * else no corresponding Payment
	///
	check_requires_payments: function(testrunner) {
		var self = this;
		
		self.pddb.RequiresPayment.select({}, function(row) {
			var total = row.total();
			
			// recipient or sitegroup total only
			testrunner.ok(!total.recipient() && !total.sitegroup(),
					"Expected RECIPIENT or SITEGROUP requires_payment, not "+total.contenttype()+" total="+total);
			
			// weekly total only
			testrunner.ok(total.timetype().id == self.pddb.Weekly,
					"Expected WEEKLY requires_payment, not "+total.timetype()+" total="+total);

			// partially paid have corresponding Payment with matching amount
			if (row.is_partially_paid()) {
				testrunner.ok(false,
						"Partially paid RequiresPayment are not currently allowed !? "+row);
			} else {
				testrunner.ok(row.total().payments().length == 0,
						"Fully unpaid requires should not have payments: "+row.total().payments());
			}
		});
	},
	
	///
	/// Payments.
	///
	check_payments: function(testrunner) {
		var self = this;
		
		self.pddb.Payment.select({}, function(row) {
			
		});
	},
});

var PDTests = function PDTests(prefs, pddb) {
	this.prefs = prefs;
	this.pddb = pddb;
};
PDTests.prototype = {};
_extend(PDTests.prototype, {

	test_update_totals: function(testrunner) {
		var self = this;
		
		/* after "store_visit" is called on a new site,
		 * we expect to have created the following pieces of data:
		   totals:
		     -> site, sitegroup, tag(, recipient if PD tagged)  x  
		     -> daily, weekly, forever
		   requirespayment:
		     -> weekly sitegroup if TWS tagged
		     -> weekly recipient if PD tagged
		   site: newdomain/newpage
		   sitegroup: newdomain
		   visit: to site for 60 seconds
		   recipient: if
		 */ 
		self.init_data();
		var duration = 60;
		
		_iterate(['Unsorted', 'ProcrasDonate', 'TimeWellSpent'], function(key, value, index) {
			testrunner.ok( true, "---------------- new "+ value +" url ----");
			var before_totals = self.retrieve_totals(testrunner, url, self.pddb[value]);
			var url = self.visit_new_site(self.pddb[value], duration);
			self.check_totals(testrunner, url, duration, before_totals);
		});
	},
	
	init_data: function() {
		var self = this;
		var category = self.pddb.Category.get_or_create({
			category: "test"
		});
		var recipient = self.pddb.Recipient.get_or_create({
			slug: "test"
		}, {
			name: "Test",
			mission: "provide data for tests",
			url: "http://testrecip.xx",
			category_id: category.id,
			is_visible: false
		});
		self.pddb.RecipientPercent.get_or_create({
			recipient_id: recipient.id,
		}, {
			percent: 1,
		})
	},
	
	//
	// calls store_visit for new site
	// creates site and sitegroup with specified tag first if
	// specified tag is not Unosrted
	// @param tag: tag instance
	//
	visit_new_site: function(tag, seconds) {
		var self = this;
		var newdomain = create_caller_reference()+".com";
		var newpage = create_caller_reference()+".html";
		var url = "http://"+newdomain+"/"+newpage;
		if (tag.id != self.pddb.Unsorted.id) {
			var host = _host(url);
			sitegroup = self.pddb.SiteGroup.create({
					name: newdomain,
					host: newdomain,
					tag_id: tag.id
			});
			site = self.pddb.Site.create({ url: url, sitegroup_id: sitegroup.id });
		}
		self.pddb.store_visit(url, _dbify_date(new Date()), seconds);
		return url
	},
	
	retrieve_totals: function(testrunner, url, tag) {
		var self = this;
		var totals = {}
		
		var site = self.pddb.Site.get_or_null({ url: url })
		var host = _host(url);
		var sitegroup = self.pddb.SiteGroup.get_or_null({ host: host });
		var timetypes = [self.pddb.Daily, self.pddb.Weekly, self.pddb.Yearly, self.pddb.Forever];
		var times = [_dbify_date(_end_of_day()), _dbify_date(_end_of_week()), _dbify_date(_end_of_year()), _dbify_date(_end_of_forever())];
		
		for (var idx = 0; idx < timetypes.length; idx++) {
			self.pddb.ContentType.select({}, function(row) {
				// for each timetype-time x content, retrieve the total
				// remember, new sites and sitegroups will not exist yet.
				var content_ids = [];
				if (row.modelname == "Site") {
					if (site) content_ids.push(site.id);
				} else if (row.modelname == "SiteGroup") {
					if (sitegroup) content_ids.push(sitegroup.id);
				} else if (row.modelname == "Tag") {
					content_ids.push(tag.id);
				} else if (row.modelname == "Recipient") {
					self.pddb.RecipientPercent.select({}, function(r) {
						var recip = self.pddb.Recipient.get_or_null({ id: r.recipient_id });
						content_ids.push(recip.id);
					});
				} else {
					testrunner.ok(false, "unknown content type");
				}
				
				_iterate(content_ids, function(key, value, index) {
					var total = self.pddb.Total.get_or_null({
						contenttype_id: row.id,
						content_id: value,
						timetype_id: timetypes[idx].id,
						datetime: times[idx]
					});
					if (total) {
						totals[total.id] = total;
					} else {
						testrunner.ok(false, "While retrieving before totals, maybe expected total but found none? If " +
								"rerunning these tests does not make this failure go away, then there is a problem." +
								"(First run of the day causes this failure because no total for the day (and week) yet.) "+
								row.modelname+" id: "+value+" "+timetypes[idx].timetype+" "+times[idx]);							
					}
				});
			});
		}
		return totals
	},

	///
	/// also checks RequiresPayment
	///
	check_totals: function(testrunner, url, seconds, before_totals) {
		var self = this;
		var site = self.pddb.Site.get_or_null({ url: url })
		var timetypes = [self.pddb.Daily, self.pddb.Weekly, self.pddb.Yearly, self.pddb.Forever];
		var times = [_dbify_date(_end_of_day()), _dbify_date(_end_of_week()), _dbify_date(_end_of_year()), _dbify_date(_end_of_forever())];
		
		for (var idx = 0; idx < timetypes.length; idx++) {
			self.pddb.ContentType.select({}, function(row) {
				// for each timetype-time x content, retrieve the total
				var content_ids = [];
				var requires_payments_ids = {};
				if (row.modelname == "Site") {
					content_ids.push(site.id);
				} else if (row.modelname == "SiteGroup") {
					content_ids.push(site.sitegroup().id);
					requires_payments_ids[site.sitegroup().id] = 
						(timetypes[idx].id == self.pddb.Weekly.id &&
						site.tag().id == self.pddb.TimeWellSpent.id);
				} else if (row.modelname == "Tag") {
					content_ids.push(site.tag().id);
				} else if (row.modelname == "Recipient") {
					if (site.tag() == self.pddb.ProcrasDonate.id) {
						self.pddb.RecipientPercent.select({}, function(r) {
							var recip = self.pddb.Recipient.get_or_null({ id: r.recipient_id });
							content_ids.push(recip.id);
							requires_payments_ids[recip.id] = 
								(timetypes[idx].id == self.pddb.Weekly.id &&
								site.tag().id == self.pddb.ProcrasDonate.id);
						});
					}
				} else {
					testrunner.ok(false, "unknown content type");
				}
				
				_iterate(content_ids, function(key, value, index) {
					var total = self.pddb.Total.get_or_null({
						contenttype_id: row.id,
						content_id: value,
						timetype_id: timetypes[idx].id,
						datetime: times[idx]
					});
					/***** verify total times and amounts ************************************/
					if (!total) {
						testrunner.ok(false, "No total found for contenttype: "+row.id+
								", content: "+value+", timetype: "+timetypes[idx].id+
								", datetime: "+times[idx]);
					} else {
						//// CHECK TOTAL TIME ///////
						var expected_time = null;
						var before_total = before_totals[total.id];
						if (!before_total) {
							expected_time = seconds;
						} else {
							expected_time = parseFloat(before_total.total_time) + seconds;
						}
						testrunner.equals(expected_time, total.total_time,
							"Total (id="+total.id+") has incorrrect total_time");
						/*if (before_total) {//total.total_time != expected_time) {
							testrunner.ok(false, "BEFORE TOTAL="+before_total+
									"   TOTAL="+total);
						}*/	
						
						////// CHECK TOTAL AMOUNTS ///////
						if (site.tag().id == self.pddb.Unsorted) {
							//testrunner.equals(total.total_amount, 0, "Expected 0 seconds for");
						}
						
						////// CHECK REQUIRES PAYMENTS ///////
						var requires_payment = self.pddb.RequiresPayment.get_or_null({
							total_id: total.id
						});
						if (requires_payments_ids[value]) {
							testrunner.ok(requires_payment,
									"Expected requires_payment for total--"+total+"--but found none");
						} else {
							testrunner.ok(!requires_payment,
									"Did not expect requires_payment for total--"+total+"--but found one--"+requires_payment);
						}
					}
					/**********************************************************************/
				});
			});
		}
	}
});