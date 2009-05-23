
from base import BaseTest
from js_test_utils import convert_value, PyJSUtils, JSBaseTest

#class RunJSTests(BaseTest):
#    def setUp(self):
#        pass
#    
#def load_js_tests(filename, cx=None):
#    pass
#

#import spidermonkey
class SpidermonkeyTestCase(JSBaseTest):
    def setUp(self):
        self.rt = spidermonkey.Runtime()
        self.cx = self.rt.new_context()
        
    def tearDown(self):
        super(SpidermonkeyTestCase, self).tearDown()
        
    def execute(self, script):
        value = self.cx.execute(script)
        return value
    

class TestJSUtils(SpidermonkeyTestCase):
    def setUp(self):
        super(TestJSUtils, self).setUp()
        py_js_utils = PyJSUtils(self.cx, base_dir='..')
        py_js_utils.install()
        
    def test_include(self):
        v = self.cx.execute("""
        _include("lib/utils/istype.js");
        isBoolean(true);
        """)
        self.assertEquals(v, True)
        
    def test_exception(self):
        v = self.cx.execute("""
        try {
            throw "blah";
            //_include("asldfjaksjf");
        } catch (e) {
            _print(e);
        }
        """)
        print v
        
    def test_backend(self):
        self._include("backend.js")
        v = self.cx.execute("""
        db = new PythonSQLite3_backend();
        db.connect(":memory:");
        c = db.cursor();
        c.execute("create table t0(c0)");
        c.execute("select * from sqlite_master");
        c.fetchall();
        """)
        self.assertEqual(v, [('table', 't0', 't0', 2, 'CREATE TABLE t0(c0)')])
        v = self.cx.execute("""
        c.execute("insert into t0(c0) values (?)", [2]);
        c.execute("select * from t0");
        c.fetchall();
        """)
        self.assertEqual(v, [(2,)])
        v = self.cx.execute("""
        c.execute("insert into t0(c0) values (:x)", {x:3});
        c.execute("select * from t0");
        c.fetchall();
        """)
        self.assertEqual(v, [(2,),(3,)])
        v = self.cx.execute("""
        c.execute("insert into t0(c0) values (?)", [2]);
        c.execute("select * from t0");
        c.fetchmany(2);
        """)
        self.assertEqual(v, [(2,), (3,)])
        
    def test_statement(self):
        self._include("backend.js")
        v = self.cx.execute("""
        db = new PythonSQLite3_backend();
        db.connect(":memory:");
        c = db.cursor();
        c.execute("create table t0(c0)");
        
        s = db.statement("insert into t0(c0) values (:c0)", {c0:123});
        _print(s.render());
        s.render();
        s.execute();
        q = s.clone();
        q.c0 = "321";
        _print(q.render());
        q.execute();
        t = db.statement("select * from t0");
        c = t.execute();
        c.fetchall();
        //c = db.cursor();
        //c.execute("insert into t0(c0) values (?)", [2]);
        //c.execute("select * from t0");
        //c.fetchmany(2);
        """)
        #self.assertEqual(v, [(2,), (3,)])
        
    def test_TestCase(self):
        self._include("tests/test-db.js")
        #v = self.cx.execute()
