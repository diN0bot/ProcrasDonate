from django.db import models
from data import *

import decimal
import datetime

class Period(models.Model):
    """
    """
    TYPE_LIST = ["DAILY", "WEEKLY", "YEARLY", "FOREVER"]
    type_max_len, TYPES, TYPE_CHOICES = model_utils.convert_to_choices(TYPE_LIST)
    
    type = models.CharField(max_length=type_max_len, choices=TYPE_CHOICES)
    startdate = models.DateTimeField()
    enddate = models.DateTimeField()
    
    @classmethod
    def make(klass, type, startdate, enddate):
        return Period(type=type, startdate=startdate, enddate=enddate)
    
    @classmethod
    def get_or_create(klass, type, startdate, enddate):
        p = Period.get_or_none(type=type, startdate=startdate, enddate=enddate)
        if not p:
            p = Period.add(type, startdate, enddate)
        return p
        
    @classmethod
    def start_of_day(klass, d=None):
        d = d or datetime.datetime.now()
        return datetime.datetime(d.year, d.month, d.day, 0, 0, 0)
    
    @classmethod
    def start_of_week(klass, d=None):
        d = d or datetime.datetime.now()
        x = datetime.datetime(d.year, d.month, d.day, 0, 0, 0)
        return x + datetime.timedelta(days=-1*x.weekday())
    
    @classmethod
    def start_of_year(klass, d=None):
        d = d or datetime.datetime.now()
        return datetime.datetime(d.year, 1, 1, 0, 0, 0)
    
    @classmethod
    def start_of_forever(klass, d=None):
        return datetime.datetime.min
    
    @classmethod 
    def end_of_day(klass, d=None):
        d = d or datetime.datetime.now()
        return datetime.datetime(d.year, d.month, d.day, 23, 59, 59)
    
    @classmethod 
    def end_of_week(klass, d=None):
        d = d or datetime.datetime.now()
        x = datetime.datetime(d.year, d.month, d.day, 23, 59, 59)
        return x + datetime.timedelta(days=6-x.weekday())
    
    @classmethod 
    def end_of_year(klass, d=None):
        d = d or datetime.datetime.now()
        return datetime.datetime(d.year, 12, 31, 23, 59, 59)

    @classmethod
    def end_of_forever(klass, d=None):
        return datetime.datetime.max
        
    @classmethod
    def day(klass, d=None):
        return Period.get_or_create(klass.TYPES["DAILY"],
                                    klass.start_of_day(d),
                                    klass.end_of_day(d))
        
    @classmethod
    def week(klass, d=None):
        return Period.get_or_create(klass.TYPES["WEEKLY"],
                                    klass.start_of_week(d),
                                    klass.end_of_week(d))
    
    @classmethod
    def year(klass, d=None):
        return Period.get_or_create(klass.TYPES["YEARLY"],
                                    klass.start_of_year(d),
                                    klass.end_of_year(d))

    @classmethod
    def forever(klass, d=None):
        return Period.get_or_create(klass.TYPES["FOREVER"],
                                    klass.start_of_forever(d),
                                    klass.end_of_forever(d))

    @classmethod
    def periods(klass, d=None, types=None):
        """
        @param types: list of types to retrieve
        @return: list of periods encapsulating d or now
        """
        types = types or klass.TYPE_LIST
        ret = []
        if "DAILY" in types:
            ret.append(klass.day(d))
        if "WEEKLY" in types:
            ret.append(klass.week(d))
        if "YEARLY" in types:
            ret.append(klass.year(d))
        if "FOREVER" in types:
            ret.append(klass.forever(d))
        return ret

    def __unicode__(self):
        return "%s: %s - %s" % (self.type, self.startdate, self.enddate)

class Goal(models.Model):
    """
    """
    is_met = models.BooleanField()
    difference = models.FloatField()
    hours_saved = models.FloatField(default=0.0)
    period = models.ForeignKey(Period) # weekly type
    user = models.ForeignKey(User)
    
    @classmethod
    def make(klass, is_met, difference, hours_saved, period, user):
        return Goal(is_met=is_met,
                    difference=difference,
                    hours_saved=hours_saved,
                    period=period,
                    user=user)
    
    @classmethod
    def Initialize(klass):
        model_utils.mixin(GoalMixin, User)
    
    def __unicode__(self):
        return "%s - %s: %s %s %s" % (self.user,
                                      self.period,
                                      self.is_met,
                                      self.difference,
                                      self.hours_saved)
        
class GoalMixin(object):
    
    def goals(self):
        return Goal.objects.filter(user=self)
    
    def add_goal(self, is_met, difference, hours_saved, period):
        #print "ADD GOAL:", is_met, difference, hours_saved, period
        g = Goal.add(is_met, difference, hours_saved, period, self)
        if is_met:
            KeyValue.increment(KeyValue.KEYS['total_goals_met'])
        KeyValue.increment(KeyValue.KEYS['total_goals'])

        KeyValue.increment(KeyValue.KEYS['total_hours_saved'], hours_saved)

class KeyValue(models.Model):
    """
    blarg
    """
    KEYS_LIST = ["total_goals_met", "total_goals", "total_hours_saved"]
    keys_max_len, KEYS, KEYS_CHOICES = model_utils.convert_to_choices(KEYS_LIST)
    
    key = models.CharField(max_length=keys_max_len, choices=KEYS_CHOICES)
    value = models.FloatField(default=0.0)
    
    @classmethod
    def increment(klass, key, value=1.0):
        """
        creates if does not already exist
        """
        v = KeyValue.get_or_none(key=key)
        if not v:
            v = KeyValue.add(key)
        v.value += value
        v.save()
    
    @classmethod
    def make(klass, key, value=0.0):
        return KeyValue(key=key, value=value)
    
    def __unicode__(self):
        return "%s = %s" % (self.get_key_display(), self.value)
    
'''
    value = models.DecimalField(max_digits=20, decimal_places=10, default=0)

    @classmethod
    def make(klass, key, value=0):
        if not isinstance(value, Decimal):
            value = Decimal(value)
        return KeyValue(key=key, value=value)
'''

class Total(models.Model):
    """
    """
    period = models.ForeignKey(Period)
    total_pledged = models.FloatField(default=0.0) # cents
    total_paid = models.FloatField(default=0.0) # cents
    total_time = models.FloatField(default=0.0) # seconds
    
    def hours(self):
        return self.total_time / (60*60)
    
    def dollars_pledged(self):
        return self.total_pledged / 100
    
    class Meta:
        abstract = True
            
    @classmethod
    def make(klass, period, extn_inst, extn_inst_name, the_klass):
        """
        @param period: period that total spans
        @param extn_inst: 
        @param extn_inst_name: 
        @param the_klass:
        """
        the_inst = the_klass(period=period)
        setattr(the_inst, extn_inst_name, extn_inst)
        return the_inst
    
class TotalSiteGroup(Total):
    """
    """
    sitegroup = models.ForeignKey(SiteGroup)

    @classmethod
    def make(klass, sitegroup, period):
       return Total.make(period,
                         sitegroup,
                         "sitegroup",
                         TotalSiteGroup)
    @classmethod
    def process(klass, sitegroup, total_amount, total_time, dtime):
        for period in Period.periods(dtime):
            t = TotalSiteGroup.get_or_none(period=period, sitegroup=sitegroup)
            if not t:
                t = TotalSiteGroup.add(sitegroup, period)
            t.total_pledged += total_amount
            t.total_time += total_time
            t.save()
            t = TotalSiteGroup.get_or_none(period=period, sitegroup=sitegroup)

    def __unicode__(self):
        return "%s %s %s sec, %s cents" % (self.sitegroup.host,
                                           self.period,
                                           self.total_time,
                                           self.total_pledged)
    
class TotalSite(Total):
    """
    """
    site = models.ForeignKey(Site)
    
    @classmethod
    def make(klass, site, period):
       return Total.make(period,
                         site,
                         "site",
                         TotalSite)
    
    @classmethod
    def process(klass, site, total_amount, total_time, dtime):
        for period in Period.periods(dtime):
            t = TotalSite.get_or_none(period=period, site=site)
            if not t:
                t = TotalSite.add(site, period)
            t.total_pledged += total_amount
            t.total_time += total_time
            t.save()
            t = TotalSite.get_or_none(period=period, site=site)
    
    def __unicode__(self):
        return "%s %s %s sec, %s cents" % (self.site.url,
                                           self.period,
                                           self.total_time,
                                           self.total_pledged)

class TotalRecipient(Total):
    """
    """
    recipient = models.ForeignKey(Recipient)
    
    @classmethod
    def make(klass, recipient, period):
       return Total.make(period,
                         recipient,
                         "recipient",
                         TotalRecipient)
    
    @classmethod
    def process(klass, recipient, total_amount, total_time, dtime):
        for period in Period.periods(dtime):
            t = TotalRecipient.get_or_none(period=period, recipient=recipient)
            if not t:
                t = TotalRecipient.add(recipient, period)
            t.total_pledged += total_amount
            t.total_time += total_time
            t.save()
    
    def __unicode__(self):
        return "%s %s %s sec, %s cents" % (self.recipient.name,
                                           self.period,
                                           self.total_time,
                                           self.total_pledged)

class TotalTag(Total):
    """
    """
    tag = models.ForeignKey(Tag)
    
    @classmethod
    def make(klass, tag, period):
       return Total.make(period,
                         tag,
                         "tag",
                         TotalTag)
    
    @classmethod
    def process(klass, tag, total_amount, total_time, dtime):
        for period in Period.periods(dtime):
            t = TotalTag.get_or_none(period=period, tag=tag)
            if not t:
                t = TotalTag.add(tag, period)
            t.total_pledged += total_amount
            t.total_time += total_time
            t.save()
    
    def __unicode__(self):
        return "%s %s %s sec, %s cents" % (self.tag,
                                           self.period,
                                           self.total_time,
                                           self.total_pledged)
       
class TotalUser(Total):
    """
    """
    user = models.ForeignKey(User)
    goals_met = models.IntegerField(default=0)
    hours_saved = models.FloatField(default=0.0)
    
    @classmethod
    def make(klass, user, period):
       return Total.make(period,
                         user,
                         "user",
                         TotalUser)
    
    @classmethod
    def process(klass, user, total_amount, total_time, dtime):
        for period in Period.periods(dtime):
            t = TotalUser.get_or_none(period=period, user=user)
            if not t:
                t = TotalUser.add(user, period)
            t.total_pledged += total_amount
            t.total_time += total_time
            t.save()

ALL_MODELS = [Period,
              Goal,
              KeyValue,
              TotalSiteGroup,
              TotalRecipient,
              TotalTag,
              TotalSite,
              TotalUser]
