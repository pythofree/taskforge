import csv
import io
import logging

logger = logging.getLogger(__name__)


def run(payload: dict) -> dict:
    data_type = payload['data_type']
    filters = payload.get('filters', {})

    rows = _fetch_data(data_type, filters)

    buf = io.StringIO()
    writer = csv.DictWriter(buf, fieldnames=rows[0].keys() if rows else ['id', 'value'])
    writer.writeheader()
    writer.writerows(rows)
    csv_content = buf.getvalue()

    logger.info(f'Report generated: data_type={data_type}, rows={len(rows)}')
    return {'data_type': data_type, 'rows': len(rows), 'csv_preview': csv_content[:500]}


def _fetch_data(data_type: str, filters: dict) -> list:
    from apps.tasks.models import Task

    if data_type == 'tasks':
        qs = Task.objects.all()
        if status := filters.get('status'):
            qs = qs.filter(status=status)
        return [
            {'id': str(t.id), 'title': t.title, 'type': t.type, 'status': t.status}
            for t in qs[:100]
        ]
    return [{'id': 1, 'value': f'Sample {data_type} data'}]
