'use client';

import React from 'react';
import { Loader2, Brain, Cpu } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = 'Processing image...' }: LoadingStateProps) {
  return (
    <div className="w-full bg-white rounded-lg shadow-md p-8 border border-gray-200">
      <div className="flex flex-col items-center justify-center space-y-6">
        {/* Animated Icon */}
        <div className="relative">
          <div className="absolute inset-0 animate-ping">
            <div className="w-16 h-16 rounded-full bg-blue-400 opacity-20"></div>
          </div>
          <div className="relative p-4 bg-blue-100 rounded-full">
            <Brain className="w-8 h-8 text-blue-600 animate-pulse" />
          </div>
        </div>

        {/* Loading Text */}
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            {message}
          </h3>
          <p className="text-sm text-gray-600">
            Running UNet and UNet++ models on your image
          </p>
        </div>

        {/* Progress Steps */}
        <div className="w-full max-w-md space-y-3">
          <LoadingStep label="Preprocessing image" delay={0} />
          <LoadingStep label="Running UNet inference" delay={200} />
          <LoadingStep label="Running UNet++ inference" delay={400} />
          <LoadingStep label="Generating analysis" delay={600} />
        </div>

        {/* Estimated Time */}
        <div className="text-xs text-gray-500 flex items-center gap-1">
          <Cpu className="w-4 h-4" />
          <span>Estimated time: 1-3 seconds</span>
        </div>
      </div>
    </div>
  );
}

function LoadingStep({ label, delay }: { label: string; delay: number }) {
  return (
    <div
      className="flex items-center gap-3 text-sm text-gray-600 animate-pulse"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
      <span>{label}</span>
    </div>
  );
}

