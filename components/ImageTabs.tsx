'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ImageTab, ResultImages } from '@/lib/types';

// Icons with consistent styling
const ImageIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
    <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const ZapIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" fill="currentColor" />
  </svg>
);

const LayersIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="12,2 2,7 12,12 22,7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CompareIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="18" cy="18" r="3" stroke="currentColor" strokeWidth="2" />
    <circle cx="6" cy="6" r="3" stroke="currentColor" strokeWidth="2" />
    <path d="M6 21V9a6 6 0 0 1 6 6v6M18 3v12a6 6 0 0 1-6-6V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

interface ImageTabsProps {
  images: ResultImages;
}

export default function ImageTabs({ images }: ImageTabsProps) {
  const [activeTab, setActiveTab] = useState<ImageTab>('original');

  const tabs: { key: ImageTab; label: string; icon: React.ReactNode; colorClass: string }[] = [
    { key: 'original', label: 'Original', icon: <ImageIcon />, colorClass: 'text-gray-600' },
    { key: 'unet', label: 'UNet', icon: <ZapIcon />, colorClass: 'text-red-500' },
    { key: 'unetpp', label: 'UNet++', icon: <LayersIcon />, colorClass: 'text-blue-600' },
    { key: 'comparison', label: 'Compare', icon: <CompareIcon />, colorClass: 'text-purple-600' },
  ];

  const imageMap: Record<ImageTab, string> = {
    original: images.original,
    unet: images.unet_overlay,
    unetpp: images.unetpp_overlay,
    comparison: images.disagreement,
  };

  const legends: Record<ImageTab, { color: string; text: string } | null> = {
    original: null,
    unet: { color: 'bg-red-500', text: 'UNet predicted flood areas (red overlay)' },
    unetpp: { color: 'bg-blue-500', text: 'UNet++ predicted flood areas (blue overlay)' },
    comparison: { color: 'bg-purple-500', text: 'Disagreement areas (purple overlay)' },
  };

  return (
    <div className="card overflow-hidden">
      {/* Tabs */}
      <div className="tab-container overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`tab-button ${activeTab === tab.key ? 'active' : ''}`}
          >
            <span className={activeTab === tab.key ? tab.colorClass : ''}>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Image */}
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
          {legends[activeTab] ? (
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-4 h-4 rounded ${legends[activeTab]!.color}`} />
              <span className="text-gray-700">{legends[activeTab]!.text}</span>
            </div>
          ) : (
            <p className="text-sm text-gray-600">Original uploaded image</p>
          )}
        </div>
      </div>
    </div>
  );
}
