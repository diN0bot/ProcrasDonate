from django.conf.urls.defaults import *
from weddings.views import main

slug_re = '[\w\d_-]+'
code_re = '[\w\d]+'

urlpatterns = patterns('',
    url(r'^donations/(?P<slug>%s)/(?P<donation_type>%s)/$' % (slug_re, slug_re),
        main.do_donation,
        name="weddings_do_donation"),
    
    url(r'^thankyou/(?P<slug>%s)/(?P<donation_type>%s)/$' % (slug_re, slug_re),
        main.thankyou,
        name="weddings_thankyou"),
    
    url(r'^(?P<slug>%s)/$' % slug_re,
        main.main,
        name="weddings_main"),
    
    #### WEDDING COUPLE
    url(r'^settings/(?P<code>%s)/$' % code_re, main.settings, name='weddings_settings'),

    #### ADMIN
    url(r'^dashboard/$', main.dashboard, name="weddings_dashboard"),
)
