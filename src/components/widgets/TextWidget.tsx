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
  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  };

  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <div
      className={cn(
        'flex items-center justify-center h-full p-4',
        isEditing && 'ring-2 ring-primary-500'
      )}
      style={style}
      onClick={onClick}
    >
      <div
        className={cn(
          'whitespace-pre-wrap break-words',
          sizeClasses[content.size || 'medium'],
          alignmentClasses[content.alignment || 'left']
        )}
        style={{ color: 'inherit' }}
      >
        {content.content}
      </div>
    </div>
  );
}
