from django.conf.urls.defaults import *
from procrasdonate.views import static_webpages
from procrasdonate.views import dataflow

urlpatterns = patterns('',
    url(r'^after_install/(?P<version>\d+\.\d+\.\d+)/$', static_webpages.after_install, name='after_install'),
    url(r'^after_upgrade/(?P<version>\d+\.\d+\.\d+)/$', static_webpages.after_upgrade, name='after_upgrade'),
)

urlpatterns += patterns('django.views.generic.simple',
    url(r'^about_us/$', 'direct_to_template',    {'template': 'procrasdonate/straight_pages/about_us.html'}, name='about_us'),
    url(r'^faq/$', 'direct_to_template',         {'template': 'procrasdonate/straight_pages/faq.html'}, name='faq'),
    (r'^flashvideo/$', 'direct_to_template',     {'template': 'procrasdonate/straight_pages/flashvideo.html'}),
    url(r'^privacy_guarantee/$', 'direct_to_template', {'template': 'procrasdonate/straight_pages/privacy_guarantee.html'}, name='privacy_guarantee'),
    
    url(r'^incompatible_browser/$', 'direct_to_template', {'template': 'procrasdonate/straight_pages/incompatible_browser.html'}, name='incompatible_browser'),
    
    url(r'^t/(?P<adword_page>[\/\w\d_-]+)/$', static_webpages.adword_tests, name="adword_page"),
    url(r'^adwords/download/(?P<group>[\/\w\d_-]+)/$', static_webpages.adword_download_page, name="adword_download_page"),
    url(r'^adwords/done/(?P<group>[\/\w\d_-]+)/$', static_webpages.adword_done, name="adword_done"),
    url(r'^adwords/email_form/$', dataflow.adword_email_form, name="adword_email_form"),
)
