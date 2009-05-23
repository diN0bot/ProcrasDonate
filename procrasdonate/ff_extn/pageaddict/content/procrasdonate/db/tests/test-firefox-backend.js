repl.print("Hey!");
(function(){
eval(_include("pd/backends/sqlite3_firefox.js"));

Suite({
	test_Firefox_backend_is_present: function() {
		repl.print("test_Firefox_backend_is_present");
		assert.isTrue(!!Backend__Firefox);
	},
	
	test_Backend: function() {
		repl.print("test_Backend");
	},
	
	test_Cursor: function() {
		repl.print("test_Cursor");
		
		var C = function(value) {
			this.value = value;
			this.value_i = 0;
		};
		C.prototype = new Cursor;
		C.prototype._next = function() {
			var value = this.value[this.value_i];
			this.value_i++;
			return value;
		};
		
		//repl.print((new C([1,2,3])).next() == 1);
		//repl.print((new C([1,2,3])).fetchone() == 1);
		//repl.print((new C([1,2,3])).fetchmany(2) == [1,2]);
		//repl.print((new C([1,2,3])).fetchall() == [1,2,3]);
	},
	
	test_Statement: function() {
		repl.print("test_Statement");
		
		var db = new Backend__Firefox("test003.sqlite");
		
		var tables = {
			t0: "c0",
			t1: "c0",
			t2: "c0",
		};
		
		var queries = [];
		db.execute("select * from sqlite_master", {}, function(row) {
			//_print(row);
			queries.push("drop table " + row[1]);
		});
		
		for (var qi=0; qi<queries.length; qi++) {
			db.execute(queries[qi], {}, true)
		}
		
		db.execute("select * from sqlite_master", {}, function(row) {
			//_print(row);
		});
		
		for (var tname in tables) {
			db.execute("create table " + tname + "(" + tables[tname] + ")", {}, true)
		}
		
		db.execute("select * from sqlite_master", {}, function(row) {
			//_print(row);
		});
		
		for (var i=0; i<100; i++) {
			db.execute("insert into t0(c0) values (:c)", {c:i}, true);
		}
		db.execute("select c0 from t0", {}, function(row) {
			//_print(row);
		});
		db.execute("select sum(c0) from t0", {}, function(row) {
			//_print(row);
		});
		db.execute("select count(*) from t0", {}, function(row) {
			//_print(row);
		});
		
		assert.isTrue(db.close());
		//assert.isTrue(false);
	},
	
	
	test_connect_to_db: function() {
		repl.print("test_connect_to_db");
		var db = new Backend__Firefox();
		db.connect("test000.sqlite");
		
		assert.isTrue(db);
	},
	test_simple_statement: function() {
		repl.print("test_simple_statement");
	},
	test_cursor: function() {
		repl.print("test_cursor");
	},
	
	
	test_Model: function() {
		repl.print("test_Table");
		
		// Model.sql_create_table()
		assert.equals(
			Model.sql_create_table("t0", { c0: null, c1: "INTEGER" }),
			"CREATE TABLE t0 ( c0, c1 INTEGER )");
		
		var A_A = new Model(null, "A A", {
			columns: {
				b: null
			}
		});
		assert.equals(
			A_A.table_name,
			"a_a");
		assert.equals(
			A_A.sql_create_table(),
			"CREATE TABLE a_a ( b )");
		assert.equals(
			A_A.sql_drop_table(),
			"DROP TABLE a_a");
	},
	
	test_Row: function() {
		repl.print("test_Row");
	},
	
	
	test_Site: function() {
		repl.print("test_Site");
		var count, rows;
		
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
		assert.equals(
			Site.sql_create_table(),
			"CREATE TABLE sites ( id INTEGER PRIMARY KEY, " +
				"name VARCHAR, url VARCHAR, url_re VARCHAR )");
		
		assert.equals(
			Site.sql_drop_table(),
			"DROP TABLE sites");
		
		Site.create_table();
		Site.drop_table();
		
		Site.create_table();
		Site.create({ name: "google", url: "www.google.com" });
		
		Site.select("select * from sites", function(row) {
			_print(row);
		});
		
		count = 0;
		Site.select({ id__gt: 0 }, function(row) { count ++; });
		assert.equals(count, 1);
		
		count = 0;
		Site.select({ id__gt: 1 }, function(row) { count ++; });
		assert.equals(count, 0);
		
		rows = Site.select({ id__gt: 0 });
		assert.equals(rows.length, 1);
		assert.equals(rows.toString(), 
					  [[1,"google","www.google.com",""]].toString());
		
		Site.drop_table();
		
		assert.isTrue(db.close());
	},
	
	test_Tag: function() {
		repl.print("test_Tag");
		var count, rows;
		
		var db = new Backend__Firefox();
		db.connect("test000.sqlite");
		
		var Tag = new Model(db, "Tag", {
			table_name: "tags",
			columns: {
				_order: ["id", "tag"],
				id: "INTEGER PRIMARY KEY",
				tag: "VARCHAR"
			},
			indexes: []
		});
		assert.equals(
			Tag.sql_create_table(),
			"CREATE TABLE tags ( id INTEGER PRIMARY KEY, " +
				"tag VARCHAR )");
		
		assert.equals(
			Tag.sql_drop_table(),
			"DROP TABLE tags");
		
		Tag.create_table();
		Tag.drop_table();
		
	},
	
	test_SiteTagging: function() {
		repl.print("test_SiteTagging");
		var count, rows;
		
		var db = new Backend__Firefox();
		db.connect("test000.sqlite");
		
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
		assert.equals(
			SiteTagging.sql_create_table(),
			"CREATE TABLE sitetaggings ( id INTEGER PRIMARY KEY, " +
				"site_id INTEGER, tag_id INTEGER )");
		
		assert.equals(
			SiteTagging.sql_drop_table(),
			"DROP TABLE sitetaggings");
		
		SiteTagging.create_table();
		SiteTagging.drop_table();
		
	},
	
	test_Visit: function() {
		repl.print("test_Visit");
		var count, rows;
		
		var db = new Backend__Firefox();
		db.connect("test000.sqlite");
		
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
		assert.equals(
			Visit.sql_create_table(),
			"CREATE TABLE visits ( id INTEGER PRIMARY KEY, " +
				"site_id INTEGER, enter_at INTEGER, leave_at INTEGER )");
		
		assert.equals(
			Visit.sql_drop_table(),
			"DROP TABLE visits");
		
		Visit.create_table();
		Visit.drop_table();
		
	},
});
})();