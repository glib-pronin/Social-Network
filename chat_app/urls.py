from django.urls import path
from .views import *

urlpatterns = [
    path('', render_chat, name='chat')
]