import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

/**
 * Android-first installability and offline state.
 *
 * The website is a Progressive Web App: it installs from Chrome on Android
 * without an app store, works offline, and opens full-screen from the home
 * screen. Nothing here requires an account or a native wrapper.
 */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

type InstallOutcome = 'accepted' | 'dismissed' | 'unavailable' | 'unsupported';
const DISMISS_KEY = 'kanchan-install-dismissed-until';
const DISMISS_DAYS = 14;

interface PwaValue {
  canInstall: boolean;
  isStandalone: boolean;
  isOnline: boolean;
  updateReady: boolean;
  installDismissed: boolean;
  promptInstall: () => Promise<InstallOutcome>;
  dismissInstall: () => void;
  applyUpdate: () => void;
  /** True on phones where the browser offers its own "Add to Home screen". */
  isAndroid: boolean;
}

const PwaContext = createContext<PwaValue | null>(null);

const readDismissed = () => {
  try {
    const until = Number(localStorage.getItem(DISMISS_KEY) || 0);
    return Number.isFinite(until) && until > Date.now();
  } catch { return false; }
};

const standalone = () => {
  try {
    return window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
  } catch { return false; }
};

export function PwaProvider({ children }: { children: ReactNode }) {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setStandalone] = useState(standalone);
  const [isOnline, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));
  const [updateReady, setUpdateReady] = useState(false);
  const [installDismissed, setInstallDismissed] = useState(readDismissed);
  const registration = useRef<ServiceWorkerRegistration | null>(null);
  const isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => { setInstallEvent(null); setStandalone(true); };
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    const onDisplayMode = () => setStandalone(standalone());
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    const media = window.matchMedia('(display-mode: standalone)');
    media.addEventListener?.('change', onDisplayMode);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
      media.removeEventListener?.('change', onDisplayMode);
    };
  }, []);

  useEffect(() => {
    if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
    const base = import.meta.env.BASE_URL;
    let cancelled = false;
    navigator.serviceWorker.register(`${base}sw.js`, { scope: base }).then(reg => {
      if (cancelled) return;
      registration.current = reg;
      if (reg.waiting) setUpdateReady(true);
      reg.addEventListener('updatefound', () => {
        const installing = reg.installing;
        installing?.addEventListener('statechange', () => {
          if (installing.state === 'installed' && navigator.serviceWorker.controller) setUpdateReady(true);
        });
      });
    }).catch(() => { /* Offline support is an enhancement, never a requirement. */ });
    /* A first-time visitor also gets a controllerchange when the worker claims
       the page. Reloading then would waste their data, so only reload for an
       update on a page that was already controlled. */
    let hadController = Boolean(navigator.serviceWorker.controller);
    const onControllerChange = () => {
      if (hadController) window.location.reload();
      hadController = true;
    };
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
    return () => {
      cancelled = true;
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<InstallOutcome> => {
    if (!installEvent) return 'unavailable';
    try {
      await installEvent.prompt();
      const choice = await installEvent.userChoice;
      setInstallEvent(null);
      return choice.outcome;
    } catch { return 'unsupported'; }
  }, [installEvent]);

  const dismissInstall = useCallback(() => {
    setInstallDismissed(true);
    try { localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_DAYS * 864e5)); } catch { /* optional */ }
  }, []);

  const applyUpdate = useCallback(() => {
    const waiting = registration.current?.waiting;
    if (waiting) waiting.postMessage({ type: 'SKIP_WAITING' });
    else window.location.reload();
  }, []);

  return <PwaContext.Provider value={{
    canInstall: Boolean(installEvent) && !isStandalone,
    isStandalone, isOnline, updateReady, installDismissed, promptInstall, dismissInstall, applyUpdate, isAndroid,
  }}>{children}</PwaContext.Provider>;
}

export function usePwa() {
  const value = useContext(PwaContext);
  if (!value) throw new Error('usePwa must be used inside PwaProvider');
  return value;
}

/** Reads `?utm_source=` / `?source=` and the referrer once, for the Maps-arrival welcome. */
export function arrivalSource(): 'maps' | 'pwa' | 'shortcut' | 'direct' {
  try {
    const params = new URLSearchParams(window.location.search);
    const source = `${params.get('utm_source') || ''} ${params.get('source') || ''}`.toLowerCase();
    if (/maps|google/.test(source) || /google\.[a-z.]+\/maps|maps\.google/.test(document.referrer)) return 'maps';
    if (source.includes('pwa')) return 'pwa';
    if (source.includes('shortcut')) return 'shortcut';
    return 'direct';
  } catch { return 'direct'; }
}
