export type PageRoute = 
  | 'home' 
  | 'about' 
  | 'services' 
  | 'why-us' 
  | 'contact' 
  | 'admin' 
  | 'terms' 
  | 'privacy' 
  | 'refund' 
  | 'disclaimer';

export type JurisdictionType = 'Mainland' | 'Free Zone' | 'Undecided' | 'Offshore';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  jurisdiction: JurisdictionType;
  activityType: string;
  visasNeeded: number;
  message: string;
  budget?: string;
  status: 'New' | 'Contacted' | 'In Progress' | 'Converted' | 'Closed';
  pipedriveStatus: 'synced' | 'pending' | 'failed';
  pipedriveDealId?: string | number | null;
  createdAt: string;
  notes?: string;
}

export interface EmailLog {
  id: string;
  leadId: string;
  recipient: string;
  sender: string;
  subject: string;
  htmlBody: string;
  type: 'customer_confirmation' | 'admin_notification';
  sentAt: string;
  status: 'Delivered' | 'Sent';
}

export interface PipedriveConfig {
  apiToken: string;
  companyDomain: string;
  stageId: string;
  pipelineId: string;
  autoSync: boolean;
  lastSyncAt: string | null;
  lastSyncStatus?: 'success' | 'failed' | null;
  lastSyncMessage?: string | null;
}

export interface SiteBranding {
  siteName: string;
  tagline: string;
  siteEmail: string;
  sitePhone: string;
  whatsappNumber: string;
  address: string;
  logoUrl: string;
  logoWhiteUrl: string;
  faviconUrl: string;
  primaryColor: string;
  accentColor: string;
}

export interface HeroSlide {
  id: string;
  title: string;
  highlightText: string;
  subtitle: string;
  imageUrl: string;
  ctaText: string;
  ctaAction: PageRoute;
  secondaryCtaText: string;
  badgeText: string;
  order: number;
  isActive: boolean;
}

export interface ServiceItem {
  id: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  category: 'Mainland' | 'Free Zone' | 'Residency Visa' | 'Banking & Tax';
  features: string[];
  timeline: string;
  startingPrice: string;
  iconName: string;
  popular?: boolean;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'General' | 'Mainland' | 'Free Zone' | 'Visas' | 'Banking & Tax';
}

export interface TestimonialItem {
  id: string;
  clientName: string;
  role: string;
  companyName: string;
  jurisdiction: string;
  quote: string;
  rating: number;
  avatarUrl?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Senior Consultant' | 'CRM Manager';
  avatarUrl: string;
  lastActive: string;
}

export interface CMSData {
  branding: SiteBranding;
  pipedrive: PipedriveConfig;
  heroSlides: HeroSlide[];
  services: ServiceItem[];
  faqs: FAQItem[];
  testimonials: TestimonialItem[];
  adminUsers: AdminUser[];
}
