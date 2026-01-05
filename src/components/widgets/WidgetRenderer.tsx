import React from 'react';
import type { Widget } from '@/types';
import { LinkWidget } from './LinkWidget';
import { ImageWidget } from './ImageWidget';
import { VideoWidget } from './VideoWidget';
import { TextWidget } from './TextWidget';
import { SocialWidget } from './SocialWidget';
import { ButtonWidget } from './ButtonWidget';
import { FormWidget } from './FormWidget';
import { TestimonialWidget } from './TestimonialWidget';
import { SectionTitleWidget } from './SectionTitleWidget';
import { GalleryWidget } from './GalleryWidget';
import { ProductWidget } from './ProductWidget';
import { CalendarWidget } from './CalendarWidget';
import { PDFWidget } from './PDFWidget';
import { CountdownWidget } from './CountdownWidget';
import { QRCodeWidget } from './QRCodeWidget';
import { useEditorStore } from '@/store/editorStore';
import { cn } from '@/lib/utils';

interface WidgetRendererProps {
  widget: Widget;
  isEditing?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

/**
 * Universal widget renderer that dispatches to specific widget components based on type.
 * 
 * Acts as the central rendering hub for all widget types in the Zento page builder.
 * Computes common styles from the widget's style configuration (background, shadows,
 * glow effects, hover effects) and passes them to the appropriate widget component.
 * 
 * Supported Widget Types:
 * - `link` - External URL cards with favicon
 * - `image` - Image display with optional captions
 * - `video` - YouTube/Vimeo embeds
 * - `text` - Rich text content
 * - `social` - Social media profile links
 * - `button` - CTA buttons
 * - `form` - Dynamic form builder
 * - `testimonial` - Customer testimonials
 * - `section-title` - Section headers
 * - `gallery` - Image galleries with lightbox
 * - `product` - E-commerce product cards
 * - `calendar` - Event calendars
 * - `pdf` - PDF document links
 * - `countdown` - Countdown timers
 * - `qrcode` - QR code generator
 * - `divider` - Visual separators
 * 
 * Style Processing:
 * - Background colors/images with positioning
 * - Glow effects with intensity and animation
 * - Shadow presets (none, small, medium, large)
 * - Border radius and colors
 * - Opacity percentage conversion
 * - Hover effect class generation
 * 
 * @component
 * @param {WidgetRendererProps} props - Component configuration
 * @param {Widget} props.widget - Complete widget object with type, content, and style
 * @param {boolean} [props.isEditing=false] - Whether in editor mode (affects cursor, selection)
 * @param {boolean} [props.isSelected=false] - Whether this widget is currently selected
 * @param {() => void} [props.onSelect] - Callback when widget is clicked (for selection)
 * @returns {React.ReactElement | null} Rendered widget component or null if unsupported type
 * 
 * @example
 * // Render a link widget in editor
 * <WidgetRenderer
 *   widget={{
 *     id: 'widget-1',
 *     type: 'link',
 *     size: 'medium',
 *     position: { x: 0, y: 0, width: 2, height: 1 },
 *     content: { type: 'link', data: { url: 'https://github.com', title: 'GitHub' } },
 *     style: { backgroundColor: '#ffffff', shadow: 'medium', borderRadius: 16 }
 *   }}
 *   isEditing={true}
 *   isSelected={selectedId === 'widget-1'}
 *   onSelect={() => setSelectedId('widget-1')}
 * />
 * 
 * @example
 * // Map over widgets in page layout
 * {page.widgets.map(widget => (
 *   <WidgetRenderer
 *     key={widget.id}
 *     widget={widget}
 *     isEditing={isEditMode}
 *     isSelected={selectedWidgetId === widget.id}
 *     onSelect={() => selectWidget(widget.id)}
 *   />
 * ))}
 * 
 * @example
 * // Preview mode (read-only, no selection)
 * <WidgetRenderer widget={widget} />
 * 
 * @note Returns null for unsupported widget types - UI shows nothing
 * @note Click event stops propagation to prevent parent element selection
 * @note Glow animation requires matching CSS keyframes (pulse, flicker)
 * @see Widget for the complete widget data structure
 * @see WIDGET_TEMPLATES for default configurations per type
 */
export function WidgetRenderer({ widget, isEditing, isSelected, onSelect }: WidgetRendererProps) {
  const { page } = useEditorStore();
  // Determine background image (use mobile version if available, otherwise use default)
  const bgImage = widget.style.backgroundImage ?
    `url(${widget.style.backgroundImage})` : undefined;

  // CSS for background image positioning
  const backgroundSize = widget.style.backgroundPosition === 'cover' ? 'cover' :
    widget.style.backgroundPosition === 'contain' ? 'contain' : 'auto';

  // Glow effect styling
  let glowShadow = '';
  if (widget.style.glowEffect?.enabled) {
    const intensity = (widget.style.glowEffect.intensity / 100) * 30;
    const spreadRadius = (widget.style.glowEffect.intensity / 100) * 10;
    glowShadow = `0 0 ${intensity}px ${spreadRadius}px ${widget.style.glowEffect.color}`;
  }

  const baseStyle: React.CSSProperties = {
    borderRadius: widget.style.borderRadius ?? page.style.widgetBorderRadius ?? 32,
    backgroundColor: widget.style.backgroundColor ?? '#ffffff',
    color: widget.style.textColor ?? 'inherit',
    borderColor: widget.style.borderColor,
    opacity: widget.style.opacity !== undefined ? widget.style.opacity / 100 : 1,
    backgroundImage: bgImage,
    backgroundSize: bgImage ? backgroundSize : undefined,
    backgroundPosition: bgImage ? 'center' : undefined,
    backgroundAttachment: widget.style.backgroundPosition === 'tile' ? 'scroll' : 'fixed',
    boxShadow: glowShadow || (widget.style.shadow === 'none' ? 'none' :
      widget.style.shadow === 'small' ? '0 2px 4px rgba(0,0,0,0.02), 0 1px 0 rgba(0,0,0,0.02)' :
        widget.style.shadow === 'medium' ? '0 20px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05)' :
          widget.style.shadow === 'large' ? '0 40px 80px -15px rgba(0,0,0,0.1), 0 16px 24px -8px rgba(0,0,0,0.08)' : undefined),
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    animation: widget.style.glowEffect?.animation === 'pulse' ? 'pulse 2s infinite' :
      widget.style.glowEffect?.animation === 'flicker' ? 'flicker 3s infinite' : undefined,
  };

  /**
   * Renders the appropriate widget component based on widget content type.
   * @returns The rendered widget component or null for unsupported types
   */
  const renderContent = () => {
    switch (widget.content.type) {
      case 'link':
        return <LinkWidget content={widget.content.data} style={baseStyle} isEditing={isEditing} onClick={onSelect} />;
      case 'image':
        return <ImageWidget content={widget.content.data} style={baseStyle} isEditing={isEditing} onClick={onSelect} />;
      case 'video':
        return <VideoWidget content={widget.content.data} style={baseStyle} isEditing={isEditing} onClick={onSelect} aspectRatio={(widget.style as any).aspectRatio || '16/9'} />;
      case 'text':
        return <TextWidget content={widget.content.data} style={baseStyle} isEditing={isEditing} onClick={onSelect} />;
      case 'social':
        return <SocialWidget content={widget.content.data} style={baseStyle} isEditing={isEditing} onClick={onSelect} />;
      case 'button':
        return <ButtonWidget content={widget.content.data} style={baseStyle} isEditing={isEditing} onClick={onSelect} />;
      case 'form':
        return <FormWidget content={widget.content.data} style={baseStyle} isEditing={isEditing} onClick={onSelect} />;
      case 'testimonial':
        return <TestimonialWidget content={widget.content.data} style={baseStyle} isEditing={isEditing} onClick={onSelect} />;
      case 'section-title':
        return <SectionTitleWidget content={widget.content.data} style={baseStyle} isEditing={isEditing} onClick={onSelect} />;
      case 'gallery':
        return <GalleryWidget content={widget.content.data} style={baseStyle} isEditing={isEditing} onClick={onSelect} />;
      case 'product':
        return <ProductWidget content={widget.content.data} style={baseStyle} isEditing={isEditing} onClick={onSelect} />;
      case 'calendar':
        return <CalendarWidget content={widget.content.data} style={baseStyle} isEditing={isEditing} onClick={onSelect} />;
      case 'pdf':
        return <PDFWidget content={widget.content.data} style={baseStyle} isEditing={isEditing} onClick={onSelect} />;
      case 'countdown':
        return <CountdownWidget content={widget.content.data} style={baseStyle} isEditing={isEditing} onClick={onSelect} />;
      case 'qrcode':
        return <QRCodeWidget content={widget.content.data} style={baseStyle} isEditing={isEditing} onClick={onSelect} />;
      case 'divider':
        return (
          <div className="w-full h-full flex items-center justify-center" onClick={onSelect}>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
          </div>
        );
      default:
        return null;
    }
  };

  // Hover effect classes
  /**
   * Returns the appropriate Tailwind hover effect classes based on widget settings.
   * @returns CSS class string for hover effects
   */
  const getHoverClasses = () => {
    const effect = widget.style.hoverEffect || 'none';
    switch (effect) {
      case 'scale':
        return 'hover:scale-105';
      case 'lift':
        return 'hover:shadow-xl hover:-translate-y-1';
      case 'rotate':
        return 'hover:rotate-1';
      case 'brightness':
        return 'hover:brightness-110';
      case 'shadow':
        return 'hover:shadow-2xl';
      default:
        return '';
    }
  };

  return (
    <div
      className={cn(
        'relative w-full h-full group/widget transition-all duration-500',
        isEditing && 'cursor-grab active:cursor-grabbing',
        isSelected && 'ring-2 ring-primary-500 ring-offset-4 scale-[1.02]',
        getHoverClasses()
      )}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.();
      }}
    >
      {renderContent()}
    </div>
  );
}
