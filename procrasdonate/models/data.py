from django.db import models
from lib import model_utils

__all__ = ['OptionalUser', 'Site', 'Recipient', 'DailyRecipientPayment', 'DailyRecipientPledge', 'DailySitePayment', 'DailySitePledge']

class OptionalUser(models.Model):
    """
    Extension users may optionally provide us with their email address and other information
    for say an announcements list.
    """
    # currently defaults to twitter_username, but one day twitter_username may not be king.
    name = models.CharField(max_length=128)
    twitter_username = models.CharField(max_length=32, blank=True, null=True)
    hashed = models.CharField(max_length=255)
    email = models.EmailField(blank=True, null=True)
    url = models.URLField(blank=True, null=True)
    is_on_email_list = models.URLField(default=False)

class Site(models.Model):
    """
    Website
    """
    # regexp description valid urls
    regexp = models.CharField(max_length=128)
    url = models.URLField(null=True, blank=True)
    name = models.CharField(max_length=128, null=True, blank=True)
    description = models.CharField(max_length=256, null=True, blank=True)

class Recipient(models.Model):
    """
    Recipient of donations
    """
    twitter_username = models.CharField(max_length=32)
    # regexp description valid urls
    regexp = models.CharField(max_length=128)
    url = models.URLField(null=True, blank=True)
    name = models.CharField(max_length=128, null=True, blank=True)
    description = models.CharField(max_length=256, null=True, blank=True)

class DailySomething(models.Model):
    """
    Daily payment or pledge or something from a single user.
    If donated some money to some recipient for time spent on some site,
    then we expect two DailySomethings to be created: one for the site
    and one for the recipient (and possibly a second recipient if some 
    percent is also going to @ProcrasDonate). These two DailySomethings
    will doubly account for the time_spent and amount [donated]. That is,
    the time_spent and amount [donated] across all sites and recipients
    with the same incoming_tipjoy_transaction_id should cancel out.
    """
    # time of tipjoy payment
    time = models.DateTimeField()
    # time spent procrastinating in min. likely max is 24 (hr) * 60 (min)
    time_spent = models.FloatField()
    # amount donated
    amount = models.FloatField()
    # rate of payment in cents per hour
    rate = models.IntegerField()

    # transaction id of user extension's payment to @ProcrasDoante via TipJoy
    incoming_tipjoy_transaction_id = models.IntegerField()
    
    # permits continuity of user payments without giving away who is who
    # the who might be reconstructed based on behavior. 
    # that's why providing this info is a user preference.
    twitter_username_hash = models.CharField(max_length=255, blank=True, null=True)
    
    class Meta:
        abstract = True
        ordering = ('time',)

class DailyPledge(DailySomething):
    """
    """
    class Meta:
        abstract = True

class DailySitePledge(DailyPledge):
    """
    """
    site = models.ForeignKey(Site)

class DailyRecipientPledge(DailyPledge):
    """
    """
    recipient = models.ForeignKey(Recipient)

class DailyPayment(DailySomething):
    """
    """
    class Meta:
        abstract = True


class DailySitePayment(DailyPayment):
    """
    """
    site = models.ForeignKey(Site)

class DailyRecipientPayment(DailyPayment):
    """
    """
    recipient = models.ForeignKey(Recipient)
    # transaction id of @ProcrasDoante paying recipient via TipJoy
    outgoing_tipjoy_transaction_id = models.IntegerField(blank=True, null=True)

ALL_MODELS = [OptionalUser, Site, Recipient, DailyRecipientPayment, DailyRecipientPledge, DailySitePayment, DailySitePledge]