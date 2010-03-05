from django.db import models
from django.contrib.contenttypes.models import ContentType

from lib import model_utils
from procrasdonate.models import Recipient, RecipientVote
import settings

import datetime
import re
import os

class Wedding(models.Model):
    slug = models.SlugField()
    title = models.CharField(max_length=200, default="Your title goes here")
    text = models.TextField(default="Your intro goes here")
    theme = models.ForeignKey('Theme', null=True, blank=True)
    code = models.CharField(max_length=64)
    
    def donees(self):
        return WeddingRecipientTagging.objects.filter(wedding=self)
    
    def images(self):
        return WeddingImage.objects.filter(wedding=self)
    
    def landing_images(self):
        return self.images().filter(type=WeddingImage.TYPES['Landing'])
    
    def thankyou_images(self):
        print WeddingImage.TYPES
        return self.images().filter(type=WeddingImage.TYPES['ThankYou'])
    
    @classmethod
    def Initialize(klass):
        models.signals.pre_save.connect(klass.sanitize_user_input, sender=klass)
    
    v_re = re.compile(r'<.*?>')
    @classmethod
    def sanitize_user_input(klass, signal, sender, instance, **kwargs):
        """
        remove html tags
        """
        for field in ["title", "text"]:
            if getattr(instance, field):
                setattr(instance, field, klass.v_re.sub('', getattr(instance, field)))
    
    alpha = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
    @classmethod
    def _create_code(klass):
        return "".join([alpha+[random.randint(0,30)] for i in range(1,len(alpha))   ])
        
    def __unicode__(self):
        return "%s: %s" % (self.slug, self.code)

# where files are stored after settings.MEDIA_ROOT
_IMAGE_UPLOAD_PATH = 'uploaded_img'
    
def _Get_Image_Path(filename, folder):
    """
    """
    if isinstance(folder, WeddingImage):
        folder = folder.wedding.slug

    path = '%s/%s/%s' % (_IMAGE_UPLOAD_PATH, folder, filename)
    fullpath = "%s%s/%s" % (settings.MEDIA_ROOT, _IMAGE_UPLOAD_PATH, folder)
    print "_GET_IMAGE_PATH", filename, folder, path, fullpath
    if not os.path.exists(fullpath):
        os.mkdir(fullpath)
    return path

filename_slug = re.compile('[^\w_\-\.]')
def get_image_path(instance, filename):
    """
    """
    ctype = ContentType.objects.get_for_model(instance)
    model = ctype.model
    
    print "get_image_page", instance, filename, model
    
    if model == "weddingimage":
        slug = filename_slug.sub('', filename.replace(' ', '_'))
        print "slug:", slug
        return _Get_Image_Path(slug, instance)
    
    else:
        # shouldn't happen
        print "FAIL get_image_patch", instance, filename
        #raise "FAIL get_image_page"

class WeddingImage(models.Model):
    TYPES_LIST = ["Landing", "ThankYou"]
    max_len, TYPES, TYPE_CHOICES = model_utils.convert_to_choices(TYPES_LIST)

    type = models.CharField(max_length=max_len, choices=TYPE_CHOICES)
    height = models.IntegerField(default=200)
    width = models.IntegerField(default=200)
    image = models.ImageField(upload_to=get_image_path, height_field="height", width_field="width")
    wedding = models.ForeignKey(Wedding)
    
    def __unicode__(self):
        return u"%s: %s (%s)" % (self.type, self.image.url, self.wedding)

class Theme(models.Model):
    name = models.CharField(max_length=200)
    background = models.CharField(max_length=20, default="", blank=True) 
    color = models.CharField(max_length=20, default="", blank=True) 
    font = models.CharField(max_length=20, default="", blank=True) 
    p = models.CharField(max_length=20, default="", blank=True) 
    ul = models.CharField(max_length=20, default="", blank=True) 
    ol = models.CharField(max_length=20, default="", blank=True) 
    a = models.CharField(max_length=20, default="", blank=True) 
    a_hover = models.CharField(max_length=20, default="", blank=True) 
    
    def __unicode__(self):
        return self.name

class WeddingRecipientTagging(models.Model):
    """
    Charities selected by wedding couple for visitors to donate to
    """
    wedding = models.ForeignKey(Wedding)
    recipient = models.ForeignKey(Recipient, null=True)
    recipient_vote = models.ForeignKey(RecipientVote, null=True)
    
    total_donated = models.FloatField(default=0.0)

ALL_MODELS = [Wedding, WeddingImage, Theme, WeddingRecipientTagging]
