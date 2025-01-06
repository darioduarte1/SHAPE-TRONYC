from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.http import JsonResponse

def root_view(request):
    headers = dict(request.headers)
    return JsonResponse({"message": "Welcome to Shape-Tronyc API", "headers": headers}, status=200)

print("Cargando backend.urls...")

urlpatterns = [
    path('', root_view, name='root'),
    path('admin/', admin.site.urls),
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/', include('backend.profiles.urls')),
    path('auth/', include('backend.signupLogin.urls')),
]
