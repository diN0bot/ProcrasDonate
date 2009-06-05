
//eval(_include("pd/backends/base.js"));


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
_extend(Field.prototype, {
	
});

var Model = function(db, name, opts, instance_opts, class_opts) {
	// Usage:
	// var Site = new Model({
	//     columns: {
	//         id: "INTEGER",
	//         site_id: "INTEGER",
	//         enter_at: "DATETIME",
	//         duration: "DATETIME"
	//     },
	//     indexes: ["id", ["site_id", "duration"]],
	// });
	//var opts = Array.prototype.slice.call(arguments, 1);
	this.db = db;
	this.name = name;
	this.opts = opts;
	this.instance_opts = instance_opts || {};
	this.class_opts = class_opts || {};
	this.columns = opts.columns;
	this.indexes = opts.indexes || [];
	this.table_name = opts.table_name || this.name.toLowerCase().replace(/\s+/, '_');
	
	//this.row_factory = RowFactory(this.columns);
	this.row_factory = make_row_factory(this.columns, this.instance_opts);
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
	
	select: function(query, fn, order_by) {
		/*
		 * @param query: string to execute, eg select * from sites where id=22
		 * 		or object of key,values for where clause.
		 *      empty object will return all rows
		 * @param fn: function(row) to execute on each row (optional)
		 * @param orer_by: name of column to order results by (optional)
		 * 		not applicable of query is sql statement
		 */
		logger(" the order_by:::"+order_by);
		query = this.sql_select.apply(this, [query, order_by]);
		logger(" sqlite3_firefox.js::select query="+query+" order_by="+order_by);
		var row_factory = this.row_factory;
		fn = fn || function(row){ return row; };
		function fn2(row) {
			//logger(row);
			return fn(new row_factory(row));
		}
		if (typeof(query) == "string") {
			return this.db.execute(query, {}, fn2);
		} else if (typeof(query) == "object" && !!query) {
			if (query.constructor == Array) {
				if (query.length == 2) {
					return this.db.execute(query[0], query[1], fn2);
				} else {
					throw new Error("Don't know how to handle column '" + 
								name + "' of type: " + type);
				}
			} else {
				throw new Error("Don't know how to handle column '" +
							name + "' of type: " + type);
			}
		} else {
			throw new Error("Don't know how to use query: " + query);
		}
	},
	sql_select: function(query, order_by) {
		logger("sql_select="+order_by);
		var sql=[], slots=[], params=[];
		if (typeof(query) == "string") {
			// execute the sql query
			return query;
		} else if (typeof(query) == "number") {
			// select by primary key if primary key is a number
			
		} else if (typeof(query) == "object" && !!query) {
			if (query.constructor == Array) {
				
			} else {
				//logger("sql_select 1");
				self = this;
				_iterate(query, function(name, value, i) {
					//logger(" sqlite3_firefox.js::select query params: "+[name, value, i]);
					var si, step, oper, path;
					path = name.split(/__/);
					
					// For first 'step', check for valid field names
					step = path[0];
					if (self.columns[step] === undefined) {
						throw Error("Invalid field '" + name + "'in query: " + query);
					}
					
					oper = path[1];
					if (oper == "" || oper === undefined)
						oper = "eq";
					if (Model.operators[oper] === undefined) {
						throw Error("Invalid operator '" + oper + "'in query: " + query);
					}
					
					var clause = Model.operators[oper](step, "?")
					sql.push(clause);
					params.push(value);
					
				});
				if (!isEmpty(params)) {
					sql = ["SELECT * FROM", this.table_name, "WHERE", sql.join(" AND ")];
				} else {
					sql = ["SELECT * FROM", this.table_name];
				}
				if (order_by) {
					var desc = false;
					if (order_by[0] == "-") {
						order_by = order_by.substring(1);
						desc = true;
					}
					sql.push("order by");
					sql.push(order_by);
					if (desc) {
						sql.push("DESC");
					}
					//@TODO throw error if order by column is not a column of this table
				}
				sql = sql.join(" ");
				logger(" THE SQL:::"+sql);
				return [sql, params];
			}
		} else {
			throw new Error("Don't know how to use query: " + query);
		}
	},
	
	create: function(values) {
		var ret = this.db.execute(this.sql_create.apply(this, [values]), values);
		ret = this.select(values)[0];
		//logger(" sqlite3_firefox.js::create: ret="+ ret);
		return ret;
	},
	sql_create: function() {
		var args, query=[], names=[], slots=[];
		args = Array.prototype.slice.call(arguments);
		
		if (args.length == 0) {
			throw new Error("Don't know how to use query: " + query);
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
				throw new Error("Don't know how to handle column '" +
							name + "' of type: " + type);
			}
		} else {
			throw new Error("Don't know how to use query: " + query);
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
	
	/*
	 * @param query: OBJECT of column name, value
	 */
	set: function(updates, wheres) {
		var str = "UPDATE "+this.table_name+" SET ";
		var is_first = true;
		for (var col in updates) {
			if (is_first) { is_first = false; }
			else { str += ", "; }
			str += col+"="+updates[col];

		}
		str += " WHERE ";
		is_first = true;
		for (var col in wheres) {
			if (is_first) { is_first = false; }
			else { str += " AND "; }
			str += col+"=";
			// adding quotes is necessary!
			if (isString(wheres[col])) {
				str += "\""+wheres[col]+"\"";
			} else {
				str += wheres[col];
			}
		}
		str += ";";
		logger(" sqlite3_firefox::set sql query="+str);
		this.db.execute(str);
	},
	
	//DELETE from [table name] where [field name] = 'whatever';
	del: function(query) {
		var str = "DELETE from "+this.table_name+" where ";
		is_first = true;
		for (var col in query) {
			if (is_first) { is_first = false; }
			else { str += " AND "; }
			str += col+"=";
			// adding quotes is necessary!
			if (isString(wheres[col])) {
				str += "\""+wheres[col]+"\"";
			} else {
				str += wheres[col];
			}
		}
		str += ";"
		this.db.execute(str);
	},
	
	order_by: function(query, fn, order_bys) {
		
	},
	
	get_or_create: function(query, defaults) {
		/* uses get_or_null to retrieve row.
		 * if null, creates using defaults.
		 * @return: row
		 */
		var ary = this.select(query);
		var row = null;
		if (ary.length == 0) {
			
			/*var combined = query;
			for (var prop in defaults) {
				combined[prop] = defaults[prop];
			}*/
			row = this.create(_extend(query, defaults));
		} else {
			row = ary[0];
		}
		return row;
	},
	
	get_row_factory: function() {
		
	},
	
	count: function() {
		return this.db.execute("select count(*) from "+this.table_name);
	},
	
	get_or_null: function(query, fn) {
		/* returns row or null if none found */
		var ary = this.select(query, fn);
		if (ary.length == 0) {
			return null;
		} else {
			if (ary.length > 1) {
				logger("get_or_null found "+ary.length+" rows for "+query);
			}
			return ary[0];
		}
	}
});
_extend(Model, {
	sql_create_table: function(name, columns) {
		var sql = []; //"CREATE TABLE", name, "("];
		_iterate(columns, function(name, type, i) {
			if (parseInt(name)) {
				if (typeof(type) == "string") {
					sql.push(type);
				} else {
					throw new Error("Don't know how to handle column '" + 
								name + "' of type: " + type);
				}
			} else if (typeof(name) == "string") {
				if (type === undefined || type == null) {
					sql.push(name);
				} else if (typeof(type) == "string") {
					sql.push("" + name + " " + type);
				} else {
					throw new Error("Don't know how to handle column '" + 
								name + "' of type: " + type);
				}
			} else {
				throw new Error("Don't know how to handle column '" +
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

function make_row_factory(columns, prototype) {
	var Factory = function(values) {
		this._values = values;
	};
	Factory.prototype = {
		toString: function() {
			var self = this;
			var ret = [];
			_iterate(columns, function(name, value, i) {
				ret.push(name + "=" + self[name]);
			});
			return ret.join(", ");
		}
	};
	
	_iterate(columns, function(name, type, i) {
		Factory.prototype.__defineGetter__(name, function() {
			return this._values[i];
		});
		Factory.prototype.__defineSetter__(name, function(value) {
			this._values[i] = value;
			return this._values[i];
		});
	});
	
	_extend(Factory.prototype, prototype);
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


