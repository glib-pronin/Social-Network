from django.shortcuts import render
from django.http import JsonResponse, HttpRequest
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from user_app.utils import get_data_from_json, check_email, User, rand_code, send_code
from post_app.utils import is_username_available
from user_app.models import EmailVerification
from profile_app.models import Profile
from ..utils import str_to_bool, is_valid_pseudonym
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

    ev = getattr(req.user, 'email_verification', None)
    if ev and ev.is_verified:
        req.user.email = ev.new_email
        ev.delete()
    
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
    old_password = data.get('oldPassword')
    if not req.user.check_password(old_password):
        return JsonResponse({'success': False, 'error': 'wrong_payload'})
    if not password or len(password) < 6 or password != confirm_password:
        return JsonResponse({'success': False, 'error': 'wrong_payload'})
    req.user.set_password(password)
    req.user.save()
    update_session_auth_hash(request=req, user=req.user)
    return JsonResponse({'success': True})

@login_required(login_url='registration')
@require_http_methods(["POST"])
def update_signature(req: HttpRequest):
    signature = req.FILES.get('signature')
    profile, _ = Profile.objects.get_or_create(user=req.user)
    pseudonym = req.POST.get('pseudonym', '').strip()
    if pseudonym and not is_valid_pseudonym(pseudonym):
        return JsonResponse({'success': False, 'error': 'invalid_pseudonym'})
    if pseudonym:
        profile.pseudonym = pseudonym
    if 'is_image_signature' in req.POST:
        profile.is_image_signature = str_to_bool(req.POST.get('is_image_signature'))
    if 'is_text_signature' in req.POST:
        profile.is_text_signature = str_to_bool(req.POST.get('is_text_signature'))
    if signature:
        if profile.signature:
            profile.signature.delete(save=False)
        profile.signature = signature
    profile.save()
    url = '' if not profile.signature else profile.signature.url
    return JsonResponse({
        'success': True, 'url': url, 
        'is_image_signature': profile.is_image_signature,
        'is_text_signature': profile.is_text_signature,
        'pseudonym': profile.pseudonym,
        })

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
            profile.photo.delete(save=False)
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

@login_required(login_url='registration')
@require_http_methods(["POST"])
def start_email_verification(req: HttpRequest):
    data = get_data_from_json(req.body)
    email = data.get('email')
    if not email or not check_email(email):
        return JsonResponse({'success': False, 'error': 'invalid_email'})
    if User.objects.filter(email=email).exclude(pk=req.user.id).exists():
        return JsonResponse({'success': False, 'error': 'email_exists'})
    code = rand_code()
    ev, _ = EmailVerification.objects.get_or_create(user=req.user)
    ev.set_code(code)
    ev.new_email = email
    ev.save()
    try:
        send_code(code=code, email=email)
    except:
        return JsonResponse({'success': False, 'error': 'smtp_error'})
    return JsonResponse({'success': True, 'email': email})

@login_required(login_url='registration')
@require_http_methods(["POST"])
def verify_email_code(req: HttpRequest):
    data = get_data_from_json(req.body)
    code = data.get('code')
    ev = getattr(req.user, 'email_verification', None)
    if not ev:
        return JsonResponse({'success': False, 'error': 'no_verification'})
    if not ev.check_code(code):
        return JsonResponse({'success': False, 'error': 'wrong_code'})
    ev.is_verified = True
    ev.save()
    return JsonResponse({'success': True, 'email': ev.new_email})

@login_required(login_url='registration')
@require_http_methods(["POST"])
def cancel_email_verification(req: HttpRequest):
    ev = getattr(req.user, 'email_verification', None)
    if ev:
        ev.delete()
    return JsonResponse({'success': True})