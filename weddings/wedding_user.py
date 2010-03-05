from django.db import models
import datetime

from lib import model_utils
from procrasdonate.models import User
from procrasdonate.applib.xpi_builder import XpiBuilder
from wedding import Wedding
    
class WeddingUser(models.Model):
    user = models.ForeignKey(User)
    receive_updates = models.BooleanField(default=False)
    
    def add_wedding(self, wedding):
        return WeddingImage.add(wedding, self)
    
    @classmethod
    def Make(klass, wedding):
        user = User.add(XpiBuilder.generate_private_key())
        return WeddingUser(user=user)
    
    def __unicode__(self):
        return "%s" % (self.wedding_user)

class WeddingUserTagging(models.Model):
    wedding_user = models.ForeignKey(WeddingUser)
    wedding = models.ForeignKey(Wedding)
    
    message = models.CharField(max_length=400, default="Congratulations!")
    total_donated = models.FloatField(default=0.0)
    
    @classmethod
    def Make(klass, wedding, user):
        w = WeddingUserTagging.get_or_none(wedding=wedding, user=user)
        if w:
            return w
        else:
            return WeddingUserTagging(wedding=wedding, user=user)
    
    def __unicode__(self):
        return "%s -> %s" % (self.wedding_user, self.wedding)

    @classmethod
    def Initialize(klass):
        model_utils.mixin(WeddingUserTaggingMixin, Wedding)
        
class WeddingUserTaggingMixin(object):
    """ mixed into Wedding class """
    
    def donors(self):
        return WeddingUserTagging.objects.filter(wedding=self)
    
    
ALL_MODELS = [WeddingUser, WeddingUserTagging]
