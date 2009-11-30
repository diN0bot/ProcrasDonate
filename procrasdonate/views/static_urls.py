from django.conf.urls.defaults import *
from procrasdonate.views import static_webpages

urlpatterns = patterns('',
    url(r'^after_install/(?P<version>\d+\.\d+\.\d+)/$', static_webpages.after_install, name='after_install'),
    url(r'^after_upgrade/(?P<version>\d+\.\d+\.\d+)/$', static_webpages.after_upgrade, name='after_upgrade'),
)

urlpatterns += patterns('django.views.generic.simple',
    url(r'^about_us/$', 'direct_to_template',    {'template': 'procrasdonate/straight_pages/about_us.html'}, name='about_us'),
    url(r'^faq/$', 'direct_to_template',         {'template': 'procrasdonate/straight_pages/faq.html'}, name='faq'),
    (r'^flashvideo/$', 'direct_to_template',     {'template': 'procrasdonate/straight_pages/flashvideo.html'}),
    url(r'^privacy_guarantee/$', 'direct_to_template', {'template': 'procrasdonate/straight_pages/privacy_guarantee.html'}, name='privacy_guarantee'),
)
