from django.conf.urls.defaults import *
from procrasdonate.views import main

urlpatterns = patterns('',

    # intro, FAQ
    url(r'^home/$', main.home, name='home'),

)
