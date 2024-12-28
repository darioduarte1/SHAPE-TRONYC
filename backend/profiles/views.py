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
            profile = UserProfile.objects.get(user__id=user_id)
            serializer = UserProfileSerializer(profile)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            return Response({"error": "Perfil no encontrado."}, status=404)

    def put(self, request, user_id):
        print("=== DEPURACIÓN DE PUT ===")
        print(f"Datos recibidos en request.data: {request.data}")
        print(f"Archivos recibidos en request.FILES: {request.FILES}")

        try:
            profile = UserProfile.objects.get(user__id=user_id)
            profile_data = request.data.copy()
            profile_file = request.FILES.get('profile_picture')  # Verifica si se recibe el archivo

            # Debug adicional para inspeccionar detalles del archivo
            if profile_file:
                print(f"Nombre del archivo recibido: {profile_file.name}")
                print(f"Tamaño del archivo recibido: {profile_file.size} bytes")
                print(f"Tipo de contenido: {profile_file.content_type}")

                # Subida a Cloudinary
                upload_result = cloudinary.uploader.upload(
                    profile_file,
                    folder="profile_pictures/",
                    public_id=f"user_{user_id}_profile_picture",
                    overwrite=True,
                )
                profile_data['profile_picture'] = upload_result['secure_url']
                print(f"URL subida a Cloudinary: {upload_result['secure_url']}")
            else:
                print("No se recibió ningún archivo en la solicitud.")

            serializer = UserProfileSerializer(profile, data=profile_data, partial=True)
            if serializer.is_valid():
                print("Datos validados correctamente.")
                serializer.save()
                print("Perfil actualizado exitosamente.")
                return Response(serializer.data)
            else:
                print("Errores de validación en los datos:")
                print(serializer.errors)
                return Response(serializer.errors, status=400)
        except UserProfile.DoesNotExist:
            print(f"Perfil con user_id {user_id} no encontrado.")
            return Response({"error": "Perfil no encontrado."}, status=404)
        except Exception as e:
            print(f"Error inesperado: {e}")
            return Response({"error": "Error inesperado en el servidor."}, status=500)
