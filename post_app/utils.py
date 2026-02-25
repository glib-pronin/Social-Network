from unidecode import unidecode
from django.contrib.auth.models import User
from django.db import models
from django.core.paginator import Paginator
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

def get_page_data(queryset: models.QuerySet, current_page: int, count: int = 10):
    pages = Paginator(queryset, count)
    page = pages.get_page(current_page)
    return {'page': page, 'has_next': page.has_next(), 'current_page': page.number}        