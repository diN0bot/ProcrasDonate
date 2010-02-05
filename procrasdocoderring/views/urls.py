from django.conf.urls.defaults import *
from adwords.views import main

slug_re = '[\w\d_-]+'

urlpatterns = patterns('',
    (r'^set/ring_ip/(?P<ip>[\d\.]+)/$', main.set_ring_ip),

)
