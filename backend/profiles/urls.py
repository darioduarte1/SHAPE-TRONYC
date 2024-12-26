from django.urls import path
from .views import ProfileView

urlpatterns = [
    path('profiles/<int:user_id>/', ProfileView.as_view(), name='profile-detail'),
]
