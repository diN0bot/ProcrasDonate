
var TAGS = {
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
					'is_odd': i%2
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
	
	'comment':function(args, context, env) {
		return ''
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
		//// DOES NOT SEEM TO GET CALLED
		//// <tr class="{% cycle 'odd' 'even' %}">
		//// no-op ?!
		//// use forloop.is_odd instead
		var variable_name = args[0];
		var cycle_vars = args[1];
		var counter = args[2];
		logger("CYCLE!!! variable_name="+variable_name+
				" cycle_vars="+cycle_vars+
				" counter="+counter);
		
		if (counter[0] != null)
			counter[0] += 1;
		else
			counter.push(0);
		var value = this.render_filter(cycle_vars[counter[0] % cycle_vars.length], context, env);
		if (variable_name)
			context.set(variable_name, value);
		logger("CYCLE VALUE ="+value);
		return value;
	},
	'with': function(args, context, env) {
		var value = this.render_filter(args[0], context, env);
		var name = args[1];
		var nodelist = args[2];
		var new_context = {};
		logger("WITH value="+value+" name="+name);
		new_context[name] = value;
		context.push(new_context);
		var out = this.render_nodelist(nodelist, context, env);
		logger("OUT="+out);
		context.pop();
		return out;
	},
	
	'extends': function(args, context, env) {
		return '';
	},
	
	'include': function(args, context, env) {
		this.DEBUG = true;
		logger("include (args)");
		_pprint(args);
		var s = "";
		for (var k in args) {
			s += "<"+k+"="+args[k]+"> ";
		}
		logger("ARGS="+s);
		var template_name = this.render_filter(args[0], context, env);
		logger("template_name="+template_name);
		var t = Template.get(template_name);
		logger("t="+t);
		this.DEBUG = false;
		if (t) {
			return t.render(context, env);
		}
		return '';
	},
	
	/*
	'now': function(args, context, env) {
		logger("include");
		_pprint(args);
		_pprint(context);
		_pprint(env);
		var template_name = this.render_filter(args[0], context, env);
		logger("template_name="+template_name);
		var t = Template.get(template_name);
		logger("t="+t);
		if (t) {
			return t.render(context, env);
		}
		return '';
	},
	*/
	
	'block': function(args, context, env) {
		var name = args[0];
		var nodelist = args[1];
		var parent = args[2];
		//this.Blocks[name] = 
		return '';
	},
};

_extend(TAGS, {
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
	
});


