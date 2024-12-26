"""
Serializadores para la app profiles.

Este módulo define el serializador para el modelo UserProfile, permitiendo convertir
las instancias del modelo en representaciones JSON y viceversa para su uso en las vistas de API.
"""

from rest_framework import serializers
from .models import UserProfile

class UserProfileSerializer(serializers.ModelSerializer):  # pylint: disable=too-few-public-methods
    """
    Serializador para el modelo UserProfile.

    Este serializador transforma las instancias del modelo UserProfile a un formato JSON
    y también valida y deserializa datos JSON para crear o actualizar instancias del modelo.

    Atributos:
        Meta (class): Define el modelo y los campos que se incluirán en la representación
        serializada.
    """
    class Meta:
        """
        Metaclase que configura el serializador.

        Atributos:
            model (UserProfile): El modelo que será serializado.
            fields (list): Los campos del modelo que se incluirán en la serialización.
        """
        model = UserProfile
        fields = ['user', 'full_name', 'age', 'gender', 'profile_picture', 'contact_number']
