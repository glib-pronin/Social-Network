"""
ASGI config for SocialNetwork project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SocialNetwork.settings')
django_asgi_app = get_asgi_application()

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from chat_app.routing import websocket_urlpatterns_chat
from profile_app.routing import websocket_urlpatterns_profile
from channels.auth import AuthMiddlewareStack

application = ProtocolTypeRouter({
    'http': django_asgi_app,
    'websocket': AuthMiddlewareStack(URLRouter(websocket_urlpatterns_chat + websocket_urlpatterns_profile))
})

