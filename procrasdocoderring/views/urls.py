from django.conf.urls.defaults import *
from procrasdocoderring.views import main

urlpatterns = patterns('',
    (r'^$', main.info),

)
