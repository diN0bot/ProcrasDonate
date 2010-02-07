import settings

from lib.view_utils import render_response, render_string, HttpResponseRedirect
from lib.json_utils import json_success, json_failure
from django.core.urlresolvers import reverse

from django.contrib.auth.decorators import user_passes_test

from procrasdonate.models import *
from adwords.models import *

def info(request):
    #return json_success({'hello':'world'})
    user_count = User.objects.count()
    visitor_count = Visitor.objects.count()
    pledge_count = TotalRecipient.objects.count() + TotalRecipientVote.objects.count() + TotalSiteGroup.objects.count()
    donation_count = RecipientPayment.objects.count()
    return render_response(request, 'procrasdocoder/data.html', locals())
