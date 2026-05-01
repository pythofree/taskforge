from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .filters import TaskFilter
from .models import Task
from .serializers import TaskCreateSerializer, TaskLogSerializer, TaskSerializer


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    filterset_class = TaskFilter
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'updated_at', 'priority', 'status']
    ordering = ['-created_at']
    http_method_names = ['get', 'post', 'delete', 'head', 'options']

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Task.objects.select_related('user').all()
        return Task.objects.filter(user=user)

    def get_serializer_class(self):
        if self.action == 'create':
            return TaskCreateSerializer
        return TaskSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        task = serializer.save(user=request.user)
        from workers.dispatch import dispatch_task
        dispatch_task(task)
        return Response(TaskSerializer(task).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        task = self.get_object()
        if task.status != Task.Status.PENDING:
            return Response(
                {'error': 'Only pending tasks can be cancelled.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        task.status = Task.Status.CANCELLED
        task.save(update_fields=['status', 'updated_at'])
        return Response(TaskSerializer(task).data)

    @action(detail=True, methods=['post'])
    def retry(self, request, pk=None):
        task = self.get_object()
        if task.status != Task.Status.FAILED:
            return Response(
                {'error': 'Only failed tasks can be retried.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        task.status = Task.Status.PENDING
        task.retry_count = 0
        task.error_message = ''
        task.result = None
        task.save(update_fields=['status', 'retry_count', 'error_message', 'result', 'updated_at'])
        from workers.dispatch import dispatch_task
        dispatch_task(task)
        return Response(TaskSerializer(task).data)

    @action(detail=True, methods=['get'])
    def logs(self, request, pk=None):
        task = self.get_object()
        return Response(TaskLogSerializer(task.logs.all(), many=True).data)
