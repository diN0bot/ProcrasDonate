from __future__ import division

from django.db import models
from lib import model_utils

from django.db.models.signals import post_save

from procrasdonate.applib.xpi_builder import XpiBuilder
from procrasdonate.models import User, Recipient

import datetime

class RescueTimeUser(models.Model):
    user = models.ForeignKey(User)
    recipient = models.ForeignKey(Recipient)
    rescuetime_key = models.CharField(max_length=200)
    dollars_per_hr = models.FloatField()
    
    @classmethod
    def make(klass, rescuetime_key, recipient, user=None, dollars_per_hr=1.0):
        rt = RescueTimeUser.get_or_none(rescuetime_key=rescuetime_key)
        if rt:
            return rt
        
        if not user:
            private_key = XpiBuilder.generate_private_key()
            user = User.add(private_key)
        return RescueTimeUser(user=user,
                              recipient=recipient,
                              rescuetime_key=rescuetime_key,
                              dollars_per_hr=dollars_per_hr)
    
    def __unicode__(self):
        return "%s gives $%s/hr to %s: %s." % (self.rescuetime_key,
                                               self.recipient.name,
                                               self.dollars_per_hr,
                                               self.user)
                                               

ALL_MODELS = [RescueTimeUser]
