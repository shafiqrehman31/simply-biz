import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  collection, 
  getDoc,
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  onSnapshot, 
  getDocFromServer 
} from 'firebase/firestore';
import firebaseConfig from './firebaseConfig';
import type {
  Lead,
  EmailLog,
  EmailSettings,
  VideoItem,
  VideoSectionContent,
  SiteBranding,
  HeroSlide,
  ServiceItem,
  FAQItem,
  TestimonialItem,
  AboutPageContent,
  WhyUsPageContent,
  ServicesPageContent,
  CMSData,
} from '../types';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Test connection on boot
(async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or initializing.');
    }
  }
})();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Save new Lead to Firestore
 */
export async function saveLeadToFirestore(lead: Lead): Promise<void> {
  try {
    await setDoc(doc(db, 'leads', lead.id), lead);
  } catch (err) {
    console.warn('Firestore saveLead warning:', err);
  }
}

/**
 * Update Lead Status in Firestore
 */
export async function updateLeadStatusInFirestore(leadId: string, status: Lead['status']): Promise<void> {
  try {
    await updateDoc(doc(db, 'leads', leadId), { status });
  } catch (err) {
    console.warn('Firestore updateLeadStatus warning:', err);
  }
}

/**
 * Subscribe in real-time to Leads collection in Firestore
 */
export function subscribeToFirestoreLeads(
  onData: (leads: Lead[]) => void,
  onFallback?: () => void
): () => void {
  try {
    const colRef = collection(db, 'leads');
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const firestoreLeads: Lead[] = [];
        snapshot.forEach((docSnap) => {
          firestoreLeads.push(docSnap.data() as Lead);
        });
        firestoreLeads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        onData(firestoreLeads);
      },
      (error) => {
        console.warn('Firestore leads subscription fallback to local cache:', error);
        if (onFallback) onFallback();
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('subscribeToFirestoreLeads error:', err);
    if (onFallback) onFallback();
    return () => {};
  }
}

/**
 * Fetch all Leads from Firestore
 */
export async function fetchFirestoreLeads(): Promise<Lead[]> {
  try {
    const colRef = collection(db, 'leads');
    const snapshot = await getDocs(colRef);
    const firestoreLeads: Lead[] = [];
    snapshot.forEach((docSnap) => {
      firestoreLeads.push(docSnap.data() as Lead);
    });
    firestoreLeads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return firestoreLeads;
  } catch (err) {
    console.warn('fetchFirestoreLeads error:', err);
    return [];
  }
}

/**
 * Save EmailLog to Firestore
 */
export async function saveEmailLogToFirestore(log: EmailLog): Promise<void> {
  try {
    const payload: Record<string, unknown> = {
      id: log.id.slice(0, 128),
      leadId: log.leadId.slice(0, 128),
      recipient: (log.recipient || '').slice(0, 300),
      sender: (log.sender || '').slice(0, 200),
      subject: (log.subject || '').slice(0, 300),
      htmlBody: (log.htmlBody || '').slice(0, 100000),
      type: log.type,
      sentAt: (log.sentAt || new Date().toISOString()).slice(0, 100),
      status: log.status,
    };
    if (log.deliveryNote) {
      payload.deliveryNote = String(log.deliveryNote).slice(0, 500);
    }
    await setDoc(doc(db, 'emailLogs', log.id), payload);
  } catch (err) {
    console.warn('Firestore saveEmailLog warning:', err);
  }
}

/**
 * Subscribe in real-time to EmailLogs collection in Firestore
 */
export function subscribeToFirestoreEmailLogs(
  onData: (logs: EmailLog[]) => void,
  onFallback?: () => void
): () => void {
  try {
    const colRef = collection(db, 'emailLogs');
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const firestoreLogs: EmailLog[] = [];
        snapshot.forEach((docSnap) => {
          firestoreLogs.push(docSnap.data() as EmailLog);
        });
        firestoreLogs.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
        onData(firestoreLogs);
      },
      (error) => {
        console.warn('Firestore emailLogs subscription fallback to local cache:', error);
        if (onFallback) onFallback();
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('subscribeToFirestoreEmailLogs error:', err);
    if (onFallback) onFallback();
    return () => {};
  }
}

function sanitizeVideoForFirestore(video: VideoItem): Record<string, unknown> {
  const docData: Record<string, unknown> = {
    id: video.id,
    title: video.title.slice(0, 200),
    description: (video.description || '').slice(0, 2000),
    category: (video.category || 'UAE Business Setup Guide').slice(0, 100),
    videoUrl: video.videoUrl.slice(0, 2000),
    sourceType: video.sourceType,
    orientation: video.orientation,
    isActive: Boolean(video.isActive),
    isFeatured: Boolean(video.isFeatured),
    order: typeof video.order === 'number' ? video.order : 1,
    createdAt: video.createdAt || new Date().toISOString(),
  };

  if (video.fileName !== undefined) {
    docData.fileName = String(video.fileName).slice(0, 300);
  }
  if (typeof video.fileSizeBytes === 'number') {
    docData.fileSizeBytes = video.fileSizeBytes;
  }
  return docData;
}

export async function hasSeededVideosInFirestore(): Promise<boolean> {
  try {
    const snap = await getDoc(doc(db, 'siteConfig', 'videoDefaults'));
    return snap.exists() && Boolean(snap.data()?.seeded);
  } catch (err) {
    console.warn('hasSeededVideosInFirestore check warning:', err);
    return false;
  }
}

export async function markVideosSeededInFirestore(): Promise<void> {
  try {
    await setDoc(doc(db, 'siteConfig', 'videoDefaults'), { seeded: true });
  } catch (err) {
    console.warn('markVideosSeededInFirestore warning:', err);
  }
}

/**
 * Fetch all Videos from Firestore
 */
export async function fetchFirestoreVideos(): Promise<VideoItem[]> {
  const colRef = collection(db, 'videos');
  const snapshot = await getDocs(colRef);
  const firestoreVideos: VideoItem[] = [];
  snapshot.forEach((docSnap) => {
    firestoreVideos.push(docSnap.data() as VideoItem);
  });
  firestoreVideos.sort((a, b) => {
    if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
    return (a.order || 0) - (b.order || 0);
  });
  return firestoreVideos;
}

/**
 * Save or update a VideoItem in Firestore
 */
export async function saveVideoToFirestore(video: VideoItem): Promise<void> {
  const payload = sanitizeVideoForFirestore(video);
  try {
    await setDoc(doc(db, 'videos', video.id), payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `videos/${video.id}`);
  }
}

/**
 * Delete a VideoItem from Firestore
 */
export async function deleteVideoFromFirestore(videoId: string): Promise<void> {
  try {
    await markVideosSeededInFirestore();
    await deleteDoc(doc(db, 'videos', videoId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `videos/${videoId}`);
  }
}

/**
 * Subscribe in real-time to Videos collection in Firestore
 */
export function subscribeToFirestoreVideos(
  onData: (videos: VideoItem[]) => void,
  onFallback?: () => void
): () => void {
  try {
    const colRef = collection(db, 'videos');
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const firestoreVideos: VideoItem[] = [];
        snapshot.forEach((docSnap) => {
          firestoreVideos.push(docSnap.data() as VideoItem);
        });
        firestoreVideos.sort((a, b) => {
          if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
          return (a.order || 0) - (b.order || 0);
        });
        onData(firestoreVideos);
      },
      (error) => {
        console.warn('Firestore videos subscription fallback to local cache:', error);
        if (onFallback) onFallback();
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('subscribeToFirestoreVideos error:', err);
    if (onFallback) onFallback();
    return () => {};
  }
}

/**
 * Save shared VideoSectionContent to Firestore
 */
export async function saveVideoSectionToFirestore(content: VideoSectionContent): Promise<void> {
  try {
    await setDoc(doc(db, 'siteConfig', 'videoSection'), {
      badgeText: (content.badgeText || '').slice(0, 100),
      headline: (content.headline || 'Inside UAE Business Formation with Simply Biz').slice(0, 300),
      subheadline: (content.subheadline || '').slice(0, 2000),
    });
  } catch (err) {
    console.warn('Firestore saveVideoSection warning:', err);
  }
}

/**
 * Subscribe in real-time to siteConfig/videoSection in Firestore
 */
export function subscribeToFirestoreVideoSection(
  onData: (content: VideoSectionContent) => void
): () => void {
  try {
    const docRef = doc(db, 'siteConfig', 'videoSection');
    return onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          onData(docSnap.data() as VideoSectionContent);
        }
      },
      (error) => {
        console.warn('Firestore videoSection subscription warning:', error);
      }
    );
  } catch (err) {
    console.warn('subscribeToFirestoreVideoSection error:', err);
    return () => {};
  }
}

function sanitizeEmailSettingsForFirestore(settings: EmailSettings): Record<string, unknown> {
  return {
    enabled: Boolean(settings.enabled),
    notificationEmails: (settings.notificationEmails || '').slice(0, 500),
    fromName: (settings.fromName || 'Simply Biz Quote Desk').slice(0, 120),
    subjectPrefix: (settings.subjectPrefix || '[Simply Biz Quote]').slice(0, 100),
    deliveryProvider: settings.deliveryProvider || 'formsubmit',
    web3formsAccessKey: (settings.web3formsAccessKey || '').slice(0, 200),
    emailjsServiceId: (settings.emailjsServiceId || '').slice(0, 150),
    emailjsTemplateId: (settings.emailjsTemplateId || '').slice(0, 150),
    emailjsCustomerTemplateId: (settings.emailjsCustomerTemplateId || '').slice(0, 150),
    emailjsPublicKey: (settings.emailjsPublicKey || '').slice(0, 150),
    webhookUrl: (settings.webhookUrl || '').slice(0, 500),
    updatedAt: (settings.updatedAt || new Date().toISOString()).slice(0, 100),
  };
}

/**
 * Save shared EmailSettings to Firestore (siteConfig/emailSettings)
 */
export async function saveEmailSettingsToFirestore(settings: EmailSettings): Promise<void> {
  const payload = sanitizeEmailSettingsForFirestore(settings);
  try {
    await setDoc(doc(db, 'siteConfig', 'emailSettings'), payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'siteConfig/emailSettings');
  }
}

/**
 * Fetch latest shared EmailSettings from Firestore
 */
export async function fetchEmailSettingsFromFirestore(): Promise<EmailSettings | null> {
  try {
    const snap = await getDoc(doc(db, 'siteConfig', 'emailSettings'));
    if (snap.exists()) {
      return snap.data() as EmailSettings;
    }
    return null;
  } catch (err) {
    console.warn('fetchEmailSettingsFromFirestore warning:', err);
    return null;
  }
}

/**
 * Subscribe in real-time to siteConfig/emailSettings in Firestore
 */
export function subscribeToFirestoreEmailSettings(
  onData: (settings: EmailSettings) => void
): () => void {
  try {
    const docRef = doc(db, 'siteConfig', 'emailSettings');
    return onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          onData(docSnap.data() as EmailSettings);
        }
      },
      (error) => {
        console.warn('Firestore emailSettings subscription warning:', error);
      }
    );
  } catch (err) {
    console.warn('subscribeToFirestoreEmailSettings error:', err);
    return () => {};
  }
}

function sanitizeBrandingForFirestore(branding: SiteBranding): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    siteName: (branding.siteName || 'Simply Biz').slice(0, 200),
    tagline: (branding.tagline || '').slice(0, 300),
    siteEmail: (branding.siteEmail || '').slice(0, 200),
    sitePhone: (branding.sitePhone || '').slice(0, 50),
    whatsappNumber: (branding.whatsappNumber || '').slice(0, 50),
    address: (branding.address || '').slice(0, 500),
    logoUrl: (branding.logoUrl || '').slice(0, 500000),
    logoWhiteUrl: (branding.logoWhiteUrl || '').slice(0, 500000),
    faviconUrl: (branding.faviconUrl || '').slice(0, 500000),
    primaryColor: (branding.primaryColor || '#00106b').slice(0, 50),
    accentColor: (branding.accentColor || '#f85508').slice(0, 50),
    facebookUrl: (branding.facebookUrl || '').slice(0, 500),
    instagramUrl: (branding.instagramUrl || '').slice(0, 500),
    linkedinUrl: (branding.linkedinUrl || '').slice(0, 500),
    updatedAt: new Date().toISOString(),
  };
  return payload;
}

export async function saveBrandingToFirestore(branding: SiteBranding): Promise<void> {
  try {
    await setDoc(doc(db, 'siteConfig', 'branding'), sanitizeBrandingForFirestore(branding));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'siteConfig/branding');
  }
}

export async function saveHeroSlidesToFirestore(slides: HeroSlide[]): Promise<void> {
  const safeItems = (slides || []).slice(0, 30).map((s, idx) => ({
    id: String(s.id || `slide-${idx + 1}`).slice(0, 128),
    title: String(s.title || '').slice(0, 300),
    highlightText: String(s.highlightText || '').slice(0, 200),
    subtitle: String(s.subtitle || '').slice(0, 1000),
    imageUrl: String(s.imageUrl || '').slice(0, 500000),
    ctaText: String(s.ctaText || 'Explore').slice(0, 100),
    ctaAction: s.ctaAction || 'services',
    secondaryCtaText: String(s.secondaryCtaText || 'Free Consultation').slice(0, 100),
    badgeText: String(s.badgeText || '').slice(0, 150),
    order: typeof s.order === 'number' ? s.order : idx + 1,
    isActive: Boolean(s.isActive),
  }));
  if (safeItems.length === 0) return;
  try {
    await setDoc(doc(db, 'siteConfig', 'heroSlides'), {
      items: safeItems,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'siteConfig/heroSlides');
  }
}

export async function saveServicesToFirestore(services: ServiceItem[]): Promise<void> {
  const safeItems = (services || []).slice(0, 100).map((svc, idx) => ({
    id: String(svc.id || `service-${idx + 1}`).slice(0, 128),
    title: String(svc.title || '').slice(0, 200),
    shortDesc: String(svc.shortDesc || '').slice(0, 1000),
    fullDesc: String(svc.fullDesc || '').slice(0, 4000),
    category: svc.category || 'Mainland',
    features: Array.isArray(svc.features) ? svc.features.slice(0, 20).map((f) => String(f).slice(0, 300)) : [],
    timeline: String(svc.timeline || '').slice(0, 150),
    startingPrice: String(svc.startingPrice || '').slice(0, 150),
    iconName: String(svc.iconName || 'Building2').slice(0, 80),
    popular: Boolean(svc.popular),
  }));
  if (safeItems.length === 0) return;
  try {
    await setDoc(doc(db, 'siteConfig', 'services'), {
      items: safeItems,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'siteConfig/services');
  }
}

export async function saveFaqsToFirestore(faqs: FAQItem[]): Promise<void> {
  const safeItems = (faqs || []).slice(0, 100).map((f, idx) => ({
    id: String(f.id || `faq-${idx + 1}`).slice(0, 128),
    question: String(f.question || '').slice(0, 500),
    answer: String(f.answer || '').slice(0, 3000),
    category: f.category || 'General',
  }));
  if (safeItems.length === 0) return;
  try {
    await setDoc(doc(db, 'siteConfig', 'faqs'), {
      items: safeItems,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'siteConfig/faqs');
  }
}

export async function saveTestimonialsToFirestore(testimonials: TestimonialItem[]): Promise<void> {
  const safeItems = (testimonials || []).slice(0, 100).map((t, idx) => ({
    id: String(t.id || `test-${idx + 1}`).slice(0, 128),
    clientName: String(t.clientName || '').slice(0, 200),
    role: String(t.role || '').slice(0, 200),
    companyName: String(t.companyName || '').slice(0, 200),
    jurisdiction: String(t.jurisdiction || '').slice(0, 200),
    quote: String(t.quote || '').slice(0, 3000),
    rating: typeof t.rating === 'number' ? Math.min(5, Math.max(1, t.rating)) : 5,
    ...(t.avatarUrl ? { avatarUrl: String(t.avatarUrl).slice(0, 2000) } : {}),
  }));
  if (safeItems.length === 0) return;
  try {
    await setDoc(doc(db, 'siteConfig', 'testimonials'), {
      items: safeItems,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'siteConfig/testimonials');
  }
}

export async function saveAboutContentToFirestore(content: AboutPageContent): Promise<void> {
  try {
    await setDoc(doc(db, 'siteConfig', 'aboutContent'), {
      badgeText: (content.badgeText || '').slice(0, 100),
      headline: (content.headline || 'About Simply Biz').slice(0, 300),
      subheadline: (content.subheadline || '').slice(0, 2000),
      imageUrl: (content.imageUrl || '').slice(0, 500000),
      guidingPrincipleTitle: (content.guidingPrincipleTitle || '').slice(0, 300),
      guidingPrincipleText: (content.guidingPrincipleText || '').slice(0, 2000),
      guidingPrincipleBullets: (content.guidingPrincipleBullets || []).slice(0, 20).map((b) => String(b).slice(0, 500)),
      pillars: (content.pillars || []).slice(0, 20).map((p) => ({
        title: String(p.title || '').slice(0, 200),
        desc: String(p.desc || '').slice(0, 1000),
      })),
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'siteConfig/aboutContent');
  }
}

export async function saveWhyUsContentToFirestore(content: WhyUsPageContent): Promise<void> {
  try {
    await setDoc(doc(db, 'siteConfig', 'whyUsContent'), {
      badgeText: (content.badgeText || '').slice(0, 100),
      headline: (content.headline || 'Why Choose Simply Biz').slice(0, 300),
      subheadline: (content.subheadline || '').slice(0, 2000),
      guaranteeTitle: (content.guaranteeTitle || '').slice(0, 300),
      guaranteeDesc: (content.guaranteeDesc || '').slice(0, 2000),
      steps: (content.steps || []).slice(0, 30).map((s) => ({
        num: String(s.num || '').slice(0, 20),
        title: String(s.title || '').slice(0, 200),
        desc: String(s.desc || '').slice(0, 1000),
      })),
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'siteConfig/whyUsContent');
  }
}

export async function saveServicesContentToFirestore(content: ServicesPageContent): Promise<void> {
  try {
    await setDoc(doc(db, 'siteConfig', 'servicesContent'), {
      badgeText: (content.badgeText || '').slice(0, 100),
      headline: (content.headline || 'UAE Corporate Solutions').slice(0, 300),
      subheadline: (content.subheadline || '').slice(0, 2000),
      estimatorNote: (content.estimatorNote || '').slice(0, 2000),
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'siteConfig/servicesContent');
  }
}

/**
 * Subscribe in real-time to all public CMS documents in siteConfig collection
 */
export function subscribeToPublicSiteConfig(
  onPatch: (patch: Partial<CMSData>) => void
): () => void {
  try {
    const colRef = collection(db, 'siteConfig');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const patch: Partial<CMSData> = {};
        snapshot.forEach((docSnap) => {
          const id = docSnap.id;
          const data = docSnap.data();
          if (id === 'branding') {
            patch.branding = data as SiteBranding;
          } else if (id === 'heroSlides' && Array.isArray(data.items) && data.items.length > 0) {
            patch.heroSlides = data.items as HeroSlide[];
          } else if (id === 'services' && Array.isArray(data.items) && data.items.length > 0) {
            patch.services = data.items as ServiceItem[];
          } else if (id === 'faqs' && Array.isArray(data.items) && data.items.length > 0) {
            patch.faqs = data.items as FAQItem[];
          } else if (id === 'testimonials' && Array.isArray(data.items) && data.items.length > 0) {
            patch.testimonials = data.items as TestimonialItem[];
          } else if (id === 'aboutContent') {
            patch.aboutContent = data as AboutPageContent;
          } else if (id === 'whyUsContent') {
            patch.whyUsContent = data as WhyUsPageContent;
          } else if (id === 'servicesContent') {
            patch.servicesContent = data as ServicesPageContent;
          } else if (id === 'videoSection') {
            patch.videoSectionContent = data as VideoSectionContent;
          } else if (id === 'emailSettings') {
            patch.emailSettings = data as EmailSettings;
          }
        });
        if (Object.keys(patch).length > 0) {
          onPatch(patch);
        }
      },
      (error) => {
        console.warn('Firestore siteConfig subscription warning:', error);
      }
    );
  } catch (err) {
    console.warn('subscribeToPublicSiteConfig error:', err);
    return () => {};
  }
}
