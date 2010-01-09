from __future__ import division

import settings
from lib.view_utils import render_response, HttpResponseRedirect, HttpResponseNotFound
from lib.json_utils import json_response
from lib.forms import get_form, EDIT_TYPE
from procrasdonate.models import *

import urllib, urllib2
from django.utils import simplejson as json

from django.core.urlresolvers import reverse

from django.shortcuts import get_object_or_404

from django.template import loader, Context
from django.contrib.auth.models import User as RecipientUser
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.auth.forms import SetPasswordForm
from django.contrib.auth.backends import ModelBackend

from procrasdonate.applib.xpi_builder import XpiBuilder

from django.db.models import Avg
from ext import feedparser

#### HOME ###################################

def recipient_splash(request, slug=None):
    big_video = "%sswf/LaptopIntro.swf" % settings.MEDIA_URL
    blog_posts = feedparser.parse("http://procrastinateless.wordpress.com/feed/")
    pd = Recipient.get_or_none(slug="PD")
    bilumi = Recipient.get_or_none(slug="bilumi")
    charities = Recipient.objects.filter(is_visible=True)
    special = Recipient.get_or_none(slug=slug)
    
    analytics = _get_analytics_data()
    analytics.update(locals())
    return render_response(request, 'procrasdonate/home.html', analytics)

def home(request):
    return recipient_splash(request)

#### COMMUNITY ###################################

def _get_analytics_data():
    pd = Tag.get_or_none(tag="ProcrasDonate")
    tws = Tag.get_or_none(tag="TimeWellSpent")
    u = Tag.get_or_none(tag="Unsorted")
    
    pd_total_pledged = TotalTag.get_or_none(tag=pd, period__type=Period.TYPES["FOREVER"])
    tws_total_pledged = TotalTag.get_or_none(tag=tws, period__type=Period.TYPES["FOREVER"])
    u_total_pledged = TotalTag.get_or_none(tag=u, period__type=Period.TYPES["FOREVER"])
    
    pd_total_pledged = pd_total_pledged and pd_total_pledged.dollars_pledged() or 0
    tws_total_pledged = tws_total_pledged and tws_total_pledged.dollars_pledged() or 0
    u_total_pledged = u_total_pledged and u_total_pledged.dollars_pledged() or 0
    
    sum_total_pledged = pd_total_pledged + tws_total_pledged
    
    pd_total_time = TotalTag.get_or_none(tag=pd, period__type=Period.TYPES["FOREVER"])
    tws_total_time = TotalTag.get_or_none(tag=tws, period__type=Period.TYPES["FOREVER"])
    u_total_time = TotalTag.get_or_none(tag=u, period__type=Period.TYPES["FOREVER"])
    
    pd_total_time = pd_total_time and pd_total_time.hours() or 0
    tws_total_time = tws_total_time and tws_total_time.hours() or 0
    u_total_time = u_total_time and u_total_time.hours() or 0
    
    sum_total_time = pd_total_time + tws_total_time
    
    user_totals_count = User.objects.count()
    recip_totals_count = Recipient.objects.count()
    sitegroup_totals_count = TotalSiteGroup.objects.filter(total_pledged__gt=0,
                                                           period__type=Period.TYPES["FOREVER"]).count()
    sitegroup_raw_totals_count = TotalSiteGroup.objects.count()                                                           
    sum_total_count = recip_totals_count + sitegroup_totals_count
    
    total_goals_met = KeyValue.get_or_none(key=KeyValue.KEYS["total_goals_met"])
    total_goals = KeyValue.get_or_none(key=KeyValue.KEYS["total_goals"])
    total_hours_saved = KeyValue.get_or_none(key=KeyValue.KEYS["total_hours_saved"])
    print "DN WP", total_hours_saved
    
    total_goals_met = total_goals_met and total_goals_met.value or 0
    total_goals = total_goals and total_goals.value or 0
    total_hours_saved = total_hours_saved and total_hours_saved.value or 0
    print "DN WP 2", total_hours_saved
    
    return locals()

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
    
    analytics = _get_analytics_data()
    analytics.update(locals())
    return render_response(request, 'procrasdonate/community_pages/community_portal.html', analytics)

def community_type(request, type):
    #tag = Tag.objects.get_or_none(tag=type)
    return render_response(request, 'procrasdonate/community_pages/community_rankings.html', locals())

#### PUBLIC RECIPIENT ###################################

def recipient(request, slug):
    recipient = get_object_or_404(Recipient, slug__iexact=slug)
    if recipient and recipient.slug != slug:
        return HttpResponseRedirect(reverse('recipient', args=(recipient.slug, )))
    return render_response(request, 'procrasdonate/public_recipient_pages/recipient.html', locals())

#### ACCOUNT ###################################

def login_view(request):
    next = request.GET.get('next', None)
    # Light security check -- make sure redirect_to isn't garbage.                                                                                                                
    if not next or '//' in next or ' ' in next:
        next = reverse('recipient_organizer_dashboard')

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

#### RECIPIENT ORGANIZER ###################################

def _organizer_submenu(request, current_slug, recipient):
    menu_items = []
    next = None
    prev = None
    
    _last = None;
    _one_past_current = False
    _two_past_current = False # because can't tell the difference bw nulls
    idx = 0
    for item in [{'name': 'Donations',
                  'slug': 'receive_donations',
                  'url': reverse("payment_registration")},

                  {'name': 'Profile',
                  'slug': 'public',
                  'url': reverse("edit_public_information")},
                  
                 {'name': 'Record',
                  'slug': 'private',
                  'url': reverse("edit_private_information")},
                  
                 {'name': 'Media',
                  'slug': 'media',
                  'url': reverse("edit_media")},
                  
                  {'name': 'Promote',
                  'slug': 'promote',
                  'url': reverse("edit_promo_cards")}]:
        
        klasses = ["substate_tab"]
        if item['slug'] == current_slug:
            klasses.append("current_tab")
        elif not _one_past_current:
            klasses.append("past")
        else:
            klasses.append("future")
            
        img = "/procrasdonate_media/img/StepCircle%sDone.png" % (idx+1)
        bar = "/procrasdonate_media/img/Dash.png"
        if _one_past_current:
            img = "/procrasdonate_media/img/StepCircle%s.png" % (idx+1)
            bar = "/procrasdonate_media/img/DashGreen.png"

        menu_item = {"id": item['slug'],
                     "klasses": klasses,
                     "value": item['name'],
                     "img": img,
                     "bar": bar,
                     "url": item['url']}

        # set next
        if _one_past_current and not _two_past_current:
            next = menu_item
            _two_past_current = True

        # set prev
        if item['slug'] == current_slug:
            _one_past_current = True
            prev = _last

        # add to menu items
        menu_items.append(menu_item);
        _last = menu_item
        idx += 1
    
    show_next_and_prev = recipient.public_information_incomplete() or \
        recipient.private_information_incomplete() or \
        recipient.media_incomplete() or \
        not recipient.pd_registered()
        
    return {"menu_items": menu_items,
            "next": show_next_and_prev and next or None,
            "prev": show_next_and_prev and prev or None,
            "no_spacers": not show_next_and_prev}

@login_required
def edit_promo_cards(request):
    recipient = request.user.get_profile().recipient
    substate_menu_items = _organizer_submenu(request, "promote", recipient)
    submenu_id = "organizer_submenu"
    return render_response(request, 'procrasdonate/recipient_organizer_pages/edit_promo_cards.html', locals())

@login_required
def edit_public_information(request):
    print settings.TEMPLATE_DIRS
    recipient = request.user.get_profile().recipient
    substate_menu_items = _organizer_submenu(request, "public", recipient)
    submenu_id = "organizer_submenu"
        
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
            arrow_direction = request.POST.get("arrow_direction", None)
            if arrow_direction and arrow_direction == "prev":
                return HttpResponseRedirect(reverse('payment_registration'))
            elif arrow_direction and arrow_direction == "next":
                return HttpResponseRedirect(reverse('edit_private_information'))
            else:
                return HttpResponseRedirect(reverse('edit_public_information'))
    else:
        form = FormKlass(instance=recipient)

    return render_response(request, 'procrasdonate/recipient_organizer_pages/edit_public_information.html', locals())

@login_required
def recipient_organizer_dashboard(request):
    recipient_user_tagging = request.user.get_profile()
    recipient = recipient_user_tagging.recipient
    
    checkbox_fields = []
    for field in RecipientUserTagging.CHECKBOX_FIELDS:
        f = getattr(recipient_user_tagging, field)
        if f != RecipientUserTagging.TASK_STATES["INVISIBLE"]:
            if request.POST:
                checked = request.POST.get(field)
            else:
                checked = f == RecipientUserTagging.TASK_STATES["DONE"]
            checkbox_fields.append({'name'   : field,
                                    'checked': checked,
                                    'label'  : field,
                                    'help'   : '',
                                    'error'  : ''})

    if request.POST:
        for field in checkbox_fields:
            if field['checked']:
                setattr(recipient_user_tagging, field['name'], RecipientUserTagging.TASK_STATES["DONE"])
            else:
                setattr(recipient_user_tagging, field['name'], RecipientUserTagging.TASK_STATES["TODO"])
        recipient_user_tagging.save()
        request.user.message_set.create(message='changes saved')
        return HttpResponseRedirect(reverse('recipient_organizer_dashboard'))
    
    return render_response(request, 'procrasdonate/recipient_organizer_pages/dashboard.html', locals())

@login_required
def edit_private_information(request):
    recipient = request.user.get_profile().recipient
    substate_menu_items = _organizer_submenu(request, "private", recipient)
    submenu_id = "organizer_submenu"
    
    FormKlass = get_form(Recipient, EDIT_TYPE, includes=('employers_identification_number',
                                                         'tax_exempt_status',
                                                         'sponsoring_organization',
                                                         'office_phone',
                                                         'mailing_address',
                                                         'city',
                                                         'state',
                                                         'country'))
    
    RU_FormKlass = get_form(RecipientUser, EDIT_TYPE, includes=('first_name', 'last_name', 'email'))

    if request.POST:
        form = FormKlass(request.POST, instance=recipient)
        ru_form = RU_FormKlass(request.POST, instance=request.user)
        
        if form.is_valid() and ru_form.is_valid():
            form.save()
            ru_form.save()
            request.user.message_set.create(message='Changes saved')
            arrow_direction = request.POST.get("arrow_direction", None)
            if arrow_direction and arrow_direction == "prev":
                return HttpResponseRedirect(reverse('edit_public_information'))
            elif arrow_direction and arrow_direction == "next":
                return HttpResponseRedirect(reverse('edit_media'))
            else:
                return HttpResponseRedirect(reverse('edit_private_information'))
    else:
        form = FormKlass(instance=recipient)
        ru_form = RU_FormKlass(instance=request.user)

    return render_response(request, 'procrasdonate/recipient_organizer_pages/edit_private_information.html', locals())


@login_required
def edit_media(request):
    recipient = request.user.get_profile().recipient
    substate_menu_items = _organizer_submenu(request, "media", recipient)
    submenu_id = "organizer_submenu"
    
    FormKlass = get_form(Recipient, EDIT_TYPE, includes=('logo',
                                                         'promotional_video',
                                                         'pd_experience_video'))

    if request.POST:
        form = FormKlass(request.POST, request.FILES, instance=recipient)
        if form.is_valid():
            form.save()
            request.user.message_set.create(message='Changes saved')
            arrow_direction = request.POST.get("arrow_direction", None)
            if arrow_direction and arrow_direction == "prev":
                return HttpResponseRedirect(reverse('edit_private_information'))
            elif arrow_direction and arrow_direction == "next":
                return HttpResponseRedirect(reverse('edit_promo_cards'))
            else:
                return HttpResponseRedirect(reverse('edit_media'))
    else:
        form = FormKlass(instance=recipient)

    return render_response(request, 'procrasdonate/recipient_organizer_pages/edit_media.html', locals())

def _edit_recipient_something(request, includes, template):
    """
    could use this but.... edit_foo's are likely to become more complicated with amazon auth and video stuff....
    """
    recipient = request.user.get_profile().recipient
        
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
    recipient = request.user.get_profile().recipient
    return render_response(request, 'procrasdonate/recipient_organizer_pages/edit_weekly_blurbs.html', locals())

@login_required
def edit_thank_yous(request):
    recipient = request.user.get_profile().recipient
    return render_response(request, 'procrasdonate/recipient_organizer_pages/edit_thank_yous.html', locals())

@login_required
def edit_yearly_newsletter(request):
    recipient = request.user.get_profile().recipient
    return render_response(request, 'procrasdonate/recipient_organizer_pages/edit_yearly_newsletter.html', locals())

def download_update(request):
    """
    Not called by anyone yet.
    """
    xpi_builder = XpiBuilder(settings.pathify([settings.PROJECT_PATH,
                                               'procrasdonate',
                                               'ProcrasDonateFFExtn'],
                                               file_extension=True),
                             "%s%s" % (settings.MEDIA_ROOT, 'xpi'),
                             "%s%s" % (settings.MEDIA_ROOT, 'rdf'))
    info = xpi_builder.get_update_info()
    link = info['update_link']
    hash = info['update_hash']
    return render_response(request, 'procrasdonate/extension_pages/download_xpi.html', locals())
