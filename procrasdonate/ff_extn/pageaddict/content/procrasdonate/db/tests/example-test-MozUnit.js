var TestCase = mozunit.TestCase;
var assert = mozunit.assert;

var tc = new TestCase('testcase description here');

tc.tests = {
    'First test is successful': function() {
        assert.isTrue(true);
    },
    test2: function() {
	var db_name="test000";
	var file = Components.classes["@mozilla.org/file/directory_service;1"]
	                     .getService(Components.interfaces.nsIProperties)
	                     .get("ProfD", Components.interfaces.nsIFile);
	file.append(db_name);
	
	var storageService = Components.classes["@mozilla.org/storage/service;1"]
	                               .getService(Components.interfaces.mozIStorageService);
	
	var db_conn = storageService.openDatabase(file);
	assert.isTrue(db_conn);
    },
}
