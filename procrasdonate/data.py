from __future__ import division

from django.db import models
from lib import model_utils

from django.contrib.auth.models import User as RecipientUser
from django.db.models.signals import post_save

from django.template.defaultfilters import slugify

import settings

from django.contrib.contenttypes.models import ContentType

import Image as PIL

import re
import random
import os
import datetime

class Email(models.Model):
    """
    """
    email = models.EmailField(db_index=True)
    
    def send_email(self, subject, message, from_email=None):
        """
        Sends an e-mail to this User.
        If DJANGO_SERVER is true, then prints email to console
        """
        print "Email.send_email"
        model_utils.send_email(subject, message, self.email, from_email)
    
    @classmethod
    def get_or_create(klass, email):
        e = Email.get_or_none(email=email)
        if e:
            return e
        else:
            return Email.add(email)
    
    @classmethod
    def make(klass, email):
        return Email(email=email)
        
    def __unicode__(self):
        return u"%s" % self.email

class User(models.Model):
    """
    Extension users may optionally provide us with their email address and other information
    for say an announcements list.
    The private_key, which is the only required field, is a user id generated by the server.
    """
    private_key = models.CharField(max_length=64, db_index=True)
    name = models.CharField(max_length=128, blank=True, null=True)
    twitter_name = models.CharField(max_length=32, blank=True, null=True)
    url = models.URLField(blank=True, null=True)
    email = models.ForeignKey(Email, blank=True, null=True)
    on_email_list = models.BooleanField(default=False)
    weekly_affirmations = models.BooleanField(default=False)
    org_thank_yous = models.BooleanField(default=False)
    org_newsletters = models.BooleanField(default=False)
    tos = models.BooleanField(default=False)
    
    @classmethod
    def make(klass, private_key, name=None, twitter_name=None, url=None, email=None):
        """
        @param email: string email
        """
        email = email and Email.get_or_create(email) or None
        return User(private_key=private_key,
                    name=name,
                    twitter_name=twitter_name,
                    url=url,
                    email=email)
        
    def __unicode__(self):
        return u"%s - %s - %s - %s - %s - %s" % (self.private_key,
                                                 self.name,
                                                 self.twitter_name,
                                                 self.url,
                                                 self.email,
                                                 self.on_email_list)

class Site(models.Model):
    """
    Content provider.
    This is not a website that someone simple visited, 
    but rather a content provider that someone paid to visit.
    """
    url = models.URLField(max_length=400, db_index=True)
    sitegroup = models.ForeignKey('SiteGroup')
    
    @classmethod
    def get_or_create(klass, url):
        s = Site.get_or_none(url=url)
        if not s:
            host = SiteGroup.extract_host(url)
            s = Site.add(url,
                         SiteGroup.get_or_create(host=host))
        return s

    @classmethod
    def make(klass, url, sitegroup):
        return Site(url=url[:400], sitegroup=sitegroup)
    
    def __unicode__(self):
        return u"%s (%s)" % (self.url, self.sitegroup)

class SiteGroup(models.Model):
    """
    Domain-based group of Sites
    """
    host = models.CharField(max_length=400, db_index=True)
    ##protocol = models.CharField(max_length=20)
    # describes valid urls
    url_re = models.CharField(max_length=256, null=True, blank=True)
    name = models.CharField(max_length=200, null=True, blank=True)
    
    # there are so many!
    # http://en.wikipedia.org/wiki/URI_scheme#Official_IANA-registered_schemes
    # (s?https?|ftp|file|about|chrome|mailto|gopher|feeds?|im|news|nfs|nntp|rtsp|tv|xmpp)
    HOST_RE = re.compile("(^[\w-]+):(//)?(www\.)?([^/]+)")
    FILE_RE = re.compile("^file://(.*)")
    
    """
    expected outputs:
    HOST_RE.match("http://www.wikipedia.org").groups()
    ('http', '//', 'www.', 'wikipedia.org')

    HOST_RE.match("http://en.wikipedia.org").groups()
    ('http', '//', None, 'en.wikipedia.org')

    HOST_RE.match("about:config").groups()
    ('about', None, None, 'config')
    
    FILE_RE.match("file:///Users/lucy/SciFi/Vernor Vinge").groups()
    ('/Users/lucy/SciFi/Vernor Vinge',)


    """
    
    @classmethod
    def extract_host(klass, url):
        file_match = SiteGroup.FILE_RE.match(url)
        if file_match:
            #return { 'protocol': 'file', 'host': file_match.groups()[0][:30] }
            file_match.groups()[0][:30]
        
        match = SiteGroup.HOST_RE.match(url)
        if match:
            g = match.groups()
            if len(g) >= 4:
                #return { 'protocol': g[0][:19], 'host': g[3][:390] }
                g[3][:390]
        
        #return { 'protocol': '', 'host': url[:390] }
        return url[:390]

    @classmethod
    def get_or_create(klass, host, url_re=None, name=None):
        s = SiteGroup.get_or_none(host=host)
        if not s:
            s = SiteGroup.add(host, url_re, name)
        return s
    
    @classmethod
    def make(klass, host, url_re=None, name=None):
        return SiteGroup(host=host[:400],
                         url_re=url_re,
                         name=name)
    
    def __unicode__(self):
        #return u"%s, %s" % (self.protocol, self.host)
        return u"%s" % (self.host)
    

# where files are stored after settings.MEDIA_ROOT
_IMAGE_UPLOAD_PATH = 'uploaded_img'
    
def _Get_Image_Path(filename, folder):
    """
    """
    if isinstance(folder, Recipient):
        folder = folder.slug

    path = '%s/%s/%s' % (_IMAGE_UPLOAD_PATH, folder, filename)
    fullpath = "%s%s/%s" % (settings.MEDIA_ROOT, _IMAGE_UPLOAD_PATH, folder)
    print "_GET_IMAGE_PATH", filename, folder, path, fullpath
    if not os.path.exists(fullpath):
        os.mkdir(fullpath)
    return path

filename_slug = re.compile('[^\w_\-\.]')
def get_image_path(instance, filename):
    """
    """
    ctype = ContentType.objects.get_for_model(instance)
    model = ctype.model
    
    print "get_image_page", instance, filename, model
    
    if model == "recipient":
        slug = filename_slug.sub('', filename.replace(' ', '_'))
        print "slug:", slug
        return _Get_Image_Path(slug, instance)
    
    else:
        # shouldn't happen
        print "FAIL get_image_patch", instance, filename
        raise "FAIL get_image_page"

def get_default_category():
    ret = Category.get_or_none(category="Unspecified")
    return ret
    
class Recipient(models.Model):
    """
    Recipient of donations
    """
    last_modified = models.DateTimeField(auto_now=True)

    slug = models.SlugField(db_index=True, help_text="UNIQUE acronym for url. eg bilumi in procrasdonate.com/bilumi")
    name = models.CharField(max_length=200, null=True, blank=True, verbose_name="Organization's Name")
    category = models.ForeignKey('Category', blank=True, null=True, default=get_default_category)
    mission = models.CharField(max_length=200, null=True, blank=True, verbose_name="Charitable Mission")
    description = models.TextField(null=True, blank=True, verbose_name="Method Toward Fulfilling Mission")
    url = models.URLField(null=True, blank=True, verbose_name="Website")
    
    twitter_name = models.CharField(max_length=32, null=True, blank=True)
    facebook_name = models.CharField(max_length=50, null=True, blank=True)
    
    is_visible = models.BooleanField(default=True)
    
    employers_identification_number = models.CharField(max_length=32, blank=True, null=True, verbose_name="IRS EIN (Employer Identification Number)")
    tax_exempt_status = models.BooleanField(default=False, verbose_name="Check if US tax exempt organization:")
    is_sponsored = models.BooleanField(default=False, verbose_name="Is sponsored by some other organization")
    sponsoring_organization = models.CharField(max_length=200, blank=True, null=True)
    office_phone = models.CharField(max_length=15, blank=True, null=True)
    mailing_address = models.CharField(max_length=200, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=50, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True, default='USA')
    
    logo = models.ImageField(upload_to=get_image_path, blank=True, null=True)
    
    SCALED_MAX_HEIGHT = 300
    SCALED_MAX_WIDTH = 300
    THUMBNAIL_MAX_HEIGHT = 50
    THUMBNAIL_MAX_WIDTH = 50
    
    promotional_video = models.URLField(blank=True, null=True, help_text="A good way to attract new donors is to have your organization's video rotating through the ProcrasDonate website.  Copy the <b>full</b> website address of the Youtube video that best represents your organization and paste it here. (optional)")
    pd_experience_video = models.URLField(blank=True, null=True, help_text="The secondary video box on our website is reserved for videos about using ProcrasDonate. If you'd like to share your organization's experience using ProcrasDonate then add that Youtube address here. (optional)")
    
    charity_navigator_score = models.IntegerField(blank=True, null=True)
    
    admin_options = {'prepopulated_fields': {"slug": ("name",)} }
    
    class Meta:
        ordering = ('name',)

    def deep_dict(self):
        if isinstance(self.last_modified, basestring):
            print "unicode last modified for %s: %s (%s)" % (self.slug,
                                                             self.last_modified,
                                                             type(self.last_modified))
            try:
                lm = datetime.datetime.strptime(self.last_modified, "%Y-%m-%d %H:%M:%S")
                print "no microseconds"
            except ValueError, e:
                try:
                    lm = datetime.datetime.strptime(self.last_modified, "%Y-%m-%d %H:%M:%S.%f")
                    print "used \%f to get microseconds"
                except:
                    if '.' in self.last_modified:
                        try:
                            lm = datetime.datetime.strptime(self.last_modified[:self.last_modified.rfind('.')],
                                                            "%Y-%m-%d %H:%M:%S")
                            print "removed microseconds from unicode"
                        except:
                            print "error: nothing worked !!!!!"
                            lm = datetime.datetime.now()
            print "  -> converted to datetime: %s" % lm
        else:
            lm = self.last_modified
            
        return {'slug': self.slug,
                'name': self.name,
                'category': self.category.category,
                'mission': self.mission,
                'description': self.description,
                'url': self.url,
                "logo": self.logo and self.logo.url or None,
                "logo_thumbnail": self.thumbnail_url(),
                
                'twitter_name': self.twitter_name,
                'facebook_name': self.facebook_name,
                
                'is_visible': self.is_visible,
                'pd_registered': self.pd_registered(),
                'tax_exempt_status': self.tax_exempt_status,
                'last_modified': lm}
    
    def public_information_incomplete(self):
        return not (self.name and self.category and self.mission and self.description and self.url)
    
    def private_information_incomplete(self):
        return not (self.office_phone and self.mailing_address and self.city and
                    self.state and self.country)
    
    def media_incomplete(self):
        return not self.logo or not self.promotional_video
    
    @classmethod
    def Initialize(klass):
        models.signals.pre_save.connect(Recipient.process_videos, sender=Recipient)
        models.signals.pre_save.connect(Recipient.sanitize_user_input, sender=Recipient)
        #models.signals.pre_save.connect(Recipient.set_logo_dimensions, sender=Recipient)
        models.signals.post_save.connect(Recipient.scale_logo, sender=Recipient)
        
    @classmethod
    def sanitize_user_input(klass, signal, sender, instance, **kwargs):
        """
        remove html tags
        """
        v_re = re.compile(r'<.*?>')
        for field in ["name", "mission", "description",
                      "twitter_name", "facebook_name",
                      "employers_identification_number",
                      "sponsoring_organization",
                      "office_phone", "mailing_address",
                      "city", "state", "country"]:
            if getattr(instance, field):
                setattr(instance, field, v_re.sub('', getattr(instance, field)))

    @classmethod
    def process_videos(klass, signal, sender, instance, **kwargs):
        """
        pre-save signal to translate youtube watch url into embedded url
        eg, http://www.youtube.com/watch?v=kyBR5UL8nRs&feature=player_embedded
         -> http://www.youtube.com/v/kyBR5UL8nRs&hl=en&fs=1&
        """
        # extract v parameter
        v_re = re.compile("[?&]v=([^&]+)")
        for field in ["promotional_video", "pd_experience_video"]:
            if getattr(instance, field):
                res = v_re.search(getattr(instance, field))
                if res and res.groups():
                    v = res.groups()[0]
                    setattr(instance, field, "http://www.youtube.com/v/%s" % v)

    """
    @classmethod
    def dimensions(klass, signal, sender, instance, **kwargs):
        '''
        @summary: sets the *scaled* logo_height and logo_width fields based on the
            logo's original dimensions.
            Does not actually scale the logo.
        '''
        if not instance.logo:
            return

        h = instance.logo.height
        w = instance.logo.width
        if h > w:
            if h > Recipient.SCALED_MAX_HEIGHT:
                w = int((Recipient.SCALED_MAX_HEIGHT/h) * w)
                h = Recipient.SCALED_MAX_HEIGHT
        if w > Recipient.SCALED_MAX_WIDTH:
            h = int((Recipient.SCALED_MAX_WIDTH/w) * h)
            w = Recipient.SCALED_MAX_WIDTH
        
        instance.logo_height = h
        instance.logo_width = w
    """
    
    def thumbnail_path(self):
        if self.logo:
            dot_idx = self.logo.path.rfind(".")
            if 0 <= dot_idx < len(self.logo.path):
                return "%s_thumbnail%s" % (self.logo.path[:dot_idx],
                                           self.logo.path[dot_idx:])
            else:
                return self.logo.path + ".thumbnail.png"
        else:
            return ""
    
    def thumbnail_url(self):
        if self.logo:
            dot_idx = self.logo.url.rfind(".")
            if 0 <= dot_idx < len(self.logo.url):
                return "%s_thumbnail%s" % (self.logo.url[:dot_idx],
                                           self.logo.url[dot_idx:])
            else:
                return self.logo.url + ".thumbnail.png"
        else:
            return ""
    
    @classmethod
    def scale_logo(klass, signal, sender, instance, created, **kwargs):
        """
        @summary: scales the logo based on MAX_SCALED_<dimension>
        """
        if not instance.logo:
            return

        if instance.logo.width <= Recipient.SCALED_MAX_WIDTH and instance.logo.height <= Recipient.SCALED_MAX_HEIGHT:
            im = PIL.open(instance.logo.path)
            th = im.copy()
            th.thumbnail((Recipient.THUMBNAIL_MAX_WIDTH, Recipient.THUMBNAIL_MAX_HEIGHT), PIL.ANTIALIAS)
            th.save(instance.thumbnail_path(), th.format)
            return
        
        im = PIL.open(instance.logo.path)
        th = im.copy()
        #@TODO how log here? dependencies...
        #Log.Log("image: info=%s, format=%s, mode=%s" % (im.info, im.format, im.mode))
        if 'duration' in im.info:
            #Log.Error("animation uploaded for logo: %s for %s" % (instance.logo.path, self.slug))
            pass
        else:
            im.thumbnail((Recipient.SCALED_MAX_WIDTH, Recipient.SCALED_MAX_HEIGHT), PIL.ANTIALIAS)
            im.save(instance.logo.path, im.format)

            th.thumbnail((Recipient.THUMBNAIL_MAX_WIDTH, Recipient.THUMBNAIL_MAX_HEIGHT), PIL.ANTIALIAS)
            th.save(instance.thumbnail_path(), th.format)

        """
        looked at but didn't use: http://www.djangosnippets.org/snippets/224/
        @summary: Rescale the given image, optionally cropping it to 
            make sure the result image has the specified width and height.
        """
    
    def __unicode__(self):
        return u"[%s]    %s - %s - %s" % (self.slug,
                                          self.name,
                                          self.category,
                                          self.pd_registered())

class RecipientUserTagging(models.Model):
    user = models.ForeignKey(RecipientUser, unique=True)
    recipient = models.ForeignKey(Recipient)
    
    is_confirmed = models.BooleanField(default=False)
    confirmation_code = models.CharField(max_length=33, null=True, blank=True)
    
    job_title = models.CharField(max_length=100, null=True, blank=True)
    
    #we've communicated with our membership base that they can use PD
    # to benefit our services using:
    TASK_STATES_LIST = ["INVISIBLE", "TODO", "DONE"]
    task_max_len, TASK_STATES, TASK_CHOICES = model_utils.convert_to_choices(TASK_STATES_LIST)
    
    CHECKBOX_FIELDS = ['email_to_supporters',
                       'newsletter_article',
                       'mailed_letter',
                       'other_mailing',
                       'event_postcard',
                       'homepage_link',
                       'blog_post',
                       'twitter_tweet']
    
    email_to_supporters = models.CharField(max_length=task_max_len, choices=TASK_CHOICES, default=TASK_STATES["TODO"])
    newsletter_article = models.CharField(max_length=task_max_len, choices=TASK_CHOICES, default=TASK_STATES["TODO"])
    mailed_letter = models.CharField(max_length=task_max_len, choices=TASK_CHOICES, default=TASK_STATES["TODO"])
    mailed_postcard = models.CharField(max_length=task_max_len, choices=TASK_CHOICES, default=TASK_STATES["TODO"])
    other_mailing = models.CharField(max_length=task_max_len, choices=TASK_CHOICES, default=TASK_STATES["TODO"])
    event_postcard = models.CharField(max_length=task_max_len, choices=TASK_CHOICES, default=TASK_STATES["TODO"])
    homepage_link = models.CharField(max_length=task_max_len, choices=TASK_CHOICES, default=TASK_STATES["TODO"])
    blog_post = models.CharField(max_length=task_max_len, choices=TASK_CHOICES, default=TASK_STATES["TODO"])
    twitter_tweet = models.CharField(max_length=task_max_len, choices=TASK_CHOICES, default=TASK_STATES["TODO"])
    
    def user_information_incomplete(self):
        return not (self.user.first_name and self.user.last_name and self.user.email)
    
    def set_recipient(self, recipient):
        self.recipient = recipient
        self.save()
    
    def confirmable(self, confirmation_code):
        return self.is_confirmed or self.confirmation_code == confirmation_code
            
    def confirm(self, confirmation_code):
        if self.confirmable(confirmation_code):
            self.is_confirmed = True
            self.confirmation_code = None
            self.save()
            self.user.is_active = True
            self.user.save()
            return True
        else:
            return False
    
    def send_email(self, subject, message, from_email=None):
        """
        Sends an e-mail to this User.
        If DJANGO_SERVER is true, then prints email to console
        """
        print "Tagging.send_email"
        model_utils.send_email(subject, message, self.user.email, from_email)
    
    @classmethod
    def create_confirmation_code(klass):
        return "".join(["0123456789ABCDEF"[random.randint(0,15)] for i in range(1,32)])
    
    def reset_password(self):
        # we decided not to disable everything... 
        #@TODO brainstorm security across entire registration and password reset processes
        #user.is_active = False
        #user.save()
        #self.is_confirmed = False
        self.confirmation_code = RecipientUserTagging.create_confirmation_code()
        self.save()
    
    @classmethod
    def make(klass, user, recipient, require_confirmation=True):
        if require_confirmation:
            confirmation_code = klass.create_confirmation_code()
            is_confirmed = False
            user.is_active = False
            user.save()
        else:
            confirmation_code = None
            is_confirmed = True
            user.is_active = True
            user.save()
        return RecipientUserTagging(user=user,
                                    recipient=recipient,
                                    confirmation_code=confirmation_code,
                                    is_confirmed=is_confirmed)
        
    def __unicode__(self):
        return "%s --> %s" % (self.user, self.recipient)

def user_save_callback(sender, instance, created, **kwargs):
    if created:
        RecipientUserTagging(user=instance)

post_save.connect(user_save_callback, sender=RecipientUser)

class Tag(models.Model):
    """
    """
    tag = models.CharField(max_length=64)
    
    @classmethod
    def get_or_create(klass, tag):
        t = Tag.get_or_none(tag=tag)
        if t:
            return t
        else:
            return Tag.add(tag)
    
    @classmethod
    def make(klass, tag):
        return Tag(tag=tag)
    
    def __unicode__(self):
        return u"%s" % self.tag


class SiteGroupTagging(models.Model):
    tag = models.ForeignKey(Tag)
    sitegroup = models.ForeignKey(SiteGroup)
    user = models.ForeignKey(User)
    dtime = models.DateTimeField(auto_now_add=True, db_index=True)
    
    @classmethod
    def make(klass, tag, sitegroup, user):
        """
        @param tag: if type str or unicode, retrieves Tag
        """
        if isinstance(tag, (str, unicode)):
            tag = Tag.get_or_create(tag)
        return SiteGroupTagging(tag=tag,
                                sitegroup=sitegroup,
                                user=user)
    
    def __unicode__(self):
        return "%s: %s -> %s" % (user, tag, sitegroup)

class Category(models.Model):
    """
    """
    category = models.CharField(max_length=200)
    
    @classmethod
    def get_or_create(klass, category):
        t = Category.get_or_none(category=category)
        if t:
            return t
        else:
            return Category.add(category)
    
    @classmethod
    def make(klass, category):
        return Category(category=category)
    
    def __unicode__(self):
        return self.category
    
    def __unicode__(self):
        return u"%s" % self.category

class Visit(models.Model):
    """
    payment or pledge or something from a single user.
    If donated some money to some recipient for time spent on some site,
    then we expect two Visits to be created: one for the site
    and one for the recipient (and possibly a second recipient if some 
    percent is also going to @ProcrasDonate). These two Visits
    will doubly account for the time_spent and amount [donated]. 
    The time_spent and amount [donated] across all sites and recipients
    with the same incoming_tipjoy_transaction_id should cancel out.
    """
    # datetime visit occured (recorded in extension)
    dtime = models.DateTimeField()
    # datetime server received visit from extension
    received_time = models.DateTimeField(auto_now_add=True)
    # time spent procrastinating in seconds. likely max is 24 (hr) * 60 (min) * 60 (s)
    total_time = models.FloatField()
    # amount donated in cents
    total_amount = models.FloatField()
    # rate of payment in cents per hour 
    # GENERATED based on total_time and total_amount
    # WARNING: this is the rate at the time of payment. 
    # the rate could have changed halfway through the day,
    # so do not expect a meaningful relationship between rate and totals
    rate = models.FloatField(default=0)

    user = models.ForeignKey(User, null=True, blank=True)
    # id of item in extension database
    extn_id = models.IntegerField()
    
    def hours(self):
        return self.total_time / (60*60)
    
    def dollars(self):
        return self.total_amount / 100
    
    class Meta:
        abstract = True
        ordering = ('dtime',)
    
    def __unicode__(self):
        return u"%s :%s: - %s - %s cents" % (self.dtime,
                                             self.user.private_key,
                                             self.total_time,
                                             self.total_amount)
    @classmethod
    def make(klass, dtime, total_time, total_amount, user, extn_id, extn_inst, extn_inst_name, the_klass):
        """
        @param extn_id: 
        @param extn_inst: 
        @param extn_inst_name: 
        @param the_klass: 
        """
        # total_amount / total_time
        if total_time:
            rate = (total_amount * 3600) / total_time;
        else:
            rate = 0
        the_inst = the_klass(dtime=dtime,
                             total_time=total_time,
                             total_amount=total_amount,
                             rate=rate,
                             user=user,
                             extn_id=extn_id)
        setattr(the_inst, extn_inst_name, extn_inst)
        return the_inst
        
class SiteGroupVisit(Visit):
    """
    """
    sitegroup = models.ForeignKey(SiteGroup)
    
    @classmethod
    def make(klass, sitegroup, dtime, total_time, total_amount, user, extn_id):
       return Visit.make(dtime,
                         total_time,
                         total_amount,
                         user,
                         extn_id,
                         sitegroup,
                         "sitegroup",
                         SiteGroupVisit)
    
    def __unicode__(self):
        return "%s [[%s]]" % (self.sitegroup, super(SiteGroupVisit, self).__unicode__())

class SiteVisit(Visit):
    """
    """
    site = models.ForeignKey(Site)
    
    @classmethod
    def make(klass, site, dtime, total_time, total_amount, user, extn_id):
       return Visit.make(dtime,
                         total_time,
                         total_amount,
                         user,
                         extn_id,
                         site,
                         "site",
                         SiteVisit)
    
    def __unicode__(self):
        return "%s [[%s]]" % (self.site, super(SiteVisit, self).__unicode__())

class RecipientVisit(Visit):
    """
    """
    recipient = models.ForeignKey(Recipient)
    
    @classmethod
    def make(klass, recipient, dtime, total_time, total_amount, user, extn_id):
       return Visit.make(dtime,
                         total_time,
                         total_amount,
                         user,
                         extn_id,
                         recipient,
                         "recipient",
                         RecipientVisit)
    
    def __unicode__(self):
        return "%s [[%s]]" % (self.recipient, super(RecipientVisit, self).__unicode__())


class RecipientVoteVisit(Visit):
    """
    """
    recipient_vote = models.ForeignKey('RecipientVote')
    
    @classmethod
    def make(klass, recipient_vote, dtime, total_time, total_amount, user, extn_id):
       return Visit.make(dtime,
                         total_time,
                         total_amount,
                         user,
                         extn_id,
                         recipient_vote,
                         "recipient_vote",
                         RecipientVoteVisit)
    
    def __unicode__(self):
        return "%s [[%s]]" % (self.recipient_vote, super(RecipientVoteVisit, self).__unicode__())


class TagVisit(Visit):
    """
    """
    tag = models.ForeignKey(Tag)
    
    @classmethod
    def make(klass, tag, dtime, total_time, total_amount, user, extn_id):
       return Visit.make(dtime,
                         total_time,
                         total_amount,
                         user,
                         extn_id,
                         tag,
                         "tag",
                         TagVisit)
       
    def __unicode__(self):
        return "%s [[%s]]" % (self.tag, super(TagVisit, self).__unicode__())

class PaymentService(models.Model):
    name = models.CharField(max_length=200)
    user_url = models.URLField()
    
    @classmethod
    def make(klass, name, user_url):
        return PaymentService(name=name, user_url=user_url)
    
    def __unicode__(self):
        return self.name

class Payment(models.Model):
    dtime = models.DateTimeField(db_index=True)
    payment_service = models.ForeignKey(PaymentService)
    transaction_id = models.CharField(max_length=32, db_index=True)
    settled = models.BooleanField(default=False)
    total_amount_paid = models.FloatField(default=0.0)
    amount_paid_in_fees = models.FloatField(default=0.0)
    amount_paid_tax_deductibly = models.FloatField(default=0.0)
    user = models.ForeignKey(User)
    extn_id = models.IntegerField()

    class Meta:
        abstract = True

    @classmethod
    def make(klass,
             dtime,
             payment_service,
             transaction_id,
             settled,
             total_amount_paid,
             amount_paid_in_fees,
             amount_paid_tax_deductibly,
             user,
             extn_id,
             extn_inst,
             extn_inst_name,
             the_klass):
        
        """
        @param extn_id: 
        @param extn_inst: 
        @param extn_inst_name: 
        @param the_klass:
        """
        the_inst = the_klass(dtime=dtime,
                             payment_service=payment_service,
                             transaction_id=transaction_id,
                             settled=settled,
                             total_amount_paid=total_amount_paid,
                             amount_paid_in_fees=amount_paid_in_fees,
                             amount_paid_tax_deductibly=amount_paid_tax_deductibly,
                             user=user,
                             extn_id=extn_id)
        setattr(the_inst, extn_inst_name, extn_inst)
        return the_inst
    
    def __unicode__(self):
        return self.name
    
class RecipientPayment(Payment):
    recipient = models.ForeignKey(Recipient)
    
    @classmethod
    def make(klass,
             recipient,
             dtime,
             payment_service,
             transaction_id,
             settled,
             total_amount_paid,
             amount_paid_in_fees,
             amount_paid_tax_deductibly,
             user,
             extn_id,
             extn_inst,
             extn_inst_name,
             the_klass):

        return Payment.make(dtime,
                            payment_service,
                            transaction_id,
                            settled,
                            total_amount_paid,
                            amount_paid_in_fees,
                            amount_paid_tax_deductibly,
                            user,
                            extn_id,
                            recipient,
                            "recipient",
                            RecipientPayment)

class SitePayment(Payment):
    site = models.ForeignKey(Site)
    
    @classmethod
    def make(klass,
             site,
             dtime,
             payment_service,
             transaction_id,
             settled,
             total_amount_paid,
             amount_paid_in_fees,
             amount_paid_tax_deductibly,
             user,
             extn_id,
             extn_inst,
             extn_inst_name,
             the_klass):

        return Payment.make(dtime,
                            payment_service,
                            transaction_id,
                            settled,
                            total_amount_paid,
                            amount_paid_in_fees,
                            amount_paid_tax_deductibly,
                            user,
                            extn_id,
                            site,
                            "site",
                            SitePayment)
        
class RecipientVote(models.Model):
    recipient = models.ForeignKey(Recipient, blank=True, null=True)
    user = models.ForeignKey(User)
    name = models.CharField(max_length=200)
    url = models.URLField(blank=True, null=True)
    
    class Meta:
        ordering = ('url', 'name')
    
    @classmethod
    def Initialize(klass):
        model_utils.mixin(RecipientVoteMixin, User)
        
    @classmethod
    def make(klass, name, user, url=None, recipient=None):
        return RecipientVote(name=name,
                             url=url,
                             user=user,
                             recipient=recipient)
        
    def __unicode__(self):
        return "%s (%s) from %s --> %s" % (self.name,
                                           self.url,
                                           self.user.private_key,
                                           self.recipient)


class RecipientVoteMixin(object):
    """ mixed into User class """
    
    @property
    def recipient_votes(self):
        return RecipientVote.objects.filter(user=self)

class Report(models.Model):
    dtime = models.DateTimeField(db_index=True)
    user = models.ForeignKey(User)
    type = models.CharField(max_length=100)
    subject = models.CharField(max_length=256, default="")
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    is_sent = models.BooleanField(default=False)
    
    @classmethod
    def Initialize(klass):
        model_utils.mixin(ReportMixin, User)

    @classmethod
    def make(klass, user, subject, message, type, is_read, is_sent, dtime):
        r = Report.get_or_none(user=user,
                               type=type,
                               dtime=dtime)
        if r:
            return r
        else:
            return Report(dtime=dtime,
                          user=user,
                          subject=subject,
                          message=message,
                          type=type,
                          is_read=is_read,
                          is_sent=is_sent)
    
    def deep_dict(self):
        return {'subject': self.subject,
                'message': self.message,
                'type': self.type,
                'is_sent': self.is_sent,
                'is_read': self.is_read,
                'datetime': self.dtime.ctime()}
        
    def __unicode__(self):
        return "%s (%s) %s -> %s: %s" % (self.dtime,
                                         self.user,
                                         self.type,
                                         self.subject,
                                         self.message)

class ReportMixin(object):
    """ mixed into User class """
    
    @property
    def reports(self):
        return Report.objects.filter(user=self).order_by('-dtime')
    

class MetaReport(models.Model):
    TYPE_LIST = ["WEEKLY", "ANNOUNCEMENT", "THANKYOU", "NEWSLETTER", "TAX"]
    type_max_len, TYPES, TYPE_CHOICES = model_utils.convert_to_choices(TYPE_LIST)
    
    dtime = models.DateTimeField(db_index=True)
    recipient = models.ForeignKey(Recipient)
    type = models.CharField(max_length=type_max_len, choices=TYPE_CHOICES, default=TYPES['WEEKLY'])
    subject = models.CharField(max_length=256)
    message = models.TextField()
    is_draft = models.BooleanField(default=True)
    
    @classmethod
    def Initialize(klass):
        model_utils.mixin(MetaReportMixin, Recipient)
        models.signals.pre_save.connect(MetaReport.sanitize_user_input, sender=MetaReport)
        
    @classmethod
    def sanitize_user_input(klass, signal, sender, instance, **kwargs):
        """
        remove html tags
        """
        v_re = re.compile(r'<.*?>')
        for field in ["subject", "message"]:
            if getattr(instance, field):
                setattr(instance, field, v_re.sub('', getattr(instance, field)))

    @classmethod
    def make(klass, recipient, subject, message, type, is_draft, dtime):
        return Report(dtime=dtime,
                      user=user,
                      subject=subject,
                      message=message,
                      type=type,
                      is_draft=is_draft)
            
    def deep_dict(self):
        return {'subject': self.subject,
                'message': self.message,
                'recipient_slug': self.recipient.slug,
                'type': self.get_type_display().lower(),
                'is_draft' : self.is_draft,
                'datetime': self.dtime.ctime()}
        
    def __unicode__(self):
        return "%s. %s (%s) %s -> %s: %s" % (self.is_draft,
                                             self.dtime,
                                             self.recipient.slug,
                                             self.get_type_display(),
                                             self.subject,
                                             self.message)

class MetaReportMixin(object):
    """ mixed into User class """
    
    @property
    def reports(self):
        return Report.objects.filter(user=self).order_by('-dtime')
    
class WaitList(models.Model):
    """
    """
    email = models.ForeignKey(Email)
    note = models.TextField(blank=True, null=True)
    number_times_contacted = models.IntegerField(default=0)
    last_contacted_date = models.DateTimeField(auto_now=True)
    date_added = models.DateTimeField(auto_now_add=True)
    remove_key = models.CharField(max_length=20, default="")
    
    @classmethod
    def make(klass, email, note=None):
        """
        @param email: string email
        """
        email = email and Email.get_or_create(email) or None
        return WaitList(email=email, note=note, remove_key=klass._create_remove_key(16))
        
    @classmethod
    def _create_remove_key(klass, bits):
        alphas = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        ret = []
        for i in range(bits):
            ret.append(alphas[random.randint(0,len(alphas)-1)])
        return "".join(ret)

    def __unicode__(self):
        return u"%s [%s] - %s - %s - %s - %s" % (self.email,
                                            self.remove_key,
                                            self.number_times_contacted,
                                            self.last_contacted_date,
                                            self.date_added,
                                            self.note)
    
ALL_MODELS = [Email,
              User,
              Site,
              SiteGroup,
              Tag,
              Category,
              Recipient,
              SiteVisit,
              SiteGroupVisit,
              RecipientVisit,
              RecipientVoteVisit,
              TagVisit,
              PaymentService,
              SitePayment,
              RecipientPayment,
              SiteGroupTagging,
              RecipientUserTagging,
              RecipientVote,
              Report,
              MetaReport,
              WaitList]

