import { ArrowRight, ArrowUpRight, Bike, Check, MapPin, MessageCircle, Phone, SearchX, Share2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { shop } from '../config/shop';
import { useLanguage } from '../i18n';
import { phoneHref, track, whatsappHref } from '../lib/business';
import type { AnalyticsEvent } from '../lib/business';

export function WhatsAppButton({ message, children, variant = 'primary', className = '', placement = 'general', event = 'whatsapp_click', productId, serviceId }: {
  message?: string; children?: ReactNode; variant?: 'primary' | 'secondary' | 'yellow' | 'text' | 'small'; className?: string;
  placement?: string; event?: AnalyticsEvent; productId?: string; serviceId?: string;
}) {
  const { t, l } = useLanguage();
  const href = whatsappHref(message || l({ bn: 'নমস্কার, আমি কাঞ্চন সাইকেল স্টোর্সের সাইকেল ও পরিষেবা সম্পর্কে জানতে চাই।', en: 'Hello, I’d like to know about the bicycles and services at Kanchan Cycle Stores.' }));
  if (!href) return null;
  return <a className={`btn btn-${variant} ${className}`} href={href} target="_blank" rel="noopener noreferrer" onClick={() => track(event, { placement, productId, serviceId })}>
    <MessageCircle size={19} aria-hidden="true" /><span>{children || t('action.whatsapp')}</span><span className="sr-only"> ({t('action.openWhatsApp')})</span>
  </a>;
}
export function DirectionsButton({ variant = 'secondary', short = false, className = '' }: { variant?: 'primary' | 'secondary' | 'text'; short?: boolean; className?: string }) {
  const { t } = useLanguage();
  return <a className={`btn btn-${variant} ${className}`} href={shop.directionsUrl} target="_blank" rel="noopener noreferrer" onClick={() => track('directions_click')}><MapPin size={18} aria-hidden="true" />{short ? t('action.directionsShort') : t('action.directions')}<ArrowUpRight className="btn-end-icon" size={16} aria-hidden="true" /></a>;
}
export function CallButton({ variant = 'secondary', short = false }: { variant?: 'primary' | 'secondary' | 'text'; short?: boolean }) {
  const { t } = useLanguage();
  return <a className={`btn btn-${variant}`} href={phoneHref()} onClick={() => track('phone_click')}><Phone size={18} aria-hidden="true" />{short ? t('action.callShort') : t('action.call')}</a>;
}
export function TextLink({ to, children, className = '' }: { to: string; children: ReactNode; className?: string }) {
  return <Link to={to} className={`text-link ${className}`}>{children}<ArrowRight size={18} aria-hidden="true" /></Link>;
}
export function SectionHeading({ eyebrow, title, description, children, className = '' }: { eyebrow?: string; title: string; description?: string; children?: ReactNode; className?: string }) {
  return <div className={`section-heading ${className}`}><div>{eyebrow && <p className="eyebrow"><span />{eyebrow}</p>}<h2>{title}</h2>{description && <p className="section-description">{description}</p>}</div>{children}</div>;
}
export function Logo({ light = false, onClick }: { light?: boolean; onClick?: () => void }) {
  const { l } = useLanguage();
  return <Link to="/" className={`logo ${light ? 'logo-light' : ''}`} onClick={onClick}>
    <span className="logo-mark"><Bike size={32} strokeWidth={1.6} aria-hidden="true" /></span>
    <span className="logo-wordmark"><span className="logo-bn">{shop.name.bn}</span><span className="logo-en">KANCHAN CYCLE STORES</span></span>
    <span className="sr-only"> — {l({ bn: 'হোম', en: 'Home' })}</span>
  </Link>;
}
export function PageHero({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children?: ReactNode }) {
  return <section className="page-hero"><div className="container"><p className="eyebrow"><span />{eyebrow}</p><h1>{title}</h1><p className="page-hero-description">{description}</p>{children}</div><div className="page-hero-wheel" aria-hidden="true"><span /><span /><span /></div></section>;
}
export function Breadcrumbs({ items }: { items: { label: string; to?: string }[] }) {
  const { t } = useLanguage();
  return <nav aria-label={t('nav.breadcrumb')} className="breadcrumbs"><ol><li><Link to="/">{t('nav.home')}</Link></li>{items.map((item, index) => <li key={index}><span aria-hidden="true">/</span>{item.to ? <Link to={item.to}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}</li>)}</ol></nav>;
}
export function EmptyState({ title, description, filtered = false, children, icon: Icon = SearchX }: { title: string; description: string; filtered?: boolean; children?: ReactNode; icon?: LucideIcon }) {
  const { t } = useLanguage();
  return <div className="empty-state"><span className="empty-icon"><Icon size={34} strokeWidth={1.4} aria-hidden="true" /></span><h3>{title}</h3><p>{description}</p><div className="empty-actions">{children}</div>{!filtered && <span className="empty-footnote"><Check size={14} aria-hidden="true" />{t('catalog.verifiedOnly')}</span>}</div>;
}
export function Notice({ children, positive = false }: { children: ReactNode; positive?: boolean }) {
  return <p className={`notice ${positive ? 'notice-positive' : ''}`}><span className="notice-icon" aria-hidden="true">{positive ? <Check size={16} /> : 'i'}</span><span>{children}</span></p>;
}
export function RequiredMark() { const { t } = useLanguage(); return <span className="required-mark" aria-label={t('common.required')}>*</span>; }

/**
 * Word of mouth is the strongest channel for a neighbourhood shop. Uses the
 * Android share sheet where available and falls back to copying the link.
 */
export function ShareButton({ className = '', label }: { className?: string; label?: string }) {
  const { t, l } = useLanguage();
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const share = async () => {
    const url = shop.websiteUrl || window.location.origin;
    const text = l({
      bn: 'কোলাঘাটে কাঞ্চন সাইকেল স্টোর্স — সাইকেল ও মেরামত।',
      en: 'Kanchan Cycle Stores in Kolaghat — cycles and repairs.',
    });
    try {
      if (navigator.share) {
        await navigator.share({ title: l(shop.name), text, url });
        track('source_shared', { placement: 'share-sheet' });
        return;
      }
      await navigator.clipboard.writeText(`${text} ${url}`);
      setStatus('copied');
      track('source_shared', { placement: 'copy-link' });
    } catch (error) {
      if ((error as Error)?.name === 'AbortError') return;
      setStatus('failed');
    }
  };
  return <div className={`share-control ${className}`}>
    <button type="button" className="text-link share-button" onClick={share}><Share2 size={17} aria-hidden="true" />{label || t('share.action')}</button>
    <span className="share-status" role="status" aria-live="polite">{status === 'copied' ? t('share.copied') : status === 'failed' ? t('share.failed') : ''}</span>
  </div>;
}
