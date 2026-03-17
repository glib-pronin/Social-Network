from django.urls import path
from .views import *

urlpatterns = [
    path('', render_chat_lobby, name='chat_lobby'),
    path('', render_chat, name='chat'),
]