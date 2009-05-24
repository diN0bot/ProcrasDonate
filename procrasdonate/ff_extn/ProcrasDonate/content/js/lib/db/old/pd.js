

var TABLES = {
	_order: ["sites", "visits", "tags", "site_taggings"],
	sites: {
		_order: ["id", "name", "url_re"],
		id: "INTEGER",
		name: "VARCHAR",
		url_re: "VARCHAR", // Potentially very long...
		},
	visits: {
		_order: ["id", "site_id", "enter_at", "leave_at"],
		id: "INTEGER",
		site_id: "INTEGER",
		enter_at: "DATETIME",
		leave_at: "DATETIME"
		},
	tags: {
		_order: ["id", "tag"],
		id: "INTEGER",
		tag: "VARCHAR"
		},
	site_taggings: {
		_order: ["id", "site_id", "tag_id"],
		id: "INTEGER",
		site_id: "INTEGER",
		tag_id: "INTEGER"
		}
	};

function iter_pairs(iterable, fn) {
	var ret = [];
	if (iterable._order) {
		for (var i in iterable._order) {
			var key = iterable._order[i];
			var value = iterable[key];
			ret.push(fn(key, value, i));
		}
	} else {
		var i=0;
		for (var key in iterable) {
			var value = iterable[key];
			ret.push(fn(key, value, i));
			i++;
		}
	}
	return ret;
}

var init_db = function() {
	
};

var init_tables = function() {
	
};

var Site = new Table("site", {
	columns: {
		_order: ["id", "name", "url_re"],
		id: "INTEGER",
		name: "VARCHAR",
		url_re: "VARCHAR", // Potentially very long...
	},
});

var Visit = new Table("visit", {
	columns: {
		_order: ["id", "site_id", "enter_at", "leave_at"],
		id: "INTEGER",
		site_id: "INTEGER",
		enter_at: "DATETIME",
		leave_at: "DATETIME"
	},
});

var Tag = new Table("tag", {
	columns: {
		_order: ["id", "tag"],
		id: "INTEGER",
		tag: "VARCHAR"
	},
});

var SiteTagging = new Table("site_tagging", {
	columns: {
		_order: ["id", "site_id", "tag_id"],
		id: "INTEGER",
		site_id: "INTEGER",
		tag_id: "INTEGER"
	},
});



var Site = Table.extend({
	fields: {
		id: new IntegerField(),
		
	},
	
	init: function(name, url_re) {
		
	},
	Row: Row.extend({
		
	}),
	
},{
	columns: TABLES["sites"],
	
});

var Tag = Table.extend({
	init: function(tag) {
		
	},
},{
	columns: TABLES["tags"],
	
});

var SiteTagging = Table.extend({
	init: function(site_id, tag_id) {
		
	},
},{
	columns: TABLES["site_taggings"],
	
};

var Visit = Table.extend({
	init: function(site, datetime) {
		
	},
},{
	columns: TABLES["visits"],
};




