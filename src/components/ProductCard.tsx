import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { asset } from '../config/shop';
import type { Product } from '../config/shop';
import { useLanguage } from '../i18n';
import { categoryFor } from '../lib/catalog';
import { productUrl } from '../lib/business';
import { WhatsAppButton } from './UI';

export function productEnquiry(product: Product, language: 'bn' | 'en') {
  const name = language === 'bn' ? product.nameBn : product.nameEn;
  return `${language === 'bn' ? `নমস্কার, আমি ${name} সম্পর্কে জানতে চাই। দাম ও স্টক সম্পর্কে জানাবেন?` : `Hello, I’d like to know about ${name}. Could you confirm the price and stock?`}\n${productUrl(product.slug)}`;
}
export function ProductCard({ product }: { product: Product }) {
  const { t, l, price, productName } = useLanguage();
  const { language } = useLanguage();
  const category = categoryFor(product.category);
  return <article className="product-card">
    <Link to={`/cycles/${product.slug}`} className="product-image-link" tabIndex={-1} aria-hidden="true"><img src={asset(product.image)} alt="" width={product.imageWidth} height={product.imageHeight} loading="lazy" decoding="async" />{product.imageIsIllustrative && <span className="photo-credit">{t('common.illustrative')}</span>}</Link>
    <div className="product-card-body"><span className="product-category">{l(category.name)}</span><h3><Link to={`/cycles/${product.slug}`}>{productName(product)}<ArrowUpRight size={18} aria-hidden="true" /></Link></h3>
      <p className={`product-price ${product.price === null ? 'unknown-price' : ''}`}>{product.price === null ? t('common.unknownPrice') : price(product.price)}</p>
      <p className={`stock-label ${product.availability === 'in-stock' ? 'stock-available' : ''}`}><span />{product.availability === null ? t('common.unknownStock') : product.availability === 'in-stock' ? t('common.inStock') : t('common.outOfStock')}</p>
      {(product.specifications.frameSize || product.specifications.wheelSize || product.specifications.geared !== null) && <p className="product-spec-preview">{[product.specifications.frameSize, product.specifications.wheelSize, product.specifications.geared !== null ? product.specifications.geared ? t('catalog.geared') : t('catalog.nongeared') : null].filter(Boolean).join(' · ')}</p>}
      <div className="product-card-actions"><Link to={`/cycles/${product.slug}`} className="btn btn-secondary btn-compact">{t('action.details')}</Link><WhatsAppButton variant="primary" className="btn-compact product-enquiry" message={productEnquiry(product, language)} placement="product-card" event="product_enquiry_click" productId={product.id}><span>{t('action.askPrice')}</span></WhatsAppButton></div>
    </div>
  </article>;
}
export function ProductGrid({ products }: { products: Product[] }) { return <div className="product-grid">{products.map(product => <ProductCard key={product.id} product={product} />)}</div>; }
export function AccessoryCard({ product }: { product: Product }) {
  const { t, l, price, productName, language } = useLanguage();
  return <article className="product-card accessory-card"><Link to={`/cycles/${product.slug}`} className="product-image-link"><img src={asset(product.image)} alt={l(product.imageAlt)} width={product.imageWidth} height={product.imageHeight} loading="lazy" decoding="async" />{product.imageIsIllustrative && <span className="photo-credit">{t('common.illustrative')}</span>}</Link><div className="product-card-body"><h3><Link to={`/cycles/${product.slug}`}>{productName(product)}<ArrowUpRight size={18} aria-hidden="true" /></Link></h3><p className={`product-price ${product.price === null ? 'unknown-price' : ''}`}>{product.price === null ? t('common.unknownPrice') : price(product.price)}</p><p className="stock-label"><span />{product.availability === null ? t('common.unknownStock') : product.availability === 'in-stock' ? t('common.inStock') : t('common.outOfStock')}</p><WhatsAppButton variant="secondary" className="btn-compact" message={productEnquiry(product, language)} productId={product.id} event="product_enquiry_click" placement="accessory-card">{t('action.askPrice')}</WhatsAppButton></div></article>;
}
