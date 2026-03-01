from django.shortcuts import render
from django.http import HttpRequest, JsonResponse
from django.db.models import Q, Count
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.template.loader import render_to_string
from post_app.utils import generate_username, get_page_data
from post_app.models import Post
from ..models import Profile
from ..utils import get_featured_album, checkFriendship

# Create your views here.

@login_required(login_url='registration')
def render_profile(req: HttpRequest, profile_id: int):
    profile = Profile.objects.filter(pk=profile_id).first()
    if not profile:
        return JsonResponse({'success': False, 'error': 'invalid_id'})
    page_qs = Post.objects.filter(author=profile.user).annotate(
        likes_count = Count('likes', distinct=True),
        hearts_count = Count('hearts', distinct=True),
        my_like = Count('likes', filter=Q(likes__user=req.user)),
        my_heart = Count('hearts', filter=Q(hearts__user=req.user)),
    ).order_by('-created_at').all()
    page = get_page_data(page_qs, 1)
    featured_album, featured_photo = get_featured_album(profile)
    return render(
        request=req,
        template_name='profile_app/profile.html',
        context={
            'profile_user': profile.user, 'post_content': page, 
            'featured_album': featured_album, 'featured_photo': featured_photo,
            'friendship_state': checkFriendship(profile, req.user.profile), 'profile_id': profile.id}
    )