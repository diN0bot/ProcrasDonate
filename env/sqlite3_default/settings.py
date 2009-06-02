# Default Django settings for sqlite3 development

DOMAIN = "localhost:8000"

DEBUG = True
DEBUG_SQL = True
DJANGO_SERVER = True
DEBUG_TOOLBAR = False

# Make this unique, and don't share it with anybody.                                                                                                           
SECRET_KEY = 'oez0xk+-u34bcyd!+z0w=79mc^_tf9zm05nm9ia9)zps2s56a2'

DATABASE_ENGINE = 'sqlite3'
DATABASE_NAME = PROJECT_PATH+"/mydatabase.db"
