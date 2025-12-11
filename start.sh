#!/bin/bash

# Start Backend in background
echo "Starting FastAPI Backend on port 8000..."
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 &
cd ..

# Wait a few seconds for backend to warm up
sleep 5

# Start Frontend in foreground
echo "Starting Next.js Frontend on port ${PORT:-3000}..."
npm start
