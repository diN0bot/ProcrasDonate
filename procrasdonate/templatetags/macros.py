
from django import template
from django.template.loader import get_template, render_to_string
from django.template.loader_tags import BlockNode, ExtendsNode
from django.template import TemplateDoesNotExist, defaulttags
from django.template.context import Context
from django.template.defaultfilters import stringfilter

from django.template import Variable

from django.db.models import fields
from django.db.models.fields import AutoField

from django.core.urlresolvers import reverse

import datetime, re, os
from django.conf import settings

from django.utils.html import conditional_escape
from django.utils.safestring import mark_safe
register = template.Library()


def do_render_responses(parser, token):
    """
    Splits the arguments to the render_responses tag and formats them correctly.
    """
    split = token.split_contents()
    template = None
    if len(split) > 2:
        template = split[2]
    if len(split) < 2 or len(split) > 3:
        raise template.TemplateSyntaxError('%r tag takes one required argument and two optional arguments' % split)
    return RenderResponses(split[1], template=template)

class RenderResponses(template.Node):
    """
    render_responses takes one required parameter, a Response object, and one 
    optional parameter, a template. 
    @TODO giving a template via parameter seems to fail!! TemplateDoesNotExist. don't know why.
    """
    def __init__(self, response_var, template=None):
        self.response = Variable(response_var)
        self.template = template
    
    def render(self, context):
        key = self.response.var
        value = self.response.resolve(context)
        template = self.template

        if not template:
            template = 'twitter/snippets/comment.html'
        try:
            get_template(template)
        except TemplateDoesNotExist:
            return "ERROR in templatetag render_response: could not render template %s" % template

        return self._recurse_on(value, template, context, 0)
    
    def _recurse_on(self, obj, template, context, indent):
        if indent < 10:
            indent += 1
        context['comment'] = obj
        ret = "<div class='comment indent" + str(indent) + "' id='comment_" + str(obj.id) + "'>\n"
        ret += render_to_string(template, context_instance=context)
        for child in obj.responses:
            ret += self._recurse_on(child, template, context, indent)
        ret += "</div>"
        return ret

register.tag('render_responses', do_render_responses)



"""
#links = re.compile('(https?://\S*)') # \S matches any non-whitespace character; this is equivalent to the class [^ \t\n\r\f\v].
#twitternames = re.compile('@([\w\d]+)')
@register.filter
@stringfilter
def markup(text, args=None, autoescape=None):
    if autoescape:
        esc = conditional_escape
    else:
        esc = lambda x: x

    # 1. turn links into clickables    
    #result = links.sub(r'<a href="\1">\1</a>', text).strip()
    result = text.strip()
    
    # 2.. turn @twittername to links
    #result = twitternames.sub(r'<a href="http://twitter.com/\1">\1</a>', result).strip()
     
    # 4. turn bullet or number lists into ul or ol
    # wrap all lines that begin with * or \d\. with <*l><li>...</li></*l>
    # then remove adjacent </*l><*l>
    lines = result.split("\n")
    newresult = []
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
    # 3. turn double enter in breaks
    #linebreak_re = re.compile('(%s%s+)' % (os.linesep, os.linesep))
    #result = linebreak_re.sub('</p>%s<p>' % os.linesep, result)
    linebreak_re = re.compile('(\n\s+)')
    result = linebreak_re.sub('\n', result)
    result = result.replace('\n', '</p><p>')
    if 'dont_close_last_p' == args:
        result = '<p>%s' % result
    else:
        result = '<p>%s</p>' % result
    
    return mark_safe(result)
markup.needs_autoescape = True
"""


def do_time_ago(parser, token):
    """
    Splits the arguments to the time_ago tag and formats them correctly.
    """
    split = token.split_contents()
    if len(split) < 2 or len(split) > 2:
        raise template.TemplateSyntaxError('%s tag takes one required argument, the datetime' % split)
    return TimeAgo(split[1])

class TimeAgo(template.Node):
    """
    TimeAgo takes one required parameter, a datetime object.
    """
    def __init__(self, datetime_var):
        self.time = Variable(datetime_var)
    
    def render(self, context):
        key = self.time.var
        value = self.time.resolve(context)

        return self._get_time_ago(value)
    
    def _get_time_ago(self, dt):
        if not dt:
            return ''

        delta  = datetime.datetime.now() - dt
        if delta.days:
            if delta.days > 364:
                if int(delta.days / 365) > 1: return '%s years ago' % int(delta.days / 365)
                else:                         return '1 year ago'
            elif delta.days > 29:
                if int(delta.days / 30) > 1:  return '%s months ago' % int(delta.days / 30)
                else:                         return '1 month ago'
            elif delta.days > 6:
                if int(delta.days / 7) > 1:   return '%s weeks ago' % int(delta.days / 7)
                else:                         return '1 week ago'
            else:
                if delta.days > 1:            return '%s days ago' % delta.days
                else:                         return '1 day ago'
        elif delta.seconds:
            if delta.seconds > 3599:
                if int(delta.seconds / 3600) > 1: return '%s hours ago' % int(delta.seconds / 3600)
                else:                             return '1 hour ago'
            elif delta.seconds > 59:
                if int(delta.seconds / 60) > 1: return '%s minutes ago' % int(delta.seconds / 60)
                else:                           return '1 minute ago'
            elif delta.seconds > 1:             return '%s seconds ago' % delta.seconds
            else:                             return '1 second ago'
        else:
            return 'now'
register.tag('time_ago2', do_time_ago)





def do_thumbnail(parser, token):
    split = token.split_contents()
    if len(split) < 3 or len(split) > 4:
        raise template.TemplateSyntaxError("%r tag takes two required arguments, the image's current width and height, and one optional argument, whether to permit uber wide images" % split)
    if len(split) == 4:
        uber_wide = True
    else:
        uber_wide = False
    return Thumbnail(split[1], split[2], uber_wide)

class Thumbnail(template.Node):
    """
    """
    def __init__(self, width, height, uber_wide):
        self.width = Variable(width)
        self.height = Variable(height)
        self.uber_wide = uber_wide
    
    def render(self, context):
        w = self.width.resolve(context)
        h = self.height.resolve(context)
        dw = w
        dh = h

        context['a'] = [w, h]
        max_h = 200.0
        max_w = 50.0
        if h > max_h:
            w = int((max_h/h) * w)
            h = int(max_h)
        if w > max_w:# and not self.uber_wide:
            dh = int((max_w/w) * h)
            dw = int(max_w)
            
        context['thumbnail_desired_width'] = dw
        context['thumbnail_desired_height'] = dh
        context['thumbnail_width'] = w
        context['thumbnail_height'] = h
        return ""
register.tag('thumbnail', do_thumbnail)
