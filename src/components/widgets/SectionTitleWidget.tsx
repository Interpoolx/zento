import React from 'react';
import type { SectionTitleWidgetContent } from '@/types';
import { cn } from '@/lib/utils';

interface SectionTitleWidgetProps {
  content: SectionTitleWidgetContent;
  style?: React.CSSProperties;
  isEditing?: boolean;
  onClick?: () => void;
}

/**
 * Widget component for displaying section headers with title and optional subtitle.
 * Supports text alignment and optional decorative divider.
 * @param props - Component props
 * @param props.content - Section title configuration including title, subtitle, and alignment
 * @param props.style - Optional inline styles
 * @param props.isEditing - Whether the widget is in edit mode
 * @param props.onClick - Optional click handler for edit mode
 * @returns Section header widget with title and optional divider
 */
export function SectionTitleWidget({ content, style, isEditing, onClick }: SectionTitleWidgetProps) {
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <div
      className={cn(
        'flex flex-col h-full p-6 justify-center',
        isEditing && 'ring-2 ring-primary-500/20'
      )}
      style={style}
      onClick={onClick}
    >
      {content.showDivider && (
        <div className={cn(
          'mb-4',
          content.alignment === 'left' && 'mr-auto',
          content.alignment === 'right' && 'ml-auto',
          content.alignment === 'center' && 'mx-auto'
        )}>
          <div className="w-12 h-1 bg-primary-500 rounded-full"></div>
        </div>
      )}

      <h2 className={cn(
        'text-3xl lg:text-4xl font-bold tracking-tight leading-tight mb-3',
        alignmentClasses[content.alignment || 'left']
      )}>
        {content.title}
      </h2>

      {content.subtitle && (
        <p className={cn(
          'text-lg opacity-70 leading-relaxed',
          alignmentClasses[content.alignment || 'left']
        )}>
          {content.subtitle}
        </p>
      )}
    </div>
  );
}
