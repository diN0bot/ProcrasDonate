import settings

from lib.view_utils import render_response, render_string, HttpResponseRedirect
from django.core.urlresolvers import reverse

from django.template import loader, Context
from django.contrib.auth.models import User as RecipientUser
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.auth.forms import SetPasswordForm
from django.contrib.auth.backends import ModelBackend

from weddings.models import *

#### ACCOUNT ###################################

def login_view(request):
    next = request.GET.get('next', None)
    # Light security check -- make sure redirect_to isn't garbage.                                                                                                                
    if not next or '//' in next or ' ' in next:
        next = reverse('weddings_settings')

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
    logout(request)
    return HttpResponseRedirect(reverse('home'))

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
                    return HttpResponseRedirect(reverse('recipient_organizer_dashboard'))                
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

        if not tagging.user.email:
            error = "User has no email address."
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
        email_address = tagging.user.email
        try:
            tagging.send_email("Password reset for ProcrasDonate organizer for %s" % tagging.recipient.name,
                               t.render(c),
                               from_email=settings.EMAIL)
        except:
            error = "Problem sending email to %s." % email_address
            return render_response(request, 'procrasdonate/recipient_organizer_pages/account/reset_password.html', locals())
        
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
                    return HttpResponseRedirect(reverse('recipient_organizer_dashboard'))                
                else:
                    return HttpResponseRedirect(reverse('login'))
        
    form = SetPasswordForm(tagging.user)
    instructions = """Enter a new password. It can be whatever you want, but it will
    be more secure if you use numbers and uppercase letters in addition to lowercase letters."""
    return render_response(request, 'procrasdonate/recipient_organizer_pages/account/confirm.html', locals())
