from models import *

import datetime

class Aggregator(objects):
    
    def aggregate(self):
        
        
        for rv in RecipientVisit.objects.filter(received_time__gte=)