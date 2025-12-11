#!/bin/bash

# ============================================================
# FLOOD SEGMENTATION APP - SETUP SCRIPT
# ============================================================

set -e  # Exit on error

echo "============================================================"
echo "🌊 FLOOD SEGMENTATION APP - SETUP"
echo "============================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Python is installed
echo "Checking prerequisites..."
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 not found. Please install Python 3.10+${NC}"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Python found: $(python3 --version)${NC}"
echo -e "${GREEN}✓ Node.js found: $(node --version)${NC}"
echo ""

# ============================================================
# BACKEND SETUP
# ============================================================

echo "============================================================"
echo "BACKEND SETUP"
echo "============================================================"

cd backend

# Create virtual environment
echo "Creating Python virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

# Install dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Create models_weights directory
echo "Setting up model weights directory..."
mkdir -p models_weights

# Check if model files exist
if [ ! -f "../Models/unet_baseline_best.pth" ]; then
    echo -e "${YELLOW}⚠ Warning: unet_baseline_best.pth not found in Models/${NC}"
    echo -e "${YELLOW}  Please copy your model files to backend/models_weights/${NC}"
else
    echo "Copying UNet model..."
    cp ../Models/unet_baseline_best.pth models_weights/
    echo -e "${GREEN}✓ UNet model copied${NC}"
fi

if [ ! -f "../Models/unetplus.pth" ]; then
    echo -e "${YELLOW}⚠ Warning: unetplus.pth not found in Models/${NC}"
    echo -e "${YELLOW}  Please copy your model files to backend/models_weights/${NC}"
else
    echo "Copying UNet++ model..."
    cp ../Models/unetplus.pth models_weights/
    echo -e "${GREEN}✓ UNet++ model copied${NC}"
fi

# Create .env file
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env << EOF
MODEL_PATH_UNET=./models_weights/unet_baseline_best.pth
MODEL_PATH_UNETPP=./models_weights/unetplus.pth
DEVICE=cpu
CORS_ORIGINS=http://localhost:3000
EOF
    echo -e "${GREEN}✓ .env file created${NC}"
fi

cd ..

# ============================================================
# FRONTEND SETUP
# ============================================================

echo ""
echo "============================================================"
echo "FRONTEND SETUP"
echo "============================================================"

# Install Node dependencies
echo "Installing Node.js dependencies..."
npm install

# Create .env.local file
if [ ! -f ".env.local" ]; then
    echo "Creating .env.local file..."
    cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000
EOF
    echo -e "${GREEN}✓ .env.local file created${NC}"
fi

# ============================================================
# SETUP COMPLETE
# ============================================================

echo ""
echo "============================================================"
echo "✅ SETUP COMPLETE!"
echo "============================================================"
echo ""
echo "To start the application:"
echo ""
echo "1. Start Backend (in terminal 1):"
echo "   ${YELLOW}cd backend${NC}"
echo "   ${YELLOW}source venv/bin/activate${NC}  # Windows: venv\\Scripts\\activate"
echo "   ${YELLOW}uvicorn app.main:app --reload${NC}"
echo ""
echo "2. Start Frontend (in terminal 2):"
echo "   ${YELLOW}npm run dev${NC}"
echo ""
echo "3. Open browser:"
echo "   ${YELLOW}http://localhost:3000${NC}"
echo ""
echo "For deployment instructions, see DEPLOYMENT.md"
echo "For testing procedures, see TESTING.md"
echo ""
echo "============================================================"

