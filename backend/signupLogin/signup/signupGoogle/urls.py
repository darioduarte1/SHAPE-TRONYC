from django.urls import path
from .views import GoogleSignupView, GoogleSignupCallbackView

urlpatterns = [
    path('', GoogleSignupView.as_view(), name='google-signup'),
    path('callback/', GoogleSignupCallbackView.as_view(), name='google-signup-callback'),
]