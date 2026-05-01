from django.contrib import admin
from django.urls import include, path

from apps.users.urls import key_urlpatterns
from apps.users.admin_views import AdminUserListView, AdminTaskListView, AdminStatsView

admin_urlpatterns = [
    path('users/', AdminUserListView.as_view(), name='admin-users'),
    path('tasks/', AdminTaskListView.as_view(), name='admin-tasks'),
    path('stats/', AdminStatsView.as_view(), name='admin-stats'),
]

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('apps.users.urls')),
    path('api/v1/keys/', include((key_urlpatterns, 'keys'))),
    path('api/v1/tasks/', include('apps.tasks.urls')),
    path('api/v1/webhooks/', include('apps.webhooks.urls')),
    path('api/v1/analytics/', include('apps.analytics.urls')),
    path('api/v1/admin/', include((admin_urlpatterns, 'api-admin'))),
]
