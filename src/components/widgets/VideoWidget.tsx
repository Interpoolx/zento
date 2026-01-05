import React from 'react';
import type { VideoWidgetContent } from '@/types';
import { cn } from '@/lib/utils';

interface VideoWidgetProps {
  content: VideoWidgetContent;
  style?: React.CSSProperties;
  isEditing?: boolean;
  onClick?: () => void;
  aspectRatio?: string;
}

/**
 * Widget component for embedding video content from popular platforms.
 * 
 * Automatically detects and converts video URLs from YouTube, Vimeo, and other
 * sources into embeddable iframe formats. Uses CSS padding trick to maintain
 * responsive aspect ratios without layout shift.
 * 
 * Supported URL Formats:
 * - YouTube: `youtube.com/watch?v=VIDEO_ID` or `youtu.be/VIDEO_ID`
 * - Vimeo: `vimeo.com/VIDEO_ID`
 * - Direct: Any direct video URL (shows placeholder with custom thumbnail)
 * 
 * Features:
 * - Automatic URL parsing and embed conversion
 * - Responsive aspect ratio (default 16:9, customizable)
 * - Poster image for non-embeddable sources
 * - Pointer events disabled in preview to allow parent interaction
 * - Edit mode indicator for page builder
 * 
 * @component
 * @param {VideoWidgetProps} props - Component configuration
 * @param {VideoWidgetContent} props.content - Video settings
 * @param {string} props.content.url - Video URL (YouTube, Vimeo, or direct)
 * @param {string} [props.content.title] - Video title for accessibility and display
 * @param {string} [props.content.thumbnailUrl] - Poster image for non-embed videos
 * @param {React.CSSProperties} [props.style] - Custom container styles
 * @param {boolean} [props.isEditing=false] - Enables edit mode styling
 * @param {() => void} [props.onClick] - Click handler for editor selection
 * @param {string} [props.aspectRatio='16/9'] - Aspect ratio as 'width/height'
 *                                              Common values: '16/9', '4/3', '1/1', '21/9'
 * @returns {React.ReactElement} Responsive video embed or placeholder
 * 
 * @example
 * // YouTube video embed
 * <VideoWidget
 *   content={{
 *     url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
 *     title: 'Product Demo'
 *   }}
 * />
 * 
 * @example
 * // Vimeo video with custom aspect ratio
 * <VideoWidget
 *   content={{
 *     url: 'https://vimeo.com/123456789',
 *     title: 'Company Overview'
 *   }}
 *   aspectRatio="4/3"
 * />
 * 
 * @example
 * // Custom video with thumbnail
 * <VideoWidget
 *   content={{
 *     url: 'https://cdn.example.com/video.mp4',
 *     title: 'Tutorial',
 *     thumbnailUrl: 'https://cdn.example.com/thumbnail.jpg'
 *   }}
 *   aspectRatio="16/9"
 * />
 * 
 * @note Iframe pointer-events are disabled to allow widget selection in editor
 * @note For YouTube, both /watch?v= and youtu.be/ short URLs are supported
 * @see VideoWidgetContent for full content type definition
 */
export function VideoWidget({ content, style, isEditing, onClick, aspectRatio = '16/9' }: VideoWidgetProps) {
  /**
   * Converts a video URL to an embeddable iframe-compatible format.
   * 
   * Parses various video platform URL formats and extracts the video ID
   * to construct the proper embed URL. Falls back to the original URL
   * for direct video files or unsupported platforms.
   * 
   * @param url - The original video URL in any supported format
   * @returns The iframe-ready embed URL
   * 
   * @example
   * getEmbedUrl('https://youtube.com/watch?v=abc123')  // 'https://www.youtube.com/embed/abc123'
   * getEmbedUrl('https://youtu.be/abc123')             // 'https://www.youtube.com/embed/abc123'
   * getEmbedUrl('https://vimeo.com/123456')            // 'https://player.vimeo.com/video/123456'
   * getEmbedUrl('https://example.com/video.mp4')       // 'https://example.com/video.mp4' (unchanged)
   */
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

  /**
   * Calculates CSS padding-bottom percentage to maintain a responsive aspect ratio.
   * 
   * Uses the "padding hack" technique where padding-bottom percentage is relative
   * to element width, allowing height to scale proportionally without JavaScript.
   * 
   * @param ratio - Aspect ratio as "width/height" string (e.g., '16/9', '4/3')
   * @returns Padding percentage (e.g., 56.25 for 16:9 ratio)
   * 
   * @example
   * getAspectRatioPadding('16/9')  // Returns 56.25 (9/16 * 100)
   * getAspectRatioPadding('4/3')   // Returns 75 (3/4 * 100)
   * getAspectRatioPadding('1/1')   // Returns 100 (square)
   * getAspectRatioPadding('21/9')  // Returns 42.86 (ultrawide)
   */
  const getAspectRatioPadding = (ratio: string) => {
    const [w, h] = ratio.split('/').map(Number);
    return (h / w) * 100;
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-gray-900 w-full',
        isEditing && 'ring-2 ring-primary-500'
      )}
      style={{
        ...style,
        paddingBottom: `${getAspectRatioPadding(aspectRatio)}%`,
        height: 'auto'
      }}
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
