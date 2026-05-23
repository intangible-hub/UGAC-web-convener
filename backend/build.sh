#!/usr/bin/env bash
# build.sh — Render build script for the Django backend.

set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate
python seed.py
