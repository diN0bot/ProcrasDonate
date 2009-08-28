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
		console.error("TestRunnerDisplay.display_test_group_result() called, but TestRunnerDisplay should be subclassed.");
	},
	
	/// all tests have run.
	/// do clean up and summarization, if necessary
	test_done: function(testrunner) {
		console.error("TestRunnerDisplay.test_done() called, but TestRunnerDisplay should be subclassed.");
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
		Firebug.Console.openGroup([passing+"/"+total+" = "+summary+" for "+testgroup.name], null, "group", null, false);
		for (var i = 0; i < testgroup.assertions.length; i++) {
			var assertion = testgroup.assertions[i];
			Firebug.Console.log(i+". *"+assertion.result+"* "+assertion.msg);
		}
		Firebug.Console.closeGroup();
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
/// @TODO actually implement this.
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

	display_testgroup_result: function(testrunner) {
		
	},
	
	test_done: function(testrunner) {
		
	}

});