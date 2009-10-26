import settings
from lib.view_utils import render_response, HttpResponseRedirect
from lib.json_utils import json_response
from lib.forms import get_form, EDIT_TYPE
from procrasdonate.models import *

import urllib, urllib2
from django.utils import simplejson

from django.core.urlresolvers import reverse

from django.template import loader, Context
from django.contrib.auth.models import User as RecipientUser
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.auth.forms import SetPasswordForm
from django.contrib.auth.backends import ModelBackend

from django.db.models import Avg

#### COMMUNITY ###################################

def community(request):
    try:
        most_recent = RecipientVisit.objects.latest('dtime')
    except: # DoesNotExist
        most_recent = None
    
    most_donators = AggregateRecipient.max('total_donors')
    most_money = AggregateRecipient.max('total_amount')
    most_time = AggregateRecipient.max('total_time')
    staff_pick = StaffPick.get_random()
    tags = AggregateTag.objects.filter(time_type=Aggregate.TIME_TYPES['FOREVER'])
    return render_response(request, 'procrasdonate/community_pages/community_portal.html', locals())

def community_type(request, type):
    #tag = Tag.objects.get_or_none(tag=type)
    return render_response(request, 'procrasdonate/community_pages/community_rankings.html', locals())

#### PUBLIC RECIPIENT ###################################

def recipient(request, slug):
    print "RECIPIENT"
    recipient = Recipient.get_or_none(slug=slug)
    return render_response(request, 'procrasdonate/public_recipient_pages/recipient.html', locals())

#### ACCOUNT ###################################

def login_view(request):
    print "LOGIN"
    next = request.GET.get('next', None)
    # Light security check -- make sure redirect_to isn't garbage.                                                                                                                
    if not next or '//' in next or ' ' in next:
        next = reverse('edit_information')

    username = request.POST.get('username', None)
    password = request.POST.get('password', None)
    user = authenticate(username=username, password=password)
    error = None
    if user is not None:
        if user.is_active:
            login(request, user)
            if not user.get_profile():
                Log.Error("dynamic_webpages.login_view: django user (RecipientUser) has no get_profile (RecipientUserTagging): %s" % user)
                return HttpResponseRedirect(reverse('home'))
            return HttpResponseRedirect(next)
        else:
            error = "Your account has been disabled"
    else:
        error = "Invalid username or password."
    return render_response(request, 'procrasdonate/recipient_organizer_pages/account/login.html', locals())

def logout_view(request):
    print "LOGOUT"
    logout(request)
    return HttpResponseRedirect(reverse('community'))


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
                               from_email="clay@bilumi.org")
            
            request.user.message_set.create(message='RecipientUser successfully registered')
            return HttpResponseRedirect(reverse('home'))
    else:
        recipient_user_tagging_form = RecipientUserTaggingForm()
        recipient_user_form = RecipientUserForm()

    return render_response(request, 'procrasdonate/recipient_organizer_pages/account/register.html', locals())

def confirm(request, username, confirmation_code):
    logout(request)
    tagging = RecipientUserTagging.get_or_none(confirmation_code=confirmation_code)
    error = None
    if not tagging:
        error = "Unknown confirmation code"
        Log.Log(error)
    elif tagging.user.username != username:
        error = "Something unexpected happened while confirming your registration as an organizer for %s. Please send us an email with this message" % tagging.recipient.name
        Log.Error(error)
    elif tagging.is_confirmed:
        error = "Registration is already complete."
        Log.Log(error)
    elif not tagging.confirmable(confirmation_code):
        error = "Error confirming confirmation code %s" % confirmation_code
        Log.Log(error)
    else:
        if request.POST:
            form = SetPasswordForm(tagging.user, request.POST)
            if form.is_valid():
                form.save()
                
                success = tagging.confirm(confirmation_code)
                if not success:
                    return render_response(request, 'procrasdonate/recipient_organizer_pages/account/confirmation_error.html', locals())

                user = authenticate(username=username, password=form.cleaned_data['new_password1'])
                if user.is_active:
                    login(request, user)
                    user.message_set.create(message='Registration complete!')
                    return HttpResponseRedirect(reverse('edit_public_information'))                
                else:
                    return HttpResponseRedirect(reverse('login'))
        
    form = tagging and SetPasswordForm(tagging.user) or None
    instructions = """<p>Welcome, %s.</p><p>Please enter a password. You can enter whatever 
    you want; for security, consider using at least 8 characters and mixing numbers with 
    lower and uppercase letters.</p>""" % username
    return render_response(request, 'procrasdonate/recipient_organizer_pages/account/confirm.html', locals())

def reset_password(request):
    error = ""
    if request.POST:
        username_or_email = request.POST.get('username_or_email', None)
        if not username_or_email:
            error = "Please enter your username or email"
            return render_response(request, 'procrasdonate/recipient_organizer_pages/account/reset_password.html', locals())
        
        tagging = RecipientUserTagging.get_or_none(user__username=username_or_email)
        if not tagging:
            tagging = RecipientUserTagging.get_or_none(user__email=username_or_email)
            if not tagging:
                error = "No matching username or email found"
                return render_response(request, 'procrasdonate/recipient_organizer_pages/account/reset_password.html', locals())
        
        tagging.reset_password()
        # send email for recipient user to reset password
        c = Context({'user': tagging.user,
                     'recipient': tagging.recipient,
                     'site_url': "http://ProcrasDonate.com",
                     'confirmation_link': "%s" % (reverse('confirm_reset_password',
                                                          args=(tagging.user.username,
                                                                tagging.confirmation_code))),
                     'confirmation_code': tagging.confirmation_code,
                     'expiration_days': 14 })
        t = loader.get_template('procrasdonate/recipient_organizer_pages/account/reset_password_email.txt')
        tagging.send_email("Password reset for ProcrasDonate organizer for %s" % tagging.recipient.name,
                           t.render(c),
                           from_email="clay@bilumi.org")
        
        email_address = tagging.user.email
        return render_response(request, 'procrasdonate/recipient_organizer_pages/account/reset_password_email_sent.html', locals())

    return render_response(request, 'procrasdonate/recipient_organizer_pages/account/reset_password.html', locals())

def confirm_reset_password(request, username, confirmation_code):
    logout(request)
    tagging = RecipientUserTagging.get_or_none(user__username=username)
    error = None
    if not tagging:
        error = "Unknown username"
    #elif tagging.is_confirmed:
    #    error = "Registration is already complete."
    elif not tagging.confirm(confirmation_code):
        error = "Error confirming confirmation_code %s" % confirmation_code
    else:
        if request.POST:
            form = SetPasswordForm(tagging.user, request.POST)
            if form.is_valid():
                form.save()
                
                success = tagging.confirm(confirmation_code)
                if not success:
                    return render_response(request, 'procrasdonate/recipient_organizer_pages/account/confirmation_error.html', locals())

                user = authenticate(username=username, password=form.cleaned_data['new_password1'])
                if user.is_active:
                    login(request, user)
                    user.message_set.create(message='Password reset complete!')
                    return HttpResponseRedirect(reverse('edit_information'))                
                else:
                    return HttpResponseRedirect(reverse('login'))
        
    form = SetPasswordForm(tagging.user)
    instructions = """Enter a new password. It can be whatever you want, but it will
    be more secure if you use numbers and uppercase letters in addition to lowercase letters."""
    return render_response(request, 'procrasdonate/recipient_organizer_pages/account/confirm.html', locals())

#### RECIPIENT ORGANIZER ###################################

@login_required
def edit_public_information(request):
    recipient = Recipient.get_or_none(slug=request.user.get_profile().recipient.slug)
        
    FormKlass = get_form(Recipient, EDIT_TYPE, includes=('name',
                                                         'category',
                                                         'mission',
                                                         'description',
                                                         'url'))

    if request.POST:
        form = FormKlass(request.POST, instance=recipient)
        if form.is_valid():
            form.save()
            request.user.message_set.create(message='Changes saved')
            return HttpResponseRedirect(reverse('recipient', args=(recipient.slug,)))
    else:
        form = FormKlass(instance=recipient)

    return render_response(request, 'procrasdonate/recipient_organizer_pages/edit_public_information.html', locals())

@login_required
def edit_private_information(request):
    recipient = Recipient.get_or_none(slug=request.user.get_profile().recipient.slug)
        
    FormKlass = get_form(Recipient, EDIT_TYPE, includes=('employers_identification_number',
                                                         'tax_exempt_status',
                                                         'sponsoring_organization',
                                                         'contact_name',
                                                         'contact_email',
                                                         'office_phone',
                                                         'mailing_address',
                                                         'city',
                                                         'state',
                                                         'country'))

    if request.POST:
        form = FormKlass(request.POST, instance=recipient)
        if form.is_valid():
            form.save()
            request.user.message_set.create(message='Changes saved')
            return HttpResponseRedirect(reverse('recipient', args=(recipient.slug,)))
    else:
        form = FormKlass(instance=recipient)

    return render_response(request, 'procrasdonate/recipient_organizer_pages/edit_private_information.html', locals())


@login_required
def edit_media(request):
    recipient = Recipient.get_or_none(slug=request.user.get_profile().recipient.slug)
        
    FormKlass = get_form(Recipient, EDIT_TYPE, includes=('logo',
                                                         'promotional_image',
                                                         'promotional_video',
                                                         'pd_experience_video'))

    if request.POST:
        form = FormKlass(request.POST, instance=recipient)
        if form.is_valid():
            form.save()
            request.user.message_set.create(message='Changes saved')
            return HttpResponseRedirect(reverse('recipient', args=(recipient.slug,)))
    else:
        form = FormKlass(instance=recipient)

    return render_response(request, 'procrasdonate/recipient_organizer_pages/edit_media.html', locals())

def _edit_recipient_something(request, includes, template):
    """
    could use this but.... edit_foo's are likely to become more complicated with amazon auth and video stuff....
    """
    recipient = Recipient.get_or_none(slug=request.user.get_profile().recipient.slug)
        
    FormKlass = get_form(Recipient, EDIT_TYPE, includes=includes)

    if request.POST:
        form = FormKlass(request.POST, instance=recipient)
        if form.is_valid():
            form.save()
            request.user.message_set.create(message='Changes saved')
            return HttpResponseRedirect(reverse('recipient', args=(recipient.slug,)))
    else:
        form = FormKlass(instance=recipient)

    return render_response(request, template, locals())

    

@login_required
def edit_weekly_blurbs(request):
    recipient = Recipient.get_or_none(slug=request.user.get_profile().recipient.slug)
    return render_response(request, 'procrasdonate/recipient_organizer_pages/edit_weekly_blurbs.html', locals())

@login_required
def edit_thank_yous(request):
    recipient = Recipient.get_or_none(slug=request.user.get_profile().recipient.slug)
    return render_response(request, 'procrasdonate/recipient_organizer_pages/edit_thank_yous.html', locals())

@login_required
def edit_yearly_newsletter(request):
    recipient = Recipient.get_or_none(slug=request.user.get_profile().recipient.slug)
    return render_response(request, 'procrasdonate/recipient_organizer_pages/edit_yearly_newsletter.html', locals())

#### MISC ###################################

@user_passes_test(lambda u: u.is_superuser)
def recipient_votes(request):
    recipient_votes = RecipientVote.objects.all()
    return render_response(request, 'procrasdonate/admin/recipientvotes.html', locals())
