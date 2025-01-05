from django.urls import path, include

urlpatterns = [
    path('google/', include('backend.signupLogin.signup.signupGoogle.urls')),
]