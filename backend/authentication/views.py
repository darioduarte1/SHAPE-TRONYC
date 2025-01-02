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







User = get_user_model()

# --- Funciones auxiliares ---
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


# --- Vistas de autenticación ---
class RegisterView(APIView):
    """Vista para registrar un nuevo usuario."""
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            user.is_active = False  # Desactivar usuario hasta que verifique el correo
            user.save()

            # Enviar correo de verificación
            try:
                self.send_verification_email(user)
                return Response(
                    {"message": "Usuario registrado exitosamente. Verifica tu correo para activar la cuenta."},
                    status=status.HTTP_201_CREATED,
                )
            except Exception:
                return Response(
                    {"error": "No se pudo enviar el correo de verificación. Contacta al soporte."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def send_verification_email(self, user):
        """Envía un correo para la verificación de la cuenta."""
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        activation_link = f"http://127.0.0.1:8000/auth/verify-email/{uid}/{token}/"
        subject = "Confirma tu cuenta"
        message = f"Hola {user.username}, verifica tu cuenta haciendo clic en el enlace: {activation_link}"
        send_mail(subject, message, "noreply@example.com", [user.email])


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


class ResendVerificationEmailView(APIView):
    """Vista para reenviar el correo de verificación."""
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        try:
            user = User.objects.get(email=email)

            if user.is_active:
                return Response({"error": "Account is already active."}, status=status.HTTP_400_BAD_REQUEST)

            RegisterView().send_verification_email(user)
            return Response({"message": "Verification email resent."}, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response({"error": "User with this email does not exist."}, status=status.HTTP_404_NOT_FOUND)


class LoginView(APIView):
    """Vista para manejar el inicio de sesión."""
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(username=username, password=password)

        if user:
            if user.is_active:
                tokens = get_tokens_for_user(user)
                return Response({"tokens": tokens}, status=status.HTTP_200_OK)
            return Response(
                {"error": "Tu cuenta no está activada. Por favor verifica tu correo."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return Response({"error": "Credenciales inválidas."}, status=status.HTTP_401_UNAUTHORIZED)


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


class ProtectedView(APIView):
    """Vista para rutas protegidas."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"message": "This is a protected route."}, status=status.HTTP_200_OK)


# --- Vistas de autenticación con Google ---
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
