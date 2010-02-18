from lib.view_utils import render_response, render_string, HttpResponseRedirect
from django.core.urlresolvers import reverse

from procrasdonate.models import Log

def after_install(request, version):
    return _after(request, version, 'after_install')

def after_register(request, version):
    return _after(request, version, 'after_register')

def after_upgrade(request, version):
    return _after(request, version, 'after_upgrade')

def _after(request, version, template_name):
    try:
        features = render_string(request, 'procrasdonate/extension_pages/after_install_or_upgrade/%s.html' % version, locals())
    except:
        Log.Warn("Someone visited %s for unknown version %s" % (template_name, version), detail="version")
    return render_response(request, 'procrasdonate/extension_pages/after_install_or_upgrade/%s.html' % template_name, locals())

def adword_tests(request, adword_page):
    return render_response(request, 'procrasdonate/adwords/%s.html' % adword_page, locals())

def adword_download_page(request, group):
    group = group
    is_download_page = True
    return render_response(request, 'procrasdonate/adwords/download_page.html', locals())

def adword_done(request, group):
    return render_response(request, 'procrasdonate/adwords/done_page.html', locals())
