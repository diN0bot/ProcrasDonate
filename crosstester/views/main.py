import settings
from lib.view_utils import render_string, render_response, HttpResponseRedirect, extract_parameters
from lib.json_utils import json_success, json_failure
from crosstester.models import *

import datetime

import urllib, urllib2
from django.utils import simplejson

from django.core.urlresolvers import reverse

from django.shortcuts import get_object_or_404

from django.template import loader, Context
from django.contrib.auth.models import User as RecipientUser
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.auth.forms import SetPasswordForm
from django.contrib.auth.backends import ModelBackend

from django.db.models import Avg


@user_passes_test(lambda u: u.is_superuser)
def dashboard(request):
    test_types = TestType.objects.all()
    num_dates = 7
    dates = []
    d = datetime.datetime.now()
    for i in range(0,num_dates):
        dates.append(d - datetime.timedelta(len(dates)))
    return render_response(request, 'crosstester/dashboard.html', locals())

def report_testrun(request):
    expected_parameters = ["test_type",
                           "dtime"]
    optional_parameters = ["is_pass",
                           "number_fail",
                           "total",
                           "duration"]

    response = extract_parameters(request, "GET", expected_parameters, optional_parameters)
    if not response['success']:
        return json_failure("Something went wrong extracting parameters: %s" % response['reason'])
    response = response['parameters']
    
    dtime = datetime.datetime.strptime(response['dtime'], "%Y_%m_%d_%H_%M_%S")
    is_pass = 'is_pass' in response and response['is_pass'] or None
    is_pass = (is_pass == "True") and True or False
    number_fail = 'number_fail' in response and response['number_fail'] or None
    total = 'total' in response and response['total'] or None
    duration = 'duration' in response and response['duration'] or None
    TestRun.add(response['test_type'],
                dtime,
                is_pass,
                number_fail,
                total,
                duration)
    return json_success()
