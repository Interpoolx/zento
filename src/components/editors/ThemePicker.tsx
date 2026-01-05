import { useState } from 'react';
import { Palette, Plus, Trash2 } from 'lucide-react';
import { useThemeStore, getTheme, getCurrentTheme } from '@/store/themeStore';
import type { Theme } from '@/store/themeStore';

interface ThemePickerProps {
  onThemeApply?: (theme: Theme) => void;
  label?: string;
}

/**
 * Theme picker component for selecting and managing page themes
 * Provides access to preset themes and custom theme creation
 *
 * @param onThemeApply - Optional callback when theme is applied
 * @param label - Optional label for the picker
 */
export function ThemePicker({ onThemeApply, label = 'Page Theme' }: ThemePickerProps) {
  const {
    currentThemeId,
    themes,
    customThemes,
    setCurrentTheme,
    addCustomTheme,
    deleteCustomTheme,
  } = useThemeStore();

  const [isOpen, setIsOpen] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customFormData, setCustomFormData] = useState<{
    name?: string;
    description?: string;
    colors: {
      primary?: string;
      secondary?: string;
      background?: string;
      text?: string;
      accent?: string;
      [key: string]: string | undefined;
    };
    typography?: {
      fontFamily: string;
      headingSize: number;
      bodySize: number;
      fontWeight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
      lineHeight?: number;
    };
    effects?: {
      shadowLevel: 'none' | 'small' | 'medium' | 'large';
      borderRadius: number;
      animationSpeed: 'slow' | 'normal' | 'fast';
    };
  }>({
    name: '',
    description: '',
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
  });

  const currentTheme = getCurrentTheme();

  /**
   * Selects and applies a theme, then closes the dropdown.
   * @param themeId - The ID of the theme to select
   */
  const handleThemeSelect = (themeId: string) => {
    setCurrentTheme(themeId);
    const selectedTheme = getTheme(themeId);
    if (selectedTheme && onThemeApply) {
      onThemeApply(selectedTheme);
    }
    setIsOpen(false);
  };

  /**
   * Creates a new custom theme from the form data and applies it.
   * Validates that a name is provided before creation.
   */
  const handleCreateCustomTheme = () => {
    if (!customFormData.name) {
      alert('Theme name is required');
      return;
    }

    const newTheme: Theme = {
      id: `custom-${Date.now()}`,
      name: customFormData.name,
      description: customFormData.description,
      colors: {
        primary: customFormData.colors?.primary || '#3b82f6',
        secondary: customFormData.colors?.secondary || '#10b981',
        background: customFormData.colors?.background || '#ffffff',
        text: customFormData.colors?.text || '#1f2937',
        accent: customFormData.colors?.accent || '#f59e0b',
      },
      typography: customFormData.typography || {
        fontFamily: 'Inter, sans-serif',
        headingSize: 28,
        bodySize: 14,
        fontWeight: 'normal',
        lineHeight: 1.5,
      },
      effects: customFormData.effects || {
        shadowLevel: 'medium',
        borderRadius: 8,
        animationSpeed: 'normal',
      },
      isCustom: true,
    };

    addCustomTheme(newTheme);
    setCustomFormData({
      name: '',
      description: '',
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
    });
    setShowCustomForm(false);
    handleThemeSelect(newTheme.id);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Palette className="w-4 h-4 text-gray-500" />
          {label}
        </label>
        <span className="text-sm font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded">
          {currentTheme.name}
        </span>
      </div>

      {/* Theme Button with Dropdown Container */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-sm font-medium text-gray-700 flex items-center gap-2"
        >
          <div className="flex items-center gap-1">
            {Object.entries(currentTheme.colors).slice(0, 3).map(([key, color]) => (
              <div
                key={key}
                className="w-5 h-5 rounded border border-gray-300"
                style={{ backgroundColor: color }}
                title={key}
              />
            ))}
          </div>
          <span>Choose Theme</span>
        </button>

        {isOpen && (
          <div
            className="absolute top-full left-0 right-0 border border-gray-200 rounded-lg p-3 bg-white space-y-3 max-h-96 overflow-y-auto z-50 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Preset Themes */}
            <div>
              <h4 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">
                Preset Themes
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeSelect(theme.id)}
                    className={`p-2 rounded-lg border-2 transition-all text-left ${currentThemeId === theme.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    title={theme.description}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex gap-1">
                        {Object.entries(theme.colors)
                          .slice(0, 3)
                          .map(([key, color]) => (
                            <div
                              key={key}
                              className="w-3 h-3 rounded-sm border border-gray-200"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                      </div>
                    </div>
                    <p className="text-xs font-medium text-gray-800">{theme.name}</p>
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {theme.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Themes */}
            {customThemes.length > 0 && (
              <div className="pt-2 border-t border-gray-200">
                <h4 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">
                  Custom Themes
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {customThemes.map((theme) => (
                    <div
                      key={theme.id}
                      className={`p-2 rounded-lg border-2 ${currentThemeId === theme.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white'
                        }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <button
                          onClick={() => handleThemeSelect(theme.id)}
                          className="flex-1 text-left hover:bg-gray-50 p-1 rounded transition-colors"
                        >
                          <div className="flex gap-1 mb-1">
                            {Object.entries(theme.colors)
                              .slice(0, 3)
                              .map(([key, color]) => (
                                <div
                                  key={key}
                                  className="w-3 h-3 rounded-sm border border-gray-200"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                          </div>
                          <p className="text-xs font-medium text-gray-800">{theme.name}</p>
                        </button>
                        <button
                          onClick={() => deleteCustomTheme(theme.id)}
                          className="p-1 hover:bg-red-50 rounded text-red-600 transition-colors"
                          title="Delete custom theme"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Create Custom Theme */}
            <div className="pt-2 border-t border-gray-200">
              {!showCustomForm ? (
                <button
                  onClick={() => setShowCustomForm(true)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Custom Theme
                </button>
              ) : (
                <div className="space-y-2 bg-gray-50 p-2 rounded">
                  <input
                    type="text"
                    placeholder="Theme Name"
                    value={customFormData.name || ''}
                    onChange={(e) =>
                      setCustomFormData({ ...customFormData, name: e.target.value })
                    }
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    placeholder="Description (optional)"
                    value={customFormData.description || ''}
                    onChange={(e) =>
                      setCustomFormData({
                        ...customFormData,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={2}
                  />

                  {/* Color Inputs */}
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-2">Colors</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['primary', 'secondary', 'background', 'text', 'accent'] as const).map(
                        (colorKey) => (
                          <div key={colorKey}>
                            <label className="text-xs text-gray-600 block mb-1 capitalize">
                              {colorKey}
                            </label>
                            <input
                              type="color"
                              value={customFormData.colors?.[colorKey] || '#000000'}
                              onChange={(e) =>
                                setCustomFormData({
                                  ...customFormData,
                                  colors: {
                                    ...customFormData.colors,
                                    [colorKey]: e.target.value,
                                  } as Record<string, string>,
                                })
                              }
                              className="w-full h-8 rounded border border-gray-300 cursor-pointer"
                            />
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Typography Inputs */}
                  <div className="border-t border-gray-300 pt-2">
                    <label className="text-xs font-semibold text-gray-700 block mb-2">Typography</label>
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-gray-600 block mb-1">Font Family</label>
                        <select
                          value={customFormData.typography?.fontFamily || 'Inter, sans-serif'}
                          onChange={(e) =>
                            setCustomFormData({
                              ...customFormData,
                              typography: {
                                ...customFormData.typography!,
                                fontFamily: e.target.value,
                              },
                            })
                          }
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option>Inter, sans-serif</option>
                          <option>Georgia, serif</option>
                          <option>Trebuchet MS, sans-serif</option>
                          <option>Verdana, sans-serif</option>
                          <option>"Courier New", monospace</option>
                          <option>Helvetica, Arial, sans-serif</option>
                          <option>Impact, fantasy</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-gray-600 block mb-1">Heading Size</label>
                          <input
                            type="number"
                            min="18"
                            max="48"
                            value={customFormData.typography?.headingSize || 28}
                            onChange={(e) =>
                              setCustomFormData({
                                ...customFormData,
                                typography: {
                                  ...customFormData.typography!,
                                  headingSize: parseInt(e.target.value),
                                },
                              })
                            }
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 block mb-1">Body Size</label>
                          <input
                            type="number"
                            min="12"
                            max="20"
                            value={customFormData.typography?.bodySize || 14}
                            onChange={(e) =>
                              setCustomFormData({
                                ...customFormData,
                                typography: {
                                  ...customFormData.typography!,
                                  bodySize: parseInt(e.target.value),
                                },
                              })
                            }
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Effects Inputs */}
                  <div className="border-t border-gray-300 pt-2">
                    <label className="text-xs font-semibold text-gray-700 block mb-2">Effects</label>
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-gray-600 block mb-1">Shadow Level</label>
                        <select
                          value={customFormData.effects?.shadowLevel || 'medium'}
                          onChange={(e) =>
                            setCustomFormData({
                              ...customFormData,
                              effects: {
                                ...customFormData.effects!,
                                shadowLevel: e.target.value as any,
                              },
                            })
                          }
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option>none</option>
                          <option>small</option>
                          <option>medium</option>
                          <option>large</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-gray-600 block mb-1">Border Radius</label>
                          <input
                            type="number"
                            min="0"
                            max="50"
                            value={customFormData.effects?.borderRadius || 8}
                            onChange={(e) =>
                              setCustomFormData({
                                ...customFormData,
                                effects: {
                                  ...customFormData.effects!,
                                  borderRadius: parseInt(e.target.value),
                                },
                              })
                            }
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 block mb-1">Animation Speed</label>
                          <select
                            value={customFormData.effects?.animationSpeed || 'normal'}
                            onChange={(e) =>
                              setCustomFormData({
                                ...customFormData,
                                effects: {
                                  ...customFormData.effects!,
                                  animationSpeed: e.target.value as any,
                                },
                              })
                            }
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option>slow</option>
                            <option>normal</option>
                            <option>fast</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateCustomTheme}
                      className="flex-1 px-2 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded font-medium transition-colors"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => setShowCustomForm(false)}
                      className="flex-1 px-2 py-1 text-sm bg-gray-300 hover:bg-gray-400 text-gray-800 rounded font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="w-full px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors text-gray-700 font-medium"
            >
              Done
            </button>
          </div>
        )}
      </div>

      {/* Theme Preview */}
      <div className="pt-2 border-t border-gray-200">
        <p className="text-xs text-gray-500 mb-2">Preview:</p>
        <div className="flex gap-2">
          {Object.entries(currentTheme.colors).map(([key, color]) => (
            <div
              key={key}
              className="flex-1 h-12 rounded border border-gray-200"
              style={{ backgroundColor: color }}
              title={key}
            >
              <p className="text-xs text-center pt-1 font-medium truncate text-gray-800">
                {key}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
