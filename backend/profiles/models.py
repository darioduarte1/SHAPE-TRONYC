"""
Módulo de modelos y señales para la gestión de perfiles de usuario.

Este módulo extiende el modelo de usuario predeterminado de Django con un perfil
adicional que almacena información extra como nombre completo, edad, género, foto
de perfil y número de contacto. Además, incluye señales para manejar automáticamente
la creación y el guardado del perfil.
"""

from django.db import models
from django.contrib.auth.models import User  # pylint: disable=imported-auth-user
from django.db.models.signals import post_save
from django.dispatch import receiver


class UserProfile(models.Model):
    """
    Modelo para extender la funcionalidad del usuario con datos adicionales.

    Atributos:
        user (User): Relación uno a uno con el modelo de usuario de Django.
        full_name (str): Nombre completo del usuario.
        age (int): Edad del usuario.
        gender (str): Género del usuario, con opciones 'Male', 'Female' y 'Other'.
        profile_picture (ImageField): Imagen de perfil del usuario.
        contact_number (str): Número de contacto del usuario.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=255, blank=True)
    age = models.IntegerField(null=True, blank=True)
    gender = models.CharField(
        max_length=50,
        choices=[('M', 'Male'), ('F', 'Female'), ('O', 'Other')],
        null=True,
        blank=True
    )
    profile_picture = models.ImageField(
        upload_to='profile_pictures/',
        null=True,
        blank=True
    )
    contact_number = models.CharField(max_length=15, null=True, blank=True)

    def __str__(self):
        """
        Devuelve una representación en cadena del perfil del usuario.

        Si el nombre completo está disponible, lo devuelve. De lo contrario, devuelve el nombre
        de usuario.
        """
        return str(self.full_name if self.full_name else self.user.username)  # pylint: disable=no-member


# Señales para crear y guardar automáticamente el perfil de usuario
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):# pylint: disable=unused-argument
    """
    Crea automáticamente un perfil asociado al usuario al momento de su creación.

    Argumentos:
        sender (type): Modelo que envía la señal, en este caso User.
        instance (User): Instancia del modelo User que disparó la señal.
        created (bool): Indica si el usuario fue creado.
        **kwargs: Argumentos adicionales que no se usan en esta función.
    """
    if created:
        UserProfile.objects.create(user=instance)  # pylint: disable=no-member


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):# pylint: disable=unused-argument
    """
    Guarda automáticamente el perfil asociado al usuario.

    Argumentos:
        sender (type): Modelo que envía la señal, en este caso User.
        instance (User): Instancia del modelo User que disparó la señal.
        **kwargs: Argumentos adicionales.
    """
    instance.userprofile.save()# pylint: disable=no-member