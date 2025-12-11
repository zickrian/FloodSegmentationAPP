# 🚀 DEPLOYMENT GUIDE

Complete guide for deploying the Flood Segmentation Application to Railway and other platforms.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Deployment (Railway)](#backend-deployment-railway)
3. [Frontend Deployment (Railway)](#frontend-deployment-railway)
4. [Environment Variables](#environment-variables)
5. [Alternative Platforms](#alternative-platforms)
6. [Post-Deployment Testing](#post-deployment-testing)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts
- GitHub account (for code repository)
- Railway account (https://railway.app)

### Required Files
- Model weights:
  - `Models/unet_baseline_best.pth`
  - `Models/unetplus.pth`

### Local Testing
Before deployment, test locally:

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend (new terminal)
npm install
npm run dev
```

---

## Backend Deployment (Railway)

### Step 1: Prepare Backend

1. **Copy model weights to backend:**

```bash
# From project root
mkdir -p backend/models_weights
cp Models/unet_baseline_best.pth backend/models_weights/
cp Models/unetplus.pth backend/models_weights/
```

2. **Verify backend structure:**

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── models.py
│   ├── preprocessing.py
│   ├── postprocessing.py
│   └── utils.py
├── models_weights/
│   ├── unet_baseline_best.pth
│   └── unetplus.pth
├── requirements.txt
├── Dockerfile
└── railway.toml
```

### Step 2: Push to GitHub

```bash
# Initialize git if needed
git init

# Add backend files
git add backend/
git commit -m "Add backend for deployment"

# Push to GitHub
git remote add origin <your-repo-url>
git push -u origin main
```

### Step 3: Deploy to Railway

1. **Login to Railway:** https://railway.app

2. **Create New Project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will detect the Dockerfile

3. **Configure Backend Service:**
   - **Root Directory:** Set to `backend/`
   - **Build Command:** Uses Dockerfile automatically
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

4. **Add Environment Variables:**

```env
MODEL_PATH_UNET=./models_weights/unet_baseline_best.pth
MODEL_PATH_UNETPP=./models_weights/unetplus.pth
DEVICE=cpu
```

5. **Deploy:**
   - Click "Deploy"
   - Wait for build (~5-10 minutes, model files are large)
   - Railway will provide a public URL

6. **Note the Backend URL:**
   - Example: `https://your-backend-name.up.railway.app`
   - You'll need this for frontend configuration

### Step 4: Verify Backend

Test the deployed backend:

```bash
# Health check
curl https://your-backend-name.up.railway.app/health

# Should return:
# {"status":"healthy","models_loaded":true,"device":"cpu"}
```

---

## Frontend Deployment (Railway)

### Step 1: Update Frontend Configuration

1. **Create `.env.production` file:**

```bash
# In project root
cat > .env.production << EOF
NEXT_PUBLIC_API_URL=https://your-backend-name.up.railway.app
EOF
```

2. **Verify frontend structure:**

```
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
├── lib/
├── package.json
├── next.config.ts
├── tsconfig.json
└── .env.production
```

### Step 2: Deploy to Railway

1. **Create New Service in Same Project:**
   - In Railway dashboard, click "New"
   - Select "GitHub Repo"
   - Choose same repository
   - Select different service name

2. **Configure Frontend Service:**
   - **Root Directory:** Leave as root (or set to `.`)
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`

3. **Add Environment Variables:**

```env
NEXT_PUBLIC_API_URL=https://your-backend-name.up.railway.app
NODE_ENV=production
```

4. **Deploy:**
   - Click "Deploy"
   - Wait for build (~3-5 minutes)
   - Railway will provide a public URL

5. **Note the Frontend URL:**
   - Example: `https://your-app-name.up.railway.app`

### Step 3: Update CORS (Backend)

Update backend to allow frontend domain:

1. Go to backend service in Railway
2. Add environment variable:

```env
CORS_ORIGINS=https://your-app-name.up.railway.app
```

3. Redeploy backend

---

## Environment Variables

### Backend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MODEL_PATH_UNET` | Path to UNet model weights | `./models_weights/unet_baseline_best.pth` |
| `MODEL_PATH_UNETPP` | Path to UNet++ model weights | `./models_weights/unetplus.pth` |
| `DEVICE` | PyTorch device (cpu or cuda) | `cpu` |
| `CORS_ORIGINS` | Allowed frontend origins | `https://your-app.railway.app` |

### Frontend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://your-backend.railway.app` |
| `NODE_ENV` | Node environment | `production` |

---

## Alternative Platforms

### Docker Deployment (Any Platform)

Build and run with Docker:

```bash
# Backend
cd backend
docker build -t flood-backend .
docker run -p 8000:8000 flood-backend

# Frontend
docker build -t flood-frontend .
docker run -p 3000:3000 flood-frontend
```

### Vercel (Frontend Only)

```bash
npm install -g vercel
vercel --prod
```

Add environment variable in Vercel dashboard:
- `NEXT_PUBLIC_API_URL`: Your backend URL

### Heroku (Backend)

```bash
# Install Heroku CLI
heroku login
heroku create flood-segmentation-backend

# Add buildpack
heroku buildpacks:set heroku/python

# Deploy
git subtree push --prefix backend heroku main

# Set env vars
heroku config:set MODEL_PATH_UNET=./models_weights/unet_baseline_best.pth
heroku config:set MODEL_PATH_UNETPP=./models_weights/unetplus.pth
```

### Google Cloud Run

```bash
# Build and push
gcloud builds submit --tag gcr.io/PROJECT-ID/flood-backend backend/
gcloud run deploy flood-backend --image gcr.io/PROJECT-ID/flood-backend --platform managed
```

---

## Post-Deployment Testing

### 1. Backend Health Check

```bash
curl https://your-backend.railway.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "models_loaded": true,
  "device": "cpu"
}
```

### 2. End-to-End Test

```bash
# Test with sample image
curl -X POST https://your-backend.railway.app/api/segment \
  -F "file=@test_flood_image.jpg" \
  -o response.json

# Check response
cat response.json
```

### 3. Frontend Test

1. Open frontend URL in browser
2. Upload a flood image
3. Verify:
   - Image uploads successfully
   - Loading state appears
   - Results display correctly
   - All tabs work (Original, UNet, UNet++, Comparison)
   - Statistics are accurate
   - Mobile responsive

---

## Troubleshooting

### Backend Issues

**Problem: Models not loading**

```
❌ Failed to load models: FileNotFoundError
```

**Solution:**
- Verify model files are in `backend/models_weights/`
- Check file names match exactly
- Verify environment variables are set correctly

**Problem: Out of memory**

```
❌ torch.cuda.OutOfMemoryError
```

**Solution:**
- Use CPU instead: `DEVICE=cpu`
- Upgrade Railway plan for more memory
- Consider model quantization

**Problem: Slow inference**

**Solution:**
- Use GPU instance (upgrade Railway plan)
- Implement request queuing
- Add caching for repeated images

### Frontend Issues

**Problem: CORS errors**

```
Access to fetch at 'https://backend...' has been blocked by CORS policy
```

**Solution:**
- Update backend `CORS_ORIGINS` environment variable
- Include frontend domain in allowed origins
- Redeploy backend

**Problem: API connection failed**

```
Failed to fetch
```

**Solution:**
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check backend is running (health check)
- Verify backend URL is accessible
- Check browser console for errors

**Problem: Images not displaying**

**Solution:**
- Check base64 encoding is correct
- Verify image format (PNG/JPEG)
- Check browser console for errors
- Verify backend is returning correct response structure

### Deployment Issues

**Problem: Build timeout**

**Solution:**
- Model files are large, increase build timeout in Railway settings
- Consider uploading models separately (not in git)
- Use `.dockerignore` to exclude unnecessary files

**Problem: High memory usage**

**Solution:**
- Models are loaded in memory (~100MB each)
- Use at least 512MB RAM (1GB recommended)
- Upgrade Railway plan if needed

---

## Optimization Tips

### 1. Model Serving Optimization

```python
# Use torch.jit for faster inference
model = torch.jit.script(model)
```

### 2. Caching

Add Redis caching for repeated images:

```python
import hashlib
import redis

def get_cache_key(image_bytes):
    return hashlib.md5(image_bytes).hexdigest()
```

### 3. CDN for Images

Use Cloudflare or similar CDN for faster image delivery.

### 4. Monitoring

Add monitoring:
- Railway metrics
- Sentry for error tracking
- LogRocket for session replay

---

## Cost Estimation

### Railway Costs

**Backend:**
- Starter Plan: $5/month (512MB RAM, shared CPU)
- Developer Plan: $20/month (2GB RAM, dedicated CPU)

**Frontend:**
- Starter Plan: $5/month
- Developer Plan: $20/month

**Total:** ~$10-40/month depending on traffic

### Free Alternatives

- **Frontend:** Vercel (free tier)
- **Backend:** Railway free trial (limited hours)
- **Self-hosted:** Free (using own server)

---

## Security Best Practices

1. **Environment Variables:**
   - Never commit `.env` files
   - Use Railway secrets for sensitive data

2. **CORS:**
   - Restrict to specific domains in production
   - Don't use `allow_origins=["*"]`

3. **File Upload:**
   - Implement rate limiting
   - Validate file types strictly
   - Limit file size

4. **API Security:**
   - Add authentication if needed
   - Implement request throttling
   - Monitor for abuse

---

## Maintenance

### Regular Tasks

1. **Monitor logs** (Railway dashboard)
2. **Check error rates**
3. **Update dependencies** monthly
4. **Backup model files**
5. **Monitor costs**

### Updates

To update deployment:

```bash
# Make changes
git add .
git commit -m "Update: description"
git push

# Railway will auto-deploy
```

---

## Support

If you encounter issues:

1. Check Railway logs
2. Test locally first
3. Review this guide
4. Check Railway status page
5. Contact Railway support

---

**Deployment Status:** Ready for Production ✅  
**Estimated Setup Time:** 30-45 minutes  
**Difficulty:** Intermediate

