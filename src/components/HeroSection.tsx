import { ArrowRight, ArrowUpRight, Bike, Check, MapPin, MessageCircle, Wallet, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import { shop } from '../config/shop';
import { useLanguage } from '../i18n';
import { DirectionsButton, ShopPhoto, TextLink, WhatsAppButton } from './UI';

export function HeroSection() {
  const { t, l } = useLanguage();
  const benefits = [{ icon: Bike }, { icon: Wallet }, { icon: Wrench }, { icon: MapPin }];
  return <>
    <section className="hero"><div className="container hero-grid">
      <div className="hero-content">
        <p className="eyebrow hero-eyebrow"><span />{t('hero.eyebrow')}</p>
        <h1><span>{t('hero.title1')}</span><span className="hero-highlight">{t('hero.title2')}<svg viewBox="0 0 500 15" preserveAspectRatio="none" aria-hidden="true"><path d="M4 10C125 2 332 3 496 7" /></svg></span></h1>
        <p className="hero-description">{t('hero.description')}</p>
        <div className="hero-actions"><WhatsAppButton placement="hero" /><DirectionsButton /></div>
        <p className="hero-note"><span><Check size={13} strokeWidth={2.5} aria-hidden="true" /></span>{t('hero.note')}</p>
        <ul className="hero-facts">
          <li><strong>{l({ bn: 'সাইকেল বিক্রি', en: 'Cycle sales' })}</strong><span>{l({ bn: 'নতুন সাইকেল, দোকানে দেখে', en: 'See new cycles in person' })}</span></li>
          <li><strong>{l({ bn: 'অ্যাক্সেসরিজ', en: 'Accessories' })}</strong><span>{l({ bn: 'প্রয়োজনীয় জিনিসপত্র', en: 'The everyday essentials' })}</span></li>
          <li><strong>{l({ bn: 'মেরামত ও সার্ভিসিং', en: 'Repair & servicing' })}</strong><span>{l({ bn: 'নিজস্ব ওয়ার্কশপে', en: 'In our own workshop' })}</span></li>
        </ul>
      </div>
      <div className="hero-visual">
        <ShopPhoto photo={shop.heroPhoto} priority className="hero-photo" sizes="(max-width: 760px) 92vw, 42vw" showCaption={false} />
        <div className="hero-photo-caption">
          <div><strong>{t('hero.photoTitle')}</strong><span>{t('hero.photoText')}</span></div>
          <Link to="/about#our-shop" className="hero-photo-link" aria-label={t('hero.photoLink')}><ArrowUpRight size={20} aria-hidden="true" /></Link>
        </div>
        <div className="hero-stamp" aria-hidden="true"><Bike size={28} strokeWidth={1.6} /><span>{t('hero.badge1')}<strong>{t('hero.badge2')}</strong></span></div>
      </div>
    </div></section>
    <section className="benefits" aria-label={l({ bn: 'দোকানে আপনার জন্য', en: 'Here for your next ride' })}><div className="container benefits-grid">{benefits.map(({ icon: Icon }, index) => <div className="benefit" key={index}><span className="benefit-icon"><Icon size={25} strokeWidth={1.5} aria-hidden="true" /></span><div><h2>{t(`benefit.${index + 1}.title` as 'benefit.1.title')}</h2><p>{t(`benefit.${index + 1}.text` as 'benefit.1.text')}</p></div></div>)}</div></section>
  </>;
}

export function BuyingGuide() {
  const { t } = useLanguage();
  const keys = ['age', 'height', 'use', 'budget', 'gear', 'terrain'] as const;
  return <section className="guide-section"><div className="container guide-panel"><div className="guide-copy"><p className="eyebrow eyebrow-light"><span />{t('home.guide.eyebrow')}</p><h2>{t('home.guide.title')}</h2><p>{t('home.guide.description')}</p><GuideLink /><small>{t('home.guide.note')}</small></div><ul className="guide-checklist">{keys.map(key => <li key={key}><span><Check size={16} strokeWidth={2} aria-hidden="true" /></span>{t(`home.guide.${key}`)}</li>)}</ul></div></section>;
}
function GuideLink() { const { t } = useLanguage(); return <Link to="/recommendation" className="btn btn-yellow">{t('action.help')}<ArrowRight size={18} aria-hidden="true" /></Link>; }

export function MaintenanceTips() {
  const { t, l } = useLanguage();
  const maintenanceMessage = l({ bn: 'নমস্কার, আমার সাইকেলের যত্ন ও সার্ভিসিং নিয়ে পরামর্শ চাই। কী কী দেখে রাখা উচিত জানাবেন?', en: 'Hello, I’d like advice on caring for and servicing my bicycle. What should I keep an eye on?' });
  return <section className="section maintenance-section"><div className="container">
    <div className="maintenance-heading"><div><p className="eyebrow"><span />{t('home.maintenance.eyebrow')}</p><h2>{t('home.maintenance.title')}</h2><p>{t('home.maintenance.description')}</p></div><WhatsAppButton variant="secondary" message={maintenanceMessage} placement="maintenance">{t('home.maintenance.cta')}</WhatsAppButton></div>
    <div className="maintenance-grid">{[1, 2, 3].map(index => <article className="maintenance-card" key={index}><span className="maintenance-number" aria-hidden="true">0{index}</span><h3>{t(`home.maintenance.${index}.title` as 'home.maintenance.1.title')}</h3><p>{t(`home.maintenance.${index}.text` as 'home.maintenance.1.text')}</p></article>)}</div>
  </div></section>;
}
export function FinalCTA() {
  const { t, l } = useLanguage();
  return <section className="final-cta-section"><div className="container"><div className="final-cta">
    <div><p className="eyebrow"><span />{t('home.cta.eyebrow')}</p><h2>{t('home.cta.title')}</h2><p>{t('home.cta.text')}</p><div className="cta-buttons"><WhatsAppButton placement="final-cta">{t('action.whatsappShort')}</WhatsAppButton><DirectionsButton /></div></div>
    <div className="cta-art" aria-hidden="true"><span className="cta-art-ring" /><span className="cta-art-ring cta-art-ring-inner" /><span className="cta-art-label">{l(shop.name)}</span><span className="cta-art-sub">{shop.contact.phoneDisplay}</span></div>
  </div></div></section>;
}

export function ReviewSection() {
  const { t, l } = useLanguage();
  const reviews = shop.reviews.filter(review => review.permissionConfirmed && /^https:\/\//.test(review.sourceUrl));
  return <section className="review-section"><div className="container">{reviews.length ? <div className="review-grid">{reviews.map(review => <figure className="review-card" key={review.id}><blockquote>{l(review.text)}</blockquote><figcaption><a href={review.sourceUrl} target="_blank" rel="noopener noreferrer">{review.author}<ArrowUpRight size={14} aria-hidden="true" /></a></figcaption></figure>)}</div> : <div className="review-invitation"><span className="review-icon"><MessageCircle size={25} strokeWidth={1.5} aria-hidden="true" /></span><div><h2>{t('home.reviews.title')}</h2><p>{t('home.reviews.text')}</p></div><TextLink to="/contact">{t('action.contact')}</TextLink></div>}</div></section>;
}
