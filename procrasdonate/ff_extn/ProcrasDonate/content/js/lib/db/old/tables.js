

var db = new Backend__Firefox();
db.connect("test000.sqlite");

var Site = new Model(db, "Site", {
	table_name: "sites",
	columns: {
		_order: ["id", "name", "url", "url_re"],
		id: "INTEGER PRIMARY KEY",
		name: "VARCHAR",
		url: "VARCHAR",
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

var SiteTagging = new Model(db, "SiteTagging", {
	table_name: "sitetaggings",
	columns: {
		_order: ["id", "site_id", "tag_id"],
		id: "INTEGER PRIMARY KEY",
		site_id: "INTEGER",
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





