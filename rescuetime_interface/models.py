from __future__ import division

from django.db import models
from lib import model_utils

from django.db.models.signals import post_save

from procrasdonate.applib.xpi_builder import XpiBuilder
from procrasdonate.models import User, Recipient

from rescuetime.api.access.AnalyticApiKey import AnalyticApiKey
from rescuetime.api.service.Service import Service

import datetime

class RescueTimeUser(models.Model):
    user = models.ForeignKey(User)
    recipient = models.ForeignKey(Recipient, null=True, blank=True)
    rescuetime_key = models.CharField(max_length=200)
    dollars_per_hr = models.FloatField()
    
    @classmethod
    def make(klass, rescuetime_key, recipient=None, user=None, dollars_per_hr=1.0):
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
    
    def data(self, params=None):
        a = AnalyticApiKey(self.rescuetime_key, "ProcrasDonate")
        s = Service()
    
        params = params or {}
        return s.fetch_data(a, params)
    
    def procrastination_data(self, params=None):
        data = self.data()
        ret = {'notes': data['notes'],
               'row_headers': data['row_headers'],
               'rows': []}
        
        for row in data['rows']:
            if row[5] < 0:
                ret['rows'].append(row)
        
        return ret
    
    def row_secs(self, row):
        """
        @param row: row from rescue time api
        """
        print row
        return int(row[1])
    
    def row_hrs(self, row):
        """
        @param row: row from rescue time api
        """
        return self.row_secs(row) / 3600.0
    
    def row_amt(self, row):
        """
        @param row: row from rescue time api
        """
        return self.row_secs(row) / 3600.0 * self.dollars_per_hr
    
    def row_name(self, row):
        """
        @param row: row from rescue time api
        """
        return row[3]
    
    def row_productivity(self, row):
        """
        @param row: row from rescue time api
        """
        return row[5]
    
    def total_pledged(self, params=None):
        ret = 0.0
        for row in self.procrastination_data(params)['rows']:
            ret += self.row_amt(row)
        return ret
    
    def __unicode__(self):
        return "%s gives $%s/hr to %s: %s." % (self.rescuetime_key,
                                               self.recipient.name,
                                               self.dollars_per_hr,
                                               self.user)
                                               

ALL_MODELS = [RescueTimeUser]
