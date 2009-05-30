

function load_models(db) {
	
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
		tag : function() {
			var sitegroup = SiteGroup.get_or_null({ 'id': this.sitegroup_id });
			if (!sitegroup) {
				//SiteGroup.create({  })
			}
			var tag = Tag.get_or_null({ tag_id: sitegroup.tag_id })
			if (!tag) {
			}
			return tag
		},
		
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
	});
	
	var Recipient = new Model(db, "Recipient", {
		table_name: "recipients",
		columns: {
			_order: ["id", "name", "mission", "description", "twitter_name", "url", "category_id", "is_visible"],
			id: "INTEGER PRIMARY KEY",
			name: "VARCHAR",
			twitter_name: "VARCHAR",
			mission: "VARCHAR",
			description: "VARCHAR",
			url: "VARCHAR",
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
	
	// Tracks how much a site(url) or recipient should be paid each day.
	// Payment is tracked in DailyTotal
	// if site_id is null, there should be a taggingdailyvisiting
	var DailyVisit = new Model(db, "DailyVisit", {
		table_name: "dailyvisits",
		columns: {
			_order: ["id", "site_id", "recipient_id", "total_time", "total_amount", "time", "dailytotal_id", "weeklytotal_id", "forevertotal_id"],
			id: "INTEGER PRIMARY KEY",
			site_id: "INTEGER", // one or the other (or both, if tag for site changes during day  ?)
			recipient_id: "INTEGER", // one or the other
			total_time: "INTEGER", //seconds
			total_amount: "REAL", //cents
			time: "INTEGER", //"DATETIME"
			dailytotal_id: "INTEGER", // Total id
			weeklytotal_id: "INTEGER", // Total id
			forevertotal_id: "INTEGER", // Total id
		}
	});
	
	// Overall ProcrasDonate or TimeWellSpent
	// Daily, weekly and forever total
	var Total = new Model(db, "Total", {
		table_name: "totals",
		columns: {
			_order: ["id", "total_time", "total_amount", "time", "paid", "tag_id", "type_id"],
			id: "INTEGER PRIMARY KEY",
			total_time: "INTEGER", //seconds
			total_amount: "REAL", //cents
			time: "INTEGER", //"DATETIME"
			paid: "INTEGER", // use True or False definitions in utils
			tag_id: "INTEGER",
			type_id: "INTEGER",
		}
	});
	
	// Totals have 1 type: daily, weekly or forever
	var Type = new Model(db, "Type", {
		table_name: "types",
		columns: {
			_order: ["id", "type"],
			id: "INTEGER PRIMARY KEY",
			type: "VARCHAR"
		},
		indexes: []
	});
	
	var RecipientPercent = new Model(db, "RecipientPercent", {
		table_name: "recipientpercent",
		columns: {
			_order: ["id", "recipient_id", "percent"],
			id: "INTEGER PRIMARY KEY",
			recipient_id: "INTEGER",
			percent: "REAL"
		},
		indexes: []
	});
	
	return {
        _order: ["Site", "SiteGroup", "Recipient", 
				 "Category", "Tag", //"SiteGroupTagging",
				 "Visit", "DailyVisit", "Total", "Type", "RecipientPercent"],
        
        Site: Site,
		SiteGroup: SiteGroup,
		
		Recipient: Recipient,
		Category: Category,
		
        Tag: Tag,
        //SiteGroupTagging: SiteGroupTagging,
		
        Visit: Visit,
		DailyVisit: DailyVisit,
		Total: Total,
		
		Type: Type,
		RecipientPercent: RecipientPercent,
	};
}


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
