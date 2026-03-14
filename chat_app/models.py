from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

# Create your models here.

class Chat(models.Model):
    users = models.ManyToManyField(User, related_name='chats')
    name = models.CharField(max_length=30, null=True, blank=True)
    is_group = models.BooleanField(default=False)
    admin = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    avatar = models.ImageField(upload_to='chats/groups/', null=True, blank=True)

    def __str__(self):
        users_names = ', '.join([ user.username for user in self.users.all()])
        return f'Group, name - {self.name}'  if self.is_group else f'Chat, {users_names}'
    
class Message(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='messages', null=True, blank=True)
    text = models.TextField()
    created_at = models.DateTimeField(default=timezone.now())

    def __str__(self):
        return f'Message from user {self.sender.username}, to chat {self.chat.id} - "{self.text[:15]}"'
    
class MessageImage(models.Model):
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='chats/messages/', width_field='width', height_field='height')
    width = models.ImageField()
    height = models.ImageField()

    def __str__(self):
        return f'Image {self.id} from {self.message}' 