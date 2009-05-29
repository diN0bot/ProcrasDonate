from lib.view_utils import render_response, HttpResponseRedirect
from lib.json_utils import json_response
from procrasdonate.models import *

import urllib, urllib2
from django.utils import simplejson

from django.core.urlresolvers import reverse

def main(request):
    return HttpResponseRedirect(reverse('home'))

def start_now(request):
    return render_response(request, 'procrasdonate/settings.html', locals())

def settings(request):
    return render_response(request, 'procrasdonate/settings.html', locals())


"""
As long as templates extend 'twitter/base.html', then views must define three variables:
    app_name = 'procrasdonate'
    app_page = 'LearnMore'
    page_name = 'Learn More'

app_name should always be 'procrasdonate'

app_page defines the menu item under which the page falls. It should be one of:
   [LearnMore, StartNow(->Settings), MyImpact, OurCommunity]
(feedback gets added automatically by the twitter templatetag)

page_name is what gets displayed in the menu and can be anything
"""

def home(request):
    return render_response(request, 'procrasdonate/home.html', locals())

def learn_more(request):
    return render_response(request, 'procrasdonate/learn_more.html', locals())

def privacy_guarantee(request):
    return render_response(request, 'procrasdonate/privacy_guarantee.html', locals())

def my_impact(request):
    return render_response(request, 'procrasdonate/my_impact.html', locals())

def data(request):
    """
    handles post data from extension
    """
    if not request.POST:
        return json_response({'result':'failure', 'reason':'must *POST* site, time_spent, amt and recipient (time is optional)'})
    
    site = request.POST.get('site','')
    time_spent = request.POST.get('time_spent','')
    amt = request.POST.get('amt','')
    recipient = request.POST.get('recipient','')
    print site, time_spent, amt, recipient, request.POST
    
    if not site or not time_spent or not amt or not recipient:
        return json_response({'result':'failure', 'reason':'must POST *site, time, amt and recipient* (time is optional)'})
    # seconds since the epoch
    time = request.POST.get('time',None)
    try:
        time_spent = int(time_spent)
        if time:
            time = int(time)
        amt = float(amt)
    except ValueError:
        return json_response({'result':'failure', 'reason':'must POST site, time_spent (*int*, seconds), amt (*float*, cents) and recipient (time (*int*, seconds since epoch) is optional)'})
    
    record_payment(site, time_spent, amt, recipient, time)
    return json_response({'result':'success'})

def recipients(request):
    return render_response(request, 'procrasdonate/recipients.html', locals())

def my_impact(request):
    return render_response(request, 'procrasdonate/my_impact.html', locals())

def _POST(url, values):
    """
    POSTs values to url. Returns whatever url returns
    """
    data = urllib.urlencode(values)
    req = urllib2.Request(url, data)
    response = urllib2.urlopen(req).read()
    return simplejson.loads(response)

def community(request):
    #text = u"p 5\u00A2 @diN0bot from python"
    #text = urllib.quote(text.encode('utf8'), safe='~') 
    #values = {'twitter_username': 'diN0bot',
    #          'twitter_password': 'pea15nut',
    #          'text': text }
    #url = "http://tipjoy.com/api/tweetpayment/"
    #print _POST(url, values)
    
    return render_response(request, 'procrasdonate/our_community.html', locals())

def community_recipients(request):
    recipients = Recipient.objects.all().order_by('total_time')
    return render_response(request, 'procrasdonate/our_community_recipients.html', locals())

def community_sites(request):
    sites = Site.objects.all().order_by('total_time')
    return render_response(request, 'procrasdonate/our_community_sites.html', locals())

def community_procrasdonations(request):
    procrasdonations = ProcrasDonation.objects.all().order_by('time')
    return render_response(request, 'procrasdonate/our_community_procrasdonations.html', locals())
