from django.shortcuts import render, redirect
from django.http import HttpRequest, JsonResponse
from .models import User, EmailVerification
from django.contrib.auth import login, logout
from .utils import *
from .decorators import anonymous_required

# Create your views here.

@anonymous_required
def render_registration(req: HttpRequest):
    if req.method == 'POST':
        data = get_data_from_json(req.body)
        email = data.get('email')
        if not checkEmail(email): 
            return JsonResponse(data={'success': False, 'error': 'wrong_email'})
        password = data.get('password')
        confirm_password = data.get('confirmPassword')
        if not email or not password or not confirm_password:
            return JsonResponse(data={'success': False, 'error': 'missing_fields'})
        if password != confirm_password:
            return JsonResponse(data={'success': False, 'error': 'unmatched_password'})
        if User.objects.filter(email=email, is_active=True).exists():
            return JsonResponse(data={'success': False, 'error': 'user_exists'})
        code = rand_code()
        user = User.objects.filter(email=email).first()
        if user:
            user.set_password(password)
            user.save()
            user.email_verification.set_code(code)
        else:  
            user = User.objects.create_user(username=email, email=email, password=password, is_active=False)
            email_verification = EmailVerification(user=user)
            email_verification.set_code(code=code)
        try:
            send_code(code, email)
        except Exception as e:
            print(e)
            return JsonResponse(data={'success': False, 'error': 'smtp_error'})
        return make_response_with_cookie('email', email, {'success': True, 'email': email})
    return render(
        request=req,
        template_name='user_app/registration.html'
    )

@anonymous_required
def login_user(req: HttpRequest):
    if req.method == 'POST':
        data = get_data_from_json(req.body)
        email = data.get('email')
        if not checkEmail(email): 
            return JsonResponse(data={'success': False, 'error': 'wrong_email'})
        password = data.get('password')
        if not email or not password:
            return JsonResponse(data={'success': False, 'error': 'missing_fields'})
        user = authenticate_by_email(email, password)
        if user:
            if user.is_active:
                login(request=req, user=user)
                return JsonResponse({'success': True})
            else:
                code = rand_code()
                user.email_verification.set_code(code)
                try:
                    send_code(code, email)
                except Exception:
                    return JsonResponse(data={'success': False, 'error': 'smtp_error'})
                return make_response_with_cookie('email', email, {'success': False, 'error': 'verify_email', 'email': email})
        else:
            return JsonResponse(data={'success': False, 'error': 'incorrect_credentials'})
    return redirect('/registration')

@anonymous_required
def verify_code(req:HttpRequest):
    if req.method == 'POST':
        data = get_data_from_json(req.body)
        code = data.get('code')
        email = req.COOKIES.get('email')
        if not email:
            return JsonResponse(data={'success': False, 'error': 'no_email_cookie'})
        user = User.objects.filter(email=email).first()
        if not user:
            return JsonResponse(data={'success': False, 'error': 'user_not_found'})
        if user.email_verification.check_code(code):
            user.is_active = True
            user.save()
            login(request=req, user=user)
            resp = JsonResponse({'success': True})
            resp.delete_cookie('email')
            return resp
        else: 
            return JsonResponse(data={'success': False, 'error': 'wrong_code'})
    return redirect('/registration')
    