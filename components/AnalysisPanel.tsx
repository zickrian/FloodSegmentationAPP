'use client';

import React from 'react';
import { ModelResult, ComparisonResult } from '@/lib/types';
import { formatNumber, formatPercent } from '@/lib/utils';

// Icons
const InfoIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const BarChartIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="18" y1="20" x2="18" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="12" y1="20" x2="12" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="6" y1="20" x2="6" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const DropletIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2.69l.01.01C16.79 7.36 20 11.12 20 14a8 8 0 1 1-16 0c0-2.88 3.21-6.64 7.99-11.31L12 2.69z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CheckCircleIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const AlertIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

interface AnalysisPanelProps {
  unet: ModelResult;
  unetpp: ModelResult;
  comparison: ComparisonResult;
}

export default function AnalysisPanel({ unet, unetpp, comparison }: AnalysisPanelProps) {
  const getAgreementStatus = () => {
    if (comparison.agreement_percent >= 90) return { color: 'success', icon: <CheckCircleIcon className="w-6 h-6 text-green-600" /> };
    if (comparison.agreement_percent >= 80) return { color: 'warning', icon: <AlertIcon className="w-6 h-6 text-yellow-600" /> };
    return { color: 'error', icon: <AlertIcon className="w-6 h-6 text-red-600" /> };
  };

  const status = getAgreementStatus();

  return (
    <div className="w-full space-y-4">
      {/* Summary */}
      <div className="card p-4" style={{ background: '#eff6ff', borderColor: '#bfdbfe' }}>
        <div className="flex items-start gap-3">
          <div className="icon-box icon-box-primary flex-shrink-0">
            <InfoIcon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Analysis Summary</h3>
            <p className="text-sm text-gray-700">{comparison.summary}</p>
          </div>
        </div>
      </div>

      {/* Statistics Table */}
      <div className="card overflow-hidden">
        <div className="section-header">
          <BarChartIcon className="w-5 h-5 text-blue-600" />
          <span className="section-title">Statistics</span>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table w-full table-fixed">
            <thead>
              <tr>
                <th className="text-left w-[40%]">Metric</th>
                <th className="text-center w-[30%] text-red-600 font-semibold">UNet</th>
                <th className="text-center w-[30%] text-blue-600 font-semibold">UNet++</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-left w-[40%] font-medium text-gray-900">Flood Area %</td>
                <td className="text-center w-[30%] font-semibold text-red-600">{formatPercent(unet.flood_percent)}</td>
                <td className="text-center w-[30%] font-semibold text-blue-600">{formatPercent(unetpp.flood_percent)}</td>
              </tr>
              <tr>
                <td className="text-left w-[40%] font-medium text-gray-900">Flood Pixels</td>
                <td className="text-center w-[30%] text-gray-700">{formatNumber(unet.flood_pixels)}</td>
                <td className="text-center w-[30%] text-gray-700">{formatNumber(unetpp.flood_pixels)}</td>
              </tr>
              <tr>
                <td className="text-left w-[40%] font-medium text-gray-900">Total Pixels</td>
                <td className="text-center w-[30%] text-gray-700">{formatNumber(unet.total_pixels)}</td>
                <td className="text-center w-[30%] text-gray-700">{formatNumber(unetpp.total_pixels)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Model Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="card p-4">
          <div className="flex items-start gap-3">
            <div className="icon-box icon-box-unet flex-shrink-0">
              <DropletIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 mb-1">UNet Model</h4>
              <p className="text-xs text-gray-600">{unet.summary}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-start gap-3">
            <div className="icon-box icon-box-unetpp flex-shrink-0">
              <DropletIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 mb-1">UNet++ Model</h4>
              <p className="text-xs text-gray-600">{unetpp.summary}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Agreement */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {status.icon}
            <div>
              <p className="text-sm font-semibold text-gray-900">Model Agreement</p>
              <p className="text-xs text-gray-500">{formatPercent(comparison.agreement_percent)} consensus</p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className={`metric-value ${comparison.agreement_percent >= 90 ? 'text-green-600' :
              comparison.agreement_percent >= 80 ? 'text-yellow-600' : 'text-red-600'
              }`}>
              {comparison.agreement_percent.toFixed(1)}%
            </p>
            <p className="metric-label">{formatNumber(comparison.disagreement_pixels)} px differ</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="progress-bar">
            <div
              className={`progress-bar-fill ${status.color}`}
              style={{ width: `${comparison.agreement_percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Model Performance Metrics */}
      <div className="card overflow-hidden">
        <div className="section-header">
          <svg className="w-5 h-5 text-purple-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="section-title">Model Performance (Training Metrics)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table w-full table-fixed">
            <thead>
              <tr>
                <th className="text-left w-[40%]">Metric</th>
                <th className="text-center w-[30%] text-red-600 font-semibold">UNet</th>
                <th className="text-center w-[30%] text-blue-600 font-semibold">UNet++</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-left w-[40%] font-medium text-gray-900">Loss</td>
                <td className="text-center w-[30%] text-gray-700">
                  {unet.training_metrics?.loss != null ? unet.training_metrics.loss.toFixed(4) : 'N/A'}
                </td>
                <td className="text-center w-[30%] text-gray-700">
                  {unetpp.training_metrics?.loss != null ? unetpp.training_metrics.loss.toFixed(4) : 'N/A'}
                </td>
              </tr>
              <tr>
                <td className="text-left w-[40%] font-medium text-gray-900">IoU Score</td>
                <td className="text-center w-[30%] font-semibold text-red-600">
                  {unet.training_metrics?.iou != null ? formatPercent(unet.training_metrics.iou) : 'N/A'}
                </td>
                <td className="text-center w-[30%] font-semibold text-blue-600">
                  {unetpp.training_metrics?.iou != null ? formatPercent(unetpp.training_metrics.iou) : 'N/A'}
                </td>
              </tr>
              <tr>
                <td className="text-left w-[40%] font-medium text-gray-900">Dice Score</td>
                <td className="text-center w-[30%] font-semibold text-red-600">
                  {unet.training_metrics?.dice != null ? formatPercent(unet.training_metrics.dice) : 'N/A'}
                </td>
                <td className="text-center w-[30%] font-semibold text-blue-600">
                  {unetpp.training_metrics?.dice != null ? formatPercent(unetpp.training_metrics.dice) : 'N/A'}
                </td>
              </tr>
              <tr>
                <td className="text-left w-[40%] font-medium text-gray-900">Pixel Accuracy</td>
                <td className="text-center w-[30%] font-semibold text-red-600">
                  {unet.training_metrics?.accuracy != null ? formatPercent(unet.training_metrics.accuracy) : 'N/A'}
                </td>
                <td className="text-center w-[30%] font-semibold text-blue-600">
                  {unetpp.training_metrics?.accuracy != null ? formatPercent(unetpp.training_metrics.accuracy) : 'N/A'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="p-3 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            * Metrics from model training/validation on flood segmentation dataset
          </p>
        </div>
      </div>
    </div>
  );
}
