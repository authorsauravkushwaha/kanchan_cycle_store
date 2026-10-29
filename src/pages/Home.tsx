import { ArrowRight, Bike, Check, Ruler, ScanEye, MessagesSquare, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import { photos, shop, verifiedOffers, verifiedProducts } from '../config/shop';
import { useLanguage } from '../i18n';
import { SEO } from '../components/SEO';
import { BuyingGuide, FinalCTA, HeroSection, ReviewSection } from '../components/HeroSection';
import { CategoryCard } from '../components/CategoryCard';
import { EmptyState, Photo, SectionHeading, TextLink, WhatsAppButton } from '../components/UI';
import { ProductGrid } from '../components/ProductCard';
import { MapSection } from '../components/MapSection';

export default function Home() {
  const { t, l } = useLanguage();
  const products = verifiedProducts('cycle');
  const featured = products.filter(product => product.featured).slice(0, 4);
  const offers = verifiedOffers();
  const visitIcons = [ScanEye, MessagesSquare, Ruler, Wrench];
  return <>
    <SEO title={t('seo.home')} description="seo.homeDescription" />
    <HeroSection />
    <section className="section categories-section"><div className="container"><SectionHeading eyebrow={t('home.categories.eyebrow')} title={t('home.categories.title')} description={t('home.categories.description')}><TextLink to="/cycles">{t('action.viewCycles')}</TextLink></SectionHeading><div className="category-grid">{shop.categories.map((category, index) => <CategoryCard key={category.id} id={category.id} index={index} />)}</div><p className="category-note"><span aria-hidden="true">ⓘ</span>{t('home.categories.note')}</p></div></section>
    <section className="section featured-section"><div className="container"><SectionHeading eyebrow={t('home.featured.eyebrow')} title={t('home.featured.title')} description={t('home.featured.description')}><TextLink to="/cycles">{t('action.viewCycles')}</TextLink></SectionHeading>{featured.length ? <ProductGrid products={featured} /> : <EmptyState icon={Bike} title={t('catalog.emptyTitle')} description={t('catalog.emptyText')}><WhatsAppButton placement="home-featured" /><Link to="/recommendation" className="btn btn-secondary">{t('action.help')}<ArrowRight size={17} aria-hidden="true" /></Link></EmptyState>}</div></section>
    <BuyingGuide />
    <section className="section home-repair"><div className="container home-repair-grid"><div className="repair-visual"><Photo image={photos.repair} sizes="(max-width: 760px) 90vw, 40vw" /><span className="repair-image-label"><Wrench size={20} strokeWidth={1.5} aria-hidden="true" />{l({ bn: 'যত্নে থাকুক আপনার সঙ্গী', en: 'A little care goes a long way' })}</span></div><div className="home-repair-content"><SectionHeading eyebrow={t('home.services.eyebrow')} title={t('home.services.title')} description={t('home.services.description')} /><div className="home-service-topics">{shop.services.map(service => <Link key={service.id} to={`/services?service=${service.id}#repair-form`}><span className="service-topic-dot" />{l(service.name)}<ArrowRight size={14} aria-hidden="true" /></Link>)}</div><p className="small-note">{t('common.serviceUnconfirmed')}</p><div className="repair-actions"><WhatsAppButton message={l({ bn: 'নমস্কার, আমার সাইকেল মেরামত ও সার্ভিসিং সম্পর্কে জানতে চাই। দোকানে কোন পরিষেবা পাওয়া যাচ্ছে জানাবেন?', en: 'Hello, I’d like to ask about bicycle repairs and servicing. Which services are available at the shop?' })} placement="home-repair">{t('action.repair')}</WhatsAppButton><TextLink to="/services">{t('nav.services')}</TextLink></div></div></div></section>
    {offers.length > 0 && <section className="section"><div className="container"><SectionHeading title={t('offers.current')} /><div className="offers-grid">{offers.map(offer => <article className="offer-card" key={offer.id}><h3>{l(offer.title)}</h3><p>{l(offer.description)}</p>{offer.validUntil && <small>{t('offers.validUntil', { date: offer.validUntil })}</small>}</article>)}</div></div></section>}
    <section className="section visit-section"><div className="container"><SectionHeading eyebrow={t('home.visit.eyebrow')} title={t('home.visit.title')} description={t('home.visit.description')} />{shop.shopPhotos.length > 0 && <Photo image={shop.shopPhotos[0]} className="actual-shop-photo" />}<div className="visit-grid">{visitIcons.map((Icon, index) => <div className="visit-item" key={index}><span className="visit-number" aria-hidden="true">0{index + 1}</span><Icon size={27} strokeWidth={1.4} aria-hidden="true" /><p>{t(`home.visit.${index + 1}` as 'home.visit.1')}</p></div>)}</div><p className="visit-note"><Check size={16} aria-hidden="true" />{t('home.visit.note')}</p></div></section>
    <MapSection />
    <ReviewSection />
    <FinalCTA />
  </>;
}
