from django.conf import settings
from settings import pathify
from django.conf.urls.defaults import *

from django.contrib import admin
admin.autodiscover()

import os
#import foo
#import foo_urls

urlpatterns = patterns('',)

urlpatterns += patterns('',
    (r'^admin/doc/', include('django.contrib.admindocs.urls')),
    (r'^admin/(.*)', admin.site.root),
    (r'', include('procrasdonate.views.static_urls')),
    (r'', include('procrasdonate.views.dynamic_urls')),
    (r'^fps/', include('procrasdonate.views.fps_urls')),
    #(r'^tst/', foo.main),
    #(r'^tst/', include('foo_urls')),
)

if settings.DJANGO_SERVER:
    urlpatterns += patterns('',
        (r'^%s(?P<path>.*)$' % settings.MEDIA_URL[1:], 'django.views.static.serve',
            {'document_root': settings.MEDIA_ROOT, 'show_indexes':True}),
    )
"""
urlpatterns += patterns('',
    # static pages that still work when database is offline
    (r'^', include('procrasdonate.views.static_urls')),
)

if settings.DOWN_FOR_MAINTENANCE:
    urlpatterns += patterns('',
        (r'^.*', 'django.views.generic.simple.direct_to_template', { 'template': 'procrasdonate/down_for_maintenance.html' }),
    )

urlpatterns += patterns('',
    (r'^', include('procrasdonate.views.dynamic_urls')),
    (r'^fps/', include('procrasdonate.views.fps_urls')),
)

"""