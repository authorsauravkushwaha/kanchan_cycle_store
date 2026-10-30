import { ArrowRight, Bike, Check, Info, MessagesSquare, Ruler, ScanEye, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import { shop, verifiedOffers } from '../config/shop';
import { useLanguage } from '../i18n';
import { SEO } from '../components/SEO';
import { BuyingGuide, FinalCTA, HeroSection, MaintenanceTips, ReviewSection } from '../components/HeroSection';
import { CategoryCard } from '../components/CategoryCard';
import { EmptyState, SectionHeading, TextLink, WhatsAppButton } from '../components/UI';
import { ProductGrid } from '../components/ProductCard';
import { useCatalog } from '../inventory';
import { MapSection } from '../components/MapSection';

export default function Home() {
  const { t, l } = useLanguage();
  const { cycles } = useCatalog();
  const featured = cycles.filter(product => product.featured).slice(0, 4);
  const offers = verifiedOffers();
  const visitIcons = [ScanEye, MessagesSquare, Ruler, Wrench];
  const offeringIcons = [Bike, Check, Wrench];
  const offeringCopy = [
    { bn: 'সাইকেল বিক্রি', en: 'Bicycle sales' },
    { bn: 'অ্যাক্সেসরিজ', en: 'Bicycle accessories' },
    { bn: 'মেরামত ও সার্ভিসিং', en: 'Repair and servicing' },
  ];
  return <>
    <SEO title={t('seo.home')} description="seo.homeDescription" />
    <HeroSection />
    <section className="section home-about-section" id="about-store">
      <div className="container home-about-grid">
        <div className="home-about-copy" data-reveal>
          <SectionHeading eyebrow={l({ bn: 'কাঞ্চন সাইকেল স্টোর্স', en: 'KANCHAN CYCLE STORES' })} title={l({ bn: 'আপনার কাছের সাইকেল স্টোর', en: 'Your neighbourhood cycle store' })} description={l({ bn: 'সাইকেল, অ্যাক্সেসরিজ এবং মেরামত পরিষেবার জন্য কোলাঘাটে আপনার স্থানীয় ঠিকানা। কী পাওয়া যাচ্ছে, দাম ও স্টক—দোকানে সরাসরি জেনে নিন।', en: 'Your local destination in Kolaghat for bicycles, accessories and repair services. Ask the shop directly about current options, prices and stock.' })} />
          <TextLink to="/about">{l({ bn: 'আমাদের সম্পর্কে জানুন', en: 'More about the store' })}</TextLink>
        </div>
        <div className="home-offering-panel glass-panel" aria-label={l({ bn: 'দোকানের পরিষেবা', en: 'What the shop offers' })} data-reveal>
          {offeringCopy.map((item, index) => {
            const Icon = offeringIcons[index];
            return <div className="home-offering" key={item.en}><span className="home-offering-icon"><Icon size={21} strokeWidth={1.6} aria-hidden="true" /></span><div><strong>{l(item)}</strong><span>{l([{ bn: 'আপনার প্রয়োজন ও বাজেটের কথা বলুন', en: 'Tell us what you need and your budget' }, { bn: 'উপলব্ধতা দোকানে জেনে নিন', en: 'Ask the shop about availability' }, { bn: 'সমস্যার কথা জানিয়ে পরামর্শ নিন', en: 'Describe the issue and ask for advice' }][index])}</span></div><ArrowRight size={16} aria-hidden="true" /></div>;
          })}
        </div>
      </div>
    </section>
    <section className="section categories-section"><div className="container"><SectionHeading eyebrow={t('home.categories.eyebrow')} title={t('home.categories.title')} description={t('home.categories.description')}><TextLink to="/cycles">{t('action.viewCycles')}</TextLink></SectionHeading><div className="category-grid">{shop.categories.map((category, index) => <CategoryCard key={category.id} id={category.id} index={index} />)}</div><p className="category-note"><Info size={15} aria-hidden="true" />{t('home.categories.note')}</p></div></section>
    <section className="section featured-section"><div className="container"><SectionHeading eyebrow={t('home.featured.eyebrow')} title={t('home.featured.title')} description={t('home.featured.description')}><TextLink to="/cycles">{t('action.viewCycles')}</TextLink></SectionHeading>{featured.length ? <ProductGrid products={featured} /> : <EmptyState icon={Bike} title={t('catalog.emptyTitle')} description={t('catalog.emptyText')}><WhatsAppButton placement="home-featured" /><Link to="/recommendation" className="btn btn-secondary">{t('action.help')}<ArrowRight size={17} aria-hidden="true" /></Link></EmptyState>}</div></section>
    <BuyingGuide />
    <section className="section home-repair"><div className="container home-repair-grid">
      <div className="repair-visual" data-reveal>
        <p className="eyebrow"><span />{t('home.services.eyebrow')}</p>
        <h2 className="repair-visual-title">{t('home.services.title')}</h2>
        <ul className="repair-facts">
          <li><span aria-hidden="true">01</span>{l({ bn: 'সমস্যার কথা জানান', en: 'Describe the problem' })}</li>
          <li><span aria-hidden="true">02</span>{l({ bn: 'খরচ ও সময় জেনে নিন', en: 'Ask about cost and timing' })}</li>
          <li><span aria-hidden="true">03</span>{l({ bn: 'সাইকেল দোকানে দেখান', en: 'Bring the cycle to the shop' })}</li>
        </ul>
        <span className="repair-badge">{l({ bn: 'মেরামত ও সার্ভিসিং', en: 'Repair & servicing' })}<Wrench size={17} strokeWidth={1.6} aria-hidden="true" /></span>
      </div>
      <div className="home-repair-content">
        <SectionHeading title={t('services.askTitle')} description={t('home.services.description')} />
        <div className="home-service-topics">{shop.services.filter(service => service.confirmed).map(service => <Link key={service.id} to={`/services?service=${service.id}#repair-form`}><span className="service-topic-dot" />{l(service.name)}<Check size={13} aria-hidden="true" /><ArrowRight size={14} aria-hidden="true" /></Link>)}</div>
        <p className="small-note">{t('services.confirmedNotice')}</p>
        <div className="repair-actions"><WhatsAppButton message={l({ bn: 'নমস্কার, আমার সাইকেল মেরামত ও সার্ভিসিং সম্পর্কে জানতে চাই। কী সমস্যা হচ্ছে জানিয়ে পরামর্শ চাই।', en: 'Hello, I’d like to ask about bicycle repairs and servicing. I can describe the problem and would like some advice.' })} placement="home-repair">{t('action.repair')}</WhatsAppButton><TextLink to="/services">{t('nav.services')}</TextLink></div>
      </div>
    </div></section>
    {offers.length > 0 && <section className="section"><div className="container"><SectionHeading title={t('offers.current')} /><div className="offers-grid">{offers.map(offer => <article className="offer-card" key={offer.id}><h3>{l(offer.title)}</h3><p>{l(offer.description)}</p>{offer.validUntil && <small>{t('offers.validUntil', { date: offer.validUntil })}</small>}</article>)}</div></div></section>}
    {offers.length === 0 && <MaintenanceTips />}
    <section className="section visit-section"><div className="container"><SectionHeading eyebrow={t('home.visit.eyebrow')} title={t('home.visit.title')} description={t('home.visit.description')} /><div className="visit-grid">{visitIcons.map((Icon, index) => <div className="visit-item" key={index} data-reveal><span className="visit-number" aria-hidden="true">0{index + 1}</span><Icon size={27} strokeWidth={1.4} aria-hidden="true" /><p>{t(`home.visit.${index + 1}` as 'home.visit.1')}</p></div>)}</div><p className="visit-note"><Check size={16} aria-hidden="true" />{t('home.visit.note')}</p></div></section>
    <MapSection />
    <ReviewSection />
    <FinalCTA />
  </>;
}
