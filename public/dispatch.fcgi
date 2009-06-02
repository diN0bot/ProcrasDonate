#!/usr/bin/python                                                                                 

import sys, os

sys.path.insert(0, os.path.realpath('/usr/local/django_src/django'))

PROJECT_PATH=os.environ['PROJECT_PATH']

sys.path.insert(0, PROJECT_PATH)

os.chdir(PROJECT_PATH)

os.environ['DJANGO_SETTINGS_MODULE'] = "settings"

from django.core.servers.fastcgi import runfastcgi

#runfastcgi(method="prefork",daemonize='false',socket="/tmp/django-hm.sock",)                     
#runfastcgi(method="threaded",daemonize='false',socket="/tmp/django-hm.sock",)                    
runfastcgi(method="threaded",daemonize='false',)
