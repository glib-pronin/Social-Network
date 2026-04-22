from django.templatetags.static import static
from cloudinary.utils import cloudinary_url
import re 

def is_latin(name: str):
    return bool(re.match(r'^[A-Za-z]+', name))

def is_cyrillic(name: str):
    return bool(re.match(r'^[А-Яа-яЁёІіЇїЄє]+', name))

def group_friends_by_letter(friends, req):
    latin = {}
    cyrillic = {}
    for f in friends:
        name = f.get_full_name()
        if not name:
            continue

        letter = name[0].upper()
        target = latin if is_latin(name) else cyrillic if is_cyrillic(name) else None
        if target is None:
            continue

        if letter not in target:
            target[letter] = []

        if f.photo:
            photo_url, _ = cloudinary_url(source=f.photo.image.name, fetch_format='auto', quality='auto')
        else:
            photo_url = req.build_absolute_uri(static('profile_app/img/default_photo.png'))
        
        target[letter].append({
            'id': f.user.id,
            'name': name,
            'avatar': photo_url,
        })
    return (latin, cyrillic)