# 📋 Rencana Deployment Terpisah: Backend (Railway) + Frontend (Vercel)

## 🎯 Overview

Karena keterbatasan Railway untuk hosting model dan frontend dalam 1 tempat, kita akan memisahkan deployment:
- **Backend (FastAPI + Model)**: Railway
- **Frontend (Next.js)**: Vercel

## 📦 Struktur Deployment

```
┌─────────────────┐         ┌─────────────────┐
│   Vercel        │ ──────> │   Railway       │
│   (Frontend)    │  HTTP   │   (Backend)     │
│   Next.js       │         │   FastAPI       │
└─────────────────┘         └─────────────────┘
```

## 🚀 Langkah-langkah Deployment

### 1️⃣ Persiapan Backend untuk Railway

#### A. Update CORS di Backend
- Update `backend/app/main.py` untuk support CORS dari environment variable
- Allow origin dari Vercel domain

#### B. Buat Konfigurasi Railway untuk Backend Only
- `railway-backend-only.toml` - konfigurasi Railway
- `nixpacks-backend-only.toml` - build config untuk backend only
- `start-backend-only.sh` - startup script untuk backend only

#### C. Environment Variables di Railway
Set environment variables berikut di Railway Dashboard:
```
PYTHONUNBUFFERED=1
OPENCV_HEADLESS=1
PYTHONPATH=/app
RAILWAY_BUCKET_NAME=<your-bucket-name>
MODEL_URL_UNET=<url-to-unet-model>
MODEL_URL_UNETPP=<url-to-unetpp-model>
# Atau gunakan MODEL_PATH_UNET dan MODEL_PATH_UNETPP jika model sudah di filesystem
```

### 2️⃣ Persiapan Frontend untuk Vercel

#### A. Update Next.js Config
- Hapus `rewrites()` dari `next.config.ts` (karena backend external)
- Frontend akan call backend langsung via `NEXT_PUBLIC_API_URL`

#### B. Buat Vercel Config
- `vercel.json` - konfigurasi Vercel

#### C. Environment Variables di Vercel
Set environment variable berikut di Vercel Dashboard:
```
NEXT_PUBLIC_API_URL=https://your-railway-backend.railway.app
```

### 3️⃣ Deployment Backend ke Railway

1. **Buat Project Baru di Railway**
   - Login ke Railway
   - Create new project
   - Connect GitHub repository

2. **Setup Service**
   - Pilih service type: "Nixpacks"
   - Root directory: `/` (atau biarkan default)
   - Railway akan otomatis detect `railway.toml` dan `nixpacks.toml`
   - Build hanya Python backend (tidak ada Node.js/Next.js)
   - Start command: `chmod +x start.sh && ./start.sh`

3. **Set Environment Variables**
   - Set semua environment variables yang diperlukan (lihat `RAILWAY_SETUP.md`)
   - **PENTING**: Set `MODEL_URL_UNET` dan `MODEL_URL_UNETPP` dengan URL dari Railway Bucket
   - Atau set `RAILWAY_ACCESS_KEY_ID` dan `RAILWAY_SECRET_ACCESS_KEY` untuk AWS CLI method

4. **Deploy**
   - Railway akan otomatis build dan deploy
   - Tunggu hingga deployment selesai
   - Check logs untuk memastikan model berhasil didownload
   - Copy Railway URL (contoh: `https://your-app.railway.app`)

### 4️⃣ Deployment Frontend ke Vercel

1. **Install Vercel CLI** (opsional, bisa pakai web dashboard)
   ```bash
   npm i -g vercel
   ```

2. **Deploy via Dashboard**
   - Login ke Vercel
   - Import project dari GitHub
   - Framework preset: Next.js
   - Root directory: `/` (atau biarkan default)

3. **Set Environment Variables**
   - Di Vercel dashboard, masuk ke Settings > Environment Variables
   - Tambahkan: `NEXT_PUBLIC_API_URL` = Railway backend URL

4. **Deploy**
   - Klik Deploy
   - Tunggu hingga build selesai
   - Frontend akan otomatis ter-deploy

## 🔧 File yang Perlu Dibuat/Diupdate

### File Baru:
1. ✅ `DEPLOYMENT_PLAN.md` (file ini)
2. ✅ `RAILWAY_SETUP.md` - Panduan setup Railway dengan environment variables
3. ✅ `vercel.json` - Vercel configuration

### File yang Diupdate:
1. ✅ `railway.toml` - Updated untuk backend only
2. ✅ `nixpacks.toml` - Updated untuk backend only (tidak ada Node.js)
3. ✅ `start.sh` - Updated untuk backend only (tidak start Next.js)

### File yang Perlu Diupdate:
1. ✅ `backend/app/main.py` - Update CORS untuk support Vercel domain
2. ✅ `next.config.ts` - Hapus rewrites (backend external)

## 🔐 CORS Configuration

Backend perlu diupdate untuk allow request dari Vercel domain. Update di `backend/app/main.py`:

```python
# Get allowed origins from environment variable
allowed_origins = os.getenv("CORS_ORIGINS", "*").split(",")
if "*" in allowed_origins:
    allowed_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Di Railway, set environment variable:
```
CORS_ORIGINS=https://your-frontend.vercel.app,https://your-frontend.vercel.app/*
```

## 🧪 Testing

### Test Backend (Railway)
```bash
# Test health check
curl https://your-railway-backend.railway.app/health

# Test API
curl -X POST https://your-railway-backend.railway.app/api/segment \
  -F "file=@test-image.jpg"
```

### Test Frontend (Vercel)
1. Buka URL Vercel di browser
2. Upload gambar
3. Pastikan request ke backend berhasil

## 📝 Checklist Deployment

### Backend (Railway)
- [ ] Update CORS di `backend/app/main.py`
- [ ] Buat `railway-backend-only.toml`
- [ ] Buat `nixpacks-backend-only.toml`
- [ ] Buat `start-backend-only.sh`
- [ ] Set environment variables di Railway
- [ ] Deploy ke Railway
- [ ] Test backend endpoint
- [ ] Copy Railway URL untuk frontend

### Frontend (Vercel)
- [ ] Update `next.config.ts` (hapus rewrites)
- [ ] Buat `vercel.json`
- [ ] Set `NEXT_PUBLIC_API_URL` di Vercel
- [ ] Deploy ke Vercel
- [ ] Test frontend dengan backend

## 🐛 Troubleshooting

### Backend tidak bisa diakses dari Vercel
- Check CORS configuration
- Pastikan `CORS_ORIGINS` di Railway sudah set dengan domain Vercel
- Check Railway logs untuk error

### Frontend tidak bisa connect ke backend
- Pastikan `NEXT_PUBLIC_API_URL` sudah set dengan benar
- Check browser console untuk CORS errors
- Pastikan backend sudah running dan accessible

### Model tidak ditemukan
- Check `MODEL_PATH_UNET` dan `MODEL_PATH_UNETPP` di Railway
- Pastikan model files sudah di Railway Bucket
- Check Railway logs untuk path model

## 📚 Referensi

- [Railway Documentation](https://docs.railway.app/)
- [Vercel Documentation](https://vercel.com/docs)
- [FastAPI CORS](https://fastapi.tiangolo.com/tutorial/cors/)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
