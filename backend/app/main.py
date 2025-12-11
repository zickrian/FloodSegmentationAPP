"""
FastAPI Backend for Flood Segmentation
Handles image upload, preprocessing, inference, and result generation
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from typing import Dict, Any
import logging
import sys
import os

from .models import ModelManager
from .preprocessing import preprocess_image
from .postprocessing import generate_analysis_results
from .utils import validate_image_file, read_upload_file

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Flood Segmentation API",
    description="API for flood area segmentation using UNet and UNet++",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model manager (loaded once at startup)
model_manager: ModelManager = None


@app.on_event("startup")
async def startup_event():
    """Load models on startup"""
    global model_manager
    
    logger.info("=" * 60)
    logger.info("STARTING FLOOD SEGMENTATION API")
    logger.info("=" * 60)
    
    try:
        # Get model paths from environment variables or use defaults
        model_path_unet = os.getenv(
            "MODEL_PATH_UNET", 
            "./models_weights/unet_baseline_best.pth"
        )
        model_path_unetpp = os.getenv(
            "MODEL_PATH_UNETPP", 
            "./models_weights/unetplus.pth"
        )
        
        logger.info(f"UNet model path: {model_path_unet}")
        logger.info(f"UNet++ model path: {model_path_unetpp}")
        
        # Initialize model manager
        model_manager = ModelManager(
            unet_path=model_path_unet,
            unetpp_path=model_path_unetpp
        )
        
        logger.info("✅ Models loaded successfully!")
        logger.info(f"Device: {model_manager.device}")
        logger.info("=" * 60)
        
    except Exception as e:
        logger.error(f"❌ Failed to load models: {str(e)}")
        raise


@app.get("/")
async def root():
    """Root endpoint - API health check"""
    return {
        "status": "healthy",
        "message": "Flood Segmentation API is running",
        "version": "1.0.0",
        "models": {
            "unet": "loaded" if model_manager and model_manager.model_unet else "not loaded",
            "unetpp": "loaded" if model_manager and model_manager.model_unetpp else "not loaded"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    if model_manager is None:
        raise HTTPException(status_code=503, detail="Models not loaded")
    
    return {
        "status": "healthy",
        "models_loaded": True,
        "device": str(model_manager.device)
    }


@app.post("/api/segment")
async def segment_image(file: UploadFile = File(...)) -> JSONResponse:
    """
    Main endpoint for flood segmentation
    
    Args:
        file: Uploaded image file (JPG, JPEG, PNG)
        
    Returns:
        JSON response with segmentation results, metrics, and base64 images
    """
    logger.info("=" * 60)
    logger.info("NEW SEGMENTATION REQUEST")
    logger.info("=" * 60)
    
    try:
        # 1. Validate uploaded file
        logger.info(f"📁 Received file: {file.filename}")
        if not validate_image_file(file.filename):
            raise HTTPException(
                status_code=400,
                detail="Invalid file format. Please upload JPG, JPEG, or PNG image."
            )
        
        # 2. Read and decode image
        logger.info("📖 Reading uploaded image...")
        image_pil = await read_upload_file(file)
        logger.info(f"✅ Image loaded: {image_pil.size}")
        
        # 3. Preprocess image for model input
        logger.info("🔄 Preprocessing image...")
        image_tensor = preprocess_image(image_pil, device=model_manager.device)
        logger.info(f"✅ Image preprocessed: {image_tensor.shape}")
        
        # 4. Run inference on both models
        logger.info("🤖 Running UNet inference...")
        mask_unet = model_manager.predict_unet(image_tensor)
        logger.info("✅ UNet inference complete")
        
        logger.info("🤖 Running UNet++ inference...")
        mask_unetpp = model_manager.predict_unetpp(image_tensor)
        logger.info("✅ UNet++ inference complete")
        
        # 5. Generate analysis results (metrics, overlays, summaries)
        logger.info("📊 Generating analysis results...")
        results = generate_analysis_results(
            original_image=image_pil,
            mask_unet=mask_unet,
            mask_unetpp=mask_unetpp
        )
        logger.info("✅ Analysis complete")
        
        logger.info("=" * 60)
        logger.info("✅ REQUEST COMPLETED SUCCESSFULLY")
        logger.info("=" * 60)
        
        # 6. Return results
        return JSONResponse(content={
            "success": True,
            "data": results
        })
        
    except HTTPException as e:
        logger.error(f"❌ HTTP Error: {e.detail}")
        raise
    
    except Exception as e:
        logger.error(f"❌ Internal Server Error: {str(e)}")
        logger.exception(e)
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


if __name__ == "__main__":
    # For local development
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )

