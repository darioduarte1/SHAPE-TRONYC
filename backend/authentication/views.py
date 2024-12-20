# backend/authentication/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .forms import UserRegistrationForm

class RegisterView(APIView):
    def post(self, request):
        form = UserRegistrationForm(data=request.data)
        if form.is_valid():
            form.save()
            return Response({"message": "User registered successfully!"}, status=status.HTTP_201_CREATED)
        return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)
