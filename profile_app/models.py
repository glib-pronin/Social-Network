from django.db import models
from django.core.paginator import Paginator
from django.contrib.auth.models import User
from django.utils import timezone
from imagekit.models import ImageSpecField
from imagekit.processors import ResizeToFill, ResizeToFit

# Create your models here.

class Profile(models.Model):
    photo = models.ImageField(upload_to='profiles', null=True, blank=True)
    photo_webp = ImageSpecField(processors=[ResizeToFill(width=100, height=100)], source='photo', format='WEBP', options={'quality': 75})
    birth_date = models.DateField(null=True, blank=True)
    pseudonym = models.CharField(max_length=255, null=True, blank=True)
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
    
    def get_request_count(self):
        received_requests = self.received_requests.count()
        if received_requests == 0:
            return ''
        return received_requests if self.received_requests.count() <= 9 else '9+'
    
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
                
class Album(models.Model):
    name = models.CharField(max_length=50)
    theme = models.CharField(max_length=50, null=True, blank=True)
    year = models.IntegerField(null=True, blank=True)
    profile = models.ForeignKey(to=Profile, on_delete=models.CASCADE, related_name='albums')
    is_shown = models.BooleanField(default=True)
    is_special = models.BooleanField(default=False)

    def __str__(self):
        return f'User - {self.profile.user.username}, album - {self.name}, {self.year} year'
    
class AlbumImage(models.Model):
    image = models.ImageField(upload_to='albums')
    image_webp = ImageSpecField(processors=[ResizeToFit(width=400, height=400)], source='image', format='WEBP', options={'quality': 75})
    album = models.ForeignKey(to=Album, on_delete=models.CASCADE, related_name='images')
    is_shown = models.BooleanField(default=True)

    def __str__(self):
        return f'Image - {self.id}, album - {self.album.name}, {self.album.year} year'