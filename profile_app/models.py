from django.db import models
from django.core.paginator import Paginator
from django.contrib.auth.models import User
from django.utils import timezone

# Create your models here.

class Profile(models.Model):
    photo = models.ImageField(upload_to='profiles', null=True, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    signature = models.ImageField(upload_to='profiles/signature', null=True, blank=True)
    is_text_signature= models.BooleanField(default=False)
    is_image_signature= models.BooleanField(default=False)
    user = models.OneToOneField(to=User, on_delete=models.CASCADE,  related_name='profile', null=True)
    friends = models.ManyToManyField(to='self', symmetrical=True, null=True, blank=True)

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
    
class FriendRequest(models.Model):
    from_profile = models.ForeignKey(to=Profile, on_delete=models.CASCADE, related_name='sent_requests')
    to_profile = models.ForeignKey(to=Profile, on_delete=models.CASCADE, related_name='received_requests')
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['from_profile', 'to_profile'],
                name='unique_friend_request'
            )
        ]

    def __str__(self):
        return f'{self.from_profile} -> {self.to_profile}'
                