import datetime
import re

from procrasdonate.models import *

class Processor(object):
    
    # should match time format of
    # yyyy-mm-hh HH:MM:SS
    JSON_TIME_FORMAT = re.compile("(?P<year>\d\d\d\d)-(?P<month>\d\d)-(?P<day>\d\d) (?P<hours>\d\d):(?P<minutes>\d\d):(?P<seconds>\d\d)")

    @classmethod
    def parse_json_time(klass, str):
        """
        @param str: yyyy-mm-hh HH:MM:SS
        @return: datetime
        """
        time = None
        m = Processor.JSON_TIME_FORMAT.match(str)
        if m:
            d = m.groupdict()
            time = datetime.datetime(year=int(d['year']),
                                     month=int(d['month']),
                                     day=int(d['day']),
                                     hour=int(d['hours']),
                                     minute=int(d['minutes']),
                                     second=int(d['seconds']))
        return time
    
    @classmethod
    def parse_seconds(klass, secs):
        return datetime.datetime.fromtimestamp(secs)

    @classmethod
    def process_total(klass, total, user):
        """
        @param user: User
        @param total: dict of total obj, eg
        {
            "total_time": 6333, 
            "contenttype": "SiteGroup", 
            "total_amount": 24.994236111110901, 
            "datetime": 1252555200, 
            "content": {
              "host": "localhost:8000", 
              "url_re": null, 
              "tag": "TimeWellSpent", 
              "name": "localhost:8000"
            }, 
            "timetype": "Daily",
            "payments": []
        }

        """
        ret = None
        
        total_amount = float( total['total_amount'] )
        total_time   = float( total['total_time'] )
        dtime         = Processor.parse_seconds(int(total['datetime']))
        
        from django.utils import simplejson as json
            
        if 'Recipient' == total['contenttype']:
            category     = total['content']['category']
            description  = total['content']['description']
            url          = total['content']['url']
            mission      = total['content']['mission']
            twitter_name = total['content']['twitter_name']
            name         = total['content']['name']
            slug         = total['content']['slug']
            extn_id      = int(total['content']['id'])
            
            recipient = Recipient.get_or_none(slug=slug)
            if not recipient:
                rvote = RecipientVote.get_or_none(name=name, user=user)
                if not rvote:
                    ret = RecipientVote.add(name, user)
            else:
                ret = RecipientVisit.add(recipient,
                                         dtime,
                                         total_time,
                                         total_amount,
                                         user,
                                         extn_id)
            
        elif 'SiteGroup' == total['contenttype']:
            host    = total['content']['host']
            url_re  = total['content']['url_re']
            name    = total['content']['name']
            tag     = total['content']['tag']
            extn_id = int(total['content']['id'])
            
            sitegroup = SiteGroup.get_or_create(host=host,
                                                url_re=url_re,
                                                name=name)

            ret = SiteGroupVisit.add(sitegroup,
                                     dtime,
                                     total_time,
                                     total_amount,
                                     user,
                                     extn_id)
            
            SiteGroupTagging.add(tag, sitegroup, user)
            
        elif 'Site' == total['contenttype']:
            url     = total['content']['url']
            tag     = total['content']['tag']
            extn_id = int(total['content']['id'])
            site = Site.get_or_create(url=url)
            
            ret = SiteVisit.add(site, dtime, total_time, total_amount, user, extn_id)
            
        elif 'Tag' == total['contenttype']:
            tagtag     = total['content']['tag']
            extn_id = int(total['content']['id'])
            
            tag = Tag.get_or_none(tag=tagtag)
            if not tag:
                tag = Tag.add(tag=tagtag)
            
            ret = TagVisit.add(tag, dtime, total_time, total_amount, user, extn_id)
            
        return ret
    
    @classmethod
    def process_log(klass, log, user):
        """
        @param user: User
        @param log: dict of log obj, eg
          {
            "detail_type": "test", 
            "message": "testing...1...2...3...", 
            "type": "INFO", 
            "id": "1", 
            "datetime": "1252539581"
          }
        """
        type        = log['type']
        detail_type = log['detail_type']
        message     = log['message']
        dtime       = Processor.parse_seconds(int(log['datetime']))
        
        return Log.add(type, detail_type, message, user, dtime)
    
    @classmethod
    def process_userstudy(klass, userstudy, user):
        """
        @param user: User
        @param userstudy: dict of userstudy obj, eg
          {
            "quant": "22.0", 
            "message": "testing...1...2...3...", 
            "type": "test", 
            "id": "1", 
            "datetime": "1252539581"
          }
        """
        type      = userstudy['type']
        quant     = userstudy['quant']
        message   = userstudy['message']
        dtime     = Processor.parse_seconds(int(userstudy['datetime']))
        
        return UserStudy.add(type, message, quant, user, dtime)
    
    @classmethod
    def process_payment(klass, payment, user):
        """
        """
        return None
    
    @classmethod
    def process_requirespayment(klass, requirespayment, user):
        """
        @param user: User
        @param requirespayment: dict of requirespayment obj, eg
          {
            "total": {
              "total_time": 1074, 
              "contenttype": "Recipient", 
              "total_amount": 1.4170833333333199, 
              "datetime": 1252555200, 
              "content": {
                "category": "Family Planning", 
                "is_visible": false, 
                "description": "description", 
                "url": "http://procrasdonate.com", 
                "mission": "mission", 
                "email": "info@procrasdonate.com", 
                "twitter_name": "ProcrasDonate", 
                "slug": "PD", 
                "name": "ProcrasDonate"
              }, 
              "timetype": "Daily",
              "payments": []
            }
          }
        """
        return None
