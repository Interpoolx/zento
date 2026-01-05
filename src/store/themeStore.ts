import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Theme {
  id: string;
  name: string;
  description?: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
  };
  typography?: {
    fontFamily: string;
    headingSize: number; // in pixels
    bodySize: number; // in pixels
    fontWeight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
    lineHeight?: number;
  };
  effects?: {
    shadowLevel: 'none' | 'small' | 'medium' | 'large';
    borderRadius: number; // in pixels
    animationSpeed: 'slow' | 'normal' | 'fast';
  };
  isCustom?: boolean;
}

interface ThemeStore {
  currentThemeId: string;
  themes: Theme[];
  customThemes: Theme[];
  setCurrentTheme: (themeId: string) => void;
  addCustomTheme: (theme: Theme) => void;
  deleteCustomTheme: (themeId: string) => void;
  updateCustomTheme: (themeId: string, theme: Partial<Theme>) => void;
}

// Default themes with typography and effects
const DEFAULT_THEMES: Theme[] = [
  {
    id: 'light',
    name: 'Light',
    description: 'Clean white background with dark text',
    colors: {
      primary: '#3b82f6',
      secondary: '#10b981',
      background: '#ffffff',
      text: '#1f2937',
      accent: '#f59e0b',
    },
    typography: {
      fontFamily: 'Inter, sans-serif',
      headingSize: 28,
      bodySize: 14,
      fontWeight: 'normal',
      lineHeight: 1.5,
    },
    effects: {
      shadowLevel: 'medium',
      borderRadius: 8,
      animationSpeed: 'normal',
    },
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Dark background with light text',
    colors: {
      primary: '#60a5fa',
      secondary: '#34d399',
      background: '#1f2937',
      text: '#f3f4f6',
      accent: '#fbbf24',
    },
    typography: {
      fontFamily: 'Inter, sans-serif',
      headingSize: 28,
      bodySize: 14,
      fontWeight: 'normal',
      lineHeight: 1.5,
    },
    effects: {
      shadowLevel: 'large',
      borderRadius: 8,
      animationSpeed: 'normal',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Cool blues and teals',
    colors: {
      primary: '#0369a1',
      secondary: '#06b6d4',
      background: '#f0f9ff',
      text: '#0c4a6e',
      accent: '#00d9ff',
    },
    typography: {
      fontFamily: 'Georgia, serif',
      headingSize: 32,
      bodySize: 15,
      fontWeight: 'normal',
      lineHeight: 1.6,
    },
    effects: {
      shadowLevel: 'small',
      borderRadius: 12,
      animationSpeed: 'slow',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    description: 'Warm oranges and reds',
    colors: {
      primary: '#ea580c',
      secondary: '#f97316',
      background: '#fef3c7',
      text: '#92400e',
      accent: '#fbbf24',
    },
    typography: {
      fontFamily: 'Trebuchet MS, sans-serif',
      headingSize: 30,
      bodySize: 14,
      fontWeight: 'bold',
      lineHeight: 1.4,
    },
    effects: {
      shadowLevel: 'medium',
      borderRadius: 16,
      animationSpeed: 'fast',
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'Natural greens and earthy tones',
    colors: {
      primary: '#15803d',
      secondary: '#22c55e',
      background: '#f0fdf4',
      text: '#166534',
      accent: '#84cc16',
    },
    typography: {
      fontFamily: 'Verdana, sans-serif',
      headingSize: 26,
      bodySize: 13,
      fontWeight: 'normal',
      lineHeight: 1.5,
    },
    effects: {
      shadowLevel: 'small',
      borderRadius: 4,
      animationSpeed: 'normal',
    },
  },
  {
    id: 'purple',
    name: 'Purple',
    description: 'Purple and magenta palette',
    colors: {
      primary: '#7c3aed',
      secondary: '#a855f7',
      background: '#faf5ff',
      text: '#5b21b6',
      accent: '#ec4899',
    },
    typography: {
      fontFamily: '"Courier New", monospace',
      headingSize: 32,
      bodySize: 13,
      fontWeight: 'medium',
      lineHeight: 1.5,
    },
    effects: {
      shadowLevel: 'medium',
      borderRadius: 20,
      animationSpeed: 'normal',
    },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Grayscale minimalist theme',
    colors: {
      primary: '#404040',
      secondary: '#737373',
      background: '#fafafa',
      text: '#262626',
      accent: '#d4d4d8',
    },
    typography: {
      fontFamily: 'Helvetica, Arial, sans-serif',
      headingSize: 24,
      bodySize: 12,
      fontWeight: 'normal',
      lineHeight: 1.4,
    },
    effects: {
      shadowLevel: 'none',
      borderRadius: 0,
      animationSpeed: 'slow',
    },
  },
  {
    id: 'vibrant',
    name: 'Vibrant',
    description: 'Bold and colorful palette',
    colors: {
      primary: '#ff006e',
      secondary: '#00f5ff',
      background: '#0a0e27',
      text: '#ffffff',
      accent: '#ffbe0b',
    },
    typography: {
      fontFamily: 'Impact, fantasy',
      headingSize: 36,
      bodySize: 16,
      fontWeight: 'bold',
      lineHeight: 1.3,
    },
    effects: {
      shadowLevel: 'large',
      borderRadius: 24,
      animationSpeed: 'fast',
    },
  },
];

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      currentThemeId: 'light',
      themes: DEFAULT_THEMES,
      customThemes: [],

      setCurrentTheme: (themeId) => {
        set({ currentThemeId: themeId });
      },

      addCustomTheme: (theme) => {
        set((state) => ({
          customThemes: [...state.customThemes, { ...theme, isCustom: true }],
        }));
      },

      deleteCustomTheme: (themeId) => {
        set((state) => ({
          customThemes: state.customThemes.filter((t) => t.id !== themeId),
        }));
      },

      updateCustomTheme: (themeId, updates) => {
        set((state) => ({
          customThemes: state.customThemes.map((t) =>
            t.id === themeId ? { ...t, ...updates } : t
          ),
        }));
      },
    }),
    {
      name: 'zento-themes',
    }
  )
);

/**
 * Retrieves a theme configuration by its unique identifier.
 * 
 * Searches both the built-in default themes and user-created custom themes.
 * Default themes are checked first, followed by custom themes. This function
 * accesses the store state directly (not a hook), so it can be used outside
 * of React components.
 * 
 * @param themeId - The unique theme identifier (e.g., 'light', 'dark', 'custom-uuid')
 * @returns The complete Theme object if found, undefined otherwise
 * 
 * @example
 * // Get a built-in theme
 * const lightTheme = getTheme('light');
 * console.log(lightTheme?.colors.primary);  // '#3b82f6'
 * 
 * @example
 * // Check if a theme exists before using
 * const theme = getTheme(userSelectedThemeId);
 * if (theme) {
 *   applyThemeStyles(theme);
 * } else {
 *   console.warn('Theme not found, using default');
 *   applyThemeStyles(getTheme('light')!);
 * }
 * 
 * @example
 * // Use in non-React context (e.g., utility function)
 * function generateCSSVariables(themeId: string): string {
 *   const theme = getTheme(themeId);
 *   if (!theme) return '';
 *   return `:root { --primary: ${theme.colors.primary}; }`;
 * }
 * 
 * @note This is NOT a React hook - use useThemeStore for reactive updates
 * @see Theme for the complete theme object structure
 * @see useThemeStore for reactive theme state in components
 */
export const getTheme = (themeId: string): Theme | undefined => {
  const state = useThemeStore.getState();
  return (
    state.themes.find((t) => t.id === themeId) ||
    state.customThemes.find((t) => t.id === themeId)
  );
};

/**
 * Retrieves the currently active theme from the global store.
 * 
 * Returns the theme that matches the current `currentThemeId` in the store.
 * Provides a guaranteed fallback to the 'light' theme (first default theme)
 * if the current theme ID is invalid or not found. This ensures the app
 * always has valid theme data even in edge cases.
 * 
 * @returns The current Theme object (never undefined due to fallback)
 * 
 * @example
 * // Apply current theme colors to CSS variables
 * const theme = getCurrentTheme();
 * document.documentElement.style.setProperty('--bg-color', theme.colors.background);
 * document.documentElement.style.setProperty('--text-color', theme.colors.text);
 * 
 * @example
 * // Generate stylesheet based on current theme
 * function generatePageCSS(): string {
 *   const theme = getCurrentTheme();
 *   return `
 *     body {
 *       background-color: ${theme.colors.background};
 *       color: ${theme.colors.text};
 *       font-family: ${theme.typography?.fontFamily || 'Inter, sans-serif'};
 *     }
 *   `;
 * }
 * 
 * @example
 * // Use in CSSVariablesEditor to show current theme variables
 * const css = getCurrentTheme();
 * console.log(`Current: ${css.name} (${css.id})`);
 * 
 * @note Always returns a valid theme due to fallback to themes[0]
 * @note Not a React hook - state changes won't trigger re-renders
 * @see getTheme for fetching a specific theme by ID
 * @see useThemeStore for reactive theme state in React components
 */
export const getCurrentTheme = (): Theme => {
  const state = useThemeStore.getState();
  return (
    getTheme(state.currentThemeId) || state.themes[0]
  );
};
