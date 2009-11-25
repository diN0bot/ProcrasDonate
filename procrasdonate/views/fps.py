from django.core.urlresolvers import reverse
from django.utils import simplejson as json

from lib.view_utils import render_string, render_response, HttpResponseRedirect, extract_parameters
from lib.json_utils import json_success, json_failure

from django.contrib.auth.decorators import login_required

from procrasdonate.models import *
from procrasdonate.processors import *

from procrasdonate.applib.fps import *
from lib.xml_utils import ConvertXmlToDict

from procrasdonate.views.dynamic_webpages import _organizer_submenu

import settings
import datetime, time
import urllib, urllib2
import re

SANDBOX_AMAZON_CBUI_URL = "https://authorize.payments-sandbox.amazon.com/cobranded-ui/actions/start"
SANDBOX_AMAZON_FPS_API_URL = "https://fps.sandbox.amazonaws.com"
REAL_AMAZON_CBUI_URL = "https://authorize.payments.amazon.com/cobranded-ui/actions/start"
REAL_AMAZON_FPS_API_URL = "https://fps.amazonaws.com"

if settings.SANDBOX_PAYMENTS:
    AMAZON_CBUI_URL = SANDBOX_AMAZON_CBUI_URL
    AMAZON_FPS_API_URL = SANDBOX_AMAZON_FPS_API_URL
else:
    AMAZON_CBUI_URL = REAL_AMAZON_CBUI_URL
    AMAZON_FPS_API_URL = REAL_AMAZON_FPS_API_URL

REST_amazon_to_internal = {'CallerReference'       : 'caller_reference',
                           'paymentMethod'         : 'payment_method',
                           'paymentReason'         : 'payment_reason',
                           'ReasonText'            : 'reason_text',          
                           'TokenId'               : 'token_id',
                           'Version'               : 'version',
                           'Timestamp'             : 'timestamp',
                           'RecipientTokenId'      : 'recipient_token_id',
                           'RefundTokenId'         : 'refund_token_id',
                           'SenderTokenId'         : 'sender_token_id',
                           'MarketplaceFixedFee'   : 'marketplace_fixed_fee',
                           'MarketplaceVariableFee' : 'marketplace_variable_fee',
                           'TransactionAmount'     : 'transaction_amount',
                           
                           'RequestId'             : 'request_id',
                           'TransactionId'         : 'transaction_id',
                           'TransactionStatus'     : 'transaction_status'}

CBUI_amazon_to_internal = {'callerReference'       : 'caller_reference',
                           'globalAmountLimit'     : 'global_amount_limit',
                           'paymentMethod'         : 'payment_method',
                           'paymentReason'         : 'payment_reason',
                           'ReasonText'            : 'reason_text',          
                           'recipient_slug_list'   : 'recipient_slug_list',
                           'recipientTokenList'    : 'recipient_token_list',
                           'isRecipientCobranding' : 'is_recipient_cobranding',
                           'tokenId'               : 'token_id',
                           'version'               : 'version',
                           'Timestamp'             : 'timestamp'}

REST_internal_to_amazon = {}
CBUI_internal_to_amazon = {}

for k in REST_amazon_to_internal:
    REST_internal_to_amazon[REST_amazon_to_internal[k]] = k
    
for k in CBUI_amazon_to_internal:
    CBUI_internal_to_amazon[CBUI_amazon_to_internal[k]] = k

def _switch_cases(parameters, to_lower=True, cbui=True):
    internal_to_amazon = cbui and CBUI_internal_to_amazon or REST_internal_to_amazon
    amazon_to_internal = cbui and CBUI_amazon_to_internal or REST_amazon_to_internal
    map = to_lower and amazon_to_internal or internal_to_amazon
    ret = {}
    
    for p in parameters:
        if p in map:
            ret[map[p]] = parameters[p]
        else:
            ret[p] = parameters[p]
    return ret

def _get(url):
    """
    @returns: response, content
    """
    """response, content = http.request(
        url,
        method="GET")
    return content
    """
    data = None
    try:
        response = urllib2.urlopen(url)
        data = response.read()
        response.close()
    except urllib2.HTTPError, httperror:
        data = httperror.read()
        httperror.close()
    return data

################################################################################

@login_required
def payment_registration(request):
    recipient = request.user.get_profile().recipient
    substate_menu_items = _organizer_submenu(request, "receive_donations", recipient)

    errors = []
    template = 'procrasdonate/recipient_organizer_pages/payment_registration.html'

    r = FPSRecipient.get_or_none(recipient=recipient)
    if not r:
        r = FPSRecipient.add(recipient=recipient)
    
    if r.good_to_go():
        return render_response(request, template, locals())   
    
    action_url = AMAZON_CBUI_URL
    parameters = {'callerKey'         : settings.FPS['callerKey'],
                  'callerReference'   : r.caller_reference,
                  'cobrandingUrl'     : settings.FPS['cobrandingUrl'],
                  'websiteDescription': settings.FPS['websiteDescription'],
                  'pipelineName'      : "Recipient",
                  'recipientPaysFee'  : "True",
                  #'maxFixedFee'       : settings.FPS['maxFixedFee'],
                  'maxVariableFee'    : settings.FPS['maxVariableFee'],
                  'returnUrl': "%s%s" % (settings.DOMAIN,
                                         reverse('payment_registration_callback')),
                  'version': settings.FPS['version']
                  }
    # add timestampe and signature
    finalize_parameters(parameters, type=CBUI_TYPE)
    
    return render_response(request, template, locals())    
    
@login_required
def payment_registration_callback(request):
    """
    inserts callback response parameters into HTML for procrasdonate extension to handle
    
    GET parameters:
    signature: DrYecY%2B1zu3pQlCfRJMeBBuilH8%3D
    refundTokenID: 26TKG9N9N13K6CPD4SAP57BQ8ZXFUFULH8INJMJS42T9R1BPVD7Z7Q6N9XYKYHRU
    tokenID      : 25TKV9S9NP3C6CKDLSA257BQIZNFUDUHH8JN3MJU4FT961GPVB727QQNXXYJYVR6
    status: SR
    callerReference: 
    
    
    signature=HC6EetKji26dd8qpBTtSTQVeEPs%3D
    refundTokenID=R7VX84PBU5N341F2VVP92NVLCTICNLH1BPRB2GKVZN84FH3FR6JP6C1JEEU7E1WS
    tokenID=R4VXE4LBUTNL41U2PVPA21VLXT7CN3HMBP3BSGKDZH845H1FR1JR6CQJSEULE6WU
    status=SR
    callerReference=h2Yij4nUqPzL
    """
    if not settings.DJANGO_SERVER and not request.is_secure():
        message = "must secure data via HTTPS: request=%s" % request
        Log.Error(message, "request_error")
        return json_failure(message)
    
    recipient = request.user.get_profile().recipient
    errors = []
    
    fpsr = recipient.fps_data
    
    print "RECIP CALLBACK GET: ", request.GET
    expected_parameters = ["signature",
                           "status"]
    optional_parameters = ["refundTokenID",
                           "tokenID",
                           "callerReference",
                           "errormessage"]

    response = extract_parameters(request, "GET", expected_parameters, optional_parameters)
    if not response['success']:
        Log.Error("payment_registration_callback::Something went wrong extracting parameters from Amazon's request: %s for %s. Full request: %s" % (response['reason'],
                                                                                                                                                    recipient.slug,
                                                                                                                                                    request.GET))
        return HttpResponseRedirect(reverse('payment_registration'))
    
    parameters = response['parameters']
    
    corrupted = is_corrupted(parameters, CBUI_CALLBACK_TYPE)
    if corrupted:
        Log.Error("payment_registration_callback::Signature did not check out from Amazon's request: %s. Full request: %s" % (recipient.slug,
                                                                                                                              request.GET))
        #return HttpResponseRedirect(reverse('payment_registration'))
    
    fpsr.refund_token_id = parameters['refundTokenID']
    fpsr.token_id = parameters['tokenID']
    fpsr.status = parameters['status']
    fpsr.save()
    
    if fpsr.status != FPSRecipient.STATUSES['SUCCESS']:
        Log.Error("payment_registration_callback::Payment registration failed: %s for %s. Full request: %s" % (recipient.slug,
                                                                                                               request.GET))
    return HttpResponseRedirect(reverse('payment_registration'))

################################################################################

def authorize_multiuse(request):
    """
    expect parameters
        timestamp
        callerReference - use this so can resubmit pay requests, etc.
        globalAmountLimit - total $$ ever that can flow across token during token's lifetime
        paymentMethod - "ABT,ACH,CC"
        paymentReason - html
        recipient_slug_list - 'sluga,slugb,slugc' or 'all'
        version - one of ["2009-01-09"]
    
    returns
        parameters
        
    """
    if not settings.DJANGO_SERVER and not request.is_secure():
        message = "must secure data via HTTPS: request=%s" % request
        Log.Error(message, "request_error")
        return json_failure(message)
    
    errors = []
    expected_parameters = ["caller_reference",
                           "payment_reason",
                           "payment_method",
                           "global_amount_limit",
                           "recipient_slug_list",
                           "version",
                           #"timestamp",
                           "private_key"]

    response = extract_parameters(request, "POST", expected_parameters)
    if not response['success']:
        return json_failure("Something went wrong extracting parameters: %s" % response['reason'])
    
    # params to send back to client and use locally (database worthy)
    lower_parameters = response['parameters']
    private_key = lower_parameters['private_key']
    del lower_parameters['private_key']
    
    # params for FPS REST request
    camel_parameters = _switch_cases(response['parameters'], to_lower=False)
    
    recipients = []
    if camel_parameters['recipient_slug_list'] == "all":
        allr = Recipient.objects.filter(fpsrecipient__status=FPSRecipient.STATUSES['SUCCESS'])
    else:
        allr = Recipient.objects.filter(fpsrecipient__status=FPSRecipient.STATUSES['SUCCESS'])
        allr = allr.filter(slug__in=camel_parameters['recipient_slug_list'].split(','))
    
    for recipient in allr:
        recipients.append(recipient)

    recipient_token_list = ",".join( [recipient.fps_data.token_id for recipient in recipients] )
    del camel_parameters['recipient_slug_list']
    camel_parameters['recipientTokenList'] = recipient_token_list
    
    camel_parameters.update({#'RecipientCobranding': "true",
                           #'paymentMethod': 'CC,ACH,ABT',
                           # common CBUI parameters
                           'cobrandingUrl': settings.FPS['cobrandingUrl'],
                           'websiteDescription': settings.FPS['websiteDescription'],
                           'pipelineName': "MultiUse",
                           'returnURL': "%s%s" % (settings.DOMAIN,
                                                  reverse('multiuse_authorize_callback',
                                                          args=(camel_parameters['callerReference'],))),
                                                          #kwargs={'caller_reference': parameters['callerReference']})),
                           'callerKey': settings.FPS['callerKey'],
                           })

    # add timestampe and signature
    print "PRE FINALIZE"
    for x in camel_parameters:
        print x,"=",camel_parameters[x]
    finalize_parameters(camel_parameters, type=CBUI_TYPE)
    print "POST FINALIZE"
    for x in camel_parameters:
        print x,"=",camel_parameters[x]
    
    full_url = "%s?%s" % (AMAZON_CBUI_URL, urllib.urlencode(camel_parameters))
    print
    print "FULL_URL", full_url
    print
    
    user = User.get_or_none(private_key=private_key)
    if not user:
        message = "unknown user: %s, request=%s" % (private_key, request)
        Log.Error(message, "unknown_user")
        return json_failure(message)
    
    multiuse = FPSMultiuseAuth.get_or_none(caller_reference=lower_parameters['caller_reference'])
    if not multiuse:
        multiuse = FPSMultiuseAuth.add(user, lower_parameters)
    
    return HttpResponseRedirect(full_url)

def authorize_multiuse_callback(request, caller_reference):
    """
        user already authorized token:
            MTGcPUGRNCpQ
            signature=LVCSaC%2F6Yehs42YULIUE9af91OA%3D
            errorMessage=NP
            status=NP
        
        user aborted:
            MTGcPUGRNCpQ
            signature=uZK3bFyJKccNrClZCqY3FNfc72Y%3D
            status=A
        
        success:
            AUKJCQ7MdteM
            signature=S8BaFR36BYvtHk54v9cD3x7wfXI%3D
            expiry=03%2F2015
            tokenID=5495IQGR5ASC3RLHX6JCEDXVJMZJDVJAENVH46VIJJGEIIT891CTNAJEBHY4A2Y5
            status=SC
            callerReference=AUKJCQ7MdteM
            
            http://localhost:8000/fps/user/multiuse/authorize_callback/AmOYgYlAUMd6/
            signature=KO8sd2aac6YAT6Omctb19vq5MZo%3D
            errorMessage=The+following+input(s)+are+not+well+formed%3A+[callerReference]
            status=CE
            callerReference=AmOYgYlAUMd6
    """
    if not settings.DJANGO_SERVER and not request.is_secure():
        message = "must secure data via HTTPS: request=%s" % request
        Log.Error(message, "request_error")
        return json_failure(message)
    
    print request
    print "PAYMENT AUTH CALLBACK GET: ", caller_reference, json.dumps(request.GET, indent=2)
    multi_auth = FPSMultiuseAuth.get_or_none(caller_reference=caller_reference)
    
    expected_parameters = ["signature",
                           "status"]
    optional_parameters = ["expiry",
                           "tokenID",
                           "callerReference",
                           "errorMessage",
                           ]
    
    response = extract_parameters(request, "GET", expected_parameters, optional_parameters)
    if not response['success']:
        multi_auth.status = FPSMultiuseAuth.STATUSES['RESPONSE_ERROR']
        multi_auth.save()
        return HttpResponseRedirect(reverse('register'))
    
    parameters = response['parameters']
    print "PARAMS FROM EXTRACTOR", json.dumps(parameters, indent=2)
    """
    TODO
    corrupted = is_corrupted(parameters, CBUI_CALLBACK_TYPE)
    if corrupted:
        multi_auth.status = FPSMultiuseAuth.STATUS['RESPONSE_ERROR']
        multi_auth.save()
        return HttpResponseRedirect(reverse('register'))
    """

    if FPSMultiuseAuth.success(parameters['status']):
        multi_auth.token_id = parameters['tokenID']
        multi_auth.expiry = parameters['expiry']
        if parameters['callerReference'] != caller_reference:
            Log.Error("fps.authorize_multiuse_callback returned non-matching caller reference %s v %s. %s" % (parameters['callerReference'],
                                                                                                              caller_reference,
                                                                                                              request.GET))
    elif parameters['status'] ==  FPSMultiuseAuth.STATUSES['PAYMENT_ERROR']: # NP
        # payment error. eg user doesn't have a payment method
        # or user already has an authorized token
        if 'errorMessage' in parameters:
            multi_auth.error_message = parameters['errorMessage']
    elif parameters['status'] ==  FPSMultiuseAuth.STATUSES['ABORTED']: # A
        # user aborted pipeilne
        if 'errorMessage' in parameters:
            multi_auth.error_message = parameters['errorMessage']

    multi_auth.status = parameters['status']
    multi_auth.save()

    return HttpResponseRedirect(reverse('register'))

def cancel_multiuse(request):
    """
    request:
    https://fps.sandbox.amazonaws.com?
    SignatureVersion=1
    ReasonText=User+clicked+cancel
    Version=2009-01-09
    AWSAccessKeyId=AKIAIQP3UWTD7ZIDK2NQ
    TokenId=8S1TI29UK1F36M57ZM4T69SILWPLA6XHJJ5CGUUVRLGNAP8BSG3BAK2WCAAUEHCE
    action=CancelToken
    Timestamp=1253825694
    Signature=wLY9ASy363Q9%2FQO5h3DxWqMJxS0%3D
    
    https://fps.amazonaws.com/?
      Action=CancelToken&
  AWSAccessKeyId=0656Example83G2&
  SignatureVersion=1&
  Timestamp=2008-08-06T13%3A00%3A01Z&    2008-08-06T13:00:01Z
  TokenId=254656Example83987&
  Version=2008-09-17&
  Signature=<URL-encoded signature value>
    
    #@TODO IMPORTANT: if user already has token, but make pipeline auth request with 
    different callerReference, then no problem, (just returns data we already know??).
    same callerReference, then has problem.
    
    error response:
    
    response:
    <?xml version="1.0"?>
    <CancelTokenResponse xmlns="http://fps.amazonaws.com/doc/2008-09-17/"><ResponseMetadata><RequestId>c0536599-b904-4cee-a504-5c80d7812464:0</RequestId></ResponseMetadata></CancelTokenResponse>
    
    """
    if not settings.DJANGO_SERVER and not request.is_secure():
        message = "must secure data via HTTPS: request=%s" % request
        Log.Error(message, "request_error")
        return json_failure(message)
    
    print
    print "CANCEL MULTIUSE"
    print json.dumps(request.POST, indent=2)
    print
    expected_parameters = ["token_id",
                           "reason_text",
                           "private_key",
                           "version",
                           "timestamp"]

    response = extract_parameters(request, "POST", expected_parameters)
    if not response['success']:
        return json_failure("Something went wrong extracting parameters: %s" % response['reason'])
    
    print
    print "TIMESTAMP before"
    print  response['parameters']['timestamp'] 
    response['parameters']['timestamp'] = datetime.datetime.fromtimestamp(float(response['parameters']['timestamp']))
    print
    print "TIMESTAMP after"
    print  response['parameters']['timestamp']
    response['parameters']['timestamp'] = response['parameters']['timestamp'].strftime("%Y-%m-%dT%H:%M:%SZ")
    print
    print "TIMESTAMP after"
    print  response['parameters']['timestamp']
    print
    
    response['parameters']['timestamp'] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    print
    print "TIMESTAMP gmt"
    print  response['parameters']['timestamp']
    print
    
    # params to send back to client
    lower_parameters = response['parameters']
    private_key = lower_parameters['private_key']
    del lower_parameters['private_key']
    
    # params for FPS REST request
    camel_parameters = _switch_cases(response['parameters'], to_lower=False, cbui=False)

    camel_parameters.update({'Action': 'CancelToken',
                             'AWSAccessKeyId': settings.FPS['callerKey'],
                             'SignatureVersion': 1,
                             })
    # add signature
    finalize_parameters(camel_parameters, type=REST_TYPE)
    
    full_url = "%s?%s" % (AMAZON_FPS_API_URL,
                          urllib.urlencode(camel_parameters))

    user = User.get_or_none(private_key=private_key)
    print "----  USER ----"
    print user
    if not user:
        message = "unknown user: %s, request=%s" % (private_key, request)
        Log.Error(message, "unknown_user")
        return json_failure(message)
    
    FPSMultiuseCancelToken.add(user,
                               token_id=lower_parameters['token_id'],
                               reason_text=lower_parameters['reason_text'],
                               timestamp=lower_parameters['timestamp'])
    
    print
    print "FULL URL"
    print full_url
    content = _get(full_url)
    print
    print "CONTENT"
    print content
    
    multiauth = FPSMultiuseAuth.get_or_none(token_id=lower_parameters['token_id'])
    multiauth.status = FPSMultiuseAuth.STATUSES['CANCELLED']
    multiauth.save()
        
    return json_success()

def multiuse_pay(request):
    """
    error response:
    <?xml version="1.0"?>
    <Response><Errors><Error><Code>InvalidRequest</Code><Message>The request doesn't conform to the interface specification in the WSDL. Element/Parameter "http://fps.amazonaws.com/doc/2008-09-17/:recipient_token_id" in request is either invalid or is found at unexpected location</Message></Error></Errors><RequestID>744ab3b6-17c2-4ab0-ad24-28eba41a5079</RequestID></Response>

or

   <?xml version="1.0"?>
<Response><Errors><Error><Code>InvalidParams</Code><Message>"recipientTokenId" has to be a valid token ID. Specified value: NONE</Message></Error></Errors><RequestID>f9f9d847-13b9-4a84-9be5-7295dae61f85</RequestID></Response>

https://fps.sandbox.amazonaws.com
RefundTokenId=R1VX241BUXNS41329VP62LVLLTNCNAHEBPIB7GKZZQ848HZFR8J56C5JZEUMEZWB
SignatureVersion=1
RecipientTokenId=R7VXG4TBUJNM41J2ZVPX2KVLDTGCNUHQBPEBIGKUZM84VHNFR3J86CUJ6EUZE4WU
MarketplaceFixedFee=null
Version=2008-09-17
AWSAccessKeyId=AKIAIQP3UWTD7ZIDK2NQ
Timestamp=2009-09-26T15%3A52%3A04Z
SenderTokenId=I39FL7CM3X8I3XUHPB9M7PZEXXBKLUO86PSK5ES8AKBTL9J4H2X4GVVBJIKAGIWP
MarketplaceVariableFee=0.1
CallerReference=lipqDdR5QKV0
Signature=ZHSwy68P7BQB6hHqNn7%2BGMnI3%2Bw%3D
Action=Pay
TransactionAmount=0.22


    error response:
<?xml version="1.0"?>
<Response>
    <Errors>
        <Error>
            <Code>IncompatibleTokens</Code>
            <Message>Maximum values of marketplace fees not defined in Recipient token or are unreadable.</Message>
        </Error>
    </Errors>
    <RequestID>27d73b73-d6fc-4f83-81ee-f7c7534e9225</RequestID>
</Response>

<?xml version="1.0"?>
<Response>
    <Errors>
        <Error>
            <Code>InvalidParams</Code>
            <Message>Transaction amount must be greater than Recipient Fee liability.</Message>
        </Error>
    </Errors>
    <RequestID>0b80acb2-2105-4e44-acbe-6520a1cdafe6</RequestID>
</Response>

success!!!
<?xml version="1.0"?>
<PayResponse xmlns="http://fps.amazonaws.com/doc/2008-09-17/">
    <PayResult>
        <TransactionId>14FUAIBTQ5ECRD1CVD8HIH1E445NK43FIQ6</TransactionId>
        <TransactionStatus>Pending</TransactionStatus>
    </PayResult>
    <ResponseMetadata>
        <RequestId>8292cb68-d09d-4bec-a5bf-df5c2923cfc1:0</RequestId>
    </ResponseMetadata>
</PayResponse>

<?xml version="1.0"?>
<PayResponse xmlns="http://fps.amazonaws.com/doc/2008-09-17/">
    <PayResult>
        <TransactionId>14FUV9H5S5COG9TU5VU3GVBKRP3PJ955TTH</TransactionId>
        <TransactionStatus>Pending</TransactionStatus>
    </PayResult>
    <ResponseMetadata>
        <RequestId>137cb61d-b28c-4491-a1b3-ad7233ff6a84:0</RequestId>
    </ResponseMetadata>
</PayResponse>
    """
    if not settings.DJANGO_SERVER and not request.is_secure():
        message = "must secure data via HTTPS: request=%s" % request
        Log.Error(message, "request_error")
        return json_failure(message)
    
    print
    print "CANCEL MULTIUSE"
    print json.dumps(request.POST, indent=2)
    print
    
    expected_parameters = ["timestamp",
                           "caller_reference",
                           "marketplace_fixed_fee",
                           "marketplace_variable_fee",
                           "transaction_amount",
                           "recipient_slug",
                           "sender_token_id",
                           "private_key",
                           "version"]

    response = extract_parameters(request, "POST", expected_parameters)
    if not response['success']:
        return json_failure("Something went wrong extracting parameters: %s" % response['reason'])

    response['parameters']['timestamp'] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    print
    print "TIMESTAMP gmt"
    print  response['parameters']['timestamp']
    print
    
    # params to send back to client
    lower_parameters = response['parameters']
    private_key = lower_parameters['private_key']
    del lower_parameters['private_key']
    
    user = User.get_or_none(private_key=private_key)
    print "----  USER ----"
    print user
    if not user:
        message = "unknown user: %s, request=%s" % (private_key, request)
        Log.Error(message, "unknown_user")
        return json_failure(message)
    
    rslug = lower_parameters['recipient_slug']
    recipient = Recipient.get_or_none(slug=rslug)
    if not recipient:
        return json_failure("No recipient found that matches %s" % rslug)
    
    fpsr = recipient.fps_data
    if not fpsr:
        return json_failure("No FPS Recipient data found for %s." % recipient)

    del lower_parameters['recipient_slug']
    lower_parameters['recipient_token_id'] = fpsr.token_id
    #lower_parameters['refund_token_id'] = fpsr.refund_token_id
    lower_parameters['marketplace_fixed_fee'] = 0.00
    
    #lower_parameters['RecipientTokenId'] = fpsr.token_id
    #lower_parameters['RefundTokenId'] = fpsr.refund_token_id
    #lower_parameters['SenderTokenId'] = lower_parameters['sender_token_id']
    #del lower_parameters['sender_token_id']

    # params for FPS REST request
    camel_parameters = _switch_cases(response['parameters'], to_lower=False, cbui=False)
    camel_parameters['TransactionAmount.Value'] =  camel_parameters['TransactionAmount']
    camel_parameters['TransactionAmount.CurrencyCode'] =  'USD'
    del camel_parameters['TransactionAmount']
    camel_parameters['MarketplaceFixedFee.Value'] =  camel_parameters['MarketplaceFixedFee']
    camel_parameters['MarketplaceFixedFee.CurrencyCode'] =  'USD'
    del camel_parameters['MarketplaceFixedFee']
    
    print
    print "CAMEL"
    print json.dumps(camel_parameters, indent=2)
    print

    camel_parameters.update({'Action': 'Pay',
                             'AWSAccessKeyId': settings.FPS['callerKey'],
                             'SignatureVersion': 1,
                             })
    # add signature
    finalize_parameters(camel_parameters, type=REST_TYPE)
    
    full_url = "%s?%s" % (AMAZON_FPS_API_URL,
                          urllib.urlencode(camel_parameters))

    print
    print "FULL URL"
    print full_url
    content = _get(full_url)
    print
    print "CONTENT"
    print content
    
    xmlns_re = re.compile(' xmlns="http://fps.amazonaws.com/doc/[\d-]+/"')
    version_re = re.compile(' xmlns="http://fps.amazonaws.com/doc/([\d-]+)/"')
    
    has_match = version_re.search(content)
    if has_match:
        if has_match.group(1) != lower_parameters['version']:
            # versions are out of synch!
            pass
        # we need to use a compiled re that doesn't extract the version, otherwise split
        # will include the version
        content = ''.join(xmlns_re.split(content))
    
    response_dict = ConvertXmlToDict(content)
    # p23 of Advanced Quick Start Dev Guide says that only the first error is ever reported
    # so errors is expected to always contain at most one error.
    errors = []
    error_code = None
    error_message = None
    transaction_id = None
    transaction_status = FPSMultiusePay.STATUSES['ERROR']
    request_id = None
    for key in response_dict:
        if key == 'Response':
            # error response
            """
            {'Response': {'Errors': {'Error': [{'Code': 'InvalidParams',
                                    'Message': 'Transaction amount must be greater than Recipient Fee liability.'},
                                   {'Code': 'Error2',
                                    'Message': 'Another error'}]},
              'RequestID': '0b80acb2-2105-4e44-acbe-6520a1cdafe6'}}
            """
            for error in response_dict['Response']['Errors']['Error']:
                errors.append(error)
                error_code = response_dict['Response']['Errors']['Error']['Code']
                error_message = response_dict['Response']['Errors']['Error']['Message']
            request_id = response_dict['Response']['RequestID']
        elif key == 'PayResponse':
            # success
            transaction_id = response_dict['PayResponse']['PayResult']['TransactionId']
            transaction_status = FPSMultiusePay.STATUSES[ response_dict['PayResponse']['PayResult']['TransactionStatus'].upper() ]
            request_id = response_dict['PayResponse']['ResponseMetadata']['RequestId']
        else:
            error_code = '?'
            error_message = "unknown fps.multiusepay response %s for %s" % (response_dict, full_url)
            Log.Error(error_message)
    
    pay = FPSMultiusePay.add(user, recipient,
                             lower_parameters['caller_reference'],
                             lower_parameters['timestamp'],
                             lower_parameters['marketplace_fixed_fee'],
                             lower_parameters['marketplace_variable_fee'],
                             lower_parameters['recipient_token_id'],
                             #lower_parameters['refund_token_id'],
                             lower_parameters['sender_token_id'],
                             lower_parameters['transaction_amount'],
                             request_id,
                             transaction_id,
                             transaction_status,
                             error_message,
                             error_code)
    if errors:    
        return json_success({'pay': pay.deep_dict(),
                             'log': "%s: %s" % (error_code, error_message)})
    else:
        return json_success({'pay': pay.deep_dict()})

def ipn(request):
    """
    PAY::::::
    
    INSTANT PAYMENT NOTE
    {
      "operation": "PAY", 
      "transactionDate": "1254096159", 
      "notificationType": "TransactionStatus", 
      "recipientEmail": "pd_recip_bilumi@bilumi.org", 
      "callerReference": "Y52tMVgbr1aX", 
      "buyerName": "User for ProcrasDonate Sandbox Testing", 
      "signature": "/prSnliI43P+zYhIqn/gJjqvX0c=", 
      "recipientName": "Test Business", 
      "transactionId": "14FUV9H5S5COG9TU5VU3GVBKRP3PJ955TTH", 
      "statusCode": "PendingNetworkResponse", 
      "paymentMethod": "CC", 
      "transactionAmount": "USD 2.22", 
      "statusMessage": "The transaction is awaiting a response from the backend payment processor.", 
      "transactionStatus": "PENDING"
    }
    =============================================
    INSTANT PAYMENT NOTE
    {
      "operation": "PAY", 
      "transactionDate": "1254096159", 
      "notificationType": "TransactionStatus", 
      "recipientEmail": "pd_recip_bilumi@bilumi.org", 
      "callerReference": "Y52tMVgbr1aX", 
      "buyerName": "User for ProcrasDonate Sandbox Testing", 
      "signature": "8vmsIPZtIW9pbVuaZEPVBvrzCmM=", 
      "recipientName": "Test Business", 
      "transactionId": "14FUV9H5S5COG9TU5VU3GVBKRP3PJ955TTH", 
      "statusCode": "Success", 
      "paymentMethod": "CC", 
      "transactionAmount": "USD 2.22", 
      "statusMessage": "The transaction was successful and the payment instrument was charged.", 
      "transactionStatus": "SUCCESS"
    }
    
    CANCEL MULTIUSE AUTH:::::::
    {
      "paymentReason": "Proudly ProcrasDonating for a good cause!", 
      "customerName": "User for ProcrasDonate Sandbox Testing", 
      "tokenType": "MultiUse", 
      "tokenId": "I29FZ7HM3Z8I3XJH7B9V7GZEPXDKLVOF6P5KUESEAFBTG9R4H5XGGV7B6IKEGIWH", 
      "dateInstalled": "Sep 27, 2009", 
      "customerEmail": "pd_user@bilumi.org", 
      "notificationType": "TokenCancellation", 
      "callerReference": "s2BZ7h5EH3kx"
    }


    Recipient initiates refund:
    {
      "status": "INITIATED", 
      "paymentReason": "A: i just wanted to test out what would happen", 
      "parentTransactionId": "14FUAIBTQ5ECRD1CVD8HIH1E445NK43FIQ6", 
      "operation": "REFUND", 
      "transactionDate": "1254160785", 
      "notificationType": "TransactionStatus", 
      "recipientEmail": "pd_recip_bilumi@bilumi.org", 
      "callerReference": "txnDtls27f8ab95-0aa0-4623-868c-bc6fc8140975", 
      "buyerName": "User for ProcrasDonate Sandbox Testing", 
      "signature": "n5ikYu///MoR+fdCUZe7UcKiNSI=", 
      "recipientName": "Test Business", 
      "transactionId": "14GZSTOCN6MRD4H6LBK39NN59KOCR8HM9MB", 
      "paymentMethod": "CC", 
      "transactionAmount": "USD 10.00"
    }
    =============================================
    {
      "status": "SUCCESS", 
      "paymentReason": "A: i just wanted to test out what would happen", 
      "parentTransactionId": "14FUAIBTQ5ECRD1CVD8HIH1E445NK43FIQ6", 
      "operation": "REFUND", 
      "transactionDate": "1254160785", 
      "notificationType": "TransactionStatus", 
      "recipientEmail": "pd_recip_bilumi@bilumi.org", 
      "callerReference": "txnDtls27f8ab95-0aa0-4623-868c-bc6fc8140975", 
      "buyerName": "User for ProcrasDonate Sandbox Testing", 
      "signature": "8IUtGKTpRrcaTZUTstAVHTZEkGA=", 
      "recipientName": "Test Business", 
      "transactionId": "14GZSTOCN6MRD4H6LBK39NN59KOCR8HM9MB", 
      "paymentMethod": "CC", 
      "transactionAmount": "USD 10.00"
    }

    """
    if not settings.DJANGO_SERVER and not request.is_secure():
        message = "must secure data via HTTPS: request=%s" % request
        Log.Error(message, "request_error")
        return json_failure(message)
    
    try:
        f = open("/var/sites/ProcrasDonate/log.log", 'a')
        f.write("\n\nINSTANT PAYMENT NOTE\n")
        f.write(json.dumps(request.POST, indent=2))
        f.write("\nurl: "+urllib.urlencode(request.POST)+"\n");
        f.write("\n=============================================\n")
        f.close()
    except:
        pass
    
    if request.POST:
        data = request.POST
        datatype = "POST"
    else:
        data = request.GET
        datatype = "GET"
    
    notification_type = data.get('notificationType', None)
    if not notification_type:
        message = "fps.ipn does not contain notificationType: %s" % (data)
        Log.Warn(message)
    
    if notification_type == "TokenCancellation":
        pass
    
    elif notification_type == "TransactionStatus":
        expected_parameters = ["operation",
                               "transactionDate",
                               "notificationType",
                               "recipientEmail",
                               "callerReference",
                               "buyerName",
                               "signature",
                               "recipientName",
                               "transactionId",
                               "statusCode",
                               "paymentMethod",
                               "transactionAmount",
                               "statusMessage",
                               "transactionStatus"]
        optional_parameters = ["parentTransactionId", # refund
                               "status", # refund
                               "paymentReason", # refund
                               "statusMessage", # payment
                               "statusCode", # payment
                               "transactionStatus"] # payment
        response = extract_parameters(request, datatype, expected_parameters, optional_parameters)
        if not response['success']:
            message = "fps.ipn Failed to extract expected parameters %s from %s" % (expected_parameters,
                                                                                    data)
            Log.Error(message, "AMAZON_RESPONSE")
            return json_failure(message)
        parameters = response['parameters']
        
        if parameters['notificationType'] == 'TransactionStatus':
            print "TRANSACTION STATUS"
            if parameters['operation'] == 'REFUND':
                print "REFUND"
                pay = FPSMultiusePay.get_or_none(transaction_id=parameters['parentTransactionId'])
                if parameters['status'] == 'INITIATED':
                    pay.transaction_status = FPSMultiusePay.STATUSES['REFUND_INITIATED']
                elif parameters['status'] == 'SUCCESS':
                    pay.transaction_status = FPSMultiusePay.STATUSES['SUCCESS']
                pay.save()
                
            elif parameters['operation'] == 'PAY':
                print "PAY"
                pay = FPSMultiusePay.get_or_none(transaction_id=parameters['transactionId'])
                print pay
                print "old status", pay.transaction_status
                print "new status", parameters['transactionStatus']
                print "new status thing", FPSMultiusePay.STATUSES[ parameters['transactionStatus'] ]
                if pay.transaction_status == FPSMultiusePay.STATUSES['PENDING']:
                    pay.transaction_status = FPSMultiusePay.STATUSES[ parameters['transactionStatus'] ]
                    pay.save()
                    print "new pay", pay

        elif parameters['notificationType'] == 'TokenCancellation':
            multiuse = FPSMultiuseAuth.get_or_none(token_id=parameters['tokenId'])
            if multiuse.status != FPSMultiuseAuth.STATUSES['CANCELLED']:
                multiuse.status = FPSMultiuseAuth.STATUSES['CANCELLED']
                multiuse.save()
            
    parameters = response['parameters']
    return json_success()
