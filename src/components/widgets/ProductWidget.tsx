import React from 'react';
import type { ProductWidgetContent } from '@/types';
import { cn } from '@/lib/utils';

interface ProductWidgetProps {
  content: ProductWidgetContent;
  style?: React.CSSProperties;
  isEditing?: boolean;
  onClick?: () => void;
}

/**
 * Widget component for displaying e-commerce product cards with purchase functionality.
 * 
 * Renders a complete product card with image, details, pricing, ratings, and
 * call-to-action button. Designed for showcasing products, affiliate items,
 * or any purchasable content on profile pages or storefronts.
 * 
 * Visual Elements:
 * - Product image with hover zoom effect (top section)
 * - Product name and description (2-line clamp)
 * - Star rating display (0-5 stars)
 * - Review count badge
 * - Price display with USD formatting
 * - "View" CTA button with arrow icon
 * 
 * Features:
 * - Responsive image container with object-cover
 * - Automatic price formatting to 2 decimal places
 * - External link opens in new tab with security attributes
 * - Edit mode ring indicator for page builder
 * - Hover animations for image zoom
 * 
 * @component
 * @param {ProductWidgetProps} props - Component configuration
 * @param {ProductWidgetContent} props.content - Product data
 * @param {string} props.content.name - Product name/title
 * @param {string} [props.content.description] - Short product description
 * @param {number} props.content.price - Product price (in USD or base currency)
 * @param {string} props.content.image - Product image URL
 * @param {string} props.content.url - Product page or purchase URL
 * @param {number} [props.content.rating] - Average rating (0-5, supports decimals)
 * @param {number} [props.content.reviews] - Total review count
 * @param {React.CSSProperties} [props.style] - Custom container styles
 * @param {boolean} [props.isEditing=false] - Enables edit mode styling
 * @param {() => void} [props.onClick] - Click handler for editor selection
 * @returns {React.ReactElement} Product card with image, details, and CTA
 * 
 * @example
 * // Basic product card
 * <ProductWidget
 *   content={{
 *     name: "Premium Headphones",
 *     description: "Wireless noise-canceling headphones with 30-hour battery",
 *     price: 299.99,
 *     image: "https://example.com/headphones.jpg",
 *     url: "https://shop.example.com/headphones",
 *     rating: 4.5,
 *     reviews: 1247
 *   }}
 * />
 * 
 * @example
 * // Affiliate product with custom styling
 * <ProductWidget
 *   content={{
 *     name: "Course: React Mastery",
 *     description: "Learn React from zero to hero in 30 days",
 *     price: 49.99,
 *     image: "https://example.com/course-cover.jpg",
 *     url: "https://courses.example.com/react?ref=affiliate",
 *     rating: 4.9,
 *     reviews: 5832
 *   }}
 *   style={{ backgroundColor: '#f8fafc', borderRadius: 16 }}
 * />
 * 
 * @example
 * // Simple product without rating
 * <ProductWidget
 *   content={{
 *     name: "Limited Edition Print",
 *     price: 75.00,
 *     image: "https://example.com/art-print.jpg",
 *     url: "https://store.example.com/print-001"
 *   }}
 * />
 * 
 * @note Price is displayed in USD format with $ symbol
 * @note Ratings are floored for star display (4.7 shows 4 full stars)
 * @note CTA opens in new tab with noopener/noreferrer for security
 * @see ProductWidgetContent for full content type definition
 */
export function ProductWidget({ content, style, isEditing, onClick }: ProductWidgetProps) {
  return (
    <div
      className={cn(
        'flex flex-col h-full overflow-hidden',
        isEditing && 'ring-2 ring-primary-500/20'
      )}
      style={style}
      onClick={onClick}
    >
      {/* Product Image */}
      <div className="relative overflow-hidden bg-gray-100 flex-1">
        <img
          src={content.image}
          alt={content.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Product Info */}
      <div className="p-6 flex flex-col gap-4">
        <div>
          <h3 className="font-bold text-lg leading-tight mb-2">{content.name}</h3>
          {content.description && (
            <p className="text-sm opacity-70 line-clamp-2">{content.description}</p>
          )}
        </div>

        {/* Rating */}
        {content.rating && (
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    'text-sm',
                    i < Math.floor(content.rating!) ? 'text-yellow-400' : 'text-gray-300'
                  )}
                >
                  ★
                </span>
              ))}
            </div>
            {content.reviews && (
              <span className="text-xs opacity-70">({content.reviews} reviews)</span>
            )}
          </div>
        )}

        {/* Price and CTA */}
        <div className="flex items-center justify-between gap-4 pt-2 border-t border-gray-200">
          <div className="text-2xl font-bold">${content.price.toFixed(2)}</div>
          <a
            href={content.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'px-4 py-2 rounded-lg font-semibold text-sm',
              'bg-primary-500 text-white hover:bg-primary-600',
              'transition-colors inline-flex items-center gap-2'
            )}
          >
            View
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
