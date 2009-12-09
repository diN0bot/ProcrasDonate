/*
 * deep_dict: returns dictionary of fields 
 *   fetches <foo>_id fields via deep_dict()
 *   flattens some fields, eg <foo>.tag() returns tag.tag string
 *   calls _un_dbify_bool, _un_dbify_date, parseInt and parseFloat as appropriate.
 *         one day this could be automatic by sqlite3_firefox.
 *         would need to create DATE type that appeared as an INTEGER to sqlite
 *         but _un_dbified differently. Same for BOOL and INTEGER.
 *   
 * deep field instance methods never flatten. thus, <foo>() always returns a row factory
 */

function load_models(db, pddb) {
	
	var Site = new Model(db, "Site", {
		// Model metadata
		table_name: "sites",
		columns: {
			_order: ["id", "sitegroup_id", "url", "flash", "max_idle"],
			id: "INTEGER PRIMARY KEY",
			sitegroup_id: "INTEGER",
			url: "VARCHAR",
			flash: "INTEGER", // boolean
			max_idle: "INTEGER", // in seconds
		},
		indexes: []
	}, {
		// Instance methods
		tag: function() {
			// we expect a site to always have a tag (via its sitegroup)
			var sitegroup = this.sitegroup();
			return sitegroup.tag();
		},
		
		sitegroup: function(notrequired) {
			// we expect a site to always have a sitegroup
			var self = this;
			var sitegroup = SiteGroup.get_or_null({ 'id': self.sitegroup_id });
			if (!sitegroup) {
				if (notrequired) {
					return null;
				} else {
					pddb.orthogonals.error("no SiteGroup found for site = "+this);
				}
			}
			return sitegroup;
		},
		
		has_flash: function() {
			return _un_dbify_bool(this.flash)
		},
		
		deep_dict: function() {
			return {
				id: this.id,
				sitegroup: this.sitegroup().deep_dict(),
				url: this.url,
				tag: this.tag().tag,
				has_flash: this.has_flash(),
				max_idle: this.max_idle
			}
		}
		
	}, {
		// Model-class methods
		get_or_make: function(url, has_flash, max_idle, tag_id) {
			var site = this.get_or_null({url__eq: url});
			if (!tag_id) {
				tag_id = pddb.Unsorted.id;
			}
			if (!site) {
				var host = _host(url);
				var sitegroup = SiteGroup.get_or_create({
					host: host
				}, {
					name: host,
					host: host,
					tag_id: tag_id
				});
	
				site = this.create({
					url: url,
					sitegroup_id: sitegroup.id,
					flash: _dbify_bool(has_flash),
					max_idle: max_idle || this.prefs.get("DEFAULT_MAX_IDLE")
				});
				return site
				
			} else {
				// overwrite flash and idle times if necessary
				if (site.has_flash() != has_flash || site.max_idle != max_idle) {
					this.set({
						flash: _dbify_bool(has_flash),
						max_idle: max_idle
					}, {
						url: url
					});
					return this.get_or_null({url__eq: url});
				} else {
					return site
				}
				
				/*if (site.has_flash() != has_flash || site.max_idle != max_idle) {
					logger("Site existed. did not override flash\n"+
							"existing site: "+site+
							"\nnew values: "+has_flash+" "+max_idle+" "+url);
				}*/
			}
		}
	});
	
	var SiteGroup = new Model(db, "SiteGroup", {
		table_name: "sitegroups",
		columns: {
			_order: ["id", "name", "host", "url_re", "tag_id", "tax_exempt_status"],
			id: "INTEGER PRIMARY KEY",
			name: "VARCHAR",
			host: "VARCHAR",
			url_re: "VARCHAR",
			tag_id: "INTEGER",
			tax_exempt_status: "INTEGER", // boolean 0=false
		},
		indexes: []
	}, {
		// instance methods
		tag: function() {
			// we expect a site to always have a tag (via its sitegroup)
			var self = this;
			var tag = Tag.get_or_null({ id: self.tag_id })
			if (!tag) {
				pddb.orthogonals.error("no Tag found for sitegroup = "+this);
			}
			return tag
		},
		
		has_tax_exempt_status: function() {
			return _un_dbify_bool(this.tax_exempt_status);
		},
		
		deep_dict: function() {
			return {
				id: this.id,
				name: this.name,
				host: this.host,
				url_re: this.url_re,
				tag: this.tag().tag,
				tax_exempt_status: this.has_tax_exempt_status()
			}
		}
	}, {
		// class methods
	});
	
	var Recipient = new Model(db, "Recipient", {
		table_name: "recipients",
		columns: {
			_order: ["id", "slug", "name", "category_id", "mission",
			         "description", "url", "logo", "logo_thumbnail",
			         "twitter_name", "facebook_name", 
			         "is_visible", "pd_registered", "tax_exempt_status"],
			id: "INTEGER PRIMARY KEY",
			slug: "VARCHAR",
			name: "VARCHAR",
			category_id: "INTEGER",
			mission: "VARCHAR",
			description: "VARCHAR",
			url: "VARCHAR",
			logo: "VARCHAR", // url to img uploaded onto server
			logo_thumbnail: "VARCHAR", // url to img uploaded onto server
			twitter_name: "VARCHAR",
			facebook_name: "VARCHAR",
			is_visible: "INTEGER", // boolean 0=false
			pd_registered: "INTEGER", // boolean 0=false
			tax_exempt_status: "INTEGER", // boolean 0=false
		},
		indexes: []
	}, {
		// instance methods
		category: function() {
			var self = this;
			var category = Category.get_or_null({ id: self.category_id })
			if (!category) {
				pddb.orthogonals.error("no Category found for recipient = "+this);
			}
			return category
		},
		
		has_tax_exempt_status: function() {
			return _un_dbify_bool(this.tax_exempt_status);
		},
		
		bool_is_visible: function() {
			return _un_dbify_bool(this.is_visible);
		},
		
		is_pd_registered: function() {
			return _un_dbify_bool(this.pd_registered);
		},
		
		deep_dict: function() {
			return {
				id: this.id,
				slug: this.slug,
				name: this.name,
				category: this.category().category,
				mission: this.mission,
				description: this.description,
				url: this.url,
				logo: this.logo,
				logo_thumbnail: this.logo_thumbnail,
				twitter_name: this.twitter_name,
				facebook_name: this.facebook_name,
				is_visible: _un_dbify_bool(this.is_visible),
				pd_registered: _un_dbify_bool(this.pd_registered),
				tax_exempt_status: this.has_tax_exempt_status(),
			}
		},
		
		html_description: function() {
			//return "<p>"+this.description.replace("\n\n", "</p><p>")+"</p>"
			// lets allow full Markdown markup
			return (new Showdown.converter()).makeHtml(this.description)
		}
	}, {
		// class methods
		process_object: function(r, last_receive_time, return_row) {
			// @param r: object from server. json already loaded
			// @param last_receive_time: time last received data. 
			//		if r.last_modified is older than last receive time,
			//		only add row if doesn't exist. no need to overwrite data.
			// @param return_row: if true, will return the created row
			// @return: if return_row, returns created row
		
			last_modified = new Date(r.last_modified);
			var recipient = Recipient.get_or_null({
				slug: r.slug
			});
			if (last_receive_time &&
					last_receive_time > last_modified &&
					recipient) {
				return null
			} // else, unknown or modified recipient
			
			var category = Category.get_or_create({
				category: r.category
			});
			
			if (recipient) {
				Recipient.set({
					name: r.name,
					category_id: category.id,
					mission: r.mission,
	                description: r.description,
	                url: r.url,
	                logo: r.logo,
	                logo_thumbnail: r.logo_thumbnail,
	                twitter_name: r.twitter_name,
	                facebook_name: r.facebook_name,
	                is_visible: _dbify_bool(r.is_visible),
	                pd_registered: _dbify_bool(r.pd_registered),
	                tax_exempt_status: _dbify_bool(r.tax_exempt_status),
				}, {
					slug: r.slug
				});
			} else {
				Recipient.create({
					slug: r.slug,
					name: r.name,
					category_id: category.id,
					mission: r.mission,
	                description: r.description,
	                url: r.url,
	                logo: r.logo,
	                logo_thumbnail: r.logo_thumbnail,
	                twitter_name: r.twitter_name,
	                facebook_name: r.facebook_name,
	                is_visible: _dbify_bool(r.is_visible),
	                pd_registered: _dbify_bool(r.pd_registered),
	                tax_exempt_status: _dbify_bool(r.tax_exempt_status),
				});
			}
			
			if (return_row) {
				return Recipient.get_or_create({
					slug: r.slug
				});
			}
		}
	});
	
	var Report = new Model(db, "Report", {
		table_name: "reports",
		columns: {
			_order: ["id", "datetime", "type", "message", "read", "sent"],
			id: "INTEGER PRIMARY KEY",
			datetime: "INTEGER", //"DATETIME",
			type: "VARCHAR", // ['weekly', 'newsletter']
			message: "VARCHAR",
			read: "INTEGER", // bool
			sent: "INTEGER", // bool
		},
		indexes: []
	}, {
		// instance methods
		
		/** read by user via our website */
		is_read: function() {
			return _un_dbify_bool(this.read)
		},
		/** emailed to user */
		is_sent: function() {
			return _un_dbify_bool(this.sent)
		},
		
		deep_dict: function() {
			return {
				id: this.id,
				datetime: this.datetime,
				type: this.type,
				message: this.message,
				is_read: this.is_read(),
				is_sent: this.is_sent()
			}
		}
	}, {
		// class methods
		process_object: function(r) {
			// @param r: object from server. json already loaded
			var report = Report.get_or_null({
				datetime: r.datetime,
				type: r.type
			});
			if (report) {
				if (report.is_sent() != r.is_sent) {
					Report.set({
						sent: r.is_sent
					}, {
						id: report.id
					});
				}
			} else {
				Report.create({
					message: r.message,
	                type: r.type,
	                is_sent: _dbify_bool(r.is_sent),
	                is_read: _dbify_bool(r.is_read),
	                datetime: _dbify_date(new Date(r.datetime))
				});
			}
		},
		
		
	});
	
	// recipient has 1 category
	var Category = new Model(db, "Category", {
		table_name: "categories",
		columns: {
			_order: ["id", "category"],
			id: "INTEGER PRIMARY KEY",
			category: "VARCHAR"
		},
		indexes: []
	}, {
		// instance methods
	}, {
		// class methods
	});
	
	var RecipientPercent = new Model(db, "RecipientPercent", {
		table_name: "recipientpercents",
		columns: {
			_order: ["id", "recipient_id", "percent"],
			id: "INTEGER PRIMARY KEY",
			recipient_id: "INTEGER",
			percent: "REAL" // 100% = 1
		},
		indexes: []
	}, {
		// instance methods
		recipient: function() {
			// we expect a RecipientPercent to always have a recipient
			var self = this;
			var recipient = Recipient.get_or_null({ id: self.recipient_id })
			if (!recipient) {
				pddb.orthogonals.error("no Recipient found for recipientpercent = "+this);
			}
			return recipient
		},
		
		display_percent: function() {
			return this.percent * 100
		},
		
		deep_dict: function() {
			return {
				id: this.id,
				recipient: this.recipient().deep_dict(),
				percent: parseFloat(this.percent),
			}
		}
	}, {
		// class methods
		process_object: function(r) {
			// @param r: object from server. json already loaded
			// contains recipient_slug and percent
			var recipient = Recipient.get_or_null({ slug: r.recipient_slug });
			if (recipient) {
				var rpct = RecipientPercent.get_or_create({
					recipient_id: recipient.id
				}, {
					percent: r.percent
				});
			} else {
				pddb.orthogonals.log("Unable to process RecipientPercent "+r+" because unknown recipient", "dataflow");
			}
		}
	});
	
	// sitegroup has 1 tag
	var Tag = new Model(db, "Tag", {
		table_name: "tags",
		columns: {
			_order: ["id", "tag"],
			id: "INTEGER PRIMARY KEY",
			tag: "VARCHAR"
		},
		indexes: []
	}, {
		// instance methods
	}, {
		// class methods
	});
	
	/*
	var SiteGroupTagging = new Model(db, "SiteGroupTagging", {
		table_name: "sitegrouptaggings",
		columns: {
			_order: ["id", "sitegroup_id", "tag_id"],
			id: "INTEGER PRIMARY KEY",
			sitegroup_id: "INTEGER",
			tag_id: "INTEGER"
		},
		indexes: []
	});
	*/
	
	var Visit = new Model(db, "Visit", {
		table_name: "visits",
		columns: {
			_order: ["id", "site_id", "enter_at", "duration", "enter_type", "leave_type"],
			id: "INTEGER PRIMARY KEY",
			site_id: "INTEGER",
			enter_at: "INTEGER", //"DATETIME",
			duration: "INTEGER", //seconds
			enter_type: "VARCHAR", // trigger that began visit
			leave_type: "VARCHAR", // trigger that ended visit
		},
		indexes: []
	}, {
		site: function() {
			// we expect a Visit to always have a site
			var self = this;
			var site = Site.get_or_null({ id: self.site_id })
			if (!site) {
				pddb.orthogonals.error("no Site found for visit = "+this);
			}
			return site
		},
		
		enter_at_display: function() {
			return _friendly_datetime(_un_dbify_date(this.enter_at));
		},
		
		duration_display: function() {
			var s = parseInt(this.duration);
			var hrs = Math.floor(s / 3600);
			var mins = Math.floor((s % 3600) / 60);
			var secs = (s % 3600) % 60;
			var ret = "";
			if (hrs > 0) {
				var d = (s / 3600).toFixed(1);
				if (d > 1.0) { ret = d + " hrs"; }
				else { ret = d + " hr"; }
			} else if (mins > 0) {
				if (mins < 10) { ret += "0"; }
				ret += mins + " m, ";
				if (secs < 10) { ret += "0"; }
				ret += secs + " s";
			} else {
				if (secs > 1) { ret += secs + " secs"; }
				else { ret += secs + " sec"; }
			}
			return ret;
		},

		enter_type_display: function() {
			return this.type_display(this.enter_type);
		},
		
		leave_type_display: function() {
			return this.type_display(this.leave_type);
		},
			
		type_display: function(type) {
			switch(type) {
			case(Visit.IDLE_NOFLASH):
				return "Idle on page without flash"
			case(Visit.IDLE_FLASH):
				return "Idle on page with flash"
			case(Visit.BACK):
				return "Back from being idle"
			case(Visit.CLOSE):
				return "Quit Firefox"
			case(Visit.CLOSE_TAB):
				return "Close tab"
			case(Visit.CLOSE_WINDOW):
				return "Close window"
			case(Visit.OPEN):
				return "Opened Firefox"
			case(Visit.BLUR):
				return "Changed to another application from Firefox"
			case(Visit.FOCUS):
				return "Changed to Firefox from another application"
			case(Visit.SLEEP):
				return "Computer went to sleep"
			case(Visit.WAKE):
				return "Computer woke up"
			case(Visit.URL):
				return "Viewing new url"
			case(Visit.URL_TAB):
				return "Changed tab"
			case(Visit.URL_WINDOW):
				return "Changed windows"
			case(Visit.URL_LINK):
				return "Clicked on a link"
			case(Visit.URL_BAR):
				return "Entered new URL into address bar"
			case(Visit.UNKNOWN):
				return "Unknown"
			default:
				return "-"
			}
		},
		
		deep_dict: function() {
			return {
				id: this.id,
				site: this.site().deep_dict(),
				enter_at: _un_dbify_date(this.enter_at),
				duration: parseInt(this.duration),
				enter_type: this.enter_type,
				leave_type: this.leave_type
			}
		}
	}, {
		// class methods
		
		// types
		UNKNOWN: "K",
		
		IDLE_NOFLASH: "IN", // computer detects idle user, no flash on page
		IDLE_FLASH: "IF", // computer detects idle user
		BACK: "B",
		
		CLOSE: "C", // quit FF
		CLOSE_TAB: "CT", // swith to a new tab
		CLOSE_WINDOW: "CW", // switch to a new window
		OPEN: "O", // open FF
		
		BLUR: "BL", // switch to different application
		FOCUS: "FO", // come back
		
		SLEEP: "S", // computer goes to sleep
		WAKE: "W", // computer wakes up
		
		URL: "U", // visit new url; could be by loading new page or switching tabs/windows
		//// don't have the granularity for these
		URL_TAB: "UT", // swith to a new tab
		URL_WINDOW: "UW", // switch to a new window
		URL_LINK: "UL", // click a link
		URL_BAR: "UB", // type/paste a new url into the url bar
		
	});
	
	// Aggregates visits in different ways
	// Crosses different model slices (tags, recipients, sites, sitegroups)
	// with different time spans (daily, weekly, forever)
	var Total = new Model(db, "Total", {
		table_name: "totals",
		columns: {
			_order: ["id","contenttype_id", "content_id", "total_time", 
			         "total_amount", "datetime", "timetype_id"],
			         
			id: "INTEGER PRIMARY KEY",

			// generic table
			contenttype_id: "INTEGER",
			// id of row in generic table
			content_id: "INTEGER",
			
			total_time: "INTEGER", //seconds
			total_amount: "REAL", //cents
			datetime: "INTEGER", //"DATETIME"
			timetype_id: "INTEGER"
		}
	}, {
		dollars: function() {
			return parseFloat(this.total_amount) / 100.0;
		},
		
		hours: function() {
			return parseFloat(this.total_time) / (60*60);
		},
		
		// instance methods
		contenttype: function() {
			// all Totals have a contenttype
			var self = this;
			var contenttype = ContentType.get_or_null({ id: self.contenttype_id });
			if (!contenttype) {
				pddb.orthogonals.error("no contenttype found for total = "+this);
			}
			return contenttype
		},
		
		cached_content: null,
		content: function() {
			// all Totals have a content
			var self = this;
			if (!self.cached_content) {
				var content = pddb[self.contenttype().modelname].get_or_null({ id: self.content_id });
				if (!content) {
					pddb.orthogonals.error("no content found for total = "+self);
				} else {
					self.cached_content = content;
				}
			}
			return self.cached_content;
		},
		
		recipient: function() {
			// @returns Recipient row factory or null if not Recipient contenttype
			if (this.contenttype().modelname == "Recipient") {
				return this.content();
			}
			return null;
		},
		
		site: function() {
			// @returns Site row factory or null if not Site contenttype
			if (this.contenttype().modelname == "Site") {
				return this.content();
			}
			return null;
		},
		
		sitegroup: function() {
			// @returns SiteGroup row factory or null if not SiteGroup contenttype
			if (this.contenttype().modelname == "SiteGroup") {
				return this.content();
			}
			return null;
		}, 
		
		tag: function() {
			// @returns Tag row factory or null if not Tag contenttype
			if (this.contenttype().modelname == "Tag") {
				return this.content();
			}
			return null;
		},
		
		timetype: function() {
			// all Totals have a timetype
			var self = this;
			var timetype = pddb.TimeType.get_or_null({ id: self.timetype_id });
			if (!timetype) {
				pddb.orthogonals.error("no timetype found for total = "+this);
			}
			return timetype
		},
		
		_payments: function(deep_dictify) {
			// Totals may have Payments
			// @returns list of Payment row factories
			// @param deep_dictify: if true, returns dicts instead of row objects
			var self = this;
			var payments = [];
			PaymentTotalTagging.select({ total_id: self.id }, function(row) {
				if (deep_dictify) {
					payments.push(row.payment().deep_dict());
				} else {
					payments.push(row.payment());
				}
			});
			return payments
		},
		
		payments: function() {
			return this._payments(false);
		},
		
		payment_dicts: function() {
			return this._payments(true);
		},
		
		requires_payment: function() {
			return RequiresPayment.get_or_null({ total_id: this.id });
		},
		
		deep_dict: function() {
			/*
			 * Extracts foreign keys.
			 * @return dictionary, not a row factory
			 */
			return {
				id: this.id,
				contenttype: this.contenttype().modelname,
				content: this.content().deep_dict(),
				total_time: parseInt(this.total_time),
				total_amount: parseFloat(this.total_amount),
				datetime: parseInt(this.datetime),
				timetype: this.timetype().timetype,
				payments: this.payment_dicts()
			}
		}
	}, {
		// class methods
	});
	
	
	var PaymentService = new Model(db, "PaymentService", {
		table_name: "paymentservices",
		columns: {
			_order: ["id", "name", "user_url"],
			id: "INTEGER PRIMARY KEY",
			name: "VARCHAR",
			user_url: "VARCHAR"
		}
	}, {
		// instance methods
	}, {
		// class methods
	});
	
	// if balance can only partially cover payment, 
	// then two payments will be created for total.
	// one will be paid, one will be unpaid (initially)
	var Payment = new Model(db, "Payment", {
		table_name: "payments",
		columns: {
			_order: ["id", "payment_service_id", "transaction_id",
			         "sent_to_service", "settled",
			         "total_amount_paid", "amount_paid",
			         "amount_paid_in_fees", "amount_paid_tax_deductibly",
			         "datetime"],
			id: "INTEGER PRIMARY KEY",
			payment_service_id: "INTEGER",
			transaction_id: "INTEGER",
			sent_to_service: "INTEGER", // boolean 0=false
			settled: "INTEGER", // boolean 0=false
			total_amount_paid: "REAL",
			amount_paid: "REAL",
			amount_paid_in_fees: "REAL",
			amount_paid_tax_deductibly: "REAL",
			datetime: "INTEGER" //"DATETIME"
		}
	}, {
		// instance methods
		payment_service: function() {
			// all Payment have a payment_service
			var self = this;
			var payment_service = PaymentService.get_or_null({ id: self.payment_service_id });
			if (!payment_service) {
				pddb.orthogonals.error("no payment_service found for payment = "+this);
			}
			return payment_service
		},
		
		is_sent_to_service: function() {
			return _un_dbify_bool(this.sent_to_service);
		},
		
		is_settled: function() {
			return _un_dbify_bool(this.settled);
		},
		
		deep_dict: function() {
			return {
				id: this.id,
				payment_service: this.payment_service(),
				transaction_id: parseInt(this.transaction_id),
				sent_to_service: this.is_sent_to_service(),
				settled: this.is_settled(),
				total_amount_paid: parseFloat(this.total_amount_paid),
				amount_paid: parseFloat(this.amount_paid),
				amount_paid_in_fees: parseFloat(this.amount_paid_in_fees),
				amount_paid_tax_deductibly: parseFloat(this.amount_paid_tax_deductibly),
				datetime: _un_dbify_date(this.datetime)
			}
		},
		
		_totals: function(deep_dictify) {
			// Payments may have Totals
			// @returns list of Totals row factories
			// @param deep_dictify: if true, returns dicts instead of row objects
			var self = this;
			var totals = [];
			PaymentTotalTagging.select({ payment_id: self.id }, function(row) {
				if (deep_dictify) {
					totals.push(row.total().deep_dict());
				} else {
					totals.push(row.total());
				}
			});
			return totals
		},
		
		totals: function() {
			return this._totals(false);
		},
		
		totals_dicts: function() {
			return this._totals(true);
		},
		
		fps_multiuse_pays: function() {
			var self = this;
			var pays = [];
			FPSMultiusePay.select({ payment_id: self.id }, function(row) {
				pays.push(row);
			});
			return pays;
		},
		
		most_recent_fps_multiuse_pay: function() {
			var self = this;
			var pay = null;
			FPSMultiusePay.select({ payment_id: self.id }, function(row) {
				if (!pay) { pay = row; }
			}, "-timestamp");
			return pay
		}
		
	}, {
		// class methods
	});
	
	/*
	 * Index of totals that require Payments-- that is, no PaymentTotalTagging
	 * exists yet.
	 * 
	 * Currently, payments are only made for yesterday and older totals. This
	 * means that we expect partially_paid to always be false.
	 * 
	 * RequiresPayment are attached to Totals upon creation.
	 * Whenever payments are made, that's when PaymentTotalTaggings are created.
	 * When a PaymentTotalTagging is created. As long as the Total is more than a day old,
	 * that means it won't change, and that means we won't pay it only to have that amount 
	 * become a partial payment. Thus, when a PaymentTotalTagging is created (and
	 * of course the corresponding Payment), the RequiresPayment can be deleted. 
	 */
	var RequiresPayment = new Model(db, "RequiresPayment", {
		table_name: "requirespayments",
		columns: {
			_order: ["id", "total_id", "partially_paid", "pending"],
			
			id: "INTEGER PRIMARY KEY",
			total_id: "INTEGER",
			partially_paid: "INTEGER", // boolean 0=false
			pending: "INTEGER" // boolean 0=false
		}
	}, {
		// instance methods
		total: function() {
			// all RequiresPayment have a total
			var self = this;
			var total = Total.get_or_null({ id: self.total_id });
			if (!total) {
				pddb.orthogonals.error("no total found for RequiresPayment = "+this);
			}
			return total
		},
		
		// returns boolean value
		is_partially_paid: function() {
			return _un_dbify_bool(this.partially_paid)
		},
		
		// returns boolean value
		is_pending: function() {
			return _un_dbify_bool(this.pending)
		},
	
		deep_dict: function() {
			return {
				id: this.id,
				total: this.total().deep_dict(),
				partially_paid: this.is_partially_paid(),
				pending: this.is_pending()
			}
		}
	}, {
		// class methods
		
		///
		/// Applies fn to all requirespayments that are partially paid
		/// @param fn: function that takes a row
		///
		partially_paids: function(fn) {
			this.select({
				partially_paid: _dbify_bool(true)
			}, fn);
		},
		
		// @returns count of partially paid totals
		partially_paids_count: function() {
			var count = 0
			this.select({
				partially_paid: _dbify_bool(true)
			}, function(row) {
				count += 1;
			});
			return count
		}
	});
	
	var PaymentTotalTagging = new Model(db, "PaymentTotalTagging", {
		table_name: "paymenttotaltagging",
		columns: {
			_order: ["id", "payment_id", "total_id"],
			id: "INTEGER PRIMARY KEY",
			payment_id: "INTEGER",
			total_id: "INTEGER"
		},
		indexes: []
	}, {
		// instance methods
		total: function() {
			// we expect a PaymentTotalTagging to always have a total
			var self = this;
			var total = Total.get_or_null({ id: self.total_id })
			if (!total) {
				pddb.orthogonals.error("no Total found for PaymentTotalTagging = "+this);
			}
			return total
		},
		
		payment: function() {
			// we expect a PaymentTotalTagging to always have a payment
			var self = this;
			var payment = Payment.get_or_null({ id: self.payment_id })
			if (!payment) {
				pddb.orthogonals.error("no payment found for PaymentTotalTagging = "+this);
			}
			return payment
		}
	}, {
		// class methods
	});
	
	
	// eg: daily, weekly or forever
	var TimeType = new Model(db, "TimeType", {
		table_name: "timetypes",
		columns: {
			_order: ["id", "timetype"],
			id: "INTEGER PRIMARY KEY",
			timetype: "VARCHAR"
		},
		indexes: []
	}, {
		// instance methods
	}, {
		// class methods
	});
	
	var ContentType = new Model(db, "ContentType", {
		table_name: "contenttypes",
		columns: {
			_order: ["id", "modelname"],
			id: "INTEGER PRIMARY KEY",
			modelname: "VARCHAR"
		}
	}, {
		// instance methods
	}, {
		// class methods
	});

	var Log = new Model(db, "Log", {
		table_name: "logs",
		columns: {
			_order: ["id", "datetime", "type", "detail_type", "message"],
			id: "INTEGER PRIMARY KEY",
			datetime: "INTEGER", //"DATETIME"
			type: "VARCHAR",
			detail_type: "VARCHAR",
			message: "VARCHAR"
		}
	}, {
		// instance methods
	}, {
		// class methods
	});

	var UserStudy = new Model(db, "UserStudy", {
		table_name: "userstudies",
		columns: {
			_order: ["id", "datetime", "type", "message", "quant"],
			id: "INTEGER PRIMARY KEY",
			datetime: "INTEGER", //"DATETIME"
			type: "VARCHAR",
			message: "VARCHAR",
			quant: "REAL"
		}
	}, {
		// instance methods
	}, {
		// class methods
	});
	
	var FPSMultiuseAuthorization = new Model(db, "FPSMultiuseAuthorization", {
		table_name: "fpsmultiuseauthorizations",
		columns: {
			_order: ["id", "timestamp", "caller_reference", "global_amount_limit",
			         "is_recipient_cobranding", "payment_method", "payment_reason",
			         "recipient_slug_list", "expiry",
			         "status", "token_id", "error_message"],
			id: "INTEGER PRIMARY KEY",
			timestamp: "INTEGER", //"DATETIME"
			caller_reference: "VARCHAR",
			global_amount_limit: "VARCHAR",
			is_recipient_cobranding: "INTEGER", //BOOLEAN 0=false
			payment_method: "VARCHAR",
			payment_reason: "VARCHAR",
			recipient_slug_list: "VARCHAR",
			expiry: "VARCHAR",
			
			status: "VARCHAR", // 
			token_id: "VARCHAR",
			error_message: "VARCHAR"
		}
	}, {
		// instance methods
		success_abt: function() { return this.status == FPSMultiuseAuthorization.SUCCESS_ABT },
		success_ach: function() { return this.status == FPSMultiuseAuthorization.SUCCESS_ACH },
		success_cc: function() { return this.status == FPSMultiuseAuthorization.SUCCESS_CC },
		system_error: function() { return this.status == FPSMultiuseAuthorization.SYSTEM_ERROR },
		aborted: function() { return this.status == FPSMultiuseAuthorization.ABORTED },
		caller_error: function() { return this.status == FPSMultiuseAuthorization.CALLER_ERROR },
		payment_method_error: function() { return this.status == FPSMultiuseAuthorization.PAYMENT_METHOD_ERROR },
		payment_error: function() { return this.status == FPSMultiuseAuthorization.PAYMENT_ERROR },
		developer_error: function() { return this.status == FPSMultiuseAuthorization.DEVELOPER_ERROR },
		response_not_received: function() { return this.status == FPSMultiuseAuthorization.RESPONSE_NOT_RECEIVED },
		response_error: function() { return this.status == FPSMultiuseAuthorization.RESPONSE_ERROR },
		cancelled: function() { return this.status == FPSMultiuseAuthorization.CANCELLED },
		expired: function() { return this.status == FPSMultiuseAuthorization.EXPIRED },
		
		good_to_go: function() {
			return this.success_abt() || this.success_ach() || this.success_cc();
		},
		
		error: function() {
			return this.system_error() || this.caller_error() || this.response_error() ||
				this.payment_error() || this.developer_error() || this.payment_method_error()
		},
		
		deep_dict: function() {
			return {
				id: this.id,
				timestamp: _un_dbify_date(this.timestamp),
				caller_reference: this.caller_reference,
				global_amount_limit: this.global_amount_limit,
				is_recipient_cobranding: _un_dbify_bool(this.is_recipient_cobranding),
				payment_method: this.payment_method,
				payment_reason: this.payment_reason,
				recipient_slug_list: this.recipient_slug_list,
				status: this.status,
				token_id: this.token_id,
				error_message: this.error_message,
			}
		},
		
	}, {
		// class methods
		SUCCESS_ABT: 'SA', // success for Amazon account payment method
		SUCCESS_ACH: 'SB', // success for bank account payment method
        SUCCESS_CC: 'SC', // success for credit card payment method
        SYSTEM_ERROR: 'SE',
        ABORTED: 'A', // buyer aborted pipeline
        CALLER_ERROR: 'CE',
        PAYMENT_METHOD_ERROR: 'PE', // buyer does not have payment method requested
        PAYMENT_ERROR: 'NP',
        DEVELOPER_ERROR: 'NM',
        RESPONSE_NOT_RECEIVED: '0',
        RESPONSE_ERROR: '1',
        CANCELLED: 'C',
        EXPIRED: 'EX',
        
        most_recent: function() {
			// iterate over rows in timestamp order and return the most recent one
			// return null if no rows
			var ret = [];
			FPSMultiuseAuthorization.select({}, function(row) {
				ret.push(row);
			}, "-timestamp");
			
			if (ret.length > 0) {
				return ret[0];
			} else {
				return null;
			}
		},
		
		get_latest_success: function() {
			var success = null;
			FPSMultiuseAuthorization.select({}, function(row) {
				if (row.good_to_go() && !success) {
					success = row;
				}
			}, "-timestamp");
			return success;
		},
		
		has_success: function() {
			// iterate over tokens and return true if found successful one
			var ret = false;
			FPSMultiuseAuthorization.select({}, function(row) {
				if (row.good_to_go()) {
					ret = true
				}
			});
			return ret;
		},
		
		process_object: function(ma) {
			// @param ma: object from server. json already loaded
			// @return: {diff: true or false if status changed,
			//           multi_auth: multi auth row}
			// incoming timestampe are from self.timestamp.ctime():
			//              Sat Sep 19 14:42:25 2009
			// the above string can transformed to dates with new Date(ctimestr)
			//
			// not this, which is "%s" % self.timestamp -->2009-09-19 14:38:03.799905
			var multi_auth = FPSMultiuseAuthorization.get_or_null({
				caller_reference: ma.caller_reference
			});
			if (!multi_auth) {
				multi_auth = FPSMultiuseAuthorization.create({
	                timestamp: _dbify_date(new Date(ma.timestamp)),
	                payment_reason: ma.payment_reason,
	                global_amount_limit: ma.global_amount_limit,
	                recipient_slug_list: ma.recipient_slug_list,
	                token_id: ma.token_id,
	                expiry: ma.expiry,
	                status: ma.status,
	                error_message: ma.error_message,
	                caller_reference: ma.caller_reference
				});
			} else {
				FPSMultiuseAuthorization.set({
					status: ma.status,
					token_id: ma.token_id,
					error_message: ma.error_message
				}, {
					id: multi_auth.id
				});
				
				multi_auth = FPSMultiuseAuthorization.get_or_null({
					id: multi_auth.id
				});
			}
			return multi_auth
		}
	});
	
	var FPSMultiusePay = new Model(db, "FPSMultiusePay", {
		table_name: "fpsmultiusepays",
		columns: {
			_order: ["id", "timestamp", "caller_reference", "marketplace_fixed_fee",
			         "marketplace_variable_fee", "transaction_amount", "recipient_slug",
			         "sender_token_id", "payment_id",
			         "caller_description", "charge_fee_to", "descriptor_policy", "sender_description",
			         "request_id", "transaction_id",
			         "transaction_status", "error_message", "error_code"],
			id: "INTEGER PRIMARY KEY",
			timestamp: "INTEGER", //"DATETIME"
			caller_reference: "VARCHAR", // (128 char)
			marketplace_fixed_fee: "VARCHAR", // (Amount)
			marketplace_variable_fee: "VARCHAR", // (Decimal)
			transaction_amount: "VARCHAR", // (amount)
			recipient_slug: "VARCHAR", // server converts recipient slug to recipient token
			sender_token_id: "VARCHAR",  // (multiuse tokenID)
			payment_id: "INTEGER",
			
			/////// these get populated by server
			caller_description: "VARCHAR",  // (160 chars)
			charge_fee_to: "VARCHAR", // "Recipient" or "Caller"
			descriptor_policy: "VARCHAR",
			//recipient_token_id: "VARCHAR",
			//refund_token_id: "VARCHAR",
			sender_description: "VARCHAR", // (160 chars)
			
			request_id: "VARCHAR",
			transaction_id: "VARCHAR",
			transaction_status: "VARCHAR",
			error_message: "VARCHAR",
			error_code: "VARCHAR"				
		}
	}, {
		// instance methods
		success: function() { return this.transaction_status == FPSMultiusePay.SUCCESS },
		pending: function() { return this.transaction_status == FPSMultiusePay.PENDING},
		reserved: function() { return this.transaction_status == FPSMultiusePay.RESERVED },
		refunded: function() { return this.transaction_status == FPSMultiusePay.REFUNDED },
		refund_initiated: function() { return this.transaction_status == FPSMultiusePay.REFUND_INITIATED },
		cancelled: function() { return this.transaction_status == FPSMultiusePay.CANCELLED },
		error: function() { return this.transaction_status == FPSMultiusePay.ERROR },
		failure: function() { return this.transaction_status == FPSMultiusePay.FAILURE },
		
		payment: function() {
			// @returns Payment row factory (should never be null)
			var self = this;
			var payment = Payment.get_or_null({ id: self.payment_id })
			if (!payment) {
				pddb.orthogonals.error("no payment found for FPS Multiuse Pay = "+this);
			}
			return payment
		},
		
		deep_dict: function() {
			return {
				id: this.id,
				timestamp: _un_dbify_date(this.timestamp),
				caller_reference: this.caller_reference,
				marketplace_fixed_fee: this.marketplace_fixed_fee,
				marketplace_variable_fee: this.marketplace_variable_fee,
				transaction_amount: this.transaction_amount,
				recipient_slug: this.recipient_slug,
				sender_token_id: this.sender_token_id,
				payment: this.payment().deep_dict(),
				
				caller_description: this.caller_description,
				charge_fee_to: this.charge_fee_to,
				descriptor_policy: this.descriptor_policy,
				sender_description: this.sender_description,
				
				request_id: this.request_id,
				transaction_id: this.transaction_id,
				transaction_status: this.transaction_status,
				error_message: this.error_message, 
				error_code: this.error_code
			}
		},
		
	}, {
		// class methods
		SUCCESS: 'S',
		PENDING: 'P', // waiting for response from amazon
		CANCELLED: 'C', // was pending, now cancelled
		RESERVED: 'R',
		FAILURE: 'F', // Amazon says transaction failed 
		ERROR: 'E', // something messed up before we could even get a transaction status
		REFUND_INITIATED: 'I',
		REFUNDED: 'D', // the transaction was refunded.... 
		// ?? maybe there should be a refund transaction?
		
		process_object: function(p) {
			// @param p: object from server. json already loaded
			// @return: nothing
		
			// incoming timestampe are from self.timestamp.ctime():
			//              Sat Sep 19 14:42:25 2009
			// the above string can transformed to dates with new Date(ctimestr)
			/*
			 * {'caller_reference': self.caller_reference,
                'timestamp': "%s" % self.timestamp.ctime(),
                'marketplace_fixed_fee': self.marketplace_fixed_fee,
                'marketplace_variable_fee': self.marketplace_variable_fee,
                'recipient_slug': self.recipient_token_id,
                'refund_token_id': self.refund_token_id,
                'sender_token_id': self.sender_token_id,
                'transaction_amount': self.transaction_amount,
                'request_id': self.request_id,
                'transaction_id': self.transaction_id,
                'transaction_status': self.transaction_status,
                'error_message': self.error_message,
                'error_code': se
			 */
			logger("pay process object: ");
			_pprint(pay);
			
			var pay = FPSMultiusePay.get_or_null({
				caller_reference: p.caller_reference
			});
			if (pay) {
				FPSMultiusePay.set({
					request_id: p.request_id,
					transaction_status: p.transaction_status,
					error_message: p.error_message,
					error_code: p.error_code,
				}, {
					caller_reference: p.caller_reference,
				});
				
				var pay = FPSMultiusePay.get_or_null({
					id: pay.id
				});
				
				if (pay.success() || pay.refunded() || pay.cancelled()) {
					var payment = pay.payment();
					// if success, refunded or cancelled:
					//   * remove requires payment
					//   * set settled to true
					// if refunded, do we want to do anything else,
					//     eg remove payment or mark payment as refunded?
					//    do we really want settled to be true for refund or cancelled?
					Payment.set({
						settled: _dbify_bool(true)
					}, {
						id: payment.id
					});
					_iterate(payment.totals(), function(key, total, index) {
						var rp = total.requires_payment();
						if (rp) {
							RequiresPayment.del({ id: rp.id });
						} else {
							pddb.orthogonals.warn("Requires Payment doesn't exist for a total for received FPS Multiuse Pay: "+pay+" "+" total="+total);
						}
					});
				}
				
			} else {
				pddb.orthogonals.error("Recieved FPS Multiuse Pay update for FPS Multiuse Pay that does not exist! "+p);
				
				/* don't know which payment to use (though could find amount and timestamp similar...
				 * but if FPS multiuse pay was deleted, then payment and totals might be deleted, too...
				 * 
				 * FPSMultiusePay.create({
					timestamp: p.timestamp,
					caller_description: p.caller_description,
					caller_reference: p.caller_reference,
					charge_fee_to: p.charge_fee_to,
					descriptor_policy: p.descriptor_policy,
					marketplace_fixed_fee: p.marketplace_fixed_fee,
					marketplace_variable_fee: p.marketplace_variable_fee,
					recipient_slug: p.recipient_slug,
					refund_token_id: p.refund_token_id,
					sender_description: p.sender_description,
					sender_token_id: p.sender_token_id,
					transaction_amount: p.transaction_amount,
					
					request_id: p.request_id,
					transaction_status: p.transaction_status,
					error_message: p.error_message,
					error_code: p.error_code,
				});*/
			}
		}
	});
	
	return {
        _order: ["Site", "SiteGroup",
                 "Recipient", "Category", "RecipientPercent",
                 "Tag", "Visit", "Total", 
                 "PaymentService", "Payment", "RequiresPayment", "PaymentTotalTagging",
				 "TimeType", "ContentType",
				 "Log", "UserStudy",
				 "FPSMultiuseAuthorization", "FPSMultiusePay",
				 "Report"],
        
        Site                : Site,
		SiteGroup           : SiteGroup,
		Recipient           : Recipient,
		Category            : Category,
		RecipientPercent    : RecipientPercent,
        Tag                 : Tag,
        Visit               : Visit,
		Total               : Total,
		PaymentService      : PaymentService,
		Payment             : Payment,
		RequiresPayment     : RequiresPayment,
		PaymentTotalTagging : PaymentTotalTagging,
		TimeType            : TimeType,
		ContentType         : ContentType,
		Log                 : Log,
		UserStudy           : UserStudy,
		FPSMultiuseAuthorization : FPSMultiuseAuthorization,
		FPSMultiusePay      : FPSMultiusePay,
		Report              : Report
	};
}


