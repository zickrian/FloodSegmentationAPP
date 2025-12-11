# Flood Segmentation Backend (FastAPI)

## Overview

FastAPI backend for flood area segmentation using UNet and UNet++ deep learning models.

## Features

- **Dual Model Inference:** UNet and UNet++ for comparison
- **Automatic Preprocessing:** Matches training pipeline exactly
- **Comprehensive Analysis:** Flood metrics, overlays, and summaries
- **REST API:** Simple POST endpoint for segmentation
- **Production Ready:** Docker support, health checks, logging

## Prerequisites

- Python 3.10+
- PyTorch 2.0+
- Model weight files:
  - `models_weights/unet_baseline_best.pth`
  - `models_weights/unetplus.pth`

## Installation

### Local Development

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create models_weights directory
mkdir models_weights

# Copy model files
cp ../Models/unet_baseline_best.pth models_weights/
cp ../Models/unetplus.pth models_weights/

# Run server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Docker

```bash
# Build image
docker build -t flood-segmentation-backend .

# Run container
docker run -p 8000:8000 flood-segmentation-backend
```

## API Endpoints

### 1. Health Check

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

### 2. Segment Image

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
    "unetpp": {
      "flood_percent": 28.13,
      "flood_pixels": 18432,
      "total_pixels": 65536,
      "summary": "..."
    },
    "comparison": {
      "disagreement_percent": 7.52,
      "agreement_percent": 92.48,
      "summary": "..."
    },
    "images": {
      "original": "data:image/png;base64,...",
      "unet_overlay": "data:image/png;base64,...",
      "unetpp_overlay": "data:image/png;base64,...",
      "disagreement": "data:image/png;base64,..."
    }
  }
}
```

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app & routes
│   ├── models.py            # Model loading & inference
│   ├── preprocessing.py     # Image preprocessing
│   ├── postprocessing.py    # Analysis & overlays
│   └── utils.py             # Helper functions
├── models_weights/
│   ├── unet_baseline_best.pth
│   └── unetplus.pth
├── requirements.txt
├── Dockerfile
└── README.md
```

## Configuration

Environment variables (`.env`):

```bash
MODEL_PATH_UNET=./models_weights/unet_baseline_best.pth
MODEL_PATH_UNETPP=./models_weights/unetplus.pth
DEVICE=cpu
```

## Testing

```bash
# Test with curl
curl -X POST http://localhost:8000/api/segment \
  -F "file=@test_image.jpg"

# Test with Python
python test_api.py
```

## Deployment

### Railway

1. Create new project on Railway
2. Connect your GitHub repository
3. Add environment variables
4. Deploy automatically

### Other Platforms

Compatible with:
- Heroku
- Google Cloud Run
- AWS ECS
- Azure Container Instances

## Performance

- **Model Loading:** ~2-5 seconds (startup)
- **Inference Time:**
  - CPU: 1-3 seconds per image
  - GPU: 0.3-0.7 seconds per image

## Troubleshooting

**Models not loading:**
- Check model file paths
- Verify file permissions
- Check available memory

**Slow inference:**
- Use GPU if available
- Reduce image size
- Consider model quantization

**CORS errors:**
- Update CORS_ORIGINS in environment variables
- Check frontend URL matches allowed origins

## License

MIT License

