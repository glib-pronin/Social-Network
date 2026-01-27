from django.db import models
from django.contrib.auth.models import User

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
        for img in self.images.order_by('row').order_by('column'):
            if img.row > len(images):
                images.append([img])
            else:
                images[-1].append(img)
        return images

class PostImage(models.Model):
    image = models.ImageField(upload_to='posts/images/')
    row = models.IntegerField()
    column = models.IntegerField()
    post = models.ForeignKey(to=Post, on_delete=models.CASCADE, related_name='images')

    def __str__(self):
        return f'Image from post "{self.post.title}", row - {self.row}, column - {self.column}'
    
