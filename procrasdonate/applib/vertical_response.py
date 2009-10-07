from suds.client import Client
url = 'https://api.verticalresponse.com/partner-wsdl/1.0/VRAPI.wsdl'
client = Client(url, cache=None)
credentials = client.factory.create('ns0:loginArgs')
credentials.username='clay@bilumi.org'
credentials.password='XXX'
credentials.session_duration_minutes=30
client.service.login(credentials)

# the above line fails:
#    WebFault: Server raised fault: 'The username or 
#              password supplied was incorrect.'

# if get Mismatched tag SAXParseException, then delete cache file it specifies
# eg, 
#     rm /var/folders/dJ/dJZpw70JGKmqDc8l+EKImE+++TI/-Tmp-/suds/*                                                       
