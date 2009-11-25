import settings
from lib.view_utils import render_response, HttpResponseRedirect, HttpResponseNotFound
from lib.json_utils import json_response
from lib.forms import get_form, EDIT_TYPE
from procrasdonate.models import *

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
    return render_response(request, 'procrasdonate/superuser/dashboard.html', locals())

@user_passes_test(lambda u: u.is_superuser)
def users(request):
    users = User.objects.all()
    return render_response(request, 'procrasdonate/superuser/users.html', locals())

@user_passes_test(lambda u: u.is_superuser)
def user(request, private_key):
    user = User.get_or_none(private_key=private_key)
    return render_response(request, 'procrasdonate/superuser/user.html', locals())

@user_passes_test(lambda u: u.is_superuser)
def register_organizer(request):
    RecipientUserTaggingForm = get_form(RecipientUserTagging, EDIT_TYPE, excludes=('user',
                                                                                   'is_confirmed',
                                                                                   'confirmation_code'))
    RecipientUserForm = get_form(RecipientUser, EDIT_TYPE, includes=('username',
                                                                     'first_name',
                                                                     'last_name',
                                                                     'email'))
    recipients = Recipient.objects.all()

    if request.POST:
        recipient_user_tagging_form = RecipientUserTaggingForm(request.POST)
        recipient_user_form = RecipientUserForm(request.POST)
        
        if recipient_user_tagging_form.is_valid() and recipient_user_form.is_valid():
            user = recipient_user_form.save()
            user.set_unusable_password()
            user.is_active = False
            user.save()
            
            fake_tagging = recipient_user_tagging_form.save(commit=False)
            tagging = RecipientUserTagging.add(user, fake_tagging.recipient, require_confirmation=True) 
            del fake_tagging

            # send email for recipient user to login
            c = Context({'user': user,
                         'recipient': tagging.recipient,
                         'site_url': "http://ProcrasDonate.com",
                         'confirmation_link': "%s" % (reverse('confirm',
                                                              args=(user.username,
                                                                    tagging.confirmation_code))),
                         'confirmation_code': tagging.confirmation_code,
                         'expiration_days': 14 })
            t = loader.get_template('procrasdonate/recipient_organizer_pages/account/confirmation_email.txt')
            tagging.send_email("Welcome to ProcrasDonate! Please complete registration for %s" % tagging.recipient.name,
                               t.render(c),
                               from_email="procrasdonate@bilumi.org")
            
            request.user.message_set.create(message='RecipientUser successfully registered')
            return HttpResponseRedirect(reverse('home'))
    else:
        recipient_user_tagging_form = RecipientUserTaggingForm()
        recipient_user_form = RecipientUserForm()

    return render_response(request, 'procrasdonate/recipient_organizer_pages/account/register.html', locals())

@user_passes_test(lambda u: u.is_superuser)
def recipient_votes(request):
    recipient_votes = RecipientVote.objects.all()
    recipients = Recipient.objects.all()
    return render_response(request, 'procrasdonate/superuser/recipientvotes.html', locals())

@user_passes_test(lambda u: u.is_superuser)
def link_vote(request, vote_id, recipient_slug):
    rvote = RecipientVote.get_or_none(id=vote_id)
    if rvote:
        if recipient_slug == "None":
            recipient = None
            message = "Successfully unlinked vote %s" % rvote.name
        else:
            recipient = Recipient.get_or_none(slug=recipient_slug)
            message = "Successfully linked vote %s to recipient %s" % (rvote.name, recipient.name)
        rvote.recipient = recipient
        rvote.save()
        request.user.message_set.create(message=message)
    else:
        request.user.message_set.create(message='Error: could not find recipient vote %s' % vote_id)
    return HttpResponseRedirect(reverse('recipient_votes'))
