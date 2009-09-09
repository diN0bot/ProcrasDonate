

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
		tag: function(notrequired) {
			// we expect a site to always have a tag (via its sitegroup)
			var sitegroup = this.sitegroup();
			var tag = Tag.get_or_null({ id: sitegroup.tag_id })
			if (!tag) {
				if (notrequired) {
					return null;
				} else {
					pddb.orthogonals.error("no Tag found for site = "+this);
				}
			}
			return tag
		},
		
		sitegroup: function(notrequired) {
			// we expect a site to always have a sitegroup
			var sitegroup = SiteGroup.get_or_null({ 'id': this.sitegroup_id });
			if (!sitegroup) {
				if (notrequired) {
					return null;
				} else {
					pddb.orthogonals.error("no SiteGroup found for site = "+this);
				}
			}
			return sitegroup;
		}
		
	}, {
		// Model-class methods
		stest: function() {
			alert("stest success!");
		}
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
		},
		
		recipient: function() {
		},
		
		site: function() {
		},
		
		sitegroup: function() {
		}, 
		
		tag: function() {
		},
		
		timetype: function() {
		},
		
		payments: function() {
		},
		
		deep_row: function() {
		},
		
		deep_dict: function() {
			/*
			 * Extracts foreign keys.
			 * @return dictionary, not a row factory
			 */
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
				datetime: _date_to_http_format( _un_dbify_date( row.datetime ) )
			};
			if (recipient) {
				var category = "Uncategorized";
				if (recipient_category) {
					category = recipient_category.category;
				}
				total_data.recipient = {
					id: recipient.id,
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
					id: site.id,
					url: site.url,
					url_re: site_sitegroup.url_re,
					name: site_sitegroup.name,
					host: site_sitegroup.host,
					tag: site_tag.tag
				}
			} else if (sitegroup) {
				total_data.sitegroup = {
					id: sitegroup.id,
					url_re: sitegroup.url_re,
					name: sitegroup.name,
					host: sitegroup.host,
					tag: sitegroup_tag.tag
				}
			} else if (tag) {
				total_data.tag = {
					id: tag.id,
					tag: tag.tag
				}
			}
			return total_data;
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
	});
	
	// if balance can only partially cover payment, 
	// then two payments will be created for total.
	// one will be paid, one will be unpaid (initially)
	var Payment = new Model(db, "Payment", {
		table_name: "payments",
		columns: {
			_order: ["id", "payment_service_id", "payment_id",
			         "sent_to_service", "settled",
			         "total_amount_paid", "amount_paid",
			         "amount_paid_in_fees", "amount_paid_tax_deductibly",
			         "datetime"],
			id: "INTEGER PRIMARY KEY",
			payment_service_id: "INTEGER",
			payment_id: "INTEGER",
			sent_to_service: "INTEGER", // boolean 0=false
			settled: "INTEGER", // boolean 0=false
			total_amount_paid: "REAL",
			amount_paid: "REAL",
			amount_paid_in_fees: "REAL",
			amount_paid_tax_deductibly: "REAL",
			datetime: "INTEGER" //"DATETIME"
		}
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
	});
	
	var ContentType = new Model(db, "ContentType", {
		table_name: "contenttypes",
		columns: {
			_order: ["id", "modelname"],
			id: "INTEGER PRIMARY KEY",
			modelname: "VARCHAR"
		}
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


