import uuid

from django.conf import settings
from django.db import models


class Task(models.Model):
    class Type(models.TextChoices):
        EMAIL = 'email', 'Email'
        SCRAPING = 'scraping', 'Scraping'
        REPORT = 'report', 'Report'
        IMAGE = 'image', 'Image'
        WEBHOOK = 'webhook', 'Webhook'

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        QUEUED = 'queued', 'Queued'
        RUNNING = 'running', 'Running'
        SUCCESS = 'success', 'Success'
        FAILED = 'failed', 'Failed'
        CANCELLED = 'cancelled', 'Cancelled'

    class Priority(models.TextChoices):
        LOW = 'low', 'Low'
        NORMAL = 'normal', 'Normal'
        HIGH = 'high', 'High'
        CRITICAL = 'critical', 'Critical'

    PRIORITY_QUEUE_MAP = {
        Priority.LOW: 'low_queue',
        Priority.NORMAL: 'normal_queue',
        Priority.HIGH: 'high_queue',
        Priority.CRITICAL: 'critical_queue',
    }

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='tasks',
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    type = models.CharField(max_length=20, choices=Type.choices)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    priority = models.CharField(max_length=10, choices=Priority.choices, default=Priority.NORMAL)
    payload = models.JSONField(default=dict)
    result = models.JSONField(null=True, blank=True)
    error_message = models.TextField(blank=True)
    retry_count = models.PositiveSmallIntegerField(default=0)
    max_retries = models.PositiveSmallIntegerField(default=3)
    scheduled_at = models.DateTimeField(null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    celery_task_id = models.CharField(max_length=255, blank=True)

    class Meta:
        db_table = 'tasks'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['status', 'priority']),
            models.Index(fields=['scheduled_at']),
        ]

    def __str__(self):
        return f'{self.title} [{self.type}] — {self.status}'

    @property
    def queue_name(self):
        return self.PRIORITY_QUEUE_MAP.get(self.priority, 'normal_queue')


class TaskLog(models.Model):
    class Level(models.TextChoices):
        INFO = 'info', 'Info'
        WARNING = 'warning', 'Warning'
        ERROR = 'error', 'Error'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='logs')
    message = models.TextField()
    level = models.CharField(max_length=10, choices=Level.choices, default=Level.INFO)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'task_logs'
        ordering = ['created_at']

    def __str__(self):
        return f'[{self.level}] {self.task_id} — {self.message[:50]}'
