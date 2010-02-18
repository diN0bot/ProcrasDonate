
from south.db import db
from django.db import models
from rescuetime_interface.models import *

class Migration:
    
    def forwards(self, orm):
        
        # Adding model 'RescueTimeUser'
        db.create_table('rescuetime_interface_rescuetimeuser', (
            ('id', orm['rescuetime_interface.RescueTimeUser:id']),
            ('user', orm['rescuetime_interface.RescueTimeUser:user']),
            ('recipient', orm['rescuetime_interface.RescueTimeUser:recipient']),
            ('rescuetime_key', orm['rescuetime_interface.RescueTimeUser:rescuetime_key']),
            ('dollars_per_hr', orm['rescuetime_interface.RescueTimeUser:dollars_per_hr']),
        ))
        db.send_create_signal('rescuetime_interface', ['RescueTimeUser'])
        
    
    
    def backwards(self, orm):
        
        # Deleting model 'RescueTimeUser'
        db.delete_table('rescuetime_interface_rescuetimeuser')
        
    
    
    models = {
        'procrasdonate.category': {
            'category': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'})
        },
        'procrasdonate.email': {
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '75', 'db_index': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'})
        },
        'procrasdonate.recipient': {
            'category': ('django.db.models.fields.related.ForeignKey', [], {'default': "orm['procrasdonate.Category'].objects.get(pk=37)", 'to': "orm['procrasdonate.Category']", 'null': 'True', 'blank': 'True'}),
            'charity_navigator_score': ('django.db.models.fields.IntegerField', [], {'null': 'True', 'blank': 'True'}),
            'city': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'country': ('django.db.models.fields.CharField', [], {'default': "'USA'", 'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'description': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'do_scale_logo': ('django.db.models.fields.BooleanField', [], {'default': 'False', 'blank': 'True'}),
            'employers_identification_number': ('django.db.models.fields.CharField', [], {'max_length': '32', 'null': 'True', 'blank': 'True'}),
            'facebook_name': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_sponsored': ('django.db.models.fields.BooleanField', [], {'default': 'False', 'blank': 'True'}),
            'is_visible': ('django.db.models.fields.BooleanField', [], {'default': 'True', 'blank': 'True'}),
            'last_modified': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'logo': ('django.db.models.fields.files.ImageField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'mailing_address': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'mission': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'office_phone': ('django.db.models.fields.CharField', [], {'max_length': '15', 'null': 'True', 'blank': 'True'}),
            'pd_experience_video': ('django.db.models.fields.URLField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'promotional_video': ('django.db.models.fields.URLField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'slug': ('django.db.models.fields.SlugField', [], {'max_length': '50', 'db_index': 'True'}),
            'sponsoring_organization': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'state': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'tax_exempt_status': ('django.db.models.fields.BooleanField', [], {'default': 'False', 'blank': 'True'}),
            'twitter_name': ('django.db.models.fields.CharField', [], {'max_length': '32', 'null': 'True', 'blank': 'True'}),
            'url': ('django.db.models.fields.URLField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'})
        },
        'procrasdonate.user': {
            'email': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['procrasdonate.Email']", 'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '128', 'null': 'True', 'blank': 'True'}),
            'on_email_list': ('django.db.models.fields.BooleanField', [], {'default': 'False', 'blank': 'True'}),
            'org_newsletters': ('django.db.models.fields.BooleanField', [], {'default': 'False', 'blank': 'True'}),
            'org_thank_yous': ('django.db.models.fields.BooleanField', [], {'default': 'False', 'blank': 'True'}),
            'private_key': ('django.db.models.fields.CharField', [], {'max_length': '64', 'db_index': 'True'}),
            'registration_done': ('django.db.models.fields.BooleanField', [], {'default': 'False', 'blank': 'True'}),
            'sent_completed_registration_email': ('django.db.models.fields.BooleanField', [], {'default': 'False', 'blank': 'True'}),
            'sent_initial_email': ('django.db.models.fields.BooleanField', [], {'default': 'False', 'blank': 'True'}),
            'sent_stalling_registration_email': ('django.db.models.fields.BooleanField', [], {'default': 'False', 'blank': 'True'}),
            'tos': ('django.db.models.fields.BooleanField', [], {'default': 'False', 'blank': 'True'}),
            'twitter_name': ('django.db.models.fields.CharField', [], {'max_length': '32', 'null': 'True', 'blank': 'True'}),
            'url': ('django.db.models.fields.URLField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'version': ('django.db.models.fields.CharField', [], {'default': "'0.0.0'", 'max_length': '10'}),
            'weekly_affirmations': ('django.db.models.fields.BooleanField', [], {'default': 'False', 'blank': 'True'})
        },
        'rescuetime_interface.rescuetimeuser': {
            'dollars_per_hr': ('django.db.models.fields.FloatField', [], {}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'recipient': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['procrasdonate.Recipient']"}),
            'rescuetime_key': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['procrasdonate.User']"})
        }
    }
    
    complete_apps = ['rescuetime_interface']
