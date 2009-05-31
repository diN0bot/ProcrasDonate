from django.db import models
from data import Site, Recipient

from data import *

__all__ = ['AggregateSiteGroup', 'AggregateRecipient', 'AggregateUser'] #, 'SiteGroupRank', 'RecipientRank', 'UserRank']

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

    total_amount = models.FloatField(default=0.0)
    total_time = models.FloatField(default=0.0)
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

'''
#well, shoot and dang. can't you just use order by? heck yeah.

class Rank(models.Model):
    """
    """
    # Valid Ranking Metrics                                                                                                                                                        
    METRICS = {'TIME':'T',
               'AMOUNT':'A',
               'NEW':'N'}
    # for database (data, friendly_name)                                                                                                                                           
    METRIC_CHOICES = ((METRICS['TIME'], 'Total Time',),
                      (METRICS['AMOUNT'], 'Total Amount',),
                      (METRICS['NEW'], 'New',))

    rank = models.IntegerField()
    metric = models.CharField(max_length=1,
                              choices=METRIC_CHOICES,
                              default=METRICS['TIME'])
    
    class Meta:
        abstract = True

class SiteGroupRank(Rank):
    """
    """
    sitegroup = models.ForeignKey(SiteGroup)

class RecipientRank(Rank):
    """
    """
    recipient = models.ForeignKey(Recipient)

class UserRank(Rank):
    """
    """
    user = models.ForeignKey(User)
'''
    
ALL_MODELS = [AggregateSiteGroup, AggregateRecipient, AggregateUser] #, SiteGroupRank, RecipientRank, UserRank]