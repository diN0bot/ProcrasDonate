
from south.db import db
from django.db import models
from crosstester.models import *

class Migration:
    
    def forwards(self, orm):
        
        # Adding model 'TestType'
        db.create_table('crosstester_testtype', (
            ('id', orm['crosstester.TestType:id']),
            ('slug', orm['crosstester.TestType:slug']),
            ('name', orm['crosstester.TestType:name']),
            ('os_type', orm['crosstester.TestType:os_type']),
            ('os_version', orm['crosstester.TestType:os_version']),
            ('ff_version', orm['crosstester.TestType:ff_version']),
        ))
        db.send_create_signal('crosstester', ['TestType'])
        
        # Adding model 'TestRun'
        db.create_table('crosstester_testrun', (
            ('id', orm['crosstester.TestRun:id']),
            ('test_type', orm['crosstester.TestRun:test_type']),
            ('dtime', orm['crosstester.TestRun:dtime']),
            ('is_pass', orm['crosstester.TestRun:is_pass']),
            ('number_fail', orm['crosstester.TestRun:number_fail']),
            ('total', orm['crosstester.TestRun:total']),
            ('duration', orm['crosstester.TestRun:duration']),
        ))
        db.send_create_signal('crosstester', ['TestRun'])
        
    
    
    def backwards(self, orm):
        
        # Deleting model 'TestType'
        db.delete_table('crosstester_testtype')
        
        # Deleting model 'TestRun'
        db.delete_table('crosstester_testrun')
        
    
    
    models = {
        'crosstester.testrun': {
            'dtime': ('django.db.models.fields.DateTimeField', [], {'db_index': 'True'}),
            'duration': ('django.db.models.fields.IntegerField', [], {'default': '-1'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_pass': ('django.db.models.fields.BooleanField', [], {'default': 'False', 'blank': 'True'}),
            'number_fail': ('django.db.models.fields.IntegerField', [], {'default': '-1'}),
            'test_type': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['crosstester.TestType']"}),
            'total': ('django.db.models.fields.IntegerField', [], {'default': '-1'})
        },
        'crosstester.testtype': {
            'ff_version': ('django.db.models.fields.CharField', [], {'max_length': '1'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'os_type': ('django.db.models.fields.CharField', [], {'max_length': '1'}),
            'os_version': ('django.db.models.fields.CharField', [], {'max_length': '1'}),
            'slug': ('django.db.models.fields.CharField', [], {'max_length': '200'})
        }
    }
    
    complete_apps = ['crosstester']
