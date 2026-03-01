from django.urls import path
from .consumers import *

websocket_urlpatterns = [
    path('chat/', view=ChatConsumer.as_asgi())
]