'use client';

import React from 'react';
import { SegmentationResult } from '@/lib/types';
import ImageTabs from './ImageTabs';
import AnalysisPanel from './AnalysisPanel';
import { ArrowLeft } from 'lucide-react';

interface ResultsViewerProps {
  results: SegmentationResult;
  onReset: () => void;
}

export default function ResultsViewer({ results, onReset }: ResultsViewerProps) {
  const { data } = results;

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Segmentation Results</h2>
          <p className="text-sm text-gray-600 mt-1">
            Analysis complete - review the results below
          </p>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Upload New Image</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      {/* Desktop Layout (Two Columns) */}
      <div className="hidden lg:grid lg:grid-cols-2 gap-6">
        {/* Left Column - Image Viewer */}
        <div>
          <ImageTabs images={data.images} />
        </div>

        {/* Right Column - Analysis Panel */}
        <div>
          <AnalysisPanel
            unet={data.unet}
            unetpp={data.unetpp}
            comparison={data.comparison}
          />
        </div>
      </div>

      {/* Mobile/Tablet Layout (Stacked) */}
      <div className="lg:hidden space-y-6">
        {/* Image Viewer */}
        <ImageTabs images={data.images} />

        {/* Analysis Panel */}
        <AnalysisPanel
          unet={data.unet}
          unetpp={data.unetpp}
          comparison={data.comparison}
        />
      </div>
    </div>
  );
}

