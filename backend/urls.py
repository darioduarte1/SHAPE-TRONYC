# backend/urls.py

from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.http import JsonResponse

# Vista para la raíz (punto de verificación de Render)
def root_view(request):
    headers = dict(request.headers)
    return JsonResponse({"message": "Welcome to Shape-Tronyc API", "headers": headers}, status=200)

urlpatterns = [
    path('', lambda request: JsonResponse({"message": "Backend is running"})),
    path('admin/', admin.site.urls),
    path('auth/', include('backend.authentication.urls')),
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]