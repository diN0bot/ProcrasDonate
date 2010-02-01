from django.db import models
from lib import model_utils
from procrasdonate.applib import fps
from data import *

import datetime

class FPSRecipient(models.Model):
    """
    """
    # Valid statuses                                                                                                                                                                
    STATUSES = {'SUCCESS':'SR',
                'ABORTED':'A',
                'CALLER_ERROR':'CE',
                'PAYMENT_ERROR':'NP',
                'DEVELOPER_ERROR':'NM',
                'RESPONSE_NOT_RECEIVED': '0',
                'RESPONSE_ERROR': '1',
                }
    # for database (data, friendly_name)                                                                                                                                          
    STATUS_CHOICES = (
                      (STATUSES['SUCCESS'], 'Success',),
                      (STATUSES['ABORTED'], 'Aborted by recipient',),
                      (STATUSES['CALLER_ERROR'], 'Caller exception',),
                      (STATUSES['PAYMENT_ERROR'], 'Account type does not support specified payment method',),
                      (STATUSES['DEVELOPER_ERROR'], 'Developer is not registered as a third party caller to make this transaction',),
                      (STATUSES['RESPONSE_NOT_RECEIVED'], 'Request to CBUI has either not been sent or not received',),
                      (STATUSES['RESPONSE_ERROR'], 'Callback is called, but something unexpected prevents us from parsing a status',),
                     )

    recipient = models.ForeignKey(Recipient)
    # for auth request. good for 7 days
    caller_reference = models.CharField(max_length=28)
    # time caller_reference was created
    timestamp = models.DateTimeField()
    
    # auth callback parameters
    refund_token_id = models.CharField(max_length=64, blank=True, null=True)
    token_id = models.CharField(max_length=64, blank=True, null=True)
    status = models.CharField(max_length=2,
                              choices=STATUS_CHOICES,
                              default=STATUSES['RESPONSE_NOT_RECEIVED'])
    
    
    @classmethod
    def Initialize(klass):
        model_utils.mixin(FPSRecipientMixin, Recipient)

    @classmethod
    def make(klass, recipient):
        r = FPSRecipient.get_or_none(recipient=recipient)
        if r:
            raise "FPSRecipient already exists for %s" % recipient
        else:
            return FPSRecipient(recipient=recipient,
                                caller_reference=fps.create_id(12),
                                timestamp=datetime.datetime.now())
    
    def good_to_go(self):
        return self.status == FPSRecipient.STATUSES['SUCCESS']
        
    def needs_new_caller_reference(self):
        if self.good_to_go():
            return False
        elif not self.caller_reference or not self.timestamp:
            return True
        else:
            now = datetime.datetime.now()
            seven_days = datetime.timedelta(days=7)
            return now - seven_days > self.timestamp
        
    def __unicode__(self):
        return u"FPS Recipient=%s, status=%s" % (self.recipient, self.get_status_display())

class FPSRecipientMixin(object):
    """ mixed into Recipient class """
    
    @property
    def fps_data(self):
        ret = self.fpsrecipient_set.all()
        if not ret:
            return None
        else:
            return ret[0]
    
    def pd_registered(self):
        return (self.fps_data and self.fps_data.good_to_go())
        
class FPSMultiuseAuth(models.Model):
    """
    """
    # Valid statuses                                                                                                                                                                
    STATUSES = {'SUCCESS_ABT':'SA', # success for Amazon account payment method
                'SUCCESS_ACH':'SB', # success for bank account payment method
                'SUCCESS_CC':'SC', # success for credit card payment method
                'SYSTEM_ERROR':'SE',
                'ABORTED':'A', # buyer aborted pipeline
                'CALLER_ERROR':'CE',
                'PAYMENT_METHOD_ERROR':'PE', # buyer does not have payment method requested
                'PAYMENT_ERROR':'NP',
                'DEVELOPER_ERROR': 'NM',
                'RESPONSE_NOT_RECEIVED': '0',
                'RESPONSE_ERROR': '1',
                'CANCELLED': 'C',
                'EXPIRED': 'EX'}
    # for database (data, friendly_name)                                                                                                                                          
    STATUS_CHOICES = (
                      (STATUSES['SUCCESS_ABT'], 'Success for Amazon account payment method',),
                      (STATUSES['SUCCESS_ACH'], 'Success for bank account payment method',),
                      (STATUSES['SUCCESS_CC'], 'Success for credit card payment method',),
                      (STATUSES['SYSTEM_ERROR'], 'System error',),
                      (STATUSES['ABORTED'], 'Aborted by user',),
                      (STATUSES['CALLER_ERROR'], 'Caller exception',),
                      (STATUSES['PAYMENT_METHOD_ERROR'], 'User does not have requested payment method',),
                      (STATUSES['PAYMENT_ERROR'], 'Account type does not support specified payment method. Or user already authorized token.',),
                      (STATUSES['DEVELOPER_ERROR'], 'Developer is not registered as a third party caller to make this transaction',),
                      (STATUSES['RESPONSE_NOT_RECEIVED'], 'Request to CBUI has either not been sent or not received',),
                      (STATUSES['RESPONSE_ERROR'], 'Callback is called, but something unexpected prevents us from parsing a status',),
                      (STATUSES['CANCELLED'], 'Token cancelled by user'),
                      (STATUSES['EXPIRED'], 'Token expired')
                     )

    user = models.ForeignKey(User)
    # for auth request. good for 7 days
    caller_reference = models.CharField(max_length=28)
    # time caller_reference was created
    timestamp = models.DateTimeField()
    payment_reason = models.CharField(max_length=400)
    global_amount_limit = models.CharField(max_length=32)
    recipient_slug_list = models.CharField(max_length=400)
    
    # auth callback parameters
    token_id = models.CharField(max_length=64, blank=True, null=True)
    expiry = models.CharField(max_length=64, blank=True, null=True)
    status = models.CharField(max_length=2,
                              choices=STATUS_CHOICES,
                              default=STATUSES['RESPONSE_NOT_RECEIVED'])
    error_message = models.CharField(max_length=128, blank=True, null=True)
    
    def deep_dict(self):
        return {'caller_reference': self.caller_reference,
                'timestamp': "%s" % self.timestamp.ctime(),
                'payment_reason': self.payment_reason,
                'global_amount_limit': self.global_amount_limit,
                'recipient_slug_list': self.recipient_slug_list,
                'token_id': self.token_id,
                'expiry': self.expiry,
                'status': self.status,
                'error_message': self.error_message}
        
    @classmethod
    def Initialize(klass):
        model_utils.mixin(FPSMultiuseAuthMixin, User)

    @classmethod
    def make(klass, user, parameters):
        parameters = dict(parameters)
        caller_reference = parameters['caller_reference']
        if caller_reference:
            r = FPSMultiuseAuth.get_or_none(caller_reference=caller_reference)
            if r:
                raise "FPSMultiuseAuth already exists for %s" % caller_reference
        parameters['user'] = user
        return FPSMultiuseAuth(user=user,
                               caller_reference=caller_reference,
                               timestamp=datetime.datetime.now(),#parameters['timestamp'],
                               payment_reason=parameters['payment_reason'],
                               global_amount_limit=parameters['global_amount_limit'],
                               recipient_slug_list=parameters['recipient_slug_list'])
                    
    def good_to_go(self):
        return self.success(self.status)
    
    @classmethod
    def success(klass, status):
        return (status == klass.STATUSES['SUCCESS_ABT'] or 
                status == klass.STATUSES['SUCCESS_ACH'] or 
                status == klass.STATUSES['SUCCESS_CC'])
        
    def needs_new_caller_reference(self):
        if self.good_to_go():
            return False
        elif not self.caller_reference or not self.timestamp:
            return True
        else:
            now = datetime.datetime.now()
            seven_days = datetime.timedelta(days=7)
            return now - seven_days > self.timestamp
        
    def __unicode__(self):
        return u"FPS Multiuse Auth %s (%s): %s" % (self.user.private_key, self.caller_reference, self.get_status_display())

class FPSMultiuseAuthMixin(object):
    """ mixed into User class """
    
    @property
    def fps_multiuse_auth(self):
        return self.fpsmultiuseauth_set.all().order_by('timestamp')
    
    def authorized(self):
        for auth in self.fps_multiuse_auth:
            if auth.good_to_go():
                return True
        return False

class FPSMultiusePay(models.Model):
    """
    """
    # Valid statuses                                                                                                                                                                
    STATUSES = {'SUCCESS':'S',
                'PENDING': 'P',
                'CANCELLED': 'C', # was pending, now cancelled
                'RESERVED': 'R',
                'FAILURE': 'F',
                'ERROR': 'E', # something messed up before we could even get a transaction status
                'REFUND_INITIATED': 'I',
                'REFUNDED': 'D'}
    
    # for database (data, friendly_name)                                                                                                                                          
    STATUS_CHOICES = ((STATUSES['SUCCESS'], 'Success',),
                      (STATUSES['PENDING'], 'Pending',),
                      (STATUSES['CANCELLED'], 'Cancelled',),
                      (STATUSES['RESERVED'], 'Reserved',),
                      (STATUSES['FAILURE'], 'Failure',),
                      (STATUSES['ERROR'], 'Error',),
                      (STATUSES['REFUND_INITIATED'], 'Refund_Initiated',),
                      (STATUSES['REFUNDED'], 'Refunded',))

    user = models.ForeignKey(User)
    recipient = models.ForeignKey(Recipient)
    
    # for auth request. good for 7 days
    caller_reference = models.CharField(max_length=28)
    # time caller_reference was created
    timestamp = models.DateTimeField()
    
    marketplace_fixed_fee = models.CharField(max_length=32)
    marketplace_variable_fee = models.CharField(max_length=32)
    recipient_token_id = models.CharField(max_length=64)
    refund_token_id = models.CharField(max_length=64)
    sender_token_id = models.CharField(max_length=64)
    transaction_amount = models.CharField(max_length=32)
    
    # pay callback parameters
    request_id = models.CharField(max_length=64, blank=True, null=True)
    transaction_id = models.CharField(max_length=64, blank=True, null=True)
    transaction_status = models.CharField(max_length=2, choices=STATUS_CHOICES)
    error_message = models.CharField(max_length=200, blank=True, null=True)
    error_code = models.CharField(max_length=128, blank=True, null=True)
    
    @classmethod
    def Initialize(klass):
        model_utils.mixin(FPSMultiusePayMixin, User)

    @classmethod
    def make(klass, user, recipient,
             caller_reference,
             timestamp,
             marketplace_fixed_fee,
             marketplace_variable_fee,
             recipient_token_id,
             #refund_token_id,
             sender_token_id,
             transaction_amount,
             request_id,
             transaction_id,
             transaction_status,
             error_message,
             error_code):
        if transaction_status == 'PENDING':
            transaction_status = klass.STATUSES['PENDING']
        elif error_code == 'FOO':
            #status = klass.STATUSES['FOO']
            pass
        return FPSMultiusePay(user=user, recipient=recipient,
                              caller_reference=caller_reference,
                              timestamp=datetime.datetime.now(),
                              marketplace_fixed_fee=marketplace_fixed_fee,
                              marketplace_variable_fee=marketplace_variable_fee,
                              recipient_token_id=recipient_token_id,
                              refund_token_id=0,
                              sender_token_id=sender_token_id,
                              transaction_amount=transaction_amount,
                              request_id=request_id,
                              transaction_id=transaction_id,
                              transaction_status=transaction_status,
                              error_message=error_message,
                              error_code=error_code)
    
    def reset_caller_reference(self):
        self.caller_reference = fps.create_id(12),
        self.timestamp = datetime.datetime.now()
        self.save()
    
    def good_to_go(self):
        return (self.transaction_status == FPSMultiusePay.STATUSES['SUCCESS_ABT'] or \
                                           FPSMultiusePay.STATUSES['SUCCESS_ACH'] or \
                                           FPSMultiusePay.STATUSES['SUCCESS_CC'])
        
    def needs_new_caller_reference(self):
        if self.good_to_go():
            return False
        elif not self.caller_reference or not self.timestamp:
            return True
        else:
            now = datetime.datetime.now()
            seven_days = datetime.timedelta(days=7)
            return now - seven_days > self.timestamp
    
    def deep_dict(self):
        return {'caller_reference': self.caller_reference,
                'timestamp': "%s" % self.timestamp.ctime(),
                'marketplace_fixed_fee': self.marketplace_fixed_fee,
                'marketplace_variable_fee': self.marketplace_variable_fee,
                'recipient_slug': self.recipient.slug,
                'refund_token_id': self.refund_token_id,
                'sender_token_id': self.sender_token_id,
                'transaction_amount': self.transaction_amount,
                'request_id': self.request_id,
                'transaction_id': self.transaction_id,
                'transaction_status': self.transaction_status,
                'error_message': self.error_message,
                'error_code': self.error_code}
    
    def __unicode__(self):
        return u"FPS Multiuse Pay status: %s" % self.get_transaction_status_display()

class FPSMultiusePayMixin(object):
    """ mixed into User class """
    
    @property
    def fps_multiuse_pay(self):
        return self.fpsmultiusepay_set.all().order_by('timestamp')
    
class FPSMultiuseCancelToken(models.Model):
    """
    """
    user = models.ForeignKey(User)
    token_id = models.CharField(max_length=32)
    reason_text = models.CharField(max_length=400, blank=True)
    timestamp = models.DateTimeField()
    response_metadata = models.CharField(max_length=64, blank=True, null=True)
    request_id = models.CharField(max_length=64, blank=True, null=True)

    error_code = models.CharField(max_length=64, blank=True, null=True)
    error_message = models.CharField(max_length=256, blank=True, null=True)
    
    @classmethod
    def Initialize(klass):
        model_utils.mixin(FPSMultiuseCancelTokenMixin, User)

    @classmethod
    def make(klass, user, token_id, reason_text, timestamp):
        return FPSMultiuseCancelToken(user=user,
                                      token_id=token_id,
                                      reason_text=reason_text,
                                      timestamp=datetime.datetime.now())
    
    def __unicode__(self):
        return u"FPS Multiuse CancelToken: %s" % self.response_metadata

class FPSMultiuseCancelTokenMixin(object):
    """ mixed into User class """
    
    @property
    def fps_multiuse_canceltoken(self):
        return self.fpsmultiusecanceltoken_set.all().order_by('timestamp')

ALL_MODELS = [FPSRecipient,
              FPSMultiuseAuth,
              FPSMultiusePay,
              FPSMultiuseCancelToken]
