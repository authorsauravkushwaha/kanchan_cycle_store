import { useId, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { shop } from '../config/shop';
import type { CatalogFilters } from '../lib/catalog';
import { hasFilters } from '../lib/catalog';
import { useLanguage } from '../i18n';

export function ProductFilters({ filters, onChange, onReset }: { filters: CatalogFilters; onChange: (key: keyof CatalogFilters, value: string) => void; onReset: () => void }) {
  const { t, l } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  return <div className="catalog-filter-panel">
    <div className="catalog-search-row"><div className="search-field"><Search size={20} aria-hidden="true" /><label htmlFor={`${id}-search`} className="sr-only">{t('catalog.searchLabel')}</label><input id={`${id}-search`} type="search" maxLength={120} value={filters.query} onChange={event => onChange('query', event.target.value)} placeholder={t('catalog.search')} autoComplete="off" />{filters.query && <button className="icon-button" onClick={() => onChange('query', '')} aria-label={t('action.clear')}><X size={17} /></button>}</div><button className="btn btn-secondary mobile-filter-toggle" aria-expanded={expanded} aria-controls={`${id}-filters`} onClick={() => setExpanded(!expanded)}><SlidersHorizontal size={18} aria-hidden="true" />{t('catalog.filters')}{hasFilters(filters) && <span className="filter-dot" />}</button><div className="field sort-field"><label htmlFor={`${id}-sort`}>{t('catalog.sort')}</label><select id={`${id}-sort`} value={filters.sort} onChange={event => onChange('sort', event.target.value)}><option value="featured">{t('catalog.sortFeatured')}</option><option value="price-asc">{t('catalog.sortPriceAsc')}</option><option value="price-desc">{t('catalog.sortPriceDesc')}</option><option value="name">{t('catalog.sortName')}</option></select></div></div>
    <div id={`${id}-filters`} className={`catalog-fields ${expanded ? 'filters-expanded' : ''}`}>
      <div className="field"><label htmlFor={`${id}-category`}>{t('catalog.category')}</label><select id={`${id}-category`} value={filters.category} onChange={event => onChange('category', event.target.value)}><option value="">{t('common.all')}</option>{shop.categories.map(category => <option key={category.id} value={category.id}>{l(category.name)}</option>)}</select></div>
      <div className="field"><label htmlFor={`${id}-budget`}>{t('catalog.budget')}</label><select id={`${id}-budget`} value={filters.budget} onChange={event => onChange('budget', event.target.value)}><option value="">{t('catalog.anyBudget')}</option>{shop.budgets.map(budget => <option key={budget.id} value={budget.id}>{l(budget.label)}</option>)}</select></div>
      <div className="field"><label htmlFor={`${id}-gear`}>{t('catalog.gear')}</label><select id={`${id}-gear`} value={filters.gear} onChange={event => onChange('gear', event.target.value)}><option value="">{t('catalog.anyGear')}</option><option value="geared">{t('catalog.geared')}</option><option value="non-geared">{t('catalog.nongeared')}</option></select></div>
      <button className="filter-reset" onClick={onReset} disabled={!hasFilters(filters)}><X size={16} aria-hidden="true" />{t('catalog.reset')}</button>
    </div><p className="filter-note">{t('catalog.budgetNote')}</p>
  </div>;
}
