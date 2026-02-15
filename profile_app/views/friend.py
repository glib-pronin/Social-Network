from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse, HttpRequest
from django.db import IntegrityError
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from profile_app.models import Profile, FriendRequest
from ..utils import make_recommendation_list

@login_required(login_url='registration')
@require_http_methods(["GET"])
def render_friends(req: HttpRequest):
    recommendation_list = make_recommendation_list(req.user, limit=6)
    my_profile = req.user.profile
    return render(request=req, template_name='profile_app/friends.html', context={
        'recommendation_list': recommendation_list, 'has_more_requests': my_profile.received_requests.count() > 6,
        'has_more_recommendation': len(recommendation_list) > 6, 'has_more_friends': my_profile.friends.count() > 6,
        })

@login_required(login_url='registration')
@require_http_methods(["GET"])
def render_friends_all(req: HttpRequest):
    return render(request=req, template_name='profile_app/friends_all.html')

@login_required(login_url='registration')
@require_http_methods(["GET"])
def render_friends_requests(req: HttpRequest):
    return render(request=req, template_name='profile_app/requests_all.html')

@login_required(login_url='registration')
@require_http_methods(["GET"])
def render_friends_recommendation(req: HttpRequest):
    return render(request=req, template_name='profile_app/recommendation_all.html', context={'recommendation_list': make_recommendation_list(req.user)})

@login_required(login_url='registration')
@require_http_methods(["POST"])
def add_friend(req: HttpRequest, id: int):
    to_profile = get_object_or_404(Profile, pk=id)
    from_profile = req.user.profile

    if to_profile == from_profile:
        return JsonResponse({'success': False, 'error': 'wrong_payload'})
    
    if to_profile in from_profile.friends.all():
        return JsonResponse({'success': False, 'error': 'wrong_payload'})
    
    reverse_request = FriendRequest.objects.filter(from_profile=to_profile, to_profile=from_profile).first()
    if reverse_request:
        from_profile.friends.add(to_profile)
        reverse_request.delete()
        return JsonResponse({'success': True, 'msg': 'created_friend'})
    
    try:
        FriendRequest.objects.create(from_profile=from_profile, to_profile=to_profile)
    except IntegrityError:
        return JsonResponse({'success': False, 'error': 'wrong_payload'})
    return JsonResponse({'success': True, 'msg': 'created_friend_request'})


@login_required(login_url='registration')
@require_http_methods(["POST"])
def cancel_friends_request(req: HttpRequest, id: int):
    from_profile = get_object_or_404(Profile, pk=id)
    to_profile = req.user.profile
    request = FriendRequest.objects.filter(to_profile=to_profile, from_profile=from_profile).first()
    if not request:
        return JsonResponse({'success': False, 'error': 'wrong_payload'})
    request.delete()
    return JsonResponse({'success': True, 'request_count': to_profile.get_request_count()})

@login_required(login_url='registration')
@require_http_methods(["POST"])
def accept_friends_request(req: HttpRequest, id: int):
    loaded_rec = req.GET.get('loaded')
    try:
        loaded_count = int(loaded_rec) + 1
    except (TypeError, ValueError):
        return JsonResponse({'success': False, 'error': 'wrong_payload'})
    from_profile = get_object_or_404(Profile, pk=id)
    to_profile = req.user.profile
    request = FriendRequest.objects.filter(to_profile=to_profile, from_profile=from_profile).first()
    if not request:
        return JsonResponse({'success': False, 'error': 'wrong_payload'})
    from_profile.friends.add(to_profile)
    request.delete()
    has_more_rec = 'True' if len(make_recommendation_list(req.user, limit=loaded_count)) >= loaded_count else 'False'
    return JsonResponse({'success': True, 'has_more_rec': has_more_rec, 'request_count': to_profile.get_request_count()})

@login_required(login_url='registration')
@require_http_methods(["POST"])
def remove_friend(req: HttpRequest, id: int):
    loaded_rec = req.GET.get('loaded')
    try:
        loaded_count = int(loaded_rec) + 1
    except (TypeError, ValueError):
        return JsonResponse({'success': False, 'error': 'wrong_payload'})
    friend = get_object_or_404(Profile, pk=id)
    my_profile = req.user.profile
    if friend not in my_profile.friends.all():
        return JsonResponse({'success': False, 'error': 'wrong_payload'})
    my_profile.friends.remove(friend)
    has_more_rec = 'True' if len(make_recommendation_list(req.user, limit=loaded_count)) >= loaded_count else 'False'
    return JsonResponse({'success': True, 'has_more_rec': has_more_rec})
