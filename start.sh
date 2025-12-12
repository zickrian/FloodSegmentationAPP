#!/bin/bash
set -e  # Exit on error

echo "============================================="
echo "Starting Flood Segmentation Backend on Railway"
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

# Railway Bucket Configuration (from environment or defaults)
RAILWAY_BUCKET_NAME="${RAILWAY_BUCKET_NAME:-neat-gyoza-bevw8k9fvmbjyz}"

# Debug: Print environment variables status (without showing values)
echo "Environment variables check:"
echo "  - MODEL_URL_UNET: $([ -n "$MODEL_URL_UNET" ] && echo 'SET' || echo 'NOT SET')"
echo "  - MODEL_URL_UNETPP: $([ -n "$MODEL_URL_UNETPP" ] && echo 'SET' || echo 'NOT SET')"
echo "  - RAILWAY_ACCESS_KEY_ID: $([ -n "$RAILWAY_ACCESS_KEY_ID" ] && echo 'SET' || echo 'NOT SET')"
echo "  - RAILWAY_SECRET_ACCESS_KEY: $([ -n "$RAILWAY_SECRET_ACCESS_KEY" ] && echo 'SET' || echo 'NOT SET')"
echo "  - RAILWAY_BUCKET_NAME: $RAILWAY_BUCKET_NAME"
echo "  - curl available: $(command -v curl >/dev/null 2>&1 && echo 'YES' || echo 'NO')"
echo "  - aws CLI available: $(command -v aws >/dev/null 2>&1 && echo 'YES' || echo 'NO')"

if [ -f "$MODEL_UNET" ] && [ -f "$MODEL_UNETPP" ]; then
    echo "✅ Model files found locally"
    echo "  - UNet: $MODEL_UNET ($(du -h "$MODEL_UNET" 2>/dev/null | cut -f1 || echo 'N/A'))"
    echo "  - UNet++: $MODEL_UNETPP ($(du -h "$MODEL_UNETPP" 2>/dev/null | cut -f1 || echo 'N/A'))"
else
    echo "⚠️  Model files not found locally, downloading from Railway Buckets..."
    
    DOWNLOAD_SUCCESS=false
    
    # Method 1: Direct URLs (if provided) - Recommended
    if [ -n "$MODEL_URL_UNET" ] && [ -n "$MODEL_URL_UNETPP" ]; then
        if command -v curl >/dev/null 2>&1; then
            echo "Using Method 1: Direct URLs with curl..."
            DOWNLOAD_SUCCESS=true
            
            if [ ! -f "$MODEL_UNET" ]; then
                echo "Downloading UNet model from: $MODEL_URL_UNET"
                if curl -fsSL --max-time 1800 --retry 3 "$MODEL_URL_UNET" -o "$MODEL_UNET"; then
                    echo "✅ UNet model downloaded ($(du -h "$MODEL_UNET" 2>/dev/null | cut -f1 || echo 'N/A'))"
                else
                    echo "❌ Failed to download UNet model from $MODEL_URL_UNET"
                    DOWNLOAD_SUCCESS=false
                fi
            else
                echo "✅ UNet model already exists"
            fi
            
            if [ ! -f "$MODEL_UNETPP" ]; then
                echo "Downloading UNet++ model from: $MODEL_URL_UNETPP"
                if curl -fsSL --max-time 1800 --retry 3 "$MODEL_URL_UNETPP" -o "$MODEL_UNETPP"; then
                    echo "✅ UNet++ model downloaded ($(du -h "$MODEL_UNETPP" 2>/dev/null | cut -f1 || echo 'N/A'))"
                else
                    echo "❌ Failed to download UNet++ model from $MODEL_URL_UNETPP"
                    DOWNLOAD_SUCCESS=false
                fi
            else
                echo "✅ UNet++ model already exists"
            fi
        else
            echo "⚠️  curl not available, cannot use Direct URL method"
        fi
    fi
    
    # Method 2: AWS CLI / S3 API (if credentials provided and Method 1 failed)
    if [ "$DOWNLOAD_SUCCESS" = false ] && [ -n "$RAILWAY_ACCESS_KEY_ID" ] && [ -n "$RAILWAY_SECRET_ACCESS_KEY" ]; then
        if command -v aws >/dev/null 2>&1; then
            echo "Using Method 2: AWS CLI..."
            export AWS_ACCESS_KEY_ID="$RAILWAY_ACCESS_KEY_ID"
            export AWS_SECRET_ACCESS_KEY="$RAILWAY_SECRET_ACCESS_KEY"
            export AWS_ENDPOINT_URL="https://storage.railway.app"
            DOWNLOAD_SUCCESS=true
            
            if [ ! -f "$MODEL_UNET" ]; then
                echo "Downloading UNet model via AWS CLI from s3://$RAILWAY_BUCKET_NAME/unet_baseline_best.pth"
                if aws s3 cp "s3://$RAILWAY_BUCKET_NAME/unet_baseline_best.pth" "$MODEL_UNET" --endpoint-url="$AWS_ENDPOINT_URL" 2>&1; then
                    echo "✅ UNet model downloaded ($(du -h "$MODEL_UNET" 2>/dev/null | cut -f1 || echo 'N/A'))"
                else
                    echo "❌ Failed to download UNet model via AWS CLI"
                    DOWNLOAD_SUCCESS=false
                fi
            else
                echo "✅ UNet model already exists"
            fi
            
            if [ ! -f "$MODEL_UNETPP" ]; then
                echo "Downloading UNet++ model via AWS CLI from s3://$RAILWAY_BUCKET_NAME/unetplus.pth"
                if aws s3 cp "s3://$RAILWAY_BUCKET_NAME/unetplus.pth" "$MODEL_UNETPP" --endpoint-url="$AWS_ENDPOINT_URL" 2>&1; then
                    echo "✅ UNet++ model downloaded ($(du -h "$MODEL_UNETPP" 2>/dev/null | cut -f1 || echo 'N/A'))"
                else
                    echo "❌ Failed to download UNet++ model via AWS CLI"
                    DOWNLOAD_SUCCESS=false
                fi
            else
                echo "✅ UNet++ model already exists"
            fi
        else
            echo "⚠️  AWS CLI not available, cannot use AWS CLI method"
        fi
    fi
    
    # Method 3: Python boto3 (if Method 1 and 2 failed)
    if [ "$DOWNLOAD_SUCCESS" = false ] && [ -n "$RAILWAY_ACCESS_KEY_ID" ] && [ -n "$RAILWAY_SECRET_ACCESS_KEY" ]; then
        PYTHON_BIN="$APP_DIR/.venv/bin/python"
        if [ ! -x "$PYTHON_BIN" ]; then
            PYTHON_BIN="$(command -v python)"
        fi
        
        if [ -x "$PYTHON_BIN" ] && "$PYTHON_BIN" -c "import boto3" 2>/dev/null; then
            echo "Using Method 3: Python boto3..."
            DOWNLOAD_SUCCESS=true
            
            if [ ! -f "$MODEL_UNET" ]; then
                echo "Downloading UNet model via boto3 from s3://$RAILWAY_BUCKET_NAME/unet_baseline_best.pth"
                if "$PYTHON_BIN" -c "
import boto3
import os
from botocore.config import Config

s3 = boto3.client(
    's3',
    endpoint_url='https://storage.railway.app',
    aws_access_key_id=os.environ['RAILWAY_ACCESS_KEY_ID'],
    aws_secret_access_key=os.environ['RAILWAY_SECRET_ACCESS_KEY'],
    config=Config(signature_version='s3v4')
)

s3.download_file(
    '${RAILWAY_BUCKET_NAME}',
    'unet_baseline_best.pth',
    '${MODEL_UNET}'
)
print('✅ UNet model downloaded')
" 2>&1; then
                    echo "✅ UNet model downloaded ($(du -h "$MODEL_UNET" 2>/dev/null | cut -f1 || echo 'N/A'))"
                else
                    echo "❌ Failed to download UNet model via boto3"
                    DOWNLOAD_SUCCESS=false
                fi
            else
                echo "✅ UNet model already exists"
            fi
            
            if [ ! -f "$MODEL_UNETPP" ]; then
                echo "Downloading UNet++ model via boto3 from s3://$RAILWAY_BUCKET_NAME/unetplus.pth"
                if "$PYTHON_BIN" -c "
import boto3
import os
from botocore.config import Config

s3 = boto3.client(
    's3',
    endpoint_url='https://storage.railway.app',
    aws_access_key_id=os.environ['RAILWAY_ACCESS_KEY_ID'],
    aws_secret_access_key=os.environ['RAILWAY_SECRET_ACCESS_KEY'],
    config=Config(signature_version='s3v4')
)

s3.download_file(
    '${RAILWAY_BUCKET_NAME}',
    'unetplus.pth',
    '${MODEL_UNETPP}'
)
print('✅ UNet++ model downloaded')
" 2>&1; then
                    echo "✅ UNet++ model downloaded ($(du -h "$MODEL_UNETPP" 2>/dev/null | cut -f1 || echo 'N/A'))"
                else
                    echo "❌ Failed to download UNet++ model via boto3"
                    DOWNLOAD_SUCCESS=false
                fi
            else
                echo "✅ UNet++ model already exists"
            fi
        else
            echo "⚠️  Python boto3 not available, cannot use boto3 method"
        fi
    fi
    
    # Final check
    if [ "$DOWNLOAD_SUCCESS" = false ] || [ ! -f "$MODEL_UNET" ] || [ ! -f "$MODEL_UNETPP" ]; then
        echo ""
        echo "❌ ERROR: Model files not found and no download method available!"
        echo ""
        echo "   Available methods:"
        echo "   1. Direct URLs: Set MODEL_URL_UNET and MODEL_URL_UNETPP environment variables (Recommended)"
        echo "      Example: MODEL_URL_UNET=https://storage.railway.app/your-bucket/unet_baseline_best.pth"
        echo "   2. AWS CLI: Set RAILWAY_ACCESS_KEY_ID, RAILWAY_SECRET_ACCESS_KEY, and RAILWAY_BUCKET_NAME"
        echo "   3. Python boto3: Set RAILWAY_ACCESS_KEY_ID, RAILWAY_SECRET_ACCESS_KEY, and RAILWAY_BUCKET_NAME"
        echo ""
        echo "   Current status:"
        echo "   - MODEL_URL_UNET: $([ -n "$MODEL_URL_UNET" ] && echo 'SET' || echo 'NOT SET')"
        echo "   - MODEL_URL_UNETPP: $([ -n "$MODEL_URL_UNETPP" ] && echo 'SET' || echo 'NOT SET')"
        echo "   - RAILWAY_ACCESS_KEY_ID: $([ -n "$RAILWAY_ACCESS_KEY_ID" ] && echo 'SET' || echo 'NOT SET')"
        echo "   - RAILWAY_SECRET_ACCESS_KEY: $([ -n "$RAILWAY_SECRET_ACCESS_KEY" ] && echo 'SET' || echo 'NOT SET')"
        echo "   - curl available: $(command -v curl >/dev/null 2>&1 && echo 'YES' || echo 'NO')"
        echo "   - aws CLI available: $(command -v aws >/dev/null 2>&1 && echo 'YES' || echo 'NO')"
        echo ""
        echo "   Expected files:"
        echo "   - $MODEL_UNET"
        echo "   - $MODEL_UNETPP"
        echo ""
        echo "   Please set the required environment variables in Railway Dashboard:"
        echo "   Settings > Variables > Add Variable"
        exit 1
    fi
fi

# Final verification
if [ ! -f "$MODEL_UNET" ] || [ ! -f "$MODEL_UNETPP" ]; then
    echo "❌ ERROR: Model files still not available after download attempt!"
    exit 1
fi

echo "✅ All model files verified"

# Use virtualenv Python (packages are installed here)
# Fix vdso_gettimeofday error by setting proper environment variables
PYTHON_BIN="$APP_DIR/.venv/bin/python"
if [ ! -x "$PYTHON_BIN" ]; then
    PYTHON_BIN="$(command -v python3 || command -v python)"
fi

# Verify Python binary exists and is executable
if [ ! -x "$PYTHON_BIN" ]; then
    echo "❌ ERROR: Python binary not found"
    exit 1
fi

echo "Using Python: $PYTHON_BIN ($($PYTHON_BIN --version 2>&1 || echo 'version unknown'))"

# Start Backend
echo ""
echo "Starting FastAPI Backend on port ${PORT:-8000}..."
cd "$APP_DIR/backend"

if [ ! -f "app/main.py" ]; then
    echo "Error: Backend main.py not found!"
    exit 1
fi

# Use PORT from Railway or default to 8000
PORT=${PORT:-8000}

# Set environment variables to ensure OpenCV headless mode
export OPENCV_HEADLESS=1
export QT_QPA_PLATFORM=offscreen

# Set LD_LIBRARY_PATH and other environment variables for Nix environment
# This is critical for opencv-python-headless to work and avoid vdso errors
if [ -d "/nix/store" ]; then
    # Initialize LD_LIBRARY_PATH if not set
    LD_LIBRARY_PATH="${LD_LIBRARY_PATH:-}"
    
    # Find libGL.so.1 location in Nix store
    LIBGL_PATH=$(find /nix/store -name "libGL.so.1" 2>/dev/null | head -1)
    if [ -n "$LIBGL_PATH" ] && [ -f "$LIBGL_PATH" ]; then
        LIBGL_DIR=$(dirname "$LIBGL_PATH")
        LD_LIBRARY_PATH="${LD_LIBRARY_PATH}:${LIBGL_DIR}"
        echo "✅ Found libGL.so.1 at: $LIBGL_PATH"
    fi
    
    # Find mesa library directories and add their lib paths (first 3 found)
    for MESA_PATH in $(find /nix/store -type d -name "mesa-*" 2>/dev/null | head -3); do
        if [ -d "${MESA_PATH}/lib" ]; then
            LD_LIBRARY_PATH="${LD_LIBRARY_PATH}:${MESA_PATH}/lib"
        fi
    done
    
    # Add Python library paths from Nix store to avoid vdso errors
    PYTHON_LIB_PATH=$(find /nix/store -type d -path "*/python3.*/lib" 2>/dev/null | head -1)
    if [ -n "$PYTHON_LIB_PATH" ]; then
        LD_LIBRARY_PATH="${LD_LIBRARY_PATH}:${PYTHON_LIB_PATH}"
    fi
    
    # Add common system library paths as fallback
    LD_LIBRARY_PATH="${LD_LIBRARY_PATH}:/usr/lib/x86_64-linux-gnu:/lib/x86_64-linux-gnu:/usr/lib"
    
    export LD_LIBRARY_PATH
    
    # Set environment variables to prevent vdso_gettimeofday errors
    # The error occurs when Python tries to use incompatible vdso from system
    # Solution: Clear LD_PRELOAD and ensure proper library paths
    unset LD_PRELOAD
    
    # Add Nix Python library paths to ensure proper library resolution
    NIX_PYTHON_LIB=$(find /nix/store -type d \( -path "*/python3.*/lib" -o -path "*/python-3.*/lib" \) 2>/dev/null | head -1)
    if [ -n "$NIX_PYTHON_LIB" ]; then
        LD_LIBRARY_PATH="${LD_LIBRARY_PATH}:${NIX_PYTHON_LIB}"
    fi
    
    # Add virtualenv Python library path
    if [ -d "$APP_DIR/.venv/lib" ]; then
        VENV_LIB_DIR=$(find "$APP_DIR/.venv/lib" -type d -name "python3.*" 2>/dev/null | head -1)
        if [ -n "$VENV_LIB_DIR" ]; then
            LD_LIBRARY_PATH="${LD_LIBRARY_PATH}:${VENV_LIB_DIR}"
        fi
    fi
    
    if [ -z "$LIBGL_PATH" ]; then
        echo "⚠️  Warning: libGL.so.1 not found in Nix store, using system paths"
    fi
fi

echo "Backend will run on port $PORT"
"$PYTHON_BIN" -m uvicorn app.main:app --host 0.0.0.0 --port "$PORT"
