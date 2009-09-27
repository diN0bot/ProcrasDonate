from lib.view_utils import render_response, HttpResponseRedirect
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

def after_install(request, version):
    return render_response(request, 'procrasdonate/after_install/after_install_%s.html' % version, locals())

def after_upgrade(request, version):
    return render_response(request, 'procrasdonate/after_upgrade/after_upgrade_%s.html' % version, locals())
