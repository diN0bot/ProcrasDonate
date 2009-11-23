from django.conf.urls.defaults import *
from procrasdonate.views import superuser_webpages

slug_re = '[\w\d_-]+'

urlpatterns = patterns('',
    url(r'^users/$', superuser_webpages.users, name='users'),
    url(r'^user/(?P<private_key>%s)/$' % slug_re, superuser_webpages.user, name='user'),
    # register (superuser creates User and RecipientUser, sends email to organizer)
    url(r'^recipient/register_organizer/$', superuser_webpages.register_organizer, name="register_organizer"),
    # view recipient suggestions from users
    url(r'^recipient/votes/$', superuser_webpages.recipient_votes, name="recipient_votes"),
)
