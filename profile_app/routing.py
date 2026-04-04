from django.urls import path
from .consumers import *

websocket_urlpatterns_profile = [
    path('presence', view=PresenceConsumer.as_asgi())
]