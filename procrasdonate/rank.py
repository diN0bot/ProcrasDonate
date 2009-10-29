from django.db import models
from data import *

import datetime
import random

class Aggregate(models.Model):
    """
    """
    # Valid Time Types                                                                                                                                                                
    TIME_TYPES = {'DAILY':'D',
                  'WEEKLY':'M',
                  'YEARLY':'Y',
                  'FOREVER':'F'}
    # for database (data, friendly_name)                                                                                                                                           
    TIME_TYPE_CHOICES = ((TIME_TYPES['DAILY'], 'Daily',),
                         (TIME_TYPES['WEEKLY'], 'Weekly',),
                         (TIME_TYPES['YEARLY'], 'Yearly',),
                         (TIME_TYPES['FOREVER'], 'All Time',))

    FOREVER = datetime.datetime(2222, 2, 2)

    total_amount = models.FloatField(default=0.0, db_index=True) # dollars
    total_time = models.FloatField(default=0.0, db_index=True) # hours
    total_donors = models.FloatField(default=0.0, db_index=True)
    time = models.DateField() # end of day, week or forever
    time_type = models.CharField(max_length=1, choices=TIME_TYPE_CHOICES)
    last_updated = models.DateTimeField()
    
    class Meta:
        abstract = True
    
    @classmethod
    def start_of_week(klass, d=None):
        d = d or datetime.datetime.now()
        x = datetime.datetime(d.year, d.month, d.day, 23, 59, 59)
        return x + datetime.timedelta(days=-1*x.weekday())
    
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
    def end_of_forever(klass):
        return klass.FOREVER
    
    @classmethod
    def max_value(klass, fieldname, time_type=None, time=None):
        time_type = time_type or Aggregate.TIME_TYPES['WEEKLY']
        time = time or Aggregate.end_of_week()
        return klass.objects.filter(time_type=time_type,
                                    time=time).aggregate(max=models.Max(fieldname))['max']
    
    @classmethod
    def max(klass, fieldname, time_type=None, time=None):
        max_value = klass.max_value(fieldname, time_type, time)
        if not max_value:
            return None
        
        elif fieldname == 'total_amount':
            return klass.get_or_none(total_amount=max_value)
        
        elif fieldname == 'total_time':
            return klass.get_or_none(total_time=max_value)
        
        elif fieldname == 'total_donors':
            return klass.get_or_none(total_donors=max_value)
        
        else:
            raise RuntimeException("no field for %s.max(%s)" % (klass, fieldname))
        
    @classmethod
    def make(klass, time_type, extn_id, extn_inst, extn_inst_name, the_klass, time=None):
        """
        @param extn_id: 
        @param extn_inst: 
        @param extn_inst_name: 
        @param the_klass:
        @param time: a datetime within the desired period
        """
        if time_type == klass.TIME_TYPES['DAILY']:
            time = klass.end_of_day(time)
        elif time_type == klass.TIME_TYPES['WEEKLY']:
            time = klass.end_of_week(time)
        elif time_type == klass.TIME_TYPES['FOREVER']:
            time = klass.end_of_forever(time)
            
        the_inst = the_klass(time=time, time_type=time_type, last_updated=datetime.datetime(1111, 1, 1))
        setattr(the_inst, extn_inst_name, extn_inst)
        return the_inst

class AggregateSiteGroup(Aggregate):
    """
    """
    sitegroup = models.ForeignKey(SiteGroup)
    
    @classmethod
    def make(klass, sitegroup, time_type, time=None):
       return Aggregate.make(time_type,
                             sitegroup,
                             "sitegroup",
                             AggregateSiteGroup,
                             time)

class AggregateRecipient(Aggregate):
    """
    """
    recipient = models.ForeignKey(Recipient)
    
    @classmethod
    def make(klass, recipient, time_type, time=None):
       return Aggregate.make(time_type,
                             recipient,
                             "recipient",
                             AggregateRecipient,
                             time)
    
    @classmethod
    def Initialize(klass):
        model_utils.mixin(AggregateRecipientMixin, Recipient)

class AggregateUser(Aggregate):
    """
    """
    user = models.ForeignKey(User)
    
    @classmethod
    def make(klass, user, time_type, time=None):
       return Aggregate.make(time_type,
                             user,
                             "user",
                             AggregateUser,
                             time)

class AggregateSite(Aggregate):
    """
    """
    site = models.ForeignKey(Site)
    
    @classmethod
    def make(klass, site, time_type, time=None):
       return Aggregate.make(time_type,
                             site,
                             "site",
                             AggregateSite,
                             time)

class AggregateTag(Aggregate):
    """
    """
    tag = models.ForeignKey(Tag)
    
    @classmethod
    def make(klass, tag, time_type, time=None):
       return Aggregate.make(time_type,
                             tag,
                             "tag",
                             AggregateTag,
                             time)
       
class StaffPick(models.Model):
    recipient = models.ForeignKey(Recipient)
    start = models.DateTimeField()
    end = models.DateTimeField()
    
    
    @classmethod
    def get_random(klass):
        now = datetime.datetime.now()
        current = StaffPick.objects.filter(start__lte=now, end__gte=now)
        count = current.count()
        if count:
            return current.order_by('?')[0]
        else:
            return None
        
    @classmethod
    def make(klass, recipient, start=None, end=None):
        start = start or Aggregate.start_of_week()
        end = end or Aggregate.end_of_week( start+datetime.timedelta(6) )
        return StaffPick(recipient=recipient,
                         start=start,
                         end=end)

class AggregateRecipientMixin(object):
    
    def weekly_aggregate(self):
        return AggregateRecipient.get_or_none(recipient=self,
                                              time_type=AggregateRecipient.TIME_TYPES["WEEKLY"],
                                              time=AggregateRecipient.end_of_week())
        
    def yearly_aggregate(self):
        return AggregateRecipient.get_or_none(recipient=self,
                                              time_type=AggregateRecipient.TIME_TYPES["YEARLY"],
                                              time=AggregateRecipient.end_of_year())
        
    def forever_aggregate(self):
        return AggregateRecipient.get_or_none(recipient=self,
                                              time_type=AggregateRecipient.TIME_TYPES["FOREVER"],
                                              time=AggregateRecipient.end_of_forever())

ALL_MODELS = [AggregateSiteGroup,
              AggregateRecipient,
              AggregateUser,
              AggregateSite,
              AggregateTag,
              StaffPick]
