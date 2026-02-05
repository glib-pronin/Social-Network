from django.shortcuts import render
from django.http import HttpRequest, JsonResponse
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.template.loader import render_to_string
from user_app.utils import get_data_from_json, User
from .utils import generate_username, get_page_data
from .models import *
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
        context={'first_entry': is_first_entry, 'post_content': get_page_data(Post, 1)}
    )

@login_required(login_url='registration')
def get_post(req: HttpRequest):
    page_num = req.GET.get('page')
    page = get_page_data(Post, page_num)
    return JsonResponse({
        'html_post': render_to_string(template_name='post_app/posts.html', context={'post_content': page}),
        'has_next': page.get('has_next')
    })

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


@login_required(login_url='registration')
@require_http_methods(["POST"])
def create_tag(req: HttpRequest):
    data = get_data_from_json(req.body)
    tag_name = data.get('tagName')
    if not tag_name:
        return JsonResponse({'success': False, 'error': 'wrong_data'})
    tag = Tag.objects.filter(name=tag_name).first()
    if not tag:
        tag = Tag.objects.create(name=tag_name.replace('#', ''))
    return JsonResponse({'success': True, 'id': tag.id})

@login_required(login_url='registration')
@require_http_methods(["GET"])
def get_tags(req: HttpRequest):
    data = req.user.profile.get_tags()
    tags = [{'tagName': tag.name, 'id': tag.id} for tag in data]
    return JsonResponse({'success': True, 'tags': tags})

@login_required(login_url='registration')
@require_http_methods(["POST"])
def create_post(req: HttpRequest):
    title = req.POST.get('title')
    if not title:
        return JsonResponse({'success': False, 'error': 'no_title'})
    subject = req.POST.get('subject')
    content = req.POST.get('content')
    links = req.POST.get('links')
    tags = get_data_from_json(req.POST.get('tags'))
    post = Post.objects.create(title=title, subject=subject, content=content, links=links, author=req.user)
    post.tags.set(tags or [])
    print(post)
    positions = get_data_from_json(req.POST.get('positions', '[]'))
    images = req.FILES.getlist('images')
    if len(images) == len(positions):
        for img, pos in zip(images, positions):
            PostImage.objects.create(image=img, row=pos.get('row'), column=pos.get('col'), post=post)
    return JsonResponse({'success': True})

