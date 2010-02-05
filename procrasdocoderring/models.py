from django.db import models
import datetime

from lib import model_utils
from procrasdonate.models import Log


class DocoderRing(models.Model):

    @classmethod
    def Initialize(klass):
        models.signals.post_save.connect(DocoderRing.visitor, sender=Visitor)

    @classmethod
    def send_to_ring(klass, action):
        KeyValue.increment('ring_ip', ip)

        

ALL_MODELS = [Visitor]
