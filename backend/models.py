from django.db import models

class Product(models.Model):
    name = models.CharField(max_length=255)  # Nombre del producto
    description = models.TextField(blank=True, null=True)  # Descripción opcional
    price = models.DecimalField(max_digits=10, decimal_places=2)  # Precio
    created_at = models.DateTimeField(auto_now_add=True)  # Fecha de creación
    updated_at = models.DateTimeField(auto_now=True)  # Última actualización

    def __str__(self):
        return self.name
