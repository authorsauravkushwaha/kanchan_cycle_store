import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Bike, Info } from 'lucide-react';
import { useCatalog } from '../inventory';
import { useLanguage } from '../i18n';
import { defaultFilters, hasFilters, matchProducts, parseFilters } from '../lib/catalog';
import type { CatalogFilters } from '../lib/catalog';
import { SEO } from '../components/SEO';
import { Breadcrumbs, CallButton, EmptyState, PageHero, WhatsAppButton } from '../components/UI';
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
    // Keep any tracking parameters (utm_source, source …) the customer arrived
    // with: dropping them lost the shop's view of where enquiries come from.
    for (const [key, value] of new URLSearchParams(window.location.search)) {
      if (!['q', 'category', 'budget', 'gear', 'sort'].includes(key)) query.set(key, value);
    }
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
  const { cycles } = useCatalog();
  const matches = useMemo(() => matchProducts(cycles, filters, language), [cycles, filters, language]);
  const products = useMemo(() => matches.map(match => match.product), [matches]);
  // Cycles whose price or gearing the shop has not confirmed yet. They are
  // listed, but flagged, so a filter never makes the shop look empty.
  const pendingCount = matches.filter(match => match.status === 'unconfirmed').length;
  const allProducts = cycles;
  const filtered = hasFilters(filters);
  return <>
    <SEO title={t('nav.cycles')} description="seo.cyclesDescription" />
    <PageHero eyebrow={t('catalog.eyebrow')} title={t('catalog.title')} description={t('catalog.description')}><Breadcrumbs items={[{ label: t('nav.cycles') }]} /></PageHero>
    <section className="section catalog-section"><div className="container"><ProductFilters filters={filters} onChange={update} onReset={reset} /><div className="catalog-results-bar"><p role="status" aria-live="polite">{filtered && allProducts.length > 0 ? t('common.resultsOf', { count: number(products.length), total: number(allProducts.length) }) : t(products.length === 1 ? 'common.result' : 'common.results', { count: number(products.length) })}</p><span>{t('catalog.verifiedOnly')}</span></div>
      {pendingCount > 0 && <p className="catalog-pending-note"><Info size={15} aria-hidden="true" />{t('catalog.pendingNote', { count: number(pendingCount) })}</p>}
      {products.length > 0 ? <ProductGrid products={products} /> : <EmptyState icon={Bike} filtered={filtered || allProducts.length > 0} title={filtered && allProducts.length > 0 ? t('catalog.noResultsTitle') : t('catalog.emptyTitle')} description={filtered && allProducts.length > 0 ? t('catalog.noResultsText') : t('catalog.emptyText')}>
        {filtered && <button type="button" className="btn btn-secondary" onClick={reset}>{t('catalog.reset')}</button>}<WhatsAppButton placement="catalog-empty" /><CallButton variant="secondary" />
      </EmptyState>}
      <div className="catalog-help"><span className="catalog-help-icon"><Bike size={34} strokeWidth={1.4} aria-hidden="true" /></span><div><h2>{t('catalog.helpTitle')}</h2><p>{t('catalog.helpText')}</p></div><Link className="btn btn-primary" to="/recommendation">{t('action.help')}<ArrowRight size={18} aria-hidden="true" /></Link></div>
    </div></section><FinalCTA />
  </>;
}
