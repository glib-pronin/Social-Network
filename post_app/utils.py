from unidecode import unidecode
from django.contrib.auth.models import User
from django.db import models
from django.db.models import Count, Q
import random

MAX_ATTEMPTS = 30

def generate_username(first_name, last_name): 
    base_variants = [
        (unidecode(f'@{first_name}{last_name}')).lower(),
        (unidecode(f'@{first_name}_{last_name}')).lower(),
        (unidecode(f'@{first_name}.{last_name}')).lower(),
    ]
    for base in base_variants:
        for _ in range(MAX_ATTEMPTS):
            username = f'{base}{random.randint(a=1000, b=9999)}'
            if is_username_available(username=username):
                return username
    return None

def is_username_available(username, user=None):
    u = User.objects.filter(username=username)
    if user:
        u = u.exclude(pk=user.id)
    return not u.exists()

def get_page_data(queryset: models.QuerySet, cursor: int | None = None, count: int = 5, new_posts: bool = False):
    if cursor:
        queryset = queryset.filter(id__lt = cursor) if not new_posts else queryset.filter(id__gt = cursor)
    posts = list(queryset[:count + 1])
    has_next = len(posts) > count
    if has_next:
        posts = posts[:-1]
    if posts:
        cursor_new = posts[-1].id if not new_posts else  posts[0].id
    else:
        cursor_new = None
    return {'objects': posts, 'has_next': has_next, 'cursor': cursor_new}        

def get_optimized_posts(qs, req): 
    return qs.select_related('author', 'author__profile', 'author__profile__photo').prefetch_related('tags', 'images').annotate(
        likes_count = Count('likes', distinct=True),
        hearts_count = Count('hearts', distinct=True),
        views_count = Count('views', distinct=True),
        my_like = Count('likes', filter=Q(likes__user=req.user), distinct=True),
        my_heart = Count('hearts', filter=Q(hearts__user=req.user), distinct=True),
        is_viewed = Count('views', filter=Q(views__user=req.user), distinct=True),
    ).order_by('-id').all()
