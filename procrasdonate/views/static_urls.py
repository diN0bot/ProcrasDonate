from django.conf.urls.defaults import *
from procrasdonate.views import main

urlpatterns = patterns('',

    # intro, FAQ
    url(r'^home/$', main.home, name='home'),
    url(r'^learn_more/$', main.learn_more, name='learn_more'),

)

import settings
if settings.DJANGO_SERVER:
    urlpatterns += patterns('',
        url(r'^rebuild_extension_templates/$', main.rebuild_extension_templates, name='rebuild_extension_templates'),
    )
    
    urlpatterns += patterns('django.views.generic.simple',
        (r'^reset_state/$', 'direct_to_template', {'template': 'procrasdonate/dev_test.html'}),
        (r'^add_random_visits/$', 'direct_to_template', {'template': 'procrasdonate/dev_test.html'}),
        (r'^trigger_daily_cycle/$', 'direct_to_template', {'template': 'procrasdonate/dev_test.html'}),
        (r'^trigger_weekly_cycle/$', 'direct_to_template', {'template': 'procrasdonate/dev_test.html'}),
    )