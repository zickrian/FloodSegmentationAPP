"""
Model Management Module
Handles loading and inference for UNet and UNet++ models
"""

import torch
import torch.nn as nn
import segmentation_models_pytorch as smp
import logging
from typing import Tuple
import numpy as np

logger = logging.getLogger(__name__)


class ModelManager:
    """
    Manages UNet and UNet++ models for flood segmentation
    Loads models once and handles inference
    """
    
    def __init__(self, unet_path: str, unetpp_path: str):
        """
        Initialize and load both models
        
        Args:
            unet_path: Path to UNet model weights (.pth)
            unetpp_path: Path to UNet++ model weights (.pth)
        """
        # Determine device (GPU if available, else CPU)
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        logger.info(f"Using device: {self.device}")
        
        # Model configuration (must match training)
        self.encoder_name = 'resnet34'
        self.in_channels = 3
        self.classes = 1
        
        # Load UNet
        logger.info("Loading UNet model...")
        self.model_unet = self._create_unet()
        self._load_weights(self.model_unet, unet_path, "UNet")
        self.model_unet.to(self.device)
        self.model_unet.eval()
        logger.info("✓ UNet model loaded and ready")
        
        # Free memory before loading next model
        import gc
        gc.collect()
        
        # Load UNet++
        logger.info("Loading UNet++ model...")
        self.model_unetpp = self._create_unetplusplus()
        self._load_weights(self.model_unetpp, unetpp_path, "UNet++")
        self.model_unetpp.to(self.device)
        self.model_unetpp.eval()
        logger.info("✓ UNet++ model loaded and ready")
    
    def _create_unet(self) -> nn.Module:
        """
        Create UNet model architecture
        NOTE: encoder_weights=None because we load our own trained weights
        This saves ~83MB memory by not downloading ImageNet weights
        """
        model = smp.Unet(
            encoder_name=self.encoder_name,
            encoder_weights=None,  # Don't download pretrained - we have our own weights
            in_channels=self.in_channels,
            classes=self.classes,
            activation=None  # We apply sigmoid separately (matches training)
        )
        return model
    
    def _create_unetplusplus(self) -> nn.Module:
        """
        Create UNet++ model architecture
        NOTE: encoder_weights=None because we load our own trained weights
        This saves ~83MB memory by not downloading ImageNet weights
        """
        model = smp.UnetPlusPlus(
            encoder_name=self.encoder_name,
            encoder_weights=None,  # Don't download pretrained - we have our own weights
            in_channels=self.in_channels,
            classes=self.classes,
            activation=None  # We apply sigmoid separately (matches training)
        )
        return model
    
    def _load_weights(self, model: nn.Module, weight_path: str, model_name: str):
        """
        Load model weights from checkpoint
        
        Args:
            model: PyTorch model
            weight_path: Path to .pth file
            model_name: Name for logging
        """
        import gc
        
        try:
            # Load weights (removed weights_only=True for compatibility with various checkpoint formats)
            logger.info(f"Loading {model_name} weights from {weight_path}...")
            state_dict = torch.load(
                weight_path,
                map_location=self.device
            )
            
            # Load state dict into model
            model.load_state_dict(state_dict)
            
            # Free memory after loading
            del state_dict
            gc.collect()
            
            logger.info(f"✓ {model_name} weights loaded successfully")
            
        except FileNotFoundError:
            raise FileNotFoundError(
                f"{model_name} weights not found at {weight_path}"
            )
        except Exception as e:
            logger.error(f"Error loading {model_name}: {str(e)}")
            raise RuntimeError(
                f"Failed to load {model_name} weights: {str(e)}"
            )
    
    @torch.no_grad()
    def predict_unet(self, image_tensor: torch.Tensor) -> np.ndarray:
        """
        Run UNet inference and generate binary mask
        
        Args:
            image_tensor: Preprocessed image tensor [1, 3, 256, 256]
            
        Returns:
            Binary flood mask [256, 256] with values 0 or 1 (uint8)
        """
        # Model forward pass: raw logits [1, 1, 256, 256]
        logits = self.model_unet(image_tensor)
        
        # Sigmoid activation: convert logits to probabilities [0, 1]
        probs = torch.sigmoid(logits)
        
        # Binary threshold at 0.5: standard threshold for flood segmentation
        mask = (probs > 0.5).float().squeeze().cpu().numpy()
        
        return mask.astype(np.uint8)
    
    @torch.no_grad()
    def predict_unetpp(self, image_tensor: torch.Tensor) -> np.ndarray:
        """
        Run UNet++ inference and generate binary mask
        
        Args:
            image_tensor: Preprocessed image tensor [1, 3, 256, 256]
            
        Returns:
            Binary flood mask [256, 256] with values 0 or 1 (uint8)
        """
        # Model forward pass: raw logits [1, 1, 256, 256]
        logits = self.model_unetpp(image_tensor)
        
        # Sigmoid activation: convert logits to probabilities [0, 1]
        probs = torch.sigmoid(logits)
        
        # Binary threshold at 0.5: standard threshold for flood segmentation
        mask = (probs > 0.5).float().squeeze().cpu().numpy()
        
        return mask.astype(np.uint8)
    
    def get_model_info(self) -> dict:
        """Get information about loaded models"""
        return {
            "device": str(self.device),
            "encoder": self.encoder_name,
            "input_size": "256x256",
            "models": {
                "unet": {
                    "loaded": self.model_unet is not None,
                    "parameters": sum(p.numel() for p in self.model_unet.parameters())
                },
                "unetpp": {
                    "loaded": self.model_unetpp is not None,
                    "parameters": sum(p.numel() for p in self.model_unetpp.parameters())
                }
            }
        }

