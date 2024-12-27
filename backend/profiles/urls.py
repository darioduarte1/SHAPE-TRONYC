"""
Configuración de URLs para la app profiles.

Este módulo define las rutas URL relacionadas con los perfiles de usuario.
"""
from django.urls import path
from .views import ProfileView

urlpatterns = [
    path('profiles/<int:user_id>/', ProfileView.as_view(), name='profile-detail'),
    path('profile/<int:user_id>/', ProfileView.as_view(), name='profile-detail'),
]
