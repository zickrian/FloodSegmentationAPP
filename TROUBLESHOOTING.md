# 🐛 Troubleshooting Guide

## ❌ Model Files Not Found

### Error Message:
```
❌ ERROR: Model files not found and no download method available!
```

### Penyebab:
1. Environment variables tidak di-set di Railway Dashboard
2. URL model tidak valid atau tidak bisa diakses
3. AWS CLI credentials salah atau tidak valid

### Solusi:

#### ✅ Solusi 1: Set Direct URLs (Paling Mudah)

1. **Dapatkan URL dari Railway Bucket:**
   - Buka Railway Dashboard → Project → Storage
   - Klik bucket `neat-gyoza`
   - Klik file `unet_baseline_best.pth` → Copy URL
   - Klik file `unetplus.pth` → Copy URL

2. **Set Environment Variables di Railway:**
   - Buka Railway Dashboard → Project → Service `FloodSegmentationAPP`
   - Klik **Variables** tab
   - Tambahkan:
     ```
     MODEL_URL_UNET=https://storage.railway.app/neat-gyoza-bevw8k9fvmbjyz/unet_baseline_best.pth
     MODEL_URL_UNETPP=https://storage.railway.app/neat-gyoza-bevw8k9fvmbjyz/unetplus.pth
     ```
   - **Ganti URL dengan URL yang kamu dapatkan dari bucket**

3. **Redeploy:**
   - Railway akan otomatis redeploy setelah set environment variables
   - Atau klik **Redeploy** manual

#### ✅ Solusi 2: Set AWS CLI Credentials

1. **Dapatkan Railway Access Keys:**
   - Railway Dashboard → Settings → Tokens
   - Generate new token dengan permission untuk bucket access

2. **Set Environment Variables:**
   ```
   RAILWAY_ACCESS_KEY_ID=<your-access-key>
   RAILWAY_SECRET_ACCESS_KEY=<your-secret-key>
   RAILWAY_BUCKET_NAME=neat-gyoza-bevw8k9fvmbjyz
   ```

3. **Redeploy**

### Verifikasi:

Setelah set environment variables, check logs untuk memastikan:
- ✅ `MODEL_URL_UNET: SET` atau `RAILWAY_ACCESS_KEY_ID: SET`
- ✅ `curl available: YES` atau `aws CLI available: YES`
- ✅ `✅ UNet model downloaded`
- ✅ `✅ UNet++ model downloaded`

---

## ❌ Backend Crash saat Startup

### Error: Model files still not available after download attempt

**Penyebab:** Download gagal atau URL tidak valid

**Solusi:**
1. Test URL di browser atau dengan curl:
   ```bash
   curl -I https://your-model-url.pth
   ```
   Harus return `200 OK`

2. Pastikan URL lengkap dan benar (termasuk `.pth` extension)

3. Check Railway logs untuk error detail saat download

---

## ❌ CORS Error

### Error: `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**Penyebab:** CORS_ORIGINS tidak di-set dengan domain Vercel

**Solusi:**
1. Set `CORS_ORIGINS` di Railway dengan URL Vercel:
   ```
   CORS_ORIGINS=https://your-app.vercel.app,https://your-app.vercel.app/*
   ```

2. Redeploy backend

---

## ❌ Preprocessing Error

### Error: `Image preprocessing failed`

**Penyebab:** Image format tidak didukung atau corrupt

**Solusi:**
- Pastikan upload file JPG, JPEG, atau PNG
- Check file size (max 10MB)
- Pastikan file tidak corrupt

---

## 📋 Checklist Debug

Jika masih error, check:

- [ ] Environment variables sudah di-set di Railway Dashboard
- [ ] URL model valid dan bisa diakses (test dengan curl)
- [ ] Model files ada di Railway Bucket dengan nama yang benar:
  - `unet_baseline_best.pth`
  - `unetplus.pth`
- [ ] Railway logs menunjukkan download berhasil
- [ ] Backend health check endpoint return `200 OK`
- [ ] CORS_ORIGINS sudah di-set dengan domain Vercel (jika sudah deploy frontend)

---

## 🔍 Debug Commands

### Test Backend Health:
```bash
curl https://your-railway-backend.railway.app/health
```

### Test Model Download (dari Railway container):
```bash
# SSH ke Railway container (jika available)
curl -I $MODEL_URL_UNET
curl -I $MODEL_URL_UNETPP
```

### Check Environment Variables:
```bash
# Di Railway logs, akan muncul:
# - MODEL_URL_UNET: SET/NOT SET
# - MODEL_URL_UNETPP: SET/NOT SET
# - curl available: YES/NO
```
