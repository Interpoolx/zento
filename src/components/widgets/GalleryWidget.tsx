import React, { useState } from 'react';
import type { GalleryWidgetContent } from '@/types';
import { cn } from '@/lib/utils';

interface GalleryWidgetProps {
  content: GalleryWidgetContent;
  style?: React.CSSProperties;
  isEditing?: boolean;
  onClick?: () => void;
}

/**
 * Widget component for displaying a responsive, interactive image gallery grid.
 * 
 * Renders a configurable grid of images with hover effects, optional captions,
 * clickable links, and a fullscreen lightbox viewer. Designed for portfolios,
 * product showcases, or any visual content displays.
 * 
 * Features:
 * - Configurable grid columns (1-5 columns)
 * - Three spacing options: small, medium, large
 * - Hover zoom effect on images
 * - Optional captions revealed on hover
 * - Optional external links per image
 * - Fullscreen lightbox with click-outside-to-close
 * - Responsive aspect-ratio square thumbnails
 * 
 * @component
 * @param {GalleryWidgetProps} props - Component configuration
 * @param {GalleryWidgetContent} props.content - Gallery structure and settings
 * @param {GalleryImage[]} props.content.images - Array of image objects
 * @param {string} props.content.images[].id - Unique identifier for the image
 * @param {string} props.content.images[].url - Image source URL
 * @param {string} [props.content.images[].alt] - Alt text for accessibility
 * @param {string} [props.content.images[].caption] - Caption shown on hover
 * @param {string} [props.content.images[].linkUrl] - Optional external link
 * @param {number} [props.content.columns=3] - Number of grid columns (1-5)
 * @param {'small' | 'medium' | 'large'} [props.content.spacing='medium'] - Gap between images
 * @param {boolean} [props.content.showLightbox=true] - Enable fullscreen lightbox on click
 * @param {React.CSSProperties} [props.style] - Custom container styles
 * @param {boolean} [props.isEditing=false] - Enables edit mode (disables lightbox)
 * @param {() => void} [props.onClick] - Click handler for editor selection
 * @returns {React.ReactElement} Responsive image gallery grid with optional lightbox
 * 
 * @example
 * // Portfolio gallery with captions
 * <GalleryWidget
 *   content={{
 *     columns: 3,
 *     spacing: 'medium',
 *     showLightbox: true,
 *     images: [
 *       { id: '1', url: '/work/project1.jpg', alt: 'Project 1', caption: 'E-commerce Redesign' },
 *       { id: '2', url: '/work/project2.jpg', alt: 'Project 2', caption: 'Mobile App UI' },
 *       { id: '3', url: '/work/project3.jpg', alt: 'Project 3', caption: 'Brand Identity' }
 *     ]
 *   }}
 * />
 * 
 * @example
 * // Product gallery with purchase links
 * <GalleryWidget
 *   content={{
 *     columns: 4,
 *     spacing: 'small',
 *     showLightbox: false,
 *     images: [
 *       { id: 'p1', url: '/products/shirt.jpg', linkUrl: '/shop/shirt', alt: 'T-Shirt' },
 *       { id: 'p2', url: '/products/hoodie.jpg', linkUrl: '/shop/hoodie', alt: 'Hoodie' }
 *     ]
 *   }}
 * />
 * 
 * @note Lightbox is disabled in edit mode to allow widget selection
 * @note Images use object-cover for consistent aspect ratios
 * @see GalleryWidgetContent for full content type definition
 * @see GalleryImage for individual image configuration
 */
export function GalleryWidget({ content, style, isEditing, onClick }: GalleryWidgetProps) {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const columns = content.columns || 3;
  const spacing = {
    small: 'gap-2',
    medium: 'gap-4',
    large: 'gap-6',
  };

  /**
   * Handles image clicks for lightbox display.
   * Stops propagation in edit mode to prevent widget selection.
   * @param url - The image URL to display in lightbox
   * @param e - The mouse event
   */
  const handleImageClick = (url: string, e: React.MouseEvent) => {
    if (isEditing) {
      e.stopPropagation();
    } else if (content.showLightbox) {
      setLightboxImage(url);
    }
  };

  return (
    <div
      className={cn('flex flex-col h-full p-6', isEditing && 'ring-2 ring-primary-500/20')}
      style={style}
      onClick={onClick}
    >
      <div className={cn(
        'grid',
        `grid-cols-${columns}`,
        spacing[content.spacing || 'medium'],
        'auto-rows-max'
      )}>
        {content.images.map(image => (
          <div key={image.id} className="overflow-hidden rounded-lg">
            <div
              className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 cursor-pointer group"
              onClick={(e) => handleImageClick(image.url, e)}
            >
              <img
                src={image.url}
                alt={image.alt || ''}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {image.caption && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-end">
                  <p className="text-white text-sm p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    {image.caption}
                  </p>
                </div>
              )}
              {image.linkUrl && (
                <a
                  href={image.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxImage && content.showLightbox && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={lightboxImage}
              alt=""
              className="w-full h-full object-contain"
            />
            <button
              className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              onClick={() => setLightboxImage(null)}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
