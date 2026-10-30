import { describe, expect, it } from 'vitest';
import { mergeCatalog, productFromRow } from '../src/lib/inventory';

const row = {
  id: 'stryder-16', slug: 'stryder-16', kind: 'cycle', name_bn: 'স্ট্রাইডার ১৬', name_en: 'Stryder 16',
  category: 'kids', brand: 'Stryder', price: 8500, description_bn: 'বর্ণনা', description_en: 'Description',
  geared: false, frame_size: '10 in', wheel_size: '16 in', brakes: 'V-brake',
  rider_height_min: 110, rider_height_max: 130, intended_use: ['school', 'mixed'],
  availability: 'in-stock', featured: true,
};

describe('live catalogue rows', () => {
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
