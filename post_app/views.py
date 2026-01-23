from django.shortcuts import render
from django.http import HttpRequest, JsonResponse
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from user_app.utils import get_data_from_json, User
from .utils import generate_username
import re

# Create your views here.

@login_required(login_url='registration')
def render_main(req: HttpRequest):
    is_first_entry = False
    first_entry = req.GET.get('first_entry')
    if first_entry == 'true' and not req.user.first_name:
        is_first_entry = True
    return render(
        request=req,
        template_name='post_app/main.html',
        context={'first_entry': is_first_entry}
    )

@login_required(login_url='registration')
@require_http_methods(["POST"])
def handle_first_entry(req: HttpRequest):
    data = get_data_from_json(req.body)
    req.user.first_name = data.get('firstName')
    req.user.last_name = data.get('lastName')
    username = data.get('username')
    if not username or not re.match(r'^@[a-z0-9]+([_.][a-z0-9]+)*$', username):
        return JsonResponse({'success': False, 'error': 'wrong_data'})
    user = User.objects.filter(username=username).first()
    if not user and username:
        req.user.username = username
    req.user.save()
    return JsonResponse({'success': not user and username})
        
@login_required(login_url='registration')
@require_http_methods(["POST"])
def send_username(req: HttpRequest):
    data = get_data_from_json(req.body)
    first_name = data.get('firstName')
    last_name = data.get('lastName')
    if not first_name or not last_name:
        return JsonResponse({'success': False, 'error': 'wrong_data'})
    username = generate_username(first_name, last_name)
    return JsonResponse({'username': username})
