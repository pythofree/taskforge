import logging

from asgiref.sync import async_to_sync
from django.utils import timezone

from workers.celery import app

logger = logging.getLogger(__name__)

RETRY_DELAYS = [60, 300, 600]  # seconds between retries


@app.task(bind=True, name='workers.tasks.executor.execute_task')
def execute_task(self, task_id: str):
    from apps.tasks.models import Task as TaskModel

    try:
        task = TaskModel.objects.get(id=task_id)
    except TaskModel.DoesNotExist:
        logger.error(f'Task {task_id} not found in DB.')
        return

    # queued -> running
    task.status = TaskModel.Status.RUNNING
    task.started_at = timezone.now()
    task.celery_task_id = self.request.id
    task.save(update_fields=['status', 'started_at', 'celery_task_id', 'updated_at'])

    _log(task, f'Started. type={task.type} priority={task.priority}')
    _notify(task_id, 'task_status_changed', status=task.status)

    try:
        result = _run_handler(task)
    except Exception as exc:
        _handle_failure(self, task, exc)
        return

    task.status = TaskModel.Status.SUCCESS
    task.result = result
    task.completed_at = timezone.now()
    task.save(update_fields=['status', 'result', 'completed_at', 'updated_at'])

    _log(task, 'Completed successfully.')
    _notify(task_id, 'task_completed', result=result)


def _run_handler(task):
    from workers.tasks.email_tasks import run as email_run
    from workers.tasks.image_tasks import run as image_run
    from workers.tasks.report_tasks import run as report_run
    from workers.tasks.scraping_tasks import run as scraping_run
    from workers.tasks.webhook_tasks import run as webhook_run

    handlers = {
        'email': email_run,
        'scraping': scraping_run,
        'report': report_run,
        'image': image_run,
        'webhook': webhook_run,
    }
    handler = handlers.get(task.type)
    if not handler:
        raise ValueError(f'Unknown task type: {task.type}')
    return handler(task.payload)


def _handle_failure(celery_task, task, exc):
    from apps.tasks.models import Task as TaskModel

    task.retry_count += 1
    task.error_message = str(exc)

    if task.retry_count < task.max_retries:
        delay = RETRY_DELAYS[min(task.retry_count - 1, len(RETRY_DELAYS) - 1)]
        task.status = TaskModel.Status.PENDING
        task.save(update_fields=['status', 'retry_count', 'error_message', 'updated_at'])
        _log(task, f'Failed: {exc}. Retry {task.retry_count}/{task.max_retries} in {delay}s.', level='warning')
        _notify(str(task.id), 'task_status_changed', status=task.status)
        raise celery_task.retry(exc=exc, countdown=delay, max_retries=task.max_retries)
    else:
        task.status = TaskModel.Status.FAILED
        task.completed_at = timezone.now()
        task.save(update_fields=['status', 'retry_count', 'error_message', 'completed_at', 'updated_at'])
        _log(task, f'Failed permanently after {task.retry_count} attempts: {exc}', level='error')
        _notify(str(task.id), 'task_status_changed', status=task.status)


def _log(task, message, level='info'):
    from apps.tasks.models import TaskLog
    TaskLog.objects.create(task=task, message=message, level=level)
    _notify(str(task.id), 'task_log_added', message=message, level=level)


def _notify(task_id: str, event_type: str, **data):
    try:
        from channels.layers import get_channel_layer
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'task_{task_id}',
            {
                'type': event_type,
                'task_id': task_id,
                'timestamp': timezone.now().isoformat(),
                **data,
            },
        )
    except Exception as e:
        logger.warning(f'WS notify failed: {e}')
