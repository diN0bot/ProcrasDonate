	
function pythonTrue(o) {
	if (isString(o) && o.length == 0) 
		return false;
	if (isArray(o) && o.length == 0)
		return false;
	return !!o;
}


var DjangoTemplate = function(o, name, options) {
	Template.apply(this, [name, options]);
	this.nodelist = o || [];
	this.TAGS = this.options.tags || TAGS;
}
DjangoTemplate.prototype = new Template();
_extend(DjangoTemplate.prototype, {
	//init: function(o, name) {
	//	this._super(name);
	//	this.nodelist = o || [];
	//},
	
	render_variable: function(v, context, env) {
		if (isNumber(v) || isString(v) || isBoolean(v)) {
			return v;
		} else if (isArray(v)) {
			var ret = context;
			for (var ai in v) {
				ret = get(ret, v[ai]);
			}
			return ret;
		} else {
			if (Template.DEBUG_TEMPLATES)
				Error("Unknown variable type: "+v);
			return null;
		}
	},
	
	render_filter: function(v, context, env) {
		if (!isArray(v)) {
			if (isString(v)) {
				m = v.match(/^["'](.*)['"]$/);
				if (m)
					return m[1];
			}
			return v;
		}
		if (v[0] == 'var')
			v = v.slice(1);
		
		var ret = context;
		var filters = v[1];
		v = v[0];
		
		ret = this.render_variable(v, context, env);
		
		for (var fi in filters) {
			var f = filters[fi];
			var name = f[0];
			var args = f.slice(1);
			
			for (var a in args) {
				args[a] = this.render_filter(args[a], context, env);
			}
			
			if (Template.FILTERS[name]) {
				try {
					ret = Template.FILTERS[name].apply(this, [ret].concat(args), env);
				} catch (e) {
					if (Template.DEBUG_TEMPLATES)
						Error(e, "Caught exception from filter '"+name+"'.");;
					ret = "";
				}
			} else {
				if (Template.DEBUG_TEMPLATES)
					Error("Unknown filter '"+name+"'. v:'"+v+"', filters:'"+(isArray(filters) ? filters.join("','") : filters)+"'");
				ret = "";
			}
		}
		return ret;
	},
	
	render_node: function(node, context, env) {
		var n = node[0];
		var args = node.slice(1);
		
		if (!isContext(context)) {
			//Template.DEBUG("render_node: created Context");
			//context = new Context(context);
			context = new RequestContext(context);
		}
		try {
			if (this.TAGS[n]) {
				return this.TAGS[n].call(this, args, context, env);
			} else {
				if (Template.DEBUG_TEMPLATES)
					Error("Invalid tag type: '"+n+"'");
			}
		} catch(e) {
			if (Template.DEBUG_TEMPLATES)
				Error(e, "Caught exception while rendering node '"+n+"'");
			return "";
		}
	},
	
	render_nodelist: function(nodelist, context, env) {
		var out = [];
		for (var ni in nodelist) {
			var n = nodelist[ni]
			if (isString(n)) {
				out.push(n); 
			} else if (isArray(n)) {
				try {
					out.push(this.render_node(n, context, env));
				} catch(e) {
					if (Template.DEBUG_TEMPLATE)
						Error(e, "Caught exception while rendering nodelist.");
				}
			} else {
				if (Template.DEBUG_TEMPLATE)
					Error("Template error - invalid nodelist item: "+n);
			}
		}
		return out.join("");
	},
	
	build: function(context, env) {
		if (env == undefined)
			env = { "js":[], "html":"" }
		try { 
			env.html += this.render_nodelist(this.nodelist, context, env);
		} catch (e) {
			if (Template.DEBUG_TEMPLATES)
				Error(e, "Caught error while rendering Django template.");
		}
		return env;
	},
	
	render_to: function(dest, context) {
		var env = this.build(context);
		if (isString(dest)) {
			dest = jQuery(dest);
		}
		if (dest instanceof jQuery) {
			dest.html(env.html);
			eval(env.js);
		} else {
			if (Template.DEBUG_TEMPLATES)
				Error(e, "Unknown destination in DjangoTemplate.render_to.\nDestination must be jQuery instance or jQuery selector string.");
		}
	},
	
	render: function(context, env) {
		env = this.build(context, env);
		return env.html;
	},
	
});

Template.register_template_class(DjangoTemplate, function(obj) {
	return isArray(obj);
});
