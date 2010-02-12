import settings

from lib.view_utils import render_response, render_string, HttpResponseRedirect, extract_parameters
from lib.forms import get_form, EDIT_TYPE
from django.core.urlresolvers import reverse

from django.contrib.auth.decorators import user_passes_test

from rescuetime_interface.models import *
from procrasdonate.models import *
from procrasdonate.applib.fps import _switch_cases
from procrasdonate.applib.fps import *

import re

def signup(request):
    errors = []
    if request.POST:
        rescuetime_key = request.POST.get("rescuetime_key", "")
        #recipient_slug = request.POST.get("recipient_slug", "")
        #dollars_per_hr = request.POST.get("dollars_per_hr", "")
        if not rescuetime_key:
            errors.append("Please enter a RescueTime key")
            return render_response(request, 'rescuetime_interface/signup.html', locals())
        #if not recipient_slug:
        #    errors.append("Please select a charity to donate to")
        #    return render_response(request, 'rescuetime_interface/signup.html', locals())
        #if not dollars_per_hr:
        #    errors.append("Please enter how many dollars you will donate for every hour procrastinated")
        #    return render_response(request, 'rescuetime_interface/signup.html', locals())
        
        rt = RescueTimeUser.get_or_none(rescuetime_key=rescuetime_key)
        if not rt:
            rt = RescueTimeUser.add(rescuetime_key)
        
        return HttpResponseRedirect(reverse('rt_dashboard', args=(rt.rescuetime_key,)))
    
    return render_response(request, 'rescuetime_interface/signup.html', locals())

    """        
    FormKlass = get_form(RescueTimeUser, type=EDIT_TYPE, excludes=('user', ))
    if request.POST:
        form = FormKlass(request.POST)
        if form.is_valid():
            #form.save()
            rescuetime_key = form.cleaned_data['rescuetime_key']
            dollars_per_hr = form.cleaned_data['dollars_per_hr']
            recipient = form.cleaned_data['recipient']
            rt = RescueTimeUser.add(rescuetime_key, recipient, dollars_per_hr=dollars_per_hr)
            return HttpResponseRedirect(reverse('rt_dashboard', args=(rt.rescuetime_key,)))
    else:
        form = FormKlass()
    return render_response(request, 'rescuetime_interface/signup.html', locals())
    """

domain_re = re.compile("\.(com|edu|org|net|co|ly|tv|it|fm|us)")

def dashboard(request, rescuetime_key):
    rt = RescueTimeUser.get_or_none(rescuetime_key=rescuetime_key)
    if not rt:
        return HttpResponseRedirect(reverse('rt_signup'))

    data = rt.data({'rs': 'day', # 1 day of reports
                    'pv': 'rank', # perspective (rank, interval, member)
                    'restrict_begin': '2010-02-11',
                    'restrict_end': '2010-02-12'
                    })
    
    pledges = []
    for row in rt.procrastination_data()['rows']:
        if rt.row_amt(row) > 0.01:
            pledges.append({'amt': rt.row_amt(row),
                            'hrs': rt.row_hrs(row),
                            'name': rt.row_name(row),
                            'productivity': rt.row_productivity(row)})
        
    recipients = Recipient.objects.filter(fpsrecipient__status=FPSRecipient.STATUSES['SUCCESS']).exclude(slug="PD")
    return render_response(request, 'rescuetime_interface/dashboard.html', locals())


def authorize(request, rescuetime_key):
    if not settings.DJANGO_SERVER and not request.is_secure():
        message = "must secure data via HTTPS: request=%s" % request
        Log.Error(message, "request_error")
        return json_failure(message)
    
    rt = RescueTimeUser.get_or_none(rescuetime_key=rescuetime_key)
    if not rt:
        return HttpResponseRedirect(reverse('rt_signup'))

    lower_parameters = {"caller_reference": create_id(12),
                        "payment_reason": "ProcrasDonating for a good cause",
                        "payment_method": "ABT,ACH,CC",
                        "global_amount_limit": "100",
                        "recipient_slug_list": "all",
                        "version": settings.FPS['version']}
                           #"timestamp",

    # params for FPS REST request
    camel_parameters = _switch_cases(lower_parameters, to_lower=False)
    
    recipients = []
    if camel_parameters['recipient_slug_list'] == "all":
        allr = Recipient.objects.filter(fpsrecipient__status=FPSRecipient.STATUSES['SUCCESS'])
        print "ALLR", allr
        allr = allr.exclude(slug="PD")
        print "ALLR2", allr
    else:
        allr = Recipient.objects.filter(fpsrecipient__status=FPSRecipient.STATUSES['SUCCESS'])
        allr = allr.filter(slug__in=camel_parameters['recipient_slug_list'].split(','))
    
    print
    for recipient in allr:
        print "RECIPIENT", recipient
        recipients.append(recipient)

    recipient_token_list = ",".join( [recipient.fps_data.token_id for recipient in recipients] )
    if not recipient_token_list:
        Log.error("Empty recipient token list! %s" % request, "empty_recipient_token_list")
    del camel_parameters['recipient_slug_list']
    camel_parameters['recipientTokenList'] = recipient_token_list
    
    camel_parameters.update({#'RecipientCobranding': "true",
                           #'paymentMethod': 'CC,ACH,ABT',
                           # common CBUI parameters
                           'cobrandingUrl': settings.FPS['cobrandingUrl'],
                           'websiteDescription': settings.FPS['websiteDescription'],
                           'pipelineName': "MultiUse",
                           'returnURL': "%s%s" % (settings.DOMAIN,
                                                  reverse('rt_authorize_callback',
                                                          args=(rescuetime_key, camel_parameters['callerReference']))),
                                                          #kwargs={'caller_reference': parameters['callerReference']})),
                           'callerKey': settings.FPS['callerKey'],
                           })

    # add timestampe and signature
    finalize_parameters(camel_parameters, type=CBUI_TYPE)
    print "POST FINALIZE"
    for x in camel_parameters:
        print x,"=",camel_parameters[x]
    
    full_url = "%s?%s" % (AMAZON_CBUI_URL, urllib.urlencode(camel_parameters))
    print
    print "FULL_URL", full_url
    print
    
    multiuse = FPSMultiuseAuth.get_or_none(caller_reference=lower_parameters['caller_reference'])
    if not multiuse:
        multiuse = FPSMultiuseAuth.add(rt.user, lower_parameters)
    
    return HttpResponseRedirect(full_url)

def authorize_callback(request, rescuetime_key, caller_reference):
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

    return HttpResponseRedirect(reverse('rt_dashboard', args=(rescuetime_key, )))


#@user_passes_test(lambda u: u.is_superuser)
def debug(request, rescuetime_key):
    rt = RescueTimeUser.get_or_none(rescuetime_key=rescuetime_key)
    if not rt:
        return HttpResponseRedirect(reverse('rt_signup'))

    a = AnalyticApiKey(rt.rescuetime_key, "ProcrasDonate")
    s = Service()
    
    data = s.fetch_data(a, {'rs': 'day', # 1 day of reports
                            'pv': 'rank', # perspective (rank, interval, member)
                            'restrict_begin': '2010-02-11',
                            'restrict_end': '2010-02-12'
                            })
    
    dollars_per_hr = rt.dollars_per_hr
    recipient = rt.recipient
    
    websites = []
    for row in data['rows']:
        if domain_re.search(row[3]):
            secs = row[1]
            amt = secs / 3600.0 * dollars_per_hr
            websites.append({'amt': amt,
                             'hrs': secs / 3600.0,
                             'domain': row[3]})
    
    payments = []
    for row in data['rows']:
        if row[5] < 0:
            secs = row[1]
            amt = int(secs) / 3600.0 * dollars_per_hr
            payments.append({'amt': amt,
                             'hrs': int(secs) / 3600.0,
                             'domain': row[3]})
            
    return render_response(request, 'rescuetime_interface/dashboard.html', locals())


def edit_dollars_per_hr(request, rescuetime_key):
    rt = RescueTimeUser.get_or_none(rescuetime_key=rescuetime_key)
    if not rt:
        return HttpResponseRedirect(reverse('rt_signup'))
    
    if request.POST:
        dollars_per_hr = request.POST.get("dollars_per_hr", "").strip()
        try:
            dollars_per_hr = float(dollars_per_hr)
            rt.dollars_per_hr = dollars_per_hr
            rt.save()
        except:
            Log.Error("Problem saving dollars_per_hr: %s" % request, "rescuetime_interface")

    return HttpResponseRedirect(reverse('rt_dashboard', args=(rescuetime_key, )))

def choose_recipient(request, rescuetime_key, recipient_slug):
    rt = RescueTimeUser.get_or_none(rescuetime_key=rescuetime_key)
    if not rt:
        return HttpResponseRedirect(reverse('rt_signup'))
    
    recipient = Recipient.get_or_none(slug=recipient_slug)
    if not recipient:
        return HttpResponseRedirect(reverse('rt_dashboard', args=(rescuetime_key, )))
    
    rt.recipient = recipient
    rt.save()
    return HttpResponseRedirect(reverse('rt_dashboard', args=(rescuetime_key, )))
