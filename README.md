# 🌊 Flood Segmentation Web Application

Advanced flood area detection using deep learning (UNet & UNet++) with a modern web interface.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Python](https://img.shields.io/badge/python-3.10+-blue.svg)
![Next.js](https://img.shields.io/badge/next.js-15.1-black.svg)

## 🎯 Features

- **Dual Model Analysis:** Compare UNet and UNet++ predictions
- **Interactive UI:** Modern, responsive design for desktop and mobile
- **Real-time Processing:** Get results in 1-3 seconds
- **Comprehensive Metrics:** Flood area percentage, pixel counts, and model agreement
- **Visual Overlays:** Color-coded segmentation masks
- **Disagreement Analysis:** See where models differ
- **Production Ready:** Deployed to Railway with Docker support

## 📸 Screenshots

### Upload Interface
![Upload Interface](docs/screenshots/upload.png)

### Results View
![Results View](docs/screenshots/results.png)

### Mobile View
![Mobile View](docs/screenshots/mobile.png)

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
- PyTorch 2.1
- Segmentation Models PyTorch
- Pillow, NumPy, OpenCV

**Models:**
- UNet (ResNet34 encoder)
- UNet++ (ResNet34 encoder)
- Trained on flood segmentation dataset (290 images)
- Test IoU: 80.35% (UNet), 81.48% (UNet++)

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- Model weight files (see [Setup](#setup))

### Setup

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

# Copy model weights
mkdir models_weights
cp ../Models/unet_baseline_best.pth models_weights/
cp ../Models/unetplus.pth models_weights/

# Run backend
uvicorn app.main:app --reload
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
│   ├── models_weights/      # Model checkpoints
│   ├── requirements.txt     # Python dependencies
│   └── Dockerfile          # Docker configuration
├── Models/                  # Training artifacts
│   ├── eksperimen_PCD_unet_dan_unet++.ipynb
│   ├── unet_baseline_best.pth
│   └── unetplus.pth
├── ARCHITECTURE.md          # System architecture
├── DEPLOYMENT.md            # Deployment guide
├── TESTING.md               # Testing procedures
└── README.md               # This file
```

## 🧪 Testing

### Backend Tests

```bash
cd backend
pytest tests/ -v
```

### Frontend Tests

```bash
npm test
```

### End-to-End Test

```bash
python test_e2e.py
```

See [TESTING.md](TESTING.md) for comprehensive testing guide.

## 🚀 Deployment

### Railway (Recommended)

1. **Backend:**
   - Create new project on Railway
   - Connect GitHub repository
   - Set root directory to `backend/`
   - Add environment variables (see [DEPLOYMENT.md](DEPLOYMENT.md))
   - Deploy

2. **Frontend:**
   - Create new service in same project
   - Connect same repository
   - Set `NEXT_PUBLIC_API_URL` to backend URL
   - Deploy

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

### Docker

```bash
# Backend
cd backend
docker build -t flood-backend .
docker run -p 8000:8000 flood-backend

# Frontend
docker build -t flood-frontend .
docker run -p 3000:3000 flood-frontend
```

## 📊 Model Performance

From training on flood segmentation dataset:

| Model | Test IoU | Test Dice | Pixel Accuracy |
|-------|----------|-----------|----------------|
| UNet | 80.35% | 89.06% | 91.11% |
| UNet++ | 81.48% | 89.77% | 91.58% |

### Sample Results

**Image 1: Urban Flooding**
- UNet: 34.2% flooded
- UNet++: 31.8% flooded
- Agreement: 94.3%

**Image 2: River Overflow**
- UNet: 56.7% flooded
- UNet++: 58.1% flooded
- Agreement: 96.1%

## 🎨 UI/UX Design

### Design Principles
- **Minimalistic:** Clean, focused interface
- **Responsive:** Mobile-first design
- **Accessible:** WCAG 2.1 AA compliant
- **Fast:** Optimized for performance
- **Intuitive:** Clear user flow

### Color Palette
- Primary: Blue (#3B82F6)
- Secondary: Indigo (#6366F1)
- Accent: Purple (#8B5CF6)
- Success: Green (#10B981)
- Warning: Red (#EF4444)

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

## 🔧 Configuration

### Environment Variables

**Backend:**
```env
MODEL_PATH_UNET=./models_weights/unet_baseline_best.pth
MODEL_PATH_UNETPP=./models_weights/unetplus.pth
DEVICE=cpu
CORS_ORIGINS=http://localhost:3000
```

**Frontend:**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
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

## 👥 Authors

- Your Name - Initial work - [@yourusername](https://github.com/yourusername)

## 🙏 Acknowledgments

- [Segmentation Models PyTorch](https://github.com/qubvel/segmentation_models.pytorch)
- [FastAPI](https://fastapi.tiangolo.com/)
- [Next.js](https://nextjs.org/)
- [Flood Dataset](https://www.kaggle.com/datasets/faizalkarim/flood-area-segmentation)

## 📞 Support

For support, email your.email@example.com or open an issue on GitHub.

## 🔮 Future Enhancements

- [ ] Add more segmentation models (DeepLabV3+, PSPNet)
- [ ] Batch processing for multiple images
- [ ] Historical analysis dashboard
- [ ] Export results to PDF
- [ ] Mobile app (React Native)
- [ ] Real-time video segmentation
- [ ] Integration with GIS systems
- [ ] Multi-language support
- [ ] API authentication
- [ ] Advanced analytics and reporting

## 📈 Roadmap

### Version 1.1 (Q1 2024)
- Batch processing
- PDF export
- Advanced analytics

### Version 1.2 (Q2 2024)
- Mobile app
- Real-time video
- GIS integration

### Version 2.0 (Q3 2024)
- Additional models
- Enterprise features
- API marketplace

---

**Built with ❤️ using Next.js, FastAPI, and PyTorch**

**Demo:** https://your-app.railway.app  
**Documentation:** https://docs.your-app.com  
**API:** https://api.your-app.railway.app
