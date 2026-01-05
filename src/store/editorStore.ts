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

/**
 * Creates a new page object with default configuration and styling.
 * Used when initializing a new page, resetting to blank state, or loading templates.
 *
 * Default configuration includes:
 * - 4-column responsive grid layout with 16px gaps
 * - White background with subtle gradient
 * - Inter font family with dark slate text
 * - Rounded buttons with white widget backgrounds
 * - 1200px max-width constraint
 *
 * @returns A new Page object with:
 *   - Unique UUID
 *   - Title: "My Profile"
 *   - Slug: "my-profile"
 *   - Empty widgets array (ready for builder)
 *   - Default layout and styling applied
 *   - Current timestamp for created/updated dates
 *   - Unpublished state
 *
 * @example
 * ```typescript
 * // Initialize a new blank page
 * const newPage = createDefaultPage();
 * // => {
 * //   id: "abc123-def456...",
 * //   title: "My Profile",
 * //   slug: "my-profile",
 * //   layout: { columns: 4, columnGap: 16, rowGap: 16, maxWidth: 1200 },
 * //   style: { backgroundColor: "#ffffff", ... },
 * //   widgets: [],
 * //   isPublished: false,
 * //   createdAt: 2026-01-05T...,
 * //   updatedAt: 2026-01-05T...
 * // }
 * ```
 *
 * @example
 * ```typescript
 * // Used when resetting page to defaults
 * resetPage: () => set((state) => {
 *   const page = createDefaultPage();
 *   page.widgets = createDefaultWidgets();
 *   return { ...addToHistory(state, page), selectedWidgetId: null };
 * })
 * ```
 *
 * @see {@link createDefaultWidgets} - Creates demo widgets for the page
 * @see {@link defaultLayout} - 4-column grid layout configuration
 * @see {@link defaultStyle} - Color scheme and typography defaults
 */
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

/**
 * Creates a predefined set of demo widgets for the default page layout.
 * Demonstrates all core widget types (image, text, social, link) with realistic styling.
 * Used when initializing a blank page to show example content and inspire users.
 *
 * Demo widgets included:
 * 1. **Profile Header** - Wide banner image from Unsplash
 * 2. **Profile Picture** - Small circular image with shadow (99999px border-radius)
 * 3. **Name & Title** - Large heading text with alignment
 * 4. **Social Links** - GitHub, Twitter, LinkedIn widgets with platform colors
 * 5. **Website Link** - Portfolio link card with description
 * 6. **YouTube Link** - Video channel link card
 *
 * All widgets:
 * - Use responsive "both" viewport mode (desktop & mobile)
 * - Include Unsplash sample images with proper alt text
 * - Follow the default 4-column grid layout
 * - Are positioned to create a cohesive profile layout
 * - Use semantic colors (platform-specific for socials)
 *
 * @returns Array of 8 Widget objects with:
 *   - Unique IDs for each widget
 *   - Pre-configured positions in the grid
 *   - Sample content and styling
 *   - Proper viewport settings
 *
 * @example
 * ```typescript
 * // Initialize a page with demo content
 * const page = createDefaultPage();
 * page.widgets = createDefaultWidgets();
 * // => [
 * //   { id: 'profile-header', type: 'image', ... },
 * //   { id: 'profile-pic', type: 'image', ... },
 * //   { id: 'name-text', type: 'text', ... },
 * //   { id: 'github-social', type: 'social', ... },
 * //   // ... and 4 more
 * // ]
 * ```
 *
 * @example
 * ```typescript
 * // Used in resetPage action to restore demo content
 * resetPage: () => set((state) => {
 *   const page = createDefaultPage();
 *   page.widgets = createDefaultWidgets(); // Populate with demos
 *   return addToHistory(state, page);
 * })
 * ```
 *
 * @example
 * ```typescript
 * // Load as template for new users
 * loadTemplate: (templateId: string) => set((state) => {
 *   const page = createDefaultPage();
 *   if (templateId === 'blank') {
 *     page.widgets = []; // Empty
 *   } else if (templateId === 'personal') {
 *     page.widgets = createDefaultWidgets(); // With demos
 *   }
 *   return addToHistory(state, page);
 * })
 * ```
 *
 * @note Sample images from Unsplash are cached by browser; consider updating URLs
 *       if images become unavailable. All images use 800x400+ dimensions for quality.
 *
 * @see {@link createDefaultPage} - Creates the page container
 * @see {@link Widget} - Type definition for individual widgets
 * @see {@link useEditorStore.resetPage} - Action that uses this function
 */
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

type AnimationSpeed = 'slow' | 'normal' | 'fast';

interface EditorStore {
  page: Page;
  selectedWidgetId: string | null;
  isPreviewMode: boolean;
  isMobileView: boolean;
  isDirty: boolean;
  animationSpeed: AnimationSpeed;
  
  // History for undo/redo
  history: Page[];
  historyIndex: number;
  
  // Clipboard for copy/paste
  clipboard: Widget | null;

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
  setAnimationSpeed: (speed: AnimationSpeed) => void;
  resetPage: () => void;
  loadPage: (page: Page) => void;
  loadTemplate: (templateId: string) => void;
  
  // History actions
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  // Clipboard actions
  copyWidget: (id: string) => void;
  pasteWidget: () => void;
}

/**
 * Zustand store for managing editor state including page data, widget management, and UI modes.
 * Persists page data to localStorage for recovery between sessions.
 *
 * Features:
 * - Page and widget CRUD operations
 * - Preview and mobile view mode toggles
 * - Template loading with pre-configured layouts
 * - Dirty state tracking for unsaved changes
 * - LocalStorage persistence via middleware
 * - Undo/Redo history with 50-item limit
 * - Copy/Paste widgets with clipboard
 *
 * @returns Zustand store with editor actions and state
 *
 * @example
 * ```typescript
 * const { page, addWidget, updatePage, undo, redo } = useEditorStore();
 * ```
 */
export const useEditorStore = create<EditorStore>()(
  persist(
    (set): EditorStore => {
      /**
       * Helper to add page to history
       */
      const addToHistory = (state: EditorStore, newPage: Page): Partial<EditorStore> => {
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(newPage);
        
        // Limit history to 50 items to prevent memory issues
        if (newHistory.length > 50) {
          newHistory.shift();
        }
        
        return {
          page: newPage,
          history: newHistory,
          historyIndex: newHistory.length - 1,
          isDirty: true,
        };
      };

      return {
        page: createDefaultPage(),
        selectedWidgetId: null,
        isPreviewMode: false,
        isMobileView: false,
        isDirty: false,
        animationSpeed: 'normal' as const,
        history: [createDefaultPage()],
        historyIndex: 0,
        clipboard: null,

        setPage: (page) => set({ page, isDirty: false }),

        updatePage: (updates) => set((state) => {
          const newPage = { ...state.page, ...updates, updatedAt: new Date() };
          return addToHistory(state, newPage);
        }),

        selectWidget: (id) => set({ selectedWidgetId: id }),

        addWidget: (widget) => set((state) => {
          const newPage = {
            ...state.page,
            widgets: [...state.page.widgets, widget],
            updatedAt: new Date(),
          };
          return addToHistory(state, newPage);
        }),

        updateWidget: (id, updates) => set((state) => {
          const newPage = {
            ...state.page,
            widgets: state.page.widgets.map((w) =>
              w.id === id ? { ...w, ...updates } : w
            ),
            updatedAt: new Date(),
          };
          return addToHistory(state, newPage);
        }),

        removeWidget: (id) => set((state) => {
          const newPage = {
            ...state.page,
            widgets: state.page.widgets.filter((w) => w.id !== id),
            updatedAt: new Date(),
          };
          return addToHistory(state, newPage);
        }),

        reorderWidgets: (widgets) => set((state) => {
          const newPage = {
            ...state.page,
            widgets,
            updatedAt: new Date(),
          };
          return addToHistory(state, newPage);
        }),

        setPreviewMode: (enabled) => set({ isPreviewMode: enabled, selectedWidgetId: null }),

        setMobileView: (enabled) => set({ isMobileView: enabled }),

        setDirty: (dirty) => set({ isDirty: dirty }),

        setAnimationSpeed: (speed) => set({ animationSpeed: speed }),

        resetPage: () => set((state) => {
          const page = createDefaultPage();
          page.widgets = createDefaultWidgets();
          return {
            ...addToHistory(state, page),
            selectedWidgetId: null,
          };
        }),

        loadPage: (page) => set((state) => ({
          ...addToHistory(state, page),
          selectedWidgetId: null,
        })),

        undo: () => set((state) => {
          if (state.historyIndex > 0) {
            const newIndex = state.historyIndex - 1;
            return {
              historyIndex: newIndex,
              page: state.history[newIndex],
              selectedWidgetId: null,
              isDirty: true,
            };
          }
          return state;
        }),

        redo: () => set((state) => {
          if (state.historyIndex < state.history.length - 1) {
            const newIndex = state.historyIndex + 1;
            return {
              historyIndex: newIndex,
              page: state.history[newIndex],
              selectedWidgetId: null,
              isDirty: true,
            };
          }
          return state;
        }),

        canUndo: () => {
          const state = useEditorStore.getState();
          return state.historyIndex > 0;
        },

        canRedo: () => {
          const state = useEditorStore.getState();
          return state.historyIndex < state.history.length - 1;
        },

        copyWidget: (id) => set((state) => {
          const widget = state.page.widgets.find((w) => w.id === id);
          return { clipboard: widget || null };
        }),

        pasteWidget: () => set((state) => {
          if (!state.clipboard) return state;
          
          const newWidget: Widget = {
            ...state.clipboard,
            id: crypto.randomUUID(),
            position: {
              x: (state.clipboard.position?.x || 0) + 1,
              y: (state.clipboard.position?.y || 0) + 1,
            },
          };
          
          const newPage = {
            ...state.page,
            widgets: [...state.page.widgets, newWidget],
            updatedAt: new Date(),
          };
          
          return addToHistory(state, newPage);
        }),

        loadTemplate: (templateId: string) => set((state) => {
          const page = createDefaultPage();
          page.layout.columns = 6;

          switch (templateId) {
            case 'blank':
              page.title = 'New Page';
              page.widgets = [];
              break;
            case 'personal':
              page.title = 'Personal Profile';
              page.style = { ...page.style, backgroundColor: '#f0f9ff', fontColor: '#0f172a', widgetBorderRadius: 20 };
              page.widgets = [
                { id: 'p1', type: 'image', size: 'small', position: { x: 0, y: 0 }, content: { type: 'image', data: { url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&h=300&fit=crop', alt: 'Profile' } }, style: { borderRadius: 9999, shadow: 'large' }, viewport: 'both' },
                { id: 'p2', type: 'text', size: 'large', position: { x: 2, y: 0 }, content: { type: 'text', data: { content: 'Alex Rivera 👋\nDesigner & Developer', size: 'large', alignment: 'left' } }, style: { textColor: '#0f172a' }, viewport: 'both' },
                { id: 'p3', type: 'link', size: 'wide', position: { x: 0, y: 2 }, content: { type: 'link', data: { url: '#portfolio', title: '💼 View My Work', description: 'Explore my latest projects and creations' } }, style: { backgroundColor: '#3b82f6', textColor: '#fff', borderRadius: 12 }, viewport: 'both' },
                { id: 'p4', type: 'social', size: 'medium', position: { x: 0, y: 3 }, content: { type: 'social', data: { platform: 'twitter', username: 'alexrivera', label: '𝕏' } }, style: { backgroundColor: '#000', textColor: '#fff', borderRadius: 12 }, viewport: 'both' },
                { id: 'p5', type: 'social', size: 'medium', position: { x: 2, y: 3 }, content: { type: 'social', data: { platform: 'github', username: 'alexrivera', label: 'GitHub' } }, style: { backgroundColor: '#24292e', textColor: '#fff', borderRadius: 12 }, viewport: 'both' },
                { id: 'p6', type: 'social', size: 'medium', position: { x: 4, y: 3 }, content: { type: 'social', data: { platform: 'linkedin', username: 'alexrivera', label: 'LinkedIn' } }, style: { backgroundColor: '#0077b5', textColor: '#fff', borderRadius: 12 }, viewport: 'both' },
                { id: 'p7', type: 'text', size: 'wide', position: { x: 0, y: 4 }, content: { type: 'text', data: { content: '🚀 Currently building amazing products\n💡 Passionate about design & development', size: 'medium', alignment: 'center' } }, style: { backgroundColor: '#e0f2fe', textColor: '#0369a1', borderRadius: 12 }, viewport: 'both' }
              ];
              break;
            case 'portfolio':
              page.title = 'Creative Portfolio';
              page.style = { ...page.style, backgroundColor: '#1a1a1a', fontColor: '#ffffff', widgetBorderRadius: 16 };
              page.layout.columns = 6;
              page.widgets = [
                { id: 'pr1', type: 'image', size: 'wide', position: { x: 0, y: 0 }, content: { type: 'image', data: { url: 'https://images.unsplash.com/photo-1579762514875-8bbb02b612f1?w=1200&h=400&fit=crop', alt: 'Hero' } }, style: { borderRadius: 20, shadow: 'large' }, viewport: 'both' },
                { id: 'pr2', type: 'text', size: 'wide', position: { x: 0, y: 1 }, content: { type: 'text', data: { content: 'Creative Portfolio\n2024 - 2025', size: 'large', alignment: 'center' } }, style: { backgroundColor: '#2a2a2a', textColor: '#fff', borderRadius: 16 }, viewport: 'both' },
                { id: 'pr3', type: 'image', size: 'large', position: { x: 0, y: 2 }, content: { type: 'image', data: { url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=600&fit=crop', alt: 'Work 1' } }, style: { borderRadius: 12, shadow: 'medium' }, viewport: 'both' },
                { id: 'pr4', type: 'image', size: 'large', position: { x: 3, y: 2 }, content: { type: 'image', data: { url: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=600&h=600&fit=crop', alt: 'Work 2' } }, style: { borderRadius: 12, shadow: 'medium' }, viewport: 'both' },
                { id: 'pr5', type: 'image', size: 'medium', position: { x: 0, y: 4 }, content: { type: 'image', data: { url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=400&fit=crop', alt: 'Work 3' } }, style: { borderRadius: 12 }, viewport: 'both' },
                { id: 'pr6', type: 'image', size: 'medium', position: { x: 2, y: 4 }, content: { type: 'image', data: { url: 'https://images.unsplash.com/photo-1561216578-343fff43ae5?w=400&h=400&fit=crop', alt: 'Work 4' } }, style: { borderRadius: 12 }, viewport: 'both' },
                { id: 'pr7', type: 'image', size: 'medium', position: { x: 4, y: 4 }, content: { type: 'image', data: { url: 'https://images.unsplash.com/photo-1561089489-d6c6e6f49e3e?w=400&h=400&fit=crop', alt: 'Work 5' } }, style: { borderRadius: 12 }, viewport: 'both' },
                { id: 'pr8', type: 'link', size: 'wide', position: { x: 0, y: 5 }, content: { type: 'link', data: { url: '#contact', title: '✉️ Let\'s Work Together', description: 'Get in touch for collaborations and projects' } }, style: { backgroundColor: '#ff6b6b', textColor: '#fff', borderRadius: 12 }, viewport: 'both' }
              ];
              break;
            case 'business':
              page.title = 'Business Pro';
              page.style = { ...page.style, backgroundColor: '#f8f9fa', fontColor: '#1a1a1a', widgetBorderRadius: 24 };
              page.layout.columns = 6;
              page.widgets = [
                { id: 'b1', type: 'image', size: 'wide', position: { x: 0, y: 0 }, content: { type: 'image', data: { url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=400&fit=crop', alt: 'Business' } }, style: { borderRadius: 20 }, viewport: 'both' },
                { id: 'b2', type: 'text', size: 'wide', position: { x: 0, y: 1 }, content: { type: 'text', data: { content: 'Strategic Business Solutions\nDriving Growth & Innovation', size: 'large', alignment: 'center' } }, style: { backgroundColor: '#0066cc', textColor: '#fff', borderRadius: 16 }, viewport: 'both' },
                { id: 'b3', type: 'link', size: 'medium', position: { x: 0, y: 2 }, content: { type: 'link', data: { url: '#', title: '📊 Services', description: 'Consulting & Strategy' } }, style: { backgroundColor: '#0066cc', textColor: '#fff', borderRadius: 12 }, viewport: 'both' },
                { id: 'b4', type: 'link', size: 'medium', position: { x: 2, y: 2 }, content: { type: 'link', data: { url: '#', title: '💼 Portfolio', description: 'Case Studies' } }, style: { backgroundColor: '#0066cc', textColor: '#fff', borderRadius: 12 }, viewport: 'both' },
                { id: 'b5', type: 'link', size: 'medium', position: { x: 4, y: 2 }, content: { type: 'link', data: { url: '#', title: '📚 Blog', description: 'Industry Insights' } }, style: { backgroundColor: '#0066cc', textColor: '#fff', borderRadius: 12 }, viewport: 'both' },
                { id: 'b6', type: 'video', size: 'large', position: { x: 0, y: 3 }, content: { type: 'video', data: { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', title: 'Company Overview' } }, style: { borderRadius: 16 }, viewport: 'both' },
                { id: 'b7', type: 'text', size: 'medium', position: { x: 3, y: 3 }, content: { type: 'text', data: { content: '⭐⭐⭐⭐⭐\n500+ Happy Clients\n10+ Years Experience', size: 'medium', alignment: 'center' } }, style: { backgroundColor: '#f0f0f0', borderRadius: 12 }, viewport: 'both' },
                { id: 'b8', type: 'social', size: 'medium', position: { x: 0, y: 4 }, content: { type: 'social', data: { platform: 'linkedin', username: 'company', label: 'LinkedIn' } }, style: { backgroundColor: '#0077b5', textColor: '#fff' }, viewport: 'both' },
                { id: 'b9', type: 'social', size: 'medium', position: { x: 2, y: 4 }, content: { type: 'social', data: { platform: 'twitter', username: 'company', label: '𝕏' } }, style: { backgroundColor: '#000', textColor: '#fff' }, viewport: 'both' },
                { id: 'b10', type: 'social', size: 'medium', position: { x: 4, y: 4 }, content: { type: 'social', data: { platform: 'github', username: 'company', label: 'GitHub' } }, style: { backgroundColor: '#24292e', textColor: '#fff' }, viewport: 'both' }
              ];
              break;
            case 'linktree':
              page.title = 'Link Hub';
              page.style = { ...page.style, backgroundColor: '#fff5f7', fontColor: '#2d1b2e', widgetBorderRadius: 16 };
              page.layout.columns = 4;
              page.widgets = [
                { id: 'l1', type: 'image', size: 'small', position: { x: 1, y: 0 }, content: { type: 'image', data: { url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200', alt: 'Avatar' } }, style: { borderRadius: 9999 }, viewport: 'both' },
                { id: 'l2', type: 'text', size: 'wide', position: { x: 0, y: 1 }, content: { type: 'text', data: { content: 'Welcome to my hub!\n✨ All your links in one place', size: 'medium', alignment: 'center' } }, style: {}, viewport: 'both' },
                { id: 'l3', type: 'link', size: 'wide', position: { x: 0, y: 2 }, content: { type: 'link', data: { url: '#', title: '🌐 My Website', description: 'Full portfolio and blog' } }, style: { backgroundColor: '#e879f9', textColor: '#fff', borderRadius: 12 }, viewport: 'both' },
                { id: 'l4', type: 'link', size: 'wide', position: { x: 0, y: 3 }, content: { type: 'link', data: { url: '#', title: '🎬 YouTube', description: 'Watch my latest videos' } }, style: { backgroundColor: '#ff0000', textColor: '#fff', borderRadius: 12 }, viewport: 'both' },
                { id: 'l5', type: 'link', size: 'wide', position: { x: 0, y: 4 }, content: { type: 'link', data: { url: '#', title: '💬 Discord', description: 'Join my community' } }, style: { backgroundColor: '#5865f2', textColor: '#fff', borderRadius: 12 }, viewport: 'both' },
                { id: 'l6', type: 'link', size: 'wide', position: { x: 0, y: 5 }, content: { type: 'link', data: { url: '#', title: '📧 Newsletter', description: 'Subscribe for updates' } }, style: { backgroundColor: '#10b981', textColor: '#fff', borderRadius: 12 }, viewport: 'both' },
                { id: 'l7', type: 'link', size: 'wide', position: { x: 0, y: 6 }, content: { type: 'link', data: { url: '#', title: '🎁 Shop', description: 'Buy merch & products' } }, style: { backgroundColor: '#f59e0b', textColor: '#fff', borderRadius: 12 }, viewport: 'both' }
              ];
              break;
            case 'creative':
              page.title = 'Artist Showcase';
              page.style = { ...page.style, backgroundColor: '#0f0f0f', fontColor: '#ffffff', backgroundGradient: 'linear-gradient(135deg, #0f0f0f 0%, #1a0033 100%)', widgetBorderRadius: 12 };
              page.layout.columns = 6;
              page.widgets = [
                { id: 'c1', type: 'text', size: 'wide', position: { x: 0, y: 0 }, content: { type: 'text', data: { content: '🎨 Creative Artist\nArt Direction & Design', size: 'large', alignment: 'center' } }, style: { backgroundColor: '#1a0033', borderRadius: 0 }, viewport: 'both' },
                { id: 'c2', type: 'image', size: 'medium', position: { x: 0, y: 1 }, content: { type: 'image', data: { url: 'https://images.unsplash.com/photo-1576069861919-895a6ba9fbd0?w=500&h=500&fit=crop', alt: 'Art 1' } }, style: { borderRadius: 16, shadow: 'large' }, viewport: 'both' },
                { id: 'c3', type: 'image', size: 'medium', position: { x: 2, y: 1 }, content: { type: 'image', data: { url: 'https://images.unsplash.com/photo-1536099063471-0b3b1b1b1b1b?w=500&h=500&fit=crop', alt: 'Art 2' } }, style: { borderRadius: 16, shadow: 'large' }, viewport: 'both' },
                { id: 'c4', type: 'image', size: 'medium', position: { x: 4, y: 1 }, content: { type: 'image', data: { url: 'https://images.unsplash.com/photo-1579762514875-8bbb02b612f1?w=500&h=500&fit=crop', alt: 'Art 3' } }, style: { borderRadius: 16, shadow: 'large' }, viewport: 'both' },
                { id: 'c5', type: 'divider', size: 'wide', position: { x: 0, y: 2 }, content: { type: 'divider', data: {} }, style: {}, viewport: 'both' },
                { id: 'c6', type: 'video', size: 'large', position: { x: 0, y: 3 }, content: { type: 'video', data: { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', title: 'Creative Process' } }, style: { borderRadius: 16 }, viewport: 'both' },
                { id: 'c7', type: 'text', size: 'medium', position: { x: 3, y: 3 }, content: { type: 'text', data: { content: 'Collaborations\n📩 hello@artist.com', size: 'medium', alignment: 'center' } }, style: { backgroundColor: '#ff006e', textColor: '#fff', borderRadius: 12 }, viewport: 'both' },
                { id: 'c8', type: 'social', size: 'medium', position: { x: 0, y: 4 }, content: { type: 'social', data: { platform: 'instagram', username: 'artist', label: 'Instagram' } }, style: { backgroundColor: '#c13584', textColor: '#fff' }, viewport: 'both' },
                { id: 'c9', type: 'social', size: 'medium', position: { x: 2, y: 4 }, content: { type: 'social', data: { platform: 'twitter', username: 'artist', label: '𝕏' } }, style: { backgroundColor: '#000', textColor: '#fff' }, viewport: 'both' },
                { id: 'c10', type: 'social', size: 'medium', position: { x: 4, y: 4 }, content: { type: 'social', data: { platform: 'dribbble', username: 'artist', label: 'Dribbble' } }, style: { backgroundColor: '#ea4c89', textColor: '#fff' }, viewport: 'both' }
              ];
              break;
            case 'ronaldo':
              page.title = 'Cristiano Ronaldo';
              page.style = { ...page.style, backgroundColor: '#0a0e27', fontColor: '#ffffff', backgroundGradient: 'linear-gradient(135deg, #0a0e27 0%, #1a0033 100%)', widgetBorderRadius: 20 };
              page.layout.columns = 6;
              page.widgets = [
                { id: 'r1', type: 'image', size: 'large', position: { x: 0, y: 0 }, content: { type: 'image', data: { url: 'https://images.unsplash.com/photo-1526336024174-c627405e9d4d?w=600&h=600&fit=crop', alt: 'Ronaldo' } }, style: { borderRadius: 20, shadow: 'large' }, viewport: 'both' },
                { id: 'r2', type: 'text', size: 'large', position: { x: 3, y: 0 }, content: { type: 'text', data: { content: 'CR7\n⚽ Legend of Football\n🏆 All-Time Great', size: 'large', alignment: 'left' } }, style: { textColor: '#ffd700' }, viewport: 'both' },
                { id: 'r3', type: 'text', size: 'wide', position: { x: 0, y: 2 }, content: { type: 'text', data: { content: '🎖️ 5 Ballon d\'Or Awards  •  850+ Career Goals  •  130+ International Caps\n💪 The GOAT of Football  •  Fitness • Dedication • Excellence', size: 'medium', alignment: 'center' } }, style: { backgroundColor: '#ffd700', textColor: '#0a0e27', borderRadius: 16 }, viewport: 'both' },
                { id: 'r4', type: 'link', size: 'wide', position: { x: 0, y: 3 }, content: { type: 'link', data: { url: '#', title: '👕 Official Store', description: 'Shop CR7 merchandise & gear' } }, style: { backgroundColor: '#ff1744', textColor: '#fff', borderRadius: 12 }, viewport: 'both' },
                { id: 'r5', type: 'link', size: 'wide', position: { x: 0, y: 4 }, content: { type: 'link', data: { url: '#', title: '🎬 Latest Videos', description: 'Highlights & Behind the Scenes' } }, style: { backgroundColor: '#2196f3', textColor: '#fff', borderRadius: 12 }, viewport: 'both' },
                { id: 'r6', type: 'social', size: 'medium', position: { x: 0, y: 5 }, content: { type: 'social', data: { platform: 'instagram', username: 'cristiano', label: 'Instagram' } }, style: { backgroundColor: '#c13584', textColor: '#fff' }, viewport: 'both' },
                { id: 'r7', type: 'social', size: 'medium', position: { x: 2, y: 5 }, content: { type: 'social', data: { platform: 'twitter', username: 'cristiano', label: '𝕏' } }, style: { backgroundColor: '#000', textColor: '#fff' }, viewport: 'both' },
                { id: 'r8', type: 'social', size: 'medium', position: { x: 4, y: 5 }, content: { type: 'social', data: { platform: 'youtube', username: 'cristiano', label: 'YouTube' } }, style: { backgroundColor: '#ff0000', textColor: '#fff' }, viewport: 'both' }
              ];
              break;
            case 'taylor':
              page.title = 'Taylor Swift';
              page.style = { ...page.style, backgroundColor: '#fce7f3', fontColor: '#be185d', backgroundGradient: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)', widgetBorderRadius: 20 };
              page.layout.columns = 6;
              page.widgets = [
                { id: 't1', type: 'image', size: 'large', position: { x: 0, y: 0 }, content: { type: 'image', data: { url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=600&fit=crop', alt: 'Taylor' } }, style: { borderRadius: 20, shadow: 'large' }, viewport: 'both' },
                { id: 't2', type: 'text', size: 'large', position: { x: 3, y: 0 }, content: { type: 'text', data: { content: '✨ TAYLOR SWIFT ✨\n💜 Lover • Singer • Songwriter\n🎵 The Eras Tour', size: 'large', alignment: 'left' } }, style: { textColor: '#be185d' }, viewport: 'both' },
                { id: 't3', type: 'text', size: 'wide', position: { x: 0, y: 2 }, content: { type: 'text', data: { content: '🏆 11 Grammy Awards  •  Billionaire Artist  •  Record Breaker\n💭 "No matter what happens in life, be good to people."\n❤️ Music • Art • Love', size: 'medium', alignment: 'center' } }, style: { backgroundColor: '#f472b6', textColor: '#fff', borderRadius: 16 }, viewport: 'both' },
                { id: 't4', type: 'link', size: 'wide', position: { x: 0, y: 3 }, content: { type: 'link', data: { url: '#', title: '🎵 Listen on Spotify', description: '30+ Billion Streams & Counting' } }, style: { backgroundColor: '#1db954', textColor: '#fff', borderRadius: 12 }, viewport: 'both' },
                { id: 't5', type: 'link', size: 'medium', position: { x: 0, y: 4 }, content: { type: 'link', data: { url: '#', title: '🎬 Music Videos', description: 'Watch Now' } }, style: { backgroundColor: '#be185d', textColor: '#fff', borderRadius: 12 }, viewport: 'both' },
                { id: 't6', type: 'link', size: 'medium', position: { x: 2, y: 4 }, content: { type: 'link', data: { url: '#', title: '📅 Tour Dates', description: 'Get Tickets' } }, style: { backgroundColor: '#be185d', textColor: '#fff', borderRadius: 12 }, viewport: 'both' },
                { id: 't7', type: 'link', size: 'medium', position: { x: 4, y: 4 }, content: { type: 'link', data: { url: '#', title: '🛍️ Merch', description: 'Shop Now' } }, style: { backgroundColor: '#be185d', textColor: '#fff', borderRadius: 12 }, viewport: 'both' },
                { id: 't8', type: 'social', size: 'medium', position: { x: 0, y: 5 }, content: { type: 'social', data: { platform: 'instagram', username: 'taylorswift', label: 'Instagram' } }, style: { backgroundColor: '#c13584', textColor: '#fff' }, viewport: 'both' },
                { id: 't9', type: 'social', size: 'medium', position: { x: 2, y: 5 }, content: { type: 'social', data: { platform: 'twitter', username: 'taylorswift13', label: '𝕏' } }, style: { backgroundColor: '#000', textColor: '#fff' }, viewport: 'both' },
                { id: 't10', type: 'social', size: 'medium', position: { x: 4, y: 5 }, content: { type: 'social', data: { platform: 'youtube', username: 'taylorswift', label: 'YouTube' } }, style: { backgroundColor: '#ff0000', textColor: '#fff' }, viewport: 'both' }
              ];
              break;
            case 'dark':
              page.title = 'Dark Minimalist';
              page.style = { ...page.style, backgroundColor: '#0f0f0f', fontColor: '#ffffff', backgroundGradient: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)', widgetBorderRadius: 16 };
              page.layout.columns = 6;
              page.widgets = [
                { id: 'd1', type: 'image', size: 'medium', position: { x: 2, y: 0 }, content: { type: 'image', data: { url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop', alt: 'Profile' } }, style: { borderRadius: 12, shadow: 'large' }, viewport: 'both' },
                { id: 'd2', type: 'text', size: 'wide', position: { x: 0, y: 1 }, content: { type: 'text', data: { content: 'Professional Profile\nMinimalist & Modern', size: 'large', alignment: 'center' } }, style: { textColor: '#ffffff' }, viewport: 'both' },
                { id: 'd3', type: 'link', size: 'wide', position: { x: 0, y: 2 }, content: { type: 'link', data: { url: '#', title: '📂 My Projects', description: 'Explore my recent work & achievements' } }, style: { backgroundColor: '#333333', textColor: '#fff', borderRadius: 12, shadow: 'small' }, viewport: 'both' },
                { id: 'd4', type: 'link', size: 'wide', position: { x: 0, y: 3 }, content: { type: 'link', data: { url: '#', title: '📝 Blog', description: 'Latest articles & insights' } }, style: { backgroundColor: '#404040', textColor: '#fff', borderRadius: 12, shadow: 'small' }, viewport: 'both' },
                { id: 'd5', type: 'link', size: 'wide', position: { x: 0, y: 4 }, content: { type: 'link', data: { url: '#', title: '💬 Contact', description: 'Get in touch with me' } }, style: { backgroundColor: '#505050', textColor: '#fff', borderRadius: 12, shadow: 'small' }, viewport: 'both' },
                { id: 'd6', type: 'social', size: 'medium', position: { x: 0, y: 5 }, content: { type: 'social', data: { platform: 'twitter', username: 'user', label: '𝕏' } }, style: { backgroundColor: '#1a1a1a', textColor: '#fff', borderRadius: 12 }, viewport: 'both' },
                { id: 'd7', type: 'social', size: 'medium', position: { x: 2, y: 5 }, content: { type: 'social', data: { platform: 'github', username: 'user', label: 'GitHub' } }, style: { backgroundColor: '#1a1a1a', textColor: '#fff', borderRadius: 12 }, viewport: 'both' },
                { id: 'd8', type: 'social', size: 'medium', position: { x: 4, y: 5 }, content: { type: 'social', data: { platform: 'linkedin', username: 'user', label: 'LinkedIn' } }, style: { backgroundColor: '#1a1a1a', textColor: '#fff', borderRadius: 12 }, viewport: 'both' },
                { id: 'd9', type: 'divider', size: 'wide', position: { x: 0, y: 6 }, content: { type: 'divider', data: {} }, style: {}, viewport: 'both' },
                { id: 'd10', type: 'text', size: 'wide', position: { x: 0, y: 7 }, content: { type: 'text', data: { content: '© 2025 All rights reserved\n✨ Built with passion', size: 'medium', alignment: 'center' } }, style: { textColor: '#888888' }, viewport: 'both' }
              ];
              break;
            case 'elon':
              page.title = 'Elon Musk';
              page.style = { ...page.style, backgroundColor: '#09090b', fontColor: '#ffffff', backgroundGradient: 'linear-gradient(135deg, #09090b 0%, #1a1a2e 100%)', widgetBorderRadius: 12 };
              page.layout.columns = 6;
              page.widgets = [
                { id: 'e1', type: 'image', size: 'medium', position: { x: 2, y: 0 }, content: { type: 'image', data: { url: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=500&h=500&fit=crop', alt: 'Elon' } }, style: { borderRadius: 12, shadow: 'large' }, viewport: 'both' },
                { id: 'e2', type: 'text', size: 'wide', position: { x: 0, y: 1 }, content: { type: 'text', data: { content: 'ELON MUSK\nMaking Life Multiplanetary 🚀', size: 'large', alignment: 'center' } }, style: { textColor: '#00ff00' }, viewport: 'both' },
                { id: 'e3', type: 'text', size: 'wide', position: { x: 0, y: 2 }, content: { type: 'text', data: { content: 'CEO: Tesla, SpaceX, xAI\nDreamer • Innovator • First Principles Thinker\n⚡ Accelerating sustainable energy  •  🚀 Making humanity multiplanetary', size: 'medium', alignment: 'center' } }, style: { backgroundColor: '#1a1a2e', textColor: '#00ff00', borderRadius: 12 }, viewport: 'both' },
                { id: 'e4', type: 'link', size: 'wide', position: { x: 0, y: 3 }, content: { type: 'link', data: { url: '#', title: '⚡ Tesla - Electric Future', description: 'Sustainable Energy & Transportation' } }, style: { backgroundColor: '#ff0000', textColor: '#fff', borderRadius: 12 }, viewport: 'both' },
                { id: 'e5', type: 'link', size: 'wide', position: { x: 0, y: 4 }, content: { type: 'link', data: { url: '#', title: '🚀 SpaceX - Starship', description: 'Making Humanity Multiplanetary' } }, style: { backgroundColor: '#1a1a1a', textColor: '#00ff00', borderRadius: 12, shadow: 'small' }, viewport: 'both' },
                { id: 'e6', type: 'link', size: 'wide', position: { x: 0, y: 5 }, content: { type: 'link', data: { url: '#', title: '🧠 xAI - Intelligence', description: 'The Path to Understanding Universe' } }, style: { backgroundColor: '#664ce0', textColor: '#fff', borderRadius: 12 }, viewport: 'both' },
                { id: 'e7', type: 'social', size: 'medium', position: { x: 0, y: 6 }, content: { type: 'social', data: { platform: 'twitter', username: 'elonmusk', label: '𝕏 / Twitter' } }, style: { backgroundColor: '#000', textColor: '#fff' }, viewport: 'both' },
                { id: 'e8', type: 'text', size: 'medium', position: { x: 2, y: 6 }, content: { type: 'text', data: { content: '💡 "The future is bright"', size: 'medium', alignment: 'center' } }, style: { backgroundColor: '#1a1a2e', textColor: '#00ff00', borderRadius: 12 }, viewport: 'both' }
              ];
              break;
          }

          return addToHistory(state, page);
        }),
      };
    },
    {
      name: 'zento-editor',
      partialize: (state) => ({ page: state.page, history: state.history, historyIndex: state.historyIndex }),
    }
  )
);
