/**
 * TypeScript Type Definitions
 */

export interface SegmentationResult {
  success: boolean;
  data: {
    unet: ModelResult;
    unetpp: ModelResult;
    comparison: ComparisonResult;
    images: ResultImages;
  };
}

export interface ModelResult {
  flood_percent: number;
  flood_pixels: number;
  total_pixels: number;
  summary: string;
}

export interface ComparisonResult {
  disagreement_percent: number;
  agreement_percent: number;
  disagreement_pixels: number;
  summary: string;
}

export interface ResultImages {
  original: string;
  unet_overlay: string;
  unetpp_overlay: string;
  disagreement: string;
}

export type ImageTab = 'original' | 'unet' | 'unetpp' | 'comparison';

export interface UploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
}

