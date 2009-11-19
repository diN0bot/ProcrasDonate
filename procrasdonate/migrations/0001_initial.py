
from south.db import db
from django.db import models
from procrasdonate.models import *

class Migration:
    
    def forwards(self, orm):
        
        # Adding model 'SiteGroup'
        db.create_table('procrasdonate_sitegroup', (
            ('id', orm['procrasdonate.SiteGroup:id']),
            ('host', orm['procrasdonate.SiteGroup:host']),
            ('url_re', orm['procrasdonate.SiteGroup:url_re']),
            ('name', orm['procrasdonate.SiteGroup:name']),
        ))
        db.send_create_signal('procrasdonate', ['SiteGroup'])
        
        # Adding model 'AggregateSiteGroup'
        db.create_table('procrasdonate_aggregatesitegroup', (
            ('id', orm['procrasdonate.AggregateSiteGroup:id']),
            ('total_amount', orm['procrasdonate.AggregateSiteGroup:total_amount']),
            ('total_time', orm['procrasdonate.AggregateSiteGroup:total_time']),
            ('total_donors', orm['procrasdonate.AggregateSiteGroup:total_donors']),
            ('time', orm['procrasdonate.AggregateSiteGroup:time']),
            ('time_type', orm['procrasdonate.AggregateSiteGroup:time_type']),
            ('last_updated', orm['procrasdonate.AggregateSiteGroup:last_updated']),
            ('sitegroup', orm['procrasdonate.AggregateSiteGroup:sitegroup']),
        ))
        db.send_create_signal('procrasdonate', ['AggregateSiteGroup'])
        
        # Adding model 'AggregateTag'
        db.create_table('procrasdonate_aggregatetag', (
            ('id', orm['procrasdonate.AggregateTag:id']),
            ('total_amount', orm['procrasdonate.AggregateTag:total_amount']),
            ('total_time', orm['procrasdonate.AggregateTag:total_time']),
            ('total_donors', orm['procrasdonate.AggregateTag:total_donors']),
            ('time', orm['procrasdonate.AggregateTag:time']),
            ('time_type', orm['procrasdonate.AggregateTag:time_type']),
            ('last_updated', orm['procrasdonate.AggregateTag:last_updated']),
            ('tag', orm['procrasdonate.AggregateTag:tag']),
        ))
        db.send_create_signal('procrasdonate', ['AggregateTag'])
        
        # Adding model 'SiteGroupVisit'
        db.create_table('procrasdonate_sitegroupvisit', (
            ('id', orm['procrasdonate.SiteGroupVisit:id']),
            ('dtime', orm['procrasdonate.SiteGroupVisit:dtime']),
            ('received_time', orm['procrasdonate.SiteGroupVisit:received_time']),
            ('total_time', orm['procrasdonate.SiteGroupVisit:total_time']),
            ('total_amount', orm['procrasdonate.SiteGroupVisit:total_amount']),
            ('rate', orm['procrasdonate.SiteGroupVisit:rate']),
            ('user', orm['procrasdonate.SiteGroupVisit:user']),
            ('extn_id', orm['procrasdonate.SiteGroupVisit:extn_id']),
            ('sitegroup', orm['procrasdonate.SiteGroupVisit:sitegroup']),
        ))
        db.send_create_signal('procrasdonate', ['SiteGroupVisit'])
        
        # Adding model 'RecipientVisit'
        db.create_table('procrasdonate_recipientvisit', (
            ('id', orm['procrasdonate.RecipientVisit:id']),
            ('dtime', orm['procrasdonate.RecipientVisit:dtime']),
            ('received_time', orm['procrasdonate.RecipientVisit:received_time']),
            ('total_time', orm['procrasdonate.RecipientVisit:total_time']),
            ('total_amount', orm['procrasdonate.RecipientVisit:total_amount']),
            ('rate', orm['procrasdonate.RecipientVisit:rate']),
            ('user', orm['procrasdonate.RecipientVisit:user']),
            ('extn_id', orm['procrasdonate.RecipientVisit:extn_id']),
            ('recipient', orm['procrasdonate.RecipientVisit:recipient']),
        ))
        db.send_create_signal('procrasdonate', ['RecipientVisit'])
        
        # Adding model 'SiteGroupTagging'
        db.create_table('procrasdonate_sitegrouptagging', (
            ('id', orm['procrasdonate.SiteGroupTagging:id']),
            ('tag', orm['procrasdonate.SiteGroupTagging:tag']),
            ('sitegroup', orm['procrasdonate.SiteGroupTagging:sitegroup']),
            ('user', orm['procrasdonate.SiteGroupTagging:user']),
            ('dtime', orm['procrasdonate.SiteGroupTagging:dtime']),
        ))
        db.send_create_signal('procrasdonate', ['SiteGroupTagging'])
        
        # Adding model 'RecipientPayment'
        db.create_table('procrasdonate_recipientpayment', (
            ('id', orm['procrasdonate.RecipientPayment:id']),
            ('dtime', orm['procrasdonate.RecipientPayment:dtime']),
            ('payment_service', orm['procrasdonate.RecipientPayment:payment_service']),
            ('transaction_id', orm['procrasdonate.RecipientPayment:transaction_id']),
            ('settled', orm['procrasdonate.RecipientPayment:settled']),
            ('total_amount_paid', orm['procrasdonate.RecipientPayment:total_amount_paid']),
            ('amount_paid_in_fees', orm['procrasdonate.RecipientPayment:amount_paid_in_fees']),
            ('amount_paid_tax_deductibly', orm['procrasdonate.RecipientPayment:amount_paid_tax_deductibly']),
            ('user', orm['procrasdonate.RecipientPayment:user']),
            ('extn_id', orm['procrasdonate.RecipientPayment:extn_id']),
            ('recipient', orm['procrasdonate.RecipientPayment:recipient']),
        ))
        db.send_create_signal('procrasdonate', ['RecipientPayment'])
        
        # Adding model 'StaffPick'
        db.create_table('procrasdonate_staffpick', (
            ('id', orm['procrasdonate.StaffPick:id']),
            ('recipient', orm['procrasdonate.StaffPick:recipient']),
            ('start', orm['procrasdonate.StaffPick:start']),
            ('end', orm['procrasdonate.StaffPick:end']),
        ))
        db.send_create_signal('procrasdonate', ['StaffPick'])
        
        # Adding model 'RecipientVote'
        db.create_table('procrasdonate_recipientvote', (
            ('id', orm['procrasdonate.RecipientVote:id']),
            ('recipient', orm['procrasdonate.RecipientVote:recipient']),
            ('user', orm['procrasdonate.RecipientVote:user']),
            ('name', orm['procrasdonate.RecipientVote:name']),
            ('url', orm['procrasdonate.RecipientVote:url']),
        ))
        db.send_create_signal('procrasdonate', ['RecipientVote'])
        
        # Adding model 'Log'
        db.create_table('procrasdonate_log', (
            ('id', orm['procrasdonate.Log:id']),
            ('dtime', orm['procrasdonate.Log:dtime']),
            ('log_type', orm['procrasdonate.Log:log_type']),
            ('detail_type', orm['procrasdonate.Log:detail_type']),
            ('message', orm['procrasdonate.Log:message']),
            ('user', orm['procrasdonate.Log:user']),
        ))
        db.send_create_signal('procrasdonate', ['Log'])
        
        # Adding model 'SitePayment'
        db.create_table('procrasdonate_sitepayment', (
            ('id', orm['procrasdonate.SitePayment:id']),
            ('dtime', orm['procrasdonate.SitePayment:dtime']),
            ('payment_service', orm['procrasdonate.SitePayment:payment_service']),
            ('transaction_id', orm['procrasdonate.SitePayment:transaction_id']),
            ('settled', orm['procrasdonate.SitePayment:settled']),
            ('total_amount_paid', orm['procrasdonate.SitePayment:total_amount_paid']),
            ('amount_paid_in_fees', orm['procrasdonate.SitePayment:amount_paid_in_fees']),
            ('amount_paid_tax_deductibly', orm['procrasdonate.SitePayment:amount_paid_tax_deductibly']),
            ('user', orm['procrasdonate.SitePayment:user']),
            ('extn_id', orm['procrasdonate.SitePayment:extn_id']),
            ('site', orm['procrasdonate.SitePayment:site']),
        ))
        db.send_create_signal('procrasdonate', ['SitePayment'])
        
        # Adding model 'Email'
        db.create_table('procrasdonate_email', (
            ('id', orm['procrasdonate.Email:id']),
            ('email', orm['procrasdonate.Email:email']),
        ))
        db.send_create_signal('procrasdonate', ['Email'])
        
        # Adding model 'AggregateUser'
        db.create_table('procrasdonate_aggregateuser', (
            ('id', orm['procrasdonate.AggregateUser:id']),
            ('total_amount', orm['procrasdonate.AggregateUser:total_amount']),
            ('total_time', orm['procrasdonate.AggregateUser:total_time']),
            ('total_donors', orm['procrasdonate.AggregateUser:total_donors']),
            ('time', orm['procrasdonate.AggregateUser:time']),
            ('time_type', orm['procrasdonate.AggregateUser:time_type']),
            ('last_updated', orm['procrasdonate.AggregateUser:last_updated']),
            ('user', orm['procrasdonate.AggregateUser:user']),
        ))
        db.send_create_signal('procrasdonate', ['AggregateUser'])
        
        # Adding model 'FPSRecipient'
        db.create_table('procrasdonate_fpsrecipient', (
            ('id', orm['procrasdonate.FPSRecipient:id']),
            ('recipient', orm['procrasdonate.FPSRecipient:recipient']),
            ('caller_reference', orm['procrasdonate.FPSRecipient:caller_reference']),
            ('timestamp', orm['procrasdonate.FPSRecipient:timestamp']),
            ('refund_token_id', orm['procrasdonate.FPSRecipient:refund_token_id']),
            ('token_id', orm['procrasdonate.FPSRecipient:token_id']),
            ('status', orm['procrasdonate.FPSRecipient:status']),
        ))
        db.send_create_signal('procrasdonate', ['FPSRecipient'])
        
        # Adding model 'FPSMultiusePay'
        db.create_table('procrasdonate_fpsmultiusepay', (
            ('id', orm['procrasdonate.FPSMultiusePay:id']),
            ('user', orm['procrasdonate.FPSMultiusePay:user']),
            ('recipient', orm['procrasdonate.FPSMultiusePay:recipient']),
            ('caller_reference', orm['procrasdonate.FPSMultiusePay:caller_reference']),
            ('timestamp', orm['procrasdonate.FPSMultiusePay:timestamp']),
            ('marketplace_fixed_fee', orm['procrasdonate.FPSMultiusePay:marketplace_fixed_fee']),
            ('marketplace_variable_fee', orm['procrasdonate.FPSMultiusePay:marketplace_variable_fee']),
            ('recipient_token_id', orm['procrasdonate.FPSMultiusePay:recipient_token_id']),
            ('refund_token_id', orm['procrasdonate.FPSMultiusePay:refund_token_id']),
            ('sender_token_id', orm['procrasdonate.FPSMultiusePay:sender_token_id']),
            ('transaction_amount', orm['procrasdonate.FPSMultiusePay:transaction_amount']),
            ('request_id', orm['procrasdonate.FPSMultiusePay:request_id']),
            ('transaction_id', orm['procrasdonate.FPSMultiusePay:transaction_id']),
            ('transaction_status', orm['procrasdonate.FPSMultiusePay:transaction_status']),
            ('error_message', orm['procrasdonate.FPSMultiusePay:error_message']),
            ('error_code', orm['procrasdonate.FPSMultiusePay:error_code']),
        ))
        db.send_create_signal('procrasdonate', ['FPSMultiusePay'])
        
        # Adding model 'FPSMultiuseCancelToken'
        db.create_table('procrasdonate_fpsmultiusecanceltoken', (
            ('id', orm['procrasdonate.FPSMultiuseCancelToken:id']),
            ('user', orm['procrasdonate.FPSMultiuseCancelToken:user']),
            ('token_id', orm['procrasdonate.FPSMultiuseCancelToken:token_id']),
            ('reason_text', orm['procrasdonate.FPSMultiuseCancelToken:reason_text']),
            ('timestamp', orm['procrasdonate.FPSMultiuseCancelToken:timestamp']),
            ('response_metadata', orm['procrasdonate.FPSMultiuseCancelToken:response_metadata']),
            ('request_id', orm['procrasdonate.FPSMultiuseCancelToken:request_id']),
            ('error_code', orm['procrasdonate.FPSMultiuseCancelToken:error_code']),
            ('error_message', orm['procrasdonate.FPSMultiuseCancelToken:error_message']),
        ))
        db.send_create_signal('procrasdonate', ['FPSMultiuseCancelToken'])
        
        # Adding model 'Category'
        db.create_table('procrasdonate_category', (
            ('id', orm['procrasdonate.Category:id']),
            ('category', orm['procrasdonate.Category:category']),
        ))
        db.send_create_signal('procrasdonate', ['Category'])
        
        # Adding model 'Site'
        db.create_table('procrasdonate_site', (
            ('id', orm['procrasdonate.Site:id']),
            ('url', orm['procrasdonate.Site:url']),
            ('sitegroup', orm['procrasdonate.Site:sitegroup']),
        ))
        db.send_create_signal('procrasdonate', ['Site'])
        
        # Adding model 'AggregateSite'
        db.create_table('procrasdonate_aggregatesite', (
            ('id', orm['procrasdonate.AggregateSite:id']),
            ('total_amount', orm['procrasdonate.AggregateSite:total_amount']),
            ('total_time', orm['procrasdonate.AggregateSite:total_time']),
            ('total_donors', orm['procrasdonate.AggregateSite:total_donors']),
            ('time', orm['procrasdonate.AggregateSite:time']),
            ('time_type', orm['procrasdonate.AggregateSite:time_type']),
            ('last_updated', orm['procrasdonate.AggregateSite:last_updated']),
            ('site', orm['procrasdonate.AggregateSite:site']),
        ))
        db.send_create_signal('procrasdonate', ['AggregateSite'])
        
        # Adding model 'PaymentService'
        db.create_table('procrasdonate_paymentservice', (
            ('id', orm['procrasdonate.PaymentService:id']),
            ('name', orm['procrasdonate.PaymentService:name']),
            ('user_url', orm['procrasdonate.PaymentService:user_url']),
        ))
        db.send_create_signal('procrasdonate', ['PaymentService'])
        
        # Adding model 'AggregateRecipient'
        db.create_table('procrasdonate_aggregaterecipient', (
            ('id', orm['procrasdonate.AggregateRecipient:id']),
            ('total_amount', orm['procrasdonate.AggregateRecipient:total_amount']),
            ('total_time', orm['procrasdonate.AggregateRecipient:total_time']),
            ('total_donors', orm['procrasdonate.AggregateRecipient:total_donors']),
            ('time', orm['procrasdonate.AggregateRecipient:time']),
            ('time_type', orm['procrasdonate.AggregateRecipient:time_type']),
            ('last_updated', orm['procrasdonate.AggregateRecipient:last_updated']),
            ('recipient', orm['procrasdonate.AggregateRecipient:recipient']),
        ))
        db.send_create_signal('procrasdonate', ['AggregateRecipient'])
        
        # Adding model 'RecipientUserTagging'
        db.create_table('procrasdonate_recipientusertagging', (
            ('id', orm['procrasdonate.RecipientUserTagging:id']),
            ('user', orm['procrasdonate.RecipientUserTagging:user']),
            ('recipient', orm['procrasdonate.RecipientUserTagging:recipient']),
            ('is_confirmed', orm['procrasdonate.RecipientUserTagging:is_confirmed']),
            ('confirmation_code', orm['procrasdonate.RecipientUserTagging:confirmation_code']),
            ('job_title', orm['procrasdonate.RecipientUserTagging:job_title']),
            ('email_to_supporters', orm['procrasdonate.RecipientUserTagging:email_to_supporters']),
            ('newsletter_article', orm['procrasdonate.RecipientUserTagging:newsletter_article']),
            ('mailed_letter', orm['procrasdonate.RecipientUserTagging:mailed_letter']),
            ('mailed_postcard', orm['procrasdonate.RecipientUserTagging:mailed_postcard']),
            ('other_mailing', orm['procrasdonate.RecipientUserTagging:other_mailing']),
            ('event_postcard', orm['procrasdonate.RecipientUserTagging:event_postcard']),
            ('homepage_link', orm['procrasdonate.RecipientUserTagging:homepage_link']),
            ('blog_post', orm['procrasdonate.RecipientUserTagging:blog_post']),
            ('twitter_tweet', orm['procrasdonate.RecipientUserTagging:twitter_tweet']),
        ))
        db.send_create_signal('procrasdonate', ['RecipientUserTagging'])
        
        # Adding model 'FPSMultiuseAuth'
        db.create_table('procrasdonate_fpsmultiuseauth', (
            ('id', orm['procrasdonate.FPSMultiuseAuth:id']),
            ('user', orm['procrasdonate.FPSMultiuseAuth:user']),
            ('caller_reference', orm['procrasdonate.FPSMultiuseAuth:caller_reference']),
            ('timestamp', orm['procrasdonate.FPSMultiuseAuth:timestamp']),
            ('payment_reason', orm['procrasdonate.FPSMultiuseAuth:payment_reason']),
            ('global_amount_limit', orm['procrasdonate.FPSMultiuseAuth:global_amount_limit']),
            ('recipient_slug_list', orm['procrasdonate.FPSMultiuseAuth:recipient_slug_list']),
            ('token_id', orm['procrasdonate.FPSMultiuseAuth:token_id']),
            ('expiry', orm['procrasdonate.FPSMultiuseAuth:expiry']),
            ('status', orm['procrasdonate.FPSMultiuseAuth:status']),
            ('error_message', orm['procrasdonate.FPSMultiuseAuth:error_message']),
        ))
        db.send_create_signal('procrasdonate', ['FPSMultiuseAuth'])
        
        # Adding model 'TagVisit'
        db.create_table('procrasdonate_tagvisit', (
            ('id', orm['procrasdonate.TagVisit:id']),
            ('dtime', orm['procrasdonate.TagVisit:dtime']),
            ('received_time', orm['procrasdonate.TagVisit:received_time']),
            ('total_time', orm['procrasdonate.TagVisit:total_time']),
            ('total_amount', orm['procrasdonate.TagVisit:total_amount']),
            ('rate', orm['procrasdonate.TagVisit:rate']),
            ('user', orm['procrasdonate.TagVisit:user']),
            ('extn_id', orm['procrasdonate.TagVisit:extn_id']),
            ('tag', orm['procrasdonate.TagVisit:tag']),
        ))
        db.send_create_signal('procrasdonate', ['TagVisit'])
        
        # Adding model 'Tag'
        db.create_table('procrasdonate_tag', (
            ('id', orm['procrasdonate.Tag:id']),
            ('tag', orm['procrasdonate.Tag:tag']),
        ))
        db.send_create_signal('procrasdonate', ['Tag'])
        
        # Adding model 'UserStudy'
        db.create_table('procrasdonate_userstudy', (
            ('id', orm['procrasdonate.UserStudy:id']),
            ('dtime', orm['procrasdonate.UserStudy:dtime']),
            ('type', orm['procrasdonate.UserStudy:type']),
            ('message', orm['procrasdonate.UserStudy:message']),
            ('quant', orm['procrasdonate.UserStudy:quant']),
            ('user', orm['procrasdonate.UserStudy:user']),
        ))
        db.send_create_signal('procrasdonate', ['UserStudy'])
        
        # Adding model 'User'
        db.create_table('procrasdonate_user', (
            ('id', orm['procrasdonate.User:id']),
            ('hash', orm['procrasdonate.User:hash']),
            ('private_key', orm['procrasdonate.User:private_key']),
            ('name', orm['procrasdonate.User:name']),
            ('twitter_name', orm['procrasdonate.User:twitter_name']),
            ('url', orm['procrasdonate.User:url']),
            ('email', orm['procrasdonate.User:email']),
            ('on_email_list', orm['procrasdonate.User:on_email_list']),
        ))
        db.send_create_signal('procrasdonate', ['User'])
        
        # Adding model 'SiteVisit'
        db.create_table('procrasdonate_sitevisit', (
            ('id', orm['procrasdonate.SiteVisit:id']),
            ('dtime', orm['procrasdonate.SiteVisit:dtime']),
            ('received_time', orm['procrasdonate.SiteVisit:received_time']),
            ('total_time', orm['procrasdonate.SiteVisit:total_time']),
            ('total_amount', orm['procrasdonate.SiteVisit:total_amount']),
            ('rate', orm['procrasdonate.SiteVisit:rate']),
            ('user', orm['procrasdonate.SiteVisit:user']),
            ('extn_id', orm['procrasdonate.SiteVisit:extn_id']),
            ('site', orm['procrasdonate.SiteVisit:site']),
        ))
        db.send_create_signal('procrasdonate', ['SiteVisit'])
        
        # Adding model 'Recipient'
        db.create_table('procrasdonate_recipient', (
            ('id', orm['procrasdonate.Recipient:id']),
            ('last_modified', orm['procrasdonate.Recipient:last_modified']),
            ('slug', orm['procrasdonate.Recipient:slug']),
            ('name', orm['procrasdonate.Recipient:name']),
            ('category', orm['procrasdonate.Recipient:category']),
            ('mission', orm['procrasdonate.Recipient:mission']),
            ('description', orm['procrasdonate.Recipient:description']),
            ('url', orm['procrasdonate.Recipient:url']),
            ('twitter_name', orm['procrasdonate.Recipient:twitter_name']),
            ('facebook_name', orm['procrasdonate.Recipient:facebook_name']),
            ('is_visible', orm['procrasdonate.Recipient:is_visible']),
            ('employers_identification_number', orm['procrasdonate.Recipient:employers_identification_number']),
            ('tax_exempt_status', orm['procrasdonate.Recipient:tax_exempt_status']),
            ('is_sponsored', orm['procrasdonate.Recipient:is_sponsored']),
            ('sponsoring_organization', orm['procrasdonate.Recipient:sponsoring_organization']),
            ('office_phone', orm['procrasdonate.Recipient:office_phone']),
            ('mailing_address', orm['procrasdonate.Recipient:mailing_address']),
            ('city', orm['procrasdonate.Recipient:city']),
            ('state', orm['procrasdonate.Recipient:state']),
            ('country', orm['procrasdonate.Recipient:country']),
            ('logo', orm['procrasdonate.Recipient:logo']),
            ('logo_height', orm['procrasdonate.Recipient:logo_height']),
            ('logo_width', orm['procrasdonate.Recipient:logo_width']),
            ('promotional_video', orm['procrasdonate.Recipient:promotional_video']),
            ('pd_experience_video', orm['procrasdonate.Recipient:pd_experience_video']),
            ('charity_navigator_score', orm['procrasdonate.Recipient:charity_navigator_score']),
        ))
        db.send_create_signal('procrasdonate', ['Recipient'])
        
    
    
    def backwards(self, orm):
        
        # Deleting model 'SiteGroup'
        db.delete_table('procrasdonate_sitegroup')
        
        # Deleting model 'AggregateSiteGroup'
        db.delete_table('procrasdonate_aggregatesitegroup')
        
        # Deleting model 'AggregateTag'
        db.delete_table('procrasdonate_aggregatetag')
        
        # Deleting model 'SiteGroupVisit'
        db.delete_table('procrasdonate_sitegroupvisit')
        
        # Deleting model 'RecipientVisit'
        db.delete_table('procrasdonate_recipientvisit')
        
        # Deleting model 'SiteGroupTagging'
        db.delete_table('procrasdonate_sitegrouptagging')
        
        # Deleting model 'RecipientPayment'
        db.delete_table('procrasdonate_recipientpayment')
        
        # Deleting model 'StaffPick'
        db.delete_table('procrasdonate_staffpick')
        
        # Deleting model 'RecipientVote'
        db.delete_table('procrasdonate_recipientvote')
        
        # Deleting model 'Log'
        db.delete_table('procrasdonate_log')
        
        # Deleting model 'SitePayment'
        db.delete_table('procrasdonate_sitepayment')
        
        # Deleting model 'Email'
        db.delete_table('procrasdonate_email')
        
        # Deleting model 'AggregateUser'
        db.delete_table('procrasdonate_aggregateuser')
        
        # Deleting model 'FPSRecipient'
        db.delete_table('procrasdonate_fpsrecipient')
        
        # Deleting model 'FPSMultiusePay'
        db.delete_table('procrasdonate_fpsmultiusepay')
        
        # Deleting model 'FPSMultiuseCancelToken'
        db.delete_table('procrasdonate_fpsmultiusecanceltoken')
        
        # Deleting model 'Category'
        db.delete_table('procrasdonate_category')
        
        # Deleting model 'Site'
        db.delete_table('procrasdonate_site')
        
        # Deleting model 'AggregateSite'
        db.delete_table('procrasdonate_aggregatesite')
        
        # Deleting model 'PaymentService'
        db.delete_table('procrasdonate_paymentservice')
        
        # Deleting model 'AggregateRecipient'
        db.delete_table('procrasdonate_aggregaterecipient')
        
        # Deleting model 'RecipientUserTagging'
        db.delete_table('procrasdonate_recipientusertagging')
        
        # Deleting model 'FPSMultiuseAuth'
        db.delete_table('procrasdonate_fpsmultiuseauth')
        
        # Deleting model 'TagVisit'
        db.delete_table('procrasdonate_tagvisit')
        
        # Deleting model 'Tag'
        db.delete_table('procrasdonate_tag')
        
        # Deleting model 'UserStudy'
        db.delete_table('procrasdonate_userstudy')
        
        # Deleting model 'User'
        db.delete_table('procrasdonate_user')
        
        # Deleting model 'SiteVisit'
        db.delete_table('procrasdonate_sitevisit')
        
        # Deleting model 'Recipient'
        db.delete_table('procrasdonate_recipient')
        
    
    
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
            'time': ('django.db.models.fields.DateField', [], {}),
            'time_type': ('django.db.models.fields.CharField', [], {'max_length': '1'}),
            'total_amount': ('django.db.models.fields.FloatField', [], {'default': '0.0', 'db_index': 'True'}),
            'total_donors': ('django.db.models.fields.FloatField', [], {'default': '0.0', 'db_index': 'True'}),
            'total_time': ('django.db.models.fields.FloatField', [], {'default': '0.0', 'db_index': 'True'})
        },
        'procrasdonate.aggregatesite': {
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'last_updated': ('django.db.models.fields.DateTimeField', [], {}),
            'site': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['procrasdonate.Site']"}),
            'time': ('django.db.models.fields.DateField', [], {}),
            'time_type': ('django.db.models.fields.CharField', [], {'max_length': '1'}),
            'total_amount': ('django.db.models.fields.FloatField', [], {'default': '0.0', 'db_index': 'True'}),
            'total_donors': ('django.db.models.fields.FloatField', [], {'default': '0.0', 'db_index': 'True'}),
            'total_time': ('django.db.models.fields.FloatField', [], {'default': '0.0', 'db_index': 'True'})
        },
        'procrasdonate.aggregatesitegroup': {
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'last_updated': ('django.db.models.fields.DateTimeField', [], {}),
            'sitegroup': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['procrasdonate.SiteGroup']"}),
            'time': ('django.db.models.fields.DateField', [], {}),
            'time_type': ('django.db.models.fields.CharField', [], {'max_length': '1'}),
            'total_amount': ('django.db.models.fields.FloatField', [], {'default': '0.0', 'db_index': 'True'}),
            'total_donors': ('django.db.models.fields.FloatField', [], {'default': '0.0', 'db_index': 'True'}),
            'total_time': ('django.db.models.fields.FloatField', [], {'default': '0.0', 'db_index': 'True'})
        },
        'procrasdonate.aggregatetag': {
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'last_updated': ('django.db.models.fields.DateTimeField', [], {}),
            'tag': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['procrasdonate.Tag']"}),
            'time': ('django.db.models.fields.DateField', [], {}),
            'time_type': ('django.db.models.fields.CharField', [], {'max_length': '1'}),
            'total_amount': ('django.db.models.fields.FloatField', [], {'default': '0.0', 'db_index': 'True'}),
            'total_donors': ('django.db.models.fields.FloatField', [], {'default': '0.0', 'db_index': 'True'}),
            'total_time': ('django.db.models.fields.FloatField', [], {'default': '0.0', 'db_index': 'True'})
        },
        'procrasdonate.aggregateuser': {
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'last_updated': ('django.db.models.fields.DateTimeField', [], {}),
            'time': ('django.db.models.fields.DateField', [], {}),
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
            'detail_type': ('django.db.models.fields.CharField', [], {'max_length': '1'}),
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
            'category': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['procrasdonate.Category']", 'null': 'True', 'blank': 'True'}),
            'charity_navigator_score': ('django.db.models.fields.IntegerField', [], {'null': 'True', 'blank': 'True'}),
            'city': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'country': ('django.db.models.fields.CharField', [], {'default': "'USA'", 'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'description': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'employers_identification_number': ('django.db.models.fields.CharField', [], {'max_length': '32', 'null': 'True', 'blank': 'True'}),
            'facebook_name': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_sponsored': ('django.db.models.fields.BooleanField', [], {'default': 'False', 'blank': 'True'}),
            'is_visible': ('django.db.models.fields.BooleanField', [], {'default': 'True', 'blank': 'True'}),
            'last_modified': ('django.db.models.fields.DateField', [], {'auto_now': 'True', 'blank': 'True'}),
            'logo': ('django.db.models.fields.files.ImageField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'logo_height': ('django.db.models.fields.IntegerField', [], {'default': '100'}),
            'logo_width': ('django.db.models.fields.IntegerField', [], {'default': '100'}),
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
            'dtime': ('django.db.models.fields.DateField', [], {}),
            'extn_id': ('django.db.models.fields.IntegerField', [], {}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'rate': ('django.db.models.fields.FloatField', [], {'default': '0'}),
            'received_time': ('django.db.models.fields.DateField', [], {'auto_now_add': 'True', 'blank': 'True'}),
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
            'dtime': ('django.db.models.fields.DateField', [], {}),
            'extn_id': ('django.db.models.fields.IntegerField', [], {}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'rate': ('django.db.models.fields.FloatField', [], {'default': '0'}),
            'received_time': ('django.db.models.fields.DateField', [], {'auto_now_add': 'True', 'blank': 'True'}),
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
            'dtime': ('django.db.models.fields.DateField', [], {}),
            'extn_id': ('django.db.models.fields.IntegerField', [], {}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'rate': ('django.db.models.fields.FloatField', [], {'default': '0'}),
            'received_time': ('django.db.models.fields.DateField', [], {'auto_now_add': 'True', 'blank': 'True'}),
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
            'dtime': ('django.db.models.fields.DateField', [], {}),
            'extn_id': ('django.db.models.fields.IntegerField', [], {}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'rate': ('django.db.models.fields.FloatField', [], {'default': '0'}),
            'received_time': ('django.db.models.fields.DateField', [], {'auto_now_add': 'True', 'blank': 'True'}),
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
