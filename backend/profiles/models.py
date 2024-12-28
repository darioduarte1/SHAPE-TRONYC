from django.db import models
from django.conf import settings
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
        profile_picture (URLField): URL de la imagen de perfil del usuario.
        contact_number (str): Número de contacto del usuario.
    """
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=255, blank=True)
    age = models.IntegerField(null=True, blank=True)
    gender = models.CharField(
        max_length=50,
        choices=[('M', 'Male'), ('F', 'Female'), ('O', 'Other')],
        null=True,
        blank=True
    )
    profile_picture = models.URLField(max_length=500, blank=True, null=True)  # Cambiado a URLField
    contact_number = models.CharField(max_length=15, null=True, blank=True)

    def __str__(self):
        """
        Devuelve una representación en cadena del perfil del usuario.

        Si el nombre completo está disponible, lo devuelve. De lo contrario,
        devuelve el nombre de usuario o un valor por defecto.

        Returns:
            str: Nombre completo, nombre de usuario o 'Sin nombre'.
        """
        return str(self.full_name or self.user.username or "Sin nombre")

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Crea automáticamente un perfil asociado al usuario al momento de su creación.

    Args:
        sender (type): Modelo que envía la señal, en este caso User.
        instance (User): Instancia del modelo User que disparó la señal.
        created (bool): Indica si el usuario fue creado.
        **kwargs: Argumentos adicionales que no se usan en esta función.
    """
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def save_user_profile(sender, instance, **kwargs):
    """
    Guarda automáticamente el perfil asociado al usuario.

    Args:
        sender (type): Modelo que envía la señal, en este caso User.
        instance (User): Instancia del modelo User que disparó la señal.
        **kwargs: Argumentos adicionales.
    """
    instance.userprofile.save()
