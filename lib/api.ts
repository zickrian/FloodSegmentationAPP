/**
 * API Client Functions
 */

import { SegmentationResult } from './types';

// Get API URL from environment variable or use default
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Upload image and get segmentation results
 */
export async function segmentImage(file: File): Promise<SegmentationResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/api/segment`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `API Error: ${response.status} ${response.statusText}`
    );
  }

  const result: SegmentationResult = await response.json();
  return result;
}

/**
 * Check API health
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/health`, {
      method: 'GET',
    });
    return response.ok;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
}

