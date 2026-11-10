import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  collection, 
  getDocs, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  getDocFromServer 
} from 'firebase/firestore';
import firebaseConfig from './firebaseConfig';
import type { Lead, EmailLog } from '../types';

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
