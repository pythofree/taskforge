import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer


class TaskConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.task_id = self.scope['url_route']['kwargs']['task_id']
        self.group_name = f'task_{self.task_id}'

        user = self.scope.get('user')
        if not user or not user.is_authenticated:
            await self.close(code=4001)
            return

        task = await self._get_task()
        if task is None:
            await self.close(code=4004)
            return

        if user.role != 'admin' and str(task.user_id) != str(user.id):
            await self.close(code=4003)
            return

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        # Send current task state immediately on connect
        await self.send(text_data=json.dumps({
            'type': 'task.status_changed',
            'task_id': self.task_id,
            'status': task.status,
            'timestamp': task.updated_at.isoformat(),
        }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        pass  # client → server messages not needed

    async def task_status_changed(self, event):
        await self.send(text_data=json.dumps({
            'type': 'task.status_changed',
            'task_id': event['task_id'],
            'status': event['status'],
            'timestamp': event['timestamp'],
        }))

    async def task_log_added(self, event):
        await self.send(text_data=json.dumps({
            'type': 'task.log_added',
            'task_id': event['task_id'],
            'message': event['message'],
            'level': event['level'],
            'timestamp': event['timestamp'],
        }))

    async def task_completed(self, event):
        await self.send(text_data=json.dumps({
            'type': 'task.completed',
            'task_id': event['task_id'],
            'result': event.get('result'),
            'timestamp': event['timestamp'],
        }))

    @database_sync_to_async
    def _get_task(self):
        from apps.tasks.models import Task
        try:
            return Task.objects.select_related('user').get(id=self.task_id)
        except Task.DoesNotExist:
            return None
