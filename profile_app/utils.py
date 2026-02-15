import re

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


MAX_LENGTH = 20
MIN_LENGTH = 3

def is_valid_pseudonym(pseudonym):
    if len(pseudonym) < MIN_LENGTH or len(pseudonym) > MAX_LENGTH or not re.match(r'^(?!\d+$)[a-zA-Z0-9а-яА-ЯёЁіІїЇєЄґҐ]+([ _][a-zA-Z0-9а-яА-ЯёЁіІїЇєЄґҐ]+)*$', pseudonym):
        return False
    return True