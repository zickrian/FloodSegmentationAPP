"""
Utility Functions
Helper functions for file validation and processing
"""

from fastapi import UploadFile
from PIL import Image
import io
from typing import Optional
import logging

logger = logging.getLogger(__name__)

# Allowed image file extensions
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png'}

# Maximum file size (10 MB)
MAX_FILE_SIZE = 10 * 1024 * 1024


def validate_image_file(filename: str) -> bool:
    """
    Validate if uploaded file has allowed extension
    
    Args:
        filename: Name of uploaded file
        
    Returns:
        True if valid, False otherwise
    """
    if not filename:
        return False
    
    # Get file extension
    extension = '.' + filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
    
    return extension in ALLOWED_EXTENSIONS


async def read_upload_file(upload_file: UploadFile) -> Image.Image:
    """
    Read UploadFile and convert to PIL Image
    
    Args:
        upload_file: FastAPI UploadFile object
        
    Returns:
        PIL Image object
        
    Raises:
        ValueError: If file cannot be opened as image
    """
    try:
        # Read file content
        contents = await upload_file.read()
        
        # Check file size
        if len(contents) > MAX_FILE_SIZE:
            raise ValueError(
                f"File too large. Maximum size is {MAX_FILE_SIZE / (1024*1024):.1f} MB"
            )
        
        # Convert to PIL Image
        image = Image.open(io.BytesIO(contents))
        
        # Validate image
        image.verify()
        
        # Reopen image (verify closes the file)
        image = Image.open(io.BytesIO(contents))
        
        return image
        
    except Exception as e:
        logger.error(f"Failed to read image file: {str(e)}")
        raise ValueError(f"Could not open image file: {str(e)}")


def format_number(num: int) -> str:
    """
    Format large numbers with commas
    
    Args:
        num: Integer number
        
    Returns:
        Formatted string
    """
    return f"{num:,}"


def truncate_text(text: str, max_length: int = 100) -> str:
    """
    Truncate text to specified length
    
    Args:
        text: Input text
        max_length: Maximum length
        
    Returns:
        Truncated text with ellipsis if needed
    """
    if len(text) <= max_length:
        return text
    return text[:max_length-3] + "..."

