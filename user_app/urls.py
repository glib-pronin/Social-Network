from django.urls import path
from .views import *

urlpatterns = [
    path('registration', view=render_registration, name='registration'),
    path('login', view=login_user, name='login'),
    path('verify-email', view=verify_code, name='verify-email'),
    path('send-code', view=handle_sending_code, name='send-code'),
    path('logout', view=logout_user, name='logout'),
]