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
        'group relative overflow-hidden transition-all duration-500 cursor-pointer h-full',
        'hover:scale-[1.01]',
        isEditing && 'ring-2 ring-primary-500/20'
      )}
      style={style}
      onClick={onClick}
    >
      <div className="flex flex-col p-6 h-full justify-between">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-110 transition-transform duration-500">
                {faviconUrl ? (
                  <img src={faviconUrl} alt="" className="w-6 h-6 object-contain" />
                ) : (
                  <div className="w-6 h-6 bg-primary-50 text-primary-500 flex items-center justify-center font-bold text-xs">
                    {content.title.charAt(0)}
                  </div>
                )}
              </div>
              <h4 className="font-bold text-gray-900 truncate text-lg tracking-tight leading-none">{content.title}</h4>
            </div>
            {content.description && (
              <p className="text-sm text-gray-500/80 font-medium line-clamp-2 leading-relaxed">{content.description}</p>
            )}
          </div>
          <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
            <svg className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </div>

        {content.imageUrl && (
          <div className="mt-4 w-full aspect-[2/1] overflow-hidden rounded-2xl border border-gray-100/50 shadow-inner">
            <img
              src={content.imageUrl}
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>
        )}
      </div>
    </div>
  );
}
