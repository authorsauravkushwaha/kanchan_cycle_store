import { shop } from '../config/shop';
import type { CategoryId, Language, Product } from '../config/shop';

export interface CatalogFilters { query: string; category: string; budget: string; gear: string; sort: string }
export const defaultFilters: CatalogFilters = { query: '', category: '', budget: '', gear: '', sort: 'featured' };
export function parseFilters(params: URLSearchParams): CatalogFilters {
  const category = params.get('category') || '';
  const budget = params.get('budget') || '';
  const gear = params.get('gear') || '';
  const sort = params.get('sort') || 'featured';
  return {
    query: (params.get('q') || '').slice(0, 120),
    category: shop.categories.some(c => c.id === category) ? category : '',
    budget: shop.budgets.some(b => b.id === budget) ? budget : '',
    gear: ['geared', 'non-geared'].includes(gear) ? gear : '',
    sort: ['featured', 'price-asc', 'price-desc', 'name'].includes(sort) ? sort : 'featured',
  };
}
const normalize = (text: string) => text.normalize('NFKC').toLocaleLowerCase().trim();
export const hasVerifiedPrice = (product: Product) => product.price !== null && Number.isFinite(product.price) && product.price >= 0;

/** A filter that cannot be checked yet returns `null` — never a silent "no". */
export type FilterVerdict = true | false | null;

export const budgetRange = (id: string) => shop.budgets.find(b => b.id === id) ?? null;

/**
 * `null` means the price has not been confirmed by the shop yet. The cycle is
 * still shown — hiding it would tell the customer the shop does not stock it.
 */
export function withinBudget(product: Product, budget: { min: number; max: number | null } | null): FilterVerdict {
  if (!budget) return true;
  if (!hasVerifiedPrice(product)) return null;
  if (product.price! < budget.min) return false;
  if (budget.max !== null && product.price! > budget.max) return false;
  return true;
}

/** `null` means the gearing has not been confirmed yet. */
export function matchesGear(product: Product, gear: string): FilterVerdict {
  if (!gear) return true;
  const geared = product.specifications.geared;
  if (geared === null) return null;
  return gear === 'geared' ? geared === true : geared === false;
}

export type MatchStatus = 'confirmed' | 'unconfirmed';
export interface CatalogMatch {
  product: Product;
  /** 'unconfirmed' = at least one active filter could not be checked yet. */
  status: MatchStatus;
  /** Which filters still need the shop to confirm a value. */
  pending: ('budget' | 'gear')[];
}

export function matchProducts(products: Product[], filters: CatalogFilters, language: Language): CatalogMatch[] {
  const query = normalize(filters.query);
  const budget = budgetRange(filters.budget);
  const matches: CatalogMatch[] = [];
  for (const product of products) {
    if (product.kind !== 'cycle') continue;
    const category = shop.categories.find(c => c.id === product.category);
    // Search the description too: customers type "BSA", "মেয়েদের" or "মেরামত" and
    // expect to find the cycle, not just an exact title.
    const searchable = [product.nameBn, product.nameEn, product.brand || '', category?.name.bn || '', category?.name.en || '', product.descriptionBn, product.descriptionEn];
    if (query && !searchable.some(text => normalize(text).includes(query))) continue;
    if (filters.category && product.category !== filters.category) continue;
    const pending: ('budget' | 'gear')[] = [];
    const budgetVerdict = withinBudget(product, budget);
    if (budgetVerdict === false) continue;
    if (budgetVerdict === null) pending.push('budget');
    const gearVerdict = matchesGear(product, filters.gear);
    if (gearVerdict === false) continue;
    if (gearVerdict === null) pending.push('gear');
    matches.push({ product, status: pending.length ? 'unconfirmed' : 'confirmed', pending });
  }
  return sortMatches(matches, filters, language);
}

function sortMatches(matches: CatalogMatch[], filters: CatalogFilters, language: Language): CatalogMatch[] {
  // A cycle whose price or gearing is not confirmed yet is never shown above a
  // cycle that is a confirmed match, but it is never hidden either.
  const filterActive = Boolean(filters.budget || filters.gear);
  const byStatus = (a: CatalogMatch, b: CatalogMatch) => {
    if (!filterActive) return 0;
    return Number(b.status === 'confirmed') - Number(a.status === 'confirmed');
  };
  return [...matches].sort((a, b) => {
    const status = byStatus(a, b);
    if (status) return status;
    if (filters.sort === 'name') {
      const aName = language === 'bn' ? a.product.nameBn : a.product.nameEn;
      const bName = language === 'bn' ? b.product.nameBn : b.product.nameEn;
      return aName.localeCompare(bName, language === 'bn' ? 'bn' : 'en');
    }
    if (filters.sort.startsWith('price')) {
      // Unknown prices always stay last, including in descending order.
      const aPriced = hasVerifiedPrice(a.product);
      const bPriced = hasVerifiedPrice(b.product);
      if (!aPriced && !bPriced) return Number(b.product.featured) - Number(a.product.featured);
      if (!aPriced) return 1;
      if (!bPriced) return -1;
      return filters.sort === 'price-asc' ? a.product.price! - b.product.price! : b.product.price! - a.product.price!;
    }
    return Number(b.product.featured) - Number(a.product.featured);
  });
}

export function filterProducts(products: Product[], filters: CatalogFilters, language: Language): Product[] {
  return matchProducts(products, filters, language).map(match => match.product);
}
export const hasFilters = (filters: CatalogFilters) => Boolean(filters.query || filters.category || filters.budget || filters.gear);
export const categoryFor = (id: CategoryId) => shop.categories.find(category => category.id === id)!;
