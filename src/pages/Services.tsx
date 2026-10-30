import { Check, MessageCircle, Send, Wrench } from 'lucide-react';
import { confirmedServices, enquiryServices } from '../config/shop';
import { useLanguage } from '../i18n';
import { SEO } from '../components/SEO';
import { EmptyState, Notice, PageHero, WhatsAppButton } from '../components/UI';
import { ServiceList } from '../components/RepairServiceCard';
import { RepairEnquiryForm } from '../components/RepairEnquiryForm';
import { FinalCTA } from '../components/HeroSection';

export default function Services() {
  const { t, l } = useLanguage();
  const confirmed = confirmedServices();
  const enquiries = enquiryServices();
  return <>
    <SEO title={t('nav.services')} description="seo.servicesDescription" />
    <PageHero eyebrow={t('services.eyebrow')} title={t('services.title')} description={t('services.description')} />
    <section className="section services-section"><div className="container">
      <p className="eyebrow"><span />{t('services.confirmedTitle')}</p>
      {confirmed.length
        ? <ServiceList services={confirmed} detailed />
        : <EmptyState icon={Wrench} title={t('services.askTitle')} description={t('services.notice')}><WhatsAppButton placement="services-empty" /></EmptyState>}
      <Notice positive>{t('services.confirmedNotice')}</Notice>
      <div className="services-ask"><div className="services-ask-heading"><h2>{t('services.askTitle')}</h2><p>{t('services.notice')}</p></div><ServiceList services={enquiries} detailed /></div>
    </div></section>
    <section className="section repair-form-section" id="repair-form"><div className="container repair-form-layout">
      <div className="repair-form-intro"><p className="eyebrow"><span />{t('services.formEyebrow')}</p><h2>{t('services.formTitle')}</h2><p>{t('services.formDescription')}</p>
        <ol className="repair-steps"><li><span><MessageCircle size={20} aria-hidden="true" /></span>{l({ bn: 'সাইকেলের সমস্যার কথা লিখুন', en: 'Tell us about the problem' })}</li><li><span><Send size={19} aria-hidden="true" /></span>{l({ bn: 'WhatsApp-এ বার্তাটি পাঠান', en: 'Send your message on WhatsApp' })}</li><li><span><Check size={20} aria-hidden="true" /></span>{l({ bn: 'দোকানের উত্তরে সময় নিশ্চিত করুন', en: 'Wait for the shop to confirm a time' })}</li></ol>
        <div className="repair-intro-panel"><Wrench size={26} strokeWidth={1.4} aria-hidden="true" /><p>{l({ bn: 'কোন কাজ হবে, কত সময় লাগবে আর খরচ কত — এই তিনটিই আগে নিশ্চিত করে নিন।', en: 'Confirm three things first: what can be done, how long it takes and what it costs.' })}</p></div>
      </div>
      <div className="form-card"><RepairEnquiryForm /></div>
    </div></section>
    <FinalCTA />
  </>;
}
