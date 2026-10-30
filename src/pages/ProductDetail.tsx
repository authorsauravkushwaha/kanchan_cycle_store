import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Copy } from 'lucide-react';
import { useCatalog } from '../inventory';
import { useLanguage } from '../i18n';
import { categoryFor } from '../lib/catalog';
import { SEO } from '../components/SEO';
import { Breadcrumbs, Notice, WhatsAppButton } from '../components/UI';
import { ProductIconPanel, ProductGrid, productEnquiry } from '../components/ProductCard';
import { AddToList } from '../components/AddToList';
import NotFound from './NotFound';

export default function ProductDetail() {
  const { slug } = useParams();
  const { t, l, language, price, productName } = useLanguage();
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const { products, loading } = useCatalog();
  const product = products.find(item => item.slug === slug);
  if (!product && loading) return <div className="route-loading" role="status"><span className="route-loading-wheel" aria-hidden="true" />{l({ bn: 'তালিকা আনা হচ্ছে…', en: 'Loading the catalogue…' })}</div>;
  if (!product) return <NotFound productMissing />;
  const specs = product.specifications;
  const rows = [
    { label: t('product.brand'), value: product.brand },
    { label: t('product.frame'), value: specs.frameSize }, { label: t('product.wheels'), value: specs.wheelSize },
    { label: t('product.brakes'), value: specs.brakes },
    { label: t('product.gearing'), value: specs.geared === null ? null : specs.geared ? t('catalog.geared') : t('catalog.nongeared') },
    { label: t('product.height'), value: specs.riderHeightCm ? `${specs.riderHeightCm.min}–${specs.riderHeightCm.max} cm` : null },
    { label: t('product.use'), value: specs.intendedUse?.map(use => t(`quiz.${use}` as 'quiz.school')).join(', ') || null },
  ].filter(row => row.value);
  const isAccessory = product.kind === 'accessory';
  const related = products.filter(item => item.kind === product.kind && item.category === product.category && item.id !== product.id).slice(0, 3);
  return <>
    <SEO title={productName(product)} description={product.price === null ? 'seo.cyclesDescription' : 'seo.cyclesDescription'} product={product} />
    <div className="container"><Breadcrumbs items={[{ label: isAccessory ? t('nav.accessories') : t('nav.cycles'), to: isAccessory ? '/accessories' : '/cycles' }, { label: productName(product) }]} /></div>
    <section className="product-detail section"><div className="container"><div className="product-detail-grid">
      {product.photoUrl
        ? <img className="product-photo-large" src={product.photoUrl} alt={productName(product)} width={720} height={560} decoding="async" />
        : <ProductIconPanel label={l(categoryFor(product.category).name)} />}
      <div className="product-detail-info"><span className="product-category">{l(categoryFor(product.category).name)}</span><h1>{productName(product)}</h1><p className={`product-price ${product.price === null ? 'unknown-price' : ''}`}>{product.price === null ? t('common.unknownPrice') : price(product.price)}</p><p className={`stock-label ${product.availability === 'in-stock' ? 'stock-available' : ''}`}><span />{product.availability === null ? t('common.unknownStock') : product.availability === 'in-stock' ? t('common.inStock') : t('common.outOfStock')}</p><p className="product-description">{language === 'bn' ? product.descriptionBn : product.descriptionEn}</p>
        <div className="product-detail-enquiry"><h2>{isAccessory ? t('action.askPrice') : t('product.enquiryTitle')}</h2><p>{isAccessory ? t('accessories.description') : t('product.enquiryText')}</p><div className="product-detail-actions"><WhatsAppButton message={productEnquiry(product, language)} event="product_enquiry_click" productId={product.id} placement="product-detail" /><AddToList product={product} /></div><small>{t('common.whatsappNote')}</small></div>
        <button className="copy-link" onClick={async () => { try { await navigator.clipboard.writeText(window.location.href); setCopyState('copied'); } catch { setCopyState('failed'); } }}>{copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}{copyState === 'copied' ? t('action.copied') : t('action.copyLink')}</button><p className="copy-status" role="status">{copyState === 'failed' ? t('action.copyFailed') : ''}</p>
      </div>
    </div>
      <div className="product-details-bottom"><div><h2>{isAccessory ? t('product.brand') : t('product.specifications')}</h2>{rows.length ? <dl className="spec-table">{rows.map(row => <div key={row.label}><dt>{row.label}</dt><dd>{row.value}</dd></div>)}</dl> : <p className="muted">{t('product.unverifiedSpecs')}</p>}</div><Notice><strong>{isAccessory ? t('accessories.description') : t('product.fitNote')}</strong></Notice></div><Link to={isAccessory ? '/accessories' : '/cycles'} className="text-link"><ArrowLeft size={17} aria-hidden="true" />{isAccessory ? t('action.allAccessories') : t('product.back')}</Link>
      {related.length > 0 && <section className="related-products"><h2>{t('home.featured.title')}</h2><ProductGrid products={related} /></section>}
    </div></section>
  </>;
}
