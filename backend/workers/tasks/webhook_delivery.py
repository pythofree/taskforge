import json
import logging

import requests

from workers.celery import app

logger = logging.getLogger(__name__)


@app.task(name='workers.tasks.webhook_delivery.deliver_webhooks', bind=True, max_retries=3)
def deliver_webhooks(self, task_id: str, event: str):
    """Find all active webhooks for this event and deliver to each."""
    from apps.tasks.models import Task
    from apps.webhooks.models import Webhook

    try:
        task = Task.objects.select_related('user').get(id=task_id)
    except Task.DoesNotExist:
        return

    webhooks = Webhook.objects.filter(
        user=task.user,
        is_active=True,
    )

    payload = {
        'event': event,
        'task': {
            'id': str(task.id),
            'title': task.title,
            'type': task.type,
            'status': task.status,
            'result': task.result,
            'error_message': task.error_message,
        },
    }

    for webhook in webhooks:
        if event not in webhook.events:
            continue
        _deliver_single(webhook, task, event, payload)


def _deliver_single(webhook, task, event: str, payload: dict):
    from apps.webhooks.models import WebhookDelivery

    delivery = WebhookDelivery.objects.create(
        webhook=webhook,
        task=task,
        event=event,
        payload=payload,
    )

    signature = webhook.sign_payload(payload)
    body = json.dumps(payload, separators=(',', ':'))

    for attempt in range(1, 4):
        delivery.attempt_count = attempt
        try:
            response = requests.post(
                webhook.url,
                data=body,
                headers={
                    'Content-Type': 'application/json',
                    'X-Webhook-Signature': signature,
                    'X-Webhook-Event': event,
                },
                timeout=10,
            )
            delivery.status_code = response.status_code
            delivery.response_body = response.text[:1000]
            delivery.is_success = response.ok
            delivery.save()

            if response.ok:
                logger.info(f'Webhook delivered to {webhook.url}: {response.status_code}')
                return
        except Exception as e:
            logger.warning(f'Webhook delivery attempt {attempt} failed: {e}')
            delivery.response_body = str(e)
            delivery.save()

    logger.error(f'Webhook delivery failed after 3 attempts: {webhook.url}')
