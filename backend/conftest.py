import pytest
from rest_framework.test import APIClient


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user(db):
    from apps.users.models import User
    return User.objects.create_user(email='user@test.com', password='testpass123', name='Test User')


@pytest.fixture
def admin_user(db):
    from apps.users.models import User
    return User.objects.create_superuser(email='admin@test.com', password='adminpass123', name='Admin')


@pytest.fixture
def auth_client(api_client, user):
    from rest_framework_simplejwt.tokens import RefreshToken
    refresh = RefreshToken.for_user(user)
    api_client.cookies['access_token'] = str(refresh.access_token)
    return api_client


@pytest.fixture
def admin_client(api_client, admin_user):
    from rest_framework_simplejwt.tokens import RefreshToken
    refresh = RefreshToken.for_user(admin_user)
    api_client.cookies['access_token'] = str(refresh.access_token)
    return api_client


@pytest.fixture
def task(db, user):
    from apps.tasks.models import Task
    return Task.objects.create(
        user=user,
        title='Test Task',
        type=Task.Type.SCRAPING,
        priority=Task.Priority.NORMAL,
        payload={'url': 'https://python.org', 'depth': 1},
    )
