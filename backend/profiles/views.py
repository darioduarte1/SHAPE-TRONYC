"""
Este módulo contiene las vistas basadas en clases para gestionar perfiles de usuario.
Incluye operaciones para recuperar y actualizar perfiles de usuarios autenticados.
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import UserProfile
from .serializers import UserProfileSerializer

class ProfileView(APIView):
    """
    Vista de API para manejar perfiles de usuario por ID.

    Esta vista permite a los usuarios autenticados recuperar y actualizar perfiles
    utilizando un parámetro `user_id` en la URL.
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
        """
        Actualiza los datos del perfil de usuario basado en el `user_id`.

        Argumentos:
            request (Request): La solicitud HTTP con los datos para actualizar.
            user_id (int): ID del usuario cuyo perfil se desea actualizar.

        Retorna:
            Response: Datos actualizados o un error 404 si el perfil no existe.
        """
        try:
            profile = UserProfile.objects.get(user__id=user_id)
            serializer = UserProfileSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=400)
        except UserProfile.DoesNotExist:
            return Response({"error": "Perfil no encontrado."}, status=404)
