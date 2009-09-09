from django.db import models
from lib import model_utils

import re

__all__ = ['Log', 'UserStudy']

class Log(models.Model):
    """
    """
    LOG_TYPES_LIST = ["DEBUG", "INFO", "LOG", "WARN", "ERROR"]
    log_max_len, LOG_TYPES, LOG_TYPE_CHOICES = model_utils.convert_to_choices(LOG_TYPES_LIST)
    
    DETAIL_ERROR_LIST = ["a", "b"]
    derror_ml, DETAIL_ERRORS, DETAIL_ERRORS_CHOICES = model_utils.convert_to_choices(DETAIL_ERROR_LIST)
    
    DETAIL_INFO_LIST = ["b", "c"]
    dinfo_ml, DETAIL_INFOS, DETAIL_INFOS_CHOICES = model_utils.convert_to_choices(DETAIL_INFO_LIST)
    
    def _aggregate_dicts(self, dicts):
        ret = {}
        for dict in dicts:
            ret.update(dict)
        return ret
    DETAIL_CHOICES = _aggregate_dicts(DETAIL_ERRORS_CHOICES, DETAIL_INFO_CHOICES)

    datetime = models.DateTimeField(auto_add=True)    
    log_type = models.CharField(max_length=max_length, choices=TYPES_CHOICES)
    detail_type = models.CharField(max_length=1, choices=DETAIL_CHOICES)
    message = models.TextField()
    
    @classmethod
    def make(klass, log_type, detail_type, message):
        return Log(log_type=log_type, detail_type=detail_type, message=message)
        
    def __unicode__(self):
        return u"%s (%s): %s" % (self.log_type, self.detail_type, self.message)

class UserStudy(models.Model):
    """
    """
    LOG_TYPES_LIST = ["TimeToCompleteReg", "NumberPDTags", "NumberTWSTags"]
    VISIBLE_LOG_TYPES_LIST = []
    log_max_len, LOG_TYPES, LOG_TYPE_CHOICES = model_utils.convert_to_choices(LOG_TYPES_LIST)
    
    datetime = models.DateTimeField(auto_add=True)    
    type = models.CharField(max_length=32)
    message = models.TextField()
    quant = models.FloatField()
    user = models.ForeignKey(User)
    
    @classmethod
    def make(klass, type, message, quant, user):
        return Log(type=type, message=message, quant=quant, user=user)
        
    def __unicode__(self):
        return u"%s %s %s %s" % (self.type, self.message, self.data, self.user)

ALL_MODELS = [Log, UserStudy]
