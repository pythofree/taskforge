import secrets

from rest_framework import serializers

from .models import Webhook, WebhookDelivery


class WebhookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Webhook
        fields = ['id', 'url', 'events', 'is_active', 'created_at']
        read_only_fields = ['id', 'is_active', 'created_at']

    def validate_events(self, value):
        valid = {e.value for e in Webhook.Event}
        invalid = set(value) - valid
        if invalid:
            raise serializers.ValidationError(f'Invalid events: {invalid}. Valid: {valid}')
        if not value:
            raise serializers.ValidationError('At least one event is required.')
        return value

    def create(self, validated_data):
        validated_data['secret'] = secrets.token_hex(32)
        return super().create(validated_data)


class WebhookDetailSerializer(WebhookSerializer):
    class Meta(WebhookSerializer.Meta):
        fields = WebhookSerializer.Meta.fields + ['secret']


class WebhookDeliverySerializer(serializers.ModelSerializer):
    class Meta:
        model = WebhookDelivery
        fields = ['id', 'event', 'status_code', 'is_success', 'attempt_count', 'created_at']
