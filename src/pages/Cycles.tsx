import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Bike } from 'lucide-react';
import { verifiedProducts } from '../config/shop';
import { useLanguage } from '../i18n';
import { defaultFilters, filterProducts, hasFilters, parseFilters } from '../lib/catalog';
import type { CatalogFilters } from '../lib/catalog';
import { SEO } from '../components/SEO';
import { Breadcrumbs, EmptyState, PageHero, WhatsAppButton } from '../components/UI';
import { ProductFilters } from '../components/ProductFilters';
import { ProductGrid } from '../components/ProductCard';
import { FinalCTA } from '../components/HeroSection';

export default function Cycles() {
  const { t, language, number } = useLanguage();
  const [params] = useSearchParams();
  const [filters, setFilters] = useState<CatalogFilters>(() => parseFilters(params));
  const currentFilters = useRef(filters);
  // Sync pushes/back/forward from React Router. Filter edits below update local
  // state synchronously and replace the URL without a stale router transition.
  useEffect(() => {
    const next = parseFilters(params);
    currentFilters.current = next;
    setFilters(next);
  }, [params.toString()]);
  const apply = (next: CatalogFilters) => {
    currentFilters.current = next;
    setFilters(next);
    const query = new URLSearchParams();
    if (next.query) query.set('q', next.query);
    if (next.category) query.set('category', next.category);
    if (next.budget) query.set('budget', next.budget);
    if (next.gear) query.set('gear', next.gear);
    if (next.sort !== 'featured') query.set('sort', next.sort);
    const search = query.toString();
    window.history.replaceState(window.history.state, '', `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`);
  };
  const update = (key: keyof CatalogFilters, value: string) => apply({ ...currentFilters.current, [key]: value });
  const reset = () => apply({ ...defaultFilters });
  const products = useMemo(() => filterProducts(verifiedProducts('cycle'), filters, language), [filters, language]);
  const allProducts = verifiedProducts('cycle');
  return <>
    <SEO title={t('nav.cycles')} description="seo.cyclesDescription" />
    <PageHero eyebrow={t('catalog.eyebrow')} title={t('catalog.title')} description={t('catalog.description')}><Breadcrumbs items={[{ label: t('nav.cycles') }]} /></PageHero>
    <section className="section catalog-section"><div className="container"><ProductFilters filters={filters} onChange={update} onReset={reset} /><div className="catalog-results-bar"><p role="status" aria-live="polite">{t(products.length === 1 ? 'common.result' : 'common.results', { count: number(products.length) })}</p><span>{t('catalog.verifiedOnly')}</span></div>
      {products.length > 0 ? <ProductGrid products={products} /> : <EmptyState icon={Bike} filtered={hasFilters(filters) || allProducts.length > 0} title={hasFilters(filters) && allProducts.length > 0 ? t('catalog.noResultsTitle') : t('catalog.emptyTitle')} description={hasFilters(filters) && allProducts.length > 0 ? t('catalog.noResultsText') : t('catalog.emptyText')}>
        {hasFilters(filters) && <button className="btn btn-secondary" onClick={reset}>{t('catalog.reset')}</button>}<WhatsAppButton placement="catalog-empty" />
      </EmptyState>}
      <div className="catalog-help"><span className="catalog-help-icon"><Bike size={34} strokeWidth={1.4} aria-hidden="true" /></span><div><h2>{t('catalog.helpTitle')}</h2><p>{t('catalog.helpText')}</p></div><Link className="btn btn-primary" to="/recommendation">{t('action.help')}<ArrowRight size={18} aria-hidden="true" /></Link></div>
    </div></section><FinalCTA />
  </>;
}
