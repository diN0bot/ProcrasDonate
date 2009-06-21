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

class TotalProcessor(Processor):
    """
    """
    @classmethod
    def process_json(klass, json, user):
        """
        """
        print
        print "process: ", json
        total_amount = float( json['total_amount'] )
        total_time   = float( json['total_time'] )
        time         = Processor.parse_json_time(json['time'])
            
        if 'recipient' in json:
            category     = json['recipient']['category']
            description  = json['recipient']['description']
            url          = json['recipient']['url']
            mission      = json['recipient']['mission']
            twitter_name = json['recipient']['twitter_name']
            name         = json['recipient']['name']
            extn_id      = int(json['recipient']['id'])
            
            recipient = Recipient.get_or_none(twitter_name=twitter_name)
            print " ---------- recipient", recipient
            if not recipient:
                #raise Exception("Paid unknown recipient! "+json)
                pass
            
            DailyRecipient.add(recipient=recipient,
                               total_amount=total_amount,
                               total_time=total_time,
                               time=time,
                               extn_id=extn_id,
                               user=user)
            
        elif 'sitegroup' in json:
            host    = json['sitegroup']['host']
            url_re  = json['sitegroup']['url_re']
            name    = json['sitegroup']['name']
            tag     = json['sitegroup']['tag']
            extn_id = int(json['sitegroup']['id'])
            
            sitegroup = SiteGroup.get_or_create(host=host,
                                                url_re=url_re,
                                                name=name)
            
            DailySiteGroup.add(sitegroup=sitegroup,
                               total_amount=total_amount,
                               total_time=total_time,
                               time=time,
                               extn_id=extn_id,
                               user=user)
            
        elif 'site' in json:
            host    = json['site']['host']
            url     = json['site']['url']
            url_re  = json['site']['url_re']
            name    = json['site']['name']
            tag     = json['site']['tag']
            extn_id = int(json['site']['id'])
            
            site = Site.get_or_create(url=url)
            
            DailySite.add(site=site,
                         total_amount=total_amount,
                         total_time=total_time,
                         time=time,
                         extn_id=extn_id,
                         user=user)
            
        elif 'tag' in json:
            tagtag     = json['tag']['tag']
            extn_id = int(json['tag']['id'])
            
            tag = Tag.get_or_none(tag=tagtag)
            if not tag:
                tag = Tag.add(tag=tagtag)
            
            DailyTag.add(tag=tag,
                         total_amount=total_amount,
                         total_time=total_time,
                         time=time,
                         extn_id=extn_id,
                         user=user)
            
        else:
            return False

        print "success"
        return True