from django.conf.urls.defaults import *
from procrasdonate.views import superuser_webpages

slug_re = '[\w\d_-]+'

urlpatterns = patterns('',
    url(r'^dashboard/$', superuser_webpages.dashboard, name='superuser_dashboard'),
    url(r'^users/$', superuser_webpages.users, name='users'),
    url(r'^user/(?P<private_key>%s)/$' % slug_re, superuser_webpages.user, name='user'),
    # register (superuser creates User and RecipientUser, sends email to organizer)
    url(r'^recipient/register_organizer/$', superuser_webpages.register_organizer, name="register_organizer"),
    # view recipient suggestions from users
    url(r'^recipient/votes/$', superuser_webpages.recipient_votes, name="recipient_votes"),
    # link recipient to vote
    url(r'^recipient/link_vote/(?P<vote_id>\d+)/(?P<recipient_slug>%s)/$' % slug_re, superuser_webpages.link_vote, name="link_vote"),
)
