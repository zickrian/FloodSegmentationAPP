'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ImageTab, ResultImages } from '@/lib/types';
import { Image as ImageIcon, Zap, ZapOff, GitCompare } from 'lucide-react';

interface ImageTabsProps {
  images: ResultImages;
}

export default function ImageTabs({ images }: ImageTabsProps) {
  const [activeTab, setActiveTab] = useState<ImageTab>('original');

  const tabs: { key: ImageTab; label: string; icon: React.ReactNode }[] = [
    { key: 'original', label: 'Original', icon: <ImageIcon className="w-4 h-4" /> },
    { key: 'unet', label: 'UNet', icon: <Zap className="w-4 h-4" /> },
    { key: 'unetpp', label: 'UNet++', icon: <ZapOff className="w-4 h-4" /> },
    { key: 'comparison', label: 'Comparison', icon: <GitCompare className="w-4 h-4" /> },
  ];

  const imageMap: Record<ImageTab, string> = {
    original: images.original,
    unet: images.unet_overlay,
    unetpp: images.unetpp_overlay,
    comparison: images.disagreement,
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      {/* Tab Headers */}
      <div className="border-b border-gray-200">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                flex items-center gap-2 px-6 py-3 font-medium text-sm whitespace-nowrap
                transition-colors border-b-2
                ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }
              `}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
          <Image
            src={imageMap[activeTab]}
            alt={`${activeTab} view`}
            fill
            className="object-contain"
            unoptimized
            priority
          />
        </div>

        {/* Legend */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          {activeTab === 'unet' && (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-gray-700">UNet predicted flood areas (red overlay)</span>
            </div>
          )}
          {activeTab === 'unetpp' && (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-gray-700">UNet++ predicted flood areas (blue overlay)</span>
            </div>
          )}
          {activeTab === 'comparison' && (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 bg-purple-500 rounded"></div>
              <span className="text-gray-700">Disagreement areas (purple overlay)</span>
            </div>
          )}
          {activeTab === 'original' && (
            <p className="text-sm text-gray-700">Original uploaded image</p>
          )}
        </div>
      </div>
    </div>
  );
}

