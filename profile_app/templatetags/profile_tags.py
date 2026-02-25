from django import template

register = template.Library()

@register.simple_tag(takes_context=True)
def check_profile(context):
    if context.get('is_albums_owner') :
        return True
    req = context.get('request')
    user = req.user
    url = req.path
    if "profile" in url and str(user.profile.id) not in url:
        return False
    return True
