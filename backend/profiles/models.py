from django.contrib.auth.models import AbstractUser
from django.db import models

class UserProfile(AbstractUser):
    """
    Modelo personalizado de usuario que extiende AbstractUser.

    Agrega campos adicionales como `age`, `gender`, `profile_picture`, y propiedades personalizadas como `full_name`.
    """
    age = models.IntegerField(null=True, blank=True)
    gender = models.CharField(
        max_length=50,
        choices=[('M', 'Male'), ('F', 'Female'), ('O', 'Other')],
        null=True,
        blank=True
    )
    profile_picture = models.URLField(max_length=500, blank=True, null=True)
    contact_number = models.CharField(max_length=15, null=True, blank=True)
    language = models.CharField(
        max_length=10,
        choices=[
            ('en', 'English'),
            ('es', 'Español'),
            ('pt', 'Português')
        ],
        default='en'
    )
    is_partner = models.BooleanField(default=False)

    @property
    def full_name(self):
        """
        Devuelve el nombre completo del usuario basado en `first_name` y `last_name`.
        Si ambos están vacíos, devuelve el username.
        """
        full_name = f"{self.first_name} {self.last_name}".strip()
        return full_name if full_name else self.username

    def __str__(self):
        return self.full_name or "Sin nombre"
