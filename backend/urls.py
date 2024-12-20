"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

# backend/urls.py

from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),  # Ruta del admin
    path('auth/register/', include('backend.authentication.urls')),  # Ruta de registro
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),  # Login para obtener tokens
    path('auth/', include('backend.authentication.urls')),  # Rutas de autenticación
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # Refrescar tokens
    path('auth/logout/', include('backend.authentication.urls')),  # Logout y blacklist
]
