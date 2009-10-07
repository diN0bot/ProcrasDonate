_include("base.js");

function PythonSQLite3_backend() {
	// 
	// 
	//
	function loadDatabase(db_name) {
		db_name = db_name || ":memory:";
		
		var db_conn = _Python.sqlite3.connect(db_name);
		return db_conn;
	}
	
	function prepare_params(params) {
		var ret = null;
		params = params || null;
		if (isArray(params)) {
			var list = _Python.list();
			for (var i in params) {
				var value = params[i];
				list.append(value);
			}
			ret = list;
		} else if (isObject(params)) {
			var list = _Python.list();
			for (var key in params) {
				var value = params[key];
				list.append(_Python.tuplefy(key, value))
			}
			ret = _Python.dict(list);
		} else {
			throw Error();
		}
		return ret;
	}
	
	var Cursor = function Cursor__Python(db_conn) {
		this.conn = db_conn;
		this.cursor = this.conn.cursor();
	};
	
	Cursor.prototype.execute = function(sql, params) {
		var tmp_cursor;
		if (!!params) {
			py_params = prepare_params(params);
			tmp_cursor = this.cursor.execute(sql, py_params);
		} else {
			tmp_cursor = this.cursor.execute(sql);
		}
		
		//if (!(this.cursor == tmp_cursor)) {
		//	throw Error("Cursor returned does not match current cursor!", this.cursor, tmp_cursor)
		//}
		
		return this;
	};
	Cursor.prototype.next = function() {
		return this.cursor.fetchone();
	};
	Cursor.prototype.fetchone = function() {
		return this.cursor.fetchone();
	};
	Cursor.prototype.fetchall = function() {
		return this.cursor.fetchall();
	};
	Cursor.prototype.fetchmany = function(count) {
		return this.cursor.fetchmany(count);
	};
	
	this.connect = function(db_name) {
		this.conn = loadDatabase(db_name);
		return this;
	};
	this.cursor = function() {
		return new Cursor(this.conn);
	};
	
	var Statement = function(connection, sql, defaults, types) {
		this.conn = connection;
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
	}
	Statement.prototype.clone = function() {
		return new Statement(this.conn, this.sql, this.params(), this.types);
	};
	//Statement.prototype.map_params = function(fn) {
	//	var match, ret={};
	//	match = this.param_re(this.sql);
	//	while (match) {
	//		var name = match[1];
	//		ret[match[1]] = fn(match[1]);
	//	}
	//	return ret;
	//};
	//Statement.prototype.each_param = function(fn) {
	//	var ret = [];
	//	var match = this.param_re(this.sql);
	//	while (match) {
	//		var name = match[1];
	//		ret.push(fn(match[1]));
	//	}
	//	return ret;
	//};
	Statement.prototype.keys = function() {
		//return this.each_param(function(name) { return name; });
		var ret = [];
		var match = this.param_re(this.sql);
		while (match) {
			var name = match[1];
			ret.push(name);
		}
		return ret;
	};
	Statement.prototype.values = function() {
		//return this.each_param(function(name) { return this[name]; });
		var ret = [];
		var match = this.param_re(this.sql);
		while (match) {
			var name = match[1];
			ret.push(this.data[name]);
		}
		return ret;
	};
	Statement.prototype.params = function() {
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
	};
	
	Statement.prototype.render = function() {
		var last_index = 0;
		var parts = [];
		var match = this.param_re(this.sql);
		while (match) {
			var match_str = match[0];
			var name = match[1];
			parts.push(this.sql.slice(last_index, this.param_re.lastIndex - match_str.length));
			last_index = this.param_re.lastIndex;
			parts.push(this[name]); //using the getter
			match = this.param_re(this.sql);
		}
		parts.push(this.sql.slice(last_index, this.sql.length));
		var ret = parts.join("");
		return ret;
	};
	
	Statement.prototype.execute = function() {
		//var cursor = new Cursor(this.conn);
		return this.conn.cursor().execute(this.sql, this.params());
	}
	
	this.statement = function(sql, defaults, types) {
		return new Statement(this, sql, defaults, types);
	}
}
