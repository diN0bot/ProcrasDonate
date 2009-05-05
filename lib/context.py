import settings

def defaults(request):
    frame = {}
    frame.update(literals())
    frame.update(django_server())
    frame.update(selected(request))
    return frame

def literals():
    return { 'True':  True,
             'False': False,
             'None':  None  }

def django_server():
    return { 'DJANGO_SERVER': settings.DJANGO_SERVER }

def selected(request):
    # u"/foo/" gets split into [u"", u"foo", u""]
    # '/' is appended to all URLs, regardless of what user requests
    # is this robust?! we'll see come deploy time...
    return { 'selected': request.path.split('/')[-2] }
