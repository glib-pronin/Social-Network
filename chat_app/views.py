from django.shortcuts import render, redirect
from .models import *

# Create your views here.

def render_chat(req, chat_id: int):
    chat = Chat.objects.filter(pk=chat_id).first()
    if not chat:
        return redirect('select_chat')
    return render(request=req, template_name='chat_app/chat.html', context={'chat': chat})

def render_select_chat(req):
    return render(request=req, template_name='chat_app/select_chat.html')