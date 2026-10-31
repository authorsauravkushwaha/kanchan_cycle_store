import { useEffect, useId, useRef, useState } from 'react';
import { Check, Download, Share2, Smartphone, X } from 'lucide-react';
import { useLanguage } from '../i18n';
import { usePwa } from '../pwa';

function InstallDialog({ open, auto, onClose }: { open: boolean; auto: boolean; onClose: (dismissed: boolean) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const { t, l } = useLanguage();
  const { canInstall, promptInstall, dismissInstall, isStandalone } = usePwa();
  const [message, setMessage] = useState<string | null>(null);
  const titleId = useId();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  if (isStandalone) return null;

  const ua = typeof navigator === 'undefined' ? '' : navigator.userAgent;
  const instructions = /Android/i.test(ua) ? t('install.howAndroid') : /iPhone|iPad|iPod/i.test(ua) ? t('install.howIos') : t('install.howOther');

  const close = (dismissed: boolean) => {
    if (dismissed && auto) dismissInstall();
    onClose(dismissed);
  };

  const install = async () => {
    setBusy(true);
    const outcome = await promptInstall();
    setBusy(false);
    if (outcome === 'accepted') { setMessage(t('install.done')); close(false); return; }
    if (outcome === 'dismissed') { close(true); return; }
    setMessage(t('install.unavailable'));
  };

  return <dialog ref={ref} className="install-dialog" aria-labelledby={titleId} onCancel={event => { event.preventDefault(); close(true); }} onClose={() => close(true)}>
    <div className="install-card">
      <button type="button" className="icon-button install-close" aria-label={t('install.close')} onClick={() => close(true)}><X size={19} /></button>
      <span className="install-mark" aria-hidden="true"><Smartphone size={26} strokeWidth={1.6} /></span>
      <p className="install-kicker">{l({ bn: 'অ্যান্ড্রয়েড ফোনের জন্য', en: 'Made for your phone' })}</p>
      <h2 id={titleId}>{t('install.title')}</h2>
      <p className="install-text">{t('install.text')}</p>
      <ul className="install-benefits">
        <li><Check size={15} strokeWidth={2.6} aria-hidden="true" />{l({ bn: 'হোম স্ক্রিন থেকে এক চাপে খুলবে', en: 'One tap from the home screen' })}</li>
        <li><Check size={15} strokeWidth={2.6} aria-hidden="true" />{l({ bn: 'ধীর ইন্টারনেটেও দোকানের তথ্য দেখা যাবে', en: 'Shop details keep working on a weak signal' })}</li>
        <li><Check size={15} strokeWidth={2.6} aria-hidden="true" />{l({ bn: 'বিনামূল্যে ব্যবহার করুন, অ্যাকাউন্টের দরকার নেই', en: 'Free to use, no account needed' })}</li>
      </ul>
      <div className="install-actions">
        {canInstall && <button type="button" className="btn btn-primary" onClick={install} disabled={busy}><Download size={18} aria-hidden="true" />{t('install.cta')}</button>}
        <button type="button" className="btn btn-secondary" onClick={() => close(true)}>{t('install.later')}</button>
      </div>
      <div className="install-how" role="note">
        <p><Share2 size={15} aria-hidden="true" /><strong>{t('install.howTitle')}</strong></p>
        <p>{instructions}</p>
      </div>
      {message && <p className="install-message" role="status">{message}</p>}
    </div>
  </dialog>;
}

/** Appears once per fortnight, only when the browser is actually offering an install. */
export function InstallPrompt() {
  const { canInstall, installDismissed, isStandalone, dismissInstall } = usePwa();
  const { t, l } = useLanguage();
  const [open, setOpen] = useState(false);
  const [showOffer, setShowOffer] = useState(false);
  useEffect(() => {
    if (!canInstall || installDismissed || isStandalone) return;
    let later = 0;
    let done = false;
    const show = () => { if (!done && document.visibilityState === 'visible') { done = true; setShowOffer(true); } };
    /* Ask once the visitor has actually engaged, not the moment they arrive
       from Google Maps. Falling back to a single quiet offer after 40 seconds. */
    const first = window.setTimeout(() => {
      if (window.scrollY > 320 && document.visibilityState === 'visible') show();
      else later = window.setTimeout(show, 25000);
    }, 15000);
    return () => { window.clearTimeout(first); window.clearTimeout(later); };
  }, [canInstall, installDismissed, isStandalone]);
  if (!canInstall || installDismissed || isStandalone) return null;
  return <>
    {showOffer && !open && <aside className="install-offer" aria-label={t('install.title')}>
      <span>{l({ bn: 'বিনামূল্যে ফোনে রাখুন', en: 'Keep this free app on your phone' })}</span>
      <button type="button" className="btn btn-primary btn-compact" onClick={() => setOpen(true)}>{t('install.cta')}</button>
      <button type="button" className="icon-button" aria-label={t('install.close')} onClick={() => { dismissInstall(); setShowOffer(false); }}><X size={18} aria-hidden="true" /></button>
    </aside>}
    <InstallDialog open={open} auto onClose={() => { setOpen(false); setShowOffer(false); }} />
  </>;
}

/** A permanent, discreet entry point in the drawer and footer. */
export function InstallHelpButton({ className = '' }: { className?: string }) {
  const { t } = useLanguage();
  const { isStandalone } = usePwa();
  const [open, setOpen] = useState(false);
  if (isStandalone) return null;
  return <>
    <button type="button" className={`text-link install-help ${className}`} onClick={() => setOpen(true)}><Download size={17} aria-hidden="true" />{t('install.footer')}</button>
    <InstallDialog open={open} auto={false} onClose={() => setOpen(false)} />
  </>;
}
