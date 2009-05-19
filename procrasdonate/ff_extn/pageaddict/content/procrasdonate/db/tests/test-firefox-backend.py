
from base import BaseTest
from js_test_utils import convert_value, PyJSUtils, JSBaseTest


import telnetlib, sys


class MozReplAssertionError(AssertionError):
    def __unicode__(self):
        return self.message
    

class MozUnitAssertionError(AssertionError):
    def __unicode__(self):
        return self.message
    

class MozReplTestCase(JSBaseTest):
    def setUp(self):
        super(MozReplTestCase, self).setUp()
        self.t = telnetlib.Telnet("localhost", 4242);
        try:
            index, match, text = self.t.expect(["(repl\d?)>"])
        except EOFError:
            raise
        #print text
        self.repl = match.groups()[0]
        
    def tearDown(self):
        self.t.close()
        del self.t
        super(MozReplTestCase, self).tearDown()
        
    def _output(self):
        try:
            data = self.t.read_eager()
            while data:
                sys.stdout.write(data)
                data = self.t.read_eager()
                
        except EOFError:
            # connection closed
            pass
        
    def execute(self, script, timeout=3):
        # Not entirely sure why, but this fixes some strange errors.
        script = "\r\n".join([line.strip() for line in script.splitlines()]) + "\r\n"
        self.t.write(script)
            
        index, match, text = self.t.expect(
            ["(repl\d?)>", "(%s)>" % ('\.' * len(self.repl))], 
            timeout=timeout)
        while index == 1:
            #print text
            index, match, text = self.t.expect(
                ["(repl\d?)>", "(%s)>" % ('\.' * len(self.repl))], 
                timeout=timeout)
        if not match:
            raise NoNewPrompt()
            #print "Failed to get new prompt"
            #elf.execute(";\n")
        print text
        value = text[:-1 - len(self.repl)].strip()
        return value
        #self._output()
    
    def assertRepl(self, script, expected):
        output = self.execute(script)
        if not output == expected:
            raise MozReplAssertionError(output)
        
    
class MozUnitTestCase(MozReplTestCase):
    def setUp(self):
        super(MozUnitTestCase, self).setUp()
        self._include("tests/js_moz_utils.js");
        self._include("tests/js_mozunit.js");
        
    def assertMozUnit(self, filename):
        f = open(filename)
        s = f.read()
        f.close()
        print "assertMozUnit", filename, len(s)
        script = "__repl = %s; %s;" % (self.repl, s)
        output = self.execute(script)
        if len(output) > 0:
            if "FAILURE" in output:
                raise MozUnitAssertionError(output)
            #print output
        

class TestMozJSUtils(MozUnitTestCase):
    #def test_MozRepl_connection(self):
    #    pass
    
    #def test_load_library(self):
    #    self._include("../ext/json2.js");
    #    self.assertRepl("!!JSON", "true")
    pass

class TestMozUnitTests(MozUnitTestCase):
    pass

class TestFirefoxBackend(MozUnitTestCase):
    def setUp(self):
        super(TestFirefoxBackend, self).setUp()
        #self._include("backends/sqlite3_firefox.js");
    
    #def test_include(self):
    #    s = """
    #    //%(repl)s.print("YAY");
    #    assert.isTrue(true);
    #    //assert.isTrue(false);
    #    """ % { "repl": self.repl }
    #    #v = self.execute(s)
    #    self.assertRepl(s, "")
    #    #self.assertEquals(v, True)
        
    def test_firefox_backend_js(self):
        self.assertMozUnit("tests/test-firefox-backend.js")
        
    #def test_firefox_backend_js2(self):
    #    pass

