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
	// @TODO ok, TestRunnerDisplay is done...
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
