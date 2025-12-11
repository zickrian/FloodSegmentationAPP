'use client';

import React from 'react';
import Image from 'next/image';
import { X, FileImage } from 'lucide-react';

interface ImagePreviewProps {
  imageUrl: string;
  fileName: string;
  onRemove: () => void;
  disabled?: boolean;
}

export default function ImagePreview({
  imageUrl,
  fileName,
  onRemove,
  disabled = false,
}: ImagePreviewProps) {
  return (
    <div className="relative w-full bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-start gap-4">
        {/* Image Preview */}
        <div className="relative w-32 h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
          <Image
            src={imageUrl}
            alt="Preview"
            fill
            className="object-cover"
          />
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <FileImage className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {fileName}
                </h3>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Image ready for segmentation
              </p>
            </div>

            {/* Remove Button */}
            {!disabled && (
              <button
                onClick={onRemove}
                className="ml-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Remove image"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            )}
          </div>

          {/* Status Badge */}
          <div className="mt-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Ready
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

