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

# Create Models directory if it doesn't exist
MODEL_DIR="$APP_DIR/Models"
mkdir -p "$MODEL_DIR"

# Download model files from Railway Buckets if not present
echo ""
echo "Checking model files..."

# Check if models exist locally
MODEL_UNET="$MODEL_DIR/unet_baseline_best.pth"
MODEL_UNETPP="$MODEL_DIR/unetplus.pth"

if [ -f "$MODEL_UNET" ] && [ -f "$MODEL_UNETPP" ]; then
    echo "✅ Model files found locally"
else
    echo "⚠️  Model files not found locally, downloading from Railway Buckets..."
    
    # Railway Bucket Configuration (from environment or defaults)
    RAILWAY_BUCKET_NAME="${RAILWAY_BUCKET_NAME:-neat-gyoza-bevw8k9fvmbjyz}"
    
    # Method 1: Railway CLI (Preferred)
    if command -v railway >/dev/null 2>&1; then
        echo "Using Railway CLI to download from bucket: $RAILWAY_BUCKET_NAME"
        
        if [ ! -f "$MODEL_UNET" ]; then
            echo "Downloading UNet model..."
            railway bucket download "$RAILWAY_BUCKET_NAME" unet_baseline_best.pth -o "$MODEL_UNET" || {
                echo "❌ Failed to download UNet model via Railway CLI"
                exit 1
            }
            echo "✅ UNet model downloaded ($(du -h "$MODEL_UNET" 2>/dev/null | cut -f1 || echo 'N/A'))"
        fi
        
        if [ ! -f "$MODEL_UNETPP" ]; then
            echo "Downloading UNet++ model..."
            railway bucket download "$RAILWAY_BUCKET_NAME" unetplus.pth -o "$MODEL_UNETPP" || {
                echo "❌ Failed to download UNet++ model via Railway CLI"
                exit 1
            }
            echo "✅ UNet++ model downloaded ($(du -h "$MODEL_UNETPP" 2>/dev/null | cut -f1 || echo 'N/A'))"
        fi
    
    # Method 2: Direct URLs (if provided)
    elif [ -n "$MODEL_URL_UNET" ] && [ -n "$MODEL_URL_UNETPP" ] && command -v curl >/dev/null 2>&1; then
        echo "Downloading models from Railway Bucket URLs..."
        
        if [ ! -f "$MODEL_UNET" ]; then
            echo "Downloading UNet model from: $MODEL_URL_UNET"
            curl -fsSL --max-time 1800 "$MODEL_URL_UNET" -o "$MODEL_UNET" || {
                echo "❌ Failed to download UNet model from $MODEL_URL_UNET"
                exit 1
            }
            echo "✅ UNet model downloaded ($(du -h "$MODEL_UNET" 2>/dev/null | cut -f1 || echo 'N/A'))"
        fi
        
        if [ ! -f "$MODEL_UNETPP" ]; then
            echo "Downloading UNet++ model from: $MODEL_URL_UNETPP"
            curl -fsSL --max-time 1800 "$MODEL_URL_UNETPP" -o "$MODEL_UNETPP" || {
                echo "❌ Failed to download UNet++ model from $MODEL_URL_UNETPP"
                exit 1
            }
            echo "✅ UNet++ model downloaded ($(du -h "$MODEL_UNETPP" 2>/dev/null | cut -f1 || echo 'N/A'))"
        fi
    
    # Method 3: AWS CLI / S3 API (if credentials provided)
    elif [ -n "$RAILWAY_ACCESS_KEY_ID" ] && [ -n "$RAILWAY_SECRET_ACCESS_KEY" ] && command -v aws >/dev/null 2>&1; then
        echo "Using AWS CLI to download from Railway Bucket..."
        export AWS_ACCESS_KEY_ID="$RAILWAY_ACCESS_KEY_ID"
        export AWS_SECRET_ACCESS_KEY="$RAILWAY_SECRET_ACCESS_KEY"
        export AWS_ENDPOINT_URL="https://storage.railway.app"
        
        if [ ! -f "$MODEL_UNET" ]; then
            aws s3 cp "s3://$RAILWAY_BUCKET_NAME/unet_baseline_best.pth" "$MODEL_UNET" --endpoint-url="$AWS_ENDPOINT_URL" || exit 1
            echo "✅ UNet model downloaded"
        fi
        
        if [ ! -f "$MODEL_UNETPP" ]; then
            aws s3 cp "s3://$RAILWAY_BUCKET_NAME/unetplus.pth" "$MODEL_UNETPP" --endpoint-url="$AWS_ENDPOINT_URL" || exit 1
            echo "✅ UNet++ model downloaded"
        fi
    
    else
        echo "❌ ERROR: Model files not found and no download method available!"
        echo ""
        echo "   Available methods:"
        echo "   1. Railway CLI: Install with 'npm i -g @railway/cli' and set RAILWAY_BUCKET_NAME"
        echo "   2. Direct URLs: Set MODEL_URL_UNET and MODEL_URL_UNETPP environment variables"
        echo "   3. AWS CLI: Set RAILWAY_ACCESS_KEY_ID and RAILWAY_SECRET_ACCESS_KEY"
        echo ""
        echo "   Expected files:"
        echo "   - $MODEL_UNET"
        echo "   - $MODEL_UNETPP"
        exit 1
    fi
fi

# Final verification
if [ ! -f "$MODEL_UNET" ] || [ ! -f "$MODEL_UNETPP" ]; then
    echo "❌ ERROR: Model files still not available after download attempt!"
    exit 1
fi

echo "✅ All model files verified"

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
