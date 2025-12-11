#!/bin/bash
set -e  # Exit on error

echo "============================================="
echo "Starting Flood Segmentation App on Railway"
echo "============================================="

# Check if we're in the right directory
if [ ! -d "/app" ]; then
    echo "Warning: /app directory not found, using current directory"
    APP_DIR="$(pwd)"
else
    APP_DIR="/app"
fi

echo "App directory: $APP_DIR"

# Prefer virtualenv Python if present to avoid Nix system immutability
PYTHON_BIN="$APP_DIR/.venv/bin/python"
if [ ! -x "$PYTHON_BIN" ]; then
    PYTHON_BIN="$(command -v python)"
fi

# Start Backend in background
echo ""
echo "Starting FastAPI Backend on port 8000..."
cd "$APP_DIR/backend"

if [ ! -f "app/main.py" ]; then
    echo "Error: Backend main.py not found!"
    exit 1
fi

"$PYTHON_BIN" -m uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"

cd "$APP_DIR"

# Wait for backend to start
echo ""
echo "Waiting for backend to warm up..."
sleep 5

# Check if backend is still running
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "Error: Backend failed to start!"
    exit 1
fi

echo "Backend is running!"

# Start Frontend in foreground
echo ""
echo "Starting Next.js Frontend on port ${PORT:-3000}..."
PORT=${PORT:-3000} npm start
