from django.db.models import Count, Q
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.tasks.models import Task
from apps.tasks.serializers import TaskSerializer
from core.permissions import IsAdmin

from .models import User
from .serializers import UserSerializer


class AdminUserListView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        users = User.objects.annotate(task_count=Count('tasks')).order_by('-created_at')
        data = UserSerializer(users, many=True).data
        return Response(data)


class AdminTaskListView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        tasks = Task.objects.select_related('user').order_by('-created_at')
        return Response(TaskSerializer(tasks, many=True).data)


class AdminStatsView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        task_stats = Task.objects.aggregate(
            total=Count('id'),
            success=Count('id', filter=Q(status=Task.Status.SUCCESS)),
            failed=Count('id', filter=Q(status=Task.Status.FAILED)),
            running=Count('id', filter=Q(status=Task.Status.RUNNING)),
            queued=Count('id', filter=Q(status__in=[Task.Status.PENDING, Task.Status.QUEUED])),
            cancelled=Count('id', filter=Q(status=Task.Status.CANCELLED)),
        )
        task_stats['total_users'] = User.objects.count()
        return Response(task_stats)
