/**
 * API Client Functions
 */

import { SegmentationResult } from './types';

// Azure-hosted ML API URL
const API_URL = 'https://ml-api.redpebble-35acc587.southeastasia.azurecontainerapps.io';

import { processSegmentationResults } from './image-processing';

/**
 * Upload image and get segmentation results
 */
export async function segmentImage(file: File): Promise<SegmentationResult> {
  const formData = new FormData();
  formData.append('file', file);

  // Helper to fetch for a specific model
  const fetchModel = async (modelName: 'baseline' | 'unetplus') => {
    const response = await fetch(`${API_URL}/segment?model=${modelName}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `API Error (${modelName}): ${response.status} ${response.statusText}`
      );
    }
    return response.json();
  };

  try {
    // Run both model predictions in parallel
    const [unetData, unetppData] = await Promise.all([
      fetchModel('baseline'),
      fetchModel('unetplus')
    ]);

    // Process results (generate overlays and comparison on client side)
    return await processSegmentationResults(file, unetData, unetppData);

  } catch (error) {
    console.error('Segmentation failed:', error);
    throw error;
  }
}

/**
 * Check API health
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}`, { // Root endpoint for health check
      method: 'GET',
    });
    return response.ok;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
}

