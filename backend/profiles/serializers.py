"""
Serializadores para la app profiles.

Define el serializador para el modelo UserProfile, permitiendo convertir
instancias del modelo en JSON y viceversa para la API.
"""

from rest_framework import serializers
from .models import UserProfile
from django.contrib.auth.models import User

class UserProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = UserProfile
        fields = ["id", "full_name", "age", "gender", "profile_picture", "contact_number", "email"]

    def update(self, instance, validated_data):
        # Procesar y actualizar directamente el campo profile_picture
        profile_picture = validated_data.pop('profile_picture', None)
        if profile_picture:
            instance.profile_picture = profile_picture
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
