from django.conf.urls.defaults import *
from procrasdonate.views import dynamic_webpages, dataflow, fps

slug_re = '[\w\d_-]+'
type_re = '[\w\d_-]+'
code_re = '[\w\d]+'

urlpatterns = patterns('',
    # home page
    url(r'^$', dynamic_webpages.home, name='home'),
    # same as home
    url(r'^intro_video/$', dynamic_webpages.home, name='intro_video'),
    # same as home. extension automatically forwards "/" to "/my_progress/"
    # 'home page actually refers to splash for now.
    url(r'^splash/$', dynamic_webpages.home, name='splash'),
    url(r'^home/$', dynamic_webpages.home, name='home'),

    # overall portal
    url(r'^community/$', dynamic_webpages.community, name='community'),
    # sub type (category or tag) rankings
    url(r'^community/(?P<type>%s)/$' % type_re, dynamic_webpages.community_type, name='community_type'),
    
    # public recipient information and stats
    url(r'^r/(?P<slug>%s)/$' % slug_re, dynamic_webpages.recipient, name='recipient'),
    
    # requires login
    url(r'^recipient/dashboard/$', dynamic_webpages.recipient_organizer_dashboard, name='recipient_organizer_dashboard'),
    url(r'^recipient/edit/public_information/$', dynamic_webpages.edit_public_information, name='edit_public_information'),
    url(r'^recipient/edit/private_information/$', dynamic_webpages.edit_private_information, name='edit_private_information'),
    url(r'^recipient/edit/media/$', dynamic_webpages.edit_media, name='edit_media'),
    url(r'^recipient/edit/promo_cards/$', dynamic_webpages.edit_promo_cards, name='edit_promo_cards'),
    url(r'^recipient/edit/thank_yous/$', dynamic_webpages.edit_thank_yous, name='edit_thank_yous'),
    url(r'^recipient/analytics/$', dynamic_webpages.analytics, name='recipient_analytics'),
    # Recipient registration page, initiates Amazon Co-Branded UI
    url(r'^recipient/payment_registration/$', fps.payment_registration, name='payment_registration'),
    url(r'^recipient/edit/weekly_blurbs/$', dynamic_webpages.edit_weekly_blurbs, name='edit_weekly_blurbs'),
    url(r'^recipient/edit/thank_yous/$', dynamic_webpages.edit_thank_yous, name='edit_thank_yous'),
    url(r'^recipient/edit/yearly_newsletter/$', dynamic_webpages.edit_yearly_newsletter, name='edit_yearly_newsletter'),
    
    # recipient users login and logout
    url(r'^recipient/login/$', dynamic_webpages.login_view, name='login'),
    # redirects somewhere
    url(r'^recipient/logout/$', dynamic_webpages.logout_view, name='logout'),
    
    # link for organizer to set password
    url(r'^recipient/confirm/(?P<username>%s)/(?P<confirmation_code>%s)/$' % (slug_re, code_re), dynamic_webpages.confirm, name="confirm"),
    
    # organizer forgot password. enter username or email, send email to organizer (doesn't have to be confirmed ?)
    url(r'^recipient/reset_password/$', dynamic_webpages.reset_password, name="reset_password"),
    # link for organizer to set password
    url(r'^recipient/confirm_reset_password/(?P<username>%s)/(?P<confirmation_code>%s)/$' % (slug_re, code_re), dynamic_webpages.confirm_reset_password, name="confirm_reset_password"),
    
    
    # automatically starts downloading xpi
    #url(r'^download_update/(?P<type>%s)/(?P<version>\d\.\d\.\d)/$' % (slug_re), dynamic_webpages.download_extn, name="download_extn"),
    url(r'^download_update/$', dynamic_webpages.download_update, name="download_update"),
)
"""
    
    
    # RecipientUser forgets password or username
    url(r'^recipient/password_reset/$', account.password_reset, name="password_reset"),
    url(r'^recipient/password_reset_sent/$', account.password_reset_sent, name="password_reset_sent"),
    url(r'^recipient/password_reset_confirm/(?P<user_id_b36>[\w\d]+)/(?P<token>[-\w\d]+)/$', account.password_reset_confirm, name="password_reset_confirm"),
    url(r'^recipient/password_reset_complete/$', account.password_reset_complete, name="password_reset_complete"),
    
    # logged in user changes password
    url(r'^recipient/change_password/(?P<user_id>\d+)/$', account.change_password, name="change_password"),
    url(r'^recipient/change_password_done/(?P<user_id>\d+)/$', account.change_password_done, name="change_password_done"),
   """

urlpatterns += patterns('',
    # handle data posted to server
    (r'^send_email/(?P<type>[\w_]+)/$', dataflow.send_email),
    
    (r'^post/email/$', dataflow.send_email),
    (r'^post/data/$', dataflow.receive_data),
    
    # send recipeints and multi auths to clients
    (r'^get/data/$', dataflow.return_data),
    
    # generate xpi
    url(r'^generate_xpi/(?P<slug>%s)/$' % slug_re, dataflow.generate_xpi, name='generate_xpi'), 
    url(r'^add_to_waitlist/(?P<group>[\/\w\d_-]+)/$', dataflow.add_to_waitlist, name='add_to_waitlist'), 
    url(r'^remove_from_waitlist/(?P<remove_key>%s)/$' % slug_re, dataflow.remove_from_waitlist, name='remove_from_waitlist'),
    url(r'^remove_from_waitlist/$', dataflow.remove_from_waitlist_form, name='remove_from_waitlist_form'),
    url(r'^waitlist/$', dataflow.waitlist, name='waitlist'), 
)

urlpatterns += patterns('',
    # recipient-orientated splash page
    url(r'^(?P<slug>%s)/$' % slug_re, dynamic_webpages.recipient_splash, name='recipient_splash'),
)
