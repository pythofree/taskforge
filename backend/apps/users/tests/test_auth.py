import pytest


@pytest.mark.django_db
class TestRegister:
    def test_register_success(self, api_client):
        res = api_client.post('/api/v1/auth/register/', {
            'email': 'new@test.com',
            'password': 'strongpass1',
            'name': 'New User',
        }, format='json')
        assert res.status_code == 201
        assert res.data['email'] == 'new@test.com'
        assert res.data['role'] == 'user'
        assert 'access_token' in res.cookies

    def test_register_duplicate_email(self, api_client, user):
        res = api_client.post('/api/v1/auth/register/', {
            'email': user.email,
            'password': 'strongpass1',
        }, format='json')
        assert res.status_code == 400

    def test_register_weak_password(self, api_client):
        res = api_client.post('/api/v1/auth/register/', {
            'email': 'weak@test.com',
            'password': '123',
        }, format='json')
        assert res.status_code == 400


@pytest.mark.django_db
class TestLogin:
    def test_login_success(self, api_client, user):
        res = api_client.post('/api/v1/auth/login/', {
            'email': user.email,
            'password': 'testpass123',
        }, format='json')
        assert res.status_code == 200
        assert 'access_token' in res.cookies
        assert 'refresh_token' in res.cookies

    def test_login_wrong_password(self, api_client, user):
        res = api_client.post('/api/v1/auth/login/', {
            'email': user.email,
            'password': 'wrongpassword',
        }, format='json')
        assert res.status_code == 400

    def test_me_authenticated(self, auth_client, user):
        res = auth_client.get('/api/v1/auth/me/')
        assert res.status_code == 200
        assert res.data['email'] == user.email

    def test_me_unauthenticated(self, api_client):
        res = api_client.get('/api/v1/auth/me/')
        assert res.status_code == 401

    def test_logout_clears_cookies(self, auth_client):
        res = auth_client.post('/api/v1/auth/logout/')
        assert res.status_code == 204


@pytest.mark.django_db
class TestApiKeys:
    def test_create_api_key(self, auth_client):
        res = auth_client.post('/api/v1/keys/', {'name': 'production'}, format='json')
        assert res.status_code == 201
        assert 'key' in res.data
        assert len(res.data['key']) == 64

    def test_list_api_keys(self, auth_client):
        auth_client.post('/api/v1/keys/', {'name': 'k1'}, format='json')
        auth_client.post('/api/v1/keys/', {'name': 'k2'}, format='json')
        res = auth_client.get('/api/v1/keys/')
        assert res.status_code == 200
        assert len(res.data) == 2

    def test_api_key_auth(self, api_client, user):
        from apps.users.models import ApiKey
        api_key = ApiKey.generate(user=user, name='test')
        api_client.credentials(HTTP_X_API_KEY=api_key._raw_key)
        res = api_client.get('/api/v1/auth/me/')
        assert res.status_code == 200
