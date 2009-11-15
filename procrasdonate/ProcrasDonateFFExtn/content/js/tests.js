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
	/// #@TODO single requires payment per total
	///
	check_requires_payments: function(testrunner) {
		var self = this;
		
		self.pddb.RequiresPayment.select({}, function(row) {
			var total = row.total();
			
			// recipient or sitegroup total only
			testrunner.ok(total.recipient() || total.sitegroup(),
					"Expected RECIPIENT or SITEGROUP requires_payment, not "+total.contenttype()+" total="+total);
			
			// weekly total only
			testrunner.ok(total.timetype().id == self.pddb.Weekly.id,
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
			if (_un_dbify_bool(row.sent_to_service)) {
				// if payment is settled, there should no longer be required payments
				// #@TODO if settled, should also have a success FPS Multiuse Pay row
				_iterate(row.totals(), function(key, total, idx) {
					testrunner.ok(!total.requires_payment(),
						"Settled payment should not have a requires payment, but it does: "+total+" requires_payment: "+total.requires_payment()+" payment: "+row);
				});
				
			} else if (_un_dbify_bool(row.sent_to_service)) {
				// if payment is unsettled but sent, there should be pending required payments
				_iterate(row.totals(), function(key, total, idx) {
					testrunner.ok(total.requires_payment() && total.requires_payment().is_pending(),
						"Unsettled payment should have a pending requires payment, but it does not: "+total+" requires_payment: "+total.requires_payment()+" payment: "+row);
				});
				
			} else {
				// unsettled and unsent should never happen
				testrunner.ok(false,
					"Unsettled and unsent payment should never happen, but it did: "+total+" payment: "+row);
			}
			
			// amount paid should equal sum of all totals
			// plus, contenttype_id and content_id should be the same for all totals
			var sum = 0.0;
			var contenttype_id = -1;
			var content_id = -1;
			_iterate(row.totals(), function(key, total, idx) {
				sum += total.total_amount;
				if (contenttype_id == -1) {
					contenttype_id = total.contenttype_id;
					content_id = total.content_id;
				} else {
					testrunner.equal(
						contenttype_id,
						total.contenttype_id,
						"as;dlfkja;sdlfj"
						);
			});
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
	// creates new tag
	// @param tag: tag instance
	//
	new_site: function(tag) {
		var self = this;
		var newdomain = create_caller_reference()+".com";
		var newpage = create_caller_reference()+".html";
		var url = "http://"+newdomain+"/"+newpage;

		var host = _host(url);
		sitegroup = self.pddb.SiteGroup.create({
				name: newdomain,
				host: newdomain,
				tag_id: tag.id
		});
		return self.pddb.Site.create({
			url: url,
			sitegroup_id: sitegroup.id,
			flash: _dbify_bool(false),
			max_idle: constants.DEFAULT_FLASH_MAX_IDLE
		});
	},
	
	//
	// calls store_visit for new site
	// creates site and sitegroup with specified tag first if
	// specified tag is not Unosrted
	// @param tag: tag instance
	//
	visit_new_site: function(tag, seconds) {
		var site = this.new_site(tag);
		this.pddb.store_visit(site.url, _dbify_date(new Date()), seconds);
		return site.url
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
	},

	/**
	 * [
	 *  {fn, self, args, interval},
	 *  {fn, self, args, interval},
	 *  ...
	 * ]
	 */
	sequentialize: function(items, idx) {
		var self = this;
		if (idx < items.length) {
			logger("SEQUENTIALIZE "+idx+" interval="+items[idx].interval);
			items[idx].fn.apply(items[idx].self, items[idx].args);
			if (items[idx].interval) {
				setTimeout(function() {
					self.sequentialize(items, idx+1);
				}, items[idx].interval);
			} else if (idx+1 < items.length) {
				logger("no timeout interval set");
				self.sequentialize(items, idx+1);
			}
		}
	},
	
	check_visits: function(testrunner, display_results_callback, site, expected_durations) {
		var actual_durations = [];
		this.pddb.Visit.select({
			site_id: site.id
		}, function(row) {
			actual_durations.push(parseInt(row.duration));
		});
		logger(" expected_durations = "+expected_durations.join(", ")+
			"\n actual_durations = "+actual_durations.join(", "));
		
		testrunner.equals(expected_durations.length, actual_durations.length, 
				"Expected and actual visit durations do not match for site="+site+
				"\n actual_durations="+actual_durations.join(", ")+
				"\n expected_durations="+expected_durations.join(", "));
		
		_iterate(expected_durations, function(key, actual, index) {
			testrunner.ok(index < actual_durations.length, 
					"More expected visits than actual visits for site="+site+
					"\n actual_durations="+actual_durations.join(", ")+
					"\n expected_durations="+expected_durations.join(", "));
			
			testrunner.equals(actual_durations[index], actual, " ");
		});
		
		// display results
		display_results_callback(testrunner);
	},
	
	/**
	 * Permutate on idle/back and focus/blur combinations.
	 * 
	 * Need to mimic boundary-case timings in actual use.
	 * For example, idle/back calls can be delayed by as much as 5 seconds.
	 * Focus/blur has a 1-second delay to collate groups of calls.
	 * 
	 *  Make sure these use cases and others are covered.
	 */
	test_idle_focus_combos: function(testrunner, display_results_callback) {
		var self = this;
		this.sequentialize(
			[{
				fn: self._simple_idle,
				self: self,
				args: [testrunner, display_results_callback],
				interval: 30000
			}, {
				fn: self._simple_focus,
				self: self,
				args: [testrunner, display_results_callback],
				interval: 30000
			}, {
				fn: self._simple_mixed_1,
				self: self,
				args: [testrunner, display_results_callback],
				interval: 50000
			}, {
				fn: self._simple_mixed_2,
				self: self,
				args: [testrunner, display_results_callback],
				interval: 50000
			}, {
				fn: self._simple_mixed_3,
				self: self,
				args: [testrunner, display_results_callback],
				interval: 50000
			}, {
				fn: self._simple_mixed_4,
				self: self,
				args: [testrunner, display_results_callback],
				interval: 50000
			}],
			0
		);
	},
	
	/**
	 * start_recording, idle, back, stop_recording
	 */
	_simple_idle: function(testrunner, display_results_callback) {
		var self = this;
		var site = this.new_site(this.pddb.ProcrasDonate);
		self._create_sequence(
			testrunner,
			display_results_callback,
			site,
			[{
				fn: self.pddb.start_recording,
				self: self.pddb,
				args: [site.url],
				interval: Math.floor(Math.random()*7000)+2000,
				expected_visit: true
			}, {
				fn: self.pddb.idle,
				self: self.pddb,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000
			}, {
				fn: self.pddb.back,
				self: self.pddb,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000,
				expected_visit: true
			}, {
				fn: self.pddb.stop_recording,
				self: self.pddb,
				args: [],
				interval: 0
			}]
		);
	},
	
	/**
	 * start_recording, blur, focus, stop_recording
	 */
	_simple_focus: function(testrunner, display_results_callback) {
		var self = this;
		var site = this.new_site(this.pddb.ProcrasDonate);
		self._create_sequence(
			testrunner,
			display_results_callback,
			site,
			[{
				fn: self.pddb.start_recording,
				self: self.pddb,
				args: [site.url],
				interval: Math.floor(Math.random()*7000)+2000,
				expected_visit: true
			}, {
				fn: self.pddb.blur,
				self: self.pddb,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000
			}, {
				fn: self.pddb.focus,
				self: self.pddb,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000,
				expected_visit: true
			}, {
				fn: self.pddb.stop_recording,
				self: self.pddb,
				args: [],
				interval: 0
			}]
		);
	},
	
	/**
	 * start_recording, blur, idle, back, focus, stop_recording
	 */
	_simple_mixed_1: function(testrunner, display_results_callback) {
		var self = this;
		var site = this.new_site(this.pddb.ProcrasDonate);
		self._create_sequence(
			testrunner,
			display_results_callback,
			site,
			[{
				fn: self.pddb.start_recording,
				self: self.pddb,
				args: [site.url],
				interval: Math.floor(Math.random()*7000)+2000,
				expected_visit: true
			}, {
				fn: self.pddb.blur,
				self: self.pddb,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000
			}, {
				fn: self.pddb.idle,
				self: self.pddb,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000,
			}, {
				fn: self.pddb.back,
				self: self.pddb,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000,
			}, {
				fn: self.pddb.focus,
				self: self.pddb,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000,
				expected_visit: true
			}, {
				fn: self.pddb.stop_recording,
				self: self.pddb,
				args: [],
				interval: 0
			}]
		);
	},
	
	/**
	 * start_recording, blur, idle, focus, back, stop_recording
	 */
	_simple_mixed_2: function(testrunner, display_results_callback) {
		var self = this;
		var site = this.new_site(this.pddb.ProcrasDonate);
		self._create_sequence(
			testrunner,
			display_results_callback,
			site,
			[{
				fn: self.pddb.start_recording,
				self: self.pddb,
				args: [site.url],
				interval: Math.floor(Math.random()*7000)+2000,
				expected_visit: true
			}, {
				fn: self.pddb.blur,
				self: self.pddb,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000
			}, {
				fn: self.pddb.idle,
				self: self.pddb,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000,
			}, {
				fn: self.pddb.focus,
				self: self.pddb,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000,
				expected_visit: true // #@TODO ?
			}, {
				fn: self.pddb.back,
				self: self.pddb,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000,
				expected_visit: true // #@TODO ?
			}, {
				fn: self.pddb.stop_recording,
				self: self.pddb,
				args: [],
				interval: 0
			}]
		);
	},
	
	/**
	 * start_recording, idle, blur, back, focus, stop_recording
	 */
	_simple_mixed_3: function(testrunner, display_results_callback) {
		var self = this;
		var site = this.new_site(this.pddb.ProcrasDonate);
		self._create_sequence(
			testrunner,
			display_results_callback,
			site,
			[{
				fn: self.pddb.start_recording,
				self: self.pddb,
				args: [site.url],
				interval: Math.floor(Math.random()*7000)+2000,
				expected_visit: true
			}, {
				fn: self.pddb.idle,
				self: self.pddb,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000
			}, {
				fn: self.pddb.blur,
				self: self.pddb,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000,
			}, {
				fn: self.pddb.back,
				self: self.pddb,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000,
			}, {
				fn: self.pddb.focus,
				self: self.pddb,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000,
				expected_visit: true
			}, {
				fn: self.pddb.stop_recording,
				self: self.pddb,
				args: [],
				interval: 0
			}]
		);
	},
	
	/**
	 * start_recording, idle, blur, focus, back, stop_recording
	 */
	_simple_mixed_4: function(testrunner, display_results_callback) {
		var self = this;
		var site = this.new_site(this.pddb.ProcrasDonate);
		self._create_sequence(
			testrunner,
			display_results_callback,
			site,
			[{
				fn: self.pddb.start_recording,
				self: self.pddb,
				args: [site.url],
				interval: Math.floor(Math.random()*7000)+2000,
				expected_visit: true
			}, {
				fn: self.pddb.idle,
				self: self.pddb,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000
			}, {
				fn: self.pddb.blur,
				self: self.pddb,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000,
			}, {
				fn: self.pddb.focus,
				self: self.pddb,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000,
				expected_visit: true // #@TODO ?
			}, {
				fn: self.pddb.back,
				self: self.pddb,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000,
				expected_visit: true // #@TODO ?
			}, {
				fn: self.pddb.stop_recording,
				self: self.pddb,
				args: [],
				interval: 0
			}]
		);
	},
	
	/**
	 * 
	 */
	_create_sequence: function(testrunner, display_results_callback, site, actions) {
		var self = this;
		
		var expected_durations = [];
		var sequence = [];
		
		_iterate(actions, function(key, action, index) {
			if (action.expected_visit) {
				expected_durations.push(Math.round(action.interval/1000.0));
			}
			sequence.push({
				fn: action.fn,
				self: action.self,
				args: action.args,
				interval: action.interval
			});
		});
		// append tests to sequence
		sequence.push({
			fn: self.check_visits,
			self: self,
			args: [testrunner, display_results_callback, site, expected_durations],
			interval: 1
		})
		// initiate sequence execution
		self.sequentialize(sequence, 0);
	},
});