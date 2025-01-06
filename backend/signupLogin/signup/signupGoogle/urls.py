from django.urls import path
from .views import GoogleSignupView, GoogleSignupCallbackView

print("Cargando signupGoogle.urls...")

urlpatterns = [
    path('oauth2/signup/google/', GoogleSignupView.as_view(), name='google-signup'),
    path('oauth2/callback/', GoogleSignupCallbackView.as_view(), name='google-callback'),
]