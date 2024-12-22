# backend/urls.py

from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.http import JsonResponse

# Vista para la raíz (punto de verificación de Render)
def root_view(request):
    return JsonResponse({"message": "Welcome to Shape-Tronyc API"}, status=200)

urlpatterns = [
    path('', root_view, name='root'),  # Ruta para la raíz
    path('admin/', admin.site.urls),  # Ruta del admin
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),  # Login para obtener tokens
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # Refrescar tokens
    path('auth/', include('backend.authentication.urls')),  # Rutas de autenticación (register, logout, etc.)
]