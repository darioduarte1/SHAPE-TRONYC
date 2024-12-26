"""
Este archivo contiene el modelo UserProfile para extender la funcionalidad del usuario.
"""

from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model): # pylint: disable=no-member
    """
    Modelo para extender la funcionalidad del usuario con datos adicionales.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=255, blank=True)
    age = models.IntegerField(null=True, blank=True)
    gender = models.CharField(
        max_length=50, 
        choices=[('M', 'Male'), ('F', 'Female'), ('O', 'Other')],
        null=True, blank=True
    )
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
    contact_number = models.CharField(max_length=15, null=True, blank=True)

    def __str__(self):
        return str(self.full_name if self.full_name else self.user.username) # pylint: disable=no-member
