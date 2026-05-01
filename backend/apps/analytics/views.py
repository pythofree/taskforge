from django.db.models import Avg, Count, ExpressionWrapper, F, FloatField, Q
from django.db.models.functions import TruncDate
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.tasks.models import Task


class SummaryView(APIView):
    def get(self, request):
        user = request.user
        qs = Task.objects.all() if user.role == 'admin' else Task.objects.filter(user=user)

        data = qs.aggregate(
            total=Count('id'),
            success=Count('id', filter=Q(status=Task.Status.SUCCESS)),
            failed=Count('id', filter=Q(status=Task.Status.FAILED)),
            running=Count('id', filter=Q(status=Task.Status.RUNNING)),
            queued=Count('id', filter=Q(status__in=[Task.Status.PENDING, Task.Status.QUEUED])),
            cancelled=Count('id', filter=Q(status=Task.Status.CANCELLED)),
        )
        return Response(data)


class ByTypeView(APIView):
    def get(self, request):
        user = request.user
        qs = Task.objects.all() if user.role == 'admin' else Task.objects.filter(user=user)

        data = (
            qs.values('type')
            .annotate(
                total=Count('id'),
                success=Count('id', filter=Q(status=Task.Status.SUCCESS)),
                failed=Count('id', filter=Q(status=Task.Status.FAILED)),
            )
            .order_by('type')
        )
        return Response(list(data))


class ByDayView(APIView):
    def get(self, request):
        user = request.user
        since = timezone.now() - timezone.timedelta(days=30)
        qs = Task.objects.all() if user.role == 'admin' else Task.objects.filter(user=user)

        data = (
            qs.filter(created_at__gte=since)
            .annotate(day=TruncDate('created_at'))
            .values('day')
            .annotate(
                total=Count('id'),
                success=Count('id', filter=Q(status=Task.Status.SUCCESS)),
                failed=Count('id', filter=Q(status=Task.Status.FAILED)),
            )
            .order_by('day')
        )
        return Response(list(data))


class PerformanceView(APIView):
    def get(self, request):
        user = request.user
        qs = Task.objects.filter(
            status=Task.Status.SUCCESS,
            started_at__isnull=False,
            completed_at__isnull=False,
        )
        if user.role != 'admin':
            qs = qs.filter(user=user)

        avg_duration = (
            qs.annotate(
                duration=ExpressionWrapper(
                    F('completed_at') - F('started_at'),
                    output_field=FloatField(),
                )
            )
            .values('type')
            .annotate(avg_seconds=Avg('duration'))
            .order_by('type')
        )

        top_errors = (
            Task.objects.filter(status=Task.Status.FAILED)
            .exclude(error_message='')
            .values('error_message')
            .annotate(count=Count('id'))
            .order_by('-count')[:5]
        )

        return Response({
            'avg_duration_by_type': [
                {
                    'type': row['type'],
                    'avg_seconds': round(row['avg_seconds'] / 1e6, 2) if row['avg_seconds'] else 0,
                }
                for row in avg_duration
            ],
            'top_errors': list(top_errors),
        })
