#!/bin/bash

# Resolve project root to locate the virtualenv created during build
PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
PYTHON_BIN="${PROJECT_ROOT}/.venv/bin/python"

# Fallback to system python if the virtualenv is missing
if [ ! -x "$PYTHON_BIN" ]; then
  PYTHON_BIN="$(command -v python)"
fi

# Start Backend in background using the chosen interpreter
echo "Starting FastAPI Backend on port 8000..."
cd backend
"$PYTHON_BIN" -m uvicorn app.main:app --host 0.0.0.0 --port 8000 &
cd ..

# Wait a few seconds for backend to warm up
sleep 5

# Start Frontend in foreground
echo "Starting Next.js Frontend on port ${PORT:-3000}..."
npm start

