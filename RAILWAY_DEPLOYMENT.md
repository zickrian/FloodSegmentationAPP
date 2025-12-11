# Railway Deployment Guide

This guide explains how to deploy the Flood Segmentation App to Railway without Docker.

## Prerequisites

- Railway account
- Model files uploaded to Railway Storage or accessible via environment variables

## Deployment Steps

### 1. Connect Repository to Railway

1. Go to [Railway](https://railway.app/)
2. Create a new project
3. Connect your GitHub repository: `zickrian/FloodSegmentationAPP`
4. Railway will automatically detect the `nixpacks.toml` configuration

### 2. Configure Environment Variables

In Railway dashboard, add these environment variables:

```
PYTHONUNBUFFERED=1
PYTHONPATH=/app
OPENCV_HEADLESS=1
NEXT_PUBLIC_API_URL=
PORT=3000
```

**Optional Model Paths** (only if you want to override default):
```
# Default: Models/unet_baseline_best.pth and Models/unetplus.pth
# Only set these if models are in a different location
MODEL_PATH_UNET=/path/to/unet_baseline_best.pth
MODEL_PATH_UNETPP=/path/to/unetplus.pth
```

### 3. Model Files Setup (4.3 GB - Railway Buckets Strategy)

**⚠️ IMPORTANT: Model files (4.3 GB) are too large for Railway build limit (4 GB max)**

We use **Railway Buckets** (Object Storage) to store models and download them at runtime.

#### Step 1: Upload Models to Railway Bucket

1. **Create Railway Bucket:**
   - Go to Railway Dashboard → Your Project
   - Click "New" → "Database" → "Bucket" (or use Railway CLI)
   - Name it: `flood-segmentation-models`

2. **Upload Model Files:**
   ```bash
   # Using Railway CLI
   railway login
   railway link
   railway bucket upload flood-segmentation-models Models/unet_baseline_best.pth
   railway bucket upload flood-segmentation-models Models/unetplus.pth
   
   # Or via Railway Dashboard:
   # - Go to Bucket → Upload files
   # - Upload both .pth files
   ```

3. **Get Public URLs:**
   - After upload, Railway provides public URLs for each file
   - Copy these URLs (you'll need them for environment variables)

#### Step 2: Configure Environment Variables

In Railway Dashboard, add these environment variables:

```
# Railway Bucket URLs (get from Railway Dashboard after upload)
MODEL_URL_UNET=https://your-bucket-url.railway.app/unet_baseline_best.pth
MODEL_URL_UNETPP=https://your-bucket-url.railway.app/unetplus.pth

# Optional: If using Railway Bucket name directly
RAILWAY_BUCKET_NAME=flood-segmentation-models
```

#### Step 3: How It Works

1. **Build Phase:**
   - `.dockerignore` excludes `Models/` folder from build
   - Build image stays under 4 GB limit ✅

2. **Runtime Phase:**
   - `start.sh` downloads models from Railway Bucket on startup
   - Models are cached in `Models/` folder
   - App reads models from local `Models/` folder

#### Alternative: Git LFS (For Smaller Models)

If your models are < 1 GB, you can use Git LFS:

```bash
# Install Git LFS
git lfs install

# Track model files
git add Models/*.pth
git commit -m "Add model files with Git LFS"
git push origin main
```

**Note:** For 4.3 GB models, Railway Buckets is the recommended approach.

### 4. Verify Configuration Files

Make sure these files are present and correct:

- ✅ `nixpacks.toml` - Defines build configuration
- ✅ `railway.toml` - Railway-specific settings
- ✅ `start.sh` - Startup script (downloads models and runs both services)
- ✅ `.dockerignore` - Excludes Models/ folder from build (CRITICAL for 4.3 GB models)
- ✅ `Procfile` - Alternative deployment method
- ✅ `package.json` - Frontend dependencies
- ✅ `backend/requirements.txt` - Backend dependencies
- ❌ NO Dockerfile (using Nixpacks, but .dockerignore is respected)

### 5. Deploy

Railway will automatically:
1. Install Node.js 20 and Python 3.11
2. Install system dependencies (OpenCV libraries)
3. Install Python packages from `backend/requirements.txt`
4. Install Node packages from `package.json`
5. Build the Next.js application
6. Start both services using `start.sh`

### 6. Monitor Deployment

1. Check Railway logs for any errors
2. Wait for "Deployed successfully" message
3. Access your app via Railway-provided URL

## Architecture

```
Railway Deployment
│
├── Frontend (Next.js) - Port ${PORT:-3000}
│   └── Proxies /api/* to Backend
│
└── Backend (FastAPI) - Port 8000
    └── Serves ML inference API
```

## Build Configuration

### nixpacks.toml
- **setup**: Installs Node.js, Python, system libraries
- **install**: Installs Python and Node dependencies
- **build**: Builds Next.js app
- **start**: Runs `start.sh` script

### start.sh
1. Starts FastAPI backend on port 8000 (background)
2. Waits 5 seconds for backend warmup
3. Starts Next.js frontend on $PORT (foreground)

## Troubleshooting

### "No module named pip" Error
✅ **Fixed!** We added `python311Packages.pip` to nixPkgs.

### "Backend failed to start" Error
- Check Railway logs for backend errors
- Verify model paths are correct
- **Check if models downloaded successfully** - look for "✅ Model files verified" in logs
- Verify `MODEL_URL_UNET` and `MODEL_URL_UNETPP` environment variables are set
- Ensure Railway Bucket URLs are accessible
- Ensure all dependencies installed

### "Model files not found" Error
- Verify Railway Bucket URLs in environment variables
- Check Railway Bucket is accessible and files are uploaded
- Check `start.sh` logs for download errors
- Verify `.dockerignore` excludes Models/ (models should NOT be in build)

### "Cannot connect to API" Error
- Verify backend is running on port 8000
- Check Next.js rewrites in `next.config.ts`
- Ensure internal routing is configured

### Build Timeout
- Railway gives 10 minutes for build
- PyTorch CPU installation may take time
- If timeout occurs, contact Railway support to increase limit

## Important Notes

1. **No Docker**: This deployment uses Nixpacks (Railway's native builder), not Docker
2. **CPU-only PyTorch**: Uses lightweight CPU version for faster builds
3. **Dual Process**: Both frontend and backend run in same container
4. **Model Size (4.3 GB)**: 
   - Models are stored in Railway Buckets (NOT in build image)
   - Downloaded at runtime via `start.sh`
   - `.dockerignore` ensures models don't enter build (stays under 4 GB limit)
5. **Environment Variables**: All config via Railway dashboard
6. **Build Limit**: Railway has 4 GB build limit - models must be external

## Testing Locally

Test the deployment configuration locally:

```bash
# Install dependencies
npm ci
pip install -r backend/requirements.txt

# Build
npm run build

# Start (simulates Railway)
chmod +x start.sh
PORT=3000 ./start.sh
```

## Support

If deployment fails:
1. Check Railway build logs
2. Verify all configuration files
3. Ensure no Docker files exist
4. Check Python and Node versions match nixpacks.toml
5. Review this guide

---
Last updated: 2025-12-11
