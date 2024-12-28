from rest_framework import serializers
from .models import UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    # Agregamos full_name como un campo calculado
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = [
            "id",
            "username",  # Nombre de usuario
            "full_name",  # Nombre completo calculado
            "email",  # Correo electrónico
            "age",  # Edad
            "gender",  # Género
            "profile_picture",  # Foto de perfil
            "contact_number",  # Número de contacto
            "language",  # Idioma
            "is_partner",  # Es socio/partner
        ]

    def get_full_name(self, obj):
        # Devuelve el nombre completo combinando first_name y last_name
        return f"{obj.first_name} {obj.last_name}".strip()

    def update(self, instance, validated_data):
        # Procesar y actualizar directamente el campo profile_picture si está presente
        profile_picture = validated_data.pop('profile_picture', None)
        if profile_picture:
            instance.profile_picture = profile_picture
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
