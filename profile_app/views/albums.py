from django.shortcuts import render
from django.template.loader import render_to_string
from django.http import JsonResponse, HttpRequest
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from ..models import Album, AlbumImage
from ..utils import is_valid_album_data, delete_webp
from user_app.utils import get_data_from_json

@login_required(login_url='registration')
@require_http_methods(["GET"])
def render_albums(req: HttpRequest):
    return render(request=req, template_name='profile_app/albums.html')

@login_required(login_url='registration')
@require_http_methods(["POST"])
def add_photo(req: HttpRequest):
    album_id = req.POST.get('album_id')
    photo_files = req.FILES.getlist('photos')
    if not album_id or not photo_files:
        return JsonResponse({'success': False, 'error': 'invalid_payload'})
    album = Album.objects.filter(pk=album_id, profile=req.user.profile).first()
    if not album:
        return JsonResponse({'success': False, 'error': 'invalid_payload'})
    created = []
    for file in photo_files:
        photo = AlbumImage.objects.create(album=album, image=file, is_shown=not album.is_default)
        created.append({'photoUrlWebp': photo.image_webp.url, 'photoId': photo.id, 'isShown': photo.is_shown, 'width': photo.width, 'height': photo.height, 'photoUrl': photo.image.url})
    return JsonResponse({'success': True, 'photos': created})

@login_required(login_url='registration')
@require_http_methods(["POST"])
def delete_photo(req: HttpRequest, photo_id: int):
    photo = AlbumImage.objects.filter(pk=photo_id).first()
    if not photo:
        return JsonResponse({'success': False, 'error': 'invalid_payload'})
    if not photo.album or photo.album.profile != req.user.profile:
        return JsonResponse({'success': False, 'error': 'invalid_payload'})
    delete_webp(photo)
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
def update_album(req: HttpRequest, album_id: int):
    data = get_data_from_json(req.body)
    name = data.get('name', '').strip()
    theme = data.get('theme', '').strip()
    year = data.get('year')
    if not is_valid_album_data(name, theme, year):
        return JsonResponse({'success': False, 'errors': 'invalid_payload'})
    album = Album.objects.filter(pk=album_id, profile=req.user.profile, is_default=False).first()
    if not album:
        return JsonResponse({'success': False, 'errors': 'invalid_payload'})
    album.name = name
    album.year = year
    album.theme = theme
    album.save()
    return JsonResponse({'success': True, 'data': {'name': album.name, 'theme': album.theme, 'year': album.year}})

@login_required(login_url='registration')
@require_http_methods(["POST"])
def delete_album(req: HttpRequest, album_id: int):
    album = Album.objects.filter(pk=album_id, profile=req.user.profile, is_default=False).first()
    if not album:
        return JsonResponse({'success': False, 'errors': 'invalid_payload'})
    for photo in album.images.all():
        delete_webp(photo)
        photo.image.delete()
    album.delete()
    return JsonResponse({'success': True})


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