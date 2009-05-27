

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


var _print = function(msg) {
	logger(msg);
};


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
					throw ERROR("Don't know how to handle o._order: " + o._order);
				}
			} else {
				throw ERROR("Don't know how to handle o._order: " + o._order);
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
		throw ERROR("Cannot iterate object o: " + o);
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
//		throw ERROR("Cannot make 'dict' from object o: " + o);
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

var host_regexp =  /^[\w]+:\/\/([^\/]+).*/g;

var _host = function(href) {
	if (!href) {
		var urlbar = document.getElementById('urlbar');
		// @TODO if urlbar is null...
		href = urlbar.value;
	}
	var splits = href.split(host_regexp);
	
	if ( splits.length > 1 ) {
		return splits[1]
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
/*
function isEmpty(o) {
	var o = {};
	for(var p in o) {
		if (o[p] != o.constructor.prototype[p]) {
			return false;
		}
	}
	return true;
}
*/