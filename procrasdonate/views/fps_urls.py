from django.conf.urls.defaults import *
from procrasdonate.views import fps

urlpatterns = patterns('',
    ### RECIPIENT PAGES ###
    
    # Recipient registration page, initiates Amazon Co-Branded UI
    url(r'^fps/recipient/register/$', fps.recipient_registration, name='recipient_register'),
    # Callback from Co-Branded UI registration page
    url(r'^fps/recipient/register/callback/$', fps.recipient_register_callback, name='recipient_register_callback'),
    
    # Recipient homepage, info, causes
    #url(r'^fps/recipient/(?P<recipient_slug>[\w\d_-]+)/$', fps.recipient_homepage, name='recipient_homepage'),
    # Recipient edit page. Requires login.
    #url(r'^fps/recipient/(?P<recipient_slug>[\w\d_-]+)/edit/$', fps.recipient_homepage_edit, name='recipient_homepage_edit'),
    
    # (returns JSON) User authorizes Postpaid token
    url(r'^fps/user/payment/authorize/$', fps.user_authorize_payment, name='user_authorize_payment'),
    # (returns HTML) User authorizes Postpaid token
    url(r'^fps/user/payment/authorize_callback/$', fps.user_authorize_payment_callback, name='user_authorize_payment_callback'),
    # (returns JSON) User authorizes Postpaid token
    url(r'^fps/user/payment/pay/$', fps.user_pay, name='user_pay'),
    # (returns JSON) User authorizes Postpaid token
    url(r'^fps/user/payment/settle_debt/$', fps.user_settle_debt, name='user_settle_debt'),
)
