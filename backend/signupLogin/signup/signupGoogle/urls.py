from django.urls import path
from .views import GoogleSignupView, GoogleSignupCallbackView

print("Cargando signupGoogle.urls...")

urlpatterns = [
    path('signup/google/', GoogleSignupView.as_view(), name='google_signup'),
    path('callback/', GoogleSignupCallbackView.as_view(), name='google_signup_callback'),
]
