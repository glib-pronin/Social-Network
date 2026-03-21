from django.urls import path
from .views import *

urlpatterns = [
    path('', render_chat_lobby, name='chat_lobby'),
    path('get-friends-list', get_friends_list, name='get_friends_list'),
    path('create-group', create_group, name=''),
    path('get-messages', get_messages, name='get_messages'),
    path('', render_chat, name='chat'),
]