from django.shortcuts import render
from django.template.loader import render_to_string
from django.http import JsonResponse, HttpRequest
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from ..models import Album, AlbumImage
from ..utils import is_valid_album_data
from user_app.utils import get_data_from_json
import os

@login_required(login_url='registration')
@require_http_methods(["GET"])
def render_albums(req: HttpRequest):
    return render(request=req, template_name='profile_app/albums.html')

@login_required(login_url='registration')
@require_http_methods(["POST"])
def add_photo(req: HttpRequest):
    album_id = req.POST.get('album_id')
    photo_file = req.FILES.get('photo')
    if not album_id or not photo_file:
        return JsonResponse({'success': False, 'error': 'invalid_payload'})
    album = Album.objects.filter(pk=album_id, profile=req.user.profile).first()
    if not album:
        return JsonResponse({'success': False, 'error': 'invalid_payload'})
    photo = AlbumImage.objects.create(album=album, image=photo_file, is_shown=not album.is_default)
    return JsonResponse({'success': True, 'photoUrl': photo.image_webp.url, 'photoId': photo.id, 'isShown': photo.is_shown})

@login_required(login_url='registration')
@require_http_methods(["POST"])
def delete_photo(req: HttpRequest, photo_id: int):
    photo = AlbumImage.objects.filter(pk=photo_id).first()
    if not photo:
        return JsonResponse({'success': False, 'error': 'invalid_payload'})
    if not photo.album or photo.album.profile != req.user.profile:
        return JsonResponse({'success': False, 'error': 'invalid_payload'})
    photo.image.delete(save=False)
    photo.delete()
    return JsonResponse({'success': True})

@login_required(login_url='registration')
@require_http_methods(["POST"])
def create_album(req: HttpRequest):
    data = get_data_from_json(req.body)
    name = data.get('name', '').strip()
    theme = data.get('theme', '').strip()
    year = data.get('year')
    if not is_valid_album_data(name, theme, year):
        return JsonResponse({'success': False, 'errors': 'invalid_payload'})
    album = Album.objects.create(name=name, theme=theme, year=year, profile=req.user.profile)
    return JsonResponse({'success': True, 'html': render_to_string(template_name='profile_app/album_pattern.html', context={'album': album})})

@login_required(login_url='registration')
@require_http_methods(["POST"])
def toggle_album(req: HttpRequest, album_id: int):
    album = Album.objects.filter(pk=album_id, profile=req.user.profile, is_default=False).first()
    if not album:
        return JsonResponse({'success': False, 'errors': 'invalid_payload'})
    album.is_shown = not album.is_shown
    album.save()
    return JsonResponse({'success': True})

@login_required(login_url='registration')
@require_http_methods(["POST"])
def toggle_photo(req: HttpRequest, photo_id: int):
    photo = AlbumImage.objects.filter(pk=photo_id).first()
    if not photo:
        return JsonResponse({'success': False, 'errors': 'invalid_payload'})
    if photo.album.is_default or photo.album.profile != req.user.profile:
        return JsonResponse({'success': False, 'errors': 'invalid_payload'})
    photo.is_shown = not photo.is_shown
    photo.save()
    return JsonResponse({'success': True})