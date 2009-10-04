
function Test(tests) {
	this.tests = tests || {};
	
	if (this.tests.setUp) {
		this.setUp = this.tests.setUp;
		delete this.tests.setUp;
	}
	if (this.tests.tearDown) {
		this.tearDown = this.tests.tearDown;
		delete this.tests.tearDown;
	}
	
}
Test.prototype = {
	setUp: function(){},
	tearDown: function(){},
	
	run_tests: function() {
		
	},
};


var test_get = new Test({
	
});

var test_Context = new Test({
	
});

var test_Template = new Test({
	
});

var test_StringTemplate = new Test({
	
});

var test_FunctionTemplate = new Test({
	
});

var test_DjangoTemplate = new Test({
	
});


var test_FILTERS = new Test({
	
});

var test_TAGS = new Test({
	
});

