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

export function extractServerStreamFilename(url?: string): string | null {
  if (!url) return null;
  const match = url.match(/\/api\/videos\/stream\/([^/?#]+)/);
  return match?.[1] || null;
}

export function isServerStreamUrl(url?: string): boolean {
  return Boolean(extractServerStreamFilename(url));
}

export function extractIndexedDbId(url: string): string {
  return url.slice(IDB_PREFIX.length);
}

export function buildIndexedDbUrl(id: string): string {
  return `${IDB_PREFIX}${id}`;
}

export async function checkServerUploadAvailable(): Promise<boolean> {
  try {
    const res = await fetch('/api/health', { method: 'GET' });
    const ct = res.headers.get('content-type') || '';
    if (!res.ok || !ct.includes('application/json')) return false;
    const data = await res.json();
    return Boolean(data?.ok);
  } catch {
    return false;
  }
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
    throw new Error('STATIC_HOSTING_NO_UPLOAD_SERVER');
  }

  const data = await response.json();
  if (!response.ok || !data?.success) {
    throw new Error(data?.error || `Upload failed with status ${response.status}`);
  }

  const result = data as ServerUploadResult;

  if (
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1' &&
    result.videoUrl.startsWith('/')
  ) {
    result.videoUrl = `${window.location.origin}${result.videoUrl}`;
  }

  return result;
}

export async function deleteVideoFromServer(videoUrl: string): Promise<void> {
  const filename = extractServerStreamFilename(videoUrl);
  if (!filename) return;
  try {
    await fetch(`/api/videos/${encodeURIComponent(filename)}`, {
      method: 'DELETE',
    });
    if (/^https?:\/\//i.test(videoUrl)) {
      const parsed = new URL(videoUrl);
      if (typeof window !== 'undefined' && parsed.origin !== window.location.origin) {
        await fetch(`${parsed.origin}/api/videos/${encodeURIComponent(filename)}`, {
          method: 'DELETE',
        });
      }
    }
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

export function normalizeDirectVideoUrl(url: string): string {
  const trimmed = url.trim();
  // Convert Dropbox share URL (?dl=0 or ?dl=1) to direct streamable URL (?raw=1)
  if (/dropbox\.com\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      parsed.searchParams.delete('dl');
      parsed.searchParams.set('raw', '1');
      return parsed.toString();
    } catch {
      return trimmed;
    }
  }
  return trimmed;
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

  return { url: normalizeDirectVideoUrl(videoUrl), isObjectUrl: false };
}

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const match = url.trim().match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{6,})/);
  return match?.[1] || null;
}

export function getYouTubeThumbnailUrl(url: string): string | null {
  const ytId = extractYouTubeId(url);
  return ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : null;
}

export function parseEmbedUrl(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  const ytId = extractYouTubeId(trimmed);
  if (ytId) {
    return `https://www.youtube.com/embed/${ytId}?rel=0`;
  }

  // Vimeo
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch?.[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  // Google Drive shared video links
  const driveMatch = trimmed.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([A-Za-z0-9_-]+)/);
  if (driveMatch?.[1]) {
    return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
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
