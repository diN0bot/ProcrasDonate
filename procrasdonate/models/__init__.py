"""
from data import *
from rank import *

ALL_MODELS = [Site, Recipient, ContentProvider,
              OverallAmount_R, OverallAmount_S, OverallAmount_CP,
              OverallTime_R, OverallTime_S, OverallTime_CP,
              PopularAmount_R, PopularAmount_S, PopularAmount_CP,
              PopularTime_R, PopularTime_S, PopularTime_CP]

from lib import model_utils
model_utils.mixin(model_utils.ModelMixin, ALL_MODELS)

from lib.admins import Adminizer
Adminizer.Adminize(ALL_MODELS)

for model in ALL_MODELS:
    if hasattr(model, 'Initialize'):
        model.Initialize()
"""