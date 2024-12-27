"""
Serializadores para la app profiles.

Este módulo define el serializador para el modelo UserProfile, permitiendo convertir
las instancias del modelo en representaciones JSON y viceversa para su uso en las vistas de API.
"""

from rest_framework import serializers
from .models import UserProfile
from django.contrib.auth.models import User

class UserProfileSerializer(serializers.ModelSerializer):  # pylint: disable=too-few-public-methods
    profile_picture = serializers.SerializerMethodField()
    """
    Serializador para el modelo UserProfile.

    Este serializador transforma las instancias del modelo UserProfile a un formato JSON
    y también valida y deserializa datos JSON para crear o actualizar instancias del modelo.

    Atributos:
        Meta (class): Define el modelo y los campos que se incluirán en la representación
        serializada.
    """
    email = serializers.EmailField(source="user.email", read_only=True)
    class Meta:
        """
        Metaclase que configura el serializador.

        Atributos:
            model (UserProfile): El modelo que será serializado.
            fields (list): Los campos del modelo que se incluirán en la serialización.
        """
        model = UserProfile
        fields = ["id", "full_name", "age", "gender", "profile_picture", "contact_number", "email"]
    def get_profile_picture(self, obj):
        if obj.profile_picture:
            return obj.profile_picture.url
        return "https://via.placeholder.com/150"  # URL predeterminada si no hay imagen
    