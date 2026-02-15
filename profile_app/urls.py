from django.urls import path
from .views import *

urlpatterns = [
    path('', view=render_profile, name='profile'),
    path('albums', view=render_albums, name='albums'),
    path('update-credentials', view=update_credentials, name='update_credentials'),
    path('update-password', view=update_passwords, name='update_password'),
    path('update-signature', view=update_signature, name='update_signature'),
    path('update-personal-data', view=update_personal_data, name='update_personal_data'),
    path('username-available', view=check_username, name='username_available'),
    path('email-verification/start', view=start_email_verification, name='start'),
    path('email-verification/verify', view=verify_email_code, name='verify'),
    path('email-verification/cancel', view=cancel_email_verification, name='cancel'),
    path('friends/all', view=render_friends, name='friends'),
    path('friends', view=render_friends_all, name='friends_all'),
    path('friends/requests', view=render_friends_requests, name='friends_requests'),
    path('friends/recommendation', view=render_friends_recommendation, name='friends_recommendation'),
    path('friends/accept-friend-request/<int:id>', view=accept_friends_request, name='friends-accept'),
    path('friends/cancel-friend-request/<int:id>', view=cancel_friends_request, name='friends-cancel'),
    path('friends/add-friend/<int:id>', view=add_friend, name='friends-add'),
    path('friends/remove-friend/<int:id>', view=remove_friend, name='friends-remove'),
]