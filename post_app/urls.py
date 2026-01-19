from django.urls import path
from .views import *

urlpatterns = [
    path('', view=render_main, name='main'),
    path('first-entry', view=handle_first_entry, name='first_entry'),
    path('generate-username', view=send_username, name='first_entry'),
]