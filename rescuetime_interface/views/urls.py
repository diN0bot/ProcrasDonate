from django.conf.urls.defaults import *
from rescuetime_interface.views import main

urlpatterns = patterns('',
    url(r'^signup/$', main.signup, name="rt_signup"),
    url(r'^dashboard/(?P<rescuetime_key>[\w\d_-]+)/$', main.dashboard, name="rt_dashboard"),
    url(r'^debug/(?P<rescuetime_key>[\w\d_-]+)/$', main.debug, name="rt_debug"),
)
