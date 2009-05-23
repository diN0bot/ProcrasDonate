
Components.utils.import('resource://mozunit/test_case.jsm');
Components.utils.import('resource://mozunit/assertions.jsm');

//
//var tc = new TestCase();
//
//
//tc.tests = {
//	test_load: function() {
//		var JSON;
//		eval(load("file:///home/dan/work/jsdan/ext/json2.js"));
//		assert.isTrue(JSON);
//	},
//    'two plus two is four': function() {
//        assert.equals(4, 2+3);
//    }
//};
//
//tc.run({ onResult: function(report) { repl.print(report) } });

function Suite(tests) {
	if (!(this instanceof Suite))
		return (new Suite(tests)).run();
	
	this.tests = tests;
};
Suite.prototype = {
	run: function() {
		var old_repl = window.repl;
		
		if (typeof(__repl) != "undefined")
			window.repl = __repl;
		
		try {
			var tc = new TestCase();
			tc.tests = this.tests;
			var ret = tc.run({ onResult: function(report) { repl.print(report) } });
		} catch (e) {
			repl.print(e);
		}
		window.repl = old_repl;
		return ret;
	}
};


/*** USAGE:
Suite({
	test_load: function() {
		var JSON;
		eval(load("file:///home/dan/work/jsdan/ext/json2.js"));
		assert.isTrue(JSON);
	},
    'two plus two is four': function() {
        assert.equals(4, 2+3);
    }
});

or

new Suite({
	test_load: function() {
		var JSON;
		eval(load("file:///home/dan/work/jsdan/ext/json2.js"));
		assert.isTrue(JSON);
	},
    'two plus two is four': function() {
        assert.equals(4, 2+3);
    }
});

*/