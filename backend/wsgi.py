import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# Bind Gunicorn to Render's assigned port
application = get_wsgi_application()