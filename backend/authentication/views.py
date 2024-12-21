# backend/authentication/views.py

from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .forms import UserRegistrationForm

# Vista para registrar usuarios
class RegisterView(APIView):
    permission_classes = [AllowAny]  # Permitir acceso sin autenticación

    def post(self, request):
        form = UserRegistrationForm(data=request.data)
        if form.is_valid():
            form.save()
            return Response({"message": "User registered successfully!"}, status=status.HTTP_201_CREATED)
        return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)

# Vista para login
class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)

        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh)
            }, status=status.HTTP_200_OK)
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

class ProtectedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"message": "This is a protected route."}, status=200)
    

# Vista para logout
class LogoutView(APIView):
    def post(self, request):
        refresh_token = request.data.get('refresh')
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()  # Añade el token a la blacklist
                return Response({"message": "Logout successful!"}, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({"error": "Invalid token or token already blacklisted."}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"error": "Refresh token is required."}, status=status.HTTP_400_BAD_REQUEST)
