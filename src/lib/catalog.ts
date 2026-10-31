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
const validPrice = (product: Product) => product.price !== null && Number.isFinite(product.price) && product.price >= 0;
export function filterProducts(products: Product[], filters: CatalogFilters, language: Language): Product[] {
  const query = normalize(filters.query);
  const budget = shop.budgets.find(b => b.id === filters.budget);
  const result = products.filter(product => {
    if (product.kind !== 'cycle') return false;
    const category = shop.categories.find(c => c.id === product.category);
    const searchable = [product.nameBn, product.nameEn, product.brand || '', category?.name.bn || '', category?.name.en || ''];
    if (query && !searchable.some(text => normalize(text).includes(query))) return false;
    if (filters.category && product.category !== filters.category) return false;
    if (filters.gear === 'geared' && product.specifications.geared !== true) return false;
    if (filters.gear === 'non-geared' && product.specifications.geared !== false) return false;
    if (budget) {
      if (!validPrice(product) || product.price! < budget.min) return false;
      if (budget.max !== null && product.price! > budget.max) return false;
    }
    return true;
  });
  return result.sort((a, b) => {
    if (filters.sort === 'name') {
      const aName = language === 'bn' ? a.nameBn : a.nameEn;
      const bName = language === 'bn' ? b.nameBn : b.nameEn;
      return aName.localeCompare(bName, language === 'bn' ? 'bn' : 'en');
    }
    if (filters.sort.startsWith('price')) {
      // Unknown prices always stay last, including in descending order.
      if (!validPrice(a) && !validPrice(b)) return Number(b.featured) - Number(a.featured);
      if (!validPrice(a)) return 1;
      if (!validPrice(b)) return -1;
      return filters.sort === 'price-asc' ? a.price! - b.price! : b.price! - a.price!;
    }
    return Number(b.featured) - Number(a.featured);
  });
}
export const hasFilters = (filters: CatalogFilters) => Boolean(filters.query || filters.category || filters.budget || filters.gear);
export const categoryFor = (id: CategoryId) => shop.categories.find(category => category.id === id)!;
