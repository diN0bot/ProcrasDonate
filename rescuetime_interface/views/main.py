import settings

from lib.view_utils import render_response, render_string, HttpResponseRedirect
from lib.forms import get_form, EDIT_TYPE
from django.core.urlresolvers import reverse

from django.contrib.auth.decorators import user_passes_test

from rescuetime.api.access.AnalyticApiKey import AnalyticApiKey
from rescuetime.api.service.Service import Service

from rescuetime_interface.models import *

import re

def signup(request):
    print "all rt's"
    for rt in RescueTimeUser.objects.all():
            print "rt - ", rt.rescuetime_key
            print "--->", RescueTimeUser.get_or_none(rescuetime_key=rt.rescuetime_key)
            
            
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

domain_re = re.compile("\.(com|edu|org|net|co|ly|tv|it|fm|us)")

def dashboard(request, rescuetime_key):
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
    
    payments = []
    for row in data['rows']:
        if row[5] < 0:
            secs = row[1]
            amt = int(secs) / 3600.0 * dollars_per_hr
            payments.append({'amt': amt,
                             'hrs': int(secs) / 3600.0,
                             'domain': row[3]})
    
    return render_response(request, 'rescuetime_interface/dashboard.html', locals())

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
