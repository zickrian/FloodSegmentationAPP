# 🚂 Railway Backend Setup Guide

## 📋 Prerequisites

- Model files sudah ada di Railway Bucket: `neat-gyoza-bevw8k9fvmbjyz`
  - ✅ `unet_baseline_best.pth`
  - ✅ `unetplus.pth`

## 🔧 Environment Variables di Railway

Set environment variables berikut di Railway Dashboard (Settings > Variables):

### Required Variables:

```bash
PYTHONUNBUFFERED=1
PYTHONPATH=/app
OPENCV_HEADLESS=1
RAILWAY_BUCKET_NAME=neat-gyoza-bevw8k9fvmbjyz
CORS_ORIGINS=*
```

### Model Download Method (Pilih salah satu):

#### Method 1: Direct URLs (Recommended) ⭐

Jika model sudah di bucket dan kamu punya URL publik:

```bash
MODEL_URL_UNET=https://storage.railway.app/your-bucket-path/unet_baseline_best.pth
MODEL_URL_UNETPP=https://storage.railway.app/your-bucket-path/unetplus.pth
```

**Cara mendapatkan URL:**
1. Buka Railway Dashboard
2. Masuk ke Storage/Bucket `neat-gyoza`
3. Klik file `unet_baseline_best.pth` dan `unetplus.pth`
4. Copy URL publik yang muncul
5. Set sebagai `MODEL_URL_UNET` dan `MODEL_URL_UNETPP`

#### Method 2: AWS CLI (Alternatif)

Jika punya Railway Access Keys:

```bash
RAILWAY_ACCESS_KEY_ID=<your-access-key>
RAILWAY_SECRET_ACCESS_KEY=<your-secret-key>
```

**Cara mendapatkan Access Keys:**
1. Buka Railway Dashboard
2. Settings > Tokens
3. Generate new token dengan permission untuk bucket access

## 🚀 Deployment Steps

1. **Push code ke GitHub**
   ```bash
   git add .
   git commit -m "Configure backend-only deployment for Railway"
   git push
   ```

2. **Railway akan otomatis detect dan deploy**
   - Railway akan menggunakan `railway.toml` dan `nixpacks.toml`
   - Build hanya Python backend (tidak ada Node.js)
   - Start script akan download model dari bucket

3. **Check logs di Railway Dashboard**
   - Pastikan model berhasil didownload
   - Pastikan backend start tanpa error

4. **Test backend**
   ```bash
   curl https://your-app.railway.app/health
   ```

## ✅ Verification

Setelah deployment, check:

- [ ] Model files berhasil didownload (lihat di logs)
- [ ] Backend start tanpa error
- [ ] Health check endpoint return `200 OK`
- [ ] `/api/segment` endpoint bisa diakses

## 🐛 Troubleshooting

### Model tidak ditemukan
- Pastikan `MODEL_URL_UNET` dan `MODEL_URL_UNETPP` sudah set dengan benar
- Atau pastikan `RAILWAY_ACCESS_KEY_ID` dan `RAILWAY_SECRET_ACCESS_KEY` sudah set
- Check Railway logs untuk error message

### Backend crash saat startup
- Check logs untuk error message
- Pastikan semua environment variables sudah set
- Pastikan model files ada di bucket dengan nama yang benar

### CORS error (setelah deploy frontend)
- Update `CORS_ORIGINS` dengan URL Vercel frontend:
  ```
  CORS_ORIGINS=https://your-frontend.vercel.app,https://your-frontend.vercel.app/*
  ```
- Redeploy backend setelah update CORS

## 📝 Notes

- Backend hanya deploy Python/FastAPI (tidak ada Next.js)
- Model files di-download dari Railway Bucket saat startup
- Frontend akan di-deploy terpisah di Vercel
- Set `CORS_ORIGINS` setelah dapat URL Vercel
