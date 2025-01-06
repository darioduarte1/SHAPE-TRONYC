from django.http import JsonResponse
from django.views import View

class GoogleSignupView(View):
    def get(self, request):
        return JsonResponse({"message": "Google Signup works!"})