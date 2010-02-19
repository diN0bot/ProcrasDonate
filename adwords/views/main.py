import settings

from lib.view_utils import render_response, render_string, HttpResponseRedirect
from django.core.urlresolvers import reverse

from django.contrib.auth.decorators import user_passes_test

from adwords.models import *

def adword_page(request, group):
    page = "landing"
    return render_response(request, 'adwords/landing_pages/%s.html' % group, locals())

def adword_click(request, page, group):
    return render_response(request, 'adwords/click_to_page_base.html', locals())

def adword_done(request, page, group):
    return render_response(request, 'adwords/done_page.html', locals())

def adword_email_form(request, page, group):
    if request.POST:
        email = request.POST.get('email', None)

        if email:
            email = email.strip()
            visitor = Visitor.add(group, page, email)
            
            try:
                # send email for recipient user to reset password
                txt = render_string(request, 'adwords/email.txt', {'email': email,
                                                                   'settings': settings,
                                                                   'visitor': visitor,
                                                                   'group': group,
                                                                   'page': page})
                visitor.send_email("Welcome to ProcrasDonate",
                                   txt,
                                   from_email=settings.EMAIL)
                return HttpResponseRedirect(reverse('adword_done', args=(page, group)))
            except:
                Log.Error("Adword visitor::Problem sending thank you email to %s for %s \
                    (maybe email address does not exist?)" % (email, visitor), "adword")
                return HttpResponseRedirect(reverse('adword_done', args=(page, group)))



@user_passes_test(lambda u: u.is_superuser)
def dashboard(request):
    # table = rows of groups, with columns the total no. of emails registered per page
    table = []
    click_tos = Visitor.objects.all().values_list('email_page', flat=True).order_by().distinct()
    
    # construct header row
    header_row = ["Landing Page", "Total"]
    for click_to in click_tos:
        header_row.append(click_to)
    table.append(header_row)

    # construct rest of rows
    groups = Visitor.objects.all().values_list('page_group', flat=True).order_by().distinct()
    for group in groups:
        row = [group, Visitor.objects.filter(page_group=group).count()]
        for click_to in click_tos:
            row.append(Visitor.objects.filter(email_page=click_to, page_group=group).count())
        table.append(row)
        
    return render_response(request, 'adwords/dashboard.html', locals())

