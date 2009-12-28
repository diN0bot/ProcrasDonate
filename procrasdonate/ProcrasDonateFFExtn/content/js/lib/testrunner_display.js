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
