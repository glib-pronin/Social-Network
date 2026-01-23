from django.contrib import admin
from .models import EmailVerification, Profile

# Register your models here.

admin.site.register([EmailVerification, Profile])