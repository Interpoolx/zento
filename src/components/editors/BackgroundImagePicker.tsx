import { useState } from 'react';
import { Upload, X, Eye, EyeOff } from 'lucide-react';

interface BackgroundImagePickerProps {
    value: string | undefined;
    position?: 'cover' | 'contain' | 'tile';
    mobileImage?: string;
    overlay?: {
        color: string;
        opacity: number;
    };
    onChange: (config: {
        url?: string;
        position?: 'cover' | 'contain' | 'tile';
        mobileImage?: string;
        overlay?: { color: string; opacity: number };
    }) => void;
    label?: string;
}

/**
 * Background image picker component with position and overlay controls
 * Allows users to upload/input background images for widgets
 * 
 * @param value - Current background image URL
 * @param position - How the image should fit (cover, contain, tile)
 * @param mobileImage - Optional mobile-specific background image
 * @param overlay - Optional color overlay on top of image
 * @param onChange - Callback when configuration changes
 * @param label - Optional label for the picker
 */
export function BackgroundImagePicker({
    value,
    position = 'cover',
    mobileImage,
    overlay = { color: '#000000', opacity: 0 },
    onChange,
    label = 'Background Image',
}: BackgroundImagePickerProps) {
    const [urlInput, setUrlInput] = useState(value || '');
    const [showOverlay, setShowOverlay] = useState(overlay?.opacity > 0);
    const [previewUrl, setPreviewUrl] = useState(value);

    /**
     * Handles URL input changes and updates the preview.
     * @param url - The new background image URL
     */
    const handleUrlChange = (url: string) => {
        setUrlInput(url);
        if (url) {
            setPreviewUrl(url);
            onChange({ url });
        } else {
            setPreviewUrl(undefined);
            onChange({ url: undefined });
        }
    };

    /**
     * Handles background position mode changes.
     * @param newPosition - The background sizing mode (cover, contain, or tile)
     */
    const handlePositionChange = (newPosition: 'cover' | 'contain' | 'tile') => {
        onChange({ position: newPosition });
    };

    /**
     * Toggles the color overlay feature on or off.
     * @param enabled - Whether the overlay should be enabled
     */
    const handleOverlayChange = (enabled: boolean) => {
        setShowOverlay(enabled);
        onChange({
            overlay: enabled
                ? overlay || { color: '#000000', opacity: 30 }
                : { color: '#000000', opacity: 0 },
        });
    };

    /**
     * Updates the color of the overlay.
     * @param color - Hex color value for the overlay
     */
    const handleOverlayColorChange = (color: string) => {
        onChange({
            overlay: { ...overlay, color },
        });
    };

    /**
     * Updates the opacity of the overlay.
     * @param opacity - Opacity percentage (0-100)
     */
    const handleOverlayOpacityChange = (opacity: number) => {
        onChange({
            overlay: { ...overlay, opacity },
        });
    };

    /**
     * Clears the background image and resets all related settings.
     */
    const handleClear = () => {
        setUrlInput('');
        setPreviewUrl(undefined);
        setShowOverlay(false);
        onChange({ url: undefined });
    };

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Upload className="w-4 h-4 text-gray-500" />
                    {label}
                </label>
                {value && (
                    <button
                        onClick={handleClear}
                        className="p-1 hover:bg-red-50 rounded text-red-600 transition-colors"
                        title="Clear image"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* URL Input */}
            <div>
                <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                    Supported: JPEG, PNG, WebP, GIF (recommended: 1200×800px or larger)
                </p>
            </div>

            {/* Preview */}
            {previewUrl && (
                <div className="relative rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                    <div
                        className="w-full h-32 bg-center bg-no-repeat"
                        style={{
                            backgroundImage: `url(${previewUrl})`,
                            backgroundSize: position === 'cover' ? 'cover' : position === 'contain' ? 'contain' : 'auto',
                        }}
                    />
                    <div className="text-xs text-gray-500 p-2 text-center">
                        Preview (not actual size)
                    </div>
                </div>
            )}

            {/* Position Controls */}
            {value && (
                <div>
                    <label className="text-xs text-gray-500 mb-2 block font-medium">Background Position</label>
                    <div className="grid grid-cols-3 gap-2">
                        {(['cover', 'contain', 'tile'] as const).map((opt) => (
                            <button
                                key={opt}
                                onClick={() => handlePositionChange(opt)}
                                className={`px-2 py-1.5 text-xs rounded border transition-colors font-medium ${position === opt
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                                    }`}
                                title={
                                    opt === 'cover' ? 'Fill widget, may crop'
                                        : opt === 'contain' ? 'Fit inside widget'
                                            : 'Repeat pattern'
                                }
                            >
                                {opt === 'cover' && '🔲 Cover'}
                                {opt === 'contain' && '🎯 Contain'}
                                {opt === 'tile' && '🔁 Tile'}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Overlay Controls */}
            {value && (
                <div className="pt-2 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs text-gray-500 font-medium">Color Overlay</label>
                        <button
                            onClick={() => handleOverlayChange(!showOverlay)}
                            className={`p-1 rounded transition-colors ${showOverlay ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                                }`}
                        >
                            {showOverlay ? (
                                <Eye className="w-3 h-3" />
                            ) : (
                                <EyeOff className="w-3 h-3" />
                            )}
                        </button>
                    </div>

                    {showOverlay && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={overlay?.color || '#000000'}
                                    onChange={(e) => handleOverlayColorChange(e.target.value)}
                                    className="w-10 h-8 rounded border border-gray-300 cursor-pointer"
                                />
                                <span className="text-xs text-gray-600 flex-1">
                                    {overlay?.color?.toUpperCase()}
                                </span>
                            </div>

                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Opacity</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={overlay?.opacity || 0}
                                        onChange={(e) => handleOverlayOpacityChange(parseInt(e.target.value))}
                                        className="flex-1 h-2 bg-gray-200 rounded accent-blue-500"
                                    />
                                    <span className="text-xs text-gray-600 w-8 text-right">
                                        {overlay?.opacity || 0}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Mobile-specific image */}
            {value && (
                <div className="pt-2 border-t border-gray-200">
                    <label className="text-xs text-gray-500 mb-2 block font-medium">
                        Mobile Background (Optional)
                    </label>
                    <input
                        type="text"
                        value={mobileImage || ''}
                        onChange={(e) => onChange({ mobileImage: e.target.value || undefined })}
                        placeholder="Alternative image for mobile devices"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Leave empty to use the same image on mobile
                    </p>
                </div>
            )}
        </div>
    );
}
