import React from 'react';
import type { VideoWidgetContent } from '@/types';
import { cn } from '@/lib/utils';

interface VideoWidgetProps {
  content: VideoWidgetContent;
  style?: React.CSSProperties;
  isEditing?: boolean;
  onClick?: () => void;
}

export function VideoWidget({ content, style, isEditing, onClick }: VideoWidgetProps) {
  const getEmbedUrl = (url: string): string => {
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      if (videoId) return `https://player.vimeo.com/video/${videoId}`;
    }
    return url;
  };

  const isYouTube = content.url.includes('youtube') || content.url.includes('youtu.be');
  const isVimeo = content.url.includes('vimeo');
  const embedUrl = getEmbedUrl(content.url);

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-gray-900 w-full h-full',
        isEditing && 'ring-2 ring-primary-500'
      )}
      style={style}
      onClick={onClick}
    >
      {(isYouTube || isVimeo) ? (
        <iframe
          src={embedUrl}
          title={content.title || 'Video'}
          className="w-full h-full absolute inset-0 pointer-events-none"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center text-white p-4">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm opacity-80">{content.title || 'Video'}</p>
            <p className="text-xs opacity-60 mt-1">Click to play</p>
          </div>
        </div>
      )}
      {content.thumbnailUrl && !isYouTube && (
        <img
          src={content.thumbnailUrl}
          alt=""
          className="w-full h-full object-cover absolute inset-0"
        />
      )}
    </div>
  );
}
