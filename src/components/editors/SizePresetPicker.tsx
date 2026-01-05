
import { WIDGET_SIZES } from '@/lib/widget-registry';
import type { WidgetSize } from '@/types';
import { Square } from 'lucide-react';

interface SizePresetPickerProps {
    value: WidgetSize;
    onChange: (size: WidgetSize) => void;
    label?: string;
}

/**
 * Widget size preset picker component
 * Provides visual grid showing different size options with their dimensions
 * 
 * @param value - Current size preset
 * @param onChange - Callback when size changes
 * @param label - Optional label for the picker
 */
export function SizePresetPicker({ value, onChange, label = 'Size Preset' }: SizePresetPickerProps) {
    // Size presets organized by category
    const sizePresets = [
        { size: 'xs' as const, label: 'XS', icon: '◻' },
        { size: 'sm' as const, label: 'SM', icon: '▦' },
        { size: 'md' as const, label: 'MD', icon: '▭' },
        { size: 'lg' as const, label: 'LG', icon: '▬' },
        { size: 'xl' as const, label: 'XL', icon: '▮' },
        { size: 'xxl' as const, label: 'XXL', icon: '▯' },
        { size: 'wide' as const, label: 'Wide', icon: '━' },
        { size: 'full' as const, label: 'Full', icon: '▀' },
    ];

    /**
     * Returns a formatted dimension string for a widget size.
     * @param size - The widget size preset
     * @returns Formatted string like "2×1" representing width×height
     */
    const getSizeDescription = (size: WidgetSize): string => {
        const config = WIDGET_SIZES[size as keyof typeof WIDGET_SIZES];
        if (!config) return '';
        return `${config.width}×${config.height}`;
    };

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Square className="w-4 h-4 text-gray-500" />
                    {label}
                </label>
                <span className="text-sm font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    {getSizeDescription(value)}
                </span>
            </div>

            {/* Grid of size options */}
            <div className="grid grid-cols-4 gap-2">
                {sizePresets.map(({ size, label: sizeLabel }) => {
                    const isSelected = value === size;
                    const config = WIDGET_SIZES[size];

                    return (
                        <button
                            key={size}
                            onClick={() => onChange(size)}
                            className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all ${isSelected
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                                }`}
                            title={`${sizeLabel} (${config.width}×${config.height})`}
                        >
                            {/* Visual representation */}
                            <div
                                className="mb-1 rounded-sm bg-gradient-to-br from-blue-400 to-blue-600"
                                style={{
                                    width: `${24 + config.width * 8}px`,
                                    height: `${16 + config.height * 6}px`,
                                    opacity: isSelected ? 1 : 0.6,
                                }}
                            />
                            <span className="text-xs font-semibold text-gray-700">{sizeLabel}</span>
                        </button>
                    );
                })}
            </div>

            {/* Size info and quick actions */}
            <div className="pt-2 border-t border-gray-200">
                <div className="text-xs text-gray-500 mb-2">
                    Selected: <span className="font-semibold text-gray-700">{value}</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                    Each grid unit is 1 column × 1 row. Expand your widgets to fill more space on the canvas.
                </p>
            </div>

            {/* Common size combinations */}
            <div className="pt-2 border-t border-gray-200">
                <label className="text-xs text-gray-500 block mb-2 font-medium">Quick Apply:</label>
                <div className="flex gap-1">
                    <button
                        onClick={() => onChange('full')}
                        className="flex-1 px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700 font-medium"
                    >
                        Full Width
                    </button>
                    <button
                        onClick={() => onChange('wide')}
                        className="flex-1 px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700 font-medium"
                    >
                        Wide
                    </button>
                </div>
            </div>
        </div>
    );
}
