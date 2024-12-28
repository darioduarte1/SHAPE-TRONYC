from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    language = models.CharField(
        max_length=10,
        choices=[
            ('en', 'English'),
            ('es', 'Español'),
            ('pt', 'Português')
        ],
        default='en'
    )
    is_partner = models.BooleanField(default=False)  # Ya existe en tu lógica
