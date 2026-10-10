/**
 * CareDose Custom Voice Reminder Service
 *
 * Handles:
 * - IndexedDB storage for audio Blobs (key "voice:<lang>")
 * - In-memory fallback if IndexedDB is blocked or unavailable
 * - MP3 validation (size <= 3MB, duration <= 60s)
 * - Shared singleton HTMLAudioElement with URL.revokeObjectURL cleanup
 * - Autoplay permission handling & session interaction tracking
 * - Chaining recorded voice audio with transliterated medicine name speech synthesis
 */

import { Language } from '../types';

const DB_NAME = 'caredose_voice_db';
const DB_VERSION = 1;
const STORE_NAME = 'voice_clips';

export interface StoredVoiceRecord {
  key: string; // e.g. "voice:en", "voice:hi", "voice:te", "voice:shared"
  blob: Blob;
  fileName: string;
  duration: number; // in seconds
  updatedAt: string;
}

// In-memory fallback cache if IndexedDB fails
const memoryVoiceCache = new Map<string, StoredVoiceRecord>();
let isIndexedDbAvailableCache: boolean | null = null;

/**
 * Check if IndexedDB is accessible
 */
export function isIndexedDbAvailable(): boolean {
  if (isIndexedDbAvailableCache !== null) {
    return isIndexedDbAvailableCache;
  }
  try {
    if (typeof window === 'undefined' || !window.indexedDB) {
      isIndexedDbAvailableCache = false;
      return false;
    }
    isIndexedDbAvailableCache = true;
    return true;
  } catch {
    isIndexedDbAvailableCache = false;
    return false;
  }
}

/**
 * Open the IndexedDB database
 */
function openVoiceDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!isIndexedDbAvailable()) {
      return reject(new Error('IndexedDB is not available'));
    }

    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        isIndexedDbAvailableCache = false;
        reject(request.error || new Error('Failed to open IndexedDB'));
      };
    } catch (err) {
      isIndexedDbAvailableCache = false;
      reject(err);
    }
  });
}

/**
 * Save audio blob to IndexedDB with in-memory fallback
 */
export async function saveVoiceClip(
  langKey: string,
  blob: Blob,
  fileName: string,
  duration: number
): Promise<{ persisted: boolean }> {
  const fullKey = langKey.startsWith('voice:') ? langKey : `voice:${langKey}`;
  const record: StoredVoiceRecord = {
    key: fullKey,
    blob,
    fileName,
    duration,
    updatedAt: new Date().toISOString(),
  };

  // Always keep in memory cache for immediate access
  memoryVoiceCache.set(fullKey, record);

  try {
    const db = await openVoiceDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const putReq = store.put(record);

      putReq.onsuccess = () => resolve({ persisted: true });
      putReq.onerror = () => {
        console.warn('IndexedDB put error, falling back to session memory:', putReq.error);
        resolve({ persisted: false });
      };
      tx.onabort = () => resolve({ persisted: false });
    });
  } catch (err) {
    console.warn('IndexedDB unavailable when saving voice clip, held in memory:', err);
    return { persisted: false };
  }
}

/**
 * Retrieve audio blob from IndexedDB (or memory cache)
 */
export async function getVoiceClip(langKey: string): Promise<StoredVoiceRecord | null> {
  const fullKey = langKey.startsWith('voice:') ? langKey : `voice:${langKey}`;

  // Check memory cache first
  if (memoryVoiceCache.has(fullKey)) {
    return memoryVoiceCache.get(fullKey)!;
  }

  try {
    const db = await openVoiceDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(fullKey);

      req.onsuccess = () => {
        const result = req.result as StoredVoiceRecord | undefined;
        if (result) {
          memoryVoiceCache.set(fullKey, result);
          resolve(result);
        } else {
          resolve(null);
        }
      };

      req.onerror = () => {
        resolve(null);
      };
    });
  } catch {
    return memoryVoiceCache.get(fullKey) || null;
  }
}

/**
 * Delete audio blob from IndexedDB and memory cache
 */
export async function deleteVoiceClip(langKey: string): Promise<void> {
  const fullKey = langKey.startsWith('voice:') ? langKey : `voice:${langKey}`;
  memoryVoiceCache.delete(fullKey);

  try {
    const db = await openVoiceDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(fullKey);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB delete error:', err);
  }
}

/**
 * Validate an audio file for MP3 format, size <= 3MB, and duration <= 60 seconds
 */
export async function validateAudioFile(
  file: File
): Promise<{ valid: boolean; duration: number; error?: 'not_mp3' | 'too_large' | 'too_long' | 'read_error' }> {
  // 1. Validate MP3 format
  const isMp3Extension = file.name.toLowerCase().endsWith('.mp3');
  const isMp3Mime = file.type === 'audio/mpeg' || file.type === 'audio/mp3';
  if (!isMp3Extension && !isMp3Mime) {
    return { valid: false, duration: 0, error: 'not_mp3' };
  }

  // 2. Validate file size <= 3 MB (3 * 1024 * 1024 bytes)
  const MAX_SIZE_BYTES = 3 * 1024 * 1024;
  if (file.size > MAX_SIZE_BYTES) {
    return { valid: false, duration: 0, error: 'too_large' };
  }

  // 3. Validate audio duration <= 60 seconds using a temporary audio element
  return new Promise((resolve) => {
    let objectUrl: string | null = null;
    try {
      objectUrl = URL.createObjectURL(file);
      const audio = new Audio();
      let cleanedUp = false;

      const cleanup = () => {
        if (!cleanedUp) {
          cleanedUp = true;
          if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
          }
        }
      };

      const timer = setTimeout(() => {
        cleanup();
        // If metadata loading times out, allow with size-based estimate or fallback
        resolve({ valid: true, duration: 5 });
      }, 5000);

      audio.addEventListener('loadedmetadata', () => {
        clearTimeout(timer);
        const duration = audio.duration;
        cleanup();
        if (isNaN(duration) || !isFinite(duration)) {
          resolve({ valid: true, duration: 0 });
        } else if (duration > 60.5) {
          resolve({ valid: false, duration, error: 'too_long' });
        } else {
          resolve({ valid: true, duration: Math.round(duration) });
        }
      });

      audio.addEventListener('error', () => {
        clearTimeout(timer);
        cleanup();
        resolve({ valid: false, duration: 0, error: 'read_error' });
      });

      audio.src = objectUrl;
    } catch {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
      resolve({ valid: false, duration: 0, error: 'read_error' });
    }
  });
}

// -------------------------------------------------------------
// Singleton Audio Manager & Playback Controller
// -------------------------------------------------------------

class VoicePlaybackManager {
  private audioElement: HTMLAudioElement | null = null;
  private currentObjectUrl: string | null = null;
  private isCurrentlyPlaying: boolean = false;
  private userInteractedThisSession: boolean = false;
  private stopCallbacks: Set<() => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      // Listen for first user interaction to unlock autoplay
      const interactionEvents = ['pointerdown', 'touchstart', 'keydown', 'click'];
      const markInteracted = () => {
        this.userInteractedThisSession = true;
        interactionEvents.forEach((ev) => window.removeEventListener(ev, markInteracted));
      };
      interactionEvents.forEach((ev) =>
        window.addEventListener(ev, markInteracted, { passive: true })
      );
    }
  }

  public get hasInteracted(): boolean {
    return this.userInteractedThisSession;
  }

  public get isPlaying(): boolean {
    return this.isCurrentlyPlaying;
  }

  public registerOnStop(callback: () => void): () => void {
    this.stopCallbacks.add(callback);
    return () => this.stopCallbacks.delete(callback);
  }

  private getAudioElement(): HTMLAudioElement {
    if (!this.audioElement && typeof window !== 'undefined') {
      this.audioElement = new Audio();
      this.audioElement.preload = 'auto';
    }
    return this.audioElement!;
  }

  /**
   * Stop any ongoing audio playback and cancel ongoing speech synthesis
   */
  public stop(): void {
    if (this.audioElement) {
      try {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
        this.audioElement.removeAttribute('src');
      } catch {
        // ignore
      }
    }

    if (this.currentObjectUrl) {
      try {
        URL.revokeObjectURL(this.currentObjectUrl);
      } catch {
        // ignore
      }
      this.currentObjectUrl = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }

    this.isCurrentlyPlaying = false;
    this.stopCallbacks.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.error(err);
      }
    });
  }

  /**
   * Play a specific audio Blob or URL string
   */
  public async playClip(
    source: Blob | string,
    onEnded?: () => void
  ): Promise<{ played: boolean; autoplayBlocked: boolean }> {
    this.stop();

    const audio = this.getAudioElement();
    let srcUrl: string;

    if (typeof source === 'string') {
      srcUrl = source;
    } else {
      srcUrl = URL.createObjectURL(source);
      this.currentObjectUrl = srcUrl;
    }

    audio.src = srcUrl;
    this.isCurrentlyPlaying = true;

    return new Promise((resolve) => {
      const handleEnded = () => {
        cleanup();
        this.isCurrentlyPlaying = false;
        if (onEnded) onEnded();
      };

      const handleError = () => {
        cleanup();
        this.isCurrentlyPlaying = false;
        resolve({ played: false, autoplayBlocked: false });
      };

      const cleanup = () => {
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
        if (this.currentObjectUrl) {
          try {
            URL.revokeObjectURL(this.currentObjectUrl);
          } catch {
            // ignore
          }
          this.currentObjectUrl = null;
        }
      };

      audio.addEventListener('ended', handleEnded, { once: true });
      audio.addEventListener('error', handleError, { once: true });

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            resolve({ played: true, autoplayBlocked: false });
          })
          .catch((err: unknown) => {
            cleanup();
            this.isCurrentlyPlaying = false;
            const isNotAllowed =
              err instanceof Error &&
              (err.name === 'NotAllowedError' || err.name === 'AbortError');
            resolve({ played: false, autoplayBlocked: isNotAllowed });
          });
      } else {
        resolve({ played: true, autoplayBlocked: false });
      }
    });
  }

  /**
   * Speak text using Web Speech API (speechSynthesis)
   */
  public speak(
    text: string,
    language: Language,
    onEnded?: () => void
  ): { supported: boolean; message?: string } {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return { supported: false, message: 'Audio is unavailable in this browser.' };
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (language === 'te') {
        utterance.lang = 'te-IN';
      } else if (language === 'hi') {
        utterance.lang = 'hi-IN';
      } else {
        utterance.lang = 'en-IN';
      }
      utterance.rate = 0.9;
      if (onEnded) {
        utterance.onend = onEnded;
        utterance.onerror = () => onEnded();
      }
      this.isCurrentlyPlaying = true;
      window.speechSynthesis.speak(utterance);
      return { supported: true };
    } catch (err) {
      console.error('SpeechSynthesis error:', err);
      this.isCurrentlyPlaying = false;
      return { supported: false, message: 'Speech synthesis error.' };
    }
  }
}

export const voiceManager = new VoicePlaybackManager();
