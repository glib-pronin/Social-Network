from django.urls import path
from .views import *

urlpatterns = [
    path('', view=render_main, name='main'),
    path('first-entry', view=handle_first_entry, name='first_entry'),
    path('generate-username', view=send_username, name='first_entry'),
    path('create-tag', view=create_tag, name='create_tag'),
    path('get-tags', view=get_tags, name='get_tags'),
    path('create-post', view=create_post, name='create_post'),
]