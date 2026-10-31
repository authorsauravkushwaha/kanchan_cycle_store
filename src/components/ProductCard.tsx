import { ArrowUpRight, Bike, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { asset, productPhotos } from '../config/shop';
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
  const category = categoryFor(product.category);
  const coverPhoto = productPhotos(product)[0];
  const specPreview = [product.specifications.frameSize, product.specifications.wheelSize,
    product.specifications.geared !== null ? product.specifications.geared ? t('catalog.geared') : t('catalog.nongeared') : null].filter(Boolean).join(' · ');
  return <article className="product-card">
    {coverPhoto && <Link className="product-card-photo" to={`/cycles/${product.slug}`} tabIndex={-1} aria-hidden="true"><img src={asset(coverPhoto)} alt="" loading="lazy" /></Link>}
    <div className="product-card-body">
      <div className="product-card-top"><span className="product-category">{l(category.name)}</span>{product.brand && <span className="product-brand">{product.brand}</span>}</div>
      <h3><Link to={`/cycles/${product.slug}`}>{productName(product)}<ArrowUpRight size={18} aria-hidden="true" /></Link></h3>
      <p className={`product-price ${product.price === null ? 'unknown-price' : ''}`}>{product.price === null ? t('common.unknownPrice') : price(product.price)}</p>
      <p className={`stock-label ${product.availability === 'in-stock' ? 'stock-available' : ''}`}><span />{product.availability === null ? t('common.unknownStock') : product.availability === 'in-stock' ? t('common.inStock') : t('common.outOfStock')}</p>
      {specPreview && <p className="product-spec-preview">{specPreview}</p>}
      <div className="product-card-actions">
        <Link to={`/cycles/${product.slug}`} className="btn btn-secondary btn-compact">{t('action.details')}</Link>
        <WhatsAppButton variant="primary" className="btn-compact product-enquiry" message={productEnquiry(product, language)} placement="product-card" event="product_enquiry_click" productId={product.id}><span>{t('action.askPrice')}</span></WhatsAppButton>
      </div>
      <AddToList product={product} className="product-card-list" />
    </div>
  </article>;
}
export function ProductGrid({ products }: { products: Product[] }) { return <div className="product-grid">{products.map(product => <ProductCard key={product.id} product={product} />)}</div>; }
export function AccessoryCard({ product }: { product: Product }) {
  const { t, price, productName, language } = useLanguage();
  return <article className="product-card accessory-card">
    <div className="product-card-body">
      <div className="product-card-top"><span className="product-category">{t('nav.accessories')}</span><Tag size={16} aria-hidden="true" /></div>
      <h3><Link to={`/cycles/${product.slug}`}>{productName(product)}<ArrowUpRight size={18} aria-hidden="true" /></Link></h3>
      <p className={`product-price ${product.price === null ? 'unknown-price' : ''}`}>{product.price === null ? t('common.unknownPrice') : price(product.price)}</p>
      <p className="stock-label"><span />{product.availability === null ? t('common.unknownStock') : product.availability === 'in-stock' ? t('common.inStock') : t('common.outOfStock')}</p>
      <div className="product-card-actions accessory-actions"><WhatsAppButton variant="secondary" className="btn-compact" message={productEnquiry(product, language)} productId={product.id} event="product_enquiry_click" placement="accessory-card">{t('action.askPrice')}</WhatsAppButton><AddToList product={product} /></div>
    </div>
  </article>;
}
export function ProductIconPanel({ label }: { label: string }) {
  return <div className="product-icon-panel" aria-hidden="true"><Bike size={64} strokeWidth={1} /><span>{label}</span></div>;
}
