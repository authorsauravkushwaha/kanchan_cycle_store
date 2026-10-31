import { useId, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowUpRight, Clock3, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import { addressLines, shop } from '../config/shop';
import { useLanguage } from '../i18n';
import { phoneHref, track, whatsappHref } from '../lib/business';
import { SEO } from '../components/SEO';
import { DirectionsButton, PageHero, WhatsAppButton } from '../components/UI';
import { SourceSelect } from '../components/RepairEnquiryForm';
import { MapSection } from '../components/MapSection';

function ContactForms() {
  const { t, l } = useLanguage();
  const [message, setMessage] = useState('');
  const [source, setSource] = useState('');
  const [error, setError] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const id = useId();
  const input = useRef<HTMLTextAreaElement>(null);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    // This is a local duplicate-submit guard, not server-side rate limiting.
    // The website has no form endpoint; sending is always a deliberate WhatsApp action.
    if (sent) return;
    if (message.length > 1000 || message.trim().length < 3 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(message)) { setError(true); input.current?.focus(); return; }
    const text = `${l({ bn: 'নমস্কার, কাঞ্চন সাইকেল স্টোর্সের সঙ্গে যোগাযোগ করছি।', en: 'Hello, I’m getting in touch with Kanchan Cycle Stores.' })}\n${message.trim()}${['google', 'friend', 'passing', 'social', 'other'].includes(source) ? `\n${t('form.source')} ${t(`source.${source}` as 'source.google')}` : ''}`;
    const href = whatsappHref(text);
    if (!href) { setError(true); input.current?.focus(); return; }
    setError(false); setSent(text); window.open(href, '_blank', 'noopener,noreferrer');
  };
  return <div className="contact-forms-grid"><div className="form-card"><h2>{t('contact.formTitle')}</h2><p className="muted">{t('common.whatsappNote')}</p><form onSubmit={submit} noValidate className="contact-message-form"><div className={`field ${error ? 'field-invalid' : ''}`}><label htmlFor={`${id}-message`}>{t('contact.formTitle')}</label><textarea ref={input} id={`${id}-message`} rows={5} maxLength={1000} required value={message} onChange={event => { setMessage(event.target.value); setError(false); setSent(null); }} placeholder={t('contact.formPlaceholder')} aria-invalid={error} aria-describedby={error ? `${id}-error` : undefined} />{error && <p id={`${id}-error`} className="field-error" role="alert">{t('contact.error')}</p>}</div><SourceSelect id={`${id}-source`} value={source} onChange={value => { setSource(value); setSent(null); }} /><button className="btn btn-primary" type="submit" disabled={Boolean(sent)}><Send size={18} aria-hidden="true" />{t('action.send')}</button>{sent && <div className="inline-success" role="status"><p>{t('contact.sent')}</p><WhatsAppButton variant="secondary" message={sent} placement="contact-form-fallback">{t('action.openWhatsApp')}</WhatsAppButton></div>}<p className="form-privacy">{t('form.privacy')}</p></form></div><aside className="source-card"><span className="source-icon"><MessageCircle size={28} strokeWidth={1.4} aria-hidden="true" /></span><h2>{t('source.title')}</h2><p>{t('source.description')}</p><ul>{['google', 'friend', 'passing', 'social', 'other'].map(key => <li key={key}><button className={source === key ? 'source-selected' : ''} aria-pressed={source === key} onClick={() => { setSource(source === key ? '' : key); setSent(null); }}>{t(`source.${key}` as 'source.google')}<ArrowUpRight size={16} aria-hidden="true" /></button></li>)}</ul>{source ? <WhatsAppButton variant="secondary" message={`${l({ bn: 'নমস্কার, আপনাদের দোকানের কথা জেনেছি', en: 'Hello, I heard about your shop through' })}: ${t(`source.${source}` as 'source.google')}`} placement="source-recorder">{t('action.send')}</WhatsAppButton> : <button className="btn btn-secondary" disabled>{t('action.send')}</button>}</aside></div>;
}
export default function Contact() {
  const { t, l, language } = useLanguage();
  return <><SEO title={t('nav.contact')} description="seo.contactDescription" /><PageHero eyebrow={t('contact.eyebrow')} title={t('contact.title')} description={t('contact.description')} /><section className="section contact-section"><div className="container"><div className="contact-cards"><article className="contact-card"><span className="contact-card-icon"><MessageCircle size={25} strokeWidth={1.6} aria-hidden="true" /></span><h2>{t('action.whatsappShort')}</h2><p>{t('contact.whatsappText')}</p><WhatsAppButton variant="text" placement="contact-card" /></article><article className="contact-card"><span className="contact-card-icon"><Phone size={24} strokeWidth={1.6} aria-hidden="true" /></span><h2>{t('common.phone')}</h2><p>{t('contact.callText')}</p><a className="contact-phone" href={phoneHref()} onClick={() => track('phone_click')}>{shop.contact.phoneDisplay}<ArrowUpRight size={17} aria-hidden="true" /></a></article><article className="contact-card"><span className="contact-card-icon"><MapPin size={25} strokeWidth={1.6} aria-hidden="true" /></span><h2>{t('contact.visitTitle')}</h2><address>{addressLines(language).join(', ')}</address><DirectionsButton variant="text" short /></article></div><div className="contact-hours"><Clock3 size={18} aria-hidden="true" /><strong>{t('common.hours')}:</strong><span>{l(shop.hours.display)}{!shop.hours.confirmed && <small className="hours-caveat">{l(shop.hours.caveat)}</small>}</span></div><ContactForms /></div></section><MapSection standalone /></>;
}
