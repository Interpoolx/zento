import { Download, Plus, Trash2, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export interface Font {
  id: string;
  name: string;
  family: string;
  category: 'serif' | 'sans-serif' | 'monospace' | 'display' | 'custom';
  variants?: string[];
  url?: string; // For custom uploads
  isCustom?: boolean;
}

interface FontPickerProps {
  selectedFont?: Font;
  onFontSelect: (font: Font) => void;
  label?: string;
}

// Common web-safe fonts
export const SYSTEM_FONTS: Font[] = [
  { id: 'inter', name: 'Inter', family: 'Inter, sans-serif', category: 'sans-serif' },
  { id: 'georgia', name: 'Georgia', family: 'Georgia, serif', category: 'serif' },
  { id: 'times', name: 'Times New Roman', family: '"Times New Roman", serif', category: 'serif' },
  { id: 'courier', name: 'Courier New', family: '"Courier New", monospace', category: 'monospace' },
  { id: 'verdana', name: 'Verdana', family: 'Verdana, sans-serif', category: 'sans-serif' },
  { id: 'arial', name: 'Arial', family: 'Arial, sans-serif', category: 'sans-serif' },
  { id: 'helvetica', name: 'Helvetica', family: 'Helvetica, Arial, sans-serif', category: 'sans-serif' },
  { id: 'trebuchet', name: 'Trebuchet MS', family: 'Trebuchet MS, sans-serif', category: 'sans-serif' },
  { id: 'impact', name: 'Impact', family: 'Impact, fantasy', category: 'display' },
];

/**
 * Font Picker component for selecting and managing fonts
 * 
 * Provides an interactive interface for browsing, selecting, and managing fonts.
 * Supports both system web-safe fonts and custom font uploads. Users can preview
 * fonts, copy font-family declarations, and manage custom font collections.
 * 
 * @component
 * @param {Font} [selectedFont] - Currently selected font object with id, name, family, and category
 * @param {(font: Font) => void} onFontSelect - Callback triggered when a font is selected
 * @param {string} [label='Font Family'] - Optional label displayed above the picker
 * @returns {React.ReactElement} The font picker UI
 * @example
 * const [font, setFont] = useState(SYSTEM_FONTS[0]);
 * <FontPicker selectedFont={font} onFontSelect={setFont} label="Choose Font" />
 */
export function FontPicker({ selectedFont, onFontSelect, label = 'Font Family' }: FontPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customFonts, setCustomFonts] = useState<Font[]>([]);
  const [copiedFontId, setCopiedFontId] = useState<string | null>(null);

  /**
   * Selects a font and closes the dropdown.
   * @param font - The font object to select
   */
  const handleFontSelect = (font: Font) => {
    onFontSelect(font);
    setIsOpen(false);
  };

  /**
   * Copies the font family string to clipboard and shows a success indicator.
   * @param fontFamily - The CSS font-family value to copy
   * @param fontId - The font's unique ID for tracking copied state
   */
  const handleCopyFontFamily = (fontFamily: string, fontId: string) => {
    navigator.clipboard.writeText(fontFamily);
    setCopiedFontId(fontId);
    setTimeout(() => setCopiedFontId(null), 2000);
  };

  /**
   * Removes a custom font from the list.
   * @param fontId - The ID of the custom font to delete
   */
  const handleDeleteCustomFont = (fontId: string) => {
    setCustomFonts(customFonts.filter(f => f.id !== fontId));
  };

  /**
   * Creates a new placeholder custom font and adds it to the list.
   */
  const handleAddCustomFont = () => {
    const newFont: Font = {
      id: `custom-${Date.now()}`,
      name: 'Custom Font',
      family: 'CustomFont, sans-serif',
      category: 'custom',
      isCustom: true,
    };
    setCustomFonts([...customFonts, newFont]);
  };

  const displayFont = selectedFont || SYSTEM_FONTS[0];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Download className="w-4 h-4 text-gray-500" />
          {label}
        </label>
        <span className="text-sm font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded">
          {displayFont.name}
        </span>
      </div>

      {/* Font Button with Dropdown Container */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-sm font-medium text-gray-700 flex items-center justify-between"
          style={{ fontFamily: displayFont.family }}
        >
          <span>{displayFont.name}</span>
          <span className="text-xs text-gray-500">{displayFont.category}</span>
        </button>

        {isOpen && (
          <div
            className="absolute top-full left-0 right-0 border border-gray-200 rounded-lg p-3 bg-white space-y-3 max-h-96 overflow-y-auto z-50 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* System Fonts */}
            <div>
              <h4 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">
                System Fonts
              </h4>
              <div className="space-y-1">
                {SYSTEM_FONTS.map((font) => (
                  <button
                    key={font.id}
                    onClick={() => handleFontSelect(font)}
                    className={`w-full text-left px-3 py-2 rounded-lg border transition-all flex items-center justify-between group ${selectedFont?.id === font.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    style={{ fontFamily: font.family }}
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">{font.name}</p>
                      <p className="text-xs text-gray-500">{font.family}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyFontFamily(font.family, font.id);
                      }}
                      className="p-1 rounded hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Copy font family"
                    >
                      {copiedFontId === font.id ? (
                        <Check className="w-3 h-3 text-green-600" />
                      ) : (
                        <Copy className="w-3 h-3 text-gray-500" />
                      )}
                    </button>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Fonts */}
            {customFonts.length > 0 && (
              <div className="pt-2 border-t border-gray-200">
                <h4 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">
                  Custom Fonts
                </h4>
                <div className="space-y-1">
                  {customFonts.map((font) => (
                    <div
                      key={font.id}
                      className={`px-3 py-2 rounded-lg border ${selectedFont?.id === font.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white'
                        }`}
                      style={{ fontFamily: font.family }}
                    >
                      <div className="flex items-start justify-between">
                        <button
                          onClick={() => handleFontSelect(font)}
                          className="flex-1 text-left hover:bg-gray-50 p-1 rounded transition-colors"
                        >
                          <p className="text-sm font-medium text-gray-800">{font.name}</p>
                          <p className="text-xs text-gray-500">{font.family}</p>
                        </button>
                        <button
                          onClick={() => handleDeleteCustomFont(font.id)}
                          className="p-1 hover:bg-red-50 rounded text-red-600 transition-colors"
                          title="Delete custom font"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Custom Font */}
            <div className="pt-2 border-t border-gray-200">
              <button
                onClick={handleAddCustomFont}
                className="w-full px-3 py-2 text-sm rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Custom Font
              </button>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Custom fonts support coming soon. You'll be able to upload .woff, .ttf, and .otf files or link to Google Fonts.
              </p>
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

      {/* Font Preview */}
      <div className="pt-2 border-t border-gray-200">
        <p className="text-xs text-gray-500 mb-2">Preview:</p>
        <div
          className="p-4 bg-gray-50 rounded border border-gray-200 text-center"
          style={{ fontFamily: displayFont.family }}
        >
          <p className="text-sm font-bold">Sample Heading</p>
          <p className="text-xs">The quick brown fox jumps over the lazy dog</p>
        </div>
      </div>
    </div>
  );
}
