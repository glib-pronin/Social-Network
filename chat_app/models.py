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
    
    def get_initial(self):
        if self.name:
            words = self.name.split(' ')
            name = ''
            for word in words[:2]:
                name += word[0]
            return name.upper()
        return ''
    
class Message(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='messages', null=True, blank=True)
    text = models.TextField(null=True, blank=True)
    readers = models.ManyToManyField(to=User, related_name='read_msgs')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Message from user {self.sender.username}, to chat {self.chat.id} - "{self.text[:15]}"'
    
    def get_short_text(self):
        if len(self.text) <= 10:
            return self.text
        else:
            return self.text[:10] + '...'
        
    def get_date_or_time(self):
        now = timezone.localtime(timezone.now())
        created = timezone.localtime(self.created_at)
        if created.date() == now.date():
             return created.strftime("%H:%M")
        return created.strftime("%d.%m.%Y")

    def get_time(self):
        created = timezone.localtime(self.created_at)
        return created.strftime("%H:%M")

    def get_date(self):
        created = timezone.localtime(self.created_at)
        return created.strftime("%d.%m.%Y")
    
class MessageImage(models.Model):
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='images')
    image_url = models.URLField()
    public_id = models.CharField(max_length=255)
    width = models.IntegerField()
    height = models.IntegerField()
    order = models.IntegerField(default=0)

    def __str__(self):
        return f'Image {self.id} from {self.message}' 