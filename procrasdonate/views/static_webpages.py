from lib.view_utils import render_response, HttpResponseRedirect
from django.core.urlresolvers import reverse

def after_install(request, version):
    return render_response(request, 'procrasdonate/extension_pages/after_install_or_upgrade/after_install_%s.html' % version, locals())

def after_upgrade(request, version):
    return render_response(request, 'procrasdonate/extension_pages/after_install_or_upgrade/after_upgrade_%s.html' % version, locals())
