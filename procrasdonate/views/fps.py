from django.core.urlresolvers import reverse
from django.utils import simplejson as json

from lib.view_utils import render_string, render_response, HttpResponseRedirect, extract_parameters
from lib.json_utils import json_success, json_failure

from procrasdonate.models import *
from procrasdonate.processors import *

from lib import FPyS
from lib.fps import *

import settings
import datetime, time
import urllib, urllib2


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


def recipient_register(request, slug):
    errors = []
    template = 'procrasdonate/fps/recipient_register.html'
    recipient = Recipient.get_or_none(slug=slug)
    if not recipient:
        errors.append("No FPS Recipient found for %s. Check url." % slug)
        return render_response(request, template, locals())   

    r = FPSRecipient.get_or_none(recipient=recipient)
    if not r:
        r = FPSRecipient.add(recipient=recipient)
    
    if r.good_to_go():
        errors.append("You have already successfully registered.")
        return render_response(request, template, locals())   
    
    action_url = AMAZON_CBUI_URL
    parameters = {'callerKey'         : settings.FPS['callerKey'],
                  'callerReference'   : r.caller_reference,
                  'cobrandingUrl'     : settings.FPS['cobrandingUrl'],
                  'websiteDescription': settings.FPS['websiteDescription'],
                  'pipelineName'      : "Recipient",
                  'recipientPaysFee'  : "True",
                  'maxFixedFee'       : 5.00,
                  'maxVariableFee'    : 20,
                  'returnUrl': "%s%s" % (settings.DOMAIN,
                                         reverse('recipient_register_callback', args=(slug, ))),
                  'version': settings.FPS['version']
                  }
    # add timestampe and signature
    finalize_parameters(parameters, type=CBUI_TYPE)

    return render_response(request, 'procrasdonate/fps/recipient_register.html', locals())    
        
def recipient_register_callback(request, slug):
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
    errors = []
    template = 'procrasdonate/fps/recipient_register_callback.html'
    recipient = Recipient.get_or_none(slug=slug)
    if not recipient:
        errors.append("Error. No FPS Recipient found for %s. Check url." % slug)
        return render_response(request, template, locals())
    fpsr = recipient.fps_data
    if not fpsr:
        errors.append("Error: No FPS Recipient data found for %s." % slug)
        return render_response(request, template, locals())

    print "RECIP CALLBACK GET: ", request.GET
    expected_parameters = ["signature",
                           "status"]
    optional_parameters = ["refundTokenID",
                           "tokenID",
                           "callerReference",
                           "errormessage"]

    response = extract_parameters(request, "GET", expected_parameters, optional_parameters)
    if not response['success']:
        errors.append("Something went wrong extracting parameters from Amazon's request: %s" % response['reason'])
        return render_response(request, template, locals())   
    
    parameters = response['parameters']
    
    corrupted = is_corrupted(parameters, CBUI_CALLBACK_TYPE)
    if corrupted:
        errors.append("Signature did not check out")
        return render_response(request, template, locals())
    
    fpsr.refund_token_id = parameters['refundTokenID']
    fpsr.token_id = parameters['tokenID']
    fpsr.status = parameters['status']
    fpsr.save()
    
    if fpsr.status != FPSRecipient.STATUSES['SUCCESS']:
        errors.append("Registration failed: %s" % fpsr.status.visible)
        
    return render_response(request, template, locals())


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
    print
    print "AUTHORIZE_MULTIUSE"
    print json.dumps(request.POST, indent=2)
    print
    errors = []
    expected_parameters = ["caller_reference",
                           "payment_reason",
                           "payment_method",
                           "global_amount_limit",
                           "recipient_slug_list",
                           "version",
                           #"timestamp",
                           "hash"]

    response = extract_parameters(request, "POST", expected_parameters)
    if not response['success']:
        return json_failure("Something went wrong extracting parameters: %s" % response['reason'])
    
    # params to send back to client and use locally (database worthy)
    lower_parameters = response['parameters']
    hash = lower_parameters['hash']
    del lower_parameters['hash']
    
    # params for FPS REST request
    camel_parameters = _switch_cases(response['parameters'], to_lower=False)
    print
    print "CAMEL PARAMS"
    print camel_parameters
    print
    
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
    finalize_parameters(camel_parameters, type=CBUI_TYPE)
    
    action_url = AMAZON_CBUI_URL
    form_html = render_string(request, 'procrasdonate/fps/snippets/authorize_form.html', locals())
    
    full_url = "%s?%s" % (action_url,
                          urllib.urlencode(camel_parameters))
    
    print 
    print "LOWER PARAMS A"
    print lower_parameters
    print
    
    user = User.get_or_create(hash=hash)
    multiuse = FPSMultiuseAuth.get_or_none(caller_reference=lower_parameters['caller_reference'])
    if not multiuse:
        multiuse = FPSMultiuseAuth.add(user, lower_parameters)
    
    print 
    print "LOWER PARAMS"
    print lower_parameters
    print
    
    return json_success({'form_html': form_html,
                         'parameters': lower_parameters,
                         'full_url': full_url})

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
        multi_auth.status = FPSMultiuseAuth.STATUS['RESPONSE_ERROR']
        multi_auth.save()
        return HttpResponseRedirect(reverse('register'))
    
    parameters = response['parameters']
    print "PARAMS FROM EXTRACTOR", json.dumps(parameters, indent=2)
    corrupted = is_corrupted(parameters, CBUI_CALLBACK_TYPE)
    if corrupted:
        multi_auth.status = FPSMultiuseAuth.STATUS['RESPONSE_ERROR']
        multi_auth.save()
        return HttpResponseRedirect(reverse('register'))

    if FPSMultiuseAuth.success(parameters['status']):
        multi_auth.token_id = parameters['tokenID']
        multi_auth.expiry = parameters['expiry']
        if parameters['callerReference'] != caller_reference:
            #@TODO WTF~!!!
            pass
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


#@TODO add decorator that automatically returns fail if timestamp is 
#too old (to prevent replay attacks...trouble with timezones?
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
    print
    print "CANCEL MULTIUSE"
    print json.dumps(request.POST, indent=2)
    print
    expected_parameters = ["token_id",
                           "reason_text",
                           "hash",
                           "version",
                           "timestamp"]

    response = extract_parameters(request, "POST", expected_parameters)
    if not response['success']:
        return json_failure("Something went wrong extracting parameters: %s" % response['reason'])
    
    #@TODO time hack
    #timestamp is date in seconds
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
    hash = lower_parameters['hash']
    del lower_parameters['hash']
    
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

    user = User.get_or_create(hash=hash)
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
<Response><Errors><Error><Code>IncompatibleTokens</Code><Message>Maximum values of marketplace fees not defined in Recipient token or are unreadable.</Message></Error></Errors><RequestID>27d73b73-d6fc-4f83-81ee-f7c7534e9225</RequestID></Response>

<?xml version="1.0"?>
<Response><Errors><Error><Code>InvalidParams</Code><Message>Transaction amount must be greater than Recipient Fee liability.</Message></Error></Errors><RequestID>0b80acb2-2105-4e44-acbe-6520a1cdafe6</RequestID></Response>

success!!!
<?xml version="1.0"?>
<PayResponse xmlns="http://fps.amazonaws.com/doc/2008-09-17/"><PayResult><TransactionId>14FUAIBTQ5ECRD1CVD8HIH1E445NK43FIQ6</TransactionId><TransactionStatus>Pending</TransactionStatus></PayResult><ResponseMetadata><RequestId>8292cb68-d09d-4bec-a5bf-df5c2923cfc1:0</RequestId></ResponseMetadata></PayResponse>

    """
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
                           "hash",
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
    hash = lower_parameters['hash']
    del lower_parameters['hash']
    user = User.get_or_create(hash=hash)
    
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

    #FPSMultiusePay.add(user,
    #                   timestamp=lower_parameters['timestamp'])
    
    print
    print "FULL URL"
    print full_url
    content = _get(full_url)
    print
    print "CONTENT"
    print content
    
    return json_success()

def ipn(request):
    print
    print "INSTANT PAYMENT NOTIFICATION"
    print json.dumps(request.POST, indent=2)
    print
    f = open("/var/sites/ProcrasDonate/log.log", 'a')
    f.write("\n\nINSTANT PAYMENT NOTE\n")
    f.write(json.dumps(request.POST, indent=2))
    f.write("\n=============================================\n")
    f.close()
    return json_success()
