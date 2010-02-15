from django.conf.urls.defaults import *
from procrasdocoder.views import main

urlpatterns = patterns('',
    (r'^$', main.info),

)
