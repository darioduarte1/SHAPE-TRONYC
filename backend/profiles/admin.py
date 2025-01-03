from django.contrib import admin
from .models import UserProfile

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """
    Configuración del administrador para el modelo UserProfile.

    Esta clase personaliza la visualización de instancias de UserProfile en el panel de
    administración de Django.
    """
    list_display = ('get_username', 'full_name', 'gender', 'age', 'email', 'contact_number', 'language', 'is_partner', 'is_active')

    def get_username(self, obj):
        return obj.username  # Devuelve el nombre de usuario asociado
    get_username.short_description = 'Username'  # Título de la columna en el admin
