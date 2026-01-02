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
        url: 'https://bento.me',
        title: 'Bento - Your personal page',
        description: 'The easiest way to build a personal page that looks like this.',
      },
    },
  },
  image: {
    type: 'image',
    size: 'medium',
    content: {
      type: 'image',
      data: {
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
        alt: 'Abstract Design',
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
        title: 'Never Gonna Give You Up',
      },
    },
  },
  text: {
    type: 'text',
    size: 'medium',
    content: {
      type: 'text',
      data: {
        content: 'Building the future of personal pages. ✨',
        size: 'large' as const,
        alignment: 'center' as const,
      },
    },
  },
  social: {
    type: 'social',
    size: 'medium',
    content: {
      type: 'social',
      data: {
        platform: 'twitter' as const,
        username: 'replit',
        label: 'Twitter',
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
