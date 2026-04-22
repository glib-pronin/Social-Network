from django.shortcuts import render, redirect
from django.template.loader import render_to_string
from django.http import HttpRequest, JsonResponse
from django.db.models import Prefetch, Max, F, Exists, OuterRef
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.templatetags.static import static
from cloudinary.utils import cloudinary_url
from post_app.utils import get_page_data
from .models import *
from .utils import *
import cloudinary


# Create your views here.

@login_required(login_url='registration')
@require_http_methods(["GET"])
def render_chat_lobby(req: HttpRequest):
    friends = req.user.profile.friends.select_related('user', 'photo').all()
    chats = req.user.chats.annotate(
        last_message_time = Max('messages__created_at'),
        has_unread = Exists(Message.objects.filter(
                chat=OuterRef('pk')
            ).exclude(sender=req.user).exclude(readers=req.user)
        )
    ).order_by(F('last_message_time').desc(nulls_last=True)).prefetch_related(Prefetch(
        'users',
        queryset=User.objects.exclude(pk=req.user.id).select_related('profile__photo'),
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
    chat_data = {'id': group.id, 'chatName': group.name, 'shortName': group.get_initial(), 'isGroup': group.is_group}
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
        if not user or user.profile not in req.user.profile.friends.all():
            return JsonResponse({'succes': False, 'error': 'not_found_user'})
        chat = Chat.objects.filter(users=user, is_group=False).filter(users=req.user).prefetch_related('users').first()
        if not chat:
            chat = Chat.objects.create(is_group=False)
            chat.users.add(user, req.user)
            is_created_chat = True
    if chat:
        chat_avatar = None
        user_id = None
        if chat.is_group:
            chat_avatar = chat.avatar.url if chat.avatar else None
        else:
            user = chat.users.exclude(pk=req.user.id).first()
            user_id = user.id
            chat_avatar = user.profile.photo.image.url if user.profile.photo else req.build_absolute_uri(static('profile_app/img/default_photo.png'))
        queryset = chat.messages.select_related('sender', 'sender__profile', 'sender__profile__photo').prefetch_related(
            Prefetch(
                'images',
                queryset=MessageImage.objects.all().order_by('order'),
                to_attr='images_sorted'
            )
        ).order_by('-created_at')
        data = get_page_data(queryset, count=10)
        return JsonResponse({ 
            'success': True, 'hasNext': data.get('has_next'), 'cursor': data.get('cursor'),
            'html': render_to_string(template_name='chat_app/messages.html', request=req, context=data),
            'chatName': chat.name if chat.name else user.profile.get_full_name(), 
            'chatMembersIds': list(chat.users.values_list('id', flat=True)), 'isGroup': chat.is_group,
            'chatAvatar': chat_avatar, 'shortName': chat.get_initial(),
            'isCreatedChat': is_created_chat, 
            'id': chat.id, 'isAdmin': chat.admin == req.user, 'userId': user_id
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
    queryset = chat.messages.select_related('sender', 'sender__profile', 'sender__profile__photo', ).prefetch_related(
        Prefetch(
            'images',
            queryset=MessageImage.objects.all().order_by('order'),
            to_attr='images_sorted'
        )
    ).order_by('-created_at')
    data = get_page_data(queryset, cursor=cursor)
    return JsonResponse({ 
        'success': True, 'hasNext': data.get('has_next'), 'cursor': data.get('cursor'),
        'html': render_to_string(template_name='chat_app/messages.html', request=req, context=data)
    })

@login_required(login_url='registration')
@require_http_methods(["GET"])
def get_group_data(req: HttpRequest, chat_id: int):
    chat = Chat.objects.filter(pk=chat_id, is_group=True).first()
    if not chat:
        return JsonResponse({'success': False, 'error': 'invalid_id'})
    users = chat.users.select_related('profile', 'profile__photo').exclude(pk=req.user.id)
    users_data = []
    for us in users:
        if us.profile.photo:
            photo_url=us.profile.photo.image.url
        else:
            photo_url = req.build_absolute_uri(static('profile_app/img/default_photo.png'))
        users_data.append({
            'id': us.id,
            'name': us.profile.get_full_name(),
            'avatar': photo_url
        })
    return JsonResponse({
        'success': True, 'name': chat.name,
        'avatar': chat.avatar.url if chat.avatar else None,
        'users': users_data
    })

@login_required(login_url='registration')
@require_http_methods(["POST"])
def edit_group(req: HttpRequest, chat_id: int):
    chat = Chat.objects.filter(pk=chat_id, is_group=True).first()
    if not chat:
        return JsonResponse({'success': False, 'error': 'invalid_id'})
    if req.user != chat.admin:
        return JsonResponse({'success': False, 'error': 'forbidden'})
    
    name = req.POST.get('name', '')
    user_ids = req.POST.getlist('users')
    remove_avatar = req.POST.get('remove_avatar', '') == '1'
    avatar = req.FILES.get('avatar')

    if len(name) < 3:
        return JsonResponse({'success': False, 'error': 'invalid_name'})
    if not user_ids:
        return JsonResponse({'success': False, 'error': 'invalid_payload'})
    friend_ids = req.user.profile.friends.values_list('user_id', flat=True)
    valid_users = User.objects.filter(id__in=user_ids).filter(id__in=friend_ids)
    if not valid_users.exists():
        return JsonResponse({'success': False, 'error': 'invalid_payload'})
    
    chat.name = name
    chat.users.set([req.user, *valid_users])
    if remove_avatar and chat.avatar:
        chat.avatar.delete(save=False)
    elif avatar:
        if chat.avatar:
            chat.avatar.delete(save=False)
        chat.avatar = avatar
    chat.save()
    chat_data = {
        'id': chat.id, 'chatName': chat.name, 
        'shortName': chat.get_initial(), 'isAdmin': True,
        'isGroup': True, 'chatMembersIds': list(chat.users.values_list('id', flat=True))
    }
    if chat.avatar:
        chat_data['chatAvatar'], _ = cloudinary_url(source=chat.avatar.name, fetch_format='auto', quality='auto')
    else:
        chat_data['chatAvatar'] = ''
    return JsonResponse({'success': True, 'chatData': chat_data})

@login_required(login_url='registration')
@require_http_methods(["POST"])
def leave_group(req: HttpRequest, chat_id: int):
    chat = Chat.objects.filter(pk=chat_id, is_group=True).first()
    if not chat:
        return JsonResponse({'success': False, 'error': 'invalid_id'})
    if not chat.users.filter(pk=req.user.id).exists():
        return JsonResponse({'success': False, 'error': 'forbidden'})
    if chat.admin == req.user:
        return JsonResponse({'success': False, 'error': 'admin_cannot_leave'})
    chat.users.remove(req.user)
    if chat.users.count() == 0:
        chat.delete()
    return JsonResponse({'success': True})

@login_required(login_url='registration')
@require_http_methods(["POST"])
def delete_group(req: HttpRequest, chat_id: int):
    chat = Chat.objects.filter(pk=chat_id, is_group=True).first()
    if not chat:
        return JsonResponse({'success': False, 'error': 'invalid_id'})
    if chat.admin != req.user:
        return JsonResponse({'success': False, 'error': 'forbidden'})
    if chat.avatar:
        chat.avatar.delete(save=False)
    try:
        folder_prefix = f'media/chats/{chat.id}/'
        cloudinary.api.delete_resources_by_prefix(folder_prefix)
        cloudinary.api.delete_folder(folder_prefix)
    except cloudinary.exceptions.NotFound:
        pass
    chat.delete()
    return JsonResponse({'success': True})

@login_required(login_url='registration')
@require_http_methods(["POST"])
def upload_image(req: HttpRequest, chat_id: int): 
    chat = Chat.objects.filter(pk=chat_id).first()
    if not chat:
        return JsonResponse({'success': False, 'error': 'invalid_id'})
    file = req.FILES.get('image')
    if not file: 
        return JsonResponse({'success': False, 'error': 'missing_file'})
    res = cloudinary.uploader.upload(file, folder=f'media/chats/{chat_id}')
    return JsonResponse({
        'success': True,
        'url': res['secure_url'], 'publicId': res['public_id'],
        'width': res['width'], 'height': res['height']
    })

@login_required(login_url='registration')
@require_http_methods(["POST"])
def read_chat_messages(req: HttpRequest, chat_id: int):
    chat = Chat.objects.filter(pk=chat_id, users=req.user).first()
    if not chat:
        return JsonResponse({'success': False, 'error': 'chat_not_exist'})
    unread_msgs = chat.messages.exclude(sender=req.user).exclude(readers=req.user)
    for msg in unread_msgs:
        msg.readers.add(req.user)
    stats = req.user.profile.get_total_unread_stats()
    return JsonResponse({
        'success': True, 'totalUnread': stats['total_unread_count'],
        'chatUnread': stats['chat_unread_count'], 'groupUnread': stats['group_unread_count']
    })