from django.conf.urls.defaults import *

urlpatterns = patterns('django.views.generic.simple',
    url(r'^my_progress/$', 'direct_to_template', {'template': 'procrasdonate/extension_pages/blank.html'}, name='my_progress'),
    url(r'^my_impact/$'  , 'direct_to_template', {'template': 'procrasdonate/extension_pages/blank.html'}, name='my_impact'),
    url(r'^my_messages/$', 'direct_to_template', {'template': 'procrasdonate/extension_pages/blank.html'}, name='my_messages'),
    url(r'^my_settings/$', 'direct_to_template', {'template': 'procrasdonate/extension_pages/blank.html'}, name='my_settings'),
    url(r'^register/$'   , 'direct_to_template', {'template': 'procrasdonate/extension_pages/blank.html'}, name='register'),
    
    (r'^dev/manual_test_suite/$'   , 'direct_to_template', {'template': 'procrasdonate/extension_pages/test.html'}),
    (r'^dev/automatic_test_suite/$', 'direct_to_template', {'template': 'procrasdonate/extension_pages/test.html'}),
    (r'^dev/autotester_test_suite/$', 'direct_to_template', {'template': 'procrasdonate/extension_pages/test.html'}),
    (r'^dev/timing_test_suite/$', 'direct_to_template', {'template': 'procrasdonate/extension_pages/test.html'}),
)
