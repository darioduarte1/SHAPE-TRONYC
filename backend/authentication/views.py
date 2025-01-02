# Importaciones necesarias
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.hashers import check_password
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from smtplib import SMTPException
from django.shortcuts import redirect
from django.conf import settings
from urllib.parse import urlencode
import requests
from .forms import UserRegistrationForm
from .services.google_auth import exchange_authorization_code_for_tokens, process_google_user
from .utils import get_tokens_for_user
from .serializers import UserSerializer
from django.utils.translation import gettext as _
from django.utils.translation import gettext_lazy as _
from django.utils.translation import activate
from .throttles import ResendEmailRateThrottle
import logging
from backend.profiles.models import UserProfile
from django.contrib.auth.hashers import check_password







User = get_user_model()

#####################################################################################################################################
######################################################### VERIFICAR TOKEN ###########################################################
#####################################################################################################################################
def verify_token(uidb64, token):
    """Verifica un token generado para la activación del usuario."""
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return None

    if user and default_token_generator.check_token(user, token):
        return user
    return None


#####################################################################################################################################
######################################################### REGISTER ##################################################################
#####################################################################################################################################
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            user.is_active = False  # Usuario desactivado hasta verificar el correo
            user.save()

            # Activar idioma según el lenguaje del usuario
            self.activate_language(user.language)

            try:
                self.send_verification_email(user)
                return Response(
                    {"message": _("Usuario registrado exitosamente. Verifica tu correo para activar la cuenta.")},
                    status=status.HTTP_201_CREATED,
                )
            except (BadHeaderError, SMTPException) as e:
                return Response(
                    {"error": _("No se pudo enviar el correo de verificación. Contacta al soporte.")},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
        else:
            # Traducir mensajes de error
            errors = serializer.errors
            translated_errors = {
                field: [_(msg) for msg in messages]
                for field, messages in errors.items()
            }
            return Response({"errors": translated_errors}, status=status.HTTP_400_BAD_REQUEST)

    def send_verification_email(self, user):
        """Envía un correo de verificación en el idioma correspondiente."""
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        activation_link = f"http://127.0.0.1:8000/auth/verify-email/{uid}/{token}/"

        # Mensajes traducidos
        translations = {
            "en": {
                "subject": "Confirm your account",
                "message": f"Hi {user.username}, please confirm your account by clicking on the following link: {activation_link}"
            },
            "es": {
                "subject": "Confirma tu cuenta",
                "message": f"Hola {user.username}, por favor confirma tu cuenta haciendo clic en el siguiente enlace: {activation_link}"
            },
            "pt": {
                "subject": "Confirme sua conta",
                "message": f"Olá {user.username}, por favor confirme sua conta clicando no seguinte link: {activation_link}"
            }
        }

        # Obtener el idioma del usuario o usar inglés como predeterminado
        language = user.language if user.language in translations else "en"
        subject = translations[language]["subject"]
        message = translations[language]["message"]

        send_mail(subject, message, "noreply@example.com", [user.email])

    def activate_language(self, language):
        """Activa el idioma seleccionado por el usuario."""
        if language:
            activate(language)
        else:
            activate("en")  # Idioma predeterminado

#####################################################################################################################################
##################################################### VERIFICATION EMAIL ############################################################
#####################################################################################################################################
class VerifyEmailView(APIView):
    """Vista para manejar la verificación del correo electrónico."""
    permission_classes = [AllowAny]

    def get(self, request, uidb64, token, *args, **kwargs):
        user = verify_token(uidb64, token)
        if user:
            user.is_active = True
            user.save()
            return Response({"message": "Cuenta activada exitosamente."}, status=status.HTTP_200_OK)
        return Response({"error": "Token inválido o expirado."}, status=status.HTTP_400_BAD_REQUEST)

#####################################################################################################################################
################################################# REENVIAR VERIFICACION EMAIL #######################################################
#####################################################################################################################################
class ResendVerificationEmailView(APIView):
    throttle_classes = [ResendEmailRateThrottle]
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        try:
            user = User.objects.get(email=email)
            if user.is_active:
                return Response(
                    {"error": "La cuenta ya está activa."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            RegisterView().send_verification_email(user)
            return Response(
                {"message": "Correo de verificación reenviado exitosamente."},
                status=status.HTTP_200_OK
            )
        except User.DoesNotExist:
            return Response(
                {"error": "No existe un usuario con este correo."},
                status=status.HTTP_404_NOT_FOUND
            )

#####################################################################################################################################
######################################################### LOGIN #####################################################################
#####################################################################################################################################
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        username = request.data.get("username")
        password = request.data.get("password")

        # Busca al usuario por nombre de usuario
        user = UserProfile.objects.filter(username=username).first()

        # Debug: Información del usuario
        print(f"Intento de login para el usuario: {username}")
        if user:
            print(f"Usuario encontrado: {user.username}")
            print(f"Usuario activo: {user.is_active}")
            print(f"Idioma del usuario: {user.language}")
        else:
            print("Usuario no encontrado.")
            return Response(
                {"error": "Invalid credentials.", "language": "en"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # Determina el idioma del usuario o usa 'en' como predeterminado
        language = getattr(user, "language", "en")
        activate(language)  # Activa el idioma

        # Verifica la contraseña manualmente
        if not check_password(password, user.password):
            print("Contraseña inválida.")
            return Response(
                {"error": "Invalid credentials.", "language": language},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # Usuario autenticado pero inactivo
        if not user.is_active:
            print("Usuario inactivo. Retornando 403.")
            return Response(
                {
                    "error": "A sua conta ainda não foi verificada. Por favor verifique a caixa de entrada e o spam! Active o link enviado!",
                    "language": language,
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # Usuario activo y autenticado
        tokens = get_tokens_for_user(user)
        print("Usuario activo. Retornando tokens.")
        return Response({"tokens": tokens}, status=status.HTTP_200_OK)



#####################################################################################################################################
######################################################### LOGOUT ####################################################################
#####################################################################################################################################
class LogoutView(APIView):
    """Vista para manejar el cierre de sesión."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
                return Response({"message": "Logout successful!"}, status=status.HTTP_200_OK)
            except Exception:
                return Response({"error": "Invalid token or token already blacklisted."}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"error": "Refresh token is required."}, status=status.HTTP_400_BAD_REQUEST)

#####################################################################################################################################
#################################################### CHANGE PASSWORD ################################################################
#####################################################################################################################################
class ChangePasswordView(APIView):
    """Vista para cambiar la contraseña del usuario."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        current_password = request.data.get("current_password")
        new_password = request.data.get("new_password")
        confirm_password = request.data.get("confirm_password")

        if not current_password or not new_password or not confirm_password:
            return Response({"error": "All fields are required."}, status=status.HTTP_400_BAD_REQUEST)

        if not check_password(current_password, user.password):
            return Response({"error": "Current password is incorrect."}, status=status.HTTP_400_BAD_REQUEST)

        if new_password != confirm_password:
            return Response({"error": "New passwords do not match."}, status=status.HTTP_400_BAD_REQUEST)

        if current_password == new_password:
            return Response(
                {"error": "New password must be different from the current password."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(new_password)
        user.save()
        return Response({"message": "Password updated successfully!"}, status=status.HTTP_200_OK)

#####################################################################################################################################
#################################################### PROTECTED VIEW #################################################################
#####################################################################################################################################
class ProtectedView(APIView):
    """Vista para rutas protegidas."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"message": "This is a protected route."}, status=status.HTTP_200_OK)


#####################################################################################################################################
################################################### VISTA LOGIN VIEW ################################################################
#####################################################################################################################################
class GoogleLoginView(APIView):
    """Vista para manejar el inicio de sesión con Google."""
    permission_classes = [AllowAny]

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
        query_string = urlencode(params)
        return redirect(f"{google_auth_url}?{query_string}")

#####################################################################################################################################
################################################### CALL BACK DE GOOGLE #############################################################
#####################################################################################################################################
class GoogleCallbackView(APIView):
    """Vista para manejar la callback de Google."""
    permission_classes = [AllowAny]

    def get(self, request):
        authorization_code = request.GET.get('code', None)
        if not authorization_code:
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
            return Response({"error": "Failed to fetch access token from Google"}, status=500)

        tokens = token_response.json()

        # Fetch user info using the access token
        user_info_url = "https://www.googleapis.com/oauth2/v1/userinfo"
        user_info_response = requests.get(
            user_info_url, headers={"Authorization": f"Bearer {tokens['access_token']}"}
        )
        if user_info_response.status_code != 200:
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
        jwt_tokens = get_tokens_for_user(user)

        # Redirect to frontend with tokens
        frontend_url = settings.FRONTEND_HOME_URL  # Set this in your Django settings
        redirect_url = f"{frontend_url}?access_token={jwt_tokens['access']}&refresh_token={jwt_tokens['refresh']}"
        return redirect(redirect_url)
