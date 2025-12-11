'use client';

import React, { useState } from 'react';
import UploadZone from '@/components/UploadZone';
import ImagePreview from '@/components/ImagePreview';
import LoadingState from '@/components/LoadingState';
import ResultsViewer from '@/components/ResultsViewer';
import { segmentImage } from '@/lib/api';
import { SegmentationResult } from '@/lib/types';

// ===== Clean SVG Icons =====

const WaterDropIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 2.69l.01.01C16.79 7.36 20 11.12 20 14a8 8 0 1 1-16 0c0-2.88 3.21-6.64 7.99-11.31L12 2.69z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="currentColor"
      fillOpacity="0.1"
    />
  </svg>
);

const UploadIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="17,8 12,3 7,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CpuIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
    <rect x="9" y="9" width="6" height="6" stroke="currentColor" strokeWidth="2" />
    <line x1="9" y1="1" x2="9" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="15" y1="1" x2="15" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="9" y1="20" x2="9" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="15" y1="20" x2="15" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="20" y1="9" x2="23" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="20" y1="15" x2="23" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="1" y1="9" x2="4" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="1" y1="15" x2="4" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const ChartIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="18" y1="20" x2="18" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="12" y1="20" x2="12" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="6" y1="20" x2="6" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const AlertCircleIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const RefreshIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M23 4v6h-6M1 20v-6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SegmentationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (file: File, preview: string) => {
    setSelectedFile(file);
    setPreviewUrl(preview);
    setError(null);
    setResults(null);
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
  };

  const handleSegment = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);

    try {
      const result = await segmentImage(selectedFile);
      setResults(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during segmentation';
      setError(errorMessage);
      console.error('Segmentation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResults(null);
    setError(null);
  };

  // ===== Results View =====
  if (results) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <ResultsViewer results={results} onReset={handleReset} />
        </div>
      </main>
    );
  }

  // ===== Main Upload View =====
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Title */}
        <div className="text-center mb-10 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            Flood Segmentation
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
            Advanced flood area detection using UNet and UNet++ deep learning models
          </p>
          <div className="flex items-center justify-center gap-3 mt-4">
            <span className="badge badge-primary">AI-Powered</span>
            <span className="text-xs sm:text-sm text-gray-500">Fast & Accurate Analysis</span>
          </div>
        </div>

        {/* How It Works - 3 Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mb-10 sm:mb-12">
          {/* Step 1 */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-4">
              <UploadIcon className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">1. Upload</h3>
            <p className="text-sm text-gray-500">Drop your flood image</p>
          </div>

          {/* Step 2 */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-600 mb-4">
              <CpuIcon className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">2. Analyze</h3>
            <p className="text-sm text-gray-500">AI models process image</p>
          </div>

          {/* Step 3 */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-4">
              <ChartIcon className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">3. Results</h3>
            <p className="text-sm text-gray-500">Get detailed metrics</p>
          </div>
        </div>

        {/* Upload Section */}
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Upload Zone */}
          {!selectedFile && !loading && (
            <UploadZone onFileSelect={handleFileSelect} disabled={loading} />
          )}

          {/* Image Preview */}
          {selectedFile && previewUrl && !loading && (
            <div className="space-y-4">
              <ImagePreview
                imageUrl={previewUrl}
                fileName={selectedFile.name}
                onRemove={handleRemove}
                disabled={loading}
              />

              {/* Segment Button */}
              <button
                onClick={handleSegment}
                disabled={loading}
                className="btn-primary w-full py-3.5"
              >
                <WaterDropIcon className="w-5 h-5" />
                Run Segmentation
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && <LoadingState />}

          {/* Error Message */}
          {error && (
            <div className="card p-4 sm:p-5" style={{ borderColor: '#fecaca', background: '#fef2f2' }}>
              <div className="flex items-start gap-3">
                <div className="icon-box icon-box-error flex-shrink-0">
                  <AlertCircleIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-red-800">Error</h3>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                  <button
                    onClick={handleReset}
                    className="mt-3 text-sm font-medium text-red-600 hover:text-red-500 inline-flex items-center gap-1"
                  >
                    <RefreshIcon className="w-4 h-4" />
                    Try again
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-xs text-gray-400">
            Powered by UNet & UNet++ deep learning architecture
          </p>
        </div>
      </div>
    </main>
  );
}
