import React from 'react';
import type { TextWidgetContent } from '@/types';
import { cn } from '@/lib/utils';

interface TextWidgetProps {
  content: TextWidgetContent;
  style?: React.CSSProperties;
  isEditing?: boolean;
  onClick?: () => void;
}

export function TextWidget({ content, style, isEditing, onClick }: TextWidgetProps) {
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <div
      className={cn(
        'flex flex-col h-full p-6',
        isEditing && 'ring-2 ring-primary-500/20'
      )}
      style={style}
      onClick={onClick}
    >
      <div
        className={cn(
          'whitespace-pre-wrap break-words font-bold tracking-tight',
          content.size === 'small' ? 'text-sm' : content.size === 'large' ? 'text-3xl lg:text-4xl' : 'text-xl',
          alignmentClasses[content.alignment || 'left'],
          'leading-[1.1]'
        )}
        style={{ color: 'inherit' }}
      >
        {content.content}
      </div>
    </div>
  );
}
