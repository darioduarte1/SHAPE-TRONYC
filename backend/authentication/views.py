from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
from django.contrib.auth.hashers import check_password
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.http import JsonResponse
from django.shortcuts import redirect
from django.conf import settings
from django.template.loader import render_to_string
from .forms import UserRegistrationForm
import requests
from urllib.parse import urlencode
from .services.google_auth import exchange_authorization_code_for_tokens, process_google_user
from django.db import IntegrityError
from .utils import get_tokens_for_user


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        form = UserRegistrationForm(data=request.data)
        if form.is_valid():
            user = form.save(commit=False)
            # Default to English if not provided
            user.language = request.data.get("language", "en")
            user.is_partner = request.data.get("is_partner", False)
            user.is_active = False  # Usuario inactivo hasta confirmar el email
            user.save()

            # Enviar correo de verificación
            self.send_verification_email(user)
            return Response(
                {"message": "User registered successfully! Please verify your email."},
                status=status.HTTP_201_CREATED,
            )
        return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)

    def send_verification_email(self, user):
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        verification_link = f"http://yourfrontendurl.com/verify-email/{uid}/{token}/"

        subject = "Verify Your Email"
        message = render_to_string("emails/email_verification.html", {
            "user": user,
            "verification_link": verification_link,
        })

        send_mail(subject, message, "noreply@example.com", [user.email])


class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)

            if default_token_generator.check_token(user, token):
                user.is_active = True
                user.save()
                return Response({"message": "Email verified successfully!"}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)

        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)


class ResendVerificationEmailView(APIView):
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
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(username=username, password=password)

        if user:
            if not user.is_active:
                # Usuario no ha verificado su email
                RegisterView().send_verification_email(user)
                return Response(
                    {"error": "Email not verified. A new verification email has been sent."},
                    status=status.HTTP_403_FORBIDDEN,
                )

            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                    "user_id": user.id,
                    "language": user.language,
                },
                status=status.HTTP_200_OK,
            )
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
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
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"message": "This is a protected route."}, status=status.HTTP_200_OK)

# Google Callback View
class GoogleLoginView(APIView):
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
        query_string = urlencode(params)
        return redirect(f"{google_auth_url}?{query_string}")

# Google Callback View
User = get_user_model()

# backend/authentication/views.py

class GoogleCallbackView(APIView):
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
        from .utils import get_tokens_for_user
        jwt_tokens = get_tokens_for_user(user)

        # Redirect to frontend with tokens
        frontend_url = settings.FRONTEND_HOME_URL  # Set this in your Django settings
        redirect_url = f"{frontend_url}?access_token={jwt_tokens['access']}&refresh_token={jwt_tokens['refresh']}"
        return redirect(redirect_url)