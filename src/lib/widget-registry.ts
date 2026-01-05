import type { WidgetType } from '@/types';

export const WIDGET_SIZES = {
  xs: { width: 1, height: 1 },
  sm: { width: 1, height: 2 },
  md: { width: 2, height: 2 },
  lg: { width: 2, height: 3 },
  xl: { width: 3, height: 3 },
  xxl: { width: 3, height: 4 },
  wide: { width: 4, height: 2 },
  full: { width: 12, height: 3 },
  tall: { width: 1, height: 2 },
  'tall-lg': { width: 1, height: 3 },
  // Legacy aliases for backward compatibility
  small: { width: 1, height: 1 },
  medium: { width: 2, height: 1 },
  large: { width: 2, height: 2 },
} as const;

export type WidgetSizeKey = keyof typeof WIDGET_SIZES;

export const WIDGET_TEMPLATES: Record<WidgetType, {
  type: WidgetType;
  size: WidgetSizeKey;
  content: Record<string, unknown>;
  map?: any;
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
  map: {
    type: 'map',
    size: 'medium',
    content: {
      type: 'map',
      data: {
        latitude: 40.7128,
        longitude: -74.0060,
        zoom: 12,
        label: 'New York',
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
  button: {
   type: 'button',
   size: 'small',
   content: {
     type: 'button',
     data: {
       text: 'Click Me',
       url: 'https://example.com',
       variant: 'primary' as const,
       size: 'medium' as const,
     },
   },
  },
  form: {
   type: 'form',
   size: 'large',
   content: {
     type: 'form',
     data: {
       title: 'Contact Form',
       description: 'Get in touch with us',
       fields: [
         { id: 'name', type: 'text' as const, label: 'Name', placeholder: 'Your name', required: true },
         { id: 'email', type: 'email' as const, label: 'Email', placeholder: 'your@email.com', required: true },
         { id: 'message', type: 'textarea' as const, label: 'Message', placeholder: 'Your message', required: true },
       ],
       submitText: 'Send',
       successMessage: 'Thank you for your submission!',
     },
   },
  },
  testimonial: {
   type: 'testimonial',
   size: 'medium',
   content: {
     type: 'testimonial',
     data: {
       quote: 'This is amazing! Highly recommend.',
       author: 'John Doe',
       role: 'Designer',
       company: 'Creative Co.',
       rating: 5,
     },
   },
  },
  'section-title': {
   type: 'section-title',
   size: 'wide',
   content: {
     type: 'section-title',
     data: {
       title: 'Section Title',
       subtitle: 'Add a description here',
       alignment: 'center' as const,
       showDivider: true,
     },
   },
  },
  gallery: {
   type: 'gallery',
   size: 'large',
   content: {
     type: 'gallery',
     data: {
       images: [
         { id: '1', url: 'https://images.unsplash.com/photo-1600694693152-6a2327b0c7e7?w=400&q=80', alt: 'Image 1' },
         { id: '2', url: 'https://images.unsplash.com/photo-1600694693152-6a2327b0c7e7?w=400&q=80', alt: 'Image 2' },
         { id: '3', url: 'https://images.unsplash.com/photo-1600694693152-6a2327b0c7e7?w=400&q=80', alt: 'Image 3' },
       ],
       columns: 3,
       showLightbox: true,
       spacing: 'medium' as const,
     },
   },
  },
  product: {
   type: 'product',
   size: 'medium',
   content: {
     type: 'product',
     data: {
       name: 'Product Name',
       price: 99.99,
       description: 'Amazing product description',
       image: 'https://images.unsplash.com/photo-1600694693152-6a2327b0c7e7?w=400&q=80',
       url: 'https://example.com/product',
       rating: 4,
       reviews: 42,
     },
   },
  },
  calendar: {
   type: 'calendar',
   size: 'large',
   content: {
     type: 'calendar',
     data: {
       events: [
         { id: '1', title: 'Event 1', date: new Date().toISOString().split('T')[0] },
         { id: '2', title: 'Event 2', date: new Date(Date.now() + 86400000).toISOString().split('T')[0] },
       ],
       showMonth: true,
     },
   },
  },
  pdf: {
   type: 'pdf',
   size: 'medium',
   content: {
     type: 'pdf',
     data: {
       url: 'https://example.com/document.pdf',
       title: 'PDF Document',
       showPreview: true,
       pages: 10,
     },
   },
  },
  countdown: {
   type: 'countdown',
   size: 'large',
   content: {
     type: 'countdown',
     data: {
       title: 'Countdown',
       targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
       message: 'Something amazing is coming',
       showLabels: true,
     },
   },
  },
  qrcode: {
   type: 'qrcode',
   size: 'small',
   content: {
     type: 'qrcode',
     data: {
       data: 'https://example.com',
       size: 'medium' as const,
       errorCorrection: 'H' as const,
       includeMargin: true,
     },
   },
  },
  };
