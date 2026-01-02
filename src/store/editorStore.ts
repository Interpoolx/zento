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
  backgroundColor: '#f8fafc',
  backgroundGradient: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
  fontFamily: 'Inter',
  fontColor: '#1e293b',
  buttonStyle: 'rounded',
  widgetBackground: '#ffffff',
  widgetBorderRadius: 12,
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
    }),
    {
      name: 'zento-editor',
      partialize: (state) => ({ page: state.page }),
    }
  )
);
