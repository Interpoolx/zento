import { Lightbulb } from 'lucide-react';
import type { GlowEffect, GlowAnimation, AnimationSpeed } from '@/lib/glowEffects';
import { GLOW_PRESETS } from '@/lib/glowEffects';

interface GlowEffectPickerProps {
  value: GlowEffect;
  onChange: (effect: GlowEffect) => void;
  label?: string;
}

/**
 * Glow Effect Picker component
 * Allows configuration of CSS glow/neon effects with optional animations
 */
export function GlowEffectPicker({
  value,
  onChange,
  label = 'Glow Effect',
}: GlowEffectPickerProps) {

  const presetKeys = Object.keys(GLOW_PRESETS);
  const animationTypes: GlowAnimation[] = ['none', 'pulse', 'flicker'];
  const animationSpeeds: AnimationSpeed[] = ['slow', 'normal', 'fast'];

  /**
   * Toggles the glow effect on or off.
   * @param enabled - Whether the glow effect should be enabled
   */
  const handleEnabledChange = (enabled: boolean) => {
    onChange({
      ...value,
      enabled,
    });
  };

  /**
   * Updates the glow color.
   * @param color - Hex color value for the glow
   */
  const handleColorChange = (color: string) => {
    onChange({
      ...value,
      color,
    });
  };

  /**
   * Updates the glow intensity.
   * @param intensity - Intensity percentage (0-100)
   */
  const handleIntensityChange = (intensity: number) => {
    onChange({
      ...value,
      intensity,
    });
  };

  /**
   * Updates the glow animation type.
   * @param animation - Animation type (none, pulse, or flicker)
   */
  const handleAnimationChange = (animation: GlowAnimation) => {
    onChange({
      ...value,
      animation,
    });
  };

  /**
   * Updates the animation speed.
   * @param speed - Animation speed preset (slow, normal, or fast)
   */
  const handleAnimationSpeedChange = (speed: AnimationSpeed) => {
    onChange({
      ...value,
      animationSpeed: speed,
    });
  };

  /**
   * Applies a preset glow configuration.
   * @param presetName - Name of the preset to apply
   */
  const handleApplyPreset = (presetName: string) => {
    const preset = GLOW_PRESETS[presetName];
    if (preset) {
      onChange(preset);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-gray-500" />
          {label}
        </label>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={value.enabled}
              onChange={(e) => handleEnabledChange(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm font-medium text-gray-700">Enabled</span>
          </label>
        </div>
      </div>

      {value.enabled && (
        <>
          {/* Preset Quick Select */}
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2">Quick Presets</p>
            <div className="grid grid-cols-2 gap-2">
              {presetKeys.map((presetName) => (
                <button
                  key={presetName}
                  onClick={() => handleApplyPreset(presetName)}
                  className="px-2 py-1 text-xs rounded border border-gray-300 hover:border-blue-300 hover:bg-blue-50 transition-colors text-gray-700 font-medium capitalize"
                >
                  {presetName}
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div className="space-y-2 bg-gray-50 p-3 rounded">
            <label className="text-xs font-semibold text-gray-700 block">
              Glow Color
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={value.color}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={value.color}
                onChange={(e) => handleColorChange(e.target.value)}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                placeholder="#3b82f6"
              />
            </div>
          </div>

          {/* Intensity Control */}
          <div className="space-y-2 bg-gray-50 p-3 rounded">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-700">
                Intensity
              </label>
              <span className="text-sm font-medium text-blue-600">
                {value.intensity}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={value.intensity}
              onChange={(e) => handleIntensityChange(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Subtle</span>
              <span>Intense</span>
            </div>
          </div>

          {/* Animation Type */}
          <div className="space-y-2 bg-gray-50 p-3 rounded">
            <label className="text-xs font-semibold text-gray-700 block mb-2">
              Animation
            </label>
            <div className="space-y-1">
              {animationTypes.map((animType) => (
                <button
                  key={animType}
                  onClick={() => handleAnimationChange(animType)}
                  className={`w-full px-2 py-1 text-sm rounded border transition-all text-left capitalize font-medium ${value.animation === animType
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                >
                  {animType}
                </button>
              ))}
            </div>
          </div>

          {/* Animation Speed (only show if animation is enabled) */}
          {value.animation && value.animation !== 'none' && (
            <div className="space-y-2 bg-gray-50 p-3 rounded">
              <label className="text-xs font-semibold text-gray-700 block mb-2">
                Animation Speed
              </label>
              <div className="grid grid-cols-3 gap-2">
                {animationSpeeds.map((speed) => (
                  <button
                    key={speed}
                    onClick={() => handleAnimationSpeedChange(speed)}
                    className={`px-2 py-1 text-xs rounded border font-medium transition-all capitalize ${value.animationSpeed === speed
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    {speed}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Preview */}
          <div className="bg-gray-900 rounded p-4 flex items-center justify-center min-h-32">
            <div
              className={`
                w-20 h-20 rounded-lg bg-white transition-all
                ${value.animation === 'pulse' ? 'animate-pulse' : ''}
                ${value.animation === 'flicker' ? 'animate-ping' : ''}
              `}
              style={{
                boxShadow:
                  value.enabled && value.intensity > 0
                    ? `0 0 ${(value.intensity / 100) * 30}px ${(value.intensity / 100) * 10}px ${value.color}`
                    : 'none',
              }}
            />
          </div>

          <p className="text-xs text-gray-500 leading-relaxed">
            {value.animation === 'none'
              ? 'Static glow effect applied to this widget.'
              : `Glow effect with ${value.animation} animation at ${value.animationSpeed || 'normal'} speed.`}
          </p>
        </>
      )}

      {!value.enabled && (
        <p className="text-xs text-gray-500 leading-relaxed">
          Enable glow effect to add a neon or glowing appearance to this widget.
        </p>
      )}
    </div>
  );
}
