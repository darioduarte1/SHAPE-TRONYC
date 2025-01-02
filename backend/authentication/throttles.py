from rest_framework.throttling import UserRateThrottle

class ResendEmailRateThrottle(UserRateThrottle):
    scope = 'resend_email'