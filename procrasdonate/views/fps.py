from django.core.urlresolvers import reverse
from django.utils import simplejson

from lib.view_utils import render_response, HttpResponseRedirect
from lib.json_utils import json_success, json_failure

from procrasdonate.models import *
from procrasdonate.processors import *

from lib.fps import get_signature

def recipient_registration(request):
    action_url = "https://authorize.payments-sandbox.amazon.com/cobranded-ui/actions/start"
    parameters = {'callerKey': "AKIAJJLNG522TJTSX7KQ",
                  'callerReference': "bearBoytest_1",
                  'pipelineName': "Recipient",
                  'recipientPaysFee': "True",
                  'returnUrl': "http://google.com",
                  'version': "2009-01-09"
                  }
    parameters['awsSignature'] = get_signature(parameters)

    return render_response(request, 'procrasdonate/fps/recipient_register.html', locals())    
        
def recipient_registration_callback(request):
    """
    inserts callback response parameters into HTML for procrasdonate extension to handle
    
    GET parameters:
    signature: DrYecY%2B1zu3pQlCfRJMeBBuilH8%3D
    refundTokenID: 26TKG9N9N13K6CPD4SAP57BQ8ZXFUFULH8INJMJS42T9R1BPVD7Z7Q6N9XYKYHRU
    tokenID: 25TKV9S9NP3C6CKDLSA257BQIZNFUDUHH8JN3MJU4FT961GPVB727QQNXXYJYVR6
    status: SR
    callerReference: bearBoytest_1
    """
    print request.GET
    return render_response(request, 'procrasdonate/fps/recipient_register_callback.html', locals())

def user_authorize_payment(request):
    """
    expect POST values:
        callerReferenceSettlement - 
        callerReferenceSender - 
        globalAmountLimit -
        creditLimit -
        version - one of ["2009-01-09"]
    """
    expected_method_type = "GET"
    if not request[expected_method_type]:
        return json_failure("Expected request method type %s" % expected_method_type)
    
    extracted_parameters = ["callerReferenceSettlement",
                            "callerReferenceSender",
                            "globalAmountLimit",
                            "creditLimit",
                            "version"]
    success, parameters = extract_parameters(request,
                                             "GET",
                                             extracted_parameters)
    if not success:
        return json_failure("Failed to extract expected parameters: %s" % expected_parameters)
    
    parameters.update({'pipelineName': "SetupPostpaid", 
                       'returnURL': reverse('user_authorize_payment_callback',),
                       'callerKey': settings.CALLER_KEY})
    # add timestampe and signature
    finalize_parameters(parameters)
    
    action_url = "https://authorize.payments-sandbox.amazon.com/cobranded-ui/actions/start";
    return json_success(None)

def user_authorize_payment_callback(request):
    print request.GET
    return render_response(request, 'procrasdonate/fps/recipient_register_callback.html', locals())

def user_authorize_payment(request):
    action_url = "https://authorize.payments-sandbox.amazon.com/cobranded-ui/actions/start";
    parameters = {
            'pipelineName': "SetupPostpaid", 
            'returnURL': "http://google.com",
            'callerKey': "AKIAJJLNG522TJTSX7KQ",
            'callerReferenceSettlement': "234098e097",
            'callerReferenceSender': "SenderName_uniquestring", 
            'globalAmountLimit': "100.00",
            'creditLimit': "100.00"
        }
    parameters['awsSignature'] = get_signature(parameters)

    return render_response(request, 'procrasdonate/fps/recipient_register.html', locals())    

def user_authorize_payment_callback(request):
    print request.GET
    return render_response(request, 'procrasdonate/fps/recipient_register_callback.html', locals())
