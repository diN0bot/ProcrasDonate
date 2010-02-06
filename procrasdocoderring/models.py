from django.db import models
import datetime

from lib import model_utils
from procrasdonate.models import Log

'''
class DocoderRing(models.Model):
    ip = models.CharField(max_length=200, null=True, blank=True, verbose_name="Organization's Name")

    @classmethod
    def Initialize(klass):
        models.signals.post_save.connect(DocoderRing.visitor, sender=Visitor)

    @classmethod
    def send_to_ring(klass, action):
        KeyValue.increment('ring_ip', ip)
'''

ALL_MODELS = []
