from lib.view_utils import render_response, HttpResponseRedirect, extract_parameters
from lib.json_utils import json_success, json_failure
from procrasdonate.applib.xpi_builder import XpiBuilder
from procrasdonate.models import *

from procrasdonate.processors import *

import urllib, urllib2
from django.utils import simplejson as json

from django.core.urlresolvers import reverse

from settings import pathify, path, PROJECT_PATH, MEDIA_ROOT

def _POST(url, values):
    """
    POSTs values to url. Returns whatever url returns
    """
    data = urllib.urlencode(values)
    req = urllib2.Request(url, data)
    response = urllib2.urlopen(req).read()
    return json.loads(response)

def send_email(request):
    """
    Sends email to user. Triggered by extension.
    Possible types:
      -~={ USERS }=~-
        * WELCOME: triggered as soon as a user installs the extension
        * UPDATE: triggered as soon as a user updates the extension
        * TIME TO UPDATE EXTENSION: triggered when current extension version 
                            differs from latest version received from server
        * THANK YOU BLURBS (opt-in) -- 3 donation amount steps + blurb.
         
      -~={ CRON JOBS }=~-
        * END OF YEAR EMAIL FOR TAXES
        * END OF YEAR CHARITY NOTIFICATION (opt-in)
        * WEEKLY (EVERY SUNDAY NIGHT):
            their performance
            alerts (register? reauthorize? pre-selected recipient officially signed up)
            blog posts
            company updates
            tech updates
            recipient blurb
            * UPDATES FROM THEIR CHARITIES
        
      -~={ RECIPIENTS }=~-
        * WEEKLY TO RECIPIENT: their performance, company updates, tech updates
    """
    #try:
    if not request.POST:
        return json_failure("must *POST* data")
    
    expected_parameters = ["private_key",
                           "opt_in_status",
                           "email_type"]
    response = extract_parameters(request, "POST", expected_parameters)
    if not response['success']:
        message = "dataflow.send_email Failed to extract expected parameters %s from %s" % (expected_parameters,
                                                                                            request.POST)
        Log.Error(message, "DATA_FROM_EXTN")
        return json_failure(message)
    parameters = response['parameters']

    #email_address = parameters['email_address']
    #email = Email.add(email_address)
    
    return json_success()

def receive_data(request):
    """
    handles totals, logs, userstudies, payments, requirepayments posted from extension
    """
    #try:
    if not settings.DJANGO_SERVER and not request.is_secure():
        message = "must secure data via HTTPS: request=%s" % request
        Log.Error(message, "request_error")
        return json_failure(message)

    if not request.POST:
        message = "must *POST* data"
        Log.Error(message, "request_error")
        return json_failure(message)
    
    datatypes = ["totals", "logs", "userstudies", "payments", "requirespayments", "reports"]
    processor_fnc = {'totals'          : Processor.process_total,
                     'logs'            : Processor.process_log,
                     'userstudies'     : Processor.process_userstudy,
                     'payments'        : Processor.process_payment,
                     'requirespayments': Processor.process_requirespayment,
                     'reports'         : Processor.process_report}
    
    expected_parameters = ["private_key", "prefs"]
    response = extract_parameters(request, "POST", expected_parameters, datatypes)
    if not response['success']:
        message = "dataflow.receive_data Failed to extract expected parameters %s from %s" % (expected_parameters,
                                                                                              request.POST)
        Log.Error(message, "DATA_FROM_EXTN")
        return json_failure(message)
    parameters = response['parameters']

    private_key = parameters["private_key"]
     
    user = User.get_or_none(private_key=private_key)
    if not user:
        message = "unknown user: %s, request=%s" % (private_key, request)
        Log.Error(message, "unknown_user")
        return json_failure(message)
    
    prefs_dict = json.loads(parameters["prefs"])
    prefs = [];
    keys = prefs_dict.keys()
    keys.sort()
    for key in keys:
        prefs.append( "%s: %s" % (key, prefs_dict[key]) )
    
    print "--"*20
    print "PREFS"
    print "\n".join(prefs)
    print "--"*20
    
    Log.Log("User sent data. Here are their prefs: %s" % "\n".join(prefs), "prefs", user)
    
    processed_count = 0
    for datatype in datatypes:
        print " datatype ", datatype
        if datatype in parameters:
            items = json.loads(parameters[datatype])
            print "---- %s %s -------" % (len(items), datatype)
            #print json.dumps(items[:1], indent=2)
            for item in items:
                obj = processor_fnc[datatype](item, user)
                processed_count += 1
    
    return json_success({"process_success_count": processed_count})
        
    #except:
    #    return json_failure("Something unexpected happened")



def decode_time(str):
    #@TODO for real
    return datetime.datetime(1, 1, 1)

def return_data(request):
    """
    sends back:
        * data for particular user
        * latest extension version
    """
    if not settings.DJANGO_SERVER and not request.is_secure():
        message = "must secure data via HTTPS: request=%s" % request
        Log.Error(message, "request_error")
        return json_failure(message)

    errors = []
    expected_parameters = ["private_key", "since"]

    response = extract_parameters(request, "GET", expected_parameters)
    if not response['success']:
        return json_failure("Something went wrong extracting parameters: %s" % response['reason'])

    since = response["parameters"]["since"]
    print "----SINCE----------"
    print json.dumps(since, indent=2)
    since = decode_time(since)
    print since

    private_key = response["parameters"]["private_key"]
    print "----private_key----------"
    print json.dumps(private_key, indent=2)
    
    user = User.get_or_none(private_key=private_key)
    print "----  USER ----"
    print user
    if not user:
        message = "unknown user: %s, request=%s" % (private_key, request)
        Log.Error(message, "unknown_user")
        return json_failure(message)
    
    recipients = []
    #for recipient in Recipient.objects.filter(fpsrecipient__timestamp__gte=since):
    for recipient in Recipient.objects.all():
        recipients.append(recipient.deep_dict())
        
    multiuse_auths = []
    has_success = False
    for multiuse_auth in FPSMultiuseAuth.objects.filter(user=user):
        multiuse_auths.append(multiuse_auth.deep_dict())
        if multiuse_auth.good_to_go():
            has_success = True
    
    if not has_success:
        pass
        #@TODO if not has_success, then ask Amazon for token in case pipeline completed by didn't make it back to server yet.
    
    multiuse_pays = []
    for multiuse_pay in FPSMultiusePay.objects.filter(user=user):
        multiuse_pays.append(multiuse_pay.deep_dict())
            
    #print '#.'*30;
    #print "RETURN DATA RETURNED"
    #print json.dumps({'recipients': recipients,
    #                     'multiuse_auths': multiuse_auths}, indent=2)
    #print '#.'*30;
    
    xpi_builder = XpiBuilder(pathify([PROJECT_PATH, 'procrasdonate', 'ProcrasDonateFFExtn'], file_extension=True),
                             "%s%s" % (MEDIA_ROOT, 'xpi'),
                             "%s%s" % (MEDIA_ROOT, 'rdf'))
    return json_success({'recipients': recipients,
                         'multiuse_auths': multiuse_auths,
                         'multiuse_pays': multiuse_pays,
                         'latest_version': xpi_builder.get_version()})

def generate_xpi(request, slug):
    print "GENERATE XPI", slug
    recipient = slug != '__none__' and Recipient.get_or_none(slug=slug) or None
    xpi_builder = XpiBuilder(pathify([PROJECT_PATH, 'procrasdonate', 'ProcrasDonateFFExtn'], file_extension=True),
                             "%s%s" % (MEDIA_ROOT, 'xpi'),
                             "%s%s" % (MEDIA_ROOT, 'rdf'),
                             recipient)
    
    private_key = xpi_builder.write_input_json()
    user = User.add(private_key)
    Log.Log("Built XPI for download", detail="usage", user=user)
    
    (xpi_url, xpi_hash) = xpi_builder.build_xpi()
    return json_success({'xpi_url': xpi_url,
                         'xpi_hash': xpi_hash})

