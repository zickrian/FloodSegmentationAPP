# 🚀 DEPLOYMENT KE RAILWAY - STEP BY STEP

## ✅ STEP 1: Persiapan Lokal (SUDAH SIAP)

File yang sudah saya setup:
- ✅ `railway.toml` - Konfigurasi Railway
- ✅ `.gitignore` - Exclude model files (*.pth)
- ✅ `main.py` - Flexible model path loading

## 📤 STEP 2: Push ke GitHub

```powershell
cd "e:\GUI Segmentasi\segmentasiapp"

# Initialize git (jika belum)
git init

# Add semua files KECUALI model files (sudah di .gitignore)
git add .

# Commit
git commit -m "Ready for Railway deployment - models to be uploaded separately"

# Setup remote (ganti USERNAME dengan GitHub username Anda)
git remote add origin https://github.com/USERNAME/segmentasiapp.git

# Rename branch ke main (jika perlu)
git branch -M main

# Push ke GitHub
git push -u origin main
```

**⚠️ PENTING**: Model files (.pth) TIDAK akan ter-push (sudah di .gitignore)

---

## 🚂 STEP 3: Setup di Railway

### 3.1 Buat Railway Account
1. Buka https://railway.app
2. Click **"Sign Up"**
3. Login dengan **GitHub** (recommended)
4. Verify email

### 3.2 Create New Project
1. Klik **"New Project"**
2. Select **"Deploy from GitHub"**
3. Authorize Railway dengan GitHub account Anda
4. Pilih repository **`segmentasiapp`**

### 3.3 Railway Auto-Detects
Railway akan otomatis detect:
- ✅ Node.js (untuk frontend)
- ✅ Python (untuk backend)
- ✅ `railway.toml` (untuk configuration)

Railway akan membuat 2 services:
- **Backend** (Python/FastAPI)
- **Frontend** (Node.js/Next.js)

---

## 📦 STEP 4: Upload Model Files ke Railway Storage

### 4.1 Buka Railway Dashboard
1. Go to https://railway.app/dashboard
2. Pilih project `segmentasiapp`
3. Lihat services yang dibuat

### 4.2 Setup Model Storage
Ada 2 opsi:

#### **OPSI A: Gunakan Railway Disk Storage** (RECOMMENDED)
```powershell
# Install Railway CLI
npm install -g @railway/cli

# Login ke Railway
railway login

# Di folder project
railway link  # pilih project Anda

# Upload model files ke /models directory
railway run mkdir -p /models

# Copy model files
# Gunakan Railway Dashboard → Variables → RAILWAY_VOLUME_MOUNT_PATH
```

#### **OPSI B: Download Models saat Startup** (LEBIH MUDAH)
Buat script untuk auto-download dari Hugging Face (nanti saya bantu)

#### **OPSI C: Manual Upload via Railway Dashboard**
1. Railway Dashboard → Storage
2. Upload file langsung

---

## 🔑 STEP 5: Set Environment Variables

Di Railway Dashboard:

### Backend Service Variables:
```
MODEL_PATH_UNET=/models/unet_baseline_best.pth
MODEL_PATH_UNETPP=/models/unetplus.pth
PYTHONUNBUFFERED=1
```

### Frontend Service Variables:
```
NEXT_PUBLIC_API_URL=https://[backend-deployment-url].railway.app
```

---

## ✨ STEP 6: Deploy!

Setelah push ke GitHub:
1. Railway akan **auto-build** dari `railway.toml`
2. Tunggu ~5-10 menit untuk build selesai
3. Frontend dan Backend akan **live automatically**

Cek status:
- Railway Dashboard → Deployments → lihat logs

---

## 🎯 TROUBLESHOOTING

### Model files not found?
✅ Set `MODEL_PATH_UNET` dan `MODEL_PATH_UNETPP` di variables

### Frontend dapat't reach backend?
✅ Check `NEXT_PUBLIC_API_URL` di frontend variables

### Build gagal?
✅ Cek Railway logs untuk error details

---

## 📍 FINAL URLs

Setelah deploy sukses:

```
Frontend: https://[project-name].railway.app
Backend:  https://[project-name]-api.railway.app

API Health Check: https://[project-name]-api.railway.app/health
```

---

## 🎓 RINGKASAN SINGKAT

1. ✅ **Sudah setup**: `railway.toml`, `.gitignore`, `main.py`
2. **Next**: Push ke GitHub
3. **Then**: Connect ke Railway
4. **Finally**: Upload model files + set variables
5. **DONE**: Live production! 🚀

---

**PERTANYAAN?**

Tanyakan step mana yang belum jelas! 👇
