import { lazy, Suspense } from 'react';
import { ArrowDown, ArrowRight, Bike, Check, MessageCircle, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import { asset, productPhotos, shop } from '../config/shop';
import { suppliedCycles } from '../config/cycles';
import { useLanguage } from '../i18n';
import { CallButton, DirectionsButton, TextLink, WhatsAppButton } from './UI';
const CycleScene = lazy(() => import('./CycleScene').then(module => ({ default: module.CycleScene })));

export function HeroSection() {
  const { t, l } = useLanguage();
  const benefits = [{ icon: Bike }, { icon: Wrench }];
  return <>
    <section className="hero-neu" aria-labelledby="hero-title" data-scroll-scene="hero">
      <div className="hero-backdrop">
        <picture><source media="(max-width: 760px) and (min-height: 521px)" srcSet={asset('/images/kanchan-team-hero-mobile.webp')} /><source media="(min-width: 761px)" type="image/webp" srcSet={asset('/images/kanchan-team-hero.webp')} /><img className="hero-backdrop-image" src={asset(shop.heroPhoto.src)} alt={l(shop.heroPhoto.alt)} width={shop.heroPhoto.width} height={shop.heroPhoto.height} fetchPriority="high" decoding="async" /></picture>
        <span className="hero-backdrop-scrim" aria-hidden="true" />
      </div>
      <div className="container hero-neu-grid">
        <div className="hero-copy">
          <p className="eyebrow hero-eyebrow"><span className="location-dot" />{t('hero.eyebrow')}</p>
          <h1 id="hero-title">{t('hero.title1')}</h1>
          <p className="hero-description">{t('hero.description')}</p>
          <div className="hero-actions"><Link to="/cycles" className="btn btn-yellow hero-explore">{t('action.viewCycles')}<ArrowRight size={18} aria-hidden="true" /></Link><DirectionsButton className="hero-ghost" /></div>
          <p className="hero-note"><span><Check size={13} strokeWidth={2.5} aria-hidden="true" /></span>{t('hero.note')}</p>
          <p className="hero-badge">{t('hero.badge1')} {t('hero.badge2')}</p>
          <a href="#about-store" className="hero-scroll-cue"><span className="scroll-cue-icon"><ArrowDown size={16} aria-hidden="true" /></span>{l({ bn: 'স্ক্রল করুন। নতুন পথ দেখুন।', en: 'A little scroll. A new perspective.' })}</a>
        </div>
      </div>
      <div className="container hero-bottom-line"><span>{l({ bn: 'ছোট্ট দোকান। অনেকটা পথ।', en: 'A LOCAL SHOP. A WORLD OF POSSIBILITIES.' })}</span><span aria-hidden="true">{l({ bn: 'কোলাঘাট · পশ্চিমবঙ্গ', en: 'KOLAGHAT · WEST BENGAL' })}<span className="tiny-cross">+</span></span></div>
    </section>
    <section className="benefits benefits-neu" aria-label={l({ bn: 'দোকানে আপনার জন্য', en: 'Here for your next ride' })}><div className="container benefits-grid">{benefits.map(({ icon: Icon }, index) => <div className="benefit" key={index} data-reveal><span className="benefit-icon"><Icon size={25} strokeWidth={1.5} aria-hidden="true" /></span><div><h2>{l([
      { bn: 'পছন্দমতো সাইকেল', en: 'A ride that feels like you' },
      { bn: 'মেরামত নিয়ে কথা বলুন', en: 'Care for every kilometre' },
    ][index])}</h2><p>{l([
      { bn: 'আপনার প্রয়োজনের কথা জানান', en: 'Tell us what you are looking for' },
      { bn: 'পরিষেবা সম্পর্কে জেনে নিন', en: 'Ask what help is available' },
    ][index])}</p></div><span className="benefit-index" aria-hidden="true">0{index + 1}</span></div>)}</div></section>
  </>;
}

/** The premium electric cycle photographed for the shop — shown on the home stage. */
export function RideShowcase() {
  const { t, l } = useLanguage();
  const showcase = suppliedCycles.find(product => product.category === 'electric' && product.featured);
  const photos = showcase ? productPhotos(showcase) : [];
  return <section className="section ride-showcase" aria-labelledby="ride-title" data-scroll-scene="ride">
    <div className="container ride-showcase-grid">
      <div className="ride-showcase-copy" data-reveal>
        <p className="eyebrow"><span />{l({ bn: 'সাইকেলটি দেখে নিন', en: 'A CLOSER LOOK AT THE RIDE' })}</p>
        <h2 id="ride-title">{l({ bn: 'পছন্দের সাইকেলটি দেখুন', en: 'A closer look at the ride' })}</h2>
        <p>{l({
          bn: 'স্ট্রাইডার ইলেকট্রিক সাইকেলের ছবিটি দেখুন। রেঞ্জ, গতি, দাম ও স্টক দোকানে জানতে হবে।',
          en: 'Explore the photograph of the Stryder electric cycle. Range, speed, price and stock — ask at the shop.',
        })}</p>
        <Link to="/cycles" className="btn btn-secondary">{t('action.viewCycles')}<ArrowRight size={17} aria-hidden="true" /></Link>
      </div>
      <Suspense fallback={<div className="cycle-scene" aria-hidden="true"><div className="scene-orbit" /><div className="scene-platform" /></div>}><CycleScene photos={photos} edition={{ bn: 'ইলেকট্রিক রাইড', en: 'THE ELECTRIC RIDE' }} /></Suspense>
    </div>
  </section>;
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
