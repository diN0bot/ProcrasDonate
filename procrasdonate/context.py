import settings
from models import Recipient

from django.core.urlresolvers import reverse

from random import randint

def defaults(request):
    frame = {}
    frame.update(useful_settings())
    frame.update(videos())
    frame.update(selected(request))
    return frame

def useful_settings():
    return {} #'PDVERSION': settings.PDVERSION }

def videos():
    videos1 = []
    videos2 = []
    #<a href="{% url recipient video1r.slug %}">{{ video1r.name }}</a></p>
    #<p>How ProcrasDonate Works</p>
    pd = Recipient.get_or_none(slug='PD')
    if pd:
        if pd.promotional_video:
            videos2.append({'video': pd.promotional_video,
                            'caption': 'ProcrasDonate: Early Presentation'})
        videos2.append({'video': "%sswf/LaptopIntro.swf" % settings.MEDIA_URL,
                        'caption': 'ProcrasDonate Intro'})
    for ch in Recipient.objects.filter(is_visible=True, tax_exempt_status=True):
        if ch.promotional_video:
            videos1.append({'video': ch.promotional_video,
                            'caption': '<a href="%s">%s</a>' % (reverse('recipient',
                                                                        args=(ch.slug, )),
                                                                ch.name)})
        if ch.pd_experience_video:
            videos2.append({'video': ch.pd_experience_video,
                            'caption': '<a href="%s">%s\'s Experience with ProcrasDonate</a>' % (reverse('recipient',
                                                                                                             args=(ch.slug, )),
                                                                                                    ch.name)})
            
    video1 = None
    video2 = None
    if videos1:
        video1 = videos1[randint(0, len(videos1)-1)]
    if videos2:
        video2 = videos2[randint(0, len(videos2)-1)]
    
    return {'video1': video1,
            'video2': video2}

def selected(request):
    # u"/foo/" gets split into [u"", u"foo", u""]
    # '/' is appended to all URLs, regardless of what user requests
    # is this robust?! we'll see come deploy time...
    path = request.path.split('/')
    if len(path) == 2:
        selected = 'home'
    else:
        selected = path[-2]
    return { 'selected': selected }
