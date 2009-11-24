
from django.utils import simplejson as json
from settings import FPS

import base64
import hmac
import sha
import random
import urllib

CBUI_TYPE = 'cbui'
CBUI_CALLBACK_TYPE = 'cbui_callback'
REST_TYPE = 'rest'

SIGNAME = {CBUI_TYPE: 'awsSignature',
           CBUI_CALLBACK_TYPE: 'signature',
           REST_TYPE: 'Signature'}

def get_pipeline_signature(parameters, path=None):
    """
    Returns the signature for the Amazon FPS Pipeline request that will be
    made with the given parameters.  Pipeline signatures are calculated with
    a different algorithm from the REST interface.  Names and values are
    url encoded and separated with an equal sign, unlike the REST 
    signature calculation.
    """
    if path is None:
        #path = "https://authorize.payments.amazon.com/cobranded-ui/actions/start?"
        path = "/cobranded-ui/actions/start?"
    keys = parameters.keys()
    keys.sort(upcase_compare)
    to_sign = path
    for k in keys:
        to_sign += "%s=%s&" % (urllib.quote(k), urllib.quote(parameters[k]).replace("/", "%2F"))
    to_sign = to_sign[0:-1]
    x = _calculateRFC210HMAC(to_sign)
    return x

def upcase_compare(left, right):
    left = left.upper()
    right = right.upper()
    if left < right:
        return -1
    elif left > right:
        return 1
    else:
        return 0

def _calculateRFC210HMAC(string):
    """                                                                                                                                                                           
    Computes a RFC 2104 compliant HMAC Signature and then Base64 encodes it                                                                                                       
    """
    return base64.encodestring(hmac.new(FPS['secretKey'], string, sha).digest()).strip()

def _getStringToSign(parameters, type):
    keys = parameters.keys()
    # sort must be case insensitive (even though parameters are case sensitive for amazon)
    keys.sort(upcase_compare)
    #print "GET STRING TO SIGN FOR ", type
    if type == CBUI_TYPE:
        #ret = "https://authorize.payments-sandbox.amazon.com/cobranded-ui/actions/start?"
        ret = "/cobranded-ui/actions/start?"
        for key in keys:
            #ret += "%s=%s&" % (key, parameters[key])
            ret += "%s=%s&" % (urllib.quote(key), urllib.quote("%s" % parameters[key]).replace("/", "%2F"))
            #print "%s=%s&" % (urllib.quote(key), urllib.quote("%s" % parameters[key]).replace("/", "%2F"))
        ret = ret[:-1]
            
    else:
        ret = ""
        for key in keys:
            ret += "%s%s" % (key, parameters[key])
            #ret += "%s%s" % (urllib.quote(key), urllib.quote("%s" % parameters[key]).replace("/", "%2F"))
            #print "%s --> %s" % (urllib.quote(key), urllib.quote("%s" % parameters[key]).replace("/", "%2F"))

    #print 
    #print ret
    #print
    return ret

def get_signature(parameters, type):
    return _calculateRFC210HMAC( _getStringToSign(parameters, type) )

def finalize_parameters(parameters, type):
    #parameters["signatureVersion"] = "1"
    #parameters["signatureMethod"] = "HmacSHA1"
    
    #parameters['Timestamp'] = getNowTimeStamp()
    #parameters[SIGNAME[type]] = urllib.quote(get_signature(parameters, type))
    parameters[SIGNAME[type]] = get_signature(parameters, type)
    
    #print
    #print "XXXXXXXXX"
    #print get_pipeline_signature(parameters)
    #parameters[SIGNAME[type]] = get_pipeline_signature(parameters)
    
def is_corrupted(parameters, type):
    """
    @param parameters: dictionary of parameters. should include signature.
    @return: True if signature in parameters does not match computed signature from parameters (minus signature)
    @side-effect: removes signature from parameters
    """
    signature = parameters[SIGNAME[type]]
    del(parameters[SIGNAME[type]])
    
    computed_signature = get_signature(parameters, type)
    return computed_signature != signature

def create_id(bits):
    alphas = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    ret = ""
    for i in range(bits):
        ret += alphas[random.randint(0,len(alphas)-1)]
    return ret
