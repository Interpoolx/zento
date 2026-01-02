import React, { useState } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { WidgetRenderer } from '@/components/widgets/WidgetRenderer';
import { WIDGET_TEMPLATES, WIDGET_SIZES } from '@/lib/widget-registry';
import { generateId } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { 
  Plus, Layout, Smartphone, Monitor, Eye, Save, 
  Trash2, Copy, Palette, Link2, ArrowLeft,
  Image, Type, Video, Share2, MoreHorizontal
} from 'lucide-react';
import { Button, Input, Tabs } from '@/components/ui';
import type { Widget, WidgetType } from '@/types';

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

function Canvas({ isMobile }: CanvasProps) {
  const { page, selectedWidgetId, selectWidget, removeWidget, reorderWidgets } = useEditorStore();

  const columns = isMobile ? 2 : page.layout.columns;
  const columnWidth = isMobile ? 160 : 280;
  const columnGap = page.layout.columnGap;
  const rowGap = page.layout.rowGap;
  const maxWidth = isMobile ? 320 : page.layout.maxWidth;

  const getWidgetDimensions = (size: WidgetSizeKey) => {
    const dims = WIDGET_SIZES[size];
    if (isMobile) {
      return {
        width: dims.width === 4 ? columns : dims.width * 2,
        height: dims.height,
      };
    }
    return {
      width: dims.width,
      height: dims.height,
    };
  };

  const handleDragStart = (e: React.DragEvent, widgetId: string) => {
    e.dataTransfer.setData('widgetId', widgetId);
    e.dataTransfer.effectAllowed = 'move';
    // Add a class for visual feedback
    const element = e.currentTarget as HTMLElement;
    element.classList.add('opacity-40');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const element = e.currentTarget as HTMLElement;
    element.classList.remove('opacity-40');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('widgetId');
    const draggedIndex = page.widgets.findIndex(w => w.id === draggedId);
    
    if (draggedIndex === -1 || draggedIndex === targetIndex) return;

    const widgets = [...page.widgets];
    const [draggedWidget] = widgets.splice(draggedIndex, 1);
    widgets.splice(targetIndex, 0, draggedWidget);

    reorderWidgets(widgets);
  };

  return (
    <div 
      className="flex-1 overflow-auto bg-[#f8fafc] p-8"
      onClick={() => selectWidget(null)}
    >
      <div className="mx-auto" style={{ maxWidth }}>
        <div 
          className={cn(
            'mx-auto transition-all duration-300 min-h-[600px]',
            'bg-white shadow-[0_0_50px_rgba(0,0,0,0.05)] rounded-[32px] overflow-hidden'
          )}
          style={{ 
            maxWidth: '100%',
            padding: isMobile ? '16px' : '40px',
            background: page.style.backgroundGradient || page.style.backgroundColor,
          }}
        >
          <div 
            className="grid mx-auto"
            style={{
              gridTemplateColumns: `repeat(${columns}, ${columnWidth}px)`,
              columnGap: `${columnGap}px`,
              rowGap: `${rowGap}px`,
            }}
          >
            {page.widgets.map((widget, index) => {
              const dimensions = getWidgetDimensions(widget.size);
              return (
                <div
                  key={widget.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, widget.id)}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  className={cn(
                    'relative transition-all duration-300 group',
                    'hover:scale-[1.01]',
                    'active:scale-[0.99]'
                  )}
                  style={{
                    gridColumn: `span ${dimensions.width}`,
                    gridRow: `span ${dimensions.height}`,
                  }}
                >
                  <WidgetRenderer
                    widget={widget}
                    isEditing={true}
                    isSelected={selectedWidgetId === widget.id}
                    onSelect={() => selectWidget(widget.id)}
                  />
                  {selectedWidgetId === widget.id && (
                    <div className="absolute -top-2 -right-2 flex gap-1">
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
            })}
          </div>
        </div>
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
    { id: 'personal', name: 'Personal', color: 'bg-blue-100' },
    { id: 'portfolio', name: 'Portfolio', color: 'bg-purple-100' },
    { id: 'business', name: 'Business', color: 'bg-green-100' },
    { id: 'linktree', name: 'Linktree', color: 'bg-orange-100' },
    { id: 'creative', name: 'Creative', color: 'bg-pink-100' },
  ];

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Editor</h2>
      </div>
      
      <div className="p-4">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      <div className="flex-1 overflow-auto">
        {activeTab === 'widgets' && (
          <div className="p-4 space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3 uppercase tracking-wider text-[10px]">Add Widget</h3>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(WIDGET_TEMPLATES) as WidgetType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => onAddWidget(type)}
                    className={cn(
                      'flex items-center gap-2 p-3 rounded-xl border border-gray-100',
                      'hover:border-primary-500 hover:bg-primary-50',
                      'transition-all duration-200 group'
                    )}
                  >
                    <div className="text-gray-400 group-hover:text-primary-600">
                      {WIDGET_ICONS[type]}
                    </div>
                    <span className="text-xs font-semibold text-gray-700 group-hover:text-primary-700">
                      {WIDGET_LABELS[type]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3 uppercase tracking-wider text-[10px]">Templates</h3>
              <div className="grid grid-cols-1 gap-2">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => loadTemplate(template.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-primary-500 hover:bg-primary-50 transition-all group text-left"
                  >
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-gray-600 group-hover:text-primary-600 transition-colors", template.color)}>
                      <Layout className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{template.name}</p>
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
              <h3 className="text-sm font-medium text-gray-900 mb-3">Background</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Color</label>
                  <div className="flex gap-2">
                    {['#f8fafc', '#fefce8', '#fef3c7', '#fee2e2', '#f0fdf4', '#eff6ff', '#fdf4ff', '#ffffff'].map((color) => (
                      <button
                        key={color}
                        className="w-8 h-8 rounded-lg border border-gray-200 shadow-sm hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                      />
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
          ...selectedWidget.content.data,
          [key]: value,
        },
      },
    });
  };

  const renderContentFields = () => {
    switch (selectedWidget.type) {
      case 'link':
        return (
          <div className="space-y-4">
            <Input 
              label="URL" 
              value={selectedWidget.content.data.url || ''} 
              onChange={(e) => handleContentUpdate('url', e.target.value)} 
              placeholder="https://example.com"
            />
            <Input 
              label="Title" 
              value={selectedWidget.content.data.title || ''} 
              onChange={(e) => handleContentUpdate('title', e.target.value)} 
            />
            <Input 
              label="Description" 
              value={selectedWidget.content.data.description || ''} 
              onChange={(e) => handleContentUpdate('description', e.target.value)} 
            />
          </div>
        );
      case 'video':
        return (
          <div className="space-y-4">
            <Input 
              label="Video URL (YouTube/Vimeo)" 
              value={selectedWidget.content.data.url || ''} 
              onChange={(e) => handleContentUpdate('url', e.target.value)} 
              placeholder="https://youtube.com/watch?v=..."
            />
            <Input 
              label="Title" 
              value={selectedWidget.content.data.title || ''} 
              onChange={(e) => handleContentUpdate('title', e.target.value)} 
            />
          </div>
        );
      case 'image':
        return (
          <div className="space-y-4">
            <Input 
              label="Image URL" 
              value={selectedWidget.content.data.url || ''} 
              onChange={(e) => handleContentUpdate('url', e.target.value)} 
            />
            <Input 
              label="Alt Text" 
              value={selectedWidget.content.data.alt || ''} 
              onChange={(e) => handleContentUpdate('alt', e.target.value)} 
            />
          </div>
        );
      case 'text':
        return (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Content</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none min-h-[100px]"
                value={selectedWidget.content.data.content || ''}
                onChange={(e) => handleContentUpdate('content', e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Size</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                value={selectedWidget.content.data.size || 'medium'}
                onChange={(e) => handleContentUpdate('size', e.target.value)}
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>
        );
      case 'social':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Platform</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                value={selectedWidget.content.data.platform || 'twitter'}
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
              value={selectedWidget.content.data.username || ''} 
              onChange={(e) => handleContentUpdate('username', e.target.value)} 
            />
            <Input 
              label="Label" 
              value={selectedWidget.content.data.label || ''} 
              onChange={(e) => handleContentUpdate('label', e.target.value)} 
            />
          </div>
        );
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
  } = useEditorStore();

  const handleAddWidget = (type: WidgetType) => {
    const template = WIDGET_TEMPLATES[type];
    const newWidget: Widget = {
      id: generateId(),
      type: template.type,
      size: template.size,
      position: { x: 0, y: page.widgets.length },
      content: template.content,
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
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <Layout className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Zento</span>
          </div>
          <div className="h-6 w-px bg-gray-200" />
          <input
            type="text"
            value={page.title}
            onChange={(e) => useEditorStore.getState().updatePage({ title: e.target.value })}
            className="text-lg font-medium bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-primary-500 rounded px-2 py-1 -ml-2"
          />
          {page.isPublished && (
            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              Published
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
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

          <div className="h-6 w-px bg-gray-200" />

          <Button variant="secondary" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button onClick={handlePublish}>
            <Eye className="w-4 h-4 mr-2" />
            {page.isPublished ? 'Unpublish' : 'Publish'}
          </Button>
          <Button variant="primary" onClick={() => setPreviewMode(true)}>
            Preview
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <Sidebar onAddWidget={handleAddWidget} />
        
        <Canvas isMobile={isMobileView} />
        
        <PropertiesPanel 
          isOpen={!!selectedWidgetId} 
          onClose={() => useEditorStore.getState().selectWidget(null)}
        />
      </div>
    </div>
  );
}
