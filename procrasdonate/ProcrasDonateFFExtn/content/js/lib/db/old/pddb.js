
//$require("utils.utils");

/*
 * Useful methods:
 *  - dbConn.executeSimpleSQL("CREATE TEMP TABLE table_name (column_name INTEGER)");
 *  - var statement = dbConn.createStatement("SELECT * FROM table_name WHERE column_name = :parameter");
 *  - 
 */

statement.executeAsync({
  handleResult: function(aResultSet) {
    for (let row = aResultSet.getNextRow();
         row;
         row = aResultSet.getNextRow()) {

      let value = row.getResultByName("column_name");
    }
  },

  handleError: function(aError) {
    print("Error: " + aError.message);
  },

  handleCompletion: function(aReason) {
    if (aReason != Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED)
      print("Query canceled or aborted!");
  }
});
statement.finalize();

var statement = dbConn.createStatement("SELECT * FROM table_name");
try {
  while (statement.step()) {
    // Use the results...
  }
}
finally {
  statement.reset();
}


function StatementTemplate() {
	this.init = function(s, defaults, types) {
		defaults = defaults || {};
		types = types || {};
		
		this.s = s;
		this.defaults = defaults;
		this.types = types;
		
		this.params = [];
		var param_re = /:(\w+)/;
		
		var pname = param_re(s);
		while (pname) {
			this.params.push(pname);
		}
		
		for (var i=0; i<params.length; i++) {
			var pname = params[i];
			if (typeof(this.types[pname]) == "undefined") {
				this.types[pname] = DB.TYPES.ANY;
			}
			if (typeof(this.defaults[pname]) == "undefined") {
				this.defaults[pname] = null;
			}
		}
	}
	
	this.next = function() {
		throw("Statement().next() not yet implemented.");
	}
	
	this.fetchone = function() {
		return this.next();
	}
	this.fetchmany = function(count) {
		var ret = [];
		var cur = this.next();
		for (var i=0; cur && i<count; i++) {
			ret.push(cur);
			cur = this.next();
		}
		return ret;
	}
	this.fetchall = function() {
		var ret = [];
		var cur = this.next();
		while (cur) {
			ret.push(cur);
			cur = this.next();
		}
		return ret;
	}
	
	this._init.apply(this, arguments);
}

function Statement(dbconn, sql, defaults) {
	this.dbconn = dbconn;
	this.sql = sql;
	this.defaults = defaults;
	
	this._prepParameter = function(pname) {
		pname = pname.slice(1);
		if (typeof(this.defaults[pname]) == "undefined") {
			this.params[pname] = null;
		} else {
			this.params[pname] = this.defaults[pname];
		}
		this.__defineGetter__(pname, function() { return this.params[pname]; });
		this.__defineSetter__(pname, function(v) { this.params[pname] = v; });
	}
	
	this.columns = [];
	
	function getter_for_type(ctype) {
		var t = ctype.toLowerCase();
		if (t.slice(0,3) == "int") {
			return this.statement.getInt32;
		} else if (t == "varchar" || t.slice(0,4) == "char") {
			return this.statement.get
		} else {
			throw("Cannot normalize type: " + ctype);
		}
	}
	
	function get_current_row() {
		var S = this.statement;
		var row = [];
		for (var i=0; i<S.columnCount; i++) {
			var ctype = S.getTypeOfIndex(i);
			switch (ctype) {
			case S.VALUE_TYPE_NULL:
				row[i] = null;
				break;
			case S.VALUE_TYPE_INTEGER:
				row[i] = S.getInt32(i);
				//row[i] = S.getInt64(i);
				break;
			case S.VALUE_TYPE_FLOAT:
				row[i] = S.getDouble(i);
				break;
			case S.VALUE_TYPE_TEXT:
				row[i] = S.getUTF8String(i);
				//row[i] = S.getString(i);
				break;
			case S.VALUE_TYPE_BLOB:
				row[i] = S.getBlob(i);
				break;
			default:
				throw("Invalid column type \"" + ctype + "\" for column " + i);
			}
			var cname = S.getColumnName(i);
			row[cname] = row[i];
		}
		return row;
	}
	
	function get_all_rows() {
		var S = this.statement;
		var rows = [];
		try {
			while (S.executeStep()) {
				// Use the results...
				rows.push(this.get_current_row());
			}
		}
		finally {
			S.reset();
		}
		return rows;
	}
	
	for (var i=0; i<this.statement.columnCount; i++) {
		var cname = this.statement.getColumnName(i);
		var ctype = this.statement.getColumnDecltype(i);
		
		if (ctype == 
		
		this.columns[cname] = ctype;
	}
	
	this.Row = function() {
		
	}
	
	this.params = {};
	this.statement = this.dbconn.createStatement(sql);
	
	for (var i=0; i<this.statement.parameterCount; i++) {
		var pname = this.statement.getParameterName(i);
		this._prepParameter(pname);
	}
	
}

var Statement = Class.extend({
	init: function(dbconn, sql, defaults) {
		this.sql = sql;
		this.defaults = defaults;
		
		this.params = {};
		this.statement = dbconn.createStatement(sql);
		for (var i=0; i<this.statement.parameterCount; i++) {
			var pname = this.statement.getParameterName(i);
			this._prepParameter(pname);
			
		}
	},
	_prepParameter: function(pname) {
		pname = pname.slice(1);
		if (typeof(this.defaults[pname]) == "undefined") {
			this.params[pname] = null;
		} else {
			this.params[pname] = this.defaults[pname];
		}
		this.__defineGetter__(pname, function() { return this.params[pname]; });
		this.__defineSetter__(pname, function(v) {
			this.statement.
			this.params[pname] = v;
		});
	}
});

var DB = Class.extend({
	init: function(connection) {
		this.connection = connection;
		this.tables = {};
		
	},
	
	inspectTables: function() {
		
	},
	
	createTable: function(name, columns) {
		var create_table_sql = ["CREATE TABLE :table_name ("];
		
		var columns_sql = iterate(columns, function(name, options) {
				return "" + column_name + " " + column_options;
			});
		
		var sql = create_table_sql + columns_sql.join(", ") + ");";
		var statement = this.connection.createStatement(sql);
		
		var statement = this.connection.createStatement(
				"CREATE TABLE :table_name (",
				columns.join(", "),
				");");
		
		
	},
});


var Table = Class.extend({
	init: function() {
		
	},
	_init_columns: function(columns) {
		for (var name in columns) {
			this[name] = columns;
		}
	},
	create: function() {
		
	},
	
	sql_create: function(name, columns) {
		var sql = ["CREATE TABLE", name, "("]
		if (isArray(columns)) {
			for (var i=0; i<columns.length; i++) {
				sql.push(columns[i], ",");
			}
		} else if isObject(columns) {
			for (var name in columns) {
				sql.push(name, columns[name], ",");
			}
		} else {
			throw Error("Unknown column specification:", columns);
		}
		
		for (var i in columns) {
		sql.push(")");
		return sql.join(" ");
	},
	
	get_or_create: function() {
		
	},
},{
	columns: null,
	indexes: null,
	
});

var Row = Class.extend({
	__init: function() {
		var args = Array.prototype.slice.call(arguments);
		var first = args[0];
		if (isArray(args[0])) {
			this._init_values(zip(this.table.columns, args[0]));
		} else if (isObject(args[0])) {
			this._init_values(args[0]);
		} else if (args.length > 1) {
			this._init_values(zip(this.table.columns, args));
		} else {
			throw(Error());
		}
	},
	_init_values: function(values) {
		if (isArray(values)) {
			for (var i in values) {
				var key = values[i][0],
				    value = values[i][1];
				this[key] = value;
				//this[values[i][0]] = values[i][1];
			}
		} else if (isObject(values)) {
			for (var key in values) {
				this[key] = values[key];
			}
		} else {
			throw(Error());
		}
	},
});

var RowSet = Class.extend({
	__init: function() {
		var args = Array.prototype.slice.call(arguments);
		
	},
});

