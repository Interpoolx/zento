import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Page, Widget, PageLayout, PageStyle } from '@/types';

const defaultLayout: PageLayout = {
  columns: 4,
  columnGap: 16,
  rowGap: 16,
  maxWidth: 1200,
};

const defaultStyle: PageStyle = {
  backgroundColor: '#ffffff',
  backgroundGradient: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
  fontFamily: 'Inter',
  fontColor: '#0f172a',
  buttonStyle: 'rounded',
  widgetBackground: '#ffffff',
  widgetBorderRadius: 24,
};

const createDefaultPage = (): Page => ({
  id: crypto.randomUUID(),
  title: 'My Profile',
  slug: 'my-profile',
  layout: defaultLayout,
  style: defaultStyle,
  widgets: [],
  isPublished: false,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const createDefaultWidgets = (): Widget[] => [
  {
    id: 'profile-header',
    type: 'image',
    size: 'wide',
    position: { x: 0, y: 0 },
    content: {
      type: 'image',
      data: {
        url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&h=400&fit=crop',
        alt: 'Profile header',
      },
    },
    style: { borderRadius: 0 },
    viewport: 'both',
  },
  {
    id: 'profile-pic',
    type: 'image',
    size: 'small',
    position: { x: 1, y: 1 },
    content: {
      type: 'image',
      data: {
        url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=center',
        alt: 'Profile picture',
      },
    },
    style: { borderRadius: 9999, shadow: 'medium' },
    viewport: 'both',
  },
  {
    id: 'name-text',
    type: 'text',
    size: 'medium',
    position: { x: 2, y: 1 },
    content: {
      type: 'text',
      data: {
        content: 'John Doe\nProduct Designer',
        size: 'large',
        alignment: 'left',
      },
    },
    style: { textColor: '#1e293b' },
    viewport: 'both',
  },
  {
    id: 'github-social',
    type: 'social',
    size: 'medium',
    position: { x: 0, y: 2 },
    content: {
      type: 'social',
      data: {
        platform: 'github',
        username: 'johndoe',
        label: 'GitHub',
      },
    },
    style: { backgroundColor: '#24292e', textColor: '#ffffff' },
    viewport: 'both',
  },
  {
    id: 'twitter-social',
    type: 'social',
    size: 'medium',
    position: { x: 1, y: 2 },
    content: {
      type: 'social',
      data: {
        platform: 'twitter',
        username: 'johndoe',
        label: 'Twitter',
      },
    },
    style: { backgroundColor: '#1da1f2', textColor: '#ffffff' },
    viewport: 'both',
  },
  {
    id: 'linkedin-social',
    type: 'social',
    size: 'medium',
    position: { x: 2, y: 2 },
    content: {
      type: 'social',
      data: {
        platform: 'linkedin',
        username: 'johndoe',
        label: 'LinkedIn',
      },
    },
    style: { backgroundColor: '#0077b5', textColor: '#ffffff' },
    viewport: 'both',
  },
  {
    id: 'website-link',
    type: 'link',
    size: 'large',
    position: { x: 0, y: 3 },
    content: {
      type: 'link',
      data: {
        url: 'https://johndoe.com',
        title: '🌐 Portfolio Website',
        description: 'Check out my latest work and projects',
      },
    },
    style: { borderRadius: 12, shadow: 'small' },
    viewport: 'both',
  },
  {
    id: 'youtube-link',
    type: 'link',
    size: 'large',
    position: { x: 2, y: 3 },
    content: {
      type: 'link',
      data: {
        url: 'https://youtube.com/@johndoe',
        title: '📺 YouTube Channel',
        description: 'Tutorials, design tips and behind the scenes',
      },
    },
    style: { borderRadius: 12, shadow: 'small' },
    viewport: 'both',
  },
];

interface EditorStore {
  page: Page;
  selectedWidgetId: string | null;
  isPreviewMode: boolean;
  isMobileView: boolean;
  isDirty: boolean;
  
  setPage: (page: Page) => void;
  updatePage: (updates: Partial<Page>) => void;
  selectWidget: (id: string | null) => void;
  addWidget: (widget: Widget) => void;
  updateWidget: (id: string, updates: Partial<Widget>) => void;
  removeWidget: (id: string) => void;
  reorderWidgets: (widgets: Widget[]) => void;
  setPreviewMode: (enabled: boolean) => void;
  setMobileView: (enabled: boolean) => void;
  setDirty: (dirty: boolean) => void;
  resetPage: () => void;
  loadPage: (page: Page) => void;
  loadTemplate: (templateId: string) => void;
}

export const useEditorStore = create<EditorStore>()(
  persist(
    (set) => ({
      page: createDefaultPage(),
      selectedWidgetId: null,
      isPreviewMode: false,
      isMobileView: false,
      isDirty: false,

      setPage: (page) => set({ page, isDirty: false }),
      
      updatePage: (updates) => set((state) => ({
        page: { ...state.page, ...updates, updatedAt: new Date() },
        isDirty: true,
      })),

      selectWidget: (id) => set({ selectedWidgetId: id }),

      addWidget: (widget) => set((state) => ({
        page: {
          ...state.page,
          widgets: [...state.page.widgets, widget],
          updatedAt: new Date(),
        },
        isDirty: true,
      })),

      updateWidget: (id, updates) => set((state) => ({
        page: {
          ...state.page,
          widgets: state.page.widgets.map((w) =>
            w.id === id ? { ...w, ...updates } : w
          ),
          updatedAt: new Date(),
        },
        isDirty: true,
      })),

      removeWidget: (id) => set((state) => ({
        page: {
          ...state.page,
          widgets: state.page.widgets.filter((w) => w.id !== id),
          updatedAt: new Date(),
        },
        selectedWidgetId: state.selectedWidgetId === id ? null : state.selectedWidgetId,
        isDirty: true,
      })),

      reorderWidgets: (widgets) => set((state) => ({
        page: {
          ...state.page,
          widgets,
          updatedAt: new Date(),
        },
        isDirty: true,
      })),

      setPreviewMode: (enabled) => set({ isPreviewMode: enabled, selectedWidgetId: null }),
      
      setMobileView: (enabled) => set({ isMobileView: enabled }),
      
      setDirty: (dirty) => set({ isDirty: dirty }),
      
      resetPage: () => {
        const page = createDefaultPage();
        page.widgets = createDefaultWidgets();
        set({ page, selectedWidgetId: null, isDirty: false });
      },
      
      loadPage: (page) => set({ page, selectedWidgetId: null, isDirty: false }),

      loadTemplate: (templateId: string) => {
        const page = createDefaultPage();
        page.title = `${templateId.charAt(0).toUpperCase() + templateId.slice(1)} Template`;
        
        switch (templateId) {
          case 'personal':
            page.widgets = [
              { id: 'p1', type: 'image', size: 'small', position: { x: 0, y: 0 }, content: { type: 'image', data: { url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200', alt: 'Profile' } }, style: { borderRadius: 9999 }, viewport: 'both' },
              { id: 'p2', type: 'text', size: 'medium', position: { x: 1, y: 0 }, content: { type: 'text', data: { content: 'Alex Rivera\nDesigner & Developer', size: 'large', alignment: 'left' } }, style: {}, viewport: 'both' },
              { id: 'p3', type: 'social', size: 'medium', position: { x: 0, y: 1 }, content: { type: 'social', data: { platform: 'twitter', username: 'alexrivera', label: 'Twitter' } }, style: { backgroundColor: '#1da1f2', textColor: '#fff' }, viewport: 'both' },
              { id: 'p4', type: 'link', size: 'large', position: { x: 0, y: 2 }, content: { type: 'link', data: { url: 'https://alex.dev', title: 'My Portfolio', description: 'See my latest work' } }, style: {}, viewport: 'both' }
            ];
            break;
          case 'portfolio':
            page.widgets = [
              { id: 'pr1', type: 'text', size: 'wide', position: { x: 0, y: 0 }, content: { type: 'text', data: { content: 'Creative Portfolio 2024', size: 'large', alignment: 'center' } }, style: {}, viewport: 'both' },
              { id: 'pr2', type: 'image', size: 'large', position: { x: 0, y: 1 }, content: { type: 'image', data: { url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800', alt: 'Work 1' } }, style: {}, viewport: 'both' },
              { id: 'pr3', type: 'image', size: 'large', position: { x: 2, y: 1 }, content: { type: 'image', data: { url: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=800', alt: 'Work 2' } }, style: {}, viewport: 'both' }
            ];
            break;
          case 'business':
            page.widgets = [
              { id: 'b1', type: 'video', size: 'wide', position: { x: 0, y: 0 }, content: { type: 'video', data: { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', title: 'Product Demo' } }, style: {}, viewport: 'both' },
              { id: 'b2', type: 'link', size: 'medium', position: { x: 0, y: 1 }, content: { type: 'link', data: { url: 'https://stripe.com', title: 'Payment', description: 'Secure checkout' } }, style: {}, viewport: 'both' },
              { id: 'b3', type: 'social', size: 'medium', position: { x: 2, y: 1 }, content: { type: 'social', data: { platform: 'linkedin', username: 'company', label: 'LinkedIn' } }, style: { backgroundColor: '#0077b5', textColor: '#fff' }, viewport: 'both' }
            ];
            break;
          case 'linktree':
            page.widgets = [
              { id: 'l1', type: 'link', size: 'wide', position: { x: 0, y: 0 }, content: { type: 'link', data: { url: '#', title: 'My Website', description: '' } }, style: {}, viewport: 'both' },
              { id: 'l2', type: 'link', size: 'wide', position: { x: 0, y: 1 }, content: { type: 'link', data: { url: '#', title: 'Latest Blog Post', description: '' } }, style: {}, viewport: 'both' },
              { id: 'l3', type: 'link', size: 'wide', position: { x: 0, y: 2 }, content: { type: 'link', data: { url: '#', title: 'Join the Newsletter', description: '' } }, style: {}, viewport: 'both' }
            ];
            break;
          case 'creative':
            page.widgets = [
              { id: 'c1', type: 'text', size: 'large', position: { x: 0, y: 0 }, content: { type: 'text', data: { content: 'Think\nDifferently', size: 'large', alignment: 'center' } }, style: { backgroundColor: '#000', textColor: '#fff' }, viewport: 'both' },
              { id: 'c2', type: 'image', size: 'small', position: { x: 2, y: 0 }, content: { type: 'image', data: { url: 'https://images.unsplash.com/photo-1515405299443-f71bb798c14e?w=200', alt: 'Art' } }, style: { borderRadius: 48 }, viewport: 'both' },
              { id: 'c3', type: 'video', size: 'medium', position: { x: 2, y: 1 }, content: { type: 'video', data: { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', title: 'Art in Motion' } }, style: {}, viewport: 'both' }
            ];
            break;
        }
        set({ page, selectedWidgetId: null, isDirty: true });
      },
    }),
    {
      name: 'zento-editor',
      partialize: (state) => ({ page: state.page }),
    }
  )
);
