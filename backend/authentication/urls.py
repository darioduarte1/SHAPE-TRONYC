# backend/authentication/urls.py

from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    ProtectedView,
    LogoutView,
    ChangePasswordView,
    VerifyEmailView,
    ResendVerificationEmailView,
    GoogleLoginView,
    GoogleCallbackView,
)

urlpatterns = [
    # User Registration and Authentication
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),

    # Email Verification
    path("verify-email/<str:uidb64>/<str:token>/", VerifyEmailView.as_view(), name="verify-email"),
    path("resend-verification/", ResendVerificationEmailView.as_view(), name="resend-verification"),

    # OAuth2 with Google
    path('oauth2/login/google/', GoogleLoginView.as_view(), name='google-login'),
    path('oauth2/callback/', GoogleCallbackView.as_view(), name='google-callback'),

    # Protected Routes
    path('protected/', ProtectedView.as_view(), name='protected'),
]
