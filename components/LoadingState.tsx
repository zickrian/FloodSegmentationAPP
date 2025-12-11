'use client';

import React from 'react';

const BrainIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 4.5a2.5 2.5 0 0 0-4.96-.46 2.5 2.5 0 0 0-1.98 3 2.5 2.5 0 0 0-1.32 4.24 3 3 0 0 0 .34 5.58 2.5 2.5 0 0 0 2.96 3.08 2.5 2.5 0 0 0 4.91.05L12 20V4.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 4.5a2.5 2.5 0 0 1 4.96-.46 2.5 2.5 0 0 1 1.98 3 2.5 2.5 0 0 1 1.32 4.24 3 3 0 0 1-.34 5.58 2.5 2.5 0 0 1-2.96 3.08A2.5 2.5 0 0 1 12 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CpuIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
    <rect x="9" y="9" width="6" height="6" stroke="currentColor" strokeWidth="2" />
    <line x1="9" y1="1" x2="9" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="15" y1="1" x2="15" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

interface LoadingStateProps {
  message?: string;
}

const steps = [
  'Preprocessing image',
  'Running UNet inference',
  'Running UNet++ inference',
  'Generating analysis',
];

export default function LoadingState({ message = 'Processing image...' }: LoadingStateProps) {
  return (
    <div className="card p-6 sm:p-8">
      <div className="flex flex-col items-center justify-center space-y-6">
        {/* Animated Spinner */}
        <div className="relative">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-gray-100 border-t-blue-600 animate-spin" style={{ animationDuration: '1s' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <BrainIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
          </div>
        </div>

        {/* Text */}
        <div className="text-center">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center justify-center gap-2">
            <span className="spinner" />
            {message}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Running <span className="font-medium text-red-500">UNet</span> and{' '}
            <span className="font-medium text-blue-600">UNet++</span> models
          </p>
        </div>

        {/* Steps */}
        <div className="w-full max-w-xs space-y-2">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              style={{ animation: 'pulse 2s ease-in-out infinite', animationDelay: `${index * 0.2}s` }}
            >
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-sm text-gray-600">{step}</span>
            </div>
          ))}
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <CpuIcon className="w-4 h-4" />
          <span>Estimated: 1-3 seconds</span>
        </div>
      </div>
    </div>
  );
}
