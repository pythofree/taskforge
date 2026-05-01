from django.utils import timezone
from rest_framework import authentication, exceptions
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import TokenError


class CookieJWTAuthentication(JWTAuthentication):
    """Reads JWT from httpOnly cookie, falls back to Authorization header."""

    def authenticate(self, request):
        raw_token = request.COOKIES.get('access_token')
        if raw_token is None:
            return super().authenticate(request)
        try:
            validated_token = self.get_validated_token(raw_token)
        except TokenError:
            return None
        return self.get_user(validated_token), validated_token


class ApiKeyAuthentication(authentication.BaseAuthentication):
    """Authenticates via X-API-Key header."""

    def authenticate(self, request):
        raw_key = request.META.get('HTTP_X_API_KEY')
        if not raw_key:
            return None

        from apps.users.models import ApiKey
        api_key = ApiKey.authenticate(raw_key)
        if api_key is None:
            raise exceptions.AuthenticationFailed('Invalid or inactive API key.')

        ApiKey.objects.filter(pk=api_key.pk).update(last_used_at=timezone.now())
        return api_key.user, api_key
