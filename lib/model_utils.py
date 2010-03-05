import exceptions
import re
import os
import datetime

import settings

from django.shortcuts import get_object_or_404
from django.http import Http404

"""
@summary:
The B{utils} module provide methods and classes which are not 
specific to any model.

"""
class UserNotAuthenticated(RuntimeError): pass
class UserObjectOrIntegerExpected(RuntimeError): pass

class AlreadyExists(RuntimeError): pass

def mixin(mixin, klasses, last=0):
    if not isinstance(klasses, (list, tuple)):
        klasses = (klasses,)
    for klass in klasses:
        if mixin not in klass.__bases__:
            if last:
                klass.__bases__ = klass.__bases__+(mixin,)
            else:
                # sometimes this fails, but if change order seems to work
                try:
                    klass.__bases__ = (mixin,)+klass.__bases__
                except:
                    klass.__bases__ = klass.__bases__+(mixin,)

def mixin_method(klasses):
    if not isinstance(klasses, (list, tuple)):
        klasses = (klasses,)
    def decorator(func):
        for klass in klasses:
            setattr(klass, func.__name__, func)
    return decorator

def mixin_property(klasses):
    if not isinstance(klasses, (list, tuple)):
        klasses = (klasses,)
    def decorator(func):
        for klass in klasses:
            setattr(klass, func.__name__, property(func, doc=func.__doc__))
    return decorator

if 'user_profile' in settings.APPS:
    import user_profile.middleware
    def current_user():
        """
        @summary: Retrieves currently logged in user or AnonymousUser from request.
        This wouldn't make sense outside of a webapp. That makes this a webapp starter.
        @return: User or AnonymousUser
        """
        return user_profile.middleware.get_current_user()

#Decorator ideas from http://wiki.python.org/moin/PythonDecoratorLibrary#head-5348d85be3a972ad67398fafb370b5bca39c8341
def clean_decorator(decorator):
    """
    @summary:
    This decorator can be used to turn simple functions
    into well-behaved decorators, so long as the decorators
    are fairly simple. If a decorator expects a function and
    returns a function (no descriptors), and if it doesn't
    modify function attributes or docstring, then it is
    eligible to use this. Simply apply @simple_decorator to
    your decorator and it will automatically preserve the
    docstring and function attributes of functions to which
    it is applied.
    """
    def new_decorator(f):
        g = decorator(f)
        g.__name__ = f.__name__
        g.__doc__ = f.__doc__
        g.__dict__.update(f.__dict__)
        return g
    # Now a few lines needed to make simple_decorator itself
    # be a well-behaved decorator.
    new_decorator.__name__ = decorator.__name__
    new_decorator.__doc__ = decorator.__doc__
    new_decorator.__dict__.update(decorator.__dict__)
    return new_decorator

def merge_many_to_many(items, binder, queryset, single_result=False, 
                       id_path="id"):
    from django.db.models.query import Q, QAnd, QOr
    from operator import itemgetter, attrgetter
    from itertools import repeat, groupby
    
    # Generate the Q objects and the (type_id, id)-ordered item list
    id_path_q = id_path + "__in"
    
    item_ids = map(attrgetter("id"), items)
    q = Q(**{ id_path_q : item_ids })
    item_set = dict(zip(item_ids, items))
    
    results = queryset.filter(q).order_by(id_path + "_id")[:]
    
    id_path_attr = id_path + "_id"
    
    result_set = {}
    item_group = groupby(results, attrgetter(id_path_attr)) #lambda result: result.id)
    for item_id, item_iter in item_group:
        result_set[item_id] = list(item_iter)
        
    #print repr((results))
    #print repr((result_set))
    
    for item_id, item in item_set.items():
        item_results = result_set.get(item_id, [])
        binder(item, item_results)
        
    return


def merge_polymorphic(items, binder, queryset, single_result=False, 
                      base_path="", item_type_path="item_type", item_id_path="item_id"):
    from django.db.models.query import Q, QAnd, QOr
    from django.contrib.contenttypes.models import ContentType
    from operator import itemgetter, attrgetter
    from itertools import repeat, groupby
    
    get_content_type = ContentType.objects.get_for_model
    
    # First, separate the items by type
    klass_items = {}
    for item in items:
        klass_items.setdefault(type(item), []).append(item)
    
    #ct_q = []
    #for model in klass_items.keys():
    #    ct_q.append(QAnd( Q(app_label=model._meta.app_label),
    #                      Q(model=model._meta.module_name) ))
    #ct_q = QOr(*ct_q)
    #ContentType.objects.filter(ct_q)._get_data()
    
    # Second, map each type and item to its id
    #klass_items = [(klass, items) for klass, items in klass_items.items()]
        
    # Third, generate the Q objects and the (type_id, id)-ordered item list
    qs = []
    item_set = {}
    
    item_type_path_q = base_path + item_type_path + "__id"
    item_id_path_q = base_path + item_id_path + "__in"
    
    for model, items in klass_items.items(): #.items():
        type_id = get_content_type(model).id
        item_ids = map(attrgetter("id"), items)
        qs.append( QAnd( Q(**{ item_type_path_q : type_id  }),
                         Q(**{ item_id_path_q   : item_ids }) ))
        item_set[type_id] = dict(zip(item_ids, items))
        
    q = QOr(*qs)
    
    results = queryset.filter(q).order_by(item_type_path+"_id", item_id_path)[:]
    
    result_set = {}
    
    item_type_path_attr = item_type_path + "_id"
    item_id_path_attr = item_id_path
    
    type_group = groupby(results, attrgetter(item_type_path_attr)) 
    #lambda result: getattr(result, item_type_path + "_id".item_type_id)
    for type_id, type_iter in type_group:
        result_set[type_id] = {}
        item_group = groupby(type_iter, attrgetter(item_id_path_attr))
        #lambda result: item_id)
        for item_id, item_iter in item_group:
            result_set[type_id][item_id] = list(item_iter)
        
    for type_id, items in item_set.items():
        type_results = result_set.get(type_id, {})
        for item_id, item in items.items():
            item_results = type_results.get(item_id, [])
                                            #(single_result and (list(),) or (None,))[0])
            binder(item, item_results)
            
    return


import sys

def propget(func):
    locals = sys._getframe(1).f_locals
    name = func.__name__
    prop = locals.get(name)
    if not isinstance(prop, property):
        prop = property(func, doc=func.__doc__)
    else:
        doc = prop.__doc__ or func.__doc__
        prop = property(func, prop.fset, prop.fdel, doc)
    return prop

def propset(func):
    locals = sys._getframe(1).f_locals
    name = func.__name__
    prop = locals.get(name)
    if not isinstance(prop, property):
        prop = property(None, func, doc=func.__doc__)
    else:
        doc = prop.__doc__ or func.__doc__
        prop = property(prop.fget, func, prop.fdel, doc)
    return prop

def propdel(func):
    locals = sys._getframe(1).f_locals
    name = func.__name__
    prop = locals.get(name)
    if not isinstance(prop, property):
        prop = property(None, None, func, doc=func.__doc__)
    else:
        prop = property(prop.fget, prop.fset, func, prop.__doc__)
    return prop


cache_names = {}
def get_new_cache_name():
    import random
    name = "_cached_" + "".join([chr(97 + random.randint(0, 25)) for i in range(5)])
    if name in cache_names:
        return get_new_cache_name()
    else:
        return name
    
def cached_property(func, name=None):
    def deco(func, name):
        def fget(self):
            #print repr((func, name))
            if not hasattr(self, name): #name not in self._hm_cache:
                setattr(self, name, func(self)) #self._hm_cache[name] = func()
            return getattr(self, name)
            #return self._hm_cache[name]
        
        def fset(self, value):
            setattr(self, name, value)
            return getattr(self, name)
            #self._hm_cache[name] = value
            #return value
        
        def fdel(self):
            delattr(self, name)
            #del self._hm_cache[name]
        
        prop = property(fget=fget, fset=fset, fdel=fdel, doc="cached_property")
        return prop
    
    if not name:
        name = get_new_cache_name()
        
    return deco(func, name)
    
class ModelMixin(object):
    """
    @summary:
    B{ModelMixin} is a mix-in used to provide common methods, attributes,
    and hooks across all models.
    
    At initialization, ModelMixin is mixed into all models listed in 
    """
    @classmethod
    def find(klass, ids=None, **kwargs):
        """
        @summary:
        Convenience method: B{find} simply passes arguments through to
        klass.objects.filter()
        """
        if isinstance(ids, (int, long)):
            return klass.objects.filter(id=ids, **kwargs)
        elif isinstance(ids, list):
            return klass.objects.filter(id__in=ids, **kwargs)
        else:
            return klass.objects.filter(**kwargs)
        
    @classmethod
    def get_or_404(klass, **kwargs):
        x = klass.get_or_none(**kwargs)
        if not x:
            raise Http404
        else:
            return x

    @classmethod
    def get_or_none(klass, **kwargs):
        """
        @summary:
        Convenience method: B{get_or_none} simply passes arguments through to
        klass.objects.filter()
        """
        f = klass.objects.filter(**kwargs)
        if len(f) == 0:
            return None
        else:
            return f[0]
        
    @classmethod
    def get(klass, id=None, **kwargs):
        """
        Convenience method: B{get} simply passes arguments through to 
        klass.objects.get()
        
        @note: Raises exceptions anytime 'get' would.
        """
        if isinstance(id, (int, long)):
            #return klass.objects.get_object_or_404(id=id, **kwargs)
            return get_object_or_404(klass, id=id, **kwargs)
        elif len(kwargs) > 0:
            return klass.objects.get(**kwargs)
        else:
            raise RuntimeError("No id or conditions given to 'get'!")
    
    @classmethod
    def add(klass, *args, **kwargs):
        """
        @summary:
        This is a general method which simply calls 'make' with the same
        arguments and then saves the returned object.
        """
        o = klass.make(*args, **kwargs)
        o.save()
        #if publish:
        #    o.publish()
        return o


class TextProcessor(object):
    """
    Static class for doing text processing.
    """
    tags = re.compile('<[^>]*>')
    p_endstart_tags = re.compile('</p>\s*<p>')
    p_startonlyhack_tags = re.compile('<p>')
    
    links = re.compile('(https?://\S*)') # \S matches any non-whitespace character; this is equivalent to the class [^ \t\n\r\f\v].
    domain_re = re.compile('https?://([^ /]*)')

    @classmethod
    def remove_html(klass, signal, sender, instance, **kwargs):
        """
        @summary: 
        PRE SAVE
        This method is called every time a model instance is saved (if signal is added).
        Removes html from textfield.
        """
        d = getattr(instance, instance.textprocessor_fieldname()).strip()
        # replace <p>\s*</p> with two carriage returns
        d = TextProcessor.p_endstart_tags.sub('%s%s' % (os.linesep, os.linesep), d)
        # replace <p> with two carriage returns
        # this is for scraped descriptions from websites that don't include </p>
        d = TextProcessor.p_startonlyhack_tags.sub('%s%s' % (os.linesep, os.linesep), d)
        # remove html tags
        d = TextProcessor.tags.sub('', d).strip()
        setattr(instance, instance.textprocessor_fieldname(), d)
        return 

def _make_available_letters(choice_names):
    alpha = "abcdefghijklmnopqrstuvwxyz"
    if len(choice_names) < 26:
        return (1, [x for x in alpha])
    elif len(choice_names) < 26*26:
        ret = []
        for x in alpha:
            for y in alpha:
                ret.append(x+y)
        return (2, ret)
    raise RuntimeError()
    
def convert_to_choices(choice_names, visible_names=None):
    visible_names = visible_names or choice_names
    max_length, available_letters = _make_available_letters(choice_names)

    ENUM = {}
    CHOICES = []
    choice_idx = 0
    for choice_name in choice_names:
        # find choice abbreviation
        idx = -1
        num_letters = 1
        x = ""
        while not x.lower() in available_letters:
            idx += 1
            if idx+num_letters <= len(choice_name):
                x = choice_name[idx : idx+num_letters]
            
            elif num_letters < max_length:
                idx = -1
                num_letters += 1
            
            else:
                x = available_letters[0]
        available_letters.remove(x.lower())
        
        # add to enum and choices
        ENUM[choice_name] = x
        CHOICES.append( (x, visible_names[choice_idx]) )
        
        choice_idx += 1
            
    return max_length, ENUM, CHOICES


def send_email(subject, message, to_email, from_email=None):
    """
    Sends an e-mail.
    If DJANGO_SERVER is true, then prints email to console instead
    """
    if settings.DJANGO_SERVER:
        print "="*60
        print "FROM:", from_email
        print "TO:", to_email
        print "SUBJECT:", subject
        print "MESSAGE:", message
    else:
        from django.core.mail import send_mail
        send_mail(subject, message, from_email, [to_email])

def datetime_from_sqlite(inst, fieldname):
    """
    sqlite3 2.6.13 and 2.6.22 both return unicode datetimes....
        or maybe processor is storing them in unicode??
        sqlite stores them as text...django is supposed to wrap them as datetime, right?
    this method fixes this problem...
    @param inst: Django model instance
    @param fieldname: name of a DateTimeField field
    @return: field as a datetime
    """
    attr = getattr(inst, fieldname)
    
    if settings.DJANGO_SERVER and isinstance(attr, basestring):
        #print "%s :::: %s is unicode (%s %s)" % (inst,
        #                                         fieldname,
        #                                         type(attr),
        #                                         attr)
        try:
            v = datetime.datetime.strptime(attr, "%Y-%m-%d %H:%M:%S")
            #print "   no microseconds"
        except ValueError, e:
            try:
                v = datetime.datetime.strptime(attr, "%Y-%m-%d %H:%M:%S.%f")
                #print "   used \%f to get microseconds"
            except:
                if '.' in attr:
                    try:
                        v = datetime.datetime.strptime(attr[:attr.rfind('.')],
                                                       "%Y-%m-%d %H:%M:%S")
                        #print "   removed microseconds from unicode"
                    except:
                        v = datetime.datetime.now()
                        print "%s :::: %s is unicode (%s %s)" % (inst,
                                                                 fieldname,
                                                                 type(attr),
                                                                 attr)
                        print "ERROR: nothing worked...using now instead ?! %s" % v
        print "  -> converted to datetime: %s" % v
    else:
        v = attr
    
    return v
