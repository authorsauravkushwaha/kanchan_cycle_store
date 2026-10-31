import { describe, expect, it } from 'vitest';
import { CATALOG_COLUMNS, catalogQueryParams, isForbiddenSupabaseKey, mergeCatalog, productFromRow } from '../src/lib/inventory';

const row = {
  id: 'stryder-16', slug: 'stryder-16', kind: 'cycle', name_bn: 'স্ট্রাইডার ১৬', name_en: 'Stryder 16',
  category: 'kids', brand: 'Stryder', price: 8500, description_bn: 'বর্ণনা', description_en: 'Description',
  geared: false, frame_size: '10 in', wheel_size: '16 in', brakes: 'V-brake',
  rider_height_min: 110, rider_height_max: 130, intended_use: ['school', 'mixed'],
  availability: 'in-stock', featured: true,
};

describe('live catalogue rows', () => {
  it('uses a fixed, minimal public-column query rather than selecting every database field', () => {
    const query = catalogQueryParams();
    expect(query.get('select')?.split(',')).toEqual([...CATALOG_COLUMNS]);
    expect(query.get('select')).not.toContain('*');
    expect(query.get('published')).toBe('eq.true');
    expect(query.get('limit')).toBe('500');
    expect(query.get('order')).toBe('sort_order.asc,id.asc');
    expect([...CATALOG_COLUMNS]).not.toContain('updated_at');
    expect([...CATALOG_COLUMNS]).not.toContain('published');
    expect([...CATALOG_COLUMNS]).not.toContain('sort_order');
  });

  it('refuses Supabase service-role and secret keys, but accepts an anon JWT', () => {
    const base64url = (text: string) => btoa(text).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const jwt = (role: string) => `${base64url('{"alg":"none"}')}.${base64url(JSON.stringify({ role }))}.signature`;
    expect(isForbiddenSupabaseKey(jwt('service_role'))).toBe(true);
    expect(isForbiddenSupabaseKey(jwt('anon'))).toBe(false);
    expect(isForbiddenSupabaseKey(`sb_${'secret_'}${'x'.repeat(16)}`)).toBe(true);
  });

  it('maps a valid row without turning unknowns into claims', () => {
    const product = productFromRow(row)!;
    expect(product.nameEn).toBe('Stryder 16');
    expect(product.price).toBe(8500);
    expect(product.availability).toBe('in-stock');
    expect(product.specifications.geared).toBe(false);
    expect(product.specifications.riderHeightCm).toEqual({ min: 110, max: 130 });
  });

  it('stays unknown for absent price, stock and specifications', () => {
    const product = productFromRow({ ...row, price: null, availability: null, geared: null, rider_height_min: null, rider_height_max: null, intended_use: [] })!;
    expect(product.price).toBeNull();
    expect(product.availability).toBeNull();
    expect(product.specifications.geared).toBeNull();
    expect(product.specifications.riderHeightCm).toBeNull();
    expect(product.specifications.intendedUse).toBeNull();
  });

  it('rejects unsafe slugs, unknown categories and nameless rows', () => {
    expect(productFromRow({ ...row, slug: 'javascript:alert(1)' })).toBeNull();
    expect(productFromRow({ ...row, category: 'spaceship' })).toBeNull();
    expect(productFromRow({ ...row, name_bn: '', name_en: '' })).toBeNull();
  });

  it('prefers live rows over the static seed with the same id and ignores duplicates', () => {
    const live = productFromRow(row)!;
    const merged = mergeCatalog([live, live]);
    expect(merged.filter(product => product.id === 'stryder-16')).toHaveLength(1);
  });

  it('falls back to the static seed when no live data is available', () => {
    expect(mergeCatalog(null)).toEqual(mergeCatalog([]));
  });
});
