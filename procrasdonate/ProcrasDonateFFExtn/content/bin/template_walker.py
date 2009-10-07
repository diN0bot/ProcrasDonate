

DEFAULT = object()

class Handler(object):
    default = None
    def __init__(self, default=DEFAULT):
        if not default is DEFAULT:
            self.default = default
        
    def handle(self, converter, obj):
        raise NotImplemented
    

class Literal(Handler):
    def handle(self, converter, value):
        if value is None:
            return self.default
        else:
            return value
        

class List(Handler):
    def __init__(self, handler):
        self.handler = handler
        
    def handle(self, converter, items):
        ret_values = []
        for item in items:
            value = self.handler.handle(converter, item)
            ret_values.append(value)
            
        return ret_values
    

class Tuple(Handler):
    def __init__(self, *arg_handlers):
        self.arg_handlers = arg_handlers
        
    def handle(self, converter, items):
        ret_value = []
        if not len(items) == len(self.arg_handlers):
            raise RuntimeError("Tuple handler got a bad tuple.")
        
        for handler, item in zip(self.arg_handlers, items):
            value = handler.handle(converter, item)
            ret_value.append(value)
            
        return ret_value
    


class TemplateWalker(object):
    def __init__(self, handlers=None):
        if handlers is None:
            handlers = {}
        self.handlers = handlers
        
    def walk(self):
        return self.handle(self, self.template)
    
    def handle(self, converter, template):
        nodelist = template.nodelist
        return self.handle_object(converter, nodelist)
    
    def handle_object(self, converter, obj):
        handler = converter.get_handler(obj)
        
        if handler is None:
            return ["blah"]
            #raise RuntimeError("Attribute has no mapping: %s" % (obj,))
        
        value = handler.handle(converter, obj)
        return value
    
    def get_handler(self, obj):
        handler = None
        #print type(obj), obj
        
        if isinstance(obj, Handler):
            return obj
        
        try:
            return self.handlers[obj]
        except TypeError, e:
            pass
        except KeyError, e:
            pass
        
        if isinstance(obj, type):
            if issubclass(obj, Handler):
                return obj()
            
        if type(obj) in self.handlers:
            handler = self.handlers[type(obj)]
            
        return handler
    
