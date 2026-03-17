from django.shortcuts import render, redirect
from .models import *
from django.db.models import Prefetch, Max, F


# Create your views here.

def render_chat(req, chat_id: int):
    chat = Chat.objects.filter(pk=chat_id).first()
    if not chat:
        return redirect('select_chat')
    return render(request=req, template_name='chat_app/chat.html', context={'chat': chat})

def render_chat_lobby(req):
    friends = req.user.profile.friends.select_related('user', 'photo').all()
    chats = req.user.chats.annotate(
        last_message_time = Max('messages__created_at')
    ).order_by(F('last_message_time').desc(nulls_last=True)).prefetch_related(Prefetch(
        'users',
        queryset=User.objects.exclude(pk=req.user.id).prefetch_related('profile__photo'),
        to_attr='chat_users'
    )).prefetch_related(Prefetch(
        'messages',
        queryset=Message.objects.order_by('-created_at'),
        to_attr='all_messages'
    ))
    return render(request=req, template_name='chat_app/chat_lobby.html', context={'friends': friends, 'chats': chats})