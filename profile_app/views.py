from django.shortcuts import render
from django.http import JsonResponse, HttpRequest, QueryDict
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from user_app.utils import get_data_from_json, check_email, User
from post_app.utils import is_username_available
from user_app.models import Profile
from datetime import date
import re

# Create your views here.

@login_required(login_url='registration')
def render_profile(req: HttpRequest): 
    return render(
        request=req,
        template_name='profile_app/profile.html'
    )

@login_required(login_url='registration')
@require_http_methods(["PATCH"])
def update_credentials(req: HttpRequest):
    data = get_data_from_json(req.body)
    first_name = data.get('firstName')
    last_name = data.get('lastName')
    birth_date = data.get('birthDate')
    email = data.get('email')

    if not email or not check_email(email):
        return JsonResponse({ 'success': False, 'error': 'invalid_payload' })
    
    user = User.objects.filter(email=email).exclude(pk=req.user.id).first()
    if user: 
        return JsonResponse({ 'success': False, 'error': 'user_exists' })
    req.user.email = email
    req.user.first_name = first_name
    req.user.last_name = last_name
    req.user.save()
    
    try:
        birth_date = date.fromisoformat(birth_date) if birth_date else None
    except:
        return JsonResponse({ 'success': False, 'error': 'invalid_birth_date' })
    profile, _ = Profile.objects.get_or_create(user=req.user)
    profile.birth_date = birth_date
    profile.save()

    return JsonResponse({ 'success': True, 'data': {
        'email': req.user.email,
        'firstName': req.user.first_name,
        'lastName': req.user.last_name,
        'birthDate': birth_date.isoformat() if birth_date else None
    } })
    
@login_required(login_url='registration')
@require_http_methods(["PATCH"])
def update_passwords(req: HttpRequest):
    data = get_data_from_json(req.body)
    password = data.get('password')
    confirm_password = data.get('confirmPassword')
    if not password or len(password) < 6 or password != confirm_password:
        return JsonResponse({'success': False, 'error': 'wrong_payload'})
    req.user.set_password(password)
    req.user.save()
    update_session_auth_hash(request=req, user=req.user)
    return JsonResponse({'success': True})

@login_required(login_url='registration')
@require_http_methods(["POST"])
def update_personal_data(req: HttpRequest):
    username = req.POST.get('username')
    avatar = req.FILES.get('avatar')
    if not username or not re.match(r'^@[a-z0-9]+([_.][a-z0-9]+)*$', username):
        return JsonResponse({'success': False, 'error': 'wrong_payload'})
    if not is_username_available(username=username, user=req.user):
        return JsonResponse({'success': False, 'error': 'wrong_payload'})
    req.user.username = username
    req.user.save()
    if avatar:
        profile, _ = Profile.objects.get_or_create(user=req.user)
        if profile.photo:
            profile.photo.delete()
        profile.photo = avatar
        profile.save()
    return JsonResponse({'success': True,'data': {
        'username': req.user.username,
        'photo_url': req.user.profile.photo.url if req.user.profile.photo else None
        }})

@login_required(login_url='registration')
@require_http_methods(["GET"])
def check_username(req: HttpRequest):
    username = req.GET.get('username')
    return JsonResponse({'available': is_username_available(username=username, user=req.user)})