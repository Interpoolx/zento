import React from 'react';
import type { ImageWidgetContent } from '@/types';
import { cn } from '@/lib/utils';

interface ImageWidgetProps {
  content: ImageWidgetContent;
  style?: React.CSSProperties;
  isEditing?: boolean;
  onClick?: () => void;
}

export function ImageWidget({ content, style, isEditing, onClick }: ImageWidgetProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden group',
        isEditing && 'ring-2 ring-primary-500'
      )}
      style={style}
      onClick={onClick}
    >
      <img
        src={content.url}
        alt={content.alt || ''}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      {content.caption && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
          <p className="text-white text-sm font-medium">{content.caption}</p>
        </div>
      )}
      {content.linkUrl && (
        <a
          href={content.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0"
          onClick={(e) => e.stopPropagation()}
        />
      )}
    </div>
  );
}
