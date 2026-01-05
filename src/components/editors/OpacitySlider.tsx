
import { Eye } from 'lucide-react';

interface OpacitySliderProps {
    value: number;
    onChange: (opacity: number) => void;
    label?: string;
}

/**
 * Opacity/Transparency slider component
 * Allows users to control widget transparency from 0-100%
 * 
 * @param value - Current opacity value (0-100)
 * @param onChange - Callback when opacity changes
 * @param label - Optional label for the slider
 */
export function OpacitySlider({ value, onChange, label = 'Opacity' }: OpacitySliderProps) {
    const opacity = Math.max(0, Math.min(100, value || 100));

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-gray-500" />
                    {label}
                </label>
                <span className="text-sm font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    {opacity}%
                </span>
            </div>

            {/* Visual preview */}
            <div className="flex items-center gap-3">
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={opacity}
                    onChange={(e) => onChange(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    style={{
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${opacity}%, #e5e7eb ${opacity}%, #e5e7eb 100%)`
                    }}
                />
            </div>

            {/* Visual indicator showing opacity effect */}
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200">
                <span className="text-xs text-gray-600">Preview:</span>
                <div
                    className="flex-1 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded border border-gray-200"
                    style={{ opacity: opacity / 100 }}
                />
            </div>

            {/* Quick presets */}
            <div className="flex gap-2 mt-2 pt-2 border-t border-gray-200">
                {[100, 75, 50, 25, 0].map((preset) => (
                    <button
                        key={preset}
                        onClick={() => onChange(preset)}
                        className={`flex-1 px-2 py-1 text-xs rounded font-medium transition-colors ${opacity === preset
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {preset}%
                    </button>
                ))}
            </div>
        </div>
    );
}
