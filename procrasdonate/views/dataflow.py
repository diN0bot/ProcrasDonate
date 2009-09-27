from lib.view_utils import render_response, HttpResponseRedirect, extract_parameters
from lib.json_utils import json_success, json_failure
from procrasdonate.models import *

from procrasdonate.processors import *

import urllib, urllib2
from django.utils import simplejson as json

from django.core.urlresolvers import reverse

def _POST(url, values):
    """
    POSTs values to url. Returns whatever url returns
    """
    data = urllib.urlencode(values)
    req = urllib2.Request(url, data)
    response = urllib2.urlopen(req).read()
    return json.loads(response)

def send_welcome_email(request):
    if not request.POST:
        return json_failure("must *POST* email address")
    
    email_address = request.POST.get('email_address','')
    email = Email.add(email_address)
    
    #@todo send welcome email
    
    return json_success()

def send_regular_email(request):
    pass

def _require_json_parameter(request, method, parameter_name):
    """
    @return (True, json value for parameter) or (False, json_failure() response)
    """
    SUCCESS = True
    FAILURE = False
    json_value = getattr(request, method).get(parameter_name, None)
    if not json_value:
        return (FAILURE, json_failure("must %s *%s* parameter" % (method, parameter_name)))
    try:
        return (SUCCESS, json.loads(json_value))
    except ValueError, e:
        return (FAILURE, json_failure(repr(e)))

def receive_data(request):
    """
    handles totals, logs, userstudies, payments, requirepayments posted from extension
    """
    #try:
    if not request.POST:
        return json_failure("must *POST* data")
    
    (success, result) = _require_json_parameter(request, "POST", "json_data")
    if not success:
        return result

    hash = result["hash"]
    print "----HASH----------"
    print json.dumps(hash, indent=2)
    
    user = User.get_or_create(hash)
    print "----  USER ----"
    print user
    
    print
    print request.POST
    print
    
    processed_count = 0
    for datatype in ["totals", "logs", "userstudies", "payments", "requirespayments"]:
        print " datatype ", datatype
        if datatype in result:
            items = result[datatype]
            print "---- %s %s -------" % (len(items), datatype)
            print json.dumps(items[:1], indent=2)
            for item in items:
                #success = TotalProcessor.process_json(total, user)
                processed_count += success and 1 or 0
    
    ret = json_success({"process_success_count": processed_count})
    print "response = ", ret
    return ret
        
    #except:
    #    return json_failure("Something unexpected happened")



def decode_time(str):
    #@TODO for real
    return datetime.datetime(1, 1, 1)

def return_data(request):
    """
    sends back data for particular user
    """
    errors = []
    expected_parameters = ["hash", "since"]

    response = extract_parameters(request, "GET", expected_parameters)
    if not response['success']:
        return json_failure("Something went wrong extracting parameters: %s" % response['reason'])

    since = response["parameters"]["since"]
    print "----SINCE----------"
    print json.dumps(since, indent=2)
    since = decode_time(since)
    print since

    hash = response["parameters"]["hash"]
    print "----HASH----------"
    print json.dumps(hash, indent=2)
    
    user = User.get_or_create(hash)
    print "----  USER ----"
    print user
    
    recipients = []
    for recipient in Recipient.objects.filter(fpsrecipient__timestamp__gte=since):
        recipients.append(recipient.deep_dict())
        
    multiuse_auths = []
    has_success = False
    for multiuse_auth in FPSMultiuseAuth.objects.filter(user=user):
        multiuse_auths.append(multiuse_auth.deep_dict())
        if multiuse_auth.good_to_go():
            has_success = True
    
    #@TODO if not has_success, then ask Amazon for token in case pipeline completed by didn't make it back to server yet.
    
    print "RETURN DATA RETURNED"
    print json.dumps({'recipients': recipients,
                         'multiuse_auths': multiuse_auths}, indent=2)
    
    return json_success({'recipients': recipients,
                         'multiuse_auths': multiuse_auths})
