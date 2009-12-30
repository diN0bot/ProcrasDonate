from __future__ import division

from django.db import models
from lib import model_utils

from django.db.models.signals import post_save

import datetime

class TestType(models.Model):
    OS_TYPES_LIST = ["Windows", "Mac", "Ubuntu"]
    os_types_max_len, OS_TYPES, OS_TYPES_CHOICES = model_utils.convert_to_choices(OS_TYPES_LIST)
    
    OS_VERSION_LIST = ["7", "XP", "Vista", "X.4", "X.5", "X.6", "8.04", "9.06"]
    os_version_max_len, OS_VERSION, OS_VERSION_CHOICES = model_utils.convert_to_choices(OS_VERSION_LIST)
    
    FF_VERSION_LIST = ["3.0", "3.5", "3.6"]
    ff_max_len, FF_VERSION, FF_VERSION_CHOICES = model_utils.convert_to_choices(FF_VERSION_LIST)
    
    slug = models.CharField(max_length=200)
    name = models.CharField(max_length=200)
    os_type = models.CharField(max_length=os_types_max_len, choices=OS_TYPES_CHOICES)
    os_version = models.CharField(max_length=os_version_max_len, choices=OS_VERSION_CHOICES)
    ff_version = models.CharField(max_length=ff_max_len, choices=FF_VERSION_CHOICES)
    
    def test_runs(self):
        return TestRun.objects.filter(test_type=self).order_by('-dtime')
    
    def _strip_time(self, dtime):
        """
        @param dtime: datetime object
        @return: True if a and b are for the same day, False otherwise
        """
        return datetime.datetime(dtime.year, dtime.month, dtime.day)

    def test_runs_by_day(self):
        """
        returns [[test runs for today], [test runs for yesterday], [...], ...]
        """
        ret = [[]]
        idx = 0
        current_day = datetime.datetime.now()
        is_sameday = False
        print "*************************"
        for run in self.test_runs():
            print ""
            print " ...... is_sameday", is_sameday
            print " CURRENT", current_day
            print " RUN", run.dtime
            print " idx", idx, " len ret", len(ret)
            while self._strip_time(current_day) != self._strip_time(run.dtime):
                is_sameday = False
                if self._strip_time(current_day) > self._strip_time(run.dtime):
                    # subtract a day
                    current_day = current_day - datetime.timedelta(1)
                else:
                    raise "This wasn't supposed to happen: %s for %s" % (current_day, run.dtime)
                ret.append([])
                idx += 1
                if idx == 7:
                    print "BY DAY (a)", ret
                    return ret
            print " ...... is_sameday", is_sameday
            print " CURRENT", current_day
            print " RUN", run.dtime
            print " idx", idx, " len ret", len(ret)
            """
            if not is_sameday:
                ret.append([])
                idx += 1
                is_sameday = True
                if idx == 7:
                    print "BY DAY (b)", ret
                    return ret
            """
            ret[idx].append(run)
        print "BY DAY", ret
        return ret
    
    @classmethod
    def make(klass, slug, name, os_type, os_version, ff_version):
        return TestType(slug=slug,
                        name=name,
                        os_type=os_type,
                        os_version=os_version,
                        ff_version=ff_version)
    
    def __unicode__(self):
        return self.slug

class TestRun(models.Model):
    test_type = models.ForeignKey(TestType)
    dtime = models.DateTimeField(db_index=True)
    is_pass = models.BooleanField(default=False)
    number_fail = models.IntegerField(default=-1)
    total = models.IntegerField(default=-1)
    duration = models.IntegerField(default=-1)

    @classmethod
    def make(klass, test_type, dtime, is_pass=None, number_fail=None, total=None, duration=None):
        is_pass = is_pass or False
        number_fail = number_fail or -1
        total = total or -1
        duration = duration or -1
        if not isinstance(test_type, TestType):
            test_type = TestType.get_or_none(slug=test_type)
        if not test_type:
            raise Exception("Null test_type!")
        
        return TestRun(test_type=test_type,
                       dtime=dtime,
                       is_pass=is_pass,
                       number_fail=number_fail,
                       total=total,
                       duration=duration)
        
    def __unicode__(self):
        return "%s (%s) %s %s/%s (%s)" % (self.test_type,
                                          self.dtime,
                                          self.is_pass,
                                          self.number_fail,
                                          self.total,
                                          self.duration)

ALL_MODELS = [TestType, TestRun]
