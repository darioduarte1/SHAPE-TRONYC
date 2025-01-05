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
from .services.google_auth import fetch_user_info


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
                    {"message": _(
                        "Usuario registrado exitosamente. Verifica tu correo para activar la cuenta.")},
                    status=status.HTTP_201_CREATED,
                )
            except (BadHeaderError, SMTPException) as e:
                return Response(
                    {"error": _(
                        "No se pudo enviar el correo de verificación. Contacta al soporte.")},
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
        activation_link = f"{settings.PROTOCOL}://{settings.DEFAULT_DOMAIN}/auth/verify-email/{uid}/{token}/"

        # Log para verificar el enlace generado
        logging.debug(f"Generated activation link: {activation_link}")

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

            # Obtener el idioma del usuario
            language = user.language if user.language else "en"

            # URL de redirección al frontend con un mensaje de éxito
            redirect_url = f"{settings.FRONTEND_HOME_URL}/auth?status=success&language={language}"
            return redirect(redirect_url)

        # En caso de token inválido, redirigir con un error
        redirect_url = f"{settings.FRONTEND_HOME_URL}/auth?status=error"
        return redirect(redirect_url)


#####################################################################################################################################
################################################# REENVIAR VERIFICACION EMAIL #######################################################
#####################################################################################################################################
# Configurar el logger
logger = logging.getLogger(__name__)


class ResendVerificationEmailView(APIView):

    throttle_classes = [ResendEmailRateThrottle]
    # Esto permite acceso a todos, autenticados o no.
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        logging.info(
            "Inicio de solicitud para reenviar correo de verificación.")
        logging.debug(f"Datos recibidos: {request.data}")

        if not username:
            logging.error("El campo 'username' está vacío.")
            return Response(
                {"error": "El campo 'username' no puede estar vacío."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(username=username)
            if user.is_active:
                logging.info(f"Usuario {username} ya está activo.")
                return Response(
                    {"error": "La cuenta ya está activa."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Generar el enlace
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            verification_url = f"{settings.PROTOCOL}://{settings.DEFAULT_DOMAIN}/auth/verify-email/{uid}/{token}/"

            # Agregar el print para depuración
            # Para verificar en los logs
            print(f"Verification URL: {verification_url}")

            RegisterView().send_verification_email(user)
            logging.info(
                f"Correo reenviado al usuario: {username} ({user.email}).")
            return Response(
                {"message": "Correo de verificación reenviado exitosamente."},
                status=status.HTTP_200_OK
            )
        except User.DoesNotExist:
            logging.error(f"No existe un usuario con el username: {username}")
            return Response(
                {"error": "No existe un usuario con este username."},
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

        if not user:
            return Response(
                {"error": "Invalid credentials.", "language": "en"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # Determina el idioma del usuario o usa 'en' como predeterminado
        language = getattr(user, "language", "en")
        activate(language)  # Activa el idioma

        # Verifica la contraseña manualmente
        if not check_password(password, user.password):
            return Response(
                {"error": "Invalid credentials.", "language": language},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # Usuario autenticado pero inactivo
        if not user.is_active:
            return Response(
                {
                    "error": "A sua conta ainda não foi verificada. Por favor verifique a caixa de entrada e o spam! Active o link enviado!",
                    "language": language,
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # Usuario activo y autenticado
        tokens = get_tokens_for_user(user)

        # Incluye el idioma y el ID del usuario en la respuesta
        return Response(
            {
                "tokens": tokens,
                "language": language,
                "user_id": user.id,
            },
            status=status.HTTP_200_OK,
        )


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
################################################## GOOGLE LOGIN CALL BACK ###########################################################
#####################################################################################################################################
class GoogleLoginCallbackView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        authorization_code = request.GET.get('code', None)
        if not authorization_code:
            return Response({"error": "Authorization code not provided"}, status=400)

        # Intercambiar el código de autorización por tokens
        tokens = exchange_authorization_code_for_tokens(authorization_code)

        # Obtener información del usuario
        user_info = fetch_user_info(tokens['access_token'])

        if not user_info.get("email"):
            return Response({"error": "Email not provided"}, status=400)

        # Verificar si el usuario existe
        try:
            user = User.objects.get(email=user_info["email"])
            if not user.is_active:
                return Response({"error": "Account is inactive. Please verify your email."}, status=403)
        except User.DoesNotExist:
            return Response({"error": "User not found. Please register first."}, status=404)

        # Generar tokens
        tokens = get_tokens_for_user(user)

        # Redirigir al frontend con los datos necesarios
        frontend_url = settings.FRONTEND_HOME_URL
        redirect_url = (
            f"{frontend_url}/auth"
            f"?access_token={tokens['access']}"
            f"&refresh_token={tokens['refresh']}"
            f"&user_id={user.id}"
            f"&language={user.language}&status=success"
        )
        return redirect(redirect_url)