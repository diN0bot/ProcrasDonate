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
var PDChecks = function PDChecks(pddb, prefs) {
	this.pddb = pddb;
	this.prefs = prefs;
<<<<<<< HEAD:procrasdonate/ProcrasDonateFFExtn/content/js/tests.js
=======
	
	this.time_tracker = new TimeTracker(pddb, prefs);
>>>>>>> ad45eee9a626791837d19f378897aac3fc063032:procrasdonate/ProcrasDonateFFExtn/content/js/tests.js
};
PDChecks.prototype = {};
_extend(PDChecks.prototype, {

	// no duplicates. that is, total<->payment link should be unique
	check_payment_total_taggings: function(testrunner) {
		var self = this;
		// {payment_id: [total_id, ...], ... }
		var links = {};
		self.pddb.PaymentTotalTagging.select({}, function(row) {
			var totals = links[row.payment_id];
			if (!totals) {
				totals = [];
			}
			var dupe = false;
			_iterate(totals, function(key, total, index) {
				if (total == row.total_id) { dupe = true; }
			});
			// assert no dupes
			testrunner.ok(!dupe,
				"PaymentTotalTagging links should be unique but found duplicate: "+row);

			totals.push(row.total_id);
			links[row.payment_id] = totals;
		});
	},
	
	///
	/// RequiresPayments must:
	/// * be for recipient or sitegroup totals
	/// * be for weekly totals
	/// * should not be partially paid (not currently allowed)
	/// * if pending:
	///     * should be single non-(success|cancel|refunded) Payment
	/// * else:
	///     * should not be a payment
	
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

			// not partially paid
			if (row.is_partially_paid()) {
				testrunner.ok(false,
					"Partially paid RequiresPayment are not currently allowed !? "+row);
			} else{
				if (row.is_pending()) {
					testrunner.ok(row.total().payments().length != 0,
						"Pending RequiresPayment should have at least one payment: "+row+" total: "+row.total());
				} else {
					testrunner.ok(row.total().payments().length == 0,
						"Un-Pending RequiresPayment should have no payments: "+row+" total: "+row.total()+" payments: "+row.total().payments().length);
				}
			}
		});
	},
	
	///
	/// Payments.
	///
	check_payments: function(testrunner) {
		var self = this;
		logger("check payments pddb="+self.pddb);
		self.pddb.Payment.select({}, function(row) {
			logger("found one="+row);
			// all payments should have:
			//   1. sent_to_service = True
			//   2. a FPS Multiuse Pay
			// if payment is settled:
			//   3. FPS Multiuse Pay should be success
			//   4. totals should have no required payments
			// else:
			//   5. require payments should be pending
			//
			// 6. amount paid should equal sum of all totals
			// 7. contenttype_id and content_id should be the same for all totals
			
			// 1. sent_to_service = True
			testrunner.ok(row.is_sent_to_service(),
				"All payments should have sent_to_service True: " + row);
			
			// 2. a FPS Multiuse Pay
			testrunner.ok(row.fps_multiuse_pays().length > 0,
				"All payments should have at least one FPS Multiuse Pay: " + row);
			
			if (row.is_settled()) {
				// 4. totals should have no required payments
				_iterate(row.totals(), function(key, total, idx) {
					testrunner.ok(!total.requires_payment(),
						"All *settled* payments should have *zero* requires payment: "+row+"; total:"+total+" requires_payment: "+total.requires_payment());
					
				});
				// 3. FPS Multiuse Pay should be success
				if (row.most_recent_fps_multiuse_pay()) {
					testrunner.ok(row.most_recent_fps_multiuse_pay().success(),
						"All *settled* payments should have a *success* FPS Multiuse Pay: " + row);
				} else {
					testrunner.ok(false,
						"All *settled* payments should have a *most recent* FPS Multiuse Pay: " + row);
				}
			} else {
				// 5. require payments should be pending
				_iterate(row.totals(), function(key, total, idx) {
					if (total.requires_payment()) {
						testrunner.ok(total.requires_payment().is_pending(),
							"All *unsettled* payments should have a requires payment: "+row+" total: "+total+" requires_payment: "+total.requires_payment());
					} else {
						testrunner.ok(false,
							"All *unsettled* payments should have a *pending* requires payment: "+row+" total: "+total+" requires_payment: "+total.requires_payment());
					}
				});
			}

			// 6. amount paid should equal sum of all totals
			// 7. contenttype_id and content_id should be the same for all totals
			// 8. totals should all be for a recipient
			var sum = 0.0;
			var contenttype_id = -1;
			var content_id = -1;
			var recipient_contenttype = self.pddb.ContentType.get_or_null({
				modelname: "Recipient"
			});
			_iterate(row.totals(), function(key, total, idx) {
				sum += parseFloat(total.total_amount);
				if (contenttype_id == -1) {
					contenttype_id = total.contenttype_id;
					content_id = total.content_id;
				} else {
					testrunner.equals(contenttype_id, total.contenttype_id,
						"All payments should be for totals for the same contenttype");
					testrunner.equals(contenttype_id, recipient_contenttype.id,
						"All payments should be for totals for a Recipient");
					testrunner.equals(content_id, total.content_id,
						"All payments should be for totals for the same content");
				}
			});
			testrunner.equals((sum/100.0).toFixed(2), parseFloat(row.total_amount_paid).toFixed(2),
				"All payments' total_amount_paid should sum to the same sum of totals' total_amount. sum="+sum.toFixed(2));
		});
	},
});

var PDTests = function PDTests(pddb, prefs) {
	this.pddb = pddb;
	this.prefs = prefs;
<<<<<<< HEAD:procrasdonate/ProcrasDonateFFExtn/content/js/tests.js
	
	// create listeners
 	this.observerService = Cc['@mozilla.org/observer-service;1'].getService(
 			Components.interfaces.nsIObserverService);
 	this.idleService = Components.classes["@mozilla.org/widget/idleservice;1"].getService(
 			Components.interfaces.nsIIdleService);
	 	
 	this.time_tracker = new TimeTracker(this.pddb, this.prefs);
 	this.toolbar_manager = new ToolbarManager(this.pddb, this.prefs);
 	this.blur_focus_listener = new BlurFocusListener(this.pddb, this.prefs, this.time_tracker);
 	this.sleep_wake_listener = new SleepWakeListener(this.observerService, this.pddb, this.prefs, this.time_tracker);
 	this.idle_back_noflash_listener = new IdleBack_NoFlash_Listener(this.idleService, this.pddb, this.prefs, this.time_tracker, constants.DEFAULT_MAX_IDLE);
 	this.idle_back_flash_listener = new IdleBack_Flash_Listener(this.idleService, this.pddb, this.prefs, this.time_tracker, constants.DEFAULT_FLASH_MAX_IDLE);
 	this.private_browsing_listener = new PrivateBrowsingListener(this.observerService, this.pddb, this.prefs, this.toolbar_manager);

=======
<<<<<<< HEAD:procrasdonate/ProcrasDonateFFExtn/content/js/tests.js
	this.time_tracker = TimeTracker(pddb, prefs);
=======
	
	// create listeners
	this.observerService = Cc['@mozilla.org/observer-service;1'].getService(
			Components.interfaces.nsIObserverService);
	this.idleService = Components.classes["@mozilla.org/widget/idleservice;1"].getService(
			Components.interfaces.nsIIdleService);
	
	this.time_tracker = new TimeTracker(this.pddb, this.prefs);
	this.toolbar_manager = new ToolbarManager(this.pddb, this.prefs);
	this.blur_focus_listener = new BlurFocusListener(this.pddb, this.prefs, this.time_tracker);
	this.sleep_wake_listener = new SleepWakeListener(this.observerService, this.pddb, this.prefs, this.time_tracker);
	this.idle_back_noflash_listener = new IdleBack_NoFlash_Listener(this.idleService, this.pddb, this.prefs, this.time_tracker, constants.DEFAULT_MAX_IDLE);
	this.idle_back_flash_listener = new IdleBack_Flash_Listener(this.idleService, this.pddb, this.prefs, this.time_tracker, constants.DEFAULT_FLASH_MAX_IDLE);
	this.private_browsing_listener = new PrivateBrowsingListener(this.observerService, this.pddb, this.prefs, this.toolbar_manager);
>>>>>>> ad45eee9a626791837d19f378897aac3fc063032:procrasdonate/ProcrasDonateFFExtn/content/js/tests.js
>>>>>>> 790793f52ade64240842af2e9a613bd12aa7829b:procrasdonate/ProcrasDonateFFExtn/content/js/tests.js
};
PDTests.prototype = {};
_extend(PDTests.prototype, {

<<<<<<< HEAD:procrasdonate/ProcrasDonateFFExtn/content/js/tests.js
 	uninit: function(event) {
 		// remove listeners
 		this.blur_focus_listener.unregister();
 		this.sleep_wake_listener.unregister();
 		this.idle_back_noflash_listener.unregister();
 		this.idle_back_flash_listener.unregister();
 		this.private_browsing_listener.unregister();
 	},

=======
	uninit: function(event) {
		// remove listeners
		this.blur_focus_listener.unregister();
		this.sleep_wake_listener.unregister();
		this.idle_back_noflash_listener.unregister();
		this.idle_back_flash_listener.unregister();
		this.private_browsing_listener.unregister();
	},
	
>>>>>>> 790793f52ade64240842af2e9a613bd12aa7829b:procrasdonate/ProcrasDonateFFExtn/content/js/tests.js
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
			testrunner.ok( true, "---------------- new "+ value +" url ----"+self.pddb[value]);
			logger(">>>>>> pddb is "+self.pddb+" <<<<<<");
			var s = "";
			for (var k in self.pddb) { s += "\n"+k; }
			logger(">>>>>> pddb contents "+s);
			var before_totals = self.retrieve_totals(testrunner, url, self.pddb[value]);
			// var url = self.visit_new_site(self.pddb[value], duration);
			var site = self.new_site(self.pddb[value]);
			var url = self.time_tracker.store_visit(site.url, _dbify_date(new Date()), duration);
			//
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

		sitegroup = self.pddb.SiteGroup.create_from_url(url, tag);
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
<<<<<<< HEAD:procrasdonate/ProcrasDonateFFExtn/content/js/tests.js
	visit_new_site: function(self, tag, seconds) {
		var site = self.new_site(tag);
		self.time_tracker.store_visit(site.url, _dbify_date(new Date()), seconds);
=======
	visit_new_site: function(tag, seconds) {
		var site = this.new_site(tag);
		this.time_tracker.store_visit(site.url, _dbify_date(new Date()), seconds);
>>>>>>> 790793f52ade64240842af2e9a613bd12aa7829b:procrasdonate/ProcrasDonateFFExtn/content/js/tests.js
		return site.url
	},
	
	retrieve_totals: function(testrunner, url, tag) {
		var self = this;
		var totals = {}
		
		var site = self.pddb.Site.get_or_null({ url: url })
		var sitegroup = self.pddb.SiteGroup.get_from_url(url);
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
	 * @param items: list of functions to execute
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
				fn: self.time_tracker.start_recording,
				self: self.time_tracker,
				args: [site.url],
				interval: Math.floor(Math.random()*7000)+2000,
				expected_visit: true
			}, {
				fn: self.idle_back_noflash_listener.idle,
				self: self.idle_back_noflash_listener,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000
			}, {
				fn: self.idle_back_noflash_listener.back,
				self: self.idle_back_noflash_listener,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000,
				expected_visit: true
			}, {
				fn: self.time_tracker.stop_recording,
				self: self.time_tracker,
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
				fn: self.time_tracker.start_recording,
				self: self.pddb,
				args: [site.url],
				interval: Math.floor(Math.random()*7000)+2000,
				expected_visit: true
			}, {
				fn: self.blur_focus_listener.blur,
				self: self.blur_focus_listener,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000
			}, {
				fn: self.blur_focus_listener.focus,
				self: self.blur_focus_listener,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000,
				expected_visit: true
			}, {
				fn: self.time_tracker.stop_recording,
				self: self.time_tracking,
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
				fn: self.time_tracking.start_recording,
				self: self.time_tracking,
				args: [site.url],
				interval: Math.floor(Math.random()*7000)+2000,
				expected_visit: true
			}, {
				fn: self.blur_focus_listener.blur,
				self: self.blur_focus_listener,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000
			}, {
				fn: self.idle_back_noflash_listener.idle,
				self: self.idle_back_noflash_listener,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000,
			}, {
				fn: self.idle_back_noflash_listener.back,
				self: self.idle_back_noflash_listener,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000,
			}, {
				fn: self.blur_focus_listener.focus,
				self: self.blur_focus_listener,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000,
				expected_visit: true
			}, {
				fn: self.time_tracker.stop_recording,
				self: self.time_tracking,
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
				fn: self.time_tracker.start_recording,
				self: self.time_tracking,
				args: [site.url],
				interval: Math.floor(Math.random()*7000)+2000,
				expected_visit: true
			}, {
				fn: self.blur_focus_listener.blur,
				self: self.blur_focus_listener,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000
			}, {
				fn: self.idle_back_noflash_listener.idle,
				self: self.idle_back_noflash_listener,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000,
			}, {
				fn: self.blur_focus_listener.focus,
				self: self.blur_focus_listener,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000,
				expected_visit: true // #@TODO ?
			}, {
				fn: self.idle_back_noflash_listener.back,
				self: self.idle_back_noflash_listener,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000,
				expected_visit: true // #@TODO ?
			}, {
				fn: self.time_tracker.stop_recording,
				self: self.time_tracking,
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
				fn: self.time_tracker.start_recording,
				self: self.time_tracking,
				args: [site.url],
				interval: Math.floor(Math.random()*7000)+2000,
				expected_visit: true
			}, {
				fn: self.idle_back_noflash_listener.idle,
				self: self.idle_back_noflash_listener,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000
			}, {
				fn: self.blur_focus_listener.blur,
				self: self.blur_focus_listener,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000,
			}, {
				fn: self.idle_back_noflash_listener.back,
				self: self.idle_back_noflash_listener,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000,
			}, {
				fn: self.blur_focus_listener.focus,
				self: self.blur_focus_listener,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000,
				expected_visit: true
			}, {
				fn: self.time_tracker.stop_recording,
				self: self.time_tracking,
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
				fn: self.time_tracker.start_recording,
				self: self.time_tracking,
				args: [site.url],
				interval: Math.floor(Math.random()*7000)+2000,
				expected_visit: true
			}, {
				fn: self.idle_back_noflash_listener.idle,
				self: self.idle_back_noflash_listener,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000
			}, {
				fn: self.blur_focus_listener.blur,
				self: self.blur_focus_listener,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000,
			}, {
				fn: self.blur_focus_listener.focus,
				self: self.blur_focus_listener,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000,
				expected_visit: true // #@TODO ?
			}, {
				fn: self.idle_back_noflash_listener.back,
				self: self.idle_back_noflash_listener,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000,
				expected_visit: true // #@TODO ?
			}, {
				fn: self.time_tracker.stop_recording,
				self: self.time_tracking,
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