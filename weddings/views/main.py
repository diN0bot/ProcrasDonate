import settings

from lib.view_utils import render_response, render_string, HttpResponseRedirect
from django.core.urlresolvers import reverse

from django.contrib.auth.decorators import user_passes_test

from weddings.models import *

def main(request, slug):
    wedding = Wedding.get_or_404(slug=slug)
    return render_response(request, 'weddings/landing.html', locals())

def do_donation(request, slug, donation_type):
    return render_response(request, 'weddings/landing.html', locals())

def thankyou(request, slug, donation_type):
    return render_response(request, 'weddings/landing.html', locals())

def settings(request, code):
    wedding = Wedding.get_or_404(code=code)
    selected = wedding.donees()
    
    not_selected = []
    for r in Recipient.objects.all():
        if not r in selected:
            not_selected.append(r)
            
    for r in RecipientVote.objects.all():
        if not r in selected:
            not_selected.append(r)
     
    return render_response(request, 'weddings/settings.html', locals())

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
