from django.contrib import admin
from .models import Profile, FriendRequest, Album, AlbumImage

# Register your models here.

admin.site.register([Profile, FriendRequest, Album, AlbumImage])