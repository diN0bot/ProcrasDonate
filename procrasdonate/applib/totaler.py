from lib.django_from_shell import start_django
start_django()

from procrasdonate.models import *
from procrasdonate.processors import Processor

def delete_all_totals():
    # delete all totals
    for t in TotalTag.objects.all():
        t.delete()
    
    for t in TotalSite.objects.all():
        t.delete()
    
    for t in TotalSiteGroup.objects.all():
        t.delete()
    
    for t in TotalRecipient.objects.all():
        t.delete()
    
    for t in TotalUser.objects.all():
        t.delete()
        
def compute_totals_from_scratch():
    delete_all_totals()
    
    # process all visits
    for v in SiteVisit.objects.all():
        TotalSite.process(v.site, v.total_amount, v.total_time, v.dtime)
        TotalUser.process(v.user, v.total_amount, v.total_time, v.dtime)
    
    for v in SiteGroupVisit.objects.all():
        TotalSiteGroup.process(v.sitegroup, v.total_amount, v.total_time, v.dtime)
        TotalUser.process(v.user, v.total_amount, v.total_time, v.dtime)
    
    for v in RecipientVisit.objects.all():
        TotalRecipient.process(v.recipient, v.total_amount, v.total_time, v.dtime)
        TotalUser.process(v.user, v.total_amount, v.total_time, v.dtime)
        
    for v in TagVisit.objects.all():
        TotalTag.process(v.tag, v.total_amount, v.total_time, v.dtime)
        TotalUser.process(v.user, v.total_amount, v.total_time, v.dtime)

def test_total_processors():
    Processor.process_total({u'total_time': 100,
                             u'contenttype': u'SiteGroup',
                             u'total_amount': 100,
                             u'datetime': 1263013200,
                             u'content': {u'name': u'localhost:8000',
                                          u'host': u'localhost:8000',
                                          u'tag': u'ProcrasDonate',
                                          u'tax_exempt_status': False,
                                          u'url_re': None,
                                          u'id': u'3'},
                             u'timetype': u'Daily',
                             u'payments': [],
                             u'id': u'1975'}, User.objects.all()[0])

def test_periods():
    print "DAY:", Period.day()
    print "WEEK:", Period.week()
    print "YEAR:", Period.year()
    print "FOREVER:", Period.forever()

def test_goals():
    user = User.objects.all()[0]
    user.add_goal(True, 60, 120, Period.week())
    user.add_goal(True, 30, 90, Period.week())
    user.add_goal(False, -30, 30, Period.week())

def delete_all_goals():
    for g in Goal.objects.all():
        g.delete()
    
    for k in KeyValue.objects.all():
        k.value = 0
        k.save()

def compute_goals_from_reports():
    total_goals_met = 0
    total_goals = 0
    total_hours_saved = 0.0
    import re
    a_re = re.compile("this week: ([\d\.]+) hours")
    l_re = re.compile("limit: ([\d\.]+) hours")
    g_re = re.compile("goal: ([\d\.]+) hours")
    for r in Report.objects.all():
        if "weekly" == r.type:
            if "Congratulations" in r.message or "You're on a roll" in r.message:
                total_goals_met += 1
                is_met = True
            else:
                is_met = False
                
            total_goals += 1

            a = a_re.findall(r.message)
            l = l_re.findall(r.message)
            g = g_re.findall(r.message)

            a = a and float(a[0]) or 0
            l = l and float(l[0]) or 0
            g = g and float(g[0]) or 0

            if l > a:
                total_hours_saved += l - a
                hours_saved = l - a
            else:
                hours_saved = 0
            
            difference = g - a
            
            r.user.add_goal(is_met, difference, hours_saved, Period.week(r.dtime))
                
    print "total_goals_met", total_goals_met
    print "total_goals", total_goals
    print "hours_saved", total_hours_saved
    
    print "----"
    for k in KeyValue.objects.all():
        print k
        
def remove_duplicate_reports():
    # user_id$dtime.isoformat()$type
    v = {}
    i = 0
    for r in Report.objects.all():
        idx = "%s$%s$%s" % (r.user.id,
                            r.dtime.isoformat(),
                            r.type)
        if idx in v:
            r.delete()
            #print i, len(v.keys()), idx, "%s", r.message[:70].replace('\n', '')
        else:
            v[idx] = r.id
            print "-> added", idx
        i += 1

def fix_nonhostname_sitegroups():
    pass

if __name__ == "__main__":
    #compute_totals_from_scratch()
    #test_total_processors()
    #delete_all_totals()
    #test_periods()
    #test_goals()
    delete_all_goals()
    compute_goals_from_reports()
    #remove_duplicate_reports()
    