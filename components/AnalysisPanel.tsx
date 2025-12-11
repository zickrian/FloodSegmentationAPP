'use client';

import React from 'react';
import { ModelResult, ComparisonResult } from '@/lib/types';
import { formatNumber, formatPercent } from '@/lib/utils';
import { Droplets, Activity, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

interface AnalysisPanelProps {
  unet: ModelResult;
  unetpp: ModelResult;
  comparison: ComparisonResult;
}

export default function AnalysisPanel({ unet, unetpp, comparison }: AnalysisPanelProps) {
  return (
    <div className="w-full space-y-6">
      {/* Summary Card */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-md p-6 border border-blue-200">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Info className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Analysis Summary
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {comparison.summary}
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Segmentation Statistics
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Metric
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  UNet
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  UNet++
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  Flood Area %
                </td>
                <td className="px-6 py-4 text-sm text-right font-semibold text-red-600">
                  {formatPercent(unet.flood_percent)}
                </td>
                <td className="px-6 py-4 text-sm text-right font-semibold text-blue-600">
                  {formatPercent(unetpp.flood_percent)}
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  Flood Pixels
                </td>
                <td className="px-6 py-4 text-sm text-right text-gray-700">
                  {formatNumber(unet.flood_pixels)}
                </td>
                <td className="px-6 py-4 text-sm text-right text-gray-700">
                  {formatNumber(unetpp.flood_pixels)}
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  Total Pixels
                </td>
                <td className="px-6 py-4 text-sm text-right text-gray-700">
                  {formatNumber(unet.total_pixels)}
                </td>
                <td className="px-6 py-4 text-sm text-right text-gray-700">
                  {formatNumber(unetpp.total_pixels)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Model Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* UNet Card */}
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Droplets className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-900 mb-1">UNet Model</h4>
              <p className="text-xs text-gray-600 leading-relaxed">{unet.summary}</p>
            </div>
          </div>
        </div>

        {/* UNet++ Card */}
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Droplets className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-900 mb-1">UNet++ Model</h4>
              <p className="text-xs text-gray-600 leading-relaxed">{unetpp.summary}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Agreement Badge */}
      <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {comparison.agreement_percent >= 90 ? (
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            ) : comparison.agreement_percent >= 80 ? (
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-red-600" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">Model Agreement</p>
              <p className="text-xs text-gray-600">
                {formatPercent(comparison.agreement_percent)} consensus
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">
              {comparison.agreement_percent.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500">
              {formatNumber(comparison.disagreement_pixels)} px differ
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

