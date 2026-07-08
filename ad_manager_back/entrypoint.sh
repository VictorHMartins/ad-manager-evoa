#!/bin/sh
set -e

python manage.py collectstatic --noinput

exec gunicorn core.wsgi:application \
    --bind 0.0.0.0:${PORT:-8000} \
    --workers 3 \
    --worker-class gthread \
    --threads 4 \
    --timeout 120
