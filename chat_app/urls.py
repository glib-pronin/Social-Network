from django.urls import path
from .views import *

urlpatterns = [
    path('', render_select_chat, name='select_chat'),
    path('', render_chat, name='chat'),
]