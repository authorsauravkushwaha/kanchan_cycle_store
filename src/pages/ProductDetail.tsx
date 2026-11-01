import { useState } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Copy, Phone } from 'lucide-react';
import { useCatalog } from '../inventory';
import { legacyCycleSlugs } from '../config/cycles';
import { asset, photoSrcSet, productPhotos } from '../config/shop';
import { useLanguage } from '../i18n';
import { categoryFor } from '../lib/catalog';
import { SEO } from '../components/SEO';
import { Breadcrumbs, Notice, ShareButton, WhatsAppButton } from '../components/UI';
import { phoneHref, track } from '../lib/business';
import { ProductIconPanel, ProductGrid, productEnquiry } from '../components/ProductCard';
import { AddToList } from '../components/AddToList';
import NotFound from './NotFound';

export default function ProductDetail() {
  const { slug } = useParams();
  const location = useLocation();
  // The catalogue the customer came from, filters included.
  const backTo = (location.state as { from?: string | { pathname: string; search: string } } | null)?.from
    ?? '/cycles';
  const { t, l, language, number, price, productName } = useLanguage();
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const [selectedPhoto, setSelectedPhoto] = useState<{ slug: string; index: number }>({ slug: '', index: 0 });
  const { products, loading } = useCatalog();
  const product = products.find(item => item.slug === slug);
  if (!product && slug && legacyCycleSlugs[slug]) return <Navigate to={`/cycles/${legacyCycleSlugs[slug]}`} replace />;
  if (!product && loading) return <div className="route-loading" role="status"><span className="route-loading-wheel" aria-hidden="true" />{l({ bn: 'তালিকা আনা হচ্ছে…', en: 'Loading the catalogue…' })}</div>;
  if (!product) return <NotFound productMissing />;
  const photos = productPhotos(product);
  const activePhotoIndex = selectedPhoto.slug === product.slug && selectedPhoto.index < photos.length ? selectedPhoto.index : 0;
  const activePhoto = photos[activePhotoIndex];
  const specs = product.specifications;
  const rows = [
    { label: t('product.brand'), value: product.brand },
    { label: t('product.frame'), value: specs.frameSize }, { label: t('product.wheels'), value: specs.wheelSize },
    { label: t('product.brakes'), value: specs.brakes },
    { label: t('product.gearing'), value: specs.geared === null ? null : specs.geared ? t('catalog.geared') : t('catalog.nongeared') },
    { label: t('product.height'), value: specs.riderHeightCm ? `${specs.riderHeightCm.min}–${specs.riderHeightCm.max} cm` : null },
    { label: t('product.use'), value: specs.intendedUse?.map(use => t(`quiz.${use}` as 'quiz.school')).join(', ') || null },
  ].filter(row => row.value);
  const related = products.filter(item => item.kind === product.kind && item.category === product.category && item.id !== product.id).slice(0, 3);
  const ownDescription = (language === 'bn' ? product.descriptionBn : product.descriptionEn).replace(/\s+/g, ' ').trim();
  const metaDescription = ownDescription.length > 158 ? `${ownDescription.slice(0, 155).trimEnd()}…` : ownDescription;
  const photoIsCatalogue = product.photoKind === 'catalogue';
  return <>
    <SEO title={productName(product)} description="seo.cyclesDescription" descriptionText={metaDescription} product={product} />
    <div className="container"><Breadcrumbs items={[{ label: t('nav.cycles'), to: '/cycles' }, { label: productName(product) }]} /></div>
    <section className="product-detail section"><div className="container"><div className="product-detail-grid">
      {activePhoto ? <div className="product-detail-media">
        <div className="product-detail-photo"><img src={asset(activePhoto)} srcSet={photoSrcSet(activePhoto)} sizes="(max-width: 760px) 92vw, 46vw" alt={photos.length > 1 ? `${productName(product)} — ${t('product.photoOf', { current: number(activePhotoIndex + 1), total: number(photos.length) })}` : productName(product)} width={800} height={600} decoding="async" />
          <span className={`photo-kind ${photoIsCatalogue ? 'photo-kind-catalogue' : 'photo-kind-shop'}`}>{photoIsCatalogue ? t('product.photoCatalogue') : t('product.photoShop')}</span>
        </div>
        {photos.length > 1 && <div className="product-photo-thumbs" role="group" aria-label={t('product.photos')}>
          {photos.map((photo, index) => <button key={photo} type="button" className={`product-photo-thumb ${index === activePhotoIndex ? 'is-active' : ''}`} aria-pressed={index === activePhotoIndex} aria-label={t('product.selectPhoto', { current: number(index + 1), total: number(photos.length) })} onClick={() => setSelectedPhoto({ slug: product.slug, index })}><img src={asset(photo)} srcSet={photoSrcSet(photo)} sizes="72px" alt="" loading="lazy" decoding="async" width={72} height={72} /></button>)}
        </div>}
      </div> : <ProductIconPanel label={l(categoryFor(product.category).name)} />}
      <div className="product-detail-info"><span className="product-category">{l(categoryFor(product.category).name)}</span><h1>{productName(product)}</h1><p className={`product-price ${product.price === null ? 'unknown-price' : ''}`}>{product.price === null ? t('common.unknownPrice') : price(product.price)}</p><p className={`stock-label ${product.availability === 'in-stock' ? 'stock-available' : ''}`}><span />{product.availability === null ? t('common.unknownStock') : product.availability === 'in-stock' ? t('common.inStock') : t('common.outOfStock')}</p><p className="product-description">{language === 'bn' ? product.descriptionBn : product.descriptionEn}</p>
        <div className="product-detail-enquiry"><h2>{t('product.enquiryTitle')}</h2><p>{t('product.enquiryText')}</p><div className="product-detail-actions"><WhatsAppButton message={productEnquiry(product, language)} event="product_enquiry_click" productId={product.id} placement="product-detail" /><a className="btn btn-secondary" href={phoneHref()} onClick={() => track('phone_click', { placement: 'product-detail' })}><Phone size={18} aria-hidden="true" />{t('action.call')}</a><AddToList product={product} /></div><small>{t('common.whatsappNote')}</small></div>
        <div className="product-share-row"><button type="button" className="copy-link" onClick={async () => { try { await navigator.clipboard.writeText(window.location.href); setCopyState('copied'); } catch { setCopyState('failed'); } }}>{copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}{copyState === 'copied' ? t('action.copied') : t('action.copyLink')}</button><p className="copy-status" role="status">{copyState === 'failed' ? t('action.copyFailed') : ''}</p><ShareButton label={t('product.share')} /></div>
      </div>
    </div>
      <div className="product-details-bottom"><div><h2>{t('product.specifications')}</h2>{rows.length ? <dl className="spec-table">{rows.map(row => <div key={row.label}><dt>{row.label}</dt><dd>{row.value}</dd></div>)}</dl> : <p className="muted">{t('product.unverifiedSpecs')}</p>}</div><div><Notice><strong>{t('product.fitNote')}</strong></Notice>{photoIsCatalogue && <Notice><strong>{t('product.photoCatalogueNote')}</strong></Notice>}</div></div><Link to={backTo} className="text-link"><ArrowLeft size={17} aria-hidden="true" />{t('product.back')}</Link>
      {related.length > 0 && <section className="related-products"><h2>{t('product.related')}</h2><ProductGrid products={related} /><Link className="btn btn-secondary" to={`/cycles?category=${product.category}`}>{t('action.explore')}<ArrowRight size={17} aria-hidden="true" /></Link></section>}
    </div></section>
  </>;
}
