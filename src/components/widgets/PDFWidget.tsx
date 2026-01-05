import React from 'react';
import type { PDFWidgetContent } from '@/types';
import { cn } from '@/lib/utils';

interface PDFWidgetProps {
  content: PDFWidgetContent;
  style?: React.CSSProperties;
  isEditing?: boolean;
  onClick?: () => void;
}

/**
 * Widget component for displaying PDF documents with download functionality.
 * Shows a PDF icon, title, page count, and download/preview buttons.
 * @param props - Component props
 * @param props.content - PDF configuration including URL, title, and page count
 * @param props.style - Optional inline styles
 * @param props.isEditing - Whether the widget is in edit mode
 * @param props.onClick - Optional click handler for edit mode
 * @returns PDF document widget with download and preview options
 */
export function PDFWidget({ content, style, isEditing, onClick }: PDFWidgetProps) {
  return (
    <div
      className={cn(
        'flex flex-col h-full p-6',
        isEditing && 'ring-2 ring-primary-500/20'
      )}
      style={style}
      onClick={onClick}
    >
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
        {/* PDF Icon */}
        <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center">
          <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 2a2 2 0 012-2h6a2 2 0 012 2v1h3a2 2 0 012 2v2h1a2 2 0 110 4h-1v6a2 2 0 01-2 2H4a2 2 0 01-2-2V9H1a2 2 0 110-4h1V4a2 2 0 012-2h3V2zm9 2H8v12h8V4z" />
          </svg>
        </div>

        {/* Title */}
        {content.title && <h3 className="font-bold text-lg">{content.title}</h3>}

        {/* Info */}
        <div className="text-sm opacity-70">
          {content.pages ? `${content.pages} pages` : 'PDF Document'}
        </div>

        {/* Download Button */}
        <a
          href={content.url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'px-6 py-2 rounded-lg font-semibold text-sm',
            'bg-primary-500 text-white hover:bg-primary-600',
            'transition-colors inline-flex items-center gap-2'
          )}
          onClick={(e) => isEditing && e.preventDefault()}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download
        </a>

        {/* Preview Link */}
        {content.showPreview && (
          <a
            href={content.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-500 hover:text-primary-600 text-sm font-medium"
            onClick={(e) => isEditing && e.preventDefault()}
          >
            Preview PDF
          </a>
        )}
      </div>
    </div>
  );
}
