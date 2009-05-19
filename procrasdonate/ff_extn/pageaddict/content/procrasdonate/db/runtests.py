#!/usr/bin/env python

import sys, imp, glob
import unittest

def findmods(basedir="tests", prefix="test-", ext=".py"):
    if basedir.endswith("/"):
        basedir = basedir[:-1]
        
    file_pattern = "%s*%s" % (prefix, ext)
    
    mod_files = glob.glob1(basedir, file_pattern)
    
    for mod_file in mod_files:
        mod_name = mod_file[:-3]
        mod_info = imp.find_module(mod_name, [basedir])
        yield mod_name, mod_info
    
def findtests(tests=None, **kwargs):
    if tests is None:
        tests = []
        
    for mod_name, mod_info in findmods(**kwargs):
        include = False
        if len(tests) > 0:
            for test in tests:
                if test in mod_name:
                    include = True 
                    break
        else:
            include = True
            
        if not include:
            print "Skipping: %s" % (mod_name,)
            continue
            
        print "Running: %s" % (mod_name,)
        
        testmod = imp.load_module(mod_name, *mod_info)
        del sys.modules[mod_name]
        
        test = unittest.findTestCases(testmod)
        yield test
        

def runtests(tests=None):
    import sys, imp, glob
    sys.path[0:0] = ["./tests"]
    
    runner = unittest.TextTestRunner(verbosity=2)
    results = []
    print tests
    for test in findtests(tests):
        result = runner.run(test)
        results.append(result)
        

def main(args):
    return runtests(args)
    

if __name__ == "__main__":
    import sys
    exit(main(sys.argv[1:]))



