# Git Large File Storage (LFS) Setup

## Overview

File model PyTorch (`.pth` dan `.pt`) yang berukuran besar (>100MB) di-track menggunakan Git LFS untuk menghindari batasan ukuran file GitHub.

## Prerequisites

1. Install Git LFS:
   ```bash
   # Windows (dengan Chocolatey)
   choco install git-lfs
   
   # Windows (dengan Scoop)
   scoop install git-lfs
   
   # macOS
   brew install git-lfs
   
   # Linux (Ubuntu/Debian)
   sudo apt-get install git-lfs
   ```

2. Initialize Git LFS di repository:
   ```bash
   git lfs install
   ```

## Konfigurasi

File `.gitattributes` sudah dikonfigurasi untuk track file berikut:
- `*.pth` - PyTorch model files
- `*.pt` - PyTorch model files
- `Models/*.pth` - Model files di folder Models
- `Models/*.pt` - Model files di folder Models

## Menambahkan File Model ke Git LFS

### Jika file model sudah ada di repository:

1. Track file yang sudah ada:
   ```bash
   git lfs track "*.pth"
   git lfs track "*.pt"
   git lfs track "Models/*.pth"
   git lfs track "Models/*.pt"
   ```

2. Migrate file yang sudah ada ke LFS:
   ```bash
   git lfs migrate import --include="*.pth,*.pt" --everything
   ```

### Jika file model baru:

1. Pastikan Git LFS sudah di-install dan di-initialize
2. Tambahkan file ke staging:
   ```bash
   git add Models/unet_baseline_best.pth
   git add Models/unetplus.pth
   ```
   
   Git LFS akan otomatis track file-file ini berdasarkan `.gitattributes`

3. Commit dan push:
   ```bash
   git commit -m "Add model files with Git LFS"
   git push origin main
   ```

## Verifikasi

Cek apakah file di-track oleh Git LFS:
```bash
git lfs ls-files
```

Output yang diharapkan:
```
abc123def456 * Models/unet_baseline_best.pth
def456abc123 * Models/unetplus.pth
```

## Clone Repository dengan Git LFS

Saat clone repository, file LFS akan otomatis di-download:
```bash
git clone <repository-url>
cd segmentasiapp
```

Jika file LFS tidak ter-download otomatis:
```bash
git lfs pull
```

## Troubleshooting

### File tidak di-track oleh LFS

1. Pastikan `.gitattributes` sudah di-commit:
   ```bash
   git add .gitattributes
   git commit -m "Add Git LFS configuration"
   ```

2. Pastikan Git LFS sudah di-install:
   ```bash
   git lfs version
   ```

3. Re-track file:
   ```bash
   git rm --cached Models/*.pth
   git add Models/*.pth
   ```

### File terlalu besar untuk push

1. Pastikan Git LFS sudah di-install dan di-initialize
2. Cek apakah file sudah di-track:
   ```bash
   git lfs ls-files
   ```

3. Jika belum, migrate file:
   ```bash
   git lfs migrate import --include="*.pth" --everything
   ```

### Error saat clone

Jika saat clone file LFS tidak ter-download:
```bash
git lfs install
git lfs pull
```

## Path Model di Aplikasi

Aplikasi membaca model dari folder `Models/` di root project:
- `Models/unet_baseline_best.pth` - UNet model
- `Models/unetplus.pth` - UNet++ model

Path ini dikonfigurasi di `backend/app/main.py` dengan fallback ke environment variables untuk deployment.

## Catatan Penting

1. **GitHub LFS Quota**: GitHub menyediakan 1GB storage dan 1GB bandwidth per bulan untuk Git LFS (gratis). Untuk kebutuhan lebih besar, perlu upgrade ke GitHub Pro atau menggunakan alternatif.

2. **File Size**: Git LFS cocok untuk file >100MB. File kecil (<50MB) bisa tetap di-track normal.

3. **Backup**: Selalu backup file model secara terpisah sebagai cadangan.

4. **Team Collaboration**: Semua anggota tim perlu install Git LFS untuk bisa clone dan bekerja dengan repository.

## Referensi

- [Git LFS Documentation](https://git-lfs.github.com/)
- [GitHub Git LFS Guide](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-git-large-file-storage)
- [Git LFS Tutorial](https://www.atlassian.com/git/tutorials/git-lfs)
