from django.urls import path
from .views import *

urlpatterns = [
    path('', view=render_profile, name='profile'),
    path('update-credentials', view=update_credentials, name='update-credentials'),
    path('update-password', view=update_passwords, name='update-password'),
    path('update-personal-data', view=update_personal_data, name='update-personal-data'),
    path('username-available', view=check_username, name='username-available'),
]