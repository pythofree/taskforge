import pytest
from unittest.mock import patch


@pytest.mark.django_db
class TestTaskCRUD:
    def test_create_task(self, auth_client):
        with patch('workers.dispatch.dispatch_task'):
            res = auth_client.post('/api/v1/tasks/', {
                'title': 'My Scrape',
                'type': 'scraping',
                'priority': 'normal',
                'payload': {'url': 'https://python.org', 'depth': 1},
            }, format='json')
        assert res.status_code == 201
        assert res.data['status'] == 'pending'
        assert res.data['type'] == 'scraping'

    def test_create_task_invalid_payload(self, auth_client):
        res = auth_client.post('/api/v1/tasks/', {
            'title': 'Bad Email',
            'type': 'email',
            'payload': {'to': 'x@x.com'},  # missing subject and body
        }, format='json')
        assert res.status_code == 400

    def test_list_tasks_filtered_by_user(self, auth_client, task, admin_user, api_client):
        from rest_framework_simplejwt.tokens import RefreshToken
        api_client.cookies['access_token'] = str(RefreshToken.for_user(admin_user).access_token)
        # admin creates own task
        with patch('workers.dispatch.dispatch_task'):
            api_client.post('/api/v1/tasks/', {
                'title': 'Admin task',
                'type': 'scraping',
                'payload': {'url': 'https://x.com', 'depth': 1},
            }, format='json')
        # user sees only own tasks
        res = auth_client.get('/api/v1/tasks/')
        assert res.status_code == 200
        for t in res.data['results']:
            assert t['type'] == task.type  # only user's tasks

    def test_filter_by_status(self, auth_client, task):
        res = auth_client.get('/api/v1/tasks/?status=pending')
        assert res.status_code == 200
        for t in res.data['results']:
            assert t['status'] == 'pending'

    def test_cancel_pending_task(self, auth_client, task):
        res = auth_client.post(f'/api/v1/tasks/{task.id}/cancel/')
        assert res.status_code == 200
        assert res.data['status'] == 'cancelled'

    def test_cancel_non_pending_task(self, auth_client, task):
        from apps.tasks.models import Task
        task.status = Task.Status.RUNNING
        task.save()
        res = auth_client.post(f'/api/v1/tasks/{task.id}/cancel/')
        assert res.status_code == 400

    def test_retry_failed_task(self, auth_client, task):
        from apps.tasks.models import Task
        task.status = Task.Status.FAILED
        task.save()
        with patch('workers.dispatch.dispatch_task'):
            res = auth_client.post(f'/api/v1/tasks/{task.id}/retry/')
        assert res.status_code == 200
        assert res.data['status'] == 'pending'

    def test_get_task_logs(self, auth_client, task):
        from apps.tasks.models import TaskLog
        TaskLog.objects.create(task=task, message='Started', level='info')
        res = auth_client.get(f'/api/v1/tasks/{task.id}/logs/')
        assert res.status_code == 200
        assert len(res.data) == 1
        assert res.data[0]['message'] == 'Started'

    def test_task_not_visible_to_other_user(self, api_client, task):
        from apps.users.models import User
        from rest_framework_simplejwt.tokens import RefreshToken
        other = User.objects.create_user(email='other@test.com', password='pass12345')
        api_client.cookies['access_token'] = str(RefreshToken.for_user(other).access_token)
        res = api_client.get(f'/api/v1/tasks/{task.id}/')
        assert res.status_code == 404
