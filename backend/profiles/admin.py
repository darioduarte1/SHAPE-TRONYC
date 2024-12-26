"""
Configuración del administrador para la app profiles.

Este módulo define la interfaz de administrador para gestionar el modelo UserProfile en el
panel de administración de Django.
"""
from django.contrib import admin
from .models import UserProfile

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """
    Configuración del administrador para el modelo UserProfile.

    Esta clase personaliza la visualización de instancias de UserProfile en el panel de
    administración de Django.
    """
    list_display = (
    'user', 'full_name', 'age', 'gender', 'profile_picture',
    'contact_number'
    )
