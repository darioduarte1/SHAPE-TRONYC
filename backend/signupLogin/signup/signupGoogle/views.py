import logging
import requests
from django.shortcuts import redirect
from django.conf import settings
from django.http import JsonResponse, HttpResponseRedirect
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils.crypto import get_random_string
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model  # Importación necesaria
from backend.profiles.models import UserProfile
from backend.signupLogin.utils import get_tokens_for_user
from rest_framework.response import Response

logger = logging.getLogger(__name__)

class GoogleSignupView(APIView):
    permission_classes = [AllowAny]  # Esto asegura que no se requiera autenticación

    def get(self, request):
        google_auth_url = "https://accounts.google.com/o/oauth2/auth"
        language = request.GET.get("language", "en")  # Capturar el lenguaje de la URL
        params = {
            "client_id": settings.SOCIAL_AUTH_GOOGLE_OAUTH2_KEY,
            "redirect_uri": settings.SOCIAL_AUTH_GOOGLE_OAUTH2_REDIRECT_URI,
            "response_type": "code",
            "scope": "email profile",
            "access_type": "offline",
            "prompt": "consent",
            "state": language,  # Pasar el lenguaje como parte del estado
        }
        query_string = "&".join([f"{key}={value}" for key, value in params.items()])
        logger.info(f"URL generada para Google: {google_auth_url}?{query_string}")
        return redirect(f"{google_auth_url}?{query_string}")

class GoogleSignupCallbackView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        from django.contrib.auth import get_user_model  # Mueve esta importación al inicio de la función
        User = get_user_model()  # Obtén el modelo de usuario

        # Obtener el código de autorización de la URL
        authorization_code = request.GET.get('code', None)
        if not authorization_code:
            logger.error("Código de autorización no proporcionado")
            return Response({"error": "Authorization code not provided"}, status=400)

        logger.debug(f"Código recibido en el callback: {authorization_code}")

        # Intercambiar el código por tokens
        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            "code": authorization_code,
            "client_id": settings.SOCIAL_AUTH_GOOGLE_OAUTH2_KEY,
            "client_secret": settings.SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET,
            "redirect_uri": settings.SOCIAL_AUTH_GOOGLE_OAUTH2_REDIRECT_URI,
            "grant_type": "authorization_code",
        }

        logger.debug(f"Enviando solicitud de tokens a Google con los datos: {token_data}")
        token_response = requests.post(token_url, data=token_data)

        if token_response.status_code != 200:
            logger.error("Error al intercambiar el token con Google")
            return Response({"error": "Failed to fetch access token from Google"}, status=500)

        tokens = token_response.json()

        # Obtener información del usuario con el access_token
        user_info_url = "https://www.googleapis.com/oauth2/v1/userinfo"
        user_info_response = requests.get(
            user_info_url,
            headers={"Authorization": f"Bearer {tokens['access_token']}"}
        )

        if user_info_response.status_code != 200:
            logger.error("Error al obtener información del usuario desde Google")
            return Response({"error": "Failed to fetch user info from Google"}, status=500)

        user_info = user_info_response.json()

        # Recuperar el estado enviado desde el frontend (idioma)
        language = request.GET.get('state', 'en')  # Idioma predeterminado es 'en'

        # Crear o actualizar al usuario en la base de datos
        user, created = User.objects.get_or_create(
            email=user_info["email"],
            defaults={
                "first_name": user_info.get("given_name", ""),
                "last_name": user_info.get("family_name", ""),
                "language": language,  # Asignar el idioma
            },
        )

        if not created:
            # Actualizar el idioma si el usuario ya existe
            user.language = language
            user.save()

        # Generar tokens JWT
        jwt_tokens = get_tokens_for_user(user)

        # Preparar la respuesta JSON
        response_data = {
            "access_token": jwt_tokens["access"],
            "refresh_token": jwt_tokens["refresh"],
            "user_id": user.id,
            "language": user.language,
        }

        logger.info("Enviando datos al frontend vía JSON.")

        # Redirigir al frontend con los datos de autenticación
        redirect_url = f"{settings.FRONTEND_HOME_URL}/auth/oauth2/callback"
        query_params = "&".join([f"{key}={value}" for key, value in response_data.items()])
        return redirect(f"{redirect_url}?{query_params}")
