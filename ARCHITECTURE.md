# 🏗️ FLOOD SEGMENTATION WEB APPLICATION - SYSTEM ARCHITECTURE

## 📌 OVERVIEW

A modern, full-stack web application for flood area segmentation using deep learning (UNet & UNet++).

### Technology Stack

**Frontend:**
- Next.js 15 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Fetch API for backend communication

**Backend:**
- Python 3.10+
- FastAPI
- PyTorch 2.0+
- Segmentation Models PyTorch (smp)
- Pillow, NumPy, OpenCV

**Deployment:**
- Railway (Frontend + Backend in same container using Nixpacks)

---

## 🔄 SYSTEM FLOW

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERACTION                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND (Next.js)                                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  1. Upload Component (Drag & Drop)                       │  │
│  │     - File validation (type, size)                       │  │
│  │     - Preview uploaded image                             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                              ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  2. API Call (POST /api/segment)                         │  │
│  │     - Send image as multipart/form-data                  │  │
│  │     - Loading state & progress indicator                 │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  BACKEND (FastAPI)                                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  3. Receive Image & Preprocess                           │  │
│  │     - Decode uploaded file                               │  │
│  │     - Convert to RGB (PIL)                               │  │
│  │     - Resize to 256x256                                  │  │
│  │     - Normalize (ImageNet: mean, std)                    │  │
│  │     - Convert to PyTorch tensor                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                              ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  4. Model Inference (Parallel)                           │  │
│  │     ┌─────────────────────────────────────────────────┐  │  │
│  │     │ UNet Model (ResNet34 encoder)                   │  │  │
│  │     │  - Load once at startup                         │  │  │
│  │     │  - Forward pass → logits                        │  │  │
│  │     │  - Apply sigmoid → probabilities                │  │  │
│  │     │  - Threshold 0.5 → binary mask                  │  │  │
│  │     └─────────────────────────────────────────────────┘  │  │
│  │     ┌─────────────────────────────────────────────────┐  │  │
│  │     │ UNet++ Model (ResNet34 encoder)                 │  │  │
│  │     │  - Load once at startup                         │  │  │
│  │     │  - Forward pass → logits                        │  │  │
│  │     │  - Apply sigmoid → probabilities                │  │  │
│  │     │  - Threshold 0.5 → binary mask                  │  │  │
│  │     └─────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                              ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  5. Post-Processing & Analysis                           │  │
│  │     ┌──────────────────────────────────────────┐         │  │
│  │     │ Calculate Metrics:                       │         │  │
│  │     │  - Flood area percentage (UNet)          │         │  │
│  │     │  - Flood area percentage (UNet++)        │         │  │
│  │     │  - Total flood pixels                    │         │  │
│  │     │  - Disagreement map (XOR)                │         │  │
│  │     │  - Disagreement percentage               │         │  │
│  │     └──────────────────────────────────────────┘         │  │
│  │     ┌──────────────────────────────────────────┐         │  │
│  │     │ Generate Overlays:                       │         │  │
│  │     │  - Original image                        │         │  │
│  │     │  - UNet overlay (red mask)               │         │  │
│  │     │  - UNet++ overlay (blue mask)            │         │  │
│  │     │  - Disagreement overlay (purple)         │         │  │
│  │     └──────────────────────────────────────────┘         │  │
│  │     ┌──────────────────────────────────────────┐         │  │
│  │     │ Generate Text Summary:                   │         │  │
│  │     │  - Human-readable insights               │         │  │
│  │     │  - Model comparison                      │         │  │
│  │     │  - Disagreement analysis                 │         │  │
│  │     └──────────────────────────────────────────┘         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                              ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  6. Encode & Return JSON Response                        │  │
│  │     - Convert all images to base64                       │  │
│  │     - Package metrics & images                           │  │
│  │     - Return JSON response                               │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND (Next.js) - Results Display                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  7. Render Results (Responsive Layout)                   │  │
│  │                                                           │  │
│  │  Mobile (Stacked):                                        │  │
│  │    ┌────────────────────────────────────────┐            │  │
│  │    │ Original Image                         │            │  │
│  │    ├────────────────────────────────────────┤            │  │
│  │    │ UNet Result                            │            │  │
│  │    ├────────────────────────────────────────┤            │  │
│  │    │ UNet++ Result                          │            │  │
│  │    ├────────────────────────────────────────┤            │  │
│  │    │ Disagreement Map                       │            │  │
│  │    ├────────────────────────────────────────┤            │  │
│  │    │ Analysis Summary & Statistics          │            │  │
│  │    └────────────────────────────────────────┘            │  │
│  │                                                           │  │
│  │  Desktop (Two-Column):                                    │  │
│  │    ┌───────────────────┬────────────────────┐            │  │
│  │    │ Image Viewer      │ Analysis Panel     │            │  │
│  │    │ - Tabs:           │ - Statistics Table │            │  │
│  │    │   • Original      │ - Text Summary     │            │  │
│  │    │   • UNet          │ - Insights         │            │  │
│  │    │   • UNet++        │                    │            │  │
│  │    │   • Comparison    │                    │            │  │
│  │    └───────────────────┴────────────────────┘            │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 PROJECT STRUCTURE

```
segmentasiapp/
├── backend/                          # FastAPI Backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                   # FastAPI app & endpoints
│   │   ├── models.py                 # Model loader & inference
│   │   ├── preprocessing.py          # Image preprocessing
│   │   ├── postprocessing.py         # Mask processing & overlay
│   │   └── utils.py                  # Helper functions
│   ├── models_weights/               # Model checkpoints
│   │   ├── unet_baseline_best.pth
│   │   └── unetplus.pth
│   └── requirements.txt              # Python dependencies
│
├── app/                              # Next.js Frontend (App Router)
│   ├── page.tsx                      # Main upload page
│   ├── layout.tsx                    # Root layout
│   ├── globals.css                   # Global styles
│   └── api/
│       └── segment/
│           └── route.ts              # API proxy (optional)
│
├── components/                       # React Components
│   ├── UploadZone.tsx                # Drag & drop upload
│   ├── ImagePreview.tsx              # Image preview
│   ├── ResultsViewer.tsx             # Results display
│   ├── AnalysisPanel.tsx             # Statistics & insights
│   ├── ImageTabs.tsx                 # Tabbed image viewer
│   └── LoadingState.tsx              # Loading spinner
│
├── lib/                              # Utilities
│   ├── api.ts                        # API client functions
│   └── types.ts                      # TypeScript types
│
├── public/                           # Static assets
│
├── Models/                           # Training artifacts (existing)
│   ├── eksperimen_PCD_unet_dan_unet++.ipynb
│   ├── unet_baseline_best.pth
│   └── unetplus.pth
│
├── nixpacks.toml                     # Railway build config
├── railway.toml                      # Railway deployment config
├── start.sh                          # Startup script
├── Procfile                          # Alternative deployment
├── package.json                      # Node dependencies
├── tsconfig.json                     # TypeScript config
├── tailwind.config.ts                # Tailwind config
├── next.config.ts                    # Next.js config
└── README.md                         # Documentation
```

---

## 🔌 API SPECIFICATION

### Endpoint: POST /api/segment

**Request:**
```http
POST /api/segment
Content-Type: multipart/form-data

Body:
  file: <image-file>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "unet": {
      "flood_percent": 32.45,
      "flood_pixels": 21234,
      "total_pixels": 65536,
      "summary": "UNet detected significant flooding in 32.45% of the image area."
    },
    "unetpp": {
      "flood_percent": 28.13,
      "flood_pixels": 18432,
      "total_pixels": 65536,
      "summary": "UNet++ identified flooding in 28.13% of the image area, showing more conservative detection."
    },
    "comparison": {
      "disagreement_percent": 7.52,
      "agreement_percent": 92.48,
      "summary": "The models show 92.48% agreement. UNet predicted 4.32% more flooded area than UNet++, mainly in the central and eastern regions. This disagreement suggests areas of uncertainty that may require manual review."
    },
    "images": {
      "original": "data:image/png;base64,iVBORw0KGgoAAAANS...",
      "unet_overlay": "data:image/png;base64,iVBORw0KGgoAAAANS...",
      "unetpp_overlay": "data:image/png;base64,iVBORw0KGgoAAAANS...",
      "disagreement": "data:image/png;base64,iVBORw0KGgoAAAANS..."
    }
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Invalid file format. Please upload JPG, JPEG, or PNG image."
}
```

---

## 🎨 UI/UX DESIGN PRINCIPLES

### Design System

**Colors:**
- Primary: Blue (#3B82F6)
- Secondary: Indigo (#6366F1)
- Success: Green (#10B981)
- Warning: Amber (#F59E0B)
- Danger: Red (#EF4444)
- Background: Gray-50 (#F9FAFB)
- Card: White with shadow

**Typography:**
- Font: Inter (system-ui fallback)
- Headings: font-semibold to font-bold
- Body: font-normal

**Spacing:**
- Consistent Tailwind scale (4, 8, 12, 16, 24, 32px)
- Cards: p-6 (24px padding)
- Sections: gap-4 to gap-6

**Components:**
- Rounded corners: rounded-lg (8px)
- Shadows: shadow-md, shadow-lg
- Transitions: transition-all duration-200

### Responsive Breakpoints

- Mobile: < 768px (stacked layout)
- Tablet: 768px - 1024px (optimized columns)
- Desktop: > 1024px (full two-column)

---

## 🔐 PREPROCESSING PIPELINE (CRITICAL)

This must **exactly match** the training preprocessing:

```python
# 1. Image Loading
image = cv2.imread(path)
image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)  # Convert to RGB
# OR using PIL:
image = Image.open(path).convert('RGB')

# 2. Resize
image = cv2.resize(image, (256, 256))
# OR using PIL:
image = image.resize((256, 256), Image.BILINEAR)

# 3. Normalize (ImageNet statistics)
mean = [0.485, 0.456, 0.406]
std = [0.229, 0.224, 0.225]

# Convert to tensor and normalize
transform = transforms.Compose([
    transforms.ToTensor(),  # Converts to [0, 1] and CHW format
    transforms.Normalize(mean=mean, std=std)
])

# 4. Apply transform
tensor = transform(image)  # Shape: [3, 256, 256]

# 5. Add batch dimension
tensor = tensor.unsqueeze(0)  # Shape: [1, 3, 256, 256]

# 6. Move to device
tensor = tensor.to(device)
```

---

## 🧮 METRICS CALCULATION

### Flood Area Percentage
```python
flood_percent = (flood_pixels / total_pixels) * 100
```

### Disagreement Analysis
```python
# Binary masks (0 or 1)
mask_unet = (pred_unet > 0.5).astype(np.uint8)
mask_unetpp = (pred_unetpp > 0.5).astype(np.uint8)

# XOR operation (disagreement)
disagreement_mask = np.logical_xor(mask_unet, mask_unetpp).astype(np.uint8)

disagreement_pixels = np.sum(disagreement_mask)
disagreement_percent = (disagreement_pixels / total_pixels) * 100
```

### Overlay Generation
```python
# Original image (RGB)
overlay = image.copy()

# Red overlay for flood areas (semi-transparent)
overlay[mask > 0] = overlay[mask > 0] * 0.6 + np.array([255, 0, 0]) * 0.4
```

---

## 🚀 DEPLOYMENT STRATEGY

### Railway Deployment (Recommended)

**Unified Service: Frontend + Backend**
- Uses Nixpacks for automatic build detection
- Python 3.11 + Node.js 20 runtime
- Build configuration in `nixpacks.toml`
- Deployment configuration in `railway.toml`
- Start script: `start.sh` (runs both services)
- Environment variables:
  - `PYTHONUNBUFFERED=1`
  - `OPENCV_HEADLESS=1`
  - `NEXT_PUBLIC_API_URL=` (empty for internal routing)
  - `MODEL_PATH_UNET=<path>` (optional, for Railway Storage)
  - `MODEL_PATH_UNETPP=<path>` (optional, for Railway Storage)

**Deployment Process:**
1. Connect GitHub repository to Railway
2. Railway auto-detects `nixpacks.toml`
3. Builds Python and Node.js dependencies
4. Runs `start.sh` to launch both services
5. Frontend proxies `/api/*` to backend

See [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md) for detailed guide.

---

## 📊 PERFORMANCE CONSIDERATIONS

### Backend Optimization
- Load models once at startup (not per request)
- Use CPU if GPU unavailable
- Batch processing not needed (single image)
- Consider model quantization for faster inference

### Frontend Optimization
- Image compression before upload
- Lazy load result components
- Skeleton loaders during inference
- Caching for repeated uploads

### Expected Latency
- Image upload: < 1s
- Preprocessing: < 0.1s
- UNet inference: 0.2-0.5s (CPU), 0.05-0.1s (GPU)
- UNet++ inference: 0.3-0.7s (CPU), 0.07-0.15s (GPU)
- Post-processing: < 0.2s
- **Total: 1-3 seconds** (CPU), 0.5-1.5s (GPU)

---

## 🔍 QUALITY ASSURANCE

### Testing Checklist
- [ ] Upload validates file type and size
- [ ] Preview displays uploaded image correctly
- [ ] API returns correct JSON structure
- [ ] Preprocessing matches training pipeline
- [ ] Both models load successfully
- [ ] Inference produces valid masks
- [ ] Metrics calculated correctly
- [ ] Overlays render properly
- [ ] Responsive design works on mobile
- [ ] Error handling for invalid inputs
- [ ] Loading states display correctly

### Model Validation
- Test with sample images from test set
- Compare metrics with notebook results
- Verify visual quality of segmentations

---

## 📚 NEXT STEPS

1. ✅ Review this architecture
2. → Generate backend code (FastAPI)
3. → Generate frontend code (Next.js)
4. → Create deployment configurations
5. → Write testing procedures
6. → Deploy to Railway

---

**Status:** Architecture Complete ✅  
**Next:** Backend Implementation

