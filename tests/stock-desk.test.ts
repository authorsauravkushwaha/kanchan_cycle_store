import { describe, expect, it } from 'vitest';
import { draftsToCatalogJson, draftsToCsv, draftToProduct, emptyDraft, parseDrafts, validateDraft } from '../src/lib/stockDesk';

const draft = {
  ...emptyDraft(),
  id: 'stryder-16', slug: 'stryder-16', nameBn: 'স্ট্রাইডার ১৬', nameEn: 'Stryder 16',
  category: 'kids' as const, price: '8500', availability: 'in-stock' as const,
  intendedUse: 'school, mixed', riderHeightMin: '110', riderHeightMax: '130',
  descriptionEn: 'A "quoted", tested draft.', descriptionBn: 'বর্ণনা',
};

describe('owner stock desk', () => {
  it('requires names and a safe unique slug', () => {
    expect(validateDraft(emptyDraft(), [])).not.toEqual([]);
    expect(validateDraft({ ...draft, slug: 'Stryder 16!!' }, [])).toEqual([]);
    const errors = validateDraft({ ...draft, slug: 'other' }, [{ ...draft, slug: 'other', key: 'a-different-draft' }]);
    expect(errors.join(' ')).toMatch(/Slug/);
  });

  it('rejects a negative price and a cycle in the accessory category', () => {
    const errors = validateDraft({ ...draft, price: '-1', category: 'accessories' }, []);
    expect(errors.join(' ')).toMatch(/Price/);
    expect(errors.join(' ')).toMatch(/category/);
  });

  it('keeps a blank price as unknown rather than zero', () => {
    const product = draftToProduct({ ...draft, price: '' });
    expect(product.price).toBeNull();
    expect(product.availability).toBe('in-stock');
  });

  it('exports CSV that matches the Supabase table and quotes text correctly', () => {
    const csv = draftsToCsv([draft]);
    const [header, first] = csv.trim().split('\n');
    expect(header.split(',')).toContain('published');
    expect(first).toContain('"A ""quoted"", tested draft."');
    // CSV escaping adds doubled quotes around the Postgres array literal.
    expect(first).toContain('"{""school"",""mixed""}"');
    expect(first).not.toContain('undefined');
  });

  it('exports pasteable JSON and reads its own drafts back', () => {
    const parsed = JSON.parse(draftsToCatalogJson([draft]));
    expect(parsed[0].slug).toBe('stryder-16');
    expect(parsed[0].price).toBe(8500);
    expect(parseDrafts(JSON.stringify([draft]))[0].nameBn).toBe(draft.nameBn);
    expect(parseDrafts('nonsense')).toEqual([]);
  });
});
