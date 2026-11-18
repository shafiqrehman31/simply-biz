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
import type { Lead, EmailLog, VideoItem, VideoSectionContent } from '../types';

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
    await setDoc(doc(db, 'emailLogs', log.id), log);
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
