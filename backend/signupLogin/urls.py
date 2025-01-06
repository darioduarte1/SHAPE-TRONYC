from django.urls import path, include
from django.contrib import admin
from .views import (
    RegisterView,
    LoginView,
    ProtectedView,
    LogoutView,
    ChangePasswordView,
    VerifyEmailView,
    ResendVerificationEmailView,
)

print("Cargando signupLogin.urls...")

urlpatterns = [
    # Rutas para registro y autenticación
    path('register/', RegisterView.as_view(), name='register'),
    path('', include('backend.signupLogin.signup.signupGoogle.urls')),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),

    # Verificación de email
    path("verify-email/<str:uidb64>/<str:token>/", VerifyEmailView.as_view(), name="verify-email"),
    path("resend-verification/", ResendVerificationEmailView.as_view(), name="resend-verification"),

    # Rutas protegidas
    path('protected/', ProtectedView.as_view(), name='protected'),
]
