import os
import django
from django.core.mail import send_mail

# Cambia 'backend.settings' al nombre de tu módulo de configuración
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')  
django.setup()

try:
    send_mail(
        'Prueba desde Gmail',
        'Este es un correo de prueba enviado desde tu aplicación Django usando Gmail.',
        'shapetronyc@gmail.com',  # Cambia a tu correo de Gmail
        ['darioduarte1991@gmail.com'],  # Cambia al correo del destinatario
        fail_silently=False,
    )
    print("Correo enviado con éxito")
except Exception as e:
    print(f"Error al enviar el correo: {e}")