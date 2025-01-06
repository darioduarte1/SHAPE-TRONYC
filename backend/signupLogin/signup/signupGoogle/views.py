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

logger = logging.getLogger(__name__)

class GoogleSignupView(APIView):
    permission_classes = [AllowAny]  # Esto asegura que no se requiera autenticación

    def get(self, request):
        google_auth_url = "https://accounts.google.com/o/oauth2/auth"
        params = {
            "client_id": settings.SOCIAL_AUTH_GOOGLE_OAUTH2_KEY,
            "redirect_uri": settings.SOCIAL_AUTH_GOOGLE_OAUTH2_REDIRECT_URI,
            "response_type": "code",
            "scope": "email profile",
            "access_type": "offline",
            "prompt": "consent",
        }
        query_string = "&".join([f"{key}={value}" for key, value in params.items()])
        logger.info(f"Redirigiendo a Google OAuth con la URL: {google_auth_url}?{query_string}")
        return redirect(f"{google_auth_url}?{query_string}")

# Google Callback View
User = get_user_model()

class GoogleSignupCallbackView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        authorization_code = request.GET.get('code', None)
        if not authorization_code:
            logger.error("Código de autorización no proporcionado")
            return Response({"error": "Authorization code not provided"}, status=400)

        # Exchange authorization code for tokens
        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            "code": authorization_code,
            "client_id": settings.SOCIAL_AUTH_GOOGLE_OAUTH2_KEY,
            "client_secret": settings.SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET,
            "redirect_uri": settings.SOCIAL_AUTH_GOOGLE_OAUTH2_REDIRECT_URI,
            "grant_type": "authorization_code",
        }
        token_response = requests.post(token_url, data=token_data)
        if token_response.status_code != 200:
            logger.error("Error al intercambiar el token con Google")
            return Response({"error": "Failed to fetch access token from Google"}, status=500)

        tokens = token_response.json()

        # Fetch user info using the access token
        user_info_url = "https://www.googleapis.com/oauth2/v1/userinfo"
        user_info_response = requests.get(
            user_info_url, headers={"Authorization": f"Bearer {tokens['access_token']}"}
        )
        if user_info_response.status_code != 200:
            logger.error("Error al obtener información del usuario desde Google")
            return Response({"error": "Failed to fetch user info from Google"}, status=500)

        user_info = user_info_response.json()

        # Get or create a user
        user, created = User.objects.get_or_create(
            email=user_info["email"],
            defaults={
                "first_name": user_info.get("given_name", ""),
                "last_name": user_info.get("family_name", ""),
            },
        )

        # Generate JWT tokens
        from .utils import get_tokens_for_user
        jwt_tokens = get_tokens_for_user(user)

        # Redirect to frontend with tokens
        frontend_url = settings.FRONTEND_HOME_URL  # Set this in your Django settings
        redirect_url = f"{frontend_url}?access_token={jwt_tokens['access']}&refresh_token={jwt_tokens['refresh']}"
        logger.info(f"Redirigiendo al frontend con la URL: {redirect_url}")
        return redirect(redirect_url)
