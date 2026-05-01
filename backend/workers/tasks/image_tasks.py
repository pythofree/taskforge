import io
import logging

import requests
from PIL import Image

logger = logging.getLogger(__name__)


def run(payload: dict) -> dict:
    url = payload['url']
    width = int(payload['width'])
    height = int(payload['height'])

    response = requests.get(url, timeout=15)
    response.raise_for_status()

    image = Image.open(io.BytesIO(response.content))
    original_size = image.size
    image = image.resize((width, height), Image.LANCZOS)

    logger.info(f'Image resized: {original_size} -> {image.size}')
    return {
        'url': url,
        'original_size': list(original_size),
        'resized_to': [width, height],
        'format': image.format or 'UNKNOWN',
    }
