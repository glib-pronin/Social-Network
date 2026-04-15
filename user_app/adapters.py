from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from allauth.account.adapter import DefaultAccountAdapter
from allauth.exceptions import ImmediateHttpResponse
from django.http import HttpResponseRedirect
from django.contrib.auth.models import User

class MySocialAccountAdapter(DefaultSocialAccountAdapter):

    def pre_social_login(self, request, sociallogin):
        if sociallogin.is_existing:
            return
        print(sociallogin.account.extra_data)
        email = sociallogin.account.extra_data.get('email')
        if not email:
            raise ImmediateHttpResponse(
                HttpResponseRedirect('/registration?error=google_account_not_linked')
            )
        
        user = User.objects.filter(email=email, is_active=True).first()
        if not user:
            raise ImmediateHttpResponse(
                HttpResponseRedirect(f'/registration?error=google_account_not_linked')
            )
        sociallogin.connect(request, user)

class MyAccountAdapter(DefaultAccountAdapter):
    
    def is_open_for_signup(self, request):
        return False