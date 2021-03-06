
from south.db import db
from django.db import models
from procrasdonate.models import *

class Migration:
    
    def forwards(self, orm):
        
        # Adding model 'Report'
        db.create_table('procrasdonate_report', (
            ('id', orm['procrasdonate.report:id']),
            ('dtime', orm['procrasdonate.report:dtime']),
            ('user', orm['procrasdonate.report:user']),
            ('type', orm['procrasdonate.report:type']),
            ('message', orm['procrasdonate.report:message']),
            ('is_read', orm['procrasdonate.report:is_read']),
            ('is_sent', orm['procrasdonate.report:is_sent']),
        ))
        db.send_create_signal('procrasdonate', ['Report'])
        
    
    
    def backwards(self, orm):
        
        # Deleting model 'Report'
        db.delete_table('procrasdonate_report')
        
    
    
    models = {
        'auth.group': {
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '80'}),
            'permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Permission']", 'blank': 'True'})
        },
        'auth.permission': {
            'Meta': {'unique_together': "(('content_type', 'codename'),)"},
            'codename': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'content_type': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['contenttypes.ContentType']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        },
        'auth.user': {
            'date_joined': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '75', 'blank': 'True'}),
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'groups': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Group']", 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'True', 'blank': 'True'}),
            'is_staff': ('django.db.models.fields.BooleanField', [], {'default': 'False', 'blank': 'True'}),
            'is_superuser': ('django.db.models.fields.BooleanField', [], {'default': 'False', 'blank': 'True'}),
            'last_login': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'password': ('django.db.models.fields.CharField', [], {'max_length': '128'}),
            'user_permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Permission']", 'blank': 'True'}),
            'username': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '30'})
        },
        'contenttypes.contenttype': {
            'Meta': {'unique_together': "(('app_label', 'model'),)", 'db_table': "'django_content_type'"},
            'app_label': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'model': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        'procrasdonate.aggregaterecipient': {
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'last_updated': ('django.db.models.fields.DateTimeField', [], {}),
            'recipient': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['procrasdonate.Recipient']"}),
            'time': ('django.db.models.fields.DateTimeField', [], {}),
            'time_type': ('django.db.models.fields.CharField', [], {'max_length': '1'}),
            'total_amount': ('django.db.models.fields.FloatField', [], {'default': '0.0', 'db_index': 'True'}),
            'total_donors': ('django.db.models.fields.FloatField', [], {'default': '0.0', 'db_index': 'True'}),
            'total_time': ('django.db.models.fields.FloatField', [], {'default': '0.0', 'db_index': 'True'})
        },
        'procrasdonate.aggregatesite': {
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'last_updated': ('django.db.models.fields.DateTimeField', [], {}),
            'site': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['procrasdonate.Site']"}),
            'time': ('django.db.models.fields.DateTimeField', [], {}),
            'time_type': ('django.db.models.fields.CharField', [], {'max_length': '1'}),
            'total_amount': ('django.db.models.fields.FloatField', [], {'default': '0.0', 'db_index': 'True'}),
            'total_donors': ('django.db.models.fields.FloatField', [], {'default': '0.0', 'db_index': 'True'}),
            'total_time': ('django.db.models.fields.FloatField', [], {'default': '0.0', 'db_index': 'True'})
        },
        'procrasdonate.aggregatesitegroup': {
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'last_updated': ('django.db.models.fields.DateTimeField', [], {}),
            'sitegroup': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['procrasdonate.SiteGroup']"}),
            'time': ('django.db.models.fields.DateTimeField', [], {}),
            'time_type': ('django.db.models.fields.CharField', [], {'max_length': '1'}),
            'total_amount': ('django.db.models.fields.FloatField', [], {'default': '0.0', 'db_index': 'True'}),
            'total_donors': ('django.db.models.fields.FloatField', [], {'default': '0.0', 'db_index': 'True'}),
            'total_time': ('django.db.models.fields.FloatField', [], {'default': '0.0', 'db_index': 'True'})
        },
        'procrasdonate.aggregatetag': {
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'last_updated': ('django.db.models.fields.DateTimeField', [], {}),
            'tag': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['procrasdonate.Tag']"}),
            'time': ('django.db.models.fields.DateTimeField', [], {}),
            'time_type': ('django.db.models.fields.CharField', [], {'max_length': '1'}),
            'total_amount': ('django.db.models.fields.FloatField', [], {'default': '0.0', 'db_index': 'True'}),
            'total_donors': ('django.db.models.fields.FloatField', [], {'default': '0.0', 'db_index': 'True'}),
            'total_time': ('django.db.models.fields.FloatField', [], {'default': '0.0', 'db_index': 'True'})
        },
        'procrasdonate.aggregateuser': {
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'last_updated': ('django.db.models.fields.DateTimeField', [], {}),
            'time': ('django.db.models.fields.DateTimeField', [], {}),
            'time_type': ('django.db.models.fields.CharField', [], {'max_length': '1'}),
            'total_amount': ('django.db.models.fields.FloatField', [], {'default': '0.0', 'db_index': 'True'}),
            'total_donors': ('django.db.models.fields.FloatField', [], {'default': '0.0', 'db_index': 'True'}),
            'total_time': ('django.db.models.fields.FloatField', [], {'default': '0.0', 'db_index': 'True'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['procrasdonate.User']"})
        },
        'procrasdonate.category': {
            'category': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'})
        },
        'procrasdonate.email': {
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '75', 'db_index': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'})
        },
        'procrasdonate.fpsmultiuseauth': {
            'caller_reference': ('django.db.models.fields.CharField', [], {'max_length': '28'}),
            'error_message': ('django.db.models.fields.CharField', [], {'max_length': '128', 'null': 'True', 'blank': 'True'}),
            'expiry': ('django.db.models.fields.CharField', [], {'max_length': '64', 'null': 'True', 'blank': 'True'}),
            'global_amount_limit': ('django.db.models.fields.CharField', [], {'max_length': '32'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'payment_reason': ('django.db.models.fields.CharField', [], {'max_length': '400'}),
            'recipient_slug_list': ('django.db.models.fields.CharField', [], {'max_length': '400'}),
            'status': ('django.db.models.fields.CharField', [], {'default': "'0'", 'max_length': '2'}),
            'timestamp': ('django.db.models.fields.DateTimeField', [], {}),
            'token_id': ('django.db.models.fields.CharField', [], {'max_length': '64', 'null': 'True', 'blank': 'True'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['procrasdonate.User']"})
        },
        'procrasdonate.fpsmultiusecanceltoken': {
            'error_code': ('django.db.models.fields.CharField', [], {'max_length': '64', 'null': 'True', 'blank': 'True'}),
            'error_message': ('django.db.models.fields.CharField', [], {'max_length': '256', 'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'reason_text': ('django.db.models.fields.CharField', [], {'max_length': '400', 'blank': 'True'}),
            'request_id': ('django.db.models.fields.CharField', [], {'max_length': '64', 'null': 'True', 'blank': 'True'}),
            'response_metadata': ('django.db.models.fields.CharField', [], {'max_length': '64', 'null': 'True', 'blank': 'True'}),
            'timestamp': ('django.db.models.fields.DateTimeField', [], {}),
            'token_id': ('django.db.models.fields.CharField', [], {'max_length': '32'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['procrasdonate.User']"})
        },
        'procrasdonate.fpsmultiusepay': {
            'caller_reference': ('django.db.models.fields.CharField', [], {'max_length': '28'}),
            'error_code': ('django.db.models.fields.CharField', [], {'max_length': '128', 'null': 'True', 'blank': 'True'}),
            'error_message': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'marketplace_fixed_fee': ('django.db.models.fields.CharField', [], {'max_length': '32'}),
            'marketplace_variable_fee': ('django.db.models.fields.CharField', [], {'max_length': '32'}),
            'recipient': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['procrasdonate.Recipient']"}),
            'recipient_token_id': ('django.db.models.fields.CharField', [], {'max_length': '64'}),
            'refund_token_id': ('django.db.models.fields.CharField', [], {'max_length': '64'}),
            'request_id': ('django.db.models.fields.CharField', [], {'max_length': '64', 'null': 'True', 'blank': 'True'}),
            'sender_token_id': ('django.db.models.fields.CharField', [], {'max_length': '64'}),
            'timestamp': ('django.db.models.fields.DateTimeField', [], {}),
            'transaction_amount': ('django.db.models.fields.CharField', [], {'max_length': '32'}),
            'transaction_id': ('django.db.models.fields.CharField', [], {'max_length': '64', 'null': 'True', 'blank': 'True'}),
            'transaction_status': ('django.db.models.fields.CharField', [], {'max_length': '2'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['procrasdonate.User']"})
        },
        'procrasdonate.fpsrecipient': {
            'caller_reference': ('django.db.models.fields.CharField', [], {'max_length': '28'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'recipient': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['procrasdonate.Recipient']"}),
            'refund_token_id': ('django.db.models.fields.CharField', [], {'max_length': '64', 'null': 'True', 'blank': 'True'}),
            'status': ('django.db.models.fields.CharField', [], {'default': "'0'", 'max_length': '2'}),
            'timestamp': ('django.db.models.fields.DateTimeField', [], {}),
            'token_id': ('django.db.models.fields.CharField', [], {'max_length': '64', 'null': 'True', 'blank': 'True'})
        },
        'procrasdonate.log': {
            'detail_type': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'dtime': ('django.db.models.fields.DateTimeField', [], {}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'log_type': ('django.db.models.fields.CharField', [], {'max_length': '1'}),
            'message': ('django.db.models.fields.TextField', [], {}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['procrasdonate.User']", 'null': 'True'})
        },
        'procrasdonate.paymentservice': {
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'user_url': ('django.db.models.fields.URLField', [], {'max_length': '200'})
        },
        'procrasdonate.recipient': {
            'category': ('django.db.models.fields.related.ForeignKey', [], {'default': "orm['procrasdonate.Category'].objects.get(pk=37)", 'to': "orm['procrasdonate.Category']", 'null': 'True', 'blank': 'True'}),
            'charity_navigator_score': ('django.db.models.fields.IntegerField', [], {'null': 'True', 'blank': 'True'}),
            'city': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'country': ('django.db.models.fields.CharField', [], {'default': "'USA'", 'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'description': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
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
        'procrasdonate.recipientpayment': {
            'amount_paid_in_fees': ('django.db.models.fields.FloatField', [], {'default': '0.0'}),
            'amount_paid_tax_deductibly': ('django.db.models.fields.FloatField', [], {'default': '0.0'}),
            'dtime': ('django.db.models.fields.DateTimeField', [], {'db_index': 'True'}),
            'extn_id': ('django.db.models.fields.IntegerField', [], {}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'payment_service': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['procrasdonate.PaymentService']"}),
            'recipient': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['procrasdonate.Recipient']"}),
            'settled': ('django.db.models.fields.BooleanField', [], {'default': 'False', 'blank': 'True'}),
            'total_amount_paid': ('django.db.models.fields.FloatField', [], {'default': '0.0'}),
            'transaction_id': ('django.db.models.fields.CharField', [], {'max_length': '32', 'db_index': 'True'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['procrasdonate.User']"})
        },
        'procrasdonate.recipientusertagging': {
            'blog_post': ('django.db.models.fields.CharField', [], {'default': "'T'", 'max_length': '1'}),
            'confirmation_code': ('django.db.models.fields.CharField', [], {'max_length': '33', 'null': 'True', 'blank': 'True'}),
            'email_to_supporters': ('django.db.models.fields.CharField', [], {'default': "'T'", 'max_length': '1'}),
            'event_postcard': ('django.db.models.fields.CharField', [], {'default': "'T'", 'max_length': '1'}),
            'homepage_link': ('django.db.models.fields.CharField', [], {'default': "'T'", 'max_length': '1'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_confirmed': ('django.db.models.fields.BooleanField', [], {'default': 'False', 'blank': 'True'}),
            'job_title': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'mailed_letter': ('django.db.models.fields.CharField', [], {'default': "'T'", 'max_length': '1'}),
            'mailed_postcard': ('django.db.models.fields.CharField', [], {'default': "'T'", 'max_length': '1'}),
            'newsletter_article': ('django.db.models.fields.CharField', [], {'default': "'T'", 'max_length': '1'}),
            'other_mailing': ('django.db.models.fields.CharField', [], {'default': "'T'", 'max_length': '1'}),
            'recipient': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['procrasdonate.Recipient']"}),
            'twitter_tweet': ('django.db.models.fields.CharField', [], {'default': "'T'", 'max_length': '1'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['auth.User']", 'unique': 'True'})
        },
        'procrasdonate.recipientvisit': {
            'dtime': ('django.db.models.fields.DateTimeField', [], {}),
            'extn_id': ('django.db.models.fields.IntegerField', [], {}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'rate': ('django.db.models.fields.FloatField', [], {'default': '0'}),
            'received_time': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'recipient': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['procrasdonate.Recipient']"}),
            'total_amount': ('django.db.models.fields.FloatField', [], {}),
            'total_time': ('django.db.models.fields.FloatField', [], {}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['procrasdonate.User']", 'null': 'True', 'blank': 'True'})
        },
        'procrasdonate.recipientvote': {
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'recipient': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['procrasdonate.Recipient']", 'null': 'True', 'blank': 'True'}),
            'url': ('django.db.models.fields.URLField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['procrasdonate.User']"})
        },
        'procrasdonate.report': {
            'dtime': ('django.db.models.fields.DateTimeField', [], {'db_index': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_read': ('django.db.models.fields.BooleanField', [], {'default': 'False', 'blank': 'True'}),
            'is_sent': ('django.db.models.fields.BooleanField', [], {'default': 'False', 'blank': 'True'}),
            'message': ('django.db.models.fields.TextField', [], {}),
            'type': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['procrasdonate.User']"})
        },
        'procrasdonate.site': {
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'sitegroup': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['procrasdonate.SiteGroup']"}),
            'url': ('django.db.models.fields.URLField', [], {'max_length': '200'})
        },
        'procrasdonate.sitegroup': {
            'host': ('django.db.models.fields.CharField', [], {'max_length': '128'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'url_re': ('django.db.models.fields.CharField', [], {'max_length': '256', 'null': 'True', 'blank': 'True'})
        },
        'procrasdonate.sitegrouptagging': {
            'dtime': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'db_index': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'sitegroup': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['procrasdonate.SiteGroup']"}),
            'tag': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['procrasdonate.Tag']"}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['procrasdonate.User']"})
        },
        'procrasdonate.sitegroupvisit': {
            'dtime': ('django.db.models.fields.DateTimeField', [], {}),
            'extn_id': ('django.db.models.fields.IntegerField', [], {}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'rate': ('django.db.models.fields.FloatField', [], {'default': '0'}),
            'received_time': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'sitegroup': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['procrasdonate.SiteGroup']"}),
            'total_amount': ('django.db.models.fields.FloatField', [], {}),
            'total_time': ('django.db.models.fields.FloatField', [], {}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['procrasdonate.User']", 'null': 'True', 'blank': 'True'})
        },
        'procrasdonate.sitepayment': {
            'amount_paid_in_fees': ('django.db.models.fields.FloatField', [], {'default': '0.0'}),
            'amount_paid_tax_deductibly': ('django.db.models.fields.FloatField', [], {'default': '0.0'}),
            'dtime': ('django.db.models.fields.DateTimeField', [], {'db_index': 'True'}),
            'extn_id': ('django.db.models.fields.IntegerField', [], {}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'payment_service': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['procrasdonate.PaymentService']"}),
            'settled': ('django.db.models.fields.BooleanField', [], {'default': 'False', 'blank': 'True'}),
            'site': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['procrasdonate.Site']"}),
            'total_amount_paid': ('django.db.models.fields.FloatField', [], {'default': '0.0'}),
            'transaction_id': ('django.db.models.fields.CharField', [], {'max_length': '32', 'db_index': 'True'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['procrasdonate.User']"})
        },
        'procrasdonate.sitevisit': {
            'dtime': ('django.db.models.fields.DateTimeField', [], {}),
            'extn_id': ('django.db.models.fields.IntegerField', [], {}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'rate': ('django.db.models.fields.FloatField', [], {'default': '0'}),
            'received_time': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'site': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['procrasdonate.Site']"}),
            'total_amount': ('django.db.models.fields.FloatField', [], {}),
            'total_time': ('django.db.models.fields.FloatField', [], {}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['procrasdonate.User']", 'null': 'True', 'blank': 'True'})
        },
        'procrasdonate.staffpick': {
            'end': ('django.db.models.fields.DateTimeField', [], {}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'recipient': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['procrasdonate.Recipient']"}),
            'start': ('django.db.models.fields.DateTimeField', [], {})
        },
        'procrasdonate.tag': {
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'tag': ('django.db.models.fields.CharField', [], {'max_length': '64'})
        },
        'procrasdonate.tagvisit': {
            'dtime': ('django.db.models.fields.DateTimeField', [], {}),
            'extn_id': ('django.db.models.fields.IntegerField', [], {}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'rate': ('django.db.models.fields.FloatField', [], {'default': '0'}),
            'received_time': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'tag': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['procrasdonate.Tag']"}),
            'total_amount': ('django.db.models.fields.FloatField', [], {}),
            'total_time': ('django.db.models.fields.FloatField', [], {}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['procrasdonate.User']", 'null': 'True', 'blank': 'True'})
        },
        'procrasdonate.user': {
            'email': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['procrasdonate.Email']", 'null': 'True', 'blank': 'True'}),
            'hash': ('django.db.models.fields.CharField', [], {'max_length': '10', 'db_index': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '128', 'null': 'True', 'blank': 'True'}),
            'on_email_list': ('django.db.models.fields.BooleanField', [], {'default': 'False', 'blank': 'True'}),
            'private_key': ('django.db.models.fields.CharField', [], {'max_length': '64', 'db_index': 'True'}),
            'twitter_name': ('django.db.models.fields.CharField', [], {'max_length': '32', 'null': 'True', 'blank': 'True'}),
            'url': ('django.db.models.fields.URLField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'})
        },
        'procrasdonate.userstudy': {
            'dtime': ('django.db.models.fields.DateTimeField', [], {}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'message': ('django.db.models.fields.TextField', [], {}),
            'quant': ('django.db.models.fields.FloatField', [], {}),
            'type': ('django.db.models.fields.CharField', [], {'max_length': '32'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['procrasdonate.User']", 'null': 'True'})
        }
    }
    
    complete_apps = ['procrasdonate']
