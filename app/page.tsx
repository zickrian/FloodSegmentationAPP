'use client';

import React, { useState } from 'react';
import { Droplets, Sparkles } from 'lucide-react';
import UploadZone from '@/components/UploadZone';
import ImagePreview from '@/components/ImagePreview';
import LoadingState from '@/components/LoadingState';
import ResultsViewer from '@/components/ResultsViewer';
import { segmentImage } from '@/lib/api';
import { SegmentationResult } from '@/lib/types';

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

  // Show results view
  if (results) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <ResultsViewer results={results} onReset={handleReset} />
        </div>
      </main>
    );
  }

  // Show upload/loading view
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Droplets className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">
              Flood Segmentation
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Advanced flood area detection using UNet and UNet++ deep learning models
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-gray-500">Powered by AI · Fast & Accurate</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Upload Zone */}
          {!selectedFile && !loading && (
            <UploadZone onFileSelect={handleFileSelect} disabled={loading} />
          )}

          {/* Image Preview */}
          {selectedFile && previewUrl && !loading && (
            <>
              <ImagePreview
                imageUrl={previewUrl}
                fileName={selectedFile.name}
                onRemove={handleRemove}
                disabled={loading}
              />

              {/* Segment Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleSegment}
                  disabled={loading}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Droplets className="w-5 h-5" />
                  Run Segmentation
                </button>
              </div>
            </>
          )}

          {/* Loading State */}
          {loading && <LoadingState />}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-red-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-red-900">Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                  <button
                    onClick={handleReset}
                    className="mt-3 text-sm font-medium text-red-600 hover:text-red-500"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                <span className="text-2xl">📸</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Upload Image</h3>
              <p className="text-sm text-gray-600">
                Upload any flood image for instant AI analysis
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full mb-3">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">AI Processing</h3>
              <p className="text-sm text-gray-600">
                Two advanced models analyze the flood areas
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Get Results</h3>
              <p className="text-sm text-gray-600">
                Detailed metrics and visual overlays in seconds
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
