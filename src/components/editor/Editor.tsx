import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditorStore } from '@/store/editorStore';
import { WidgetRenderer } from '@/components/widgets/WidgetRenderer';
import { WIDGET_TEMPLATES, WIDGET_SIZES } from '@/lib/widget-registry';
import { generateId } from '@/lib/utils';
import { cn } from '@/lib/utils';
import {
  Layout, Smartphone, Monitor, Eye, Save,
  Trash2, Palette, Link2, ArrowLeft,
  Image, Type, Video, Share2, MoreHorizontal
} from 'lucide-react';
import { Button, Input, Tabs } from '@/components/ui';
import type { Widget, WidgetType } from '@/types';
import type { WidgetSizeKey } from '@/lib/widget-registry';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';

const WIDGET_ICONS: Record<WidgetType, React.ReactNode> = {
  link: <Link2 className="w-4 h-4" />,
  image: <Image className="w-4 h-4" />,
  video: <Video className="w-4 h-4" />,
  text: <Type className="w-4 h-4" />,
  social: <Share2 className="w-4 h-4" />,
  map: <Layout className="w-4 h-4" />,
  divider: <MoreHorizontal className="w-4 h-4" />,
};

const WIDGET_LABELS: Record<WidgetType, string> = {
  link: 'Link',
  image: 'Image',
  video: 'Video',
  text: 'Text',
  social: 'Social',
  map: 'Map',
  divider: 'Divider',
};

interface CanvasProps {
  isMobile: boolean;
}

interface SortableWidgetProps {
  widget: Widget;
  index: number;
  isMobile: boolean;
  selectedWidgetId: string | null;
  selectWidget: (id: string | null) => void;
  removeWidget: (id: string) => void;
  getWidgetDimensions: (size: string) => { width: number; height: number };
}

function SortableWidget({
  widget,
  isMobile: _isMobile,
  selectedWidgetId,
  selectWidget,
  removeWidget,
  getWidgetDimensions
}: SortableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    gridColumn: `span ${getWidgetDimensions(widget.size).width}`,
    gridRow: `span ${getWidgetDimensions(widget.size).height}`,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative transition-all duration-500',
        selectedWidgetId === widget.id && 'ring-2 ring-primary-500/20',
        !isDragging && 'hover:scale-[1.02] cursor-grab active:cursor-grabbing'
      )}
      {...attributes}
      {...listeners}
    >
      <WidgetRenderer
        widget={widget}
        isEditing={true}
        isSelected={selectedWidgetId === widget.id}
        onSelect={() => selectWidget(widget.id)}
      />
      {selectedWidgetId === widget.id && (
        <div className="absolute -top-2 -right-2 flex gap-1 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeWidget(widget.id);
            }}
            className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}

function Canvas({ isMobile }: CanvasProps) {
  const { page, selectedWidgetId, selectWidget, removeWidget, reorderWidgets } = useEditorStore();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const columns = isMobile ? 2 : page.layout.columns;
  // const columnWidth = isMobile ? 160 : 180; // Adjusted for better fit
  const columnGap = page.layout.columnGap;
  const rowGap = page.layout.rowGap;
  const maxWidth = isMobile ? 320 : page.layout.maxWidth;

  const getWidgetDimensions = (size: string) => {
    const sizeKey = size as WidgetSizeKey;
    const dims = WIDGET_SIZES[sizeKey] || WIDGET_SIZES.medium;
    if (isMobile) {
      return {
        width: dims.width === 4 ? columns : dims.width * 2 > columns ? columns : dims.width * 2,
        height: dims.height,
      };
    }
    return {
      width: dims.width,
      height: dims.height,
    };
  };

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = page.widgets.findIndex((w) => w.id === active.id);
      const newIndex = page.widgets.findIndex((w) => w.id === over.id);
      reorderWidgets(arrayMove(page.widgets, oldIndex, newIndex));
    }
  };

  const activeWidget = activeId ? page.widgets.find((w) => w.id === activeId) : null;

  return (
    <div
      className="flex-1 overflow-auto bg-[#f1f5f9] p-4 md:p-12"
      onClick={() => selectWidget(null)}
    >
      <div className="mx-auto" style={{ maxWidth }}>
        <AnimatePresence mode="popLayout">
          <motion.div
            layout
            className={cn(
              'mx-auto transition-all duration-500 min-h-[700px]',
              'bg-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] rounded-[48px] overflow-hidden border border-white/20 backdrop-blur-xl'
            )}
            style={{
              maxWidth: '100%',
              padding: isMobile ? '20px' : '48px',
              background: page.style.backgroundGradient || page.style.backgroundColor,
            }}
          >
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToWindowEdges]}
            >
              <SortableContext
                items={page.widgets.map(w => w.id)}
                strategy={rectSortingStrategy}
              >
                <motion.div
                  layout
                  className="grid mx-auto"
                  style={{
                    gridTemplateColumns: `repeat(${columns}, 1fr)`,
                    columnGap: `${columnGap}px`,
                    rowGap: `${rowGap}px`,
                  }}
                >
                  {page.widgets.map((widget, index) => (
                    <SortableWidget
                      key={widget.id}
                      widget={widget}
                      index={index}
                      isMobile={isMobile}
                      selectedWidgetId={selectedWidgetId}
                      selectWidget={selectWidget}
                      removeWidget={removeWidget}
                      getWidgetDimensions={getWidgetDimensions}
                    />
                  ))}
                </motion.div>
              </SortableContext>

              <DragOverlay adjustScale={true}>
                {activeWidget ? (
                  <div
                    style={{
                      width: getWidgetDimensions(activeWidget.size).width * (isMobile ? 150 : 200), // Approximate
                      height: getWidgetDimensions(activeWidget.size).height * 100,
                    }}
                    className="opacity-80 scale-105 pointer-events-none"
                  >
                    <WidgetRenderer widget={activeWidget} isEditing={true} />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

interface SidebarProps {
  onAddWidget: (type: WidgetType) => void;
}

function Sidebar({ onAddWidget }: SidebarProps) {
  const [activeTab, setActiveTab] = useState('widgets');
  const { loadTemplate } = useEditorStore();

  const tabs = [
    { id: 'widgets', label: 'Widgets', icon: <Layout className="w-4 h-4" /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette className="w-4 h-4" /> },
  ];

  const templates = [
    { id: 'blank', name: '➕ Blank Template', color: 'bg-white' },
    { id: 'personal', name: '👤 Personal', color: 'bg-blue-100' },
    { id: 'portfolio', name: '🎨 Portfolio', color: 'bg-gray-100' },
    { id: 'business', name: '💼 Business Pro', color: 'bg-blue-200' },
    { id: 'linktree', name: '🔗 Link Hub', color: 'bg-pink-100' },
    { id: 'creative', name: '✨ Artist', color: 'bg-purple-100' },
    { id: 'dark', name: '⬛ Dark Minimalist', color: 'bg-black' },
    { id: 'ronaldo', name: '⚽ Ronaldo', color: 'bg-yellow-100' },
    { id: 'taylor', name: '💜 Taylor Swift', color: 'bg-pink-200' },
    { id: 'elon', name: '🚀 Elon Musk', color: 'bg-green-100' },
  ];

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">Editor</h2>
      </div>

      <div className="p-4">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      <div className="flex-1 overflow-auto bg-gray-50/30">
        {activeTab === 'widgets' && (
          <div className="p-4 space-y-6">
            <div>
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Add Widget</h3>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(WIDGET_TEMPLATES) as WidgetType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => onAddWidget(type)}
                    className={cn(
                      'flex items-center gap-2 p-3 rounded-xl border border-gray-100 bg-white',
                      'hover:border-primary-500 hover:shadow-lg hover:shadow-primary-500/10 hover:-translate-y-0.5',
                      'transition-all duration-300 group'
                    )}
                  >
                    <div className="text-gray-400 group-hover:text-primary-600 transition-colors">
                      {WIDGET_ICONS[type]}
                    </div>
                    <span className="text-xs font-bold text-gray-700 group-hover:text-primary-700">
                      {WIDGET_LABELS[type]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Templates</h3>
              <div className="grid grid-cols-1 gap-2">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => loadTemplate(template.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl border border-gray-100 bg-white hover:border-primary-500 hover:shadow-lg hover:shadow-primary-500/10 transition-all group text-left"
                  >
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-gray-600 group-hover:text-primary-600 transition-colors shrink-0", template.color)}>
                      <Layout className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{template.name}</p>
                      <p className="text-[10px] text-gray-400">Load preset layout</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="p-4 space-y-6">
            <div>
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Background</h3>
              <div className="space-y-4">
                <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Color Palette</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['#f8fafc', '#fefce8', '#fef3c7', '#fee2e2', '#f0fdf4', '#eff6ff', '#fdf4ff', '#ffffff'].map((color) => (
                      <button
                        key={color}
                        onClick={() => useEditorStore.getState().updatePage({
                          style: { ...useEditorStore.getState().page.style, backgroundColor: color, backgroundGradient: '' }
                        })}
                        className={cn(
                          "w-full aspect-square rounded-xl border border-gray-200 shadow-sm hover:scale-110 transition-all duration-300",
                          useEditorStore.getState().page.style.backgroundColor === color && "ring-2 ring-primary-500 ring-offset-2 scale-105"
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Gradients</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: 'Sunrise', value: 'linear-gradient(135deg, #FF9D6C 0%, #BB4E75 100%)' },
                      { name: 'Aurora', value: 'linear-gradient(135deg, #43E97B 0%, #38F9D7 100%)' },
                      { name: 'Ocean', value: 'linear-gradient(135deg, #209CFF 0%, #68E0CF 100%)' },
                      { name: 'Midnight', value: 'linear-gradient(135deg, #232526 0%, #414345 100%)' },
                    ].map((grad) => (
                      <button
                        key={grad.name}
                        onClick={() => useEditorStore.getState().updatePage({
                          style: { ...useEditorStore.getState().page.style, backgroundGradient: grad.value }
                        })}
                        className={cn(
                          "w-full h-12 rounded-xl border border-gray-200 hover:scale-105 transition-all duration-300 overflow-hidden relative group",
                          useEditorStore.getState().page.style.backgroundGradient === grad.value && "ring-2 ring-primary-500 ring-offset-2 scale-105"
                        )}
                        style={{ background: grad.value }}
                      >
                        <span className="absolute inset-x-0 bottom-0 py-1 bg-black/20 backdrop-blur-sm text-[8px] font-bold text-white text-center opacity-0 group-hover:opacity-100 transition-opacity">
                          {grad.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Typography</h3>
              <div className="space-y-3">
                <Input label="Font Family" defaultValue="Inter" />
                <Input label="Font Color" type="color" defaultValue="#1e293b" />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Buttons</h3>
              <div className="flex gap-2">
                {(['rounded', 'square', 'pill'] as const).map((style) => (
                  <button
                    key={style}
                    className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors capitalize"
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface PropertiesPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

function PropertiesPanel({ isOpen, onClose }: PropertiesPanelProps) {
  const { page, selectedWidgetId, updateWidget, removeWidget } = useEditorStore();
  const selectedWidget = page.widgets.find(w => w.id === selectedWidgetId);

  if (!isOpen || !selectedWidget) return null;

  const handleContentUpdate = (key: string, value: any) => {
    updateWidget(selectedWidget.id, {
      content: {
        ...selectedWidget.content,
        data: {
          ...(selectedWidget.content as any).data,
          [key]: value,
        },
      } as any,
    });
  };

  const renderContentFields = () => {
    switch (selectedWidget.type) {
      case 'link': {
        const data = (selectedWidget.content as any).data || {};
        return (
          <div className="space-y-4">
            <Input
              label="URL"
              value={data.url || ''}
              onChange={(e) => handleContentUpdate('url', e.target.value)}
              placeholder="https://example.com"
            />
            <Input
              label="Title"
              value={data.title || ''}
              onChange={(e) => handleContentUpdate('title', e.target.value)}
            />
            <Input
              label="Description"
              value={data.description || ''}
              onChange={(e) => handleContentUpdate('description', e.target.value)}
            />
          </div>
        );
      }
      case 'video': {
        const data = (selectedWidget.content as any).data || {};
        return (
          <div className="space-y-4">
            <Input
              label="Video URL (YouTube/Vimeo)"
              value={data.url || ''}
              onChange={(e) => handleContentUpdate('url', e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
            />
            <Input
              label="Title"
              value={data.title || ''}
              onChange={(e) => handleContentUpdate('title', e.target.value)}
            />
            <Input
              label="Thumbnail URL (Optional)"
              value={data.thumbnailUrl || ''}
              onChange={(e) => handleContentUpdate('thumbnailUrl', e.target.value)}
              placeholder="https://example.com/thumb.jpg"
            />
          </div>
        );
      }
      case 'image': {
        const data = (selectedWidget.content as any).data || {};
        return (
          <div className="space-y-4">
            <Input
              label="Image URL"
              value={data.url || ''}
              onChange={(e) => handleContentUpdate('url', e.target.value)}
            />
            <Input
              label="Alt Text"
              value={data.alt || ''}
              onChange={(e) => handleContentUpdate('alt', e.target.value)}
            />
          </div>
        );
      }
      case 'text': {
        const data = (selectedWidget.content as any).data || {};
        return (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Content</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none min-h-[100px]"
                value={data.content || ''}
                onChange={(e) => handleContentUpdate('content', e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Size</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                value={data.size || 'medium'}
                onChange={(e) => handleContentUpdate('size', e.target.value)}
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>
        );
      }
      case 'social': {
        const data = (selectedWidget.content as any).data || {};
        return (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Platform</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                value={data.platform || 'twitter'}
                onChange={(e) => handleContentUpdate('platform', e.target.value)}
              >
                <option value="twitter">Twitter</option>
                <option value="github">GitHub</option>
                <option value="instagram">Instagram</option>
                <option value="linkedin">LinkedIn</option>
                <option value="youtube">YouTube</option>
              </select>
            </div>
            <Input
              label="Username/Handle"
              value={data.username || ''}
              onChange={(e) => handleContentUpdate('username', e.target.value)}
            />
            <Input
              label="Label"
              value={data.label || ''}
              onChange={(e) => handleContentUpdate('label', e.target.value)}
            />
          </div>
        );
      }
      case 'map': {
        const data = (selectedWidget.content as any).data || {};
        return (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Latitude</label>
              <input
                type="number"
                step="0.0001"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                value={data.latitude || 0}
                onChange={(e) => handleContentUpdate('latitude', parseFloat(e.target.value))}
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Longitude</label>
              <input
                type="number"
                step="0.0001"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                value={data.longitude || 0}
                onChange={(e) => handleContentUpdate('longitude', parseFloat(e.target.value))}
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Zoom Level (1-20)</label>
              <input
                type="range"
                min="1"
                max="20"
                className="w-full"
                value={data.zoom || 12}
                onChange={(e) => handleContentUpdate('zoom', parseInt(e.target.value))}
              />
              <span className="text-xs text-gray-600">{data.zoom || 12}</span>
            </div>
            <Input
              label="Location Label"
              value={data.label || ''}
              onChange={(e) => handleContentUpdate('label', e.target.value)}
              placeholder="e.g., New York"
            />
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full animate-slide-in">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Properties</h2>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3 uppercase tracking-wider text-[10px]">Content</h3>
          {renderContentFields()}
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3 uppercase tracking-wider text-[10px]">Size</h3>
          <div className="grid grid-cols-3 gap-2">
            {(['small', 'medium', 'large', 'wide', 'tall'] as const).map((size) => (
              <button
                key={size}
                onClick={() => updateWidget(selectedWidget.id, { size })}
                className={cn(
                  'p-2 text-xs font-medium rounded-lg border transition-all',
                  selectedWidget.size === size
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3 uppercase tracking-wider text-[10px]">Style</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Background</label>
              <input
                type="color"
                className="w-full h-10 rounded-lg border border-gray-300 p-1"
                value={selectedWidget.style.backgroundColor || '#ffffff'}
                onChange={(e) => updateWidget(selectedWidget.id, {
                  style: { ...selectedWidget.style, backgroundColor: e.target.value }
                })}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Text Color</label>
              <input
                type="color"
                className="w-full h-10 rounded-lg border border-gray-300 p-1"
                value={selectedWidget.style.textColor || '#000000'}
                onChange={(e) => updateWidget(selectedWidget.id, {
                  style: { ...selectedWidget.style, textColor: e.target.value }
                })}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Border Radius</label>
              <input
                type="range"
                min="0"
                max="48"
                className="w-full"
                value={selectedWidget.style.borderRadius ?? 24}
                onChange={(e) => updateWidget(selectedWidget.id, {
                  style: { ...selectedWidget.style, borderRadius: parseInt(e.target.value) }
                })}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Shadow</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                value={selectedWidget.style.shadow || 'none'}
                onChange={(e) => updateWidget(selectedWidget.id, {
                  style: { ...selectedWidget.style, shadow: e.target.value as any }
                })}
              >
                <option value="none">None</option>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3 uppercase tracking-wider text-[10px]">Advanced</h3>
          <div className="space-y-3">
            <Input
              label="Custom CSS Class"
              value={(selectedWidget.style as any).customClass || ''}
              onChange={(e) => updateWidget(selectedWidget.id, {
                style: { ...selectedWidget.style, customClass: e.target.value }
              })}
              placeholder="e.g., custom-class"
            />
            {selectedWidget.type === 'video' && (
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Aspect Ratio</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  value={(selectedWidget.style as any).aspectRatio || '16/9'}
                  onChange={(e) => updateWidget(selectedWidget.id, {
                    style: { ...selectedWidget.style, aspectRatio: e.target.value }
                  })}
                >
                  <option value="16/9">16:9 (Wide)</option>
                  <option value="4/3">4:3 (Standard)</option>
                  <option value="1/1">1:1 (Square)</option>
                  <option value="9/16">9:16 (Vertical)</option>
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <Button variant="danger" className="w-full" onClick={() => {
            removeWidget(selectedWidget.id);
            onClose();
          }}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Widget
          </Button>
        </div>
      </div>
    </div>
  );
}

export function Editor() {
  const {
    page,
    isPreviewMode,
    isMobileView,
    selectedWidgetId,
    setPreviewMode,
    setMobileView,
    updatePage,
    addWidget,
    selectWidget,
  } = useEditorStore();

  const handleAddWidget = (type: WidgetType) => {
    const template = WIDGET_TEMPLATES[type];
    const newWidget: Widget = {
      id: generateId(),
      type: template.type,
      size: template.size,
      position: { x: 0, y: page.widgets.length },
      content: template.content as any,
      style: {},
      viewport: 'both',
    };
    addWidget(newWidget);
  };

  const handleSave = () => {
    console.log('Saving page:', page);
    alert('Page saved successfully!');
  };

  const handlePublish = () => {
    updatePage({
      isPublished: !page.isPublished
    });
    alert(page.isPublished ? 'Page unpublished!' : 'Page published successfully!');
  };

  if (isPreviewMode) {
    return (
      <div className="h-screen bg-gray-50 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewMode(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-semibold">Preview Mode</span>
          </div>
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setMobileView(false)}
              className={cn(
                'p-2 rounded-md transition-all',
                !isMobileView ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileView(true)}
              className={cn(
                'p-2 rounded-md transition-all',
                isMobileView ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
          <Button onClick={() => setPreviewMode(false)}>Edit Page</Button>
        </header>

        <div className="flex-1 overflow-auto bg-gray-50 p-4 md:p-8 flex items-start justify-center">
          <div
            className={cn(
              'bg-white shadow-2xl transition-all duration-500 ease-in-out origin-top',
              isMobileView
                ? 'w-[375px] h-fit min-h-[667px] rounded-[48px] ring-[12px] ring-gray-900 overflow-hidden'
                : 'w-full max-w-[1200px] rounded-[32px] overflow-visible'
            )}
            style={{
              background: page.style.backgroundGradient || page.style.backgroundColor,
            }}
          >
            <div className={cn("p-6 md:p-12", isMobileView ? "pt-12" : "")}>
              <div
                className="grid gap-4 mx-auto"
                style={{
                  gridTemplateColumns: `repeat(${isMobileView ? 2 : page.layout.columns}, 1fr)`,
                }}
              >
                {page.widgets.map((widget) => {
                  const dims = WIDGET_SIZES[widget.size];
                  const mobileWidth = dims.width === 4 ? 2 : dims.width * 2 > 2 ? 2 : dims.width * 2;
                  return (
                    <div
                      key={widget.id}
                      style={{
                        gridColumn: `span ${isMobileView ? mobileWidth : dims.width}`,
                        gridRow: `span ${dims.height}`,
                      }}
                    >
                      <WidgetRenderer widget={widget} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#f1f5f9]">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-400 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
              <Layout className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black text-gray-900 tracking-tighter">Zento</span>
          </div>
          <div className="h-8 w-px bg-gray-200" />
          <div className="flex items-center gap-2 group">
            <input
              type="text"
              value={page.title}
              onChange={(e) => useEditorStore.getState().updatePage({ title: e.target.value })}
              className="text-lg font-bold bg-transparent border-none focus:outline-none focus:ring-0 rounded px-2 py-1 -ml-2 text-gray-700 group-hover:text-gray-900 transition-colors"
            />
            {page.isPublished && (
              <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-widest rounded-full">
                Live
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-gray-100/80 p-1.5 rounded-2xl border border-gray-200/50">
            <button
              onClick={() => setMobileView(false)}
              className={cn(
                'p-2 rounded-xl transition-all duration-300',
                !isMobileView ? 'bg-white shadow-sm text-gray-900 scale-105' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileView(true)}
              className={cn(
                'p-2 rounded-xl transition-all duration-300',
                isMobileView ? 'bg-white shadow-sm text-gray-900 scale-105' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          <div className="h-8 w-px bg-gray-200 mx-2" />

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewMode(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <Button
              onClick={handleSave}
              className="px-6 rounded-2xl font-bold shadow-lg shadow-primary-500/20"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button
              variant={page.isPublished ? 'secondary' : 'primary'}
              onClick={handlePublish}
              className="px-6 rounded-2xl font-bold"
            >
              {page.isPublished ? 'Unpublish' : 'Publish'}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <Sidebar onAddWidget={handleAddWidget} />
        <Canvas isMobile={isMobileView} />
        <PropertiesPanel isOpen={!!selectedWidgetId} onClose={() => selectWidget(null)} />
      </div>
    </div>
  );
}
