from django.conf import settings
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import ApiKey
from .serializers import (
    ApiKeyCreateSerializer,
    ApiKeySerializer,
    ChangePasswordSerializer,
    LoginSerializer,
    RegisterSerializer,
    UserSerializer,
)


def _set_auth_cookies(response, access_token, refresh_token):
    jwt = settings.SIMPLE_JWT
    cookie_kwargs = dict(
        httponly=jwt['AUTH_COOKIE_HTTP_ONLY'],
        secure=jwt['AUTH_COOKIE_SECURE'],
        samesite=jwt['AUTH_COOKIE_SAMESITE'],
    )
    response.set_cookie(
        key=jwt['AUTH_COOKIE'],
        value=str(access_token),
        max_age=int(jwt['ACCESS_TOKEN_LIFETIME'].total_seconds()),
        **cookie_kwargs,
    )
    response.set_cookie(
        key=jwt['AUTH_COOKIE_REFRESH'],
        value=str(refresh_token),
        max_age=int(jwt['REFRESH_TOKEN_LIFETIME'].total_seconds()),
        **cookie_kwargs,
    )


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        response = Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        _set_auth_cookies(response, refresh.access_token, refresh)
        return response


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        response = Response(UserSerializer(user).data)
        _set_auth_cookies(response, refresh.access_token, refresh)
        return response


class LogoutView(APIView):
    def post(self, request):
        response = Response(status=status.HTTP_204_NO_CONTENT)
        response.delete_cookie(settings.SIMPLE_JWT['AUTH_COOKIE'])
        response.delete_cookie(settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'])
        return response


class RefreshView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        raw_refresh = request.COOKIES.get(settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'])
        if not raw_refresh:
            return Response(
                {'error': 'Refresh token not provided.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        try:
            refresh = RefreshToken(raw_refresh)
            response = Response({'detail': 'Token refreshed.'})
            _set_auth_cookies(response, refresh.access_token, refresh)
            return response
        except Exception:
            return Response(
                {'error': 'Invalid or expired refresh token.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        if 'old_password' in request.data:
            serializer = ChangePasswordSerializer(
                data=request.data, context={'request': request}
            )
            serializer.is_valid(raise_exception=True)
            request.user.set_password(serializer.validated_data['new_password'])
            request.user.save()
            return Response({'detail': 'Password updated.'})
        return super().update(request, *args, partial=True, **kwargs)


class ApiKeyListCreateView(APIView):
    def get(self, request):
        keys = ApiKey.objects.filter(user=request.user)
        return Response(ApiKeySerializer(keys, many=True).data)

    def post(self, request):
        serializer = ApiKeyCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        api_key = ApiKey.generate(user=request.user, name=serializer.validated_data['name'])
        data = ApiKeySerializer(api_key).data
        data['key'] = api_key._raw_key  # shown only once at creation
        return Response(data, status=status.HTTP_201_CREATED)


class ApiKeyDestroyView(APIView):
    def delete(self, request, pk):
        try:
            api_key = ApiKey.objects.get(pk=pk, user=request.user)
        except ApiKey.DoesNotExist:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        api_key.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
