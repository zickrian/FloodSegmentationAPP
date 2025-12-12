#!/bin/bash
set -e

echo "============================================="
echo "Starting Flood Segmentation Backend on Railway"
echo "============================================="

APP_DIR="/app"
if [ ! -d "$APP_DIR" ]; then
    APP_DIR="$(pwd)"
fi

echo "App directory: $APP_DIR"

# Headless mode validation
echo "Checking opencv-python-headless..."
if $APP_DIR/.venv/bin/pip list | grep "opencv-python " > /dev/null; then
    echo "WARNING: Standard opencv-python found! This might cause crashes."
fi

# Create Models directory
MODEL_DIR="$APP_DIR/Models"
mkdir -p "$MODEL_DIR"

echo ""
echo "Checking model files..."

MODEL_UNET="$MODEL_DIR/unet_baseline_best.pth"
MODEL_UNETPP="$MODEL_DIR/unetplus.pth"
RAILWAY_BUCKET_NAME="${RAILWAY_BUCKET_NAME:-neat-gyoza-bevw8k9fvmbjyz}"

echo "Environment variables:"
echo "  - RAILWAY_ACCESS_KEY_ID: $([ -n "$RAILWAY_ACCESS_KEY_ID" ] && echo 'SET' || echo 'NOT SET')"
echo "  - RAILWAY_SECRET_ACCESS_KEY: $([ -n "$RAILWAY_SECRET_ACCESS_KEY" ] && echo 'SET' || echo 'NOT SET')"
echo "  - RAILWAY_BUCKET_NAME: $RAILWAY_BUCKET_NAME"

if [ -f "$MODEL_UNET" ] && [ -f "$MODEL_UNETPP" ]; then
    echo "Model files found locally"
    echo "  - UNet: $(du -h "$MODEL_UNET" 2>/dev/null | cut -f1 || echo 'exists')"
    echo "  - UNet++: $(du -h "$MODEL_UNETPP" 2>/dev/null | cut -f1 || echo 'exists')"
else
    echo "Model files not found, downloading..."
    
    DOWNLOAD_SUCCESS=false
    
    # Method 1: Direct URLs
    if [ -n "$MODEL_URL_UNET" ] && [ -n "$MODEL_URL_UNETPP" ]; then
        if command -v curl >/dev/null 2>&1; then
            echo "Using Direct URLs..."
            DOWNLOAD_SUCCESS=true
            
            if [ ! -f "$MODEL_UNET" ]; then
                if curl -fsSL --max-time 1800 --retry 3 "$MODEL_URL_UNET" -o "$MODEL_UNET"; then
                    echo "UNet model downloaded"
                else
                    DOWNLOAD_SUCCESS=false
                fi
            fi
            
            if [ ! -f "$MODEL_UNETPP" ]; then
                if curl -fsSL --max-time 1800 --retry 3 "$MODEL_URL_UNETPP" -o "$MODEL_UNETPP"; then
                    echo "UNet++ model downloaded"
                else
                    DOWNLOAD_SUCCESS=false
                fi
            fi
        fi
    fi
    
    # Method 2: AWS CLI
    if [ "$DOWNLOAD_SUCCESS" = false ] && [ -n "$RAILWAY_ACCESS_KEY_ID" ] && [ -n "$RAILWAY_SECRET_ACCESS_KEY" ]; then
        if command -v aws >/dev/null 2>&1; then
            echo "Using AWS CLI..."
            export AWS_ACCESS_KEY_ID="$RAILWAY_ACCESS_KEY_ID"
            export AWS_SECRET_ACCESS_KEY="$RAILWAY_SECRET_ACCESS_KEY"
            export AWS_ENDPOINT_URL="https://storage.railway.app"
            DOWNLOAD_SUCCESS=true
            
            if [ ! -f "$MODEL_UNET" ]; then
                if aws s3 cp "s3://$RAILWAY_BUCKET_NAME/unet_baseline_best.pth" "$MODEL_UNET" --endpoint-url="$AWS_ENDPOINT_URL" 2>&1; then
                    echo "UNet model downloaded"
                else
                    DOWNLOAD_SUCCESS=false
                fi
            fi
            
            if [ ! -f "$MODEL_UNETPP" ]; then
                if aws s3 cp "s3://$RAILWAY_BUCKET_NAME/unetplus.pth" "$MODEL_UNETPP" --endpoint-url="$AWS_ENDPOINT_URL" 2>&1; then
                    echo "UNet++ model downloaded"
                else
                    DOWNLOAD_SUCCESS=false
                fi
            fi
        fi
    fi
    
    if [ "$DOWNLOAD_SUCCESS" = false ] || [ ! -f "$MODEL_UNET" ] || [ ! -f "$MODEL_UNETPP" ]; then
        echo "ERROR: Model files not found!"
        exit 1
    fi
fi

if [ ! -f "$MODEL_UNET" ] || [ ! -f "$MODEL_UNETPP" ]; then
    echo "ERROR: Model files not available!"
    exit 1
fi

echo "All model files verified"

# Use virtualenv Python
PYTHON_BIN="$APP_DIR/.venv/bin/python"
if [ ! -x "$PYTHON_BIN" ]; then
    echo "ERROR: Python not found at $PYTHON_BIN"
    exit 1
fi

echo ""
echo "Python: $PYTHON_BIN"
$PYTHON_BIN --version
echo "Installed packages:"
$PYTHON_BIN -m pip list | grep -E "opencv|albumentations|numpy" || true

# Start Backend
cd "$APP_DIR/backend"

if [ ! -f "app/main.py" ]; then
    echo "ERROR: main.py not found!"
    exit 1
fi

PORT=${PORT:-8000}

export OPENCV_HEADLESS=1
export QT_QPA_PLATFORM=offscreen

echo ""
echo "Starting FastAPI on port $PORT..."
exec $PYTHON_BIN -m uvicorn app.main:app --host 0.0.0.0 --port "$PORT"
