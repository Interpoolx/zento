import React from 'react';
import type { TestimonialWidgetContent } from '@/types';
import { cn } from '@/lib/utils';

interface TestimonialWidgetProps {
  content: TestimonialWidgetContent;
  style?: React.CSSProperties;
  isEditing?: boolean;
  onClick?: () => void;
}

/**
 * Widget component for displaying customer testimonials.
 * Shows quote, author info, avatar, role, company, and optional star rating.
 * @param props - Component props
 * @param props.content - Testimonial data including quote, author, and rating
 * @param props.style - Optional inline styles
 * @param props.isEditing - Whether the widget is in edit mode
 * @param props.onClick - Optional click handler for edit mode
 * @returns Testimonial card widget with author information
 */
export function TestimonialWidget({ content, style, isEditing, onClick }: TestimonialWidgetProps) {
  return (
    <div
      className={cn(
        'flex flex-col h-full p-6 justify-between',
        isEditing && 'ring-2 ring-primary-500/20'
      )}
      style={style}
      onClick={onClick}
    >
      {/* Quote */}
      <div className="flex-1 mb-6">
        <div className="text-3xl text-primary-400 mb-2">"</div>
        <p className="text-base leading-relaxed italic font-medium">{content.quote}</p>
      </div>

      {/* Author Info */}
      <div className="flex items-center gap-4">
        {content.avatar && (
          <img
            src={content.avatar}
            alt={content.author}
            className="w-12 h-12 rounded-full object-cover"
          />
        )}
        <div>
          <p className="font-bold text-sm">{content.author}</p>
          {(content.role || content.company) && (
            <p className="text-xs opacity-70">
              {content.role}
              {content.role && content.company && ' at '}
              {content.company}
            </p>
          )}
          {content.rating && (
            <div className="flex gap-1 mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={cn(i < content.rating! ? 'text-yellow-400' : 'text-gray-300')}>
                  ★
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
