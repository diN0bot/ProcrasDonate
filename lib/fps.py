
from django.utils import simplejson

import base64
import hmac
import sha

def _calculateRFC210HMAC(data):
    """                                                                                                                                                                           
    Computes a RFC 2104 compliant HMAC Signature and then Base64 encodes it                                                                                                       
    """
    secretKey = "duHqroR/3xyNQgQRqeO4v4m+tbY5O5mOlqAlCADo"
    return base64.encodestring(hmac.new(secretKey, data, sha).digest()).strip()

def _getStringToSign(params):
    param_names = params.keys()
    param_names.sort(key=str.lower)
    s = "".join([key+params[key] for key in param_names])
    print "QSTR", s
    return s

def get_signature(params):
    return _calculateRFC210HMAC( _getStringToSign(params) )

def extract_parameters(request, method_type, expected_parameters):
    ret = {}
    FAIL = False, None
    SUCCESS = True, ret
    for p in expected_parameters:
        try:
            v = request[method_type].get(p, None)
            if not v:
                return FAIL
            ret[p] = v
        except:
            return FAIL
    return SUCCESS

def finalize_parameters(parameters):
    parameters['Timestamp'] = getNowTimeStamp()
    parameters['awsSignature'] = get_signature(parameters)
