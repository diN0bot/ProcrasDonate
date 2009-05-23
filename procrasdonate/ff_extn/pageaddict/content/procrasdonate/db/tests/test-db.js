
function Result(name) {
	this.name = name;
	this.args = Array.slice.apply(arguments, [0]);
}
Result.prototype.toString = function() {}

Result.Failure = function(name, reason, data) {
	Result.apply(this, [name]);
	this.reason = reason;
	this.data = data;
};
Result.Failure.prototype = new Result;
Result.Failure.prototype.toString = function() {
	return "FAIL: " + this.name + " " + this.reason + " => " + this.data;
};

Result.Success = function(name) {
	Result.apply(this, [name]);
};
Result.Success.prototype = new Result;
Result.Success.prototype.toString = function() {
	return ".";
};

function TestCase(name, tests) {
	//if (!__tests__)
	//	__tests__ = [];
	//__tests__.push(this);
	
	this.name = name;
	this.tests = tests;
	
	this.tests = {};
	this.test_names = [];
	
	for (var key in tests) {
		var value = tests[key];
		if (/^test.*/.test(key)) {
			this.test_names.push(key);
			this.tests[key] = value;
			delete tests[key];
		}
	}
	
}
TestCase.prototype.setUp = function() {};
TestCase.prototype.tearDown = function() {};

TestCase.prototype.run_test = function(name) {
	if (!this.tests[name]) {
		throw "Test not found: " + name;
	}
	var test_fn = this.tests[name];
	
	this.setUp();
	try {
		test_fn.apply(this, []);
		return new Result.Success(name);
	} catch (e) {
		return new Result.Failure(name, "exception", e);
	}
	this.tearDown();
}
TestCase.prototype.run = function() {
	var results = [];
	for (var key in this.tests) {
		_print(key + ": ");
		var result = this.run_test(key);
		_print(result);
		results.push(result);
	}
	return results;
}

TestCase.prototype.assertEquals = function(a, b) {
	if (!(a == b)) {
		throw "Failure: " + a + " != " + b;
	}
}

var tests = new TestCase("db", {
	setUp: function() {},
	tearDown: function() {},
	test_1: function() {
		this.assertEquals(1,2);
	},
	test_2: function() {
		this.assertEquals(2,2);
	},
});
tests.run();