from django.db import models
from django.contrib.auth.models import User
from imagekit.models import ImageSpecField
from imagekit.processors import ResizeToFit
from django.utils import timezone
from PIL import Image
import os, uuid

# Create your models here.

class Tag(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return f'Tag - #{self.name}'

class Post(models.Model):
    title = models.CharField(max_length=255)
    subject = models.CharField(max_length=255, null=True)
    content = models.TextField()
    links = models.TextField(null=True)
    tags = models.ManyToManyField(to=Tag, related_name='posts')
    author = models.ForeignKey(to=User, on_delete=models.CASCADE, related_name='posts')
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f'Post - "{self.title}", author - {self.author.username}'
    
    def get_images(self):
        images = []
        current_row = None
        for img in self.images.order_by('row', 'column'):
            if img.row != current_row:
                images.append([])
                current_row = img.row
            images[-1].append(img)
        return images
    
    def get_links(self):
        return self.links.split('; ') if self.links else []  
    
    class Meta:
        ordering = ['-created_at']
  
def upload_image(instance, filename):
    ext = filename.split('.')[-1]
    new_filename = f'{uuid.uuid4()}.{ext}'
    return os.path.join('posts/images/', new_filename)

class PostImage(models.Model):
    image = models.ImageField(upload_to=upload_image)
    image_webp = ImageSpecField(source='image', format='WEBP', processors=[ResizeToFit(width=400, height=400)], options={'quality': 75})
    row = models.IntegerField()
    width = models.IntegerField(null=True, blank=True)
    height = models.IntegerField(null=True, blank=True)
    column = models.IntegerField()
    post = models.ForeignKey(to=Post, on_delete=models.CASCADE, related_name='images')

    def __str__(self):
        return f'Image from post "{self.post.title}", row - {self.row}, column - {self.column}'

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.image and not self.width:
            img = Image.open(self.image.path)
            self.width, self.height = img.size
            img.close()
            super().save()
    
class HiddenPost(models.Model):
    user = models.ForeignKey(to=User, on_delete=models.CASCADE, related_name='hidden_posts')
    post = models.ForeignKey(to=Post, on_delete=models.CASCADE, related_name='hidden_by')

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'post'],
                name='unique_hidden_post'
            )
        ]

class PostLike(models.Model):
    user = models.ForeignKey(to=User, on_delete=models.CASCADE, related_name='liked_posts')
    post = models.ForeignKey(to=Post, on_delete=models.CASCADE, related_name='likes')

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'post'],
                name='unique_post_like'
            )
        ]

class PostHeart(models.Model):
    user = models.ForeignKey(to=User, on_delete=models.CASCADE, related_name='hearted_posts')
    post = models.ForeignKey(to=Post, on_delete=models.CASCADE, related_name='hearts')

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'post'],
                name='unique_post_hearts'
            )
        ]