from lib.view_utils import render_response, render_string, HttpResponseRedirect
from django.core.urlresolvers import reverse

from procrasdonate.models import Log

def after_install(request, version):
    try:
        features = render_string(request, 'procrasdonate/extension_pages/after_install_or_upgrade/%s.html' % version, locals())
    except:
        Log.Warn("Someone visited after_install for unknown version %s" % version, detail="version")
    return render_response(request, 'procrasdonate/extension_pages/after_install_or_upgrade/after_install.html', locals())

def after_upgrade(request, version):
    try:
        features = render_string(request, 'procrasdonate/extension_pages/after_install_or_upgrade/%s.html' % version, locals())
    except:
        Log.Warn("Someone visited after_install for unknown version %s" % version, detail="version")
    return render_response(request, 'procrasdonate/extension_pages/after_install_or_upgrade/after_upgrade.html', locals())

    
def adword_tests(request, adword_page):
    return render_response(request, 'procrasdonate/adwords/%s.html' % adword_page, locals())

def adword_download_page(request, group):
    group = group
    is_download_page = True
    return render_response(request, 'procrasdonate/adwords/download_page.html', locals())

def adword_done(request, group):
    return render_response(request, 'procrasdonate/adwords/done_page.html', locals())
