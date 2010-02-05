import settings

from lib.view_utils import render_response, render_string, HttpResponseRedirect
from lib.json_utils import json_success, json_failure
from django.core.urlresolvers import reverse

from django.contrib.auth.decorators import user_passes_test

from procrasdonate.models import KeyValue

def set_ring_ip(request, ip):
    KeyValue.increment('ring_ip', ip)
    return json_success()
