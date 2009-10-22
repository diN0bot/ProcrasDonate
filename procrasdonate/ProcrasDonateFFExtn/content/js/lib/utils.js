

var _load_URL = function(aUrl){
	var ioService=Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
	var scriptableStream=Components.classes["@mozilla.org/scriptableinputstream;1"].getService(Components.interfaces.nsIScriptableInputStream);
	
	var channel=ioService.newChannel(aUrl, null, null);
	var input=channel.open();
	scriptableStream.init(input);
	var str=scriptableStream.read(input.available());
	scriptableStream.close();
	input.close();
	return str;
	//eval(str);
};

var _include = function(filename) {
	logger("loading " + filename + "...");
	try {
		var script = _load_URL("file:///home/dan/work/jsdan/" + filename);
	} catch (e) {
		logger("load failed: " + e);
	}
	logger("done with " + filename);
	return script;
};


function _bind(o, m) {
	var bound_arguments = Array.prototype.slice.apply(arguments, [2]);
	return function() {
		//logger([bound_arguments, bound_arguments.constructor]);
		var now_arguments = Array.prototype.slice.apply(arguments);
		//logger([now_arguments, now_arguments.constructor]);
		var args = bound_arguments.slice().concat(now_arguments);
		//logger([args, args.constructor]);
		return m.apply(o, args); //bound_arguments + now_arguments);
	}
}

/*
// DEPRECATED BECAUSE RANDOMLY STOPS WORKING SOMETIMES.
var logger = function(msg) {
	try {
		var consoleService = Components.
			classes["@mozilla.org/consoleservice;1"].
			getService(Components.interfaces.nsIConsoleService);
		consoleService.logStringMessage(msg);
	} catch (e) {
		try {
			if (arguments.length == 1) {
				console.debug(msg);
			} else {
				console.debug(Array.prototype.slice.apply(arguments));
			}
		} catch (e) {
			throw new Error("Failed to find logger()");
		}
	}
};
*/

/*
 * Prints message to console.
 * To use, run Firefox from command line. "dump()" will
 * show output there.
 *     eg, $ /Applications/Firefox.app/Contents/MacOS/firefox > o.out
 */
logger = function(msg) {
	now = new Date();
	dump("\n---------"+now+"---------\n" + msg + "\n");
	try {
		//logger.FAIL();
	} catch (e) {
		dump(e.stack);
	}
};

var _print = function(msg) {
	logger(msg);
};

var _pprint = function(object, msg) {
	var str = msg || "";
	for (var prop in object) {
		str += prop+"="+object[prop]+", ";
	}
	logger(str);
}

// extend() from John Resig:
//   http://ejohn.org/blog/javascript-getters-and-setters/
// Helper method for extending one object with another
function _extend(a,b) {
	for ( var i in b ) {
		var g = b.__lookupGetter__(i), s = b.__lookupSetter__(i);
		
		if ( g || s ) {
			if ( g )
				a.__defineGetter__(i, g);
			if ( s )
				a.__defineSetter__(i, s);
		} else
			a[i] = b[i];
	}
	return a;
}

//function _class(bases, attrs, statics) {}

// - cross-browser object-type detection
function isUndefined(o) {
  return (typeof(o) == "undefined");
}
function isNull(o) {
  return (typeof(o) == "object" && o);
}
function isObject(o) {
  return (o && "object" == typeof(o)) || isFunction(o);
}
function isFunction(f) {
  return "function" == typeof(f);
}
function isArray(a) {
  return isObject(a) && a.constructor == Array;
}
function isRegExp(o) {
  return isObject(o) && o.constructor == RegExp;
}
function isString(o) {
  return typeof(o) == "string";
}
function isNumber(o) {
  return typeof(o) == "number";
}
function isBoolean(o) {
  return typeof(o) == "boolean";
}

//function _keys(o) {
//}

function _iterate(o, fn) {
	// _iterate(o, fn) => execute fn for every item in o
	// fn == function(key, value, index) { ... }
	// 
	// 1. o is a function, return _iterate(o(), fn)
	// 2. if o.__iter__ exists, return _iterate(o.__iter__, fn)
	// 3. if o._order exists, iterate o._order to get keys
	// 4. if o is an Array
	// 5. if o is an Object
	var ret=[], k, i;
	fn = fn || function(k,v) { return k; };
	
	if (typeof(o) == "function") {
		return _iterate(o(), fn);
	} else if (typeof(o) == "object" && !!o) {
		if (o.__iter__ !== undefined) {
			return _iterate(o.__iter__, fn);
		} else if (o._order !== undefined) {
			if (typeof(o._order) == "object" && !!o._order) {
				if (o._order.constructor == Array) {
					for (i=0; i<o._order.length; i++) {
						k = o._order[i];
						ret.push(fn(k, o[k], i));
					}
				} else {
					throw Error("Don't know how to handle o._order: " + o._order);
				}
			} else {
				throw Error("Don't know how to handle o._order: " + o._order);
			}
		} else if (o.constructor == Array) {
			for (k=0; k<o.length; k++) {
				ret.push(fn(k, o[k], k));
			}
		} else {
			i=0;
			for (k in o) {
				ret.push(fn(k, o[k], i));
				i++;
			}
		}
	} else {
		throw Error("Cannot iterate object o: " + o);
	}
	return ret;
}

//function dict(o) {
//	var ret={},k,i;
//	if (typeof(o) == "object" && !!o) {
//		if (o.constructor == Array) {
//			for (i=0; i<o.length; i++) {
//				ret[o[i][0]] = o[i][1];
//			}
//		} else {
//			for (k in o) {
//				ret[k] = o[k];
//			}
//		}
//	} else {
//		throw Error("Cannot make 'dict' from object o: " + o);
//	}
//	return ret;
//}
//
//function list(o) {
//	return _iterate(o);
//}
//
//function _zip() {
//	var ret=[], args, i, j, seq;
//	args = Array.prototype.slice.call(arguments);
//	for (i=0; i<args.length; i++) {
//		seq = args[i];
//		for (j=0; j<seq.length; j++) {
//			if (ret[j] === undefined)
//				ret[j] = [];
//			ret[j][i] = seq[j];
//		}
//	}
//	return ret;
//}

var _change_location = function(request, url) {
	// change url to settings
	var unsafeWin = request.get_unsafeContentWin();//event.target.defaultView;
	if (unsafeWin.wrappedJSObject) {
		unsafeWin = unsafeWin.wrappedJSObject;
	}
	new XPCNativeWrapper(unsafeWin, "location").location = url;
}

var _start_of_day = function(date) {
	if (!date) {
		date = new Date();
	}
	date.setHours(0);
	date.setMinutes(0);
	date.setSeconds(0);
	date.setMilliseconds(0);
	return date;
}

var _start_of_week = function(date) {
	if (!date) {
		date = new Date();
	}
	date.setHours(0);
	date.setMinutes(0);
	date.setSeconds(0);
	date.setMilliseconds(0);
	// first day of week. getDay should now = 0
	date.setDate(date.getDate() - date.getDay());
	return date;
}

var _start_of_year = function(date) {
	if (!date) {
		date = new Date();
	}
	date.setMonth(0);
	date.setDate(1);
	date.setHours(0);
	date.setMinutes(0);
	date.setSeconds(0);
	date.setMilliseconds(0);
	return date;
}

var _end_of_forever = function() { return -3; }

var _end_of_day = function(date) {
	if (!date) {
		date = new Date();
	}
	date.setHours(23);
	date.setMinutes(59);
	date.setSeconds(59);
	date.setMilliseconds(999);
	return date;
}

var _end_of_week = function(date) {
	if (!date) {
		date = new Date();
	}
	date.setHours(23);
	date.setMinutes(23);
	date.setSeconds(23);
	date.setMilliseconds(23);
	// last day of week. getDay should now = 6.
	//#@TODO maybe we want this to be 0 for Sunday ?!?!?! see also _start_of_week
	date.setDate(date.getDate() + (6-date.getDay()));
	return date;
}

var _end_of_year = function(date) {
	if (!date) {
		date = new Date();
	}
	date.setMonth(11);
	date.setDate(31)
	date.setHours(23);
	date.setMinutes(23);
	date.setSeconds(23);
	date.setMilliseconds(23);
	return date;
}

var _end_of_last_year = function(date) {
	if (!date) {
		date = new Date();
	}
	date.setYear(date.getYear() - 1);
	date.setMonth(11);
	date.setDate(31)
	date.setHours(23);
	date.setMinutes(23);
	date.setSeconds(23);
	date.setMilliseconds(23);
	return date;
}

// These values are stored in the database for booleans (which are really integers)
var False = 0;
var True = 1;

var _dbify_bool = function(bool) {
	if (bool) {
		return True;
	} else {
		return False;
	}
}

var _un_dbify_bool = function(x) {
	// !x in case value is empty or null
	if (x == False || !x) {
		return false;
	} else {
		return true;
	}
}

// do not transform _end_of_forever
var _dbify_date = function(date) {
	if (date == -3) return date;
	else return Math.round(date.getTime() / 1000.0);
}

// do not transform _end_of_forever
var _un_dbify_date = function(str) {
	if (str == "-3") return -3;
	else return new Date(parseInt(str) * 1000);
}

var _date_to_http_format = function(t) {
	var two_digit = function(x) {
		if (x < 10) { return "0"+x; }
		else { return x; }
	}
	
	var year = t.getFullYear();
	var month = two_digit( t.getMonth() );
	var day = two_digit( t.getDate() );
	
	var hours = two_digit( t.getHours() );
	var minutes = two_digit( t.getMinutes() );
	var seconds = two_digit( t.getSeconds() );
	
	return year+"-"+month+"-"+day+" "+hours+":"+minutes+":"+seconds;
}

// x is a string
// if x can be parsed as an int, return that
// otherwise, we return x parsed as a float to 2 decimal places
var _un_prefify_float = function(x) {
	return parseFloat(x);
}

// can't store floats in prefs, so convert to string
var _prefify_float = function(x) {
	return x.toString();
}

// we expect wikipedia.org to split into   [,    ,wikipedia.org  ,]
// we expect www.bluecar.com to split into [,www.,bluecar.com    ,]
// we expect docs.google.com to split into [,    ,docs.google.com,]
var host_regexp =  /^[\w]+:\/\/(www\.)?([^\/]+).*/g;

var _host = function(href) {
	if (!href) {
		var urlbar = document.getElementById('urlbar');
		// @TODO if urlbar is null...
		href = urlbar.value;
	}
	var splits = href.split(host_regexp);
	if ( splits.length > 2 ) {
		return splits[2];
	} else {
		return href
	}
};

var _href = function() {
	var urlbar = document.getElementById('urlbar');
	// @TODO if urlbar is null...
	return urlbar.value
};

function isEmpty(ob) {
	for(var i in ob) {
		if (ob.hasOwnProperty(i)) { return false; }
	}
	return true;
}



/**
 * jsDump
 * Copyright (c) 2008 Ariel Flesler - aflesler(at)gmail(dot)com | http://flesler.blogspot.com
 * Licensed under BSD (http://www.opensource.org/licenses/bsd-license.php)
 * Date: 5/15/2008
 * @projectDescription Advanced and extensible data dumping for Javascript.
 * @version 1.0.0
 * @author Ariel Flesler
 * @link {http://flesler.blogspot.com/2008/05/jsdump-pretty-dump-of-any-javascript.html}
 */
(function(){
	function quote( str ){
		return '"' + str.toString().replace(/"/g, '\\"') + '"';
	};
	function literal( o ){
		return o + '';	
	};
	function join( pre, arr, post ){
		var s = jsDump.separator(),
			base = jsDump.indent(),
			inner = jsDump.indent(1);
		if( arr.join )
			arr = arr.join( ',' + s + inner );
		if( !arr )
			return pre + post;
		return [ pre, inner + arr, base + post ].join(s);
	};
	function array( arr ){
		var i = arr.length,	ret = Array(i);					
		this.up();
		while( i-- )
			ret[i] = this.parse( arr[i] );				
		this.down();
		return join( '[', ret, ']' );
	};
	
	var reName = /^function (\w+)/;
	
	var jsDump = window.jsDump = {
		parse:function( obj, type ){//type is used mostly internally, you can fix a (custom)type in advance
			var	parser = this.parsers[ type || this.typeOf(obj) ];
			type = typeof parser;			
			
			return type == 'function' ? parser.call( this, obj ) :
				   type == 'string' ? parser :
				   this.parsers.error;
		},
		typeOf:function( obj ){
			var type = typeof obj,
				f = 'function';//we'll use it 3 times, save it
			return type != 'object' && type != f ? type :
				!obj ? 'null' :
				obj.exec ? 'regexp' :// some browsers (FF) consider regexps functions
				obj.getHours ? 'date' :
				obj.scrollBy ?  'window' :
				obj.nodeName == '#document' ? 'document' :
				obj.nodeName ? 'node' :
				obj.item ? 'nodelist' : // Safari reports nodelists as functions
				obj.callee ? 'arguments' :
				obj.call || obj.constructor != Array && //an array would also fall on this hack
					(obj+'').indexOf(f) != -1 ? f : //IE reports functions like alert, as objects
				'length' in obj ? 'array' :
				type;
		},
		separator:function(){
			return this.multiline ?	this.HTML ? '<br />' : '\n' : this.HTML ? '&nbsp;' : ' ';
		},
		indent:function( extra ){// extra can be a number, shortcut for increasing-calling-decreasing
			if( !this.multiline )
				return '';
			var chr = this.indentChar;
			if( this.HTML )
				chr = chr.replace(/\t/g,'   ').replace(/ /g,'&nbsp;');
			return Array( this._depth_ + (extra||0) ).join(chr);
		},
		up:function( a ){
			this._depth_ += a || 1;
		},
		down:function( a ){
			this._depth_ -= a || 1;
		},
		setParser:function( name, parser ){
			this.parsers[name] = parser;
		},
		// The next 3 are exposed so you can use them
		quote:quote, 
		literal:literal,
		join:join,
		//
		_depth_: 1,
		// This is the list of parsers, to modify them, use jsDump.setParser
		parsers:{
			window: '[Window]',
			document: '[Document]',
			error:'[ERROR]', //when no parser is found, shouldn't happen
			unknown: '[Unknown]',
			'null':'null',
			undefined:'undefined',
			'function':function( fn ){
				var ret = 'function',
					name = 'name' in fn ? fn.name : (reName.exec(fn)||[])[1];//functions never have name in IE
				if( name )
					ret += ' ' + name;
				ret += '(';
				
				ret = [ ret, this.parse( fn, 'functionArgs' ), '){'].join('');
				return join( ret, this.parse(fn,'functionCode'), '}' );
			},
			array: array,
			nodelist: array,
			arguments: array,
			object:function( map ){
				var ret = [ ];
				this.up();
				for( var key in map )
					ret.push( this.parse(key,'key') + ': ' + this.parse(map[key]) );
				this.down();
				return join( '{', ret, '}' );
			},
			node:function( node ){
				var open = this.HTML ? '&lt;' : '<',
					close = this.HTML ? '&gt;' : '>';
					
				var tag = node.nodeName.toLowerCase(),
					ret = open + tag;
					
				for( var a in this.DOMAttrs ){
					var val = node[this.DOMAttrs[a]];
					if( val )
						ret += ' ' + a + '=' + this.parse( val, 'attribute' );
				}
				return ret + close + open + '/' + tag + close;
			},
			functionArgs:function( fn ){//function calls it internally, it's the arguments part of the function
				var l = fn.length;
				if( !l ) return '';				
				
				var args = Array(l);
				while( l-- )
					args[l] = String.fromCharCode(97+l);//97 is 'a'
				return ' ' + args.join(', ') + ' ';
			},
			key:quote, //object calls it internally, the key part of an item in a map
			functionCode:'[code]', //function calls it internally, it's the content of the function
			attribute:quote, //node calls it internally, it's an html attribute value
			string:quote,
			date:quote,
			regexp:literal, //regex
			number:literal,
			'boolean':literal
		},
		DOMAttrs:{//attributes to dump from nodes, name=>realName
			id:'id',
			name:'name',
			'class':'className'
		},
		HTML:false,//if true, entities are escaped ( <, >, \t, space and \n )
		indentChar:'   ',//indentation unit
		multiline:true //if true, items in a collection, are separated by a \n, else just a space.
	};

})();
