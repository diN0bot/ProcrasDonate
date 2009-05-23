
eval(_include("pd/backends/base.js"));


var Backend__Firefox = function Backend__Firefox(filename) {
	Backend.apply(this, arguments);
	this.filename = filename;
	if (filename)
		this.connect(filename);
	
	this.Statement = Statement;
	this.Cursor = Cursor__Firefox;
};
Backend__Firefox.prototype = new Backend;
_extend(Backend__Firefox.prototype, {
	loadDatabase: function(filename) {
		var file = Components.classes["@mozilla.org/file/directory_service;1"].
		                      getService(Components.interfaces.nsIProperties).
		                      get("ProfD", Components.interfaces.nsIFile);
		file.append(filename);
		
		var storageService = Components.classes["@mozilla.org/storage/service;1"].
		                                getService(Components.interfaces.mozIStorageService);
	
		var db_conn = storageService.openDatabase(file);
		return db_conn;
	},
	
	close: function() {
		if (Backend.prototype.close.apply(this, [])) {
			this.conn.close();
			return true;
		} else
			return false;
	},
});


var Cursor__Firefox = function Cursor__Firefox(db) {
	this.db = db;
	this.conn = db.conn;
	this.stmt = null;
};
Cursor__Firefox.prototype = new Cursor;
_extend(Cursor__Firefox.prototype, {
	execute: function(sql, params) {
		//_print(sql);
		if (!this.stmt) {
			try {
				//this.stmt = this.db.statement(sql, params);
				this.stmt = this.conn.createStatement(sql, params);
				for (var pi=0; pi<this.stmt.parameterCount; pi++) {
					var pname = this.stmt.getParameterName(pi).slice(1);
					this.stmt.bindStringParameter(pi, params[pname]);
					//_print("set: " + pname + "(" + pi + ")" + " = " + params[pname]);
				}
			} catch (e) {
				//_print(e);
				_print(this.conn.lastErrorString);
			}
		}
		
		if (this.stmt) {
			this.has_value = this.stmt.executeStep();
			if (!this.has_value)
				this.reset();
		}
		
		return this;
	},
	
	extractRowObject: function() {
		var ci, columns = [], ret = {};
		for (ci=0; ci < this.stmt.columnCount; ci++) {
			var column_name = this.stmt.getColumnName(ci);
			columns.push(column_name);
			ret[column_name] = this.stmt.getString(ci);
		}
		return ret;
	},
	
	extractRowArray: function() {
		var ci, columns = [], ret = [];
		for (ci=0; ci < this.stmt.columnCount; ci++) {
			ret.push(this.stmt.getString(ci));
		}
		return ret;
	},
	
	_next: function() {
		var value = null;
		if (this.has_value) {
			//value = this.extractRowObject();
			value = this.extractRowArray();
			this.has_value = this.stmt.executeStep()
		}
		if (!this.has_value)
			this.reset();
		return value;
	},
	
	reset: function() {
		if (this.stmt)
			this.stmt.reset();
	},
	
	finalize: function() {
		if (this.stmt) {
			this.stmt.finalize();
			delete this.stmt;
		}
	},
	
	finalized: function() {
		return !this.stmt;
	},
});


var Field = function() {};
Field.prototype = {};
extend(Field.prototype, {
	
});

var Model = function(db, name, opts) {
	// Usage:
	// var Site = new Model({
	//     columns: {
	//         id: "INTEGER",
	//         site_id: "INTEGER",
	//         enter_at: "DATETIME",
	//         leave_at: "DATETIME"
	//     },
	//     indexes: ["id", ["site_id", "leave_at"]],
	// });
	//var opts = Array.prototype.slice.call(arguments, 1);
	this.db = db;
	this.name = name;
	this.opts = opts;
	this.columns = opts.columns;
	this.indexes = opts.indexes || [];
	this.table_name = opts.table_name || this.name.toLowerCase().replace(/\s+/, '_');
	
	this.row_factory = RowFactory(this.columns);
	
};
Model.prototype = {};
_extend(Model.prototype, {
	_init_columns: function(columns) {
		for (var name in columns) {
			this[name] = columns;
		}
	},
	__iter__: function() {
		return this.columns;
	},
	
	select: function(query, fn) {
		query = this.sql_select.apply(this, [query]);
		if (typeof(query) == "string") {
			return this.db.execute(query, {}, fn);
		} else if (typeof(query) == "object" && !!query) {
			if (query.constructor == Array) {
				if (query.length == 2) {
					return this.db.execute(query[0], query[1], fn);
				} else {
					throw ERROR("Don't know how to handle column '" + 
								name + "' of type: " + type);
				}
			} else {
				throw ERROR("Don't know how to handle column '" +
							name + "' of type: " + type);
			}
		} else {
			throw ERROR("Don't know how to use query: " + query);
		}
	},
	sql_select: function(query) {
		var sql=[], slots=[], params=[];
		if (typeof(query) == "string") {
			// execute the sql query
			return query;
		} else if (typeof(query) == "number") {
			// select by primary key if primary key is a number
			
		} else if (typeof(query) == "object" && !!query) {
			if (query.constructor == Array) {
				
			} else {
				self = this;
				_iterate(query, function(name, value, i) {
					var si, step, oper, path;
					path = name.split(/__/);
					
					// For first 'step', check for valid field names
					step = path[0];
					if (self.columns[step] === undefined) {
						throw ERROR("Invalid field '" + name + "'in query: " + query);
					}
					
					oper = path[1];
					if (oper == "")
						oper = "eq";
					if (Model.operators[oper] === undefined) {
						throw ERROR("Invalid operator '" + oper + "'in query: " + query);
					}
					
					var clause = Model.operators[oper](step, "?")
					sql.push(clause);
					params.push(value);
					
				});
				sql = ["SELECT * FROM", this.table_name, "WHERE", sql.join(" AND ")];
				sql = sql.join(" ");
				return [sql, params];
			}
		} else {
			throw ERROR("Don't know how to use query: " + query);
		}
	},
	
	create: function(values) {
		return this.db.execute(this.sql_create.apply(this, [values]), values);
	},
	sql_create: function() {
		var args, query=[], names=[], slots=[];
		args = Array.prototype.slice.call(arguments);
		
		if (args.length == 0) {
			throw ERROR("Don't know how to use query: " + query);
		} else if (args.length == 1) {
			if (typeof(args[0]) == "object" && !!args[0]) {
				_iterate(args[0], function(name, value) {
					names.push(name);
					slots.push(":" + name);
					//values.push(value);
				});
				query = ["INSERT INTO", this.table_name];
				if (names.length > 0)
					query.push("(", names.join(", "), ")");
				query.push("VALUES");
				if (slots.length > 0)
					query.push("(", slots.join(", "), ")");
				query = query.join(" ");
				return query;
				//return this.db.execute(query, args[0]);
			} else {
				throw ERROR("Don't know how to handle column '" +
							name + "' of type: " + type);
			}
		} else {
			throw ERROR("Don't know how to use query: " + query);
		}
	},
	
	create_table: function() {
		var sql = this.sql_create_table();
		return this.db.execute(sql);
	},
	sql_create_table: function() {
		return Model.sql_create_table(this.table_name, this.columns);
	},
	
	drop_table: function() {
		var sql = this.sql_drop_table();
		return this.db.execute(sql);
	},
	sql_drop_table: function() {
		return Model.sql_drop_table(this.table_name);
	},
	create_row: function() {
		
	},
	
	get_or_create_row: function() {
		
	},
	
	get_row_factory: function() {
		
	},
});
_extend(Model, {
	sql_create_table: function(name, columns) {
		var sql = []; //"CREATE TABLE", name, "("];
		_iterate(columns, function(name, type, i) {
			if (parseInt(name)) {
				if (typeof(type) == "string") {
					sql.push(type);
				} else {
					throw ERROR("Don't know how to handle column '" + 
								name + "' of type: " + type);
				}
			} else if (typeof(name) == "string") {
				if (type === undefined || type == null) {
					sql.push(name);
				} else if (typeof(type) == "string") {
					sql.push("" + name + " " + type);
				} else {
					throw ERROR("Don't know how to handle column '" + 
								name + "' of type: " + type);
				}
			} else {
				throw ERROR("Don't know how to handle column '" +
							name + "' of type: " + type);
			}
		});
		sql = ["CREATE TABLE", name, "(", sql.join(", "), ")"];
		sql = sql.join(" ");
		return sql;
	},
	sql_drop_table: function(name) {
		return "DROP TABLE " + name;
	},
	
	operators: {
		eq: function(name, slot) { slot = slot || "?"; return name + " = " + slot; },
		ne: function(name, slot) { slot = slot || "?"; return name + " != " + slot; },
		gt: function(name, slot) { slot = slot || "?"; return name + " > " + slot; },
		gte: function(name, slot) { slot = slot || "?"; return name + " >= " + slot; },
		lt: function(name, slot) { slot = slot || "?"; return name + " < " + slot; },
		lte: function(name, slot) { slot = slot || "?"; return name + " <= " + slot; },
		
		//like: function(name, slot) {
		//	slot = slot || "?"; return name + " = " + slot;
		//},
		//startswith: function(name, slot) {
		//	slot = slot || "?"; return name + " = " + slot;
		//},
		//endswith: function(name, slot) {
		//	slot = slot || "?"; return name + " = " + slot;
		//},
		
	},
});

function make_row_factory(columns) {
	var Factory = function(values) {
		this._values = values;
	};
	Factory.prototype = {};
	
	_iterate(columns, function(name, type, i) {
		Factory.prototype.__defineGetter__(name, function() {
			return this._values[name];
		});
		Factory.prototype.__defineSetter__(name, function(value) {
			this._values[name] = value;
			return this._values[name];
		});
	});
	
	return Factory;
}

function RowFactory(columns) {
	_iterate(columns, function(name, value) {
		
	});
};
RowFactory.prototype = {};
_extend(RowFactory.prototype, {
	
});

var Row = function Row__Firefox(cursor, types) {
	this.cursor = cursor;
	this.types = types || {};
	
};
Row.prototype = {};
_extend(Row.prototype, {
	columns: null,
	
	inspectColumns: function() {},
	extractColumns: function() {},
	
});


