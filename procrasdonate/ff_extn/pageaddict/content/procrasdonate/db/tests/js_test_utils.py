
def convert_value(value):
    import spidermonkey
    if isinstance(value, spidermonkey.Array):
        return [value[i] for i in range(0, len(value))]
    else:
        raise RuntimeError()
    
class PyJSUtils(object):
    def __init__(self, cx, base_dir=None):
        self.cx = cx
        self.base_dir = base_dir
    
    def install_globals(self, globals):
        if isinstance(globals, (dict)):
            globals = globals.items()
        
        for item in globals:
            if isinstance(item, tuple):
                name, value = item
                self.cx.add_global(name, value)
            elif hasattr(item, "__name__"):
                name = item.__name__
                self.cx.add_global(name, item)
        
    def install(self):
        import sqlite3
        self.install_globals({
            "_read_file": self._read_file,
            "_include": self._include,
            "_print": self._print,
            "_Python": {
                "list": list,
                "dict": dict,
                "tuple": tuple,
                "tuplefy": self._tuplefy,
                "sqlite3": sqlite3
                }
            })
        #self.cx.add_global("_read_file", self._read_file)
        #self.cx.add_global("_include", self._include)
        #self.cx.add_global("_print", self._print)
        
    def wrapper(self, fn):
        def decoration(self, *args, **kwargs):
            try:
                ret = fn(*args, **kwargs)
            except e:
                pass
            return ret
        return decoration
    
    def _tuplefy(self, *args):
        return args
    
    def rebase_filename(self, filename):
        if self.base_dir is not None:
            if not self.base_dir.endswith("/"):
                self.base_dir = self.base_dir + "/"
            return self.base_dir + filename
        return filename
    
    def _print(self, arg):
        import pprint
        pprint.pprint(arg)
    
    def _include(self, filename):
        s = self._read_file(filename)
        return self.cx.execute(s)
    
    def _read_file(self, filename):
        filename = self.rebase_filename(filename)
        try:
            f = open(filename)
            s = f.read()
            f.close()
            return s
        except:
            raise
            return None
    


from base import BaseTest

class JSBaseTest(BaseTest):
    def _includes(self, *filenames):
        for filename in filenames:
            if isinstance(filename, (list, tuple)):
                self._includes(*filename)
            elif isinstance(filename, dict):
                pass
            else:
                self._include(filename)
            
    def _include(self, filename):
        print "_include(%r)" % (filename,)
        f = open(filename)
        s = f.read()
        f.close()
        self.execute(s)
        
