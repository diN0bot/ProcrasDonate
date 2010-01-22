import datetime
import re

from procrasdonate.models import *

from django.utils import simplejson as json

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
            "id": 3,
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
        #print "\nPROCESS TOTAL", total
        #print "   %s secs, %s cents" % (total['total_time'],
        #                                total['total_amount'])
        ret = None
        
        total_amount = float( total['total_amount'] )
        total_time   = float( total['total_time'] )
        dtime         = Processor.parse_seconds(int(total['datetime']))

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
                    rvote = RecipientVote.add(name, user)
                ret = RecipientVoteVisit.add(rvote,
                                             dtime,
                                             total_time,
                                             total_amount,
                                             user,
                                             extn_id)
                
                # adjust totals
                TotalRecipientVote.process(rvote, total_amount, total_time, dtime)
                TotalUser.process(user, total_amount, total_time, dtime)
            else:
                ret = RecipientVisit.add(recipient,
                                         dtime,
                                         total_time,
                                         total_amount,
                                         user,
                                         extn_id)
                # adjust totals
                TotalRecipient.process(recipient, total_amount, total_time, dtime)
                TotalUser.process(user, total_amount, total_time, dtime)
                
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
            # adjust totals
            #if 'weekly_requires_payment' in total and total['weekly_requires_payment']:
            if tag == "TimeWellSpent":
                #print "WEEKLY REQUIRES PAYMENT", total['weekly_requires_payment']
                TotalSiteGroup.process(sitegroup, total_amount, total_time, dtime)
                TotalUser.process(user, total_amount, total_time, dtime)
            else:
                TotalPDSiteGroup.process(sitegroup, total_amount, total_time, dtime)
            
        elif 'Site' == total['contenttype']:
            url     = total['content']['url']
            tag     = total['content']['tag']
            extn_id = int(total['content']['id'])
            site = Site.get_or_create(url=url)
            
            ret = SiteVisit.add(site, dtime, total_time, total_amount, user, extn_id)
            # adjust totals
            TotalSite.process(site, total_amount, total_time, dtime)
        
        elif 'Tag' == total['contenttype']:
            tagtag     = total['content']['tag']
            extn_id = int(total['content']['id'])
            
            tag = Tag.get_or_none(tag=tagtag)
            if not tag:
                tag = Tag.add(tag=tagtag)
            
            ret = TagVisit.add(tag, dtime, total_time, total_amount, user, extn_id)
            # adjust totals
            TotalTag.process(tag, total_amount, total_time, dtime)
            
        return ret
    
    @classmethod
    def process_report(klass, report, user):
        """
        @param user: User
        @param report: dict of report obj, eg
          {
            "type": "weekly", 
            "message": "...email content....",
            "is_read": True, 
            "is_sent": False,
            "datetime": "1252539581"
          }
        """
        #print "\nPROCESS REPORT\n", json.dumps(report, indent=2)
        type        = report['type']
        message     = report['message']
        subject     = 'subject' in report and report['subject'] or 'no subject'
        is_read     = report['is_read']
        is_sent     = report['is_sent']
        dtime       = Processor.parse_seconds(int(report['datetime']))
        
        if "weekly" == type:
            if 'has_met_goal' in report:
                is_met = report['has_met_goal']
                difference = report['difference']
                seconds_saved = report['seconds_saved']
                
                user.add_goal(is_met, difference, float(seconds_saved) / 3600.0, Period.week(dtime))
        
        if (type == "weekly"):
            return Report.add(user, subject, message, type, is_read, is_sent, dtime)
    
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
        
        return Log.add(Log.LOG_TYPES[type], detail_type, message, user, dtime)
    
    @classmethod
    def process_prefs(klass, pref, user):
        Log.add(Log.LOG_TYPES["LOG"], "prefs", json.dumps(pref, indent=2), user)
        changed = False
        for field in ['email', 'weekly_affirmations', 'org_thank_yous', 'org_newsletters', 'tos']:
            if not field in pref:
                Log.add(Log.LOG_TYPES['LOG'], 'missing_pref', "%s not in %s" % (field, pref), user)
            elif getattr(user, field) != pref[field]:
                if field == 'email':
                    user.email = Email.get_or_create(pref['email'])
                else:
                    setattr(user, field, pref[field])
                changed = True
        if changed:
            user.save()
        
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
                "email": "info@ProcrasDonate.com", 
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
