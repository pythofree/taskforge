import logging

from django.core.mail import send_mail

logger = logging.getLogger(__name__)


def run(payload: dict) -> dict:
    to = payload['to']
    subject = payload['subject']
    body = payload['body']

    send_mail(
        subject=subject,
        message=body,
        from_email='noreply@taskforge.io',
        recipient_list=[to],
        fail_silently=False,
    )
    logger.info(f'Email sent to {to}')
    return {'sent_to': to, 'subject': subject}
