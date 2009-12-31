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
        
    #DETAIL_TYPES_LIST = ["GENERAL", "UNKNOWN", "DATA_FROM_EXTN", "AMAZON_RESPONSE"]
    #detail_max_len, DETAIL_TYPES, DETAIL_TYPE_CHOICES = model_utils.convert_to_choices(DETAIL_TYPES_LIST)
    
    #DETAIL_ERROR_LIST = ["b", "c"]
    #derror_ml, DETAIL_ERRORS, DETAIL_ERRORS_CHOICES = model_utils.convert_to_choices(DETAIL_ERROR_LIST)
    #DETAIL_INFO_LIST = ["b", "c"]
    #dinfo_ml, DETAIL_INFOS, DETAIL_INFOS_CHOICES = model_utils.convert_to_choices(DETAIL_INFO_LIST)
    #DETAIL_CHOICES = [DETAIL_ERRORS_CHOICES, DETAIL_INFOS_CHOICES]
    #detail_max_len = max(derror_ml, dinfo_ml)
    #detail_type = models.CharField(max_length=detail_max_len, choices=reduce(lambda x, y: x+y, DETAIL_TYPE_CHOICES))
    
    dtime = models.DateTimeField()
    log_type = models.CharField(max_length=log_max_len, choices=LOG_TYPE_CHOICES)

    detail_type = models.CharField(max_length=100, blank=True, null=True)
    message = models.TextField()
    user = models.ForeignKey(User, null=True)
    
    @classmethod
    def Debug(klass, message, detail="general", user=None, dt=None):
        return klass._add(message, Log.LOG_TYPES['DEBUG'], detail, user, dt)
    
    @classmethod
    def Info(klass, message, detail="general", user=None, dt=None):
        return klass._add(message, Log.LOG_TYPES['INFO'], detail, user, dt)
        
    @classmethod
    def Log(klass, message, detail="general", user=None, dt=None):
        return klass._add(message, Log.LOG_TYPES['LOG'], detail, user, dt)
    
    @classmethod
    def Warn(klass, message, detail="general", user=None, dt=None):
        return klass._add(message, Log.LOG_TYPES['WARN'], detail, user, dt)
        
    @classmethod
    def Error(klass, message, detail="general", user=None, dt=None):
        return klass._add(message, Log.LOG_TYPES['ERROR'], detail, user, dt)
        
    @classmethod
    def _add(klass, message, type, detail="general", user=None, dt=None):
        return Log.add(type, detail, message, user, dt)
    
    @classmethod
    def Initialize(klass):
        model_utils.mixin(LogMixin, User)
        
    @classmethod
    def make(klass, log_type, detail_type, message, user=None, dt=None):
        if not dt:
            dt = datetime.datetime.now()
        return Log(log_type=log_type, detail_type=detail_type, message=message, user=user, dtime=dt)
        
    def __unicode__(self):
        return u"%s (%s): %s" % (self.log_type, self.detail_type, self.message)


class LogMixin(object):
    """ mixed into User class """
    
    @property
    def logs(self):
        return Log.objects.filter(user=self).order_by('-dtime')


class UserStudy(models.Model):
    """
    """
    TYPES_LIST = ["TimeToCompleteReg", "NumberPDTags", "NumberTWSTags"]
    log_max_len, TYPES, TYPE_CHOICES = model_utils.convert_to_choices(TYPES_LIST)
    
    dtime = models.DateTimeField()    
    type = models.CharField(max_length=32)
    message = models.TextField()
    quant = models.FloatField()
    user = models.ForeignKey(User, null=True)
    
    @classmethod
    def make(klass, type, message, quant, user=None, dt=None):
        if not dt:
            dt = datetime.datetime.now()
        return UserStudy(type=type, message=message, quant=quant, user=user, dtime=dt)
        
    def __unicode__(self):
        return u"%s %s %s %s" % (self.type, self.message, self.data, self.user)

ALL_MODELS = [Log, UserStudy]
