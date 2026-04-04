from django.urls import path
from .consumers import *

websocket_urlpatterns_chat = [
    path('chat/<int:chat_id>', view=ChatConsumer.as_asgi())
]