from django.shortcuts import render
from django.http import HttpRequest, JsonResponse
from django.db.models import Q, Count
from django.contrib.auth.decorators import login_required
from post_app.utils import get_page_data, get_optimized_posts
from post_app.models import Post
from SocialNetwork.redis import redis_client
from ..models import Profile
from ..utils import get_featured_album, checkFriendship

# Create your views here.

@login_required(login_url='registration')
def render_profile(req: HttpRequest, profile_id: int):
    profile = Profile.objects.filter(pk=profile_id).first()
    if not profile:
        return JsonResponse({'success': False, 'error': 'invalid_id'})
    page_qs = get_optimized_posts(Post.objects.filter(author=profile.user), req) 
    page = get_page_data(page_qs, None)
    featured_album, featured_photo = get_featured_album(profile)
    return render(
        request=req,
        template_name='profile_app/profile.html',
        context={
            'profile_user': profile.user, 'post_content': page, 
            'featured_album': featured_album, 'featured_photo': featured_photo,
            'friendship_state': checkFriendship(profile, req.user.profile), 'profile_id': profile.id}
    )

@login_required(login_url='registration')
async def get_online_users(req: HttpRequest):
    online_users = await redis_client.smembers('online_users')
    return JsonResponse({'online_users': list(online_users)})