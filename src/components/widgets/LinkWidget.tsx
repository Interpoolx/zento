import React from 'react';
import type { LinkWidgetContent } from '@/types';
import { cn } from '@/lib/utils';

interface LinkWidgetProps {
  content: LinkWidgetContent;
  style?: React.CSSProperties;
  isEditing?: boolean;
  onClick?: () => void;
}

/**
 * Link widget component displaying an interactive card with favicon, title, description, and preview image.
 * Perfect for linking to external sites, portfolios, or resources directly from a profile page.
 *
 * Features:
 * - Automatic favicon extraction from URL (via Google's favicon service)
 * - Displays title and optional description with ellipsis handling
 * - Optional preview image with hover zoom effect
 * - Arrow icon reveals on hover for visual feedback
 * - Smooth transitions and hover animations
 * - Edit mode styling when building/modifying
 *
 * Content structure:
 * - `title`: Display name for the link (e.g., "My Portfolio")
 * - `description`: Optional subtitle/tagline
 * - `url`: Target URL (required)
 * - `imageUrl`: Optional preview image
 *
 * Common use cases:
 * - Portfolio links on profile pages
 * - Social media or external site links
 * - Resource/download links
 * - Call-to-action cards
 *
 * @param props - Link widget configuration
 * @param props.content - Link content data including URL, title, description
 * @param props.content.url - Target URL (used to extract favicon and for clicks)
 * @param props.content.title - Display text for the link
 * @param props.content.description - Optional subtitle/description text
 * @param props.content.imageUrl - Optional preview image URL
 * @param props.style - CSS properties for styling (colors, shadows, border radius)
 * @param props.isEditing - Whether widget is in edit mode (shows border, cursor changes)
 * @param props.onClick - Callback when widget is clicked (for editor selection)
 * @returns Styled link card with favicon, title, description, and optional image
 *
 * @example
 * // Simple link card
 * <LinkWidget
 *   content={{
 *     url: 'https://github.com',
 *     title: 'My GitHub Profile',
 *     description: 'Check out my projects'
 *   }}
 * />
 *
 * @example
 * // Link with preview image and custom styling
 * <LinkWidget
 *   content={{
 *     url: 'https://myportfolio.com',
 *     title: '💼 Portfolio Website',
 *     description: 'View my design work and case studies',
 *     imageUrl: 'https://myportfolio.com/preview.jpg'
 *   }}
 *   style={{
 *     backgroundColor: '#3b82f6',
 *     textColor: '#ffffff',
 *     borderRadius: 16,
 *     shadow: 'large'
 *   }}
 * />
 *
 * @example
 * // In page template
 * const linkContent = WIDGET_TEMPLATES['link'].content.data;
 * <div className="grid grid-cols-2 gap-4">
 *   <LinkWidget
 *     content={linkContent}
 *     isEditing={isEditingPage}
 *     onSelect={() => selectWidget(widgetId)}
 *   />
 * </div>
 *
 * @note The component fetches favicons automatically from Google's favicon service
 * @note If favicon fails to load, displays first letter of title as fallback
 * @note Description text is limited to 2 lines with ellipsis
 * @note The widget is fully responsive and adapts to container size
 *
 * @see LinkWidgetContent type for content structure
 * @see WIDGET_TEMPLATES for preset configurations
 */
export function LinkWidget({ content, style, isEditing, onClick }: LinkWidgetProps) {
  /**
   * Extracts the favicon URL from a given website URL using Google's favicon service.
   * @param url - The website URL to extract favicon from
   * @returns The favicon URL or undefined if URL parsing fails
   */
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
              <h4 className="font-bold text-inherit truncate text-lg tracking-tight leading-none">{content.title}</h4>
            </div>
            {content.description && (
              <p className="text-sm opacity-70 font-medium line-clamp-2 leading-relaxed">{content.description}</p>
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
