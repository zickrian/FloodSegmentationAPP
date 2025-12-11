# Multi-stage build for Flood Segmentation App
# Stage 1: Build frontend
FROM node:18-alpine as frontend-builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Python backend + serve frontend
FROM python:3.11-slim

WORKDIR /app

# Install Node.js for npm (if needed for backend)
RUN apt-get update && apt-get install -y nodejs npm && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy backend requirements
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy everything
COPY . .

# Copy built frontend from stage 1
COPY --from=frontend-builder /app/.next ./.next
COPY --from=frontend-builder /app/public ./public

# Create models directory
RUN mkdir -p /app/Models

# Expose port
EXPOSE 8000

# Run FastAPI backend
CMD ["python", "-m", "uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
