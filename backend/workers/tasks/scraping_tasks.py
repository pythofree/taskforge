import logging

import requests
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)


def run(payload: dict) -> dict:
    url = payload['url']
    depth = int(payload.get('depth', 1))

    response = requests.get(url, timeout=10)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, 'html.parser')
    title = soup.title.string.strip() if soup.title else 'No title'
    headings = [h.get_text(strip=True) for h in soup.find_all(['h1', 'h2', 'h3'])[:depth * 5]]

    logger.info(f'Scraped {url}: {title}')
    return {'url': url, 'title': title, 'headings': headings}
