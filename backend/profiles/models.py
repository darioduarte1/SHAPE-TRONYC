from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class UserProfile(models.Model):
    """
    Modelo para extender la funcionalidad del usuario con datos adicionales.
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
        upload_to='profile_pictures/', null=True, blank=True)
    contact_number = models.CharField(max_length=15, null=True, blank=True)

    def __str__(self):
        return str(self.full_name if self.full_name else self.user.username)  # pylint: disable=no-member


# Señales para crear y guardar automáticamente el perfil de usuario
@receiver(post_save, sender=User)
def create_user_profile(_sender, instance, created, **_kwargs):
    """
    Crea automáticamente un perfil asociado al usuario al momento de su creación.
    """
    if created:
        UserProfile.objects.create(user=instance)  # pylint: disable=no-member


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """
    Guarda automáticamente el perfil asociado al usuario.
    """
    instance.userprofile.save()
