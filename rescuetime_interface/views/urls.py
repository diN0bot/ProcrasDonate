from django.conf.urls.defaults import *
from rescuetime_interface.views import main


slug_re = '[\w\d_-]+'

urlpatterns = patterns('',
    url(r'^signup/$', main.signup, name="rt_signup"),
    
    url(r'^dashboard/(?P<rescuetime_key>[\w\d_-]+)/$', main.dashboard, name="rt_dashboard"),
    url(r'^debug/(?P<rescuetime_key>[\w\d_-]+)/$', main.debug, name="rt_debug"),
    
    url(r'^authorize/(?P<rescuetime_key>[\w\d_-]+)/$',
        main.authorize, name="rt_authorize"),
    url(r'^authorize_callback/(?P<rescuetime_key>[\w\d_-]+)/(?P<caller_reference>[\w\d_-]+)/$',
        main.authorize_callback, name="rt_authorize_callback"),
        
    url(r'^edit_dollars_per_hr/(?P<rescuetime_key>[\w\d_-]+)/$',
        main.edit_dollars_per_hr, name="rt_edit_dollars_per_hr"),
    url(r'^choose_recipient/(?P<rescuetime_key>[\w\d_-]+)/(?P<recipient_slug>%s)/$' % slug_re,
        main.choose_recipient, name="rt_choose_recipient"),
)
