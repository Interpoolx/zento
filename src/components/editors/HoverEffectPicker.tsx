import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import type { HoverEffectType, HoverEffect } from '@/lib/hoverEffects';
import { HOVER_EFFECT_PRESETS, INTENSITY_GUIDE } from '@/lib/hoverEffects';

interface HoverEffectPickerProps {
  value: HoverEffect;
  onChange: (effect: HoverEffect) => void;
  label?: string;
  showIntensity?: boolean;
}

/**
 * Hover Effect Picker component
 * Allows selection and customization of hover effect animations
 */
export function HoverEffectPicker({
  value,
  onChange,
  label = 'Hover Effect',
  showIntensity = true,
}: HoverEffectPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#f0f0f0');

  const effectTypes: HoverEffectType[] = ['scale', 'lift', 'rotate', 'colorShift', 'shadow', 'brightness', 'none'];

  /**
   * Changes the hover effect type and applies its default preset values.
   * @param type - The hover effect type to apply
   */
  const handleEffectTypeChange = (type: HoverEffectType) => {
    const preset = HOVER_EFFECT_PRESETS[type];
    onChange({
      type,
      intensity: preset.intensity,
      duration: preset.duration,
      easing: preset.easing,
    });
    setIsOpen(false);
  };

  /**
   * Updates the effect intensity value.
   * @param intensity - The new intensity value
   */
  const handleIntensityChange = (intensity: number) => {
    onChange({
      ...value,
      intensity,
    });
  };

  /**
   * Updates the effect animation duration.
   * @param duration - Duration in milliseconds
   */
  const handleDurationChange = (duration: number) => {
    onChange({
      ...value,
      duration,
    });
  };

  /**
   * Updates the color for the colorShift effect.
   * @param color - Hex color value for the hover state
   */
  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    onChange({
      ...value,
      color,
    });
  };

  const guide = INTENSITY_GUIDE[value.type];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-gray-500" />
          {label}
        </label>
        <span className="text-sm font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded capitalize">
          {value.type}
        </span>
      </div>

      {/* Effect Type Selector */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-sm font-medium text-gray-700 text-left flex items-center justify-between"
      >
        <span>Choose Effect</span>
        <span className="text-xs text-gray-500">{value.type}</span>
      </button>

      {isOpen && (
        <div className="border border-gray-200 rounded-lg p-3 bg-white space-y-2 max-h-80 overflow-y-auto">
          {effectTypes.map((type) => {
            const preset = HOVER_EFFECT_PRESETS[type];
            return (
              <button
                key={type}
                onClick={() => handleEffectTypeChange(type)}
                className={`w-full text-left px-3 py-2 rounded-lg border transition-all ${value.type === type
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
              >
                <p className="text-sm font-medium text-gray-800 capitalize">{type}</p>
                <p className="text-xs text-gray-500">
                  {preset.duration}ms • Intensity: {preset.intensity}
                </p>
              </button>
            );
          })}
          <button
            onClick={() => setIsOpen(false)}
            className="w-full px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors text-gray-700 font-medium mt-2"
          >
            Done
          </button>
        </div>
      )}

      {/* Intensity Control */}
      {showIntensity && value.type !== 'none' && (
        <div className="space-y-2 bg-gray-50 p-3 rounded">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-gray-700">
              Intensity
            </label>
            <span className="text-sm font-medium text-blue-600">
              {value.intensity.toFixed(2)} {guide.unit}
            </span>
          </div>
          <input
            type="range"
            min={guide.min}
            max={guide.max}
            step={0.01}
            value={value.intensity}
            onChange={(e) => handleIntensityChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
          />
          <p className="text-xs text-gray-500">
            Range: {guide.min} - {guide.max} {guide.unit}
          </p>
        </div>
      )}

      {/* Duration Control */}
      {value.type !== 'none' && (
        <div className="space-y-2 bg-gray-50 p-3 rounded">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-gray-700">
              Duration
            </label>
            <span className="text-sm font-medium text-blue-600">
              {value.duration}ms
            </span>
          </div>
          <input
            type="range"
            min="50"
            max="500"
            step="10"
            value={value.duration}
            onChange={(e) => handleDurationChange(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      )}

      {/* Color Picker for Color Shift */}
      {value.type === 'colorShift' && (
        <div className="space-y-2 bg-gray-50 p-3 rounded">
          <label className="text-xs font-semibold text-gray-700 block">
            Hover Color
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => handleColorChange(e.target.value)}
              className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={selectedColor}
              onChange={(e) => handleColorChange(e.target.value)}
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="#f0f0f0"
            />
          </div>
        </div>
      )}

      {/* Preview */}
      <div className="bg-gray-100 rounded p-4 text-center">
        <p className="text-xs text-gray-500 mb-2">Preview</p>
        <div
          className={`
            inline-block px-4 py-2 bg-blue-500 text-white rounded font-medium text-sm
            transition-all cursor-pointer
            ${value.type === 'none' ? '' : 'hover:scale-105'}
          `}
          onMouseEnter={(e) => {
            if (value.type === 'scale') {
              e.currentTarget.style.transform = `scale(${value.intensity})`;
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          Hover me
        </div>
      </div>

      {/* Info */}
      <p className="text-xs text-gray-500 leading-relaxed">
        {value.type === 'none'
          ? 'No hover effect will be applied to this widget.'
          : `This effect will ${value.type} on hover. Mobile devices may not support hover effects.`}
      </p>
    </div>
  );
}
