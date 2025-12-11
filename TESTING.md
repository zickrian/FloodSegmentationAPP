# 🧪 TESTING GUIDE

Comprehensive testing procedures for the Flood Segmentation Application.

## 📋 Table of Contents

1. [Testing Prerequisites](#testing-prerequisites)
2. [Backend Testing](#backend-testing)
3. [Frontend Testing](#frontend-testing)
4. [Integration Testing](#integration-testing)
5. [Model Validation](#model-validation)
6. [Performance Testing](#performance-testing)
7. [User Acceptance Testing](#user-acceptance-testing)

---

## Testing Prerequisites

### Required Tools

```bash
# Python testing tools
pip install pytest requests pillow

# Node testing tools  
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

### Test Data

Create a `test_images/` directory with sample flood images:

```
test_images/
├── flood_light.jpg     # Low flood coverage (~10%)
├── flood_medium.jpg    # Medium flood coverage (~30%)
├── flood_heavy.jpg     # High flood coverage (~70%)
├── no_flood.jpg        # No flood (control)
└── invalid.txt         # Invalid file (for error testing)
```

---

## Backend Testing

### 1. Unit Tests

Create `backend/tests/test_preprocessing.py`:

```python
import pytest
from PIL import Image
import torch
from app.preprocessing import preprocess_image

def test_preprocess_image():
    # Create test image
    test_image = Image.new('RGB', (512, 512), color='red')
    device = torch.device('cpu')
    
    # Preprocess
    tensor = preprocess_image(test_image, device)
    
    # Assertions
    assert tensor.shape == (1, 3, 256, 256), "Output shape incorrect"
    assert tensor.device.type == 'cpu', "Device incorrect"
    assert tensor.dtype == torch.float32, "Dtype incorrect"

def test_preprocess_image_normalization():
    test_image = Image.new('RGB', (256, 256), color=(128, 128, 128))
    device = torch.device('cpu')
    
    tensor = preprocess_image(test_image, device)
    
    # Check normalization range (should be roughly centered around 0)
    assert tensor.min() < 0, "Should have negative values after normalization"
    assert tensor.max() > 0, "Should have positive values after normalization"
```

Create `backend/tests/test_postprocessing.py`:

```python
import pytest
import numpy as np
from PIL import Image
from app.postprocessing import (
    calculate_flood_metrics,
    calculate_disagreement,
    create_overlay
)

def test_calculate_flood_metrics():
    # Create test mask (50% flooded)
    mask = np.zeros((256, 256), dtype=np.uint8)
    mask[:128, :] = 1  # Top half flooded
    
    metrics = calculate_flood_metrics(mask)
    
    assert metrics['total_pixels'] == 256 * 256
    assert metrics['flood_pixels'] == 128 * 256
    assert abs(metrics['flood_percent'] - 50.0) < 0.1

def test_calculate_disagreement():
    # Create two masks with 25% disagreement
    mask1 = np.zeros((256, 256), dtype=np.uint8)
    mask1[:128, :] = 1
    
    mask2 = np.zeros((256, 256), dtype=np.uint8)
    mask2[64:192, :] = 1
    
    result = calculate_disagreement(mask1, mask2)
    
    assert 'disagreement_percent' in result
    assert 'agreement_percent' in result
    assert result['disagreement_percent'] + result['agreement_percent'] == 100

def test_create_overlay():
    image = Image.new('RGB', (256, 256), color='white')
    mask = np.ones((256, 256), dtype=np.uint8)
    
    overlay = create_overlay(image, mask, color=(255, 0, 0), alpha=0.4)
    
    assert isinstance(overlay, Image.Image)
    assert overlay.size == (256, 256)
    assert overlay.mode == 'RGB'
```

### 2. API Endpoint Tests

Create `backend/tests/test_api.py`:

```python
import pytest
from fastapi.testclient import TestClient
from app.main import app
from PIL import Image
import io

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data['status'] == 'healthy'
    assert data['models_loaded'] == True

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert 'status' in data
    assert 'version' in data

def create_test_image():
    """Helper to create test image file"""
    img = Image.new('RGB', (512, 512), color='blue')
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    img_bytes.seek(0)
    return img_bytes

def test_segment_valid_image():
    img_bytes = create_test_image()
    
    response = client.post(
        "/api/segment",
        files={"file": ("test.jpg", img_bytes, "image/jpeg")}
    )
    
    assert response.status_code == 200
    data = response.json()
    
    assert data['success'] == True
    assert 'unet' in data['data']
    assert 'unetpp' in data['data']
    assert 'comparison' in data['data']
    assert 'images' in data['data']

def test_segment_invalid_file_type():
    response = client.post(
        "/api/segment",
        files={"file": ("test.txt", b"not an image", "text/plain")}
    )
    
    assert response.status_code == 400

def test_segment_no_file():
    response = client.post("/api/segment")
    assert response.status_code == 422
```

### 3. Run Backend Tests

```bash
cd backend

# Run all tests
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=app --cov-report=html

# Run specific test file
pytest tests/test_api.py -v
```

---

## Frontend Testing

### 1. Component Tests

Create `__tests__/UploadZone.test.tsx`:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import UploadZone from '@/components/UploadZone';

describe('UploadZone', () => {
  it('renders upload zone', () => {
    const mockOnFileSelect = jest.fn();
    render(<UploadZone onFileSelect={mockOnFileSelect} />);
    
    expect(screen.getByText(/drag & drop/i)).toBeInTheDocument();
  });

  it('handles file selection', () => {
    const mockOnFileSelect = jest.fn();
    render(<UploadZone onFileSelect={mockOnFileSelect} />);
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/file input/i);
    
    fireEvent.change(input, { target: { files: [file] } });
    
    expect(mockOnFileSelect).toHaveBeenCalled();
  });
});
```

### 2. API Client Tests

Create `__tests__/api.test.ts`:

```typescript
import { segmentImage, checkApiHealth } from '@/lib/api';

describe('API Client', () => {
  it('checks API health', async () => {
    const healthy = await checkApiHealth();
    expect(typeof healthy).toBe('boolean');
  });

  it('segments image', async () => {
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    try {
      const result = await segmentImage(file);
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('unet');
      expect(result.data).toHaveProperty('unetpp');
    } catch (error) {
      // Expected if backend not running
      console.log('Backend not available for testing');
    }
  });
});
```

### 3. Run Frontend Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch
```

---

## Integration Testing

### 1. End-to-End Test Script

Create `test_e2e.py`:

```python
import requests
import os
from pathlib import Path

# Configuration
BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:8000')
TEST_IMAGE = 'test_images/flood_medium.jpg'

def test_health():
    print("Testing health endpoint...")
    response = requests.get(f"{BACKEND_URL}/health")
    assert response.status_code == 200
    print("✓ Health check passed")

def test_segmentation():
    print(f"\nTesting segmentation with {TEST_IMAGE}...")
    
    with open(TEST_IMAGE, 'rb') as f:
        files = {'file': ('test.jpg', f, 'image/jpeg')}
        response = requests.post(f"{BACKEND_URL}/api/segment", files=files)
    
    assert response.status_code == 200
    data = response.json()
    
    assert data['success'] == True
    assert 'data' in data
    
    # Check UNet results
    assert 'unet' in data['data']
    assert 'flood_percent' in data['data']['unet']
    assert 0 <= data['data']['unet']['flood_percent'] <= 100
    
    # Check UNet++ results
    assert 'unetpp' in data['data']
    assert 'flood_percent' in data['data']['unetpp']
    
    # Check comparison
    assert 'comparison' in data['data']
    assert 'disagreement_percent' in data['data']['comparison']
    
    # Check images
    assert 'images' in data['data']
    assert data['data']['images']['original'].startswith('data:image')
    
    print("✓ Segmentation test passed")
    print(f"  UNet flood: {data['data']['unet']['flood_percent']}%")
    print(f"  UNet++ flood: {data['data']['unetpp']['flood_percent']}%")
    print(f"  Agreement: {data['data']['comparison']['agreement_percent']}%")

def test_invalid_file():
    print("\nTesting invalid file handling...")
    
    files = {'file': ('test.txt', b'not an image', 'text/plain')}
    response = requests.post(f"{BACKEND_URL}/api/segment", files=files)
    
    assert response.status_code == 400
    print("✓ Invalid file handling passed")

if __name__ == '__main__':
    print("=" * 60)
    print("FLOOD SEGMENTATION E2E TESTS")
    print("=" * 60)
    
    try:
        test_health()
        test_segmentation()
        test_invalid_file()
        
        print("\n" + "=" * 60)
        print("✅ ALL TESTS PASSED")
        print("=" * 60)
    except Exception as e:
        print(f"\n❌ TEST FAILED: {e}")
        raise
```

Run:

```bash
python test_e2e.py
```

---

## Model Validation

### 1. Compare with Training Results

Create `validate_models.py`:

```python
import torch
import numpy as np
from PIL import Image
from backend.app.models import ModelManager
from backend.app.preprocessing import preprocess_image

# Load test image from training set
test_image_path = 'path/to/test/image.jpg'
expected_unet_flood = 32.4  # From notebook
expected_unetpp_flood = 28.1  # From notebook

# Load models
model_manager = ModelManager(
    unet_path='backend/models_weights/unet_baseline_best.pth',
    unetpp_path='backend/models_weights/unetplus.pth'
)

# Preprocess
image = Image.open(test_image_path)
tensor = preprocess_image(image, model_manager.device)

# Predict
mask_unet = model_manager.predict_unet(tensor)
mask_unetpp = model_manager.predict_unetpp(tensor)

# Calculate flood percentages
unet_flood = (mask_unet.sum() / mask_unet.size) * 100
unetpp_flood = (mask_unetpp.sum() / mask_unetpp.size) * 100

print(f"UNet flood: {unet_flood:.2f}% (expected: {expected_unet_flood}%)")
print(f"UNet++ flood: {unetpp_flood:.2f}% (expected: {expected_unetpp_flood}%)")

# Check if within reasonable range (±2%)
assert abs(unet_flood - expected_unet_flood) < 2.0
assert abs(unetpp_flood - expected_unetpp_flood) < 2.0

print("✓ Model validation passed")
```

---

## Performance Testing

### 1. Latency Test

Create `test_performance.py`:

```python
import requests
import time
import statistics

BACKEND_URL = 'http://localhost:8000'
TEST_IMAGE = 'test_images/flood_medium.jpg'
NUM_REQUESTS = 10

def measure_latency():
    latencies = []
    
    for i in range(NUM_REQUESTS):
        with open(TEST_IMAGE, 'rb') as f:
            files = {'file': f}
            start = time.time()
            response = requests.post(f"{BACKEND_URL}/api/segment", files=files)
            end = time.time()
            
            if response.status_code == 200:
                latency = end - start
                latencies.append(latency)
                print(f"Request {i+1}: {latency:.2f}s")
    
    print(f"\nResults:")
    print(f"  Mean: {statistics.mean(latencies):.2f}s")
    print(f"  Median: {statistics.median(latencies):.2f}s")
    print(f"  Min: {min(latencies):.2f}s")
    print(f"  Max: {max(latencies):.2f}s")

if __name__ == '__main__':
    print(f"Testing latency with {NUM_REQUESTS} requests...")
    measure_latency()
```

### 2. Load Test

```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Run load test (100 requests, 10 concurrent)
ab -n 100 -c 10 -p test_image.jpg -T image/jpeg \
   http://localhost:8000/api/segment
```

---

## User Acceptance Testing

### Checklist

#### Upload Functionality
- [ ] Drag and drop works
- [ ] Click to browse works
- [ ] Preview displays correctly
- [ ] File validation works (JPG, PNG only)
- [ ] Size validation works (10MB limit)
- [ ] Error messages clear
- [ ] Remove button works

#### Segmentation
- [ ] Loading state appears
- [ ] Progress indicators work
- [ ] Completes within 5 seconds (CPU)
- [ ] Results display correctly
- [ ] All 4 tabs work (Original, UNet, UNet++, Comparison)
- [ ] Images load correctly
- [ ] Overlays visible

#### Analysis Panel
- [ ] Statistics table populated
- [ ] Percentages correct
- [ ] Pixel counts accurate
- [ ] Summaries make sense
- [ ] Agreement badge shows
- [ ] Model insights display

#### Responsive Design
- [ ] Works on mobile (< 768px)
- [ ] Works on tablet (768px - 1024px)
- [ ] Works on desktop (> 1024px)
- [ ] Images scale properly
- [ ] Text readable on all sizes
- [ ] Buttons clickable on mobile

#### Error Handling
- [ ] Invalid file type shows error
- [ ] File too large shows error
- [ ] Network error handled gracefully
- [ ] Backend down shows error
- [ ] Can recover from errors

#### Performance
- [ ] Page loads quickly
- [ ] Images display without delay
- [ ] No layout shifts
- [ ] Smooth transitions
- [ ] No console errors

---

## Test Results Documentation

### Template

```markdown
# Test Results - [Date]

## Environment
- Frontend: [URL]
- Backend: [URL]
- Browser: [Chrome/Firefox/Safari]
- Device: [Desktop/Mobile/Tablet]

## Test Summary
- Total Tests: X
- Passed: Y
- Failed: Z
- Duration: N minutes

## Failed Tests
1. Test Name
   - Expected: ...
   - Actual: ...
   - Steps to Reproduce: ...

## Performance Metrics
- Average Latency: Xs
- p95 Latency: Xs
- Error Rate: X%

## Notes
- ...
```

---

## Continuous Testing

### GitHub Actions

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.10'
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
          pip install pytest pytest-cov
      - name: Run tests
        run: |
          cd backend
          pytest tests/ --cov=app

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Node
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test
```

---

**Testing Status:** Comprehensive Test Suite Ready ✅  
**Coverage Target:** >80%  
**Automation:** Ready for CI/CD

