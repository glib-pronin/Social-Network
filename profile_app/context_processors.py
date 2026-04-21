def profile_nav(request):
    return {
        'profile_tabs': {
            'friends': [
                'friends',
                'friends_all',
                'friends_requests',
                'friends_recommendation',
            ],
            'settings': [
                'profile_settings',
                'albums'
            ],
            'chats': [
                'chat_lobby',
                'chat',
            ],
        }
    }

def unread_messages(request):
    if not request.user.is_authenticated:
        return {}
    stats = request.user.profile.get_total_unread_stats()
    return {**stats}