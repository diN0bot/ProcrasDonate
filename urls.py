from django.conf import settings
from settings import pathify
from django.conf.urls.defaults import *

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',)

urlpatterns += patterns('',
    (r'^admin/doc/', include('django.contrib.admindocs.urls')),
    url(r'^admin/(.*)', admin.site.root, name="admin"),
    (r'^fps/', include('procrasdonate.views.fps_urls')),
    (r'^crosstester/', include('crosstester.views.urls')),
    #(r'^weddings/', include('weddings.views.urls')),
    (r'^a/', include('adwords.views.urls')),
    (r'^rt/', include('rescuetime_interface.views.urls')),
    (r'^procrasdocoder/', include('procrasdocoder.views.urls')),
    (r'', include('procrasdonate.views.static_urls')),
    (r'', include('procrasdonate.views.extension_urls')),
    (r'', include('procrasdonate.views.superuser_urls')),
    # dynamic_urls have to be last because of recipients
    (r'', include('procrasdonate.views.dynamic_urls')),
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
