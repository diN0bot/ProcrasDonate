

var Base = Class;

function isContext(o) {
	return o instanceof Context;
}

function get(o, attr, _default) {
	if (!attr) {
		return o;
	} else if (!o) {
		return _default || null;
	}
	_default = _default || null;
	
	if (isString(attr) && attr.match(/^\d+$/)) {
		attr = parseInt(attr);
	}
	
	var ret = _default;
	if (isContext(o)) {
		ret = o.get(attr) || _default;
		//return (ret != null && ret) || _default;
	} else if (isObject(o) || isArray(o)) {
		ret = (attr in o ? o[attr] : _default);
	} else {
		if (DEBUG_TEMPLATES)
			ERROR("Unhandled object type in 'get': "+o);
		return _default;
	}
	
	if (isFunction(ret))
		return ret.apply(o);
	else
		return ret;
	
}

var FILTERS = {
	upper: function(s) { return s.toUpperCase(); },
	lower: function(s) { return s.toLowerCase(); }, 
	join: function(list, separator) { 
		return list.join(separator); 
	},
	map_fields: function(o, field) { 
		var ret = [];
		for (var i=0; i<o.length; i++)
			ret.push(o[i][field]);
		return ret;
	},
	date:	function(s, format) { 
		return date_format(s, format); 
	},
	floatformat: function(s, size) {
		s = ff_test[ff_i % ff_test.length];
		ff_i += 1;
		if (size == undefined)
			size = -1;
		var ret = s.toFixed(size < 0 ? 0-size : size);
		return (size < 0 ? ret : parseFloat(ret));
	},
};

var Context = Base.extend({
	init: function(o) {
		o = o||{};
		this.stack = [o];
	},
	stack: null,
	
	get: function(attr) {
		for (var o in this.stack) {
			if (attr in this.stack[o])
				return this.stack[o][attr];
		}
		return undefined;
	},
	set: function(name, val) {
		for (var o in this.stack) {
			if (this.stack[o][attr]) {
				return (this.stack[o][attr] = val);
			}
		}
		return (this.stack[0][attr] = val);
	},
	assign: function(name, val) {
		return (this.stack[0][attr] = val);
	},
	
	push: function(o) {
		o = o||{};
		this.stack.unshift(o);
	},
	pop: function() {
		return this.stack.shift();
	},
	
});

var RequestContext = Context.extend({
	init: function(o) {
		this._super();
		for (var pi in settings.TEMPLATE_CONTEXT_PROCESSORS) {
			var processor = settings.TEMPLATE_CONTEXT_PROCESSORS[pi];
			this.push(RequestContext.process(processor));
		}
		this.push(o);
	},
},{
	process: function(o) {
		if (isFunction(o)) {
			try {
				return o();
			} catch (e) {
				if (DEBUG_TEMPLATES)
					ERROR(e, "Caught exception while processing context.");
				return {};
			}
		} else if (isString(o)) {
			try {
				return RequestContext.process(eval(o));
			} catch (e) {
				if (DEBUG_TEMPLATES)
					ERROR(e, "Caught exception while processing context.");
				return {};
			}
		} else {
			if (DEBUG_TEMPLATES)
				ERROR("Unhandled context processor: "+o);
			return {};
		}
	},
});

var Template = Base.extend({
	init: function(name) {
		name = name || Math.random(10000);
		Template.Cache[name] = this;
	},
	render: function() {
		if (DEBUG_TEMPLATES)
			ERROR("Undefined method Template#render()");
		return null;
	},
},{
	compile: function(o, name) {
		if (isString(o)) {
			return new StringTemplate(o, name);
		} else if (isObject(o)) {
			return new DjangoTemplate(o, name);
		} else {
			if (DEBUG_TEMPLATES)
				ERROR("Unknown template type: "+o);
		}
	},
	get: function(name) {
		var t = Template.Cache[name];
		if (t)
			return t;
		if (DEBUG_TEMPLATES)
			ERROR("Template.get: Failed to retrieve template '"+name+"'.");
	},
	load: function(names, fn) {
		if (!isArray(names)) 
			names = [names];
		var needed = [];
		for (var ni in names) {
			var n = names[ni];
			if (!Template.Cache[name])
				needed.push(n);
		}
		if (needed.length > 0) {
			var cb = function(data) { 
				for (var ti in data) { 
					var t = data[ti];
					Template.compile(t, ti);
				}
				if (fn)
					return fn();
			}
			JSON('get_template', cb, {'template_name':needed.join(',')});
		} else {
			if (fn)
				return fn();
		}
	},
	Cache: {},
	FILTERS: FILTERS,
});


var StringTemplate = Template.extend({
	init: function(s, name) {
		this._super(name);
		this.template = s;
	},
	render: function(o) {
		var out = [];
		var last = 0;
		var t = this.template;
		if (isArray(o)) {
			var i=0;
			var re = /%%|%s/g;
			while (m = re(t)) {
				out.push(t.substr(last, m.index - last));
				if (m[0] == "%%") { 
					out.push("%");
				} else {
					out.push(o[i]);
					i++;
				}
				last = m.index + m[0].length;
			}
		} else if (isObject(o) || isContext(o)) {
			var re = /%%|%\((\w+)\)s/g;
			while (m = re(t)) {
				out.push(t.substr(last, m.index - last));
				if (m[0] == "%%") { 
					out.push("%");
				} else {
					out.push(get(o,m[1]));
				}
				last = m.index + m[0].length;
			}
		}
		out.push(t.substr(last, t.length - last));
		return out.join("");
	},
});


var FunctionTemplate = Template.extend({
	init: function(fn, name) {
		this._super(name);
		if (isFunction(fn)) {
			this.fn = fn;
		} else if (isString(fn)) {
			this.fn = eval(fn);
		} else {
			throw ERROR("Invalid function in FunctionTemplate.init().");
		}
	},
	render_many: function(list) {
		if (isArray(list)) {
			var out = [];
			for (var i=0; i<list.length; i++) {
				out.push(this.fn(list[i]));
			}
			return out;
		} else {
			throw ERROR("Invalid list in FunctionTemplate.render_many().");
		}
	},
	render: function(o) {
		return this.fn(o);
	},
});


