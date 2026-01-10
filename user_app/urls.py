from django.urls import path
from .views import *

urlpatterns = [
    path('registration', view=render_registration, name='registration')
]