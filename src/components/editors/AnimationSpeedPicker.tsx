import { Zap, Settings } from 'lucide-react';
import { useState } from 'react';
import type { AnimationSpeed, AnimationConfig } from '@/lib/animationPresets';
import { ANIMATION_DURATIONS } from '@/lib/animationPresets';

interface AnimationSpeedPickerProps {
  value: AnimationSpeed;
  onSpeedChange: (speed: AnimationSpeed) => void;
  onConfigChange?: (config: AnimationConfig) => void;
  showAdvanced?: boolean;
  label?: string;
}

/**
 * Animation Speed Picker component
 * Allows selection of animation speed presets and advanced configuration
 */
export function AnimationSpeedPicker({
  value,
  onSpeedChange,
  onConfigChange,
  showAdvanced = false,
  label = 'Animation Speed',
}: AnimationSpeedPickerProps) {
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(showAdvanced);
  const [customDuration, setCustomDuration] = useState(ANIMATION_DURATIONS[value]);
  const [selectedEasing, setSelectedEasing] = useState<'ease-in' | 'ease-out' | 'ease-in-out' | 'linear'>('ease-in-out');
  const [disableAnimations, setDisableAnimations] = useState(false);

  /**
   * Handles speed preset selection and updates the custom duration to match.
   * @param speed - The animation speed preset to apply
   */
  const handleSpeedChange = (speed: AnimationSpeed) => {
    onSpeedChange(speed);
    setCustomDuration(ANIMATION_DURATIONS[speed]);
  };

  /**
   * Handles custom duration slider changes and propagates config update.
   * @param duration - Custom animation duration in milliseconds
   */
  const handleCustomDurationChange = (duration: number) => {
    setCustomDuration(duration);
    if (onConfigChange) {
      onConfigChange({
        speed: value,
        customDuration: duration,
        easing: selectedEasing,
        disableAnimations,
      });
    }
  };

  /**
   * Handles easing function selection changes.
   * @param easing - CSS easing function name
   */
  const handleEasingChange = (easing: string) => {
    setSelectedEasing(easing as any);
    if (onConfigChange) {
      onConfigChange({
        speed: value,
        customDuration,
        easing: easing as any,
        disableAnimations,
      });
    }
  };

  /**
   * Handles the accessibility toggle to disable all animations.
   * @param disabled - Whether animations should be disabled
   */
  const handleDisableAnimations = (disabled: boolean) => {
    setDisableAnimations(disabled);
    if (onConfigChange) {
      onConfigChange({
        speed: value,
        customDuration,
        easing: selectedEasing,
        disableAnimations: disabled,
      });
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Zap className="w-4 h-4 text-gray-500" />
          {label}
        </label>
        <button
          onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          title="Advanced options"
        >
          <Settings className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Speed Presets */}
      <div className="grid grid-cols-3 gap-2">
        {(['slow', 'normal', 'fast'] as const).map((speed) => (
          <button
            key={speed}
            onClick={() => handleSpeedChange(speed)}
            className={`px-3 py-2 rounded-lg border-2 font-medium text-sm transition-all ${value === speed
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
          >
            {speed.charAt(0).toUpperCase() + speed.slice(1)}
            <div className="text-xs text-gray-500 mt-1">
              {ANIMATION_DURATIONS[speed]}ms
            </div>
          </button>
        ))}
      </div>

      {/* Advanced Options */}
      {showAdvancedOptions && (
        <div className="border-t border-gray-200 pt-3 space-y-3 bg-gray-50 p-3 rounded">
          {/* Custom Duration */}
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-2">
              Custom Duration (ms)
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="range"
                min="50"
                max="1000"
                step="50"
                value={customDuration}
                onChange={(e) => handleCustomDurationChange(parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm font-medium text-gray-700 w-12 text-right">
                {customDuration}ms
              </span>
            </div>
          </div>

          {/* Easing Function */}
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-2">
              Easing Function
            </label>
            <select
              value={selectedEasing}
              onChange={(e) => handleEasingChange(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ease-in">Ease In</option>
              <option value="ease-out">Ease Out</option>
              <option value="ease-in-out">Ease In-Out</option>
              <option value="linear">Linear</option>
            </select>
          </div>

          {/* Disable Animations (Accessibility) */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="disable-animations"
              checked={disableAnimations}
              onChange={(e) => handleDisableAnimations(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded cursor-pointer"
            />
            <label htmlFor="disable-animations" className="text-sm text-gray-700 cursor-pointer flex-1">
              Disable all animations (accessibility)
            </label>
          </div>

          <p className="text-xs text-gray-500 leading-relaxed">
            Enable this option to respect prefers-reduced-motion user preference for better accessibility.
          </p>
        </div>
      )}

      {/* Info */}
      <p className="text-xs text-gray-500 leading-relaxed">
        Control the speed of all animations on your page. Affects transitions, fades, and interactive effects.
      </p>
    </div>
  );
}
