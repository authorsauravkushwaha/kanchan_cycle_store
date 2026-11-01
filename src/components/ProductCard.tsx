import { ArrowUpRight, Bike } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { asset, photoSrcSet, productPhotos } from '../config/shop';
import type { Product } from '../config/shop';
import { useLanguage } from '../i18n';
import { categoryFor } from '../lib/catalog';
import { productUrl } from '../lib/business';
import { WhatsAppButton } from './UI';
import { AddToList } from './AddToList';

export function productEnquiry(product: Product, language: 'bn' | 'en') {
  const name = language === 'bn' ? product.nameBn : product.nameEn;
  return `${language === 'bn' ? `নমস্কার, আমি ${name} সম্পর্কে জানতে চাই। দাম ও স্টক সম্পর্কে জানাবেন?` : `Hello, I’d like to know about ${name}. Could you confirm the price and stock?`}\n${productUrl(product.slug)}`;
}
/** Product photographs are shown when supplied by the shop. */
export function ProductCard({ product }: { product: Product }) {
  const { t, l, price, productName, language } = useLanguage();
  // Remember the filtered catalogue the customer came from, so "back to the
  // catalogue" does not throw their filters away.
  const location = useLocation();
  const backTo = location.pathname === '/cycles' ? { pathname: '/cycles', search: location.search } : '/cycles';
  const category = categoryFor(product.category);
  const coverPhoto = productPhotos(product)[0];
  const specPreview = [product.specifications.frameSize, product.specifications.wheelSize,
    product.specifications.geared !== null ? product.specifications.geared ? t('catalog.geared') : t('catalog.nongeared') : null].filter(Boolean).join(' · ');
  // Repeating "contact us for stock" on every card made the whole catalogue look
  // empty. The stock line only appears when the shop has confirmed a status.
  const showStock = product.availability !== null;
  return <article className="product-card">
    {coverPhoto && <Link className="product-card-photo" to={`/cycles/${product.slug}`} state={{ from: backTo }} tabIndex={-1} aria-hidden="true"><img src={asset(coverPhoto)} srcSet={photoSrcSet(coverPhoto)} sizes="(max-width: 760px) 92vw, 30vw" alt="" loading="lazy" decoding="async" width={400} height={300} /></Link>}
    <div className="product-card-body">
      <div className="product-card-top"><span className="product-category">{l(category.name)}</span>{product.brand && <span className="product-brand">{product.brand}</span>}</div>
      <h3><Link to={`/cycles/${product.slug}`} state={{ from: backTo }}>{productName(product)}<ArrowUpRight size={18} aria-hidden="true" /></Link></h3>
      <p className={`product-price ${product.price === null ? 'unknown-price' : ''}`}>{product.price === null ? t('common.unknownPrice') : price(product.price)}</p>
      {showStock && <p className={`stock-label ${product.availability === 'in-stock' ? 'stock-available' : ''}`}><span />{product.availability === 'in-stock' ? t('common.inStock') : t('common.outOfStock')}</p>}
      {specPreview && <p className="product-spec-preview">{specPreview}</p>}
      <div className="product-card-actions">
        <Link to={`/cycles/${product.slug}`} state={{ from: backTo }} className="btn btn-secondary btn-compact">{t('action.details')}</Link>
        <WhatsAppButton variant="primary" className="btn-compact product-enquiry" message={productEnquiry(product, language)} placement="product-card" event="product_enquiry_click" productId={product.id}><span>{t('action.askPrice')}</span></WhatsAppButton>
      </div>
      <AddToList product={product} className="product-card-list" />
    </div>
  </article>;
}
export function ProductGrid({ products }: { products: Product[] }) { return <div className="product-grid">{products.map(product => <ProductCard key={product.id} product={product} />)}</div>; }
export function ProductIconPanel({ label }: { label: string }) {
  return <div className="product-icon-panel" aria-hidden="true"><Bike size={64} strokeWidth={1} /><span>{label}</span></div>;
}
