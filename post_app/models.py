from django.db import models
from django.contrib.auth.models import User
from imagekit.models import ImageSpecField
from imagekit.processors import ResizeToFit

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
  

class PostImage(models.Model):
    image = models.ImageField(upload_to='posts/images/')
    image_webp = ImageSpecField(source='image', format='WEBP', processors=[ResizeToFit(width=400, height=400)], options={'quality': 75})
    row = models.IntegerField()
    column = models.IntegerField()
    post = models.ForeignKey(to=Post, on_delete=models.CASCADE, related_name='images')

    def __str__(self):
        return f'Image from post "{self.post.title}", row - {self.row}, column - {self.column}'
    
