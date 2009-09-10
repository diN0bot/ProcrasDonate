from lib.view_utils import render_response, HttpResponseRedirect
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

    #text = u"p 5\u00A2 @diN0bot from python"
    #text = urllib.quote(text.encode('utf8'), safe='~') 
    #values = {'twitter_username': 'diN0bot',
    #          'twitter_password': 'pea15nut',
    #          'text': text }
    #url = "http://tipjoy.com/api/tweetpayment/"
    #print _POST(url, values)
    

def rebuild_extension_templates(request):
    return json_failure([ "Please execute the following on the command line: python /Users/lucy/sandbox/CalmProcrasDonate/procrasdonate/ff_extn/ProcrasDonate/content/bin/build_templates.py procrasdonate/ff_extn/ProcrasDonate/content/templates/*.html; cat /Users/lucy/sandbox/CalmProcrasDonate/procrasdonate/ff_extn/ProcrasDonate/content/templates/*.js > /Users/lucy/sandbox/CalmProcrasDonate/procrasdonate/ff_extn/ProcrasDonate/content/js/templates/all.js" ])

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
    handles totals posted from extension
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
