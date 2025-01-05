from rest_framework.views import APIView
from django.http import JsonResponse

class GoogleSignupView(APIView):
    def get(self, request):
        return JsonResponse({"message": "Google Signup View is working"}, status=200)
    
class GoogleSignupCallbackView(APIView):
    def get(self, request):
        return JsonResponse({"message": "Google Signup Callback View is working"}, status=200)