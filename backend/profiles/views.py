"""
Este módulo contiene las vistas basadas en clases para gestionar perfiles de usuario.
Incluye operaciones para recuperar y actualizar perfiles de usuarios autenticados, incluyendo fotos de perfil.
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import UserProfile
from .serializers import UserProfileSerializer
import cloudinary.uploader

class ProfileView(APIView):
    """
    Vista de API para manejar perfiles de usuario por ID.

    Esta vista permite a los usuarios autenticados recuperar y actualizar perfiles,
    incluyendo la posibilidad de actualizar su foto de perfil.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        """
        Recupera los datos del perfil de usuario basado en el `user_id`.

        Argumentos:
            request (Request): La solicitud HTTP.
            user_id (int): ID del usuario cuyo perfil se desea obtener.

        Retorna:
            Response: Datos serializados del perfil o un error 404 si no existe.
        """
        try:
            profile = UserProfile.objects.get(id=user_id)
            serializer = UserProfileSerializer(profile)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            return Response({"error": "Perfil no encontrado."}, status=404)

    def put(self, request, user_id):
        try:
            profile = UserProfile.objects.get(id=user_id)  # Obtén el perfil por ID
            profile_data = request.data.copy()
            profile_file = request.FILES.get('profile_picture')  # Archivo opcional

            # Subida de imagen si se proporciona
            if profile_file:
                upload_result = cloudinary.uploader.upload(
                    profile_file,
                    folder="profile_pictures/",
                    public_id=f"user_{user_id}_profile_picture",
                    overwrite=True,
                )
                profile_data['profile_picture'] = upload_result['secure_url']

            # Manejo de full_name: descompone en first_name y last_name
            full_name = profile_data.pop('full_name', [''])[0].strip()  # Asegúrate de manejar listas
            if full_name:
                name_parts = full_name.split(' ', 1)  # Divide el nombre completo en 2 partes
                profile.first_name = name_parts[0]
                profile.last_name = name_parts[1] if len(name_parts) > 1 else ''

            # Serializa y valida los datos restantes
            serializer = UserProfileSerializer(profile, data=profile_data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=400)

        except UserProfile.DoesNotExist:
            return Response({"error": "Perfil no encontrado."}, status=404)
        except Exception as e:
            print(f"Error inesperado: {e}")
            return Response({"error": "Error inesperado en el servidor."}, status=500)
