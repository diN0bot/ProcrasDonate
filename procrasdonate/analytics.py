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
    startdate = models.DateTimeField(db_index=True)
    enddate = models.DateTimeField(db_index=True)
    
    def startdate_html(self):
        #return self.startdate.strftime("%d %b (%a)")
        return self.startdate
    
    def enddate_display(self):
        #return self.enddate.strftime("%d %b (%a)")
        return self.enddate
    
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
    def _last_day(klass, d=None):
        d = d or datetime.datetime.now()
        return d - datetime.timedelta(days=1)
    
    @classmethod
    def _last_week(klass, d=None):
        d = d or datetime.datetime.now()
        x = d - datetime.timedelta(days=7)
        print "_last_week", d, x
        return x


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
    def last_day(klass, d=None):
        last_day = Period._last_day(d)
        return Period.get_or_create(klass.TYPES["DAILY"],
                                    klass.start_of_day(last_day),
                                    klass.end_of_day(last_day))
        
    @classmethod
    def week(klass, d=None):
        return Period.get_or_create(klass.TYPES["WEEKLY"],
                                    klass.start_of_week(d),
                                    klass.end_of_week(d))
    
    @classmethod
    def last_week(klass, d=None):
        last_week = Period._last_week(d)
        print "datetime last_week", last_week
        x = Period.get_or_create(klass.TYPES["WEEKLY"],
                                    klass.start_of_week(last_week),
                                    klass.end_of_week(last_week))
        print "period last_week", x
        return x
        
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
    
    def met_goals(self):
        return self.goals().filter(is_met=True)
    
    def add_goal(self, is_met, difference, hours_saved, period):
        print "ADD GOAL:", is_met, difference, hours_saved, period
        g = Goal.add(is_met, difference, hours_saved, period, self)
        
        # only add goal and hours to overall total if user is
        # authorized to make payments and has non-zero rate
        if self.authorized() and (float(self.pref('pd_dollars_per_hr')) > 0 or 
                                  float(self.pref('tws_dollars_per_hr')) > 0):
            if is_met:
                KeyValue.increment(KeyValue.KEYS['total_goals_met'])
            KeyValue.increment(KeyValue.KEYS['total_goals'])
            KeyValue.increment(KeyValue.KEYS['total_hours_saved'], hours_saved)
            print "ADD to KEY VALUE:"
            print KeyValue.get_or_none(key=KeyValue.KEYS['total_goals_met'])
            print KeyValue.get_or_none(key=KeyValue.KEYS['total_goals'])
            print KeyValue.get_or_none(key=KeyValue.KEYS['total_hours_saved'])
            
            if period.type == Period.TYPES['WEEKLY']:
                UserGoal.add(self, period, is_met, hours_saved)
            else:
                print "Cannot add user goal of non-weekly type: %s to %s" % (period, self)
                
    def goals_met_forever(self):
        return UserGoal.objects.filter(user=self, is_met=True).count()
    
    def total_goals_forever(self):
        return UserGoal.objects.filter(user=self).count()

class UserGoal(models.Model):
    """
    """
    user = models.ForeignKey(User)
    period = models.ForeignKey(Period)
    is_met = models.IntegerField(default=0)
    hours_saved = models.FloatField(default=0.0)
    
    @classmethod
    def make(klass, user, period, is_met, hours_saved):
        u = UserGoal.get_or_none(period=period, user=user)
        if not u:
            u = UserGoal(period=period,
                         user=user,
                         is_met=is_met,
                         hours_saved=hours_saved)
        return u
    
    def __unicode__(self):
        return u"%s --- %s: %s %s" % (self.user.private_key,
                                      self.period,
                                      self.is_met,
                                      self.hours_saved)

    @classmethod
    def Initialize(klass):
        model_utils.mixin(UserGoalMixin, User)
        
class UserGoalMixin(object):
    """ mixed into User class """
    
    def user_goals(self):
        return UserGoal.objects.filter(user=self)#.order_by('period__startdate')
    
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
    
    def dollars_paid(self):
        return self.total_paid / 100
    
    @classmethod
    def this_day(klass):
        return klass.objects.filter(period=Period.day())
    
    @classmethod
    def last_day(klass):
        return klass.objects.filter(period=Period.last_day())
    
    @classmethod
    def this_week(klass):
        return klass.objects.filter(period=Period.week())
    
    @classmethod
    def last_week(klass):
        print "totals", klass.objects.filter(period=Period.last_week())
        return klass.objects.filter(period=Period.last_week())
    
    @classmethod
    def days_this_week(klass):
        return klass.objects.filter(period__startdate__gte=Period.start_of_week(),
                                    period__type=Period.TYPES['DAILY'])
    
    @classmethod
    def this_year(klass):
        return klass.objects.filter(period=Period.year())
    
    @classmethod
    def forever(klass):
        return klass.objects.filter(period=Period.forever())
    
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

    def __unicode__(self):
        return "%s %s %s sec, %s cents" % (self.sitegroup.host,
                                           self.period,
                                           self.total_time,
                                           self.total_pledged)
    

class TotalPDSiteGroup(Total):
    """
    Incidentally tallied. ProcrasDonate SiteGroup--
     payment goes to recipient not content provider.
    """
    sitegroup = models.ForeignKey(SiteGroup)

    @classmethod
    def make(klass, sitegroup, period):
       return Total.make(period,
                         sitegroup,
                         "sitegroup",
                         TotalPDSiteGroup)
    @classmethod
    def process(klass, sitegroup, total_amount, total_time, dtime):
        for period in Period.periods(dtime):
            t = TotalPDSiteGroup.get_or_none(period=period, sitegroup=sitegroup)
            if not t:
                t = TotalPDSiteGroup.add(sitegroup, period)
            t.total_pledged += total_amount
            t.total_time += total_time
            t.save()

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


class TotalRecipientVote(Total):
    """
    """
    recipient_vote = models.ForeignKey(RecipientVote)
    
    @classmethod
    def make(klass, recipient_vote, period):
       return Total.make(period,
                         recipient_vote,
                         "recipient_vote",
                         TotalRecipientVote)
    
    @classmethod
    def process(klass, recipient_vote, total_amount, total_time, dtime):
        for period in Period.periods(dtime):
            t = TotalRecipientVote.get_or_none(period=period, recipient_vote=recipient_vote)
            if not t:
                t = TotalRecipientVote.add(recipient_vote, period)
            t.total_pledged += total_amount
            t.total_time += total_time
            t.save()
    
    def __unicode__(self):
        return "%s %s %s sec, %s cents" % (self.recipient_vote.name,
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
    
    @classmethod
    def make(klass, user, period):
        return Total.make(period,
                          user,
                          "user",
                          TotalUser)
    
    def corresponding_user_goal(self):
        #print
        #print self.period
        #print self.user
        if self.period.type == Period.TYPES["WEEKLY"]:
            #print "\n",UserGoal.objects.filter(user=self.user)
            x = UserGoal.get_or_none(user=self.user, period=self.period)
            #print x
            return x
        return None
                                        
    
    @classmethod
    def process(klass, user, total_amount, total_time, dtime):
        for period in Period.periods(dtime):
            t = TotalUser.get_or_none(period=period, user=user)
            if not t:
                t = TotalUser.add(user, period)
            t.total_pledged += total_amount
            t.total_time += total_time
            t.save()

    def __unicode__(self):
        return u"%s --- %s: %s secs, %s cents" % (self.user.private_key,
                                                         self.user.email.email,
                                                         self.total_time,
                                                         self.total_pledged)

    @classmethod
    def Initialize(klass):
        model_utils.mixin(TotalUserMixin, User)
        
class TotalUserMixin(object):
    """ mixed into User class """
    
    def total_this_day(self):
        t = TotalUser.this_day().filter(user=self)
        if len(t) > 1:
            print "ERROR: more than one Total per user per day: ", t, self
        return len(t) > 0 and t[0] or None
    
    def total_last_day(self):
        t = TotalUser.last_day().filter(user=self)
        if len(t) > 1:
            print "ERROR: more than one Total per user per day: ", t, self
        return len(t) > 0 and t[0] or None
    
    def total_this_week(self):
        t = TotalUser.this_week().filter(user=self)
        if len(t) > 1:
            print "ERROR: more than one Total per user per week ", t, self
        return len(t) > 0 and t[0] or None

    def total_last_week(self):
        print TotalUser.last_week()
        t = TotalUser.last_week().filter(user=self)
        if len(t) > 1:
            print "ERROR: more than one Total per user per week ", t, self
        return len(t) > 0 and t[0] or None
    
    def total_this_year(self):
        t = TotalUser.this_year().filter(user=self)
        if len(t) > 1:
            print "ERROR: more than one Total per user per year: ", t, self
        return len(t) > 0 and t[0] or None
    
    def total_forever(self):
        t = TotalUser.forever().filter(user=self)
        if len(t) > 1:
            print "ERROR: more than one Total per user per day: ", t, self
        return len(t) > 0 and t[0] or None
    
    def totals_days_this_week(self):
        return TotalUser.days_this_week().filter(user=self)


ALL_MODELS = [Period,
              Goal,
              UserGoal,
              KeyValue,
              TotalSiteGroup,
              TotalPDSiteGroup,
              TotalRecipient,
              TotalRecipientVote,
              TotalTag,
              TotalSite,
              TotalUser]
