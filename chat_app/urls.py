from django.urls import path
from .views import *

urlpatterns = [
    path('', render_chat_lobby, name='chat_lobby'),
    path('get-friends-list', get_friends_list, name='get_friends_list'),
    path('create-group', create_group, name=''),
    path('open-chat', open_chat, name='open_chat'),
    path('get-messages/<int:chat_id>', get_messages, name='get_messages'),
    path('get-group-data/<int:chat_id>', get_group_data, name='get_group_data'),
    path('edit-group/<int:chat_id>', edit_group, name='edit_group'),
    path('leave-group/<int:chat_id>', leave_group, name='leave_group'),
    path('delete-group/<int:chat_id>', delete_group, name='delete_group'),
    path('upload-image/<int:chat_id>', upload_image, name='upload_image'),
    path('read-chat-messages/<int:chat_id>', read_chat_messages, name='read_chat_messages'),
]