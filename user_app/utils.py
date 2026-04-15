from django.contrib.auth.models import User
from django.http import JsonResponse
from django.contrib.auth import login
from django.template.loader import render_to_string
from sendgrid.helpers.mail import Mail
from django.conf import settings
import json, random, re

def get_data_from_json(data)->dict:
    return json.loads(data)

def rand_code():
    return f'{random.randint(a=100000, b=999999):06d}'

def authenticate_by_email(email, password):
    user = User.objects.filter(email=email).first()
    if user and user.check_password(password):
        return user
    return None

def make_response_with_cookie(key, value, data):
    response = JsonResponse(data=data)
    response.set_cookie(key=key, value=value, httponly=True, max_age=60*60*24)
    return response

def send_code(code, email):
    html_content = render_to_string('user_app/verify_email.html', context={'code': code, 'user_email': email})
    text_content = f'Ваш код підтвердження: {code}'
    message = Mail(
        from_email=settings.DEFAULT_FROM_EMAIL,
        to_emails=email,
        subject='Підтвердження email - World IT',
        plain_text_content=text_content,
        html_content=html_content
    )
    settings.SENDGRID_CLIENT.send(message)

def check_email(email):
    return re.match(r'^[a-zA-Z0-9+_%.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email)

def check_password(password):
    if len(password) < 8:
        return False
    if not re.search(r'[A-Z]', password):
        return False
    if not re.search(r'[a-z]', password):
        return False
    if not re.search(r'[0-9]', password):
        return False
    return True

def login_user_with_back(req, user):
    login(request=req, user=user, backend='django.contrib.auth.backends.ModelBackend')