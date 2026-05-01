from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('apps.users.urls')),
    path('api/v1/tasks/', include('apps.tasks.urls')),
    path('api/v1/webhooks/', include('apps.webhooks.urls')),
    path('api/v1/analytics/', include('apps.analytics.urls')),
]
