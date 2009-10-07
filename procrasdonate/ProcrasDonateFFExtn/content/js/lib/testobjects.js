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

