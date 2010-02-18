from django.db import models
import datetime

from lib import model_utils
from procrasdonate.models import Log

class Visitor(models.Model):
    dtime = models.DateTimeField(auto_now_add=True)
    # adword group, eg MatchingGift
    page_group = models.CharField(max_length=200)
    #page_detail = models.CharField(max_length=200)
    # click_to page from which user provided email address, eg "action"
    email_page = models.CharField(max_length=200)
    email = models.EmailField(null=True, blank=True)
    
    @classmethod
    def make(klass, page_group, email_page, email):
        return Visitor(page_group=page_group,
                       #page_detail=page_detail,
                       email_page=email_page,
                       email=email)
    
    def send_email(self, subject, message, from_email=None):
        """
        Sends an e-mail to this User.
        If DJANGO_SERVER is true, then prints email to console
        """
        model_utils.send_email(subject, message, self.email, from_email)
        
    def __unicode__(self):
        return "%s: %s, %s" % (self.email,
                               self.page_group,
                               #self.page_detail,
                               self.email_page)

ALL_MODELS = [Visitor]
