from django.conf.urls.defaults import *
from crosstester.views import main

slug_re = '[\w\d_-]+'

urlpatterns = patterns('',
    url(r'^$', main.dashboard, name='crosstester_dashboard'),
    url(r'^report/testrun$', main.report_testrun),
)
