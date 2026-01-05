export type WidgetType = 
  | 'link'
  | 'image'
  | 'video'
  | 'text'
  | 'social'
  | 'map'
  | 'divider'
  | 'button'
  | 'form'
  | 'testimonial'
  | 'section-title'
  | 'gallery'
  | 'product'
  | 'calendar'
  | 'pdf'
  | 'countdown'
  | 'qrcode';

export type WidgetSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'wide' | 'full' | 'tall' | 'tall-lg' | 'small' | 'medium' | 'large';

export interface WidgetPosition {
  x: number;
  y: number;
}

export interface WidgetSizeConfig {
  width: number;
  height: number;
}

export interface WidgetStyle {
  borderRadius?: number;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  shadow?: 'none' | 'small' | 'medium' | 'large';
  customClass?: string;
  aspectRatio?: string;
  opacity?: number;
  backgroundImage?: string;
  backgroundPosition?: 'cover' | 'contain' | 'tile';
  backgroundOverlay?: {
    color: string;
    opacity: number;
  };
  mobileBackgroundImage?: string;
  hoverEffect?: 'none' | 'scale' | 'lift' | 'rotate' | 'brightness' | 'shadow';
  hoverEffectConfig?: {
    type: 'scale' | 'lift' | 'rotate' | 'colorShift' | 'shadow' | 'brightness' | 'none';
    intensity: number;
    duration: number;
    easing?: string;
    color?: string;
  };
  glowEffect?: {
    enabled: boolean;
    color: string;
    intensity: number;
    animation?: 'none' | 'pulse' | 'flicker';
    animationSpeed?: 'slow' | 'normal' | 'fast';
  };
  animationConfig?: {
    speed: 'slow' | 'normal' | 'fast';
    customDuration?: number;
    easing?: string;
    disableAnimations?: boolean;
  };
}

export interface LinkWidgetContent {
  url: string;
  title: string;
  description?: string;
  imageUrl?: string;
  favicon?: string;
}

export interface ImageWidgetContent {
  url: string;
  alt?: string;
  caption?: string;
  linkUrl?: string;
}

export interface VideoWidgetContent {
  url: string;
  thumbnailUrl?: string;
  title?: string;
}

export interface TextWidgetContent {
  content: string;
  size?: 'small' | 'medium' | 'large';
  alignment?: 'left' | 'center' | 'right';
}

export interface SocialWidgetContent {
  platform: 'github' | 'twitter' | 'instagram' | 'linkedin' | 'youtube' | 'dribbble' | 'website';
  username: string;
  label?: string;
}

export interface MapWidgetContent {
  latitude: number;
  longitude: number;
  zoom?: number;
  label?: string;
}

export interface ButtonWidgetContent {
  text: string;
  url: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

export interface FormWidgetContent {
  title: string;
  description?: string;
  fields: FormField[];
  submitText?: string;
  successMessage?: string;
  redirectUrl?: string;
}

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'textarea' | 'checkbox' | 'select';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

export interface TestimonialWidgetContent {
  quote: string;
  author: string;
  role?: string;
  company?: string;
  avatar?: string;
  rating?: number;
}

export interface SectionTitleWidgetContent {
  title: string;
  subtitle?: string;
  alignment?: 'left' | 'center' | 'right';
  showDivider?: boolean;
}

export interface GalleryWidgetContent {
  images: GalleryImage[];
  columns?: number;
  showLightbox?: boolean;
  spacing?: 'small' | 'medium' | 'large';
}

export interface GalleryImage {
  id: string;
  url: string;
  alt?: string;
  caption?: string;
  linkUrl?: string;
}

export interface ProductWidgetContent {
  name: string;
  price: number;
  description?: string;
  image: string;
  url: string;
  rating?: number;
  reviews?: number;
}

export interface CalendarWidgetContent {
  events: CalendarEvent[];
  showMonth?: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  description?: string;
  url?: string;
}

export interface PDFWidgetContent {
  url: string;
  title?: string;
  showPreview?: boolean;
  pages?: number;
}

export interface CountdownWidgetContent {
  title: string;
  targetDate: string;
  message?: string;
  showLabels?: boolean;
}

export interface QRCodeWidgetContent {
  data: string;
  size?: 'small' | 'medium' | 'large';
  errorCorrection?: 'L' | 'M' | 'Q' | 'H';
  includeMargin?: boolean;
}

export type WidgetContent = 
  | { type: 'link'; data: LinkWidgetContent }
  | { type: 'image'; data: ImageWidgetContent }
  | { type: 'video'; data: VideoWidgetContent }
  | { type: 'text'; data: TextWidgetContent }
  | { type: 'social'; data: SocialWidgetContent }
  | { type: 'map'; data: MapWidgetContent }
  | { type: 'divider'; data: Record<string, never> }
  | { type: 'button'; data: ButtonWidgetContent }
  | { type: 'form'; data: FormWidgetContent }
  | { type: 'testimonial'; data: TestimonialWidgetContent }
  | { type: 'section-title'; data: SectionTitleWidgetContent }
  | { type: 'gallery'; data: GalleryWidgetContent }
  | { type: 'product'; data: ProductWidgetContent }
  | { type: 'calendar'; data: CalendarWidgetContent }
  | { type: 'pdf'; data: PDFWidgetContent }
  | { type: 'countdown'; data: CountdownWidgetContent }
  | { type: 'qrcode'; data: QRCodeWidgetContent };

export interface Widget {
  id: string;
  type: WidgetType;
  size: WidgetSize;
  position: WidgetPosition;
  content: WidgetContent;
  style: WidgetStyle;
  viewport: 'desktop' | 'mobile' | 'both';
}

export interface PageLayout {
  columns: number;
  columnGap: number;
  rowGap: number;
  maxWidth: number;
}

export interface PageStyle {
  backgroundColor: string;
  backgroundGradient?: string;
  backgroundImage?: string;
  fontFamily: string;
  fontColor: string;
  buttonStyle: 'rounded' | 'square' | 'pill';
  widgetBackground: string;
  widgetBorderRadius: number;
  ogImage?: string;
  favicon?: string;
}

export interface CustomCSSConfig {
  enabled: boolean;
  code: string;
  compiled?: string; // Processed/scoped CSS
  validated?: boolean;
  warnings?: string[];
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  layout: PageLayout;
  style: PageStyle;
  customCSS?: CustomCSSConfig;
  widgets: Widget[];
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EditorState {
  page: Page;
  selectedWidgetId: string | null;
  isPreviewMode: boolean;
  isMobileView: boolean;
  isDirty: boolean;
}

// Social & Community Features
export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
  createdAt: Date;
}

export interface PagePreview {
  id: string;
  pageId: string;
  userId: string;
  title: string;
  thumbnail?: string;
  description?: string;
  category?: string;
  tags?: string[];
  views: number;
  likes: number;
  isLiked: boolean;
  createdAt: Date;
}

export interface PageComment {
  id: string;
  pageId: string;
  userId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  likes: number;
  isLiked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SocialStats {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  followerCount: number;
  followingCount: number;
}

export interface Discovery {
  trending: PagePreview[];
  featured: PagePreview[];
  recent: PagePreview[];
  byCategory: Record<string, PagePreview[]>;
}

export interface UserFollowRelation {
  userId: string;
  followingId: string;
  createdAt: Date;
}

// Distribution & Sharing Features
export interface PageDistribution {
  pageId: string;
  slug: string;
  customDomain?: string;
  shortLink?: string;
  isPublished: boolean;
  publishedAt?: Date;
  viewCount: number;
  clickCount: number;
}

export interface PageMetaTags {
  pageId: string;
  title: string;
  description: string;
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'player' | 'app';
  twitterImage?: string;
  twitterCreator?: string;
  keywords?: string[];
  canonical?: string;
}

export interface PageAnalytics {
  pageId: string;
  date: string;
  views: number;
  clicks: number;
  referrers: Record<string, number>;
  devices: Record<string, number>;
  locations: Record<string, number>;
}

export interface ShareLink {
  id: string;
  pageId: string;
  platform: 'twitter' | 'facebook' | 'linkedin' | 'whatsapp' | 'email' | 'copy';
  url: string;
  clicks: number;
  createdAt: Date;
}

export interface ExportFormat {
  type: 'html' | 'pdf' | 'json';
  filename: string;
  includeStyles: boolean;
  includeImages: boolean;
  includeComments?: boolean;
}

export interface SlugValidation {
  slug: string;
  isValid: boolean;
  isAvailable: boolean;
  errors: string[];
}
