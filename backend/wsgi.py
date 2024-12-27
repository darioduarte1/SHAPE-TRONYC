import os
from django.core.wsgi import get_wsgi_application

# Configuración del módulo de configuración de Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# Aplicación WSGI
application = get_wsgi_application()