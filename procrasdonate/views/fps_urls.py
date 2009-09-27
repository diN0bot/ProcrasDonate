from django.conf.urls.defaults import *
from procrasdonate.views import fps

slug_re = '[\w\d_-]+'
caller_reference_re = '[\w\d]+'

urlpatterns = patterns('',
    ### RECIPIENT PAGES ###
    # Recipient registration page, initiates Amazon Co-Branded UI
    url(r'^recipient/register/(?P<slug>%s)/$' % slug_re, fps.recipient_register, name='recipient_register'),
    # Callback from Co-Branded UI registration page
    url(r'^recipient/register_callback/(?P<slug>%s)/$' % slug_re, fps.recipient_register_callback, name='recipient_register_callback'),

    # Recipient homepage, info, causes
    #url(r'^recipient/(?P<recipient_slug>[\w\d_-]+)/$', fps.recipient_homepage, name='recipient_homepage'),
    # Recipient edit page. Requires login.
    #url(r'^recipient/(?P<recipient_slug>[\w\d_-]+)/edit/$', fps.recipient_homepage_edit, name='recipient_homepage_edit'),
    
    # (returns JSON) User authorizes MultiUse token
    url(r'^user/multiuse/authorize/$', fps.authorize_multiuse, name='multiuse_authorize'),
    # (returns HTML (redirect)) MultiUse Auth callback
    url(r'^user/multiuse/authorize_callback/(?P<caller_reference>%s)/$' % caller_reference_re, fps.authorize_multiuse_callback, name='multiuse_authorize_callback'),
    # (returns JSON) User authorizes Postpaid token
    url(r'^user/multiuse/pay/$', fps.multiuse_pay, name='multiuse_pay'),
    
    # (returns JSON) Cancels successful multiuse token
    url(r'^user/multiuse/cancel_token/$', fps.cancel_multiuse, name='cancel_multiuse'),
    # (returns JSON) Cancels successful multiuse token
    #url(r'^user/multiuse/cancel_multiuse/$', fps.cancel_multiuse, name='cancel_multiuse'),
    # (returns JSON) Cancels successful multiuse token
    #url(r'^user/multiuse/cancel_multiuse/$', fps.cancel_multiuse, name='cancel_multiuse'),

    # (returns JSON) User authorizes Postpaid token
    url(r'^IPN/$', fps.ipn, name='ipn'),
    
)

"""
# (returns JSON) User authorizes Postpaid token
url(r'^user/payment/authorize/$', fps.user_authorize_payment, name='user_authorize_payment'),
# (returns HTML) User authorizes Postpaid token
url(r'^user/payment/authorize_callback/$', fps.user_authorize_payment_callback, name='user_authorize_payment_callback'),
# (returns JSON) User authorizes Postpaid token
url(r'^user/payment/pay/$', fps.user_pay, name='user_pay'),
# (returns JSON) User authorizes Postpaid token
url(r'^user/payment/settle_debt/$', fps.user_settle_debt, name='user_settle_debt'),

# get debt balance (not viewable on payments.amazon.com !)
# (returns JSON)
#url(r'^user/get/debt/$', fps.user_settle_debt, name='user_settle_debt'),
# Cancel PostPaid instrument
#url(r'^user/cancel/authorization/$', fps.user_settle_debt, name='user_settle_debt'),
"""