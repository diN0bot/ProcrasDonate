
from south.db import db
from django.db import models
from adwords.models import *

class Migration:
    
    def forwards(self, orm):
        
        # Adding model 'Visitor'
        db.create_table('adwords_visitor', (
            ('id', orm['adwords.Visitor:id']),
            ('dtime', orm['adwords.Visitor:dtime']),
            ('page_group', orm['adwords.Visitor:page_group']),
            ('email_page', orm['adwords.Visitor:email_page']),
            ('email', orm['adwords.Visitor:email']),
        ))
        db.send_create_signal('adwords', ['Visitor'])
        
    
    
    def backwards(self, orm):
        
        # Deleting model 'Visitor'
        db.delete_table('adwords_visitor')
        
    
    
    models = {
        'adwords.visitor': {
            'dtime': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '75', 'null': 'True', 'blank': 'True'}),
            'email_page': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'page_group': ('django.db.models.fields.CharField', [], {'max_length': '200'})
        }
    }
    
    complete_apps = ['adwords']
