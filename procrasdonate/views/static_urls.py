from django.conf.urls.defaults import *
from procrasdonate.views import static_webpages

urlpatterns = patterns('',
    # currently redirects to learn_more
    (r'^$', static_webpages.main),
    #(r'^hello/', foo.main),

    # display visit and procras donation info
    # plugin alters page 
    url(r'^my_impact/$', static_webpages.my_impact, name='my_impact'),
    
    # displays registration track
    # plugin alters page 
    url(r'^register/$', static_webpages.register, name='register'),
    
    # displays settings pages
    # plugin alters page 
    url(r'^settings/$', static_webpages.settings, name='settings'),
    
    # clarifies what information stays safe on server, and what is divulged publicly
    url(r'^privacy_guarantee/$', static_webpages.privacy_guarantee, name='privacy_guarantee'),
        
    # intro, FAQ
    url(r'^home/$', static_webpages.home, name='home'),
    url(r'^noextn_home_noextn/$', static_webpages.home_noextn, name='home_noextn'),
    url(r'^learn_more/$', static_webpages.learn_more, name='learn_more'),
    url(r'^intro_video/$', static_webpages.learn_more, name='intro_video'),
    
    url(r'^after_install/(?P<version>\d+\.\d+\.\d+)/$', static_webpages.after_install, name='after_install'),
    url(r'^after_upgrade/(?P<version>\d+\.\d+\.\d+)/$', static_webpages.after_upgrade, name='after_upgrade'),
)

import settings
if settings.DJANGO_SERVER:
    urlpatterns += patterns('django.views.generic.simple',
        (r'^dev/manual_test_suite/$', 'direct_to_template', {'template': 'procrasdonate/dev_test.html'}),
        (r'^dev/automatic_test_suite/$', 'direct_to_template', {'template': 'procrasdonate/test_suite.html'}),
        (r'^dev/server/$', 'direct_to_template', {'template': 'procrasdonate/test_suite.html'}),
        #(r'^reset_state/$', 'direct_to_template', {'template': 'procrasdonate/dev_test.html'}),
        #(r'^on_install/$', 'direct_to_template', {'template': 'procrasdonate/dev_test.html'}),
        #(r'^add_random_visits/$', 'direct_to_template', {'template': 'procrasdonate/dev_test.html'}),
        #(r'^trigger_daily_cycle/$', 'direct_to_template', {'template': 'procrasdonate/dev_test.html'}),
        #(r'^trigger_weekly_cycle/$', 'direct_to_template', {'template': 'procrasdonate/dev_test.html'}),
        )
