import { Check, MessageCircle, Send } from 'lucide-react';
import { confirmedServices, photos } from '../config/shop';
import { useLanguage } from '../i18n';
import { SEO } from '../components/SEO';
import { Notice, PageHero, Photo } from '../components/UI';
import { ServiceList } from '../components/RepairServiceCard';
import { RepairEnquiryForm } from '../components/RepairEnquiryForm';
import { FinalCTA } from '../components/HeroSection';
export default function Services() {
  const { t, l } = useLanguage();
  return <><SEO title={t('nav.services')} description="seo.servicesDescription" /><PageHero eyebrow={t('services.eyebrow')} title={t('services.title')} description={t('services.description')} /><section className="section services-section"><div className="container"><Notice>{t(confirmedServices().length ? 'services.confirmedNotice' : 'services.notice')}</Notice><ServiceList detailed /></div></section><section className="section repair-form-section" id="repair-form"><div className="container repair-form-layout"><div className="repair-form-intro"><p className="eyebrow"><span />{t('services.formEyebrow')}</p><h2>{t('services.formTitle')}</h2><p>{t('services.formDescription')}</p><ol className="repair-steps"><li><span><MessageCircle size={20} aria-hidden="true" /></span>{l({ bn: 'সাইকেলের সমস্যার কথা লিখুন', en: 'Tell us about the problem' })}</li><li><span><Send size={19} aria-hidden="true" /></span>{l({ bn: 'WhatsApp-এ বার্তাটি পাঠান', en: 'Send your message on WhatsApp' })}</li><li><span><Check size={20} aria-hidden="true" /></span>{l({ bn: 'দোকানের উত্তরে সময় নিশ্চিত করুন', en: 'Wait for the shop to confirm a time' })}</li></ol><Photo image={photos.repair} className="repair-form-photo" sizes="(max-width: 760px) 85vw, 30vw" /></div><div className="form-card"><RepairEnquiryForm /></div></div></section><FinalCTA /></>;
}
