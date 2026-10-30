import { ArrowRight, Bike, Check, Info, MessagesSquare, Ruler, ScanEye, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import { shop, verifiedOffers } from '../config/shop';
import { useLanguage } from '../i18n';
import { SEO } from '../components/SEO';
import { BuyingGuide, FinalCTA, HeroSection, MaintenanceTips, ReviewSection } from '../components/HeroSection';
import { CategoryCard } from '../components/CategoryCard';
import { EmptyState, SectionHeading, ShopStrip, TextLink, WhatsAppButton } from '../components/UI';
import { ProductGrid } from '../components/ProductCard';
import { useCatalog } from '../inventory';
import { MapSection } from '../components/MapSection';

export default function Home() {
  const { t, l } = useLanguage();
  const { cycles } = useCatalog();
  const featured = cycles.filter(product => product.featured).slice(0, 4);
  const offers = verifiedOffers();
  const visitIcons = [ScanEye, MessagesSquare, Ruler, Wrench];
  return <>
    <SEO title={t('seo.home')} description="seo.homeDescription" />
    <HeroSection />
    <section className="section categories-section"><div className="container"><SectionHeading eyebrow={t('home.categories.eyebrow')} title={t('home.categories.title')} description={t('home.categories.description')}><TextLink to="/cycles">{t('action.viewCycles')}</TextLink></SectionHeading><div className="category-grid">{shop.categories.map((category, index) => <CategoryCard key={category.id} id={category.id} index={index} />)}</div><p className="category-note"><Info size={15} aria-hidden="true" />{t('home.categories.note')}</p></div></section>
    <section className="section featured-section"><div className="container"><SectionHeading eyebrow={t('home.featured.eyebrow')} title={t('home.featured.title')} description={t('home.featured.description')}><TextLink to="/cycles">{t('action.viewCycles')}</TextLink></SectionHeading>{featured.length ? <ProductGrid products={featured} /> : <EmptyState icon={Bike} title={t('catalog.emptyTitle')} description={t('catalog.emptyText')}><WhatsAppButton placement="home-featured" /><Link to="/recommendation" className="btn btn-secondary">{t('action.help')}<ArrowRight size={17} aria-hidden="true" /></Link></EmptyState>}</div></section>
    <section className="section shop-section" id="our-shop">
      <div className="container">
        <SectionHeading eyebrow={t('home.gallery.eyebrow')} title={t('home.gallery.title')} description={t('home.gallery.description')}><TextLink to="/about#our-shop">{t('home.gallery.link')}</TextLink></SectionHeading>
        <ShopStrip />
        <p className="category-note"><Info size={15} aria-hidden="true" />{t('home.gallery.note')}</p>
      </div>
    </section>
    <BuyingGuide />
    <section className="section home-repair"><div className="container home-repair-grid">
      <div className="repair-visual">
        <p className="eyebrow"><span />{t('home.services.eyebrow')}</p>
        <h2 className="repair-visual-title">{t('home.services.title')}</h2>
        <ul className="repair-facts">
          <li><span aria-hidden="true">01</span>{l({ bn: 'সমস্যার কথা জানান', en: 'Describe the problem' })}</li>
          <li><span aria-hidden="true">02</span>{l({ bn: 'খরচ ও সময় জেনে নিন', en: 'Ask about cost and timing' })}</li>
          <li><span aria-hidden="true">03</span>{l({ bn: 'সাইকেল দোকানে দেখান', en: 'Bring the cycle to the shop' })}</li>
        </ul>
        <span className="repair-badge">{l({ bn: 'নিজস্ব ওয়ার্কশপ', en: 'Our own workshop' })}<Wrench size={17} strokeWidth={1.6} aria-hidden="true" /></span>
      </div>
      <div className="home-repair-content">
        <SectionHeading title={t('services.askTitle')} description={t('home.services.description')} />
        <div className="home-service-topics">{shop.services.map(service => <Link key={service.id} to={`/services?service=${service.id}#repair-form`}><span className="service-topic-dot" />{l(service.name)}{service.confirmed && <Check size={13} aria-hidden="true" />}<ArrowRight size={14} aria-hidden="true" /></Link>)}</div>
        <p className="small-note">{t('services.notice')}</p>
        <div className="repair-actions"><WhatsAppButton message={l({ bn: 'নমস্কার, আমার সাইকেল মেরামত ও সার্ভিসিং সম্পর্কে জানতে চাই। কী সমস্যা হচ্ছে জানিয়ে পরামর্শ চাই।', en: 'Hello, I’d like to ask about bicycle repairs and servicing. I can describe the problem and would like some advice.' })} placement="home-repair">{t('action.repair')}</WhatsAppButton><TextLink to="/services">{t('nav.services')}</TextLink></div>
      </div>
    </div></section>
    {offers.length > 0 && <section className="section"><div className="container"><SectionHeading title={t('offers.current')} /><div className="offers-grid">{offers.map(offer => <article className="offer-card" key={offer.id}><h3>{l(offer.title)}</h3><p>{l(offer.description)}</p>{offer.validUntil && <small>{t('offers.validUntil', { date: offer.validUntil })}</small>}</article>)}</div></div></section>}
    {offers.length === 0 && <MaintenanceTips />}
    <section className="section visit-section"><div className="container"><SectionHeading eyebrow={t('home.visit.eyebrow')} title={t('home.visit.title')} description={t('home.visit.description')} /><div className="visit-grid">{visitIcons.map((Icon, index) => <div className="visit-item" key={index}><span className="visit-number" aria-hidden="true">0{index + 1}</span><Icon size={27} strokeWidth={1.4} aria-hidden="true" /><p>{t(`home.visit.${index + 1}` as 'home.visit.1')}</p></div>)}</div><p className="visit-note"><Check size={16} aria-hidden="true" />{t('home.visit.note')}</p></div></section>
    <MapSection />
    <ReviewSection />
    <FinalCTA />
  </>;
}
