# Default Django settings for sqlite3 development

DOMAIN = "http://localhost:8282"
API_DOMAIN = "http://localhost:8282"

DEBUG = True
DEBUG_SQL = True
DJANGO_SERVER = True
DEBUG_TOOLBAR = False

# Make this unique, and don't share it with anybody.                                                                                                           
SECRET_KEY = 'oez0xk+-u34bcyd!+z0w=79mc^_tf9zm05nm9ia9)zps2s56a2'

DATABASE_ENGINE = 'sqlite3'
DATABASE_NAME = PROJECT_PATH+"/mydatabase.sqlite"

##### AMAZON FPS SETTINGS #####
## retrieve your own caller key and secret key by
## registering for a developer AWS account
## https://aws-portal.amazon.com/gp/aws/developer/registration/index.html

SANDBOX_PAYMENTS = True
FPS = {'callerKey': "FILL ME IN",
      'secretKey': "FILL ME IN",
      'version': '2009-01-09',
      'cobrandingUrl': "http://procrasdonate.com/procrasdonate_media/img/ProcrasDonateLogoText.png",
      'websiteDescription': "ProcrasDonate (charitable incentives for good time management)"}
