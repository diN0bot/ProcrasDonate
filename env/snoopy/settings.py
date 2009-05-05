# Django settings for database project.

DJANGO_SERVER = True

DEBUG = True
DEBUG_SQL = True
DEBUG_TOOLBAR = False

# twill thing
DEBUG_PROPAGATE_EXCEPTIONS = True

# Make this unique, and don't share it with anybody.  
SECRET_KEY = 'alsosekret'

DATABASE_ENGINE = 'sqlite3'
DATABASE_NAME = pathify([PROJECT_PATH, "mydatabase.db"], file_extension=True)

INSTALLED_APPS += (
    'django_evolution',
)
