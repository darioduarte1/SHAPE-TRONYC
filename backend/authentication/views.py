# backend/authentication/views.py

from django.shortcuts import render
from django.contrib.auth import login
from django.http import JsonResponse
from .forms import UserRegisterForm

def index(request):
    """Renderiza la aplicación React"""
    return render(request, 'index.html')

def register(request):
    """Vista para registrar usuarios"""
    if request.method == 'POST':
        form = UserRegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return JsonResponse({'message': 'Usuario registrado con éxito.'})
        return JsonResponse({'error': form.errors}, status=400)
    return JsonResponse({'error': 'Método no permitido.'}, status=405)
