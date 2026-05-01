from rest_framework import serializers

from .models import Task, TaskLog

PAYLOAD_REQUIRED_FIELDS = {
    Task.Type.EMAIL: ['to', 'subject', 'body'],
    Task.Type.SCRAPING: ['url'],
    Task.Type.REPORT: ['data_type'],
    Task.Type.IMAGE: ['url', 'width', 'height'],
    Task.Type.WEBHOOK: ['url', 'method'],
}


class TaskLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskLog
        fields = ['id', 'message', 'level', 'created_at']


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'type', 'status', 'priority',
            'payload', 'result', 'error_message', 'retry_count', 'max_retries',
            'scheduled_at', 'started_at', 'completed_at',
            'created_at', 'updated_at', 'celery_task_id',
        ]
        read_only_fields = [
            'id', 'status', 'result', 'error_message', 'retry_count',
            'started_at', 'completed_at', 'created_at', 'updated_at', 'celery_task_id',
        ]


class TaskCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['title', 'description', 'type', 'priority', 'payload', 'scheduled_at', 'max_retries']

    def validate(self, data):
        task_type = data.get('type')
        payload = data.get('payload', {})
        required = PAYLOAD_REQUIRED_FIELDS.get(task_type, [])
        missing = [f for f in required if f not in payload]
        if missing:
            raise serializers.ValidationError({
                'payload': f'Missing required fields for type "{task_type}": {", ".join(missing)}.'
            })
        return data
