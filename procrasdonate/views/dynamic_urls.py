from django.conf.urls.defaults import *
from procrasdonate.views import dynamic_webpages, dataflow

urlpatterns = patterns('',
    # displays total site and recipient ranks
    url(r'^community/$', dynamic_webpages.community, name='community'),
    url(r'^community/recipients', dynamic_webpages.community_recipients, name='community_recipients'),
    url(r'^community/sites', dynamic_webpages.community_sites, name='community_sites'),
)

urlpatterns += patterns('',
    # handle data posted to server
    (r'^post/welcome_email/$', dataflow.send_welcome_email),
    (r'^post/regular_email/$', dataflow.send_regular_email),
    (r'^post/data/$', dataflow.receive_data),
    
    # send recipeints and multi auths to clients
    (r'^get/data/$', dataflow.return_data),
)


