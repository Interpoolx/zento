import type { WidgetType } from '@/types';

export function generateId(): string {
  return crypto.randomUUID();
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export const WIDGET_SIZES = {
  small: { width: 1, height: 1 },
  medium: { width: 2, height: 1 },
  large: { width: 2, height: 2 },
  wide: { width: 4, height: 1 },
  tall: { width: 1, height: 2 },
} as const;

export type WidgetSizeKey = keyof typeof WIDGET_SIZES;

export const WIDGET_TEMPLATES: Record<WidgetType, {
  type: WidgetType;
  size: 'small' | 'medium' | 'large' | 'wide' | 'tall';
  content: Record<string, unknown>;
}> = {
  link: {
    type: 'link',
    size: 'medium',
    content: {
      type: 'link',
      data: {
        url: 'https://example.com',
        title: 'New Link',
        description: 'Add a description',
      },
    },
  },
  image: {
    type: 'image',
    size: 'medium',
    content: {
      type: 'image',
      data: {
        url: 'https://images.unsplash.com/photo-1707343843437-caacff5cfa74?w=400&h=300&fit=crop',
        alt: 'Image',
      },
    },
  },
  video: {
    type: 'video',
    size: 'large',
    content: {
      type: 'video',
      data: {
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        title: 'Video',
      },
    },
  },
  text: {
    type: 'text',
    size: 'medium',
    content: {
      type: 'text',
      data: {
        content: 'Add your text here...',
        size: 'medium' as const,
        alignment: 'left' as const,
      },
    },
  },
  social: {
    type: 'social',
    size: 'medium',
    content: {
      type: 'social',
      data: {
        platform: 'github' as const,
        username: 'username',
        label: 'Social Link',
      },
    },
  },
  divider: {
    type: 'divider',
    size: 'wide',
    content: {
      type: 'divider',
      data: {},
    },
  },
};
