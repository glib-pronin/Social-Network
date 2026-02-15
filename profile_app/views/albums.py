from django.shortcuts import render
from django.http import JsonResponse, HttpRequest
from ..forms import AlbumForm, Album

def render_albums(req: HttpRequest):
    album_form = AlbumForm()
    if req.method == 'POST':
            album_form = AlbumForm(req.POST)
            if album_form.is_valid():
                album = album_form.save(commit=False)
                album.profile = req.user.profile
                album.save()
    return render(request=req, template_name='profile_app/albums.html', context={'form': album_form, 'albums': Album.objects.all()})