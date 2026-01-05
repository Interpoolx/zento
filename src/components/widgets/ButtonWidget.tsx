import React from 'react';
import type { ButtonWidgetContent } from '@/types';
import { cn } from '@/lib/utils';

interface ButtonWidgetProps {
  content: ButtonWidgetContent;
  style?: React.CSSProperties;
  isEditing?: boolean;
  onClick?: () => void;
}

/**
 * Widget component for rendering a styled button/link element.
 * Supports primary, secondary, and outline variants with size options.
 * @param props - Component props
 * @param props.content - Button content configuration (text, URL, variant, size)
 * @param props.style - Optional inline styles
 * @param props.isEditing - Whether the widget is in edit mode
 * @param props.onClick - Optional click handler for edit mode
 * @returns Styled button widget with link functionality
 */
export function ButtonWidget({ content, style, isEditing, onClick }: ButtonWidgetProps) {
  const variantClasses = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    outline: 'border-2 border-current text-inherit hover:bg-black/5',
  };

  const sizeClasses = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg',
  };

  const variant = content.variant || 'primary';
  const size = content.size || 'medium';

  return (
    <div
      className={cn(
        'flex h-full items-center justify-center p-6',
        isEditing && 'ring-2 ring-primary-500/20'
      )}
      style={style}
      onClick={onClick}
    >
      <a
        href={content.url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'font-semibold rounded-lg transition-all duration-200 inline-block',
          'hover:scale-105 active:scale-95',
          variantClasses[variant],
          sizeClasses[size],
          content.fullWidth && 'w-full text-center'
        )}
      >
        {content.text}
      </a>
    </div>
  );
}
