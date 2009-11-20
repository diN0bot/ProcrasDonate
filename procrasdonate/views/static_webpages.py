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
