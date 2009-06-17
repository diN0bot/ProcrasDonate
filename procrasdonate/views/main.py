from lib.view_utils import render_response, HttpResponseRedirect
from lib.json_utils import json_response
from procrasdonate.models import *

import urllib, urllib2
from django.utils import simplejson

from django.core.urlresolvers import reverse

def main(request):
    return HttpResponseRedirect(reverse('home'))

def register(request):
    return render_response(request, 'procrasdonate/settings.html', locals())

def settings(request):
    return render_response(request, 'procrasdonate/settings.html', locals())

def home(request):
    return render_response(request, 'procrasdonate/home.html', locals())

def home_noextn(request):
    return render_response(request, 'procrasdonate/home.html', locals())

def learn_more(request):
    return render_response(request, 'procrasdonate/learn_more.html', locals())

def privacy_guarantee(request):
    return render_response(request, 'procrasdonate/privacy_guarantee.html', locals())

def my_impact(request):
    return render_response(request, 'procrasdonate/my_impact.html', locals())

def recipients(request):
    return render_response(request, 'procrasdonate/recipients.html', locals())

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


def rebuild_extension_templates(request):
    import subprocess
    import settings
    bin = "%s/procrasdonate/ff_extn/ProcrasDonate/content/bin" % settings.PROJECT_PATH
    generated_templates_dir = "%s/procrasdonate/ff_extn/ProcrasDonate/content/templates" % settings.PROJECT_PATH
    all_dir = "%s/procrasdonate/ff_extn/ProcrasDonate/content/js/templates" % settings.PROJECT_PATH
    
    if not "clay" in settings.PROJECT_PATH:
        subprocess.Popen(["python", "%s/build_templates.py" % bin, "%s/*.html" % generated_templates_dir])
    subprocess.Popen(["cp", "%s/all.js" % all_dir, "%s/all.js.bkup" % all_dir])
    import os
    os.system("cat %s/*.js > %s/all.js" % (generated_templates_dir, all_dir))
    return json_response([ "SUCCESS" ])


def email(request):
    if not request.POST:
        return json_response({'result':'failure', 'reason':'must *POST* email address'})
    
    email_address = request.POST.get('email_address','')
    email = Email.add(email_address)
    
    #@todo send welcome email...if new address? or always
    
    return json_response({'result':'success'})

def totals(request):
    """
    handles totals posted from extension
    """
    if not request.POST:
        return json_response({'result':'failure', 'reason':'must *POST* data'})
    
    data = simplejson.loads(request.POST.get('data',''))
    print "TOTALS from ", data['hash']
    
    user = User.get_or_create(data['hash'])

    for total in data['totals']
        if 'recipient' in total:
            
            
        elif 'sitegroup' in total:
        
        elif 'site' in total:
            
        elif 'tag' in total:
            
        else:
            pass
    
    return json_response({'result':'success'})

def payments(request):
    pass