from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import UserProfile
from .serializers import UserProfileSerializer


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile = UserProfile.objects.get(
                user=request.user
            )  # pylint: disable=no-member
            serializer = UserProfileSerializer(profile)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:  # pylint: disable=no-member
            return Response({"error": "Profile not found"}, status=404)

    def put(self, request):
        try:
            profile = UserProfile.objects.get(
                user=request.user
            )  # pylint: disable=no-member
            serializer = UserProfileSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=400)
        except UserProfile.DoesNotExist:  # pylint: disable=no-member
            return Response({"error": "Profile not found"}, status=404)
