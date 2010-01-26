from lib.view_utils import render_response, HttpResponseRedirect, extract_parameters
from lib.json_utils import json_success, json_failure
from lib import html_emailer
from procrasdonate.applib.xpi_builder import XpiBuilder
from procrasdonate.models import *

from procrasdonate.processors import *

import urllib, urllib2
from django.utils import simplejson as json

from django.core.urlresolvers import reverse
from django.template import loader, Context

import settings
from settings import pathify, path, PROJECT_PATH, MEDIA_ROOT

def _POST(url, values):
    """
    POSTs values to url. Returns whatever url returns
    """
    data = urllib.urlencode(values)
    req = urllib2.Request(url, data)
    response = urllib2.urlopen(req).read()
    return json.loads(response)

"""
OLD :::

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

def send_email(request, type):
    expected_parameters = ["private_key",
                           "prefs"]
    response = extract_parameters(request, "POST", expected_parameters)
    if not response['success']:
        message = "dataflow.send_email %s Failed to extract expected parameters %s from %s" % (type,
                                                                                               expected_parameters,
                                                                                               request.POST)
        Log.Error(message, "DATA_FROM_EXTN")
        return json_failure(message)
    parameters = response['parameters']
    prefs = parameters['prefs'][0]
    
    user = User.get_or_none(private_key=parameters['private_key'])
    if not user:
        message = "unknown user: %s, request=%s" % (parameters['private_key'], request)
        Log.Error(message, "unknown_user")
        return json_failure(message)
    
    if not 'email' in prefs:
        if not user.email:
            message = "dataflow.send_email %s: prefs does not include email, and user email is unknown. private key = %s, user = %s" % (type, parameters['private_key'], user)
            Log.Error(message, "DATA_FROM_EXTN")
            return json_failure(message)
        else:
            email = user.email.email
    else:
        email = prefs['email']
        user.email = Email.get_or_create(email)
        user.save()

    if type == "first":
        txt_t = "procrasdonate/emails/after_download_email.txt"
        #html_t = "procrasdonate/emails/after_download_email.txt"
        subject = "Welcome to ProcrasDonate!"
    elif type == "stalling_registration":
        txt_t = "procrasdonate/emails/stalling_amazon_email.txt"
        #html_t = "procrasdonate/emails/stalling_amazon_email.txt"
        subject = "ProcrasDonate registration almost complete!"
    elif type == "completed_registration":
        txt_t = "procrasdonate/emails/completed_amazon_email.txt"
        #html_t = "procrasdonate/emails/completed_amazon_email.txt"
        subject = "ProcrasDonate registration completed"
    else:
        return json_failure("Unknown email type. Please use one of 'first', 'stalling_registration', 'completed_registration'")
    
    c = Context({ 'name': user.name or email, 'settings': settings })
    #txt_email = loader.get_template(txt_t)
    #html_email = loader.get_template(html_t)
    try:
        txt_email = loader.get_template(txt_t)
        message = txt_email.render(c)
        user.email.send_email(subject, message, from_email=settings.EMAIL)
        """
        html_emailer.send_email(sender=settings.EMAIL,
                                recipient=email,
                                subject=subject,
                                text=txt_email.render(c),
                                html=html_email.render(c))
        """
        return json_success()
    except:
        msg = "send_email %s::Problem sending email to %s (does email address exist?)" % (type, email)
        Log.Error(msg, "email")
        return json_failure(msg)

def receive_data(request):
    """
    handles totals, logs, userstudies, payments, requirepayments, reports, prefs posted from extension
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
    
    datatypes = ["totals", "logs", "userstudies", "payments", "requirespayments", "reports", "prefs"]
    processor_fnc = {'totals'          : Processor.process_total,
                     'logs'            : Processor.process_log,
                     'userstudies'     : Processor.process_userstudy,
                     'payments'        : Processor.process_payment,
                     'requirespayments': Processor.process_requirespayment,
                     'reports'         : Processor.process_report,
                     'prefs'           : Processor.process_prefs}
    
    expected_parameters = ["private_key"]
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
        
    processed_count = 0
    for datatype in datatypes:
        if datatype in parameters:
            items = json.loads(parameters[datatype])
            print "---- %s %s -------" % (len(items), datatype)
            #if datatype == "prefs":
            #    print json.dumps(items, indent=2)
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
    f = open('/var/sites/ProcrasDonate/t.log', 'a')
    f.write("\n\n -------------------------------- %s" % datetime.datetime.now())
    has_success = False
    for multiuse_auth in FPSMultiuseAuth.objects.filter(user=user):
        f.write("\nmultiuse_auth: %s" % multiuse_auth)
        multiuse_auths.append(multiuse_auth.deep_dict())
        if multiuse_auth.good_to_go():
            has_success = True
    f.write("\n\n multiuse_auths = %s" % multiuse_auths)
    f.close()
    
    if not has_success:
        pass
        #@TODO if not has_success, then ask Amazon for token in case pipeline completed by didn't make it back to server yet.
    
    multiuse_pays = []
    for multiuse_pay in FPSMultiusePay.objects.filter(user=user):
        multiuse_pays.append(multiuse_pay.deep_dict())
            
    meta_reports = []
    for meta_report in MetaReport.objects.filter(is_draft=False):
       meta_reports.append(meta_report.deep_dict())
            
    #print '#.'*30;
    #print "RETURN DATA RETURNED"
    #print json.dumps({'recipients': recipients,
    #                     'multiuse_auths': multiuse_auths}, indent=2)
    #print '#.'*30;
    
    xpi_builder = XpiBuilder(pathify([PROJECT_PATH, 'procrasdonate', 'ProcrasDonateFFExtn'], file_extension=True),
                             "%s%s" % (MEDIA_ROOT, 'xpi'),
                             "%s%s" % (MEDIA_ROOT, 'rdf'))
    info = xpi_builder.get_update_info()
    return json_success({'recipients': recipients,
                         'multiuse_auths': multiuse_auths,
                         'multiuse_pays': multiuse_pays,
                         'meta_reports': meta_reports,
                         'latest_update_version': xpi_builder.get_update_version(),
                         'update_link': info['update_link'],
                         'update_hash': info['update_hash']})

def generate_xpi(request, slug):
    if not hasattr(settings, "MAX_USERS") or User.objects.count() < settings.MAX_USERS:
        recipient = slug != '__none__' and Recipient.get_or_none(slug=slug) or None
        xpi_builder = XpiBuilder(pathify([PROJECT_PATH, 'procrasdonate', 'ProcrasDonateFFExtn'], file_extension=True),
                                 "%s%s" % (MEDIA_ROOT, 'xpi'),
                                 "%s%s" % (MEDIA_ROOT, 'rdf'),
                                 recipient)
        
        private_key = xpi_builder.write_input_json(is_update=False)
        user = User.add(private_key)
        Log.Log("Built XPI for download", detail="usage", user=user)
        
        (xpi_url, xpi_hash) = xpi_builder.build_xpi(is_update=False)
        return json_success({'xpi_url': xpi_url,
                             'xpi_hash': xpi_hash,
                             'wait_list': False,
                             'wait_list_url': reverse('waitlist') })
    else:
        return json_success({'xpi_url': None,
                             'xpi_hash': None,
                             'wait_list': True,
                             'wait_list_url': reverse('waitlist') })

def waitlist(request):
    email = request.GET and request.GET.get('email', '') or ''
    is_added = request.GET and request.GET.get('is_added', '') or ''
    is_removed = request.GET and request.GET.get('is_removed', '') or ''
    email = request.POST and request.POST.get('email', email) or email
    is_added = request.POST and request.POST.get('is_added', is_added) or is_added
    is_removed = request.POST and request.POST.get('is_removed', is_removed) or is_removed
    group = request.GET and request.GET.get('group', 'default') or 'default'
    print group
    return render_response(request, 'procrasdonate/wait_list/waitlist.html', locals())

def add_to_waitlist(request, group):
    if request.POST:
        expected_parameters = ["email"]
        optional_parameters = ["note"]

        response = extract_parameters(request, "POST", expected_parameters, optional_parameters)
        if not response['success']:
            Log.Error("add_to_waitlist::Something went wrong extracting parameters (no email?): %s for %s" % (response['reason'], request.GET), "waitlist")
            return HttpResponseRedirect(reverse('waitlist'))
            #return json_failure("oops")
        
        parameters = response['parameters']
        note = 'note' in parameters and parameters['note'] or None
        
        w = WaitList.get_or_none(email__email=parameters['email'])
        if not w:
            w = WaitList.add(parameters['email'], group, note)
        else:
            Log.Log("Same email address added to waitlist. Note and group NOT updated from waitlist, %s. New note: %s, new group: %s" % (w, note, group), "waitlist_duplicate")
        
        # send email for recipient user to reset password
        c = Context({'waiter': w,
                     'remove_link': reverse('remove_from_waitlist', args=(w.remove_key,)),
                     'settings': settings})
        txt_email = loader.get_template('procrasdonate/wait_list/added_to_waitlist_email.txt')
        html_email = loader.get_template('procrasdonate/wait_list/added_to_waitlist_email.html')
        """
        html_emailer.send_email(sender=settings.EMAIL,
                                    recipient=w.email.email,
                                    subject="Welcome ProcrasDonate Beta Tester",
                                    text=txt_email.render(c),
                                    html=html_email.render(c))
        """
        try:
            html_emailer.send_email(sender=settings.EMAIL,
                                    recipient=w.email.email,
                                    subject="Welcome ProcrasDonate Beta Tester",
                                    text=txt_email.render(c),
                                    html=html_email.render(c))
            return HttpResponseRedirect("%s?email=%s&is_added=True" % (reverse('waitlist'),
                                                                       w.email.email))
            #return json_success()
        except:
            Log.Error("add_to_waitlist::Problem sending added-to-waitlist email to %s (does email address exist?)" % w, "waitlist")
            #return HttpResponseRedirect(reverse('waitlist'))
            return HttpResponseRedirect("%s?email=%s&is_added=True" % (reverse('waitlist'),
                                                                       w.email.email))
            #return json_failure("oops")

def remove_from_waitlist(request, remove_key):
    w = WaitList.get_or_none(remove_key=remove_key)
    if w:
        Log.Log("Remove from waitlist: %s" % w, "waitlist_remove")
        w.delete()
        return HttpResponseRedirect("%s?email=%s&is_removed=True" % (reverse('waitlist'),
                                                                     w.email.email))
    return HttpResponseRedirect("%s?email=%s" % (reverse('waitlist'),
                                                 w and w.email.email or ''))

def remove_from_waitlist_form(request):
    email = request.POST and request.POST.get('remove_email', '') or ''
    w = WaitList.get_or_none(email__email=email)
    if w:
        Log.Log("Remove from waitlist: %s" % w, "waitlist_remove")
        w.delete()
        return HttpResponseRedirect("%s?email=%s&is_removed=True" % (reverse('waitlist'),
                                                                     w.email.email))
    return HttpResponseRedirect("%s?email=%s" % (reverse('waitlist'),
                                                 email))


def adword_email_form(request):
    if request.POST:
        email = request.POST.get('email', None)
        group = request.POST.get('group', None)
        is_download_page = request.POST.get('is_download_page', None)
        wgroup = is_download_page and "download_%s" % group or group
        
        w = WaitList.get_or_none(email__email=email)
        if not w:
            w = WaitList.add(email, wgroup)
        else:
            Log.Log("Same email address added to waitlist. Group NOT updated from waitlist, %s. New group: %s" % (w, wgroup), "waitlist_duplicate")
        
        # send email for recipient user to reset password
        c = Context({'waiter': w,
                     'group': group,
                     'settings': settings})
        
        txt_email = loader.get_template('procrasdonate/adwords/email.txt')
        try:
            w.email.send_email("Welcome ProcrasDonate Beta Tester",
                               txt_email.render(c),
                               from_email=settings.EMAIL)
            return HttpResponseRedirect(reverse('adword_done', args=(group,)))
        except:
            Log.Error("add_to_waitlist::Problem sending added-to-waitlist email to %s (does email address exist?)" % w, "waitlist")
            #return HttpResponseRedirect(reverse('waitlist'))
            return HttpResponseRedirect("%s?email=%s&is_added=True" % (reverse('waitlist'),
                                                                       w.email.email))

