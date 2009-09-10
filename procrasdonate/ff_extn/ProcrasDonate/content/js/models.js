/*
 * deep_dict: returns dictionary of fields 
 *   fetches <foo>_id fields via deep_dict()
 *   flattens some fields, eg <foo>.tag() returns tag.tag string
 *   calls _un_dbify_bool, _un_dbify_date, parseInt and parseFloat as appropriate
 *     (#@TODO would be nice to make the getting and setting of fields automatic.
 *         tricky part is handling dates v INTEGER correctly)
 *   
 * deep field instance methods never flatten. thus, <foo>() always returns a row factory
 */

function load_models(db, pddb) {
	
	var Site = new Model(db, "Site", {
		// Model metadata
		table_name: "sites",
		columns: {
			_order: ["id", "sitegroup_id", "url"],
			id: "INTEGER PRIMARY KEY",
			sitegroup_id: "INTEGER",
			url: "VARCHAR"
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
		
		deep_dict: function() {
			return {
				sitegroup: this.sitegroup().deep_dict(),
				url: this.url,
				tag: this.tag().tag
			}
		}
		
	}, {
		// Model-class methods
	});
	
	var SiteGroup = new Model(db, "SiteGroup", {
		table_name: "sitegroups",
		columns: {
			_order: ["id", "name", "host", "url_re", "tag_id"],
			id: "INTEGER PRIMARY KEY",
			name: "VARCHAR",
			host: "VARCHAR",
			url_re: "VARCHAR",
			tag_id: "INTEGER"
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
		
		deep_dict: function() {
			return {
				name: this.name,
				host: this.host,
				url_re: this.url_re,
				tag: this.tag().tag
			}
		}
	}, {
		// class methods
	});
	
	var Recipient = new Model(db, "Recipient", {
		table_name: "recipients",
		columns: {
			_order: ["id", "name", "mission", "description", "twitter_name", "url", "email", "category_id", "is_visible"],
			id: "INTEGER PRIMARY KEY",
			name: "VARCHAR",
			twitter_name: "VARCHAR",
			mission: "VARCHAR",
			description: "VARCHAR",
			url: "VARCHAR",
			email: "VARCHAR",
			category_id: "INTEGER",
			is_visible: "INTEGER" // boolean 0=false
		},
		indexes: []
	}, {
		// instance methods
		category: function() {
			// we expect a site to always have a tag (via its sitegroup)
			var self = this;
			var category = Category.get_or_null({ id: self.category_id })
			if (!category) {
				pddb.orthogonals.error("no Category found for recipient = "+this);
			}
			return category
		},
		
		deep_dict: function() {
			return {
				name: this.name,
				twitter_name: this.twitter_name,
				mission: this.mission,
				description: this.description,
				url: this.url,
				email: this.email,
				category: this.category().category,
				is_visible: _un_dbify_bool(this.is_visible)
			}
		}
	}, {
		// class methods
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
			percent: "REAL"
		},
		indexes: []
	}, {
		// instance methods
		recipient: function() {
			// we expect a RecipientPercent to always have a recipient
			var self = this;
			var recipient = RecipientPercent.get_or_null({ id: self.recipient_id })
			if (!recipient) {
				pddb.orthogonals.error("no Recipient found for recipientpercent = "+this);
			}
			return recipient
		},
		
		deep_dict: function() {
			return {
				recipient: this.recipient().deep_dict(),
				percent: parseFloat(this.percent),
			}
		}
	}, {
		// class methods
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
			_order: ["id", "site_id", "enter_at", "duration"],
			id: "INTEGER PRIMARY KEY",
			site_id: "INTEGER",
			enter_at: "INTEGER", //"DATETIME",
			duration: "INTEGER", //seconds
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
		
		deep_dict: function() {
			return {
				site: this.site().deep_dict(),
				enter_at: _un_dbify_date(this.enter_at),
				duration: parseInt(this.duration)
			}
		}
	}, {
		// class methods
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
		// instance methods
		contenttype: function() {
			// all Totals have a contenttype
			var self = this;
			var contenttype = pddb.ContentType.get_or_null({ id: self.contenttype_id });
			if (!contenttype) {
				pddb.orthogonals.error("no contenttype found for total = "+this);
			}
			return contenttype
		},
		
		content: function() {
			// all Totals have a content
			var self = this;
			var content = pddb[this.contenttype().modelname].get_or_null({ id: self.content_id });
			if (!content) {
				pddb.orthogonals.error("no content found for total = "+this);
			}
			return content
		},
		
		recipient: function() {
			// @returns Recipient row factory or null if not Recipient contenttype
			if (this.contenttype() == "Recipient") {
				return this.content();
			}
			return null;
		},
		
		site: function() {
			// @returns Site row factory or null if not Site contenttype
			if (this.contenttype() == "Site") {
				return this.content();
			}
			return null;
		},
		
		sitegroup: function() {
			// @returns SiteGroup row factory or null if not SiteGroup contenttype
			if (this.contenttype() == "SiteGroup") {
				return this.content();
			}
			return null;
		}, 
		
		tag: function() {
			// @returns Tag row factory or null if not Tag contenttype
			if (this.contenttype() == "Tag") {
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
			var self = this;
			var payments = [];
			pddb.PaymentTotalTagging.select({ total_id: self.id }, function(row) {
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
		
		deep_row: function() {
		},
		
		deep_dict: function() {
			/*
			 * Extracts foreign keys.
			 * @return dictionary, not a row factory
			 */
			return {
				contenttype: this.contenttype().modelname,
				content: this.content().deep_dict(),
				total_time: parseInt(this.total_time),
				total_amount: parseFloat(this.total_amount),
				datetime: parseInt(this.datetime),
				timetype: this.timetype(),
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
			var payment_service = pddb.PaymentService.get_or_null({ id: self.payment_service_id });
			if (!payment_service) {
				pddb.orthogonals.error("no payment_service found for payment = "+this);
			}
			return payment_service
		},
		
		deep_dict: function() {
			// #@TODO do this instead of listing all fields??
			//var ret = this.prototype.deep_dict()
			// return _extend(ret, {})
			return {
				payment_service: this.payment_service(),
				transaction_id: parseInt(this.transaction_id),
				sent_to_service: _un_dbify_bool(this.sent_to_service),
				settled: _un_dbify_bool(this.settled),
				total_amount_paid: parseFloat(this.total_amount_paid),
				amount_paid: parseFloat(this.amount_paid),
				amount_paid_in_fees: parseFloat(this.amount_paid_in_fees),
				amount_paid_tax_deductibly: parseFloatt(this.amount_paid_tax_deductibly),
				datetime: _un_dbify_date(this.datetime)
			}
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
			_order: ["id", "total_id", "partially_paid"],
			
			id: "INTEGER PRIMARY KEY",
			total_id: "INTEGER",
			partially_paid: "INTEGER", // boolean 0=false
		}
	}, {
		// instance methods
		total: function() {
			// all RequiresPayment have a total
			var self = this;
			var total = pddb.Total.get_or_null({ id: self.total_id });
			if (!total) {
				pddb.orthogonals.error("no total found for RequiresPayment = "+this);
			}
			return total
		},
	
		deep_dict: function() {
			return {
				total: this.total().deep_dict(),
				partially_paid: this.partiall_paid
			}
		}
	}, {
		// class methods
		partially_paid: function(fn) {
			/*
			 * Applies fn to all requirespayments that are partially paid
			 * @param fn: function that takes a row
			 */
			this.select({
				partially_paid: _dbify_bool(true)
			}, fn);
		},
		
		// class methods
		partially_paid_count: function() {
			/*
			 * @returns count of partially paid totals
			 */
			var count = 0
			this.select({
				partially_paid: _dbify_bool(true)
			}, function(row) {
				count += 1;
			});
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
	
	return {
        _order: ["Site", "SiteGroup",
                 "Recipient", "Category", "RecipientPercent",
                 "Tag", "Visit", "Total", 
                 "PaymentService", "Payment", "RequiresPayment", "PaymentTotalTagging",
				 "TimeType", "ContentType",
				 "Log", "UserStudy"],
        
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
		UserStudy           : UserStudy
	};
}


