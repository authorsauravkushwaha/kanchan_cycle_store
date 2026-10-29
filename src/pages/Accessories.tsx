import { Bell, Bike, Flashlight, LockKeyhole, ShieldCheck, Wind } from 'lucide-react';
import { photos, verifiedProducts } from '../config/shop';
import { useLanguage } from '../i18n';
import { SEO } from '../components/SEO';
import { EmptyState, PageHero, Photo, WhatsAppButton } from '../components/UI';
import { AccessoryCard } from '../components/ProductCard';
import { FinalCTA } from '../components/HeroSection';

export default function Accessories() {
  const { t, l } = useLanguage();
  const products = verifiedProducts('accessory');
  const topics = [{ key: 'helmet', icon: ShieldCheck }, { key: 'light', icon: Flashlight }, { key: 'lock', icon: LockKeyhole }, { key: 'bell', icon: Bell }, { key: 'pump', icon: Wind }, { key: 'other', icon: Bike }] as const;
  return <><SEO title={t('nav.accessories')} description="seo.accessoriesDescription" /><PageHero eyebrow={t('accessories.eyebrow')} title={t('accessories.title')} description={t('accessories.description')} /><section className="section"><div className="container accessories-layout"><div><div className="accessory-topics">{topics.map(({ key, icon: Icon }) => <WhatsAppButton key={key} variant="secondary" message={l({ bn: `নমস্কার, সাইকেলের ${t(`accessories.${key}`)} সম্পর্কে জানতে চাই। দোকানে পাওয়া যাচ্ছে কি? দাম ও বিস্তারিত জানাবেন?`, en: `Hello, I’d like to ask about bicycle ${t(`accessories.${key}`).toLowerCase()}. Are they available at the shop? Could you share the price and details?` })} placement={`accessory-${key}`}><Icon size={21} aria-hidden="true" />{t(`accessories.${key}`)}</WhatsAppButton>)}</div>{products.length ? <div className="product-grid">{products.map(product => <AccessoryCard key={product.id} product={product} />)}</div> : <EmptyState icon={Bike} title={t('accessories.emptyTitle')} description={t('accessories.emptyText')}><WhatsAppButton placement="accessories-empty" /></EmptyState>}</div><Photo image={photos.accessories} className="accessories-photo" sizes="(max-width: 760px) 90vw, 35vw" /></div></section><FinalCTA /></>;
}
