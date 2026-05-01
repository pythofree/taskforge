from rest_framework.throttling import AnonRateThrottle, UserRateThrottle


class AnonThrottle(AnonRateThrottle):
    rate = '20/min'


class AuthThrottle(UserRateThrottle):
    rate = '100/min'


class AdminThrottle(UserRateThrottle):
    rate = '10000/min'

    def allow_request(self, request, view):
        if request.user.is_authenticated and request.user.role == 'admin':
            return True
        return super().allow_request(request, view)
