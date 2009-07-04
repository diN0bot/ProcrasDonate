from django.db import models
from data import Site, Recipient

from data import *

__all__ = ['AggregateSiteGroup', 'AggregateRecipient', 'AggregateUser', 'AggregateSite', 'AggregateTag']

class Aggregate(models.Model):
    """
    """
    # Valid Time Types                                                                                                                                                                
    TIME_TYPES = {'DAILY':'D',
                  'WEEKLY':'M',
                  'FOREVER':'F'}
    # for database (data, friendly_name)                                                                                                                                           
    TIME_TYPE_CHOICES = ((TIME_TYPES['DAILY'], 'Daily',),
                         (TIME_TYPES['WEEKLY'], 'Weekly',),
                         (TIME_TYPES['FOREVER'], 'All Time',))

    total_amount = models.FloatField(default=0.0, db_index=True)
    total_time = models.FloatField(default=0.0, db_index=True)
    time = models.DateField()
    time_type = models.CharField(max_length=1, choices=TIME_TYPE_CHOICES, default=TIME_TYPES['DAILY'])
    last_updated = models.DateTimeField()
    
    class Meta:
        abstract = True

class AggregateSiteGroup(Aggregate):
    """
    """
    sitegroup = models.ForeignKey(SiteGroup)

class AggregateRecipient(Aggregate):
    """
    """
    recipient = models.ForeignKey(Recipient)

class AggregateUser(Aggregate):
    """
    """
    user = models.ForeignKey(User)

class AggregateSite(Aggregate):
    """
    """
    site = models.ForeignKey(Site)

class AggregateTag(Aggregate):
    """
    """
    tag = models.ForeignKey(Tag)

    
ALL_MODELS = [AggregateSiteGroup, AggregateRecipient, AggregateUser, AggregateSite, AggregateTag]