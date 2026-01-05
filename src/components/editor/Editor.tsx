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
  Image, Type, Video, Share2, MoreHorizontal,
  Undo2, Redo2, Copy, Clipboard, CopyPlus,
  Settings, TrendingUp, MessageSquare, Globe, Settings2, Sparkles, ChevronDown
} from 'lucide-react';
import { Button, Input, Tabs } from '@/components/ui';
import { ColorPicker } from '@/components/editors/ColorPicker';
import { OpacitySlider } from '@/components/editors/OpacitySlider';
import { SizePresetPicker } from '@/components/editors/SizePresetPicker';
import { ThemePicker } from '@/components/editors/ThemePicker';
import { FontPicker, SYSTEM_FONTS } from '@/components/editors/FontPicker';
import { CSSVariablesEditor } from '@/components/editors/CSSVariablesEditor';
import { generateAllCSSVariables } from '@/lib/cssVariablesGenerator';
import { useThemeStore, getCurrentTheme } from '@/store/themeStore';
import { PublishSettings } from '@/components/distribution/PublishSettings';
import { SEOSettings } from '@/components/distribution/SEOSettings';
import { AnalyticsDashboard } from '@/components/distribution/AnalyticsDashboard';
import { ShareModal } from '@/components/distribution/ShareModal';
import { PageStats } from '@/components/social/PageStats';
import { PageComments } from '@/components/social/PageComments';
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
  button: <Link2 className="w-4 h-4" />,
  form: <Type className="w-4 h-4" />,
  testimonial: <Share2 className="w-4 h-4" />,
  'section-title': <Type className="w-4 h-4" />,
  gallery: <Image className="w-4 h-4" />,
  product: <Link2 className="w-4 h-4" />,
  calendar: <Layout className="w-4 h-4" />,
  pdf: <Link2 className="w-4 h-4" />,
  countdown: <Link2 className="w-4 h-4" />,
  qrcode: <Layout className="w-4 h-4" />,
};

const WIDGET_LABELS: Record<WidgetType, string> = {
  link: 'Link',
  image: 'Image',
  video: 'Video',
  text: 'Text',
  social: 'Social',
  map: 'Map',
  divider: 'Divider',
  button: 'Button',
  form: 'Form',
  testimonial: 'Testimonial',
  'section-title': 'Section Title',
  gallery: 'Gallery',
  product: 'Product',
  calendar: 'Calendar',
  pdf: 'PDF',
  countdown: 'Countdown',
  qrcode: 'QR Code',
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
        <div className="absolute -top-2 -right-2 flex gap-1 z-10 scale-90 origin-top-right">
          <button
            onClick={() => useEditorStore.getState().copyWidget(widget.id)}
            className="p-1.5 bg-white shadow-lg rounded-lg text-blue-600 hover:bg-blue-50 transition-colors border border-blue-100"
            title="Copy Widget"
          >
            <Copy className="w-3 h-3" />
          </button>
          <button
            onClick={() => {
              useEditorStore.getState().copyWidget(widget.id);
              useEditorStore.getState().pasteWidget();
            }}
            className="p-1.5 bg-white shadow-lg rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors border border-emerald-100"
            title="Duplicate Widget"
          >
            <CopyPlus className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeWidget(widget.id);
            }}
            className="p-1.5 bg-white shadow-lg rounded-lg text-red-600 hover:bg-red-50 transition-colors border border-red-100"
            title="Delete Widget"
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
              fontFamily: page.style.fontFamily,
              color: page.style.fontColor,
              ...generateAllCSSVariables(getCurrentTheme(), page.style) as any,
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
                      width: getWidgetDimensions(activeWidget.size).width * (isMobile ? 150 : 200),
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
  const { loadTemplate, page } = useEditorStore();

  const tabs = [
    { id: 'widgets', label: 'Widgets', icon: <Layout className="w-4 h-4" /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'community', label: 'Community', icon: <MessageSquare className="w-4 h-4" /> },
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
              <ThemePicker
                onThemeApply={(theme) => {
                  useEditorStore.getState().updatePage({
                    style: {
                      ...page.style,
                      backgroundColor: theme.colors.background,
                      backgroundGradient: '',
                      fontColor: theme.colors.text,
                      fontFamily: theme.typography?.fontFamily || page.style.fontFamily,
                      widgetBorderRadius: theme.effects?.borderRadius ?? page.style.widgetBorderRadius,
                    },
                  });
                }}
              />
            </div>

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
                          style: { ...page.style, backgroundColor: color, backgroundGradient: '' }
                        })}
                        className={cn(
                          "w-full aspect-square rounded-xl border border-gray-200 shadow-sm hover:scale-110 transition-all duration-300",
                          page.style.backgroundColor === color && "ring-2 ring-primary-500 ring-offset-2 scale-105"
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
                          style: { ...page.style, backgroundGradient: grad.value }
                        })}
                        className={cn(
                          "w-full h-12 rounded-xl border border-gray-200 hover:scale-105 transition-all duration-300 overflow-hidden relative group",
                          page.style.backgroundGradient === grad.value && "ring-2 ring-primary-500 ring-offset-2 scale-105"
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
                <FontPicker
                  selectedFont={SYSTEM_FONTS.find(f => f.family === page.style.fontFamily)}
                  onFontSelect={(font) => {
                    useEditorStore.getState().updatePage({
                      style: {
                        ...page.style,
                        fontFamily: font.family,
                      },
                    });
                  }}
                  label="Page Font"
                />
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Font Color</label>
                  <ColorPicker
                    value={page.style.fontColor || '#1e293b'}
                    onChange={(color) => {
                      useEditorStore.getState().updatePage({
                        style: {
                          ...page.style,
                          fontColor: color,
                        },
                      });
                    }}
                  />
                </div>
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

            <div>
              <CSSVariablesEditor />
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="p-4 space-y-6">
            <PublishSettings
              pageId={page.id}
              pageTitle={page.title}
              slug={page.slug}
              isPublished={page.isPublished}
              onPublish={(slug) => useEditorStore.getState().updatePage({ isPublished: true, slug })}
              onUnpublish={() => useEditorStore.getState().updatePage({ isPublished: false })}
            />
            <SEOSettings
              pageId={page.id}
              pageTitle={page.title}
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="p-4">
            <AnalyticsDashboard pageId={page.id} />
          </div>
        )}

        {activeTab === 'community' && (
          <div className="p-4 space-y-6">
            <PageStats
              pageId={page.id}
              showShareButton
              onShare={() => { }}
            />
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-lg mb-4 text-gray-900">Comments</h3>
              <PageComments pageId={page.id} currentUserId="user-1" />
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
            <Input
              label="Image URL (Optional)"
              value={data.imageUrl || ''}
              onChange={(e) => handleContentUpdate('imageUrl', e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>
        );
      }
      case 'button': {
        const data = (selectedWidget.content as any).data || {};
        return (
          <div className="space-y-4">
            <Input
              label="Button Text"
              value={data.text || ''}
              onChange={(e) => handleContentUpdate('text', e.target.value)}
            />
            <Input
              label="URL"
              value={data.url || ''}
              onChange={(e) => handleContentUpdate('url', e.target.value)}
              placeholder="https://example.com"
            />
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Variant</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                value={data.variant || 'primary'}
                onChange={(e) => handleContentUpdate('variant', e.target.value)}
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="outline">Outline</option>
              </select>
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
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={data.fullWidth || false}
                onChange={(e) => handleContentUpdate('fullWidth', e.target.checked)}
              />
              <span className="text-sm text-gray-600">Full Width</span>
            </label>
          </div>
        );
      }
      case 'testimonial': {
        const data = (selectedWidget.content as any).data || {};
        return (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Quote</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none min-h-[80px]"
                value={data.quote || ''}
                onChange={(e) => handleContentUpdate('quote', e.target.value)}
                placeholder="Enter the testimonial quote..."
              />
            </div>
            <Input
              label="Author Name"
              value={data.author || ''}
              onChange={(e) => handleContentUpdate('author', e.target.value)}
            />
            <Input
              label="Role (Optional)"
              value={data.role || ''}
              onChange={(e) => handleContentUpdate('role', e.target.value)}
              placeholder="e.g., CEO, Manager"
            />
            <Input
              label="Company (Optional)"
              value={data.company || ''}
              onChange={(e) => handleContentUpdate('company', e.target.value)}
            />
            <Input
              label="Avatar URL (Optional)"
              value={data.avatar || ''}
              onChange={(e) => handleContentUpdate('avatar', e.target.value)}
              placeholder="https://example.com/avatar.jpg"
            />
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Rating (0-5)</label>
              <input
                type="number"
                min="0"
                max="5"
                step="0.5"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                value={data.rating || 0}
                onChange={(e) => handleContentUpdate('rating', parseFloat(e.target.value))}
              />
            </div>
          </div>
        );
      }
      case 'section-title': {
        const data = (selectedWidget.content as any).data || {};
        return (
          <div className="space-y-4">
            <Input
              label="Title"
              value={data.title || ''}
              onChange={(e) => handleContentUpdate('title', e.target.value)}
            />
            <Input
              label="Subtitle (Optional)"
              value={data.subtitle || ''}
              onChange={(e) => handleContentUpdate('subtitle', e.target.value)}
            />
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Alignment</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                value={data.alignment || 'left'}
                onChange={(e) => handleContentUpdate('alignment', e.target.value)}
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={data.showDivider || false}
                onChange={(e) => handleContentUpdate('showDivider', e.target.checked)}
              />
              <span className="text-sm text-gray-600">Show Divider</span>
            </label>
          </div>
        );
      }
      case 'gallery': {
        const data = (selectedWidget.content as any).data || {};
        return (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Number of Columns</label>
              <input
                type="number"
                min="1"
                max="5"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                value={data.columns || 3}
                onChange={(e) => handleContentUpdate('columns', parseInt(e.target.value))}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Image Spacing</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                value={data.spacing || 'medium'}
                onChange={(e) => handleContentUpdate('spacing', e.target.value)}
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={data.showLightbox !== false}
                onChange={(e) => handleContentUpdate('showLightbox', e.target.checked)}
              />
              <span className="text-sm text-gray-600">Enable Lightbox</span>
            </label>
          </div>
        );
      }
      case 'product': {
        const data = (selectedWidget.content as any).data || {};
        return (
          <div className="space-y-4">
            <Input
              label="Product Name"
              value={data.name || ''}
              onChange={(e) => handleContentUpdate('name', e.target.value)}
            />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none min-h-[60px]"
                value={data.description || ''}
                onChange={(e) => handleContentUpdate('description', e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Price</label>
              <input
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                value={data.price || 0}
                onChange={(e) => handleContentUpdate('price', parseFloat(e.target.value))}
              />
            </div>
            <Input
              label="Product Image URL"
              value={data.image || ''}
              onChange={(e) => handleContentUpdate('image', e.target.value)}
            />
            <Input
              label="Product URL"
              value={data.url || ''}
              onChange={(e) => handleContentUpdate('url', e.target.value)}
            />
          </div>
        );
      }
      case 'form': {
        const data = (selectedWidget.content as any).data || {};
        return (
          <div className="space-y-4">
            <Input
              label="Form Title"
              value={data.title || ''}
              onChange={(e) => handleContentUpdate('title', e.target.value)}
            />
            <Input
              label="Submit Button Text"
              value={data.submitText || 'Submit'}
              onChange={(e) => handleContentUpdate('submitText', e.target.value)}
            />
          </div>
        );
      }
      case 'video': {
        const data = (selectedWidget.content as any).data || {};
        return (
          <div className="space-y-4">
            <Input
              label="Video URL"
              value={data.url || ''}
              onChange={(e) => handleContentUpdate('url', e.target.value)}
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
          </div>
        );
      }
      case 'text': {
        const data = (selectedWidget.content as any).data || {};
        return (
          <div className="space-y-4">
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              value={data.content || ''}
              onChange={(e) => handleContentUpdate('content', e.target.value)}
            />
          </div>
        );
      }
      case 'social': {
        const data = (selectedWidget.content as any).data || {};
        return (
          <div className="space-y-4">
            <Input
              label="Username"
              value={data.username || ''}
              onChange={(e) => handleContentUpdate('username', e.target.value)}
            />
          </div>
        );
      }
      case 'map': {
        const data = (selectedWidget.content as any).data || {};
        return (
          <div className="space-y-4">
            <Input
              label="Label"
              value={data.label || ''}
              onChange={(e) => handleContentUpdate('label', e.target.value)}
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

        <SizePresetPicker
          value={selectedWidget.size}
          onChange={(size) => updateWidget(selectedWidget.id, { size })}
        />

        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3 uppercase tracking-wider text-[10px]">Style</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Background Color</label>
              <ColorPicker
                value={selectedWidget.style.backgroundColor || '#ffffff'}
                onChange={(color) => updateWidget(selectedWidget.id, {
                  style: { ...selectedWidget.style, backgroundColor: color }
                })}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Text Color</label>
              <ColorPicker
                value={selectedWidget.style.textColor || '#000000'}
                onChange={(color) => updateWidget(selectedWidget.id, {
                  style: { ...selectedWidget.style, textColor: color }
                })}
              />
            </div>
            <OpacitySlider
              value={selectedWidget.style.opacity ?? 100}
              onChange={(opacity) => updateWidget(selectedWidget.id, {
                style: { ...selectedWidget.style, opacity }
              })}
            />
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
  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const { currentThemeId } = useThemeStore();
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
    undo,
    redo,
    copyWidget,
    pasteWidget,
  } = useEditorStore();

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.key === 'z') {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
      } else if (isMod && e.key === 'y') {
        e.preventDefault();
        redo();
      } else if (isMod && e.key === 'c' && selectedWidgetId) {
        e.preventDefault();
        copyWidget(selectedWidgetId);
      } else if (isMod && e.key === 'v') {
        if (!(document.activeElement instanceof HTMLInputElement)) {
          e.preventDefault();
          pasteWidget();
        }
      } else if (e.key === 'Escape') {
        selectWidget(null);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedWidgetId && !(document.activeElement instanceof HTMLInputElement)) {
          useEditorStore.getState().removeWidget(selectedWidgetId);
          selectWidget(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedWidgetId, undo, redo, copyWidget, pasteWidget, selectWidget]);

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
    alert('Page saved successfully!');
  };

  const handlePublish = () => {
    updatePage({ isPublished: !page.isPublished });
    alert(page.isPublished ? 'Page unpublished!' : 'Page published successfully!');
  };

  if (isPreviewMode) {
    return (
      <div className="h-screen bg-gray-50 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => setPreviewMode(false)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-semibold">Preview Mode</span>
          </div>
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button onClick={() => setMobileView(false)} className={cn('p-2 rounded-md', !isMobileView ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500')}><Monitor className="w-4 h-4" /></button>
            <button onClick={() => setMobileView(true)} className={cn('p-2 rounded-md', isMobileView ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500')}><Smartphone className="w-4 h-4" /></button>
          </div>
          <Button onClick={() => setPreviewMode(false)}>Edit Page</Button>
        </header>
        <div className="flex-1 overflow-auto bg-gray-50 p-4 md:p-8 flex items-start justify-center">
          <div
            className={cn('bg-white shadow-2xl rounded-[32px] overflow-hidden transition-all duration-500', isMobileView ? 'w-[375px] h-fit min-h-[667px]' : 'w-full max-w-[1200px]')}
            style={{
              background: page.style.backgroundGradient || page.style.backgroundColor,
              fontFamily: page.style.fontFamily,
              color: page.style.fontColor,
              ...generateAllCSSVariables(getCurrentTheme(), page.style) as any,
            }}
          >
            <div className={cn("p-6 md:p-12")}>
              <div className="grid gap-4 mx-auto" style={{ gridTemplateColumns: `repeat(${isMobileView ? 2 : page.layout.columns}, 1fr)` }}>
                {page.widgets.map((widget) => {
                  const dims = WIDGET_SIZES[widget.size];
                  const mobileWidth = dims.width === 4 ? 2 : dims.width * 2 > 2 ? 2 : dims.width * 2;
                  return (
                    <div key={widget.id} style={{ gridColumn: `span ${isMobileView ? mobileWidth : dims.width}`, gridRow: `span ${dims.height}` }}>
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

  function PreferencesDropdown() {
    const { themes, customThemes, setCurrentTheme, animationSpeed, setAnimationSpeed } = { ...useThemeStore(), ...useEditorStore() };
    const [isOpen, setIsOpen] = useState(false);
    const allThemes = [...themes, ...customThemes];
    const { updatePage, page } = useEditorStore();

    return (
      <div className="relative">
        <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl shadow-sm">
          <Settings2 className="w-4 h-4 text-primary-500" />
          <span>Appearance</span>
          <ChevronDown className={cn("w-3 h-3", isOpen && "rotate-180")} />
        </button>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-50">
              <div className="px-4 py-2 mb-2"><p className="text-[10px] font-black uppercase text-gray-400">Themes</p></div>
              <div className="px-2 space-y-1 max-h-48 overflow-y-auto">
                {allThemes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => {
                      setCurrentTheme(theme.id);
                      updatePage({
                        style: {
                          ...page.style,
                          backgroundColor: theme.colors.background,
                          backgroundGradient: '',
                          fontColor: theme.colors.text,
                          fontFamily: theme.typography?.fontFamily || page.style.fontFamily,
                          widgetBorderRadius: theme.effects?.borderRadius ?? page.style.widgetBorderRadius,
                        },
                      });
                    }}
                    className={cn("w-full text-left px-3 py-2 rounded-lg flex items-center justify-between", currentThemeId === theme.id ? "bg-primary-50" : "hover:bg-gray-50")}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-1">
                        <div className="w-4 h-4 rounded-full border border-white" style={{ backgroundColor: theme.colors.primary }} />
                        <div className="w-4 h-4 rounded-full border border-white" style={{ backgroundColor: theme.colors.secondary }} />
                      </div>
                      <span className="text-xs font-bold text-gray-600">{theme.name}</span>
                    </div>
                    {currentThemeId === theme.id && <Sparkles className="w-3 h-3 text-primary-500" />}
                  </button>
                ))}
              </div>
              <div className="h-px bg-gray-100 my-3" />
              <div className="px-4 py-2 mb-2"><p className="text-[10px] font-black uppercase text-gray-400">Speed</p></div>
              <div className="px-3 flex gap-1">
                {(['slow', 'normal', 'fast'] as const).map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setAnimationSpeed(speed)}
                    className={cn("flex-1 py-2 text-xs font-bold rounded-lg capitalize", animationSpeed === speed ? "bg-primary-500 text-white" : "bg-gray-50 text-gray-500")}
                  >
                    {speed === 'slow' ? '🐢' : speed === 'fast' ? '⚡' : '⏱️'}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#f8fafc]" data-theme={currentThemeId}>
      <header className="bg-white/90 backdrop-blur-xl border-b border-gray-100 px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-primary-400 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
              <Layout className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-gray-900 tracking-tighter">Zento</span>
          </div>
          <div className="h-6 w-px bg-gray-100" />
          <div className="flex items-center gap-2 group">
            <input
              type="text"
              value={page.title}
              onChange={(e) => updatePage({ title: e.target.value })}
              className="text-base font-bold bg-transparent border-none focus:outline-none focus:ring-0 rounded px-2 py-1 -ml-2 text-gray-700 w-40"
            />
            {page.isPublished && <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-black uppercase rounded-full border border-green-100">Live</span>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100">
            <button onClick={() => undo()} disabled={!useEditorStore.getState().historyIndex} className="p-1.5 rounded-lg hover:bg-white text-gray-500 disabled:opacity-20"><Undo2 className="w-3.5 h-3.5" /></button>
            <button onClick={() => redo()} disabled={useEditorStore.getState().historyIndex === useEditorStore.getState().history.length - 1} className="p-1.5 rounded-lg hover:bg-white text-gray-500 disabled:opacity-20"><Redo2 className="w-3.5 h-3.5" /></button>
          </div>
          <button onClick={() => pasteWidget()} disabled={!useEditorStore.getState().clipboard} className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-gray-600 bg-gray-50 rounded-xl border border-gray-100 disabled:opacity-30"><Clipboard className="w-3.5 h-3.5" />Paste</button>
          <div className="h-6 w-px bg-gray-100" />
          <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-gray-100">
            <PreferencesDropdown />
            <div className="h-4 w-px bg-gray-200 mx-1" />
            <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-100 p-0.5">
              <button onClick={() => setMobileView(false)} className={cn("p-1.5 rounded-md", !isMobileView ? "bg-primary-500 text-white" : "text-gray-400")}><Monitor className="w-3.5 h-3.5" /></button>
              <button onClick={() => setMobileView(true)} className={cn("p-1.5 rounded-md", isMobileView ? "bg-primary-500 text-white" : "text-gray-400")}><Smartphone className="w-3.5 h-3.5" /></button>
            </div>
          </div>
          <div className="h-6 w-px bg-gray-100" />
          <div className="flex items-center gap-1.5">
            <button onClick={() => setPreviewMode(true)} className="p-2 text-gray-500 hover:text-primary-600 rounded-xl"><Eye className="w-5 h-5" /></button>
            <a href="/discovery" className="p-2 text-gray-500 hover:text-primary-600 rounded-xl"><Globe className="w-5 h-5" /></a>
            <button onClick={() => setShareModalOpen(true)} className="flex items-center gap-2 px-4 py-1.5 text-sm font-bold text-white bg-gray-900 rounded-xl shadow-lg shadow-gray-200"><Share2 className="w-4 h-4" />Share</button>
            <div className="h-6 w-px bg-gray-100 mx-1" />
            <Button onClick={handleSave} className="px-5 py-1.5 rounded-xl font-bold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm"><Save className="w-4 h-4 mr-2" />Save</Button>
            <Button onClick={handlePublish} className={cn("px-6 py-1.5 rounded-xl font-black", page.isPublished ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-primary-600 text-white shadow-xl shadow-primary-500/20")}>{page.isPublished ? 'Unpublish' : 'Publish'}</Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <Sidebar onAddWidget={handleAddWidget} />
        <Canvas isMobile={isMobileView} />
        <PropertiesPanel isOpen={!!selectedWidgetId} onClose={() => selectWidget(null)} />
      </div>

      <ShareModal
        pageId={page.id}
        pageTitle={page.title}
        isOpen={isShareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />
    </div>
  );
}
