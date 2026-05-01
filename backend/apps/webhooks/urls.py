from django.urls import path

from .views import WebhookDestroyView, WebhookListCreateView

urlpatterns = [
    path('', WebhookListCreateView.as_view(), name='webhook-list-create'),
    path('<uuid:pk>/', WebhookDestroyView.as_view(), name='webhook-destroy'),
]
