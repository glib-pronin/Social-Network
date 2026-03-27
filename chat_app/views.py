from django.shortcuts import render, redirect
from django.template.loader import render_to_string
from django.http import HttpRequest, JsonResponse
from django.db.models import Prefetch, Max, F
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.templatetags.static import static
from cloudinary.utils import cloudinary_url
from .models import *
from .utils import *
from post_app.utils import get_page_data


# Create your views here.

def render_chat(req: HttpRequest, chat_id: int):
    chat = Chat.objects.filter(pk=chat_id).first()
    if not chat:
        return redirect('select_chat')
    return render(request=req, template_name='chat_app/chat.html', context={'chat': chat})

@login_required(login_url='registration')
@require_http_methods(["GET"])
def render_chat_lobby(req: HttpRequest):
    friends = req.user.profile.friends.select_related('user', 'photo').all()
    chats = req.user.chats.annotate(
        last_message_time = Max('messages__created_at')
    ).order_by(F('last_message_time').desc(nulls_last=True)).prefetch_related(Prefetch(
        'users',
        queryset=User.objects.exclude(pk=req.user.id).prefetch_related('profile__photo'),
        to_attr='chat_users'
    )).prefetch_related(Prefetch(
        'messages',
        queryset=Message.objects.order_by('-created_at'),
        to_attr='all_messages'
    ))
    return render(request=req, template_name='chat_app/chat_lobby.html', context={'friends': friends, 'chats': chats})

@login_required(login_url='registration')
@require_http_methods(["GET"])
def get_friends_list(req: HttpRequest):
    friends = req.user.profile.friends.select_related('user', 'photo').all().order_by('user__first_name', 'user__last_name')
    latin, cyrillic = group_friends_by_letter(friends, req)
    return JsonResponse({'success': True, 'latin': latin, 'cyrillic': cyrillic})

@login_required(login_url='registration')
@require_http_methods(["POST"])
def create_group(req: HttpRequest):
    user = req.user
    name = req.POST.get('name', '')
    user_ids = req.POST.getlist('users')
    avatar = req.FILES.get('avatar')

    if len(name) < 3:
        return JsonResponse({'success': False, 'error': 'invalid payload'})
    if not user_ids:
        return JsonResponse({'success': False, 'error': 'invalid payload'})
    friend_ids = user.profile.friends.values_list('user_id', flat=True)
    valid_users = User.objects.filter(id__in=user_ids).filter(id__in=friend_ids)
    if not valid_users.exists():
        return JsonResponse({'success': False, 'error': 'invalid payload'})

    group = Chat.objects.create(name=name, is_group=True, admin=user, avatar=avatar)
    group.users.add(user, *valid_users)
    chat_data = {'id': group.id, 'chatName': group.name, 'shortName': group.get_initial()}
    if avatar:
        chat_data['chatAvatar'], _ = cloudinary_url(source=group.avatar.name, fetch_format='auto', quality='auto')
    else:
        chat_data['chatAvatar'] = ''
    return JsonResponse({'success': True, 'chatData': chat_data})

@login_required(login_url='registration')
@require_http_methods(["GET"])
def open_chat(req: HttpRequest):
    id = req.GET.get('id')
    has_chat = req.GET.get('has_chat', '') == 'true'
    chat = None
    is_created_chat = False
    if has_chat:
        chat = Chat.objects.filter(pk=int(id)).prefetch_related('users').first()
    else:
        user = User.objects.filter(pk=int(id)).select_related('profile__photo').first()
        if not user:
            return JsonResponse({'succes': False, 'error': 'not_found_user'})
        chat = Chat.objects.filter(users=user, is_group=False).filter(users=req.user).prefetch_related('users').first()
        if not chat:
            chat = Chat.objects.create(is_group=False)
            chat.users.add(user, req.user)
            is_created_chat = True
    if chat:
        chat_avatar = None
        if chat.is_group:
            chat_avatar = chat.avatar.url if chat.avatar else None
        else:
            user = chat.users.exclude(pk=req.user.id).first()
            chat_avatar = user.profile.photo.image.url if user.profile.photo else req.build_absolute_uri(static('profile_app/img/default_photo.png'))
        queryset = chat.messages.select_related('sender', 'sender__profile', 'sender__profile__photo', ).order_by('-created_at')
        print(queryset)
        data = get_page_data(queryset)
        return JsonResponse({ 
            'success': True, 'hasNext': data.get('has_next'), 'cursor': data.get('cursor'),
            'html': render_to_string(template_name='chat_app/messages.html', request=req, context=data),
            'chatName': chat.name if chat.name else f'{user.first_name} {user.last_name}', 
            'chatMembersCount': len(chat.users.all()), 'isGroup': chat.is_group,
            'chatAvatar': chat_avatar, 'shortName': chat.get_initial(),
            'isCreatedChat': is_created_chat, 'id': chat.id
        })
    return JsonResponse({'succes': False, 'error': 'not_found_chat'})

@login_required(login_url='registration')
@require_http_methods(["GET"])
def get_messages(req: HttpRequest, chat_id: int):
    cursor = req.GET.get('cursor')
    if not cursor:
        return JsonResponse({'success': False, 'error': 'invalid_id'})
    chat = Chat.objects.filter(pk=int(chat_id)).prefetch_related('users').first()
    if not chat:
        return JsonResponse({'success': False, 'error': 'invalid_id'})
    queryset = chat.messages.select_related('sender', 'sender__profile', 'sender__profile__photo', ).order_by('-created_at')
    data = get_page_data(queryset, cursor=cursor)
    return JsonResponse({ 
        'success': True, 'hasNext': data.get('has_next'), 'cursor': data.get('cursor'),
        'html': render_to_string(template_name='chat_app/messages.html', request=req, context=data)
    })
