
var db = new Backend__Firefox();
db.connect("test010.sqlite");

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
	
}, {
	// Model-class methods
	
});

var SiteGroup = new Model(db, "SiteGroup", {
	table_name: "sitegroups",
	columns: {
		_order: ["id", "name", "host", "url_re"],
		id: "INTEGER PRIMARY KEY",
		name: "VARCHAR",
		host: "VARCHAR",
		url_re: "VARCHAR"
	},
	indexes: []
});

var Tag = new Model(db, "Tag", {
	table_name: "tags",
	columns: {
		_order: ["id", "tag"],
		id: "INTEGER PRIMARY KEY",
		tag: "VARCHAR"
	},
	indexes: []
});

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

var Visit = new Model(db, "Visit", {
	table_name: "visits",
	columns: {
		_order: ["id", "site_id", "enter_at", "leave_at"],
		id: "INTEGER PRIMARY KEY",
		site_id: "INTEGER",
		enter_at: "INTEGER", //"DATETIME",
		leave_at: "INTEGER", //"DATETIME"
	},
	indexes: []
});
