from django.db import models
from lib import model_utils

from django.contrib.auth.models import User as RecipientUser
from django.db.models.signals import post_save

from django.template.defaultfilters import slugify

import re
import random

class Email(models.Model):
    """
    """
    email = models.EmailField(db_index=True)
    
    def send_email(self, message, subject, sender):
        pass
    
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
    The hashed field, which is the only required field, is a user id generated by the extension.
    """
    hash = models.CharField(max_length=10, db_index=True)
    # currently defaults to twitter_username, but one day twitter_username may not be king.
    # that day is now.
    name = models.CharField(max_length=128, blank=True, null=True)
    twitter_name = models.CharField(max_length=32, blank=True, null=True)
    url = models.URLField(blank=True, null=True)
    email = models.ForeignKey(Email, blank=True, null=True)
    on_email_list = models.BooleanField(default=False)
    
    @classmethod
    def get_or_create(klass, hash):
        u = User.get_or_none(hash=hash)
        if not u:
            u = User.add(hash)
        return u
    
    @classmethod
    def make(klass, hash, name=None, twitter_name=None, url=None, email=None, on_email_list=False):
        """
        @param email: string email
        """
        email = email and Email.get_or_create(email) or None
        return User(hash=hash,
                    name=name,
                    twitter_name=twitter_name,
                    url=url,
                    email=email,
                    on_email_list=on_email_list)
        
    def __unicode__(self):
        return u"%s - %s - %s - %s - %s - %s" % (self.hash,
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
    url = models.URLField()
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
        return Site(url=url, sitegroup=sitegroup)
    
    def __unicode__(self):
        return u"%s (%s)" % (self.url, self.sitegroup)

class SiteGroup(models.Model):
    """
    Domain-based group of Sites
    """
    host = models.CharField(max_length=128)
    # describes valid urls
    url_re = models.CharField(max_length=256, null=True, blank=True)
    name = models.CharField(max_length=128, null=True, blank=True)
    
    HOST_RE = re.compile("http://([^/]+)")
    
    @classmethod
    def extract_host(klass, url):
        match = SiteGroup.HOST_RE.match(url)
        if match:
            return match.groups()[0]
        return url
    
    @classmethod
    def get_or_create(klass, host, url_re=None, name=None):
        s = SiteGroup.get_or_none(host=host)
        if not s:
            s = SiteGroup.add(host)
        return s
    
    @classmethod
    def make(klass, host, url_re=None, name=None):
        return SiteGroup(host=host,
                         url_re=url_re,
                         name=name)
    
    def __unicode__(self):
        return u"%s" % self.host

class Recipient(models.Model):
    """
    Recipient of donations
    """
    slug = models.SlugField(db_index=True)
    name = models.CharField(max_length=128, null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    url = models.URLField(null=True, blank=True)
    twitter_name = models.CharField(max_length=32, null=True, blank=True)
    mission = models.CharField(max_length=256, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    is_visible = models.BooleanField(default=True)
    category = models.ForeignKey('Category', blank=True, null=True)
    employers_identification_number = models.CharField(max_length=32, blank=True, null=True)
    tax_exempt_status = models.BooleanField(default=True)
    
    admin_options = {'prepopulated_fields': {"slug": ("name",)} }
    
    class Meta:
        ordering = ('name',)
    
    @classmethod
    def make(klass,
             name,
             slug=None,
             email=None,
             url=None,
             twitter_name=None,
             mission=None,
             description=None,
             is_visible=True,
             category=None):
        if category:
            category = Category.get_or_create(category)
        return Recipient(name=name,
                         slug=slug or model_utils.slugify(name),
                         twitter_name=twitter_name,
                         url=url,
                         email=email,
                         mission=mission,
                         description=description,
                         is_visible=is_visible, 
                         category=category)
        
        
    def deep_dict(self):
        return {'name': self.name,
                'slug': self.slug,
                'email': self.email,
                'url': self.url,
                'twitter_name': self.twitter_name,
                'mission': self.mission,
                'description': self.description,
                'is_visible': self.is_visible,
                'category': self.category.category,
                'pd_registered': self.pd_registered(),
                'employers_identification_number': self.employers_identification_number,
                'tax_exempt_status': self.tax_exempt_status}
    
    def pd_registered(self):
        return self.fps_data and self.fps_data.good_to_go()
    
    def __unicode__(self):
        return u"%s - %s - %s" % (self.name,
                                  self.category,
                                  self.pd_registered())

class RecipientUserTagging(models.Model):
    user = models.ForeignKey(RecipientUser, unique=True)
    recipient = models.ForeignKey(Recipient)
    
    is_confirmed = models.BooleanField(default=False)
    confirmation_code = models.CharField(max_length=255, null=True, blank=True)
    
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
        import settings
        if settings.DJANGO_SERVER:
            print "="*60
            print "FROM:", from_email
            print "TO:", self.user.email
            print "SUBJECT:", subject
            print "MESSAGE:", message
        else:
            from django.core.mail import send_mail
            send_mail(subject, message, from_email, [self.user.email])
    
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
    dtime = models.DateField()
    # datetime server received visit from extension
    received_time = models.DateField(auto_now_add=True)
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
                                             self.user.hash,
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
    def make(klass, name, url, user, recipient=None):
        return RecipientVote(name=name,
                             url=url,
                             user=user,
                             recipient=recipient)
        
    def __unicode__(self):
        return "%s (%s) from %s --> %s" % (self.name,
                                           self.url,
                                           self.user.hash,
                                           self.recipient)

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
              TagVisit,
              PaymentService,
              SitePayment,
              RecipientPayment,
              SiteGroupTagging,
              RecipientUserTagging,
              RecipientVote]

