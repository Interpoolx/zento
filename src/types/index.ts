export type WidgetType = 
  | 'link'
  | 'image'
  | 'video'
  | 'text'
  | 'social'
  | 'map'
  | 'divider';

export type WidgetSize = 'small' | 'medium' | 'large' | 'wide' | 'tall';

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

export type WidgetContent = 
  | { type: 'link'; data: LinkWidgetContent }
  | { type: 'image'; data: ImageWidgetContent }
  | { type: 'video'; data: VideoWidgetContent }
  | { type: 'text'; data: TextWidgetContent }
  | { type: 'social'; data: SocialWidgetContent }
  | { type: 'map'; data: MapWidgetContent }
  | { type: 'divider'; data: Record<string, never> };

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
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  layout: PageLayout;
  style: PageStyle;
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
