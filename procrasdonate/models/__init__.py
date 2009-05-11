from data import *
from rank import *

from data import ALL_MODELS as DATA_MODELS
from rank import ALL_MODELS as RANK_MODELS

ALL_MODELS = DATA_MODELS + RANK_MODELS

from lib import model_utils
model_utils.mixin(model_utils.ModelMixin, ALL_MODELS)

from lib.admins import Adminizer
Adminizer.Adminize(ALL_MODELS)

for model in ALL_MODELS:
    if hasattr(model, 'Initialize'):
        model.Initialize()
