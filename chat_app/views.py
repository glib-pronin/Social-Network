from django.shortcuts import render

# Create your views here.

def render_chat(req):
    return render(request=req, template_name='chat_app/chat.html')