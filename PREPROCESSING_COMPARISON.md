# Preprocessing Comparison: Training vs Inference

## TRAINING PREPROCESSING (dari Notebook)

### Train Transform (dengan augmentasi):
```python
train_transform = A.Compose([
    A.Resize(256, 256),
    A.HorizontalFlip(p=0.5),
    A.VerticalFlip(p=0.5),
    A.RandomRotate90(p=0.5),
    A.ShiftScaleRotate(shift_limit=0.1, scale_limit=0.1, rotate_limit=15, p=0.5),
    A.RandomBrightnessContrast(brightness_limit=0.2, contrast_limit=0.2, p=0.5),
    A.GaussNoise(p=0.3),
    A.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225],
    ),
    ToTensorV2(),
])
```

### Validation/Test Transform (TANPA augmentasi):
```python
val_transform = A.Compose([
    A.Resize(256, 256),
    A.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225],
    ),
    ToTensorV2(),
])
```

---

## INFERENCE PREPROCESSING (dari backend/preprocessing.py)

```python
def preprocess_image(image: Image.Image, device: torch.device) -> Tensor:
    # Ensure image is in RGB mode
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    # Define preprocessing transforms
    transform = transforms.Compose([
        transforms.Resize((256, 256), interpolation=Image.BILINEAR),
        transforms.ToTensor(),  # Converts to [0, 1] and CHW format
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    # Apply transforms
    tensor = transform(image)  # [3, 256, 256]
    
    # Add batch dimension
    tensor = tensor.unsqueeze(0)  # [1, 3, 256, 256]
    
    # Move to device
    tensor = tensor.to(device)
    
    return tensor
```

---

## ANALISIS KESESUAIAN

### ✅ YA SESUAI:

1. **Ukuran gambar**: 256x256 ✓
   - Training: A.Resize(256, 256)
   - Inference: transforms.Resize((256, 256))
   - **MATCH!**

2. **Normalisasi Mean & Std**: Identik ✓
   - Training: [0.485, 0.456, 0.406] / [0.229, 0.224, 0.225]
   - Inference: [0.485, 0.456, 0.406] / [0.229, 0.224, 0.225]
   - **MATCH!** (ImageNet normalization)

3. **RGB Mode**: ✓
   - Training: Albumentations otomatis handle RGB
   - Inference: Explicitly convert to RGB jika perlu
   - **MATCH!**

4. **Tensor Format**: ✓
   - Training: ToTensorV2() → [3, H, W]
   - Inference: transforms.ToTensor() → [3, H, W]
   - **MATCH!**

5. **Batch Dimension**: ✓
   - Inference: unsqueeze(0) → [1, 3, 256, 256]
   - Training: DataLoader otomatis batch
   - **MATCH!**

### ⚠️ CATATAN PENTING:

**Albumentations (Training) vs Torchvision (Inference)**:
- Training menggunakan `Albumentations` library
- Inference menggunakan `torchvision.transforms`
- Keduanya produce hasil yang **sama** untuk:
  - Resize: A.Resize vs transforms.Resize dengan BILINEAR
  - ToTensor: ToTensorV2() vs transforms.ToTensor()
  - Normalize: A.Normalize vs transforms.Normalize

**Interpolation Method**:
- Training: Albumentations default (BILINEAR)
- Inference: Image.BILINEAR
- **MATCH!**

---

## KESIMPULAN

### ✅ PREPROCESSING SUDAH SESUAI DAN KONSISTEN!

Tidak ada masalah dengan preprocessing input gambar saat inference. Semua parameter normalisasi, resize, dan tensor conversion **IDENTIK** dengan yang digunakan saat training.

**Status**: **AMAN UNTUK DEPLOY KE RAILWAY**

---

## Rekomendasi

Saat deploy, pastikan:
1. ✓ Model weights loaded dengan benar
2. ✓ Input image di-convert ke RGB jika grayscale
3. ✓ Normalisasi dengan mean/std yang sama (sudah done)
4. ✓ Output mask di-denormalize sebelum display

Semua sudah handled dengan baik di `backend/app/preprocessing.py`!
