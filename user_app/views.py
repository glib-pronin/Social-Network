from django.shortcuts import render, redirect
from django.http import HttpRequest, JsonResponse
from django.views.decorators.http import require_http_methods
from .models import User, EmailVerification, Profile
from django.contrib.auth import login, logout
from .utils import *
from .decorators import anonymous_required

# Create your views here.

@anonymous_required
def render_registration(req: HttpRequest):
    if req.method == 'POST':
        data = get_data_from_json(req.body)
        email = data.get('email')
        if not check_email(email): 
            return JsonResponse(data={'success': False, 'error': 'wrong_email'})
        password = data.get('password')
        confirm_password = data.get('confirmPassword')
        if not email or not password or not confirm_password:
            return JsonResponse(data={'success': False, 'error': 'missing_fields'})
        if password != confirm_password:
            return JsonResponse(data={'success': False, 'error': 'unmatched_password'})
        if User.objects.filter(email=email, is_active=True).exists():
            return JsonResponse(data={'success': False, 'error': 'user_exists'})
        user = User.objects.filter(email=email).first()
        if user:
            return make_response_with_cookie('pk', user.pk, {'success': True, 'email': email})
        else:  
            user = User.objects.create_user(username=email, email=email, password=password, is_active=False)
            EmailVerification.objects.create(user=user)
        return make_response_with_cookie('pk', user.pk, {'success': True, 'email': email})
    return render(
        request=req,
        template_name='user_app/registration.html'
    )

@anonymous_required
@require_http_methods(["POST"])
def login_user(req: HttpRequest):
    data = get_data_from_json(req.body)
    email = data.get('email')
    if not check_email(email): 
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
            return make_response_with_cookie('pk', user.id, {'success': False, 'error': 'verify_email', 'email': email})
    else:
        return JsonResponse(data={'success': False, 'error': 'incorrect_credentials'})

@anonymous_required
@require_http_methods(["POST"])
def handle_sending_code(req: HttpRequest):
    pk = req.COOKIES.get('pk')
    if not pk:
        return JsonResponse(data={'success': False, 'error': 'no_pk_cookie'})
    user = User.objects.filter(pk=pk).first()
    if not user or user.is_active:
        return JsonResponse(data={'success': False, 'error': 'user_not_found'})
    code = rand_code()
    user.email_verification.set_code(code)
    try:
        send_code(code, user.email)
    except Exception:
        return JsonResponse(data={'success': False, 'error': 'smtp_error'})
    return JsonResponse(data={'success': True})

@anonymous_required
@require_http_methods(["POST"])
def verify_code(req: HttpRequest):
    data = get_data_from_json(req.body)
    code = data.get('code')
    pk = req.COOKIES.get('pk')
    if not pk:
        return JsonResponse(data={'success': False, 'error': 'no_pk_cookie'})
    user = User.objects.filter(pk=pk).first()
    if not user or user.is_active:
        return JsonResponse(data={'success': False, 'error': 'user_not_found'})
    if user.email_verification.check_code(code):
        user.is_active = True
        Profile.objects.get_or_create(user=user)
        user.email_verification.delete()
        user.save()
        login(request=req, user=user)
        resp = JsonResponse({'success': True})
        resp.delete_cookie('pk')
        return resp
    else: 
        return JsonResponse(data={'success': False, 'error': 'wrong_code'})

def logout_user(req: HttpRequest):
    logout(request=req)
    return redirect('/registration')