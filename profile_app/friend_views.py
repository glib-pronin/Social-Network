from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse, HttpRequest
from django.db import IntegrityError
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from profile_app.models import Profile, FriendRequest

@login_required(login_url='registration')
@require_http_methods(["GET"])
def render_friends(req: HttpRequest):
    recommendation_list = []
    my_profile = req.user.profile
    excluding_ids = set()

    excluding_ids.add(my_profile.id)
    excluding_ids.update(my_profile.friends.values_list('id', flat=True))
    excluding_ids.update(my_profile.sent_requests.values_list('to_profile_id', flat=True))
    excluding_ids.update(my_profile.received_requests.values_list('from_profile_id', flat=True))
    for friend in my_profile.friends.all():
        for profile in friend.friends.exclude(pk__in=excluding_ids).all():
            recommendation_list.append(profile)
            excluding_ids.add(profile.id)
            if len(recommendation_list) > 5:
                break
        if len(recommendation_list) > 5:
            break
    return render(request=req, template_name='profile_app/friends.html', context={'recommendation_list': recommendation_list})

@login_required(login_url='registration')
@require_http_methods(["GET"])
def add_friend(req: HttpRequest, id: int):
    to_profile = get_object_or_404(Profile, pk=id)
    from_profile = req.user.profile

    if to_profile == from_profile:
        return redirect('friends')
    
    if to_profile in from_profile.friends.all():
        return redirect('friends')
    
    reverse_request = FriendRequest.objects.filter(from_profile=to_profile, to_profile=from_profile).first()
    if reverse_request:
        from_profile.friends.add(to_profile)
        reverse_request.delete()
        return redirect('friends')
    
    try:
        FriendRequest.objects.create(from_profile=from_profile, to_profile=to_profile)
    except IntegrityError:
        return redirect('friends')
    return redirect('friends')


@login_required(login_url='registration')
@require_http_methods(["GET"])
def cancel_friends_request(req: HttpRequest, id: int):
    from_profile = get_object_or_404(Profile, pk=id)
    to_profile = req.user.profile
    request = FriendRequest.objects.filter(to_profile=to_profile, from_profile=from_profile).first()
    if request:
        request.delete()
    return redirect('friends')

@login_required(login_url='registration')
@require_http_methods(["GET"])
def accept_friends_request(req: HttpRequest, id: int):
    from_profile = get_object_or_404(Profile, pk=id)
    to_profile = req.user.profile
    request = FriendRequest.objects.filter(to_profile=to_profile, from_profile=from_profile).first()
    if request:
        from_profile.friends.add(to_profile)
        request.delete()
    return redirect('friends')

@login_required(login_url='registration')
@require_http_methods(["GET"])
def remove_friend(req: HttpRequest, id: int):
    friend = get_object_or_404(Profile, pk=id)
    my_profile = req.user.profile
    if friend in my_profile.friends.all():
        my_profile.friends.remove(friend)
    return redirect('friends')
