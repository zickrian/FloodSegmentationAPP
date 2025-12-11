'use client';

import React from 'react';
import { SegmentationResult } from '@/lib/types';
import ImageTabs from './ImageTabs';
import AnalysisPanel from './AnalysisPanel';

const ArrowLeftIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CheckIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

interface ResultsViewerProps {
  results: SegmentationResult;
  onReset: () => void;
}

export default function ResultsViewer({ results, onReset }: ResultsViewerProps) {
  const { data } = results;

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="card p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="icon-box icon-box-success">
              <CheckIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Segmentation Results</h2>
              <p className="text-sm text-gray-500">Analysis complete</p>
            </div>
          </div>
          <button onClick={onReset} className="btn-secondary w-full sm:w-auto">
            <ArrowLeftIcon className="w-4 h-4" />
            New Analysis
          </button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:grid lg:grid-cols-2 gap-6">
        <ImageTabs images={data.images} />
        <AnalysisPanel unet={data.unet} unetpp={data.unetpp} comparison={data.comparison} />
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden space-y-6">
        <ImageTabs images={data.images} />
        <AnalysisPanel unet={data.unet} unetpp={data.unetpp} comparison={data.comparison} />
      </div>
    </div>
  );
}
