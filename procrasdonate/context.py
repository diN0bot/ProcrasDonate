import settings

def defaults(request):
    frame = {}
    frame.update(useful_settings())
    frame.update(selected(request))
    return frame

def useful_settings():
    return {'PDVERSION': settings.PDVERSION }

def selected(request):
    # u"/foo/" gets split into [u"", u"foo", u""]
    # '/' is appended to all URLs, regardless of what user requests
    # is this robust?! we'll see come deploy time...
    return { 'selected': request.path.split('/')[-2] }
