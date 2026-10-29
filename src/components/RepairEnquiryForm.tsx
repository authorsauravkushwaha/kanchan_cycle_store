import { useId, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, Send, ShieldCheck } from 'lucide-react';
import { shop } from '../config/shop';
import { useLanguage } from '../i18n';
import type { TranslationKey } from '../i18n';
import { emptyRepair, localToday, normalizePhone, validateRepair } from '../lib/repair';
import type { RepairFields } from '../lib/repair';
import { track, whatsappHref } from '../lib/business';
import { Notice, RequiredMark, WhatsAppButton } from './UI';

export const sourceKeys = ['google', 'friend', 'passing', 'social', 'other'] as const;
export function SourceSelect({ id, value, onChange }: { id: string; value: string; onChange: (value: string) => void }) {
  const { t } = useLanguage();
  return <div className="field"><label htmlFor={id}>{t('form.source')} <span className="optional">{t('common.optional')}</span></label><select id={id} value={value} onChange={event => onChange(event.target.value)}><option value="">{t('common.select')}</option>{sourceKeys.map(source => <option key={source} value={source}>{t(`source.${source}`)}</option>)}</select></div>;
}
function Field({ label, id, error, required = false, children, className = '' }: { label: string; id: string; error?: TranslationKey; required?: boolean; children: ReactNode; className?: string }) {
  const { t } = useLanguage();
  return <div className={`field ${className} ${error ? 'field-invalid' : ''}`}><label htmlFor={id}>{label}{required && <RequiredMark />}</label>{children}{error && <p className="field-error" id={`${id}-error`}>{t(error)}</p>}</div>;
}
export function RepairEnquiryForm() {
  const { t, l, language } = useLanguage();
  const [params] = useSearchParams();
  const initialService = shop.services.some(service => service.id === params.get('service')) ? params.get('service')! : '';
  const [fields, setFields] = useState<RepairFields>({ ...emptyRepair, service: initialService });
  const [errors, setErrors] = useState<Partial<Record<keyof RepairFields, TranslationKey>>>({});
  const [result, setResult] = useState<{ message: string; href: string } | null>(null);
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const today = localToday();
  const update = (key: keyof RepairFields, value: string) => { setFields(previous => ({ ...previous, [key]: value })); setErrors(previous => ({ ...previous, [key]: undefined })); };
  const attrs = (key: keyof RepairFields) => ({ id: `${id}-${key}`, 'aria-invalid': Boolean(errors[key]), 'aria-describedby': errors[key] ? `${id}-${key}-error` : undefined, 'aria-required': true });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = validateRepair(fields, today);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) { requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()); return; }
    const service = shop.services.find(item => item.id === fields.service)!;
    const category = shop.categories.find(item => item.id === fields.bikeType);
    const lines = language === 'bn' ? [
      'নমস্কার, কাঞ্চন সাইকেল স্টোর্সে সাইকেল মেরামতের বিষয়ে জানতে চাই।',
      `নাম: ${fields.name.trim()}`, `যোগাযোগের নম্বর: ${normalizePhone(fields.phone)}`,
      `সাইকেলের ধরন: ${category ? l(category.name) : t('form.other')}`, `পরিষেবা: ${l(service.name)}`,
      `পছন্দের তারিখ: ${fields.date}`, `পছন্দের সময়: ${fields.time}`,
      fields.details.trim() ? `সমস্যার বিবরণ: ${fields.details.trim()}` : '',
      fields.source ? `আপনাদের কথা জেনেছি: ${t(`source.${fields.source}` as 'source.google')}` : '',
      'এই পরিষেবা পাওয়া যায় কি? খরচ ও সময় নিশ্চিত করে জানাবেন। এটি এখনও নিশ্চিত বুকিং নয়।',
    ] : [
      'Hello, I’d like to ask about a bicycle repair at Kanchan Cycle Stores.',
      `Name: ${fields.name.trim()}`, `Contact number: ${normalizePhone(fields.phone)}`,
      `Bicycle type: ${category ? l(category.name) : t('form.other')}`, `Service: ${l(service.name)}`,
      `Preferred date: ${fields.date}`, `Preferred time: ${fields.time}`,
      fields.details.trim() ? `Details: ${fields.details.trim()}` : '',
      fields.source ? `I heard about you through: ${t(`source.${fields.source}` as 'source.google')}` : '',
      'Is this service available? Please confirm the cost and a time. This is not yet a confirmed booking.',
    ];
    const message = lines.filter(Boolean).join('\n');
    const href = whatsappHref(message);
    if (!href) return;
    setResult({ message, href });
    track('repair_enquiry_submit', { serviceId: fields.service, placement: 'repair-form' });
    window.open(href, '_blank', 'noopener,noreferrer');
    requestAnimationFrame(() => successRef.current?.focus());
  };
  if (result) return <div className="form-success"><span className="success-icon"><Check size={32} aria-hidden="true" /></span><h3 ref={successRef} tabIndex={-1}>{t('form.successTitle')}</h3><p>{t('form.successText')}</p><Notice>{t('services.disclaimer')}</Notice><details className="message-preview"><summary>{t('form.preview')}</summary><pre>{result.message}</pre></details><p className="small-note">{t('form.popupNote')}</p><WhatsAppButton message={result.message} placement="repair-form-fallback">{t('action.openWhatsApp')}</WhatsAppButton><button className="btn btn-secondary" onClick={() => { setResult(null); requestAnimationFrame(() => formRef.current?.querySelector('input')?.focus()); }}><ArrowLeft size={17} aria-hidden="true" />{t('form.edit')}</button></div>;
  return <form ref={formRef} className="repair-form" onSubmit={submit} noValidate>
    {Object.values(errors).some(Boolean) && <p className="form-error-summary" role="alert">{t('form.errorSummary')}</p>}
    <div className="form-grid"><Field label={t('form.name')} id={`${id}-name`} error={errors.name} required><input {...attrs('name')} type="text" name="name" autoComplete="name" maxLength={100} required value={fields.name} onChange={event => update('name', event.target.value)} placeholder={t('form.namePlaceholder')} /></Field><Field label={t('form.phone')} id={`${id}-phone`} error={errors.phone} required><input {...attrs('phone')} type="tel" name="phone" autoComplete="tel" inputMode="tel" maxLength={22} required value={fields.phone} onChange={event => update('phone', event.target.value)} placeholder={t('form.phonePlaceholder')} /></Field>
      <Field label={t('form.bikeType')} id={`${id}-bikeType`} error={errors.bikeType} required><select {...attrs('bikeType')} name="bikeType" required value={fields.bikeType} onChange={event => update('bikeType', event.target.value)}><option value="">{t('common.select')}</option>{shop.categories.filter(c => c.id !== 'accessories').map(category => <option key={category.id} value={category.id}>{l(category.name)}</option>)}<option value="other">{t('form.other')}</option></select></Field>
      <Field label={t('form.service')} id={`${id}-service`} error={errors.service} required><select {...attrs('service')} name="service" required value={fields.service} onChange={event => update('service', event.target.value)}><option value="">{t('common.select')}</option>{shop.services.map(service => <option key={service.id} value={service.id}>{l(service.name)}</option>)}</select></Field>
      <Field label={t('form.date')} id={`${id}-date`} error={errors.date} required><input {...attrs('date')} type="date" name="date" min={today} required value={fields.date} onChange={event => update('date', event.target.value)} /></Field>
      <Field label={t('form.time')} id={`${id}-time`} error={errors.time} required><input {...attrs('time')} type="time" name="time" required value={fields.time} onChange={event => update('time', event.target.value)} /></Field>
      <Field label={`${t('form.details')} (${t('common.optional')})`} id={`${id}-details`} className="field-full"><textarea id={`${id}-details`} name="details" rows={4} maxLength={1000} value={fields.details} onChange={event => update('details', event.target.value)} placeholder={t('form.detailsPlaceholder')} /></Field>
      <div className="field-full"><SourceSelect id={`${id}-source`} value={fields.source} onChange={value => update('source', value)} /></div>
    </div><Notice>{t('services.disclaimer')}</Notice><button className="btn btn-primary form-submit" type="submit"><Send size={18} aria-hidden="true" />{t('form.submit')}</button><p className="form-privacy"><ShieldCheck size={16} aria-hidden="true" />{t('form.privacy')}</p>
  </form>;
}
