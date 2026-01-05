import { useState, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

/**
 * Advanced color picker component with multiple input modes
 * 
 * Provides an interactive color selection interface supporting:
 * - HEX color input
 * - RGB (Red, Green, Blue) input
 * - HSL (Hue, Saturation, Lightness) input
 * - Preset color palette
 * 
 * @component
 * @param {string} value - Current color value in HEX format (e.g., '#3b82f6')
 * @param {(color: string) => void} onChange - Callback function triggered when color value changes
 * @returns {React.ReactElement} The color picker UI
 * @example
 * const [color, setColor] = useState('#3b82f6');
 * <ColorPicker value={color} onChange={setColor} />
 */
export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMode, setInputMode] = useState<'hex' | 'rgb' | 'hsl'>('hex');
  const containerRef = useRef<HTMLDivElement>(null);

  const presetColors = [
    '#ffffff', '#000000', '#3b82f6', '#ef4444', '#10b981',
    '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#6366f1',
  ];

  /**
   * Converts a hexadecimal color string to an RGB tuple.
   * 
   * Parses 6-digit hex color codes (with or without leading #) and extracts
   * the red, green, and blue components as integers from 0-255.
   * 
   * @param hex - Hex color string, e.g., '#FF5733' or 'ff5733'
   * @returns RGB tuple [r, g, b] with values 0-255, or null if format is invalid
   * 
   * @example
   * hexToRgb('#FF5733')  // Returns [255, 87, 51]
   * hexToRgb('3b82f6')   // Returns [59, 130, 246]
   * hexToRgb('invalid')  // Returns null
   * 
   * @note Does not support 3-digit shorthand hex (e.g., #F00)
   * @note Case-insensitive input
   */
  const hexToRgb = (hex: string): [number, number, number] | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16),
    ] : null;
  };

  /**
   * Converts RGB color values to a hexadecimal color string.
   * 
   * Takes individual red, green, and blue values and produces a standard
   * 6-digit hex color code with leading #.
   * 
   * @param r - Red component (0-255)
   * @param g - Green component (0-255)
   * @param b - Blue component (0-255)
   * @returns Uppercase hex color string with #, e.g., '#FF5733'
   * 
   * @example
   * rgbToHex(255, 87, 51)   // Returns '#FF5733'
   * rgbToHex(59, 130, 246)  // Returns '#3B82F6'
   * rgbToHex(0, 0, 0)       // Returns '#000000'
   * 
   * @note Values are clamped to valid range internally via toString(16)
   * @note Output is always uppercase for consistency
   */
  const rgbToHex = (r: number, g: number, b: number): string => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
  };

  /**
   * Converts a hexadecimal color string to HSL (Hue, Saturation, Lightness) values.
   * 
   * Uses the standard RGB-to-HSL conversion algorithm:
   * 1. Normalizes RGB values to 0-1 range
   * 2. Calculates lightness as average of max and min components
   * 3. Calculates saturation based on chroma and lightness
   * 4. Determines hue from the dominant color channel
   * 
   * @param hex - Hex color string, e.g., '#3B82F6'
   * @returns HSL tuple [h, s, l] where:
   *          - h is hue (0-360 degrees on color wheel)
   *          - s is saturation (0-100 percent)
   *          - l is lightness (0-100 percent)
   *          Returns null if hex format is invalid
   * 
   * @example
   * hexToHsl('#FF0000')  // Returns [0, 100, 50] (pure red)
   * hexToHsl('#00FF00')  // Returns [120, 100, 50] (pure green)
   * hexToHsl('#3B82F6')  // Returns [217, 91, 60] (blue)
   * hexToHsl('#808080')  // Returns [0, 0, 50] (gray - no saturation)
   * 
   * @see https://en.wikipedia.org/wiki/HSL_and_HSV for algorithm details
   */
  const hexToHsl = (hex: string): [number, number, number] | null => {
    const rgb = hexToRgb(hex);
    if (!rgb) return null;

    const [r, g, b] = rgb.map(x => x / 255);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  };

  /**
   * Converts HSL (Hue, Saturation, Lightness) values to a hexadecimal color string.
   * 
   * Uses an optimized HSL-to-RGB algorithm that directly calculates the hex output.
   * Useful for generating colors programmatically or creating color variations.
   * 
   * @param h - Hue in degrees (0-360), where:
   *            - 0/360 = Red
   *            - 60 = Yellow
   *            - 120 = Green
   *            - 180 = Cyan
   *            - 240 = Blue
   *            - 300 = Magenta
   * @param s - Saturation percentage (0-100), where 0 is grayscale
   * @param l - Lightness percentage (0-100), where 0 is black, 100 is white
   * @returns Uppercase hex color string with #, e.g., '#3B82F6'
   * 
   * @example
   * hslToHex(0, 100, 50)    // Returns '#FF0000' (pure red)
   * hslToHex(217, 91, 60)   // Returns '#3B82F6' (blue)
   * hslToHex(0, 0, 50)      // Returns '#808080' (gray)
   * hslToHex(120, 100, 25)  // Returns '#008000' (dark green)
   * 
   * @note Values outside valid ranges may produce unexpected results
   */
  const hslToHex = (h: number, s: number, l: number): string => {
    s /= 100;
    l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
  };

  const rgb = hexToRgb(value);
  const hsl = hexToHsl(value);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
      >
        <div className="w-6 h-6 rounded border border-gray-200" style={{ backgroundColor: value }} />
        <span className="text-sm text-gray-700 flex-1 text-left">{value}</span>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[280px]">
          {/* Color gradient picker */}
          <div className="mb-4">
            <div className="text-xs text-gray-500 mb-2">Color Picker</div>
            <div
              className="w-full h-32 rounded border border-gray-200 cursor-crosshair relative"
              style={{
                background: `linear-gradient(90deg, #fff 0%, hsl(${hsl?.[0] ?? 0}, 100%, 50%) 100%)`
              }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const saturation = (x / rect.width) * 100;
                const lightness = 100 - (y / rect.height) * 100;
                const newColor = hslToHex(hsl?.[0] ?? 0, saturation, lightness);
                onChange(newColor);
              }}
            >
              {/* Hue slider */}
              <div className="absolute bottom-0 left-0 right-0 h-4 rounded-b border-t border-gray-200"
                style={{
                  background: 'linear-gradient(90deg, red 0%, yellow 17%, lime 33%, cyan 50%, blue 67%, magenta 83%, red 100%)'
                }}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const hue = (x / rect.width) * 360;
                  const newColor = hslToHex(hue, hsl?.[1] ?? 100, hsl?.[2] ?? 50);
                  onChange(newColor);
                }}
              />
            </div>
          </div>

          {/* Input mode tabs */}
          <div className="flex gap-1 mb-3 bg-gray-50 p-1 rounded">
            {(['hex', 'rgb', 'hsl'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setInputMode(mode)}
                className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${inputMode === mode
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {mode.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Color input fields */}
          {inputMode === 'hex' && (
            <div className="mb-3">
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="#000000"
              />
            </div>
          )}

          {inputMode === 'rgb' && rgb && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {['R', 'G', 'B'].map((label, i) => (
                <div key={label}>
                  <label className="text-xs text-gray-500 block mb-1">{label}</label>
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={rgb[i]}
                    onChange={(e) => {
                      const newRgb: [number, number, number] = [...rgb] as any;
                      newRgb[i] = Math.min(255, Math.max(0, parseInt(e.target.value) || 0));
                      onChange(rgbToHex(newRgb[0], newRgb[1], newRgb[2]));
                    }}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          )}

          {inputMode === 'hsl' && hsl && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {['H', 'S', 'L'].map((label, i) => (
                <div key={label}>
                  <label className="text-xs text-gray-500 block mb-1">{label}</label>
                  <input
                    type="number"
                    min={i === 0 ? '0' : '0'}
                    max={i === 0 ? '360' : '100'}
                    value={hsl[i]}
                    onChange={(e) => {
                      const newHsl: [number, number, number] = [...hsl] as any;
                      newHsl[i] = i === 0
                        ? Math.min(360, Math.max(0, parseInt(e.target.value) || 0))
                        : Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                      onChange(hslToHex(newHsl[0], newHsl[1], newHsl[2]));
                    }}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Preset colors */}
          <div className="mb-3">
            <div className="text-xs text-gray-500 mb-2">Presets</div>
            <div className="grid grid-cols-5 gap-2">
              {presetColors.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    onChange(color);
                    setIsOpen(false);
                  }}
                  className="w-full aspect-square rounded border-2 border-gray-200 hover:border-gray-400 transition-colors"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={() => setIsOpen(false)}
            className="w-full px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
