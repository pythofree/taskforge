import logging

import requests

logger = logging.getLogger(__name__)

ALLOWED_METHODS = {'GET', 'POST', 'PUT', 'PATCH', 'DELETE'}


def run(payload: dict) -> dict:
    url = payload['url']
    method = payload['method'].upper()
    body = payload.get('payload', {})

    if method not in ALLOWED_METHODS:
        raise ValueError(f'Method {method} is not allowed.')

    response = requests.request(method, url, json=body, timeout=10)

    logger.info(f'Webhook {method} {url} -> {response.status_code}')
    return {
        'url': url,
        'method': method,
        'status_code': response.status_code,
        'response_body': response.text[:1000],
    }
