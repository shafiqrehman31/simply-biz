const DB_NAME = 'simplybiz_media_db';
const DB_VERSION = 1;
const STORE_NAME = 'videos';
export const IDB_PREFIX = 'idb://';
export const SERVER_STREAM_PREFIX = '/api/videos/stream/';

export interface ServerUploadResult {
  success: boolean;
  id: string;
  filename: string;
  videoUrl: string;
  fileSizeBytes: number;
  detectedOrientation: 'portrait' | 'landscape' | 'auto';
}

function openMediaDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this browser.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open media database.'));
  });
}

export function isIndexedDbUrl(url?: string): boolean {
  return Boolean(url && url.startsWith(IDB_PREFIX));
}

export function isServerStreamUrl(url?: string): boolean {
  return Boolean(url && url.startsWith(SERVER_STREAM_PREFIX));
}

export function extractIndexedDbId(url: string): string {
  return url.slice(IDB_PREFIX.length);
}

export function buildIndexedDbUrl(id: string): string {
  return `${IDB_PREFIX}${id}`;
}

export async function uploadVideoToServer(file: File): Promise<ServerUploadResult> {
  const response = await fetch('/api/videos/upload', {
    method: 'POST',
    headers: {
      'X-File-Name': encodeURIComponent(file.name),
      'Content-Type': file.type || 'application/octet-stream',
    },
    body: file,
  });

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error('Server upload endpoint is unavailable in static-only hosting.');
  }

  const data = await response.json();
  if (!response.ok || !data?.success) {
    throw new Error(data?.error || `Upload failed with status ${response.status}`);
  }

  return data as ServerUploadResult;
}

export async function deleteVideoFromServer(videoUrl: string): Promise<void> {
  if (!isServerStreamUrl(videoUrl)) return;
  const filename = videoUrl.slice(SERVER_STREAM_PREFIX.length);
  if (!filename) return;
  try {
    await fetch(`/api/videos/${encodeURIComponent(filename)}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.warn('Unable to delete video file from server:', err);
  }
}

export async function saveVideoBlob(id: string, blob: Blob): Promise<void> {
  const db = await openMediaDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(blob, id);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error || new Error('Failed to store video file.'));
    tx.oncomplete = () => db.close();
  });
}

export async function getVideoBlob(id: string): Promise<Blob | null> {
  try {
    const db = await openMediaDB();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);

      req.onsuccess = () => resolve((req.result as Blob) || null);
      req.onerror = () => reject(req.error || new Error('Failed to load video file.'));
      tx.oncomplete = () => db.close();
    });
  } catch (err) {
    console.warn('Unable to read video from IndexedDB:', err);
    return null;
  }
}

export async function deleteVideoBlob(id: string): Promise<void> {
  try {
    const db = await openMediaDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error || new Error('Failed to delete video file.'));
      tx.oncomplete = () => db.close();
    });
  } catch (err) {
    console.warn('Unable to delete video from IndexedDB:', err);
  }
}

export async function resolveVideoUrl(
  videoUrl: string
): Promise<{ url: string; isObjectUrl: boolean; missingLocalBlob?: boolean }> {
  if (!videoUrl) {
    return { url: '', isObjectUrl: false };
  }

  if (isIndexedDbUrl(videoUrl)) {
    const id = extractIndexedDbId(videoUrl);
    const blob = await getVideoBlob(id);
    if (!blob) {
      return { url: '', isObjectUrl: false, missingLocalBlob: true };
    }
    const objectUrl = URL.createObjectURL(blob);
    return { url: objectUrl, isObjectUrl: true };
  }

  return { url: videoUrl, isObjectUrl: false };
}

export function parseEmbedUrl(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // YouTube standard, shorts, or youtu.be
  const ytWatchMatch = trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{6,})/);
  if (ytWatchMatch?.[1]) {
    return `https://www.youtube.com/embed/${ytWatchMatch[1]}?rel=0`;
  }

  // Vimeo
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch?.[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  return null;
}

export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
