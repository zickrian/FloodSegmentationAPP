# Railway Buckets Setup untuk Model Files (4.3 GB)

## Overview

Karena model files berukuran **4.3 GB** melebihi batas build Railway (4 GB max), kita menggunakan **Railway Buckets** (Object Storage) untuk menyimpan model dan mendownloadnya saat runtime.

## Strategi

1. **Build Phase**: Model files di-exclude dari build image menggunakan `.dockerignore`
2. **Runtime Phase**: Model files di-download dari Railway Bucket saat startup
3. **Result**: Build image tetap kecil (< 4 GB), model tersedia saat runtime

## Langkah Setup

### 1. Install Railway CLI (Opsional tapi Direkomendasikan)

```bash
# Windows (PowerShell)
iwr https://railway.app/install.sh | iex

# macOS
curl -fsSL https://railway.app/install.sh | sh

# Linux
curl -fsSL https://railway.app/install.sh | sh
```

### 2. Login ke Railway

```bash
railway login
```

### 3. Link Project ke Railway

```bash
cd path/to/segmentasiapp
railway link
# Pilih project yang sudah dibuat di Railway Dashboard
```

### 4. Buat Railway Bucket

**Via Railway Dashboard:**
1. Buka Railway Dashboard → Project Anda
2. Klik "New" → "Database" → "Bucket"
3. Nama bucket: `flood-segmentation-models`
4. Klik "Create"

**Via Railway CLI:**
```bash
railway bucket create flood-segmentation-models
```

### 5. Upload Model Files ke Bucket

**Via Railway Dashboard:**
1. Buka bucket yang baru dibuat
2. Klik "Upload" atau drag & drop
3. Upload:
   - `unet_baseline_best.pth`
   - `unetplus.pth`
4. Tunggu upload selesai (bisa beberapa menit untuk 4.3 GB)

**Via Railway CLI:**
```bash
# Pastikan file model ada di folder Models/
railway bucket upload flood-segmentation-models Models/unet_baseline_best.pth
railway bucket upload flood-segmentation-models Models/unetplus.pth
```

### 6. Dapatkan Public URLs

**Via Railway Dashboard:**
1. Buka bucket → Klik pada file yang sudah di-upload
2. Copy "Public URL" atau "Download URL"
3. URL format: `https://[bucket-id].railway.app/[filename]`

**Via Railway CLI:**
```bash
railway bucket list flood-segmentation-models
# Akan menampilkan URLs untuk setiap file
```

### 7. Set Environment Variables di Railway

Di Railway Dashboard → Project → Variables, tambahkan:

```
MODEL_URL_UNET=https://[bucket-id].railway.app/unet_baseline_best.pth
MODEL_URL_UNETPP=https://[bucket-id].railway.app/unetplus.pth
```

**Atau jika menggunakan bucket name:**
```
RAILWAY_BUCKET_NAME=flood-segmentation-models
```

### 8. Deploy

Railway akan otomatis:
1. Build aplikasi (tanpa model files - di-exclude oleh `.dockerignore`)
2. Saat startup, `start.sh` akan:
   - Check apakah model files ada
   - Jika tidak ada, download dari Railway Bucket
   - Verify model files
   - Start backend dan frontend

## Verifikasi

### Check Logs

Setelah deploy, check Railway logs untuk memastikan:

```
✅ Model files verified
Starting FastAPI Backend on port 8000...
Backend is running!
Starting Next.js Frontend on port 3000...
```

### Test API

```bash
curl https://your-app.railway.app/health
# Should return: {"status": "healthy", "models_loaded": true, ...}
```

## Troubleshooting

### Error: "Model files not found"

**Kemungkinan penyebab:**
1. Environment variables tidak di-set
2. Railway Bucket URLs salah
3. File belum di-upload ke bucket
4. Bucket tidak accessible

**Solusi:**
1. Verify environment variables di Railway Dashboard
2. Test URLs di browser - harus bisa download file
3. Re-upload files ke bucket jika perlu
4. Check Railway logs untuk error details

### Error: "Failed to download UNet model"

**Kemungkinan penyebab:**
1. URL tidak valid
2. Network timeout (file terlalu besar)
3. Bucket permissions

**Solusi:**
1. Verify URL format: `https://[bucket-id].railway.app/[filename]`
2. Check Railway Bucket settings - pastikan public access enabled
3. Coba download manual di browser untuk test
4. Check Railway logs untuk detailed error

### Build masih terlalu besar

**Kemungkinan penyebab:**
1. `.dockerignore` tidak bekerja
2. Model files masih masuk ke build

**Solusi:**
1. Verify `.dockerignore` berisi:
   ```
   Models/
   **/*.pth
   **/*.pt
   ```
2. Check build logs - seharusnya tidak ada file model di build
3. Re-deploy setelah fix `.dockerignore`

## File Structure

```
segmentasiapp/
├── .dockerignore          # Excludes Models/ from build
├── start.sh               # Downloads models at runtime
├── Models/                # Created at runtime (not in build)
│   ├── unet_baseline_best.pth  # Downloaded from bucket
│   └── unetplus.pth            # Downloaded from bucket
└── backend/
    └── app/
        └── main.py        # Reads from Models/ folder
```

## Best Practices

1. **Bucket Naming**: Gunakan nama yang jelas dan konsisten
2. **Version Control**: Simpan bucket URLs di environment variables, bukan hardcode
3. **Monitoring**: Monitor Railway logs untuk memastikan download berhasil
4. **Backup**: Backup model files secara terpisah (selain Railway Bucket)
5. **Caching**: Model files di-cache di `Models/` folder setelah download pertama

## Cost Considerations

- Railway Buckets: Free tier tersedia dengan limits tertentu
- Storage: 4.3 GB model files akan menggunakan storage quota
- Bandwidth: Download saat startup akan menggunakan bandwidth quota
- Check Railway pricing untuk details

## Alternative: External Storage

Jika Railway Buckets tidak cocok, alternatif:

1. **AWS S3 / Google Cloud Storage**
   - Upload models ke S3/GCS
   - Set environment variables dengan S3/GCS URLs
   - Update `start.sh` untuk download dari S3/GCS

2. **Git LFS** (untuk model < 1 GB)
   - Track dengan Git LFS
   - Railway akan pull LFS files otomatis
   - **Tidak cocok untuk 4.3 GB** (melebihi GitHub LFS quota gratis)

## Support

Jika ada masalah:
1. Check Railway logs
2. Verify bucket configuration
3. Test URLs manually
4. Review `start.sh` script
5. Check `.dockerignore` configuration

---

Last updated: 2025-12-11
