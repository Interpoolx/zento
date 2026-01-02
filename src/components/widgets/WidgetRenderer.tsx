import React from 'react';
import type { Widget } from '@/types';
import { LinkWidget } from './LinkWidget';
import { ImageWidget } from './ImageWidget';
import { VideoWidget } from './VideoWidget';
import { TextWidget } from './TextWidget';
import { SocialWidget } from './SocialWidget';
import { cn } from '@/lib/utils';

interface WidgetRendererProps {
  widget: Widget;
  isEditing?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

export function WidgetRenderer({ widget, isEditing, isSelected, onSelect }: WidgetRendererProps) {
  const baseStyle: React.CSSProperties = {
    borderRadius: widget.style.borderRadius ?? 24,
    backgroundColor: widget.style.backgroundColor ?? '#ffffff',
    color: widget.style.textColor ?? 'inherit',
    borderColor: widget.style.borderColor,
    boxShadow: widget.style.shadow === 'none' ? 'none' : 
               widget.style.shadow === 'small' ? '0 1px 2px rgba(0,0,0,0.05)' :
               widget.style.shadow === 'medium' ? '0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.02)' :
               widget.style.shadow === 'large' ? '0 20px 25px -5px rgba(0,0,0,0.05), 0 10px 10px -5px rgba(0,0,0,0.02)' : undefined,
  };

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

  return (
    <div
      className={cn(
        'relative w-full h-full transition-all duration-200',
        isEditing && 'cursor-move',
        isSelected && 'ring-2 ring-primary-500 ring-offset-2'
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
