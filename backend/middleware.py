from django.core.exceptions import DisallowedHost

def custom_disallowed_host_middleware(get_response):
    def middleware(request):
        try:
            return get_response(request)
        except DisallowedHost:
            pass  # Ignora los errores de DisallowedHost en desarrollo.
    return middleware