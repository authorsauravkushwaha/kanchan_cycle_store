import { ArrowRight, Bike, Check, MapPin, MessageCircle, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import { asset, shop } from '../config/shop';
import { useLanguage } from '../i18n';
import { CallButton, DirectionsButton, TextLink, WhatsAppButton } from './UI';

export function HeroSection() {
  const { t, l } = useLanguage();
  const benefits = [{ icon: Bike }, { icon: MapPin }, { icon: Wrench }];
  return <>
    <section className="hero-immersive" aria-labelledby="hero-title">
      <img className="hero-background" src={asset(shop.heroPhoto.src)} alt={l(shop.heroPhoto.alt)} width={shop.heroPhoto.width} height={shop.heroPhoto.height} fetchPriority="high" decoding="async" />
      <div className="hero-shade" aria-hidden="true" />
      <div className="container hero-stage">
        <div className="hero-content hero-glass-panel" data-reveal>
          <p className="eyebrow hero-eyebrow"><span />{t('hero.eyebrow')}</p>
          <h1 id="hero-title">{t('hero.title1')}</h1>
          <p className="hero-description">{t('hero.description')}</p>
          <div className="hero-actions"><WhatsAppButton placement="hero" /><DirectionsButton /></div>
          <p className="hero-note"><span><Check size={13} strokeWidth={2.5} aria-hidden="true" /></span>{t('hero.note')}</p>
        </div>
        <div className="hero-floating-card" data-reveal aria-label={l({ bn: 'দোকানের পরিষেবা', en: 'At the shop' })}>
          <div className="hero-card-heading"><span className="hero-live-dot" /><span>{l({ bn: 'আপনার কাছের সাইকেল স্টোর', en: 'YOUR LOCAL CYCLE STORE' })}</span></div>
          <ul>{benefits.map(({ icon: Icon }, index) => <li key={index}><Icon size={17} aria-hidden="true" /><span>{l([
            { bn: 'সাইকেল বিক্রি', en: 'Bicycle sales' },
            { bn: 'অ্যাক্সেসরিজ', en: 'Accessories' },
            { bn: 'মেরামত ও সার্ভিসিং', en: 'Repair & servicing' },
          ][index])}</span></li>)}</ul>
          <Link to="/about" className="hero-card-link">{l({ bn: 'দোকান সম্পর্কে', en: 'About the store' })}<ArrowRight size={15} aria-hidden="true" /></Link>
        </div>
        <span className="hero-scroll-cue" aria-hidden="true"><span />{l({ bn: 'নিচে দেখুন', en: 'SCROLL TO EXPLORE' })}</span>
      </div>
    </section>
    <section className="benefits benefits-glass" aria-label={l({ bn: 'দোকানে আপনার জন্য', en: 'Here for your next ride' })}><div className="container benefits-grid">{benefits.map(({ icon: Icon }, index) => <div className="benefit" key={index}><span className="benefit-icon"><Icon size={23} strokeWidth={1.5} aria-hidden="true" /></span><div><h2>{l([
      { bn: 'পছন্দমতো সাইকেল', en: 'A ride that feels like you' },
      { bn: 'অ্যাক্সেসরিজের খোঁজ', en: 'Accessories for the ride' },
      { bn: 'মেরামত নিয়ে কথা বলুন', en: 'Ask about a repair' },
    ][index])}</h2><p>{l([
      { bn: 'আপনার প্রয়োজনের কথা জানান', en: 'Tell us what you are looking for' },
      { bn: 'দোকানে উপলব্ধতা জেনে নিন', en: 'Ask what is available in store' },
      { bn: 'পরিষেবা সম্পর্কে জেনে নিন', en: 'Ask what help is available' },
    ][index])}</p></div></div>)}</div></section>
  </>;
}

export function BuyingGuide() {
  const { t } = useLanguage();
  const keys = ['age', 'height', 'use', 'budget', 'gear', 'terrain'] as const;
  return <section className="guide-section"><div className="container guide-panel" data-reveal><div className="guide-copy"><p className="eyebrow eyebrow-light"><span />{t('home.guide.eyebrow')}</p><h2>{t('home.guide.title')}</h2><p>{t('home.guide.description')}</p><GuideLink /><small>{t('home.guide.note')}</small></div><ul className="guide-checklist">{keys.map(key => <li key={key}><span><Check size={16} strokeWidth={2} aria-hidden="true" /></span>{t(`home.guide.${key}`)}</li>)}</ul></div></section>;
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
  return <section className="final-cta-section"><div className="container"><div className="final-cta" data-reveal>
    <div><p className="eyebrow"><span />{t('home.cta.eyebrow')}</p><h2>{t('home.cta.title')}</h2><p>{t('home.cta.text')}</p><div className="cta-buttons"><WhatsAppButton placement="final-cta">{t('action.whatsappShort')}</WhatsAppButton><CallButton /><DirectionsButton /></div></div>
    <div className="cta-art" aria-hidden="true"><span className="cta-art-ring" /><span className="cta-art-ring cta-art-ring-inner" /><Bike size={68} strokeWidth={1.1} /><span className="cta-art-label">{l(shop.name)}</span><span className="cta-art-sub">{shop.contact.phoneDisplay}</span></div>
  </div></div></section>;
}

export function ReviewSection() {
  const { t, l } = useLanguage();
  const reviews = shop.reviews.filter(review => review.permissionConfirmed && /^https:\/\//.test(review.sourceUrl));
  return <section className="review-section"><div className="container">{reviews.length ? <div className="review-grid">{reviews.map(review => <figure className="review-card" key={review.id}><blockquote>{l(review.text)}</blockquote><figcaption><a href={review.sourceUrl} target="_blank" rel="noopener noreferrer">{review.author}<ArrowRight size={14} aria-hidden="true" /></a></figcaption></figure>)}</div> : <div className="review-invitation" data-reveal><span className="review-icon"><MessageCircle size={25} strokeWidth={1.5} aria-hidden="true" /></span><div><h2>{t('home.reviews.title')}</h2><p>{t('home.reviews.text')}</p></div><TextLink to="/contact">{t('action.contact')}</TextLink></div>}</div></section>;
}
