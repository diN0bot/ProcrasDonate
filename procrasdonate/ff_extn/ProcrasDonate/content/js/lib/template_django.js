

/*
Render Django-structured templates in javascript!
*/

function pythonTrue(o) {
	if (isString(o) && o.length == 0) 
		return false;
	if (isArray(o) && o.length == 0)
		return false;
	return !!o;
}


var DjangoTemplate = Template.extend({
	init: function(o, name) {
		this._super(name);
		this.nodelist = o || [];
	},
	
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
			if (DEBUG_TEMPLATES)
				ERROR("Unknown variable type: "+v);
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
					if (DEBUG_TEMPLATES)
						ERROR(e, "Caught exception from filter '"+name+"'.");;
					ret = "";
				}
			} else {
				if (DEBUG_TEMPLATES)
					ERROR("Unknown filter '"+name+"'. v:'"+v+"', filters:'"+(isArray(filters) ? filters.join("','") : filters)+"'");
				ret = "";
			}
		}
		return ret;
	},
	
	render_node: function(node, context, env) {
		var n = node[0];
		var args = node.slice(1);
		
		if (!isContext(context)) {
			//DEBUG("render_node: created Context");
			//context = new Context(context);
			context = new RequestContext(context);
		}
		try {
			if (this.TAGS[n]) {
				return this.TAGS[n].call(this, args, context, env);
			} else {
				if (DEBUG_TEMPLATES)
					ERROR("Invalid tag type: '"+n+"'");
			}
		} catch(e) {
			if (DEBUG_TEMPLATES)
				ERROR(e, "Caught exception while rendering node '"+n+"'");
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
					if (DEBUG_TEMPLATE)
						ERROR(e, "Caught exception while rendering nodelist.");
				}
			} else {
				if (DEBUG_TEMPLATE)
					ERROR("Template error - invalid nodelist item: "+n);
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
			if (DEBUG_TEMPLATES)
				ERROR(e, "Caught error while rendering Django template.");
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
			if (DEBUG_TEMPLATES)
				ERROR(e, "Unknown destination in DjangoTemplate.render_to.\nDestination must be jQuery instance or jQuery selector string.");
		}
	},
	
	render: function(context, env) {
		env = this.build(context, env);
		return env.html;
	},
	
	TAGS: {
		'nop': function(args, context, env) {
			return '';
		},
		'var': function(args, context, env) {
			return this.render_filter(args, context, env);
		},
		
		'for': function(args, context, env) {
			var out = [];
			var vars = args[0];
			var sequence = this.render_filter(args[1].slice(1), context, env);
			var reverse = args[2];
			var nodelist = args[3];
			
			if (!(sequence && sequence.length>0)) {
				return '';
			}
			
			var parentloop = get(context, 'forloop');
			
			for (var i=0; i<sequence.length; i++) {
				var forloop = {
						'parentloop' : parentloop,
						'first' : i==0,
						'last'	: i==sequence.length - 1,
						'counter': i+1,
						'counter0': i,
						'revcounter': sequence.length - i,
						'revcounter0': sequence.length - i - 1,
				};
				var new_context = { 'forloop': forloop };
				if (vars.length > 1) {
					for (var vi in vars) {
						new_context[vars[vi]];
					}
				} else {
					new_context[vars[0]] = sequence[i];
				}
				context.push(new_context);
				var q = this.render_nodelist(nodelist, context, env);
				out.push(q);
				context.pop();
			}
			return out.join("");
		},
		'if': function(args, context, env) {
			var AND=0, OR=1;
			var bool_exprs = args[0];
			var link_type = args[1];
			var nodelist_true = args[2];
			var nodelist_false = args[3];
			
			if (link_type == OR) {
				for (var be in bool_exprs) {
					var ifnot = bool_exprs[be][0];
					var bool_expr = bool_exprs[be][1];
					value = pythonTrue(this.render_filter(bool_expr, context, env));
					if ((value && !ifnot) || (ifnot && !value))
						return this.render_nodelist(nodelist_true, context, env);
				}
				return this.render_nodelist(nodelist_false, context, env);
			} else {
				for (var be in bool_exprs) {
					var ifnot = bool_exprs[be][0];
					var bool_expr = bool_exprs[be][1];
					value = pythonTrue(this.render_filter(bool_expr, context, env));
					if (!((value && !ifnot) || (ifnot && !value)))
						return this.render_nodelist(nodelist_false, context, env);
				}
				return this.render_nodelist(nodelist_true, context, env);
			}
		},
		'ifequal':function(args, context, env) {
			var val1 = this.render_filter(args[0], context, env);
			var val2 = this.render_filter(args[1], context, env);
			var nodelist_true = args[2];
			var nodelist_false = args[3];
			var negate = args[4];
			if ((negate && val1 != val2) || (!negate && val1 == val2))
				return this.render_nodelist(nodelist_true, context, env);
			return this.render_nodelist(nodelist_false, context, env);
		},
		
		'firstof': function(args, context, env) {
			var vars = args[0];
			for (var vi in vars) {
				var v = vars[vi];
				var value = this.render_filter(v, context, env);
				if (pythonTrue(value))
					return value;
			}
			return '';
		},
		'cycle': function(args, context, env) {
			var variable_name = args[0];
			var cycle_vars = args[1];
			var counter = args[2];
			if (counter[0] != null)
				counter[0] += 1;
			else
				counter.push(0);
			var value = this.render_filter(cycle_vars[counter[0] % cycle_vars.length], context, env);
			if (variable_name)
				context.set(variable_name, value);
			return value;
		},
		'with': function(args, context, env) {
			var value = this.render_filter(args[0], context, env);
			var name = args[1];
			var nodelist = args[2];
			var new_context = {};
			new_context[name] = value;
			context.push(new_context);
			var out = this.render_nodelist(nodelist, context, env);
			context.pop();
			return out;
		},
		
		'extends': function(args, context, env) {
			return '';
		},
		'include': function(args, context, env) {
			var template_name = this.render_filter(args[0], context, env);
			var t = Template.get(template_name);
			if (t)
				return t.render(context, env);
			return '';
		},
		'block': function(args, context, env) {
			var name = args[0];
			var nodelist = args[1];
			var parent = args[2];
			//this.Blocks[name] = 
			return '';
		},
		'withmany': function(args, context, env) {
			var kwargs = args[0];
			var nodelist = args[1];
			var new_context = {};
			for (var key in kwargs) {
				var name = kwargs[key][0];
				var value = kwargs[key][1];
				//var [name, value] = kwargs[key];
				value = this.render_filter(value, context, env);
				new_context[name] = value;
			}
			context.push(new_context);
			var out = this.render_nodelist(nodelist, context, env);
			context.pop();
			return out;
		},
		'let': function(args, context, env) {
			var kwargs = args[0];
			for (var key in kwargs) {
				var name = kwargs[key][0];
				var value = kwargs[key][1];
				//var [name, value] = kwargs[key];
				value = this.render_filter(value, context, env);
				context.assign(name, value);
			}
			return '';
		},
		'script': function(args, context, env) {
			var nodelist = args[0];
			env.js += [this.render_nodelist(nodelist, context, env)]
			return ""
		},
	},
});


