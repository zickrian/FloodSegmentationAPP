'use client';

import React from 'react';
import Image from 'next/image';

const FileIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 2v6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const XIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const CheckIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

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
    <div className="card p-4">
      <div className="flex flex-col sm:flex-row items-start gap-4">
        {/* Image */}
        <div className="relative w-full sm:w-24 h-32 sm:h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
          <Image
            src={imageUrl}
            alt="Preview"
            fill
            className="object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 w-full">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="icon-box icon-box-primary" style={{ width: '32px', height: '32px' }}>
                  <FileIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">{fileName}</h3>
                  <p className="text-xs text-gray-500">Ready for segmentation</p>
                </div>
              </div>
            </div>

            {!disabled && (
              <button
                onClick={onRemove}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                aria-label="Remove image"
              >
                <XIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          <div className="mt-3">
            <span className="badge badge-success">
              <CheckIcon className="w-3.5 h-3.5" />
              Ready
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
