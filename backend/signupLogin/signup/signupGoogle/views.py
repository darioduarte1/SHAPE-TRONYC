import logging
import requests
from django.shortcuts import redirect
from django.conf import settings
from django.http import JsonResponse, HttpResponseRedirect
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils.crypto import get_random_string
from rest_framework.permissions import AllowAny
import jwt
from backend.profiles.models import UserProfile

logger = logging.getLogger(__name__)
user = UserProfile.objects.filter(email=email).first()


class GoogleSignupView(APIView):
    """
    Clase para manejar el flujo de autenticación de Google para registro.
    """
    permission_classes = [AllowAny]  # Permite el acceso público a esta vista

    def get(self, request, *args, **kwargs):

        print("GoogleSignupView llamada con parámetros:", request.GET)

        logger.info("GoogleSignupView fue llamada")

        # Obtener configuraciones
        client_id = settings.SOCIAL_AUTH_GOOGLE_OAUTH2_KEY
        redirect_uri = settings.SOCIAL_AUTH_GOOGLE_OAUTH2_REDIRECT_URI
        print("Redirect URI usado:", redirect_uri)
        scope = "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile"

        # Validar configuraciones necesarias
        if not client_id or not redirect_uri:
            logger.error("Google OAuth2 configuración incompleta.")
            return Response({"error": "Google OAuth2 configuración incompleta."}, status=500)

        # Generar `state` con idioma y un token aleatorio
        state_token = get_random_string(32)
        request.session['oauth_state'] = state_token
        state = f"{request.GET.get('language', 'en')}|{state_token}"

        # Construir URL de autenticación de Google
        google_auth_url = (
            f"https://accounts.google.com/o/oauth2/auth"
            f"?response_type=code"
            f"&client_id={client_id}"
            f"&redirect_uri={redirect_uri}"
            f"&scope={scope}"
            f"&state={state}"
        )
        logger.info(f"Redirigiendo a Google OAuth2: {google_auth_url}")
        print("Redirigiendo a Google Auth URL:", google_auth_url)
        return redirect(google_auth_url)


# Reemplaza print por logger.info() o logger.error(), por ejemplo:
logger.info("Entrando en GoogleSignupCallbackView")
logger.debug(f"Código recibido: {code}, Estado recibido: {state}")
logger.error("Error al obtener el token de Google",
             exc_info=True)  # Para errores


class GoogleSignupCallbackView(APIView):
    def get(self, request, *args, **kwargs):
        logger.info("Entrando en GoogleSignupCallbackView")

        # 1. Obtener parámetros de la URL
        code = request.GET.get("code")
        state = request.GET.get("state")
        logger.debug(f"Código recibido: {code}, Estado recibido: {state}")

        if not code:
            logger.error("Código de autorización no proporcionado por Google.")
            return Response({"error": "Authorization code not provided."}, status=400)

        # 2. Intercambiar el código por tokens de Google
        token_endpoint = "https://oauth2.googleapis.com/token"
        data = {
            "code": code,
            "client_id": settings.SOCIAL_AUTH_GOOGLE_OAUTH2_KEY,
            "client_secret": settings.SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET,
            "redirect_uri": settings.SOCIAL_AUTH_GOOGLE_OAUTH2_REDIRECT_URI,
            "grant_type": "authorization_code",
        }
        logger.debug(f"Solicitando token a Google con datos: {data}")

        try:
            token_response = requests.post(token_endpoint, data=data)
            token_response.raise_for_status()
            tokens = token_response.json()
            logger.info("Tokens recibidos de Google:", tokens)
        except requests.exceptions.RequestException as e:
            logger.error(f"Error al intercambiar token con Google: {str(e)}")
            return Response(
                {"error": "Failed to exchange token.", "details": str(e)}, status=400
            )

        # 3. Obtener datos del usuario con el token de acceso
        userinfo_endpoint = "https://www.googleapis.com/oauth2/v1/userinfo"
        headers = {"Authorization": f"Bearer {tokens.get('access_token')}"}
        logger.debug(f"Enviando cabeceras a UserInfo API: {headers}")

        try:
            userinfo_response = requests.get(userinfo_endpoint, headers=headers)
            userinfo_response.raise_for_status()
            user_info = userinfo_response.json()
            logger.info("Información del usuario recibida:", user_info)
        except requests.exceptions.RequestException as e:
            logger.error(f"Error al obtener información del usuario: {str(e)}")
            return Response(
                {"error": "Failed to fetch user info.", "details": str(e)}, status=400
            )

        # 4. Procesar la información del usuario
        email = user_info.get("email")  # Asegurarse de que `email` existe en `user_info`.
        if not email:
            logger.error("Google no proporcionó el email del usuario.")
            return Response({"error": "User email not provided by Google."}, status=400)

        # Verificar si el usuario ya existe en la base de datos
        from django.contrib.auth.models import User  # Cambiar si usas un modelo personalizado
        user = User.objects.filter(email=email).first()

        if user:
            logger.info(f"Usuario ya existe: {user.email}")
            return Response(
                {
                    "status": "error",
                    "message": "userAlreadyExists",
                },
                status=200,
            )

        # Si no existe, crear un nuevo usuario
        try:
            new_user = User.objects.create_user(
                username=email.split("@")[0],  # Generar nombre de usuario
                email=email,
                password=None,  # Si no usas contraseñas
            )
            logger.info(f"Usuario creado con éxito: {new_user.email}")
            return Response(
                {
                    "status": "success",
                    "message": "userCreatedSuccess",
                },
                status=200,
            )
        except Exception as e:
            logger.error(f"Error al crear el usuario: {str(e)}")
            return Response(
                {"error": "Failed to create user.", "details": str(e)}, status=500
            )