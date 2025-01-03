from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'language']
        extra_kwargs = {
            'password': {'write_only': True},
            'username': {'error_messages': {'unique': "El nombre de usuario ya está en uso."}},
            'email': {'error_messages': {'unique': "El correo electrónico ya está registrado."}},
        }

    def validate(self, data):
        language = data.get('language', 'en')  # Obtener el idioma del usuario o usar inglés por defecto
        translations = {
            'en': {
                'username_exists': "A user with that username already exists.",
                'email_exists': "The email is already registered.",
            },
            'es': {
                'username_exists': "El nombre de usuario ya está en uso.",
                'email_exists': "El correo electrónico ya está registrado.",
            },
            'pt': {
                'username_exists': "O nome de usuário já está em uso.",
                'email_exists': "O e-mail já está registrado.",
            },
        }

        # Verificar username y email manualmente
        if User.objects.filter(username=data['username']).exists():
            raise serializers.ValidationError({
                'username': translations[language].get('username_exists', "Error")
            })
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({
                'email': translations[language].get('email_exists', "Error")
            })

        return data

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user
