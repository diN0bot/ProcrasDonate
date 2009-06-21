from django.db import models
from lib import model_utils

import re

__all__ = ['Email', 'User', 'Site', 'SiteGroup', 'Tag', 'Category', 'Recipient', 'DailySite', 'DailySiteGroup', 'DailyRecipient', 'DailyTag', 'RecipientPayment', 'SitePayment']

class Email(models.Model):
    email = models.EmailField()
    
    def send_email(self, message, subject, sender):
        pass
    
    @classmethod
    def get_or_create(klass, email):
        return Email.add(email)
    
    @classmethod
    def make(klass, email):
        e = Email.get_or_none(email=email)
        if e:
            return e
        else:
            return Email(email=email)
        
    def __unicode__(self):
        return u"%s" % self.email

class User(models.Model):
    """
    Extension users may optionally provide us with their email address and other information
    for say an announcements list.
    The hashed field, which is the only required field, is a user id generated by the extension.
    """
    hash = models.CharField(max_length=255)
    # currently defaults to twitter_username, but one day twitter_username may not be king.
    name = models.CharField(max_length=128, blank=True, null=True)
    twitter_name = models.CharField(max_length=32, blank=True, null=True)
    url = models.URLField(blank=True, null=True)
    email = models.ForeignKey(Email, blank=True, null=True)
    is_on_email_list = models.URLField(default=False)
    
    @classmethod
    def get_or_create(klass, hash):
        u = User.get_or_none(hash=hash)
        if not u:
            u = User.add(hash)
        return u
    
    @classmethod
    def make(klass, hash, name=None, twitter_name=None, url=None, email=None, is_on_email_list=False):
        return User(hash=hash,
                    name=name,
                    twitter_name=twitter_name,
                    url=url,
                    email=email,
                    is_on_email_list=is_on_email_list)
        
    def __unicode__(self):
        return u"%s - %s - %s - %s - %s - %s" % (self.hash,
                                                 self.name,
                                                 self.twitter_name,
                                                 self.url,
                                                 self.email,
                                                 self.is_on_email_list)

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
    url_re = models.CharField(max_length=128, null=True, blank=True)
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
    twitter_name = models.CharField(max_length=32, null=True, blank=True)
    name = models.CharField(max_length=128, null=True, blank=True)
    url = models.URLField(null=True, blank=True)
    email = models.EmailField()
    mission = models.CharField(max_length=256, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    is_visible = models.BooleanField(default=False)
    category = models.ForeignKey('Category', blank=True, null=True)
    
    @classmethod
    def make(klass,
             twitter_name=None,
             name=None,
             url=None,
             email=None,
             mission=None,
             description=None,
             is_visible=True,
             category=None):
        if category:
            category = Category.get_or_create(category)
        return Recipient(twitter_name=twitter_name,
                         name=name,
                         url=url,
                         email=email,
                         mission=mission,
                         description=description,
                         is_visible=is_visible, 
                         category=category)
        
    def __unicode__(self):
        return u"%s - %s - %s - %s" % (self.twitter_name,
                                       self.name,
                                       self.category,
                                       self.is_visible)

class Tag(models.Model):
    """
    """
    tag = models.CharField(max_length=64)
    
    @classmethod
    def get_or_create(klass, tag):
        print "GOC", tag
        t = Tag.get_or_none(tag=tag)
        if t:
            print t
            return t
        else:
            return Tag.add(tag)
    
    @classmethod
    def make(klass, tag):
        print "MAKE", tag
        return Tag(tag=tag)
    
    def __unicode__(self):
        return u"%s" % self.tag

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

class DailySomething(models.Model):
    """
    Daily payment or pledge or something from a single user.
    If donated some money to some recipient for time spent on some site,
    then we expect two DailySomethings to be created: one for the site
    and one for the recipient (and possibly a second recipient if some 
    percent is also going to @ProcrasDonate). These two DailySomethings
    will doubly account for the time_spent and amount [donated]. 
    The time_spent and amount [donated] across all sites and recipients
    with the same incoming_tipjoy_transaction_id should cancel out.
    """
    # time of tipjoy payment
    time = models.DateField()
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
    
    class Meta:
        abstract = True
        ordering = ('time',)
    
    def __unicode__(self):
        return u"%s :%s: - %s - %s cents" % (self.time,
                                             self.user.hash,
                                             self.total_time,
                                             self.total_amount)
    @classmethod
    def make(klass, time, total_time, total_amount, user, extn_id, extn_inst, extn_inst_name, the_klass):
        """
        """
        # total_amount / total_time
        rate = (total_amount * 3600) / total_time;
        the_inst = the_klass(time=time,
                             total_time=total_time,
                             total_amount=total_amount,
                             rate=rate,
                             user=user,
                             extn_id=extn_id)
        setattr(the_inst, extn_inst_name, extn_inst)
        return the_inst
        
class DailySiteGroup(DailySomething):
    """
    """
    sitegroup = models.ForeignKey(SiteGroup)
    
    @classmethod
    def make(klass, sitegroup, time, total_time, total_amount, user, extn_id):
       return DailySomething.make(time,
                                  total_time,
                                  total_amount,
                                  user,
                                  extn_id,
                                  sitegroup,
                                  "sitegroup",
                                  DailySiteGroup)
    
    def __unicode__(self):
        return "%s [[%s]]" % (self.sitegroup, super(DailySiteGroup, self).__unicode__())

class DailySite(DailySomething):
    """
    """
    site = models.ForeignKey(Site)
    
    @classmethod
    def make(klass, site, time, total_time, total_amount, user, extn_id):
       return DailySomething.make(time,
                                  total_time,
                                  total_amount,
                                  user,
                                  extn_id,
                                  site,
                                  "site",
                                  DailySite)
    
    def __unicode__(self):
        return "%s [[%s]]" % (self.site, super(DailySite, self).__unicode__())

class DailyRecipient(DailySomething):
    """
    """
    recipient = models.ForeignKey(Recipient)
    
    @classmethod
    def make(klass, recipient, time, total_time, total_amount, user, extn_id):
       return DailySomething.make(time,
                                  total_time,
                                  total_amount,
                                  user,
                                  extn_id,
                                  recipient,
                                  "recipient",
                                  DailyRecipient)
    
    def __unicode__(self):
        return "%s [[%s]]" % (self.recipient, super(DailyRecipient, self).__unicode__())

class DailyTag(DailySomething):
    """
    """
    tag = models.ForeignKey(Tag)
    
    @classmethod
    def make(klass, tag, time, total_time, total_amount, user, extn_id):
       return DailySomething.make(time,
                                  total_time,
                                  total_amount,
                                  user,
                                  extn_id,
                                  tag,
                                  "tag",
                                  DailyTag)
       
    def __unicode__(self):
        return "%s [[%s]]" % (self.tag, super(DailyTag, self).__unicode__())

class Payment(models.Model):
    """
    """
    # transaction id of user extension's payment to @ProcrasDoante via TipJoy
    incoming_tipjoy_transaction_id = models.IntegerField()
    
    # transaction id of @ProcrasDonate's payment via TipJoy 
    # to a recipient (twitter_name) or Site (url)
    outgoing_tipjoy_transaction_id = models.IntegerField(null=True, blank=True)

    class Meta:
        abstract = True
        ordering = ('incoming_tipjoy_transaction_id',)
       
class RecipientPayment(Payment):
    """
    """
    recipient = models.ForeignKey(Recipient)

class SitePayment(Payment):
    """
    """
    site = models.ForeignKey(Site)

ALL_MODELS = [Email, User, Site, SiteGroup, Tag, Category, Recipient, DailySite, DailySiteGroup, DailyRecipient, DailyTag, RecipientPayment, SitePayment]
