import React from 'react';
import type { LinkWidgetContent } from '@/types';
import { cn } from '@/lib/utils';

interface LinkWidgetProps {
  content: LinkWidgetContent;
  style?: React.CSSProperties;
  isEditing?: boolean;
  onClick?: () => void;
}

export function LinkWidget({ content, style, isEditing, onClick }: LinkWidgetProps) {
  const getFavicon = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return undefined;
    }
  };

  const faviconUrl = getFavicon(content.url);

  return (
    <div
      className={cn(
        'group relative overflow-hidden transition-all duration-300 cursor-pointer',
        'hover:shadow-lg hover:-translate-y-0.5',
        isEditing && 'ring-2 ring-primary-500'
      )}
      style={style}
      onClick={onClick}
    >
      <div className="flex items-center p-4 h-full">
        {content.imageUrl && (
          <div className="flex-shrink-0 w-16 h-16 mr-4 overflow-hidden rounded-lg">
            <img
              src={content.imageUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {faviconUrl && (
              <img src={faviconUrl} alt="" className="w-4 h-4" />
            )}
            <h4 className="font-semibold text-gray-900 truncate">{content.title}</h4>
          </div>
          {content.description && (
            <p className="text-sm text-gray-500 line-clamp-2">{content.description}</p>
          )}
        </div>
        <div className="flex-shrink-0 ml-4">
          <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
