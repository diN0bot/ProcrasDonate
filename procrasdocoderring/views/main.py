import settings

from lib.view_utils import render_response, render_string, HttpResponseRedirect
from lib.json_utils import json_success, json_failure
from django.core.urlresolvers import reverse

from django.contrib.auth.decorators import user_passes_test

def info(request):
    return json_success({'hello':'world'})
