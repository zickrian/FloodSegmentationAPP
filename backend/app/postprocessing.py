"""
Post-processing Module
Handles mask processing, overlay generation, metrics calculation, and summary generation
"""

import numpy as np
from PIL import Image
import base64
from io import BytesIO
from typing import Dict, Any, Tuple
import logging

logger = logging.getLogger(__name__)


def calculate_flood_metrics(mask: np.ndarray) -> Dict[str, Any]:
    """
    Calculate flood area metrics from binary mask (256x256)
    
    Standard calculation:
    - Total pixels: 256 × 256 = 65,536
    - Flood pixels: count of pixels with value = 1
    - Flood percentage: (flood_pixels / 65,536) × 100
    
    Args:
        mask: Binary mask [256, 256] with values 0 or 1
        
    Returns:
        Dictionary with flood metrics
    """
    # Validate mask dimensions
    if mask.shape != (256, 256):
        raise ValueError(f"Mask must be 256x256, got {mask.shape}")
    
    total_pixels = 256 * 256  # Always 65,536
    flood_pixels = int(np.sum(mask > 0))  # Count flood pixels (value = 1)
    flood_percent = (flood_pixels / total_pixels) * 100
    
    return {
        "flood_pixels": flood_pixels,
        "total_pixels": total_pixels,
        "flood_percent": round(flood_percent, 2)
    }


def calculate_disagreement(mask1: np.ndarray, mask2: np.ndarray) -> Dict[str, Any]:
    """
    Calculate disagreement between two binary masks (256x256)
    
    Uses XOR operation to find pixels where models disagree:
    - Disagreement = pixels where mask1 ≠ mask2
    - Agreement = pixels where mask1 = mask2
    
    Args:
        mask1: First binary mask [256, 256]
        mask2: Second binary mask [256, 256]
        
    Returns:
        Dictionary with disagreement metrics and mask
    """
    # Validate mask dimensions
    if mask1.shape != (256, 256) or mask2.shape != (256, 256):
        raise ValueError(f"Masks must be 256x256, got {mask1.shape} and {mask2.shape}")
    
    # XOR operation: find pixels where masks differ
    disagreement_mask = np.logical_xor(mask1, mask2).astype(np.uint8)
    
    total_pixels = 256 * 256  # Always 65,536
    disagreement_pixels = int(np.sum(disagreement_mask))
    disagreement_percent = (disagreement_pixels / total_pixels) * 100
    agreement_percent = 100 - disagreement_percent
    
    return {
        "disagreement_mask": disagreement_mask,
        "disagreement_pixels": disagreement_pixels,
        "disagreement_percent": round(disagreement_percent, 2),
        "agreement_percent": round(agreement_percent, 2)
    }


def create_overlay(image: Image.Image, mask: np.ndarray, color: Tuple[int, int, int], alpha: float = 0.4) -> Image.Image:
    """
    Create overlay of mask on original image
    
    Args:
        image: Original PIL Image
        mask: Binary mask [H, W]
        color: RGB color tuple for overlay (e.g., (255, 0, 0) for red)
        alpha: Transparency of overlay (0-1)
        
    Returns:
        PIL Image with overlay
    """
    # Resize image to match mask size if needed
    if image.size != (mask.shape[1], mask.shape[0]):
        image = image.resize((mask.shape[1], mask.shape[0]), Image.BILINEAR)
    
    # Convert image to numpy array
    image_np = np.array(image.convert('RGB'))
    
    # Create colored overlay
    overlay = image_np.copy()
    
    # Apply color to flood areas
    for i in range(3):
        overlay[:, :, i] = np.where(
            mask > 0,
            (1 - alpha) * image_np[:, :, i] + alpha * color[i],
            image_np[:, :, i]
        )
    
    # Convert back to PIL Image
    overlay_image = Image.fromarray(overlay.astype(np.uint8))
    
    return overlay_image


def image_to_base64(image: Image.Image, format: str = 'PNG') -> str:
    """
    Convert PIL Image to base64 string
    
    Args:
        image: PIL Image
        format: Image format (PNG, JPEG)
        
    Returns:
        Base64 encoded string with data URI prefix
    """
    buffer = BytesIO()
    image.save(buffer, format=format)
    buffer.seek(0)
    
    img_base64 = base64.b64encode(buffer.read()).decode('utf-8')
    mime_type = f"image/{format.lower()}"
    
    return f"data:{mime_type};base64,{img_base64}"


def generate_summary_text(
    unet_metrics: Dict[str, Any],
    unetpp_metrics: Dict[str, Any],
    disagreement_metrics: Dict[str, Any]
) -> Dict[str, str]:
    """
    Generate human-readable summary text for each model and comparison
    
    Args:
        unet_metrics: UNet flood metrics
        unetpp_metrics: UNet++ flood metrics
        disagreement_metrics: Disagreement metrics
        
    Returns:
        Dictionary with summary texts
    """
    # UNet summary
    unet_summary = (
        f"UNet detected {unet_metrics['flood_percent']}% of the image area as flooded, "
        f"corresponding to {unet_metrics['flood_pixels']:,} pixels out of "
        f"{unet_metrics['total_pixels']:,} total pixels."
    )
    
    # UNet++ summary
    unetpp_summary = (
        f"UNet++ identified {unetpp_metrics['flood_percent']}% of the area as flooded, "
        f"corresponding to {unetpp_metrics['flood_pixels']:,} pixels. "
    )
    
    # Comparison logic
    diff_percent = abs(unet_metrics['flood_percent'] - unetpp_metrics['flood_percent'])
    
    if unet_metrics['flood_percent'] > unetpp_metrics['flood_percent']:
        comparison = (
            f"UNet predicted {diff_percent:.2f}% more flooded area than UNet++, "
            f"showing a more sensitive detection approach."
        )
    elif unet_metrics['flood_percent'] < unetpp_metrics['flood_percent']:
        comparison = (
            f"UNet++ predicted {diff_percent:.2f}% more flooded area than UNet, "
            f"showing a more sensitive detection approach."
        )
    else:
        comparison = "Both models predicted the same flood area percentage."
    
    unetpp_summary += comparison
    
    # Disagreement summary
    disagreement_summary = (
        f"The models show {disagreement_metrics['agreement_percent']}% agreement in their predictions. "
        f"They disagree on {disagreement_metrics['disagreement_percent']}% of the image area "
        f"({disagreement_metrics['disagreement_pixels']:,} pixels). "
    )
    
    if disagreement_metrics['disagreement_percent'] < 5:
        disagreement_summary += (
            "This high level of agreement suggests confident predictions across most of the image."
        )
    elif disagreement_metrics['disagreement_percent'] < 15:
        disagreement_summary += (
            "This moderate disagreement suggests some areas of uncertainty that may benefit from "
            "expert review, particularly in regions with ambiguous flood characteristics."
        )
    else:
        disagreement_summary += (
            "This significant disagreement indicates substantial uncertainty in the predictions. "
            "Manual inspection is recommended, especially for the highlighted disagreement regions."
        )
    
    return {
        "unet_summary": unet_summary,
        "unetpp_summary": unetpp_summary,
        "disagreement_summary": disagreement_summary
    }


def generate_analysis_results(
    original_image: Image.Image,
    mask_unet: np.ndarray,
    mask_unetpp: np.ndarray
) -> Dict[str, Any]:
    """
    Generate complete analysis results including metrics, overlays, and summaries
    
    Standard output format:
    - Masks: 256x256 binary (values 0 or 1)
    - Metrics: flood_percent, flood_pixels, total_pixels (65,536)
    - Overlays: resized to 256x256 with color-coded flood areas
    - Summary: text descriptions of results
    
    Args:
        original_image: Original uploaded PIL Image (any size)
        mask_unet: UNet binary mask [256, 256]
        mask_unetpp: UNet++ binary mask [256, 256]
        
    Returns:
        Complete results dictionary with standardized format
    """
    logger.info("Calculating flood metrics...")
    
    # Calculate metrics for each model (standard 256x256 masks)
    unet_metrics = calculate_flood_metrics(mask_unet)
    unetpp_metrics = calculate_flood_metrics(mask_unetpp)
    
    logger.info(f"UNet: {unet_metrics['flood_percent']}% flooded ({unet_metrics['flood_pixels']} pixels)")
    logger.info(f"UNet++: {unetpp_metrics['flood_percent']}% flooded ({unetpp_metrics['flood_pixels']} pixels)")
    
    # Calculate disagreement between models
    disagreement_data = calculate_disagreement(mask_unet, mask_unetpp)
    logger.info(f"Agreement: {disagreement_data['agreement_percent']}% (Disagreement: {disagreement_data['disagreement_percent']}%)")
    
    # Generate summary texts
    summaries = generate_summary_text(
        unet_metrics,
        unetpp_metrics,
        disagreement_data
    )
    
    logger.info("Creating overlay images (256x256)...")
    
    # Resize original image to 256x256 to match mask dimensions
    image_resized = original_image.resize((256, 256), Image.BILINEAR)
    
    # Create color-coded overlays with standard flood visualization
    # Red for UNet, Blue for UNet++, Purple for disagreement
    overlay_unet = create_overlay(
        image_resized,
        mask_unet,
        color=(255, 0, 0),  # Red for flood
        alpha=0.4
    )
    
    overlay_unetpp = create_overlay(
        image_resized,
        mask_unetpp,
        color=(0, 100, 255),  # Blue for flood
        alpha=0.4
    )
    
    overlay_disagreement = create_overlay(
        image_resized,
        disagreement_data['disagreement_mask'],
        color=(150, 0, 255),  # Purple for disagreement areas
        alpha=0.5
    )
    
    logger.info("Converting images to base64...")
    
    # Convert all images to base64 for frontend display
    images = {
        "original": image_to_base64(image_resized),
        "unet_overlay": image_to_base64(overlay_unet),
        "unetpp_overlay": image_to_base64(overlay_unetpp),
        "disagreement": image_to_base64(overlay_disagreement)
    }
    
    # Compile final standardized results
    results = {
        "unet": {
            **unet_metrics,
            "summary": summaries["unet_summary"]
        },
        "unetpp": {
            **unetpp_metrics,
            "summary": summaries["unetpp_summary"]
        },
        "comparison": {
            "disagreement_percent": disagreement_data["disagreement_percent"],
            "agreement_percent": disagreement_data["agreement_percent"],
            "disagreement_pixels": disagreement_data["disagreement_pixels"],
            "summary": summaries["disagreement_summary"]
        },
        "images": images
    }
    
    return results

