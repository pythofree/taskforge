from django.utils import timezone


def dispatch_task(task):
    """Enqueue a Task instance to the appropriate Celery queue."""
    from apps.tasks.models import Task as TaskModel
    from workers.tasks.executor import execute_task

    kwargs = dict(
        args=[str(task.id)],
        queue=task.queue_name,
    )

    if task.scheduled_at and task.scheduled_at > timezone.now():
        kwargs['eta'] = task.scheduled_at

    async_result = execute_task.apply_async(**kwargs)

    task.status = TaskModel.Status.QUEUED
    task.celery_task_id = async_result.id
    task.save(update_fields=['status', 'celery_task_id', 'updated_at'])
