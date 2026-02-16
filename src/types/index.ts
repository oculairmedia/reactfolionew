// ─── Payload CMS Types ───

export interface PayloadMediaSize {
  filename: string;
  width: number;
  height: number;
  filesize?: number;
  mimeType?: string;
  url?: string;
}

export interface PayloadVideoSize {
  filename: string;
  width?: number;
  height?: number;
  filesize?: number;
}

export interface PayloadMedia {
  id?: string;
  filename: string;
  alt?: string;
  mimeType?: string;
  filesize?: number;
  width?: number;
  height?: number;
  url?: string;
  sizes?: Record<string, PayloadMediaSize>;
  video_sizes?: Record<string, PayloadVideoSize>;
}

export interface PayloadPaginatedResponse<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

export interface PayloadQueryOptions {
  limit?: number;
  page?: number;
  sort?: string;
  depth?: number;
  where?: Record<string, unknown>;
}

// ─── CMS Data Shapes ───

export interface SiteSettings {
  logotext: string;
  meta: MetaInfo;
  contact: ContactInfo;
  social: SocialProfiles;
}

export interface MetaInfo {
  title: string;
  description: string;
}

export interface ContactInfo {
  email: string;
  description: string;
  serviceId: string;
  templateId: string;
  publicKey: string;
}

export interface SocialProfiles {
  github?: string;
  facebook?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  twitch?: string;
  tiktok?: string;
  snapchat?: string;
  [key: string]: string | undefined;
}

export interface HomeIntro {
  title: string;
  description: string;
  image_url: string;
  animated: Array<{ text: string }>;
}

export interface TransformedIntroData {
  title: string;
  description: string;
  your_img_url: string;
  animated: Record<string, string>;
}

export interface AboutData {
  title: string;
  aboutme: string;
  timeline?: TimelineEntry[];
  skills?: Skill[];
  services?: Service[];
}

export interface TimelineEntry {
  jobtitle: string;
  where: string;
  date: string;
  id?: string;
}

export interface Skill {
  name: string;
  value: number;
  id?: string;
}

export interface Service {
  title: string;
  description: string;
  id?: string;
}

export interface NavigationItem {
  label: string;
  path: string;
  external: boolean;
  order: number;
  id: string;
}

export interface FooterData {
  copyright: string;
  note: string;
  links: Array<{ label: string; url: string }>;
}

// ─── Portfolio / Project Types ───

export interface PortfolioTag {
  tag: string;
  id?: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  img?: string;
  isVideo?: boolean;
  link?: string;
  slug?: string;
  order?: number;
  date?: string;
  featured_image?: PayloadMedia | string;
  featuredImage?: PayloadMedia | string;
  featuredVideo?: PayloadMedia | string;
  featured_video?: PayloadMedia | string;
  video?: PayloadMedia | string;
  tags?: PortfolioTag[];
}

export interface ProjectHero {
  type: 'image' | 'video';
  image?: string;
  video?: string;
  alt?: string;
}

export interface ProjectMetadata {
  date?: string;
  client?: string;
  exhibition?: string;
  role?: string;
  collaborators?: string;
  technologies?: string;
  curators?: string;
}

export interface ProjectSection {
  title: string;
  content: string;
}

export interface ProjectGalleryItem {
  type?: 'image' | 'video';
  url?: string;
  image?: string;
  caption?: string;
  width?: string | number;
  poster?: string;
  alt?: string;
}

export interface Project {
  id: string;
  title: string;
  subtitle?: string;
  slug?: string;
  description?: string;
  hero?: ProjectHero;
  metadata?: ProjectMetadata;
  sections?: ProjectSection[];
  gallery?: Array<ProjectGalleryItem | string>;
  tags?: PortfolioTag[];
}

// ─── Page Content Types ───

export interface PageContent {
  title: string;
  description?: string;
  meta_title?: string;
  meta_description?: string;
}

export interface ContactPageContent extends PageContent {
  sectionTitle?: string;
  successMessage?: string;
  sendingText?: string;
  submitButton?: string;
}

export interface PortfolioPageContent extends PageContent {}

export interface UiText {
  viewAllProjects: string;
  returnToPortfolio: string;
  featuredProjects: string;
  myPortfolio: string;
  contactMe: string;
  [key: string]: string;
}

// ─── Contact Form Types ───

export interface ContactFormData {
  email: string;
  name: string;
  message: string;
  loading: boolean;
  show: boolean;
  alertmessage: string;
  variant: string;
}

export interface ContactConfig {
  YOUR_EMAIL: string;
  description: string;
  YOUR_SERVICE_ID: string;
  YOUR_TEMPLATE_ID: string;
  YOUR_USER_ID: string;
  YOUR_PUBLIC_KEY: string;
  YOUR_FONE?: string;
}

// ─── CDN Helper Types ───

export interface ImageOptimizationOptions {
  width?: number | null;
  height?: number | null;
  quality?: number;
  format?: 'avif' | 'webp' | 'jpg' | 'png';
}

export interface SrcSetOptions {
  quality?: number;
  format?: 'avif' | 'webp' | 'jpg' | 'png';
}

export interface Breakpoint {
  maxWidth?: number;
  size: string;
}

export interface BreakpointConfig {
  mobile?: Breakpoint;
  tablet?: Breakpoint;
  desktop?: Breakpoint;
}

export interface PictureSource {
  srcSet: string;
  type: string;
  sizes?: string;
}

export interface PictureElementConfig {
  sources?: PictureSource[];
  img: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  };
}

export interface ImagePreset {
  width: number;
  quality: number;
  format: 'avif' | 'webp' | 'jpg' | 'png';
}

// ─── Video Helper Types ───

export interface VideoSource {
  src: string;
  type: string;
  media: string;
}

export interface VideoMetadata {
  availableQualities: string[];
  originalWidth?: number;
  originalHeight?: number;
  hasThumbnail: boolean;
  filesize?: number;
  mimeType?: string;
}

// ─── Gallery Media Types ───

export interface NormalizedGalleryItem {
  type: 'image' | 'video';
  url: string;
  caption?: string;
  width?: string | number;
  poster?: string;
  alt?: string;
}

// ─── Prefetch Handler Types ───

export interface PrefetchHandlers {
  onMouseEnter: () => void;
  onTouchStart: () => void;
}

export type DataPrefetchType = 'portfolio' | 'about' | 'home-intro' | 'site-settings';
