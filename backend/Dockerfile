# Use an official lightweight Python image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies required for OpenCV and Albumentations
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements from backend directory (assuming root context)
COPY backend/requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the backend code into /app
COPY backend/ .

# Copy the Models directory to /Models
# The application logic looks for models at ../../Models relative to app/main.py
# inside the container: /app/app/main.py -> ../../Models resolves to /Models
COPY Models /Models

# Expose default port (Render overrides with $PORT env var)
EXPOSE 8000

# Start the application using shell form to allow $PORT expansion
# Render provides PORT env var, fallback to 8000 for local development
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
