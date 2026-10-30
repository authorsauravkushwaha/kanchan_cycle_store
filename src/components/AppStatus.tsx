import { useMemo, useState } from 'react';
import { MapPin, Phone, RefreshCw, WifiOff, X } from 'lucide-react';
import { shop } from '../config/shop';
import { useLanguage } from '../i18n';
import { phoneHref, track } from '../lib/business';
import { arrivalSource, usePwa } from '../pwa';
import { useCatalog } from '../inventory';
import { DirectionsButton } from './UI';

/** Shown above the content when the phone loses its connection or the network drops out mid-visit. */
export function OfflineBanner() {
  const { isOnline } = usePwa();
  const { stale } = useCatalog();
  const { t } = useLanguage();
  if (isOnline) return null;
  return <div className="offline-banner" role="status" aria-live="polite">
    <WifiOff size={16} aria-hidden="true" />
    <span>{t('offline.banner')}{stale && ` ${t('offline.cached')}`}</span>
  </div>;
}

/** A quiet prompt when a new deployment is waiting in the service worker. */
export function UpdateToast() {
  const { updateReady, applyUpdate } = usePwa();
  const { t } = useLanguage();
  if (!updateReady) return null;
  return <div className="update-toast" role="status">
    <span>{t('update.ready')}</span>
    <button type="button" className="btn btn-primary btn-compact" onClick={applyUpdate}><RefreshCw size={15} aria-hidden="true" />{t('update.action')}</button>
  </div>;
}

const ARRIVAL_KEY = 'kanchan-maps-notice';

/**
 * Many customers reach the website from the Google Maps listing on Android.
 * They need directions and a phone number, not a marketing story. This strip
 * greets that arrival once per session and stays out of the way afterwards.
 */
export function ArrivalNotice() {
  const source = useMemo(arrivalSource, []);
  const { t } = useLanguage();
  const [hidden, setHidden] = useState(() => {
    try { return sessionStorage.getItem(ARRIVAL_KEY) === 'hidden'; } catch { return false; }
  });
  if (source !== 'maps' || hidden) return null;
  const dismiss = () => {
    setHidden(true);
    try { sessionStorage.setItem(ARRIVAL_KEY, 'hidden'); } catch { /* optional */ }
  };
  return <aside className="arrival-notice" aria-label={t('maps.title')}>
    <span className="arrival-icon" aria-hidden="true"><MapPin size={20} /></span>
    <div className="arrival-copy">
      <strong>{t('maps.title')}</strong>
      <p>{t('maps.text')}</p>
      <div className="arrival-actions">
        <a className="btn btn-small" href={phoneHref()} onClick={() => track('phone_click', { placement: 'maps-arrival' })}><Phone size={15} aria-hidden="true" />{shop.contact.phoneDisplay}</a>
        <DirectionsButton variant="text" short />
      </div>
    </div>
    <button type="button" className="icon-button arrival-close" onClick={dismiss} aria-label={t('maps.dismiss')}><X size={17} /></button>
  </aside>;
}

export function CatalogFreshnessNote() {
  const { stale, configured } = useCatalog();
  const { l } = useLanguage();
  if (!configured || !stale) return null;
  return <p className="catalog-freshness" role="status">{l({
    bn: 'সেভ করা তালিকা দেখানো হচ্ছে — ইন্টারনেট ফিরলে নতুন স্টক নিজেই আপডেট হবে।',
    en: 'Showing the saved catalogue — fresh stock updates automatically when you are back online.',
  })}</p>;
}
