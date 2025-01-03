import requests
from django.conf import settings

def exchange_authorization_code_for_tokens(auth_code):
    """
    Intercambia el código de autorización por tokens de Google.
    """
    token_url = "https://oauth2.googleapis.com/token"
    token_data = {
        "code": auth_code,
        "client_id": settings.SOCIAL_AUTH_GOOGLE_OAUTH2_KEY,
        "client_secret": settings.SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET,
        "redirect_uri": settings.SOCIAL_AUTH_GOOGLE_OAUTH2_REDIRECT_URI,
        "grant_type": "authorization_code",
    }
    response = requests.post(token_url, data=token_data)
    response.raise_for_status()  # Lanza excepción si falla la solicitud
    return response.json()

def fetch_user_info(access_token):
    """
    Obtiene información del usuario desde Google utilizando el access token.
    """
    user_info_url = "https://www.googleapis.com/oauth2/v1/userinfo"
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(user_info_url, headers=headers)
    response.raise_for_status()
    return response.json()

def process_google_user(tokens):
    """
    Procesa la información del usuario para registrar o autenticar en el sistema.
    """
    user_info = fetch_user_info(tokens['access_token'])

    # Aquí puedes buscar o crear al usuario en tu base de datos.
    # Ejemplo (depende de tu modelo de usuario):
    from django.contrib.auth.models import User
    user, created = User.objects.get_or_create(
        email=user_info['email'],
        defaults={
            'first_name': user_info.get('given_name', ''),
            'last_name': user_info.get('family_name', ''),
            'username': user_info['email'],  # O usa otro identificador único
        },
    )
    return user