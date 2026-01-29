from django.db import models
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone
from datetime import timedelta
from django.core.paginator import Paginator

# Create your models here.

class EmailVerification(models.Model):
    user = models.OneToOneField(to=User, on_delete=models.CASCADE, related_name='email_verification')
    code_hash = models.CharField(max_length=128, null=True)
    expires_at = models.DateTimeField(null=True)
    new_email = models.EmailField(null=True, blank=True)
    is_verified = models.BooleanField(default=False)

    def set_code(self, code, ttl_minutes=15):
        self.code_hash = make_password(code)
        self.expires_at = timezone.now() + timedelta(minutes=ttl_minutes)
        self.is_verified = False
        self.save()

    def is_expired(self):
        return timezone.now() >= self.expires_at
    
    def check_code(self, user_code):
        if self.code_hash and not self.is_expired():
            return check_password(user_code, self.code_hash)
        return False
    
class Profile(models.Model):
    photo = models.ImageField(upload_to='profiles', null=True)
    birth_date = models.DateField(null=True)
    signature = models.ImageField(upload_to='profiles/signature', null=True)
    is_text_signature= models.BooleanField(default=False)
    is_image_signature= models.BooleanField(default=False)
    user = models.OneToOneField(to=User, on_delete=models.CASCADE,  related_name='profile', null=True)

    def __str__(self):
        return f'Profile - {self.user.username}'
    
    def formatted_birth_date(self):
        return self.birth_date.strftime('%Y-%m-%d') if self.birth_date else ''
    
    def get_tags(self):
        posts = Paginator(self.user.posts.all(), per_page=5)
        tags = []
        for post in list(posts.get_page(number=1)):
            if len(tags) >= 10:
                break
            for tag in post.tags.all():
                if len(tags) < 10 and tag not in tags:
                    tags.append(tag)
        return tags
                