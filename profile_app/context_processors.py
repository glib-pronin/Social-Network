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
        }
    }