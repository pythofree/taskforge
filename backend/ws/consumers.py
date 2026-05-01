import json

from channels.generic.websocket import AsyncWebsocketConsumer


class TaskConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.task_id = self.scope['url_route']['kwargs']['task_id']
        self.group_name = f'task_{self.task_id}'
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        pass

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
        }))

    async def task_completed(self, event):
        await self.send(text_data=json.dumps({
            'type': 'task.completed',
            'task_id': event['task_id'],
            'result': event.get('result'),
        }))
