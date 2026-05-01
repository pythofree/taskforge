import hashlib
import hmac
import json
import uuid

from django.conf import settings
from django.db import models


class Webhook(models.Model):
    class Event(models.TextChoices):
        TASK_COMPLETED = 'task.completed', 'Task Completed'
        TASK_FAILED = 'task.failed', 'Task Failed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='webhooks'
    )
    url = models.URLField(max_length=500)
    events = models.JSONField(default=list)
    secret = models.CharField(max_length=64)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'webhooks'

    def __str__(self):
        return f'{self.url} ({", ".join(self.events)})'

    def sign_payload(self, payload: dict) -> str:
        body = json.dumps(payload, separators=(',', ':'))
        return hmac.new(
            self.secret.encode(),
            body.encode(),
            hashlib.sha256,
        ).hexdigest()


class WebhookDelivery(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    webhook = models.ForeignKey(Webhook, on_delete=models.CASCADE, related_name='deliveries')
    task = models.ForeignKey(
        'tasks.Task', on_delete=models.SET_NULL, null=True, related_name='webhook_deliveries'
    )
    event = models.CharField(max_length=30)
    payload = models.JSONField()
    status_code = models.IntegerField(null=True, blank=True)
    response_body = models.TextField(blank=True)
    attempt_count = models.PositiveSmallIntegerField(default=0)
    is_success = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'webhook_deliveries'
        ordering = ['-created_at']
