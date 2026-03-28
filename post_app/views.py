from django.shortcuts import render
from django.db import IntegrityError
from django.db.models import Count, Q
from django.http import HttpRequest, JsonResponse
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.template.loader import render_to_string
from user_app.utils import get_data_from_json, User
from .utils import generate_username, get_page_data
from .models import *
from profile_app.models import *
from asgiref.sync import sync_to_async
import re

# Create your views here.

@login_required(login_url='registration')
def render_main(req: HttpRequest):
    is_first_entry = False
    first_entry = req.GET.get('first_entry')
    if first_entry == 'true' and not req.user.first_name:
        is_first_entry = True
    hidden_ids = HiddenPost.objects.filter(user=req.user).values_list('post_id', flat=True)
    page_qs = Post.objects.exclude(id__in=hidden_ids)
    page_qs = page_qs.annotate(
        likes_count = Count('likes', distinct=True),
        hearts_count = Count('hearts', distinct=True),
        views_count = Count('views', distinct=True),
        my_like = Count('likes', filter=Q(likes__user=req.user), distinct=True),
        my_heart = Count('hearts', filter=Q(hearts__user=req.user), distinct=True),
        is_viewed = Count('views', filter=Q(views__user=req.user), distinct=True),
    ).order_by('-id').all()
    return render(
        request=req,    
        template_name='post_app/main.html',
        context={'profile_user': req.user, 'first_entry': is_first_entry, 'post_content': get_page_data(page_qs, None)}
    )

@login_required(login_url='registration')
def get_post(req: HttpRequest):
    cursor = req.GET.get('cursor')
    if not cursor:
        return JsonResponse({'success': False, 'error': 'invalid_id'})
    profile_id = req.GET.get('id')
    new_posts = req.GET.get('new_posts', '') == 'true'
    url_name = req.GET.get('url_name', '')
    if not profile_id:
        hidden_ids = HiddenPost.objects.filter(user=req.user).values_list('post_id', flat=True)
        page_qs = Post.objects.exclude(id__in=hidden_ids)
    else:
        profile = Profile.objects.filter(pk=profile_id).first()
        if not profile:
            return JsonResponse({'success': False, 'error': 'invalid_id'})
        page_qs = Post.objects.filter(author=profile.user)
    page_qs = page_qs.annotate(
        likes_count = Count('likes', distinct=True),
        hearts_count = Count('hearts', distinct=True),
        views_count = Count('views', distinct=True),
        my_like = Count('likes', filter=Q(likes__user=req.user), distinct=True),
        my_heart = Count('hearts', filter=Q(hearts__user=req.user), distinct=True),
        is_viewed = Count('views', filter=Q(views__user=req.user), distinct=True),
    ).order_by('-id').all()
    page = get_page_data(page_qs, cursor, new_posts=new_posts)
    return JsonResponse({
        'success': True,
        'html_post': render_to_string(template_name='post_app/posts.html', context={'post_content': page, 'url_name': url_name}, request=req),
        'has_next': page.get('has_next'), 'new_cursor': page.get('cursor')
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
async def create_post(req: HttpRequest):
    title = req.POST.get('title')
    my_profile = req.GET.get('my_profile') == 'true'
    if not title:
        return JsonResponse({'success': False, 'error': 'no_title'})
    subject = req.POST.get('subject')
    content = req.POST.get('content')
    links = req.POST.get('links')
    tags = get_data_from_json(req.POST.get('tags'))
    post = await sync_to_async(Post.objects.create)(title=title, subject=subject, content=content, links=links, author=req.user)
    await sync_to_async(post.tags.set)(tags or [])
    positions = get_data_from_json(req.POST.get('positions', '[]'))
    images = req.FILES.getlist('images')
    if len(images) == len(positions):
        for img, pos in zip(images, positions):
            await sync_to_async(PostImage.objects.create)(image=img, row=pos.get('row'), column=pos.get('col'), post=post)
    html = None if not my_profile else await sync_to_async(render_to_string)(template_name='post_app/posts.html', request=req, context={'post_content': {'objects': [post]}})          
    return JsonResponse(
        {
            'success': True, 
            'html': html
        })

@login_required(login_url='registration')
@require_http_methods(["POST"])
def hide_post(req: HttpRequest, post_id: int):
    post = Post.objects.filter(pk=post_id).first()
    if not post:
        return JsonResponse({'success': False, 'error': 'invalid_payload'})
    HiddenPost.objects.get_or_create(user=req.user, post=post)
    return JsonResponse({'success': True})


@login_required(login_url='registration')
@require_http_methods(["POST"])
def toggle_reaction(req: HttpRequest, post_id: int):
    post = Post.objects.filter(pk=post_id).first()
    if not post:
        return JsonResponse({'success': False, 'error': 'invalid_payload'})
    data = get_data_from_json(req.body)
    reaction_type = data.get('reaction_type')
    if reaction_type not in ['like', 'heart']:
        return JsonResponse({'success': False, 'error': 'invalid_reaction_type'})
    if reaction_type == 'like':
        model = PostLike
    else:
        model = PostHeart
    reaction, created = model.objects.get_or_create(user=req.user, post=post)
    if not created:
        reaction.delete()
    count = model.objects.filter(post=post).count()
    return JsonResponse({'success': True, 'added': created, 'count': count})

@login_required(login_url='registration')
@require_http_methods(["POST"])
def add_post_view(req: HttpRequest, post_id: int):
    post = Post.objects.filter(pk=post_id).first()
    if not post:
        return JsonResponse({'success': False, 'error': 'invalid_payload'})
    if post.author == req.user:
        return JsonResponse({'success': False, 'error': 'can`t_view_own_post'})
    PostView.objects.get_or_create(user=req.user, post=post)
    return JsonResponse({'success': True})

@login_required(login_url='registration')
@require_http_methods(["POST"])
def delete_post(req: HttpRequest, post_id: int):
    post = Post.objects.filter(pk=post_id).first()
    if not post or post.author != req.user:
        return JsonResponse({'success': False, 'error': 'invalid_payload'})
    for image in post.images.all():
        image.image.delete()
    post.delete()
    return JsonResponse({'success': True})
