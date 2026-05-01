import logging

from django.utils import timezone

from workers.celery import app

logger = logging.getLogger(__name__)


@app.task(name='workers.tasks.maintenance.cleanup_old_logs')
def cleanup_old_logs():
    from apps.tasks.models import TaskLog
    cutoff = timezone.now() - timezone.timedelta(days=30)
    deleted, _ = TaskLog.objects.filter(created_at__lt=cutoff).delete()
    logger.info(f'Cleaned up {deleted} old task logs.')
    return {'deleted': deleted}


@app.task(name='workers.tasks.maintenance.aggregate_stats')
def aggregate_stats():
    from django.db.models import Count, Q
    from apps.tasks.models import Task

    stats = Task.objects.aggregate(
        total=Count('id'),
        success=Count('id', filter=Q(status=Task.Status.SUCCESS)),
        failed=Count('id', filter=Q(status=Task.Status.FAILED)),
        running=Count('id', filter=Q(status=Task.Status.RUNNING)),
    )
    logger.info(f'Stats aggregated: {stats}')
    return stats
