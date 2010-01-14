;var ProcrasDonate = (function() {


/**************** content/js/lib/utils.js *****************/


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

/* umm.... this doesn't get used anywhere i guess */
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
		var now_arguments = Array.prototype.slice.apply(arguments);
		var args = bound_arguments.slice().concat(now_arguments);
		return m.apply(o, args);
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
logger = function(msg, show_stack) {
	now = new Date();
	dump("\n---------"+now+"---------\n" + msg + "\n");
	try {
		if (show_stack) {
			logger.FAIL();
		}
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
		str += prop+"="+object[prop]+"\n";
	}
	logger(str);
}

var _pprint_keys = function(object, msg) {
	var str = msg || "";
	for (var prop in object) {
		str += prop+"\n";
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


function _contains(o, item) {
	var ret = false;
	_iterate(o, function(key, value, index) {
		if (item == value) { ret = true; }
	});
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
	} else {
		date = new Date(date);
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
	} else {
		date = new Date(date);
	}
	date.setHours(0);
	date.setMinutes(0);
	date.setSeconds(0);
	date.setMilliseconds(0);
	// first day of week. getDay should now equal 1 (Monday)
	// if day is already Monday, stay. otherwise, retreat to last Monday
	//if (x) logger("date.getDay "+date.getDate());
	if (date.getDay() != 1) {
		if (date.getDay() == 0) {
			// if sunday, then subtract 6 days
			date.setDate(date.getDate() - 6);
		} else {
			// else, subtract day-1; eg, Wednesday = 3, so subtract 2 to get to Monday (1)
			date.setDate(date.getDate() - (date.getDay()-1));
		}
	}
	return date;
}

var _start_of_year = function(date) {
	if (!date) {
		date = new Date();
	} else {
		date = new Date(date);
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
	} else {
		date = new Date(date);
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
	} else {
		date = new Date(date);
	}
	date.setHours(23);
	date.setMinutes(23);
	date.setSeconds(23);
	date.setMilliseconds(23);
	// last day of week. getDay should now equal 0 (Sunday).
	// if already Sunday, we're good. otherwise, advance to upcoming Sunday
	if (date.getDay() != 0) {
		// add 7-day; eg, Wednesday = 3, so add 7-3=4 to get to Sunday
		date.setDate(date.getDate() + (7-date.getDay()));
	}
	return date;
}

var _end_of_year = function(date) {
	if (!date) {
		date = new Date();
	} else {
		date = new Date(date);
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
	} else {
		date = new Date(date);
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

/**
 * turns a version, eg 1.14.8, into a number, in this case 11408.
 * version components should never go above 99 or the ordering of version
 * numbers will be messed up.
 */
var _version_to_number = function(version) {
	var ret = 0;
	if (!version) { return ret; }
	
	var parts = version.split(".");
	_iterate(parts, function(key, value, index) {
		var v = parseInt(value);
		ret += v*(Math.pow(10, index*2))
	});
	logger("version is "+version+"     ret is "+ret);
	return ret
}


/**
 * Turns slug into displayable name
 * eg "first_name" becomes "First Name"
 */
var _displayable = function(n) {
	var ret = "";
	_iterate(n.split("_"), function(key, value, index) {
		ret += value[0].toUpperCase();
		ret += value.substring(1,value.length);
		ret += " ";
	});
	return ret;
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


// added \/? for file
var host_regexp =  /^[\w]+:(\/\/)?(www\.)?([^\/]+).*/g;
var file_regexp =  /^file:\/\/(.*)/g;

/**
 * 
 * @param href: fully qualified url, includes http or whatever. 
 * 	uses urlbar if no href
 * @return just the hostname, eg procrasdonate.com
 * 	automatically strips out www
 * 	for file:// returns first 30 characters of path
 * 
 * // https://procrasdonate.com/my_messages/  ["", "", "procrasdonate.com", ""]
 * // http://procrasdonate.com/my_messages/   ["", "", "procrasdonate.com", ""]
 * // http://wikipedia.org/                   ["", "", "wikipedia.org", ""]
 * // http://www.wikipedia.org/               ["", "www.", "wikipedia.org", ""]
 * // file:///Users/lucy/SciFi                ["", "/Users/lucy/SciFi", ""]
 * 
 * if split fails, returns ['<< entire input >>']
 * 
 * always returned encodeURI result
 */
var _host = function(href) {
	if (!href) {
		var urlbar = document.getElementById('urlbar');
		if (!urlbar) {
			logger("WARNING: urlbar is false. utils::_host is returning the empty string.");
			return "";
		}
		href = urlbar.value;
	}
	href = encodeURI(href);
	logger("_host.href = "+href);
	
	var splits = href.split(file_regexp);
	if ( splits.length > 2 ) {
		return splits[1].substr(0, 30);
	}
	
	var splits = href.split(host_regexp);
	if ( splits.length >= 4 ) {
		return splits[3];
	} else {
		return href
	}
};

/**
 * 
 * @return current URL, eg http://procrasdonate.com/my_settings
 */
var _href = function() {
	var urlbar = document.getElementById('urlbar');
	if (!urlbar) {
		logger("WARNING: urlbar is false. utils::_href is returning the empty string.");
		return "";
	}
	return encodeURI(urlbar.value)
};

function isEmpty(ob) {
	for(var i in ob) {
		if (ob.hasOwnProperty(i)) { return false; }
	}
	return true;
}

/**
 * Transform text into a URL slug: spaces turned into *underlines*, remove non alpha-num
 * @param string text
 * originally copied from http://www.milesj.me/resources/snippet/13
 */
function slugify(text) {
	text = text.replace(/[^-a-zA-Z0-9\s]+/ig, '');
	text = text.replace(/-/gi, "_");
	text = text.replace(/\s/gi, "_");
	return text;
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


/**************** content/js/lib/fps.js *****************/

function signaturize_query(query, secret_key) {
	// NOTE: THIS HAS A BUG.
	
	// turn into pairs
	var ordered = [];
	var lowercased = {};
	for ( var name in query ) {
		var lowered = name.toLowerCase();
		ordered.push( lowered );
		lowercased[lowered] = query[name];
	}
	ordered = ordered.sort();
	
	var qstr = "";
	for ( var i = 0; i < ordered.length; i++ ) {
		qstr += ordered[i]+lowercased[name];
	}
	
	// calculate the signature
	var signature = sign(secret_key, qstr);
	
	// PYTHON     z/RodgBDqU0O6HnZX/YtynDV6QU=
	//     JS     E%2BAgbtn05bIS9AILzDfqhYivWZ85u9qC2cJdPm6vnPg%3D
	
	// update query
	query["awsSignature"] = signature;

	return query;
}

function encodeNameValuePairs(pairs) {
	for ( var i = 0; i < pairs.length; i++) {
		var name = "";
		var value = "";

		var pair = pairs[i];
		var index = pair.indexOf("=");

		// take care of special cases like "&foo&", "&foo=&" and "&=foo&"
		if (index == -1) {
			name = pair;
		} else if (index == 0) {
			value = pair;
		} else {
			name = pair.substring(0, index);
			if (index < pair.length - 1) {
				value = pair.substring(index + 1);
			}
		}

		// decode and encode to make sure we undo any incorrect encoding
		name = encodeURIComponent(decodeURIComponent(name));

		value = value.replace(/\+/g, "%20");
		value = encodeURIComponent(decodeURIComponent(value));

		pairs[i] = name + "=" + value;
	}

	return pairs;
}


function sign(secret, message) {
	var messageBytes = str2binb(message);
	var secretBytes = str2binb(secret);

	if (secretBytes.length > 16) {
		secretBytes = core_sha256(secretBytes, secret.length * chrsz);
	}

	var ipad = Array(16), opad = Array(16);
	for ( var i = 0; i < 16; i++) {
		ipad[i] = secretBytes[i] ^ 0x36363636;
		opad[i] = secretBytes[i] ^ 0x5C5C5C5C;
	}

	var imsg = ipad.concat(messageBytes);
	var ihash = core_sha256(imsg, 512 + message.length * chrsz);
	var omsg = opad.concat(ihash);
	var ohash = core_sha256(omsg, 512 + 256);

	var b64hash = binb2b64(ohash);
	var urlhash = encodeURIComponent(b64hash);

	return urlhash;
}

Date.prototype.toISODate = new Function("with (this)\n    return "
		+ "getFullYear()+'-'+addZero(getMonth()+1)+'-'"
		+ "+addZero(getDate())+'T'+addZero(getHours())+':'"
		+ "+addZero(getMinutes())+':'+addZero(getSeconds())+'.000Z'");

function addZero(n) {
	return (n < 0 || n > 9 ? "" : "0") + n;
}

function getNowTimeStamp() {
	var time = new Date();
	var gmtTime = new Date(time.getTime() + (time.getTimezoneOffset() * 60000));
	return gmtTime.toISODate();
}

function create_caller_reference() {
	var ret = "";
	var alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	for (var i = 0; i < 12; i++) {
		var idx = Math.floor(Math.random()*alphabet.length);
		ret += alphabet[idx];
	}
	return ret;
}


/**************** content/js/lib/testrunner_display.js *****************/
/*
 * Modified the jQuery unit testrunner source to fit our needs.
 * Modifications:
 * 	* Encapsulated functions inside TestRunner extended function
 *  * Separated test execution logic and result data from result display
 *  August 27, 2009
 *  Lucy Mendel on behalf of ProcrasDonate
 *  http://github.com/diN0bot/ProcrasDonate
 * 
 * Original comment:
 *
 * QUnit - jQuery unit testrunner
 * 
 * http://docs.jquery.com/QUnit
 *
 * Copyright (c) 2008 John Resig, Jörn Zaefferer
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * $Id$
 */

///
/// Class to encapsulate the display of TestRunner results.
///
var TestRunnerDisplay = function() {
};
TestRunnerDisplay.prototype = {};
_extend(TestRunnerDisplay.prototype, {
	
	/// display results from a TestGroup
	display_testgroup_result: function(testrunner, testgroup) {
		console.debug("TestRunnerDisplay.display_test_group_result() called, but TestRunnerDisplay should be subclassed.");
	},
	
	/// all tests have run.
	/// do clean up and summarization, if necessary
	test_done: function(testrunner) {
		console.debug("TestRunnerDisplay.test_done() called, but TestRunnerDisplay should be subclassed.");
	},
	
	///
	/// helpers for subclasses, since many will share the concepts of:
	///   * hide passing tests
	
	// valid for display? or hide test (eg, if passing)
	_validTest: function( assertion ) {
		return True
	},
});

///
/// Displays test results to Firebug console
/// Inherits from TestRunnerDisplay
///
var TestRunnerConsoleDisplay = function() {
};
TestRunnerConsoleDisplay.prototype = new TestRunnerDisplay();
_extend(TestRunnerConsoleDisplay.prototype, {

	display_testgroup_result: function(testrunner, testgroup) {
		var fails = [];
		
		var passing = 0;
		for (var i = 0; i < testgroup.assertions.length; i++) {
			var assertion = testgroup.assertions[i];
			if (assertion.result) {
				passing += 1;
			}
		}
		var total = 0;
		if (testgroup.expected) {
			total = testgroup.expected;
		} else {
			total = testgroup.assertions.length;
		}
		var summary = "FAIL";
		if (passing == total) {
			summary = "PASS";
		}
		// see firebug@software.joehewitt.com/content/firebug/console.js log and logRow...
		// and firebug@software.joehewitt.com/skin/classic/console.css 
		// should be able to set class name so that entry has different color than red !
		//Firebug.Console.log("INFO", null, "logRow-info");
		//Firebug.Console.log("WARN", null, "logRow-warningMessage");
		
		Firebug.Console.openGroup([passing+"/"+total+" pass. "+summary+" for "+testgroup.name], null, "group", null, false);
		for (var i = 0; i < testgroup.assertions.length; i++) {
			var assertion = testgroup.assertions[i];
			if (assertion.result) {
				// don't display passing tests
				// Firebug.Console.log(i+". ("+assertion.result+") "+assertion.msg);
			} else {
				var msg = i+". *"+assertion.result+"* "+assertion.msg;
				Firebug.Console.log(msg);
				fails.push(msg);
			}
		}
		Firebug.Console.closeGroup();
		return fails;
	},
	
	test_done: function(testrunner) {
		var passing = testrunner.passing_total();
		var total = testrunner.total();
		var summary = "FAIL";
		if (passing == total) {
			summary = "PASS";
		}
		Firebug.Console.openGroup(["SUMMARY: "+passing+"/"+total+" = "+summary], null, "group", null, false);
		Firebug.Console.closeGroup();
	}

});

///
/// Inserts test results into the DOM
/// Inherits from TestRunnerDisplay
/// ** not actually implemented **
///
var TestRunnerDOMDisplay = function(request) {
	this.request = request;
	
	// add user agent below banner
	request.jQuery('#userAgent').html(navigator.userAgent);

	// add toolbar head
	request.jQuery("#userAgent").after('<div class="testrunner-toolbar"><label for="filter-pass">Hide passed tests</label></div>');
	var head = request.jQuery('.testrunner-toolbar');
	
	// checkbox for show/hide passed tests
	head.prepend('<input type="checkbox" id="filter-pass" />');
	var checkpass = request.jQuery('#filter-pass');
	checkpass.attr("disabled", true);
	checkpass.click(function() {
		request.jQuery('li.pass')[this.checked ? 'hide' : 'show']();
	});
};
TestRunnerDOMDisplay.prototype = new TestRunnerDisplay();
_extend(TestRunnerDOMDisplay.prototype, {

	display_testgroup_result: function(testrunner, testgroup) {
		
	},
	
	test_done: function(testrunner) {
		
	}

});

///
/// Wraps specified TestRunnerDisplay with PD-specific actions,
/// such as logging all test failures
///
var TestRunnerPDDisplay = function(testrunner_display, pddb) {
	this.testrunner_display = testrunner_display;
	this.pddb = pddb;
};
TestRunnerPDDisplay.prototype = new TestRunnerDisplay();
_extend(TestRunnerPDDisplay.prototype, {

	display_testgroup_result: function(testrunner, testgroup) {
		var self = this;
		var fails = this.testrunner_display.display_testgroup_result(testrunner, testgroup);
		_iterate(fails, function(key, value, index) {
			self.pddb.orthogonals.fail(value, "auto_test_failure");
		});
		return fails
	},
	
	test_done: function(testrunner) {
		this.testrunner_display.test_done(testrunner);
	}

});

///
/// Logs test results to database only (does not rely on Firebug)
///
var TestRunnerPDDBDisplay = function(pddb) {
	this.pddb = pddb;
};
TestRunnerPDDBDisplay.prototype = new TestRunnerDisplay();
_extend(TestRunnerPDDBDisplay.prototype, {

	display_testgroup_result: function(testrunner, testgroup) {
		var fails = [];
		
		var passing = 0;
		for (var i = 0; i < testgroup.assertions.length; i++) {
			var assertion = testgroup.assertions[i];
			if (assertion.result) {
				passing += 1;
			}
		}
		var total = 0;
		if (testgroup.expected) {
			total = testgroup.expected;
		} else {
			total = testgroup.assertions.length;
		}
		if (passing == total) {
			var summary = "PASS";
			var msg = passing+"/"+total+" pass. "+summary+" for "+testgroup.name;
			this.pddb.orthogonals.log(msg, "auto_test_groupsummary");
		} else {
			var summary = "FAIL";
			var msg = passing+"/"+total+" pass. "+summary+" for "+testgroup.name;
			this.pddb.orthogonals.fail(msg, "auto_test_groupsummary");
		}
		for (var i = 0; i < testgroup.assertions.length; i++) {
			var assertion = testgroup.assertions[i];
			if (assertion.result) {
				// don't display passing tests
			} else {
				var msg = i+". *"+assertion.result+"* "+assertion.msg;
				this.pddb.orthogonals.fail(msg, "auto_test_failure");
				fails.push(msg);
			}
		}
		return fails;
	},
	
	test_done: function(testrunner) {
		var passing = testrunner.passing_total();
		var total = testrunner.total();
		var msg = passing+"/"+total;
		if (passing == total) {
			this.pddb.orthogonals.log(msg, "auto_test_summary");
		} else {
			this.pddb.orthogonals.fail(msg, "auto_test_summary");
		}
	}

});


/**************** content/js/lib/testobjects.js *****************/
/*
 * Modified the jQuery unit testrunner source to fit our needs.
 * Modifications:
 * 	* Encapsulated functions inside TestRunner extended function
 *  * Separated test execution logic and result data from result display
 *  August 27, 2009
 *  Lucy Mendel on behalf of ProcrasDonate
 *  http://github.com/diN0bot/ProcrasDonate
 *  
 * Original comment:
 *
 * QUnit - jQuery unit testrunner
 * 
 * http://docs.jquery.com/QUnit
 *
 * Copyright (c) 2008 John Resig, Jörn Zaefferer
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * $Id$
 */

///
/// Class representing a module of test groups.
/// Each module has its own setup and teardown.
///
/// name = string naming the module
/// lifecycle = (optional) object containing setup 
///             and teardown functions.
var TestModule = function(name, lifecycle) {
	this.name = name;
	this.lifecycle = lifecycle;
	
	this.test_groups = [];
};
TestModule.prototype = {};
_extend(TestModule.prototype, {
	/// add a TestGroup instance to this TestModule
	add_testgroup: function(testgroup) {
		this.test_groups.push( testgroup );
	},

	/// total assertions expected. if expected not explicitly 
	/// called, falls back on assertions run
	total: function() {
		var total = 0;
		for (var i = 0; i < this.test_groups.length; i++) {
			var testgroup = this.test_groups[i];
			if (testgroup.expected) {
				total += testgroup.expected;
			} else {
				total += testgroup.assertions.length;
			}
		}
		return total
	},
	
	/// total assertion ran.
	total_ran: function() {
		var total = 0;
		for (var i = 0; i < this.test_groups.length; i++) {
			var testgroup = this.test_groups[i];
			total += testgroup.assertions.length;
		}
		return total
	},
	
	/// total assertions passing
	passing_total: function() {
		var total = 0;
		for (var i = 0; i < this.test_groups.length; i++) {
			var testgroup = this.test_groups[i];
			for (var j = 0; j < testgroup.assertions.length; j++) {
				var assertion = testgroup.assertions[j];
				if (assertion.result) {
					total++;
				}
			}
		}
		return total
	}
});


///
/// Class representing a named test.
/// Contains Assertions.
///
var TestGroup = function(name) {
	this.name = name;
	
	// actual assertions ran
	this.assertions = [];
	// number of expected assertions
	this.expected = null;
};
TestGroup.prototype = {};
_extend(TestGroup.prototype, {
	/// add an Assertion instance to this TestGroup
	add_assertion: function(assertion) {
		this.assertions.push( assertion );
	}
});

///
/// Class representing a test result for tests
/// processed by the TestRunner
///
var Assertion = function(result, msg) {
	this.result = result;
	this.msg = msg;
};
Assertion.prototype = {};
_extend(Assertion.prototype, {

});



/**************** content/js/lib/testrunner.js *****************/
/*
 * Modified the jQuery unit testrunner source to fit our needs.
 * Modifications:
 * 	* Encapsulated functions inside TestRunner extended function
 *  * Separated test execution logic and result data from result display
 *  August 27, 2009
 *  Lucy Mendel on behalf of ProcrasDonate
 *  http://github.com/diN0bot/ProcrasDonate
 *
 * Original comment:
 *
 * QUnit - jQuery unit testrunner
 *
 * http://docs.jquery.com/QUnit
 *
 * Copyright (c) 2008 John Resig, Jörn Zaefferer
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * $Id$
 */

/*////// STATE OVERVIEW ///////////////////////////////////////////////////////
 * TestModules have a setup() and teardown() lifecycle
 * TestModules have a set of TestGroups
 * Each TestGroup calls setup() and teardown() once: before and after
       executing all Assertions, respectively
 * Each TestGroup runs in its own test environment
 * Each TestGroup has a set of test assertions (ok, equals, same, expect)

 ToDoc:
   * Use of Synchronize

 ToDo:
   * Put back pollution checks and ajaxSetting

/////////////////////////////////////////////////////////////////////////////*/

///
/// Class that manages execution of unit tests
/// Contains test result state
///
///
var TestRunner = function(request) {
	// we need this for jQuery utility functions and
	// to reset ajaxSettings between tests
	this.request = request;

	// (name, TestModule)
	this.test_modules = {};

	// current module for all added tests
	this.current_testmodule = null;
	// set default module
	this.module("__default");

	// current group for all assertions
	this.current_testgroup = null;
	// there is necessarily a group before assertions...right?

	// queue of callbacks to process (via this.synchronize)
	this.queue = [];

	// blocks processing of queue items until document is ready
	// allows for setup of DOM by TestRunnerDisplay
	this.blocking = true;
	// ?? ok, TestRunnerDisplay is done...
	this.blocking = false;

	// timeout (milliseconds) to wait for stopped TestRunner
	// to resume processing of tests.
	this.timeout = null;

	// initial ajaxSettings to rest after TestGroup runs
	this.ajaxSettings = this.request.jQuery.ajaxSettings;
	// id of sandbox DOM element that tests can play inside
	this.sandbox_id = "#main";
	// initial contents of SANDBOX_ID to reset after TestGroup runs
	this.fixture = this.request.jQuery( this.sandbox_id ).innerHTML;
	// testrunner start time
	var started = +new Date;
};
TestRunner.prototype = {};
_extend(TestRunner.prototype, {

	// Test for equality any JavaScript type.
	// Discussions and reference: http://philrathe.com/articles/equiv
	// Test suites: http://philrathe.com/tests/equiv
	// Author: Philippe Rathé <prathe@gmail.com>
	equiv: (function () {

	    var innerEquiv; // the real equiv function
	    var callers = []; // stack to decide between skip/abort functions

	    // Determine what is o.
	    function hoozit(o) {
	        if (o.constructor === String) {
	            return "string";

	        } else if (o.constructor === Boolean) {
	            return "boolean";

	        } else if (o.constructor === Number) {

	            if (isNaN(o)) {
	                return "nan";
	            } else {
	                return "number";
	            }

	        } else if (typeof o === "undefined") {
	            return "undefined";

	        // consider: typeof null === object
	        } else if (o === null) {
	            return "null";

	        // consider: typeof [] === object
	        } else if (o instanceof Array) {
	            return "array";

	        // consider: typeof new Date() === object
	        } else if (o instanceof Date) {
	            return "date";

	        // consider: /./ instanceof Object;
	        //           /./ instanceof RegExp;
	        //          typeof /./ === "function"; // => false in IE and Opera,
	        //                                          true in FF and Safari
	        } else if (o instanceof RegExp) {
	            return "regexp";

	        } else if (typeof o === "object") {
	            return "object";

	        } else if (o instanceof Function) {
	            return "function";
	        } else {
	            return undefined;
	        }
	    }

	    // Call the o related callback with the given arguments.
	    function bindCallbacks(o, callbacks, args) {
	        var prop = hoozit(o);
	        if (prop) {
	            if (hoozit(callbacks[prop]) === "function") {
	                return callbacks[prop].apply(callbacks, args);
	            } else {
	                return callbacks[prop]; // or undefined
	            }
	        }
	    }

	    var callbacks = function () {

	        // for string, boolean, number and null
	        function useStrictEquality(b, a) {
	            if (b instanceof a.constructor || a instanceof b.constructor) {
	                // to catch short annotaion VS 'new' annotation of a declaration
	                // e.g. var i = 1;
	                //      var j = new Number(1);
	                return a == b;
	            } else {
	                return a === b;
	            }
	        }

	        return {
	            "string": useStrictEquality,
	            "boolean": useStrictEquality,
	            "number": useStrictEquality,
	            "null": useStrictEquality,
	            "undefined": useStrictEquality,

	            "nan": function (b) {
	                return isNaN(b);
	            },

	            "date": function (b, a) {
	                return hoozit(b) === "date" && a.valueOf() === b.valueOf();
	            },

	            "regexp": function (b, a) {
	                return hoozit(b) === "regexp" &&
	                    a.source === b.source && // the regex itself
	                    a.global === b.global && // and its modifers (gmi) ...
	                    a.ignoreCase === b.ignoreCase &&
	                    a.multiline === b.multiline;
	            },

	            // - skip when the property is a method of an instance (OOP)
	            // - abort otherwise,
	            //   initial === would have catch identical references anyway
	            "function": function () {
	                var caller = callers[callers.length - 1];
	                return caller !== Object &&
	                        typeof caller !== "undefined";
	            },

	            "array": function (b, a) {
	                var i;
	                var len;

	                // b could be an object literal here
	                if ( ! (hoozit(b) === "array")) {
	                    return false;
	                }

	                len = a.length;
	                if (len !== b.length) { // safe and faster
	                    return false;
	                }
	                for (i = 0; i < len; i++) {
	                    if( ! innerEquiv(a[i], b[i])) {
	                        return false;
	                    }
	                }
	                return true;
	            },

	            "object": function (b, a) {
	                var i;
	                var eq = true; // unless we can proove it
	                var aProperties = [], bProperties = []; // collection of strings

	                // comparing constructors is more strict than using instanceof
	                if ( a.constructor !== b.constructor) {
	                    return false;
	                }

	                // stack constructor before traversing properties
	                callers.push(a.constructor);

	                for (i in a) { // be strict: don't ensures hasOwnProperty and go deep

	                    aProperties.push(i); // collect a's properties

	                    if ( ! innerEquiv(a[i], b[i])) {
	                        eq = false;
	                    }
	                }

	                callers.pop(); // unstack, we are done

	                for (i in b) {
	                    bProperties.push(i); // collect b's properties
	                }

	                // Ensures identical properties name
	                return eq && innerEquiv(aProperties.sort(), bProperties.sort());
	            }
	        };
	    }();

	    innerEquiv = function () { // can take multiple arguments
	        var args = Array.prototype.slice.apply(arguments);
	        if (args.length < 2) {
	            return true; // end transition
	        }

	        return (function (a, b) {
	            if (a === b) {
	                return true; // catch the most you can
	            } else if (a === null || b === null || typeof a === "undefined" || typeof b === "undefined" || hoozit(a) !== hoozit(b)) {
	                return false; // don't lose time with error prone cases
	            } else {
	                return bindCallbacks(a, callbacks, [b, a]);
	            }

	        // apply transition with (1..n) arguments
	        })(args[0], args[1]) && arguments.callee.apply(this, args.splice(1, args.length -1));
	    };

	    return innerEquiv;
	})(),

	// Add callback processes to TestRunner queue.
	// Blocks processing if TestRunner.blocking is true (document not ready)
	synchronize: function(callback) {
		this.queue.push(callback);
		if(!this.blocking) {
			this.process();
		}
	},

	// Process callback processes in TestRunner queue
	process: function() {
		while(this.queue.length && !this.blocking) {
			this.queue.shift()();
		}
	},

	// Stops a process after a specified timeout (milliseconds)
	// ??Blocking because tracks timeout state with instance variable
	stop: function(timeout) {
		this.blocking = true; // why?
		if (timeout)
			this.timeout = setTimeout(function() {
				this.ok( false, "Test timed out" );
				this.start();
			}, timeout);
	},

	// Starts a process.
	// Adds slight delay to start time to avoid any currently
	// executing processes?
	start: function() {
		// A slight delay, to avoid any current callbacks
		setTimeout(function() {
			if(this.timeout) {
				clearTimeout(this.timeout);
			}
			this.blocking = false;
			this.process();
		}, 13);
	},

	// i think this is for display, as in:
	// valid to display test
	validTest: function( name ) {
		return true;
		/*
		// this.config.filters is undefined
		var i = this.config.filters.length,
			run = false;

		if( !i )
			return true;

		while( i-- ){
			var filter = this.config.filters[i],
				not = filter.charAt(0) == '!';
			if( not )
				filter = filter.slice(1);
			if( name.indexOf(filter) != -1 )
				return !not;
			if( not )
				run = true;
		}
		return run;
		*/
	},

	// what is this?
	pollution: null,

	// wtf
	saveGlobal: function(){
		this.pollution = [ ];

		if( this.noglobals )
			for( var key in window )
				this.pollution.push(key);
	},

	// is pollution the introduction of global variables?
	checkPollution: function( name ){
		var old = this.pollution;
		this.saveGlobal();

		if( this.pollution.length > old.length ){
			this.ok( false, "Introduced global variable(s): " + this.diff(old, this.pollution).join(", ") );
			this.config.expected++;
		}
	},

	// returns array of elements in dirty that are not in clean
	diff: function( clean, dirty ){
		return this.request.jQuery.grep( dirty, function(name) {
			return this.request.jQuery.inArray( name, clean ) == -1;
		});
	},

	// executes a named test, which itself contains assertions to process
	test: function(name, callback) {
		// create new testgroup
		testgroup = new TestGroup(name);
		this.current_testgroup = testgroup;

		// add testgroup to current module
		this.current_testmodule.add_testgroup(testgroup);

		var self = this;

		// create a clean environment to execute the testgroup
		var testEnvironment = {};

		// call setup
		this.synchronize(function() {
			try {
				self.current_testmodule.lifecycle.setup.call(testEnvironment);
			} catch(e) {
				self.ok( false, "Setup failed on " + name + ": " + e.message );
			}
		});
		// execute assertions
		this.synchronize(function() {
			try {
				callback.call(testEnvironment);
			} catch(e) {
				self.fail("Test assertion " + name + " died, exception and test assertion follows", e, callback);
				self.ok( false, "Died on test assertion #" + (self.current_testgroup.assertions.length + 1) + ": " +
						e.message + "--" + e.stack);
			}
			var passing = self.passing_total();
			var total = self.total();
		});
		// call teardown
		this.synchronize(function() {
			try {
				self.current_testmodule.lifecycle.teardown.call(testEnvironment);
			} catch(e) {
				self.ok( false, "Teardown failed on " + name + ": " + e.message );
			}
		});
		// reset test environment and summarize results
		this.synchronize(function() {
			try {
				self.reset();
			} catch(e) {
				self.fail("reset() failed, following Test " + name + ", exception and reset fn follows", e, reset);
			}

			if (self.current_testgroup.expected && self.current_testgroup.expected != self.current_testgroup.assertions.length) {
				self.ok( false, "Expected " + self.current_testgroup.expected + " assertions, but " + self.current_testgroup.assertions.length + " were run" );
			}
		});
	},

	// report exception failures to console
	fail: function(message, exception, callback) {
		if( typeof console != "undefined" && console.error && console.warn ) {
			console.error(message);
			console.error(exception);
			console.warn(callback.toString());
		} else if (window.opera && opera.postError) {
			opera.postError(message, exception, callback.toString);
		}
	},

	// Sets the current module to the specified module name and life cycle.
	// If set previously, original lifecycle will be overwritten if a new
	// one is specified here.
	// @name: module name
	// @lifecycle: (optional) object containing setup() and teardown()
	module: function(name, lifecycle) {
		// ensure that default setup and teardown functions are
		// present in lifecycle if not defined.
		var full_lifecycle = _extend({
			setup: function() {},
			teardown: function() {}
		}, lifecycle);

		// get or create a testmodule and override its lifecycle
		// or add to test_modules, as appropriate
		var testmodule = null;
		if (name in this.test_modules) {
			testmodule = this.test_modules[name];
			testmodule.lifecycle = full_lifecycle
		} else {
			testmodule = new TestModule(name, full_lifecycle);
			this.test_modules[name] = testmodule;
		}

		// set current module
		this.current_testmodule = testmodule;
	},

	/**
	 * Specify the number of expected assertions to guarantee
	 * that failed test (no assertions are run at all) don't slip through.
	 */
	expect: function(asserts) {
		this.current_testgroup.expected = asserts;
	},

	/**
	 * Resets the test setup. Useful for tests that modify the DOM.
	 */
	reset: function() {
		this.request.jQuery( this.sandbox_id ).html( this.fixture );
		this.request.jQuery.ajaxSettings = this.request.jQuery.extend({}, this.ajaxSettings);
	},

	/**
	 * Asserts true.
	 * @example ok( $("a").size() > 5, "There must be at least 5 anchors" );
	 */
	ok: function(a, msg) {
		var ass = new Assertion(!!a, msg);
		this.current_testgroup.add_assertion( ass );
	},

	/**
	 * Asserts that two arrays are the same
	 */
	isSet: function(a, b, msg) {
		function serialArray( a ) {
			var r = [];

			if ( a && a.length )
		        for ( var i = 0; i < a.length; i++ ) {
		            var str = a[i].nodeName;
		            if ( str ) {
		                str = str.toLowerCase();
		                if ( a[i].id )
		                    str += "#" + a[i].id;
		            } else
		                str = a[i];
		            r.push( str );
		        }

			return "[ " + r.join(", ") + " ]";
		}
		var ret = true;
		if ( a && b && a.length != undefined && a.length == b.length ) {
			for ( var i = 0; i < a.length; i++ )
				if ( a[i] != b[i] )
					ret = false;
		} else
			ret = false;
		this.ok( ret, !ret ? (msg + " expected: " + serialArray(b) + " result: " + serialArray(a)) : msg );
	},

	/**
	 * Asserts that two objects are equivalent
	 */
	isObj: function(a, b, msg) {
		var ret = true;

		if ( a && b ) {
			for ( var i in a )
				if ( a[i] != b[i] )
					ret = false;

			for ( i in b )
				if ( a[i] != b[i] )
					ret = false;
		} else
			ret = false;

	    this.ok( ret, msg );
	},

	/**
	 * Returns an array of elements with the given IDs, eg.
	 * @example q("main", "foo", "bar")
	 * @result [<div id="main">, <span id="foo">, <input id="bar">]
	 */
	q: function() {
		var r = [];
		for ( var i = 0; i < arguments.length; i++ )
			r.push( this.request.jQuery( "#"+arguments[i] ) );
		return r;
	},

	/**
	 * Asserts that a select matches the given IDs
	 * @example t("Check for something", "//[a]", ["foo", "baar"]);
	 * @result returns true if "//[a]" return two elements with the IDs 'foo' and 'baar'
	 */
	t: function(a,b,c) {
		var f = this.request.jQuery(b);
		var s = "";
		for ( var i = 0; i < f.length; i++ )
			s += (s && ",") + '"' + f[i].id + '"';
		isSet(f, q.apply(q,c), a + " (" + b + ")");
	},

	/**
	 * Add random number to url to stop IE from caching
	 *
	 * @example url("data/test.html")
	 * @result "data/test.html?10538358428943"
	 *
	 * @example url("data/test.php?foo=bar")
	 * @result "data/test.php?foo=bar&10538358345554"
	 */
	url: function(value) {
		return value + (/\?/.test(value) ? "&" : "?") + new Date().getTime() + "" + parseInt(Math.random()*100000);
	},

	/**
	 * Checks that the first two arguments are equal, with an optional message.
	 * Prints out both actual and expected values.
	 *
	 * Prefered to ok( actual == expected, message )
	 *
	 * @example equals( $.format("Received {0} bytes.", 2), "Received 2 bytes." );
	 *
	 * @param Object actual
	 * @param Object expected
	 * @param String message (optional)
	 */
	equals: function(actual, expected, message) {
		this.push(expected == actual, actual, expected, message);
	},

	same: function(a, b, msg) {
		this.push(equiv(a, b), a, b, message);
	},

	push: function(result, actual, expected, message) {
		message = message || (result ? "okay" : "failed");
		this.ok( result, result ? message + ": " + expected : message + ", expected: " + jsDump.parse(expected) + " result: " + jsDump.parse(actual) );
	},

	/**
	 * Trigger an event on an element.
	 *
	 * @example triggerEvent( document.body, "click" );
	 *
	 * @param DOMElement elem
	 * @param String type
	 */
	triggerEvent: function( elem, type, event ) {
		if ( this.request.jQuery.browser.mozilla || this.request.jQuery.browser.opera ) {
			event = document.createEvent("MouseEvents");
			event.initMouseEvent(type, true, true, elem.ownerDocument.defaultView,
				0, 0, 0, 0, 0, false, false, false, false, 0, null);
			elem.dispatchEvent( event );
		} else if ( this.request.jQuery.browser.msie ) {
			elem.fireEvent("on"+type);
		}
	},

	/*************** RETRIEVE RESULTS **********************/
	total: function() {
		var total = 0;
		for (var name in this.test_modules) {
			var testmodule = this.test_modules[name];
			total += testmodule.total();
		}
		return total
	},

	total_ran: function() {
		var total = 0;
		for (var name in this.test_modules) {
			var testmodule = this.test_modules[name];
			total += testmodule.total_ran();
		}
		return total
	},

	passing_total: function() {
		var total = 0;
		for (var name in this.test_modules) {
			var testmodule = this.test_modules[name];
			total += testmodule.passing_total();
		}
		return total
	}

});


/**************** content/js/tests.js *****************/
/*
 * regression tests
 *  --> checklist or manual tests
 * 
 * **methods to test: (stop_rec calls store_v calls update_t)
 *   (not done) start_recording(url);
 *   (not done) stop_record();
 *   (done) store_visit(url, start_time, duration);
 *   (done) update_totals(site, visit);
 * (done) crossed with visiting unsorted, pd and tws sites
 * test all data is correct: (done) times, (not done) amounts, (done) requirespayments
 * 
 * other tests:
 *   makes correct payments (extension, server, amazon)
 *       send server "test" flag to not make real transaction?
 *       refund?
 *       
 *       check duplicates
 *       verify in logs that schedule is on track ---> assert this in scheduled things
 *   payments to pd match expected skim
 *   time active tab correctly
 *   ??check self-imposed limits, eg large payments, visits?
 *   duplicate payments ok? or since time correct before and after?
 *   receives updates correctly, esp. with since times, duplicates
 *   "view logic" with multiauth, payments, state
 * run tests once a day and record failures in logs?
 * 
 * 
 * TESTS: may mutate database. checks that logic inserts appropriate objects into database.
 * CHECKS: checks database is well formed, not corrupted
 */
var PDChecks = function PDChecks(pddb, prefs) {
	this.pddb = pddb;
	this.prefs = prefs;
	
	this.time_tracker = new TimeTracker(pddb, prefs);
};
PDChecks.prototype = {};
_extend(PDChecks.prototype, {
	
	// no duplicates. that is, total<->payment link should be unique
	check_payment_total_taggings: function(testrunner) {
		var self = this;
		// {payment_id: [total_id, ...], ... }
		var links = {};
		self.pddb.PaymentTotalTagging.select({}, function(row) {
			var totals = links[row.payment_id];
			if (!totals) {
				totals = [];
			}
			var dupe = false;
			_iterate(totals, function(key, total, index) {
				if (total == row.total_id) { dupe = true; }
			});
			// assert no dupes
			testrunner.ok(!dupe,
				"PaymentTotalTagging links should be unique but found duplicate: "+row);

			totals.push(row.total_id);
			links[row.payment_id] = totals;
		});
	},
	
	///
	/// RequiresPayments must:
	/// * be for recipient or sitegroup totals
	/// * be for weekly totals
	/// * should not be partially paid (not currently allowed)
	/// * if pending:
	///     * should be single non-(success|cancel|refunded) Payment
	/// * else:
	///     * should not be a payment
	
	/// #@TODO single requires payment per total
	///
	check_requires_payments: function(testrunner) {
		var self = this;
		
		self.pddb.RequiresPayment.select({}, function(row) {
			var total = row.total();
			
			// recipient or sitegroup total only
			testrunner.ok(total.recipient() || total.sitegroup(),
					"Expected RECIPIENT or SITEGROUP requires_payment, not "+total.contenttype()+" total="+total);
			
			// weekly total only
			testrunner.ok(total.timetype().id == self.pddb.Weekly.id,
					"Expected WEEKLY requires_payment, not "+total.timetype()+" total="+total);

			// not partially paid
			if (row.is_partially_paid()) {
				testrunner.ok(false,
					"Partially paid RequiresPayment are not currently allowed !? "+row);
			} else{
				if (row.is_pending()) {
					testrunner.ok(row.total().payments().length != 0,
						"Pending RequiresPayment should have at least one payment: "+row+" total: "+row.total());
				} else {
					testrunner.ok(row.total().payments().length == 0,
						"Un-Pending RequiresPayment should have no payments: "+row+" total: "+row.total()+" payments: "+row.total().payments().length);
				}
			}
		});
	},
	
	///
	/// Payments.
	///
	check_payments: function(testrunner) {
		var self = this;
		logger("check payments pddb="+self.pddb);
		self.pddb.Payment.select({}, function(row) {
			logger("found one="+row);
			// all payments should have:
			//   1. sent_to_service = True
			//   2. a FPS Multiuse Pay
			// if payment is settled:
			//   3. FPS Multiuse Pay should be success
			//   4. totals should have no required payments
			// else:
			//   5. require payments should be pending
			//
			// 6. amount paid should equal sum of all totals
			// 7. contenttype_id and content_id should be the same for all totals
			
			// 1. sent_to_service = True
			testrunner.ok(row.is_sent_to_service(),
				"All payments should have sent_to_service True: " + row);
			
			// 2. a FPS Multiuse Pay
			testrunner.ok(row.fps_multiuse_pays().length > 0,
				"All payments should have at least one FPS Multiuse Pay: " + row);
			
			if (row.is_settled()) {
				// 4. totals should have no required payments
				_iterate(row.totals(), function(key, total, idx) {
					testrunner.ok(!total.requires_payment(),
						"All *settled* payments should have *zero* requires payment: "+row+"; total:"+total+" requires_payment: "+total.requires_payment());
					
				});
				// 3. FPS Multiuse Pay should be success
				if (row.most_recent_fps_multiuse_pay()) {
					testrunner.ok(row.most_recent_fps_multiuse_pay().success(),
						"All *settled* payments should have a *success* FPS Multiuse Pay: " + row);
				} else {
					testrunner.ok(false,
						"All *settled* payments should have a *most recent* FPS Multiuse Pay: " + row);
				}
			} else {
				// 5. require payments should be pending
				_iterate(row.totals(), function(key, total, idx) {
					if (total.requires_payment()) {
						testrunner.ok(total.requires_payment().is_pending(),
							"All *unsettled* payments should have a requires payment: "+row+" total: "+total+" requires_payment: "+total.requires_payment());
					} else {
						testrunner.ok(false,
							"All *unsettled* payments should have a *pending* requires payment: "+row+" total: "+total+" requires_payment: "+total.requires_payment());
					}
				});
			}

			// 6. amount paid should equal sum of all totals
			// 7. contenttype_id and content_id should be the same for all totals
			// 8. totals should all be for a recipient
			var sum = 0.0;
			var contenttype_id = -1;
			var content_id = -1;
			var recipient_contenttype = self.pddb.ContentType.get_or_null({
				modelname: "Recipient"
			});
			_iterate(row.totals(), function(key, total, idx) {
				sum += parseFloat(total.total_amount);
				if (contenttype_id == -1) {
					contenttype_id = total.contenttype_id;
					content_id = total.content_id;
				} else {
					testrunner.equals(contenttype_id, total.contenttype_id,
						"All payments should be for totals for the same contenttype");
					testrunner.equals(contenttype_id, recipient_contenttype.id,
						"All payments should be for totals for a Recipient");
					testrunner.equals(content_id, total.content_id,
						"All payments should be for totals for the same content");
				}
			});
			testrunner.equals((sum/100.0).toFixed(2), parseFloat(row.total_amount_paid).toFixed(2),
				"All payments' total_amount_paid should sum to the same sum of totals' total_amount. sum="+sum.toFixed(2));
		});
	},
});

var PDTests = function PDTests(pddb, prefs) {
	this.pddb = pddb;
	this.prefs = prefs;
};
PDTests.prototype = {};
_extend(PDTests.prototype, {

	test_update_totals: function(testrunner) {
		var self = this;
		
		/* after "store_visit" is called on a new site,
		 * we expect to have created the following pieces of data:
		   totals:
		     -> site, sitegroup, tag(, recipient if PD tagged)  x  
		     -> daily, weekly, forever
		   requirespayment:
		     -> weekly sitegroup if TWS tagged
		     -> weekly recipient if PD tagged
		   site: newdomain/newpage
		   sitegroup: newdomain
		   visit: to site for 60 seconds
		   recipient: if
		 */ 
		self.init_data();
		var duration = 60;
		
		_iterate(['Unsorted', 'ProcrasDonate', 'TimeWellSpent'], function(key, value, index) {
			testrunner.ok( true, "---------------- new "+ value +" url ----"+self.pddb[value]);
			logger(">>>>>> pddb is "+self.pddb+" <<<<<<");
			var s = "";
			for (var k in self.pddb) { s += "\n"+k; }
			logger(">>>>>> pddb contents "+s);
			var before_totals = self.retrieve_totals(testrunner, url, self.pddb[value]);
			// var url = self.visit_new_site(self.pddb[value], duration);
			var site = self.new_site(self.pddb[value]);
			var url = self.time_tracker.store_visit(site.url, _dbify_date(new Date()), duration);
			//
			self.check_totals(testrunner, url, duration, before_totals);
		});
	},
	
	init_data: function() {
		var self = this;
		var category = self.pddb.Category.get_or_create({
			category: "test"
		});
		var recipient = self.pddb.Recipient.get_or_create({
			slug: "test"
		}, {
			name: "Test",
			mission: "provide data for tests",
			url: "http://testrecip.xx",
			category_id: category.id,
			is_visible: false
		});
		self.pddb.RecipientPercent.get_or_create({
			recipient_id: recipient.id,
		}, {
			percent: 1,
		})
	},
	
	//
	// creates new tag
	// @param tag: tag instance
	//
	new_site: function(tag) {
		var self = this;
		var newdomain = create_caller_reference()+".com";
		var newpage = create_caller_reference()+".html";
		var url = "http://"+newdomain+"/"+newpage;

		sitegroup = self.pddb.SiteGroup.create_from_url(url, tag);
		return self.pddb.Site.create({
			url: url,
			sitegroup_id: sitegroup.id,
			flash: _dbify_bool(false),
			max_idle: constants.DEFAULT_FLASH_MAX_IDLE
		});
	},
	
	//
	// calls store_visit for new site
	// creates site and sitegroup with specified tag first if
	// specified tag is not Unosrted
	// @param tag: tag instance
	//
	visit_new_site: function(tag, seconds) {
		var site = this.new_site(tag);
		this.time_tracker.store_visit(site.url, _dbify_date(new Date()), seconds);
		return site.url
	},
	
	retrieve_totals: function(testrunner, url, tag) {
		var self = this;
		var totals = {}
		
		var site = self.pddb.Site.get_or_null({ url: url })
		var sitegroup = self.pddb.SiteGroup.get_from_url(url);
		var timetypes = [self.pddb.Daily, self.pddb.Weekly, self.pddb.Yearly, self.pddb.Forever];
		var times = [_dbify_date(_end_of_day()), _dbify_date(_end_of_week()), _dbify_date(_end_of_year()), _dbify_date(_end_of_forever())];
		
		for (var idx = 0; idx < timetypes.length; idx++) {
			self.pddb.ContentType.select({}, function(row) {
				// for each timetype-time x content, retrieve the total
				// remember, new sites and sitegroups will not exist yet.
				var content_ids = [];
				if (row.modelname == "Site") {
					if (site) content_ids.push(site.id);
				} else if (row.modelname == "SiteGroup") {
					if (sitegroup) content_ids.push(sitegroup.id);
				} else if (row.modelname == "Tag") {
					content_ids.push(tag.id);
				} else if (row.modelname == "Recipient") {
					self.pddb.RecipientPercent.select({}, function(r) {
						var recip = self.pddb.Recipient.get_or_null({ id: r.recipient_id });
						content_ids.push(recip.id);
					});
				} else {
					testrunner.ok(false, "unknown content type");
				}
				
				_iterate(content_ids, function(key, value, index) {
					var total = self.pddb.Total.get_or_null({
						contenttype_id: row.id,
						content_id: value,
						timetype_id: timetypes[idx].id,
						datetime: times[idx]
					});
					if (total) {
						totals[total.id] = total;
					} else {
						testrunner.ok(false, "While retrieving before totals, maybe expected total but found none? If " +
								"rerunning these tests does not make this failure go away, then there is a problem." +
								"(First run of the day causes this failure because no total for the day (and week) yet.) "+
								row.modelname+" id: "+value+" "+timetypes[idx].timetype+" "+times[idx]);							
					}
				});
			});
		}
		return totals
	},

	///
	/// also checks RequiresPayment
	///
	check_totals: function(testrunner, url, seconds, before_totals) {
		var self = this;
		var site = self.pddb.Site.get_or_null({ url: url })
		var timetypes = [self.pddb.Daily, self.pddb.Weekly, self.pddb.Yearly, self.pddb.Forever];
		var times = [_dbify_date(_end_of_day()), _dbify_date(_end_of_week()), _dbify_date(_end_of_year()), _dbify_date(_end_of_forever())];
		
		for (var idx = 0; idx < timetypes.length; idx++) {
			self.pddb.ContentType.select({}, function(row) {
				// for each timetype-time x content, retrieve the total
				var content_ids = [];
				var requires_payments_ids = {};
				if (row.modelname == "Site") {
					content_ids.push(site.id);
				} else if (row.modelname == "SiteGroup") {
					content_ids.push(site.sitegroup().id);
					requires_payments_ids[site.sitegroup().id] = 
						(timetypes[idx].id == self.pddb.Weekly.id &&
						site.tag().id == self.pddb.TimeWellSpent.id);
				} else if (row.modelname == "Tag") {
					content_ids.push(site.tag().id);
				} else if (row.modelname == "Recipient") {
					if (site.tag() == self.pddb.ProcrasDonate.id) {
						self.pddb.RecipientPercent.select({}, function(r) {
							var recip = self.pddb.Recipient.get_or_null({ id: r.recipient_id });
							content_ids.push(recip.id);
							requires_payments_ids[recip.id] = 
								(timetypes[idx].id == self.pddb.Weekly.id &&
								site.tag().id == self.pddb.ProcrasDonate.id);
						});
					}
				} else {
					testrunner.ok(false, "unknown content type");
				}
				
				_iterate(content_ids, function(key, value, index) {
					var total = self.pddb.Total.get_or_null({
						contenttype_id: row.id,
						content_id: value,
						timetype_id: timetypes[idx].id,
						datetime: times[idx]
					});
					/***** verify total times and amounts ************************************/
					if (!total) {
						testrunner.ok(false, "No total found for contenttype: "+row.id+
								", content: "+value+", timetype: "+timetypes[idx].id+
								", datetime: "+times[idx]);
					} else {
						//// CHECK TOTAL TIME ///////
						var expected_time = null;
						var before_total = before_totals[total.id];
						if (!before_total) {
							expected_time = seconds;
						} else {
							expected_time = parseFloat(before_total.total_time) + seconds;
						}
						testrunner.equals(expected_time, total.total_time,
							"Total (id="+total.id+") has incorrrect total_time");
						/*if (before_total) {//total.total_time != expected_time) {
							testrunner.ok(false, "BEFORE TOTAL="+before_total+
									"   TOTAL="+total);
						}*/	
						
						////// CHECK TOTAL AMOUNTS ///////
						if (site.tag().id == self.pddb.Unsorted) {
							//testrunner.equals(total.total_amount, 0, "Expected 0 seconds for");
						}
						
						////// CHECK REQUIRES PAYMENTS ///////
						var requires_payment = self.pddb.RequiresPayment.get_or_null({
							total_id: total.id
						});
						if (requires_payments_ids[value]) {
							testrunner.ok(requires_payment,
									"Expected requires_payment for total--"+total+"--but found none");
						} else {
							testrunner.ok(!requires_payment,
									"Did not expect requires_payment for total--"+total+"--but found one--"+requires_payment);
						}
					}
					/**********************************************************************/
				});
			});
		}
	},

	/**
	 * [
	 *  {fn, self, args, interval},
	 *  {fn, self, args, interval},
	 *  ...
	 * ]
	 */
	sequentialize: function(items, idx) {
		var self = this;
		if (idx < items.length) {
			logger("SEQUENTIALIZE "+idx+" interval="+items[idx].interval);
			items[idx].fn.apply(items[idx].self, items[idx].args);
			if (items[idx].interval) {
				setTimeout(function() {
					self.sequentialize(items, idx+1);
				}, items[idx].interval);
			} else if (idx+1 < items.length) {
				logger("no timeout interval set");
				self.sequentialize(items, idx+1);
			}
		}
	},
	
	check_visits: function(testrunner, display_results_callback, site, expected_durations) {
		var actual_durations = [];
		this.pddb.Visit.select({
			site_id: site.id
		}, function(row) {
			actual_durations.push(parseInt(row.duration));
		});
		logger(" expected_durations = "+expected_durations.join(", ")+
			"\n actual_durations = "+actual_durations.join(", "));
		
		testrunner.equals(expected_durations.length, actual_durations.length, 
				"Expected and actual visit durations do not match for site="+site+
				"\n actual_durations="+actual_durations.join(", ")+
				"\n expected_durations="+expected_durations.join(", "));
		
		_iterate(expected_durations, function(key, actual, index) {
			testrunner.ok(index < actual_durations.length, 
					"More expected visits than actual visits for site="+site+
					"\n actual_durations="+actual_durations.join(", ")+
					"\n expected_durations="+expected_durations.join(", "));
			
			testrunner.equals(actual_durations[index], actual, " ");
		});
		
		// display results
		display_results_callback(testrunner);
	},
	
	/**
	 * Permutate on idle/back and focus/blur combinations.
	 * 
	 * Need to mimic boundary-case timings in actual use.
	 * For example, idle/back calls can be delayed by as much as 5 seconds.
	 * Focus/blur has a 1-second delay to collate groups of calls.
	 * 
	 *  Make sure these use cases and others are covered.
	 */
	test_idle_focus_combos: function(testrunner, display_results_callback) {
		var self = this;
		this.sequentialize(
			[{
				fn: self._simple_idle,
				self: self,
				args: [testrunner, display_results_callback],
				interval: 30000
			}, {
				fn: self._simple_focus,
				self: self,
				args: [testrunner, display_results_callback],
				interval: 30000
			}, {
				fn: self._simple_mixed_1,
				self: self,
				args: [testrunner, display_results_callback],
				interval: 50000
			}, {
				fn: self._simple_mixed_2,
				self: self,
				args: [testrunner, display_results_callback],
				interval: 50000
			}, {
				fn: self._simple_mixed_3,
				self: self,
				args: [testrunner, display_results_callback],
				interval: 50000
			}, {
				fn: self._simple_mixed_4,
				self: self,
				args: [testrunner, display_results_callback],
				interval: 50000
			}],
			0
		);
	},
	
	/**
	 * start_recording, idle, back, stop_recording
	 */
	_simple_idle: function(testrunner, display_results_callback) {
		var self = this;
		var site = this.new_site(this.pddb.ProcrasDonate);
		self._create_sequence(
			testrunner,
			display_results_callback,
			site,
			[{
				fn: self.pddb.start_recording,
				self: self.pddb,
				args: [site.url],
				interval: Math.floor(Math.random()*7000)+2000,
				expected_visit: true
			}, {
				fn: self.pddb.idle,
				self: self.pddb,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000
			}, {
				fn: self.pddb.back,
				self: self.pddb,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000,
				expected_visit: true
			}, {
				fn: self.pddb.stop_recording,
				self: self.pddb,
				args: [],
				interval: 0
			}]
		);
	},
	
	/**
	 * start_recording, blur, focus, stop_recording
	 */
	_simple_focus: function(testrunner, display_results_callback) {
		var self = this;
		var site = this.new_site(this.pddb.ProcrasDonate);
		self._create_sequence(
			testrunner,
			display_results_callback,
			site,
			[{
				fn: self.pddb.start_recording,
				self: self.pddb,
				args: [site.url],
				interval: Math.floor(Math.random()*7000)+2000,
				expected_visit: true
			}, {
				fn: self.pddb.blur,
				self: self.pddb,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000
			}, {
				fn: self.pddb.focus,
				self: self.pddb,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000,
				expected_visit: true
			}, {
				fn: self.pddb.stop_recording,
				self: self.pddb,
				args: [],
				interval: 0
			}]
		);
	},
	
	/**
	 * start_recording, blur, idle, back, focus, stop_recording
	 */
	_simple_mixed_1: function(testrunner, display_results_callback) {
		var self = this;
		var site = this.new_site(this.pddb.ProcrasDonate);
		self._create_sequence(
			testrunner,
			display_results_callback,
			site,
			[{
				fn: self.pddb.start_recording,
				self: self.pddb,
				args: [site.url],
				interval: Math.floor(Math.random()*7000)+2000,
				expected_visit: true
			}, {
				fn: self.pddb.blur,
				self: self.pddb,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000
			}, {
				fn: self.pddb.idle,
				self: self.pddb,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000,
			}, {
				fn: self.pddb.back,
				self: self.pddb,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000,
			}, {
				fn: self.pddb.focus,
				self: self.pddb,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000,
				expected_visit: true
			}, {
				fn: self.pddb.stop_recording,
				self: self.pddb,
				args: [],
				interval: 0
			}]
		);
	},
	
	/**
	 * start_recording, blur, idle, focus, back, stop_recording
	 */
	_simple_mixed_2: function(testrunner, display_results_callback) {
		var self = this;
		var site = this.new_site(this.pddb.ProcrasDonate);
		self._create_sequence(
			testrunner,
			display_results_callback,
			site,
			[{
				fn: self.pddb.start_recording,
				self: self.pddb,
				args: [site.url],
				interval: Math.floor(Math.random()*7000)+2000,
				expected_visit: true
			}, {
				fn: self.pddb.blur,
				self: self.pddb,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000
			}, {
				fn: self.pddb.idle,
				self: self.pddb,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000,
			}, {
				fn: self.pddb.focus,
				self: self.pddb,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000,
				expected_visit: true // #@TODO ?
			}, {
				fn: self.pddb.back,
				self: self.pddb,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000,
				expected_visit: true // #@TODO ?
			}, {
				fn: self.pddb.stop_recording,
				self: self.pddb,
				args: [],
				interval: 0
			}]
		);
	},
	
	/**
	 * start_recording, idle, blur, back, focus, stop_recording
	 */
	_simple_mixed_3: function(testrunner, display_results_callback) {
		var self = this;
		var site = this.new_site(this.pddb.ProcrasDonate);
		self._create_sequence(
			testrunner,
			display_results_callback,
			site,
			[{
				fn: self.pddb.start_recording,
				self: self.pddb,
				args: [site.url],
				interval: Math.floor(Math.random()*7000)+2000,
				expected_visit: true
			}, {
				fn: self.pddb.idle,
				self: self.pddb,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000
			}, {
				fn: self.pddb.blur,
				self: self.pddb,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000,
			}, {
				fn: self.pddb.back,
				self: self.pddb,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000,
			}, {
				fn: self.pddb.focus,
				self: self.pddb,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000,
				expected_visit: true
			}, {
				fn: self.pddb.stop_recording,
				self: self.pddb,
				args: [],
				interval: 0
			}]
		);
	},
	
	/**
	 * start_recording, idle, blur, focus, back, stop_recording
	 */
	_simple_mixed_4: function(testrunner, display_results_callback) {
		var self = this;
		var site = this.new_site(this.pddb.ProcrasDonate);
		self._create_sequence(
			testrunner,
			display_results_callback,
			site,
			[{
				fn: self.pddb.start_recording,
				self: self.pddb,
				args: [site.url],
				interval: Math.floor(Math.random()*7000)+2000,
				expected_visit: true
			}, {
				fn: self.pddb.idle,
				self: self.pddb,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000
			}, {
				fn: self.pddb.blur,
				self: self.pddb,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000,
			}, {
				fn: self.pddb.focus,
				self: self.pddb,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000,
				expected_visit: true // #@TODO ?
			}, {
				fn: self.pddb.back,
				self: self.pddb,
				args: [],
				interval: Math.floor(Math.random()*7000)+2000,
				expected_visit: true // #@TODO ?
			}, {
				fn: self.pddb.stop_recording,
				self: self.pddb,
				args: [],
				interval: 0
			}]
		);
	},
	
	/**
	 * 
	 */
	_create_sequence: function(testrunner, display_results_callback, site, actions) {
		var self = this;
		
		var expected_durations = [];
		var sequence = [];
		
		_iterate(actions, function(key, action, index) {
			if (action.expected_visit) {
				expected_durations.push(Math.round(action.interval/1000.0));
			}
			sequence.push({
				fn: action.fn,
				self: action.self,
				args: action.args,
				interval: action.interval
			});
		});
		// append tests to sequence
		sequence.push({
			fn: self.check_visits,
			self: self,
			args: [testrunner, display_results_callback, site, expected_durations],
			interval: 1
		})
		// initiate sequence execution
		self.sequentialize(sequence, 0);
	},

});

/**************** content/js/lib/template/filters/base.js *****************/

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


/**************** content/js/lib/template/tags/base.js *****************/
var IF_BUG = false;

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
			if (IF_BUG) logger("IS ODD "+(i%2 != 0));
			var forloop = {
					'parentloop' : parentloop,
					'first' : i==0,
					'last'	: i==sequence.length - 1,
					'counter': i+1,
					'counter0': i,
					'revcounter': sequence.length - i,
					'revcounter0': sequence.length - i - 1,
					'is_odd': (i%2 != 0)
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
		if (IF_BUG) _pprint(args, "----------------------- IF ARGS");
		var bool_exprs = args[0];
		var link_type = args[1];
		var nodelist_true = args[2];
		var nodelist_false = args[3];
		
		if (IF_BUG) logger("BOOL EXPRS: "+bool_exprs);
		if (IF_BUG) logger("LINK TYPE: "+link_type);
		
		if (link_type == OR) {
			if (IF_BUG) logger("OR");
			for (var be in bool_exprs) {
				var ifnot = bool_exprs[be][0];
				var bool_expr = bool_exprs[be][1];
				value = pythonTrue(this.render_filter(bool_expr, context, env));
				if (IF_BUG) logger("value="+value);
				if ((value && !ifnot) || (ifnot && !value))
					return this.render_nodelist(nodelist_true, context, env);
			}
			if (IF_BUG) logger("false");
			return this.render_nodelist(nodelist_false, context, env);
		} else {
			if (IF_BUG) logger("AND");
			for (var be in bool_exprs) {
				var ifnot = bool_exprs[be][0];
				var bool_expr = bool_exprs[be][1];
				value = pythonTrue(this.render_filter(bool_expr, context, env));
				if (IF_BUG) logger("value="+value);
				if (!((value && !ifnot) || (ifnot && !value)))
					return this.render_nodelist(nodelist_false, context, env);
			}
			if (IF_BUG) logger("true");
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
	'ifnotequal':function(args, context, env) {
		return !this.ifequal(args, context, env);
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




/**************** content/js/lib/template.js *****************/
var DEBUG_TEMPLATE_VARS = false;

//var Base = Class;
//console.debug("hmm");

function isContext(o) {
	return o instanceof Context;
}

function get(o, attr, _default) {
	if (DEBUG_TEMPLATE_VARS) logger("GET: o="+o+" attr="+attr+" _default="+_default)
	if (!attr) {
		return o;
	} else if (!o) {
		return _default || null;
	}
	_default = _default || null;
	
	if (isString(attr) && attr.match(/^\d+$/)) {
		if (DEBUG_TEMPLATE_VARS) logger(">GET: is string and \d match");
		attr = parseInt(attr);
	}
	
	var ret = _default;
	if (isContext(o)) {
		if (DEBUG_TEMPLATE_VARS) logger(">GET: is context");
		ret = o.get(attr) || _default;
		//return (ret != null && ret) || _default;
	} else if (isObject(o) || isArray(o)) {
		if (DEBUG_TEMPLATE_VARS)  {
			for (var k in o) {
				logger("...............k="+k+" o[k]="+o[k]);
			}
		}
		ret = (attr in o ? o[attr] : _default);
		if (DEBUG_TEMPLATE_VARS) logger(">GET: is object or array     attr="+attr+"  ret="+ret+"     o[attr]="+o[attr]);
		if (DEBUG_TEMPLATE_VARS) _pprint(ret);
	} else {
		if (Template.DEBUG_TEMPLATES)
			Error("Unhandled object type in 'get': "+o);
		return _default;
	}
	
	if (isFunction(ret)) {
		if (DEBUG_TEMPLATE_VARS) logger(">GET: IS FUNC!")
		return ret.apply(o);
	} else {
		if (DEBUG_TEMPLATE_VARS) logger(">GET: not a func... returned "+ret+"   typeof(ret)="+typeof(ret));
		return ret;
	}
	
}

//var FILTERS = {
//	upper: function(s) { return s.toUpperCase(); },
//	lower: function(s) { return s.toLowerCase(); }, 
//	join: function(list, separator) { 
//		return list.join(separator); 
//	},
//	map_fields: function(o, field) { 
//		var ret = [];
//		for (var i=0; i<o.length; i++)
//			ret.push(o[i][field]);
//		return ret;
//	},
//	date:	function(s, format) { 
//		return date_format(s, format); 
//	},
//	floatformat: function(s, size) {
//		s = ff_test[ff_i % ff_test.length];
//		ff_i += 1;
//		if (size == undefined)
//			size = -1;
//		var ret = s.toFixed(size < 0 ? 0-size : size);
//		return (size < 0 ? ret : parseFloat(ret));
//	},
//};

function Context(obj) {
	obj = obj || {};
	this.stack = [obj];
}
Context.prototype = {};
_extend(Context.prototype, {
	//init: function(o) {
	//	o = o||{};
	//	this.stack = [o];
	//},
	//stack: null,
	
	get: function(name) {
		for (var si=0; si<this.stack.length; si++) {
			if (name in this.stack[si])
				return this.stack[si][name];
		}
		return undefined;
	},
	//get: function(attr) {
	//	for (var o in this.stack) {
	//		if (attr in this.stack[o])
	//			return this.stack[o][attr];
	//	}
	//	return undefined;
	//},
	set: function(name, val) {
		//for (var o in this.stack) {
		for (var si=0; si<this.stack.length; si++) {
			if (name in this.stack[si]) {
				this.stack[si][name] = val;
				return this.stack[si][name];
			}
		}
		this.stack[0][attr] = val;
		return this.stack[0][name];
	},
	assign: function(name, val) {
		this.stack[0][name] = val;
		return this.stack[0][name];
	},
	
	push: function(o) {
		o = o||{};
		this.stack.unshift(o);
	},
	pop: function() {
		return this.stack.shift();
	},
	
});

function RequestContext(obj) {
	Context.apply(this, [obj]);
	for (var pi in settings.TEMPLATE_CONTEXT_PROCESSORS) {
		var processor = settings.TEMPLATE_CONTEXT_PROCESSORS[pi];
		this.push(RequestContext.process(processor));
	}
	this.push(obj);
}
RequestContext.prototype = new Context();
_extend(RequestContext.prototype, {
	//init: function(o) {
	//	this._super();
	//	for (var pi in settings.TEMPLATE_CONTEXT_PROCESSORS) {
	//		var processor = settings.TEMPLATE_CONTEXT_PROCESSORS[pi];
	//		this.push(RequestContext.process(processor));
	//	}
	//	this.push(o);
	//},
});
_extend(RequestContext, {
	process: function(o) {
		if (isFunction(o)) {
			try {
				return o();
			} catch (e) {
				if (Template.DEBUG_TEMPLATES)
					Error(e, "Caught exception while processing context.");
				return {};
			}
		} else if (isString(o)) {
			try {
				return RequestContext.process(eval(o));
			} catch (e) {
				if (Template.DEBUG_TEMPLATES)
					Error(e, "Caught exception while processing context.");
				return {};
			}
		} else {
			if (Template.DEBUG_TEMPLATES)
				Error("Unhandled context processor: "+o);
			return {};
		}
	},
});


function Template(name, options) {
	this.name = name || Math.random(10000);
	this.options = options || {};
	if (this.options.cache)
		Template.Cache[name] = this;
	this.FILTERS = this.options.filters || FILTERS;
	this.DEBUG_TEMPLATES = true;
	//if (options.filters)
	//	this.filters
}

Template.prototype = {};
_extend(Template.prototype, {
	//init: function(name) {
	//	name = name || Math.random(10000);
	//	Template.Cache[name] = this;
	//},
	render: function() {
		if (this.DEBUG_TEMPLATES)
			Error("Undefined method Template#render()");
		return null;
	},
});
_extend(Template, {
	Cache: {},
	FILTERS: FILTERS,
	RENDERERS: [],
	DEBUG_TEMPLATES: true,
	
	//compile: function(o, name) {
	//	if (isString(o)) {
	//		return new StringTemplate(o, name);
	//	} else if (isObject(o)) {
	//		return new DjangoTemplate(o, name);
	//	} else {
	//		if (this.DEBUG_TEMPLATES)
	//			Error("Unknown template type: "+o);
	//	}
	//},
	get: function(name) {
		//logger("Template.get(\"" + name + "\")");
		var t = Template.Cache[name];
		if (t)
			return t;
		//logger("pop " + name);
		if (this.DEBUG_TEMPLATES)
			Error("Template.get: Failed to retrieve template '"+name+"'.");
	},
	//load: function(names, fn) {
	//	if (!isArray(names)) 
	//		names = [names];
	//	var needed = [];
	//	for (var ni in names) {
	//		var n = names[ni];
	//		if (!Template.Cache[name])
	//			needed.push(n);
	//	}
	//	if (needed.length > 0) {
	//		var cb = function(data) { 
	//			for (var ti in data) { 
	//				var t = data[ti];
	//				Template.compile(t, ti);
	//			}
	//			if (fn)
	//				return fn();
	//		}
	//		JSON('get_template', cb, {'template_name':needed.join(',')});
	//	} else {
	//		if (fn)
	//			return fn();
	//	}
	//},
	
	compile: function(obj, name) {
		//logger(["Template:", obj, name])
		var klass = Template.get_template_class(obj);
		var template = new klass(obj);
		if (name)
			Template.Cache[name] = template;
		return template;
	},
	render: function(obj, context) {
		// ?? not called. one in django.js is called.
		logger("template.js");
		context.assign("constants", constants);
		var klass = Template.get_template_class(template);
		var template = new klass(obj);
		return template.render(context);
	},
	
	get_template_class: function(obj) {
		var ri, klass, condition_fn;
		if (obj instanceof Template)
			return obj;
		else {
			for (ri=0; ri<Template.RENDERERS.length; ri++) {
				condition_fn = Template.RENDERERS[ri][1];
				if (condition_fn(obj)) {
					klass = Template.RENDERERS[ri][0];
					return klass;
				}
			}
		}
		return null;
	},
	register_template_class: function(klass, condition_fn) {
		Template.RENDERERS.push([klass, condition_fn]);
	},
});


function StringTemplate(s, name, options) {
	Template.apply(this, [name, options]);
	this.template = s;
}
StringTemplate.prototype = new Template();
_extend(StringTemplate.prototype, {
	//init: function(s, name) {
	//	this._super(name);
	//	this.template = s;
	//},
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
Template.register_template_class(StringTemplate, function(template) {
	return isString(template);
});



function FunctionTemplate(fn, name, options) {
	Template.apply(this, [name, options]);
	
	if (isFunction(fn)) {
		this.fn = fn;
	} else if (isString(fn)) {
		this.fn = eval(fn);
	} else {
		throw Error("Invalid function in FunctionTemplate.init().");
	}
}
FunctionTemplate.prototype = new Template();
_extend(FunctionTemplate.prototype, {
	//init: function(fn, name) {
	//	this._super(name);
	//},
	render_many: function(list) {
		if (isArray(list)) {
			var out = [];
			for (var i=0; i<list.length; i++) {
				out.push(this.fn(list[i]));
			}
			return out;
		} else {
			throw Error("Invalid list in FunctionTemplate.render_many().");
		}
	},
	render: function(o) {
		return this.fn(o);
	},
});
Template.register_template_class(FunctionTemplate, function(template) {
	return isFunction(template);
});



/**************** content/js/lib/template/django.js *****************/
	
function pythonTrue(o) {
	// logger("o = "+o);
	if (isString(o) && o.length == 0) 
		return false;
	if (isArray(o) && o.length == 0)
		return false;
	// logger("   !!o = "+(!!o));
	return !!o;
}


var DjangoTemplate = function(o, name, options) {
	Template.apply(this, [name, options]);
	this.nodelist = o || [];
	this.TAGS = this.options.tags || TAGS;
	
	this.DEBUG = false;
}
DjangoTemplate.prototype = new Template();
_extend(DjangoTemplate.prototype, {
	//init: function(o, name) {
	//	this._super(name);
	//	this.nodelist = o || [];
	//},
	
	render_variable: function(v, context, env) {
		if (this.DEBUG) logger("RENDER VARIABLE");
		if (isNumber(v) || isString(v) || isBoolean(v)) {
			if (this.DEBUG) logger("is a: num, str, bool");
			return v;
		} else if (isArray(v)) {
			if (this.DEBUG) logger("is: array");
			var ret = context;
			if (this.DEBUG) _pprint(v);
			for (var ai in v) {
				if (this.DEBUG) logger("ai="+ai+"  v.ai="+v[ai]+" get="+get(ret, v[ai]));
				ret = get(ret, v[ai]);
			}
			if (this.DEBUG) logger("RENDER VARIABLE returning: "+ret);
			return ret;
		} else {
			if (this.DEBUG) logger("is...unknown");
			if (Template.DEBUG_TEMPLATES)
				Error("Unknown variable type: "+v);
			return null;
		}
	},
	
	render_filter: function(v, context, env) {
		if (this.DEBUG) logger("\n\nRENDER FILTER ");
		if (this.DEBUG) _pprint(v);
		if (!isArray(v)) {
			if (isString(v)) {
				if (this.DEBUG) logger("is string");
				m = v.match(/^["'](.*)['"]$/);
				if (this.DEBUG) logger("m="+m);
				if (m)
					return m[1];
			}
			if (this.DEBUG) logger("is not string");
			return v;
		}
		if (v[0] == 'var')
			v = v.slice(1);
		if (this.DEBUG) logger("v.slice(1)="+v);
		
		var ret = context;
		var filters = v[1];
		if (this.DEBUG) logger("filters="+v[1])
		v = v[0];
		if (this.DEBUG) logger("v[0]="+v[0])
		
		ret = this.render_variable(v, context, env);
		if (this.DEBUG) logger("RET="+ret);
		
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
		if (this.DEBUG) logger("RENDER FILTER returning "+ret);
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
		context.assign("constants", constants);
		env = this.build(context, env);
		return env.html;
	},
	
});

Template.register_template_class(DjangoTemplate, function(obj) {
	return isArray(obj);
});


/**************** content/js/templates/all.js *****************/

    Template.compile(["<form name='account_form' onSubmit='return false'>\n\t\n\t<h3>Please sign in using your Twitter account:</h3>\n\t\n\t<table>\n\t\t<tbody>\n\t\t\t<!--\n\t\t\t<tr>\n\t\t\t\t<td><label class='form-right'>Twitter username </label></td>\n\t\t\t\t<td><input class='form-left' type='text' name='twitter_username' value='", ["var", ["twitter_username"], []], "'></td>\n\t\t\t\t<td class='form-left'>\n\t\t\t\t\t\tClick <a href='https://twitter.com/signup'>HERE</a> if you're not on twitter yet.\n\t\t\t\t\t\t<span id='what_is_twitter' class='link'>What is Twitter?</span>\n\t\t\t\t</td>\n\t\t\t</tr>\n\t\t\t\n\t\t\t<tr>\n\t\t\t\t<td><label class='form-right'>Twitter password</label></td>\n\t\t\t\t<td><input class='press_enter_for_next form-left' type='password' name='twitter_password' value='", ["var", ["twitter_password"], []], "'></td>\n\t\t\t\t<td class='help form-left'>\n\t\t\t\t\t\tYour Twitter password is only revealed to \n\t\t\t\t\t\t<a href=\"http://TipJoy.com\">TipJoy</a> for handling micro-payments:\n\t\t\t\t\t\t<a href='", ["var", ["constants", "HOME_URL"], []], "'>Privacy Guarantee</a>\n\t\t\t\t\t</td>\n\t\t\t</tr>\n\t\t\t-->\n\t\t\t<tr>\n\t\t\t\t<td><label class='form-right'>Email</label></td>\n\t\t\t\t<td><input class='press_enter_for_next form-left' type='text' name='email' value='", ["var", ["email"], []], "'></td>\n\t\t\t\t<td class='help form-left'>\n\t\t\t\t\t\tWe'll send you weekly summaries of your\n\t\t\t\t\t\tProcrasDonation and TimeWellSpent activities.\n\t\t\t\t</td>\n\t\t\t\t<td><input class='right' type='checkbox' name='recip_newsletters' value='agree' \n\t\t\t\t\t", ["if", [[false, ["var", ["recip_newsletters"], []]]], 1, ["checked "], []], "/></td>\n\t\t\t\t<td><label class='left'>I want to receive occaisional\n\t\t\t\t\tthank you emails and a year-end summary email from charities I donate to.</label></td>\n\t\t\t</tr>\n\t\t</tbody>\n\t</table>\n\t<table>\n\t\t<tbody>\n\t\t\t<tr>\n\t\t\t\t<td><input class='right' type='checkbox' name='tos' value='agree' \n\t\t\t\t\t", ["if", [[false, ["var", ["tos"], []]]], 1, ["checked "], []], "/></td>\n\t\t\t\t<td><label class='left'>I agree to the Terms of Use</label></td>\n\t\t\t</tr>\t\t\n\t\t</tbody>\n\t</table>\n\t\n\t<h2><a name='tos'></a>Terms of Use</h2>\n\t<img src='", ["var", ["constants", "MEDIA_URL"], []], "img/TermsOfUse.png' class='small-image'>\n\t<p>By using our service you agree to the following:\n\t\t<ul class='paragraph_list'>\n\t\t\t<li>ProcrasDonate may update these terms of service without warning or notification.\n\t\t\t<li>You understand how our service works and are willingly participating.\n\t\t\t<li>You agree to pay all pledges made on your behalf in full.\n\t\t\t<li>A percentage that you determine of your donations is donated to our service.\n\t\t\t<li>You are responsible for any content you add to this site.\n\t\t\t<li>Illegal, unfriendly, or otherwise problematic content will be removed.\n\t\t\t<li>Your individual records and settings are private and not accessible by our company.\n\t\t\t<li>Your summary records are used for community statistics and other as yet undetermined uses (hopefully that will support the service financially).\n\t\t\t<li>All rights are reserved including ProcrasDonate intellectual property of software and our business model.\n\t\t\t</li><li><b>Thanks for ProcrasDonating!</b>\n\t\t</ul>\n\t</p>\n\t\n</form>\n"], "account_middle");
    
    Template.compile(["<form action=\"", ["var", ["action_url"], []], "\" method=\"get\">\n\t<input\n\t\ttype=\"image\"\n\t\tsrc=\"https://authorize.payments.amazon.com/pba/images/SMSubscribeWithOutLogo.png\"\n\t/>\n\t", ["for", ["pair"], ["var", ["parameter_pairs"], []], false, ["\n\t\t<input\n\t\t\ttype=\"hidden\"\n\t\t\tname=\"", ["var", ["pair", "name"], []], "\"\n\t\t\tvalue=\"", ["var", ["pair", "value"], []], "\"\n\t\t/>\n\t"]], "\n\t\n\t", ["var", ["hack_html"], []], "\n</form>\n"], "authorize_payments");
    
    Template.compile(["<h3 class='RegisterHeader'>Donations and Goals (can be changed later)</h3>\n\t\n<form id=\"donation_form\" name=\"donation_form\" onSubmit=\"return false\">\n\t<p>How many <b>pennies per hour</b> will you donate?</p>\n\t<table>\n\t\t<tbody>\n\t\t\t<tr><td colspan=\"2\">\t\t\n\t\t\t\t\t<img src=\"", ["var", ["constants", "MEDIA_URL"], []], "img/ToolbarImages/ProcrasDonateIcon.png\" class=\"icon-image\">\t\t\n\t\t\t\t\twhen <i>ProcrasDonating</i>\n\t\t\t\t</td></tr>\n\t\t\t<tr>\n\t\t\t\t<td><input class='form-right form-value' type='text' size='4' name='pd_dollars_per_hr' value='", ["var", ["pd_dollars_per_hr"], []], "'></td>\n\t\t\t\t<td><div class='help form-left form-label'>$ per hour</div></td>\n\t\t\t</tr>\n\t\t</tbody>\n\t</table>\n\t<table>\n\t\t<tbody>\n\t\t\t<tr><td colspan=\"2\">\n\t\t\t\t\t<img src=\"", ["var", ["constants", "MEDIA_URL"], []], "img/ToolbarImages/TimeWellSpentIcon.png\" class=\"icon-image\">\t\t\n\t\t\t\t\ton <i>TimeWellSpent</i>\n\t\t\t\t</td></tr>\n\t\t\t<tr>\n\t\t\t\t<td><input class='form-right form-value' type='text' size='4' name='tws_dollars_per_hr' value='", ["var", ["tws_dollars_per_hr"], []], "'></td>\n\t\t\t\t<td><div class='help form-left form-label'>$ per hour</div></td>\n\t\t\t</tr>\n\t\t</tbody>\n\t</table>\n\t<p>What are your online time management <b>goals</b>?</p>\n\t<table>\n\t\t<tbody>\n\t\t\t<tr><td colspan=\"2\">\n\t\t\t\t<img src=\"", ["var", ["constants", "MEDIA_URL"], []], "img/ToolbarImages/ProcrasDonateIcon.png\" class=\"icon-image\">\t\t\n\t\t\t\t\tfor <i>ProcrasDonating</i>\n\t\t\t\t</td></tr>\n\t\t\t<tr>\n\t\t\t\t<td><input class='form-right form-value' id='pd_hr_per_week_goal' type='text' size='4' \n\t\t\t\t\t\tname='pd_hr_per_week_goal' value='", ["var", ["pd_hr_per_week_goal"], []], "'></td>\n\t\t\t\t<td>\n\t\t\t\t\t<div class='help form-left form-label'>hours per week</div>\n\t\t\t\t\t<span id='dollars_per_week_goal'></span>\n\t\t\t\t</td>\n\t\t\t</tr>\n\t\t</tbody>\n\t</table>\n\t<table>\n\t\t<tbody>\n\t\t\t<tr><td colspan=\"2\">\n\t\t\t\t\t<img src=\"", ["var", ["constants", "MEDIA_URL"], []], "img/ToolbarImages/TimeWellSpentIcon.png\" class=\"icon-image\">\t\t\n\t\t\t\t\tfor <i>TimeWellSpent</i>\n\t\t\t\t</td></tr>\n\t\t\t<tr>\n\t\t\t\t<td><input class='form-right form-value' id='tws_hr_per_week_goal' type='text' size='4' name='tws_hr_per_week_goal' value='", ["var", ["tws_hr_per_week_goal"], []], "'></td>\n\t\t\t\t<td>\n\t\t\t\t\t<div class='help form-left form-label'>hours per week</div>\n\t\t\t\t\t<span id='dollars_per_week_goal'></span>\n\t\t\t\t</td>\n\t\t\t</tr>\n\t\t</tbody>\n\t</table>\t\t\t\n\t<p>What is your weekly <b>limit</b>, beyond which no pledges will be made?</p>\n\t<table>\n\t\t<tbody>\n\t\t\t<tr><td colspan=\"2\">\n\t\t\t\t\t<img src=\"", ["var", ["constants", "MEDIA_URL"], []], "img/ToolbarImages/ProcrasDonateIcon.png\" class=\"icon-image\">\t\t\n\t\t\t\t\tof <i>ProcrasDonation</i>\n\t\t\t\t</td></tr>\n\t\t\t<tr>\n\t\t\t\t<td><input class='press_enter_for_next form-right form-value' id='pd_hr_per_week_max' type='text' size='4' name='pd_hr_per_week_max' value='", ["var", ["pd_hr_per_week_max"], []], "'></td>\n\t\t\t\t<td><div class='help form-left form-label'>hours per week</div></td>\n\t\t\t</tr>\n\t\t</tbody>\n\t</table>\n\t<table>\n\t\t<tbody>\n\t\t\t<tr><td colspan=\"2\">\n\t\t\t\t\t<img src=\"", ["var", ["constants", "MEDIA_URL"], []], "img/ToolbarImages/TimeWellSpentIcon.png\" class=\"icon-image\">\t\t\n\t\t\t\t\tof <i>TimeWellSpent</i>\n\t\t\t\t</td></tr>\n\t\t\t<tr>\n\t\t\t\t<td><input class='press_enter_for_next form-right form-value' id='tws_hr_per_week_max' type='text' size='4' name='tws_hr_per_week_max' value='", ["var", ["tws_hr_per_week_max"], []], "'></td>\n\t\t\t\t<td><div class='help form-left form-label'>hours per week</div></td>\n\t\t\t</tr>\n\t\t</tbody>\n\t</table>\n</form>\n"], "donation_amounts_middle");
    
    Template.compile(["<h2>My Impact</h2>\n\n<h3>Donations and Pledges</h3>\n\n<ul id=\"impact_submenu\">\n\t", ["for", ["item"], ["var", ["substate_menu_items", "menu_items"], []], false, ["\n\t\t<li id=\"", ["var", ["item", "id"], []], "\"\n\t\t\tclass=\"", ["for", ["klass"], ["var", ["item", "klasses"], []], false, [["var", ["klass"], []], " "]], "\">\n\t\t\t", ["var", ["item", "value"], []], "</li>\n\t"]], "\n</ul>\n\n<table id=\"impact_table\" cellspacing=\"0\">\n<thead>\n\t<tr>\n\t\t", ["for", ["header"], ["var", ["table_headers"], []], false, ["\n\t\t\t<th>", ["var", ["header"], []], "</th>\n\t\t"]], "\n\t</tr>\n</thead>\n<tbody>\n\t", ["for", ["row"], ["var", ["table_rows"], []], false, ["\n\t<tr class=\"", ["if", [[false, ["var", ["forloop", "is_odd"], []]]], 1, ["odd"], ["even"]], "\">\n\t\t", ["for", ["cell"], ["var", ["row"], []], false, ["\n\t\t\t<td>", ["var", ["cell"], []], "</td>\n\t\t"]], "\n\t</tr>\n\t"]], "\n</tbody>\n</table>\n"], "impact_middle");
    
    Template.compile(["<div class=\"site\">\n\t", ["var", ["inner"], []], "\n</div>\n\n"], "make_site_box");
    
    Template.compile(["<div id=\"manual_test_suite\">\n\t", ["for", ["action"], ["var", ["actions"], []], false, ["\n\t\t<p class=\"link\" id=\"", ["var", ["action"], []], "\">", ["var", ["action"], []], "</p>\n\t"]], "\n</div>\n"], "manual_test_suite");
    
    Template.compile(["<h2>My Messages</h2>\n\n<ul id=\"report_list\">\n\t", ["for", ["report"], ["var", ["reports"], []], false, ["\n\t\t<li id=\"report_", ["var", ["report", "id"], []], "\" class=\"report ", ["var", ["report", "type"], []], "\">\n\t\t\t<div class=\"is_read_holder ", ["if", [[false, ["var", ["report", "is_read"], []]]], 1, ["is_read"], []], "\">\n\t\t\t\t", ["if", [[true, ["var", ["report", "is_read"], []]]], 1, ["\n\t\t\t\t\t<img src=\"", ["var", ["constants", "MEDIA_URL"], []], "img/UnreadMessageIcon.png\" />\n\t\t\t\t"], []], "\n\t\t\t</div>\n\t\t\t<div class=\"open_close_arrow is_closed\">\n\t\t\t\t<img src=\"", ["var", ["constants", "MEDIA_URL"], []], "img/ClosedMessageIcon.png\" />\n\t\t\t</div>\n\t\t\t<div class=\"report_meta\">", ["var", ["report", "friendly_datetime"], []], "</div>\n\t\t\t<div class=\"subject\">", ["var", ["report", "subject"], []], "</div>\n\t\t\t<div class=\"report_message\">", ["var", ["report", "message"], []], "</div> \n\t\t</li>\n\t"]], "\n</ul>\n"], "messages_all_middle");
    
    Template.compile(["\n<div id=\"multi_auth_status_updated\">\n\t", ["if", [[false, ["var", ["multi_auth", "good_to_go"], []]]], 1, ["\n\t\t<p>Payments approved! Click \"done\" to complete registration.\n\t\t\tYou can update these settings later at any time.</p>\n\t"], []], ["if", [[false, ["var", ["multi_auth", "error"], []]]], 1, ["\n\t\t<p>A problem occurred. Please copy/paste the error message below\n\t\t\tinto an email to <a href=\"", ["var", ["constants", "EMAIL_ADDRESS"], []], "\">\n\t\t\t", ["var", ["constants", "EMAIL_ADDRESS"], []], "</a>\n\t\t\t<blockquote>error message: ", ["var", ["multi_auth", "caller_reference"], []], " -  \n\t\t\t\t", ["var", ["multi_auth", "status"], []], " ", ["var", ["multi_auth", "error_message"], []], "</blockquote>\n\t\t</p>\n\t"], []], ["if", [[false, ["var", ["multi_auth", "expired"], []]]], 1, ["\n\t\t<p>Authorization expired</p>\n\t"], []], ["if", [[false, ["var", ["multi_auth", "cancelled"], []]]], 1, ["\n\t\t<p>Authorization canceled</p>\n\t"], []], ["if", [[false, ["var", ["multi_auth", "aborted"], []]]], 1, ["\n\t\t<p>Did you mean to cancel authorization? Please try again or email\n\t\t<a href=\"", ["var", ["constants", "EMAIL_ADDRESS"], []], "\">", ["var", ["constants", "EMAIL_ADDRESS"], []], "</a> \n\t\tfor help.\n\t\t</p>\n\t"], []], ["if", [[false, ["var", ["multi_auth", "response_not_received"], []]]], 1, ["\n\t\t", ["if", [[false, ["var", ["server_dont_know"], []]]], 1, ["\n\t\t\t<p>Hmmm...incomplete authorization. Please try again or email\n\t\t\t<a href=\"", ["var", ["constants", "EMAIL_ADDRESS"], []], "\">", ["var", ["constants", "EMAIL_ADDRESS"], []], "</a> \n\t\t\tfor help.</p>\n\t\t"], ["\n\t\t\t<p>Retrieving information from server...</p>\n\t\t"]], "\n\t"], []], "\n</div>\n"], "multi_auth_status");
    
    Template.compile(["<table id=\"register_next_prev\">\n<tbody>\n\t<tr>\n\t\t<td>\n\t\t\t<img\n\t\t\t\tsrc=\"", ["var", ["constants", "MEDIA_URL"], []], "img/BackArrow.png\"\n\t\t\t\tid=\"prev_register_track\"\n\t\t\t\tclass=\"register_button img_link\"\n\t\t\t\t/>\n\t\t</td>\n\t\t<td>\n\t\t\t<span class=\"NextPrevSpacer\"></span>\n\t\t</td>\n\t\t<td>\n\t\t\t<img\n\t\t\t\t", ["if", [[false, ["var", ["is_done"], []]]], 1, ["\n\t\t\t\tsrc=\"", ["var", ["constants", "MEDIA_URL"], []], "img/DoneButton.png\"\n\t\t\t\t"], ["\n\t\t\t\tsrc=\"", ["var", ["constants", "MEDIA_URL"], []], "img/NextArrow.png\"\n\t\t\t\t"]], "\n\t\t\t\tid=\"next_register_track\"\n\t\t\t\tclass=\"register_button img_link\"\n\t\t\t\t/>\n\t\t\t</td>\n\t\t</tr>\n\t</tbody>\n</table>\t\t\t\t"], "next_prev_buttons");
    
    Template.compile([["var", ["inner"], []], "\n<span class='img_link move_to_unsorted'>\n\t<img class='Move_Site_Arrow' src='", ["var", ["constants", "MEDIA_URL"], []], "img/RightArrow.png'>\n</span>\n"], "procrasdonate_wrap");
    
    Template.compile(["<h2>My Progress</h2>\n\n", ["var", ["substate_menu"], []], "\n\n<h3>Weekly Averages</h3>\n\n<div id=\"chart\" style=\"text-align: left;\"></div>\n"], "progress_averages_middle");
    
    Template.compile(["<h2>My Progress</h2>\n\n", ["var", ["substate_menu"], []], "\n\n\t<div class=\"side_note\">\n\t\t<img\n\t\t\tclass=\"screenshot-long\"\n\t\t\tsrc=\"", ["var", ["constants", "MEDIA_URL"], []], "img/ScreenshotUnsorted.png\"\n\t\t\tstyle=\"float:right;\" />  \n\t\t<p>Remember: you can casually sort your websites by clicking the sorting button in your Firefox toolbar at any time.</p>\n\t</div>\n\t\n\t<h3>Website Sorting</h3>\n\t<p>Classify your websites by clicking on the green arrows below.</p>\n\t\n\n\t\n<img class=\"Spacer\" src=\"", ["var", ["constants", "MEDIA_URL"], []], "img/ClearBox.png\"/>\n\n<div id='site_classifications'>\n\t<div id='procrasdonate_col' class='column'>\n\t\t<div class='title'>\n\t\t\t<img src=\"", ["var", ["constants", "MEDIA_URL"], []], "img/ToolbarImages/ProcrasDonateIcon.png\" class=\"icon-image\">\t\t\n\t\t\tProcrasDonate\n\t\t</div>\n\t\t<div class='add_website'>\n\t\t\t<input type=\"text\" name=\"procrasdonate\" value=\"add website here\" />\n\t\t\t<input type=\"button\" class=\"add\" value=\"add\" />\n\t\t</div>\n\t\t", ["var", ["procrasdonate_text"], []], "\n\t</div>\n\t<div id='unsorted_col' class='column'>\n\t\t<div class='title'>\n\t\t\t<img src=\"", ["var", ["constants", "MEDIA_URL"], []], "img/ToolbarImages/UnsortedIcon.png\" class=\"icon-image\">\t\t\n\t\t\tUnsorted\n\t\t</div>\n\t\t<div class='add_website'>\n\t\t\t<input type=\"text\" name=\"unsorted\" value=\"add website here\" />\n\t\t\t<input type=\"button\" class=\"add\" value=\"add\" />\n\t\t</div>\n\t\t", ["var", ["unsorted_text"], []], "\n\t</div>\n\t<div id='timewellspent_col' class='column'>\n\t\t<div class='title'>\n\t\t\t<img src=\"", ["var", ["constants", "MEDIA_URL"], []], "img/ToolbarImages/TimeWellSpentIcon.png\" class=\"icon-image\">\t\t\n\t\t\tTime Well Spent\n\t\t</div>\n\t\t<div class='add_website'>\n\t\t\t<input type=\"text\" name=\"timewellspent\" value=\"add website here\" />\n\t\t\t<input type=\"button\" class=\"add\" value=\"add\" />\n\t\t</div>\n\t\t", ["var", ["timewellspent_text"], []], "\n\t</div>\n</div>\n"], "progress_classifications_middle");
    
    Template.compile(["<table id=\"progress_explanation\" style=\"width: ", ["var", ["width"], []], "px; margin: auto;\">\n<tbody>\n\t<tr>\n\t\t<td>This week so far:<br />", ["var", ["pd_this_week_hrs_unlimited"], []], " hours\n\t\t\t", ["ifequal", ["var", ["pd_this_week_hrs_unlimited"], []], ["var", ["pd_this_week_hrs"], []], ["\n\t\t\t\t", "\n\t\t\t"], ["\n\t\t\t\t", "\n\t\t\t"]], "\n\t\t</td>\n\t\t<td>Last week:<br />", ["var", ["pd_last_week_hrs_unlimited"], []], " hours\n\t\t\t", ["ifequal", ["var", ["pd_last_week_hrs_unlimited"], []], ["var", ["pd_last_week_hrs"], []], ["\n\t\t\t"], ["\n\t\t\t\t", "\n\t\t\t"]], "\n\t\t</td>\n\t\t<td>All time average:<br />", ["var", ["pd_total_hrs_unlimited"], []], " hours\n\t\t\t", ["ifequal", ["var", ["pd_total_hrs_unlimited"], []], ["var", ["pd_total_hrs"], []], ["\n\t\t\t"], ["\n\t\t\t\t", "\n\t\t\t"]], "\n\t\t</td>\n\t</tr>\n\t<tr>\n\t\t<td><img class=\"laptop\" src=\"", ["var", ["this_week_laptop"], []], "\" /></td>\n\t\t<td><img class=\"laptop\" src=\"", ["var", ["last_week_laptop"], []], "\" /></td>\n\t\t<td><img class=\"laptop\" src=\"", ["var", ["total_laptop"], []], "\" /></td>\n\t</tr>\n</tbody>\n</table>\n"], "progress_explanation_snippet");
    
    Template.compile(["<h2>My Progress</h2>\n\n", ["var", ["substate_menu"], []], "\n\n<h3>ProcrasDonation Comparison</h3>\n\n<p>Hours that I ProcrasDonated:</p>\n\n", "\n<div id=\"gauges\"></div>\n\n", "\n\n<div class=\"progress_notes\">\n\t", ["if", [[false, ["var", ["includes_first_and_last_weeks"], []]]], 1, ["\n\t\t<p>Average includes first and last week until at \n\t\t\tleast 3 weeks worth of data is available.</td>\n\t\t</p>\n\t"], []], "\n</div>"], "progress_gauges_middle");
    
    Template.compile(["<h2>My Progress</h2>\n\n", ["var", ["substate_menu"], []], "\n\n<h3>Stacked Trends</h3>\n\n<p>Stacked bar chart of daily totals in hours over time</p>\n\n<div class=\"trend_title\"><span id=\"trend_title_A\">", ["var", ["A_label"], []], "</span> \n\t<span id=\"trend_title_and\">", ["if", [[false, ["var", ["B_label"], []]]], 1, ["and"], []], "</span>\n\t<span id=\"trend_title_B\">", ["if", [[false, ["var", ["B_label"], []]]], 1, [["var", ["B_label"], []]], []], "</span>\n\ttrend</div>\n<div id=\"legend\"></div>\n<div class=\"trend_yaxis\">Hours</div>\n<div id=\"trend_chart\"></div>\n<div class=\"trend_xaxis\">Days</div>\n\n<h3>Select data to view</h3>\n<p>At most 2 trends can be graphed simultaneously.</p>\n\n<div class=\"trend_list tag_list\" alt=\"", ["var", ["tagtype", "id"], []], "\" >\n<h4>Classification totals</h4>\n<ul>\n\t<li><input type=\"checkbox\" class=\"", ["var", ["ProcrasDonate", "id"], []], "\" checked value=\"ProcrasDonate\" />\n\t\t<img src=\"", ["var", ["constants", "MEDIA_URL"], []], "img/ToolbarImages/ProcrasDonateIcon.png\" />\n\t\tProcrasDonate\n\t</li>\n\t<li>\n\t\t<input type=\"checkbox\" class=\"", ["var", ["TimeWellSpent", "id"], []], "\" checked value=\"TimeWellSpent\" />\n\t\t<img src=\"", ["var", ["constants", "MEDIA_URL"], []], "img/ToolbarImages/TimeWellSpentIcon.png\" />\n\t\tTimeWellSpent\n\t</li>\n\t<li>\n\t\t<input type=\"checkbox\" class=\"", ["var", ["Unsorted", "id"], []], "\" value=\"Unsorted\" />\n\t\t<img src=\"", ["var", ["constants", "MEDIA_URL"], []], "img/ToolbarImages/UnsortedIcon.png\" />\n\t\tUnsorted\n\t</li>\n</ul>\n</div>\n\n<div class=\"trend_list sitegroup_list\" alt=\"", ["var", ["sitegrouptype", "id"], []], "\">\n<h4>Most visited websites</h4>\n<ul>\n\t", ["for", ["t"], ["var", ["sitegroup_totals"], []], false, [" \n\t\t<li title=\"", ["var", ["t", "sitegroup", "host"], []], "\">\n\t\t\t<input type=\"checkbox\" class=\"", ["var", ["t", "sitegroup", "id"], []], "\" value=\"", ["var", ["t", "sitegroup", "host"], []], "\" />\n\t\t\t<img src=\"", ["var", ["t", "sitegroup", "tag", "icon"], []], "\" />\n\t\t\t", ["var", ["t", "hours_int"], []], " hours: ", ["var", ["t", "sitegroup", "host"], []], "\n\t\t</li>\n\t"]], " \n</ul>\n</div>\n"], "progress_stacks_middle");
    
    Template.compile(["\n<div id=\"progress_submenu\" class=\"extn_submenu\">\n", "\n\t<ul>\n\t", ["for", ["item"], ["var", ["substate_menu_items", "menu_items"], []], false, ["\n\t\t<li class=\"", ["var", ["item", "id"], []], " link ", ["for", ["klass"], ["var", ["item", "klasses"], []], false, [["var", ["klass"], []], " "]], "\">\n\t\t\t<img src=\"", ["var", ["item", "img"], []], "\" />\n\t\t</li>\n\t"]], "\n\t</ul>\n\t\n", "\n\t<ul class=\"menu_text\">\n\t", ["for", ["item"], ["var", ["substate_menu_items", "menu_items"], []], false, ["\n\t\t<li class=\"", ["var", ["item", "id"], []], " link ", ["for", ["klass"], ["var", ["item", "klasses"], []], false, [["var", ["klass"], []], " "]], "\">\n\t\t\t", ["if", [[false, ["var", ["item", "url"], []]]], 1, ["<a href=\"", ["var", ["item", "url"], []], "\">"], []], "\n\t\t\t\t", ["var", ["item", "value"], []], "\n\t\t\t", ["if", [[false, ["var", ["item", "url"], []]]], 1, ["</a>"], []], "\n\t\t</li>\n\t"]], "\n\t</ul>\n</div>\n"], "progress_submenu");
    
    Template.compile(["<h2>My Progress</h2>\n\n", ["var", ["substate_menu"], []], "\n\n<h3>Trends</h3>\n\n<p>Plot of daily totals in hours over time</p>\n\n<div class=\"trend_title\"><span id=\"trend_title_A\">", ["var", ["A_label"], []], "</span> \n\t<span id=\"trend_title_and\">", ["if", [[false, ["var", ["B_label"], []]]], 1, ["and"], []], "</span>\n\t<span id=\"trend_title_B\">", ["if", [[false, ["var", ["B_label"], []]]], 1, [["var", ["B_label"], []]], []], "</span>\n\ttrend</div>\n<div id=\"legend\"></div>\n<div class=\"trend_yaxis\">Hours</div>\n<div id=\"trend_chart\"></div>\n<div class=\"trend_xaxis\">Days</div>\n\n<h3>Select data to view</h3>\n<p>At most 2 trends can be graphed simultaneously.</p>\n\n<div class=\"trend_list tag_list\" alt=\"", ["var", ["tagtype", "id"], []], "\" >\n<h4>Classification totals</h4>\n<ul>\n\t<li><input type=\"checkbox\" class=\"", ["var", ["ProcrasDonate", "id"], []], "\" checked value=\"ProcrasDonate\" />\n\t\t<img src=\"", ["var", ["constants", "MEDIA_URL"], []], "img/ToolbarImages/ProcrasDonateIcon.png\" />\n\t\tProcrasDonate\n\t</li>\n\t<li>\n\t\t<input type=\"checkbox\" class=\"", ["var", ["TimeWellSpent", "id"], []], "\" checked value=\"TimeWellSpent\" />\n\t\t<img src=\"", ["var", ["constants", "MEDIA_URL"], []], "img/ToolbarImages/TimeWellSpentIcon.png\" />\n\t\tTimeWellSpent\n\t</li>\n\t<li>\n\t\t<input type=\"checkbox\" class=\"", ["var", ["Unsorted", "id"], []], "\" value=\"Unsorted\" />\n\t\t<img src=\"", ["var", ["constants", "MEDIA_URL"], []], "img/ToolbarImages/UnsortedIcon.png\" />\n\t\tUnsorted\n\t</li>\n</ul>\n</div>\n\n<div class=\"trend_list sitegroup_list\" alt=\"", ["var", ["sitegrouptype", "id"], []], "\">\n<h4>Most visited websites</h4>\n<ul>\n\t", ["for", ["t"], ["var", ["sitegroup_totals"], []], false, [" \n\t\t<li title=\"", ["var", ["t", "sitegroup", "host"], []], "\">\n\t\t\t<input type=\"checkbox\" class=\"", ["var", ["t", "sitegroup", "id"], []], "\" value=\"", ["var", ["t", "sitegroup", "host"], []], "\" />\n\t\t\t<img src=\"", ["var", ["t", "sitegroup", "tag", "icon"], []], "\" />\n\t\t\t", ["var", ["t", "hours_int"], []], " hours: ", ["var", ["t", "sitegroup", "host"], []], "\n\t\t</li>\n\t"]], " \n</ul>\n</div>\n"], "progress_trends_middle");
    
    Template.compile(["<h2>My Progress</h2>\n\n", ["var", ["substate_menu"], []], "\n\n<h3>Website Visits</h3>\n\n<ol>\n\t", ["for", ["visit"], ["var", ["visits"], []], false, ["\n\t<li>\n\t\t", ["var", ["visit", "enter_type_display"], []], " -> ", ["var", ["visit", "leave_type_display"], []], "\n\t\t<strong>", ["var", ["visit", "duration_display"], []], "</strong>\n\t\t<blockquote>\n\t\t<a href=\"", ["var", ["visit", "site", "url"], []], "\">", ["var", ["visit", "site", "url"], []], "</a>\n\t\t", ["var", ["visit", "enter_at_display"], []], "\n\t\t</blockquote> \n\t</li>\n\t"]], "\n</ol>"], "progress_visits_middle");
    
    Template.compile(["<div class='recipient recipient_to_add'>\n\t<!-- id class needed for js -->\n\t<div class=\"recipient_id hidden\">", ["var", ["recipient", "id"], []], "</div>\n\t<div class='add_recipient' title=\"Add recipient to list\"> \n\t\t<img src=\"", ["var", ["constants", "MEDIA_URL"], []], "img/AddRecipient.png\" class=\"recipient-image add_img img_link\">\t\t\n\t </div>\n\t <div class='name'>\n\t\t", ["if", [[false, ["var", ["deep_recip_pct", "recipient", "is_pd_registered"], []]]], 1, ["\n\t\t\t<a href='", ["var", ["constants", "RECIPIENTS_URL"], []], ["var", ["deep_recip_pct", "recipient", "slug"], []], "'>\n\t\t"], []], "\n\t\t\t<img src=\"", ["var", ["recipient", "logo_thumbnail"], []], "\" />\n\t\t\t", ["var", ["recipient", "name"], []], "\n\t\t", ["if", [[false, ["var", ["deep_recip_pct", "recipient", "is_pd_registered"], []]]], 1, ["\n\t\t\t</a>\n\t\t"], []], "\n\t  </div>\n\n\t<div class='left_recipient_float'>\n\n\t\t<div class=\"category\">", ["var", ["recipient", "category", "category"], []], "</div>\n\t</div>\t\n\t<div class='mission'>", ["var", ["recipient", "mission"], []], "\n\t\t<span class='link description_toggle'>(less)</span>\n\t</div>\n\t<div class='description'><p>", ["var", ["recipient", "description"], []], "</p></div>\n\n\n</div>\n"], "recipient_snippet");
    
    Template.compile(["<div class=\"recipient\" alt=\"", ["var", ["deep_recip_pct", "recipient", "id"], []], "\">\n\t\n\t<!-- id class needed for js -->\n\t<div class=\"recipient_id hidden\">", ["var", ["deep_recip_pct", "recipient", "id"], []], "</div>\t\n\n\t<div class=\"recipient_percent form-input\">\n\t\t<span class=\"pie_sector_color\" style=\"background: ", ["var", ["percent_color"], []], ";\"> </span>\n\t\t<span class=\"percent\">", ["var", ["deep_recip_pct", "display_percent"], []], "</span>\n\t\t<span class=\"percent_symbol\">%</span>\n\t\t<img\n\t\t\tclass=\"up_arrow\"\n\t\t\ttitle=\"Increment percent\"\n\t\t\tsrc=\"", ["var", ["constants", "MEDIA_URL"], []], "img/UpArrow.png\" />\n\t\t<img\n\t\t\tclass=\"down_arrow\"\n\t\t\ttitle=\"Decrement percent\"\n\t\t\tsrc=\"", ["var", ["constants", "MEDIA_URL"], []], "img/DownArrow.png\" />\n\t</div>\n\n\t<div class='name'>\n\t\t", ["if", [[false, ["var", ["deep_recip_pct", "recipient", "is_pd_registered"], []]]], 1, ["\n\t\t\t<a href='", ["var", ["constants", "RECIPIENTS_URL"], []], ["var", ["deep_recip_pct", "recipient", "slug"], []], "'>\n\t\t"], []], "\n\t\t\t<img src=\"", ["var", ["deep_recip_pct", "recipient", "logo_thumbnail"], []], "\" />\n\t\t\t", ["var", ["deep_recip_pct", "recipient", "name"], []], "\n\t\t", ["if", [[false, ["var", ["deep_recip_pct", "recipient", "is_pd_registered"], []]]], 1, ["\n\t\t\t</a>\n\t\t"], []], "\n\t</div>\n\t<div class='left_recipient_float'>\n\t\t<table>\n\t\t<tbody>\n\t\t\t<tr><td>\n\t\t\t\t<div class=\"category\">", ["var", ["deep_recip_pct", "recipient", "category", "category"], []], "</div>\n\t\t\t</td></tr><tr><td>\n\t\t\t\t<div class='remove_recipient' title=\"Remove recipient from list\">\n\t\t\t\t\t<img src=\"", ["var", ["constants", "MEDIA_URL"], []], "img/Remove.png\" class=\"recipient-image remove_img img_link\">\t\t\n\t\t\t\t</div>\n\t\t\t</td></tr>\n\t\t</tbody>\n\t\t</table>\n\t</div>\t\n\t<div class='mission'>\n\t\t", ["var", ["deep_recip_pct", "recipient", "mission"], []], "\n\t\t", ["if", [[false, ["var", ["deep_recip_pct", "recipient", "html_description"], []]]], 1, ["\n\t\t\t<span class='link description_toggle'>(less)</span>\n\t\t"], []], "\n\t</div>\n\t<div class='description'>\n\t\t", ["var", ["deep_recip_pct", "recipient", "html_description"], []], "\n\t</div>\n\t<div class=\"float_prop\" />\n</div>\n"], "recipient_with_percent_snippet");
    
    Template.compile(["\n", ["if", [[false, ["var", ["substate_menu_items", "prev"], []]]], 1, ["\n\t", ["if", [[false, ["var", ["substate_menu_items", "prev", "url"], []]]], 1, ["<a href=\"", ["var", ["substate_menu_items", "prev", "url"], []], "\">"], []], "\n\t\t<img\n\t\t  class=\"prev ", ["var", ["substate_menu_items", "prev", "id"], []], "\"\n\t\t  src=\"/procrasdonate_media/img/BackArrow.png\" />\n  ", ["if", [[false, ["var", ["substate_menu_items", "prev", "url"], []]]], 1, ["</a>"], []], "\n"], ["\n\t", ["if", [[true, ["var", ["substate_menu_items", "no_spacers"], []]]], 1, ["\n\t<img\n\t  class=\"prev\"\n\t  src=\"/procrasdonate_media/img/Spacer.png\" />\n\t"], []], "\n"]], "\n\n", ["if", [[false, ["var", ["substate_menu_items", "next"], []]]], 1, ["\n\t", ["ifequal", ["var", ["substate_menu_items", "next", "value"], []], ["var", "XXX", []], ["\n\t\t<img\n\t\t  class=\"done ", ["var", ["substate_menu_items", "next", "id"], []], "\"\n\t\t  src=\"/procrasdonate_media/img/DoneButton.png\" />\n\t"], ["\n\t\t", ["ifequal", ["var", ["substate_menu_items", "next", "value"], []], ["var", "XXXX", []], ["\n\t\t\t", "\n\t\t"], ["\n\t\t\t", ["if", [[false, ["var", ["substate_menu_items", "next", "url"], []]]], 1, ["<a href=\"", ["var", ["substate_menu_items", "next", "url"], []], "\">"], []], "\n\t\t\t\t<img\n\t\t\t\t  class=\"next ", ["var", ["substate_menu_items", "next", "id"], []], "\"\n\t\t\t\t  src=\"/procrasdonate_media/img/NextArrow.png\" />\n\t\t\t", ["if", [[false, ["var", ["substate_menu_items", "next", "url"], []]]], 1, ["</a>"], []], "\n\t\t"]], "\n\t"]], "\n"], ["\n\t", ["if", [[true, ["var", ["substate_menu_items", "no_spacers"], []]]], 1, ["\n\t<img\n\t  class=\"next\"\n\t  src=\"/procrasdonate_media/img/Spacer.png\" />\n\t"], []], "\n"]], "\n\n"], "register_arrows");
    
    Template.compile([["var", ["substate_menu"], []], "\n", ["var", ["arrows"], []], "\n\n<h5>Who should benefit from your charitable incentive?</h5>\n<p>Find and select organizations below.  \nModify each's percentage (%) until you like how your pledges will be divided.  \n</p>\n\n<div id=\"errors\"></div>\n\n<h2>My Selected Charities</h2>\n\n<div id=\"pie_chart\"></div>\n\n<div id=\"chosen_charities\">\n\t", ["if", [[false, ["var", ["chosen_charities"], []]]], 1, ["\n\t\t", ["for", ["deep_recip_pct_html"], ["var", ["chosen_charities"], []], false, ["\n\t\t\t", ["var", ["deep_recip_pct_html"], []], "\n\t\t"]], "\n\t"], ["\n\t\t<p>Please add at least one charity.</p>\n\t"]], "\n</div>\n\n", ["nop"], "\n\n<h2>Invite New Charities</h2>\n<p>You can pledge to an unlisted charity by entering their name below.\n\tWe will contact them and when they make a free account then your pledges will become donations.\n</p>\n\t\t\n<p>\n\t<label>Name of unlisted charity to invite:</label>\n\t<input id=\"new_recipient_name\" type=\"text\" size=\"30\" />\n\n\t<input\n\t\tid=\"new_recipient_submit\"\n\t\ttype=\"image\"\n\t\tsrc=\"", ["var", ["constants", "MEDIA_URL"], []], "img/AddRecipient.png\"\n\t\tvalue=\"add new recipient\"/>\n</p>\n\n", ["if", [[false, ["var", ["staff_picks"], []]]], 1, ["\n<h2>Staff Picks</h2>\n\t", ["for", ["recipient_html"], ["var", ["staff_picks"], []], false, ["\n\t\t", ["var", ["recipient_html"], []], "\n\t"]], "\n"], []], "\n\n", ["if", [[false, ["var", ["recently_added"], []]]], 1, ["\n<h2>Recently Added</h2>\n\t", ["for", ["recipient_html"], ["var", ["recently_added"], []], false, ["\n\t\t", ["var", ["recipient_html"], []], "\n\t"]], "\n"], []], "\n\n<div id=\"removed_charities_temporary\"></div>\n\t\n", ["nop"], "\n\n", ["var", ["arrows"], []], "\n"], "register_charities_middle");
    
    Template.compile([["var", ["substate_menu"], []], "\n", ["var", ["arrows"], []], "\n\n<h1>Voluntarily pay for online content</h1>\n\n<p>You can also use hourly time tracking to pledge directly to websites you \n\tconsider worthwhile. \n\t<br>Together we can keep quality content available for everyone.  \n</p>\n\n<h2>TimeWellSpent payments</h2>\n<p>How much would you like to pay for every hour you spend using websites\n\tyou mark as TimeWellSpent? \n\t(This will not change your ProcrasDonation incentive.)</p>\n<p><input\n\ttype=\"text\"\n\tid=\"tws_dollars_per_hr\"\n\tname=\"tws_dollars_per_hr\" \n\tvalue=\"", ["var", ["tws_dollars_per_hr"], []], "\" />\n   <span class=\"units\">dollars per hour</span></p>\n\n<h2>TimeWellSpent Limit</h2>\n<p>What is your weekly limit, beyond which no TimeWellSpent pledges will be \n\tmade?  (This will not change your ProcrasDonation limit.)</p>\n<p><input\n\ttype=\"text\"\n\tid=\"tws_hr_per_week_max\"\n\tname=\"tws_hr_per_week_max\" \n\tvalue=\"", ["var", ["tws_hr_per_week_max"], []], "\" />\n   <span class=\"units\">hours per week</span></p>\n\n", ["var", ["arrows"], []], "\n"], "register_content_middle");
    
    Template.compile(["<h2>Registration Success!</h2>\n\n<p>Use <a href=\"", ["var", ["constants", "SETTINGS_URL"], []], "\">My Settings</a> from the menu to the left to modify your settings.</p>\n"], "register_done_middle");
    
    Template.compile([["var", ["substate_menu"], []], "\n", ["var", ["arrows"], []], "\n\n<h5>What is your incentive to waste less time online? \n\t<span class=\"subheader\"></span></h5>\n<p id=\"rate_error\" class=\"error\"></p>\n\n<p> ''I will donate\n\t<input\n\t\ttype=\"text\"\n\t\tid=\"pd_dollars_per_hr\"\n\t\tname=\"pd_dollars_per_hr\" \n\t\tvalue=\"", ["var", ["pd_dollars_per_hr"], []], "\"\n\t\tsize=\"4\" />\n\t   <span class=\"units\"></span>\n  \tdollars for every hour I spend on websites I mark as ProcrasDonate.''</p>\n   \n\n<h5>How many hours do you <i>want</i> to spend ProcrasDonating every week?\n\t<span class=\"subheader\"> </span></h5>\n<p id=\"goal_error\" class=\"error\"></p>\n\n<div class=\"example_gauge\">\n\t<div id=\"happy_example_gauge\"></div>\n</div>\n\n<p>''I would like to set a goal of\n\t<input\n\t\ttype=\"text\"\n\t\tid=\"pd_hr_per_week_goal\"\n\t\tname=\"pd_hr_per_week_goal\" \n\t\tvalue=\"", ["var", ["pd_hr_per_week_goal"], []], "\" \n\t\tsize=\"4\"/>\n\t   <span class=\"units\"></span>\n\thours of ProcrasDonating per week. My goal is for feedback only and will not change my donations.''</p>\n\n\n<h5>What is your weekly limit?\n\t<span class=\"subheader\"></span></h5>\n<p id=\"max_error\" class=\"error\"></p>\n<p>''I would like to keep track of at most\n\t<input\n\t\ttype=\"text\"\n\t\tid=\"pd_hr_per_week_max\"\n\t\tname=\"pd_hr_per_week_max\" \n\t\tvalue=\"", ["var", ["pd_hr_per_week_max"], []], "\"\n\t\tsize=\"4\" />\n\t   <span class=\"units\"></span>\n   hours per week.  No donations will be made beyond this point.''</p>\n\n", ["var", ["arrows"], []], "\n"], "register_incentive_middle");
    
    Template.compile([["var", ["substate_menu"], []], "\n", ["var", ["arrows"], []], "\n\n<form method=\"post\" action=\"", ["var", ["action"], []], "\">\n\t", ["for", ["param"], ["var", ["form_params"], []], false, ["\n\t\t<input\n\t\t\ttype=\"hidden\"\n\t\t\tname=\"", ["var", ["param", "name"], []], "\"\n\t\t\tvalue=\"", ["var", ["param", "value"], []], "\"\n\t\t\tclass=\"", ["var", ["param", "name"], []], "\" />\n\t"]], "\n\t<input\n\t\ttype=\"image\"\n\t\tclass=\"go_to_amazon_button\"\n\t\tsrc=\"", ["var", ["constants", "MEDIA_URL"], []], "img/GoAmazonButton.png\"\n\t\tid=\"top_go_to_amazon_button\" />\n</form>\n\n<div id=\"multi_auth_status\">\n\t", ["var", ["multi_auth_status"], []], "\n</div>\n\n<h5>How would you like to pay for using ProcrasDonate?</h5>\n\n<p>We're making improvements all the time and your support keeps us rolling!</p>\n\n<div class=\"split_arrow_div\" class=\"left\">\n\t<img class=\"split_arrow\" src=\"", ["var", ["constants", "MEDIA_URL"], []], "img/SplitArrows.png\" />\n</div>\n\n<div id=\"support_middle\">\n</div>\n\n<h5>Your final step is to automate payments through Amazon.com.</h5>\n<ul>\n\t<li>Payments to registered 501c3 non-profits will be fully <b>tax deductible</b>.</li>\n\t<li>For added security, your potential donations are <b>capped</b> so that you cannot be charged more than one year's worth of maximal giving at your current settings.</li>\n\t<li>You will have to <b>reauthorize</b> once your pledges have exceeded this cap.</li>\n</ul>\n\n", ["if", [[true, ["var", ["multi_auth"], []]], [true, ["var", ["multiuse", "good_to_go"], []]]], 1, ["\n\t<p>Click on <span id=\"go_to_amazon\" class=\"link\">Go to Amazon to approve payments!</span>\n\t\twhen you're ready.</p>\n\t\n\t\t<form method=\"post\" action=\"", ["var", ["action"], []], "\">\n\t\t\t", ["for", ["param"], ["var", ["form_params"], []], false, ["\n\t\t\t\t<input\n\t\t\t\t\ttype=\"hidden\"\n\t\t\t\t\tname=\"", ["var", ["param", "name"], []], "\"\n\t\t\t\t\tvalue=\"", ["var", ["param", "value"], []], "\"\n\t\t\t\t\tclass=\"", ["var", ["param", "name"], []], "\" />\n\t\t\t"]], "\n\t\t\t<input\n\t\t\t\ttype=\"image\"\n\t\t\t\tclass=\"go_to_amazon_button\"\n\t\t\t\tsrc=\"", ["var", ["constants", "MEDIA_URL"], []], "img/GoAmazonButton.png\" />\n\t\t</form>\n"], []], "\n\n", ["var", ["arrows"], []], "\n"], "register_payments_middle");
    
    Template.compile(["<div id=\"", ["var", ["submenu_id"], []], "\" class=\"extn_submenu\">\n", "\n\t<ul>\n\t", ["for", ["item"], ["var", ["substate_menu_items", "menu_items"], []], false, ["\n\t\t<li class=\"", ["for", ["klass"], ["var", ["item", "klasses"], []], false, [["var", ["klass"], []], " "]], "\">\n\t\t\t", ["if", [[false, ["var", ["item", "url"], []]]], 1, ["<a href=\"", ["var", ["item", "url"], []], "\">"], []], "\n\t\t\t\t<img src=\"", ["var", ["item", "img"], []], "\" />\n\t\t\t", ["if", [[false, ["var", ["item", "url"], []]]], 1, ["</a>"], []], "\n\t\t</li>\n\t\t<li class=\"bar\">\n\t\t\t", ["if", [[true, ["var", ["forloop", "last"], []]]], 1, ["\n\t\t\t\t<img src=\"", ["var", ["item", "bar"], []], "\" />\n\t\t\t"], []], "\n\t\t</li>\n\t"]], "\n\t</ul>\n\t\n", "\n\t<ul class=\"menu_text\">\n\t", ["for", ["item"], ["var", ["substate_menu_items", "menu_items"], []], false, ["\n\t\t<li class=\"", ["for", ["klass"], ["var", ["item", "klasses"], []], false, [["var", ["klass"], []], " "]], "\">\n\t\t\t", ["if", [[false, ["var", ["item", "url"], []]]], 1, ["<a href=\"", ["var", ["item", "url"], []], "\">"], []], "\n\t\t\t\t", ["var", ["item", "value"], []], "\n\t\t\t", ["if", [[false, ["var", ["item", "url"], []]]], 1, ["</a>"], []], "\n\t\t</li>\n\t"]], "\n\t</ul>\n</div>\n"], "register_submenu");
    
    Template.compile([], "register_support_middle");
    
    Template.compile(["<p>Use the following link to return a user to the settings page.</p>\n\n<a href=\"", ["var", ["constants", "SETTINGS_URL"], []], "\">Done (or back to settings)</a>\n\n<a href=\"", ["var", ["constants", "SETTINGS_URL"], []], "\">\n\t<img src=\"", ["var", ["constants", "MEDIA_URL"], []], "img/DoneButton.png\" />\n</a>\n\n<br /><br />\n\n<img\n\tclass=\"done ", ["var", ["substate_menu_items", "next", "id"], []], "\"\n\tsrc=\"/procrasdonate_media/img/DoneButton.png\" />\n\t\n<h1>Time Well Spent</h1>\n\n<h2>Incentive: \n\t<span class=\"subheader\">What is your time worth? </span></h2>\n<p id=\"rate_error\" class=\"error\"></p>\n\n<p>Create an incentive for good time management \n\tby making a pledge to your favorite charities.  \n\t<br>This is a pledge to \n\tautomatically donate for every hour you spend TimeWellSpent online.\n</p>\n<p><input\n\ttype=\"text\"\n\tid=\"tws_dollars_per_hr\"\n\tname=\"tws_dollars_per_hr\" \n\tvalue=\"", ["var", ["tws_dollars_per_hr"], []], "\" />\n   <span class=\"units\">dollars per hour</span></p>\n\n<h2>TimeWellSpent Limit: \n\t<span class=\"subheader\">What is your weekly limit? </span></h2>\n<p id=\"max_error\" class=\"error\"></p>\n<p>What is the most number hours in a week that you want to keep track of?  \n\t<br>No further pledges can be made in a week where you have \n\talready reached your limit.</p>\n<p><input\n\ttype=\"text\"\n\tid=\"tws_hr_per_week_max\"\n\tname=\"tws_hr_per_week_max\" \n\tvalue=\"", ["var", ["tws_hr_per_week_max"], []], "\" />\n   <span class=\"units\">hours per week</span></p>\n\n<img\n\tclass=\"done ", ["var", ["substate_menu_items", "next", "id"], []], "\"\n\tsrc=\"/procrasdonate_media/img/DoneButton.png\" />\n"], "register_time_well_spent_middle");
    
    Template.compile([["var", ["substate_menu"], []], "\n", ["var", ["arrows"], []], "\n\n<p id=\"error\"></p>\n\n<h5>Where would you like to receive weekly feedback and alerts?</h5>\n\n<ul><li>We do not share your email; not even with organizations that you donate to.</li\t\n</ul>   \n\n<p><label>Email </label><input\n\ttype=\"text\"\n\tid=\"email\"\n\tname=\"email\" \n\tvalue=\"", ["var", ["email"], []], "\" />\n</p>\n\n<h5>Do you deduct charitable donations from your taxes?</h5>\n<p></p>\n<div class=\"split_arrow_div\" class=\"left\">\n\t<img class=\"split_arrow\" src=\"", ["var", ["constants", "MEDIA_URL"], []], "img/SplitArrows.png\" />\n</div>\n\n\n<div id=\"tax_deductions_middle\">\n</div>\n\n<h2>Terms of service</h2>\n<p><input\n\ttype=\"checkbox\"\n\tid=\"tos\"\n\tname=\"tos\"\n\t", ["if", [[false, ["var", ["tos"], []]]], 1, ["checked"], []], " />\n   <span>I have read and agree to the following Terms of Service.</span>\n   </p>\n\nBy using our service you agree to the following:\n\n<p>- You agree to these terms and any updates that ProcrasDonate may make \n\twithout warning or notification.\n</p>\n<p>- You understand how our service works and are willingly participating.\n</p>\n<p>- You agree to pay all pledges made on your behalf in full.\n</p>\n<p>- Voluntary monthly fees and a percentage that you determine of each transaction will be\n\tpaid to ProcrasDonate.\n</p>\n<p>- You are solely responsible for any content that you add to this site. \n</p>\n<p>- Illegal, unfriendly, or otherwise problematic content will be removed.\n</p>\n<p>- Your individual records and settings are under your control.  \nAlthough our central server will collect your records to approve payments \nand collect community statistics - a reasonable effort will be made to keep\nyour browsing history and other records anonymous.\n</p>\n<p>- All rights are reserved including ProcrasDonate intellectual property of\n\tour business model and any software beyond the open source software \n\tthat we are using.\n</p>\n<p> Thanks for ProcrasDonating!\n</p>\n\n", ["var", ["arrows"], []], "\n"], "register_updates_middle");
    
    Template.compile(["<ul>\n\t<li>partially paid: ", ["var", ["rp", "is_partially_paid"], []], "</li>\n\t<li>pending: ", ["var", ["rp", "is_pending"], []], "</li>\n\t<li>TOTAL:\n\t\t<ul>\n\t\t\t<li>site: ", ["var", ["rp", "total", "site", "url"], []], "</li>\n\t\t\t<li>sitegroup: ", ["var", ["rp", "total", "sitegroup", "host"], []], ", ", ["var", ["rp", "total", "sitegroup", "tag", "tag"], []], "</li>\n\t\t\t<li>recipient: ", ["var", ["rp", "total", "recipient", "name"], []], "</li>\n\t\t\t<li>tag: ", ["var", ["rp", "total", "tag", "tag"], []], "</li>\n\t\t\t<li>total_time: ", ["var", ["rp", "total", "total_time"], []], " secs, ", ["var", ["rp", "total", "hours"], []], " hours</li>\n\t\t\t<li>total_amount: ", ["var", ["rp", "total", "total_amount"], []], " cents, $", ["var", ["rp", "total", "dollars"], []], "</li>\n\t\t\t<li>timetype: ", ["var", ["rp", "total", "timetype", "timetype"], []], "</li>\n\t\t\t<li>datetime: ", ["var", ["rp", "total", "friendly_datetime"], []], "</li>\n\t\t</ul>\n\t</li>\n</ul>\n"], "requires_payment");
    
    Template.compile(["\n<ul>\n\t", ["for", ["item"], ["var", ["substate_menu_items", "menu_items"], []], false, ["\n\t\t<li id=\"", ["var", ["item", "id"], []], "\"\n\t\t\tclass=\"", ["for", ["klass"], ["var", ["item", "klasses"], []], false, [["var", ["klass"], []], " "]], "\">\n\t\t\t", ["var", ["item", "value"], []], "</li>\n\t"]], "\n</ul>\n\n<h2>My Settings</h2>\n\n<h3>Payment Status</h3>\n<p>Estimated time until payment re-authorization is needed: \n", ["var", ["estimated_months_before_reauth", "months"], []], "</p>\n\n<h3>Selected Charities</h3>\n", ["for", ["rpct"], ["var", ["recipient_percents"], []], false, ["\n<p>\n\t", ["var", ["rpct", "display_percent"], []], "% of every hour spent ProcrasDonation goes to\n\t", ["if", [[false, ["var", ["rpct", "recipient", "is_pd_registered"], []]]], 1, ["\n\t\t<a href=\"/", ["var", ["rpct", "recipient", "slug"], []], "/\">\n\t"], []], "\n\t\t", ["var", ["rpct", "recipient", "name"], []], "\n\t", ["if", [[false, ["var", ["rpct", "recipient", "is_pd_registered"], []]]], 1, ["\n\t\t</a>\n\t"], []], "\n</p>\n"]], "\n<p><a class=\"choose_charities\" href=\"", ["var", ["constants", "REGISTER_URL"], []], "\">Change selections</a></p>\n\n<div class=\"example_gauge\">\n\t<div id=\"happy_example_gauge\"></div>\n</div>\n\n<h3>ProcrasDonate</h3>\n<p>Weekly ProcrasDonate goal: \n\t<span class=\"thevalue\" id=\"pd_hr_per_week_goal\">", ["var", ["pd_hr_per_week_goal"], []], "</span>\n\t<span class=\"units\">hrs</span>\n\t<img class=\"up_arrow\" src=\"", ["var", ["constants", "MEDIA_URL"], []], "img/UpArrow.png\" />\n\t<img class=\"down_arrow\" src=\"", ["var", ["constants", "MEDIA_URL"], []], "img/DownArrow.png\" />\n\t<span class=\"error\"></span></p>\n<p>Weekly ProcrasDonate rate:\n\t$<span class=\"thevalue\" id=\"pd_dollars_per_hr\">", ["var", ["pd_dollars_per_hr"], []], "</span>\n\t<span class=\"units\">per hr</span>\n\t<img class=\"up_arrow\" src=\"", ["var", ["constants", "MEDIA_URL"], []], "img/UpArrow.png\" />\n\t<img class=\"down_arrow\" src=\"", ["var", ["constants", "MEDIA_URL"], []], "img/DownArrow.png\" />\n\t<span class=\"error\"></span></p>\n<p>Weekly ProcrasDonate limit:\n\t<span class=\"thevalue\" id=\"pd_hr_per_week_max\">", ["var", ["pd_hr_per_week_max"], []], "</span> \n\t<span class=\"units\">hrs</span>\n\t<img class=\"up_arrow\" src=\"", ["var", ["constants", "MEDIA_URL"], []], "img/UpArrow.png\" />\n\t<img class=\"down_arrow\" src=\"", ["var", ["constants", "MEDIA_URL"], []], "img/DownArrow.png\" />\n\t<span class=\"error\"></span></p>\n\n<h3>TimeWellSpent</h3>\n<p>Weekly TimeWellSpent rate:\n\t$<span class=\"thevalue\" id=\"tws_dollars_per_hr\">", ["var", ["tws_dollars_per_hr"], []], "</span>\n\t<span class=\"units\">per hr</span>\n\t<img class=\"up_arrow\" src=\"", ["var", ["constants", "MEDIA_URL"], []], "img/UpArrow.png\" />\n\t<img class=\"down_arrow\" src=\"", ["var", ["constants", "MEDIA_URL"], []], "img/DownArrow.png\" />\n\t<span class=\"error\"></span></p>\n<p>Weekly TimeWellSpent limit\n\t<span class=\"thevalue\" id=\"tws_hr_per_week_max\">", ["var", ["tws_hr_per_week_max"], []], "</span>\n\t<span class=\"units\">hrs</span>\n\t<img class=\"up_arrow\" src=\"", ["var", ["constants", "MEDIA_URL"], []], "img/UpArrow.png\" />\n\t<img class=\"down_arrow\" src=\"", ["var", ["constants", "MEDIA_URL"], []], "img/DownArrow.png\" />\n\t<span class=\"error\"></span></p>\n\t\n<h3>Support This Service</h3>\n<p>Monthly membership fee: $<span class=\"thevalue\" id=\"monthly_fee\">", ["var", ["monthly_fee"], []], "</span> \n\t<span class=\"units\">per month</span>\n\t<img class=\"up_arrow\" src=\"", ["var", ["constants", "MEDIA_URL"], []], "img/UpArrow.png\" />\n\t<img class=\"down_arrow\" src=\"", ["var", ["constants", "MEDIA_URL"], []], "img/DownArrow.png\" />\n\t<span class=\"error\"></span></p>\n<p>Per transaction percentage charge: <span class=\"thevalue\" id=\"support_pct\">", ["var", ["support_pct"], []], "</span>\n\t<span class=\"units\">%</span>\n\t<img class=\"up_arrow\" src=\"", ["var", ["constants", "MEDIA_URL"], []], "img/UpArrow.png\" />\n\t<img class=\"down_arrow\" src=\"", ["var", ["constants", "MEDIA_URL"], []], "img/DownArrow.png\" />\n\t<span class=\"error\"></span></p>\n\n<h3>Updates</h3>\n<p>Preferred email address: <input id=\"email\" value=\"", ["var", ["email"], []], "\" /></p>\n\n<p><input id=\"weekly_affirmations\" type=\"checkbox\" ", ["if", [[false, ["var", ["weekly_affirmations"], []]]], 1, ["checked"], []], " />\nYes, I want to receive weekly affirmation on the progress I am making towards my goals.</p>\n\n<p><input id=\"org_thank_yous\" type=\"checkbox\" ", ["if", [[false, ["var", ["org_thank_yous"], []]]], 1, ["checked"], []], " />\nYes, I want to receive occasional thank you notes forwarded from the charities I support.</p>\n\n<p><input id=\"org_newsletters\" type=\"checkbox\" ", ["if", [[false, ["var", ["org_newsletters"], []]]], 1, ["checked"], []], " />\nYes, I want to receive forwarded year end newsletters from the charities I support.</p>\n"], "settings_overview_middle");
    
    Template.compile(["\n<table>\n<tbody>\n<tr>\n\t<td align=\"left\">\n\t\t<input\n\t\tclass=\"support_method_radio\"\n\t\ttype=\"radio\"\n\t\tname=\"support_method\"\n\t\tvalue=\"monthly\"\n\t\t", ["ifequal", ["var", ["support_method"], []], ["var", "monthly", []], ["checked"], []], " />\n\t<label>Monthly Subscription</label>\n\t</td>\n\t<td align=\"left\">\n\t\t\t<input\n\t\tclass=\"support_method_radio\"\n\t\ttype=\"radio\"\n\t\tname=\"support_method\"\n\t\tvalue=\"percent\"\n\t\t", ["ifequal", ["var", ["support_method"], []], ["var", "percent", []], ["checked"], []], ">Transaction Percent</input>\n\t</td>\t\n</tr>\t\n<tr>\n<td class=\"support_method_monthly ", ["ifequal", ["var", ["support_method"], []], ["var", "percent", []], ["disabled"], []], "\">\n\t<p>\"Please charge me a membership services fee of \t\n\t<input\n\t\ttype=\"text\"\n\t\tid=\"monthly_fee\"\n\t\tname=\"monthly_fee\" \n\t\tvalue=\"", ["var", ["monthly_fee"], []], "\"\n\t\tsize=\"4\"\n\t\t", ["ifequal", ["var", ["support_method"], []], ["var", "percent", []], ["disabled"], []], " />\n\t   dollars per month.\"\t\t\n\t</p>\n\t<span class=\"units\"></span>\n   <span id=\"monthly_error\" class=\"error\"></span></p>\n   <ul><li>Choosing this option benefits your charities since they'll get more out of each donation.\n\t\t</li>\n\t</ul>\n</td>\n<td class=\"support_method_percent ", ["ifequal", ["var", ["support_method"], []], ["var", "monthly", []], ["disabled"], []], "\">\n\t<p>\n\t\t\"Please subtract a \n\t\t\t<input\n\t\t\ttype=\"text\"\n\t\t\tid=\"support_pct\"\n\t\t\tname=\"support_pct\" \n\t\t\tvalue=\"", ["var", ["support_pct"], []], "\"\n\t\t\tsize=\"4\"\n\t\t\t", ["ifequal", ["var", ["support_method"], []], ["var", "monthly", []], ["disabled"], []], " />\n\t\t   <span class=\"units\"></span>\n\t\t   <span id=\"support_error\" class=\"error\"></span>\n\t  \t% transfer service fee from my donations.\" \n\t<ul><li>This is a good option if your donations may not be large enough to justify paying a monthly fee.\n\t\t</li>\n\t</ul>\t\n\t</p>\n</td>\n</tr>\n</tbody>\n</table>\n"], "support_middle");
    
    Template.compile(["<table>\n<tbody>\n<tr>\n\t<td align=\"left\">\n\t\t<input\n\t\tclass=\"tax_deductions_radio\"\n\t\ttype=\"radio\"\n\t\tname=\"tax_deductions\"\n\t\tvalue=\"yes\"\n\t\t", ["if", [[false, ["var", ["tax_deductions"], []]]], 1, ["checked"], []], ">Yes</input>\n\t</td>\n\t<td align=\"left\">\n\t\t<input\n\t\tclass=\"tax_deductions_radio\"\n\t\ttype=\"radio\"\n\t\tname=\"tax_deductions\"\n\t\tvalue=\"no\"\n\t\t", ["if", [[true, ["var", ["tax_deductions"], []]]], 1, ["checked"], []], ">No</input>\n\t</td>\n</tr>\n<tr>\n<td class=\"tax_deductions ", ["if", [[true, ["var", ["tax_deductions"], []]]], 1, ["disabled"], []], "\">\n\t<p><input\n\t\ttype=\"checkbox\"\n\t\tname=\"org_thank_yous\"\n\t\tclass=\"comm_radio\"\n\t\t", ["if", [[true, ["var", ["tax_deductions"], []]]], 1, ["disabled"], []], "\n\t\t", ["if", [[false, ["var", ["org_thank_yous"], []]]], 1, ["checked"], []], " />\n\t   <span>\"Please forward occasional thank you notes from \n\t   \t\torganizations I support.\"</span>\n\t   </p>\n\t   \n\t<p><input\n\t\ttype=\"checkbox\"\n\t\tname=\"org_newsletters\"\n\t\tclass=\"comm_radio\"\n\t\t", ["if", [[true, ["var", ["tax_deductions"], []]]], 1, ["disabled"], []], "\n\t\t", ["if", [[false, ["var", ["org_newsletters"], []]]], 1, ["checked"], []], " />\n\t   <span>\"Please forward occasional newsletters from \n\t   organizations I support.\"</span>\n\t   </p>\n\t<ul><li>Organizations you support will have access to your mailing address to send you appropriate tax documentation.</li>\n\t</ul>\n\t", ["for", ["field"], ["var", ["address_fields"], []], false, ["\n\t\t<p>\n\t\t\t<label>", ["var", ["field", "display"], []], "</label>\n\t\t\t<input\n\t\t\t\ttype=\"text\"\n\t\t\t\tname=\"", ["var", ["field", "name"], []], "\"\n\t\t\t\t", ["if", [[true, ["var", ["tax_deductions"], []]]], 1, ["disabled"], []], "\n\t\t\t\tvalue=\"", ["var", ["field", "value"], []], "\" />\n\t\t</p>\n\t"]], "\n\n</td>\n<td class=\"not_tax_deductions ", ["if", [[false, ["var", ["tax_deductions"], []]]], 1, ["disabled"], []], "\">\n\t<p><input\n\t\ttype=\"checkbox\"\n\t\tname=\"org_thank_yous\"\n\t\tclass=\"comm_radio\"\n\t\t", ["if", [[false, ["var", ["tax_deductions"], []]]], 1, ["disabled"], []], "\n\t\t", ["if", [[false, ["var", ["org_thank_yous"], []]]], 1, ["checked"], []], " />\n\t   <span>\"Please forward occasional thank you notes from \n\t   \t\torganizations I support.\"</span>\n\t   </p>\n\t \n\t<p><input\n\t\ttype=\"checkbox\"\n\t\tname=\"org_newsletters\"\n\t\tclass=\"comm_radio\"\n\t\t", ["if", [[false, ["var", ["tax_deductions"], []]]], 1, ["disabled"], []], "\n\t\t", ["if", [[false, ["var", ["org_newsletters"], []]]], 1, ["checked"], []], " />\n\t   <span>\"Please forward occasional newsletters from \n\t   organizations I support.\"</span>\n\t   </p>\n\n\t<ul><li>Organizations you support will see your name but not your address on their receipts.</li>\n\t</ul>\n\n</td>\n</tr>\n</tbody>\n</table>\n"], "tax_deductions_middle");
    
    Template.compile(["<span class='img_link move_to_unsorted'>\n\t<img class='Move_Site_Arrow' src='", ["var", ["constants", "MEDIA_URL"], []], "img/LeftArrow.png'>\n</span>\n", ["var", ["inner"], []], "\n"], "timewellspent_wrap");
    
    Template.compile(["<style> \n<!--\n\t#procrasdonate_extn_top_bar {\n\t\tbackground-color: #f2e3f7;\n\t\tcolor: #000000;\n\t\tfont-size: 12px;\n\t\tmargin: 0 0 0 0;\n\t\tpadding: 4px 4px;\n\t\ttext-align: center;\n\t\theight: 24px;\n\t}\n\t\n\t#procrasdonate_extn_top_bar * {\n\t\ttext-align: center;\n\t\tline-height: 1.3em;\n\t\tfloat: none;\n\t\tmargin: 0em;\n\t\tpadding: 0em;\n\t\tborder: none;\n\t\ttext-decoration: none;\n\t\tfont-size: 12px;\n\t\tfont-family: Verdana,Arial,Helvetica,sans-serif;\n\t\tfont-weight: normal;\n\t\tfont-style: normal;\n\t}\n\t\n\t#procrasdonate_extn_top_bar p {\n\t\ttext-align: left;\n\t\tmargin: .5em .2em\n\t}\n\t\n\t#procrasdonate_extn_top_bar ul {\n\t\ttext-align: left;\n\t}\n\t\n\t#procrasdonate_extn_top_bar ul li {\n\t\ttext-align: left;\n\t\tlist-style-image: none;\n\t\tlist-style-position: inside;\n\t\tlist-style-type: circle;\n\t\tmargin-left: 3em;\n\t}\n\t\n\t#procrasdonate_extn_top_bar img {\n\t\tmargin: 0 10px;\n\t}\n\t\n\t#procrasdonate_extn_top_bar a {\n\t\tcolor: blue;\n\t\ttext-decoration: underline;\n\t\tborder: none;\n\t}\n\t\n\t#procrasdonate_extn_summary {\n\t\tdisplay: inline;\n\t\ttext-align: center;\n\t}\n\t\n\t#procrasdonate_extn_message {\n\t\ttext-align: left;\n\t\tdisplay: inline;\n\t}\n\n\t#procrasdonate_extn_expand {\n\t\twidth: 16px;\n\t\tcursor: pointer;\n\t}\n\t\n\t#close_procrasdonate_extn_top_bar {\n\t\tfloat: right;\n\t\tcursor: pointer;\n\t\tmargin: 4px 10px;\n\t}\n-->\n</style>\n   \n <div id=\"procrasdonate_extn_top_bar\">\n \t<div id=\"close_procrasdonate_extn_top_bar\">[x]</div>\n \n \t<a href=\"", ["var", ["constants", "PD_URL"], []], ["var", ["constants", "PROGRESS_URL"], []], "\">\n\t\t<img src=\"", ["var", ["constants", "PD_URL"], []], ["var", ["constants", "MEDIA_URL"], []], "img/ToolbarImages/ProcrasDonateIcon.png\" />\n\t</a>\n\t<p id=\"procrasdonate_extn_summary\">", ["var", ["latest_report", "subject"], []], "</p>\n\t<div id=\"procrasdonate_extn_message\"></div>\n\t<img\n\t\tid=\"procrasdonate_extn_expand\"\n\t\tclass=\"contracted\"\n\t\tsrc=\"", ["var", ["constants", "PD_URL"], []], ["var", ["constants", "MEDIA_URL"], []], "img/ExpandButton.png\" />\n\t<a target=\"_blank\" href=\"", ["var", ["constants", "PD_URL"], []], ["var", ["constants", "MESSAGES_URL"], []], "\">\n\t\t<img src=\"", ["var", ["constants", "PD_URL"], []], ["var", ["constants", "MEDIA_URL"], []], "img/MoreButton.png\" />\n\t</a>\n</div>\n"], "top_bar");
    
    Template.compile(["<span class='img_link move_to_procrasdonate'>\n\t<img class='Move_Site_Arrow' src='", ["var", ["constants", "MEDIA_URL"], []], "img/LeftArrow.png'>\n</span>\n", ["var", ["inner"], []], "\n<span class='img_link move_to_timewellspent'>\n\t<img class='Move_Site_Arrow' src='", ["var", ["constants", "MEDIA_URL"], []], "img/RightArrow.png'>\n</span>\n"], "unsorted_wrap");
    
    Template.compile(["<table id=\"user_messages\">\n<tbody><tr><td>\n\t<ul>\n    \t<li class=\"message\">", ["var", ["message"], []], "</li>\n\t</ul>\n</td></tr></tbody>\n</table>\n"], "user_messages");
    
    Template.compile(["<div id=\"visual_debug\">\n\t", ["for", ["action"], ["var", ["actions"], []], false, ["\n\t\t<p class=\"link\" id=\"", ["var", ["action"], []], "\">", ["var", ["action"], []], "</p>\n\t"]], "\n</div>\n\n<div id=\"theatre\">\n</div>\n"], "visual_debug");
    
    Template.compile([["nop"], "\n\n", ["if", [[false, ["var", ["match"], []]]], 1, ["\n\t<p>\n\t\tIt's a match! You ProcrasDonated for exactly\n\t\t", ["var", ["pd_hrs_one_week"], []], " hours two weeks in a row!\n\t\tThat would win you a free game if we were playing pinball.\n\t\t", ["if", [[false, ["var", ["met_goal"], []]]], 1, ["\n\t\t\tYou would also get extra points for meeting your goal of\n\t\t\t", ["var", ["pd_hr_per_week_goal"], []], " hours per week.\n\t\t"], ["\n\t\t\tUnfortunately, you'd lose a turn for exceeding\n\t\t\tyour goal of ", ["var", ["pd_hr_per_week_goal"], []], " hours per week.\n\t\t"]], "\n\t</p>\n"], ["\n", ["if", [[false, ["var", ["no_data"], []]]], 1, ["\n\t<p>You haven't visited any websites tagged as ProcrasDonate. You can tag sites by clicking the \"?\" icon in your\n\tFirefox toolbar next to the URL address bar, or by visiting the \"Sites\" tab of \n\t<a href=\"", ["var", ["constants", "PD_URL"], []], ["var", ["constants", "PROGRESS_URL"], []], "\">My Progress</a>.</p>\n"], ["\n", ["if", [[false, ["var", ["one_week_good"], []]]], 1, ["\n\t<p>\n\t\tCongratulations", ["if", [[false, ["var", ["name"], []]]], 1, [", ", ["var", ["name"], []], "!"], ["!"]], "\n\t\tYou ProcrasDonated less than your goal of ", ["var", ["pd_hr_per_week_goal"], []], " hours.\n\t\tKeep up the good work!\n\t</p>\n"], ["\n", ["if", [[false, ["var", ["one_week_bad"], []]]], 1, ["\n\t<p>\n\t\tToo bad", ["if", [[false, ["var", ["name"], []]]], 1, [", ", ["var", ["name"], []], "."], ["."]], "\n\t\tYou ProcrasDonated more than your goal of ", ["var", ["pd_hr_per_week_goal"], []], " hours.\n\t\tWe know you can do better!\n\t</p>\n"], ["\n", ["if", [[false, ["var", ["good_in_a_row"], []]]], 1, ["\n\t<p>\n\t\tYou're on a roll", ["if", [[false, ["var", ["name"], []]]], 1, [", ", ["var", ["name"], []], "!"], ["!"]], "\n\t\tYou ProcrasDonated less than your goal of ", ["var", ["pd_hr_per_week_goal"], []], " hours\n\t\tfor at least ", ["var", ["weeks_in_a_row_met"], []], " weeks in a row. ProcrasDonating less means donating less.\n\t\tWould you like to celebrate by <a href=\"", ["var", ["constants", "PD_URL"], []], ["var", ["constants", "SETTINGS_URL"], []], "\">\n\t\traising your hourly giving</a> to ", ["var", ["top_charity", "name"], []], "? Woohoo!</p>\n"], ["\n", ["if", [[false, ["var", ["good"], []]]], 1, ["\n\t<p>\n\t\tCongratulations", ["if", [[false, ["var", ["name"], []]]], 1, [", ", ["var", ["name"], []], "!"], ["!"]], "\n\t\tYou ProcrasDonated less than your goal of ", ["var", ["pd_hr_per_week_goal"], []], " hours.\n\t\tKeep up the good work!\n\t</p>\n"], ["\n", ["if", [[false, ["var", ["sudden_bad"], []]]], 1, ["\n\t<p>\n\t", ["if", [[false, ["var", ["name"], []]]], 1, [["var", ["name"], []], ", your"], ["Your"]], " streak has ended.  \n\tYou had met your goal for at least ", ["var", ["weeks_in_a_row_met"], []], " weeks in a row.\n\tThis week you ProcrasDonated ", ["var", ["pd_hrs_one_week"], []], " hours, exceeding \n\tyour goal of ", ["var", ["pd_hr_per_week_goal"], []], " hours by ", ["var", ["pd_hrs_one_week_diff"], []], ".\n\tWe know you can get back on track!\n\t</p>\n"], ["\n", ["if", [[false, ["var", ["getting_worse"], []]]], 1, ["\n\t<p>\n\t\tWhat happened", ["if", [[false, ["var", ["name"], []]]], 1, [", ", ["var", ["name"], []], "?"], ["?"]], "\n\t\tYou ProcrasDonated ", ["var", ["pd_hrs_one_week_two_week_diff"], []], " hours more than the week before.\n\t\tThat's a total of ", ["var", ["pd_hrs_one_week_diff"], []], " hours more than your goal\n\t\tof ", ["var", ["pd_hr_per_week_goal"], []], " hours.\n\t\tWhat are you going to do about this?\n\t</p>\n"], ["\n", ["if", [[false, ["var", ["getting_better"], []]]], 1, ["\n\t<p>\n\tYou're getting closer to your goal", ["if", [[false, ["var", ["name"], []]]], 1, [", ", ["var", ["name"], []], "."], ["."]], "\n\tAwesome!\n\tYou ProcrasDonated ", ["var", ["pd_hrs_one_week_two_week_diff"], []], " hours less than the week before,\n\twhich means you're on track to meeting your goal of ", ["var", ["pd_hr_per_week_goal"], []], " hours per week.\n\tKeep it up! You can do it!\n\t</p>\n"], []]]]]]]]]]]]]]]]]], "\n\n<p>Hours ProcrasDonated</p>\n<ul>\n\t<li>this week: ", ["var", ["pd_hrs_one_week"], []], " hours \n\t\t(", ["var", ["pd_culprit_one_week", "hours_int"], []], " hours from ", ["var", ["pd_culprit_one_week", "sitegroup", "host"], []], ")</li>\n\t", ["if", [[false, ["var", ["pd_hrs_two_week"], []]]], 1, ["<li>last week: ", ["var", ["pd_hrs_two_week"], []], " hours \n\t\t(", ["var", ["pd_culprit_two_week", "hours_int"], []], " hours from ", ["var", ["pd_culprit_two_week", "sitegroup", "host"], []], ")</li>"], []], "\n\t", ["if", [[false, ["var", ["pd_hrs_three_week"], []]]], 1, ["<li>two weeks ago: ", ["var", ["pd_hrs_three_week"], []], " hours \n\t\t(", ["var", ["pd_culprit_three_week", "hours_int"], []], " hours from ", ["var", ["pd_culprit_three_week", "sitegroup", "host"], []], ")</li>"], []], "\n\t<br/>\n\t<li>goal: ", ["var", ["pd_hr_per_week_goal"], []], " hours</li>\n\t<li>limit: ", ["var", ["pd_hr_per_week_max"], []], " hours</li>\n\t<li>rate: $", ["var", ["pd_dollars_per_hr"], []], "/hour</li>\n</ul>\n\n<p>TimeWellSpent Hours</p>\n<ul>\n\t<li>this week: ", ["var", ["tws_hrs_one_week"], []], " hours\n\t\t(", ["var", ["tws_culprit_one_week", "hours_int"], []], " hours from ", ["var", ["tws_culprit_one_week", "sitegroup", "host"], []], ")</li>\n\t", ["if", [[false, ["var", ["tws_hrs_two_week"], []]]], 1, ["<li>last week: ", ["var", ["tws_hrs_two_week"], []], " hours\n\t\t(", ["var", ["tws_culprit_two_week", "hours_int"], []], " hours from ", ["var", ["tws_culprit_two_week", "sitegroup", "host"], []], ")</li>"], []], "\n\t", ["if", [[false, ["var", ["tws_hrs_three_week"], []]]], 1, ["<li>two weeks ago: ", ["var", ["tws_hrs_three_week"], []], " hours\n\t\t(", ["var", ["tws_culprit_three_week", "hours_int"], []], " hours from ", ["var", ["tws_culprit_three_week", "sitegroup", "host"], []], ")</li>"], []], "\n\t<br />\n\t<li>limit: ", ["var", ["tws_hr_per_week_max"], []], " hours</li>\n\t<li>rate: $", ["var", ["tws_dollars_per_hr"], []], "/hour</li>\n</ul>\n\n<p>Unclassified Hours</p>\n<ul>\n\t<li>this week: ", ["var", ["u_hrs_one_week"], []], " hours\n\t\t(", ["var", ["u_culprit_one_week", "hours_int"], []], " hours from ", ["var", ["u_culprit_one_week", "sitegroup", "host"], []], ")</li>\n\t", ["if", [[false, ["var", ["u_hrs_two_week"], []]]], 1, ["<li>last week: ", ["var", ["u_hrs_two_week"], []], " hours\n\t\t(", ["var", ["u_culprit_two_week", "hours_int"], []], " hours from ", ["var", ["u_culprit_two_week", "sitegroup", "host"], []], ")</li>"], []], "\n\t", ["if", [[false, ["var", ["u_hrs_three_week"], []]]], 1, ["<li>two weeks ago: ", ["var", ["u_hrs_three_week"], []], " hours\n\t\t(", ["var", ["u_culprit_three_week", "hours_int"], []], " hours from ", ["var", ["u_culprit_three_week", "sitegroup", "host"], []], ")</li>"], []], "\n</ul>\n\n", ["if", [[false, ["var", ["pledges"], []]]], 1, ["\n\t<p>This week you pledged:</p>\n\t<ul>\n\t", ["for", ["pledge"], ["var", ["pledges"], []], false, ["\n\t    <li>$", ["var", ["pledge", "amount"], []], " to ", ["var", ["pledge", "charity"], []], "</li>\n\t"]], "\n\t</ul>\n"], []], "\n\n", ["if", [[false, ["var", ["payments"], []]]], 1, ["\n\t<p>This week you turned pledges into donations!</p>\n\t<ul>\n\t", ["for", ["payment"], ["var", ["payments"], []], false, ["\n\t    <li>$", ["var", ["payment", "amount"], []], " to ", ["var", ["payment", "charity"], []], "</li>\n\t"]], "\n\t</ul>\n"], []], "\n\n<p><a href=\"", ["var", ["constants", "PD_URL"], []], ["var", ["constants", "MESSAGES_URL"], []], "\">View all messages</a></p>\n"], "weekly_report");
    
    Template.compile(["<p>Thanks for using <a href=\"", ["var", ["constants", "PD_URL"], []], ["var", ["constants", "SPLASH_URL"], []], "\">ProcrasDonate</a>\n\t", ["if", [[false, ["var", ["name"], []]]], 1, [", ", ["var", ["name"], []], "!"], ["!"]], "\n\tWe hope you have fun.\n</p>\n\t\t\n<p>Below are some tips to get you started. You can find more information\n\tin the <a href=\"", ["var", ["constants", "PD_URL"], []], ["var", ["constants", "FAQ_URL"], []], "\">FAQ</a>. If you have questions\n\tor suggestions please let us know on the <a href=\"", ["var", ["constants", "PD_URL"], []], ["var", ["constants", "FEEDBACK_URL"], []], "\">\n\tFeedback Forum</a> or by sending us <a href=\"mailto:", ["var", ["constants", "EMAIL_ADDRESS"], []], "\">email: </a>\n\t", ["var", ["constants", "EMAIL_ADDRESS"], []], ".\n</p>\n\n\t<h3>\n\t\t1. Categorize websites\n\t\t<img src=\"", ["var", ["constants", "PD_URL"], []], ["var", ["constants", "MEDIA_URL"], []], "img/ToolbarImages/UnsortedIcon.png\" class=\"icon-image\" />\n\t\t<img src=\"", ["var", ["constants", "PD_URL"], []], ["var", ["constants", "MEDIA_URL"], []], "img/ToolbarImages/ProcrasDonateIcon.png\" class=\"icon-image\" />\n\t\t<img src=\"", ["var", ["constants", "PD_URL"], []], ["var", ["constants", "MEDIA_URL"], []], "img/ToolbarImages/TimeWellSpentIcon.png\" class=\"icon-image\" />\n\t</h3>\n\t\n\t<p>Click the \n\t\t<img src=\"", ["var", ["constants", "PD_URL"], []], ["var", ["constants", "MEDIA_URL"], []], "img/ToolbarImages/UnsortedIcon.png\" class=\"icon-image\" />\n\t\ticon that appears in Firefox's toolbar <b>next</b> to your browser's website address bar.</p>\n\t  \n\t<p>Click <b>once</b> to classify the currently viewed website as ProcrasDonation\t\t\n\t\t<img src=\"", ["var", ["constants", "PD_URL"], []], ["var", ["constants", "MEDIA_URL"], []], "img/ToolbarImages/ProcrasDonateIcon.png\" class=\"icon-image\" />, \n\t\t<b>twice</b> for TimeWellSpent\t\t\n\t\t<img src=\"", ["var", ["constants", "PD_URL"], []], ["var", ["constants", "MEDIA_URL"], []], "img/ToolbarImages/TimeWellSpentIcon.png\" class=\"icon-image\" />.\n\t\t</p>\n\t\n\t<h3>\n\t\t2. <img src=\"", ["var", ["constants", "PD_URL"], []], ["var", ["constants", "MEDIA_URL"], []], "img/StepCircle6Done.png\" class=\"right-image\" />\n\t\t<a href=\"", ["var", ["constants", "PD_URL"], []], ["var", ["constants", "REGISTER_URL"], []], "\">Complete Registration</a>\n\t</h3>\n\t\n\t<p><a href=\"", ["var", ["constants", "PD_URL"], []], ["var", ["constants", "REGISTER_URL"], []], "\">Customize your account</a> to create charitable incentives\n\t\tand get feedback.</p>\n\t\n\t<h3>\n\t\t3. Monitor your weekly web usage \n\t\t<img src=\"", ["var", ["constants", "PD_URL"], []], ["var", ["constants", "MEDIA_URL"], []], "img/ToolbarImages/IconBar40.png\" class=\"icon-image\" />\n\t</h3>\n\t\n\t<p>Click the \n\t\t<img src=\"", ["var", ["constants", "PD_URL"], []], ["var", ["constants", "MEDIA_URL"], []], "img/ToolbarImages/IconBar20.png\" class=\"icon-image\" />\n\t\tmeter view your <a href=\"", ["var", ["constants", "PD_URL"], []], ["var", ["constants", "PROGRESS_URL"], []], "\">Progress</a> in more detail.</p>\n\t\n\t<p>Your <img src=\"", ["var", ["constants", "PD_URL"], []], ["var", ["constants", "MEDIA_URL"], []], "img/ToolbarImages/IconBar90.png\" class=\"icon-image\" />\n\t\tmeter will remain on default settings <b>until</b> you \n\t\t<a href=\"", ["var", ["constants", "PD_URL"], []], ["var", ["constants", "REGISTER_URL"], []], "\">Complete Registration</a> to set <i>your own goals</i>.</p>\n\n\t<h3>\n\t\t4. Look for weekly emails\n\t\t<img style=\"width:8em\" src=\"", ["var", ["constants", "PD_URL"], []], ["var", ["constants", "MEDIA_URL"], []], "img/laptophappy.png\" class=\"right-image\" />\n\t</h3>\n\t\n\t<p>Each week you will receive affirming summaries of your progress.</p>\n\t\n\t<h3>\n\t\t5. Tell your friends!\n\t</h3>\n\t<p>\n\t\t<img style=\"width:6em\" src=\"", ["var", ["constants", "PD_URL"], []], ["var", ["constants", "MEDIA_URL"], []], "img/laptophappy.png\" />\n\t\t<img style=\"width:6em\" src=\"", ["var", ["constants", "PD_URL"], []], ["var", ["constants", "MEDIA_URL"], []], "img/laptophappy.png\" />\n\t\t<img style=\"width:6em\" src=\"", ["var", ["constants", "PD_URL"], []], ["var", ["constants", "MEDIA_URL"], []], "img/laptophappy.png\" />\n\t</p>\n\t\n\t"], "welcome_message");
    
    Template.compile(["<div id='thin_column'>\n\t", ["var", ["tab_snippet"], []], "\n\t<div id='messages'></div>\n\t<div id='errors'></div>\n\t<div id='success'></div>\n\t", ["var", ["middle"], []], "\n</div>\n\n"], "wrapper_snippet");
    

/**************** content/js/lib/db/base.js *****************/
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


/**************** content/js/lib/db/sqlite3_firefox.js *****************/
var SQLITE3_FIREFOX_LOGGING = false;
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
		if (SQLITE3_FIREFOX_LOGGING) _print(sql);
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
	// var Site = new Model(db, "Site", {
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
	
	// this allows us to call class methods directly on the model
	_extend(this, this.class_opts);
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
		if (SQLITE3_FIREFOX_LOGGING) logger(" the order_by:::"+order_by);
		query = this.sql_select.apply(this, [query, order_by]);
		if (SQLITE3_FIREFOX_LOGGING) logger(" sqlite3_firefox.js::select query="+query+" order_by="+order_by);
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
		if (SQLITE3_FIREFOX_LOGGING) logger("sql_select="+order_by);
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
					/*
					var order_by_column = order_by;
					if (order_by_column[0] == "-") {
						order_by_column = order_by_column.substr(1, order_by_column.length);
					}
					// this.columns contains [name=INTEGER, name2=VARCHAR, ...]
					if (!_contains(this.columns, order_by_column)) {
						logger("Unknown ORDER_BY column: "+order_by_column+" in "+this.table_name);
					}
					*/
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
				}
				sql = sql.join(" ");
				if (SQLITE3_FIREFOX_LOGGING) logger(" THE SQL:::"+sql);
				return [sql, params];
			}
		} else {
			throw new Error("Don't know how to use query: " + query);
		}
	},
	
	/*
	inner_join: function() {
		var sql = this.sql_inner_join();
		return this.db.execute(sql);
	},
	sql_inner_join: function() {
		["SELECT ", Model[fielda], ", ", 
		//SELECT Artists.ArtistName, CDs.Title FROM Artists INNER JOIN CDs ON Artists.ArtistID=CDs.ArtistID; 
		return Model.sql_create_table(this.table_name, this.columns);
	},
	*/
	
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
	
	add_column: function(name, type) {
		var sql = this.sql_add_column(name, type);
		return this.db.execute(sql);
	},
	sql_add_column: function(name, type) {
		return Model.sql_add_column(this.table_name, name, type);
	},
		
	
	/*
	 * @param query: OBJECT of column name, value
	 */
	set: function(updates, wheres) {
		if (SQLITE3_FIREFOX_LOGGING) _pprint(this.columns);
		
		var str = "UPDATE "+this.table_name+" SET ";
		var is_first = true;
		for (var col in updates) {
			if (is_first) { is_first = false; }
			else { str += ", "; }
			str += col+"=";
			if (this.columns[col] == "VARCHAR") {
				str += "\""+updates[col]+"\"";
			} else {
				str += updates[col];
			}
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
		if (SQLITE3_FIREFOX_LOGGING) logger(" sqlite3_firefox::set sql query="+str);
		this.db.execute(str);
	},
	
	//DELETE from [table name] where [field name] = 'value';
	del: function(wheres) {
		var str = "DELETE from "+this.table_name+" where ";
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
		str += ";"
		this.db.execute(str);
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
				logger("WARNING: get_or_null found "+ary.length+" rows for "+query);
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
	
	sql_add_column: function(name, cname, ctype) {
		return "ALTER TABLE " + name + " ADD COLUMN " + cname + " " + ctype;
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

/*
 * @param prototype: instance_opts.
 * This allows us to retrieve a row using select or get_or_null
 * and then call instance methods or fields (columns) directly
 * on the row.
 */
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
		},
		
		/**
		 * Dumb default deep dict.
		 * Problems:
		 *    1. Isn't deep at all. <foo>_id aren't retrieved
		 *       (even if they were, contenttype ones would have to be smarter
		 *    2. Doesn't use _un_dbify anything
		 *       (options are _un_dbify_bool() and _un_dbify_date() on values
		 */
		deep_dict: function() {
			var self = this;
			var ret = {};
			_iterate(columns, function(name, value, i) {
				/*
				 * could automatically make <foo>_id deep but,
				 * meh.
				var l = name.length;
				if (name.substr(l-3,3) == "_id") {
					// fetch the item from its table
					var noid_name = name.substr(0,l-3);
					ret[] = 
					do a reverse lookup in ContentTypes table (have to lower case)
				} else {
					ret[name] = self[name];
				}
				*/
				var v = self[name];
				/*
				 * how do we do date?
				 * perhaps we want to do this for all row.foo calls one day
				if (value == "INTEGER" || value == "INTEGER PRIMARY KEY") {
					v = parseInt(v);
				} else if (value == "REAL") {
					v = parseFloat(v);
				} else if (value == "BOOL") {
					v = _un_dbify_bool(v);
				}
				*/
				ret[name] = v;
			});
			return ret;
		},
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




/**************** content/js/lib/preferences.js *****************/


function PreferenceManager(prefix, defaults) {
	this.prefix = prefix || "ProcrasDonate.";
	this.defaults = defaults;
	
	this.service = Components.classes["@mozilla.org/preferences-service;1"].
		getService(Components.interfaces.nsIPrefService);
	this.pref = this.service.getBranch(this.prefix);
	
	this.observers = {};
}
PreferenceManager.prototype = {};
_extend(PreferenceManager.prototype, {
	exists: function(name) {
		return this.pref.getPrefType(name) != this.pref.PREF_INVALID;
	},
	save: function() {
		this.service.savePrefFile(null);
	},
	
	get: function(name, default_value) {
		var type = this.pref.getPrefType(name);
		
		if (type == this.pref.PREF_INVALID)
			return default_value;
		
		switch (type) {
		case this.pref.PREF_STRING:
			return this.pref.getCharPref(name);
		case this.pref.PREF_BOOL:
			return this.pref.getBoolPref(name);
		case this.pref.PREF_INT:
			return this.pref.getIntPref(name);
		default:
			throw new Error(
				"Invalid preference type \"" + type + "\" for \"" + name + "\"");
		}
	},
	set: function(name, value) {
		var type = typeof(value);
		
		switch (type) {
			case "string":
			case "boolean":
				break;
			case "number":
				if (value % 1 != 0) {
					throw new Error("Cannot set preference to non integral number");
				}
				break;
			//case "object":
				//type = "string";
				//value = JSON.stringify(value);
				//alert("value: "+value+" string: "+JSON.stringify(value));
			//	break;
			default:
				try {
					this.FAIL(); // we expect this to fail because we haven't defined a FAIL property!
				} catch (e) {
					logger("ERROR: lib/preferences.set::"+e.stack);
				}
				throw new Error("Cannot set preference with datatype: " + type +
						"\nname="+name+" value="+value);
		}
		
		// underlying preferences object throws an exception if new pref has a
		// different type than old one. i think we should not do this, so delete
		// old pref first if this is the case.
		if (this.exists(name) && type != typeof(this.get(name))) {
			this.remove(name);
		}
		
		// set new value using correct method
		switch (type) {
		case "string":
			this.pref.setCharPref(name, value);
			break;
		case "boolean":
			this.pref.setBoolPref(name, value);
			break;
		case "number":
			this.pref.setIntPref(name, Math.floor(value));
			break;
		}
	},
	// deletes the named preference or subtree
	remove: function(name) {
		this.pref.deleteBranch(name);
	},
	
	// call a function whenever the named preference subtree changes
	watch: function(name, watcher) {
		// construct an observer
		var observer={
			observe: function(subject, topic, name) {
				watcher(name);
			}
		};
		
		// store the observer in case we need to remove it later
		this.observers[watcher]=observer;
		
		this.pref.QueryInterface(Components.interfaces.nsIPrefBranchInternal).
			addObserver(name, observer, false);
	},
	// stop watching
	unwatch: function(name, watcher) {
		if (this.observers[watcher]) {
			this.pref.QueryInterface(Components.interfaces.nsIPrefBranchInternal)
				.removeObserver(name, this.observers[watcher]);
		}
	},
	
	/** @return an array of all preference keys */
	get_pref_keys: function() {
		return this.pref.getChildList("", {})
	},
	
	/** @return dictionary of (key, value) pairs for all preferences */
	get_all: function() {
		var self = this;
		var ret = {};
		var keys = self.get_pref_keys();
		_iterate(keys, function(idx, key, index) {
			ret[key] = self.get(key, "__DEFAULT__");
		});
		return ret
	},
});



/**************** content/js/lib/http_request.js *****************/

function HttpRequest(unsafeContentWin, chromeWindow) {
	this.unsafeContentWin = unsafeContentWin;
	this.chromeWindow = chromeWindow;
}

HttpRequest.prototype = {};
_extend(HttpRequest.prototype, {
	
	// this function gets called by user scripts in content security scope to
	// start a cross-domain xmlhttp request.
	//
	// options/details should look like:
	// {method,url,onload,onerror,onreadystatechange,headers,data}
	// headers should be in the form {name:value,name:value,etc}
	// can't support mimetype because i think it's only used for forcing
	// text/xml and we can't support that
	contentStartRequest: function(options) {
		// important to store this locally so that content cannot trick us up with
		// a fancy getter that checks the number of times it has been accessed,
		// returning a dangerous URL the time that we actually use it.
		var url = options.url;
		
		// make sure that we have an actual string so that we can't be fooled with
		// tricky toString() implementations.
		if (!isString(url)) {
			throw new Error("Invalid url: url must be of type string");
		}
		
		var ioService=Components.classes["@mozilla.org/network/io-service;1"].
			getService(Components.interfaces.nsIIOService);
		var scheme = ioService.extractScheme(url);
		
		// This is important - without it, GM_xmlhttpRequest can be used to get
		// access to things like files and chrome. Careful.
		switch (scheme) {
		case "http":
		case "https":
		case "ftp":
			this.chromeWindow.setTimeout(
				_bind(this, this.chromeStartRequest, url, options), 0);
			break;
		default:
			throw new Error("Invalid url scheme: " + url);
		}
	},
	
	// this function is intended to be called in chrome's security context, so
	// that it can access other domains without security warning
	chromeStartRequest: function(safeUrl, details) {
		var req = new this.chromeWindow.XMLHttpRequest();
		
		this.setupRequestEvent(this.unsafeContentWin, req, "onload", details);
		this.setupRequestEvent(this.unsafeContentWin, req, "onerror", details);
		this.setupRequestEvent(this.unsafeContentWin, req, "onreadystatechange", details);
		
		req.open(details.method, safeUrl);
		
		if (details.headers) {
			for (var prop in details.headers) {
				req.setRequestHeader(prop, details.headers[prop]);
			}
		}
		
		req.send(details.data);
	},
	
	// arranges for the specified 'event' on xmlhttprequest 'req' to call the
	// method by the same name which is a property of 'details' in the content
	// window's security context.
	setupRequestEvent: function(unsafeContentWin, req, event, details) {
		//logger(" inside setupRequestEvent. event="+event+" details="+details);
		if (details[event]) {
			//logger(" details[event] is true. details[event]="+details[event]+" "+typeof(details[event]));
			req[event] = function() {
				var responseState = {
					// can't support responseXML because security won't
					// let the browser call properties on it
					responseText: req.responseText,
					readyState: req.readyState,
					responseHeaders: (req.readyState==4?req.getAllResponseHeaders():''),
					status: (req.readyState==4?req.status:0),
					statusText: (req.readyState==4?req.statusText:'')
				}
				
				// Pop back onto browser thread and call event handler.
				// Have to use nested function here instead of GM_hitch because
				// otherwise details[event].apply can point to window.setTimeout, which
				// can be abused to get increased priveledges.
				new XPCNativeWrapper(unsafeContentWin, "setTimeout()")
					.setTimeout(function(){
						details[event](responseState);
					}, 0);
			}
		}
	},
});
	
//pageaddict_xmlhttpRequester.prototype.contentStartRequest = function(details) {
//	// important to store this locally so that content cannot trick us up with
//	// a fancy getter that checks the number of times it has been accessed,
//	// returning a dangerous URL the time that we actually use it.
//
//	var url = details.url;
//	
//	// make sure that we have an actual string so that we can't be fooled with
//	// tricky toString() implementations.
//	if (typeof url != "string") {
//		throw new Error("Invalid url: url must be of type string");
//	}
//
//	var ioService=Components.classes["@mozilla.org/network/io-service;1"]
//		.getService(Components.interfaces.nsIIOService);
//	var scheme = ioService.extractScheme(url);
//
//	// This is important - without it, GM_xmlhttpRequest can be used to get
//	// access to things like files and chrome. Careful.
//	switch (scheme) {
//		case "http":
//		case "https":
//		case "ftp":
//			this.chromeWindow.setTimeout(
//				pageaddict_gmCompiler.hitch(this, "chromeStartRequest", url, details), 0);
//			break;
//		default:
//			throw new Error("Invalid url: " + url);
//	}
//}
//
//pageaddict_xmlhttpRequester.prototype.chromeStartRequest=function(safeUrl, details) {
//	var req = new this.chromeWindow.XMLHttpRequest();
//
//	this.setupRequestEvent(this.unsafeContentWin, req, "onload", details);
//	this.setupRequestEvent(this.unsafeContentWin, req, "onerror", details);
//	this.setupRequestEvent(this.unsafeContentWin, req, "onreadystatechange", details);
//
//	req.open(details.method, safeUrl);
//
//	if (details.headers) {
//		for (var prop in details.headers) {
//			req.setRequestHeader(prop, details.headers[prop]);
//		}
//	}
//
//	req.send(details.data);
//}
//
//// arranges for the specified 'event' on xmlhttprequest 'req' to call the
//// method by the same name which is a property of 'details' in the content
//// window's security context.
//pageaddict_xmlhttpRequester.prototype.setupRequestEvent =
//function(unsafeContentWin, req, event, details) {
//	if (details[event]) {
//		req[event] = function() {
//			var responseState = {
//				// can't support responseXML because security won't
//				// let the browser call properties on it
//				responseText:req.responseText,
//				readyState:req.readyState,
//				responseHeaders:(req.readyState==4?req.getAllResponseHeaders():''),
//				status:(req.readyState==4?req.status:0),
//				statusText:(req.readyState==4?req.statusText:'')
//			}
//
//			// Pop back onto browser thread and call event handler.
//			// Have to use nested function here instead of GM_hitch because
//			// otherwise details[event].apply can point to window.setTimeout, which
//			// can be abused to get increased priveledges.
//			new XPCNativeWrapper(unsafeContentWin, "setTimeout()")
//				.setTimeout(function(){details[event](responseState);}, 0);
//		}
//	}
//}
//



/**************** content/js/lib/request.js *****************/

function PageRequest(url, event) {
	this.url = url;
	this.event = event;
}
PageRequest.prototype = {};
_extend(PageRequest.prototype, {
	get_unsafeContentWin: function() {
		var unsafeWin = this.event.target.defaultView;
		if (unsafeWin.wrappedJSObject)
			unsafeWin = unsafeWin.wrappedJSObject;
		return unsafeWin;
	},
	get_document: function() {
		var document = this.event.originalTarget;
		return document;
	},
	get_document_type: function() {
		var document = this.get_document();
		
		if (event.originalTarget instanceof HTMLDocument) {
			// Target is an HTML element
			if (event.originalTarget.defaultView.frameElement) {
				// Target is a frame
				return "html frame";
			} else {
				return "html";
			}
		} else {
			return "other";
		}
	},
	
	add_jQuery_ui: function() {
		var self = this;
		// the jQuery referenced inside here refers to the object loaded by the jQuery library
		var jq = function(selector, context) {
			return jQuery.fn.init(selector, context || self.get_document());
		};
		jQuery.extend(jq, jQuery);
		var c = self.get_document();
		jQuery_UI(jq, c)
		//jQuery_UI(function() { return self.jQuery.apply(self, Array.prototype.slice.apply(arguments, [0])) });
		return jq
	},
	
	jQuery: (function() {
		// the jQuery referenced inside here refers to the object loaded by the jQuery library
		var jq = function(selector, context) {
			//logger("request.jQuery(): " + selector + this.event);
			return jQuery.fn.init(selector, context || this.get_document());
		};
		jQuery.extend(jq, jQuery);
		return jq;
	})(),
		
	do_in_page: function(fn) {
		new XPCNativeWrapper(this.get_unsafeContentWin(), "setTimeout()").
			setTimeout(fn, 0);
	},
	
	http_request: function() {
		http_request = new HttpRequest(window, window);
		var request = http_request.contentStartRequest({
			method: "get",
			//url: "http://localhost:8000/start_now",
			url: "http://www.google.com",
			onload: function(event) {
				//logger(["HttpRequest->onload()", arguments.length]);
				//logger(event.responseText);
			},
			onerror: function(event) {
				//logger(["HttpRequest->onerror()",arguments.length]);
			},
			onreadystatechange: function(event) {
				//logger(["HttpRequest->onreadystatechange()", arguments]);
			},
		});
	},
	
	inject_script: function(script) {
		var url = this.url;
		var unsafeContentWin = this.get_unsafeContentWin();
		var safeWin = new XPCNativeWrapper(unsafeContentWin);
		
		var sandbox = new Components.utils.Sandbox(safeWin);
		
		//var storage=new pageaddict_ScriptStorage();
		//xmlhttpRequester=new pageaddict_xmlhttpRequester(
		//	unsafeContentWin, window//appSvc.hiddenDOMWindow
		//);
		
		sandbox.window=safeWin;
		sandbox.document=sandbox.window.document;
		sandbox.unsafeWindow=unsafeContentWin;
		
		// patch missing properties on xpcnw
		sandbox.XPathResult=Components.interfaces.nsIDOMXPathResult;
		
		// Here we add all the necessary references to the sandbox:
		sandbox.jQuery = sandbox.$ = function(selector, context) {
			return jQuery.fn.init(selector, context || sandbox.document);
		}
		
		
		
		// add our own APIs
		//sandbox.GM_addStyle=function(css) { 
		//	pageaddict_gmCompiler.addStyle(sandbox.document, css) };
		//sandbox.GM_setValue=pageaddict_gmCompiler.hitch(storage, "setValue");
		//sandbox.GM_getValue=pageaddict_gmCompiler.hitch(storage, "getValue");
		//sandbox.GM_delValue=pageaddict_gmCompiler.hitch(storage, "remove");
		//sandbox.GM_savePrefs=pageaddict_gmCompiler.hitch(storage, "savePrefs");
		//sandbox.GM_openInTab=pageaddict_gmCompiler.hitch(this, "openInTab", unsafeContentWin);
		//sandbox.GM_xmlhttpRequest=pageaddict_gmCompiler.hitch(
		//	xmlhttpRequester, "contentStartRequest"
		//);
		
		//unsupported
		//sandbox.GM_registerMenuCommand=function(){};
		//sandbox.GM_log=function(msg) {
		//	var consoleService = Components.classes["@mozilla.org/consoleservice;1"].
		//		getService(Components.interfaces.nsIConsoleService);
		//	consoleService.logStringMessage(msg);
		//};
		
		sandbox.__proto__=sandbox.window;
		
		try {
			this.evalInSandbox(script, url, sandbox);
		} catch (e) {
			var e2 = new Error(typeof e=="string" ? e : e.message);
			e2.fileName=script.filename;
			e2.lineNumber=0;
			logger(e2);
			//GM_logError(e2);
			//alert(e2);
		}
	},
	
	evalInSandbox: function(code, codebase, sandbox) {
		if (Components.utils && Components.utils.Sandbox) {
			// DP beta+
			Components.utils.evalInSandbox(code, sandbox);
		} else if (Components.utils && Components.utils.evalInSandbox) {
			// DP alphas
			Components.utils.evalInSandbox(code, codebase, sandbox);
		} else if (Sandbox) {
			// 1.0.x
			evalInSandbox(code, sandbox, codebase);
		} else {
			throw new Error("Could not create sandbox.");
		}
	},
	
	
	
});


/**************** content/js/generated_input.js *****************/

/**
 * Generated by xpi builder on the fly when user downloads extension.
 */
function generated_input() {
    return [{"constants_PD_URL": "http://localhost:8000", "constants_PD_API_URL": "http://localhost:8000", "is_update": true}]
}


/**************** content/js/settings.js *****************/
/**
 * Define all global variables here.
 */

// constants.PD_URL is actually overwritten later by 
// generated_input during install process

var constants = {};

(function CONSTANTS() {
	constants.STORE_VISIT_LOGGING = false;
	constants.IDLE_LOGGING = false;

	// from https://developer.mozilla.org/En/Code_snippets:On_page_load
	constants.STATE_START = Components.interfaces.nsIWebProgressListener.STATE_START;
	constants.STATE_STOP = Components.interfaces.nsIWebProgressListener.STATE_STOP;

	constants.ProcrasDonate__UUID="extension@procrasdonate.com";

	constants.MEDIA_URL = '/procrasdonate_media/';
	constants.PD_HOST = 'procrasdonate.com';
	constants.PD_URL = 'https://' + constants.PD_HOST;
	constants.PD_API_URL = 'https://' + constants.PD_HOST;
	//constants.PD_URL = 'http://localhost:8000';
	//constants.PD_API_URL = 'http://localhost:8000';
	//constants.VALID_HOSTS = ['localhost:8000', 'procrasdonate.com'];
	
	constants.PROCRASDONATE_URL = '/';
	constants.REGISTER_URL = '/register/';
	constants.HOME_URL = '/';
	constants.SPLASH_URL = '/splash/';
	constants.COMMUNITY_URL = '/community/';
	constants.FAQ_URL = '/faq/';
	constants.IMPACT_URL = '/my_impact/';
	constants.SETTINGS_URL = '/my_settings/';
	constants.PROGRESS_URL = '/my_progress/';
	constants.MESSAGES_URL = '/my_messages/';
	constants.ADMIN_URL = '/admin/';
	constants.TWS_SETTINGS_URL = '/my_settings/time_well_spent/';

	constants.FEEDBACK_URL = 'http://feedback.procrasdonate.com/';

	constants.COMMUNITY_URL = '/our_community';
	constants.PRIVACY_URL = '/privacy_guarantee/';
	constants.RECIPIENTS_URL = '/';
	
	constants.AUTHORIZE_PAYMENTS_URL = '/fps/user/payment/authorize/';
	constants.AUTHORIZE_PAYMENTS_CALLBACK_URL = '/fps/user/payment/authorize_callback/';
	
	constants.SEND_EMAIL_URL = '/post/email/';
	constants.SEND_DATA_URL = '/post/data/';
	constants.RECEIVE_DATA_URL = '/get/data/';
	
	// FPS
	constants.AUTHORIZE_PAYMENTS_URL = '/fps/user/payment/authorize/';
	constants.AUTHORIZE_PAYMENTS_CALLBACK_URL = '/fps/user/payment/authorize_callback/';
	constants.MAKE_PAYMENT_URL = '/fps/user/payment/pay/';
	constants.SETTLE_DEBT_URL = '/fps/user/payment/settle_debt/';
	
	constants.AUTHORIZE_MULTIUSE_URL = '/fps/user/multiuse/authorize/';
	constants.PAY_MULTIUSE_URL = '/fps/user/multiuse/pay/';
	constants.CANCEL_MULTIUSE_TOKEN_URL = '/fps/user/multiuse/cancel_token/';
	
	constants.ON_INSTALL_URL = '/on_install/';
	constants.AFTER_INSTALL_URL = '/after_install/';
	constants.AFTER_UPGRADE_URL = '/after_upgrade/';
	
	// used for development and testing
	constants.MANUAL_TEST_SUITE_URL = '/dev/manual_test_suite/';
	constants.AUTOMATIC_TEST_SUITE_URL = '/dev/automatic_test_suite/';
	constants.AUTOTESTER_TEST_SUITE_URL = '/dev/autotester_test_suite/';
	constants.TIMING_TEST_SUITE_URL = '/dev/timing_test_suite/';
	constants.VISUAL_DEBUG_URL = '/dev/visual_debug/';
	
	constants.AMAZON_USER_URL = "https://payments.amazon.com";
	
	constants.EMAIL_ADDRESS = "info@ProcrasDonate.com"

	// enumeration of settings page state
	constants.DEFAULT_SETTINGS_STATE = "overview";
	constants.SETTINGS_STATE_ENUM = [
	    'overview'
		/*'account', 
		'recipients', 
		'donation_amounts', 
		'support', 
		//'site_classifications',
		'payment_system'*/
	];
	constants.SETTINGS_STATE_TAB_NAMES = ['XXX'];
		//'Email', 'Recipients', 'Donations', 'Support', /*'Sites',*/ 'Amazon'];
	constants.SETTINGS_STATE_INSERTS = [
	    "insert_settings_overview",
		/*"insert_settings_account", 
		"insert_settings_recipients", 
		"insert_settings_donation_amounts", 
		"insert_settings_support", 
		//"insert_settings_site_classifications", 
		"insert_settings_payment_system"*/
	];
	constants.SETTINGS_STATE_PROCESSORS = [
	    "process_settings_overview",
		/*"process_account", 
		"process_recipients", 
		"process_donation", 
		"process_support", 
		//"process_site_classifications", 
		"process_payment_system"*/
	];

	// enumeration of progress page state
	constants.DEFAULT_PROGRESS_STATE = "gauges";
	constants.PROGRESS_STATE_ENUM = [
		"gauges", "classifications", "visits", "trends", /*"stacks", "averages", "ratios"*/
	];
	constants.PROGRESS_STATE_TAB_NAMES = [
		"Gauges", "Sites", "Visits", "Trends", /*"Stacks", "Averages", "Ratios"*/
	];
	constants.PROGRESS_STATE_INSERTS = [
		"insert_progress_gauges",
		"insert_progress_classifications",
		"insert_progress_visits",
		"insert_progress_trends",
		/*"insert_progress_stacks",
		"insert_progress_averages",
		"insert_progress_ratios"*/
	];
	constants.PROGRESS_STATE_IMAGES = [
		{ past: "GaugesButton.png", selected: "GaugesButton.png", future: "GaugesButton.png" },
		{ past: "LargeUnsortedIcon2.png", selected: "LargeUnsortedIcon.png", future: "LargeUnsortedIcon2.png" },
		{ past: "VisitsButton.png", selected: "VisitsButton.png", future: "VisitsButton.png" },
		{ past: "TrendsButton.png", selected: "TrendsButton.png", future: "TrendsButton.png" },
		/*{ past: "trends_button.png", selected: "trends_button.png", future: "trends_button.png" },
		{ past: "trends_button.png", selected: "trends_button.png", future: "trends_button.png" },
		{ past: "trends_button.png", selected: "trends_button.png", future: "trends_button.png" }*/
   	];

	// enumeration of messages page state
	constants.DEFAULT_MESSAGES_STATE = "all";
	constants.MESSAGES_STATE_ENUM = [
		"all", "thankyous", "newsletters", "weekly", "tax"
	];
	constants.MESSAGES_STATE_TAB_NAMES = [
		"All Messages", "Thankyou Notes", "Newsletters", "Weekly Feedback", "Tax Records"
	];
	constants.MESSAGES_STATE_INSERTS = [
		"insert_messages_all",
		"insert_messages_thankyous",
		"insert_messages_newsletters",
		"insert_messages_weekly",
		"insert_messages_tax",
	];
	
	//enumeration of impact page state
	constants.DEFAULT_IMPACT_STATE = "totals";
	constants.IMPACT_STATE_ENUM = ['totals', 'show_all', 'tax_deductible', 'other'];
	constants.IMPACT_STATE_TAB_NAMES = ["Totals", "Show All", "Tax-deductible", "Other"]; 
	constants.IMPACT_STATE_INSERTS = [
		"insert_impact_totals", 
		"insert_impact_show_all", 
		"insert_impact_tax_deductible",
		"insert_impact_other"
	];
	/* OLD
	////// SUBSTATES/////
	constants.DEFAULT_IMPACT_SUBSTATE = "this_week";
	constants.DEFAULT_IMPACT_RECIPIENTS_SUBSTATE = 'nonprofits';
	constants.DEFAULT_IMPACT_SITES_SUBSTATE = 'procrasdonate';
	constants.IMPACT_SUBSTATE_INSERTS = [
		"today",
		"this_week",
		"all_time",
		"daily",
		"weekly"
	];*/
	/*
	// impact substate: recipients
	constants.IMPACT_RECIPIENTS_SUBSTATE_ENUM = ['nonprofits', 'contentproviders'];
	constants.IMPACT_RECIPIENTS_SUBSTATE_TAB_NAMES = ['Non-Profits', 'Content Providers'];
	constants.IMPACT_RECIPIENTS_SUBSTATE_INSERTS = [insert_impact_recipients_nonprofits, insert_impact_recipients_contentproviders];
	// impact substate: sites
	constants.IMPACT_SITES_SUBSTATE_ENUM = ['procrasdonate', 'timewellspent', 'other'];
	constants.IMPACT_SITES_SUBSTATE_TAB_NAMES = ['ProcrasDonate', 'Time Well Spent', 'Un-Sorted'];
	constants.IMPACT_SITES_SUBSTATE_INSERTS = [insert_impact_recipients_nonprofits, insert_impact_recipients_contentproviders];
	*/
	// enumeration of register track state
	constants.DEFAULT_REGISTER_STATE = "incentive";
	constants.REGISTER_STATE_ENUM = [
		'incentive', 
		'charities', 
		'updates', 
		'payments',
		'time_well_spent'
	];
	constants.REGISTER_STATE_TAB_NAMES = [
		'Incentive', 'Charities', 'Services', 'Payments', 'XXXX']; // XXXX won't show done arrow, XXX will
	constants.REGISTER_STATE_INSERTS = [
		"insert_register_incentive", 
		"insert_register_charities", 
		"insert_register_updates",
		"insert_register_payments",
		"insert_register_time_well_spent",
	];
	constants.REGISTER_STATE_PROCESSORS = [
		"process_register_incentive", 
		"process_register_charities",  
		"process_register_updates",
		"process_register_payments",
		"process_register_time_well_spent"
	];
	
	constants.DEFAULT_HASH = "nohash";
	constants.DEFAULT_PRIVATE_KEY = "no_private_key";
	constants.DEFAULT_USERNAME = "";
	constants.DEFAULT_PASSWORD = "";
	constants.DEFAULT_EMAIL = "";
	constants.DEFAULT_PROCRASDONATE_REASON = "ProcrasDonating for a good cause";
	constants.DEFAULT_TIMEWELLSPENT_REASON = "TimeWellSpent for a good cause";
	constants.DEFAULT_PD_DOLLARS_PER_HR = 5;
	constants.DEFAULT_PD_HR_PER_WEEK_GOAL = 15;
	constants.DEFAULT_PD_HR_PER_WEEK_MAX = 30;
	constants.DEFAULT_TWS_DOLLARS_PER_HR = 0;
	constants.DEFAULT_TWS_HR_PER_WEEK_GOAL = 15;
	constants.DEFAULT_TWS_HR_PER_WEEK_MAX = 30;
	constants.DEFAULT_SUPPORT_PCT = _prefify_float(0.07);
	constants.DEFAULT_MONTHLY_FEE = _prefify_float(7.00);
	constants.DEFAULT_PAYMENT_THRESHHOLD = 10;
	
	constants.DEFAULT_MIN_AUTH_TIME = 12;
	constants.DEFAULT_MIN_AUTH_UNITS = 'months';
	
	constants.DEFAULT_MAX_IDLE = 3*60; // 3 minutes
	constants.DEFAULT_FLASH_MAX_IDLE = 20*60; // 20 minutes
	
	constants.DEFAULT_WEEKLY_AFFIRMATIONS = true;
	constants.DEFAULT_ORG_THANK_YOUS = false;
	constants.DEFAULT_ORG_NEWSLETTERS = false;
	constants.DEFAULT_TOS = false
	constants.DEFAULT_TAX_DEDUCTIONS = true;
	constants.DEFAULT_SUPPORT_METHOD = "monthly"; // or "percent"
	
	constants.DEFAULT_PRIVATE_BROWSING_ENABLED = false;
	
	// flag for whether to make payments or not--
	// eg, if db corruption or some other error
	constants.DEFAULT_PREVENT_PAYMENTS = false;
		
	// FPS DEFAULTS
	constants.DEFAULT_GLOBAL_AMOUNT_LIMIT = _prefify_float(100.00);
    constants.DEFAULT_CREDIT_LIMIT = _prefify_float(20.00);
    constants.DEFAULT_FPS_CBUI_VERSION = "2009-01-09";
    constants.DEFAULT_FPS_API_VERSION = "2008-09-17";
    constants.DEFAULT_PAYMENT_REASON = "Proudly ProcrasDonating for a good cause!";
	
	// then we can call CONSTANTS() whenever and it's not going to overwrite stuff 	
	CONSTANTS = function() { return constants; }
	return constants;
})();


/**************** content/js/api.js *****************/

var API = function() {
};
API.prototype = {};
_extend(API.prototype, {
	make_request: function(url, data, method, onload, onerror) {
		var encoded_data = "";
		var remove_last = false;
		for (var prop in data) {
			encoded_data += encodeURIComponent(prop) +
				"=" +
				encodeURIComponent(data[prop]) +
				"&";
			remove_last = true;
		}
		if ( remove_last ) {
			encoded_data = encoded_data.substring(0, encoded_data.length-1);
		}
		//logger("api.js::make_request: data="+data);

		if ( method == "GET" ) {
			url += "?" + encoded_data;
			encoded_data = "";
		}

		var headers = {
			"User-agent" : "Mozilla/4.0 (compatible) ProcrasDonate",
			"Content-length" : encoded_data.length
		}
		if ( method == 'POST' ) {
			headers["Content-type"] = "application/x-www-form-urlencoded";
		}
		
		if (!onerror) {
			onerror = function(r) {
				var str = ""; for (var prop in r) {	str += prop + " value :" + r[prop]+ + " __ "; }
				logger("standard_onerror for url="+url+" data="+data+": "+r+"_"+str);
				// might as well try
				// wait, what request?
				//request.jQuery("#errors").append("Something unexpected occurred.");
			};
		}
	
		var options = {
			url: url,
			data: encoded_data,
			method: method,
			onload: onload,
			onerror: onerror
		};
		try {
			var request = new HttpRequest(window, window);
			request.contentStartRequest(options);
			//request.chromeStartRequest(url, options);
			return request;
		} catch(e) {
			logger(" HTTPREQUEST error occured in api.js "+e);
			onerror("Something unexpected happened.");
		}
	},
});


/**************** content/js/pd.js *****************/

// PD_API
// * handles interaction with ProcrasDonate.com
var ProcrasDonate_API = function(pddb, prefs) {
	this.pddb = pddb;
	this.prefs = prefs;
	//API.apply(this, arguments);
};

ProcrasDonate_API.prototype = new API();
_extend(ProcrasDonate_API.prototype, {
	/*
	 * 
	 */
	send_data: function() {
		var self = this;
		var models_to_methods = {
			"Total": "_get_totals",
		    "UserStudy": "_get_user_studies",
            "Log": "_get_logs",
            "Payment": "_get_payments",
            "RequiresPayment": "_get_requires_payments",
            "Report": "_get_reports"
		};
		
		var data = {
			private_key: self.prefs.get('private_key', constants.DEFAULT_PRIVATE_KEY),
			prefs: JSON.stringify([self.prefs.get_all()]),
		}
		
		_iterate(models_to_methods, function(key, value, index) {
			var items = self[value]();
			data[self.pddb[key].table_name] = JSON.stringify(items);
		});
		
		var url = constants.PD_API_URL + constants.SEND_DATA_URL;
		self.pddb.orthogonals.log("pd.js:: about to send data to "+url, "dataflow");

		this._hello_operator_give_me_procrasdonate(
			url,
			data,
			"POST",
			function(r) { //onsuccess
				self.pddb.orthogonals.log("pd.js::send_data: server says successfully processed "+r.process_success_count+" items", "dataflow");
			},
			function(r) { //onfailure
				self.pddb.orthogonals.log("pd.js::send_data: server says receiving data failed because "+r.reason, "dataflow");
			},
			function(r) { //onerror
				self.pddb.orthogonals.log("pd.js::send_data: communication error", "dataflow");
			}
		);
	},
	
	send_fake_data: function() {
		var self = this;
		
		var time_tracker = new TimeTracker(this.pddb, this.prefs);

		var totals = [];
		var now = _dbify_date(new Date());
		var url = "http://"+now+"/send_fake_data_test";
		this.pddb.SiteGroup.create_from_url(url, self.pddb.ProcrasDonate);
		
		var total_ids = time_tracker.store_visit(
			url,
			now,
			3600,
			this.pddb.Visit.TEST,
			this.pddb.Visit.TEST);
		
		_iterate(total_ids, function(key, value, index) {
			var t = self.pddb.Total.get_or_null({
				id: value,
				timetype_id: self.pddb.Daily.id
			});
			if (t) {
				totals.push(t.deep_dict());
			}
		});
		
		var data = {
			private_key: self.prefs.get('private_key', constants.DEFAULT_PRIVATE_KEY),
			prefs: JSON.stringify([self.prefs.get_all()]),
			totals: JSON.stringify(totals)
		}
		
		var url = constants.PD_API_URL + constants.SEND_DATA_URL;
		self.pddb.orthogonals.log("pd.js:: about to send fake data to "+url, "dataflow");

		this._hello_operator_give_me_procrasdonate(
			url,
			data,
			"POST",
			function(r) { //onsuccess
				self.pddb.orthogonals.log("pd.js::send_fake_data: server says successfully processed "+r.process_success_count+" items", "dataflow");
			},
			function(r) { //onfailure
				self.pddb.orthogonals.warn("pd.js::send_fake_data: server says receiving data failed because "+r.reason, "dataflow");
			},
			function(r) { //onerror
				self.pddb.orthogonals.warn("pd.js::send_fake_data: communication error", "dataflow");
			}
		);
	},

	/*
	 * 
	 * @requires: KlassName must have a datetime field
	 * 
	 * @param KlassName: eg UserStudy, Payment, Total, Log
	 * @param selectors: eg { datetime__gte: last_time }
	 * @param extract=data: function that takes a row and returns a dictionary representation
	 */
	_get_data: function(KlassName, extract_data, extra_selectors) {
		var last_time = this.prefs.get('time_last_sent_'+KlassName, 0);
		var new_last_time = last_time;
	
		var selectors = _extend({
			datetime__gte: last_time
		}, extra_selectors);
		
		var data = [];
		this.pddb[KlassName].select(selectors, function(row) {
			if (parseInt(row.datetime) > new_last_time) { new_last_time = parseInt(row.datetime) ; }
			data.push(extract_data(row));
		});
		
		this.prefs.set('time_last_sent_'+KlassName, new_last_time);
		return data;
	},
	
	_get_user_studies: function() {
		return this._get_data("UserStudy", function(row) {
			return row.deep_dict();
		});
	},
	
	_get_logs: function() {
		return this._get_data("Log", function(row) {
			return row.deep_dict();
		});
	},
	
	_get_payments: function() {
		return this._get_data("Payment", function(row) {
			return row.deep_dict();
		});
	},
	
	_get_requires_payments: function() {
		var data = [];
		this.pddb.RequiresPayment.select({}, function(row) {
			data.push( row.deep_dict() );
		});
		return data;
	},
	
	_get_reports: function() {
		var data = [];
		this.pddb.Report.select({}, function(row) {
			data.push( row.deep_dict() );
		});
		return data;
	},
	
	_get_totals: function() {
		var self = this;
		return this._get_data("Total", function(row) {
			var d = row.deep_dict();
			var week_total = self.pddb.Total.get_or_null({
				timetype_id: self.pddb.Weekly.id,
				contenttype_id: row.contenttype_id,
				content_id: row.content_id,
				datetime: _dbify_date(_end_of_week(_un_dbify_date(row.datetime)))
			});
			return _extend(d, {
				weekly_requires_payment: week_total && week_total.requires_payment_dict() || {},
				weekly_payments: week_total && week_total.payments_dict() || []
			});
		}, {
			timetype_id: this.pddb.Daily.id
		});
	},

	authorize_payments: function(onsuccess, onfailure, onerror) {
		var self = this;
		
		var data = {
			private_key: this.prefs.get('private_key', constants.DEFAULT_PRIVATE_KEY),
			globalAmountLimit: this.prefs.get('global_amount_limit', constants.DEFAULT_GLOBAL_AMOUNT_LIMIT),
            creditLimit: this.prefs.get('credit_limit', constants.DEFAULT_CREDIT_LIMIT),
            version: this.prefs.get('fps_version', constants.DEFAULT_FPS_CBUI_VERSION),
            paymentReason: this.prefs.get('payment_reason', constants.DEFAULT_PAYMENT_REASON),
		}
		
		var url = constants.PD_API_URL + constants.AUTHORIZE_PAYMENTS_URL;
		
		this._hello_operator_give_me_procrasdonate(
			url,
			data,
			"POST",
			onsuccess,
			onfailure,
			onerror
		);
	},
	
	send_welcome_email: function() {
		logger("send welcome email: "+this.prefs.get('email', constants.DEFAULT_EMAIL))
		this.make_request(
			constants.PD_API_URL + constants.SEND_WELCOME_EMAIL_URL,
			{
				email_address: this.prefs.get('email', constants.DEFAULT_EMAIL),
				private_key: this.prefs.get('private_key', constants.DEFAULT_PRIVATE_KEY)
			},
			"POST",
			function() {}
		);
	},
	
	send_regular_email: function() {
		
	},
	
    authorize_multiuse: function(onsuccess, onfailure) {
		var multi_auth = this.pddb.FPSMultiuseAuthorization.get_or_create({
			caller_reference: caller_reference
		}, {
			timestamp: _dbify_date(new Date()),
			global_amount_limit: this.prefs.get('fps_global_amount_limit', constants.DEFAULT_GLOBAL_AMOUNT_LIMIT),
			is_recipient_cobranding: _dbify_bool(true),
			payment_method: "ABT,ACH,CC",
			payment_reason: this.prefs.get('fps_payment_reason', constants.DEFAULT_PAYMENT_REASON),
			recipient_slug_list: "all",
			status: this.pddb.FPSMultiuseAuthorization.RESPONSE_NOT_RECEIVED
		});

		multi_auth = multi_auth.deep_dict();
		var data = _extend(multi_auth, {
			private_key: this.prefs.get('private_key', constants.DEFAULT_PRIVATE_KEY),
			version: this.prefs.get('fps_version', constants.DEFAULT_FPS_CBUI_VERSION)
		});

		//this.pddb.orthogonals.info("authorize_multiuse: "+JSON.stringify(multi_auth), "pd.js");
		this._hello_operator_give_me_procrasdonate(
			constants.PD_API_URL + constants.AUTHORIZE_MULTIUSE_URL,
			data,
			"POST",
			onsuccess,
			onfailure
		);
	},
	
	cancel_multiuse_token: function(reason_text, after_success, after_failure) {
		// after_failure should take r as parameter. after_success takes nothing.
		var self = this;
		// find success token
		var multiuse = self.pddb.FPSMultiuseAuthorization.get_latest_success();
		if (!multiuse) {
			// nothing to cancel
			return
		}
		
		this._hello_operator_give_me_procrasdonate(
			constants.PD_API_URL + constants.CANCEL_MULTIUSE_TOKEN_URL,
			{
				token_id: multiuse.token_id,
				reason_text: reason_text,
				private_key: this.prefs.get('private_key', constants.DEFAULT_PRIVATE_KEY),
				version: this.prefs.get('fps_version', constants.DEFAULT_FPS_API_VERSION),
				timestamp: _dbify_date(new Date())
			},
			"POST",
			function(r) {
				self.pddb.orthogonals.log("Successfully cancelled multiuse token", "multiuse token");
				
				// set token to canceleld
				self.pddb.FPSMultiuseAuthorization.set({
					token_id: "",
					status: self.pddb.FPSMultiuseAuthorization.CANCELLED,
				}, {
					id: multiuse.id
				});
				
				if (after_success) after_success();
			},
			function(r) {
				self.pddb.orthogonals.log("Failed to cancel multiuse token: "+r.reason, "multiuse token");
				if (after_failure) after_failure();
			}
		);
	},

	pay_multiuse: function(transaction_amount, recipient_slug, requires_payments, after_success, after_failure) {
		// 1. create payment
		// 2. create FPS Multiuse Pay
		// 3. link payment to all totals
		// 4. set requires payment to pending
		// 5. send FPS Multiuse Pay to server
		var self = this;
		
		transaction_amount = transaction_amount.toFixed(2);
		logger("PAY MULTIUSE recip_slug="+recipient_slug);
		
		var multiauth = this.pddb.FPSMultiuseAuthorization.get_latest_success();
		if (!multiauth || !multiauth.token_id) {
			self.pddb.orthogonals.log("User is not authorized to make payments: "+multiauth, "pay");
			return
		}
		
		var dtime = _dbify_date(new Date());
		
		// create payment
		var pay = self.pddb.Payment.create({
			payment_service_id: self.pddb.AmazonFPS.id,
			transaction_id: -1,
			sent_to_service: _dbify_bool(true),
			settled: _dbify_bool(false),
			total_amount_paid: transaction_amount,
			amount_paid: transaction_amount,
			amount_paid_in_fees: -1,
			amount_paid_tax_deductibly: -1,
			datetime: dtime
		});
		
		// create fps multiuse pay
		var fps_pay = this.pddb.FPSMultiusePay.create({
			timestamp: dtime,
			caller_reference: create_caller_reference(),
			//marketplace_fixed_fee: 0,
			marketplace_variable_fee: 10.00,
			transaction_amount: transaction_amount,
			recipient_slug: recipient_slug,
			sender_token_id: multiauth.token_id,
			transaction_status: self.pddb.FPSMultiuseAuthorization.PENDING,
			payment_id: pay.id
		});
		
		_iterate(requires_payments, function(key, value, index) {
			// set requires payment to pending = true
			var total = value.total();
			self.pddb.PaymentTotalTagging.create({
				total_id: total.id,
				payment_id: pay.id
			});
			// link payment with totals
			self.pddb.RequiresPayment.set({
				pending: _dbify_bool(true),
			}, {
				id: value.id
			});
		});

		// send fps multiuse auth to server
		var data = _extend(fps_pay.deep_dict(), {
			private_key: this.prefs.get('private_key', constants.DEFAULT_PRIVATE_KEY),
			version: this.prefs.get('fps_version', constants.DEFAULT_FPS_API_VERSION),
			timestamp: _dbify_date(new Date())
		});
		
		this._hello_operator_give_me_procrasdonate(
				constants.PD_API_URL + constants.PAY_MULTIUSE_URL,
				data,
				"POST",
				function(r) {
					// process returned pay object
					if (r.pay) {
						self.pddb.FPSMultiusePay.process_object(r.pay);
					}
					if (r.log) {
						self.pddb.orthogonals.log(r.log, "pay");
					} else {
						self.pddb.orthogonals.log("Successfully paid "+transaction_amount, "pay");
					}
					
					if (after_success) after_success();
				},
				function(r) {
					self.pddb.orthogonals.log("Failed to pay "+transaction_amount+": "+r.reason, "pay");
					if (after_failure) after_failure();
				}
			);
	},
	
	make_payments_if_necessary: function(ignore_threshhold) {
		var self = this;
		
		var prevent_payments = self.prefs.get('prevent_payments ', constants.DEFAULT_PREVENT_PAYMENTS);
		if (prevent_payments) {
			self.pddb.orthogonals.log("Aborted because prevent_payments flag is: "+prevent_payments, "make_payments")
			return 
		}
		
		var multiauth = this.pddb.FPSMultiuseAuthorization.get_latest_success();
		if (!multiauth || !multiauth.token_id) {
			self.pddb.orthogonals.log("User is not authorized to make payments: "+multiauth, "pay");
			return
		}
		
		// retry failed payments
		this.pddb.RequiresPayment.select({
			pending: _dbify_bool(true)
		}, function(row) {
			var total = row.total();
			// if total is not weekly, store visit did wrong thing
			if (total.timetype_id != self.pddb.Weekly.id) {
				self.pddb.orthogonals.warn("Total to pay is not weekly: requires_payment: "+row+" total="+total);
				return
			}
			// if total hasn't ended yet, data was corrupted (shouldn't have become pending!)
			if (_un_dbify_date(total.datetime) > new Date()) {
				self.pddb.orthogonals.warn("Total hasn't ended but requires payment is already pending: "+row+" total="+total);
				return
			}
			
			var recipient = total.recipient();
			// if recipient is null, this must be a site group total. ignore
			if (!recipient) {
				return
			}
			
			// if payment failed
			_iterate(total.payments(), function(key, payment, index) {
				var fps = payment.most_recent_fps_multiuse_pay()
				if (fps.error() || fps.failure()) {
					// try again to send fps multiuse auth to server
					var data = _extend(fps.deep_dict(), {
						private_key: this.prefs.get('private_key', constants.DEFAULT_PRIVATE_KEY),
						version: this.prefs.get('fps_version', constants.DEFAULT_FPS_API_VERSION),
						timestamp: _dbify_date(new Date())
					});
					this._hello_operator_give_me_procrasdonate(
						constants.PD_API_URL + constants.PAY_MULTIUSE_URL,
						data,
						"POST",
						function(r) {
							// process returned pay object
							if (r.pay) {
								self.pddb.FPSMultiusePay.process_object(r.pay);
							}
							if (r.log) {
								self.pddb.orthogonals.log(r.log, "pay");
							} else {
								self.pddb.orthogonals.log("Successfully paid "+transaction_amount, "pay");
							}
						},
						function(r) {
							self.pddb.orthogonals.log("Failed to pay "+transaction_amount+": "+r.reason, "pay");
						}
					);
				} else if (fps.pending() || fps.refund_initiated()) {
					// still waiting. do nothing.
				} else {
					// unexpected fps state
					self.pddb.orthogonals.warn("Unexpected FPS state when determining whether to retry pending requires payment: "+row+" total="+total+" payment="+payment+" fps="+fps);
				}
			});
		});
		
		// { recipient_slug: total_amount, ...}
		var recipient_total_amounts = {};
		
		//// we need these to prevent race conditions later when we
		//// set requires payments to pending and match totals to payment.
		//// just in case more totals and requires payments are created
		//// in middle of computation....unlikely, but just in case......
		// { recipient_slug: [requires_payment, ...] , ...}
		var recipient_requires_payments = {};
		
		this.pddb.RequiresPayment.select({
			pending: _dbify_bool(false)
		}, function(row) {
			var total = row.total();
			// if total is not weekly, store visit did wrong thing
			if (total.timetype_id != self.pddb.Weekly.id) {
				self.pddb.orthogonals.warn("Total to pay is not weekly: requires_payment: "+row+" total="+total);
				return
			}
			// if total hasn't ended yet, ignore
			if (_un_dbify_date(total.datetime) > new Date()) {
				return
			}
			
			var recipient = total.recipient();
			// if recipient is null, this must be a site group total. ignore
			if (!recipient) {
				return
			}
			
			// in dollars
			var amount = parseFloat(total.total_amount) / 100.00;
			
			var x = recipient_total_amounts[recipient.slug];
			if (!x) { recipient_total_amounts[recipient.slug] = 0; }
			recipient_total_amounts[recipient.slug] += amount;
			
			var x = recipient_requires_payments[recipient.slug];
			if (!x) { recipient_requires_payments[recipient.slug] = []; }
			recipient_requires_payments[recipient.slug].push(row);
		});
		
		var threshhold = self.prefs.get('payment_threshhold ', constants.DEFAULT_PAYMENT_THRESHHOLD);
		//logger("threshhold="+threshhold+" ignore="+ignore_threshhold);
		_iterate(recipient_total_amounts, function(key, value, index) {
			//logger(index+".\n key="+key+" \n value="+value);
			if (key && (ignore_threshhold || value >= threshhold)) {
				self.pay_multiuse(
					value,
					key,
					recipient_requires_payments[key],
					function() {
						// after success
					}, function() {
						// after_failure
					});
			}
		});
	},
	
	request_data_updates: function(after_success, after_failure) {
		// after_success should take one parameter:
		//    data object received from server
		var self = this;
		self.pddb.orthogonals.log("Requesting data updates from "+(constants.PD_API_URL + constants.RECEIVE_DATA_URL), "dataflow");
		
		var new_since = new Date();
		this._hello_operator_give_me_procrasdonate(
			constants.PD_API_URL + constants.RECEIVE_DATA_URL,
			{
				since: 0, // self.prefs.get('since_received_data', 0);
				private_key: this.prefs.get('private_key', constants.DEFAULT_PRIVATE_KEY),
			},
			"GET",
			function(r) {
				self.pddb.orthogonals.log("Successfully received data", "dataflow");
				
				_iterate(r.multiuse_auths, function(key, value, index) {
					self.pddb.FPSMultiuseAuthorization.process_object(value);
				});
				_iterate(r.multiuse_pays, function(key, value, index) {
					self.pddb.FPSMultiusePay.process_object(value);
				});
				_iterate(r.recipients, function(key, value, index) {
					self.pddb.Recipient.process_object(value);
				});
				
				var weekly_affirmations = _un_dbify_bool(self.prefs.get('weekly_affirmations', constants.DEFAULT_WEEKLY_AFFIRMATIONS));
				var org_thank_yous = _un_dbify_bool(self.prefs.get('org_thank_yous', constants.DEFAULT_ORG_THANK_YOUS));
				var org_newsletters = _un_dbify_bool(self.prefs.get('org_newsletters', constants.DEFAULT_ORG_NEWSLETTERS));
				_iterate(r.meta_reports, function(key, value, index) {
					self.pddb.Report.process_meta_report(value, weekly_affirmations, org_thank_yous, org_newsletters);
				});
				
                self.prefs.set("latest_update_version", r.latest_update_version);
				self.prefs.set("latest_update_link", r.update_link);
				self.prefs.set("latest_update_hash", r.update_hash);
				
				self.prefs.set('since_received_data', _dbify_date(new_since));
				self.pddb.orthogonals.log("Data successfully updated on "+new_since, "dataflow");
				if (after_success) {
					after_success(r);
				}
			},
			function(r) {
				self.pddb.orthogonals.log("Failed to received data from : "+(constants.PD_API_URL + constants.RECEIVE_DATA_URL)+" because "+r.reason, "dataflow");
				if (after_failure) after_failure();
			}
		);
	},

	/*
	 * Posts data to ProcrasDonate server
	 * @param url: url to post to 
	 * @param data: data structure. will not be JSON.stringify-ied
	 * @param onload: function to execute on success
	 * @param onerror: function to execute on error
	 */
	_hello_operator_give_me_procrasdonate: function(url, data, method, onsuccess, onfailure, onerror) {
		// make request
		this.make_request(
			url,
			data,
			method,
			function(r) {
				try {
					var response = eval("("+r.responseText+")");
					if (response.result == "success") {
						if (onsuccess) {
							onsuccess(response);
						}
					} else {
						if (onfailure) {
							onfailure(response);
						}
					}
				} catch (e) {
					logger("EXCEPTION: pd.js::RETURNED: "+r+"  e.stack: "+e.stack+"\n\n");
				}
			},
			onerror
		);
	},
	
});


/**************** content/js/models.js *****************/
/*
 * deep_dict: returns dictionary of fields 
 *   fetches <foo>_id fields via deep_dict()
 *   flattens some fields, eg <foo>.tag() returns tag.tag string
 *   calls _un_dbify_bool, _un_dbify_date, parseInt and parseFloat as appropriate.
 *         one day this could be automatic by sqlite3_firefox.
 *         would need to create DATE type that appeared as an INTEGER to sqlite
 *         but _un_dbified differently. Same for BOOL and INTEGER.
 *   
 * deep field instance methods never flatten. thus, <foo>() always returns a row factory
 */

function load_models(db, pddb) {
	
	var Site = new Model(db, "Site", {
		// Model metadata
		table_name: "sites",
		columns: {
			_order: ["id", "sitegroup_id", "url", "flash", "max_idle"],
			id: "INTEGER PRIMARY KEY",
			sitegroup_id: "INTEGER",
			url: "VARCHAR",
			flash: "INTEGER", // boolean
			max_idle: "INTEGER", // in seconds
		},
		indexes: []
	}, {
		// Instance methods
		tag: function() {
			// we expect a site to always have a tag (via its sitegroup)
			var sitegroup = this.sitegroup();
			return sitegroup.tag();
		},
		
		sitegroup: function(notrequired) {
			// we expect a site to always have a sitegroup
			var self = this;
			var sitegroup = SiteGroup.get_or_null({ 'id': self.sitegroup_id });
			if (!sitegroup) {
				if (notrequired) {
					return null;
				} else {
					pddb.orthogonals.error("no SiteGroup found for site = "+this);
				}
			}
			return sitegroup;
		},
		
		has_flash: function() {
			return _un_dbify_bool(this.flash)
		},
		
		deep_dict: function() {
			return {
				id: this.id,
				sitegroup: this.sitegroup().deep_dict(),
				url: this.url,
				tag: this.tag().tag,
				has_flash: this.has_flash(),
				max_idle: this.max_idle
			}
		}
		
	}, {
		// Model-class methods
		get_or_make: function(url, has_flash, max_idle, tag_id) {
			var site = this.get_or_null({url__eq: url});
			if (!tag_id) {
				tag_id = pddb.Unsorted.id;
			}
			if (!site) {
				var tag = Tag.get_or_null({ id: tag_id });
				var sitegroup = SiteGroup.create_from_url(url, tag);
	
				site = this.create({
					url: url,
					sitegroup_id: sitegroup.id,
					flash: _dbify_bool(has_flash),
					max_idle: max_idle || this.prefs.get("DEFAULT_MAX_IDLE")
				});
				return site
				
			} else {
				// overwrite flash and idle times if necessary
				if (site.has_flash() != has_flash || site.max_idle != max_idle) {
					this.set({
						flash: _dbify_bool(has_flash),
						max_idle: max_idle
					}, {
						url: url
					});
					return this.get_or_null({url__eq: url});
				} else {
					return site
				}
				
				/*if (site.has_flash() != has_flash || site.max_idle != max_idle) {
					logger("Site existed. did not override flash\n"+
							"existing site: "+site+
							"\nnew values: "+has_flash+" "+max_idle+" "+url);
				}*/
			}
		}
	});
	
	var SiteGroup = new Model(db, "SiteGroup", {
		table_name: "sitegroups",
		columns: {
			_order: ["id", "name", "host", "url_re", "tag_id", "tax_exempt_status"],
			id: "INTEGER PRIMARY KEY",
			name: "VARCHAR",
			host: "VARCHAR",
			url_re: "VARCHAR",
			tag_id: "INTEGER",
			tax_exempt_status: "INTEGER", // boolean 0=false
		},
		indexes: []
	}, {
		// instance methods
		tag: function() {
			// we expect a site to always have a tag (via its sitegroup)
			var self = this;
			var tag = Tag.get_or_null({ id: self.tag_id })
			if (!tag) {
				pddb.orthogonals.error("no Tag found for sitegroup = "+this);
			}
			return tag
		},
		
		has_tax_exempt_status: function() {
			return _un_dbify_bool(this.tax_exempt_status);
		},
		
		display_host: function() {
			return decodeURI(this.host);
		},
		
		deep_dict: function() {
			return {
				id: this.id,
				name: this.name,
				host: this.host,
				url_re: this.url_re,
				tag: this.tag().tag,
				tax_exempt_status: this.has_tax_exempt_status()
			}
		}
	}, {
		// class methods
		create_from_url: function(url, tag) {
			logger("create from url: "+url);
			if (!tag) { tag = pddb.Unsorted; }
			var host = decodeURI(_host(url));
			logger("  ---------- host --------- "+host);
			var sitegroup = SiteGroup.get_or_create({
				host: host
			}, {
				name: decodeURI(host),
				host: host,
				tag_id: tag.id
			});
			logger("  sitegroup="+sitegroup);
			return sitegroup
		},
		
		get_from_url: function(url) {
			var host = _host(url);
			var sitegroup = SiteGroup.get_or_null({
				host: host
			});
			return sitegroup
		}
	});
	
	var Recipient = new Model(db, "Recipient", {
		table_name: "recipients",
		columns: {
			_order: ["id", "slug", "name", "category_id", "mission",
			         "description", "url", "logo", "logo_thumbnail",
			         "twitter_name", "facebook_name", 
			         "is_visible", "pd_registered", "tax_exempt_status"],
			id: "INTEGER PRIMARY KEY",
			slug: "VARCHAR",
			name: "VARCHAR",
			category_id: "INTEGER",
			mission: "VARCHAR",
			description: "VARCHAR", // allows full Markdown markup
			url: "VARCHAR",
			logo: "VARCHAR", // url to img uploaded onto server
			logo_thumbnail: "VARCHAR", // url to img uploaded onto server
			twitter_name: "VARCHAR",
			facebook_name: "VARCHAR",
			is_visible: "INTEGER", // boolean 0=false
			pd_registered: "INTEGER", // boolean 0=false
			tax_exempt_status: "INTEGER", // boolean 0=false
		},
		indexes: []
	}, {
		// instance methods
		category: function() {
			var self = this;
			var category = Category.get_or_null({ id: self.category_id })
			if (!category) {
				pddb.orthogonals.error("no Category found for recipient = "+this);
			}
			return category
		},
		
		recipient_percent: function() {
			// return recipient percent object or null
			var self = this;
			return RecipientPercent.get_or_null({ recipient_id: self.id });
		},
		
		has_tax_exempt_status: function() {
			return _un_dbify_bool(this.tax_exempt_status);
		},
		
		bool_is_visible: function() {
			return _un_dbify_bool(this.is_visible);
		},
		
		is_pd_registered: function() {
			return _un_dbify_bool(this.pd_registered);
		},
		
		deep_dict: function() {
			return {
				id: this.id,
				slug: this.slug,
				name: this.name,
				category: this.category().category,
				mission: this.mission,
				description: this.description,
				url: this.url,
				logo: this.logo,
				logo_thumbnail: this.logo_thumbnail,
				twitter_name: this.twitter_name,
				facebook_name: this.facebook_name,
				is_visible: _un_dbify_bool(this.is_visible),
				pd_registered: _un_dbify_bool(this.pd_registered),
				tax_exempt_status: this.has_tax_exempt_status(),
			}
		},
		
		html_description: function() {
			// allows full Markdown markup
			return (new Showdown.converter()).makeHtml(this.description)
		}
	}, {
		// class methods
		process_object: function(r, last_receive_time, return_row) {
			// @param r: object from server. json already loaded
			// @param last_receive_time: time last received data. 
			//		if r.last_modified is older than last receive time,
			//		only add row if doesn't exist. no need to overwrite data.
			// @param return_row: if true, will return the created row
			// @return: if return_row, returns created row
		
			last_modified = new Date(r.last_modified);
			var recipient = Recipient.get_or_null({
				slug: r.slug
			});
			if (last_receive_time &&
					last_receive_time > last_modified &&
					recipient) {
				return null
			} // else, unknown or modified recipient
			
			var category = Category.get_or_create({
				category: r.category
			});
			
			if (recipient) {
				Recipient.set({
					name: r.name,
					category_id: category.id,
					mission: r.mission,
	                description: r.description,
	                url: r.url,
	                logo: r.logo,
	                logo_thumbnail: r.logo_thumbnail,
	                twitter_name: r.twitter_name,
	                facebook_name: r.facebook_name,
	                is_visible: _dbify_bool(r.is_visible),
	                pd_registered: _dbify_bool(r.pd_registered),
	                tax_exempt_status: _dbify_bool(r.tax_exempt_status),
				}, {
					slug: r.slug
				});
			} else {
				Recipient.create({
					slug: r.slug,
					name: r.name,
					category_id: category.id,
					mission: r.mission,
	                description: r.description,
	                url: r.url,
	                logo: r.logo,
	                logo_thumbnail: r.logo_thumbnail,
	                twitter_name: r.twitter_name,
	                facebook_name: r.facebook_name,
	                is_visible: _dbify_bool(r.is_visible),
	                pd_registered: _dbify_bool(r.pd_registered),
	                tax_exempt_status: _dbify_bool(r.tax_exempt_status),
				});
			}
			
			if (return_row) {
				return Recipient.get_or_create({
					slug: r.slug
				});
			}
		}
	});
	
	var Report = new Model(db, "Report", {
		table_name: "reports",
		columns: {
			_order: ["id", "datetime", "type", "message", "read", 
			         "sent", "subject", "recipient_id",
			         "met_goal", "difference", "seconds_saved"],
			id: "INTEGER PRIMARY KEY",
			datetime: "INTEGER", //"DATETIME",
			type: "VARCHAR", // 
			message: "VARCHAR", // allows full Markdown markup
			read: "INTEGER", // bool
			sent: "INTEGER", // bool
			subject: "VARCHAR",
			// points to recipient for thankyous and newsletters
			// otherwise points to ProcrasDonate recipient
			recipient_id: "INTEGER", 
			
			// these only make sense for weekly reports
			met_goal: "INTEGER", // bool
			difference: "INTEGER", // seconds
			seconds_saved: "INTEGER", // seconds
		},
		indexes: []
	}, {
		// instance methods
		is_weekly: function() { return this.type == Report.WEEKLY },
		is_welcome: function() { return this.type == Report.WELCOME },
		is_announcement: function() { return this.type == Report.ANNOUNCEMENT },
		is_thankyou: function() { return this.type == Report.THANKYOU },
		is_newsletter: function() { return this.type == Report.NEWSLETTER },
		is_tax: function() { return this.type == Report.TAX },
		
		/** read by user via our website */
		is_read: function() {
			return _un_dbify_bool(this.read)
		},
		/** emailed to user */
		is_sent: function() {
			return _un_dbify_bool(this.sent)
		},
		has_met_goal: function() {
			return _un_dbify_bool(this.met_goal)
		},
		
		friendly_datetime: function() {
			return _un_dbify_date(this.datetime).strftime("%b %d, %Y")
		},
		
		recipient: function() {
			return Recipient.get_or_null({ id: this.recipient_id })
		},
		
		// currently not used. generated reports already include html.
		html_message: function() {
			// allows full Markdown markup
			return 
		},
		
		deep_dict: function() {
			return {
				id: this.id,
				datetime: this.datetime,
				type: this.type,
				subject: this.subject,
				message: this.message,
				recipient: this.recipient(),
				is_read: this.is_read(),
				is_sent: this.is_sent(),
				has_met_goal: this.has_met_goal(),
				difference: this.difference,
				seconds_saved: this.seconds_saved
			}
		}
	}, {
		// class methods
		WEEKLY: "weekly", // weekly affirmations
		WELCOME: "welcome", // welcome message - deprecated in 0.3.7, to be removed 0.3.8
		ANNOUNCEMENT: "announcement", // ProcrasDonate announcement
		THANKYOU: "thankyou", // charity (org) thank you
		NEWSLETTER: "newsletter", // charity (org) newsletter (quarterly or yearly)
		TAX: "tax", // tax-deductible report
		
		/**
		 * 
		 * @param r: object from server. json already loaded
		 */
		process_meta_report: function(r, weekly_affirmations, org_thank_yous, org_newsletters) {
			var is_weekly = (r.type == Report.WEEKLY); // unexpected
			var is_announcement = (r.type == Report.ANNOUNCEMENT);
			var is_thankyou = (r.type == Report.THANKYOU); // also unexpected for now
			var is_newsletter = (r.type == Report.NEWSLETTER);
			
			if (is_weekly) { return } // unexpected
			if (is_thankyou && !org_thank_yous) { return }
			if (is_newsletter && !org_newsletters) { return }
			if (is_announcement && r.recipient_slug != "PD") {
				pddb.orthogonals.log("Expect announcements from PD only", "dataflow");
			}
			
			var recipient = Recipient.get_or_null({ slug: r.recipient_slug });
			if (!recipient) { return }
			
			// only receive newsletters and thankyous for
			// recipients currently donating to (even if percent is 0)
			if (is_newsletter || is_thankyou) {
				if (!RecipientPercent.get_or_null({ recipient_id: recipient.id })) {
					return
				}
			}
			
			var report = Report.get_or_null({
				datetime: _dbify_date(new Date(r.datetime)),
				type: r.type,
				recipient_id: recipient.id
			});
			if (!report) {
				Report.create({
					message: (new Showdown.converter()).makeHtml(r.message),
					subject: r.subject,
	                type: r.type,
	                recipient_id: recipient.id,
	                sent: _dbify_bool(false),
	                read: _dbify_bool(false),
	                datetime: _dbify_date(new Date(r.datetime))
				});
			}
		},
		
		latest: function() {
			var latest = null;
			Report.select({}, function(row) {
				if (!latest) { latest = row; }
			}, "-datetime");
			return latest;
		}
		
	});
	
	// recipient has 1 category
	var Category = new Model(db, "Category", {
		table_name: "categories",
		columns: {
			_order: ["id", "category"],
			id: "INTEGER PRIMARY KEY",
			category: "VARCHAR"
		},
		indexes: []
	}, {
		// instance methods
	}, {
		// class methods
	});
	
	var RecipientPercent = new Model(db, "RecipientPercent", {
		table_name: "recipientpercents",
		columns: {
			_order: ["id", "recipient_id", "percent"],
			id: "INTEGER PRIMARY KEY",
			recipient_id: "INTEGER",
			percent: "REAL" // 100% = 1
		},
		indexes: []
	}, {
		// instance methods
		recipient: function() {
			// we expect a RecipientPercent to always have a recipient
			var self = this;
			var recipient = Recipient.get_or_null({ id: self.recipient_id })
			if (!recipient) {
				pddb.orthogonals.error("no Recipient found for recipientpercent = "+this);
			}
			return recipient
		},
		
		display_percent: function() {
			return Math.round(parseFloat(this.percent) * 100)
		},
		
		deep_dict: function() {
			return {
				id: this.id,
				recipient: this.recipient().deep_dict(),
				percent: parseFloat(this.percent),
			}
		}
	}, {
		// class methods
		process_object: function(r) {
			// @param r: object from server. json already loaded
			// contains recipient_slug and percent
			var recipient = Recipient.get_or_null({ slug: r.recipient_slug });
			if (recipient) {
				var rpct = RecipientPercent.get_or_create({
					recipient_id: recipient.id
				}, {
					percent: r.percent
				});
			} else {
				pddb.orthogonals.log("Unable to process RecipientPercent "+r+" because unknown recipient", "dataflow");
			}
		}
	});
	
	// sitegroup has 1 tag
	var Tag = new Model(db, "Tag", {
		table_name: "tags",
		columns: {
			_order: ["id", "tag"],
			id: "INTEGER PRIMARY KEY",
			tag: "VARCHAR"
		},
		indexes: []
	}, {
		// instance methods
		icon: function() {
			if (this.id == pddb.ProcrasDonate.id) {
				return constants.MEDIA_URL+"img/ToolbarImages/ProcrasDonateIcon.png"
			} else if (this.id == pddb.TimeWellSpent.id) {
				return constants.MEDIA_URL+"img/ToolbarImages/TimeWellSpentIcon.png"
			} else if (this.id == pddb.Unsorted.id) {
				return constants.MEDIA_URL+"img/ToolbarImages/UnsortedIcon.png"
			} else {
				return ""
			}
		}
	}, {
		// class methods
	});
	
	/*
	var SiteGroupTagging = new Model(db, "SiteGroupTagging", {
		table_name: "sitegrouptaggings",
		columns: {
			_order: ["id", "sitegroup_id", "tag_id"],
			id: "INTEGER PRIMARY KEY",
			sitegroup_id: "INTEGER",
			tag_id: "INTEGER"
		},
		indexes: []
	});
	*/
	
	var Visit = new Model(db, "Visit", {
		table_name: "visits",
		columns: {
			_order: ["id", "site_id", "enter_at", "duration", "enter_type", "leave_type"],
			id: "INTEGER PRIMARY KEY",
			site_id: "INTEGER",
			enter_at: "INTEGER", //"DATETIME",
			duration: "INTEGER", //seconds
			enter_type: "VARCHAR", // trigger that began visit
			leave_type: "VARCHAR", // trigger that ended visit
		},
		indexes: []
	}, {
		site: function() {
			// we expect a Visit to always have a site
			var self = this;
			var site = Site.get_or_null({ id: self.site_id })
			if (!site) {
				pddb.orthogonals.error("no Site found for visit = "+this);
			}
			return site
		},
		
		enter_at_display: function() {
			return _un_dbify_date(this.enter_at).strftime("%b %d, %Y %H:%M:%S");
		},
		
		duration_display: function() {
			var s = parseInt(this.duration);
			var hrs = Math.floor(s / 3600);
			var mins = Math.floor((s % 3600) / 60);
			var secs = (s % 3600) % 60;
			var ret = "";
			if (hrs > 0) {
				var d = (s / 3600).toFixed(1);
				if (d > 1.0) { ret = d + " hrs"; }
				else { ret = d + " hr"; }
			} else if (mins > 0) {
				if (mins < 10) { ret += "0"; }
				ret += mins + " m, ";
				if (secs < 10) { ret += "0"; }
				ret += secs + " s";
			} else {
				if (secs > 1) { ret += secs + " secs"; }
				else { ret += secs + " sec"; }
			}
			return ret;
		},

		enter_type_display: function() {
			return this.type_display(this.enter_type);
		},
		
		leave_type_display: function() {
			return this.type_display(this.leave_type);
		},
			
		type_display: function(type) {
			switch(type) {
			case(Visit.IDLE_NOFLASH):
				return "Idle on page without flash"
			case(Visit.IDLE_FLASH):
				return "Idle on page with flash"
			case(Visit.BACK):
				return "Back from being idle"
			case(Visit.CLOSE):
				return "Quit Firefox"
			case(Visit.CLOSE_TAB):
				return "Close tab"
			case(Visit.CLOSE_WINDOW):
				return "Close window"
			case(Visit.OPEN):
				return "Opened Firefox"
			case(Visit.BLUR):
				return "Changed to another application from Firefox"
			case(Visit.FOCUS):
				return "Changed to Firefox from another application"
			case(Visit.SLEEP):
				return "Computer went to sleep"
			case(Visit.WAKE):
				return "Computer woke up"
			case(Visit.URL):
				return "Viewing new url"
			case(Visit.URL_TAB):
				return "Changed tab"
			case(Visit.URL_WINDOW):
				return "Changed windows"
			case(Visit.URL_LINK):
				return "Clicked on a link"
			case(Visit.URL_BAR):
				return "Entered new URL into address bar"
			case(Visit.UNKNOWN):
				return "Unknown"
			case(Visit.TEST):
				return "Test"
			default:
				return "-"
			}
		},
		
		deep_dict: function() {
			return {
				id: this.id,
				site: this.site().deep_dict(),
				enter_at: _un_dbify_date(this.enter_at),
				duration: parseInt(this.duration),
				enter_type: this.enter_type,
				leave_type: this.leave_type
			}
		}
	}, {
		// class methods
		
		// types
		UNKNOWN: "K",
		
		IDLE_NOFLASH: "IN", // computer detects idle user, no flash on page
		IDLE_FLASH: "IF", // computer detects idle user
		BACK: "B",
		
		CLOSE: "C", // quit FF
		CLOSE_TAB: "CT", // swith to a new tab
		CLOSE_WINDOW: "CW", // switch to a new window
		OPEN: "O", // open FF
		
		BLUR: "BL", // switch to different application
		FOCUS: "FO", // come back
		
		SLEEP: "S", // computer goes to sleep
		WAKE: "W", // computer wakes up
		
		URL: "U", // visit new url; could be by loading new page or switching tabs/windows
		//// don't have the granularity for these
		URL_TAB: "UT", // swith to a new tab
		URL_WINDOW: "UW", // switch to a new window
		URL_LINK: "UL", // click a link
		URL_BAR: "UB", // type/paste a new url into the url bar
		
		TEST: "T", // created by a test
		
		by_tag: function(tag_id) {
			//SELECT  Artists.ArtistName, CDs.Title FROM Artists INNER JOIN CDs ON Artists.ArtistID=CDs.ArtistID; 
		}
	});
	
	// Aggregates visits in different ways
	// Crosses different model slices (tags, recipients, sites, sitegroups)
	// with different time spans (daily, weekly, forever)
	var Total = new Model(db, "Total", {
		table_name: "totals",
		columns: {
			_order: ["id","contenttype_id", "content_id", "total_time", 
			         "total_amount", "datetime", "timetype_id"],
			         
			id: "INTEGER PRIMARY KEY",

			// generic table
			contenttype_id: "INTEGER",
			// id of row in generic table
			content_id: "INTEGER",
			
			total_time: "INTEGER", //seconds
			total_amount: "REAL", //cents
			datetime: "INTEGER", //"DATETIME"
			timetype_id: "INTEGER"
		}
	}, {
		dollars: function() {
			return parseFloat(this.total_amount) / 100.0;
		},
		
		hours: function() {
			return parseFloat(this.total_time) / (60*60);
		},
		
		hours_int: function() {
			return Math.round( parseFloat(this.total_time) / (60*60) );
		},
		
		// instance methods
		contenttype: function() {
			// all Totals have a contenttype
			var self = this;
			var contenttype = ContentType.get_or_null({ id: self.contenttype_id });
			if (!contenttype) {
				pddb.orthogonals.error("no contenttype found for total = "+this);
			}
			return contenttype
		},
		
		cached_content: null,
		content: function() {
			// all Totals have a content
			var self = this;
			if (!self.cached_content) {
				var content = pddb[self.contenttype().modelname].get_or_null({ id: self.content_id });
				if (!content) {
					pddb.orthogonals.error("no content found for total = "+self);
				} else {
					self.cached_content = content;
				}
			}
			return self.cached_content;
		},
		
		recipient: function() {
			// @returns Recipient row factory or null if not Recipient contenttype
			if (this.contenttype().modelname == "Recipient") {
				return this.content();
			}
			return null;
		},
		
		site: function() {
			// @returns Site row factory or null if not Site contenttype
			if (this.contenttype().modelname == "Site") {
				return this.content();
			}
			return null;
		},
		
		sitegroup: function() {
			// @returns SiteGroup row factory or null if not SiteGroup contenttype
			if (this.contenttype().modelname == "SiteGroup") {
				return this.content();
			}
			return null;
		}, 
		
		tag: function() {
			// @returns Tag row factory or null if not Tag contenttype
			if (this.contenttype().modelname == "Tag") {
				return this.content();
			}
			return null;
		},
		
		timetype: function() {
			// all Totals have a timetype
			var self = this;
			var timetype = pddb.TimeType.get_or_null({ id: self.timetype_id });
			if (!timetype) {
				pddb.orthogonals.error("no timetype found for total = "+this);
			}
			return timetype
		},
		
		friendly_datetime: function() {
			return _un_dbify_date(this.datetime).strftime("%b %d, %Y")
		},
		
		_payments: function(deep_dictify) {
			// Totals may have Payments
			// @returns list of Payment row factories
			// @param deep_dictify: if true, returns dicts instead of row objects
			var self = this;
			var payments = [];
			PaymentTotalTagging.select({ total_id: self.id }, function(row) {
				if (deep_dictify) {
					payments.push(row.payment().deep_dict());
				} else {
					payments.push(row.payment());
				}
			});
			return payments
		},
		
		payments: function() {
			return this._payments(false);
		},
		
		payments_dict: function() {
			return this._payments(true);
		},
		
		requires_payment: function() {
			var self = this;
			return RequiresPayment.get_or_null({ total_id: self.id });
		},
		
		requires_payment_dict: function() {
			var rp = this.requires_payment();
			if (rp) {
				return {
					partially_paid: rp.is_partially_paid(),
					pending: rp.is_pending()
				}
			} else {
				return {}
			}
		},
		
		deep_dict: function() {
			/*
			 * Extracts foreign keys.
			 * @return dictionary, not a row factory
			 */
			return {
				id: this.id,
				contenttype: this.contenttype().modelname,
				content: this.content().deep_dict(),
				total_time: parseInt(this.total_time),
				total_amount: parseFloat(this.total_amount),
				datetime: parseInt(this.datetime),
				timetype: this.timetype().timetype,
				payments: this.payments_dict(),
				requires_payment: this.requires_payment_dict()
			}
		}
	}, {
		// class methods
	});
	
	
	var PaymentService = new Model(db, "PaymentService", {
		table_name: "paymentservices",
		columns: {
			_order: ["id", "name", "user_url"],
			id: "INTEGER PRIMARY KEY",
			name: "VARCHAR",
			user_url: "VARCHAR"
		}
	}, {
		// instance methods
	}, {
		// class methods
	});
	
	// if balance can only partially cover payment, 
	// then two payments will be created for total.
	// one will be paid, one will be unpaid (initially)
	var Payment = new Model(db, "Payment", {
		table_name: "payments",
		columns: {
			_order: ["id", "payment_service_id", "transaction_id",
			         "sent_to_service", "settled",
			         "total_amount_paid", "amount_paid",
			         "amount_paid_in_fees", "amount_paid_tax_deductibly",
			         "datetime"],
			id: "INTEGER PRIMARY KEY",
			payment_service_id: "INTEGER",
			transaction_id: "INTEGER",
			sent_to_service: "INTEGER", // boolean 0=false
			settled: "INTEGER", // boolean 0=false
			total_amount_paid: "REAL",
			amount_paid: "REAL",
			amount_paid_in_fees: "REAL",
			amount_paid_tax_deductibly: "REAL",
			datetime: "INTEGER" //"DATETIME"
		}
	}, {
		// instance methods
		payment_service: function() {
			// all Payment have a payment_service
			var self = this;
			var payment_service = PaymentService.get_or_null({ id: self.payment_service_id });
			if (!payment_service) {
				pddb.orthogonals.error("no payment_service found for payment = "+this);
			}
			return payment_service
		},
		
		is_sent_to_service: function() {
			return _un_dbify_bool(this.sent_to_service);
		},
		
		is_settled: function() {
			return _un_dbify_bool(this.settled);
		},
		
		deep_dict: function() {
			return {
				id: this.id,
				payment_service: this.payment_service(),
				transaction_id: parseInt(this.transaction_id),
				sent_to_service: this.is_sent_to_service(),
				settled: this.is_settled(),
				total_amount_paid: parseFloat(this.total_amount_paid),
				amount_paid: parseFloat(this.amount_paid),
				amount_paid_in_fees: parseFloat(this.amount_paid_in_fees),
				amount_paid_tax_deductibly: parseFloat(this.amount_paid_tax_deductibly),
				datetime: _un_dbify_date(this.datetime)
			}
		},
		
		_totals: function(deep_dictify) {
			// Payments may have Totals
			// @returns list of Totals row factories
			// @param deep_dictify: if true, returns dicts instead of row objects
			var self = this;
			var totals = [];
			PaymentTotalTagging.select({ payment_id: self.id }, function(row) {
				if (deep_dictify) {
					totals.push(row.total().deep_dict());
				} else {
					totals.push(row.total());
				}
			});
			return totals
		},
		
		totals: function() {
			return this._totals(false);
		},
		
		totals_dicts: function() {
			return this._totals(true);
		},
		
		fps_multiuse_pays: function() {
			var self = this;
			var pays = [];
			FPSMultiusePay.select({ payment_id: self.id }, function(row) {
				pays.push(row);
			});
			return pays;
		},
		
		most_recent_fps_multiuse_pay: function() {
			var self = this;
			var pay = null;
			FPSMultiusePay.select({ payment_id: self.id }, function(row) {
				if (!pay) { pay = row; }
			}, "-timestamp");
			return pay
		}
		
	}, {
		// class methods
	});
	
	/*
	 * Index of totals that require Payments-- that is, no PaymentTotalTagging
	 * exists yet.
	 * 
	 * Currently, payments are only made for yesterday and older totals. This
	 * means that we expect partially_paid to always be false.
	 * 
	 * RequiresPayment are attached to Totals upon creation.
	 * Whenever payments are made, that's when PaymentTotalTaggings are created.
	 * When a PaymentTotalTagging is created. As long as the Total is more than a day old,
	 * that means it won't change, and that means we won't pay it only to have that amount 
	 * become a partial payment. Thus, when a PaymentTotalTagging is created (and
	 * of course the corresponding Payment), the RequiresPayment can be deleted. 
	 */
	var RequiresPayment = new Model(db, "RequiresPayment", {
		table_name: "requirespayments",
		columns: {
			_order: ["id", "total_id", "partially_paid", "pending"],
			
			id: "INTEGER PRIMARY KEY",
			total_id: "INTEGER",
			partially_paid: "INTEGER", // boolean 0=false
			pending: "INTEGER" // boolean 0=false
		}
	}, {
		// instance methods
		total: function() {
			// all RequiresPayment have a total
			var self = this;
			var total = Total.get_or_null({ id: self.total_id });
			if (!total) {
				pddb.orthogonals.error("no total found for RequiresPayment = "+this);
			}
			return total
		},
		
		// returns boolean value
		is_partially_paid: function() {
			return _un_dbify_bool(this.partially_paid)
		},
		
		// returns boolean value
		is_pending: function() {
			return _un_dbify_bool(this.pending)
		},
	
		deep_dict: function() {
			return {
				id: this.id,
				total: this.total().deep_dict(),
				partially_paid: this.is_partially_paid(),
				pending: this.is_pending()
			}
		}
	}, {
		// class methods
		
		///
		/// Applies fn to all requirespayments that are partially paid
		/// @param fn: function that takes a row
		///
		partially_paids: function(fn) {
			this.select({
				partially_paid: _dbify_bool(true)
			}, fn);
		},
		
		// @returns count of partially paid totals
		partially_paids_count: function() {
			var count = 0
			this.select({
				partially_paid: _dbify_bool(true)
			}, function(row) {
				count += 1;
			});
			return count
		}
	});
	
	var PaymentTotalTagging = new Model(db, "PaymentTotalTagging", {
		table_name: "paymenttotaltagging",
		columns: {
			_order: ["id", "payment_id", "total_id"],
			id: "INTEGER PRIMARY KEY",
			payment_id: "INTEGER",
			total_id: "INTEGER"
		},
		indexes: []
	}, {
		// instance methods
		total: function() {
			// we expect a PaymentTotalTagging to always have a total
			var self = this;
			var total = Total.get_or_null({ id: self.total_id })
			if (!total) {
				pddb.orthogonals.error("no Total found for PaymentTotalTagging = "+this);
			}
			return total
		},
		
		payment: function() {
			// we expect a PaymentTotalTagging to always have a payment
			var self = this;
			var payment = Payment.get_or_null({ id: self.payment_id })
			if (!payment) {
				pddb.orthogonals.error("no payment found for PaymentTotalTagging = "+this);
			}
			return payment
		}
	}, {
		// class methods
	});
	
	
	// eg: daily, weekly or forever
	var TimeType = new Model(db, "TimeType", {
		table_name: "timetypes",
		columns: {
			_order: ["id", "timetype"],
			id: "INTEGER PRIMARY KEY",
			timetype: "VARCHAR"
		},
		indexes: []
	}, {
		// instance methods
	}, {
		// class methods
	});
	
	var ContentType = new Model(db, "ContentType", {
		table_name: "contenttypes",
		columns: {
			_order: ["id", "modelname"],
			id: "INTEGER PRIMARY KEY",
			modelname: "VARCHAR"
		}
	}, {
		// instance methods
	}, {
		// class methods
	});

	var Log = new Model(db, "Log", {
		table_name: "logs",
		columns: {
			_order: ["id", "datetime", "type", "detail_type", "message"],
			id: "INTEGER PRIMARY KEY",
			datetime: "INTEGER", //"DATETIME"
			type: "VARCHAR",
			detail_type: "VARCHAR",
			message: "VARCHAR"
		}
	}, {
		// instance methods
	}, {
		// class methods
	});

	var UserStudy = new Model(db, "UserStudy", {
		table_name: "userstudies",
		columns: {
			_order: ["id", "datetime", "type", "message", "quant"],
			id: "INTEGER PRIMARY KEY",
			datetime: "INTEGER", //"DATETIME"
			type: "VARCHAR",
			message: "VARCHAR",
			quant: "REAL"
		}
	}, {
		// instance methods
	}, {
		// class methods
	});
	
	var FPSMultiuseAuthorization = new Model(db, "FPSMultiuseAuthorization", {
		table_name: "fpsmultiuseauthorizations",
		columns: {
			_order: ["id", "timestamp", "caller_reference", "global_amount_limit",
			         "is_recipient_cobranding", "payment_method", "payment_reason",
			         "recipient_slug_list", "expiry",
			         "status", "token_id", "error_message"],
			id: "INTEGER PRIMARY KEY",
			timestamp: "INTEGER", //"DATETIME"
			caller_reference: "VARCHAR",
			global_amount_limit: "VARCHAR",
			is_recipient_cobranding: "INTEGER", //BOOLEAN 0=false
			payment_method: "VARCHAR",
			payment_reason: "VARCHAR",
			recipient_slug_list: "VARCHAR",
			expiry: "VARCHAR",
			
			status: "VARCHAR", // 
			token_id: "VARCHAR",
			error_message: "VARCHAR"
		}
	}, {
		// instance methods
		success_abt: function() { return this.status == FPSMultiuseAuthorization.SUCCESS_ABT },
		success_ach: function() { return this.status == FPSMultiuseAuthorization.SUCCESS_ACH },
		success_cc: function() { return this.status == FPSMultiuseAuthorization.SUCCESS_CC },
		system_error: function() { return this.status == FPSMultiuseAuthorization.SYSTEM_ERROR },
		aborted: function() { return this.status == FPSMultiuseAuthorization.ABORTED },
		caller_error: function() { return this.status == FPSMultiuseAuthorization.CALLER_ERROR },
		payment_method_error: function() { return this.status == FPSMultiuseAuthorization.PAYMENT_METHOD_ERROR },
		payment_error: function() { return this.status == FPSMultiuseAuthorization.PAYMENT_ERROR },
		developer_error: function() { return this.status == FPSMultiuseAuthorization.DEVELOPER_ERROR },
		response_not_received: function() { return this.status == FPSMultiuseAuthorization.RESPONSE_NOT_RECEIVED },
		response_error: function() { return this.status == FPSMultiuseAuthorization.RESPONSE_ERROR },
		cancelled: function() { return this.status == FPSMultiuseAuthorization.CANCELLED },
		expired: function() { return this.status == FPSMultiuseAuthorization.EXPIRED },
		
		good_to_go: function() {
			return this.success_abt() || this.success_ach() || this.success_cc();
		},
		
		error: function() {
			return this.system_error() || this.caller_error() || this.response_error() ||
				this.payment_error() || this.developer_error() || this.payment_method_error()
		},
		
		deep_dict: function() {
			return {
				id: this.id,
				timestamp: _un_dbify_date(this.timestamp),
				caller_reference: this.caller_reference,
				global_amount_limit: this.global_amount_limit,
				is_recipient_cobranding: _un_dbify_bool(this.is_recipient_cobranding),
				payment_method: this.payment_method,
				payment_reason: this.payment_reason,
				recipient_slug_list: this.recipient_slug_list,
				status: this.status,
				token_id: this.token_id,
				error_message: this.error_message,
			}
		},
		
	}, {
		// class methods
		SUCCESS_ABT: 'SA', // success for Amazon account payment method
		SUCCESS_ACH: 'SB', // success for bank account payment method
        SUCCESS_CC: 'SC', // success for credit card payment method
        SYSTEM_ERROR: 'SE',
        ABORTED: 'A', // buyer aborted pipeline
        CALLER_ERROR: 'CE',
        PAYMENT_METHOD_ERROR: 'PE', // buyer does not have payment method requested
        PAYMENT_ERROR: 'NP',
        DEVELOPER_ERROR: 'NM',
        RESPONSE_NOT_RECEIVED: '0',
        RESPONSE_ERROR: '1',
        CANCELLED: 'C',
        EXPIRED: 'EX',
        
        most_recent: function() {
			// iterate over rows in timestamp order and return the most recent one
			// return null if no rows
			var ret = [];
			FPSMultiuseAuthorization.select({}, function(row) {
				ret.push(row);
			}, "-timestamp");
			
			if (ret.length > 0) {
				return ret[0];
			} else {
				return null;
			}
		},
		
		get_latest_success: function() {
			var success = null;
			FPSMultiuseAuthorization.select({}, function(row) {
				if (row.good_to_go() && !success) {
					success = row;
				}
			}, "-timestamp");
			return success;
		},
		
		has_success: function() {
			// iterate over tokens and return true if found successful one
			var ret = false;
			FPSMultiuseAuthorization.select({}, function(row) {
				if (row.good_to_go()) {
					ret = true
				}
			});
			return ret;
		},
		
		process_object: function(ma) {
			// @param ma: object from server. json already loaded
			// @return: {diff: true or false if status changed,
			//           multi_auth: multi auth row}
			// incoming timestampe are from self.timestamp.ctime():
			//              Sat Sep 19 14:42:25 2009
			// the above string can transformed to dates with new Date(ctimestr)
			//
			// not this, which is "%s" % self.timestamp -->2009-09-19 14:38:03.799905
			var multi_auth = FPSMultiuseAuthorization.get_or_null({
				caller_reference: ma.caller_reference
			});
			if (!multi_auth) {
				multi_auth = FPSMultiuseAuthorization.create({
	                timestamp: _dbify_date(new Date(ma.timestamp)),
	                payment_reason: ma.payment_reason,
	                global_amount_limit: ma.global_amount_limit,
	                recipient_slug_list: ma.recipient_slug_list,
	                token_id: ma.token_id,
	                expiry: ma.expiry,
	                status: ma.status,
	                error_message: ma.error_message,
	                caller_reference: ma.caller_reference
				});
			} else {
				FPSMultiuseAuthorization.set({
					status: ma.status,
					token_id: ma.token_id,
					error_message: ma.error_message
				}, {
					id: multi_auth.id
				});
				
				multi_auth = FPSMultiuseAuthorization.get_or_null({
					id: multi_auth.id
				});
			}
			return multi_auth
		}
	});
	
	var FPSMultiusePay = new Model(db, "FPSMultiusePay", {
		table_name: "fpsmultiusepays",
		columns: {
			_order: ["id", "timestamp", "caller_reference", "marketplace_fixed_fee",
			         "marketplace_variable_fee", "transaction_amount", "recipient_slug",
			         "sender_token_id", "payment_id",
			         "caller_description", "charge_fee_to", "descriptor_policy", "sender_description",
			         "request_id", "transaction_id",
			         "transaction_status", "error_message", "error_code"],
			id: "INTEGER PRIMARY KEY",
			timestamp: "INTEGER", //"DATETIME"
			caller_reference: "VARCHAR", // (128 char)
			marketplace_fixed_fee: "VARCHAR", // (Amount)
			marketplace_variable_fee: "VARCHAR", // (Decimal)
			transaction_amount: "VARCHAR", // (amount)
			recipient_slug: "VARCHAR", // server converts recipient slug to recipient token
			sender_token_id: "VARCHAR",  // (multiuse tokenID)
			payment_id: "INTEGER",
			
			/////// these get populated by server
			caller_description: "VARCHAR",  // (160 chars)
			charge_fee_to: "VARCHAR", // "Recipient" or "Caller"
			descriptor_policy: "VARCHAR",
			//recipient_token_id: "VARCHAR",
			//refund_token_id: "VARCHAR",
			sender_description: "VARCHAR", // (160 chars)
			
			request_id: "VARCHAR",
			transaction_id: "VARCHAR",
			transaction_status: "VARCHAR",
			error_message: "VARCHAR",
			error_code: "VARCHAR"				
		}
	}, {
		// instance methods
		success: function() { return this.transaction_status == FPSMultiusePay.SUCCESS },
		pending: function() { return this.transaction_status == FPSMultiusePay.PENDING},
		reserved: function() { return this.transaction_status == FPSMultiusePay.RESERVED },
		refunded: function() { return this.transaction_status == FPSMultiusePay.REFUNDED },
		refund_initiated: function() { return this.transaction_status == FPSMultiusePay.REFUND_INITIATED },
		cancelled: function() { return this.transaction_status == FPSMultiusePay.CANCELLED },
		error: function() { return this.transaction_status == FPSMultiusePay.ERROR },
		failure: function() { return this.transaction_status == FPSMultiusePay.FAILURE },
		
		payment: function() {
			// @returns Payment row factory (should never be null)
			var self = this;
			var payment = Payment.get_or_null({ id: self.payment_id })
			if (!payment) {
				pddb.orthogonals.error("no payment found for FPS Multiuse Pay = "+this);
			}
			return payment
		},
		
		deep_dict: function() {
			return {
				id: this.id,
				timestamp: _un_dbify_date(this.timestamp),
				caller_reference: this.caller_reference,
				marketplace_fixed_fee: this.marketplace_fixed_fee,
				marketplace_variable_fee: this.marketplace_variable_fee,
				transaction_amount: this.transaction_amount,
				recipient_slug: this.recipient_slug,
				sender_token_id: this.sender_token_id,
				payment: this.payment().deep_dict(),
				
				caller_description: this.caller_description,
				charge_fee_to: this.charge_fee_to,
				descriptor_policy: this.descriptor_policy,
				sender_description: this.sender_description,
				
				request_id: this.request_id,
				transaction_id: this.transaction_id,
				transaction_status: this.transaction_status,
				error_message: this.error_message, 
				error_code: this.error_code
			}
		},
		
	}, {
		// class methods
		SUCCESS: 'S',
		PENDING: 'P', // waiting for response from amazon
		CANCELLED: 'C', // was pending, now cancelled
		RESERVED: 'R',
		FAILURE: 'F', // Amazon says transaction failed 
		ERROR: 'E', // something messed up before we could even get a transaction status
		REFUND_INITIATED: 'I',
		REFUNDED: 'D', // the transaction was refunded.... 
		// ?? maybe there should be a refund transaction?
		
		process_object: function(p) {
			// @param p: object from server. json already loaded
			// @return: nothing
		
			// incoming timestampe are from self.timestamp.ctime():
			//              Sat Sep 19 14:42:25 2009
			// the above string can transformed to dates with new Date(ctimestr)
			/*
			 * {'caller_reference': self.caller_reference,
                'timestamp': "%s" % self.timestamp.ctime(),
                'marketplace_fixed_fee': self.marketplace_fixed_fee,
                'marketplace_variable_fee': self.marketplace_variable_fee,
                'recipient_slug': self.recipient_token_id,
                'refund_token_id': self.refund_token_id,
                'sender_token_id': self.sender_token_id,
                'transaction_amount': self.transaction_amount,
                'request_id': self.request_id,
                'transaction_id': self.transaction_id,
                'transaction_status': self.transaction_status,
                'error_message': self.error_message,
                'error_code': se
			 */
			logger("pay process object: ");
			_pprint(pay);
			
			var pay = FPSMultiusePay.get_or_null({
				caller_reference: p.caller_reference
			});
			if (pay) {
				FPSMultiusePay.set({
					request_id: p.request_id,
					transaction_status: p.transaction_status,
					error_message: p.error_message,
					error_code: p.error_code,
				}, {
					caller_reference: p.caller_reference,
				});
				
				var pay = FPSMultiusePay.get_or_null({
					id: pay.id
				});
				
				if (pay.success() || pay.refunded() || pay.cancelled()) {
					var payment = pay.payment();
					// if success, refunded or cancelled:
					//   * remove requires payment
					//   * set settled to true
					// if refunded, do we want to do anything else,
					//     eg remove payment or mark payment as refunded?
					//    do we really want settled to be true for refund or cancelled?
					Payment.set({
						settled: _dbify_bool(true)
					}, {
						id: payment.id
					});
					_iterate(payment.totals(), function(key, total, index) {
						var rp = total.requires_payment();
						if (rp) {
							RequiresPayment.del({ id: rp.id });
						} else {
							pddb.orthogonals.warn("Requires Payment doesn't exist for a total for received FPS Multiuse Pay: "+pay+" "+" total="+total);
						}
					});
				}
				
			} else {
				pddb.orthogonals.error("Recieved FPS Multiuse Pay update for FPS Multiuse Pay that does not exist! "+p);
				
				/* don't know which payment to use (though could find amount and timestamp similar...
				 * but if FPS multiuse pay was deleted, then payment and totals might be deleted, too...
				 * 
				 * FPSMultiusePay.create({
					timestamp: p.timestamp,
					caller_description: p.caller_description,
					caller_reference: p.caller_reference,
					charge_fee_to: p.charge_fee_to,
					descriptor_policy: p.descriptor_policy,
					marketplace_fixed_fee: p.marketplace_fixed_fee,
					marketplace_variable_fee: p.marketplace_variable_fee,
					recipient_slug: p.recipient_slug,
					refund_token_id: p.refund_token_id,
					sender_description: p.sender_description,
					sender_token_id: p.sender_token_id,
					transaction_amount: p.transaction_amount,
					
					request_id: p.request_id,
					transaction_status: p.transaction_status,
					error_message: p.error_message,
					error_code: p.error_code,
				});*/
			}
		}
	});
	
	return {
        _order: ["Site", "SiteGroup",
                 "Recipient", "Category", "RecipientPercent",
                 "Tag", "Visit", "Total", 
                 "PaymentService", "Payment", "RequiresPayment", "PaymentTotalTagging",
				 "TimeType", "ContentType",
				 "Log", "UserStudy",
				 "FPSMultiuseAuthorization", "FPSMultiusePay",
				 "Report"],
        
        Site                : Site,
		SiteGroup           : SiteGroup,
		Recipient           : Recipient,
		Category            : Category,
		RecipientPercent    : RecipientPercent,
        Tag                 : Tag,
        Visit               : Visit,
		Total               : Total,
		PaymentService      : PaymentService,
		Payment             : Payment,
		RequiresPayment     : RequiresPayment,
		PaymentTotalTagging : PaymentTotalTagging,
		TimeType            : TimeType,
		ContentType         : ContentType,
		Log                 : Log,
		UserStudy           : UserStudy,
		FPSMultiuseAuthorization : FPSMultiuseAuthorization,
		FPSMultiusePay      : FPSMultiusePay,
		Report              : Report
	};
}


/**************** content/js/views.js *****************/

/**
 * handles 'views' for browser-generated ProcrasDonate.com pages
 * @param prefs
 * @param pddb
 * @return
 */
var Controller = function(pddb, prefs, pd_api) {
	this.pddb = pddb;
	this.prefs = prefs;
	this.pd_api = pd_api;
	this.page = new PageController(this.pddb, this.prefs, this.pd_api);
};

Controller.prototype = {};
_extend(Controller.prototype, {
	handle: function(request) {
		var host = _host(request.url);
		
		// insert top bar
		//    if visiting first ProcrasDonate website of the day
		if (!this.prefs.get("inserted_top_bar_today", false)) {
			if (this.page.top_bar_has_content()) {
				var sitegroup = this.pddb.SiteGroup.get_from_url(request.url);
				if (sitegroup) {
					if (sitegroup.tag_id == this.pddb.ProcrasDonate.id) {
						this.page.insert_top_bar(request);
						this.page.activate_top_bar(request);
						this.prefs.set("inserted_top_bar_today", true)
					}
				}
			}
		}
		
		// create ProcrasDonate extension website
		if (host == constants.PD_HOST) { //match(new RegExp(valid_host)))
			return this.pd_dispatch_by_url(request);
		}
		return false;
	},
	
	insert_based_on_state: function(request, state_name, default_state, state_enums, event_inserts) {
		/* Calls appropriate insert method based on current state
		 * 
		 * @param state_name: string. one of 'settings', 'register' or 'impact
		 * @param state_enums: array. state enumeration. one of 'constants.SETTINGS_STATE_ENUM',
		 * 		'constants.REGISTER_STATE_ENUM' or 'constants.IMPACT_STATE_ENUM'
		 * @param event_inserts: array. functions corresponding to enums. one of
		 * 		'constants.SETTINGS_STATE_INSERTS', 'constants.IMPACT_STATE_INSERTS', 'constants.REGISTER_STATE_INSERTS'
		 */
		request.jQuery("#"+state_name+"_menu_item").addClass("here_we_are");
		
		this.prefs.set('site_classifications_settings_activated', true);
		for (var i = 0; i < state_enums.length; i += 1) {
			var state = state_enums[i];
			if ( this.prefs.get(state_name + '_state', '') == state ) {
				this.page[event_inserts[i]](request);
				return true;
			}
		}
		// substate did not match!!
		// set to default
		this.prefs.set(state_name + '_state', default_state);
		this.insert_based_on_state(request, state_name, default_state, state_enums, event_inserts); 
		return false;
	},
	
	pd_dispatch_by_url: function(request) {
		//logger("pd_dispatch_by_url: "+ request.url);
		var ret = true; 
		this.page.default_inserts(request);
		
		var path = request.url.match(new RegExp("https?:\/\/[^/]+(.*)"))
		switch (path[1]) {
		case constants.REGISTER_URL:
			this.insert_based_on_state(
				request,
				'register',
				constants.DEFAULT_REGISTER_STATE,
				constants.REGISTER_STATE_ENUM, 
				constants.REGISTER_STATE_INSERTS);
			break;
		case constants.SETTINGS_URL:
			this.insert_based_on_state(
				request,
				'settings', 
				constants.DEFAULT_SETTINGS_STATE,
				constants.SETTINGS_STATE_ENUM, 
				constants.SETTINGS_STATE_INSERTS);
			break;
		case constants.IMPACT_URL:
			this.insert_based_on_state(
				request,
				'impact', 
				constants.DEFAULT_IMPACT_STATE,
				constants.IMPACT_STATE_ENUM, 
				constants.IMPACT_STATE_INSERTS);
			break;
		case constants.PROGRESS_URL:
			this.insert_based_on_state(
				request,
				'progress', 
				constants.DEFAULT_PROGRESS_STATE,
				constants.PROGRESS_STATE_ENUM, 
				constants.PROGRESS_STATE_INSERTS);
			break;
		case constants.MESSAGES_URL:
			this.insert_based_on_state(
				request,
				'messages', 
				constants.DEFAULT_MESSAGES_STATE,
				constants.MESSAGES_STATE_ENUM, 
				constants.MESSAGES_STATE_INSERTS);
			break;
		case constants.TWS_SETTINGS_URL:
			this.page.insert_register_time_well_spent(request);
			break;
		case constants.HOME_URL:
			this.page.handle_home_url(request);
			break;
		case constants.SPLASH_URL:
			break;
		case constants.MANUAL_TEST_SUITE_URL:
			this.page.manual_test_suite(request);
			break;
		case constants.AUTOMATIC_TEST_SUITE_URL:
			this.page.automatic_test_suite(request, false);
			break;
		case constants.AUTOTESTER_TEST_SUITE_URL:
			this.page.automatic_test_suite(request, true);
			break;
		case constants.TIMING_TEST_SUITE_URL:
			this.page.timing_test_suite(request);
			break;
		case constants.VISUAL_DEBUG_URL:
			this.page.visual_debug(request);
			break;
		case constants.AUTHORIZE_PAYMENTS:
			break;
		case constants.AUTHORIZE_PAYMENTS_CALLBACK_URL:
			break;
		case constants.ADMIN_URL:
			this.page.insert_top_bar(request);
			this.page.activate_top_bar(request);
			break;
		default:
			ret = false;
			//logger("Unknown ProcrasDonate URL: " + request.url);
		}
		this.page.insert_user_messages(request);
		return ret;
	},
	
	check_page_inserts: function() {
		/*
		 * Insert data into matching webpage
		 *    (localhost:8000 or procrasdonate.com)
		 * See constants.PD_HOST in global constants at top of page.
		 */
		var url = _href();
		//var host = _host(href);
		this.dispatch_by_host(url);
	},
	
	STATE_DEFAULTS: {
		settings_state: constants.DEFAULT_SETTINGS_STATE,
		progress_state: constants.DEFAULT_PROGRESS_STATE,
		messages_state: constants.DEFAULT_MESSAGES_STATE,
		impact_state: constants.DEFAULT_IMPACT_STATE,
		register_state: constants.DEFAULT_REGISTER_STATE,
	},
	
	initialize_state: function() {
		this.initialize_account_defaults_if_necessary();
		this.initialize_state_if_necessary();
		//this.initialize_data_flow_state_if_necessary();
	},
	
	initialize_data_flow_state_if_necessary: function() {
		// This state is necessary for correctly synching data between
		// this extension, TipJoy and ProcrasDonate.
		// Synching does not depend on 24hr or weekly cycle settings. woot!!
		// Synching is triggered by those cycles, but the data to synch
		// is found using the following state
		var flow_state = ['last_tipjoy_id_sent_to_tipjoy',
		                  'last_paid_tipjoy_id_sent_to_pd',
		                  'last_pledge_tipjoy_id',
		                  'last_total_time_sent_to_pd'];
		for (var i = 0; i < flow_state.length; i++) {
			if ( !this.prefs.get(flow_state[i], false) ) {
				this.prefs.set(flow_state[i], false);
			}
		}
	},
	
	initialize_state_if_necessary: function() {
		logger("initialize_state_if_necessary()");
		/*
		 * Initialize settings and impact state enumerations. Other inits?
		 */
		var self = this;
		_iterate(this.STATE_DEFAULTS, function(name, value) {
			//logger("state defaults: "+name+" "+value);
			if (!self.prefs.get(name, ''))
				return self.prefs.set(name, value);
		});
		
		var last_24hr_mark = this.prefs.get("last_24hr_mark", "");
		if (!last_24hr_mark) {
			
			function get_semi_random_date() {
				/* @returns: Date object for current day */
				//// Math.floor(Math.random()*X) generates random ints, x: 0 <= x < X
				// wanted to distribute roll-over times so don't hose server. 
				// DO NOT NEED to correlate this with end_of_day and end_of_week times
				// in pddb.Totals objects. 
				var d = _start_of_day();
				d.setHours(0);
				d.setMinutes(Math.floor(Math.random()*60));
				d.setSeconds(Math.floor(Math.random()*60));
				if (d > new Date()) {
					d.setHours(d.getHours() - 24);
				}
				return d;
			}
			
			last_24hr_mark = _dbify_date( get_semi_random_date() );
			this.prefs.set("last_24hr_mark", last_24hr_mark);
		}
		
		var last_week_mark = this.prefs.get("last_week_mark", "");
		if (!last_week_mark) {
			this.prefs.set("last_week_mark", last_24hr_mark);
		}
	},
	
	ACCOUNT_DEFAULTS: {
		twitter_username: constants.DEFAULT_USERNAME,
		twitter_password: constants.DEFAULT_PASSWORD,
		email: constants.DEFAULT_EMAIL,
		procrasdonate_reason: constants.DEFAULT_PROCRASDONATE_REASON,
		timewellspent_reason: constants.DEFAULT_TIMEWELLSPENT_REASON,
		pd_dollars_per_hr: constants.DEFAULT_PD_DOLLARS_PER_HR,
		pd_hr_per_week_goal: constants.DEFAULT_PD_HR_PER_WEEK_GOAL,
		pd_hr_per_week_max: constants.DEFAULT_PD_HR_PER_WEEK_MAX,
		tws_dollars_per_hr: constants.DEFAULT_TWS_DOLLARS_PER_HR,
		tws_hr_per_week_goal: constants.DEFAULT_TWS_HR_PER_WEEK_GOAL,
		tws_hr_per_week_max: constants.DEFAULT_TWS_HR_PER_WEEK_MAX,
		support_pct: constants.DEFAULT_SUPPORT_PCT,
		monthly_fee: constants.DEFAULT_MONTHLY_FEE,
		tos: false,
		
		global_amount_limit: constants.DEFAULT_GLOBAL_AMOUNT_LIMIT,
		credit_limit: constants.DEFAULT_CREDIT_LIMIT,
		fps_cbui_version: constants.DEFAULT_FPS_CBUI_VERSION,
		fps_api_version: constants.DEFAULT_FPS_API_VERSION,
		payment_reason: constants.DEFAULT_PAYMENT_REASON,
	
	},
	
	initialize_account_defaults_if_necessary: function() {
		logger("initialize_account_defaults_if_necessary()");
		/*
		 * Set any blank account data to defaults.
		 */
		var self = this;
		_iterate(this.ACCOUNT_DEFAULTS, function init(name, value) {
			//logger("account defaults: "+name+" "+value);
			if (!self.prefs.get(name, ''))
				return self.prefs.set(name, value);
		});
	},

	reset_account_to_defaults: function() {
		/*
		 * Overwrite existing data (if any) with account defaults
		 */
		var self = this;
		_iterate(this.ACCOUNT_DEFAULTS, function init(name, value) {
			self.prefs.set(name, value);
		});
	},
	
	reset_state_to_defaults: function() {
		/*
		 * Overwrite existing data (if any) with state defaults
		 */
		var self = this;
		_iterate(this.STATE_DEFAULTS, function init(name, value) {
			//logger("SET STATE: name:"+name+", value:"+value);
			self.prefs.set(name, value);
		});
	},
});

/**
 * views
 * 
 * @param pddb
 * @param prefs
 * @return
 */
function PageController(pddb, prefs, pd_api) {
	this.pddb = pddb;
	this.prefs = prefs;
	this.pd_api = pd_api;
	
	// for dev testing. eventually, schedule could contain state so that
	// the real scheduler and the dev scheduler diverged (eg, shorter (mutable) cycles)
	this.schedule = new Schedule(pddb, prefs, pd_api);
}
PageController.prototype = {};
_extend(PageController.prototype, {
	
	default_inserts: function(request) {
	
		// add private menu items
		var private_menu = ["<div id=\"ExtensionMenu\" class=\"menu\">",
		       			 	"    <div id=\"progress_menu_item\"><a href=\""+
		       			 	constants.PROGRESS_URL+"\">My Progress</a></div>",
		       			 	"    <div id=\"messages_menu_item\"><a href=\""+
		       			 	constants.MESSAGES_URL+"\">My Messages</a></div>",
		       			 	"    <div id=\"impact_menu_item\"><a href=\""+
		       			 	constants.IMPACT_URL+"\">My Impact</a></div>",
		       			 	"    <div id=\"settings_menu_item\"><a href=\""+
		       			 	constants.SETTINGS_URL+"\">My Settings</a></div>",
		       			 	"</div>"].join("\n");
		
		if (request.jQuery("#MainMenu").length > 0) {
			// insert above Main Menu in left column
			request.jQuery("#MainMenu").before( private_menu );
		} else {
			// replace splash page's download button
			request.jQuery("#download_wrapper").html( private_menu );
			request.jQuery("#focus_slogan_line1").remove();
			request.jQuery("#focus_slogan_line2").remove();
		}
	
		if (!this.registration_complete()) {
			request.jQuery("#settings_menu_item")
				.attr("id", "register_menu_item")
				.children("a")
					.attr("href", constants.REGISTER_URL)
					.text("Not Done Registering");
		}
		
		// remove top download button
		request.jQuery("#download_top_button").remove();
	},
	
	registration_complete: function() {
		var reg_done = this.prefs.get('registration_done', false);
		var tos_accepted = this.prefs.get('tos', false);
		return reg_done && tos_accepted;
	},
	
	insert_user_messages: function(request) {
		var self = this;
		var message = self.prefs.get("user_message", "");
		if (message) {
			var html = Template.get("user_messages").render(
					new Context({
						message: message
					}));
						
			request.jQuery("#user_messages_wrapper").html( html ).hide().fadeIn("slow");
			self.prefs.set("user_message", "");
		}
	},
	
	/**
	 * returns true if top bar would have content; false if would be empty
	 */
	top_bar_has_content: function() {
		var latest = this.pddb.Report.latest();
		return latest && !latest.is_read()
	},
	
	/**
	 * does insertion and activation of top bar
	 */
	insert_top_bar: function(request) {
		var self = this;
		var html = Template.get("top_bar").render(
			new Context({
				latest_report: self.pddb.Report.latest(),
				registration_complete: this.registration_complete
			}));
		
		request.jQuery("body").prepend( html );
		
		// activate
		request.jQuery("#close_procrasdonate_extn_top_bar").click(function() {
			request.jQuery(this).parent().remove();
		});
	},
	
	activate_top_bar: function(request) {
		var self = this;
		request.jQuery("#procrasdonate_extn_expand").click(function() {
			if (request.jQuery(this).hasClass("contracted")) {
				var latest = self.pddb.Report.latest();
				request.jQuery("#procrasdonate_extn_message").html(
						latest.message).css("text-align", "left");
				request.jQuery("#procrasdonate_extn_top_bar").css("height", "auto");
				request.jQuery(this)
					.removeClass("contracted")
					.attr("src", constants.PD_URL+constants.MEDIA_URL+"img/ContractButton.png");
				self.pddb.Report.set({ read: _dbify_bool(true)}, { id: latest.id });
			} else {
				request.jQuery(this)
					.addClass("contracted")
					.attr("src", constants.PD_URL+constants.MEDIA_URL+"img/ExpandButton.png");
				request.jQuery("#procrasdonate_extn_message").html("");
				request.jQuery("#procrasdonate_extn_top_bar").css("height", "24px");
			}
		});
	},
	
	/*************************************************************************/
	/***************************** VIEW UTILS ********************************/
	
	/*
	 * @param: images: may be undefined
	 * @return: dictionary of:
	 * 		menu_items: list of (id, klasses, value) tuples for substate menu
	 *          id is "substate_tab_"+enums[index]
	 *          value is tab_names[index]
	 *          klasses is ["substate_tab", "current_tab"]<---if current tab
	 *      next: tuple of next tab or null
	 *      prev: tuple of prev tab or null
	 */
	make_substate_menu_items: function(current_substate, enums, tab_names, images) {
		var menu_items = [];
		var prev = null;
		var next = null;
		
		var _last = null;
		var _one_past_current = false;
		var _two_past_current = false; // because can't tell the difference bw nulls
		_iterate(tab_names, function(key, value, index) {
			// figure out menu item
			var klasses = ["substate_tab"];
			if (enums[index] == current_substate) {
				klasses.push("current_tab");
			} else if (!_one_past_current) {
				klasses.push("past");
			} else {
				klasses.push("future");
			}
			
			var img = "";
			var bar = "";
			if (enums[index] == current_substate) {
				if (images) {
					if (images[index].selected) {
						img = constants.MEDIA_URL+"img/"+images[index].selected;
					} else {
						img = constants.MEDIA_URL+"img/"+images[index].past;
					}
				} else {
					img = constants.MEDIA_URL+"img/StepCircle"+(index+1)+"Done.png";
				}
				bar = constants.MEDIA_URL+"img/Dash.png";
				
			} else if (!_one_past_current) {
				if (images) {
					img = constants.MEDIA_URL+"img/"+images[index].past;
				} else {
					img = constants.MEDIA_URL+"img/StepCircle"+(index+1)+"Done.png";
				}
				bar = constants.MEDIA_URL+"img/Dash.png";
				
			} else {
				if (images) {
					if (images[index].future) {
						img = constants.MEDIA_URL+"img/"+images[index].future;
					} else {
						img = constants.MEDIA_URL+"img/"+images[index].past;
					}
				} else {
					img = constants.MEDIA_URL+"img/StepCircle"+(index+1)+".png";
				}
				bar = constants.MEDIA_URL+"img/DashGreen.png";
			}
				
			var menu_item = {
				id: "substate_tab_"+enums[index],
				klasses: klasses,
				value: value,
				img: img,
				bar: bar
			}
			// set next
			if (_one_past_current && !_two_past_current) {
				next = menu_item;
				_two_past_current = true
			}
			// set prev
			if (enums[index] == current_substate) {
				_one_past_current = true;
				prev = _last;
			}
			// add to menu items
			if (value != "XXX" && value != "XXXX") {
				menu_items.push(menu_item);
			}
			_last = menu_item;
		});
		return {
			menu_items: menu_items,
			next: next,
			prev: prev
		}
	},
	
	activate_substate_menu_items: function(request, current_substate, enums, inserts, processors) {
		var self = this;
		_iterate(enums, function(key, substate, index) {
			if (processors) {
				request.jQuery("#substate_tab_"+substate+", .substate_tab_"+substate).click(
					self._process(current_substate, enums, processors, inserts[index], request)
				);
			} else {
				request.jQuery("#substate_tab_"+substate+", .substate_tab_"+substate).click(
					self._proceed(inserts[index], request)
				);
			}
		});
	},
	
	_process: function(current_substate, enums, processors, event, request) {
		var self = this;
		return function() {
			_iterate(enums, function(key, substate, index) {
				if (substate == current_substate) {
					var success = self[processors[index]](request, event);
					if (success) {
						self[event](request);
					}
				}
			});
		};
	},
	
	/// necessary because when did direct closure
	/// (function(event) { return event; })(self[event])
	// .click(
	//     (function(event) { return event; })(self[event])
	// )
	/// called functions had incorrect this
	_proceed: function(event, request) {
		var self = this;
		return function() {
			//self[fnname].apply(self, args);
			self[event](request);
		};
	},
	
	retrieve_float_for_display: function(key, def) {
		return _un_prefify_float( this.prefs.get(key, def) ).toFixed(2)
	},
	
	retrieve_percent_for_display: function(key, def) {
		return (_un_prefify_float( this.prefs.get(key, def) ) * 100).toFixed(2)
	},
	
	validate_positive_float_input: function(v) {
		try {
			return parseFloat(v) >= 0
		} catch(e) {
			return false
		}
	},
	
	validate_dollars_input: function(v) {
		return parseFloat(v) >= 0
		
		var max = 20;
		if ( dollars >= 0 && dollars <= max )
			return true;
		
		if ( dollars >= max ) {
			var confirm_results = confirm("Do you really want to donate $" + dollars + " every hour you spend procrastinating up to your daily limit?");
			if ( confirm_results ) {
				return true;
			} else {
				return false;
			}
		}
		return false;
	},
	
	validate_hours_input: function(v) {
		var hours = parseFloat(v);
		if ( hours >= 0 )
			return true;
		else
			return false;
	},
	
	clean_dollars_input: function(v) {
		return _prefify_float(v);
	},
	
	clean_hours_input: function(v) {
		return _prefify_float(v);
	},
	
	clean_positive_float_input: function(v) {
		return _prefify_float(v);
	},
	
	clean_percent_input: function(v) {
		var f = parseFloat(v);
		return _prefify_float(f / 100.00);
	},
	
	validate_string: function(v) {
		return v && v != ''
	},

	/*************************************************************************/
	/******************************* MISC VIEWS ********************************/

	handle_home_url: function(request) {
		var unsafeWin = request.get_unsafeContentWin();//event.target.defaultView;
		if (unsafeWin.wrappedJSObject) {
			unsafeWin = unsafeWin.wrappedJSObject;
		}
		new XPCNativeWrapper(unsafeWin, "location").location = constants.PD_URL + constants.PROGRESS_URL;	
	},

	/*************************************************************************/
	/******************************* SETTINGS ********************************/

	/**
	 * @return {
	 *     currently_authorized: bool, // True if currently authorized to make payments
	 *     authorization_expired: bool, // True if was authorized but expired
	 *     months: int 
	 * }
	 * months is number of months until reauthorization is necessary, 
	 * or 0 if expired or not authorized
	 */
	months_before_reauth: function() {
		var self = this;
		var currently_authorized = false;
		var authorization_expired = false;
		var months = 0;
		var multi_auth = this.pddb.FPSMultiuseAuthorization.most_recent();
		if (multi_auth) {
			if (multi_auth.good_to_go()) {
				currently_authorized = true;
				if (multi_auth.expiry && multi_auth.expiry.split("/").length == 2) {
					var expiry = multi_auth.expiry.split("/");
					var exp_year = parseInt(expiry[1]);
					var exp_month = parseInt(expiry[1]);
					var now = new Date();
					var now_year = now.getFullYear();
					var now_month = now.getMonth() + 1;
					// check if expired, and set status bit if expired
					if (exp_year < now_year || (exp_year == now_year && exp_month <= now_month)) {
						self.pddb.FPSMultiuseAuthorization.set({
							status: 'EX'
						}, {
							id: multi_auth.id
						});
						authorization_expired = true;
						currently_authorized = true;
						months = "Authorization has expired. <a href=\""+constants.REGISTER_URL+"\" class=\"reauthorize\">Please authorize</a>";
					} else {
						var min_auth_months = _un_prefify_float(self.prefs.get('min_auth_time', constants.DEFAULT_MIN_AUTH_TIME));
						var then = _un_dbify_date(multi_auth.timestamp);
						var months_since_then = (now.getFullYear() - then.getFullYear())*12 + (now.getMonth() - then.getMonth());
						
						if (months_since_then > min_auth_months) {
							// exceeded the number of months user allocated for auth
							// but....we don't care if there's still money left...
						}
						
						var amount_paid_against_multi_auth = 0.0;
						self.pddb.Payment.select({datetime__gte: multi_auth.timestamp}, function(row) {
							amount_paid_against_multi_auth += parseFloat(row.total_amount_paid);
						});
						
						if (amount_paid_against_multi_auth >= parseFloat(multi_auth.global_amount_limit)) {
							// expired because payments exceed global_amount_limit
							// ?? we probably already ran into this when trying to make payments
							//   what we want to do is predict how many months are left based on
							//   payments already made.
							self.pddb.FPSMultiuseAuthorization.set({
								status: 'EX'
							}, {
								id: multi_auth.id
							});
							authorization_expired = true;
							currently_authorized = true;
							months = "Authorization has expired. <a href=\""+constants.REGISTER_URL+"\" class=\"reauthorize\">Please authorize</a>";
						} else {
							// again, we probably want to predict since right now this is based on fulfilling limit each week.
							months = min_auth_months - months_since_then;
						}
					}
				} else {
					months = "unknown"
				}
			} else if (multi_auth.expired()) {
				authorization_expired = true;
				months = "Authorization has expired. <a href=\""+constants.REGISTER_URL+"\" class=\"reauthorize\">Please authorize</a>";
			} else {
				months = "Unsuccessful authorization attempts. <a href=\""+constants.REGISTER_URL+"\" class=\"reauthorize\">Please authorize</a>";
			}
		} else {
			months = "Not autohrized yet. <a href=\""+constants.REGISTER_URL+"\" class=\"reauthorize\">Please authorize</a>";
		}
		return {
			currently_authorized: currently_authorized,
			authorization_expired: authorization_expired,
			months: months
		}
	},
	
	insert_settings_overview: function(request) {
		var self = this;
		this.prefs.set('settings_state', 'overview');
		
		var substate_menu_items = this.make_substate_menu_items('overview',
			constants.SETTINGS_STATE_ENUM, constants.SETTINGS_STATE_TAB_NAMES);
		
		var recipient_percents = [];
		self.pddb.RecipientPercent.select({}, function(row) {
			recipient_percents.push(row);
		});
		
		var estimated_months_before_reauth = this.months_before_reauth();
		
		var middle = Template.get("settings_overview_middle").render(
			new Context({
				substate_menu_items: substate_menu_items,
				
				recipient_percents: recipient_percents,
				estimated_months_before_reauth: estimated_months_before_reauth,
				
				pd_hr_per_week_goal: self.retrieve_float_for_display("pd_hr_per_week_goal", constants.DEFAULT_PD_HR_PER_WEEK_GOAL),
				pd_dollars_per_hr: self.retrieve_float_for_display("pd_dollars_per_hr", constants.DEFAULT_PD_DOLLARS_PER_HR),
				pd_hr_per_week_max: self.retrieve_float_for_display("pd_hr_per_week_max", constants.DEFAULT_PD_HR_PER_WEEK_MAX),
				
				tws_hr_per_week_goal: self.retrieve_float_for_display("tws_hr_per_week_goal", constants.DEFAULT_TWS_HR_PER_WEEK_MAX),
				tws_dollars_per_hr: self.retrieve_float_for_display("tws_dollars_per_hr", constants.DEFAULT_TWS_DOLLARS_PER_HR),
				tws_hr_per_week_max: self.retrieve_float_for_display("tws_hr_per_week_max", constants.DEFAULT_TWS_HR_PER_WEEK_MAX),
				
				monthly_fee: self.retrieve_float_for_display('monthly_fee', constants.DEFAULT_MONTHLY_FEE),
				support_pct: self.retrieve_percent_for_display('support_pct', constants.DEFAULT_SUPPORT_PCT),
				
				email: self.prefs.get('email', constants.DEFAULT_EMAIL),
				weekly_affirmations: _un_dbify_bool(self.prefs.get('weekly_affirmations', constants.DEFAULT_WEEKLY_AFFIRMATIONS)),
				org_thank_yous: _un_dbify_bool(self.prefs.get('org_thank_yous', constants.DEFAULT_ORG_THANK_YOUS)),
				org_newsletters: _un_dbify_bool(self.prefs.get('org_newsletters', constants.DEFAULT_ORG_NEWSLETTERS)),
			})
		);
		request.jQuery("#content").html( middle );
		
		this.activate_settings_overview(request);
		
		this.activate_substate_menu_items(request, 'overview',
			constants.SETTINGS_STATE_ENUM, constants.SETTINGS_STATE_INSERTS, constants.SETTINGS_STATE_PROCESSORS);
		
		this.insert_example_gauges(request);
	},
	
	activate_settings_overview: function(request) {
		var self = this;
		
		request.jQuery(".reauthorize").addClass("link").click(function() {
			self.prefs.set('register_state', 'payments');
		});
		
		request.jQuery(".choose_charities").addClass("link").click(function() {
			self.prefs.set('register_state', 'charities');
		});
		
		/*request.jQuery(".choose_charities").addClass("link").click(function() {
			self.prefs.set('register_state', 'time_well_spent');
		});*/
		
		function arrow_click(arrow_id, diff) {
			request.jQuery(arrow_id)
				.css("cursor", "pointer")
				.click(function(e) {
					var item = request.jQuery(this).siblings(".thevalue");
					var id = item.attr("id");
					item.append(" "+id+" ");
					var value = _un_prefify_float( self.prefs.get(id, null) );
					if (value != null) {
						var new_value;
						if (item.siblings(".units").text() == "%") {
							new_value = value + (diff/100.0);
						} else {
							new_value = value + diff;
						}
						if (new_value < 0) new_value = 0.0;
						if (item.siblings(".units").text() == "%") {
							// toFixed returns a string not float!!
							x = new_value.toFixed(4);
							self.prefs.set(id, x);
							new_value = new_value * 100.0;
						} else {
							self.prefs.set(id, _prefify_float(new_value));
						}
						item.text(new_value.toFixed(2));
						item.siblings(".error").text("");
					} else {
						item.siblings(".error").text("ERROR");
					}
					self.insert_example_gauges(request);
				});
		}
		
		function arrow_click2(id, dir_class, diff) {
			var init_delay = 500;
			var delay = init_delay;
			var timer_id = null;
			var timer_running = false;
			var elem = request.jQuery("#"+id);
			
			function do_change() {
				var item = elem;
				var id = item.attr("id");
				//item.append(" "+id+" ");
				var value = _un_prefify_float( self.prefs.get(id, null) );
				//logger("do change ____ "+item.attr("class")+"."+item.attr("id")+"."+id+" = "+value);
				if (!isNaN(value) && value != null) {
					var new_value;
					if (item.siblings(".units").text() == "%") {
						new_value = value + (diff/100.0);
					} else {
						new_value = value + diff;
					}
					//logger(" new value = "+new_value);
					if (new_value < 0) new_value = 0.0;
					if (item.siblings(".units").text() == "%") {
						// toFixed returns a string not float!!
						x = new_value.toFixed(4);
						self.prefs.set(id, x);
						new_value = new_value * 100.0;
					} else {
						self.prefs.set(id, _prefify_float(new_value));
					}
					item.text(new_value.toFixed(2));
					//logger(" item text: "+(new_value.toFixed(2))+" actual = "+item.text());
					item.siblings(".error").text("");
				} else {
					item.siblings(".error").text("ERROR");
				}
			}
			
			elem.siblings(dir_class)
				.mousedown(function(e) {
					timer_running = true;
					change_do_change();
				})
				.css("cursor", "pointer");
			
			request.jQuery(request.get_document())
				.mouseup(function(e) {
					// we want to clear every timer_id that gets created
					timer_running = false;
					clearTimeout(timer_id);
					delay = init_delay;
					self.insert_example_gauges(request);
				});
			
			function change_do_change() {
				//logger("CHANGE DO CHANGE "+timer_running+" "+delay);
				if (timer_running) {
					do_change();
					if (delay > 100) { delay = delay * .80; }
					timer_id = setTimeout(change_do_change, delay);
				}
			}
		}

		request.jQuery(".up_arrow").each(function() {
			arrow_click2(request.jQuery(this).siblings(".thevalue").attr("id"), ".up_arrow", 0.25);
		});
		request.jQuery(".down_arrow").each(function() {
			arrow_click2(request.jQuery(this).siblings(".thevalue").attr("id"), ".down_arrow", -0.25);
		});
		
		request.jQuery("input[type=checkbox]").click(function() {
			var item = request.jQuery(this);
			var pref = item.attr("id");
			self.prefs.set(pref, item.attr("checked"));
		});
		
		request.jQuery("#email").keyup(function() {
			self.prefs.set('email', request.jQuery(this).attr("value"));
		});
	},
	
	/*************************************************************************/
	/******************************** IMPACT *********************************/
	
	insert_impact_totals: function(request) {
		/*
		 * Iterate through all RequiresPayment to determine pledges.
		 * Iterate through all Payment to determine paid.
		 *  -> put in right bucket based on _end_of_year( datetime )
		 */
		
		var self = this;
		this.prefs.set('impact_state', 'totals');
		
		var substate_menu_items = this.make_substate_menu_items('totals',
			constants.IMPACT_STATE_ENUM, constants.IMPACT_STATE_TAB_NAMES);

		var end_of_year = _end_of_year();
		var end_of_last_year = _end_of_last_year();
		
		var pledges_taxdeduct = 0.0;
		var pledges_not = 0.0;

		var payments_taxdeduct = {
				total: 0.0,
				end_of_year: 0.0,
				end_of_last_year: 0.0};
		
		var payments_not = {
				total: 0.0,
				end_of_year: 0.0,
				end_of_last_year: 0.0};
		
		this.pddb.RequiresPayment.select({}, function(row) {
			var total = row.total();
			var sitegroup = total.sitegroup();
			var recipient = total.recipient();
			if (!sitegroup && !recipient) {
				self.pddb.orthogonals.warn("Expected RequiresPayment for sitegroup or recipient. Found this instead: "+total+" requires_payment: "+row);
				return
			}

			if (total.content().has_tax_exempt_status()) {
				pledges_taxdeduct += total.dollars();
			} else {
				pledges_not += total.dollars();
			}
		});
		
		/* todo for Payment
		this.pddb.RequiresPayment.select({}, function(row) {
			var total = row.total();
			var date_idx = _end_of_year( _un_dbify_date(total.datetime) );
			var sitegroup = total.sitegroup();
			var recipient = total.recipient();
			if (!sitegroup && !recipient) {
				self.pddb.orthogonals.warn("Expected RequiresPayment for sitegroup or recipient. Found this instead: "+total+" requires_payment: "+row);
				return
			}
			var d = taxdeduct_total_amounts;
			if (!total.content().has_tax_exempt_status()) {
				d = NOT_taxdeduct_total_amounts;
			}
			if (!d[date_idx]) { d[date_idx] = 0.0; }
			d[date_idx] += total.dollars();
		});
		 */

		var table_headers = ["Recipients",
		                     "Current Pledges",
		                     _end_of_year().strftime("%Y Donations To Date"),
		                     _end_of_last_year().strftime("%Y All Donations"),
		                     "All Time Donations"];
		var table_rows = [
			["Total, tax-deductible recipients",
			 pledges_taxdeduct,
			 payments_taxdeduct[end_of_year],
			 payments_taxdeduct[end_of_last_year],
			 payments_taxdeduct.total
			],
			 
		    ["Total, other recipients",
		     pledges_not,
		     payments_not[end_of_year],
			 payments_not[end_of_last_year],
			 payments_not.total
			],
		];
		table_rows.push([
		    "Combined total of all recipients",
		    table_rows[0][1] + table_rows[1][1],
		    table_rows[0][2] + table_rows[1][2],
		    table_rows[0][3] + table_rows[1][3],
		    table_rows[0][4] + table_rows[1][4]
		]);
		
		_iterate(table_rows, function(k1, row, i1) {
			_iterate(row, function(k2, cell, i2) {
				if (isNumber(cell)) {
					var amt = cell.toFixed(2);
					if (amt > 0) {
						table_rows[i1][i2] = "$"+cell.toFixed(2);
					} else {
						table_rows[i1][i2] = "-";
					}
				}
			});
		});
		
		var middle = Template.get("impact_middle").render(
			new Context({
				substate_menu_items: substate_menu_items,
				table_headers: table_headers,
				table_rows: table_rows
			})
		);
		request.jQuery("#content").html( middle );
		
		this.activate_substate_menu_items(request, 'totals',
			constants.IMPACT_STATE_ENUM, constants.IMPACT_STATE_INSERTS);
	},
	
	_insert_impact_per_item: function(request, substate, filter_fn) {
		var self = this;
		this.prefs.set('impact_state', substate);
		
		var substate_menu_items = this.make_substate_menu_items(substate,
			constants.IMPACT_STATE_ENUM, constants.IMPACT_STATE_TAB_NAMES);

		var recipient_contenttype = self.pddb.ContentType.get_or_null({ modelname: "Recipient" });
		var sitegroup_contenttype = self.pddb.ContentType.get_or_null({ modelname: "SiteGroup" });

		var end_of_year = _end_of_year();
		var end_of_last_year = _end_of_last_year();
		
		var row_data = {};
		// total is _paid_ today, and thus sum of years data. excludes pledges. 
		//{
		//	 r: { slug: { name: "", logo: "", pledge: 0.0, total: 0.0, end_of_year: 0.0, end_of_last_year: 0.0, ... }, ... }
		//	sg: { host: { pledge: 0.0, total: 0.0, end_of_year: 0.0, end_of_last_year: 0.0, ... }, ... }
		//}
		row_data[recipient_contenttype.id] = {};
		row_data[sitegroup_contenttype.id] = {};
		
		this.pddb.RequiresPayment.select({}, function(row) {
			var total = row.total();
			
			if (filter_fn(total)) {
				var date_idx = _end_of_year( _un_dbify_date(total.datetime) );
				var sitegroup = total.sitegroup();
				var recipient = total.recipient();
				
				var d = null;
				var idx = null;
				if (sitegroup) {
					d = row_data[sitegroup_contenttype.id];
					idx = sitegroup.host;
				} else if (recipient) {
					d = row_data[recipient_contenttype.id];
					idx = recipient.slug;
				} else if (!sitegroup && !recipient) {
					self.pddb.orthogonals.warn("Expected RequiresPayment for sitegroup or recipient. Found this instead: "+total+" requires_payment: "+row);
					return
				}
				
				if (!d[idx]) {
					d[idx] = {
						pledge: 0.0,
						end_of_year: 0.0,
						end_of_last_year: 0.0,
						total: 0.0};
					if (recipient) {
						d[idx].logo = recipient.logo_thumbnail;
						d[idx].name = recipient.name;
					}
				}
				d[idx].pledge += total.dollars();
			}
		});
		
		this.pddb.Payment.select({}, function(row) {
			var total = row.total();
			
			if (filter_fn(total)) {
				var date_idx = _end_of_year( _un_dbify_date(total.datetime) );
				var sitegroup = total.sitegroup();
				var recipient = total.recipient();
				
				var d = null;
				var idx = null;
				if (sitegroup) {
					d = row_data[sitegroup_contenttype.id];
					idx = sitegroup.host;
				} else if (recipient) {
					d = row_data[recipient_contenttype.id];
					idx = recipient.slug;
				} else if (!sitegroup && !recipient) {
					self.pddb.orthogonals.warn("Expected RequiresPayment for sitegroup or recipient. Found this instead: "+total+" requires_payment: "+row);
					return
				}
				
				if (!d[idx]) {
					d[idx] = {
						pledge: 0.0,
						end_of_year: 0.0,
						end_of_last_year: 0.0,
						total: 0.0 };
					if (recipient) {
						d[idx].logo = recipient.logo_thumbnail;
						d[idx].name = recipient.name;
					}
				}
				d[idx][date_idx] += parseFloat(row.total_amount_paid);
				d[idx].total += parseFloat(row.total_amount_paid);
			}
		});
		
		// calculate row table
		
		var table_rows = [];
		_iterate([recipient_contenttype, sitegroup_contenttype], function(key, contenttype, index) {
			var d = row_data[contenttype.id];
			var contentname = "recipient";
			if (contenttype.id == sitegroup_contenttype.id) { contentname = "sitegroup"; }
			
			_iterate(d, function(slug_or_host_name, data, idx) {
				if (data.total > 0 || data.pledge > 0) {
					var html_name = "";
					if (contentname == "recipient") {
						html_name = "<img src=\""+data.logo+"\" /><span>"+data.name+"</span>";
					} else {
						html_name = "<span>"+slug_or_host_name+"</span>";
					}
					var row = [html_name,
					           data.pledge,
					           data[end_of_year],
					           data[end_of_last_year],
					           data.total];
					
					table_rows.push(row);
				}
			});
		});
		
		_iterate(table_rows, function(k1, row, i1) {
			_iterate(row, function(k2, cell, i2) {
				if (isNumber(cell)) {
					var amt = cell.toFixed(2);
					if (amt > 0) {
						table_rows[i1][i2] = "$"+cell.toFixed(2);
					} else {
						table_rows[i1][i2] = "-";
					}
				}
			});
			/*
			// format first cell
			var first_cell = null;
			if (table_rows[i1][0]["host"]) {
				first_cell = table_rows[i1][0]["host"];
			} else {
				first_cell = "<img src=\""+
					table_rows[i1][0]["logo_thumbnail"]+
					"\"><span>"+
					table_rows[i1][0]["name"]+
					"</span>";
			}
			*/
		});
		
		var table_headers = ["Recipients",
		                     "Current Pledges",
		                     _end_of_year().strftime("%Y Donations To Date"),
		                     _end_of_last_year().strftime("%Y All Donations"),
		                     "All Time Donations"];
		
		var middle = Template.get("impact_middle").render(
			new Context({
				substate_menu_items: substate_menu_items,
				table_headers: table_headers,
				table_rows: table_rows
			})
		);
		request.jQuery("#content").html( middle );
		
		this.activate_substate_menu_items(request, substate,
			constants.IMPACT_STATE_ENUM, constants.IMPACT_STATE_INSERTS);
	},
	
	insert_impact_show_all: function(request) {
		this._insert_impact_per_item(request, 'show_all', function(total) {
			return true
		});
	},
	
	insert_impact_tax_deductible: function(request) {
		this._insert_impact_per_item(request, 'tax_deductible', function(total) {
			return total.content().has_tax_exempt_status()
		});
	},
	
	insert_impact_other: function(request) {
		this._insert_impact_per_item(request, 'other', function(total) {
			return !total.content().has_tax_exempt_status()
		});
	},
	
	/*************************************************************************/
	/******************************* MESSAGES ********************************/
	
	insert_messages_all: function(request) {
		var self = this;
		this.prefs.set('messages_state', 'all');
		
		var reports = [];
		self.pddb.Report.select({}, function(row) {
			reports.push(row);
		}, "-datetime");
		
		var middle = Template.get("messages_all_middle").render(
			new Context({
				reports: reports
			})
		);
		request.jQuery("#content").html( middle );
		
		this.activate_messages_all(request);
	},
	
	activate_messages_all: function(request) {
		var self = this;
		request.jQuery(".report_message").hide();
		
		request.jQuery(".report").click(function() {
			var id = request.jQuery(this).attr("id")
			id = id.substr(7, id.length);
			var report = self.pddb.Report.get_or_null({ id: id });
			if (report) {
				request.jQuery(this).children(".report_message").toggle();
				var arrow = request.jQuery(this).children(".open_close_arrow");
				if (arrow.hasClass("is_closed")) {
					arrow.children("img").attr("src", constants.MEDIA_URL+"img/OpenMessageIcon.png");
				} else { 
					arrow.children("img").attr("src", constants.MEDIA_URL+"img/ClosedMessageIcon.png");
				}
				arrow.toggleClass("is_closed");
				if (!report.is_read()) {
					self.pddb.Report.set({
						read: _dbify_bool(true)
					}, {
						id: report.id
					});
					request.jQuery(this).children(".is_read_holder")
						.children("img").remove()
						.addClass("is_read");
				}
			}
		});
	},
		
	
	speed_up_video_prototype: function(request) {
		netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
		// create an nsILocalFile for the executable
		var file = Components.classes["@mozilla.org/file/local;1"]
		                     .createInstance(Components.interfaces.nsILocalFile);

		file.initWithPath("/Applications/MPlayer\ OSX\ Extended.app/Contents/Resources/External_Binaries/mplayer.app/Contents/MacOS/mplayer");

		// create an nsIProcess
		var process = Components.classes["@mozilla.org/process/util;1"]
		                        .createInstance(Components.interfaces.nsIProcess);
		process.init(file);

		// Run the process.
		// If first param is true, calling thread will be blocked until
		// called process terminates.
		// Second and third params are used to pass command-line arguments
		// to the process.
		var args = ["-af", "scaletempo", "-nofontconfig", "http://web.mit.edu/~aresnick/public/star_dorkbot.avi"];
		process.run(false, args, args.length);
	},
		
	/*************************************************************************/
	/******************************* PROGRESS ********************************/
	
	insert_progress_gauges: function(request) {
		var self = this;
		this.prefs.set('progress_state', 'gauges');

		var substate_menu_items = this.make_substate_menu_items('gauges',
			constants.PROGRESS_STATE_ENUM,
			constants.PROGRESS_STATE_TAB_NAMES,
			constants.PROGRESS_STATE_IMAGES);
		var substate_menu = Template.get("progress_submenu").render(
			new Context({ substate_menu_items: substate_menu_items })
		);
		
		var tag_contenttype = self.pddb.ContentType.get_or_null({
			modelname: "Tag"
		});
		var pd_total_this_week = self.pddb.Total.get_or_null({
			contenttype_id: tag_contenttype.id,
			content_id: self.pddb.ProcrasDonate.id,
			datetime: _dbify_date(_end_of_week()),
			timetype_id: self.pddb.Weekly.id
		});
		
		var last_week_date = new Date();
		last_week_date.setDate(last_week_date.getDate() - 7);
		var pd_total_last_week = self.pddb.Total.get_or_null({
			contenttype_id: tag_contenttype.id,
			content_id: self.pddb.ProcrasDonate.id,
			datetime: _dbify_date(_end_of_week(last_week_date)),
			timetype_id: self.pddb.Weekly.id
		});
		
		var this_week_hrs = 0.0;
		if (pd_total_this_week) {
			this_week_hrs = pd_total_this_week.hours().toFixed(1)
		}
		var last_week_hrs = 0.0;
		if (pd_total_last_week) {
			last_week_hrs = pd_total_last_week.hours().toFixed(1)
		}
		var sum = 0.0;
		var count = 0;
		var first_week = null;
		var last_week = null;
		self.pddb.Total.select({
			contenttype_id: tag_contenttype.id,
			content_id: self.pddb.ProcrasDonate.id,
			timetype_id: self.pddb.Weekly.id
		}, function(row) {
			sum += row.hours();
			count += 1;
			if (first_week) {
				first_week = row;
			} else {
				last_week = row;
			}
		}, "datetime");
		var includes_first_and_last_weeks = true;
		if (count > 2) {
			if (first_week) {
				sum -= first_week.hours();
				count -= 1;
			}
			if (last_week) {
				sum -= last_week.hours();
				count -= 1;
			}
			includes_first_and_last_weeks = false;
		}
		var total_hrs = 0.0;
		if (count) {
			total_hrs = (sum / count).toFixed(1);
		}
		
		self.pddb.orthogonals.log("User visited progress page."+
			"\nthis week = "+_start_of_week()+" --- "+_end_of_week()+
			"\nlast week = "+_start_of_week(last_week_date)+" --- "+_end_of_week(last_week_date)+
			"\nthis_week_hrs = "+this_week_hrs+
			"\nlast_week_hrs = "+last_week_hrs+
			"\ntotal_hrs = "+total_hrs+
			"\npd_limit = "+this.prefs.get("pd_hr_per_week_max", constants.DEFAULT_PD_HR_PER_WEEK_MAX)+
			"\nincludes_first_and_last_weeks = "+includes_first_and_last_weeks);
		
		var middle = Template.get("progress_gauges_middle").render(
			new Context({
				substate_menu: substate_menu,
				pd_this_week_hrs: this_week_hrs,
				pd_last_week_hrs: last_week_hrs,
				pd_total_hrs: total_hrs,
				pd_limit: this.prefs.get("pd_hr_per_week_max", constants.DEFAULT_PD_HR_PER_WEEK_MAX),
				includes_first_and_last_weeks: includes_first_and_last_weeks
			})
		);
		request.jQuery("#content").html( middle );
		
		this.activate_substate_menu_items(request, 'gauges',
				constants.PROGRESS_STATE_ENUM, constants.PROGRESS_STATE_INSERTS, constants.PROGRESS_STATE_PROCESSORS);
		
		this.insert_gauges(request, this_week_hrs, last_week_hrs, total_hrs, includes_first_and_last_weeks);
	},
	
	insert_gauges: function(request, pd_this_week_hrs, pd_last_week_hrs, pd_total_hrs) {
		// this injexts into a sandbox, so doesn't help
		//request.inject_script("http://www.google.com/jsapi");
		// this injects the real google gauges api, so doesn't work
		//google.load('visualization', '1', { packages: ['gauge'] } );
		// waits for previous injection
		//google.setOnLoadCallback(drawChart);
		
		// instead, our overlay includes the real google gauges api that gets loaded
		// by the above muck. thus, we already have access to the necessary methods.
		
		var max = _un_prefify_float(this.prefs.get("pd_hr_per_week_max", constants.DEFAULT_PD_HR_PER_WEEK_MAX));
		var goal = _un_prefify_float(this.prefs.get("pd_hr_per_week_goal", constants.DEFAULT_PD_HR_PER_WEEK_GOAL));
		var width = 700;
		
		var pd_this_week_hrs_unlimited = pd_this_week_hrs;
		var pd_last_week_hrs_unlimited = pd_last_week_hrs;
		var pd_total_hrs_unlimited = pd_total_hrs;
		if (pd_this_week_hrs > max) pd_this_week_hrs = max;
		if (pd_last_week_hrs > max) pd_last_week_hrs = max;
		if (pd_total_hrs > max) pd_total_hrs = max;
		
		var data = new google.visualization.DataTable();
		data.addColumn('string', 'Label');
		data.addColumn('number', 'Value');
		data.addRows(3);
		data.setValue(0, 0, 'This Week');
		data.setValue(0, 1, Math.round(pd_this_week_hrs));
		data.setValue(1, 0, 'Last Week');
		data.setValue(1, 1, Math.round(pd_last_week_hrs));
		data.setValue(2, 0, 'Average');
		data.setValue(2, 1, Math.round(pd_total_hrs));

		var chart = new google.visualization.Gauge( request.jQuery("#gauges").get(0) );

		// create labels for major ticks
		var major_tick_labels = [];
		var major_tick_SPACES_count = Math.min(5, max);
		for (var i = 0; i <= major_tick_SPACES_count; i++) {
			major_tick_labels.push( Math.round(max / major_tick_SPACES_count * i) );
		}
		
		var options = {
			width : width,
			height : 250,
			min: 0,
			max: Math.round(max),
			greenFrom : 0,
			greenTo : Math.round(goal),
			redFrom : Math.round(goal),
			redTo : Math.round(max),
			minorTicks : 5,
			majorTicks: major_tick_labels
		};
		chart.draw(data, options);
		
		var happylaptop = constants.MEDIA_URL+"img/laptophappy.png";
		var sadlaptop = constants.MEDIA_URL+"img/laptopsad.png";
		var this_week_laptop = happylaptop;
		var last_week_laptop = happylaptop;
		var total_laptop = happylaptop;
		if (pd_this_week_hrs > goal) this_week_laptop = sadlaptop;
		if (pd_last_week_hrs > goal) last_week_laptop = sadlaptop;
		if (pd_total_hrs > goal) total_laptop = sadlaptop;
		
		var explanation = Template.get("progress_explanation_snippet").render(
			new Context({
				pd_this_week_hrs: pd_this_week_hrs,
				pd_last_week_hrs: pd_last_week_hrs,
				pd_total_hrs: pd_total_hrs,
				pd_this_week_hrs_unlimited: pd_this_week_hrs_unlimited,
				pd_last_week_hrs_unlimited: pd_last_week_hrs_unlimited,
				pd_total_hrs_unlimited: pd_total_hrs_unlimited,
				this_week_laptop: this_week_laptop,
				last_week_laptop: last_week_laptop,
				total_laptop: total_laptop,
				width: width
			})
		);
		request.jQuery("#gauges").after( explanation );
	},
	
	insert_progress_classifications: function(request) {
		var self = this;
		this.prefs.set('progress_state', 'classifications');

		var substate_menu_items = this.make_substate_menu_items('classifications',
			constants.PROGRESS_STATE_ENUM,
			constants.PROGRESS_STATE_TAB_NAMES,
			constants.PROGRESS_STATE_IMAGES);
		var substate_menu = Template.get("progress_submenu").render(
				new Context({ substate_menu_items: substate_menu_items })
			);
	
		var procrasdonate_text = "";
		var timewellspent_text = "";
		var unsorted_text = "";
		
		this.pddb.SiteGroup.select({
			tag_id: self.pddb.ProcrasDonate.id
		}, function(row) {
			procrasdonate_text += self.make_site_box(
				request,
				row.host,
				row.host,
				"procrasdonate"
			);
		});
		
		this.pddb.SiteGroup.select({
			tag_id: self.pddb.TimeWellSpent.id
		}, function(row) {
			timewellspent_text += self.make_site_box(
				request,
				row.host,
				row.host,
				"timewellspent"
			);
		});
		
		this.pddb.SiteGroup.select({
			tag_id: self.pddb.Unsorted.id
		}, function(row) {
			unsorted_text += self.make_site_box(
				request,
				row.host,
				row.host,
				"unsorted"
			);
		});
		
		var middle = Template.get("progress_classifications_middle").render(
			new Context({
				substate_menu: substate_menu,
				constants: constants,
				timewellspent_text: timewellspent_text,
				procrasdonate_text: procrasdonate_text,
				unsorted_text: unsorted_text,
			})
		);
		request.jQuery("#content").html( middle );
		
		this.activate_substate_menu_items(request, 'classifications',
			constants.PROGRESS_STATE_ENUM, constants.PROGRESS_STATE_INSERTS, constants.PROGRESS_STATE_PROCESSORS);
		
		this.activate_site_classifications_middle(request);
	},
	
	make_site_box: function(request, /*sitegroup_id,*/ name, url, tag) {
		var wrapper_template = null;
		switch(tag) {
		case "unsorted":
			wrapper_template = "unsorted_wrap";
			break;
		case "timewellspent":
			wrapper_template = "timewellspent_wrap";
			break;
		case "procrasdonate":
			wrapper_template = "procrasdonate_wrap";
			break;
		default:
			throw new Error("Invalid tag, " + tag + ", in make_site_box");
		}
		
		name = name.replace(/__/g, '/').replace(/\_/g,'.');
		
		var n = "<span class='name'><a href=\"http://"+ url +"\">" + name + "</a></span>";
			//"<span class='sitegroup_id' id='s>" + sitegroup_id + "</span>"
		
		var text = Template.get(wrapper_template).render(new Context({
			inner: n,
			//sitegroup_id: sitegroup_id,
			constants: constants,
		}));
		var context = new Context({
			inner: text,
			constants: constants,
		});
		return Template.get("make_site_box").render(context);
	},
	
	activate_site_classifications_middle: function(request) {
		var self = this;
		//if ( this.prefs.get('site_classifications_settings_activated', false) ) {
			
			var f = function(elem, tag, db_tag) {
				elem.unbind("click");
				
				var site_name = elem.siblings(".name").text();
				elem.parent().fadeOut("slow", function() { 
					request.jQuery(this).remove();
				});
				
				var new_elem = request.jQuery(
					self.make_site_box(request, site_name, site_name, tag)
				);
				
				request.jQuery("#"+tag+"_col .add_website")
					.after(new_elem)
					.next().hide().fadeIn("slow");
				
				new_elem.children(".move_to_timewellspent").click( function() {
					f(request.jQuery(this), "timewellspent", self.pddb.TimeWellSpent);
				});
				new_elem.children(".move_to_unsorted").click( function() {
					f(request.jQuery(this), "unsorted", self.pddb.Unsorted);
				});
				new_elem.children(".move_to_procrasdonate").click( function() {
					f(request.jQuery(this), "procrasdonate", self.pddb.ProcrasDonate);
				});
				
				// alter data in db
				self.pddb.SiteGroup.set({
					tag_id: db_tag.id
				}, {
					host: site_name
				});
			};
			request.jQuery(".move_to_timewellspent").click( function() {
				f(request.jQuery(this), "timewellspent", self.pddb.TimeWellSpent);
			});
			request.jQuery(".move_to_unsorted").click( function() {
				f(request.jQuery(this), "unsorted", self.pddb.Unsorted);
			});
			request.jQuery(".move_to_procrasdonate").click( function() {
				f(request.jQuery(this), "procrasdonate", self.pddb.ProcrasDonate);
			});
			this.prefs.set('site_classifications_settings_activated', false);
		//}
		
		var do_add = function(input) {
			var url = input.attr("value");
			var lower_case_tag_name = input.attr("name");
			var tag = self.pddb.Unsorted;
			if (lower_case_tag_name == "timewellspent") {
				tag = self.pddb.TimeWellSpent;
			} else if (lower_case_tag_name == "procrasdonate") {
				tag = self.pddb.ProcrasDonate;
			}
			var site = self.pddb.Site.get_or_make(url, false, constants.DEFAULT_MAX_IDLE, tag.id);
			
			var new_elem = request.jQuery(
				self.make_site_box(
					request,
					site.sitegroup().name,
					site.sitegroup().host,
					lower_case_tag_name
				));
			
			// add new element to DOM
			request.jQuery("#"+lower_case_tag_name+"_col .add_website")
				.after(new_elem)
				.next().hide().fadeIn("slow");
			
			// add events to new element
			new_elem.children(".move_to_timewellspent").click( function() {
				f(request.jQuery(this), "timewellspent", self.pddb.TimeWellSpent);
			});
			new_elem.children(".move_to_unsorted").click( function() {
				f(request.jQuery(this), "unsorted", self.pddb.Unsorted);
			});
			new_elem.children(".move_to_procrasdonate").click( function() {
				f(request.jQuery(this), "procrasdonate", self.pddb.ProcrasDonate);
			});
			
			// return input description
			input.attr("value", "enter url to classify");
			input.css("color", "#999999");
		};
		
		request.jQuery(".add_website .add").click(function() {
			var input = request.jQuery(this).siblings("input[type=text]");
			do_add(input);
		});
		request.jQuery(".add_website input[type=text]").keydown(function(event) {
			if (event.keyCode == 13) {
				var input = request.jQuery(this);
				do_add(input);
			}
		});
		
		request.jQuery(".add_website input[type=text]")
			.css("color", "#999999")
			.focus(function() {
				if (request.jQuery(this).css("color") != "#000000") {
					// removed input description if haven't already 
					// (don't want to remove entered url)
					request.jQuery(this).attr("value", "");
					request.jQuery(this).css("color", "#000000");
				}
			});
	},
	
	insert_progress_visits: function(request) {
		var self = this;
		this.prefs.set('progress_state', 'visits');

		var substate_menu_items = this.make_substate_menu_items('visits',
			constants.PROGRESS_STATE_ENUM,
			constants.PROGRESS_STATE_TAB_NAMES,
			constants.PROGRESS_STATE_IMAGES);
		var substate_menu = Template.get("progress_submenu").render(
				new Context({ substate_menu_items: substate_menu_items })
			);
		
		var visits = [];
		this.pddb.Visit.select({ enter_at__gte: _dbify_date(_start_of_day()) }, function(row) {
			visits.push(row);
		}, "-enter_at");
		
		var middle = Template.get("progress_visits_middle").render(
			new Context({
				substate_menu: substate_menu,
				constants: constants,
				visits: visits//.slice(0, 100)
			})
		);
		request.jQuery("#content").html( middle );
		
		this.activate_substate_menu_items(request, 'visits',
			constants.PROGRESS_STATE_ENUM, constants.PROGRESS_STATE_INSERTS, constants.PROGRESS_STATE_PROCESSORS);
		
	},
	
	insert_progress_trends: function(request) {
		var self = this;
		this.prefs.set('progress_state', 'trends');

		var substate_menu_items = this.make_substate_menu_items('trends',
			constants.PROGRESS_STATE_ENUM,
			constants.PROGRESS_STATE_TAB_NAMES,
			constants.PROGRESS_STATE_IMAGES);
		var substate_menu = Template.get("progress_submenu").render(
				new Context({ substate_menu_items: substate_menu_items })
			);
		
		var sitegrouptype = self.pddb.ContentType.get_or_null({ modelname: "SiteGroup" });
		var tagtype = self.pddb.ContentType.get_or_null({ modelname: "Tag" });
		
		var sitegroup_totals = [];
		this.pddb.Total.select({
			timetype_id: self.pddb.Forever.id,
			contenttype_id: sitegrouptype.id,
		}, function(row) {
			if (sitegroup_totals.length < 10) {
				sitegroup_totals.push(row);
			}
		}, "-total_time");
		
		var middle = Template.get("progress_trends_middle").render(
			new Context({
				substate_menu: substate_menu,
				constants: constants,
				sitegroup_totals: sitegroup_totals,
				ProcrasDonate: self.pddb.ProcrasDonate,
				TimeWellSpent: self.pddb.TimeWellSpent,
				Unsorted: self.pddb.Unsorted,
				tagtype: tagtype,
				sitegrouptype: sitegrouptype
			})
		);
		request.jQuery("#content").html( middle );
		
		var aset = [tagtype.id, self.pddb.ProcrasDonate.id];
		var bset = [tagtype.id, self.pddb.TimeWellSpent.id];
		
		this.prefs.set("trend_a", aset.join(":"));
		this.prefs.set("trend_b", bset.join(":"));
		
		var data = this.get_trend_data(aset, bset);

		this.insert_trends_graph(request,
				"trend_chart",
				data.A,
				data.B,
				this.get_trend_label(aset),
				this.get_trend_label(bset),
				this.get_trend_color(aset),
				this.get_trend_color(bset, aset, true));
		
		this.activate_trends_checkboxes(request);
		
		this.activate_substate_menu_items(request, 'trends',
			constants.PROGRESS_STATE_ENUM, constants.PROGRESS_STATE_INSERTS, constants.PROGRESS_STATE_PROCESSORS);
	},
	
	/**
	 * @param d: string of the form: 
	 *    contenttype_id:content_id
	 * @param other: has the same form. it is the other trend
	 * 
	 * if go_lighter is true and both trends have the same tag type,
	 * then a lighter color will be returned
	 */
	get_trend_color: function(d, other, go_lighter) {
		if (!d) { return "#000000"; }
		// dark versions of the colors
		var PD_color = "#2277BB";
		var TWS_color = "#BB7722";
		var U_color = "#22BB77";
		// light version of the colors
		var PD_color_lighter = "#44CCFF";
		var TWS_color_lighter = "#FFCC44";
		var U_color_lighter = "#44FFCC";
		
		var self = this;
		var tag_id = null;
		var contenttype = this.pddb.ContentType.get_or_null({ id: d[0] });
		if (contenttype.modelname == "SiteGroup") {
			// get website tag
			var sitegroup = this.pddb.SiteGroup.get_or_null({ id: d[1] });
			tag_id = sitegroup.tag().id;
		} else {
			tag_id = d[1];
		}
		
		// check if need to use lighter color version
		// if so, overwrite colors with lighter version
		if (other && go_lighter) {
			var tag_id_other = null;
			var contenttype = this.pddb.ContentType.get_or_null({ id: other[0] });
			if (contenttype.modelname == "SiteGroup") {
				// get website tag
				var sitegroup = this.pddb.SiteGroup.get_or_null({ id: other[1] });
				tag_id_other = sitegroup.tag().id;
			} else {
				tag_id_other = other[1];
			}
			if (tag_id == tag_id_other) {
				PD_color = PD_color_lighter;
				TWS_color = TWS_color_lighter;
				U_color = U_color_lighter;
			}
		}
	
		if (tag_id == this.pddb.ProcrasDonate.id) {
			return PD_color;
		} else if (tag_id == this.pddb.TimeWellSpent.id) {
			return TWS_color;
		} else {
			return U_color;
		}
	},
	
	/**
	 * @param d: string of the form: 
	 *    contenttype_id:content_id
	 */
	get_trend_label: function(d) {
		if (!d) { return "";}
		
		var self = this;
		var tag_id = null;
		var contenttype = this.pddb.ContentType.get_or_null({ id: d[0] });
		var ret = "";
		if (contenttype.modelname == "SiteGroup") {
			// get website tag
			var sitegroup = this.pddb.SiteGroup.get_or_null({ id: d[1] });
			return ret + sitegroup.host
		} else {
			var tag = this.pddb.Tag.get_or_null({ id: d[1] });
			return ret + tag.tag;
		}
	},
	
	/**
	 * @param A, B: 2-ary tuple: [contenttype id, content id]
	 */
	get_trend_data: function(A, B) {
		//logger("trend data: A "+A+" \nB "+B);
		var self = this;
		
		var A_totals = [];
		if (A) {
			this.pddb.Total.select({
				timetype_id: self.pddb.Daily.id,
				contenttype_id: A[0],
				content_id: A[1]
			}, function(row) {
				A_totals.push(row);
			}, "datetime");
		}
		
		var B_totals = [];
		if (B) {
			this.pddb.Total.select({
				timetype_id: self.pddb.Daily.id,
				contenttype_id: B[0],
				content_id: B[1]
			}, function(row) {
				B_totals.push(row);
			}, "datetime");
		}
		
		return { A: A_totals, B: B_totals }
	},
	
	/**
	 * @param A: list of totals for first trend line
	 * @param B: list of totals for second trend line
	 */
	insert_trends_graph: function(request, div_id, A, B, alabel, blabel, acolor, bcolor) {
		//_pprint(A, "A =\n");
		//_pprint(B, "B =\n");
		
		var data = [];
		data.push("Date,"+alabel+","+blabel);
		
		var A_idx = 0;
		var B_idx = 0;
		while ((A && A_idx < A.length) || (B && B_idx < B.length)) {
			var A_d = null;
			var A_v = null;
			if (A && A_idx < A.length) {
				A_d = A[A_idx].datetime;
				A_v = A[A_idx].hours();
			} 
			var B_d = null;
			var B_v = null;
			if (B && B_idx < B.length) {
				B_d = B[B_idx].datetime;
				B_v = B[B_idx].hours();
			}
			//logger("A_d="+A_d+" date="+_un_dbify_date(A_d)+" A_v="+A_v+
			//		"\nB_d="+B_d+" date="+_un_dbify_date(B_d)+" B_v="+B_v);
			
			if (A_d != null && B_d != null && A_d == B_d) {
				data.push(_un_dbify_date(A_d).strftime("%Y-%m-%d")+","+A_v+","+B_v);
				A_idx += 1;
				B_idx += 1;
			} else if ((B_d == null && A_d != null) || (A_d != null && B_d != null && A_d < B_d)) {
				var x = "";
				if (A && B) { x = A_v+",0"; }
				else { x = A_v; }
				data.push(_un_dbify_date(A_d).strftime("%Y-%m-%d")+","+x);
				A_idx += 1;
			} else if ((B_d != null && A_d == null) || (A_d != null && B_d != null && A_d > B_d)) {
				var x = "";
				if (A && B) { x = "0, "+B_v; }
				else { x = B_v; }
				data.push(_un_dbify_date(B_d).strftime("%Y-%m-%d")+","+x);
				B_idx += 1;
			} else {
				logger("Something unexpected occured while putting trend graph together"+
						"\nA time = "+A_d+", A item = "+A_idx+": "+A[A_idx]+
						"\nB time = "+B_d+", B item = "+B_idx+": "+B[B_idx]);
				A_idx += 1;
				B_idx += 1;
			}
		}
		data = data.join("\n");
		//logger(data, "DATA\n");
		
		request.jQuery("#trend_title_A").text(alabel).css("color", acolor);
		request.jQuery("#trend_title_B").text(blabel).css("color", bcolor);
		if (blabel) { request.jQuery("#trend_title_and").text(" and "); }
		
		// clear existing graph
		request.jQuery("#"+div_id).html("");
		request.jQuery("#legend").html("");
		
		init_dygraph_canvas(request.get_document());
		init_dygraph(request.get_document());
		g = new DateGraph(
				request.jQuery("#"+div_id).get(0),
				data,
				{showRoller: false,
				 //labelsDivWidth: 350,
				 labelsDiv: request.jQuery("#legend").get(0),
				 labelsSeparateLines: true,
				 axisLabelFontSize: 14,
				 pixelsPerXLabel: 50,
				 pixelsPerYLabel: 50,
				 gridLineColor: "#BBBBBB",
				 strokeWidth: 4,
				 highlightCircleSize: 6,
				 colors: [acolor, bcolor],
				 /*xAxisLabelWidth: 50,
				 yAxisLabelWidth: 50*/
				 });
		
		request.jQuery("#trend_chart").children().children().each(function() {
			if ($(this).attr("style").match("bottom: 0px")) {
				$(this).css("margin-bottom", "-.5em");
			}
		});
					
					//overflow: hidden; position: absolute; font-size: 10px; z-index: 10; 
					//color: black; width: 50px; text-align: center; bottom: 0px; left: 226.533px;
	},
	
	activate_trends_checkboxes: function(request) {
		var self = this;
		function set_color(X, acolor) {
			if (X && X.length > 1) {
				request.jQuery(".trend_list[alt="+X[0]+"]")
					.children("ul").children("li").children("."+X[1])
					.parent().css("color", acolor);
			}
		}
		
		request.jQuery("input").click(function() {
			var a = self.prefs.get("trend_a", "");
			var b = self.prefs.get("trend_b", "");
			set_color(a.split(":"), "#000000");
			set_color(b.split(":"), "#000000");
			
			var A = null;
			var B = null;
			
			var e = request.jQuery(this);
			var contenttype_id = e.parent().parent().parent().attr("alt");
			var content_id = e.attr("class");
			var c = contenttype_id+":"+content_id;
			//logger("a = "+a+"\nb = "+b+"\nc = "+c+", checked?"+e.attr("checked"));
			if (e.attr("checked")) {
				if (b) {
					request.jQuery(".trend_list[alt="+a.split(":")[0]+"]")
						.children("ul").children("li").children("."+a.split(":")[1])
						.attr("checked", false);
					a = b;
				}
				b = c;
				self.prefs.set("trend_a", a);
				self.prefs.set("trend_b", b);
				
				A = [a.split(":")[0], a.split(":")[1]];
				B = [contenttype_id, content_id];
			} else {
				if (b) {
					if (a == c) {
						a = b;
					}
					self.prefs.set("trend_a", a);
					self.prefs.set("trend_b", "");
					A = [a.split(":")[0], a.split(":")[1]];
				} else {
					e.attr("checked", true);
				}
			}
			
			var data = self.get_trend_data(A, B);
			
			var acolor = self.get_trend_color(A);
			var bcolor = self.get_trend_color(B, A, true);
			
			set_color(A, acolor);
			set_color(B, bcolor);
			
			self.insert_trends_graph(request,
					"trend_chart",
					data.A,
					data.B,
					self.get_trend_label(A),
					self.get_trend_label(B),
					acolor,
					bcolor);
		});
	},
	
	insert_progress_stacks: function(request) {
		var self = this;
		this.prefs.set('progress_state', 'stacks');

		var substate_menu_items = this.make_substate_menu_items('stacks',
			constants.PROGRESS_STATE_ENUM,
			constants.PROGRESS_STATE_TAB_NAMES,
			constants.PROGRESS_STATE_IMAGES);
		var substate_menu = Template.get("progress_submenu").render(
				new Context({ substate_menu_items: substate_menu_items })
			);
		
		var sitegrouptype = self.pddb.ContentType.get_or_null({ modelname: "SiteGroup" });
		var tagtype = self.pddb.ContentType.get_or_null({ modelname: "Tag" });
		
		var sitegroup_totals = [];
		this.pddb.Total.select({
			timetype_id: self.pddb.Forever.id,
			contenttype_id: sitegrouptype.id,
		}, function(row) {
			if (sitegroup_totals.length < 10) {
				sitegroup_totals.push(row);
			}
		}, "-total_time");
		
		var middle = Template.get("progress_stacks_middle").render(
			new Context({
				substate_menu: substate_menu,
				constants: constants,
				sitegroup_totals: sitegroup_totals,
				ProcrasDonate: self.pddb.ProcrasDonate,
				TimeWellSpent: self.pddb.TimeWellSpent,
				Unsorted: self.pddb.Unsorted,
				tagtype: tagtype,
				sitegrouptype: sitegrouptype
			})
		);
		request.jQuery("#content").html( middle );
		
		var aset = [tagtype.id, self.pddb.ProcrasDonate.id];
		var bset = [tagtype.id, self.pddb.TimeWellSpent.id];
		
		this.prefs.set("trend_a", aset.join(":"));
		this.prefs.set("trend_b", bset.join(":"));
		
		var data = this.get_trend_data(aset, bset);

		this.insert_trends_graph_stacked(request,
				"trend_chart",
				data.A,
				data.B,
				this.get_trend_label(aset),
				this.get_trend_label(bset),
				this.get_trend_color(aset),
				this.get_trend_color(bset, aset, true));
		
		//this.activate_trends_checkboxes(request);
		
		this.activate_substate_menu_items(request, 'stacks',
			constants.PROGRESS_STATE_ENUM, constants.PROGRESS_STATE_INSERTS, constants.PROGRESS_STATE_PROCESSORS);
	},
	
	/**
	 * @param A: list of totals for first trend line
	 * @param B: list of totals for second trend line
	 */
	insert_trends_graph_stacked: function(request, div_id, A, B, alabel, blabel, acolor, bcolor) {
		//_pprint(A, "A =\n");
		//_pprint(B, "B =\n");
		
		var data = [];
		data.push("Date,"+alabel+","+blabel);
		
		var A_idx = 0;
		var B_idx = 0;
		while ((A && A_idx < A.length) || (B && B_idx < B.length)) {
			var A_d = null;
			var A_v = null;
			if (A && A_idx < A.length) {
				A_d = A[A_idx].datetime;
				A_v = A[A_idx].hours();
			} 
			var B_d = null;
			var B_v = null;
			if (B && B_idx < B.length) {
				B_d = B[B_idx].datetime;
				B_v = B[B_idx].hours();
			}
			//logger("A_d="+A_d+" date="+_un_dbify_date(A_d)+" A_v="+A_v+
			//		"\nB_d="+B_d+" date="+_un_dbify_date(B_d)+" B_v="+B_v);
			
			if (A_d != null && B_d != null && A_d == B_d) {
				data.push(_un_dbify_date(A_d).strftime("%Y-%m-%d")+","+A_v+","+B_v);
				A_idx += 1;
				B_idx += 1;
			} else if ((B_d == null && A_d != null) || (A_d != null && B_d != null && A_d < B_d)) {
				var x = "";
				if (A && B) { x = A_v+",0"; }
				else { x = A_v; }
				data.push(_un_dbify_date(A_d).strftime("%Y-%m-%d")+","+x);
				A_idx += 1;
			} else if ((B_d != null && A_d == null) || (A_d != null && B_d != null && A_d > B_d)) {
				var x = "";
				if (A && B) { x = "0, "+B_v; }
				else { x = B_v; }
				data.push(_un_dbify_date(B_d).strftime("%Y-%m-%d")+","+x);
				B_idx += 1;
			} else {
				logger("Something unexpected occured while putting trend graph together"+
						"\nA time = "+A_d+", A item = "+A_idx+": "+A[A_idx]+
						"\nB time = "+B_d+", B item = "+B_idx+": "+B[B_idx]);
				A_idx += 1;
				B_idx += 1;
			}
		}
		data = data.join("\n");
		//logger(data, "DATA\n");
		
		request.jQuery("#trend_title_A").text(alabel).css("color", acolor);
		request.jQuery("#trend_title_B").text(blabel).css("color", bcolor);
		if (blabel) { request.jQuery("#trend_title_and").text(" and "); }
		
		// clear existing graph
		request.jQuery("#"+div_id).html("");
		
		init_raphael(request.get_document());
		init_graphael();
		init_graphael_bar();
		var paper = Raphael(div_id, 540, 480,
			fin = function () {
	            this.flag = paper.g.popup(this.bar.x, this.bar.y, this.bar.value || "0").insertBefore(this);
	        },
	        fout = function () {
	            this.flag.animate({opacity: 0}, 300, function () {this.remove();});
	        });
		paper.g.hbarchart(
				330,
				10,
				300,
				220,
				[[55, 20, 13, 32, 5, 1, 2, 10],
				 [10, 2, 1, 5, 32, 13, 20, 55]],
				{stacked: true}).hover(fin, fout);
		
		//request.jQuery("#legend").html("");
		
		/*
		init_dygraph_canvas(request.get_document());
		init_dygraph(request.get_document());
		g = new DateGraph(
				request.jQuery("#"+div_id).get(0),
				data,
				{showRoller: false,
				 //labelsDivWidth: 350,
				 labelsDiv: request.jQuery("#legend").get(0),
				 labelsSeparateLines: true,
				 axisLabelFontSize: 14,
				 pixelsPerXLabel: 50,
				 pixelsPerYLabel: 50,
				 gridLineColor: "#BBBBBB",
				 strokeWidth: 4,
				 highlightCircleSize: 6,
				 colors: [acolor, bcolor],
				 xAxisLabelWidth: 50,
				 yAxisLabelWidth: 50
				 });
		
		request.jQuery("#trend_chart").children().children().each(function() {
			if ($(this).attr("style").match("bottom: 0px")) {
				$(this).css("margin-bottom", "-.5em");
			}
		});*/
					
					//overflow: hidden; position: absolute; font-size: 10px; z-index: 10; 
					//color: black; width: 50px; text-align: center; bottom: 0px; left: 226.533px;
	},
	
	
	insert_progress_averages: function(request) {
		var self = this;
		this.prefs.set('progress_state', 'averages');

		var substate_menu_items = this.make_substate_menu_items('averages',
			constants.PROGRESS_STATE_ENUM,
			constants.PROGRESS_STATE_TAB_NAMES,
			constants.PROGRESS_STATE_IMAGES);
		var substate_menu = Template.get("progress_submenu").render(
				new Context({ substate_menu_items: substate_menu_items })
			);
		
		var middle = Template.get("progress_averages_middle").render(
			new Context({
				substate_menu: substate_menu,
				constants: constants,
			})
		);
		request.jQuery("#content").html( middle );
		
		this.insert_averages_graph(request);
		
		this.activate_substate_menu_items(request, 'averages',
			constants.PROGRESS_STATE_ENUM, constants.PROGRESS_STATE_INSERTS, constants.PROGRESS_STATE_PROCESSORS);
	},
	
	insert_averages_graph: function(request) {
		var self = this;
		
		// day of week x hour of day
		//var data_matrix = [];
		var data_array = [];
		var xs = [];
		var ys = []
		// initialize data
		for (var day = 0; day < 7; day++) {
			//data_matrix[day] = [];
			for (var hour = 0; hour < 24; hour++) {
				//data_matrix[day][hour] = 0;
				var idx = day*hour + hour;
				data_array[idx] = 0;
				xs[idx] = hour;
				ys[idx] = day;
			}
		}
		logger("computed defaults");
		// sum visits into data
		this.pddb.Visit.select({}, function(row) {
			if (row.site().sitegroup().tag().id == self.pddb.ProcrasDonate.id) {
				var d = _un_dbify_date(row.enter_at);
				var day = d.getDay() - 1;
				if (day == -1) { day = 6; }
				var hour = d.getHours();
				var v = parseInt(row.duration);
				if (isNaN(v)) {
					logger(" NaN!! "+row.duration);
					v = 0;
				}
				//data_matrix[day][d.getHours()] += parseInt(row.duration);
				data_array[day*hour + hour] = 5;//+= v;
			}
		}/*, "enter_at"*/);
		logger("computed data");
		// create dot graph
		init_raphael(request.get_document());
		init_graphael();
		init_graphael_dot();
		logger("init raphael");
		var paper = Raphael("chart");
		xs = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
		ys = [7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
	    data_array = [294, 300, 204, 255, 348, 383, 334, 217, 114, 33, 44, 26, 41, 39, 52, 17, 13, 2, 0, 2, 5, 6, 64, 153, 294, 313, 195, 280, 365, 392, 340, 184, 87, 35, 43, 55, 53, 79, 49, 19, 6, 1, 0, 1, 1, 10, 50, 181, 246, 246, 220, 249, 355, 373, 332, 233, 85, 54, 28, 33, 45, 72, 54, 28, 5, 5, 0, 1, 2, 3, 58, 167, 206, 245, 194, 207, 334, 290, 261, 160, 61, 28, 11, 26, 33, 46, 36, 5, 6, 0, 0, 0, 0, 0, 0, 9, 9, 10, 7, 10, 14, 3, 3, 7, 0, 3, 4, 4, 6, 28, 24, 3, 5, 0, 0, 0, 0, 0, 0, 4, 3, 4, 4, 3, 4, 13, 10, 7, 2, 3, 6, 1, 9, 33, 32, 6, 2, 1, 3, 0, 0, 4, 40, 128, 212, 263, 202, 248, 307, 306, 284, 222, 79, 39, 26, 33, 40, 61, 54, 17, 3, 0, 0, 0, 3, 7, 70, 199];
	    var axisy = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
	    var axisx = ["12am", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12pm", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"];
	    
	    logger("DATA ARRAY length = "+data_array.length+" "+xs.length+" "+ys.length);
	    //_pprint(data_array, "DATA");
	    
	    paper.g.txtattr.font = "11px 'Fontin Sans', Fontin-Sans, sans-serif";
	    
	    xs   = [0,1,2,0,1,2,0,1,2];
	    yx   = [2,2,2,1,1,1,0,0,0];
	    data_array = [3,4,1,9,2,4,3,0,0];
    
	    paper.g.dotchart(
	    		100,
	    		100,
	    		620,
	    		260,
	    		xs,
	    		ys,
	    		data_array);
	    		/*{	symbol: "o",
	    			max: 10,
	    			heat: true,
	    			axis: "0 0 1 1",
	    			axisxstep: 2,
	    			axisystep: 2,
	    			axisxlabels: axisx,
	    			axisxtype: " ",
	    			axisytype: " ",
	    			axisylabels: axisy });*//*.hover(function () {
	    				this.tag = this.tag || paper.g.tag(this.x, this.y, this.value, 0, this.r + 2).insertBefore(this);
	    				this.tag.show();
	    			}, function () {
	    				this.tag && this.tag.hide();
	    			});*/
	    logger("drawn graph");
	},
	
	/*************************************************************************/
	/******************************* REGISTER ********************************/
	
	insert_register_incentive: function(request) {
		var self = this;
		this.prefs.set('register_state', 'incentive');
		
		var substate_menu_items = this.make_substate_menu_items('incentive',
				constants.REGISTER_STATE_ENUM, constants.REGISTER_STATE_TAB_NAMES);
		var substate_menu = Template.get("register_submenu").render(
				new Context({
					substate_menu_items: substate_menu_items,
					submenu_id: "register_track"
				}));
		var arrows = Template.get("register_arrows").render(
				new Context({ substate_menu_items: substate_menu_items }));
		
		var middle = Template.get("register_incentive_middle").render(
			new Context({
				substate_menu_items: substate_menu_items,
				substate_menu: substate_menu,
				arrows: arrows,
				constants: constants,
				pd_dollars_per_hr: self.retrieve_float_for_display('pd_dollars_per_hr', constants.DEFAULT_PD_DOLLARS_PER_HR),
				pd_hr_per_week_goal: self.retrieve_float_for_display('pd_hr_per_week_goal', constants.DEFAULT_PD_HR_PER_WEEK_GOAL),
				pd_hr_per_week_max: self.retrieve_float_for_display('pd_hr_per_week_max', constants.DEFAULT_PD_HR_PER_WEEK_MAX),
			})
		);
		request.jQuery("#content").html( middle );
		
		this.activate_substate_menu_items(request, 'incentive',
				constants.REGISTER_STATE_ENUM, constants.REGISTER_STATE_INSERTS, constants.REGISTER_STATE_PROCESSORS);
		
		this.activate_register_incentive(request);
		
		this.insert_example_gauges(request);
	},
	
	activate_register_incentive: function(request) {
		var self = this;

		request.jQuery("input[name='pd_hr_per_week_goal']").keyup(function() {
			request.jQuery("#goal_error").text("");
			var value = request.jQuery.trim(request.jQuery(this).attr("value"));
			if (!value) { return; }
			
			if ( !self.validate_hours_input(value) ) {
				request.jQuery("#goal_error").text("Please enter number of hours. For example, to strive for 8 hrs and 15 minutes, please enter 1.25");
			} else {
				self.prefs.set('pd_hr_per_week_goal', self.clean_hours_input(value));
				self.insert_example_gauges(request);
			}
		});
		
		request.jQuery("input[name='pd_hr_per_week_max']").keyup(function() {
			request.jQuery("#max_error").text("");
			var value = request.jQuery.trim(request.jQuery(this).attr("value"));
			if (!value) { return; }
			
			if ( !self.validate_hours_input(value) ) {
				request.jQuery("#max_error").text("Please enter number of hours. For example, enter 30 minutes as .5");
			} else {
				self.prefs.set('pd_hr_per_week_max', self.clean_hours_input(value));
				self.insert_example_gauges(request);
			}
		});
	},
	
	insert_example_gauges: function(request) {
		var max = _un_prefify_float(this.prefs.get("pd_hr_per_week_max", constants.DEFAULT_PD_HR_PER_WEEK_MAX));
		var goal = _un_prefify_float(this.prefs.get("pd_hr_per_week_goal", constants.DEFAULT_PD_HR_PER_WEEK_GOAL));
		
		/*
		var happy_example = goal / 2;
		if (Math.round(happy_example) == goal) { happy_example -= 1; }
		
		var unhappy_example = (max - goal) / 2 + goal;
		if (Math.round(unhappy_example) == goal) { unhappy_example += 1; }
		
		this.insert_example_gauge(request, goal, max, happy_example, "happy_example_gauge");
		this.insert_example_gauge(request, goal, max, unhappy_example, "unhappy_example_gauge");
		*/
		this.insert_example_gauge(request, goal, max, 0, "happy_example_gauge");
	},
	
	insert_example_gauge: function(request, goal, max, value, id) {
		var self = this;
		
		var width = 300;
		var data = new google.visualization.DataTable();
		data.addColumn('string', 'Label');
		data.addColumn('number', 'Value');
		data.addRows(1);
		data.setValue(0, 0, 'hours per week');
		data.setValue(0, 1, value);

		var chart = new google.visualization.Gauge( request.jQuery("#"+id).get(0) );

		// create labels for major ticks
		var major_tick_labels = [];
		var major_tick_SPACES_count = Math.min(5, max);
		for (var i = 0; i <= major_tick_SPACES_count; i++) {
			major_tick_labels.push( Math.round(max / major_tick_SPACES_count * i) );
		}
		
		var options = {
			width : width,
			height : 250,
			min: 0,
			max: Math.round(max),
			greenFrom : 0,
			greenTo : Math.round(goal),
			redFrom : Math.round(goal),
			redTo : Math.round(max),
			minorTicks : 5,
			majorTicks: major_tick_labels
		};
		chart.draw(data, options);
		
		var first = true;
		var r = request.jQuery("text").get(0);
		if (r) { request.jQuery(r).css("font-size", "1.1em"); }
		request.jQuery("g g text").attr("stroke", "#DDDDDD");
	},
	
	process_register_incentive: function(request) {
		var self = this;
		var pd_dollars_per_hr = request.jQuery("input[name='pd_dollars_per_hr']").attr("value");
		var pd_hr_per_week_goal = request.jQuery("input[name='pd_hr_per_week_goal']").attr("value");
		var pd_hr_per_week_max = request.jQuery("input[name='pd_hr_per_week_max']").attr("value");

		request.jQuery("#errors").text("");
		if ( !this.validate_dollars_input(pd_dollars_per_hr) ) {
			request.jQuery("#rate_error").text("Please enter a valid dollar amount. For example, to donate $2.34 per hour, please enter 2.34");
			
		} else if ( !this.validate_hours_input(pd_hr_per_week_goal) ) {
			request.jQuery("#goal_error").text("Please enter number of hours. For example, to strive for 8 hrs and 15 minutes, please enter 1.25");
			
		} else if ( !this.validate_hours_input(pd_hr_per_week_max) ) {
			request.jQuery("#max_error").text("Please enter number of hours. For example, enter 30 minutes as .5");
			
		} else if (parseFloat(pd_hr_per_week_goal) > parseFloat(pd_hr_per_week_max)) { 
			request.jQuery("#max_error").text("You maximum hours cannot be less than your goal");

		} else {
			this.prefs.set('pd_dollars_per_hr', this.clean_dollars_input(pd_dollars_per_hr));
			this.prefs.set('pd_hr_per_week_goal', this.clean_hours_input(pd_hr_per_week_goal));
			this.prefs.set('pd_hr_per_week_max', this.clean_hours_input(pd_hr_per_week_max));
			return true;
		}
		return false;
	},

	RECIPIENT_PERCENT_COLORS: [
		"#b4daf4",
		"#e92928",
		"#77c375",
		"#fbc236",
		"#ee9feb",
		"#f9cade",
		"#3f5caa",
		"#f6e801",
		"#d1c1c4",
		"#d0ea23"],
	
	insert_register_charities: function(request) {
		var self = this;
		this.prefs.set('register_state', 'charities');
		
		var substate_menu_items = this.make_substate_menu_items('charities',
				constants.REGISTER_STATE_ENUM, constants.REGISTER_STATE_TAB_NAMES);
		var substate_menu = Template.get("register_submenu").render(
			new Context({
				substate_menu_items: substate_menu_items,
				submenu_id: "register_track"
			}));
		var arrows = Template.get("register_arrows").render(
				new Context({ substate_menu_items: substate_menu_items }));
		
		var categories = [];
		this.pddb.Category.select({}, function(row) {
			categories.push(row)
		});
		
		var chosen_charities = [];
		var chosen_charities_rows = [];
		this.pddb.RecipientPercent.select({}, function(row) {
			var recipient = row.recipient();
			if (recipient.bool_is_visible()) {
				var html = Template.get("recipient_with_percent_snippet").render(
					new Context({
						constants: constants,
						deep_recip_pct: row,
						percent_color: self.RECIPIENT_PERCENT_COLORS[chosen_charities.length]
					})
				);
				chosen_charities.push(html);
				chosen_charities_rows.push(recipient);
			}
		}, "-percent");
		
		var staff_picks = [];
		var recently_added = [];
		this.pddb.Recipient.select({}, function(row) {
			if (row.bool_is_visible()) {
				var chosen = false;
				_iterate(chosen_charities_rows, function(key, value, index) {
					if (value.id == row.id) { chosen = true; }
				});
				if (!chosen) {
					var html = Template.get("recipient_snippet").render(
						new Context({
							constants: constants,
							recipient: row
						})
					);
					if (row.slug == "bilumi") {
						staff_picks.push(html);
					} else {
						recently_added.push(html);
					}
				}
			}
		});
		
		var middle = Template.get("register_charities_middle").render(
			new Context({
				constants: constants,
				substate_menu_items: substate_menu_items,
				substate_menu: substate_menu,
				arrows: arrows,
				categories: categories,
				chosen_charities: chosen_charities,
				staff_picks: staff_picks,
				recently_added: recently_added
			})
		);
		request.jQuery("#content").html( middle );
		
		this.insert_register_charities_pie_chart(request);
		this.activate_register_charities(request);
		
		this.activate_substate_menu_items(request, 'charities',
			constants.REGISTER_STATE_ENUM, constants.REGISTER_STATE_INSERTS, constants.REGISTER_STATE_PROCESSORS);
	},
	
	insert_register_charities_pie_chart: function(request) {
		var self = this;
		var data = [];
		var legend = [];
		var colors = [];
		this.pddb.RecipientPercent.select({}, function(row) {
			data.push(row.display_percent());
			legend.push(row.recipient().name+" ("+row.display_percent()+"%)");
			colors.push(self.RECIPIENT_PERCENT_COLORS[colors.length]);
		}, "-percent");
		
		init_raphael(request.get_document());
		init_graphael();
		init_graphael_pie();
		// clear existing chart
		request.jQuery("#pie_chart").html("");
		// create pie chart
		var paper = Raphael("pie_chart", 550, 250);
		var pie = paper.g.piechart(125, 125, 100,
				data,
				{ legend: legend,
				  legendpos: "east",
				  colors: colors });

		// add cool effects (copied from g.raphael demo)
        pie.hover(function () {
            this.sector.stop();
            this.sector.scale(1.1, 1.1, this.cx, this.cy);
            if (this.label) {
                this.label[0].stop();
                this.label[0].scale(1.5);
                this.label[1].attr({"font-weight": 800});
            }
        }, function () {
            this.sector.animate({scale: [1, 1, this.cx, this.cy]}, 500, "bounce");
            if (this.label) {
                this.label[0].animate({scale: 1}, 500, "bounce");
                this.label[1].attr({"font-weight": 400});
            }
        });
	},
	
	activate_register_charities: function(request) {
		var self = this;
		// activate add and remove buttons per recipient
		request.jQuery(".recipient").each( function() {
			self.activate_a_recipient(request, request.jQuery(this));
		});
		// activate recipient suggestion
		request.jQuery("#new_recipient_submit").click(function() {
			var value = request.jQuery("#new_recipient_name").attr("value").trim();
			if (!value || value == "") return
			
			var slug = slugify(value);
			if (!slug || slug == "") {
				slug = "blank_" + parseInt(Math.random()*10000)
			}
			// ensure unique slug
			if (self.pddb.Recipient.get_or_null({ slug: slug })) {
				slug = slug + "_" + parseInt(Math.random()*10000);
			}
			// create User Created category if necessary
			var category = self.pddb.Category.get_or_create({ category: "User Created" });
			// create recipient and recipient percent
			var recipient = self.pddb.Recipient.create({
				slug: slug,
				name: value,
				category_id: category.id,
				is_visible: _dbify_bool(true),
				pd_registered: _dbify_bool(false)
			});
			var recipient_pct = self.pddb.RecipientPercent.create({
				recipient_id: recipient.id,
				percent: 0
			});
			// insert into DOM
			var html = Template.get("recipient_with_percent_snippet").render(
				new Context({
					constants: constants,
					deep_recip_pct: recipient_pct
				})
			);
			var x = request.jQuery(html);
			request.jQuery("#chosen_charities").prepend(x);
			// clear input
			request.jQuery("#new_recipient_name").attr("value", "");
			self.activate_a_recipient(request, x);
			self.insert_register_charities_pie_chart(request);
		});
	},
	
	/**
	 * redistribute lost points among remaining selected charities
	 * @param amount: float amount to redistribute (0, 1)
	 * 		a negative amount will be subtracted from percents
	 * @param not_id: id of the recipient percent from which the
	 * 		redistribution is coming from. thus, don't redistribute to it
	 */
	redistribute_percents: function(amount, not_id) {
		if (!amount) { return; }
		var self = this;
		// calculate the count based on percents eligible for redistribution
		var count = 0;
		self.pddb.RecipientPercent.select({}, function(row) {
			if (not_id && row.id == not_id) { return }
			if (parseFloat(row.percent) <= 0 && amount < 0) { return }
			if (parseFloat(row.percent) >= 1 && amount > 0) { return }
			count += 1;
		});
		if (count > 0) {
			var each = amount / count;
			var total_redistributed = 0;

			self.pddb.RecipientPercent.select({}, function(row) {
				// don't redistribute to source recipient percent
				if (not_id && row.id == not_id) { return }
				if (parseFloat(row.percent) <= 0 && amount < 0) { return }
				if (parseFloat(row.percent) >= 1 && amount > 0) { return }
				
				var amt = parseFloat(row.percent) + each;
				if (amt < 0) { amt = 0; }
				if (amt > 1) { amt = 1; }
				total_redistributed += amt - parseFloat(row.percent)
				self.pddb.RecipientPercent.set({
					percent: amt
				}, {
					id: row.id
				});
			});
			
			//logger("TOTAL RED "+total_redistributed+", ORIG AMOUNT "+amount);
			
			// might have left-overs to redistribute if a percent got capped at 0 or 1
			if (Math.abs(total_redistributed) > 0.001 &&
					Math.abs(total_redistributed - amount) > 0.001) {
				self.redistribute_percents((amount - total_redistributed), not_id); 
			}
		}
	},
	
	update_displayed_percents: function(request) {
		var self = this;
		//request.jQuery("#chosen_charities").html("");
		var i = 0;
		self.pddb.RecipientPercent.select({}, function(row) {
			/*
			var html = Template.get("recipient_with_percent_snippet").render(
				new Context({
					deep_recip_pct: row,
					percent_color: self.RECIPIENT_PERCENT_COLORS[i]
				})
			);
			//request.jQuery("#chosen_charities").append( html );
			*/
			
			// set percent amount on recipient with percent
			request.jQuery(".recipient[alt="+row.recipient_id+"]")
			.children(".recipient_percent")
				.children(".percent")
				.text(row.display_percent());
			
			// set dot background color on recipient with percent
			request.jQuery(".recipient[alt="+row.recipient_id+"]")
			.children(".recipient_percent")
				.children(".pie_sector_color")
				.css("background", self.RECIPIENT_PERCENT_COLORS[i]);
			
			i += 1;
		}, "-percent");
		/*
		 * reinserts all the recipient with percent blocks
		request.jQuery("#chosen_charities").children(".recipient").each( function() {
			self.activate_a_recipient(request, request.jQuery(this));
		});
		*/
	},
	
	/*
	 * initial percents -> action -> outcome
	 * -------------------------------------
	 * 1. percents should always sum to 100%
	 * 2. percents should always be integers?
	 * 3. philosophy of add and remove:
	 *      make no changes to other percents
	 *      because ?? might be part of larger action (eg, swap)
	 * 
	 * []         -> add Z    -> [Z:100]
	 * [A:x]      -> add Z    -> [A:x, Z:0]
	 * [A:x, B:y] -> add Z    -> [A:x, B:y, Z:0]
	 * [A:x, B:y] -> remove B -> [A:x]
	 * [A:x]      -> remove A -> []
	 * 
	 * 4. philosophy of up and down:
	 *      +/- 5 to acted on percent--capped at 0-100
	 *      redistribute lost 5 evenly amongst others
	 * 
	 * [A:x, B:y, C:z] -> C+5 -> [A:x-2, B:y-3, C:z+5]
	 * [A:x, B:y]      -> B+5 -> [A:x-5, B:y-5]
	 * [A:x]           -> A+5 -> [A:x]
	 */
	activate_a_recipient: function(request, recipient_elem) {
		var self = this;
		recipient_elem.children(".recipient_id").hide();
		
		var dtoggle = recipient_elem.children(".mission").children(".description_toggle");
		dtoggle.click( function() {
			if (dtoggle.text() == "(less)") {
				dtoggle.text("(more)");
				dtoggle.parent().siblings(".description").hide();
			} else {
				dtoggle.text("(less)");
				dtoggle.parent().siblings(".description").show();
			}
		})
		if (dtoggle.text() == "(less)") {
			dtoggle.text("(more)")
			dtoggle.parent().siblings(".description").hide();
		}
		
		var user_recipients_div = request.jQuery("#chosen_charities");
		var potential_recipients_div = request.jQuery("#removed_charities_temporary");
		
		recipient_elem.children(".add_recipient").children(".add_img").click(function() {
			//logger("ADD RECIP");
			var recipient_id = request.jQuery(this).parent().siblings(".recipient_id").text();
			var recipient = self.pddb.Recipient.get_or_null({ id: recipient_id });
			// percent is 0 unless no other recipients are selected
			// total percent should always sum to 1.
			var percent = 0;
			if (self.pddb.RecipientPercent.count() == 0) {
				percent = 1;
			}
			var recipient_pct = self.pddb.RecipientPercent.create({
				recipient_id: recipient_id,
				percent: percent
			});
			request.jQuery(this).parent().parent().fadeOut("slow", function() {
				request.jQuery(this).remove();
			});
			
			var new_recip = request.jQuery(
					Template.get("recipient_with_percent_snippet").render(
							new Context({ deep_recip_pct: recipient_pct })));
			
			user_recipients_div.append(new_recip);
			self.activate_a_recipient(request, new_recip);
			self.insert_register_charities_pie_chart(request);
			self.update_displayed_percents(request);
		});
		
		//recipient_elem.css("background", "red");
		//recipient_elem.children(".remove_recipient").css("background", "green");
		//recipient_elem.children(".remove_recipient").children(".remove_img").css("border", "4px solid black");
		
		recipient_elem.children().children().children().children()
			.children().children(".remove_recipient").children(".remove_img").click(function() {
			//logger("REMOVE RECIP: "+request.jQuery(this).attr("class"));
			
			var r_elem = request.jQuery(this).parent().parent().parent().parent()
				.parent().parent().parent();

			var recipient_id = r_elem.children(".recipient_id").text();
			
			var rp = self.pddb.RecipientPercent.get_or_null({
				recipient_id: recipient_id });
			
			var remove_pct = parseFloat(rp.percent);
			
			self.pddb.RecipientPercent.del({
				recipient_id: recipient_id
			});
			
			self.redistribute_percents(remove_pct);
			
			// add unselected charity to unselected section
			var recipient = self.pddb.Recipient.get_or_null({ id: recipient_id });
			
			//request.jQuery(this).parent().clone(true).insertAfter(spacer);
			r_elem.fadeOut("slow", function() {
				request.jQuery(this).remove();
			});
			
			var context = new Context({
				constants: constants,
				recipient: recipient
			});
			var new_recip = request.jQuery(Template.get("recipient_snippet").render(context));
			
			potential_recipients_div.prepend(new_recip);
			self.activate_a_recipient(request, new_recip);
			self.insert_register_charities_pie_chart(request);
			self.update_displayed_percents(request);
		});
		
		recipient_elem.children(".recipient_percent").children(".up_arrow, .down_arrow").click(function() {
			//logger("UP OR DOWN");
			// arrows only work if there are multiple recipient percents
			if (self.pddb.RecipientPercent.count() == 1) {
				return;
			}
			
			// using recipient_elem doesn't work
			// var id = recipient_elem.children(".recipient_id").text();
			var id = request.jQuery(this).parent().siblings(".recipient_id").text();

			var r = self.pddb.Recipient.get_or_null({
				id: id
			});
			var rp = r.recipient_percent();
			
			var new_pct = 0;
			if (request.jQuery(this).attr("class") == "up_arrow") {
				new_pct = parseFloat(rp.percent) + .05;
			} else if (request.jQuery(this).attr("class") == "down_arrow") {
				new_pct = parseFloat(rp.percent) - .05;
			} else {
				self.pddb.orthogonals.warn("Up or Down recipient percent Arrow is not up or down! "+request.jQuery(this).attr("class"));
			}
			if (new_pct > 1) { new_pct = 1; }
			if (new_pct < 0) { new_pct = 0; }
			
			self.pddb.RecipientPercent.set({
				percent: new_pct
			}, {
				id: rp.id
			});
			
			var diff = parseFloat(rp.percent) - new_pct;
			self.redistribute_percents(diff, rp.id);
			
			self.insert_register_charities_pie_chart(request);
			self.update_displayed_percents(request);
		});
	},
	
	process_register_charities: function(request) {
		var self = this;
		var ret = true;
		request.jQuery("#errors").html("");
		
		request.jQuery(".recipient_percent input").each( function() {
			var percent = request.jQuery(this).attr("value");
			try {
				percent = parseFloat(percent) / 100.0;
				if (percent <= 0 || percent > 1.0) {
					request.jQuery("#errors").append("<p>Please enter a percent greater than 0 and at most 100</p>");
					ret = false;
				}
			} catch(e) {
				request.jQuery("#errors").append("<p>Please enter a number, such as 5.24 for 5.24%</p>");
				ret = false;
			}
			var recipient_id = request.jQuery(this).parent().siblings(".recipient_id").text();
			if (ret && percent && recipient_id) {
				self.pddb.RecipientPercent.set({ percent: percent }, { recipient_id: recipient_id });
			}
		});
		if (self.pddb.RecipientPercent.count() == 0) {
			ret = false
			request.jQuery("#errors").append("<p>Please add at least one recipient</p>");
		}
		return ret;
	},
	
	insert_register_content: function(request) {
		var self = this;
		this.prefs.set('register_state', 'content');
		
		var substate_menu_items = this.make_substate_menu_items('content',
				constants.REGISTER_STATE_ENUM, constants.REGISTER_STATE_TAB_NAMES);
		var substate_menu = Template.get("register_submenu").render(
			new Context({
				substate_menu_items: substate_menu_items,
				submenu_id: "register_track"
			}));
		var arrows = Template.get("register_arrows").render(
			new Context({ substate_menu_items: substate_menu_items }));
		
		var middle = Template.get("register_content_middle").render(
			new Context({
				substate_menu_items: substate_menu_items,
				substate_menu: substate_menu,
				arrows: arrows,
				tws_dollars_per_hr: self.retrieve_float_for_display('tws_dollars_per_hr', constants.DEFAULT_TWS_DOLLARS_PER_HR),
				//tws_hr_per_week_goal: self.retrieve_float_for_display('tws_hr_per_week_goal', constants.DEFAULT_TWS_HR_PER_WEEK_GOAL),
				tws_hr_per_week_max: self.retrieve_float_for_display('tws_hr_per_week_max', constants.DEFAULT_TWS_HR_PER_WEEK_MAX),
			})
		);
		request.jQuery("#content").html( middle );
		
		this.activate_substate_menu_items(request, 'content',
			constants.REGISTER_STATE_ENUM, constants.REGISTER_STATE_INSERTS, constants.REGISTER_STATE_PROCESSORS);
	},
	
	process_register_content: function(request) {
		var self = this;
		var tws_dollars_per_hr = request.jQuery("input[name='tws_dollars_per_hr']").attr("value");
		//var tws_hr_per_week_goal = request.jQuery("input[name='tws_hr_per_week_goal']").attr("value");
		var tws_hr_per_week_max = request.jQuery("input[name='tws_hr_per_week_max']").attr("value");

		request.jQuery("#errors").text("");
		if ( !this.validate_dollars_input(tws_dollars_per_hr) ) {
			request.jQuery("#errors").append("<p>Please enter a valid dollar amount. For example, to donate $2.34 per hour, please enter 2.34</p>");
			
		//} else if ( !this.validate_hours_input(tws_hr_per_week_goal) ) {
		//	request.jQuery("#errors").append("<p>Please enter number of hours. For example, to strive for 8 hrs and 15 minutes, please enter 1.25</p>");
			
		} else if ( !this.validate_hours_input(tws_hr_per_week_max) ) {
			request.jQuery("#errors").append("<p>Please enter number of hours. For example, enter 30 minutes as .5</p>");
			
		} else {
			this.prefs.set('tws_dollars_per_hr', this.clean_dollars_input(tws_dollars_per_hr));
			//this.prefs.set('tws_hr_per_week_goal', this.clean_hours_input(tws_hr_per_week_goal));
			this.prefs.set('tws_hr_per_week_max', this.clean_hours_input(tws_hr_per_week_max));
			return true;
		}
		return false;
	},
	

	insert_register_support: function(request) {
		var self = this;
		this.prefs.set('register_state', 'support');
		
		var substate_menu_items = this.make_substate_menu_items('support',
				constants.REGISTER_STATE_ENUM, constants.REGISTER_STATE_TAB_NAMES);
		var substate_menu = Template.get("register_submenu").render(
			new Context({
				substate_menu_items: substate_menu_items,
				submenu_id: "register_track"
			}));
		var arrows = Template.get("register_arrows").render(
			new Context({ substate_menu_items: substate_menu_items }));
		
		var middle = Template.get("register_support_middle").render(
			new Context({
				substate_menu_items: substate_menu_items,
				substate_menu: substate_menu,
				arrows: arrows,
				support_pct: self.retrieve_percent_for_display('support_pct', constants.DEFAULT_SUPPORT_PCT),
				monthly_fee: self.retrieve_float_for_display('monthly_fee', constants.DEFAULT_MONTHLY_FEE),
			})
		);
		request.jQuery("#content").html( middle );
		
		this.activate_register_support(request);
		
		this.activate_substate_menu_items(request, 'support',
			constants.REGISTER_STATE_ENUM, constants.REGISTER_STATE_INSERTS, constants.REGISTER_STATE_PROCESSORS);
	},
	
	activate_register_support: function(request) {
		/*logger("JQUERY VIEW NORMAL");
		var keys = [];
		for (var k in request.jQuery) { keys.push(k); }
		_pprint(keys);
		
		var jq = request.jQuery;
		
		logger("JQUERY VIEW VAR");
		var keys = [];
		for (var k in jq) { keys.push(k); }
		_pprint(keys);
		
		jQuery_UI(request);
		
		var jq = _bind(request, request.jQuery);
		
		logger("JQUERY VIEW BIND");
		var keys = [];
		for (var k in jq) { keys.push(k); }
		_pprint(keys);*/
		
		//var jq = requestjQuery;
		//jq("#monthly_fee").effect("bounce");
		//jq("#monthly_fee_slider").slider({ handle: ".ui-slider-handle" });
		//jq("#monthly_fee_slider").slider();
		//jq("#frame_for_slider").append("<div id=\"monthly_fee_slider\"></div>");

		//////////////////////////////////////////////////////////////////
		var jq = request.add_jQuery_ui();
		jq("#monthly_fee_slider").slider();
		//////////////////////////////////////////////////////////////////
		
		//var slider = new Slider(request.jQuery);
		
		//jQuery_UI(jq);
		
		//var handle = $("<div class=\"ui-slider-handle\"></div>")
		//request.jQuery("#monthly_fee_slider").append(handle);
		//jq("#monthly_fee_slider").slider({ handle: handle });
	},
	
	process_register_support: function(request) {
		var self = this;
		var support_pct = request.jQuery("input[name='support_pct']").attr("value");
		var monthly_fee = request.jQuery("input[name='monthly_fee']").attr("value");

		request.jQuery(".error").text("");
		if ( !this.validate_positive_float_input(support_pct) ) {
			request.jQuery("#support_error").append("<p>Please enter a valid percent. For example, 6.75 for 6.75%</p>");
			
		} else if ( !this.validate_dollars_input(monthly_fee) ) {
			request.jQuery("#monthly_error").append("<p>Please enter a valid amount. For example, 4.99 for $4.99</p>");
			
		} else if ( parseFloat(support_pct) > 10.0 ) {
			request.jQuery("#support_error").append("<p>We cannot accept more than 10%. Please enter a lower percent. For example, 10 for 10%.</p>");
		} else {
			this.prefs.set('support_pct', this.clean_percent_input(support_pct));
			this.prefs.set('monthly_fee', this.clean_dollars_input(monthly_fee));
			return true;
		}
		return false;
	},
	
	insert_register_updates: function(request) {
		var self = this;
		this.prefs.set('register_state', 'updates');
		
		var substate_menu_items = this.make_substate_menu_items('updates',
				constants.REGISTER_STATE_ENUM, constants.REGISTER_STATE_TAB_NAMES);
		var substate_menu = Template.get("register_submenu").render(
			new Context({
				substate_menu_items: substate_menu_items,
				submenu_id: "register_track"
			}));
		var arrows = Template.get("register_arrows").render(
			new Context({ substate_menu_items: substate_menu_items }));
		
		var middle = Template.get("register_updates_middle").render(
			new Context({
				constants: constants,
				substate_menu_items: substate_menu_items,
				substate_menu: substate_menu,
				arrows: arrows,
				email: self.prefs.get('email', constants.DEFAULT_EMAIL),
				tax_deductions: _un_dbify_bool(self.prefs.get('tax_deductions', constants.DEFAULT_ELIGIBLE_FOR_TAX_DEDUCTIONS)),
				tos: _un_dbify_bool(self.prefs.get('tos', constants.DEFAULT_TOS)),
			})
		);
		request.jQuery("#content").html( middle );
		
		this.insert_tax_deductions_middle(request);
		
		this.activate_substate_menu_items(request, 'updates',
			constants.REGISTER_STATE_ENUM, constants.REGISTER_STATE_INSERTS, constants.REGISTER_STATE_PROCESSORS);
	},
	
	insert_tax_deductions_middle: function(request) {
		var self = this;
		
		var address_field_names = ["first_name", "last_name", "mail_address",
		                           "city", "state", "zip", "country"];
		var address_fields = [];
		_iterate(address_field_names, function(key, value, index) {
			address_fields.push({
				name: value,
				display: _displayable(value),
				value: self.prefs.get(value, '')
			});
		});
		
		var middle = Template.get("tax_deductions_middle").render(
			new Context({
				weekly_affirmations: _un_dbify_bool(self.prefs.get('weekly_affirmations', constants.DEFAULT_WEEKLY_AFFIRMATIONS)),
				org_thank_yous: _un_dbify_bool(self.prefs.get('org_thank_yous', constants.DEFAULT_ORG_THANK_YOUS)),
				org_newsletters: _un_dbify_bool(self.prefs.get('org_newsletters', constants.DEFAULT_ORG_NEWSLETTERS)),
				tax_deductions: _un_dbify_bool(self.prefs.get('tax_deductions', constants.DEFAULT_TAX_DEDUCTIONS)),
				address_fields: address_fields
			}));
		request.jQuery("#tax_deductions_middle").html( middle );
		
		this.activate_register_updates(request);
	},
	
	activate_register_updates: function(request) {
		var self = this;
		
		request.jQuery(".tax_deductions_radio").click(function() {
			var value = request.jQuery(this).attr("value");
			if (value == "yes") {
				self.prefs.set('tax_deductions', true);
				request.jQuery(".tax_deductions input").attr("disabled", false);
				request.jQuery(".not_tax_deductions input").attr("disabled", true);
				request.jQuery(".tax_deductions").removeClass("disabled");
				request.jQuery(".not_tax_deductions").addClass("disabled");
				
				self.prefs.set('org_thank_yous', true);
				self.prefs.set('org_newsletters', true);
				request.jQuery(".tax_deductions input[name=org_thank_yous]").attr("checked", true);
				request.jQuery(".tax_deductions input[name=org_newsletters]").attr("checked", true);
			} else {
				self.prefs.set('tax_deductions', _dbify_bool(false));
				request.jQuery(".tax_deductions input").attr("disabled", true);
				request.jQuery(".not_tax_deductions input").attr("disabled", false);
				request.jQuery(".tax_deductions").addClass("disabled");
				request.jQuery(".not_tax_deductions").removeClass("disabled");
				
				self.prefs.set('org_thank_yous', false);
				self.prefs.set('org_newsletters', false);
				request.jQuery(".not_tax_deductions input[name=org_thank_yous]").attr("checked", false);
				request.jQuery(".not_tax_deductions input[name=org_newsletters]").attr("checked", false);
			}
			//self.insert_tax_deductions_middle(request);
		});
		
		request.jQuery("input[type=text]").keyup(function() {
			var name = request.jQuery(this).attr("name");
			var value = request.jQuery(this).attr("value");
			self.prefs.set(name, value);
		});
		
		request.jQuery(".comm_radio").change(function() {
			var name = request.jQuery(this).attr("name");
			var value = request.jQuery(this).attr("checked");
			self.prefs.set(name, value);
		});
	},
	
	process_register_updates: function(request) {
		request.jQuery("#error").text("");
		var ret = true;
		
		var old_email = this.prefs.set('email', constants.DEFAULT_EMAIL);
		var email = request.jQuery("#email").attr("value").trim();
		
		var weekly_affirmations = request.jQuery("#weekly_affirmations").attr("checked");
		var org_thank_yous = request.jQuery("#org_thank_yous").attr("checked");
		var org_newsletters = request.jQuery("#org_newsletters").attr("checked");
		var tos = request.jQuery("#tos").attr("checked");
		
		this.prefs.set('email', email);
		this.prefs.set('weekly_affirmations', _dbify_bool(weekly_affirmations));
		this.prefs.set('org_thank_yous', _dbify_bool(org_thank_yous));
		this.prefs.set('org_newsletters', _dbify_bool(org_newsletters));
		this.prefs.set('tos', _dbify_bool(tos));
		
		if (!tos) {
			request.jQuery("#error").text("To use our service you must agree to the terms of service by checking the Terms of Service checkbox below");
			ret = false;
		}
		
		if (old_email != email) {
			this.pd_api.send_data();
		}
		
		if (this.prefs.get('tax_deductions', constants.DEFAULT_TAX_DEDUCTIONS)) {
			var address_field_names = ["first_name", "last_name", "mail_address",
			                           "city", "state", "zip", "country"];
			_iterate(address_field_names, function(key, value, index) {
				var value = request.jQuery("input[name="+value+"]").attr("value");
				if (!value) {
					request.jQuery("#error").text("To be eligible for tax deductions, you must provide your mailing address.");
					ret = false;
				}
			});
		}
		return ret
	},
	
	/**
	 * return maximum amount that would be paid at user's rate and limit
	 * for the given min_auth_time.
	 */
	calculate_max_amount: function(pd_dollars_per_hr, pd_hr_per_week_max, min_auth_time, monthly_fee) {
		var support_method = this.prefs.get('support_method', constants.DEFAULT_SUPPORT_METHOD);
		if (support_method != "monthly") {
			monthly_fee = 0;
		}
		var max_per_week = pd_dollars_per_hr * pd_hr_per_week_max + (monthly_fee / 4.348);
		var total_weeks = 0;
		if (min_auth_time.units == "months" || min_auth_time.units == "month") {
			// 4.348 is the avg number weeks per month
			total_weeks = min_auth_time.time * (365.25 / 12.0 / 7.0);
		} else if (min_auth_time.units == "weeks" || min_auth_time.units == "week") {
			total_weeks = min_auth_time.time;
		} else if (min_auth_time.units == "years" || min_auth_time.units == "year") {
			// 52.12 is the avg number of weeks per year
			total_weeks = min_auth_time.time * (365.25 / 7.0);
		}
		return total_weeks * max_per_week;
	},
	
	insert_register_payments: function(request) {
		var self = this;
		this.prefs.set('register_state', 'payments');
		
		var substate_menu_items = this.make_substate_menu_items('payments',
				constants.REGISTER_STATE_ENUM, constants.REGISTER_STATE_TAB_NAMES);
		var substate_menu = Template.get("register_submenu").render(
				new Context({
					substate_menu_items: substate_menu_items,
					submenu_id: "register_track"}));
		var arrows = Template.get("register_arrows").render(
				new Context({ substate_menu_items: substate_menu_items }));

		// money/time information
		var pd_dollars_per_hr = self.retrieve_float_for_display('pd_dollars_per_hr', constants.DEFAULT_PD_DOLLARS_PER_HR);
		var pd_hr_per_week_max = self.retrieve_float_for_display('pd_hr_per_week_max', constants.DEFAULT_PD_HR_PER_WEEK_MAX);
		var min_auth_time = {
			time: _un_prefify_float(self.prefs.get('min_auth_time', constants.DEFAULT_MIN_AUTH_TIME)),
			units: self.prefs.get('min_auth_units', constants.DEFAULT_MIN_AUTH_UNITS),
		};
		var monthly_fee = _un_prefify_float(self.prefs.get('monthly_fee', constants.DEFAULT_MONTHLY_FEE));
		var max_amount_paid = self.calculate_max_amount(
				pd_dollars_per_hr,
				pd_hr_per_week_max,
				min_auth_time,
				monthly_fee);
		
		var multi_auth = self.pddb.FPSMultiuseAuthorization.most_recent();
		var multi_auth_status = "";
		if (multi_auth) {
			multi_auth_status = Template.get("multi_auth_status").render(
				new Context({ multi_auth: multi_auth })
			);
		}
		
		// form parameters
		var form_params = [
			{ name: "global_amount_limit", value: parseInt(max_amount_paid+1) },
			{ name: "caller_reference", value: create_caller_reference() },
			{ name: "timestamp", value: _dbify_date(new Date()) },
			{ name: "is_recipient_cobranding", value: true },
			{ name: "payment_method", value: "ABT,ACH,CC" },
			{ name: "payment_reason", value: this.prefs.get('fps_payment_reason', constants.DEFAULT_PAYMENT_REASON) },
			{ name: "recipient_slug_list", value: "all" },
			{ name: "version", value: this.prefs.get('fps_version', constants.DEFAULT_FPS_CBUI_VERSION) },
			{ name: "private_key", value: this.prefs.get('private_key', constants.DEFAULT_PRIVATE_KEY) },
		];

		var middle = Template.get("register_payments_middle").render(
				new Context({
					constants: constants,
					substate_menu_items: substate_menu_items,
					substate_menu: substate_menu,
					arrows: arrows,
					support_method: self.prefs.get('support_method', constants.DEFAULT_SUPPORT_METHOD), 
					pd_dollars_per_hr: self.retrieve_float_for_display('pd_dollars_per_hr', constants.DEFAULT_PD_DOLLARS_PER_HR),
					pd_hr_per_week_goal: self.retrieve_float_for_display('pd_hr_per_week_goal', constants.DEFAULT_PD_HR_PER_WEEK_GOAL),
					pd_hr_per_week_max: self.retrieve_float_for_display('pd_hr_per_week_max', constants.DEFAULT_PD_HR_PER_WEEK_MAX),
					min_auth_time: min_auth_time,
					max_amount_paid: parseInt(max_amount_paid+1),
					multi_auth_status: multi_auth_status,
					
					multi_auth: multi_auth,
					form_params: form_params,
					action: constants.PD_URL + constants.AUTHORIZE_MULTIUSE_URL
				})
			);
		request.jQuery("#content").html( middle );
		
		this.activate_substate_menu_items(request, 'payments',
			constants.REGISTER_STATE_ENUM, constants.REGISTER_STATE_INSERTS, constants.REGISTER_STATE_PROCESSORS);
		
		this.insert_support_middle(request);
		
		this.activate_register_payments(request);
		
		// Receive updates from server
		this.pd_api.request_data_updates(
			function() {
				logger("SERVER SAYS YAY");
				// after success
				var multi_auth = self.pddb.FPSMultiuseAuthorization.get_latest_success()
				logger("multi auth="+multi_auth);
				if (!multi_auth) {
					multi_auth = self.pddb.FPSMultiuseAuthorization.most_recent();
					logger("B multi auth="+multi_auth);
				}
				if (multi_auth.good_to_go()) {
					logger("C multi auth="+multi_auth);
					self.insert_register_done(request);
					return
				}
				
				var html = "";
				if (multi_auth) {
					html = Template.get("multi_auth_status").render(new Context({
						multi_auth: multi_auth,
						server_dont_know: true
					}));
				}
				request.jQuery("#multi_auth_status").html( html );
			}, function() {
				// after failure
			}
		);
	},
		
	insert_support_middle: function(request) {
		var self = this;
		
		var middle = Template.get("support_middle").render(
			new Context({
				support_method: self.prefs.get('support_method', constants.DEFAULT_SUPPORT_METHOD),
				support_pct: self.retrieve_percent_for_display('support_pct', constants.DEFAULT_SUPPORT_PCT),
				monthly_fee: self.retrieve_float_for_display('monthly_fee', constants.DEFAULT_MONTHLY_FEE),
			}));
		request.jQuery("#support_middle").html( middle );
		
		this.activate_support_middle(request);
	},
	
	activate_support_middle: function(request) {
		var self = this;
		
		request.jQuery(".support_method_radio").click(function() {
			var value = request.jQuery(this).attr("value");
			self.prefs.set('support_method', value);
			//self.insert_support_middle(request);
			if (value == "monthly") {
				request.jQuery(".support_method_monthly input").attr("disabled", false);
				request.jQuery(".support_method_monthly").removeClass("disabled");
				
				request.jQuery(".support_method_percent input").attr("disabled", true);
				request.jQuery(".support_method_percent").addClass("disabled");
			} else {
				request.jQuery(".support_method_monthly input").attr("disabled", true);
				request.jQuery(".support_method_monthly").addClass("disabled");
				
				request.jQuery(".support_method_percent input").attr("disabled", false);
				request.jQuery(".support_method_percent").removeClass("disabled");
			}
			self.adjust_amazon_params(request);
		});
		
		request.jQuery("#support_pct").keyup(function() {
			var support_pct = request.jQuery(this).attr("value");
			request.jQuery(".error").text("");
			
			if ( !self.validate_positive_float_input(support_pct) ) {
				request.jQuery("#support_error").append("<p>Please enter a valid percent. For example, 6.75 for 6.75%</p>");
			} else if ( parseFloat(support_pct) > 10.0 ) {
				request.jQuery("#support_error").append("<p>We cannot accept more than 10%. Please enter a lower percent. For example, 10 for 10%.</p>");
			} else {
				self.prefs.set('support_pct', self.clean_percent_input(support_pct));
			}
		});
		
		request.jQuery("#monthly_fee").keyup(function() {
			var monthly_fee = request.jQuery(this).attr("value");
			request.jQuery(".error").text("");
			
			if ( !self.validate_dollars_input(monthly_fee) ) {
				request.jQuery("#monthly_error").append("<p>Please enter a valid amount. For example, 4.99 for $4.99</p>");
			} else {
				self.prefs.set('monthly_fee', self.clean_dollars_input(monthly_fee));
				self.adjust_amazon_params(request);
			}
		});
	},
		
	activate_register_payments: function(request) {
		var self = this;
		request.jQuery("#min_auth_time_input").keyup(function() {
			var time = null;
			try {
				time = parseFloat(request.jQuery(this).attr("value"));
			} catch(e) {
				self.pddb.orthogonals.log("activate_register_payments: user entered non-float time: "+request.jQuery(this).attr("value"));
			}
			if (!time) return
			self.prefs.set('min_auth_time', _prefify_float(time));
			self.adjust_amazon_params(request);
		});
	},
	
	adjust_amazon_params: function(request) {
		var self = this;
		
		var time = _un_prefify_float(self.prefs.get('min_auth_time', constants.DEFAULT_MIN_AUTH_TIME));
		var pd_dollars_per_hr = self.retrieve_float_for_display('pd_dollars_per_hr', constants.DEFAULT_PD_DOLLARS_PER_HR);
		var pd_hr_per_week_max = self.retrieve_float_for_display('pd_hr_per_week_max', constants.DEFAULT_PD_HR_PER_WEEK_MAX);
		
		var min_auth_time = {
			time: time,
			units: self.prefs.get('min_auth_units', constants.DEFAULT_MIN_AUTH_UNITS),
		};
		var monthly_fee = _un_prefify_float(self.prefs.get('monthly_fee', constants.DEFAULT_MONTHLY_FEE));
		var max_amount_paid = self.calculate_max_amount(
				pd_dollars_per_hr,
				pd_hr_per_week_max,
				min_auth_time,
				monthly_fee);
		
		request.jQuery("#max_amount_paid").text(Math.ceil(max_amount_paid));
		request.jQuery(".global_amount_limit").attr("value", Math.ceil(max_amount_paid));
		request.jQuery("#min_auth_time_display").text(min_auth_time.time);
		request.jQuery("#min_auth_units_display").text(min_auth_time.units);
	},
	
	process_register_payments: function(request) {
		return true
	},
	
	insert_register_done: function(request) {
		alert("INSERT REGISTER DONE!");
		this.prefs.set('registration_done', true);
		//this.insert_register_time_well_spent(request);

		var unsafeWin = request.get_unsafeContentWin();//event.target.defaultView;
		if (unsafeWin.wrappedJSObject) {
			unsafeWin = unsafeWin.wrappedJSObject;
		}
		
		// raises [Exception... "Illegal value" nsresult: "0x80070057 
		// (NS_ERROR_ILLEGAL_VALUE)" location: "JS frame :: 
		// chrome://procrasdonate/content/js/views.js :: anonymous :: line 834" data: no]
		
		// NOTE: INCLUDE THE DOMAIN!!
		// raises the following error when not given a full url
		// Error: Component is not available = NS_ERROR_NOT_AVAILABLE
		// Source file: chrome://procrasdonate/content/js/ext/jquery-1.2.6.js
		// Line: 2020
		var version = this.prefs.get("version", ver);
		var url = constants.PD_URL + constants.AFTER_INSTALL_URL + version + "/";
		new XPCNativeWrapper(unsafeWin, "location").location = url;
	}, 
	
	process_register_done: function(request) {
		return true
	},
	
	insert_register_time_well_spent: function(request) {
		var self = this;
		this.prefs.set('register_state', 'time_well_spent');
		
		var middle = Template.get("register_time_well_spent_middle").render(
			new Context({
				constants: constants,
				tws_dollars_per_hr: self.retrieve_float_for_display('tws_dollars_per_hr', constants.DEFAULT_TWS_DOLLARS_PER_HR),
				tws_hr_per_week_goal: self.retrieve_float_for_display('tws_hr_per_week_goal', constants.DEFAULT_TWS_HR_PER_WEEK_GOAL),
				tws_hr_per_week_max: self.retrieve_float_for_display('tws_hr_per_week_max', constants.DEFAULT_TWS_HR_PER_WEEK_MAX),
			})
		);
		request.jQuery("#content").html( middle );
		
		this.activate_register_time_well_spent(request);
	},
	
	activate_register_time_well_spent: function(request) {
		var self = this;

		request.jQuery("input").keyup(function() {
			request.jQuery(this).siblings(".error").text("");
			var name = request.jQuery(this).attr("name");
			var value = request.jQuery.trim(request.jQuery(this).attr("value"));
			if (!value) { value = "0"; }
			
			if ( !self.validate_hours_input(value) ) {
				request.jQuery(this).siblings(".error").text("Please enter a number");
			} else {
				self.prefs.set(name, _prefify_float(value));
			}
		});
		
		request.jQuery(".done").click(function() {
			self.insert_register_time_well_spent_done(request);
		});
	},
	
	insert_register_time_well_spent_done: function(request) {
		this.prefs.set('registration_done', true);
		var unsafeWin = request.get_unsafeContentWin();//event.target.defaultView;
		if (unsafeWin.wrappedJSObject) {
			unsafeWin = unsafeWin.wrappedJSObject;
		}
		
		// raises [Exception... "Illegal value" nsresult: "0x80070057 
		// (NS_ERROR_ILLEGAL_VALUE)" location: "JS frame :: 
		// chrome://procrasdonate/content/js/views.js :: anonymous :: line 834" data: no]
		
		// NOTE: INCLUDE THE DOMAIN!!
		// raises the following error when not given a full url
		// Error: Component is not available = NS_ERROR_NOT_AVAILABLE
		// Source file: chrome://procrasdonate/content/js/ext/jquery-1.2.6.js
		// Line: 2020
		new XPCNativeWrapper(unsafeWin, "location").location = constants.PD_URL + constants.SETTINGS_URL;
	}, 
	
	/*************************************************************************/
	/************************** TESTS AND CHECKS *****************************/
	
	add_random_visits: function() {
		var self = this;
		
		var test1 = this.pddb.SiteGroup.create_from_url("test_pd.com", self.pddb.ProcrasDonate);
		var test2 = this.pddb.SiteGroup.create_from_url("test_tws.com", self.pddb.TimeWellSpent);
		
		// add visits for last four weeks
		// this week
		var start = _start_of_day();
		var times = [_dbify_date(start)];
		// last week
		start.setDate(start.getDate() - 7);
		times.push( _dbify_date(start) );
		// two weeks ago
		start.setDate(start.getDate() - 7*2);
		times.push( _dbify_date(start) );
		// three weeks ago
		start.setDate(start.getDate() - 7*3);
		times.push( _dbify_date(start) );
		
		_iterate(times, function(key, time, index) {
			var duration = 1000 + Math.floor(Math.random()*1000);
			var urls = ["http://test_pd.com/apage.html",
			            "http://test_pd.com/bpage.html",
			            "http://test_pd.com/apage.html",
			            "http://test_pd.com/bpage.html",
			            "http://test_pd.com/apage.html",
			            
			            "http://test_tws.com/cpage.html",
			            "http://test_tws.com/cpage.html",
			            "http://test_tws.com/cpage.html",
			            "http://test_tws.com/cpage.html",
			            "http://test_tws.com/cpage.html",
			            "http://test_tws.com/cpage.html"];
			for (var i = 0; i < urls.length; i++) {
				// add at least 2000 seconds to start time
				// times the number of visits already done
				myOverlay.init_listener.time_tracker.store_visit(urls[i], time + i*2000, duration);
			}
		});
	},

	///
	/// Triggers schedule run
	///
	trigger_schedule_run: function() {
		logger("triggering schedule run...");
		this.schedule.run();
		logger("...daily schedule done");
	},
	
	///
	/// Triggers daily cycle. Does not reset 24hr period state.
	///
	trigger_daily_cycle: function() {
		logger("triggering daily cycle...");
		this.schedule.do_once_daily_tasks();
		logger("...daily cycle done");
	},
	
	///
	/// Triggers weekly cycle. Does not reset weekly period state.
	///
	trigger_weekly_cycle: function() {
		logger("triggering weekly cycle...");
		this.schedule.do_once_weekly_tasks();
		logger("...weekly cycle done");
	},
	
	///
	/// Triggers payment. Does not reset payment period.
	///
	trigger_payment: function() {
		logger("triggering payment...");
		this.pd_api.make_payments_if_necessary(true);
		logger("...payment done");
	},
	
	trigger_on_install: function() {
		myOverlay.init_listener.onInstall(this.prefs.get("version","0.0.0"));
	},
	
	trigger_on_upgrade: function() {
		myOverlay.init_listener.onUpgrade("0.3.6", "0.3.7");
	},
	
	trigger_init_db: function() {
		this.pddb.init_db();
	},
	
	test_messages: function() {
		var self = this;
		
		var t, t2, t3, t4, t5 = null;
		self.pddb.Total.select({
			contenttype_id: self.pddb.ContentType.get_or_null({ modelname: "SiteGroup" }).id
		}, function(row) {
			if (!t) { t = row; }
			else if (!t2) { t2 = row; }
			else if (!t3) { t3 = row; }
			else if (!t4) { t4 = row; }
			else if (!t5) { t5 = row; }
		}, "-total_time");
		
		function message_test(
				pd_hrs_one_week, pd_hrs_two_week, pd_hrs_three_week,
				pd_hr_per_week_goal, pd_dollars_per_hr, pd_hr_per_week_max,
				start_date_friendly, end_date_friendly, expected) {
			
			[message, subject] = self.schedule.create_message_logic(
					pd_hrs_one_week, pd_hrs_two_week, pd_hrs_three_week,
					1,2,3,
					6,7,8,
					pd_hr_per_week_goal, pd_dollars_per_hr, pd_hr_per_week_max,
					2.22, 22,
					start_date_friendly, end_date_friendly,
					t, t2, t2,
					t3, t3, t4,
					t4, t5, t5);
			
			var actual = subject.split(" ");
			_pprint(actual);
			if (actual.length > 3) {
				actual = actual[3];
			}
			
			logger("\none week = "+pd_hrs_one_week+
					"\ntwo week = "+pd_hrs_two_week+
					"\nthree week = "+pd_hrs_three_week+
					"\ngoal = "+pd_hr_per_week_goal+
					"\n"+subject);
					//"\n"+subject+
					//"\n"+message);

			if (actual != expected) {
				logger("############# TEST FAILED: expected:"+expected+" actual:"+actual+
						"\none week = "+pd_hrs_one_week+
						"\ntwo week = "+pd_hrs_two_week+
						"\nthree week = "+pd_hrs_three_week+
						"\ngoal = "+pd_hr_per_week_goal+
						"\n"+subject);/*+
						"\n"+message);*/
				return 1
			} else {
				return 0
			}
		}
		
		var fails = 0;
		fails += message_test(8, 10, 12, 13, 1, 20, "12/22", "12/28", "Winning streak"); // winning streak
		fails += message_test(8, 10, 12, 11, 1, 20, "12/22", "12/28", "Good work"); // good work
		fails += message_test(8, 10, 12,  9, 1, 20, "12/22", "12/28", "Good work"); // good work
		fails += message_test(8, 10, 12,  7, 1, 20, "12/22", "12/28", "Getting better"); // getting better
		
		fails += message_test(12, 10, 8, 13, 1, 20, "12/22", "12/28", "Winning streak"); // 
		fails += message_test(12, 10, 8, 11, 1, 20, "12/22", "12/28", "Downturn"); // 
		fails += message_test(12, 10, 8,  9, 1, 20, "12/22", "12/28", "Getting worse"); // 
		fails += message_test(12, 10, 8,  7, 1, 20, "12/22", "12/28", "Getting worse"); // 
		
		fails += message_test(8, 12, 10, 13, 1, 20, "12/22", "12/28", "Winning streak"); // 
		fails += message_test(8, 12, 10, 11, 1, 20, "12/22", "12/28", "Good work"); // 
		fails += message_test(8, 12, 10,  9, 1, 20, "12/22", "12/28", "Good work"); // 
		fails += message_test(8, 12, 10,  7, 1, 20, "12/22", "12/28", "Getting better"); // 
		
		fails += message_test(10, 12, 8, 13, 1, 20, "12/22", "12/28", "Winning streak"); // 
		fails += message_test(10, 12, 8, 11, 1, 20, "12/22", "12/28", "Good work"); // 
		fails += message_test(10, 12, 8,  9, 1, 20, "12/22", "12/28", "Getting better"); // 
		fails += message_test(10, 12, 8,  7, 1, 20, "12/22", "12/28", "Getting better"); // 
		
		fails += message_test(10, 8, 12, 13, 1, 20, "12/22", "12/28", "Winning streak"); // 
		fails += message_test(10, 8, 12, 11, 1, 20, "12/22", "12/28", "Good work"); // 
		fails += message_test(10, 8, 12,  9, 1, 20, "12/22", "12/28", "Downturn"); // 
		fails += message_test(10, 8, 12,  7, 1, 20, "12/22", "12/28", "Getting worse"); // 
		
		fails += message_test(12, 8, 10, 13, 1, 20, "12/22", "12/28", "Winning streak"); // 
		fails += message_test(12, 8, 10, 11, 1, 20, "12/22", "12/28", "Downturn"); // 
		fails += message_test(12, 8, 10,  9, 1, 20, "12/22", "12/28", "Downturn"); // 
		fails += message_test(12, 8, 10,  7, 1, 20, "12/22", "12/28", "Getting worse"); // 
		
		fails += message_test(null, null, null, 13, 1, 20, "12/22", "12/28", "No ProcrasDonation"); // 
		
		fails += message_test(12, null, null, 13, 1, 20, "12/22", "12/28", "Good job"); // 
		fails += message_test(12, null, null, 12, 1, 20, "12/22", "12/28", "Good job"); // 
		fails += message_test(12, null, null, 11, 1, 20, "12/22", "12/28", "You can do better"); // 
		
		fails += message_test(10, 8, null, 7, 1, 20, "12/22", "12/28", "Getting worse"); // 
		fails += message_test(10, 8, null, 9, 1, 20, "12/22", "12/28", "Downturn"); // 
		fails += message_test(10, 8, null, 11, 1, 20, "12/22", "12/28", "Good work"); // 
		
		fails += message_test(10, 12, null, 9, 1, 20, "12/22", "12/28", "Getting better"); // 
		fails += message_test(10, 12, null, 10, 1, 20, "12/22", "12/28", "Good work"); // 
		fails += message_test(10, 12, null, 13, 1, 20, "12/22", "12/28", "Good work"); // 
		
		fails += message_test(10, 10, null, 10, 1, 20, "12/22", "12/28", "Pinball champion"); //
		
		logger(">>>>>>>>> "+fails+" failures");
	},
	
	/**
	 * Sends a specific set of data to check that everything goes through exactly right,
	 * and so that data reception can be tested manually by server.
	 */
	send_fake_data: function() {
		this.pd_api.send_fake_data();
	},
	
	manual_test_suite: function(request) {
		var actions = ["trigger_daily_cycle",
		               "trigger_weekly_cycle",
		               "trigger_schedule_run",
		               "send_fake_data",
		               ".",
		               "trigger_payment",
		               ".",
		               "trigger_on_install",
		               "trigger_on_upgrade",
		               "trigger_init_db",
		               ".",
		               "test_messages",
		               ".",
		               "reset_state_to_defaults",
		               "reset_account_to_defaults",
		               "initialize_state",
		               "add_random_visits"];
		var html = Template.get("manual_test_suite").render(new Context({
			actions: actions
		}));
		request.jQuery("#content").append( html );

		var self = this;
		for (var i = 0; i < actions.length; i++) {
			var action = actions[i];
			request.jQuery("#"+action).click(
				// closure to call self[action].
				// extra function needed to provide appropriate 'this'
				(function(a) { return function() {
					self[a]();
				}})(action)
				//// the above code is complicated to remember, anyway.
				//self._self_fn(action);
			);
		}
	},
	
	///
	/// wanted to use this instead of above, but kept getting errors on
	///     self._self_fn(action)
	/// said missing closing ")" ?!
	/// wanted to use apply so could be used for _proceed as well
	///
	_self_fn: function(fnname) {
		var self = this;
		return function() {
			//self[fnname].apply(self, args);
			//self[fname](request);
			//self[event](request);
			logger("inside _self_fn for "+fnname);
		};
	},
	
	visual_debug: function(request) {
		var actions = ["show_requires_payment"];
		var html = Template.get("visual_debug").render(new Context({
			actions: actions
		}));
		request.jQuery("#content").append( html );

		var self = this;
		for (var i = 0; i < actions.length; i++) {
			var action = actions[i];
			request.jQuery("#"+action).click(
				// closure to call self[action].
				// extra function needed to provide appropriate 'this'
				(function(a) { return function() {
					self[a](request);
				}})(action)
				//// the above code is complicated to remember, anyway.
				//self._self_fn(action);
			);
		}
	},
	
	show_requires_payment: function(request) {
		var self = this;
		var html = ["<ol>"];
		this.pddb.RequiresPayment.select({}, function(row) {
			var rp = Template.get("requires_payment").render(
				new Context({ rp: row }));
			html.push("<li>"+rp+"</li>");
		});
		html.push("</ol>")
		request.jQuery("#theatre").html( html.join("\n\n") );
	},

	/// run tester tests (mutates db) and checker checks 
	/// (checks db) on test database
	automatic_test_suite: function(request, is_autotester) {
		var tester = new PDTests(this.pddb, this.prefs);
		var checker = new PDChecks(this.pddb, this.prefs);
		
		var testrunner = new TestRunner(request);
		var self = this;
		
		testrunner.test("Check *REAL DATA* Requires Payments", function() {
			checker.check_requires_payments(testrunner);
		});
		
		testrunner.test("Check *REAL DATA* Payment Total Taggings", function() {
			checker.check_payment_total_taggings(testrunner);
		});
		
		testrunner.test("Check *REAL DATA* Payments", function() {
			checker.check_payments(testrunner);
		});
		
		var original_pddb = self.pddb;
		
		try {
			self.pddb = new PDDB("test.0.sqlite");
			self.pddb.init_db();
			
			testrunner.test("Test Update Totals", function() {
				tester.test_update_totals(testrunner);
			});
			
			testrunner.test("Check Requires Payments", function() {
				checker.check_requires_payments(testrunner);
			});
			
			testrunner.test("Check Payment Total Taggings", function() {
				checker.check_payment_total_taggings(testrunner);
			});
			
			testrunner.test("Check Payments", function() {
				checker.check_payments(testrunner);
			});
			
			/// WARNING: this uses setTimeout to test blur/focus,
			///          idle/back, start/stop-recording....
			///          tests after this one should worry about interference!
			
			/// WARNING 2: this test requires the tester to continuous move 
			///            their mouse but not click so that IDLE isn't
			///            inadvertantly triggered in the middle of the test.
			///            the test runs for at least 5 minute.
			/*testrunner.test("Test Idle/Back-Focus/Blur Combos", function() {
				self.pddb.tester.test_idle_focus_combos(testrunner, self.display_test_results);
			});*/
		} catch(e) {
			self.pddb.orthogonals.error(e+"\n\n"+e.stack);
		}
		
		self.pddb = original_pddb;
		
		self.display_test_results(testrunner, is_autotester);

		logger("automatic test suite done");
	},
	
	/// run TIMING tester tests (mutates db) and checker checks 
	/// (checks db) on test database
	/// see WARNINGS below
	timing_test_suite: function(request) {
		var tester = new PDTests(this.pddb, this.prefs);
		var checker = new PDChecks(this.pddb, this.prefs);
		
		var testrunner = new TestRunner(request);
		var self = this;
		
		var original_pddb = self.pddb;
		
		// change default max idles to 10 and 30 seconds
		// otherwise test would take looooong time.
		var orig_default_max_idle = constants.DEFAULT_MAX_IDLE;
		var orig_default_flash_max_idle = constants.DEFAULT_FLASH_MAX_IDLE;
		constants.DEFAULT_MAX_IDLE = 10;
		constants.DEFAULT_FLASH_MAX_IDLE = 30;
		
		try {
			self.pddb = new PDDB("test.0.sqlite");
			self.pddb.init_db();

			/// WARNING: this uses setTimeout to test blur/focus,
			///          idle/back, start/stop-recording....
			///          tests after this one should worry about interference!
			
			/// WARNING 2: this test requires the tester to continuous move 
			///            their mouse but not click so that IDLE isn't
			///            inadvertantly triggered in the middle of the test.
			///            the test runs for at least 5 minute.
			testrunner.test("Test Idle/Back-Focus/Blur Combos", function() {
				tester.test_idle_focus_combos(testrunner, self.display_test_results);
			});
		} catch(e) {
			self.pddb.orthogonals.error(e+"\n\n"+e.stack);
		}
		
		self.pddb = original_pddb;
		
		constants.DEFAULT_MAX_IDLE = orig_default_max_idle; 
		constants.DEFAULT_FLASH_MAX_IDLE = orig_default_flash_max_idle;
		
		self.display_test_results(testrunner);
	},
	
	display_test_results: function(testrunner, is_autotester) {
		var display = null;
		if (is_autotester) {
		    display = new TestRunnerPDDBDisplay(this.pddb);
		} else {
		    var inner_display = new TestRunnerConsoleDisplay();
		    display = new TestRunnerPDDisplay(inner_display, this.pddb);
		}
		for (var name in testrunner.test_modules) {
			var test_module = testrunner.test_modules[name];
			for (var i = 0; i < test_module.test_groups.length; i++) {
				var testgroup = test_module.test_groups[i];
				
				display.display_testgroup_result(testrunner, testgroup);
			}
		}
		display.test_done(testrunner);
	}
});

function Schedule(pddb, prefs, pd_api) {
	this.pddb = pddb;
	this.prefs = prefs;
	this.pd_api = pd_api;
}
Schedule.prototype = {};
_extend(Schedule.prototype, {
	run: function() {
		if ( this.is_new_week_period() ) {
			this.pddb.orthogonals.log("Do weekly tasks on "+(new Date())+" for "+_un_dbify_date(this.prefs.get('last_week_mark', 0)), "schedule");
			this.do_once_weekly_tasks();
			this.pddb.orthogonals.log("Do weekly tasks on "+(new Date())+" for "+_un_dbify_date(this.prefs.get('last_week_mark', 0))+" !! once_weekly_tasks done", "schedule");
			this.do_make_payment();
			this.pddb.orthogonals.log("Do weekly tasks on "+(new Date())+" for "+_un_dbify_date(this.prefs.get('last_week_mark', 0))+" !! make_payments done", "schedule");
			this.reset_week_period();
		}
		if ( this.is_new_24hr_period() ) {
			this.pddb.orthogonals.log("Do daily tasks on "+(new Date())+" for "+_un_dbify_date(this.prefs.get('last_24hr_mark', 0)), "schedule");
			this.do_once_daily_tasks();
			this.reset_24hr_period();
		}
	},
	
	is_new_24hr_period: function() {
		/** @returns: true if the last marked day is over */
		var yesterday = _un_dbify_date(this.prefs.get('last_24hr_mark', 0));
		var start_of_yesterday = _start_of_day(yesterday);
		var start_of_day = _start_of_day();
		return start_of_yesterday < start_of_day
	},

	do_once_daily_tasks: function() {
		var self = this;
		
		// Receive updates from server
		this.pd_api.request_data_updates(
			function() {
				// after success
			}, function() {
				// after failure
			});
		
		// ?? run checker to log failures, db corruptions
		
		// Send data to server (more recent than time_last_sent_KlassName)
		this.pd_api.send_data();
		
		// add user message regarding new update available
		var version = self.prefs.get("latest_update_version", "0.0.0");
		var new_version = _version_to_number(version);
		var cur_version = _version_to_number(self.prefs.get("version","0.0.0"));
		if (new_version > cur_version) {
			var link = self.prefs.get("latest_update_link", "");
			var hash = self.prefs.get("latest_update_hash", "");
			
			var msg = '<span class="link" onClick="upgrade(\''+link+'\', \''+hash+'\');">Click here to <strong>upgrade</strong> ProcrasDonate to the latest version!</span>';
			self.pddb.orthogonals.log("user alerted to available upgrade: "+link, "extn_sys");
			self.prefs.set("user_message", msg);
		}
	},
	
	reset_24hr_period: function() {
		/** reset 24 hour cycle to start of today */
		var start_of_day = _start_of_day();
		this.prefs.set('last_24hr_mark', _dbify_date(start_of_day));
	},
	

	is_new_week_period: function() {
		/** @returns: true if the last marked week is over */
		var last_week = _un_dbify_date(this.prefs.get('last_week_mark', 0));
		//this.pddb.orthogonals.log("Do weekly tasks on "+(new Date())+" for "+_un_dbify_date(this.prefs.get('last_week_mark', 0))+" !! last_week = "+last_week, "schedule");
		var start_of_last_week = _start_of_week(last_week);
		//this.pddb.orthogonals.log("Do weekly tasks on "+(new Date())+" for "+_un_dbify_date(this.prefs.get('last_week_mark', 0))+" !! start_of_last_week = "+start_of_last_week, "schedule");
		var start_of_week = _start_of_week();
		//this.pddb.orthogonals.log("Do weekly tasks on "+(new Date())+" for "+_un_dbify_date(this.prefs.get('last_week_mark', 0))+" !! start_of_week = "+start_of_week, "schedule");
		//this.pddb.orthogonals.log("Do weekly tasks on "+(new Date())+" for "+_un_dbify_date(this.prefs.get('last_week_mark', 0))+" !! (start_of_last_week < start_of_week) = "+(start_of_last_week < start_of_week), "schedule");
		return start_of_last_week < start_of_week
	},
	
	do_once_weekly_tasks: function() {
		this.create_weekly_report();
	},
	
	do_make_payment: function() {
		/* all logic for whether to make payments is in pd_api */
		this.pd_api.make_payments_if_necessary(false);
	},

	reset_week_period: function() {
		/** reset weekly cycle to start of this week */
		//var last_week = _un_dbify_date(this.prefs.get('last_week_mark', 0));
		var start_of_week = _start_of_week();
		this.prefs.set('last_week_mark', _dbify_date(start_of_week));
	},
	
	retrieve_float_for_display: function(key, def) {
		return _un_prefify_float( this.prefs.get(key, def) ).toFixed(2)
	},
	
	create_weekly_report: function() {
		var self = this;
		
		/* user might want webpage reports, just not weekly emails. oops.
		 * if (!_un_dbify_bool(self.prefs.get('weekly_affirmations', constants.DEFAULT_WEEKLY_AFFIRMATIONS))) {
			// user doesn't want a weekly affirmation
			return
		}*/
		
		var email = self.prefs.get('email', constants.DEFAULT_EMAIL);
		var name = "";
		if (email) {
			name = email.substr(0, email.indexOf("@"));
		}
		
		var pd_hr_per_week_goal = self.retrieve_float_for_display("pd_hr_per_week_goal", constants.DEFAULT_PD_HR_PER_WEEK_GOAL);
		var pd_dollars_per_hr = self.retrieve_float_for_display("pd_dollars_per_hr", constants.DEFAULT_PD_DOLLARS_PER_HR);
		var pd_hr_per_week_max = self.retrieve_float_for_display("pd_hr_per_week_max", constants.DEFAULT_PD_HR_PER_WEEK_MAX);
		var tws_dollars_per_hr = self.retrieve_float_for_display("tws_dollars_per_hr", constants.DEFAULT_TWS_DOLLARS_PER_HR);
		var tws_hr_per_week_max = self.retrieve_float_for_display("tws_hr_per_week_max", constants.DEFAULT_TWS_HR_PER_WEEK_MAX);
		
		var tag_contenttype = self.pddb.ContentType.get_or_null({ modelname: "Tag" });
		var sitegroup_contenttype = self.pddb.ContentType.get_or_null({ modelname: "SiteGroup" });
		
		var one_week = _un_dbify_date(this.prefs.get("last_week_mark", 0));
		one_week.setDate(one_week.getDate() - 7);
		
		//logger("ONE WEEK "+one_week);
		
		var two_week = new Date(one_week);
		two_week.setDate(two_week.getDate() - 7);
		
		var three_week = new Date(two_week);
		three_week.setDate(three_week.getDate() - 7);
		
		var start_date_one_week = _start_of_week(one_week);
		var end_date_one_week = _end_of_week(one_week);
		
		var start_date_two_week = _start_of_week(two_week);
		var end_date_two_week = _end_of_week(two_week);
		
		var start_date_three_week = _start_of_week(three_week);
		var end_date_three_week = _end_of_week(three_week);
		
		var start_date_friendly = start_date_one_week.strftime("%m/%d");
		var end_date_friendly = end_date_one_week.strftime("%m/%d");
		
		//logger("START "+start_date_one_week); 
		//logger("START FRIENDLY "+start_date_friendly);
		
		//logger("END "+end_date_one_week); 
		//logger("END FRIENDLY "+end_date_friendly);
		
		var pd_total_one_week = self.pddb.Total.get_or_null({
			contenttype_id: tag_contenttype.id,
			content_id: self.pddb.ProcrasDonate.id,
			datetime: _dbify_date(end_date_one_week),
			timetype_id: self.pddb.Weekly.id
		});
		var pd_hrs_one_week = 0.0;
		var pd_culprit_one_week = null;
		var tws_culprit_one_week = null;
		var u_culprit_one_week = null;
		if (pd_total_one_week) {
			pd_hrs_one_week = pd_total_one_week.hours().toFixed(1);
			self.pddb.Total.select({
				contenttype_id: sitegroup_contenttype.id,
				datetime: _dbify_date(end_date_one_week),
				timetype_id: self.pddb.Weekly.id
			}, function(row) {
				if (!pd_culprit_one_week && row.sitegroup().tag_id == self.pddb.ProcrasDonate.id) {
					pd_culprit_one_week = row;
				} else if (!tws_culprit_one_week && row.sitegroup().tag_id == self.pddb.TimeWellSpent.id) {
					tws_culprit_one_week = row;
				} else if (!u_culprit_one_week && row.sitegroup().tag_id == self.pddb.Unsorted.id) {
					u_culprit_one_week = row;
				}
			}, "-total_time");
		}
		var tws_total_one_week = self.pddb.Total.get_or_null({
			contenttype_id: tag_contenttype.id,
			content_id: self.pddb.TimeWellSpent.id,
			datetime: _dbify_date(end_date_one_week),
			timetype_id: self.pddb.Weekly.id
		});
		var tws_hrs_one_week = 0.0;
		if (tws_total_one_week) {
			tws_hrs_one_week = tws_total_one_week.hours().toFixed(1);
		}
		var u_total_one_week = self.pddb.Total.get_or_null({
			contenttype_id: tag_contenttype.id,
			content_id: self.pddb.Unsorted.id,
			datetime: _dbify_date(end_date_one_week),
			timetype_id: self.pddb.Weekly.id
		});
		var u_hrs_one_week = 0.0;
		if (u_total_one_week) {
			u_hrs_one_week = u_total_one_week.hours().toFixed(1);
		}
		
		var pd_total_two_week = self.pddb.Total.get_or_null({
			contenttype_id: tag_contenttype.id,
			content_id: self.pddb.ProcrasDonate.id,
			datetime: _dbify_date(end_date_two_week),
			timetype_id: self.pddb.Weekly.id
		});
		var pd_hrs_two_week = 0.0;
		var pd_culprit_two_week = null;
		var tws_culprit_two_week = null;
		var u_culprit_two_week = null;
		if (pd_total_two_week) {
			pd_hrs_two_week = pd_total_two_week.hours().toFixed(1);
			self.pddb.Total.select({
				contenttype_id: sitegroup_contenttype.id,
				datetime: _dbify_date(end_date_two_week),
				timetype_id: self.pddb.Weekly.id
			}, function(row) {
				if (!pd_culprit_two_week && row.sitegroup().tag_id == self.pddb.ProcrasDonate.id) {
					pd_culprit_two_week = row;
				} else if (!tws_culprit_two_week && row.sitegroup().tag_id == self.pddb.TimeWellSpent.id) {
					tws_culprit_two_week = row;
				} else if (!u_culprit_two_week && row.sitegroup().tag_id == self.pddb.Unsorted.id) {
					u_culprit_two_week = row;
				}
			}, "-total_time");
		}
		var tws_total_two_week = self.pddb.Total.get_or_null({
			contenttype_id: tag_contenttype.id,
			content_id: self.pddb.TimeWellSpent.id,
			datetime: _dbify_date(end_date_two_week),
			timetype_id: self.pddb.Weekly.id
		});
		var tws_hrs_two_week = 0.0;
		if (tws_total_two_week) {
			tws_hrs_two_week = tws_total_two_week.hours().toFixed(1);
		}
		var u_total_two_week = self.pddb.Total.get_or_null({
			contenttype_id: tag_contenttype.id,
			content_id: self.pddb.Unsorted.id,
			datetime: _dbify_date(end_date_two_week),
			timetype_id: self.pddb.Weekly.id
		});
		var u_hrs_two_week = 0.0;
		if (u_total_two_week) {
			u_hrs_two_week = u_total_two_week.hours().toFixed(1);
		}
		
		var pd_total_three_week = self.pddb.Total.get_or_null({
			contenttype_id: tag_contenttype.id,
			content_id: self.pddb.ProcrasDonate.id,
			datetime: _dbify_date(end_date_three_week),
			timetype_id: self.pddb.Weekly.id
		});
		var pd_hrs_three_week = null;
		var pd_culprit_three_week = null;
		var tws_culprit_three_week = null;
		var u_culprit_three_week = null;
		if (pd_total_three_week) {
			pd_hrs_three_week = pd_total_three_week.hours().toFixed(1);
			self.pddb.Total.select({
				contenttype_id: sitegroup_contenttype.id,
				datetime: _dbify_date(end_date_three_week),
				timetype_id: self.pddb.Weekly.id
			}, function(row) {
				if (!pd_culprit_three_week && row.sitegroup().tag_id == self.pddb.ProcrasDonate.id) {
					pd_culprit_three_week = row;
				} else if (!tws_culprit_three_week && row.sitegroup().tag_id == self.pddb.TimeWellSpent.id) {
					tws_culprit_three_week = row;
				} else if (!u_culprit_three_week && row.sitegroup().tag_id == self.pddb.Unsorted.id) {
					u_culprit_three_week = row;
				}
			}, "-total_time");
		}
		var tws_total_three_week = self.pddb.Total.get_or_null({
			contenttype_id: tag_contenttype.id,
			content_id: self.pddb.TimeWellSpent.id,
			datetime: _dbify_date(end_date_three_week),
			timetype_id: self.pddb.Weekly.id
		});
		var tws_hrs_three_week = null;
		if (tws_total_three_week) {
			tws_hrs_three_week = tws_total_three_week.hours().toFixed(1);
		}
		var u_total_three_week = self.pddb.Total.get_or_null({
			contenttype_id: tag_contenttype.id,
			content_id: self.pddb.Unsorted.id,
			datetime: _dbify_date(end_date_three_week),
			timetype_id: self.pddb.Weekly.id
		});
		var u_hrs_three_week = null;
		if (u_total_three_week) {
			u_hrs_three_week = u_total_three_week.hours().toFixed(1);
		}
		
		/*
		logger("CULPRITs "+
				"\n"+pd_culprit_one_week+
				"\n"+pd_culprit_two_week+
				"\n"+pd_culprit_three_week+
				"\n"+tws_culprit_one_week+
				"\n"+tws_culprit_two_week+
				"\n"+tws_culprit_three_week+
				"\n"+u_culprit_one_week+
				"\n"+u_culprit_two_week+
				"\n"+u_culprit_three_week);
		*/
		
		var met_goal = null;
		var difference = null;
		var seconds_saved = null;
		
		[message, subject, met_goal, difference, seconds_saved] = this.create_message_logic(
				pd_hrs_one_week, pd_hrs_two_week, pd_hrs_three_week,
				tws_hrs_one_week, tws_hrs_two_week, tws_hrs_three_week,
				u_hrs_one_week, u_hrs_two_week, u_hrs_three_week,
				pd_hr_per_week_goal, pd_dollars_per_hr, pd_hr_per_week_max,
				tws_dollars_per_hr, tws_hr_per_week_max,
				start_date_friendly, end_date_friendly,
				pd_culprit_one_week, tws_culprit_one_week, u_culprit_one_week,
				pd_culprit_two_week, tws_culprit_two_week, u_culprit_two_week,
				pd_culprit_three_week, tws_culprit_three_week, u_culprit_three_week);
		
		var pd = self.pddb.Recipient.get_or_null({ slug: "PD" });
		self.pddb.Report.create({
			datetime: _dbify_date(end_date_one_week),
			type: self.pddb.Report.WEEKLY,
			subject: subject,
			message: message,
			recipient_id: pd.id,
			read: _dbify_bool(false),
			sent: _dbify_bool(false),
			met_goal: met_goal,
			difference: difference,
			seconds_saved: seconds_saved,
		});
	},
	
	create_message_logic: function(pd_hrs_one_week, pd_hrs_two_week, pd_hrs_three_week,
			tws_hrs_one_week, tws_hrs_two_week, tws_hrs_three_week,
			u_hrs_one_week, u_hrs_two_week, u_hrs_three_week,
			pd_hr_per_week_goal, pd_dollars_per_hr, pd_hr_per_week_max,
			tws_dollars_per_hr, tws_hr_per_week_max,
			start_date_friendly, end_date_friendly,
			pd_culprit_one_week, tws_culprit_one_week, u_culprit_one_week,
			pd_culprit_two_week, tws_culprit_two_week, u_culprit_three_week,
			pd_culprit_three_week, tws_culprit_three_week, u_culprit_three_week) {
		
		var pd_hrs_one_week_diff, pd_hrs_two_week_diff, pd_hrs_three_week_diff = null;
		var pd_hrs_one_week_two_week_diff_real, pd_hrs_one_week_two_week_diff = null;
		
		if (pd_hrs_one_week !== null) {
			pd_hrs_one_week_diff = Math.abs(pd_hr_per_week_goal - pd_hrs_one_week).toFixed(1);
		}
		if (pd_hrs_two_week !== null) {
			pd_hrs_two_week_diff = (pd_hr_per_week_goal - pd_hrs_two_week).toFixed(1);
			pd_hrs_one_week_two_week_diff_real = (pd_hrs_two_week - pd_hrs_one_week).toFixed(1);
			pd_hrs_one_week_two_week_diff = Math.abs(pd_hrs_one_week_two_week_diff_real);
		}
		if (pd_hrs_three_week !== null) {
			pd_hrs_three_week_diff = Math.abs(pd_hr_per_week_goal - pd_hrs_three_week).toFixed(1);
		}
		
		var met_goal = null;
		var difference = null;
		var seconds_saved = null;
		
		var pd_hrs_max_week = _un_prefify_float( this.prefs.get("pd_hrs_max_week", 0) );
		if (pd_hrs_one_week > pd_hrs_max_week) {
			pd_hrs_max_week = pd_hrs_one_week;
			this.prefs.set("pd_hrs_max_week", _prefify_float(pd_hrs_max_week));
		}
		var tws_hrs_max_week = _un_prefify_float(this.prefs.get("tws_hrs_max_week", 0) );
		if (tws_hrs_one_week > tws_hrs_max_week) {
			tws_hrs_max_week = tws_hrs_one_week;
			this.prefs.set("tws_hrs_max_week", _prefify_float(tws_hrs_max_week));
		}
		var u_hrs_max_week = _un_prefify_float(this.prefs.get("u_hrs_max_week", 0) );
		if (u_hrs_one_week > u_hrs_max_week) {
			u_hrs_max_week = u_hrs_one_week;
			this.prefs.set("u_hrs_max_week", _prefify_float(u_hrs_max_week));
		}
		
		if (pd_hrs_one_week) {
			if (pd_hrs_one_week < pd_hr_per_week_goal) {
				met_goal = true;
				difference = pd_hr_per_week_goal - pd_hrs_one_week;
				seconds_saved = (pd_hrs_max_week - pd_hrs_one_week) * 3600.0;
			} else {
				met_goal = false;
				difference = pd_hr_per_week_goal - pd_hrs_one_week;
				seconds_saved = 0;
			}
		} else {
			met_goal = true;
			difference = 0;
			seconds_saved = pd_hrs_max_week;
		}
		
		var no_data, one_week_good, one_week_bad, match, good_in_a_row, good, sudden_bad, getting_worse, getting_better = false;
		var weeks_in_a_row_met = 0;
		var subject = start_date_friendly+" - "+end_date_friendly+" ";
		if (pd_hrs_one_week === null) {
			no_data = true;
			subject += "No ProcrasDonation"
		} else if (pd_hrs_two_week === null) {
			if (pd_hrs_one_week <= pd_hr_per_week_goal) {
				one_week_good = true;
				subject += "Good job";
			} else {
				one_week_bad = true;
				subject += "You can do better";
			}
		} else if (pd_hrs_one_week == pd_hrs_two_week) {
			match = true;
			subject += "Pinball champion";
		} else if (pd_hrs_one_week <= pd_hr_per_week_goal &&
				pd_hrs_two_week <= pd_hr_per_week_goal &&
				pd_hrs_three_week !== null && pd_hrs_three_week <= pd_hr_per_week_goal) {
			weeks_in_a_row_met = 3;
			good_in_a_row = true;
			subject += "Winning streak";
		} else if (pd_hrs_one_week <= pd_hr_per_week_goal) {
			good = true;
			subject += "Good work";
		} else if (pd_hrs_one_week > pd_hr_per_week_goal &&
				pd_hrs_two_week <= pd_hr_per_week_goal) {
			if (pd_hrs_three_week !== null && pd_hrs_three_week <= pd_hr_per_week_goal) {
				weeks_in_a_row_met = 2;
			} else {
				weeks_in_a_row_met = 1;
			}
			subject += "Downturn";
			sudden_bad = true
		} else if (pd_hrs_one_week > pd_hr_per_week_goal &&
				pd_hrs_two_week > pd_hr_per_week_goal) {
			if (pd_hrs_one_week_two_week_diff_real > 0) {
				getting_better = true;
				subject += "Getting better";
			} else {
				getting_worse = true;
				subject += "Getting worse";
			}
		}
		
		var self = this;
		var top_charity = null;
		this.pddb.RecipientPercent.select({}, function(row) {
			if (!top_charity) { top_charity = row.recipient(); }
		}, "-percent");
		
		var pledges = [];
		var payments = [];
		var time_span = "first week in a row";
		
		var message = Template.get("weekly_report").render(
			new Context({
				name: name,
				
				pd_hrs_one_week: pd_hrs_one_week,
				pd_hrs_one_week_diff: pd_hrs_one_week_diff,
				pd_hrs_two_week: pd_hrs_two_week,
				pd_hrs_two_week_diff: pd_hrs_two_week_diff,
				pd_hrs_three_week: pd_hrs_three_week,
				pd_hrs_three_week_diff: pd_hrs_three_week_diff,
				pd_hrs_one_week_two_week_diff: pd_hrs_one_week_two_week_diff,
				
				tws_hrs_one_week: tws_hrs_one_week,
				tws_hrs_two_week: tws_hrs_two_week,
				tws_hrs_three_week: tws_hrs_three_week,
				u_hrs_one_week: u_hrs_one_week,
				u_hrs_two_week: u_hrs_two_week,
				u_hrs_three_week: u_hrs_three_week,
				
				pd_hr_per_week_goal: pd_hr_per_week_goal,
				pd_dollars_per_hr: pd_dollars_per_hr,
				pd_hr_per_week_max: pd_hr_per_week_max,
				tws_dollars_per_hr: tws_dollars_per_hr,
				tws_hr_per_week_max: tws_hr_per_week_max,
				
				start_date: start_date_friendly,
				end_date: end_date_friendly,
				
				no_data: no_data,
				one_week_good: one_week_good,
				one_week_bad: one_week_bad,
				match: match,
				good_in_a_row: good_in_a_row,
				good: good,
				sudden_bad: sudden_bad,
				getting_worse: getting_worse,
				getting_better: getting_better,
				weeks_in_a_row_met: weeks_in_a_row_met,
				
				pd_culprit_one_week: pd_culprit_one_week,
				tws_culprit_one_week: tws_culprit_one_week,
				u_culprit_one_week: u_culprit_one_week,
				pd_culprit_two_week: pd_culprit_two_week,
				tws_culprit_two_week: tws_culprit_two_week,
				u_culprit_three_week: u_culprit_three_week,
				pd_culprit_three_week: pd_culprit_three_week,
				tws_culprit_three_week: tws_culprit_three_week,
				u_culprit_three_week: u_culprit_three_week,
				
				top_charity: top_charity,
				pledges: pledges,
				payments: payments
			})
		);
		
		return [message, subject, met_goal, difference, seconds_saved]
	},

});

/**************** content/js/toolbar_manager.js *****************/

function ToolbarManager(pddb, prefs) {
	this.pddb = pddb;
	this.prefs = prefs;
	
	//this.initialize()
	//window.addEventListener("load", _bind(this, this.initialize), false);
}
ToolbarManager.prototype = {};
_extend(ToolbarManager.prototype, {
		
	classify_button : null,
	pd_progress_button: null,
	tws_progress_button: null,
	// tag id, image pairs
	images : {},
	// this is tricky. we need to initialize *after* the chrome
	// toolbar is set up so that we can getElementById.
	// otherwise, the first time FF starts, the buttons are null,
	// and thus the classify icon doesn't cycle through icons.
	// for some reason, initializing in window init (Overlay.init)
	// doesn't help. instead, we initialize on page load if necessary.
	initialized : false,

	/*
	* do stuff when new browser window opens 
	* #?? use a settimeout to allow window to open if masterpassword is set
	*/
	initialize : function() {
		var self = this;
		
		//this.removeEventListener('load', this.initialize, false);

		this.classify_button = document.getElementById("PD-classify-toolbar-button");
		if (this.classify_button && this.pddb && this.pddb.Tag) {
			self.initialized = true;
		} else {
			self.initialized = false;
			return
		}
		
		this.pd_progress_button = document.getElementById("PD-progress-toolbar-button");
		this.tws_progress_button = document.getElementById("TWS-progress-toolbar-button");
		
		self.images = {};
		
		this.pddb.Tag.select({}, function(row) {
			self.images[row.id] = "chrome://ProcrasDonate/skin/"+row.tag+"Icon.png";	
		});
		
		// Update button images and text
		this.updateButtons({ url: _href() });
	},
	
	install_toolbar : function() {
		// inserted toolbar button fine, but didn't persist
		//var navToolbar = document.getElementById("nav-bar")
		//navToolbar.insertItem("smxtra-button", null, null, false);
		//document.persist("nav-bar", "currentset");
		
		// fvcks up ff address bar etc
		//var currentset = document.getElementById("nav-bar").currentSet;
		//currentset=currentset + ",smxtra-button";
		//document.getElementById("nav-bar").setAttribute("currentset",currentset);   //not needed I suppose
		//document.getElementById("nav-bar").currentSet = currentset;
		//document.persist("nav-bar","currentset");
		
		// this works, though ff address is kind of messed up. works when restart ff.
		// classify icon is also unclickable until ff restarts.
		//var navbar = document.getElementById("nav-bar");
		//var newset = navbar.currentSet + ",PD-classify-toolbar-button,PD-progress-toolbar-button,TWS-progress-toolbar-button";
		//navbar.currentSet = newset;
		//navbar.setAttribute("currentset", newset );
		//document.persist("nav-bar", "currentset");
		
		try {
			var navbar = document.getElementById("nav-bar");
			var urlbar = document.getElementById("urlbar-container");
			var currentset = navbar.currentSet;
			var b1 = currentset.indexOf("PD-classify-toolbar-button") == -1;
			var b2 = currentset.indexOf("PD-progress-toolbar-button") == -1;
			// var b3 = currentset.indexOf("TWS-progress-toolbar-button") == -1;
			// only called on install, not upgrade. still, let's check that
			// no icons are present already.
			if ( b1 && b2 /*&& b3*/ ) {
				var set;
				//var button_text = "PD-classify-toolbar-button,PD-progress-toolbar-button,TWS-progress-toolbar-button,urlbar-container";
				var button_text = "PD-classify-toolbar-button,PD-progress-toolbar-button,urlbar-container";
				// Place the button before the urlbar
				if (currentset.indexOf("urlbar-container") != -1) {
					set = currentset.replace(/urlbar-container/, button_text);
				} else { // at the end
					set = currentset + ","+ button_text;
				}
				navbar.setAttribute("currentset", set);
				navbar.currentSet = set;
				document.persist("nav-bar", "currentset");
				// If you don't do the following call, funny things happen
				try {
					BrowserToolboxCustomizeDone(true);
				} catch (e) {
					logger(" Tried to call BrowserToolboxCustomizeDone but encountered error: " + e);
				}
			}
		} catch (e) {
			logger(" Tried to complete Toolbar installation but encountered error: " + e);		
		} 
			
		//tb.insertItem("PD-classify-toolbar-button", beforeElement); 
		//tb.insertItem("PD-progress-toolbar-button", beforeElement); 
		//tb.insertItem("TWS-progress-toolbar-button", beforeElement);
		//currentset = currentset.replace(/urlbar-container/i,"PD-classify-toolbar-button,PD-progress-toolbar-button,TWS-progress-toolbar-button,urlbar-container");
		//document.getElementById("nav-bar").setAttribute("currentset",currentset);
		//document.getElementById("nav-bar").currentSet = currentset;
		//document.persist("nav-bar","currentset");
		
		/*
		var tb = document.getElementById("nav-bar");
		var urlbar = document.getElementById("urlbar-container");
		tb.insertItem("PD-classify-toolbar-button", beforeElement); 
		tb.insertItem("PD-progress-toolbar-button", beforeElement); 
		tb.insertItem("TWS-progress-toolbar-button", beforeElement); 
		document.persist("nav-bar", "currentset"); 
		*/
	},
	
	uninstall_toolbar : function() {
		// explicitly remove toolbar items from nav-bar. 
		// removal is automatic when extn is uninstalled,
		// but if re-installed, old icons will show up.
		var tb = document.getElementById("nav-bar");
		var e1 = document.getElementById("PD-classify-toolbar-button");
		var e2 = document.getElementById("PD-progress-toolbar-button");
		var e3 = document.getElementById("TWS-progress-toolbar-button");
		if ( tb ) {
			if ( e1 ) { tb.removeChild(e1); }
			if ( e2 ) { tb.removeChild(e2); }
			if ( e3 ) { tb.removeChild(e3); }
		}
	},

	/*
	 * get site classification for current URL and update button image
	 * @param options: contains either {sitegroup, tag} or {url}
	 */
	updateButtons : function(options) {
		///_pprint(options, "updateButtons");
		if (!this.initialized) { return }
		
		if (this.classify_button) {
			var sitegroup = null;
			var tag = null;
			
			if ('sitegroup' in options && 'tag' in options) {
				sitegroup = options.sitegroup;
				tag = options.tag;
			} else {
				var url = null;
				if ('url' in options) {
					url = options.url;
				} else {
					url = _href();
				}
				///logger("updateButtons url: "+url);
				var d = this.getDbRowsForLocation(url);
				///_pprint(d, "updateButtons d:");
				sitegroup = d.sitegroup;
				tag = d.tag;
			}
			var tag_id = 0;
			if (tag) { tag_id = tag.id; }
			

			// alter classify button
			this.classify_button.setAttribute("image", this.images[tag_id]);
			this.classify_button.setAttribute("label", tag.tag);
			
			var tt = "";
			if (tag.id == this.pddb.ProcrasDonate.id) {
				tt = "ProcrasDonating";
			} else if (tag.id == this.pddb.TimeWellSpent.id) {
				tt = "TimeWellSpending";
			} else {
				tt = "Doing My Thing";
			}
			this.classify_button.setAttribute("tooltiptext", "Currently "+tt+". To re-classify this site click this icon.");
			
			// alter progress bars only if they exist
			if ( !this.pd_progress_button && !this.tws_progress_button ) {
				logger("----------------- toolbar buttons don't exist :-( ------------------------")
				return;
			}
			
			// alter progress bars
			var tag_content_type = this.pddb.ContentType.get_or_null({ modelname: "Tag" });
			var pd_total = this.pddb.Total.get_or_null({
				contenttype_id: tag_content_type.id,
				content_id: this.pddb.ProcrasDonate.id,
				datetime: _dbify_date(_end_of_week()),
				timetype_id: this.pddb.Weekly.id
			});
			/*
			var tws_total = this.pddb.Total.get_or_null({
				contenttype_id: tag_content_type.id,
				content_id: this.pddb.TimeWellSpent.id,
				datetime: _dbify_date(_end_of_week()),
				timetype_id: this.pddb.Weekly.id
			});
			*/
			
			var pd_goal = parseFloat(this.prefs.get('pd_hr_per_week_goal', 1));
			var pd_limit = parseFloat(this.prefs.get('pd_hr_per_week_max', 1));
			
			//var tws_goal = parseFloat(this.prefs.get('tws_hr_per_week_goal', 1));
			//var tws_limit = parseFloat(this.prefs.get('tws_hr_per_week_max', 1));
			
			if ( pd_total && this.pd_progress_button) {
				pd_total = parseInt(pd_total.total_time);
				this.update_progress(pd_total, pd_goal, pd_limit, this.pd_progress_button, "PD")
			}
			
			/*if ( tws_total && this.tws_progress_button) {
				tws_total = parseInt(tws_total.total_time);
				this.update_progress(tws_total, tws_goal, tws_limit, this.tws_progress_button, "TWS")
			}*/
			
		}
    },

	update_progress: function(total, goal, limit, button, label) {
    	//logger("toolbar.js::update_progress LABEL="+label);

    	//logger(" >>> total="+total);
    	//logger(" >>> goal ="+goal);
    	//logger(" >>> limit ="+limit);
    	
    	var days = Math.floor(total / (3600*24));
    	var days_r = total % (3600*24);
    	var hrs = Math.floor(days_r / 3600);
    	var hrs_r = days_r % 3600;
    	var mins = Math.floor(hrs_r / 60);
    	var mins_r = hrs_r % 60;
    	var secs = mins_r % 60;
    	
		var goal_in_s = parseFloat(goal) * 3600;
		var limit_in_s = parseFloat(limit) * 3600;
		
		var percentile = total/goal_in_s;
		var limit_progress = (total - goal_in_s) / (limit_in_s - goal_in_s) 

		var icon_number = "0";
		
		if (percentile < (0.125 * 1)) {
			icon_number = "0";
		} else if (percentile < (0.125 * 2)) {
			icon_number = "10";
		} else if (percentile < (0.125 * 3)) {
			icon_number = "20";
		} else if (percentile < (0.125 * 4)) {
			icon_number = "30";
		} else if (percentile < (0.125 * 5)) {
			icon_number = "40";
		} else if (percentile < (0.125 * 6)) {
			icon_number = "50";
		} else if (percentile < (0.125 * 7)) {
			icon_number = "60";
		} else if (percentile < (0.125 * 8)) {
			icon_number = "70";
		
		} else if (limit_progress < (0.25 * 1)) {
			icon_number = "80";
		} else if (limit_progress < (0.25 * 2)) {
			icon_number = "85";
		} else if (limit_progress < (0.25 * 3)) {
			icon_number = "90";
		} else if (limit_progress < (0.25 * 4)) {
			icon_number = "95";
		} else {
			icon_number = "100";
		}
		
		button.setAttribute("image", "chrome://ProcrasDonate/skin/IconBar"+icon_number+".png");
		var diff_str = "";
		if (days > 0) { diff_str += days+" day, "; }
		if (hrs > 0) { diff_str += hrs+" hr, "; }
		if (mins >= 0) { diff_str += mins+" min"; }
		button.setAttribute("label", label+": "+diff_str);
		button.setAttribute("tooltiptext", "Progress towards weekly "+label+" goal: "+diff_str+". To view your progress click this icon.");
    },
    
    getDbRowsForLocation : function(url) {
    	/* 
    	 * returns { sitegroup: {}, sitegrouptagging: {}, tag: {} }
    	 */
		//var host = _host(url);
    	///logger("getDbRowsForLocation url:"+url);
		var sitegroup = null;
		var tag = null;

		var sitegroup = this.pddb.SiteGroup.create_from_url(url);
		///logger("sitegroup:"+sitegroup);
		tag = sitegroup.tag();
		
		return { sitegroup: sitegroup, tag: tag }

    },

    onClassifyButtonCommand : function(e) {
    	if (!this.initialized) { return }
    	
    	var d = this.getDbRowsForLocation(_href());
    	var sitegroup = d.sitegroup;
    	var tag = d.tag;
    	
    	var new_tag_id = parseInt(tag.id) + 1;
		if (new_tag_id > 3) { new_tag_id = 1; }
		
		if (!new_tag_id) { new_tag_id = 1; }

		// update tag
		this.pddb.SiteGroup.set({ tag_id: new_tag_id }, { id: sitegroup.id });
		tag = this.pddb.Tag.get_or_null({ id: new_tag_id })
		this.updateButtons({ sitegroup: sitegroup, tag: tag });
    },
    
    onProgressButtonPDCommand : function(e) {
    	this.prefs.set('impact_state', 'goals');
    	window.content.location.href = constants.PD_URL + constants.PROGRESS_URL;
    },
    
    onProgressButtonTWSCommand : function(e) {
    	this.prefs.set('impact_state', 'goals');
    	window.content.location.href = constants.PD_URL + constants.IMPACT_URL;
    }

});


/**************** content/js/time_tracking_observers.js *****************/
var STORE_VISIT_LOGGING = false;
var IDLE_LOGGING = false;

/*
 * ?? currently we do not know when force quit or other unexpected shutdown problems occurs.
 *    solutions:
 *       * listener that notifies on restart after unexpected shutdown
 *       * periodic callback that notices unexpected length of time between last chirp
 */

/**
 * 
 * @param pddb
 * @return
 */
var TimeTracker = function TimeTracker(pddb, prefs) {
	this.pddb = pddb;
	this.prefs = prefs;
};
TimeTracker.prototype = {};
_extend(TimeTracker.prototype, {

	start_recording: function(url, enter_type) {
		this.stop_recording(this.pddb.Visit.UNKNOWN);
		if (IDLE_LOGGING) logger("start recording "+url+
				"\n last_url="+this.prefs.get("last_url", "--")+
				"\n idle_url="+this.prefs.get("saved_idle_last_url", "")+
				"\n focus_url="+this.prefs.get("saved_focus_last_url", ""));
		this.prefs.set("saved_idle_last_url", "");
		this.prefs.set("saved_focus_last_url", "");
		this.prefs.set("saved_sleep_last_url", "");
		
		this.prefs.set("last_url", url);
		this.prefs.set("last_url_enter_type", enter_type);
		var now = _dbify_date(new Date());
		this.prefs.set("last_start", now);
	},
	
	stop_recording: function(leave_type) {
		if (IDLE_LOGGING) logger("stop recording "+
				"\n last_url="+this.prefs.get("last_url", "")+
				"\n idle_url="+this.prefs.get("saved_idle_last_url", "")+
				"\n focus_url="+this.prefs.get("saved_focus_last_url", "")+
				"\n in focus="+this.prefs.get("ff_is_in_focus", "--"));
		var url = this.prefs.get("last_url", false);
		var enter_type = this.prefs.get("last_url_enter_type", false);
		if (!enter_type) { enter_type = this.pddb.Visit.UNKNOWN; }
		
		if (url) {
			this.prefs.set("last_url", "");
			this.prefs.set("last_url_enter_type", "");
			var start = this.prefs.get("last_start");
			var now = _dbify_date(new Date());
			var diff = now - start;
			if (IDLE_LOGGING) logger(">> stop recording "+
					"\n last_start="+this.prefs.get("last_start", "")+
					"\n now="+now+
					"\n diff="+diff+
					"\n rounded="+Math.round(diff));
			this.prefs.set("last_start", "");
			// log diff if greater than flash max...just in case its a bug...
			if (diff > constants.DEFAULT_FLASH_MAX_IDLE) {
				this.pddb.orthogonals.warn("store_visit:: diff greater than flash max: "+diff+" start="+start+"="+_un_dbify_date(start)+" url="+url);
				//diff = constants.DEFAULT_FLASH_MAX_IDLE + 1;
			}
			var private_browsing_enabled = this.prefs.get("private_browsing_enabled", constants.DEFAULT_PRIVATE_BROWSING_ENABLED);
			if (diff > 0 && !private_browsing_enabled) {
				this.store_visit(url, start, diff, enter_type, leave_type);
			}
		}
	},
	
	/**
	 * @return: list of Total ids effected
	 */
	store_visit: function(url, start_time, duration, enter_type, leave_type) {
		var site = this.pddb.Site.get_or_null({url__eq: url });
		
		if (!site) {
			var sitegroup = this.pddb.SiteGroup.create_from_url(url);

			site = this.pddb.Site.create({
				url: url,
				sitegroup_id: sitegroup.id,
				flash: _dbify_bool(false),
				max_idle: constants.DEFAULT_FLASH_MAX_IDLE
			});
		}
		
		var visit = this.pddb.Visit.create({
			site_id: site.id,
			enter_at: start_time,
			duration: duration,
			enter_type: enter_type,
			leave_type: leave_type
		});
		
		return this.update_totals(site, visit);
	},
	
	/**
	 * @return: list of Total ids effected
	 */
	update_totals: function(site, visit) {
		if (STORE_VISIT_LOGGING) logger("VISIT: "+visit);
		var self = this;
		var ret = [];
		
		var sitegroup = site.sitegroup();
		var tag = site.tag();
		
		var pd_recipient = this.pddb.Recipient.get_or_null({ slug: "pd" });
		//var pd_recipientpercent = this.RecipientPercent.get_or_null({ recipient_id: pd_recipient.id });
		var pd_pct = _un_prefify_float(this.prefs.get('support_pct', constants.DEFAULT_SUPPORT_PCT)) / 100.0;
		
		var enter_at = _un_dbify_date(visit.enter_at);
		var end_of_day     = _dbify_date(_end_of_day(enter_at));
		var end_of_week    = _dbify_date(_end_of_week(enter_at));
		var end_of_year    = _dbify_date(_end_of_year(enter_at));
		var end_of_forever = _end_of_forever();
		
		var timetypes = [ this.pddb.Daily, this.pddb.Weekly, this.pddb.Yearly, this.pddb.Forever ];
		var times     = [ end_of_day, end_of_week, end_of_year, end_of_forever ];
		
		var pd_dollars_per_hr = _un_prefify_float(this.prefs.get('pd_dollars_per_hr', constants.PD_DEFAULT_DOLLARS_PER_HR));
		var tws_dollars_per_hr = _un_prefify_float(this.prefs.get('tws_dollars_per_hr', constants.TWS_DEFAULT_DOLLARS_PER_HR));
		
		if (STORE_VISIT_LOGGING) logger("UPDATE TOTALS: pd dollars per hr:   "+pd_dollars_per_hr);
		
		// time_delta is in seconds
		var time_delta = parseInt(visit.duration);
		var limited_time_delta = time_delta;
		/// A total's total_time is always aggregated on how much time a user spent
		/// on a site. However, the total_amount maxes out when the user's limit
		/// is reached.
		if ( tag.id != this.pddb.Unsorted.id ) {
			var tag_contenttype = this.pddb.ContentType.get_or_null({ modelname: "Tag" });
			if ( tag.id == this.pddb.ProcrasDonate.id ) {
				var limit = parseFloat( this.prefs.get('pd_hr_per_week_max', 0) );
				limited_time_delta = this.check_limit( limit, time_delta, end_of_week, tag_contenttype, tag );
			} else if ( tag.id == this.pddb.TimeWellSpent.id ) {
				var limit = parseFloat( this.prefs.get('tws_hr_per_week_max', 0) );
				limited_time_delta = this.check_limit( limit, time_delta, end_of_week, tag_contenttype, tag );
			}
		}
		
		if (STORE_VISIT_LOGGING) logger("UPDATE TOTALS: limited time delta:     "+limited_time_delta);
		
		// full amount. still have to calculate recipient percents
		// use limited_time_delta for calculation (in seconds, so turn into hours)
		// NOTE: pd support gets taken automatically by amazon !!
		// amazon fee and marketplace fee to PD are automatically taken
		// from recipient's account! so full amount is tax deductible if any part is!
		// time_delta is in seconds / (60s/m * 60m/h) --> hours
		var pd_full_amount_delta = ( limited_time_delta / (60.0*60.0) ) * pd_dollars_per_hr;
		var tws_full_amount_delta = ( limited_time_delta / (60.0*60.0) ) * tws_dollars_per_hr;
		
		if (STORE_VISIT_LOGGING) logger("UPDATE TOTALS: pd full amount delta:     "+pd_full_amount_delta);
		
		// don't need these anymore. see above note
		var pd_skim_amount = pd_full_amount_delta * pd_pct;
		var tws_skim_amount = tws_full_amount_delta * pd_pct;
		
		// don't need these anymore. see above note
		var pd_rest_amount = pd_full_amount_delta - pd_skim_amount;
		var tws_rest_amount = tws_full_amount_delta - tws_skim_amount;
		
		// abstract away whether this visit is ProcrasDonate, TimeWellSpent or Unsorted
		var full_amount_delta = 0;
		var skim_amount = 0;
		var rest_amount = 0;
		if ( tag.id == this.pddb.ProcrasDonate.id ) {
			if (STORE_VISIT_LOGGING) logger("   PD tag");
			full_amount_delta = pd_full_amount_delta;
			skim_amount = pd_skim_amount;
			rest_amount = pd_rest_amount;
		} else if ( tag.id == this.pddb.TimeWellSpent.id ) {
			if (STORE_VISIT_LOGGING) logger("   TWS tag");
			full_amount_delta = tws_full_amount_delta;
			skim_amount = tws_skim_amount;
			rest_amount = tws_rest_amount;
		} else if ( tag.id == this.pddb.Unsorted.id ) {
			if (STORE_VISIT_LOGGING) logger("   U tag");
			// no money changes hands
		}
		if (STORE_VISIT_LOGGING) logger("full amount delta = "+full_amount_delta);
		
		/// array objects containing:
		///	contenttype instance
		///  content instance
		///  amt (float)
		var content_instances = [];
		
		this.pddb.ContentType.select({}, function(row) {
			if (row.modelname == "Site") {
				content_instances.push({
					contenttype: row,
					content: site,
					amt: full_amount_delta,//rest_amount,
					requires_payment: false
				});
			} else if (row.modelname == "SiteGroup") {
				var requires_payment = (tag.id == self.pddb.TimeWellSpent.id);
				content_instances.push({
					contenttype: row,
					content: sitegroup,
					amt: full_amount_delta,//rest_amount,
					requires_payment: requires_payment
				});
			} else if (row.modelname == "Tag") {
				content_instances.push({
					contenttype: row,
					content: tag,
					amt: full_amount_delta,//rest_amount,
					requires_payment: false
				});
			} else if (row.modelname == "Recipient") {
				if (tag.id != self.pddb.Unsorted.id && pd_recipient) {
					// site is TWS or PD, so some amount will go to pd
					// this isn't used to make payments; just to check against:
					// marketplace fees should add up to this total amount
					content_instances.push({
						contenttype: row,
						content: pd_recipient,
						amt: skim_amount, // SKIM TO US. we record this for the heck of it.
						requires_payment: false
					});
				}
				if (tag.id == self.pddb.ProcrasDonate.id) {
					// site is PD, so pay all recipients
					self.pddb.RecipientPercent.select({}, function(r) {
						var recip = self.pddb.Recipient.get_or_null({ id: r.recipient_id });
						content_instances.push({
							contenttype: row,
							content: recip,
							amt: full_amount_delta * parseFloat(r.percent),//rest_amount_delta * parseFloat(r.percent)
							requires_payment: true
						});
					});
				}
				
			} else {
				this.pddb.orthogonals.warn("update_totals:: not a content type we care about:"+row);
			}
			if (STORE_VISIT_LOGGING) _pprint(content_instances[content_instances.length-1], "content: ");
		});

		for (var i = 0; i < timetypes.length; i++) {
		
			for (var j = 0; j < content_instances.length; j++) {
				var tuple = content_instances[j];
				var contenttype = tuple.contenttype;
				var content = tuple.content;
				var amt = tuple.amt;
				var requires_payment = tuple.requires_payment && timetypes[i].id == this.pddb.Weekly.id;
				if (STORE_VISIT_LOGGING) logger(" do TOTAL UPDATE:  amt:"+amt+", contenttype:"+contenttype+", requresp:"+requires_payment);
				
				var total = this.pddb.Total.get_or_create({
					contenttype_id: contenttype.id,
					content_id: content.id,
					datetime: times[i],
					timetype_id: timetypes[i].id
				}, {
					total_time: 0,
					total_amount: 0,
				});
				ret.push(total.id);
				if (STORE_VISIT_LOGGING) logger("   total="+total);
				
				var new_total_time = parseInt(total.total_time) + time_delta;
				// amt is in dollars but total_amount is in cents
				var new_total_amount = parseFloat(total.total_amount) + parseFloat(amt*100.0);
				
				this.pddb.Total.set({
					total_time: new_total_time,
					total_amount: new_total_amount
				}, {
					id: total.id
				});
				if (STORE_VISIT_LOGGING) logger("     new time="+new_total_time);
				if (STORE_VISIT_LOGGING) logger("     new amt ="+new_total_amount);
				
				if ( requires_payment && timetypes[i].id == this.pddb.Weekly.id ) {
					this.pddb.RequiresPayment.get_or_create({
						total_id: total.id
					}, {
						partially_paid: _dbify_bool(false),
						pending: _dbify_bool(false)
					});
				}
			}
		}
		return ret
	},
	
	check_limit: function( limit, time_delta, end_of_week, contenttype, tag ) {
		/* Seeks to return the time amount that does not exceed the limit.
		 * Essentially: max(limit, (total_time+time_delta))
		 * 
		 * if unsorted tag, return time_delta.
		 * retrieve weekly tag total. 
		 * if (total_time + time_delta) - limit < 0, return time_delta
		 * if (total_time + time_delta) - limit > 0, then
		 *    if total_time - limit > 0, return time_delta
		 *    if total_time - limit < 0, return Math.round( limit - total-time )
		 *         this difference is the amount to add to meet limit exactly.
		 */
		// put limit into seconds/wk not hours/wk
		limit = limit * 3600;
		if ( tag.id == this.pddb.Unsorted.id ) {
			return time_delta;
		}
		var self = this;
		var total = this.pddb.Total.get_or_null({
			contenttype_id: contenttype.id,
			content_id: tag.id,
			datetime: end_of_week,
			timetype_id: self.pddb.Weekly.id
		});
		if ( total ) {
			var total_time = parseInt(total.total_time);
			var diff = total_time + time_delta;
			var diff_m_limit = diff - limit;

			if ( diff_m_limit <= 0 ) {
				return time_delta;
			} else {
				var short = Math.round( limit - total_time );
				if ( short < 0 ) {
					return 0;
				} else {
					return short;
				}
			}
		} else {
		}
		return time_delta;
	}
});

/**
 * 	
		// add listeners for idle times
		// we want to listen for 3 minutes and 20 minutes.
		// https://developer.mozilla.org/en/nsIIdleService
		
		// need to restart ff to see changes, not just reload chrome.
		// observers stick around until ff shutdown, then automatically removed
		// (based on experience. not sure what we're *supposed* to do)
		
		// idle time is based on OS idle time, NOT FF only.
		// so if switch apps and then start clicking, 'back' will be triggered....
		
		NOTE since register multiple idlebacklisteners (one for flash, one for no flash)
		     back might be called multiple times? (i think not)
		     both idle timeouts occur one after the other? (i think so)
		
 * @param pddb
 * @param time_tracker
 * @return
 */
var IdleBackListener = function IdleBackListener() {
};
IdleBackListener.prototype = {};
_extend(IdleBackListener.prototype, {
	init: function(idleService, pddb, prefs, time_tracker) {
		this.idleService = idleService;
		this.pddb = pddb;
		this.prefs = prefs;
		this.time_tracker = time_tracker;
		
		// we can't call register here because this constructor is called outside
		// the subclass's constructor in order to inherit this superclass's behavior.
		//
		// we could assign the prototype within the subclass's constructor,
		// especially since in this case only a couple instances are created.
		//
		// however, this would not work either because the superclass's constructor
		// would still be called before the subclass's prototypes had extended super.
		//
		// the question is: how do we inherit both behavior and state AND permit the
		// superclass constructor to call superclass behavior?
		//
		// anyway, the subclass constructor will have to call this.register()
		this.register();
	},
	
	register: function() {
		this.idleService.addIdleObserver(this, this.idle_timeout, false);
	},
	
	unregister: function() {
		this.idleService.removeIdleObserver(this, this.idle_timeout, false);
	},
	
	/*
	 * user is recognized to be idle. check if we should stop_recording
	 */
	idle: function(leave_type) {
		logger("idle");
		var url = this.prefs.get("last_url", "");
		if (!url) {
			url = this.prefs.get("saved_idle_last_url", "");
		}
		if (url) {
			this.prefs.set("saved_idle_last_url", url); 
			this.time_tracker.stop_recording(leave_type);
		}
	},
	
	/*
	 * user is no longer idle. check if we should start recording.
	 * in particular, we don't want to start_recording if already recording.
	 * since then we'll get stutter visits. 
	 */
	back: function() {
		logger("back");
		if (this.prefs.get("ff_is_in_focus", "")) {
			// we want to check this because maybe we start_recording
			// before back is called, in which case, we don't
			// want to do anything.
			// (ns1IdleService can have 5 second delay)
			var url = this.prefs.get("saved_idle_last_url", "");
			if (url) {
				this.prefs.set("saved_idle_last_url", "");
				this.time_tracker.start_recording(url, this.pddb.Visit.BACK);
			}
		}
	}
});

/**
 * 
 */
var IdleBack_Flash_Listener = function IdleBack_Flash_Listener(idleService, pddb, prefs, time_tracker, idle_timeout) {
	this.idle_timeout = idle_timeout;
	
	this.init(idleService, pddb, prefs, time_tracker);
};
// we do this to inherit the superclass's behavior.
// initializing state will occur when the subclass is instantiated.
IdleBack_Flash_Listener.prototype = new IdleBackListener();
_extend(IdleBack_Flash_Listener.prototype, {
	/**
	 * if idle, call idle() regardless of flash ( might as well)
	 * if back, call back()
	 */
	observe: function(subject, topic, data) {
		logger(topic+" -- flash");
		if (topic == "back") {
			this.back(this.pddb.Visit.BACK);
		} else if (topic == "idle") {
			this.idle(this.pddb.Visit.IDLE_FLASH);
		}
	},
});

/**
 * 
 */
var IdleBack_NoFlash_Listener = function IdleBack_Flash_Listener(idleService, pddb, prefs, time_tracker, idle_timeout) {
	this.idle_timeout = idle_timeout;

	this.init(idleService, pddb, prefs, time_tracker);
};
//we do this to inherit the superclass's state. the superclass's constructor 
//will be recalled when the subclass is instantiated.
IdleBack_NoFlash_Listener.prototype = new IdleBackListener();
_extend(IdleBack_NoFlash_Listener.prototype, {
	/**
	 * if idle and no flash on site, call idle()
	 * if back, call back()
	 */
	observe: function(subject, topic, data) {
		logger(topic+" -- no flash   ");
		
		if (topic == "back") {
			this.back(this.pddb.Visit.BACK);
		} else if (topic == "idle") {
			var url = this.prefs.get("last_url", "");
			if (!url) {
				url = this.prefs.get("saved_idle_last_url", "");
			}
			logger("saved_idle_last_url is "+url);
			if (url) {
				var site = this.pddb.Site.get_or_null({url__eq: url });
				if (site) {
					if (!site.has_flash()) {
						this.idle(this.pddb.Visit.FLASH_NOFLASH);
					}
				} else {
					logger("NO SITE in idle_no_flash "+url);
				}
			}
		}
	},
});

/**
 * 
 */
var BlurFocusListener = function BlurFocusListener(pddb, prefs, time_tracker) {
	this.pddb = pddb;
	this.prefs = prefs;
	this.time_tracker = time_tracker;
	
	// set focus state to true. this means that FF is the active app right now.
	//this.prefs.set("ff_is_in_focus", true);
	
	// time is not started
	this.prefs.set("ff_focus_timer_started", false);
	
	this.register();
};
BlurFocusListener.prototype = {};
_extend(BlurFocusListener.prototype, {
	register: function() {
		var self = this;
		window.addEventListener('focus', function(event) { self.focus(event); }, true);
		window.addEventListener('blur', function(event) { self.blur(event); }, true);
	},
	
	unregister: function() {
		var self = this;
		window.removeEventListener('focus', function(event) { self.focus(event); }, true);
		window.removeEventListener('blur', function(event) { self.blur(event); }, true);
	},
	
	focus: function(e) {
		this.prefs.set("new_ff_is_in_focus", true);
		this.prefs.set("ff_blur_time", _dbify_date(new Date()));

		var self = this;
		if (!this.prefs.get("ff_focus_timer_started", false)) {
			setTimeout(function() {
				self.determine_ff_focus_state()
			}, 1000);
			this.prefs.set("ff_focus_timer_started", true);
		}
	},
	
	blur: function(e) {
		this.prefs.set("new_ff_is_in_focus", false);
		this.prefs.set("ff_blur_time", _dbify_date(new Date()));
		
		var self = this;
		
		if (!this.prefs.get("ff_focus_timer_started", false)) {
			setTimeout(function() {
				self.determine_ff_focus_state()
			}, 1000);
			this.prefs.set("ff_focus_timer_started", true);
		}
	},
	
	determine_ff_focus_state: function() {
		this.prefs.set("ff_focus_timer_started", false);
		var new_ff_state = this.prefs.get("new_ff_is_in_focus", false);
		var ff_state = this.prefs.get("ff_is_in_focus", false);
		
		/*logger("determine_ff_focus_state timer_started="+this.prefs.get("ff_focus_timer_started", false)+
				" new ff state="+new_ff_state+
				"     ff state="+ff_state);
		*/
		
		if (ff_state != new_ff_state) {
			this.prefs.set("ff_is_in_focus", new_ff_state);
			if (new_ff_state) {
				var url = this.prefs.get("saved_focus_last_url", "");
				if (IDLE_LOGGING) logger("focus last_url="+this.prefs.get("last_url", "")+
						"\n focus_url="+this.prefs.get("saved_focus_last_url", "-"));
				if (url) {
					this.prefs.set("saved_focus_last_url", "");
					this.time_tracker.start_recording(url, this.pddb.Visit.FOCUS);
				}
			} else {
				var last_url = this.prefs.get("last_url", "");
				if (IDLE_LOGGING) logger("blur last_url="+this.prefs.get("last_url", "")+
						"\n focus_url="+this.prefs.get("saved_focus_last_url", "-"));
				
				if (last_url) {
					this.prefs.set("saved_focus_last_url", last_url);
					this.time_tracker.stop_recording(this.pddb.Visit.BLUR);
				}
			}
		}
	},
});

/**
 * 
 */
var SleepWakeListener = function SleepWakeListener(observerService, pddb, prefs, time_tracker) {
	this.observerService = observerService;
	this.pddb = pddb;
	this.prefs = prefs;
	this.time_tracker = time_tracker;
	
	this.register();
};
SleepWakeListener.prototype = {};
_extend(SleepWakeListener.prototype, {
	register: function() {
		this.observerService.addObserver(this, "sleep_notification", false);
		this.observerService.addObserver(this, "wake_notification", false);
	},
	
	unregister: function() {
		this.observerService.removeObserver(this, "sleep_notification", false);
		this.observerService.removeObserver(this, "wake_notification", false);
	},
	
	observe: function(subject, topic, data) {
		if (topic == "sleep_notification") {
			this.sleep();
		} else if (topic == "wake_notification") {
			this.wake();
		}
	},
	
	sleep: function() {
		logger("sleep at date "+(new Date())+
				"\n last_url "+this.prefs.get('last_url', '')+
				"\n sleep_url"+this.prefs.get('sleep_url', ''));
		var last_url = this.prefs.get("last_url", "");
		if (last_url) {
			this.prefs.set("saved_sleep_last_url", last_url); 
			this.time_tracker.stop_recording(this.pddb.Visit.SLEEP);
		}
	},
	
	wake: function(subject, topic, data) {
		logger("wake at date "+(new Date())+
				"\n last_url "+this.prefs.get('last_url', '')+
				"\n sleep_url"+this.prefs.get('sleep_url', ''));
		if (this.prefs.get("ff_is_in_focus", "")) {
			// we want to check this because maybe we start_recording
			// before back is called, in which case, we don't
			// want to do anything.
			var url = this.prefs.get("saved_sleep_last_url", "");
			if (url) {
				this.prefs.set("saved_sleep_last_url", "");
				this.time_tracker.start_recording(url, this.pddb.Visit.WAKE);
			}
		}
	},
});


/**************** content/js/overlay_observers.js *****************/

/**
 * Listens for Firefox application load, which occurs once per window (?).
 * Initializes and un-initializes other listeners.
 * 
 *  concurrency issues with uninits from closing multiple windows?
 *  -> no because each init listener instantiates its own state?
 *  
 *  ?? should init listener listen for firefox applicaiton load 
 *     rather than window load?
 */
var InitListener = function InitListener() {
	this.VERSION = -1;
	
	this.register();
};
InitListener.prototype = {};
_extend(InitListener.prototype, {
	register: function() {
		var self = this;
		window.addEventListener("load", function(event) { self.init(event); }, false);
		window.addEventListener("unload", function(event) { self.uninit(event); }, false);
	},
	
	/**
	 * unharmful but unnecessary to call this.
	 * listeners are automatically removed when listeners are triggered.
	 */
	unregister: function() { 
		var self = this;
		window.removeEventListener("load", function(event) { self.init(event); }, false);
		window.removeEventListener("unload", function(event) { self.uninit(event); }, false);
	},
	
	/**
	 * Firefox Application window initialization.
	 *  . install database
	 *  . create extension objects and listeners
	 *  . install generated input
	 *  . do install, update if necessary
	 *  . remove init ('load') listener
	 */
	init: function(event) {
		logger("init");
		var self = this;

		// connect to database. creates database and tables if necessary.
		this.pddb = new PDDB("procrasdonate.0.sqlite");
		this.pddb.init_db();
		
		this.prefs = new PreferenceManager("ProcrasDonate.", {});
		this.pd_api = new ProcrasDonate_API(this.pddb, this.prefs);
		this.controller = new Controller(this.pddb, this.prefs, this.pd_api);
		this.schedule = new Schedule(this.pddb, this.prefs, this.pd_api);
		this.time_tracker = new TimeTracker(this.pddb, this.prefs);
		this.toolbar_manager = new ToolbarManager(this.pddb, this.prefs);
		
		// install generated input.
		// we need to do this every time so that the PD domain are set.
		// don't set preselected charities yet because charities might
		// not be received from server.
		this.install_generated_input(false);
		
		// create listeners
		this.observerService = Cc['@mozilla.org/observer-service;1'].getService(
				Components.interfaces.nsIObserverService);
		this.idleService = Components.classes["@mozilla.org/widget/idleservice;1"].getService(
				Components.interfaces.nsIIdleService);

		this.page_load_listener = new PageLoadListener(this.pddb, this.toolbar_manager, this.controller);
		this.url_bar_listener = new URLBarListener(this.pddb, this.prefs, this.toolbar_manager, this.schedule, this.time_tracker);
		this.blur_focus_listener = new BlurFocusListener(this.pddb, this.prefs, this.time_tracker);
		this.sleep_wake_listener = new SleepWakeListener(this.observerService, this.pddb, this.prefs, this.time_tracker);
		this.idle_back_noflash_listener = new IdleBack_NoFlash_Listener(this.idleService, this.pddb, this.prefs, this.time_tracker, constants.DEFAULT_MAX_IDLE);
		this.idle_back_flash_listener = new IdleBack_Flash_Listener(this.idleService, this.pddb, this.prefs, this.time_tracker, constants.DEFAULT_FLASH_MAX_IDLE);
		this.private_browsing_listener = new PrivateBrowsingListener(this.observerService, this.pddb, this.prefs, this.toolbar_manager);

		this.uninstall_listener = new UninstallListener(this.observerService, this.pddb, this.prefs, this.pd_api, this.toolbar_manager);
		
		// cannot initialize toolbar here because chrome toolbar is not set up, which 
		// means that document.getElementById returns null.
		//this.toolbar_manager.initialize();

		// do install, update if necessary
		this.checkVersion();
		
		// remove listener (load only happens once anyway)
		window.removeEventListener("load", function(event) { self.init(event); }, false);
	},
	
	/**
	 * called on every window close
	 *  . stop time tracking
	 *  . remove listeners
	 *  . remove uninit ('unload') listener
	 */
	uninit: function(event) {
		logger("uninit");
		var self = this;

		// stop recording
		this.time_tracker.stop_recording(this.pddb.Visit.CLOSE_WINDOW);
		
		// remove listeners
		this.page_load_listener.unregister();
		this.url_bar_listener.unregister();
		this.blur_focus_listener.unregister();
		this.sleep_wake_listener.unregister();
		// don't unregister before "application-shutdown-granted" notification occurs,
		// otherwise uninstall method doesn't have a chance to occur.
		//this.uninstall_listener.unregister();
		this.idle_back_noflash_listener.unregister();
		this.idle_back_flash_listener.unregister();
		this.private_browsing_listener.unregister();
		
		// remove listener (unload only happens once anyway)
		window.removeEventListener("unload", function(event) { self.uninit(event); }, false);
	},
	
	checkVersion: function() {
		var ver = "0.0.0";
		var firstrun = true;
		
		var gExtensionManager = Components.
		    classes["@mozilla.org/extensions/manager;1"].
		    getService(Components.interfaces.nsIExtensionManager);
		
		var current = gExtensionManager.getItemForID(constants.ProcrasDonate__UUID).version;
		
		try {
			ver = this.prefs.get("version", ver);
			firstrun = this.prefs.get("firstrun", true);
			
			logger("check version - extn_manager="+current+" prefs="+ver+" firstrun="+firstrun);
			
		} catch(e) {
			logger("checkVersion exception thrown! "+ver+" "+firstrun);
		} finally {
			if (firstrun) {
				this.doInstall();
				
				this.prefs.set("firstrun", false);
				this.prefs.set("version", current);
				
				// Insert code for first run here
				this.onInstall(current);
			}
			
			if (ver != current && !firstrun) {
				this.doUpgrade(ver);

				this.prefs.set("version", current);
				
				// Insert code if version is different here => upgrade
				this.onUpgrade(ver, current);
			}
		}
	},
	
	install_generated_input: function(set_preselected_charities) {
		var self = this;
		var data = generated_input()[0];
		
		constants.PD_URL = data.constants_PD_URL;
		constants.PD_HOST = _host(constants.PD_URL);
		constants.PD_API_URL = data.constants_PD_API_URL;
		
		if (!data.is_update) {
			if (!this.prefs.exists("private_key")) {
				// just in case
				this.prefs.set("private_key", data.private_key);
			}
			
			if (set_preselected_charities && !this.prefs.exists("set_preselected_charities")) {
				this.prefs.set("set_preselected_charities", true);
				_iterate(data.preselected_charities, function(k, recip_pct, idx) {
					self.pddb.RecipientPercent.process_object(recip_pct);
				});
			}
			
			_pprint(data, "install generated input - not update\n");
		} else {
			logger("install generated input - update");
		}
	},
	
	doInstall: function() { // 
		this.toolbar_manager.install_toolbar();
	},
	onInstall: function(version) { // execute on first run
		var self = this;
		this.pddb.orthogonals.log("install ProcrasDonate version "+version, "extn_sys");
		
		// The example below loads a page by opening a new tab.
		// Useful for loading a mini tutorial
		window.setTimeout(function() {
			gBrowser.selectedTab = gBrowser.addTab(constants.PD_URL + constants.REGISTER_URL);
		}, 1500); //Firefox 2 fix - or else tab will get closed

		// initialize state
		this.controller.initialize_state();
		
		// receive data from server to populate database
		// received tables: sitegroups, categories, recipients (user can add their own eventually)
		// after success, set default recipient percent
		this.pd_api.request_data_updates(
			function() {
				// after success

				// install generated input
				// pre-selected charities will now be installed
				self.install_generated_input(true);
				
			}, function() {
				// after failure
			}
		);
		
		// create welcome message. requires PD recipient exists.
		this.create_welcome_message();
		
		// we send an email address as soon as user enters an email
		// address in the first register tab
		
		// send data to server (log install)
		//this.pddb.schedule.do_once_daily_tasks();
		this.pd_api.send_data();
	},
	
	/**
	 * make any necessary changes for a new version (upgrade)
	 * @param version: old version
	 */
	doUpgrade: function(version) {
		this.pddb.orthogonals.log("prepare "+version+" for upgrade", "extn_sys");
	},
	
	/**
	 *  execute after each new version (upgrade)
	 *  @param old_version: old version
	 *  @param version: new version
	 */
	onUpgrade: function(old_version, version) {
		var self = this;
		
		this.pddb.orthogonals.log("upgrade version "+old_version+" to version "+version, "extn_sys");
		
		var old_version_number = _version_to_number(old_version);
		var version_number = _version_to_number(version);
		
		if (old_version_number < _version_to_number("0.3.3")) {
			// add visit types
			this.pddb.Visit.add_column("enter_type", "VARCHAR");
			this.pddb.Visit.add_column("leave_type", "VARCHAR");
			this.pddb.Visit.select({}, function(row) {
				if (!row.enter_type && !row.leave_type) {
					self.pddb.Visit.set({
						enter_type: self.pddb.Visit.UNKNOWN,
						leave_type: self.pddb.Visit.UNKNOWN
					}, {
						id: row.id
					});
				}
			})
		}
		
		if (old_version_number < _version_to_number("0.3.6")) {
			// add report subject and create welcome message
			this.pddb.Report.add_column("subject", "VARCHAR");
			this.pddb.Report.select({}, function(row) {
				if (!row.subject) {
					self.pddb.Report.set({
						subject: "Weekly affirmation ("+row.friendly_datetime()+")"
					}, {
						id: row.id
					});
				}
			})
			this.create_welcome_message(true);
		}
		
		if (old_version_number < _version_to_number("0.3.7")) {
			// add report recipient_id
			// remove duplicate reports
			// move WELCOME report types to ANNOUNCEMENT
			this.pddb.Report.add_column("recipient_id", "INTEGER");
			var pd = this.pddb.Recipient.get_or_null({ slug: "PD" });
			var weeklies = {};
			var welcome = false;
			this.pddb.Report.select({}, function(row) {
				var is_duplicate = false;
				if (row.is_welcome()) {
					if (!welcome) {
						welcome = true;
						self.pddb.Report.set({
							type: self.pddb.Report.ANNOUNCEMENT
						}, {
							id: row.id
						});
					} else {
						is_duplicate = true;
					}
				} else if (row.is_weekly()) {
					if (!weeklies[row.datetime]) {
						weeklies[row.datetime] = true
					} else {
						is_duplicate = true;
					}
				}
				
				if (!is_duplicate && !row.recipient_id) {
					self.pddb.Report.set({
						recipient_id: pd.id
					}, {
						id: row.id
					});
				} else if (is_duplicate) {
					self.pddb.Report.del({ id: row.id });
				}
			});
		}
		
		if (old_version_number < _version_to_number("0.3.8")) {
			// add columns to report and populate
			this.pddb.Report.add_column("met_goal", "INTEGER");
			this.pddb.Report.add_column("difference", "INTEGER");
			this.pddb.Report.add_column("seconds_saved", "INTEGER");
			
			var pd_hrs_max_week = 0;
			
			this.pddb.Report.select({}, function(row) {
				var a_re = new RegExp(/this week: ([\d\.]+) hours/);
				var l_re = new RegExp(/limit: ([\d\.]+) hours/);
				var g_re = new RegExp(/goal: ([\d\.]+) hours/);
				
				//logger(" update report: "+row);
				if (row.is_weekly()) {
					var met_goal = 0;
					var difference = 0;
					var hours_saved = 0;
					
					met_goal = (row.message.indexOf("Congratulations") > -1 ||
							row.message.indexOf("You're on a roll") > -1);
					
					//logger("...met_goal = "+met_goal);
					var a = a_re.exec(row.message);
					var l = l_re.exec(row.message);
					var g = g_re.exec(row.message);
					
					if (a && a.length >= 2) { a = parseFloat(a[1]); }
					else { a = 0; }
					if (l && l.length >= 2) { l = parseFloat(l[1]); }
					else { l = 0; }
					if (g && g.length >= 2) { g = parseFloat(g[1]); }
					else { g = 0; }
					
					//logger("... a:"+a+" l:"+l+" g:"+g);

					// set max hrs procrasdonated ever
					if (a > pd_hrs_max_week) { pd_hrs_max_week = a; }
					if (l > pd_hrs_max_week) { pd_hrs_max_week = l; }

					if (l > a) { hours_saved = 0; }
					difference = g - a;    
					
					//logger("hours saved="+hours_saved+", diff="+difference);

					self.pddb.Report.set({
						met_goal: _dbify_bool(met_goal),
						difference: difference,
						seconds_saved: (hours_saved * 3600.0),
					}, {
						id: row.id
					});
				}
			});
			self.prefs.set("pd_hrs_max_week", _prefify_float(pd_hrs_max_week));
		}
		
		if (old_version_number < _version_to_number("0.3.9")) {
			// encodeURI all host, decodeURI all name
			self.pddb.SiteGroup.select({}, function(sitegroup) {
				self.pddb.SiteGroup.set({
					host: encodeURI(sitegroup.host),
					name: decodeURI(sitegroup.name)
				}, {
					id: sitegroup.id
				});
			});
		}
		
		// initialize new state (initialize_state initializes state if necessary.
		this.controller.initialize_state();
		
		// The example below loads a page by opening a new tab.
		// Useful for loading a mini tutorial
		window.setTimeout(function() {
			gBrowser.selectedTab = gBrowser.addTab(constants.PD_URL + constants.AFTER_UPGRADE_URL + version + "/");
		}, 1500); //Firefox 2 fix - or else tab will get closed
		
	},
	
	create_welcome_message: function(make_earliest) {
		var self = this;
		
		var message = Template.get("welcome_message").render(
				new Context({}));
		
		var date = null;
		if (make_earliest) {
			var r = this.pddb.Report.get_or_null({ id: 1 })
			if (r) {
				date = _start_of_week(_un_dbify_date(r.datetime))
			}
		}
		if (!date) { date = new Date(); }
		
		var pd = self.pddb.Recipient.get_or_create({ slug: "PD" });
		var report = this.pddb.Report.create({
			datetime: _dbify_date(date),
			type: self.pddb.Report.ANNOUNCEMENT,
			subject: "Getting started with ProcrasDonate",
			message: message,
			read: _dbify_bool(false),
			sent: _dbify_bool(false)
		});
	}
	
});

var URLBarListener = function URLBarListener(pddb, prefs, toolbar_manager, schedule, time_tracker) {
	this.pddb = pddb;
	this.prefs = prefs;
	this.toolbar_manager = toolbar_manager;
	this.schedule = schedule;
	this.time_tracker = time_tracker;
	
	this.register();
};
URLBarListener.prototype = {};
_extend(URLBarListener.prototype, {
	register: function() {
		// Listen for webpage loads
		gBrowser.addProgressListener(
				this,
				Components.interfaces.nsIWebProgress.NOTIFY_LOCATION);
		
		// Only works in 3.5+
		//gBrowser.addTabsProgressListener(
		//		Overlay_urlBarListener,
		//		Components.interfaces.nsIWebProgress.NOTIFY_LOCATION);
	},
	
	unregister: function() {
		gBrowser.removeProgressListener(this);
	},
	
	QueryInterface: function(aIID) {
		if (aIID.equals(Components.interfaces.nsIWebProgressListener) ||
			aIID.equals(Components.interfaces.nsISupportsWeakReference) ||
			aIID.equals(Components.interfaces.nsISupports)) {
			//logger("QueryInterface:: " + aIID);
			return this;
		}
		throw Components.results.NS_NOINTERFACE;
	},
	
	onStateChange: function(aWebProgress, aRequest, aFlag, aStatus) {
		// If you use myListener for more than one tab/window, use
		// aWebProgress.DOMWindow to obtain the tab/window which triggers the state change
		var msg = "onStateChange:: ";
		if (aFlag & constants.STATE_START) {
			// This fires when the load event is initiated
			msg += "load_start ";
			//logger("onStateChange::load_start: " + aWebProgress.DOMWindow.location.href);
		}
		if (aFlag & constants.STATE_STOP) {
			// This fires when the load finishes
			msg += "load_stop ";
			//logger("onStateChange::load_end: " + aWebProgress.DOMWindow.location.href);
		}
		//logger(msg);
	},
	
	onLocationChange: function(aProgress, aRequest, aURI) {
		// This fires when the location bar changes; i.e load event is confirmed
		// or when the user switches tabs. If you use myListener for more than one tab/window,
		// use aProgress.DOMWindow to obtain the tab/window which triggered the change.
		var href = aProgress.DOMWindow.location.href;
		//logger("onLocationChange:: href=" + href);
		//logger(jQuery(aProgress.DOMWindow,
		//if (aURI == "about:config")
		//	return;
		if  (aURI == "") {
			return
		}
		//logger(window);
		//logger(document);
		//logger(gBrowser);
		//logger(gBrowser.contentWindow);
		//logger(gBrowser.contentWindow.document);
		//logger(gBrowser.contentDocument);
		
		//logger(jQuery("*", gBrowser.contentWindow.document).length);
		//logger([]);
		//logger([aProgress.DOMWindow.content]);
		
		//logger(" location changed. start recording: "+href);
		this.time_tracker.stop_recording(this.pddb.Visit.URL);
		this.time_tracker.start_recording(href, this.pddb.Visit.URL);

		this.toolbar_manager.updateButtons({ url: href });
		this.processNewURL(aProgress.DOMWindow, aURI);
	},
	
	processNewURL: function(win, url) {
		this.schedule.run();
	},
	
	// For definitions of the remaining functions see XULPlanet.com
	// https://developer.mozilla.org/en/Code_snippets/Progress_Listeners
	onProgressChange: function(aWebProgress, aRequest, curSelf, maxSelf, curTot, maxTot) {
	},
	
	onStatusChange: function(aWebProgress, aRequest, aStatus, aMessage) {
	},
	
	onSecurityChange: function(aWebProgress, aRequest, aState) {
	}
	
});


/**
 * 
 */
var PageLoadListener = function PageLoadListener(pddb, toolbar_manager, controller) {
	this.pddb = pddb;
	this.toolbar_manager = toolbar_manager;
	this.controller = controller;
	
	this.register();
};
PageLoadListener.prototype = {};
_extend(PageLoadListener.prototype, {
	register: function() {
		var self = this;
		
		var appcontent = document.getElementById("appcontent");   // browser
		if (appcontent && !appcontent.seen_by_ProcrasDonate) {
			appcontent.seen_by_ProcrasDonate = true;

			// use anonymous function for memory reasons
			// https://developer.mozilla.org/en/DOM/element.addEventListener

			// DOMContentLoaded - fires when DOM is ready but images not loaded
			appcontent.addEventListener(
				"DOMContentLoaded",
				function(event) { self.onPageLoad(event); },
				true);
			// load - fires after pageload is complete
			//appcontent.addEventListener(
			//	"load", _bind(this, this.onLoad), false);
			
			//appcontent.addEventListener("pageshow", Overlay.onPageShow, false);
			//appcontent.addEventListener("pagehide", Overlay.onPageHide, false);
			
			//appcontent.addEventListener(
			//	"unload", _bind(this, this.onUnload), false);
		}
	},
	
	unregister: function() {
		var self = this;
		
		var appcontent = document.getElementById("appcontent");   // browser
		if (appcontent) {
			appcontent.removeEventListener(
				"DOMContentLoaded",
				function(event) { self.onPageLoad(event); },
				true);
		}
	},

	onPageLoad: function(event) {
		// We only care about page load (DOMContentLoaded) when we're
		// going to display a page.
		var msg = "Overlay.onPageLoad:: ";
		//logger(msg);
		
		// initialize toolbar
		if (!this.toolbar_manager.initialized) {
			this.toolbar_manager.initialize();
		}
		
		var unsafeWin = event.target.defaultView;
		if (unsafeWin.wrappedJSObject)
			unsafeWin = unsafeWin.wrappedJSObject;
		
		var href = new XPCNativeWrapper(
			new XPCNativeWrapper(unsafeWin, "location").location, "href").href;
		
		// record if there is flash on page so that appropriate max idle time is used
		var request = new PageRequest(href, event);
		var has_flash = null;
		var max_idle = null;
		if (request.jQuery("[type=application/x-shockwave-flash]").length > 0) {
			has_flash = true;
			max_idle = constants.DEFAULT_FLASH_MAX_IDLE;
			//logger("flash on page");
		} else {
			has_flash = false;
			max_idle = constants.DEFAULT_MAX_IDLE;
			//logger("NO flash on page");
		}
		// create site if necessary and overwrite flash and max idle
		var site = this.pddb.Site.get_or_make(href, has_flash, max_idle);
		
		return this.dispatch(href, event);
	},
	

	onPageUnload: function(event) {
		var msg = "Overlay.onPageUnload:: ";
		var doc = event.originalTarget;
		if (event.originalTarget instanceof HTMLDocument) {
			msg += "HTML "
			//var doc = event.originalTarget;
			//logger("page unloaded:" + doc.location.href);
		}
		//logger(msg);
	},

	dispatch: function(href, event) {
		var i, controller, request, response;
		request = new PageRequest(href, event);
		response = this.controller.handle(request);
		if (response) {
			return response;
		} else {
			return null;
		}
	},
	
	onLoad: function() {
	},
	
	onUnload: function() {
	},
	
	onPageShow: function() {
	},
	
	onPageHide: function() {
	},
});


/**
 * 
 */
var UninstallListener = function UninstallListener(observerService, pddb, prefs, pd_api, toolbar_manager) {
	this.observerService = observerService;
	this.pddb = pddb;
	this.prefs = prefs;
	this.pd_api = pd_api;
	this.toolbar_manager = toolbar_manager;

	// we need this flag because we don't want to uninstall before
	// the user has a chance to cancel.
	this._uninstall = false;
	
	this.register();
};
UninstallListener.prototype = {};
_extend(UninstallListener.prototype, {
	register: function() {
		this.observerService.addObserver(this, "em-action-requested", false);
		this.observerService.addObserver(this, "quit-application-granted", false);
	},
	
	unregister: function() {
		this.observerService.removeObserver(this, "em-action-requested", false);
		this.observerService.removeObserver(this, "quit-application-granted", false);
	},
	
	observe: function(subject, topic, data) {
		/*
		 * the tricky thing is that there are a few different kinds of uninstall events
		 * https://developer.mozilla.org/en/Observer_Notifications
		 * 	 
		 *   TOPIC: em-action-requested
		 *      DATA:
		 *      	item-uninstalled
		 *      	item-cancel-action (eg, cancel uninstall)
		 *      	item-enabled
		 *      	item-disabled
		 *      
		 *   TOPIC: quit-application-granted (observers have agreed to shutdown app<-FF)
		 *   
		 * when item-uninstalled or item-cancel-action is called, we set or unset a flag.
		 * when quit-application-granted is called, we call uninstall if flag is set
		 */
		var self = this;
		
		if (topic == "em-action-requested") {
			// this gets called for every uninstall, so we need to check
			// that the request is for ProcrasDonate
			subject.QueryInterface(Components.interfaces.nsIUpdateItem);
			if (subject.id != constants.ProcrasDonate__UUID) {
				return;
			}
			
			if (data == "item-uninstalled") {
				self.pddb.orthogonals.log("uninstall requested", "extn_sys");
				self._uninstall = true;
			} else if (data == "item-cancel-action") {
				self.pddb.orthogonals.log("uninstall cancelled", "extn_sys");
				self._uninstall = false;
			}
			
		} else if (topic == "quit-application-granted") {
			if (self._uninstall) {
				self.uninstall();
			}
			self.unregister();
		}
	},
	
	/*
	 * uninstall app, including:
	 *     delete database
	 *     delete preferences
	 *     remove toolbar icons
	 *     sends logs to pd server
	 *     opens feedback tab
	 */
	uninstall: function() {
		var self = this;
		
		// send logs to pd server
		this.pddb.orthogonals.log("doing uninstall...", "extn_sys");
		this.pd_api.send_data();
		
		// opens feedback tab
		gBrowser.selectedTab = gBrowser.addTab(constants.PD_URL + constants.FEEDBACK_URL);

		// delete all preferences
		// note that three prefs are not deleted....probably
		// caused by focus/blur timeout?
		this.prefs.remove("");

		// delete database (or rather, drop all the tables)
		_iterate(self.pddb.models, function(key, value, index) {
			if (key != "_order") {
				value.drop_table();
			}
		});
		
		// remove toolbar items
		this.toolbar_manager.uninstall_toolbar();
	},
});

/**
* 
*/
var PrivateBrowsingListener = function PrivateBrowsingListener(observerService, pddb, prefs, toolbar_manager) {
	this.observerService = observerService;
	this.pddb = pddb;
	this.prefs = prefs;
	this.toolbar_manager = toolbar_manager;

	this.register();
};
PrivateBrowsingListener.prototype = {};
_extend(PrivateBrowsingListener.prototype, {
	register: function() {
		this.observerService.addObserver(this, "private-browsing", false);
	},
	
	unregister: function() {
		this.observerService.removeObserver(this, "private-browsing", false);
	},
	
	observe: function(subject, topic, data) {
		this.pddb.orthogonals.log("Private browsing mode observer: "+data);
		if (topic == "private-browsing") {
			if (data == "enter") {
				this.prefs.set("private_browsing_enabled", true);
			} else if (data == "exit") {
				this.prefs.set("private_browsing_enabled", false);
			} else {
				this.pddb.orthogonals.log("Unknown private-browsing data: "+data, "privacy");
			}
		} else {
			this.pddb.orthogonals.log("Unknown private-browsing topic: "+topic+" data: "+data, "privacy");
		}
	}
});


/**************** content/js/main.js *****************/

/**
 * 
 * @return
 */
function Overlay() {
	//logger("Overlay()");
	//logger([window, document, gBrowser]);

	//this.pddb = 
	this.toolbar_manager = {};
	
	this.init_listener = new InitListener();
};

Overlay.prototype = {
};

var PDDB = function PDDB(db_filename) {
	this.db_filename = db_filename;

	this.orthogonals = new Orthogonals(this);
};

PDDB.prototype = {
	init_db: function() {
		var db = new Backend__Firefox();
		db.connect(this.db_filename);
		this.db = db;
		this.models = load_models(db, this);
		
		var self = this;
		_iterate(this.models, function(name, model) {
			self[name] = model; //new Model(db, name, spec);
			
			var already_exists = false;
			self.db.execute("SELECT * FROM sqlite_master", {}, function(row) {
				if (row[1] == model.table_name)
					already_exists = true;
			});
			if (!already_exists) {
				model.create_table();
			}
		});
		
		// install data if not already installed.
		
		// NOTE: onInstall will receive data from server after this is called
		
		/////// TAGS ////////
		this.Unsorted      = this.Tag.get_or_create({ tag: "Unsorted" })
		this.ProcrasDonate = this.Tag.get_or_create({ tag: "ProcrasDonate" })
		this.TimeWellSpent = this.Tag.get_or_create({ tag: "TimeWellSpent" })
		
		////// TIMETYPES ////////
		this.Daily   = this.TimeType.get_or_create({ timetype: "Daily" });
		this.Weekly  = this.TimeType.get_or_create({ timetype: "Weekly" });
		this.Yearly  = this.TimeType.get_or_create({ timetype: "Yearly" });
		this.Forever = this.TimeType.get_or_create({ timetype: "Forever" });
		
		////// PAYMENT SERVICES ////////
		this.AmazonFPS = this.PaymentService.get_or_create({
			name: "Amazon Flexible Payments Service",
			user_url: constants.AMAZON_USER_URL
		});

		////// CONTENTTYPES ////////
		if (this.ContentType.count() == 0) {
			var contenttype_names = ['Site', 'SiteGroup', 'Recipient', 'Tag'];
			_iterate(contenttype_names, function(key, value, index) {
				self[value+"ContentType"] = self.ContentType.create({ modelname: value });
			});
		}
	},
};

var Orthogonals = function Orthogonals(pddb) {
	this.pddb = pddb;
};
Orthogonals.prototype = {
	_record: function(type, msg, detail_type) {
		detail_type = detail_type || "default";
		this.pddb.Log.create({
			datetime: _dbify_date(new Date()),
			type: type,
			detail_type: detail_type,
			message: msg
		});
		logger("Orthogonal."+type+" ("+detail_type+"): "+msg);
	},
	
	info: function(msg, detail_type) {
		this._record("INFO", msg, detail_type);
	},
	
	debug: function(msg, detail_type) {
		this._record("DEBUG", msg, detail_type);
	},
	
	log: function(msg, detail_type) {
		/*try {
			this.FAIL(); // we expect this to fail because we haven't defined a FAIL property!
		} catch (e) {
			logger("Orthogonals lOOOOOOOg: "+detail_type+": "+msg+"\n"+e.stack);
		}*/
		this._record("LOG", msg, detail_type);
	},
	
	warn: function(msg, detail_type) {
		this._record("WARN", msg, detail_type);
	},
	
	fail: function(msg, detail_type) {
		this._record("FAIL", msg, detail_type);
	},
	
	error: function(msg, detail_type) {
		//logger("Orthogonal.ErRoR ("+detail_type+"): "+msg);
		this._record("ERROR", msg, detail_type);
		try {
			this.FAIL(); // we expect this to fail because we haven't defined a FAIL property!
		} catch (e) {
			logger("Orthogonals ERROR: "+detail_type+": "+msg+"\n"+e.stack);
		}
		//throw "Orthogonals ERROR: "+detail_type+": "+msg
	},
	
	UserStudy: function(type, msg, quant) {
		/*
		 * @param quant: some quantity (float)
		 */
		this.pddb.UserStudy.create({
			datetime: _dbify_date(new Date()),
			type: type,
			message: msg,
			quant: quant
		});
		logger("Orthogonal.UserStudy"+type+": "+msg+" ("+quant+")");
	}
	
}

var myOverlay = new Overlay();
return myOverlay
})();
