'use client';

import React, { useCallback, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { validateImageFile, fileToDataURL } from '@/lib/utils';

interface UploadZoneProps {
  onFileSelect: (file: File, previewUrl: string) => void;
  disabled?: boolean;
}

export default function UploadZone({ onFileSelect, disabled = false }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);

      // Validate file
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setError(validation.error || 'Invalid file');
        return;
      }

      try {
        // Convert to data URL for preview
        const previewUrl = await fileToDataURL(file);
        onFileSelect(file, previewUrl);
      } catch (err) {
        setError('Failed to read file');
        console.error(err);
      }
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled) return;

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile, disabled]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleClick = useCallback(() => {
    if (!disabled) {
      document.getElementById('file-input')?.click();
    }
  }, [disabled]);

  return (
    <div className="w-full">
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
          transition-all duration-200
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400 hover:bg-gray-100'}
        `}
      >
        <input
          id="file-input"
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleFileInput}
          disabled={disabled}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-4">
          <div className={`p-4 rounded-full ${isDragging ? 'bg-blue-100' : 'bg-gray-200'}`}>
            {isDragging ? (
              <Upload className="w-8 h-8 text-blue-600" />
            ) : (
              <ImageIcon className="w-8 h-8 text-gray-600" />
            )}
          </div>

          <div>
            <p className="text-lg font-semibold text-gray-700">
              {isDragging ? 'Drop your image here' : 'Drag & drop your flood image'}
            </p>
            <p className="text-sm text-gray-500 mt-1">or click to browse</p>
          </div>

          <div className="text-xs text-gray-400">
            Supported formats: JPG, JPEG, PNG · Max size: 10MB
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-900">Upload Error</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}

