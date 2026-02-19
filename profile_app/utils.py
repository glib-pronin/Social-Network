from django.utils import timezone
import re, os

def str_to_bool(value: str):
    return value == 'true'

def make_recommendation_list(user, limit=None):
    recommendation_list = []
    my_profile = user.profile
    excluding_ids = set()

    excluding_ids.add(my_profile.id)
    excluding_ids.update(my_profile.friends.values_list('id', flat=True))
    excluding_ids.update(my_profile.sent_requests.values_list('to_profile_id', flat=True))
    excluding_ids.update(my_profile.received_requests.values_list('from_profile_id', flat=True))

    for friend in my_profile.friends.all():
        for profile in friend.friends.exclude(pk__in=excluding_ids).all():
            recommendation_list.append(profile)
            excluding_ids.add(profile.id)
            if limit is not None and len(recommendation_list) > limit:
                return recommendation_list

    return recommendation_list


MAX_PS_LENGTH = 20
MIN_PS_LENGTH = 3

def is_valid_pseudonym(pseudonym):
    if len(pseudonym) < MIN_PS_LENGTH or len(pseudonym) > MAX_PS_LENGTH or not re.match(r'^(?!\d+$)[a-zA-Z0-9а-яА-ЯёЁіІїЇєЄґҐ]+([ _][a-zA-Z0-9а-яА-ЯёЁіІїЇєЄґҐ]+)*$', pseudonym):
        return False
    return True


MIN_DATA_LENGTH = 3
MAX_DATA_LENGTH = 50
MIN_YEAR = 1900

def is_valid_album_data(name, theme, year):
    if not (MIN_DATA_LENGTH < len(name) < MAX_DATA_LENGTH):
        return False
    if not (MIN_DATA_LENGTH < len(theme) < MAX_DATA_LENGTH):
        return False
    current_year = timezone.now().year
    try: 
        year = int(year)
        if year < MIN_YEAR or year > current_year:
            return False
    except (TypeError, ValueError):
        return False
    return True

def delete_webp(photo):
    if photo.image_webp:
        webp_path = photo.image_webp.path
        dir_path = os.path.dirname(webp_path)
        if os.path.exists(webp_path):
            os.remove(webp_path)
            os.rmdir(dir_path)