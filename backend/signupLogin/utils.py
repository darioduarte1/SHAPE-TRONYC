from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import exception_handler

def get_tokens_for_user(user):
    """
    Generates refresh and access tokens for the given user.
    """
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None and response.status_code == 429:  # Throttling error
        response.data = {
            "error": "You can only resend the verification email once every 60 seconds. Please try again later."
        }

    return response