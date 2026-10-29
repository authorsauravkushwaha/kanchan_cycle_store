import { useState } from 'react';
import { Check, ShieldCheck } from 'lucide-react';
import { shop } from '../config/shop';
import { useLanguage } from '../i18n';
import { analyticsConsent } from '../lib/business';
import { SEO } from '../components/SEO';
import { CallButton, PageHero } from '../components/UI';
export default function Privacy() {
  const { t } = useLanguage();
  const [consentSaved, setConsentSaved] = useState(false);
  const sections = [{ title: 'privacy.formsTitle', text: 'privacy.formsText' }, { title: 'privacy.storageTitle', text: 'privacy.storageText' }, { title: 'privacy.externalTitle', text: 'privacy.externalText' }, { title: 'privacy.analyticsTitle', text: shop.analytics.endpoint ? 'privacy.analyticsOn' : 'privacy.analyticsOff' }, { title: 'privacy.contactTitle', text: 'privacy.contactText' }] as const;
  return <><SEO title={t('privacy.title')} description="seo.privacyDescription" /><PageHero eyebrow={t('privacy.eyebrow')} title={t('privacy.title')} description={t('privacy.updated')} /><section className="section privacy-section"><div className="container privacy-content"><p className="privacy-intro"><ShieldCheck size={26} strokeWidth={1.5} aria-hidden="true" />{t('privacy.intro')}</p>{sections.map((section, index) => <section key={section.title}><h2><span aria-hidden="true">0{index + 1}</span>{t(section.title)}</h2><p>{t(section.text)}</p>{section.title === 'privacy.analyticsTitle' && shop.analytics.endpoint && <div className="empty-actions"><button className="btn btn-primary" onClick={() => { analyticsConsent('granted'); setConsentSaved(true); }}>{t('privacy.consentAllow')}</button><button className="btn btn-secondary" onClick={() => { analyticsConsent('denied'); setConsentSaved(true); }}>{t('privacy.consentDeny')}</button></div>}{section.title === 'privacy.contactTitle' && <CallButton variant="text" />}</section>)}{consentSaved && <p className="inline-success" role="status"><Check size={17} aria-hidden="true" />{t('privacy.consentSaved')}</p>}</div></section></>;
}
