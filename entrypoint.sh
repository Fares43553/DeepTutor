#!/bin/bash

echo "Starting DeepTutor..."

# تشغيل الباك إند
uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
