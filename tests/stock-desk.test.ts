import { describe, expect, it } from 'vitest';
import type { CategoryId } from '../src/config/shop';
import { draftsToCatalogJson, draftsToCsv, draftToProduct, emptyDraft, MAX_DRAFTS, MAX_DRAFT_IMPORT_BYTES, parseDrafts, validateDraft } from '../src/lib/stockDesk';

const draft = {
  ...emptyDraft(),
  id: 'stryder-16', slug: 'stryder-16', nameBn: 'স্ট্রাইডার ১৬', nameEn: 'Stryder 16',
  category: 'kids' as const, price: '8500', geared: 'false' as const, availability: 'in-stock' as const,
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

  it('rejects a negative price and an unknown category', () => {
    const errors = validateDraft({ ...draft, price: '-1', category: 'accessories' as unknown as CategoryId }, []);
    expect(errors.join(' ')).toMatch(/Price/);
    expect(errors.join(' ')).toMatch(/category/);
  });

  it('bounds strings and validates upload links before using draft data', () => {
    expect(validateDraft({ ...draft, nameEn: 'x'.repeat(121) }, []).join(' ')).toMatch(/too long/);
    expect(validateDraft({ ...draft, price: '1e9' }, []).join(' ')).toMatch(/whole number/);
    expect(validateDraft({ ...draft, photoUrl: 'https://user:pass@example.com/photo.jpg' }, []).join(' ')).toMatch(/credentials/);
    expect(validateDraft({ ...draft, descriptionEn: undefined } as unknown as typeof draft, []).join(' ')).toMatch(/invalid field types/);
  });

  it('rejects oversized or excessive imports before processing individual records', () => {
    expect(MAX_DRAFT_IMPORT_BYTES).toBe(1024 * 1024);
    expect(MAX_DRAFTS).toBe(500);
    expect(parseDrafts(' '.repeat(MAX_DRAFT_IMPORT_BYTES + 1))).toEqual([]);
    expect(parseDrafts(JSON.stringify(Array.from({ length: MAX_DRAFTS + 1 }, () => draft)))).toEqual([]);
    expect(parseDrafts(JSON.stringify([{ ...draft, nameBn: 'x'.repeat(121) }]))).toEqual([]);
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
    const productExport = draftsToCatalogJson([draft]);
    expect(parseDrafts(productExport)[0]).toMatchObject({
      nameEn: 'Stryder 16', price: '8500', geared: 'false', riderHeightMin: '110', intendedUse: 'school, mixed',
    });
    expect(parseDrafts('nonsense')).toEqual([]);
  });
});
