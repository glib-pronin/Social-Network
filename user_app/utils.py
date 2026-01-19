from django.contrib.auth.models import User
from django.http import JsonResponse
from django.core.mail import send_mail
from django.template.loader import render_to_string
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
    send_mail(
        subject="Підтвердження email - World IT",
        message=text_content,
        recipient_list=[email],
        fail_silently=False,
        from_email=None,
        html_message=html_content
    )

def checkEmail(email):
    return re.match(r'^[\w+._%-]+@[\w.-]+\.[a-zA-Z]{2,}$', email)