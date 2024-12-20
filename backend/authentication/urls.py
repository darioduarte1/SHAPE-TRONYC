# backend/authentication/urls.py

from django.urls import path
from .views import register, index

urlpatterns = [
    path('', index, name='home'),
    path('register/', register, name='register'),
]