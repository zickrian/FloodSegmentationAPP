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

**Optional Model Paths** (if models are in Railway Storage):
```
MODEL_PATH_UNET=/path/to/unet_baseline_best.pth
MODEL_PATH_UNETPP=/path/to/unetplus.pth
```

### 3. Model Files Setup

Since model files (`.pth`) are large and excluded from git:

**Option A: Railway Storage**
1. Upload model files to Railway Storage
2. Set environment variables to point to storage paths

**Option B: Direct Upload**
1. Use Railway CLI to upload models
2. Place files in the `Models/` directory in deployment

**Option C: External Storage**
1. Host models on S3/GCS/etc.
2. Download them during startup

### 4. Verify Configuration Files

Make sure these files are present and correct:

- ✅ `nixpacks.toml` - Defines build configuration
- ✅ `railway.toml` - Railway-specific settings
- ✅ `start.sh` - Startup script (runs both backend and frontend)
- ✅ `Procfile` - Alternative deployment method
- ✅ `package.json` - Frontend dependencies
- ✅ `backend/requirements.txt` - Backend dependencies
- ❌ NO Docker files (`.dockerignore`, `Dockerfile`, etc.)

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
- Ensure all dependencies installed

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
4. **Model Size**: Model files must be accessible at runtime
5. **Environment Variables**: All config via Railway dashboard

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
