from lib.view_utils import render_response, HttpResponseRedirect
from lib.json_utils import json_response
from procrasdonate.models import *

from procrasdonate.processors import *

import urllib, urllib2
from django.utils import simplejson

from django.core.urlresolvers import reverse

def community(request):
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
