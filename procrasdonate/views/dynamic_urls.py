from django.conf.urls.defaults import *
from procrasdonate.views import main

urlpatterns = patterns('',
    # currently redirects to learn_more
    url(r'^$', main.main, name='procrasdonate'),
    
    # display visit and procras donation info
    # plugin alters page 
    url(r'^my_impact/$', main.my_impact, name='my_impact'),
    
    # displays registration track
    # plugin alters page 
    url(r'^register/$', main.register, name='register'),
    # displays settings pages
    # plugin alters page 
    url(r'^settings/$', main.settings, name='settings'),
    # lists all recipients. selecting a recipient will fill info into settings account page
    url(r'^recipients', main.recipients, name='recipients'),
    # clarifies what information stays safe on server, and what is divulged publicly
    url(r'^privacy_guarantee/$', main.privacy_guarantee, name='privacy_guarantee'),
        
    
    # displays total site and recipient ranks
    url(r'^community/$', main.community, name='community'),
    url(r'^community/recipients', main.community_recipients, name='community_recipients'),
    url(r'^community/sites', main.community_sites, name='community_sites'),

    # post handler from extension
    url(r'^data/$', main.data, name='data'),
    
)

