from django.conf.urls.defaults import *
from adwords.views import main

slug_re = '[\w\d_-]+'

urlpatterns = patterns('',
    url(r'^t/(?P<group>[\w\d_-]+)/$', main.adword_page, name="adword_page"),
    url(r'^d/(?P<page>[\w\d_-]+)/(?P<group>[\w\d_-]+)/$', main.adword_click, name="adword_click"),
    url(r'^done/(?P<page>[\w\d_-]+)/(?P<group>[\w\d_-]+)/$', main.adword_done, name="adword_done"),
    url(r'^email_form/(?P<page>[\w\d_-]+)/(?P<group>[\w\d_-]+)/$', main.adword_email_form, name="adword_email_form"),
    
    url(r'^dashboard/$', main.dashboard, name="adword_dashboard"),
)
