

import django.template

from template_walker import DEFAULT, Handler, List, Literal, Tuple, TemplateWalker

class VariableHandler(Handler):
    def handle(self, converter, var):
        if not isinstance(var, django.template.Variable):
            return var
        elif var.literal != None:
            return var.literal
        else:
            return list(var.lookups)
    

class FilterExpressionHandler(Handler):
    def __init__(self, *args, **kwargs):
        super(FilterExpressionHandler, self).__init__(*args, **kwargs)
        self.variable_handler = VariableHandler()
        
    def get_filter_name(self, filter):
        if hasattr(filter[0], '_decorated_function'):
            return filter[0]._decorated_function.__name__
        else:
            return filter[0].__name__
        
    def handle(self, converter, expr):
        if not isinstance(expr, django.template.FilterExpression):
            return ['var', self.variable_handler.handle(converter, expr), []]
        
        filter_chain = []
        
        for filter in expr.filters:
            name = self.get_filter_name(filter)
            args = []
            for arg in filter[1]:
                args.append(self.variable_handler.handle(converter, arg[1]))
            filters.append([name] + args)
            
        return ['var', self.variable_handler.handle(converter, expr.var), filter_chain]
    
class VariableNodeHandler(Handler):
    def __init__(self, *args, **kwargs):
        self.filter_expression_handler = FilterExpressionHandler()
        
    def handle(self, converter, node):
        expr = node.filter_expression
        return self.filter_expression_handler.handle(converter, expr)
    

class TextNodeHandler(Handler):
    def handle(self, converter, node):
        return node.s
    

class NodeListHandler(Handler):
    default = []
    def handle(self, converter, nodelist):
        if nodelist is None:
            return self.default
        #else:
        #    return [converter.handle_object(converter, node) for node in nodelist]
        
        output = []
        for node in nodelist:
            value = converter.handle_object(converter, node)
            output.append(value)
            
        return output
    

class AttributeHandler(Handler):
    default = None
    def __init__(self, name, type_, default=DEFAULT):
        self.name = name
        self.type_ = type_
        if not default is DEFAULT:
            self.default = default
        
    def handle_node(self, converter, node):
        value = getattr(node, self.name, self.default)
        if value == None:
            print "\n --> %s had None for value and default (%s and %s)." % (self.name,
                                                                             value,
                                                                             self.default)
            print "node =", node
            print "Set to empty string so template builder doesn't barf\n"
            #value = ""
        return self.handle(converter, value)
    
    def handle(self, converter, value):
        if isinstance(self.type_, Handler):
            handler = self.type_
        elif issubclass(self.type_, Handler):
            handler = self.type_()
        else:
            handler = converter.get_handler(self.type_)
            
            if handler is None:
                raise RuntimeError("Attribute type has no mapping: %s" % (self.type_,))
            
        return handler.handle(converter, value)
    

class NodeHandler(Handler):
    @classmethod
    def make(cls, label, attrs, **attr_types):
        if attrs is None:
            attrs = []
            
        if len(attrs) == 0:
            if len(attr_types) > 0:
                attrs = attr_types.keys()
                
        attr_handlers = []
        for attr in attrs:
            if attr in attr_types:
                type_ = attr_types[attr]
                
            handler = AttributeHandler(attr, type_)
            attr_handlers.append(handler)
            
        return cls(label, attr_handlers)
    
    def __init__(self, label, attr_handlers): # attrs, **attr_types):
        self.label = label
        self.attr_handlers = attr_handlers
        
    def handle(self, converter, node):
        if self.label is None:
            return []
        
        args = []
        for handler in self.attr_handlers:
            value = handler.handle_node(converter, node)
            args.append(value)
            
        return [self.label] + args
    

class TemplateLiteralHandler(Handler):
    def handle(self, converter, node):
        if node is None:
            return None
        from django.template import smartif, defaulttags
        if isinstance(node, defaulttags.TemplateLiteral):
            return FilterExpressionHandler().handle(converter, node.value)
        elif isinstance(node, smartif.TokenBase):
            return ['cond', 
                    node.id, 
                    TemplateLiteralHandler().handle(converter, node.first),
                    TemplateLiteralHandler().handle(converter, node.second)]
        else:
            raise RuntimeError()

class IfNodeHandler(Handler):
    #old_IfNodeHandler = NodeHandler.make(
    #        "if", ["bool_exprs", "link_type", "nodelist_true", "nodelist_false"],
    #        bool_exprs=List(Tuple(Literal(), FilterExpressionHandler())),
    #        link_type=Literal,
    #        nodelist_true=NodeList,
    #        nodelist_false=NodeList)
    
    def handle(self, converter, node):
        nodelist_true = NodeListHandler(node.nodelist_true)
        nodelist_false = NodeListHandler(node.nodelist_false)
        
        if hasattr(node, 'var'):
            return TemplateLiteralHandler().handle(converter, node.var)
        elif hasattr(node, 'bool_exprs') and hasattr(node, 'link_type'):
            return self.old_IfNodeHandler().handle(converter, node)
        else:
            raise RuntimeError()
        

def prepare_handlers(handlers=None):
    # These are the types we use as attributes
    from django.template import Template, Variable, FilterExpression, NodeList
    
    # These types are only used to dispatch handlers
    from django.template import \
        TextNode, VariableNode
    from django.template.defaulttags import \
        AutoEscapeControlNode, ForNode, IfNode, IfEqualNode, \
        FirstOfNode, WithNode, SpacelessNode, CommentNode, \
        TemplateLiteral
    from django.template.loader_tags import \
        ExtendsNode, IncludeNode, ConstantIncludeNode, BlockNode
    from django.template.debug import \
        DebugNodeList, DebugVariableNode
    
    if handlers is None:
        handlers = {}
    
    def handle(klass, label=None, attrs=[], **attr_types):
        handler = NodeHandler.make(label, attrs, **attr_types)
        handlers[klass] = handler
    
    
    handlers[FilterExpression] = FilterExpressionHandler()
    
    handlers[NodeList] = NodeListHandler()
    handlers[TextNode] = TextNodeHandler()
    #handle(VariableNode, filter_expression=FilterExpression)
    handlers[VariableNode] = VariableNodeHandler() # handlers[FilterExpression]
    
    handlers[DebugNodeList] = handlers[NodeList]
    handlers[DebugVariableNode] = handlers[VariableNode]
    
    #handlers[TemplateLiteral] = TemplateLiteralHandler()
    
    handle(AutoEscapeControlNode, 
           "autoescape")
    
    handle(ForNode, 
           "for", ["loopvars", "sequence", "is_reversed", "nodelist_loop"],
           loopvars=List(Literal()),
           sequence=FilterExpression,
           is_reversed=Literal,
           nodelist_loop=NodeList)
    
    handlers[IfNode] = IfNodeHandler()
    
    #handle(IfNode, 
    #       "if", ["var", "nodelist_true", "nodelist_false"],
    #       var=TemplateLiteralHandler(),
    #       #bool_exprs=List(Tuple(Literal(), FilterExpressionHandler())),
    #       #link_type=Literal,
    #       nodelist_true=NodeList,
    #       nodelist_false=NodeList)
    
    handle(IfEqualNode, 
           "ifequal", ["var1", "var2", "nodelist_true", "nodelist_false"],
           var1=FilterExpression,
           var2=FilterExpression,
           nodelist_true=NodeList,
           nodelist_false=NodeList)
    
    handle(FirstOfNode, 
           "firstof",
           vars=List(FilterExpressionHandler()))
    
    handle(WithNode, 
           "with", ["var", "name", "nodelist"],
           var=FilterExpression,
           name=Literal,
           nodelist=NodeList)
    
    #handle(ExtendsNode, 
    #       "extends", ["parent_name", "parent_name_expr", "nodelist"],
    #       parent_name=Literal,
    #       parent_name_expr=FilterExpression
    #       )#nodelist=NodeList)
    
    handle(ConstantIncludeNode, 
           "include",
           template=Literal)
    
    handle(IncludeNode, 
           "include",
           #template_name=Literal)
           template_name=FilterExpression)
    
    handle(BlockNode, 
           "block", ["name", "nodelist", "parent"],
           name=Literal,
           nodelist=NodeList,
           parent=NodeList)
    
    #handle(TemplateTagNode, lambda n: dt.TemplateTagNode.mapping.get(n.tagtype, '')),
    
    handle(SpacelessNode,
           nodelist=NodeList)
    
    handle(CommentNode, "nop")
    
    return handlers



class JSONTemplateConverter(TemplateWalker):
    handlers = None
    def __init__(self):
        if self.handlers is None:
            handlers = prepare_handlers()
            JSONTemplateConverter.handlers = handlers
        #super(JSONTemplateConverter, self).
            
    def convert_nodelist(self, nodelist):
        return self.handle_object(self, nodelist)
    
    def convert(self, template):
        return self.handle(self, template)
    
json_template_converter = JSONTemplateConverter()

def jsonify_nodelist(nodelist):
    data = json_template_converter.convert_nodelist(nodelist)
    
    from django.utils import simplejson
    json = simplejson.dumps(data)
    
    return json

def get_json_template(path):
    from django.template.loader import get_template
    template = get_template(path)
    
    return jsonify_nodelist(template.nodelist)

