from django.urls import path, include

print("Cargando signup.urls...")

urlpatterns = [
    # Otras rutas del módulo signup
    path('oauth2/', include('backend.signupLogin.signup.signupGoogle.urls')),  # Incluye rutas de signupGoogle
]