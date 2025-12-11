"""
Image Preprocessing Module
CRITICAL: Must match training preprocessing exactly
"""

import torch
from torch import Tensor
from torchvision import transforms
from PIL import Image
import numpy as np
from typing import Tuple

# ImageNet normalization statistics (used in training)
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]

# Target image size (must match training)
IMG_SIZE = 256


def preprocess_image(image: Image.Image, device: torch.device) -> Tensor:
    """
    Preprocess image for model inference
    
    CRITICAL: This preprocessing MUST match the training pipeline:
    1. Convert to RGB
    2. Resize to 256x256
    3. Normalize with ImageNet statistics
    4. Convert to tensor
    5. Add batch dimension
    
    Args:
        image: PIL Image object (any size, any format)
        device: PyTorch device (cuda or cpu)
        
    Returns:
        Preprocessed image tensor [1, 3, 256, 256]
    """
    # Ensure image is in RGB mode
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    # Define preprocessing transforms (matches training)
    transform = transforms.Compose([
        transforms.Resize((IMG_SIZE, IMG_SIZE), interpolation=Image.BILINEAR),
        transforms.ToTensor(),  # Converts to [0, 1] and CHW format
        transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD)
    ])
    
    # Apply transforms
    tensor = transform(image)  # [3, 256, 256]
    
    # Add batch dimension
    tensor = tensor.unsqueeze(0)  # [1, 3, 256, 256]
    
    # Move to device
    tensor = tensor.to(device)
    
    return tensor


def resize_image_for_display(image: Image.Image, max_size: Tuple[int, int] = (1024, 1024)) -> Image.Image:
    """
    Resize image for display while maintaining aspect ratio
    
    Args:
        image: PIL Image object
        max_size: Maximum dimensions (width, height)
        
    Returns:
        Resized PIL Image
    """
    # Calculate aspect ratio
    width, height = image.size
    max_width, max_height = max_size
    
    # Calculate scaling factor
    scale = min(max_width / width, max_height / height, 1.0)
    
    if scale < 1.0:
        new_size = (int(width * scale), int(height * scale))
        image = image.resize(new_size, Image.BILINEAR)
    
    return image


def denormalize_tensor(tensor: Tensor) -> np.ndarray:
    """
    Denormalize tensor for visualization
    
    Args:
        tensor: Normalized tensor [3, H, W] or [1, 3, H, W]
        
    Returns:
        Denormalized numpy array [H, W, 3] in range [0, 255]
    """
    # Remove batch dimension if present
    if tensor.dim() == 4:
        tensor = tensor.squeeze(0)
    
    # Move to CPU and convert to numpy
    tensor = tensor.cpu().numpy()
    
    # Denormalize
    mean = np.array(IMAGENET_MEAN).reshape(3, 1, 1)
    std = np.array(IMAGENET_STD).reshape(3, 1, 1)
    
    image = tensor * std + mean
    
    # Clip to [0, 1] range
    image = np.clip(image, 0, 1)
    
    # Convert to [H, W, 3] and scale to [0, 255]
    image = np.transpose(image, (1, 2, 0))
    image = (image * 255).astype(np.uint8)
    
    return image

