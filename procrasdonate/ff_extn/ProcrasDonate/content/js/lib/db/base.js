var BASE_LOGGING = false;
//_include("lib/utils/log.js")

function ERROR(msg, obj) {
	_print(msg);
	_print(Array.slice(arguments, 1));
}
//eval(_include("lib/utils/istype.js"));


function SQLite3_backend() {
	this.TYPES = {
		NULL: 0,
		INTEGER: 1,
		REAL: 2,
		TEXT: 3,
		BLOB: 4
	};
}

function Backend() {
	this.statements = [];
	this.cursors = [];
	this.conn = null;
	
	this.Statement = Statement;
	this.Cursor = Cursor;
};

Backend.prototype = {};
_extend(Backend.prototype, {
	loadDatabase: function(db_name) {
		throw "loadDatabase not implemented";
	},
	close: function() {
		for (var ci=0; ci<this.cursors.length; ci++) {
			var cursor = this.cursors[ci];
			if (!cursor.finalized()) {
				return false;
			}
		}
		for (var si=0; si<this.statements.length; si++) {
			var statement = this.statements[si];
			if (!statement.finalized()) {
				return false;
			}
		}
		return true;
	},
	connect: function(db_name) {
		this.conn = this.loadDatabase(db_name);
		return this;
	},
	cursor: function() {
		var cursor = new (this.Cursor)(this);
		this.cursors.push(cursor);
		return cursor; // new (this.Cursor)(this.conn);
	},
	statement: function(sql, defaults, types) {
		var statement = new (this.Statement)(this, sql, defaults, types);
		this.statements.push(statement);
		return statement;
	},
	execute: function(sql, params, fn) {
		var cursor = this.cursor();
		fn = fn || function(row) { return row; };
		if (!fn) {
			var r = cursor.execute(sql, params);
			if (BASE_LOGGING) logger("base.js::execute: r="+r);
			return r;
		} else {
			var ret = [];
			try {
				cursor = cursor.execute(sql, params)
				var row = cursor.next();
				while (row) {
					ret.push(fn(row));
					row = cursor.next();
				}
			//} catch (e) {
			} finally {
				cursor.reset();
				cursor.finalize();
			}
			if (BASE_LOGGING) logger("base.js::execute: ret="+ret);
			return ret;
		}
	},
});


function Cursor(connection) {
	this.connection = connection;
};
Cursor.prototype = {};
_extend(Cursor.prototype, {
	next: function() {
		return this._next();
		//throw("Statement().next() not yet implemented.");
	},
	_next: function() {
		//this.statement.executeStep()
		throw("Statement()._next() not yet implemented.");
	},
	fetchone: function() {
		return this._next();
	},
	fetchmany: function(count) {
		var ret = [];
		var cur = this._next();
		for (var i=0; cur && i<count; i++) {
			ret.push(cur);
			cur = this._next();
		}
		return ret;
	},
	fetchall: function() {
		var ret = [];
		var cur = this._next();
		while (cur) {
			ret.push(cur);
			cur = this._next();
		}
		return ret;
	},
	reset: function() {
	},
	finalize: function() {
	},
	finalized: function() {
		return true;
	}
});


var Statement = function(db, sql, defaults, types) {
	this.db = db;
	this.sql = sql;
	this.defaults = defaults || {};
	this.types = types || {};
	
	this.param_re = /:(\w+)/g;
	this.data = {};
	
	var match = this.param_re(this.sql);
	while (match) {
		var name = match[1];
		var default_value = this.defaults[name] || null;
		var typer = this.types[name] || TYPES.object;
		
		this.__defineGetter__(name, typer.getter(name, default_value));
		this.__defineSetter__(name, typer.setter(name));
		match = this.param_re(this.sql);
	}
};
Statement.prototype = {};
_extend(Statement.prototype, {
	clone: function() {
		return new Statement(this.db, this.sql, this.params(), this.types);
	},
	
	//map_params: function(fn) {
	//	var match, ret={};
	//	match = this.param_re(this.sql);
	//	while (match) {
	//		var name = match[1];
	//		ret[match[1]] = fn(match[1]);
	//	}
	//	return ret;
	//},
	//each_param: function(fn) {
	//	var ret = [];
	//	var match = this.param_re(this.sql);
	//	while (match) {
	//		var name = match[1];
	//		ret.push(fn(match[1]));
	//	}
	//	return ret;
	//},
	
	keys: function() {
		//return this.each_param(function(name) { return name; });
		var ret = [];
		var match = this.param_re(this.sql);
		while (match) {
			var name = match[1];
			ret.push(name);
		}
		return ret;
	},
	values: function() {
		//return this.each_param(function(name) { return this[name]; });
		var ret = [];
		var match = this.param_re(this.sql);
		while (match) {
			var name = match[1];
			ret.push(this.data[name]);
		}
		return ret;
	},
	
	params: function() {
		//return this.map_params(function(name) { return this[name]; })
		var ret = {};
		var match = this.param_re(this.sql);
		while (match) {
			var match_str = match[0];
			var name = match[1];
			ret[name] = this[name]; // using the getter
			match = this.param_re(this.sql);
		}
		return ret;
	},
	
	render: function(values) {
		values = values || {};
		var last_index = 0;
		var parts = [];
		var match = this.param_re(this.sql);
		while (match) {
			var match_str = match[0];
			var name = match[1];
			parts.push(this.sql.slice(last_index, this.param_re.lastIndex - match_str.length));
			last_index = this.param_re.lastIndex;
			parts.push(values[name] || this[name]); //using the getter
			match = this.param_re(this.sql);
		}
		parts.push(this.sql.slice(last_index, this.sql.length));
		var ret = parts.join("");
		return ret;
	},
	
	execute: function() {
		//var cursor = new Cursor(this.db);
		return this.db.cursor().execute(this.sql, this.params());
	},
});



var TYPES = {};

function Typer(type_name, opts) {
	this.type_name = type_name;
	
	opts = opts || {};
	
	if (opts.getter) this.getter = opts.getter;
	if (opts.setter) this.setter = opts.setter;
	//if (opts.serializer) this.serializer = opts.serializer;
	//if (opts.deserializer) this.deserializer = opts.deserializer;
	
	TYPES[this.type_name] = this;
}
Typer.prototype = {};
_extend(Typer.prototype, {
	getter: function(name, default_value) {
		return function() {
			return this.data[name] || this.defaults[name];
			//if (this.data[name] == null)
			//	default_value;
			//else
			//	return this.data[name];
		};
	},
	setter: function(name) {
		return function(value) {
			return this.data[name] = value; 
		};
	},
	serializer: function(name) {
		return function(value) { return value.toString(); };
	},
	deserializer: function(name) {
		return function(str) { return str; };
	},
});

new Typer("object", {});
new Typer("int", {
	deserializer: parseInt,
});
new Typer("float", {
	deserializer: parseFloat,
});
new Typer("str", {});
new Typer("bool", {});

/*

//var Table = function(name, opts) {
//	this.name = name;
//	this.opts = opts;
//	
//	this.columns = this.opts.columns;
//	
//	this.init_table();
//	this.init_statements();
//};
//Table.prototype.init_table = function() {
//	var check_statement = new Statement(
//		"SELECT count(*) FROM sqlite_master WHERE name=:name",
//		{ name: this.name });
//	var cursor = check_statement.execute();
//	if (cursor.fetchall().length == 0) {
//		var columns_sql = [];
//		iter(this.columns, function(name, type) {
//			columns_sql.push(name, type);
//		});
//		var sql = ["CREATE TABLE", name, "(", columns_sql.join(", "), ")"];
//		var create_table_statement = new Statement(sql.join(" "));
//		create_table_statement.execute();
//	}
//};
//Table.prototype.init_statements = function() {
//	iter(this.columns, function(name, type) {
//		
//	});
//};
//Table.prototype.create = function(opts) {
//	
//};
//
//Table.prototype.sql_create = function(name, columns) {
//	var sql = ["CREATE TABLE", name, "("]
//	if (isArray(columns)) {
//		var first = true;
//		for (var i=0; i<columns.length; i++) {
//			if (!first) {
//				sql.push(",");
//			} else
//				first = false;
//			sql.push(columns[i]);
//		}
//	} else if (isObject(columns)) {
//		var first = true;
//		for (var name in columns) {
//			if (!first) {
//				sql.push(",");
//			} else 
//				first = false;
//			sql.push(name, columns[name]);
//		}
//	} else {
//		throw Error("Unknown column specification:", columns);
//	}
//	
//	sql.push(")");
//	return sql.join(" ");
//};
//
////var t = new Table();
////_print(t.sql_create("t0", ["c0","c1","c2"]));
//
//
*/
