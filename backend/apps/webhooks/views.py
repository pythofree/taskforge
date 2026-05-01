from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Webhook
from .serializers import WebhookDetailSerializer, WebhookSerializer


class WebhookListCreateView(APIView):
    def get(self, request):
        webhooks = Webhook.objects.filter(user=request.user)
        return Response(WebhookSerializer(webhooks, many=True).data)

    def post(self, request):
        serializer = WebhookSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        webhook = serializer.save(user=request.user)
        return Response(WebhookDetailSerializer(webhook).data, status=status.HTTP_201_CREATED)


class WebhookDestroyView(APIView):
    def delete(self, request, pk):
        try:
            webhook = Webhook.objects.get(pk=pk, user=request.user)
        except Webhook.DoesNotExist:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        webhook.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
