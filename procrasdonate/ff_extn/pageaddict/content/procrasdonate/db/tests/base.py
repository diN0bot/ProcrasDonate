
import unittest

class BaseTest(unittest.TestCase):
    def setUp(self):
        super(BaseTest, self).setUp()
        
    def tearDown(self):
        super(BaseTest, self).tearDown()
    
    #def _includes(self, *filenames):
    #    for filename in filenames:
    #        if isinstance(filename, (list, tuple)):
    #            self._includes(*filename)
    #        elif isinstance(filename, dict):
    #            pass
    #        else:
    #            self._include(filename)
    #        
    #def _include(self, filename):
    #    f = open(filename)
    #    s = f.read()
    #    f.close()
    #    
    #    self.cx.execute(s)
        
        
    


