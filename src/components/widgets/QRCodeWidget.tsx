import React, { lazy, Suspense } from 'react';
import type { QRCodeWidgetContent } from '@/types';
import { cn } from '@/lib/utils';

type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

// Lazy load the QRCodeSVG component to avoid Vite pre-bundling issues
const QRCodeSVG = lazy(() =>
  import('qrcode.react').then(module => ({
    default: module.QRCodeSVG
  }))
);

interface QRCodeWidgetProps {
  content: QRCodeWidgetContent;
  style?: React.CSSProperties;
  isEditing?: boolean;
  onClick?: () => void;
}

/**
 * Widget component for displaying a QR code that encodes a URL or text.
 * Supports configurable size, error correction level, and margin settings.
 * @param props - Component props
 * @param props.content - QR code configuration including data, size, and error correction
 * @param props.style - Optional inline styles
 * @param props.isEditing - Whether the widget is in edit mode
 * @param props.onClick - Optional click handler for edit mode
 * @returns QR code widget with lazy-loaded SVG renderer
 */
export function QRCodeWidget({ content, style, isEditing, onClick }: QRCodeWidgetProps) {
  const sizeMap = {
    small: 120,
    medium: 200,
    large: 280,
  };

  const size = sizeMap[content.size || 'medium'];
  const level: ErrorCorrectionLevel = (content.errorCorrection || 'M') as ErrorCorrectionLevel;
  const includeMargin = content.includeMargin !== false;

  // Ensure data is not empty
  const qrData = content.data || 'https://example.com';

  return (
    <div
      className={cn(
        'flex flex-col h-full p-6 items-center justify-center',
        isEditing && 'ring-2 ring-primary-500/20'
      )}
      style={style}
      onClick={onClick}
    >
      <div className="text-center">
        <div
          className="mb-4 inline-block p-4 bg-white rounded-lg shadow-sm"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Suspense fallback={<div className="w-20 h-20 bg-gray-100 rounded animate-pulse" />}>
            <div
              style={{
                padding: includeMargin ? '8px' : '0px',
                backgroundColor: '#ffffff',
                borderRadius: '4px',
              }}
            >
              <QRCodeSVG
                value={qrData}
                size={size}
                level={level}
                includeMargin={false}
                fgColor="#000000"
                bgColor="#ffffff"
              />
            </div>
          </Suspense>
        </div>
        <p className="text-xs opacity-70 mt-3">Scan to visit</p>
        {isEditing && qrData === 'https://example.com' && (
          <p className="text-xs text-yellow-600 mt-2">
            ℹ️ Set QR code data in properties panel
          </p>
        )}
      </div>
    </div>
  );
}
