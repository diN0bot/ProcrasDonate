from django.conf.urls.defaults import *
from procrasdonate.views import webpages, dataflow

urlpatterns = patterns('',

    # intro, FAQ
    url(r'^home/$', webpages.home, name='home'),
    url(r'^noextn_home_noextn/$', webpages.home_noextn, name='home_noextn'),
    url(r'^learn_more/$', webpages.learn_more, name='learn_more'),
    
    url(r'^after_install/(?P<version>\d+\.\d+\.\d+)/$', webpages.after_install, name='after_install'),
    url(r'^after_upgrade/(?P<version>\d+\.\d+\.\d+)/$', webpages.after_upgrade, name='after_upgrade'),
)

import settings
if settings.DJANGO_SERVER:
    urlpatterns += patterns('',
        url(r'^rebuild_extension_templates/$', dataflow.rebuild_extension_templates, name='rebuild_extension_templates'),
    )
    
    urlpatterns += patterns('django.views.generic.simple',
        (r'^dev/manual_test_suite/$', 'direct_to_template', {'template': 'procrasdonate/dev_test.html'}),
        (r'^dev/automatic_test_suite/$', 'direct_to_template', {'template': 'procrasdonate/test_suite.html'}),
        #(r'^reset_state/$', 'direct_to_template', {'template': 'procrasdonate/dev_test.html'}),
        #(r'^on_install/$', 'direct_to_template', {'template': 'procrasdonate/dev_test.html'}),
        #(r'^add_random_visits/$', 'direct_to_template', {'template': 'procrasdonate/dev_test.html'}),
        #(r'^trigger_daily_cycle/$', 'direct_to_template', {'template': 'procrasdonate/dev_test.html'}),
        #(r'^trigger_weekly_cycle/$', 'direct_to_template', {'template': 'procrasdonate/dev_test.html'}),
        )
    
    urlpatterns += patterns('',
        # handle data posted to server
        (r'^post/welcome_email/$', dataflow.send_welcome_email),
        (r'^post/regular_email/$', dataflow.send_regular_email),
        (r'^post/data/$', dataflow.receive_data),
    )