# 🌊 Flood Segmentation Web Application

Advanced flood area detection using deep learning (UNet & UNet++) with a modern web interface.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Python](https://img.shields.io/badge/python-3.11+-blue.svg)
![Next.js](https://img.shields.io/badge/next.js-15.1-black.svg)

## 🎯 Features

- **Dual Model Analysis:** Compare UNet and UNet++ predictions
- **Interactive UI:** Modern, responsive design for desktop and mobile
- **Real-time Processing:** Get results in 1-3 seconds
- **Comprehensive Metrics:** Flood area percentage, pixel counts, and model agreement
- **Visual Overlays:** Color-coded segmentation masks
- **Disagreement Analysis:** See where models differ
- **Production Ready:** Deployed to Render with Docker

## 🏗️ Architecture

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Next.js   │ ───> │   FastAPI   │ ───> │  PyTorch    │
│  Frontend   │      │   Backend   │      │   Models    │
└─────────────┘      └─────────────┘      └─────────────┘
```

**Frontend:**
- Next.js 15 (App Router)
- React 18
- Tailwind CSS
- TypeScript

**Backend:**
- FastAPI
- PyTorch 2.1 (CPU)
- Segmentation Models PyTorch
- Pillow, NumPy, OpenCV-Headless

**Models:**
- UNet (ResNet34 encoder)
- UNet++ (ResNet34 encoder)
- Trained on flood segmentation dataset (290 images)
- Test IoU: 80.35% (UNet), 81.48% (UNet++)

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+

### Local Development Setup

1. **Clone repository:**

```bash
git clone https://github.com/yourusername/flood-segmentation.git
cd flood-segmentation
```

2. **Setup Backend:**

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run backend (models will be loaded from ../Models/)
uvicorn app.main:app --reload --port 8000
```

Backend will run on `http://localhost:8000`

3. **Setup Frontend:**

```bash
# In new terminal, from project root
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Run frontend
npm run dev
```

Frontend will run on `http://localhost:3000`

4. **Test:**

Open `http://localhost:3000` and upload a flood image!

## 📦 Project Structure

```
flood-segmentation/
├── app/                      # Next.js pages (App Router)
│   ├── page.tsx             # Main upload page
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── UploadZone.tsx       # Drag & drop upload
│   ├── ImagePreview.tsx     # Image preview
│   ├── LoadingState.tsx     # Loading animation
│   ├── ImageTabs.tsx        # Tabbed image viewer
│   ├── AnalysisPanel.tsx    # Statistics & insights
│   └── ResultsViewer.tsx    # Complete results view
├── lib/                     # Utilities
│   ├── api.ts               # API client
│   ├── types.ts             # TypeScript types
│   └── utils.ts             # Helper functions
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── main.py          # FastAPI app
│   │   ├── models.py        # Model loading
│   │   ├── preprocessing.py # Image preprocessing
│   │   ├── postprocessing.py# Analysis generation
│   │   └── utils.py         # Helpers
│   ├── Dockerfile           # Docker configuration for Render
│   └── requirements.txt     # Python dependencies
├── Models/                  # Pre-trained model weights
│   ├── unet_baseline_best.pth
│   └── unetplus.pth
├── render.yaml              # Render deployment configuration
└── README.md               # This file
```

## 🚀 Deployment on Render

This application is configured for easy deployment to [Render](https://render.com) using Docker.

### Method 1: Blueprint (Recommended)

1. Fork/clone this repository to your GitHub account
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click **New +** → **Blueprint**
4. Connect your GitHub repository
5. Render will auto-detect `render.yaml` and configure everything
6. Click **Apply** to deploy

### Method 2: Manual Web Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Runtime:** Docker
   - **Docker Build Context:** `.` (root)
   - **Dockerfile Path:** `backend/Dockerfile`
5. Add environment variables:
   - `CORS_ORIGINS`: `*` (or your frontend URL)
   - `PYTHONUNBUFFERED`: `1`
6. Click **Deploy**

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port (auto-set by Render) | 8000 |
| `CORS_ORIGINS` | Allowed CORS origins | `*` |
| `PYTHONUNBUFFERED` | Python output buffering | `1` |
| `MODEL_PATH_UNET` | Custom UNet model path | `/Models/unet_baseline_best.pth` |
| `MODEL_PATH_UNETPP` | Custom UNet++ model path | `/Models/unetplus.pth` |

## 📊 Model Performance

From training on flood segmentation dataset:

| Model | Test IoU | Test Dice | Pixel Accuracy |
|-------|----------|-----------|----------------|
| UNet | 80.35% | 89.06% | 91.11% |
| UNet++ | 81.48% | 89.77% | 91.58% |

## 📝 API Documentation

### Endpoints

#### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "models_loaded": true,
  "device": "cpu"
}
```

#### Segment Image
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
      "summary": "..."
    },
    "unetpp": { ... },
    "comparison": { ... },
    "images": {
      "original": "data:image/png;base64,...",
      "unet_overlay": "data:image/png;base64,...",
      "unetpp_overlay": "data:image/png;base64,...",
      "disagreement": "data:image/png;base64,..."
    }
  }
}
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Segmentation Models PyTorch](https://github.com/qubvel/segmentation_models.pytorch)
- [FastAPI](https://fastapi.tiangolo.com/)
- [Next.js](https://nextjs.org/)
- [Flood Dataset](https://www.kaggle.com/datasets/faizalkarim/flood-area-segmentation)

---

**Built with ❤️ using Next.js, FastAPI, and PyTorch**
