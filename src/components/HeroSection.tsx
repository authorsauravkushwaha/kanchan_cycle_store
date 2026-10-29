import { ArrowUpRight, Bike, Check, MapPin, MessageCircle, Wallet, Wrench } from 'lucide-react';
import { photos, shop } from '../config/shop';
import { useLanguage } from '../i18n';
import { DirectionsButton, Photo, WhatsAppButton } from './UI';

export function HeroSection() {
  const { t, l } = useLanguage();
  const benefits = [{ icon: Bike }, { icon: Wallet }, { icon: Wrench }, { icon: MapPin }];
  return <>
    <section className="hero"><div className="container hero-grid">
      <div className="hero-content"><p className="eyebrow hero-eyebrow"><span />{t('hero.eyebrow')}</p>
        <h1><span>{t('hero.title1')}</span><span className="hero-highlight">{t('hero.title2')}<svg viewBox="0 0 500 15" preserveAspectRatio="none" aria-hidden="true"><path d="M4 10C125 2 332 3 496 7" /></svg></span></h1>
        <p className="hero-description">{t('hero.description')}</p>
        <div className="hero-actions"><WhatsAppButton placement="hero" /><DirectionsButton /></div>
        <p className="hero-note"><span><Check size={13} strokeWidth={2.5} aria-hidden="true" /></span>{t('hero.note')}</p>
      </div>
      <div className="hero-visual"><Photo image={photos.hero} priority className="hero-photo" sizes="(max-width: 760px) 92vw, 48vw">
        <div className="hero-photo-caption"><span className="hero-caption-line" /><div><strong>{t('hero.imageTitle')}</strong><span>{t('hero.imageText')}</span></div><ArrowUpRight size={25} aria-hidden="true" /></div>
      </Photo><div className="hero-stamp" aria-hidden="true"><Bike size={31} strokeWidth={1.6} /><span>{t('hero.badge1')}<strong>{t('hero.badge2')}</strong></span></div><span className="hero-visual-dot" aria-hidden="true" /></div>
    </div></section>
    <section className="benefits" aria-label={l({ bn: 'দোকানে আপনার জন্য', en: 'Here for your next ride' })}><div className="container benefits-grid">{benefits.map(({ icon: Icon }, index) => <div className="benefit" key={index}><span className="benefit-icon"><Icon size={25} strokeWidth={1.5} aria-hidden="true" /></span><div><h2>{t(`benefit.${index + 1}.title` as 'benefit.1.title')}</h2><p>{t(`benefit.${index + 1}.text` as 'benefit.1.text')}</p></div></div>)}</div></section>
  </>;
}
export function BuyingGuide() {
  const { t } = useLanguage();
  const keys = ['age', 'height', 'use', 'budget', 'gear', 'terrain'] as const;
  return <section className="guide-section"><div className="container guide-panel"><div className="guide-copy"><p className="eyebrow eyebrow-light"><span />{t('home.guide.eyebrow')}</p><h2>{t('home.guide.title')}</h2><p>{t('home.guide.description')}</p><GuideLink /><small>{t('home.guide.note')}</small></div><ul className="guide-checklist">{keys.map(key => <li key={key}><span><Check size={16} strokeWidth={2} aria-hidden="true" /></span>{t(`home.guide.${key}`)}</li>)}</ul><Bike className="guide-bike" strokeWidth={0.55} aria-hidden="true" /></div></section>;
}
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
function GuideLink() { const { t } = useLanguage(); return <Link to="/recommendation" className="btn btn-yellow">{t('action.help')}<ArrowRight size={18} aria-hidden="true" /></Link>; }

export function FinalCTA() {
  const { t } = useLanguage();
  return <section className="final-cta-section"><div className="container"><div className="final-cta"><div><p className="eyebrow"><span />{t('home.cta.eyebrow')}</p><h2>{t('home.cta.title')}</h2><p>{t('home.cta.text')}</p><div className="cta-buttons"><WhatsAppButton placement="final-cta">{t('action.whatsappShort')}</WhatsAppButton><DirectionsButton /></div></div><div className="cta-art" aria-hidden="true"><span className="cta-art-ring" /><Bike strokeWidth={0.85} /><span className="cta-art-label">{shop.name.bn}<ArrowUpRight size={20} /></span></div></div></div></section>;
}
export function ReviewSection() {
  const { t, l } = useLanguage();
  const reviews = shop.reviews.filter(review => review.permissionConfirmed && /^https:\/\//.test(review.sourceUrl));
  return <section className="review-section"><div className="container">{reviews.length ? <div className="review-grid">{reviews.map(review => <figure className="review-card" key={review.id}><blockquote>{l(review.text)}</blockquote><figcaption><a href={review.sourceUrl} target="_blank" rel="noopener noreferrer">{review.author}<ArrowUpRight size={14} aria-hidden="true" /></a></figcaption></figure>)}</div> : <div className="review-invitation"><span className="review-icon"><MessageCircle size={25} strokeWidth={1.5} aria-hidden="true" /></span><div><h2>{t('home.reviews.title')}</h2><p>{t('home.reviews.text')}</p></div><Link to="/contact" className="text-link">{t('action.contact')}<ArrowRight size={18} aria-hidden="true" /></Link></div>}</div></section>;
}
