from django.shortcuts import render
from django.http import HttpRequest

# Create your views here.

def render_registration(req: HttpRequest):
    return render(
        request=req,
        template_name='user_app/registration.html'
    )