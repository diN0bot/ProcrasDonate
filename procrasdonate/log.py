from django.db import models
from lib import model_utils

from data import User

import datetime
import re

class Log(models.Model):
    """
    """
    LOG_TYPES_LIST = ["DEBUG", "INFO", "LOG", "WARN", "ERROR"]
    log_max_len, LOG_TYPES, LOG_TYPE_CHOICES = model_utils.convert_to_choices(LOG_TYPES_LIST)
        
    DETAIL_ERROR_LIST = ["a", "b"]
    derror_ml, DETAIL_ERRORS, DETAIL_ERRORS_CHOICES = model_utils.convert_to_choices(DETAIL_ERROR_LIST)
    
    DETAIL_INFO_LIST = ["b", "c"]
    dinfo_ml, DETAIL_INFOS, DETAIL_INFOS_CHOICES = model_utils.convert_to_choices(DETAIL_INFO_LIST)

    DETAIL_CHOICES = [DETAIL_ERRORS_CHOICES, DETAIL_INFOS_CHOICES]
    detail_max_len = max(derror_ml, dinfo_ml)

    datetime = models.DateTimeField()
    log_type = models.CharField(max_length=log_max_len, choices=LOG_TYPE_CHOICES)
    # aggregate detail lists into single list. preserves duplicates...
    detail_type = models.CharField(max_length=detail_max_len, choices=reduce(lambda x, y: x+y, DETAIL_CHOICES))
    message = models.TextField()
    user = models.ForeignKey(User, null=True)
    
    @classmethod
    def make(klass, log_type, detail_type, message, user=None, dt=None):
        if not dt:
            dt = datetime.datetime.now()
        return Log(log_type=log_type, detail_type=detail_type, message=message, user=user, datetime=dt)
        
    def __unicode__(self):
        return u"%s (%s): %s" % (self.log_type, self.detail_type, self.message)

class UserStudy(models.Model):
    """
    """
    TYPES_LIST = ["TimeToCompleteReg", "NumberPDTags", "NumberTWSTags"]
    log_max_len, TYPES, TYPE_CHOICES = model_utils.convert_to_choices(TYPES_LIST)
    
    datetime = models.DateTimeField()    
    type = models.CharField(max_length=32)
    message = models.TextField()
    quant = models.FloatField()
    user = models.ForeignKey(User, null=True)
    
    @classmethod
    def make(klass, type, message, quant, user=None, dt=None):
        if not dt:
            dt = datetime.datetime.now()
        return UserStudy(type=type, message=message, quant=quant, user=user, datetime=dt)
        
    def __unicode__(self):
        return u"%s %s %s %s" % (self.type, self.message, self.data, self.user)

ALL_MODELS = [Log, UserStudy]
