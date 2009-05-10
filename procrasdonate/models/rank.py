from django.db import models
from data import Site, Recipient

__all__ = ['OverallSiteAmount', 'OverallRecipientAmount', 'OverallSiteTime', 'OverallRecipientTime']

class OverallAmount(models.Model):
    """
    """
    rank = models.IntegerField()
    total_amount = models.FloatField()
    
    class Meta:
        abstract = True

class OverallSiteAmount(OverallAmount):
    """
    """
    site = models.ForeignKey(Site)

class OverallRecipientAmount(OverallAmount):
    """
    """
    recipient = models.ForeignKey(Recipient)
    
class OverallTime(models.Model):
    """
    """
    rank = models.IntegerField()
    total_time = models.FloatField()
    
    class Meta:
        abstract = True

class OverallSiteTime(OverallTime):
    """
    """
    site = models.ForeignKey(Site)

class OverallRecipientTime(OverallTime):
    """
    """
    recipient = models.ForeignKey(Recipient)
    
ALL_MODELS = [OverallSiteAmount, OverallRecipientAmount, OverallSiteTime, OverallRecipientTime]