from functools import wraps
from django.shortcuts import redirect

def anonymous_required(func):
    @wraps(func)
    def wrapper(req):
        if req.user.is_authenticated:
            return redirect('/')
        else:
            return func(req)
    return wrapper